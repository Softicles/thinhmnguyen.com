#!/usr/bin/env python3
"""
Compress album photos for the web (raw originals -> src/assets/photos).

The /archive lightbox is capped at 80vw/65vh and album cards are tiny
thumbnails, so a 2048px long edge at JPEG q88 is visually lossless for how the
photos are actually displayed, while cutting size by ~90% (the raw phone
captures are up to 4032px / 4-12 MB each).

For every image found in --src it:
  * (optional) decodes HEIC/HEIF if `pillow-heif` is installed
  * resizes so the long edge is <= --max-edge (default 2048), never upscales
  * re-encodes as progressive, optimized JPEG at --quality (default 88)
  * preserves the RAW pixel orientation and strips EXIF — the site renders with
    `imageOrientation: none` (stored pixels are already upright; the EXIF
    orientation tags on these files are bogus), so applying EXIF rotation here
    would turn the photos sideways.
  * writes <name>.jpg into --dest
  * is idempotent: skips a photo whose source size+mtime is unchanged since the
    last run (tracked in a manifest), unless --force is given.

Normally invoked via scripts/sync_photos.sh. Standalone:
    python scripts/optimize_photos.py --src .photos_raw --dest src/assets/photos

Requires Pillow; for .heic/.heif sources also `pip install pillow-heif`.
"""
import argparse
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, UnidentifiedImageError

# HEIC support. Phone photos on Drive are often HEIC — sometimes mislabeled with
# a .jpg extension. Prefer pillow-heif if installed; otherwise fall back to the
# system `heif-convert` binary (libheif-examples), which is enough to decode.
try:
    import pillow_heif  # type: ignore
    pillow_heif.register_heif_opener()
    HEIC_OK = True
except Exception:
    HEIC_OK = False

HEIF_CONVERT = shutil.which("heif-convert")
# ftyp brands that indicate an ISO-BMFF HEIF/HEIC container.
_HEIF_BRANDS = {b"heic", b"heix", b"hevc", b"hevx", b"heim", b"heis",
                b"hevm", b"hevs", b"mif1", b"msf1", b"heif"}


def is_heif(path: Path) -> bool:
    """Detect HEIF/HEIC by magic bytes, regardless of file extension."""
    try:
        with open(path, "rb") as fh:
            head = fh.read(32)
    except OSError:
        return False
    return head[4:8] == b"ftyp" and head[8:12] in _HEIF_BRANDS


def load_image(src: Path, _tmps: list) -> Image.Image:
    """Open any supported image, transparently decoding HEIC via heif-convert."""
    if is_heif(src) and not HEIC_OK:
        if not HEIF_CONVERT:
            raise RuntimeError("HEIF file but neither pillow-heif nor heif-convert is available")
        tmp = Path(tempfile.mkstemp(suffix=".png")[1])
        _tmps.append(tmp)
        # heif-convert infers output format from extension; PNG keeps it lossless
        # before our own resize/JPEG step.
        subprocess.run([HEIF_CONVERT, str(src), str(tmp)],
                       check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        return Image.open(tmp)
    return Image.open(src)

SRC_EXTS = {".jpg", ".jpeg", ".png", ".webp", ".heic", ".heif", ".tif", ".tiff", ".bmp"}
MANIFEST_NAME = ".optimize_photos.json"  # written into --dest


def optimize_one(src: Path, dest: Path, max_edge: int, quality: int):
    """Resize + re-encode one image. Returns (orig_bytes, new_bytes, (w, h))."""
    orig_bytes = src.stat().st_size
    tmps: list = []
    try:
        im = load_image(src, tmps)
        # Deliberately NO ImageOps.exif_transpose — the site ignores EXIF
        # orientation and the raw pixels are already upright.
        im = im.convert("RGB")
        w, h = im.size
        if max(w, h) > max_edge:
            if w >= h:
                im = im.resize((max_edge, round(h * max_edge / w)), Image.LANCZOS)
            else:
                im = im.resize((round(w * max_edge / h), max_edge), Image.LANCZOS)
        dest.parent.mkdir(parents=True, exist_ok=True)
        im.save(dest, "JPEG", quality=quality, optimize=True, progressive=True)  # no exif= -> stripped
        return orig_bytes, dest.stat().st_size, im.size
    finally:
        for t in tmps:
            t.unlink(missing_ok=True)


def main() -> int:
    ap = argparse.ArgumentParser(description="Compress album photos for the web.")
    ap.add_argument("--src", required=True, type=Path, help="Folder of raw photos.")
    ap.add_argument("--dest", required=True, type=Path, help="Output folder for optimized .jpg.")
    ap.add_argument("--max-edge", type=int, default=2048, help="Max long edge in px (default 2048).")
    ap.add_argument("--quality", type=int, default=88, help="JPEG quality (default 88).")
    ap.add_argument("--force", action="store_true", help="Re-optimize even if unchanged since last run.")
    ap.add_argument("--prune", action="store_true",
                    help="Delete optimized .jpg in --dest whose source no longer exists in --src.")
    args = ap.parse_args()

    src_dir: Path = args.src.expanduser()
    dest_dir: Path = args.dest.expanduser()
    if not src_dir.is_dir():
        print(f"error: --src is not a directory: {src_dir}", file=sys.stderr)
        return 2

    files = sorted(p for p in src_dir.iterdir()
                   if p.is_file() and p.suffix.lower() in SRC_EXTS)
    if not files:
        print(f"No images found in {src_dir}")
        return 0

    if not HEIC_OK and not HEIF_CONVERT and any(is_heif(p) for p in files):
        print("warning: HEIF/HEIC photos present but no decoder found "
              "(install `pillow-heif` or the `heif-convert` binary) — they will fail.",
              file=sys.stderr)

    manifest_path = dest_dir / MANIFEST_NAME
    try:
        manifest = json.loads(manifest_path.read_text())
    except Exception:
        manifest = {}

    tot_o = tot_n = 0
    done = skipped = failed = 0
    expected_dest = set()
    for src in files:
        dest = dest_dir / (src.stem + ".jpg")
        expected_dest.add(dest.name)
        st = src.stat()
        sig = {"size": st.st_size, "mtime": int(st.st_mtime)}
        if not args.force and manifest.get(src.name) == sig and dest.exists():
            skipped += 1
            continue
        try:
            o, n, size = optimize_one(src, dest, args.max_edge, args.quality)
        except Exception as e:
            print(f"  FAILED {src.name}: {e}", file=sys.stderr)
            failed += 1
            continue
        tot_o += o
        tot_n += n
        done += 1
        manifest[src.name] = sig
        print(f"  {src.name:24} {o/1e6:6.2f}MB -> {n/1e6:5.2f}MB  {size[0]}x{size[1]}")

    if args.prune:
        for jpg in dest_dir.glob("*.jpg"):
            if jpg.name not in expected_dest:
                print(f"  pruned {jpg.name} (no longer on Drive)")
                jpg.unlink()
        manifest = {k: v for k, v in manifest.items()
                    if (dest_dir / (Path(k).stem + ".jpg")).name in expected_dest}

    try:
        dest_dir.mkdir(parents=True, exist_ok=True)
        manifest_path.write_text(json.dumps(manifest, indent=2))
    except Exception as e:
        print(f"warning: could not write manifest: {e}", file=sys.stderr)

    print(f"\nOptimized {done}, skipped {skipped}, failed {failed}.")
    if done:
        print(f"Total: {tot_o/1e6:.1f}MB -> {tot_n/1e6:.1f}MB ({tot_n/tot_o*100:.1f}%)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
