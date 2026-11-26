# Contributing to ShapeShft

Thank you for helping. ShapeShft is maintained by one person, so small, focused contributions are easiest to review.

## Principles every change must keep

1. **Professional facts are never fabricated.** No feature, prompt or example may encourage the AI to invent or inflate experience, numbers, credentials or results.
2. **User privacy comes first.** No analytics, tracking, servers, accounts or network requests. Never commit real personal information.
3. **Accessibility is a priority.** Plain language, readable layouts, keyboard and screen reader support, and phone-friendly design.
4. **It works across professions.** Do not assume technology jobs, corporate metrics, or a degree.
5. **Coaching builds independent ability.** The Conversation Coach should make people need it less over time.
6. **Speaking out loud is central** to the Conversation Coach. Do not replace it with reading, writing or memorizing.
7. **No promises about outcomes.** AI assessments are opinions. Never present them as ATS results or hiring predictions.
8. **Beginners come first.** A feature that makes setup harder needs a very good reason.
9. **Offline guides stay JavaScript-free.** The guide format and template must never produce scripts, event handlers or external resources.

## Writing style

Plain, natural, informative language. Short sentences. No slogans, decorative phrases or corporate filler. Every sentence should inform, instruct or support.

## How the repository is organized

| Path | What it holds |
|---|---|
| `skills/` | The single source of the AI instructions. `_shared/core-rules.md` plus four skills. The combined instruction file and Claude skill ZIPs are generated from these |
| `templates/` | The three career file templates and the offline guide template |
| `workbench/` | The Resume Workbench source and its vendored libraries |
| `coach/` | The offline guide format (`guide-format.js`) and the Practice Guide Builder |
| `prompts/` | Starter prompts |
| `docs/user/` | Help pages included in the release |
| `docs/` | Developer documentation, including the Workbench JSON specification |
| `examples/` | Fictional examples |
| `tools/` | Build and check scripts |
| `tests/` | Automated tests and persona walkthroughs |

## Before you open a pull request

```bash
node tests/run.mjs
node tools/build.mjs
```

Both must pass. If you change the AI instructions, edit the files in `skills/`, not the generated files. If you change the Workbench JSON format, update `docs/workbench-json-spec.md`, the validator in `tools/lib/validate-workbench.mjs`, the examples, and `CHANGELOG.md`, and keep old files loading.

## Examples and test data

Use only fictional people and organizations. Use `555` phone numbers and `example.com` email addresses. Do not use real company names.

## Reporting issues

Use the issue templates. **Never post personal information** in an issue or pull request. Report security problems privately (see [SECURITY.md](SECURITY.md)).

## License

By contributing, you agree that your contribution is licensed under the MIT License.
