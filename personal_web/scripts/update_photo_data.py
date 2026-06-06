#!/usr/bin/env python3
"""Add photoData.js entries for newly-synced photos, dating each from EXIF.

For every optimized photo in --dest that has no entry yet in --data (neither an
active nor a commented-out line), append a new entry whose `date` is the photo's
original capture date, read from the matching raw original in --raw (the
optimized JPEGs have their EXIF stripped during optimization). title/location/
description are left empty for you to fill in.

Existing entries are NEVER modified: curated dates/metadata and deliberately
commented-out photos are left exactly as they are. So this is safe to run on
every sync — it only ever appends entries for genuinely new files.

Normally invoked via sync-photos.sh. Standalone:
    python scripts/update_photo_data.py \
        --raw .photos_raw --dest src/assets/photos --data src/data/photoData.js
"""
import argparse
import datetime
import re
import sys
from pathlib import Path

# EXIF stores datetimes as ASCII "YYYY:MM:DD HH:MM:SS"; they sit near the start
# of the file. We take the earliest one found (DateTimeOriginal, vs. later
# modify times) as the capture date. Works for both HEIC and JPEG originals.
DATE_RE = re.compile(rb"(19|20)\d\d:[01]\d:[0-3]\d [0-2]\d:[0-5]\d:[0-5]\d")


def capture_date(raw: Path) -> str:
    """Earliest EXIF date in the file as 'YYYY-MM-DD'; fall back to file mtime."""
    try:
        head = raw.read_bytes()[:300_000]
        stamps = sorted(m.group().decode() for m in DATE_RE.finditer(head))
        if stamps:
            return stamps[0].split()[0].replace(":", "-")
    except OSError:
        pass
    return datetime.date.fromtimestamp(raw.stat().st_mtime).isoformat()


def main() -> int:
    ap = argparse.ArgumentParser(description="Append photoData.js entries for new photos.")
    ap.add_argument("--raw", required=True, type=Path, help="Folder of raw originals (for EXIF).")
    ap.add_argument("--dest", required=True, type=Path, help="Folder of optimized .jpg.")
    ap.add_argument("--data", required=True, type=Path, help="Path to photoData.js.")
    args = ap.parse_args()

    text = args.data.read_text()
    # A filename is "known" whether its line is active or commented out.
    referenced = set(re.findall(r"filename: '([^']+)'", text))

    new = []
    for jpg in sorted(args.dest.glob("*.jpg")):
        if jpg.name in referenced:
            continue
        raws = sorted(args.raw.glob(jpg.stem + ".*"))
        if not raws:
            print(f"  warn: no raw original for {jpg.name}; skipping", file=sys.stderr)
            continue
        new.append((jpg.name, capture_date(raws[0])))

    if not new:
        print("photoData.js: no new photos to add.")
        return 0

    block = "".join(
        f"  {{ filename: '{fn}', title: '', date: '{d}', location: '', description: '' }},\n"
        for fn, d in new
    )

    # Insert just before the closing '];' of the photoMeta array.
    m = re.search(r"const photoMeta = \[.*?\n(\];)", text, re.S)
    if not m:
        print("error: could not locate the photoMeta array end in photoData.js", file=sys.stderr)
        return 2
    idx = m.start(1)
    args.data.write_text(text[:idx] + block + text[idx:])

    for fn, d in new:
        print(f"  + {fn}  {d}")
    print(f"photoData.js: added {len(new)} entr{'y' if len(new) == 1 else 'ies'}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
