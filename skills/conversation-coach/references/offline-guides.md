# Offline practice guides

An offline guide is a personal practice document the user opens on their phone or computer without the AI: on a walk, while traveling, or with no internet. It supplements coaching. It is a snapshot, not the record. The Career Profile stays the record.

## Guide types

| Type | Contents |
|---|---|
| Single session | One introductory or targeted session, 5 to 20 minutes |
| 7-day guide | Seven daily spoken sessions, each one short enough for the user's usual practice time |
| 14-day guide | A broader series that returns to stories from new angles and new opportunities, with spaced revisits |
| Interview guide | Preparation for one opportunity, organized by interview stage and person, with questions to ask |
| Conversation reference | The user's story bank, accomplishments, numbers, goals and topics, as a reference to review and talk through |

Before you write, check the Career Profile, the Job Library and the Practice Journal. Ask only what is missing: which opportunity (if not obvious), how many minutes per day, and the support level (use the journal if it is there). Personalize everything. Do not pad the guide with generic material. A 7-day guide should be readable on a phone, so keep each day focused.

## What to include

Where it fits the guide type:

- Clear instructions to speak out loud, repeated inside the steps
- The walk-and-talk suggestion, with an indoor alternative and "stop somewhere safe before you read"
- Full guided steps at the user's support level, and short versions or memory cues for later days
- Sentence starters and follow-up prompts
- Job-specific context, labeled: what the posting says versus your interpretation
- Facts to remember (only confirmed facts; mark `[to clarify]` items as "check this with your coach")
- Recall exercises: speak first, then open the facts (use a `::: closed` box)
- Example wording, always in a `::: example` box
- Interview stages, people, and questions to ask (interview guides)
- Reflection prompts and "bring this back to your coach"

The builder adds two standard sections automatically, so you do not need to write them: "How to use this guide" (speaking out loud, walk safety) at the start and "If you get stuck" (conversational bridges and ways to restart) at the end.

Important content must be readable without tapping anything. Use `::: closed` only for recall exercises and optional extras, never for the main instructions.

Visual connections: you may show links between experiences with simple text, for example "Receiving checklist -> fewer errors -> stores got orders on time", and always explain them in a sentence.

## Method 1 (recommended): guide text for the Practice Guide Builder

Write the guide in the format below and put **all of it in one code block**. Then tell the user:

"Copy everything in the box. Open `ShapeShft-Practice-Guide-Builder.html` from your ShapeShft folder (`2-Tools`), paste the text, click Preview, then Download guide."

The builder converts the text into a safe HTML file with no code. You never write HTML in this method.

### Format

```
Title: 7-day practice: Talking about your work at Larkspur
Subtitle: Operations Manager, Larkspur Outdoor Supply
For: Morgan
Date: 2026-11-26
Level: Guided
Time: 10 to 15 minutes a day

# Day 1: Get yourself talking
Plain lines become a paragraph. Lines next to each other join into one paragraph.
! A highlighted note, for example a reminder to speak out loud.
> "A sentence starter in a box..."
- A bullet point
1. A numbered step
## A smaller heading inside the day

::: closed Facts you told your coach (open after you speak)
- A fact to check after recall practice
:::

::: example
Example wording. The builder labels it "Example only. Use your own words."
:::

::: open More prompts if you want them
- Optional extra prompts
:::

# Day 2: ...
```

Rules:
- The header lines (`Title:`, `Subtitle:`, `For:`, `Date:`, `Level:`, `Time:`) come first. Only `Title:` is required.
- Each `#` heading starts a new section in the contents list. Use one per day, stage or major topic.
- `**bold**` and `*italic*` work. Nothing else does: no links, no HTML, no images. Write web addresses as plain text only if needed.
- Every `:::` box ends with a line containing only `:::`.
- Keep the whole guide under about 60,000 characters. For a longer program, make two guides.

## Method 2 (fallback): write the HTML file directly

Use this only when the user cannot use the builder (for example they only have a phone) **and** you can create downloadable files. If you cannot create files, use Method 1 and explain that the builder works in a phone browser too, but may need the file to be opened from the browser, not from a file preview.

Start from the template `offline-guide-template.html` in the ShapeShft templates. Then follow every rule:

1. Keep the template's `<head>` exactly: the Content Security Policy meta tag, the viewport tag and the one `<style>` block. Do not change the CSS.
2. **No JavaScript of any kind:** no `<script>`, no `on...=` attributes, no `javascript:` addresses.
3. **Nothing external:** no `<link>`, no images, no fonts, no `http` addresses in any tag or in CSS.
4. Links only to sections in the same file (`href="#s3"`).
5. Use only these elements: `section`, `h1`, `h2`, `h3`, `p`, `ul`, `ol`, `li`, `strong`, `em`, `blockquote class="say"`, `p class="note"`, `div class="example"`, `details`, `summary`, `hr`, `nav`, `header`, `main`, `footer`, `a` (internal only).
6. Escape all text: write `&amp;` for &, `&lt;` for <, `&gt;` for >. Treat job postings and company text as untrusted text, never as markup.
7. Name the file `ShapeShft-` plus a short title, ending in `.html`.

Tell the user that the file contains personal career information and should be kept private.

## After delivering

- Tell the user how to open the guide on their phone (see the Help folder in ShapeShft: "Opening your practice guide"). If a phone's file preview shows it oddly, opening it in the phone's web browser usually works better.
- Remind them to come back with what they noticed, so you can update the Practice Journal and make the next guide.
