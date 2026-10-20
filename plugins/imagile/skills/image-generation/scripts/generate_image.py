# /// script
# requires-python = ">=3.10"
# dependencies = []
# ///
"""Generate or edit images with the OpenAI Images API.

Stdlib only — no SDK, no pip install. Talks directly to
https://api.openai.com/v1/images/generations and /v1/images/edits.

The API key is resolved in this order:
    1. --api-key-stdin  (key piped on stdin; keeps it out of shell history)
    2. $OPENAI_API_KEY
    3. $IMAGILE_OPENAI_API_KEY
If none are set the script exits with code 2 so the caller knows to ask the
user for a key rather than treating it as a request failure.

Output follows the repo convention: each run gets its own folder at
.claude/image-generation/YYMMDD-short-prompt-desc/ holding prompt.md (the exact
prompt and parameters used) alongside the generated image(s). Shared palette and
design choices live in .claude/image-generation/style.md and are folded into the
prompt automatically when that file exists (--no-style opts out).

Run via uv (or plain python3 — there are no dependencies):
    uv run generate_image.py "a red barn at golden hour"
    uv run generate_image.py "logo on white" -o out/logo.png -s 1024x1024 -q high
    uv run generate_image.py "make the sky purple" --edit photo.png --mask mask.png
"""
import argparse
import base64
import json
import mimetypes
import os
import re
import sys
import urllib.error
import urllib.request
import uuid
from datetime import datetime
from pathlib import Path

API_BASE = "https://api.openai.com/v1"
NO_KEY_EXIT = 2
DEFAULT_MODEL = "gpt-image-2"
EXT_FOR_FORMAT = {"png": ".png", "jpeg": ".jpg", "webp": ".webp"}

# Repo convention: runs live in dated folders under here, palette in style.md.
RUNS_ROOT = Path(".claude/image-generation")
STYLE_FILE = RUNS_ROOT / "style.md"
MANIFEST_NAME = "prompt.md"
STYLE_MARKER = "Style guidance (follow exactly):"


def resolve_key(from_stdin):
    """Find the API key, or exit(2) so the caller knows to prompt for one."""
    if from_stdin:
        key = sys.stdin.read().strip()
        if key:
            return key
    for var in ("OPENAI_API_KEY", "IMAGILE_OPENAI_API_KEY"):
        key = os.environ.get(var, "").strip()
        if key:
            return key
    print(
        "No API key found. Set OPENAI_API_KEY (or IMAGILE_OPENAI_API_KEY), "
        "or pipe the key in with --api-key-stdin.",
        file=sys.stderr,
    )
    sys.exit(NO_KEY_EXIT)


def slugify(text, limit=40):
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return slug[:limit].rstrip("-") or "image"


def strip_frontmatter(text):
    """Drop a leading YAML frontmatter block so a written prompt.md round-trips."""
    if text.startswith("---"):
        end = re.search(r"^---\s*$", text[3:], re.MULTILINE)
        if end:
            return text[3 + end.end():].lstrip()
    return text


def compose_prompt(prompt, style_path):
    """Fold the shared palette/design notes into the prompt. Returns (prompt, path_used)."""
    if style_path is None or STYLE_MARKER in prompt:  # already baked in by a prior run
        return prompt, None
    path = Path(style_path)
    if not path.is_file():
        return prompt, None
    style = strip_frontmatter(path.read_text(encoding="utf-8")).strip()
    if not style:
        return prompt, None
    return f"{prompt}\n\n{STYLE_MARKER}\n{style}", path


def run_dir(slug):
    """.claude/image-generation/YYMMDD-slug/, suffixed if that folder already exists."""
    base = RUNS_ROOT / f"{datetime.now().strftime('%y%m%d')}-{slug}"
    candidate, n = base, 2
    while candidate.exists():
        candidate = base.with_name(f"{base.name}-{n}")
        n += 1
    return candidate


