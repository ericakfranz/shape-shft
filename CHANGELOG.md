# Changelog

All notable changes to ShapeShft are listed here. Versions follow [Semantic Versioning](https://semver.org): a major version change means a user's files or Workbench JSON need migrating.

## 1.0.0 (unreleased)

First public release.

### Component versions

| Component | Version |
|---|---|
| ShapeShft release | 1.0.0 |
| Resume Workbench | 1.0 |
| Workbench JSON format | 2 |
| AI skills and combined instructions | 1.0 |
| Career Profile format | 1.0 |
| Job Library format | 1.0 |
| Practice Journal format | 1.0 |
| Offline guide format and template | 1.0 |

### Added

- Resume Builder: Career Discovery, career preference alignment notices, Job Library, tailored resume and cover letter generation, recruiter review, complete Workbench JSON delivery.
- Conversation Coach: spoken out-loud practice, Guided, Supported and Independent support levels, story bank, job-anchored practice, unprepared conversation practice, interview preparation by stage and person, questions to ask employers, post-interview reflection, opportunity comparison, Practice Journal.
- Practice Guide Builder: turns AI-written guide text into a self-contained HTML file with no JavaScript.
- Career files: Career Profile, Job Library and Practice Journal templates.
- Claude skill packages, a combined instruction file for any AI assistant, and project instructions.
- Starter prompts, setup guides, troubleshooting, privacy information, and fictional examples.

### Resume Workbench (changes from the private Version 10 it is based on)

- Removed all personal data: the starter resume, references, salary defaults, keyword lists, banned terms, allowed numbers and personal target roles.
- Added the optional `edu` key and an Education section.
- Added the optional `checks` key (`confirmedTerms`, `doNotClaim`, `confirmedNumbers`). It replaces the personal lists that were written into the code.
- The present-tense check now applies to any past role (end date not "Present").
- The contact line needs an email address or a phone number (was both).
- Downloads work outside Claude (the browser saves the file).
- AI buttons outside Claude give the request as text to copy into any AI assistant.
- Load from a `.json` file, and save the current application as a `.json` file. "Copy JSON" now includes the posting.
- References can be added and removed.
- jsPDF 2.5.1 and pdf-lib 1.17.1 are built into the file; Google Fonts removed. The release file loads nothing from the internet and has a Content Security Policy that blocks network connections.
- Browser storage keys renamed to `shapeshft-workbench.*`.

### Migration

- Workbench JSON format 1 files load unchanged.
