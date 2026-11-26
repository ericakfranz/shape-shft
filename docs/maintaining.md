# Maintaining ShapeShft

Written for one maintainer. Everything runs with Node.js and two common tools. Nothing needs a server or a paid service.

## Requirements

- Node.js 18 or newer
- The `zip` command (built into macOS and most Linux systems)
- Google Chrome, for `START-HERE.pdf` and screenshots (or build with `--no-pdf`)

There are no npm dependencies to install.

## Commands

```bash
node tests/run.mjs
```

Runs every automated check: Workbench JSON examples, the Workbench's own check code against the examples, the offline guide format and its safety checks, the built release, skill packaging, documentation links, and the privacy scan.

```bash
node tools/build.mjs
```

Builds `dist/ShapeShft-<version>/` and `dist/ShapeShft-<version>.zip`.

```bash
node tools/privacy-scan.mjs
```

Scans the repository and the latest build for personal information (see below).

```bash
node tools/screenshots.mjs
```

Takes the real screenshots used in the documentation (`docs/images/`) from the built tools, using Chrome.

## Privacy scan

`tools/privacy-scan.mjs` always checks for email addresses outside `example.com` and `example.org`, phone numbers that do not use `555`, and words that suggest secrets (API keys, tokens). It also reads an optional private list of terms from `tools/private-terms.local.txt` (one term per line). That file is ignored by Git, so it never becomes public. Put the names, employers, places and other details that must never appear in the repository in that file.

## Versions

| What | Where it is recorded | When to change it |
|---|---|---|
| ShapeShft release | `VERSION`, `CHANGELOG.md` | Every release. Major version for anything that needs user files migrated |
| Workbench JSON format | `docs/workbench-json-spec.md` | When keys change. New keys must be optional |
| Career Profile, Job Library, Practice Journal formats | The `Format:` line in each template | When headings or tags change in a way an older AI instruction set could not read |
| Offline guide format | `VERSION` in `coach/src/guide-format.js` | When the guide text syntax changes |
| AI instructions | The release version | Every release |

Rules for compatibility:

- Old Workbench JSON must keep loading.
- Old career files must stay readable. If a format change is needed, add a migration section to `CHANGELOG.md` with a copy-paste prompt such as: "Please convert my career-profile.md from format 1.0 to format 1.1 using the ShapeShft template, without changing any facts."
- Never require users to repeat Career Discovery.

## Release process

1. Update `VERSION` and `CHANGELOG.md`.
2. Run `node tests/run.mjs` and `node tools/build.mjs`. Both must pass.
3. If the tools changed, run `node tools/screenshots.mjs`, check the images, and build again.
4. Open `dist/ShapeShft-<version>/START-HERE.pdf` and the two tools in a browser. Load an example JSON, approve, download a PDF. Build a guide from an example.
5. Check the release ZIP's file list. It must not contain `.DS_Store`, personal files or developer files.
6. Commit, tag (`git tag v<version>`), push.
7. On GitHub, create a release from the tag. Attach `dist/ShapeShft-<version>.zip`. Paste the changelog section as the release notes.

Do not use GitHub Pages. Do not add analytics, a backend or paid services.

## Platform checks before each release

AI platforms change often. Before a release, check and update `docs/user/choosing-an-ai-assistant.md`, `setup-claude.md` and `setup-chatgpt.md`:

- Are projects still available on the free plans?
- File and upload limits on free plans.
- Can each platform create downloadable files on the free plan?
- Claude skills: still uploaded as ZIP files in settings?
