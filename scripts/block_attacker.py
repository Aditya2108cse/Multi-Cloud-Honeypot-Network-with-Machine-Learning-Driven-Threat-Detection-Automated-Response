#!/usr/bin/env python3
"""
block_attacker.py - read a TSV of IP<TAB>Cloud (OpenCanary export) and block
each IP across AWS, Azure, and GCP.

Python port of block_attacker.sh. Behavior preserved:
- AWS: adds "<ip>/32" to a managed prefix list (AWS_PL_ID / AWS_REGION).
- Azure: uses a single scalable NSG rule "AutoBlockedIPs-Honeypot" and appends
  "<ip>/32" to its source address prefixes (no per-IP rules), trying a list
  of priorities if the rule doesn't exist yet and falling back on conflicts.
- GCP: creates one firewall rule per IP named "auto-deny-<ip-with-dashes>".

Respects DRY_RUN=1 to log intended actions without making changes, and
supports Azure service-principal login via AZURE_CLIENT_ID / AZURE_CLIENT_SECRET
/ AZURE_TENANT_ID / AZURE_SUBSCRIPTION_ID env vars, same as the original.
"""

from __future__ import annotations

import os
import sys
from pathlib import Path

from common import env_flag, get_logger, load_conf, retry, run, run_json, which

LOG_FILE = "/var/log/block_attacker.alert.log"
EXPORT_FILE = Path("/var/tmp/opencanary/opencanary_export.tsv")
AZURE_RULE_NAME = "AutoBlockedIPs-Honeypot"

log = get_logger("blocker", LOG_FILE)


def azure_login_if_needed(az_bin: str) -> None:
    if run([az_bin, "account", "show"]).returncode == 0:
        return
    client_id = os.environ.get("AZURE_CLIENT_ID")
    client_secret = os.environ.get("AZURE_CLIENT_SECRET")
    tenant_id = os.environ.get("AZURE_TENANT_ID")
    if client_id and client_secret and tenant_id:
        run([
            az_bin, "login", "--service-principal",
            "-u", client_id, "-p", client_secret, "--tenant", tenant_id,
        ])
        subscription_id = os.environ.get("AZURE_SUBSCRIPTION_ID")
        if subscription_id:
            run([az_bin, "account", "set", "--subscription", subscription_id])


def azure_existing_prefixes(az_bin: str, rg: str, nsg: str, rule_name: str) -> list[str]:
    data = run_json([
        az_bin, "network", "nsg", "rule", "show",
        "-g", rg, "--nsg-name", nsg, "--name", rule_name, "-o", "json",
    ])
    if not data:
        return []
    prefixes = data.get("sourceAddressPrefixes") or []
    single = data.get("sourceAddressPrefix")
    if single and single not in prefixes:
        prefixes = list(prefixes) + [single]
    return [p for p in prefixes if p]


def azure_ensure_and_append(az_bin: str, ip: str, dry_run: bool) -> None:
    rg = os.environ.get("AZURE_RG", "")
    nsg = os.environ.get("AZURE_NSG", "")
    new_prefix = f"{ip}/32"

    azure_login_if_needed(az_bin)

    existing = azure_existing_prefixes(az_bin, rg, nsg, AZURE_RULE_NAME)

    if not existing:
        try_priorities = []
        configured = os.environ.get("AZURE_RULE_PRIORITY")
        if configured:
            try_priorities.append(configured)
        try_priorities += ["3500", "4000", "4500", "5000"]

        for priority in try_priorities:
            proc = run([
                az_bin, "network", "nsg", "rule", "create",
                "-g", rg, "--nsg-name", nsg, "--name", AZURE_RULE_NAME,
                "--priority", priority, "--direction", "Inbound", "--access", "Deny",
                "--protocol", "*", "--source-address-prefixes", new_prefix,
                "--description", "Auto-blocked IPs from OpenCanary",
                "--only-show-errors",
            ])
            if proc.returncode == 0:
                log.info(f"[Azure] Created {AZURE_RULE_NAME} priority={priority} with {new_prefix}")
                existing = [new_prefix]
                break
            err = (proc.stderr or "").strip()
            if "securityruleconflict" in err.lower():
                log.info(f"[Azure] priority {priority} in use (SecurityRuleConflict), trying next")
                continue
            log.info(f"[Azure] Error creating {AZURE_RULE_NAME} at priority {priority}: {err.splitlines()[-1] if err else 'unknown error'}")

    # refresh after possible create
    existing = azure_existing_prefixes(az_bin, rg, nsg, AZURE_RULE_NAME)

    if new_prefix in existing:
        log.info(f"[Azure] {ip} already present in '{AZURE_RULE_NAME}', skipping")
        return

    merged = sorted(set(existing) | {new_prefix})
    if not merged:
        return

    if dry_run:
        log.info(f"[Azure] (dry-run) Would update {AZURE_RULE_NAME} to: {' '.join(merged)}")
        return

    proc = run([
        az_bin, "network", "nsg", "rule", "update",
        "-g", rg, "--nsg-name", nsg, "--name", AZURE_RULE_NAME,
        "--source-address-prefixes", *merged, "--only-show-errors",
    ])
    if proc.returncode == 0:
        log.info(f"[Azure] OK: {ip}/32 appended to {AZURE_RULE_NAME}")
    else:
        log.info(f"[Azure] ERROR: Failed to update '{AZURE_RULE_NAME}' with {ip}")


