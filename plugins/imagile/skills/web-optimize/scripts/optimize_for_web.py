# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow>=11.3"]
# ///
"""Turn source images into web-ready AVIF/WebP derivatives.

Writes modern formats at one or more widths, keeps a legacy fallback, strips
metadata, and prints a <picture> snippet wired for srcset. Originals are never
modified or deleted — derivatives land in a `web/` folder beside the source.

    uv run optimize_for_web.py hero.png
    uv run optimize_for_web.py hero.png --widths 480,960,1440 --snippet
    uv run optimize_for_web.py assets/ -o dist/img --base-url /img/
"""
import argparse
import sys
from pathlib import Path

from PIL import Image, features

EXTS = {".png", ".jpg", ".jpeg", ".webp", ".avif", ".bmp", ".tif", ".tiff"}
EXT_FOR = {"avif": ".avif", "webp": ".webp", "jpeg": ".jpg", "png": ".png"}
# Photographic detail survives lower AVIF quality than WebP; these land near-equivalent.
DEFAULTS = {"avif": 70, "webp": 80, "jpeg": 82}


def human(n):
    return f"{n / 1024:.0f} KB" if n < 1024 * 1024 else f"{n / 1024 / 1024:.2f} MB"


def collect(inputs):
    """Expand files and folders into a flat, de-duplicated list, skipping our own output."""
    files, seen = [], set()
    for raw in inputs:
        p = Path(raw)
        if p.is_dir():
            candidates = [f for f in sorted(p.rglob("*"))
                          if f.suffix.lower() in EXTS and "web" not in f.parts]
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


def is_flat_art(im, max_colors=256):
    """Few distinct colors => icon/logo/vector-style, not a photo.

    Flat art behaves backwards from photos: lossy codecs add ringing around hard
    edges AND come out bigger, while lossless WebP crushes it. AVIF is the worst
    choice here — it can land several times larger than the source PNG.
    """
    return (im.getcolors(maxcolors=max_colors) or []) != []


def prune_useless(results, original_size, intrinsic):
    """Drop any format whose full-width output beats nothing — shipping the source is better.

    Removes the whole format rather than one width, so the surviving srcset stays
    complete and the browser can't be pushed into upscaling a short ladder.
    """
    kept, dropped = [], []
    for fmt in {r["format"] for r in results if r["role"] == "modern"}:
        full = [r for r in results if r["format"] == fmt and r["width"] == intrinsic]
        if full and full[0]["bytes"] >= original_size:
            dropped.append(fmt)
    for r in results:
        if r["role"] == "modern" and r["format"] in dropped:
            r["path"].unlink(missing_ok=True)
        else:
            kept.append(r)
    return kept, dropped


def avif_available():
    try:
        return bool(features.check("avif"))
    except Exception:  # noqa: BLE001 - older Pillow doesn't know the feature name
        return False


def plan_widths(intrinsic, requested):
    """Never upscale: drop requested widths above the source, always keep one variant."""
    if not requested:
        return [intrinsic]
    usable = sorted({w for w in requested if w < intrinsic})
    return usable + [intrinsic]


def encode(im, fmt, quality, target, lossless):
    """Save one derivative. Returns bytes written."""
    opts = {}
    if fmt == "avif":
        opts = {"quality": 100 if lossless else quality, "speed": 4}
    elif fmt == "webp":
        opts = {"quality": quality, "method": 6, "lossless": lossless}
    elif fmt == "jpeg":
        opts = {"quality": quality, "optimize": True, "progressive": True}
    elif fmt == "png":
        opts = {"optimize": True}

    out = im
    if fmt == "jpeg" and out.mode in ("RGBA", "LA", "P"):
        out = out.convert("RGB")  # jpeg cannot carry alpha
    if fmt == "png" and out.mode == "RGBA":
        # Flat art (icons, vector-style) shrinks a lot as a palette PNG; photos won't.
        if len(out.getcolors(maxcolors=256) or []) > 0:
            out = out.quantize(colors=256, method=Image.Quantize.FASTOCTREE)

    target.parent.mkdir(parents=True, exist_ok=True)
    out.save(target, format=fmt.upper(), **opts)  # no exif= -> metadata dropped
    return target.stat().st_size


