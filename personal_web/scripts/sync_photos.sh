#!/usr/bin/env bash
#
# Pull album photos from Google Drive and write WEB-OPTIMIZED copies into the app.
#
# Replaces the old direct command:
#     rclone sync gdriv:Photos .../src/assets/photos -P
# which dumped the heavy 4-12 MB originals straight into the app folder (and, once
# the local copies were compressed, kept re-downloading the heavy ones over them).
#
# Flow now:
#     gdriv:Photos  --rclone sync-->  .photos_raw/ (gitignored, heavy originals)
#                   --optimize_photos.py-->  src/assets/photos/ (2048px q88 .jpg)
#
# rclone only pulls files that changed on Drive; the optimizer only re-encodes
# files that changed in .photos_raw — so re-runs are fast.
#
# Usage:  ./scripts/sync_photos.sh
set -euo pipefail

# --- config (override via env if your setup differs) ------------------------
REMOTE="${REMOTE:-gdriv:Photos}"                 # rclone remote:folder of originals
RCLONE="${RCLONE:-$HOME/.local/bin/rclone}"      # rclone binary
[ -x "$RCLONE" ] || RCLONE="$(command -v rclone || true)"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"          # personal_web/
RAW_DIR="${RAW_DIR:-$APP_DIR/.photos_raw}"       # heavy originals (gitignored)
DEST_DIR="${DEST_DIR:-$APP_DIR/src/assets/photos}"  # optimized output (committed)

if [ -z "${RCLONE:-}" ] || [ ! -x "$RCLONE" ]; then
  echo "error: rclone not found. Expected at ~/.local/bin/rclone or on PATH." >&2
  exit 1
fi

# --- 1. pull heavy originals from Drive into the staging folder -------------
echo "==> rclone sync $REMOTE -> $RAW_DIR"
mkdir -p "$RAW_DIR"
# 'sync' mirrors the Drive folder (incl. deletions) into the staging dir only —
# safe, because the staging dir holds nothing but pulled originals.
"$RCLONE" sync "$REMOTE" "$RAW_DIR" --stats-one-line -v 2>&1 \
  | grep -vE "Skipped update modification|checking$" || true

# --- 2. compress staging -> app folder --------------------------------------
echo "==> optimizing $RAW_DIR -> $DEST_DIR"
PY="$(command -v python3 || command -v python)"
"$PY" "$SCRIPT_DIR/optimize_photos.py" --src "$RAW_DIR" --dest "$DEST_DIR" --prune

echo "==> done. Review/commit changes in src/assets/photos, then add any new"
echo "    photos to src/data/photoData.js (photoMeta)."