def block_aws(aws_bin: str, ip: str, dry_run: bool) -> None:
    pl_id = os.environ.get("AWS_PL_ID")
    region = os.environ.get("AWS_REGION")
    if not (pl_id and region and aws_bin):
        return

    if run([aws_bin, "sts", "get-caller-identity", "--output", "text"]).returncode != 0:
        log.info("[AWS] ERROR: AWS credentials not available for the runtime user. Please configure AWS credentials or attach an instance role.")
        return

    proc = run([
        aws_bin, "ec2", "get-managed-prefix-list-entries",
        "--region", region, "--prefix-list-id", pl_id,
        "--query", f"Entries[?Cidr=='{ip}/32']", "--output", "text",
    ])
    if ip in (proc.stdout or ""):
        log.info(f"[AWS] {ip} already blocked, skipping")
        return

    if dry_run:
        log.info(f"[AWS] (dry-run) Would block {ip}")
        return

    ver_proc = run([
        aws_bin, "ec2", "describe-managed-prefix-lists",
        "--region", region, "--prefix-list-ids", pl_id,
        "--query", "PrefixLists[0].Version", "--output", "text",
    ])
    version = (ver_proc.stdout or "").strip() or "unknown"
    log.info(f"[AWS] Adding {ip}/32 (ver={version})")

    def _modify() -> bool:
        return run([
            aws_bin, "ec2", "modify-managed-prefix-list",
            "--region", region, "--prefix-list-id", pl_id,
            "--current-version", version,
            "--add-entries", f"Cidr={ip}/32,Description=Auto-blocked by OpenCanary",
        ]).returncode == 0

    if retry(_modify):
        log.info(f"[AWS] OK: {ip}/32 blocked (prefix-list)")
    else:
        log.info(f"[AWS] ERROR blocking {ip} (modify-managed-prefix-list failed)")


def block_gcp(gcloud_bin: str, ip: str, dry_run: bool) -> None:
    project_id = os.environ.get("GCP_PROJECT_ID")
    if not (project_id and gcloud_bin):
        return

    rule = f"auto-deny-{ip.replace('.', '-')}"
    if run([gcloud_bin, "compute", "firewall-rules", "describe", rule, f"--project={project_id}"]).returncode == 0:
        log.info(f"[GCP] {ip} already blocked, skipping")
        return

    if dry_run:
        log.info(f"[GCP] (dry-run) Would block {ip}")
        return

    priority = os.environ.get("GCP_DENY_PRIORITY", "90")
    log.info(f"[GCP] Adding {rule} priority={priority}")

    def _create() -> bool:
        return run([
            gcloud_bin, "compute", "firewall-rules", "create", rule,
            f"--project={project_id}", "--network=default",
            f"--priority={priority}", "--direction=INGRESS", "--action=DENY",
            "--rules=all", f"--source-ranges={ip}/32",
        ]).returncode == 0

    if retry(_create):
        log.info(f"[GCP] OK: {ip}/32 blocked (rule={rule})")
    else:
        log.info(f"[GCP] ERROR blocking {ip}")


def main() -> int:
    load_conf()
    log.info("Loaded /etc/auto-block.conf" if Path("/etc/auto-block.conf").is_file() else "No /etc/auto-block.conf - continuing with env vars")

    dry_run = env_flag("DRY_RUN")

    aws_bin = which("aws") or ""
    az_bin = which("az") or ""
    gcloud_bin = which("gcloud") or ""
    log.info(f"CLI checks: aws={aws_bin or 'no'}, az={az_bin or 'no'}, gcloud={gcloud_bin or 'no'}")

    if not EXPORT_FILE.is_file() or not os.access(EXPORT_FILE, os.R_OK):
        log.info(f"ERROR: export file not found or unreadable: {EXPORT_FILE}")
        return 1

    for raw_line in EXPORT_FILE.read_text().splitlines():
        if not raw_line.strip():
            continue
        parts = raw_line.split("\t")
        ip = parts[0].strip()
        cloud = parts[1].strip() if len(parts) > 1 else ""
        if not ip:
            continue
        log.info(f"Processing {ip} (seen_in={cloud})")

        block_aws(aws_bin, ip, dry_run)

        if os.environ.get("AZURE_RG") and os.environ.get("AZURE_NSG") and az_bin:
            azure_ensure_and_append(az_bin, ip, dry_run)

        block_gcp(gcloud_bin, ip, dry_run)

    log.info("DONE")
    return 0


if __name__ == "__main__":
    sys.exit(main())
