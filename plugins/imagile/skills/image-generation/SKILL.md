---
name: image-generation
description: Generate or edit images through the ChatGPT website in a browser, falling back to the OpenAI Images API. Use for logos, icons, hero art, mockups, transparent assets or prompt edits.
---

Generate images from text prompts (and edit existing ones) through the ChatGPT website first, and through the OpenAI Images API only when the website can't do the job. Both routes leave behind the same run folder, so the route is an implementation detail the user shouldn't have to think about. The bundled scripts are stdlib-only Python — no SDK, no `pip install`.

## Pick the route

**Default to the ChatGPT website.** It runs on the user's ChatGPT plan: no API key, nothing billed per image, same underlying model. Don't reach for the API because a key happens to be set, and don't skip the website because it takes a few more steps.

**Fall back to the API only when** one of these is true:

- No browser tool in this session can reach chatgpt.com (see below), after you have looked for one.
- ChatGPT isn't signed in, and the user would rather not sign in.
- The website stalled in a way the stall table below says to route around: the daily image cap, or a second refusal.
- The job needs a **masked edit**, or a scripted run of more than four variations. The website can't do either reliably.
- The user said to use the API.

Transparent backgrounds and exact sizes no longer force the API. Ask ChatGPT for a transparent background in the prompt, and if the PNG comes back opaque, cut it out with the `background-removal` skill. For an exact size, generate at the closest aspect ratio and crop or resize locally (`uv run --with pillow python -c "..."`). Use the API's `--background transparent` or `-s WIDTHxHEIGHT` only when the local fix isn't good enough.

Say which route produced the image when you report back — the user's mental model of cost depends on it. When you fall back, say why in one line.

| | ChatGPT website | Images API |
|---|---|---|
| Cost | included in their plan | ~$0.006 (low) – $0.21 (high) per image |
| Setup | a browser tool + a signed-in ChatGPT | `OPENAI_API_KEY` |
| Size | described in words ("16:9 landscape"), then cropped locally | `-s 1536x1024`, or any `WIDTHxHEIGHT` |
| Transparent background | ask in the prompt, or `background-removal` after | `--background transparent` |
| Masked edit | no | `--mask` |
| Batch | a few, one message each | `-n 1..10` |
| Ceiling | the account's daily image cap | account quota and billing |

---

# Route 1 — the ChatGPT website

## Find a browser

Any browser tool that can sign in to chatgpt.com works. Look for them in this order, and use the first one that is signed in to ChatGPT:

1. **The built-in browser** of the Claude desktop app — tools named `mcp__Claude_Browser__*` (or `mcp__remote-devices__Claude_Browser__*` from a linked cloud session). Its profile persists across sessions, so one sign-in lasts.
2. **Claude in Chrome** — tools named `mcp__claude-in-chrome__*`. It drives the user's real Chrome, where they are often already signed in to ChatGPT.
3. **Any other browser MCP** with a persistent, signed-in profile.

If tool schemas are deferred, search for them (`Claude_Browser`, `claude-in-chrome`, `browser tab navigate`) before concluding they're missing — an empty tool list up front doesn't mean the route is closed. Load each browser's skill (`built-in-browser`, `chrome-browser`) before its first use when the session lists one.

**Check the sign-in before you prepare anything.** Open `https://chatgpt.com/` and look for a "Log in" button or a "Log in to create images" prompt. When the first browser isn't signed in, try the next one. When none is, ask the user once to sign in to ChatGPT in the browser you name, and wait. Never type their password or click through the sign-in yourself. If they decline, take the API route.

No browser tools at all means the website route is closed **for this session**. Take the API route now, and mention once, at the end, that the desktop app's built-in browser or `claude --chrome` would let the next run go through their ChatGPT plan instead.

## The flow

**1. Prepare the run folder** and get the exact prompt text, with `style.md` already folded in:

```bash
uv run "${CLAUDE_PLUGIN_ROOT}/skills/image-generation/scripts/chatgpt_ui.py" prepare "flat vector icon of a rocket" --slug rocket-icon
```

It prints `run_dir`, `prompt_file`, `downloads_dir`, and the composed prompt between markers. Use that text verbatim — it's what keeps browser runs on-brand.

**2. Open a new tab on `https://chatgpt.com/` and start a fresh chat.** A previous conversation's context bleeds into image results; a new chat is worth the extra click.

