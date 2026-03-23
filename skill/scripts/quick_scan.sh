#!/usr/bin/env bash
# quick_scan.sh - Wrapper for clawsafety CLI scan
# Usage: ./quick_scan.sh <target_path>

set -euo pipefail

TARGET="${1:-}"

if [ -z "$TARGET" ]; then
  echo '{"error": "No target provided", "usage": "quick_scan.sh <target_path>"}' >&2
  exit 1
fi

if ! command -v clawsafety &>/dev/null; then
  echo '{"cli_available": false, "message": "clawsafety CLI not installed. Install with: cargo install clawsafety"}'
  exit 0
fi

clawsafety scan "$TARGET" --format json
