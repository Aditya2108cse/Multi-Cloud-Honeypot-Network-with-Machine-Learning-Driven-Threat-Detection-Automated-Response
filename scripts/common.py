"""
common.py - shared helpers for the multi-cloud honeypot blocking scripts.

Provides:
- load_conf(): source /etc/auto-block.conf (simple KEY=VALUE shell-style file)
  into os.environ, same as the original bash scripts did with `. /etc/auto-block.conf`.
- get_logger(): timestamped UTC logger that writes to both stdout and a log file.
- retry(): simple retry-with-backoff wrapper for flaky CLI calls.
- which(): locate a CLI binary, returning None if not found (mirrors `command -v`).
- run(): thin wrapper around subprocess.run with sane defaults.
"""

from __future__ import annotations

import json
import logging
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path
from typing import Callable, Optional, Sequence

CONF_FILE = Path("/etc/auto-block.conf")


def load_conf(conf_file: Path = CONF_FILE) -> None:
    """Load simple KEY=VALUE (optionally KEY="VALUE") lines into os.environ.

    Mirrors `set -a; . /etc/auto-block.conf; set +a` from the bash originals.
    Lines starting with # or blank lines are ignored. Existing environment
    variables are NOT overwritten (env takes precedence), matching typical
    shell-sourcing behavior when vars are pre-exported.
    """
    if not conf_file.is_file() or not os.access(conf_file, os.R_OK):
        return
    for raw_line in conf_file.read_text().splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


def get_logger(name: str, log_file: Optional[str] = None) -> logging.Logger:
    """Return a UTC-timestamped logger writing to stdout and optionally a file."""
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    logger.propagate = False

    if logger.handlers:
        return logger

    fmt = logging.Formatter(
        fmt="[%(asctime)s] [%(name)s] %(message)s",
        datefmt="%Y-%m-%dT%H:%M:%SZ",
    )
    fmt.converter = time.gmtime  # force UTC, matching `date -u`

    stream_handler = logging.StreamHandler(sys.stdout)
    stream_handler.setFormatter(fmt)
    logger.addHandler(stream_handler)

    if log_file:
        Path(log_file).parent.mkdir(parents=True, exist_ok=True)
        file_handler = logging.FileHandler(log_file)
        file_handler.setFormatter(fmt)
        logger.addHandler(file_handler)

    return logger


def which(binary: str) -> Optional[str]:
    """Return the resolved path to `binary`, or None if it isn't on PATH."""
    return shutil.which(binary)


def run(
    cmd: Sequence[str],
    check: bool = False,
    input_text: Optional[str] = None,
) -> subprocess.CompletedProcess:
    """Run a command, capturing stdout/stderr as text.

    Never raises for a missing binary or non-zero exit unless check=True -
    mirrors how the bash originals treated an absent CLI (empty `command -v`
    result) as "skip this cloud" rather than a hard crash.
    """
    try:
        return subprocess.run(
            list(cmd),
            input=input_text,
            capture_output=True,
            text=True,
            check=check,
        )
    except FileNotFoundError as exc:
        if check:
            raise
        return subprocess.CompletedProcess(
            args=list(cmd), returncode=127, stdout="", stderr=str(exc)
        )


def run_json(cmd: Sequence[str]) -> Optional[object]:
    """Run a command and parse its stdout as JSON. Returns None on failure."""
    proc = run(cmd)
    if proc.returncode != 0 or not proc.stdout.strip():
        return None
    try:
        return json.loads(proc.stdout)
    except json.JSONDecodeError:
        return None


def retry(func: Callable[[], bool], max_attempts: int = 3, initial_delay: int = 2) -> bool:
    """Call func() (returns truthy/falsy) with exponential backoff. Mirrors bash retry()."""
    delay = initial_delay
    for attempt in range(1, max_attempts + 1):
        if func():
            return True
        if attempt >= max_attempts:
            return False
        time.sleep(delay)
        delay *= 2
    return False


def env_flag(name: str, default: str = "0") -> bool:
    """Read a boolean-ish environment variable (e.g. DRY_RUN=1)."""
    return os.environ.get(name, default) == "1"