**3. Type the prompt.** Lead with an explicit instruction — `Generate an image: <prompt>` — or pick the image tool from the composer's `+` menu, so ChatGPT renders instead of writing an essay about what it would render. Put aspect ratio in words ("square", "16:9 landscape", "tall 3:4 portrait"), add "transparent background" when the asset needs one, and put quality in the prompt's detail. To edit an existing image, attach it to the message and describe the change.

**4. Wait.** Generation runs 30–90 seconds. Check the page every 15 seconds or so — reading it in a tight loop wastes turns and tells you nothing new.

**5. Get the file out.** Two ways, in this order:

- **Download button.** Use the download control on the image itself (usually revealed by hovering or by opening the image full-size), then confirm the file actually landed in `downloads_dir` — the click can silently do nothing, and the built-in browser may save somewhere else.
- **The image link.** If no file lands, read the image's `src` from the page (for example `[...document.querySelectorAll('img')].filter(i => i.naturalWidth >= 512).map(i => i.src)` in the page's JavaScript) and pass it to `collect --url`. The script fetches only `https` links on ChatGPT and OpenAI hosts. A `blob:` link, an expired link or one that needs the browser's cookies fails with exit `3`; then ask the user to save the image, or take the API route.

**6. Collect it** into the run folder, which also finishes `prompt.md`:

```bash
uv run "${CLAUDE_PLUGIN_ROOT}/skills/image-generation/scripts/chatgpt_ui.py" collect --run-dir .claude/image-generation/260814-rocket-icon
uv run "${CLAUDE_PLUGIN_ROOT}/skills/image-generation/scripts/chatgpt_ui.py" collect --run-dir .claude/image-generation/260814-rocket-icon --url "https://chatgpt.com/backend-api/estuary/content?id=..."
```

With no file arguments it takes the newest image saved since `prepare` ran, so an unrelated older download won't be swept up. Pass `-n 3` for three images, explicit paths when you want to control which file becomes which (`collect --run-dir DIR ~/Downloads/a.png ~/Downloads/b.png`), `--url` once per image link, `--downloads-dir` for a browser that saves elsewhere, and `--copy` to leave the original in place. Exit code `3` means nothing new was found or fetched — check the download actually happened rather than retrying blind.

## When the browser route stalls