def picture_snippet(stem, results, fallback_path, base_url, sizes, alt):
    """A <picture> block with AVIF/WebP sources and a legacy <img> fallback."""
    def url(p):
        return f"{base_url.rstrip('/')}/{p.name}" if base_url else p.name

    # Order sources by what the encoders actually produced, not by reputation.
    # AVIF usually wins, but not always — and <picture> takes the first supported
    # match, so a mis-ordered list ships the bigger file to the better browser.
    def full_width_bytes(fmt):
        sizes = [r["bytes"] for r in results if r["format"] == fmt and r["role"] == "modern"]
        return min(sizes) if sizes else float("inf")

    modern_formats = sorted({r["format"] for r in results if r["role"] == "modern"},
                            key=full_width_bytes)

    lines = ["<picture>"]
    for fmt in modern_formats:
        entries = sorted([r for r in results if r["format"] == fmt and r["role"] == "modern"],
                         key=lambda r: r["width"])
        if not entries:
            continue
        srcset = ", ".join(f"{url(e['path'])} {e['width']}w" for e in entries)
        lines.append(f'  <source type="image/{fmt}" srcset="{srcset}" sizes="{sizes}">')
    widest = max(results, key=lambda r: r["width"])
    lines += [
        f'  <img src="{url(fallback_path)}" alt="{alt}"',
        f'       width="{widest["width"]}" height="{widest["height"]}"',
        '       loading="lazy" decoding="async">',
        "</picture>",
    ]
    return "\n".join(lines)


def process(src, args, formats):
    with Image.open(src) as im:
        im.load()
        if im.mode == "P":
            im = im.convert("RGBA")
        intrinsic = im.width
        has_alpha = im.mode in ("RGBA", "LA") or "transparency" in im.info

        out_dir = Path(args.output) if args.output else src.parent / "web"
        widths = plan_widths(intrinsic, args.widths)
        original_size = src.stat().st_size
        results = []

        flat = args.art == "flat" or (args.art == "auto" and is_flat_art(im))
        lossless = args.lossless
        fallback = args.fallback
        if flat:
            formats = [f for f in formats if f != "avif"] or ["webp"]
            lossless = True
            if fallback == "jpeg":
                fallback = "png"
            print(f"  note: {src.name} looks like flat art - lossless WebP, no AVIF")
            if len(widths) > 1:
                # Resampling antialiases hard edges into gradients, so a downscaled
                # icon encodes *larger* than the full-size one. Ship one raster size.
                widths = [intrinsic]
                print("  note: skipping the width ladder - downscaled flat art encodes "
                      "larger, not smaller. If this is a logo or icon, SVG beats any "
                      "raster format here.")

        for width in widths:
            resized = im if width == intrinsic else im.resize(
                (width, round(im.height * width / intrinsic)), Image.Resampling.LANCZOS)
            suffix = "" if len(widths) == 1 else f"-{width}w"
            for fmt in formats:
                target = out_dir / f"{src.stem}{suffix}{EXT_FOR[fmt]}"
                size = encode(resized, fmt, args.quality_for(fmt), target, lossless)
                results.append({"format": fmt, "width": width, "height": resized.height,
                                "path": target, "bytes": size, "role": "modern"})

        if fallback == "jpeg" and has_alpha:
            fallback = "png"  # transparency would be flattened onto black
            print(f"  note: {src.name} has alpha - using a PNG fallback instead of JPEG")
        fallback_path = None
        if fallback != "none":
            fallback_path = out_dir / f"{src.stem}{EXT_FOR[fallback]}"
            fb_size = encode(im, fallback, args.quality_for(fallback), fallback_path, False)
            results.append({"format": fallback, "width": intrinsic, "height": im.height,
                            "path": fallback_path, "bytes": fb_size, "role": "fallback"})

    results, dropped = prune_useless(results, original_size, intrinsic)
    for fmt in dropped:
        print(f"  note: {fmt.upper()} came out larger than the source - dropped")

    print(f"{src.name}  ({human(original_size)}, {intrinsic}px wide)")
    for r in sorted(results, key=lambda r: (r["role"] == "fallback", r["width"], r["format"])):
        pct = 100 * r["bytes"] / original_size
        label = f"  {r['path'].name:<34} {human(r['bytes']):>9}  ({pct:.0f}% of original)"
        print(label + ("  [fallback]" if r["role"] == "fallback" else ""))

    modern = [r for r in results if r["role"] == "modern" and r["width"] == intrinsic]
    best = min(modern or results, key=lambda r: r["bytes"])
    saved = 100 - 100 * best["bytes"] / original_size
    print(f"  -> {saved:.0f}% smaller at full width ({best['format']})")
    if len(modern) > 1 and best["format"] != "avif" and any(r["format"] == "avif" for r in modern):
        print("  -> AVIF lost to WebP on this image; the snippet lists WebP first")

    if args.snippet and fallback_path is not None:
        print("\n" + picture_snippet(src.stem, results, fallback_path,
                                     args.base_url, args.sizes, args.alt or src.stem))
    return results