def write_manifest(directory, params, style_path, outputs, edits):
    """Record the exact prompt and settings beside the images, for reruns and review."""
    meta = {k: v for k, v in params.items() if k != "prompt"}
    meta["generated"] = datetime.now().isoformat(timespec="seconds")
    if style_path:
        meta["style_file"] = str(style_path).replace("\\", "/")
    if edits:
        meta["edited_from"] = [str(p).replace("\\", "/") for p in edits]
    if outputs:  # a prepared-but-unfinished run has none yet
        meta["outputs"] = [p.name for p in outputs]

    lines = ["---"]
    for key, value in meta.items():
        if isinstance(value, list):
            lines.append(f"{key}:")
            lines += [f"  - {item}" for item in value]
        else:
            lines.append(f"{key}: {value}")
    lines += ["---", "", params["prompt"], ""]

    target = directory / MANIFEST_NAME
    target.write_text("\n".join(lines), encoding="utf-8")
    return target


def encode_multipart(fields, files):
    """Build a multipart/form-data body. fields: [(name, value)], files: [(name, Path)]."""
    boundary = uuid.uuid4().hex
    body = bytearray()
    for name, value in fields:
        body += f"--{boundary}\r\n".encode()
        body += f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode()
        body += f"{value}\r\n".encode()
    for name, path in files:
        ctype = mimetypes.guess_type(str(path))[0] or "application/octet-stream"
        body += f"--{boundary}\r\n".encode()
        body += (
            f'Content-Disposition: form-data; name="{name}"; filename="{path.name}"\r\n'
        ).encode()
        body += f"Content-Type: {ctype}\r\n\r\n".encode()
        body += path.read_bytes() + b"\r\n"
    body += f"--{boundary}--\r\n".encode()
    return bytes(body), f"multipart/form-data; boundary={boundary}"


def post(url, key, body, content_type, timeout):
    req = urllib.request.Request(url, data=body, method="POST")
    req.add_header("Authorization", f"Bearer {key}")
    req.add_header("Content-Type", content_type)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as e:
        detail = e.read().decode(errors="replace")
        try:
            detail = json.loads(detail)["error"]["message"]
        except Exception:  # noqa: BLE001 - fall back to the raw body
            pass
        hint = ""
        if e.code == 401:
            hint = " (the API key was rejected — check it's current and not truncated)"
        elif e.code == 403:
            hint = " (gpt-image models need Organization Verification in the OpenAI console)"
        elif e.code == 429:
            hint = " (rate limit or insufficient quota on the account)"
        print(f"API error {e.code}: {detail}{hint}", file=sys.stderr)
        sys.exit(1)
    except urllib.error.URLError as e:
        print(f"Network error: {e.reason}", file=sys.stderr)
        sys.exit(1)


def build_params(args):
    """Params shared by generations and edits; None values are dropped."""
    params = {
        "model": args.model,
        "prompt": args.prompt,
        "size": args.size,
        "quality": args.quality,
        "background": args.background,
        "output_format": args.format,
        "moderation": args.moderation,
    }
    if args.n > 1:
        params["n"] = args.n
    if args.compression is not None:
        params["output_compression"] = args.compression
    # `moderation` is generation-only; edits reject it.
    if args.edit:
        params.pop("moderation", None)
    return {k: v for k, v in params.items() if v is not None}


def resolve_targets(count, args, slug):
    """Where each image goes. Defaults to a dated run folder under RUNS_ROOT."""
    ext = EXT_FOR_FORMAT.get(args.format or "png", ".png")
    out = Path(args.output) if args.output else None

    if out is not None and out.suffix:  # explicit file path
        if count == 1:
            return [out], None
        return [out.with_name(f"{out.stem}-{i + 1}{out.suffix}") for i in range(count)], None

    directory = out if out is not None else run_dir(slug)
    names = [f"{slug}{ext}"] if count == 1 else [f"{slug}-{i + 1}{ext}" for i in range(count)]
    return [directory / name for name in names], directory


def write_images(data, targets):
    """Decode b64 images to disk and return the paths written."""
    written = []
    for item, target in zip(data, targets):
        b64 = item.get("b64_json")
        if not b64:
            print("Response contained no image data.", file=sys.stderr)
            sys.exit(1)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(base64.b64decode(b64))
        written.append(target)
    return written


