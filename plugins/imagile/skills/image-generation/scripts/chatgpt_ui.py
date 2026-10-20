# /// script
# requires-python = ">=3.10"
# dependencies = []
# ///
"""Bookkeeping for image runs done through the ChatGPT UI instead of the API.

Claude drives chatgpt.com with the Claude in Chrome browser tools; this script
owns the two filesystem halves of that flow so a browser run leaves behind the
same folder layout an API run does:

    prepare  make .claude/image-generation/YYMMDD-slug/, fold style.md into the
             prompt, write prompt.md, and print the exact text to paste
    collect  move the downloaded image(s) out of the browser's download folder
             into that run folder and finish prompt.md

Stdlib only — no SDK, no pip install, no network access. Run via uv (or plain
python3; there are no dependencies):

    uv run chatgpt_ui.py prepare "a red barn at golden hour" --slug barn
    uv run chatgpt_ui.py collect --run-dir .claude/image-generation/260814-barn
    uv run chatgpt_ui.py collect --run-dir .claude/image-generation/260814-barn ~/Downloads/barn.png
"""
import argparse
import os
import re
import shutil
import sys
from datetime import datetime
from pathlib import Path

# Shared with the API path so both routes write identical run folders.
from generate_image import (
    MANIFEST_NAME,
    STYLE_FILE,
    compose_prompt,
    run_dir,
    slugify,
    strip_frontmatter,
    write_manifest,
)

SOURCE = "chatgpt-ui"
UI_MODEL = "gpt-image-2 (chatgpt.com)"
IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp"}
NOTHING_FOUND_EXIT = 3
# Keys write_manifest regenerates; carried values would end up duplicated.
DERIVED_KEYS = {"generated", "outputs", "style_file", "edited_from"}


def downloads_dir(explicit):
    """Where the browser drops files: --downloads-dir, then env, then ~/Downloads."""
    for candidate in (explicit, os.environ.get("IMAGILE_DOWNLOADS_DIR"), Path.home() / "Downloads"):
        if candidate:
            return Path(candidate).expanduser()
    return Path.home() / "Downloads"


def read_manifest(path):
    """Parse a prompt.md back into (frontmatter dict, prompt text)."""
    text = path.read_text(encoding="utf-8")
    prompt = strip_frontmatter(text).strip()
    meta, key = {}, None
    if text.startswith("---"):
        end = re.search(r"^---\s*$", text[3:], re.MULTILINE)
        block = text[3:3 + end.start()] if end else ""
        for line in block.splitlines():
            if line.startswith("  - ") and isinstance(meta.get(key), list):
                meta[key].append(line[4:].strip())
            elif ":" in line:
                key, _, value = line.partition(":")
                key, value = key.strip(), value.strip()
                meta[key] = value if value else []
    return meta, prompt


def cutoff_time(meta):
    """Epoch seconds of the prepare step — downloads older than this aren't ours."""
    stamp = meta.get("prepared") or meta.get("generated")
    if isinstance(stamp, str):
        try:
            return datetime.fromisoformat(stamp).timestamp()
        except ValueError:
            pass
    return 0.0


def recent_downloads(directory, count, after):
    """The `count` newest images saved since `after`, returned oldest-first."""
    if not directory.is_dir():
        print(f"Download folder not found: {directory}", file=sys.stderr)
        sys.exit(NOTHING_FOUND_EXIT)
    fresh = [
        p for p in directory.iterdir()
        if p.is_file() and p.suffix.lower() in IMAGE_EXTS and p.stat().st_mtime >= after
    ]
    # Name breaks ties: several downloads can share a coarse mtime.
    fresh.sort(key=lambda p: (p.stat().st_mtime, p.name), reverse=True)
    return sorted(fresh[:count], key=lambda p: (p.stat().st_mtime, p.name))


def slug_for(directory):
    """rocket-icon, from a 260814-rocket-icon run folder."""
    return re.sub(r"^\d{6}-", "", directory.name) or "image"


def targets_for(directory, slug, sources):
    """Name the incoming files, continuing past anything already collected here."""
    existing = [p for p in directory.iterdir() if p.is_file() and p.suffix.lower() in IMAGE_EXTS]
    if not existing and len(sources) == 1:
        return [directory / f"{slug}{sources[0].suffix.lower()}"]
    start = len(existing)
    return [directory / f"{slug}-{start + i + 1}{src.suffix.lower()}"
            for i, src in enumerate(sources)]


