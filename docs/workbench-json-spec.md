# Resume Workbench JSON specification

This is the authoritative description of the JSON that the ShapeShft Resume Workbench loads. It was written by reading the Workbench code (`workbench/src/workbench.html`), not from memory. If the code and this document ever disagree, the code wins and this document must be fixed.

- **Workbench version:** 1.0 (based on the private Resume Workbench "Version 10")
- **JSON format:** 2. Format 2 adds two optional keys (`edu` and `checks`) to format 1. Every format 1 file still loads.

## The one rule for AI assistants

Return the **complete** JSON object every time: for a new application, for a revision, and for a one-word fix. Never return a fragment, a patch or "only the changed part". The user pastes the whole block into the Load tab.

## Example

```json
{
  "meta": {"company": "Larkspur Outdoor Supply", "role": "Operations Manager"},
  "template": "t1",
  "name": "Morgan Ellery",
  "title": "Operations Manager | Inventory Control | Team Training",
  "contact": "Riverside Falls, OH | 555-555-0142 | morgan.ellery@example.com",
  "summary": "One paragraph, about four printed lines.",
  "skills": [{"label": "Operations", "value": "inventory control, receiving, cycle counts"}],
  "exp": [
    {"title": "Shift Supervisor", "org": "Cedar Ridge Distribution | Riverside Falls, OH", "start": "03/2019", "end": "08/2026",
     "bullets": ["Reduced inventory discrepancies by about 40% over six months by writing a receiving checklist and training six coworkers to use it."]}
  ],
  "edu": [{"name": "High school diploma", "org": "Riverside Falls High School", "date": "2012"}],
  "certs": [{"name": "OSHA 10-Hour General Industry", "date": "04/2018"}],
  "checks": {"confirmedTerms": ["inventory control"], "doNotClaim": ["SAP"], "confirmedNumbers": ["40", "6"]},
  "map": [{"req": "3+ years supervising warehouse staff", "status": "covered", "where": "Shift Supervisor bullet 1", "note": "Supervised 12 to 18 associates since 2019."}],
  "posting": "The complete job posting text, exactly as the user supplied it.",
  "letter": {"greeting": "Dear Hiring Team,", "body": ["Paragraph one.", "Paragraph two."], "closing": "Sincerely,"}
}
```

A complete, validated example is in `examples/morgan-ellery/application-larkspur-operations-manager.json`.

## Keys

| Key | Required | Type | What it holds |
|---|---|---|---|
| `summary` | **yes** | string | The professional summary. One paragraph. Aim for 650 characters or fewer (about four printed lines). |
| `skills` | **yes** | list | Rows of `{"label": "...", "value": "..."}`. `value` is a comma-separated list on one line. Most relevant rows first. May be an empty list. |
| `exp` | **yes** | list | Work history, newest first. See "Roles" below. |
| `meta` | normal | object | `{"company": "...", "role": "..."}`. `role` is the exact job title from the posting. Shown in the Company and Role fields. Used in file names. |
| `template` | optional | string | `"t1"` (default: serif headings with thin rules) or `"t2"` (gray bands). |
| `name` | normal | string | The candidate's name as it should print. |
| `title` | normal | string | The headline under the name. Under 75 characters. Parts separated by ` \| `. |
| `contact` | normal | string | One line. Parts separated by ` \| `. Must contain an email address or a phone number. |
| `edu` | optional (format 2) | list | `{"name": "...", "org": "...", "date": "..."}`. `date` is `MM/YYYY` or `YYYY`. Leave out or use `[]` when the user does not want an Education section. |
| `certs` | normal | list | `{"name": "...", "date": "MM/YYYY"}`. Licenses go here too. Use `[]` when none are relevant. |
| `checks` | optional (format 2) | object | Lists the Workbench uses for honesty checks. See below. |
| `map` | normal | list | The requirements map. See below. |
| `posting` | normal | string | The **complete** job posting, unabridged. Turns on keyword checks and the AI line tools. |
| `letter` | optional | object | The cover letter. See below. Leave the key out when there is no letter. A file without `letter` clears any old letter in the Workbench. |
| `extras` | optional | object | Extras tab settings. Normally left out. See below. |

Unknown keys are ignored. The Workbench never fails because of an extra key.

### What the loader requires (it refuses the file otherwise)

1. The text is valid JSON. A Markdown code fence around it is fine; the loader removes it.
2. `summary`, `skills` and `exp` are present.
3. `skills` and `exp` are lists.
4. Every role in `exp` has a `title` and a `bullets` list.
5. If `letter` is present, `letter.body` is a list of paragraphs or one string.
6. If `edu` is present, it is a list.

### What the loader changes automatically

Every string is converted to plain ASCII: curly quotes become straight quotes, en and em dashes become hyphens, `...` replaces the ellipsis character, bullet symbols become hyphens, accents are removed (for example `e` for `é`), other non-ASCII characters are deleted, and repeated spaces become one space. **This is why AI assistants should write plain ASCII to begin with**: a name with an accent will lose it. If the user's name needs an accent, tell them about this limit.

### Roles (`exp`)

