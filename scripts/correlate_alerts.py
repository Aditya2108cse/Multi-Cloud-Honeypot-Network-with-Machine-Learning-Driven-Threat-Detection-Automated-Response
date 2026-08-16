#!/usr/bin/env python3
"""
correlate_alerts.py - Python replacement for the Splunk correlation search:

    index=opencanary sourcetype=opencanary
    | eval src_ip=coalesce(logdata.SRC_IP, src_ip, src)
    | stats count by src_ip
    | where count >= 3

Reads OpenCanary's JSON-lines log file directly (no Splunk needed), counts
events per source IP within a rolling time window, and writes any IP that
crosses the threshold to the TSV file that block_attacker.py already reads
(IP<TAB>Cloud), so the full pipeline is:

    OpenCanary logs -> correlate_alerts.py -> opencanary_export.tsv
        -> block_attacker.py -> AWS/Azure/GCP firewalls
        -> multicloud_block_status.py (verify)
        -> reset_all_blocks.py (undo, when needed)

Config (env vars, also loadable from /etc/auto-block.conf via common.py):
  OPENCANARY_LOG_FILE   Path to OpenCanary's JSON log (default: /var/log/opencanary/opencanary.log)
  EXPORT_FILE           Where to write IP<TAB>Cloud (default: /var/tmp/opencanary/opencanary_export.tsv)
  CORRELATION_WINDOW_MINUTES  Rolling window to count events in (default: 15)
  CORRELATION_THRESHOLD       Minimum event count to trigger a block (default: 3)
  CLOUD_LABEL           Label written in the "Cloud" column, e.g. "GCP" (default: hostname-based guess)

Usage:
  python3 correlate_alerts.py                # run once, write matches, exit
  python3 correlate_alerts.py --follow        # keep tailing the log and re-evaluate every --interval seconds
  python3 correlate_alerts.py --dry-run       # print matches instead of writing the export file
"""

from __future__ import annotations

import argparse
import json
import os
import socket
import sys
import time
from collections import Counter
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Iterable, Optional

from common import get_logger, load_conf

log = get_logger("correlate")


def guess_cloud_label() -> str:
    """Best-effort label for the export's Cloud column, based on hostname."""
    override = os.environ.get("CLOUD_LABEL")
    if override:
        return override
    hostname = socket.gethostname().lower()
    if "gcp" in hostname:
        return "GCP"
    if "azure" in hostname or "az-" in hostname:
        return "Azure"
    if "aws" in hostname or "ec2" in hostname:
        return "AWS"
    return "unknown"


def coalesce_src_ip(record: dict) -> Optional[str]:
    """Mirror `coalesce(logdata.SRC_IP, src_ip, src)` from the SPL query."""
    logdata = record.get("logdata") or {}
    if isinstance(logdata, dict):
        src = logdata.get("SRC_IP")
        if src:
            return src
    for key in ("src_ip", "src", "src_host"):
        val = record.get(key)
        if val:
            return val
    return None


def parse_event_time(record: dict) -> Optional[datetime]:
    """Parse OpenCanary's utc_time field (falls back to 'now' if unparseable)."""
    raw = record.get("utc_time") or record.get("local_time")
    if not raw:
        return None
    for fmt in ("%Y-%m-%d %H:%M:%S.%f", "%Y-%m-%d %H:%M:%S"):
        try:
            return datetime.strptime(raw, fmt).replace(tzinfo=timezone.utc)
        except ValueError:
            continue
    return None


def iter_records(log_file: Path) -> Iterable[dict]:
    """Yield parsed JSON records from an OpenCanary log file, skipping bad lines."""
    if not log_file.is_file() or not os.access(log_file, os.R_OK):
        log.info(f"ERROR: OpenCanary log file not found or unreadable: {log_file}")
        return
    with log_file.open("r", errors="replace") as fh:
        for line in fh:
            line = line.strip()
            if not line:
                continue
            try:
                yield json.loads(line)
            except json.JSONDecodeError:
                continue


def correlate(log_file: Path, window_minutes: int, threshold: int) -> list[str]:
    """Return the list of source IPs whose event count crosses the threshold
    within the trailing `window_minutes`. Events with no parseable timestamp
    are still counted (treated as within-window), matching a permissive
    real-time correlation rather than silently dropping them."""
    cutoff = datetime.now(timezone.utc) - timedelta(minutes=window_minutes)
    counts: Counter[str] = Counter()

    for record in iter_records(log_file):
        ip = coalesce_src_ip(record)
        if not ip:
            continue
        event_time = parse_event_time(record)
        if event_time is not None and event_time < cutoff:
            continue
        counts[ip] += 1

    return [ip for ip, count in counts.items() if count >= threshold]


def write_export(ips: list[str], export_file: Path, cloud_label: str, dry_run: bool) -> None:
    export_file.parent.mkdir(parents=True, exist_ok=True)

    if dry_run:
        for ip in ips:
            log.info(f"(dry-run) Would export: {ip}\t{cloud_label}")
        return

    # Merge with any IPs already pending export rather than clobbering them,
    # so a fast re-run doesn't erase entries block_attacker.py hasn't consumed yet.
    existing: set[str] = set()
    if export_file.is_file():
        for line in export_file.read_text().splitlines():
            if line.strip():
                existing.add(line.split("\t", 1)[0].strip())

    with export_file.open("a") as fh:
        for ip in ips:
            if ip in existing:
                continue
            fh.write(f"{ip}\t{cloud_label}\n")
            log.info(f"Correlated: {ip} triggered threshold, added to export")


def run_once(args: argparse.Namespace) -> int:
    log_file = Path(os.environ.get("OPENCANARY_LOG_FILE", "/var/log/opencanary/opencanary.log"))
    export_file = Path(os.environ.get("EXPORT_FILE", "/var/tmp/opencanary/opencanary_export.tsv"))
    window = int(os.environ.get("CORRELATION_WINDOW_MINUTES", "15"))
    threshold = int(os.environ.get("CORRELATION_THRESHOLD", "3"))
    cloud_label = guess_cloud_label()

    matches = correlate(log_file, window, threshold)
    log.info(f"Evaluated {log_file} (window={window}m, threshold={threshold}): {len(matches)} IP(s) over threshold")

    write_export(matches, export_file, cloud_label, args.dry_run)
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="Correlate OpenCanary alerts and export IPs over the block threshold.")
    parser.add_argument("--follow", action="store_true", help="Keep re-running on an interval instead of exiting after one pass.")
    parser.add_argument("--interval", type=int, default=60, help="Seconds between passes when --follow is set (default: 60).")
    parser.add_argument("--dry-run", action="store_true", help="Print matches instead of writing the export file.")
    args = parser.parse_args()

    load_conf()

    if not args.follow:
        return run_once(args)

    log.info(f"Running in --follow mode, re-checking every {args.interval}s (Ctrl+C to stop)")
    try:
        while True:
            run_once(args)
            time.sleep(args.interval)
    except KeyboardInterrupt:
        log.info("Stopped.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