def cmd_prepare(args):
    slug = slugify(args.slug or args.prompt)
    prompt, style_used = compose_prompt(
        args.prompt, None if args.no_style else args.style_file
    )
    directory = Path(args.run_dir) if args.run_dir else run_dir(slug)
    directory.mkdir(parents=True, exist_ok=True)

    params = {
        "prompt": prompt,
        "source": SOURCE,
        "model": args.model,
        "prepared": datetime.now().isoformat(timespec="seconds"),
    }
    manifest = write_manifest(directory, params, style_used, [], [])

    print(f"run_dir: {directory.as_posix()}")
    print(f"prompt_file: {manifest.as_posix()}")
    print(f"downloads_dir: {downloads_dir(args.downloads_dir).as_posix()}")
    if style_used:
        print(f"Style applied from {style_used}")
    print(f"After downloading, run: collect --run-dir {directory.as_posix()}")
    print("--- prompt to paste into ChatGPT ---")
    print(prompt)
    print("--- end of prompt ---")


def cmd_collect(args):
    directory = Path(args.run_dir)
    manifest = directory / MANIFEST_NAME
    if not manifest.is_file():
        print(f"No {MANIFEST_NAME} in {directory} — run `prepare` first.", file=sys.stderr)
        sys.exit(1)

    meta, prompt = read_manifest(manifest)
    if args.files:
        sources = [Path(f).expanduser() for f in args.files]
        missing = [p for p in sources if not p.is_file()]
        if missing:
            print(f"Not found: {', '.join(str(p) for p in missing)}", file=sys.stderr)
            sys.exit(1)
    else:
        folder = downloads_dir(args.downloads_dir)
        sources = recent_downloads(folder, args.n, cutoff_time(meta))
        if not sources:
            print(
                f"No image saved to {folder} since this run was prepared. Download the "
                "image from ChatGPT first, or pass the file path explicitly.",
                file=sys.stderr,
            )
            sys.exit(NOTHING_FOUND_EXIT)

    written = []
    for src, target in zip(sources, targets_for(directory, slug_for(directory), sources)):
        if args.copy:
            shutil.copy2(src, target)
        else:
            shutil.move(str(src), str(target))
        written.append(target)

    params = {"prompt": prompt}
    params.update({k: v for k, v in meta.items() if k not in DERIVED_KEYS and k != "prompt"})
    params["source"] = SOURCE
    write_manifest(directory, params, meta.get("style_file"), written, meta.get("edited_from") or [])

    for path in written:
        print(f"[ok] {path}")
    print(f"[ok] {manifest}")


def main():
    ap = argparse.ArgumentParser(
        description="Run-folder bookkeeping for images generated in the ChatGPT UI."
    )
    sub = ap.add_subparsers(dest="command", required=True)

    prep = sub.add_parser("prepare", help="create the run folder and print the prompt to paste")
    prep.add_argument("prompt", help="what to generate (style.md is appended automatically)")
    prep.add_argument("--slug", help="short-prompt-desc for the run folder (default: from the prompt)")
    prep.add_argument("--run-dir", help="use this folder instead of a new dated one")
    prep.add_argument("--style-file", default=str(STYLE_FILE),
                      help=f"palette/design notes folded into the prompt (default {STYLE_FILE.as_posix()})")
    prep.add_argument("--no-style", action="store_true",
                      help="ignore style.md for this run (photos, non-brand imagery)")
    prep.add_argument("-m", "--model", default=UI_MODEL, help="model recorded in prompt.md")
    prep.add_argument("--downloads-dir", help="where the browser saves files (default ~/Downloads)")
    prep.set_defaults(func=cmd_prepare)

    coll = sub.add_parser("collect", help="move downloaded image(s) into the run folder")
    coll.add_argument("files", nargs="*", help="downloaded file(s); omit to take the newest downloads")
    coll.add_argument("--run-dir", required=True, help="the folder `prepare` created")
    coll.add_argument("-n", type=int, default=1, help="how many downloads to take (default 1)")
    coll.add_argument("--downloads-dir", help="where the browser saves files (default ~/Downloads)")
    coll.add_argument("--copy", action="store_true", help="copy instead of moving the download")
    coll.set_defaults(func=cmd_collect)

    args = ap.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
