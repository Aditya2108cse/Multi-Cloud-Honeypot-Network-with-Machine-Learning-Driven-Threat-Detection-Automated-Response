#!/usr/bin/env python3
"""
multicloud_block_status.py <ip> - check whether an IP is currently blocked
across AWS, Azure, and GCP.

Python port of multicloud_block_status.sh. Behavior preserved:
- AWS: checks the managed prefix list for a "<ip>/32" entry.
- Azure: checks for a per-IP rule "AUTO_DENY_<ip-with-underscores>" first,
  then falls back to checking the scalable rule "AutoBlockedIPs-Honeypot".
- GCP: checks for a firewall rule named "auto-deny-<ip-with-dashes>".
"""

from __future__ import annotations

import sys

from common import load_conf, run, which
import os


def check_aws(aws_bin: str, ip: str) -> None:
    region = os.environ.get("AWS_REGION")
    pl_id = os.environ.get("AWS_PL_ID")
    if not (region and pl_id and aws_bin):
        return

    proc = run([
        aws_bin, "ec2", "get-managed-prefix-list-entries",
        "--region", region, "--prefix-list-id", pl_id,
        "--query", f"Entries[?Cidr=='{ip}/32']", "--output", "text",
    ])
    if ip in (proc.stdout or ""):
        print(f"AWS:   {ip}/32 BLOCKED (pl={pl_id})")
    else:
        print(f"AWS:   {ip}/32 NOT BLOCKED (pl={pl_id})")


def check_azure(az_bin: str, ip: str) -> None:
    rg = os.environ.get("AZURE_RG")
    nsg = os.environ.get("AZURE_NSG")
    if not (rg and nsg and az_bin):
        return

    per_rule = f"AUTO_DENY_{ip.replace('.', '_')}"
    if run([
        az_bin, "network", "nsg", "rule", "show",
        "--resource-group", rg, "--nsg-name", nsg, "--name", per_rule,
    ]).returncode == 0:
        prio_proc = run([
            az_bin, "network", "nsg", "rule", "show",
            "--resource-group", rg, "--nsg-name", nsg, "--name", per_rule,
            "--query", "priority", "-o", "tsv",
        ])
        priority = (prio_proc.stdout or "").strip()
        print(f"Azure: {ip}/32 BLOCKED (rule={per_rule} priority={priority})")
        return

    scaled = "AutoBlockedIPs-Honeypot"
    src_proc = run([
        az_bin, "network", "nsg", "rule", "show",
        "--resource-group", rg, "--nsg-name", nsg, "--name", scaled,
        "--query", "sourceAddressPrefixes", "-o", "tsv",
    ])
    src = (src_proc.stdout or "").strip()
    if src and f"{ip}/32" in src:
        print(f"Azure: {ip}/32 BLOCKED (rule={scaled})")
    else:
        print(f"Azure: {ip}/32 NOT BLOCKED (NSG={nsg})")


def check_gcp(gcloud_bin: str, ip: str) -> None:
    project_id = os.environ.get("GCP_PROJECT_ID")
    if not (project_id and gcloud_bin):
        return

    rule = f"auto-deny-{ip.replace('.', '-')}"
    src_proc = run([
        gcloud_bin, "compute", "firewall-rules", "describe", rule,
        f"--project={project_id}", "--format=value(sourceRanges)",
    ])
    src = (src_proc.stdout or "").strip()
    if src and f"{ip}/32" in src:
        prio_proc = run([
            gcloud_bin, "compute", "firewall-rules", "describe", rule,
            f"--project={project_id}", "--format=value(priority)",
        ])
        priority = (prio_proc.stdout or "").strip() or "unknown"
        print(f"GCP:   {ip}/32 BLOCKED (rule={rule} priority={priority})")
    else:
        print(f"GCP:   {ip}/32 NOT BLOCKED (project={project_id})")


def main() -> int:
    if len(sys.argv) != 2:
        print(f"Usage: {sys.argv[0]} <ip>", file=sys.stderr)
        return 1
    ip = sys.argv[1]

    load_conf()

    # Mirrors the original script's hardcoded bin paths, but falls back to
    # PATH lookup so this still works if the CLIs live somewhere else.
    aws_bin = "/usr/local/bin/aws" if os.path.exists("/usr/local/bin/aws") else (which("aws") or "")
    az_bin = which("az") or ""
    gcloud_bin = which("gcloud") or ""

    check_aws(aws_bin, ip)
    check_azure(az_bin, ip)
    check_gcp(gcloud_bin, ip)
    return 0


if __name__ == "__main__":
    sys.exit(main())
