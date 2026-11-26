# How ShapeShft is put together

ShapeShft is a set of files, not a service. Users run everything with their own AI assistant and their own web browser. There is no server, database, account system, analytics or hosting.

## Parts

```
User's AI assistant (Claude, ChatGPT or other)
  reads: ShapeShft-AI-Instructions.md  (or the four Claude skills)
  reads and rewrites: career-profile.md, job-library.md, practice-journal.md
  writes: Workbench JSON        -> Resume Workbench (browser)   -> resume and letter PDFs
  writes: guide text            -> Practice Guide Builder (browser) -> offline guide HTML (no JavaScript)
```

| Part | Source | Ships as |
|---|---|---|
| AI instructions | `skills/_shared/core-rules.md`, `skills/*/SKILL.md`, `skills/conversation-coach/references/*.md` | `1-AI-Setup/ShapeShft-AI-Instructions.md` (combined) and four Claude skill ZIPs |
| Project instructions | `adapters/Project-Instructions.txt` | `1-AI-Setup/Project-Instructions.txt` |
| Career file templates | `templates/*.md` | `3-My-Files/` |
| Resume Workbench | `workbench/src/workbench.html` + `workbench/vendor/` | `2-Tools/ShapeShft-Resume-Workbench.html` (libraries built in) |
| Practice Guide Builder | `coach/src/guide-builder.html` + `coach/src/guide-format.js` | `2-Tools/ShapeShft-Practice-Guide-Builder.html` |
| Offline guide template | `templates/offline-guide-template.txt` | `templates/offline-guide-template.html` (generated; used by AI assistants that write HTML directly) |
| Help pages | `docs/user/*.md` | `Help/*.html` |
| START HERE | `START-HERE.md` | `START-HERE.pdf`, `START-HERE.html`, `START-HERE.md` |

## Decisions made during implementation

**Three career files, not one and not many.** The specification describes three logical components. Three Markdown files keep facts (profile), opportunities (library) and coaching notes (journal) apart, let the AI rewrite only the file that changed (long rewrites get cut off), and fit ChatGPT's free limit of 5 project files together with the instruction file. One file would grow too large because the library keeps full postings. More files would exceed free limits and confuse beginners.

**Markdown with tags, not JSON, for career files.** Users can read and fix Markdown in any text editor. Fact status is a visible tag (`[confirmed]`, `[estimate]`, `[to clarify]`, `[unknown]`, `[AI suggestion]`).

**One source for the AI instructions.** The skills in `skills/` are the only place the methodology is written. The build generates the combined file and the skill ZIPs from them, so they cannot drift apart.

**The Workbench runs as a local file.** The private Workbench was a Claude artifact. Public users cannot run someone else's artifact with their own data in a reliable way, so the release Workbench is a self-contained HTML file that opens in any browser. The code is the original code with personal data removed and small additions (see `CHANGELOG.md`). It still works as a Claude artifact: inside Claude, the AI buttons and Claude's download feature are used; elsewhere, the AI buttons produce text to copy, and the browser downloads files.

**Personal honesty rules moved from code to data.** The private Workbench had the owner's tools, banned words and confirmed numbers written into the code. These are now the optional `checks` key in the JSON, filled by the AI from the user's Career Profile.

**Offline guides are built by code, not written as HTML by the AI.** AI assistants write a simple text format. The builder escapes every character of it and produces fixed markup, then checks the result. This makes the zero-JavaScript and no-external-resources rules reliable regardless of what the AI or a pasted job posting contains. Assistants that can create files may write HTML directly from the template as a fallback, under strict rules.

**Recommended beginner workflow: one assistant with a project.** Both Claude and ChatGPT free plans have projects (checked on the official pricing and help pages, November 26, 2026). ChatGPT Free has a 27K-token context window, smaller than the 21K-token combined instructions plus a conversation, so the docs tell ChatGPT Free users to keep one task per chat. A shorter core instruction file for small-context models is a possible later improvement. The original two-assistant workflow (one for reasoning, one for the Workbench) still works and is documented, but is not needed now that the Workbench runs in the browser.

## Security model

- Release tools carry a Content Security Policy: `default-src 'none'`, inline scripts and styles only, no `connect-src`, no external fonts or images.
- The Workbench escapes all text before inserting it into the page (`esc()`), and normalizes all resume text to ASCII.
- The guide format escapes all text, creates links only to `#s1`-style section IDs it generates itself, and `check()` rejects any output containing scripts, event handlers, non-internal links, `src` attributes, external CSS or a missing CSP.
- Third-party libraries are pinned, hash-checked and built in.