```json
{"title": "Shift Supervisor", "org": "Cedar Ridge Distribution | Riverside Falls, OH", "start": "03/2019", "end": "08/2026", "bullets": ["..."]}
```

- `title` is the real job title the person held. Never change a historical title to match a posting.
- `org` is the employer, optionally with ` | ` and a location or "Remote".
- **Grouping:** back-to-back roles with exactly the same `org` text print under one employer line with the full date range. Use identical `org` text for every role at the same employer.
- `start` and `end` use `MM/YYYY`. `end` may be `Present` for a current job.
- Newest role first.
- Bullets: start with a capital action verb, past tense for past roles. Aim for 300 characters or fewer, and two printed lines or fewer. Six bullets or fewer per role; older roles usually get fewer.

### Checks (`checks`, format 2)

```json
"checks": {
  "confirmedTerms": ["inventory control", "forklift"],
  "doNotClaim": ["SAP", "Six Sigma"],
  "confirmedNumbers": ["40", "6", "6,000"]
}
```

- `confirmedTerms`: skills, tools and phrases the user has confirmed. The Workbench also treats every item in the `skills` rows as confirmed. It shows posting terms that are confirmed but missing from the resume.
- `doNotClaim`: tools, credentials and claims the user has said they do **not** have. If one appears on the resume or letter, the Workbench shows a red FIX item. If one appears in the posting, it is listed as a gap. The check matches words, not meaning, so an honest sentence such as "I have not used SAP" is also flagged. Reword it, or let the user choose "Approve anyway".
- `confirmedNumbers`: every number the user has confirmed. If this list is present, the Workbench warns about any number on the resume that is not in it (years such as 2019 and numbers under 10 without a % are skipped). If the list is missing, the number check is off.

The AI assistant fills these lists from the Master Career Profile. They are a safety net, not a replacement for the AI's own fact checking.

### Requirements map (`map`)

```json
{"req": "Exact requirement from the posting", "status": "covered", "where": "Shift Supervisor bullet 2", "note": "Short factual explanation"}
```

- One entry per material requirement in the posting.
- `status` is one of exactly three values: `covered`, `partial`, `gap`. If something is unconfirmed, use `partial` or `gap` and explain in `note`.
- `where` points to the line that shows the evidence. Use `""` for a gap.
- The map is the AI's assessment. It is not an employer's applicant tracking system result.

### Cover letter (`letter`)

```json
"letter": {"greeting": "Dear Hiring Team,", "body": ["Paragraph one.", "Paragraph two.", "Paragraph three."], "closing": "Sincerely,"}
```

- Do not put the candidate's name after the closing. The Workbench adds it.
- The letter has the same header as the resume. The Workbench does not print a date line.
- Usually 250 to 350 words. The Workbench warns above 350 words, on placeholders such as `[Company]`, and when the company name from `meta.company` does not appear.

### Extras (`extras`)

Normally leave this key out. The user turns these on in the Extras tab.

```json
"extras": {"references": false, "recommendation": false, "salary": false, "salaryText": "", "refs": [{"name": "", "role": "", "company": "", "phone": "", "email": "", "rel": ""}]}
```

The letter of recommendation PDF is never stored in the JSON. It stays in the browser on the user's device.

## Formatting rules for AI assistants

These rules come from the Workbench checks. Breaking one does not stop the file from loading, but it creates warnings the user must deal with.

1. Plain ASCII in every string. Straight quotes and hyphens only.
2. Dates as `MM/YYYY` (education may use `YYYY`).
3. Newest role first.
4. Summary 650 characters or fewer. Bullets 300 characters or fewer. Headline under 75 characters.
5. Six bullets or fewer per role. Older roles should not have more bullets than the newest role.
6. Vary the first verb. Three bullets that start with the same verb trigger a warning.
7. Past roles use past-tense verbs.
8. Put the posting's exact job title at the start of the headline when that is honest positioning. The Workbench warns when the headline does not contain the title from `meta.role`.
9. Use the posting's own words in the headline and the first two summary lines, but only where they are true for the candidate.
10. No placeholders such as `[Company]` or `XXX`.
11. No generic filler such as "results-driven", "detail-oriented" or "team player".
12. Every number must be confirmed by the user. Put each one in `checks.confirmedNumbers`.
13. `posting` holds the complete posting. If the user supplied only part of it, say so in chat before delivering, and never invent the missing parts.
14. Return only the JSON block when delivering. Questions and notes go in the chat before or after it, never inside it.

## Compatibility and migration

| From | To | What changes | What the user must do |
|---|---|---|---|
| Format 1 (private Workbench Versions 1 to 10) | Format 2 | `edu` and `checks` are new and optional. The old personal honesty lists that were written into the code are gone; `checks` replaces them. | Nothing. Format 1 files load unchanged. Without `checks`, the number check and the "do not claim" check are off. |

Rules for future changes:
- New keys must be optional, and files without them must keep loading.
- A change that makes an old file fail to load is a breaking change. It needs a new major ShapeShft version, a migration note in `CHANGELOG.md`, and a copy-paste prompt that converts old files.
- Browser storage keys changed from `resume-workbench.*` to `shapeshft-workbench.*`, so the public Workbench does not read data saved by the private one.