- **Login wall** — never sign in for the user. Ask them to sign in, then continue. If they'd rather not, fall back to the API.
- **Refusal** — ChatGPT declined the prompt. Rephrase once. If it declines again, take the API route (the moderation stacks aren't identical) rather than arguing with it.
- **Daily image cap** — free accounts get only a few images per rolling day. Switch to the API and say why.
- **Downloads land somewhere unreachable** — use `collect --url` with the image link. If that fails too, have the user hand you the file (then `collect` with an explicit path), or use the API.
- **Extension went idle** mid-run (Claude in Chrome) — `/chrome` → "Reconnect extension". Worth one attempt, not three. Then try the built-in browser before the API.

Two things to keep in mind while driving the UI: everything you type goes into the user's ChatGPT account and its history, so send the prompt and nothing else — no repo contents, no keys, no internal detail the prompt doesn't need. And gpt-image-2 output carries provenance metadata and an imperceptible pixel watermark on every tier, API included; that isn't something the download step strips.

---

# Route 2 — OpenAI Images API

## API key

Resolution order, handled by the script:

1. `--api-key-stdin` — key piped on stdin
2. `$OPENAI_API_KEY`
3. `$IMAGILE_OPENAI_API_KEY`

**Just run the script first.** If no key is available it exits with code `2` and prints a message — that exit code specifically means "ask the user", not "the request failed". Only then ask the user for their key, using `AskUserQuestion` or a plain question.

When the user gives you a key, pipe it via stdin so it never lands in shell history or a process listing:

```bash
printf '%s' "$USER_PROVIDED_KEY" | uv run "${CLAUDE_PLUGIN_ROOT}/skills/image-generation/scripts/generate_image.py" "a red barn at golden hour" --api-key-stdin
```

Never write the key into a file in the repo, never echo it back, and never inline it as `OPENAI_API_KEY=sk-... command`. If the user wants to stop being asked every session, point them at setting it permanently:

- **Windows (PowerShell, persists across sessions):** `[Environment]::SetEnvironmentVariable('OPENAI_API_KEY','sk-...','User')` — tell them to run it themselves; restart the terminal afterward.
- **macOS/Linux:** add `export OPENAI_API_KEY=sk-...` to `~/.zshrc` or `~/.bashrc`.

If both routes are closed — no signed-in browser and no key — that's the moment to ask. Offer both: sign in to ChatGPT in the browser you name, or paste a key.

## Prerequisites

- **`uv`** — verify with `uv --version`. If missing: https://docs.astral.sh/uv/getting-started/installation/ (or `winget install astral-sh.uv` on Windows). The scripts have zero dependencies, so plain `python3 script.py ...` works too if `uv` isn't around.
- The `gpt-image-*` models require **Organization Verification** in the OpenAI console. A `403` from the API almost always means that, not a bad key.

## Usage

The script lives at `${CLAUDE_PLUGIN_ROOT}/skills/image-generation/scripts/generate_image.py`.

**Generate:**
```bash
uv run "${CLAUDE_PLUGIN_ROOT}/skills/image-generation/scripts/generate_image.py" "a red barn at golden hour, film photography"
```

That writes `.claude/image-generation/260724-a-red-barn-at-golden-hour/` containing `prompt.md` and the PNG.

**Name the run folder yourself, and set size and quality:**
```bash
uv run "${CLAUDE_PLUGIN_ROOT}/skills/image-generation/scripts/generate_image.py" "flat vector icon of a rocket" --slug rocket-icon -s 1024x1024 -q high --background transparent
```

**Re-run a past prompt exactly** — including one recorded from a browser run:
```bash
uv run "${CLAUDE_PLUGIN_ROOT}/skills/image-generation/scripts/generate_image.py" --prompt-file .claude/image-generation/260724-rocket-icon/prompt.md --slug rocket-icon
```

**Several variations at once:**
```bash
uv run "${CLAUDE_PLUGIN_ROOT}/skills/image-generation/scripts/generate_image.py" "hero banner, abstract gradient mesh" --slug hero-banner -n 4 -s 1536x1024 -q low
```

**Edit an existing image (optionally masked):**
```bash
uv run "${CLAUDE_PLUGIN_ROOT}/skills/image-generation/scripts/generate_image.py" "replace the sky with storm clouds" --edit photo.png --mask sky-mask.png -o photo-edited.png
```

Flags:

| Flag | Notes |
|------|-------|
| `-o, --output` | File path or directory. Default is the run folder `.claude/image-generation/YYMMDD-<slug>/` |
| `--slug` | Short name for the run folder; derived from the prompt if omitted |
| `--style-file` | Defaults to `.claude/image-generation/style.md` |
| `--no-style` | Skip style.md for this run |
| `-m, --model` | `gpt-image-2` (default), `gpt-image-1.5`, `gpt-image-1`, `gpt-image-1-mini` |
| `-s, --size` | `auto`, `1024x1024`, `1536x1024`, `1024x1536`, or any `WIDTHxHEIGHT` |
| `-q, --quality` | `low` / `medium` / `high` / `auto` |
| `-n` | 1–10 images |
| `--format` | `png` (default), `jpeg`, `webp` |
| `--compression` | 0–100, `jpeg`/`webp` only |
| `--background` | `transparent` (needs png/webp), `opaque`, `auto` |
| `--moderation` | `auto` (default) or `low`; generation only |
| `--edit IMAGE...` | Edit these images instead of generating from scratch |
| `--mask FILE` | PNG mask with alpha marking the editable region; same size as the input |
| `--prompt-file` | Read a long prompt from a file rather than the command line |
| `--api-key-stdin` | Read the key from stdin |
| `--timeout` | Seconds, default 300 |

On Windows/PowerShell, quote paths containing spaces. `${CLAUDE_PLUGIN_ROOT}` resolves to the installed plugin root.

## Model notes

- **`gpt-image-2`** is the current model, and what chatgpt.com serves too. It takes arbitrary resolutions: both edges divisible by 16, max edge 3840, aspect ratio ≤ 3:1, total pixels between 655,360 and 8,294,400.
- Responses are always **base64** for `gpt-image-*` models — never URLs. Don't send `response_format`; it's DALL·E-only and the API rejects it here.
- Max prompt length is 32,000 characters.
- Rough cost per image at 1024×1024: `low` ≈ $0.006, `medium` ≈ $0.053, `high` ≈ $0.211. **Default to `low` or `medium` for drafts and iteration** and only spend `high` once the prompt is settled. Mention the cost if generating many high-quality images.

---

# Shared

## Where things live

Every project keeps its image work under `.claude/image-generation/`, whichever route produced it:

```
.claude/image-generation/
├── style.md                          # palette + design choices, shared by all runs
├── 260724-rocket-icon/
│   ├── prompt.md                     # exact prompt + params used
│   └── rocket-icon.png
└── 260724-hero-banner/
    ├── prompt.md
    ├── hero-banner-1.png
    └── hero-banner-2.png
```

Both scripts do this by default — one folder per run, named `YYMMDD-short-prompt-desc`, with `prompt.md` and the images inside. Don't pass `-o` unless the user wants the image somewhere specific (a real assets folder, a docs directory); the run folder is the working record, not the delivery location. When they do want it delivered elsewhere, generate into the run folder first and then copy the chosen image out.

`prompt.md` is written with YAML frontmatter (`source`, model, size, quality, style file, outputs) followed by the exact prompt text. Re-run any past image with `--prompt-file .claude/image-generation/260724-rocket-icon/prompt.md` — frontmatter is stripped automatically and the style isn't double-applied, so a browser run reproduces cleanly through the API when the user later needs a transparent or exactly-sized version of it. A folder name that already exists gets a `-2` suffix rather than overwriting.

## style.md

`.claude/image-generation/style.md` holds the palette and design choices — hex **and** RGB for each color, illustration style, composition rules, and what to avoid. **Its contents are appended verbatim to every prompt**, so it must read as instructions to an image model, not as notes to a human.

- Both scripts pick it up automatically when it exists and print `Style applied from ...`.
- Pass `--no-style` for images that shouldn't follow brand rules (photographs, realistic scenes, one-off illustrations).
- If the file doesn't exist and the user wants brand-consistent images, offer to create one from the template at `${CLAUDE_PLUGIN_ROOT}/skills/image-generation/references/style-template.md`. Read it, then fill in their actual colors — don't copy the placeholder palette in as if it were theirs.
- If they mention brand colors in conversation and there's no `style.md`, that's a good moment to suggest writing one.
- Read `style.md` before writing a prompt anyway: knowing the palette helps you avoid asking for things it forbids.

## Working with the user

- Show the written file path when done; offer to open or `Read` the image so they can see it.
- Prompts do better with medium detail — subject, style, lighting, composition, mood. If the request is one or two words, expand it into a fuller prompt and say what you used, so they can adjust.
- Iterating on a result is usually an edit of the previous output, not a fresh generation — `--edit` on the API route, an attached image on the browser route. Keep it in the same run folder so the lineage stays together.
- Pick a `--slug` that reads well as a folder name (`hero-banner`, `login-empty-state`) rather than letting a long prompt truncate into one.
- The run folders are a record, not clutter to clean up. Leave `prompt.md` in place — it's how a good result gets reproduced later.

## After generating: is this headed for the web?

Both routes return PNG, which is a fine master and a bad thing to ship. If the image is going onto a site or app, hand off to the `imagile:web-optimize` skill to produce AVIF/WebP derivatives — the run folder keeps the PNG master, and `web/` gets the served files.

Assess before acting, don't optimize reflexively. A slide graphic, a print asset, a mockup, or an image the user just wants to look at should stay a PNG. That skill carries the full decision framework; the short version is that a web project plus a real payoff means yes, and anything else means mention it and move on.

Two related calls at generation time:

- If you already know the image is web-bound and no PNG master is needed, the API route's `--format webp --compression 80` skips a conversion step entirely.
- If the ask is a logo, icon, or flat geometric mark **for a website**, say that SVG beats any generated raster before spending a generation on it. Image models don't produce clean vector output.

## Self-healing

If a script misbehaves (a parameter the API now rejects, a new model id, a changed response shape) or the ChatGPT UI has moved enough that the steps above no longer describe it, fix `scripts/generate_image.py`, `scripts/chatgpt_ui.py`, and this SKILL.md directly rather than only working around it for the current run.