def main():
    ap = argparse.ArgumentParser(description="Produce web-ready AVIF/WebP derivatives.")
    ap.add_argument("inputs", nargs="+", help="image file(s) and/or folder(s)")
    ap.add_argument("-o", "--output", help="output dir (default: a web/ folder beside each source)")
    ap.add_argument("--widths", help="comma-separated srcset widths, e.g. 480,960,1440")
    ap.add_argument("--formats", default="avif,webp", help="modern formats (default avif,webp)")
    ap.add_argument("--fallback", choices=["jpeg", "png", "none"], default="jpeg",
                    help="legacy fallback for <img> (auto-switches to png when alpha is present)")
    ap.add_argument("--avif-quality", type=int, default=DEFAULTS["avif"])
    ap.add_argument("--webp-quality", type=int, default=DEFAULTS["webp"])
    ap.add_argument("--jpeg-quality", type=int, default=DEFAULTS["jpeg"])
    ap.add_argument("--lossless", action="store_true", help="for flat art/screenshots with text")
    ap.add_argument("--art", choices=["auto", "photo", "flat"], default="auto",
                    help="auto-detects flat art (icons/logos) and switches to lossless WebP")
    ap.add_argument("--snippet", action="store_true", help="print a <picture> block")
    ap.add_argument("--base-url", default="", help="URL prefix for the snippet, e.g. /assets/img")
    ap.add_argument("--sizes", default="100vw", help="sizes attribute for the snippet")
    ap.add_argument("--alt", help="alt text for the snippet")
    args = ap.parse_args()

    args.widths = [int(w) for w in args.widths.split(",")] if args.widths else []
    args.quality_for = lambda fmt: {
        "avif": args.avif_quality, "webp": args.webp_quality,
        "jpeg": args.jpeg_quality, "png": 0}[fmt]

    formats = [f.strip().lower() for f in args.formats.split(",") if f.strip()]
    if "avif" in formats and not avif_available():
        formats.remove("avif")
        print("note: this Pillow build has no AVIF encoder — emitting WebP only", file=sys.stderr)
    if not formats:
        print("No usable output formats.", file=sys.stderr)
        sys.exit(1)

    files = collect(args.inputs)
    if not files:
        print("No images found.", file=sys.stderr)
        sys.exit(1)

    ok = 0
    for src in files:
        try:
            process(src, args, formats)
            ok += 1
        except Exception as e:  # noqa: BLE001 - report and continue the batch
            print(f"[fail] {src}: {e}", file=sys.stderr)

    print(f"\nDone: {ok}/{len(files)} images.")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
