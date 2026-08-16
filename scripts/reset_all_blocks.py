#!/usr/bin/env python3
"""
reset_all_blocks.py - reset all auto-block IP rules across AWS, Azure, and GCP.

Python port of reset_all_blocks.sh. Behavior preserved:
- AWS: removes every entry from the managed prefix list.
- Azure: deletes any per-IP "AUTO_DENY_*" rules, then resets the scalable
  rule "AutoBlockedIPs-Honeypot" to a safe placeholder (192.0.2.0/32, a
  TEST-NET address) instead of leaving it empty or wide open.
- GCP: deletes every "auto-deny-*" firewall rule.

Note: the original script hardcoded AWS_PL_ID / AWS_REGION / AZ_RG / AZ_NSG /
GCP_PROJECT as constants rather than reading them from /etc/auto-block.conf;
that behavior is preserved below but the values are also overridable via
environment variables of the same name for flexibility.
"""

from __future__ import annotations

import os
import sys

from common import get_logger, run, run_json, which

log = get_logger("reset")

AWS_PL_ID = os.environ.get("AWS_PL_ID", "pl-067a3fa961dd2a39d")
AWS_REGION = os.environ.get("AWS_REGION", "us-east-1")

AZ_RG = os.environ.get("AZ_RG", "Capstone")
AZ_NSG = os.environ.get("AZ_NSG", "AzureVMnsg706")
AUTO_RULE_NAME = "AutoBlockedIPs-Honeypot"
PLACEHOLDER_PREFIX = "192.0.2.0/32"  # TEST-NET (safe placeholder)

GCP_PROJECT = os.environ.get("GCP_PROJECT", "flowing-blade-464915-d3")


def reset_aws(aws_bin: str) -> None:
    print("[AWS] Checking prefix list entries...")
    entries = run_json([
        aws_bin, "ec2", "get-managed-prefix-list-entries",
        "--prefix-list-id", AWS_PL_ID, "--region", AWS_REGION,
        "--query", "Entries[].{Cidr:Cidr}", "--output", "json",
    ]) or []

    if not entries:
        print("[AWS] No entries to remove.")
        return

    ver_proc = run([
        aws_bin, "ec2", "describe-managed-prefix-lists",
        "--prefix-list-ids", AWS_PL_ID, "--region", AWS_REGION,
        "--query", "PrefixLists[0].Version", "--output", "text",
    ])
    current_version = (ver_proc.stdout or "").strip()
    print(f"[AWS] Removing all entries from {AWS_PL_ID} (version={current_version})...")

    remove_list = [{"Cidr": e["Cidr"]} for e in entries if "Cidr" in e]
    if not remove_list:
        print("[AWS] No entries to remove.")
        return

    import json as _json
    proc = run([
        aws_bin, "ec2", "modify-managed-prefix-list",
        "--prefix-list-id", AWS_PL_ID,
        "--current-version", current_version,
        "--remove-entries", _json.dumps(remove_list),
        "--region", AWS_REGION,
    ])
    if proc.returncode == 0:
        print("[AWS] Prefix list cleared.")
    else:
        print(f"[AWS] ERROR clearing prefix list: {(proc.stderr or '').strip()}")


def reset_azure(az_bin: str) -> None:
    print("[Azure] Deleting dynamic AUTO_DENY_* rules (if any)...")
    proc = run([
        az_bin, "network", "nsg", "rule", "list",
        "--resource-group", AZ_RG, "--nsg-name", AZ_NSG,
        "--query", "[?starts_with(name, 'AUTO_DENY_')].name", "-o", "tsv",
    ])
    auto_rules = [r for r in (proc.stdout or "").splitlines() if r.strip()]

    if auto_rules:
        for rule_name in auto_rules:
            print(f"[Azure] Deleting rule: {rule_name}")
            del_proc = run([
                az_bin, "network", "nsg", "rule", "delete",
                "--resource-group", AZ_RG, "--nsg-name", AZ_NSG, "--name", rule_name,
            ])
            if del_proc.returncode != 0:
                print(f"[Azure] Failed deleting {rule_name} (continuing)")
    else:
        print("[Azure] No AUTO_DENY_ rules found.")

    print(f"[Azure] Resetting scalable rule '{AUTO_RULE_NAME}' (if exists)...")
    rule_data = run_json([
        az_bin, "network", "nsg", "rule", "show",
        "-g", AZ_RG, "--nsg-name", AZ_NSG, "--name", AUTO_RULE_NAME, "-o", "json",
    ])

    if rule_data is None:
        print(f"[Azure] Rule '{AUTO_RULE_NAME}' not found or cannot access. Skipping scalable-rule reset.")
        return

    existing_prefixes = rule_data.get("sourceAddressPrefixes") or []
    single = rule_data.get("sourceAddressPrefix")
    if single and single not in existing_prefixes:
        existing_prefixes = list(existing_prefixes) + [single]

    print(f"[Azure] Current prefixes in {AUTO_RULE_NAME}:")
    print("\n".join(existing_prefixes) if existing_prefixes else "(none)")

    print(f"[Azure] Updating {AUTO_RULE_NAME} -> {PLACEHOLDER_PREFIX}")
    upd_proc = run([
        az_bin, "network", "nsg", "rule", "update",
        "-g", AZ_RG, "--nsg-name", AZ_NSG, "--name", AUTO_RULE_NAME,
        "--source-address-prefixes", PLACEHOLDER_PREFIX, "--only-show-errors",
    ])
    if upd_proc.returncode == 0:
        print(f"[Azure] {AUTO_RULE_NAME} updated to placeholder prefix.")
    else:
        print(f"[Azure] ERROR: Failed to update {AUTO_RULE_NAME}. You may need additional permissions or to update manually.")


def reset_gcp(gcloud_bin: str) -> None:
    print("[GCP] Deleting auto-deny-* firewall rules...")
    proc = run([
        gcloud_bin, "compute", "firewall-rules", "list",
        f"--project={GCP_PROJECT}", "--filter=name~'auto-deny-'", "--format=value(name)",
    ])
    rules = [r for r in (proc.stdout or "").splitlines() if r.strip()]

    if not rules:
        print("[GCP] No auto-deny-* rules found.")
        return

    for rule_name in rules:
        print(f"[GCP] Deleting firewall rule: {rule_name}")
        del_proc = run([
            gcloud_bin, "compute", "firewall-rules", "delete", rule_name,
            f"--project={GCP_PROJECT}", "-q",
        ])
        if del_proc.returncode != 0:
            print(f"[GCP] Failed deleting {rule_name} (continuing)")


def main() -> int:
    aws_bin = which("aws")
    az_bin = which("az")
    gcloud_bin = which("gcloud")

    if aws_bin:
        reset_aws(aws_bin)
    else:
        print("[AWS] aws CLI not found, skipping.")

    if az_bin:
        reset_azure(az_bin)
    else:
        print("[Azure] az CLI not found, skipping.")

    if gcloud_bin:
        reset_gcp(gcloud_bin)
    else:
        print("[GCP] gcloud CLI not found, skipping.")

    print("[ALL CLOUDS] Reset complete.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
