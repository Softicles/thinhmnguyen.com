#!/usr/bin/env bash
# Auto-sync the Google Drive "Photos" folder -> web-optimized photos in this repo.
#
# Pipeline:
#   1. rclone sync mirrors Drive into .photos_raw/ (gitignored heavy originals;
#      Drive is the source of truth, so this includes deletions).
#   2. optimize_photos.py decodes HEIC/HEIF -> .jpg, resizes to 2048px @ q88,
#      strips EXIF, and prunes outputs whose source no longer exists on Drive.
#      It is incremental: only new/changed originals are re-encoded.
#
# Run by hand (./sync-photos.sh) or via cron (crontab -e). Installed by Claude Code.
set -euo pipefail

# Keep cron's minimal PATH from hiding rclone / python3 / heif-convert.
export PATH="/usr/local/bin:/usr/bin:/bin:$HOME/.local/bin:$PATH"

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# --- config (override via env if your setup differs) ------------------------
RCLONE="${RCLONE:-$HOME/.local/bin/rclone}"          # rclone binary
[ -x "$RCLONE" ] || RCLONE="$(command -v rclone || true)"
REMOTE="${REMOTE:-gdriv:Photos}"                     # rclone remote:folder of originals
RAW="${RAW:-$REPO_DIR/.photos_raw}"                  # heavy originals cache (gitignored)
DEST="${DEST:-$REPO_DIR/src/assets/photos}"          # optimized output (committed)
LOG="${LOG:-$HOME/.local/share/rclone-photos-sync.log}"
PY="$(command -v python3 || command -v python || true)"

mkdir -p "$RAW" "$DEST" "$(dirname "$LOG")"
log() { echo "$(date '+%Y-%m-%d %H:%M:%S') $*" >> "$LOG"; }

if [ -z "${RCLONE:-}" ] || [ ! -x "$RCLONE" ]; then
  log "ERROR: rclone not found (expected ~/.local/bin/rclone or on PATH)"; exit 1
fi
if [ -z "$PY" ]; then
  log "ERROR: python3 not found on PATH"; exit 1
fi

log "===== starting sync ====="

# --- Stage 1: mirror Drive -> RAW cache --------------------------------------
"$RCLONE" sync "$REMOTE" "$RAW" --log-file "$LOG" --log-level INFO --stats 0

# --- Stage 2: HEIC->jpg + web-optimize into the app, prune orphans -----------
"$PY" "$REPO_DIR/scripts/optimize_photos.py" \
  --src "$RAW" --dest "$DEST" --prune >> "$LOG" 2>&1

log "===== sync finished ====="
log "Review/commit changes in src/assets/photos, then add any new photos to src/data/photoData.js (photoMeta)."