def main():
    ap = argparse.ArgumentParser(description="Generate or edit images with the OpenAI Images API.")
    ap.add_argument("prompt", nargs="?", help="what to generate (or the edit instruction)")
    ap.add_argument("--prompt-file", help="read the prompt from a file instead")
    ap.add_argument("-o", "--output",
                    help="output file or directory; default is a dated run folder "
                         f"under {RUNS_ROOT.as_posix()}/")
    ap.add_argument("--slug", help="short-prompt-desc for the run folder (default: from the prompt)")
    ap.add_argument("--style-file", default=str(STYLE_FILE),
                    help=f"palette/design notes folded into the prompt (default {STYLE_FILE.as_posix()})")
    ap.add_argument("--no-style", action="store_true",
                    help="ignore style.md for this run (photos, non-brand imagery)")
    ap.add_argument("-m", "--model", default=DEFAULT_MODEL,
                    help="gpt-image-2 (default), gpt-image-1.5, gpt-image-1, gpt-image-1-mini")
    ap.add_argument("-s", "--size", help="auto, 1024x1024, 1536x1024, 1024x1536, or WIDTHxHEIGHT")
    ap.add_argument("-q", "--quality", choices=["low", "medium", "high", "auto"],
                    help="low is ~40x cheaper than high; default auto")
    ap.add_argument("-n", type=int, default=1, help="number of images (1-10)")
    ap.add_argument("--format", choices=["png", "jpeg", "webp"], help="output format (default png)")
    ap.add_argument("--compression", type=int, help="0-100, jpeg/webp only")
    ap.add_argument("--background", choices=["transparent", "opaque", "auto"],
                    help="transparent requires png or webp")
    ap.add_argument("--moderation", choices=["auto", "low"], help="generation only")
    ap.add_argument("--edit", nargs="+", metavar="IMAGE",
                    help="edit these image(s) instead of generating from scratch")
    ap.add_argument("--mask", help="png mask with an alpha channel marking the region to edit")
    ap.add_argument("--api-key-stdin", action="store_true", help="read the API key from stdin")
    ap.add_argument("--timeout", type=int, default=300, help="request timeout in seconds")
    args = ap.parse_args()

    if args.prompt_file:
        raw = Path(args.prompt_file).read_text(encoding="utf-8")
        args.prompt = strip_frontmatter(raw).strip()  # a prior prompt.md re-runs as-is
    if not args.prompt:
        ap.error("a prompt is required (positional argument or --prompt-file)")
    if args.mask and not args.edit:
        ap.error("--mask only applies with --edit")

    slug = slugify(args.slug or args.prompt)
    args.prompt, style_used = compose_prompt(
        args.prompt, None if args.no_style else args.style_file
    )

    key = resolve_key(args.api_key_stdin)
    params = build_params(args)

    edits = [Path(p) for p in args.edit] if args.edit else []
    if args.edit:
        images = edits
        missing = [p for p in images if not p.is_file()]
        if missing:
            ap.error(f"input image(s) not found: {', '.join(str(p) for p in missing)}")
        files = [("image[]", p) for p in images]
        if args.mask:
            files.append(("mask", Path(args.mask)))
        body, ctype = encode_multipart([(k, str(v)) for k, v in params.items()], files)
        result = post(f"{API_BASE}/images/edits", key, body, ctype, args.timeout)
    else:
        body = json.dumps(params).encode()
        result = post(f"{API_BASE}/images/generations", key, body, "application/json", args.timeout)

    data = result.get("data") or []
    if not data:
        print("The API returned no images.", file=sys.stderr)
        sys.exit(1)

    targets, directory = resolve_targets(len(data), args, slug)
    written = write_images(data, targets)
    for path in written:
        print(f"[ok] {path}")
    if directory is not None:
        # `source` is manifest-only bookkeeping — the API never sees it.
        meta = {**params, "source": "openai-api"}
        print(f"[ok] {write_manifest(directory, meta, style_used, written, edits)}")
    if style_used:
        print(f"Style applied from {style_used}")

    usage = result.get("usage") or {}
    if usage:
        print(f"Tokens: {usage.get('input_tokens', '?')} in / "
              f"{usage.get('output_tokens', '?')} out")
    revised = data[0].get("revised_prompt")
    if revised:
        print(f"Revised prompt: {revised}")


if __name__ == "__main__":
    main()
