# /// script
# requires-python = ">=3.10"
# dependencies = ["rembg[cpu]", "pillow"]
# ///
"""Remove image backgrounds with rembg.

Accepts one or more image files and/or folders and writes transparent PNGs.
By default each PNG is written beside its source (foo.jpg -> foo.png); a PNG
input gets a `_nobg` suffix so the original is never overwritten.

Run via uv (no manual venv needed):
    uv run remove_bg.py image.jpg
    uv run remove_bg.py path/to/folder
    uv run remove_bg.py img1.jpg img2.png folder/ -o out/ -m isnet-general-use
"""
import sys
import argparse
from pathlib import Path

from rembg import remove, new_session
from PIL import Image

EXTS = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".tif", ".tiff"}


def collect(inputs):
    """Expand files and folders into a flat, de-duplicated list of image files."""
    files = []
    seen = set()
    for raw in inputs:
        p = Path(raw)
        if p.is_dir():
            candidates = [f for f in sorted(p.iterdir()) if f.suffix.lower() in EXTS]
        elif p.is_file() and p.suffix.lower() in EXTS:
            candidates = [p]
        else:
            print(f"skip (not an image): {p}", file=sys.stderr)
            continue
        for f in candidates:
            key = f.resolve()
            if key not in seen:
                seen.add(key)
                files.append(f)
    return files


def out_path(src, out_dir):
    """PNG path beside the source (or in out_dir); avoid clobbering a PNG source."""
    base = (Path(out_dir) if out_dir else src.parent) / src.name
    target = base.with_suffix(".png")
    if target.resolve() == src.resolve():  # writing png-in-place would overwrite original
        target = target.with_name(f"{src.stem}_nobg.png")
    return target


def main():
    ap = argparse.ArgumentParser(description="Remove image backgrounds with rembg.")
    ap.add_argument("inputs", nargs="+", help="image file(s) and/or folder(s)")
    ap.add_argument("-o", "--output-dir", help="write PNGs here instead of beside each source")
    ap.add_argument("-m", "--model", default="u2net",
                    help="rembg model (u2net, isnet-general-use, u2netp, ...)")
    args = ap.parse_args()

    files = collect(args.inputs)
    if not files:
        print("No images found.", file=sys.stderr)
        sys.exit(1)
    if args.output_dir:
        Path(args.output_dir).mkdir(parents=True, exist_ok=True)

    session = new_session(args.model)  # load model once, reuse across the batch
    ok = 0
    for src in files:
        try:
            with Image.open(src) as im:
                result = remove(im.convert("RGBA"), session=session)
            dst = out_path(src, args.output_dir)
            result.save(dst)
            print(f"[ok] {src.name} -> {dst.name}")
            ok += 1
        except Exception as e:  # noqa: BLE001 - report and continue the batch
            print(f"[fail] {src}: {e}", file=sys.stderr)

    print(f"Done: {ok}/{len(files)} images.")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
