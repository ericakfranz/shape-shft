// Builds the ShapeShft release folder and ZIP from the repository sources.
// Usage: node tools/build.mjs            (folder and ZIP in dist/)
//        node tools/build.mjs --no-pdf   (skip START-HERE.pdf, for machines without Google Chrome)
// Needs: Node.js 18 or newer, the `zip` command, and Google Chrome for the PDF.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { render } from './lib/md.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const VERSION = fs.readFileSync(path.join(ROOT, 'VERSION'), 'utf8').trim();
const NAME = `ShapeShft-${VERSION}`;
const DIST = path.join(ROOT, 'dist');
const OUT = path.join(DIST, NAME);
const NO_PDF = process.argv.includes('--no-pdf');
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const require = createRequire(import.meta.url);
const Guide = require(path.join(ROOT, 'coach/src/guide-format.js'));

const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
const write = (p, s) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, s); };
const copy = (from, to) => { fs.mkdirSync(path.dirname(to), { recursive: true }); fs.copyFileSync(path.join(ROOT, from), to); };
const today = new Date().toISOString().slice(0, 10);
const stripFront = s => s.replace(/^---\n[\s\S]*?\n---\n+/, '');
const inlineScript = js => js.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');
const log = m => console.log('  ' + m);

fs.rmSync(OUT, { recursive: true, force: true });
fs.rmSync(path.join(DIST, NAME + '.zip'), { force: true });
fs.mkdirSync(OUT, { recursive: true });
console.log(`Building ${NAME}`);

/* ---------- 2-Tools: one self-contained HTML file per tool ---------- */
const TOOL_CSP = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; font-src 'none'; connect-src 'none'; frame-src 'self' blob: data:; base-uri 'none'; form-action 'none'";
const cspMeta = `<meta http-equiv="Content-Security-Policy" content="${TOOL_CSP}">`;
const stamp = `<!-- ShapeShft ${VERSION}. MIT License. Third-party notices: THIRD-PARTY-NOTICES.txt -->`;

let wb = read('workbench/src/workbench.html');
for (const lib of ['jspdf.umd.min.js', 'pdf-lib.min.js']) {
  const tag = `<script src="../vendor/${lib}"></script>`;
  if (!wb.includes(tag)) throw new Error('Workbench script tag not found: ' + lib);
  wb = wb.replace(tag, () => `<script>/* ${lib}: see THIRD-PARTY-NOTICES.txt */\n${inlineScript(read('workbench/vendor/' + lib))}\n</script>`);
}
wb = wb.replace('<meta charset=utf8>', () => `<meta charset=utf8>${cspMeta}`).replace('<!doctype html>', () => `<!doctype html>${stamp}`);
const outsideScripts = h => h.replace(/<script>[\s\S]*?<\/script>/g, '');
if (/<script\s+src=|<link\b|https?:\/\/fonts\./i.test(outsideScripts(wb))) throw new Error('The Workbench still loads something from outside the file.');
write(path.join(OUT, '2-Tools/ShapeShft-Resume-Workbench.html'), wb);
log('Resume Workbench: ' + Math.round(wb.length / 1024) + ' KB');

let gb = read('coach/src/guide-builder.html');
const gtag = '<script src="guide-format.js"></script>';
if (!gb.includes(gtag)) throw new Error('Guide builder script tag not found.');
gb = gb.replace(gtag, () => `<script>\n${inlineScript(read('coach/src/guide-format.js'))}\n</script>`)
  .replace('<meta charset="utf-8">', () => `<meta charset="utf-8">\n${cspMeta}`).replace('<!doctype html>', () => `<!doctype html>\n${stamp}`);
if (/<script\s+src=|<link\b/i.test(outsideScripts(gb))) throw new Error('The guide builder still loads a script file.');
write(path.join(OUT, '2-Tools/ShapeShft-Practice-Guide-Builder.html'), gb);
log('Practice Guide Builder');

/* ---------- offline guide template (also kept in templates/ for AI assistants that write HTML directly) ---------- */
const templateHtml = Guide.build(read('templates/offline-guide-template.txt'), { generated: '(date)' });
if (Guide.check(templateHtml).length) throw new Error('Offline guide template fails its own check: ' + Guide.check(templateHtml).join('; '));
write(path.join(ROOT, 'templates/offline-guide-template.html'), templateHtml);

/* ---------- examples: build every guide source and check it ---------- */
const exDir = path.join(ROOT, 'examples');
for (const person of fs.readdirSync(exDir)) {
  const pdir = path.join(exDir, person);
  if (!fs.statSync(pdir).isDirectory()) continue;
  for (const f of fs.readdirSync(pdir).filter(f => /^guide-.*\.txt$/.test(f))) {
    const html = Guide.build(fs.readFileSync(path.join(pdir, f), 'utf8'), { generated: 'the example date' });
    const problems = Guide.check(html);
    if (problems.length) throw new Error(`${person}/${f}: ${problems.join('; ')}`);
    fs.writeFileSync(path.join(pdir, f.replace(/\.txt$/, '.html')), html);
  }
}
log('Example guides rebuilt and checked');

/* ---------- 1-AI-Setup ---------- */
const S = {
  core: read('skills/_shared/core-rules.md'),
  onboarding: read('skills/onboarding/SKILL.md'),
  discovery: read('skills/career-discovery/SKILL.md'),
  resume: read('skills/resume-tailoring/SKILL.md'),
  coach: read('skills/conversation-coach/SKILL.md'),
  sessions: read('skills/conversation-coach/references/practice-sessions.md'),
  interview: read('skills/conversation-coach/references/interview-prep.md'),
  offline: read('skills/conversation-coach/references/offline-guides.md'),
  spec: read('docs/workbench-json-spec.md'),
  tProfile: read('templates/career-profile.md'),
  tJobs: read('templates/job-library.md'),
  tJournal: read('templates/practice-journal.md')
};
const demote = s => s.replace(/^(#{1,5}) /gm, '#$1 ');
const fence = s => '````markdown\n' + s.trim() + '\n````';
const combined = [
  `# ShapeShft AI Instructions\n\nVersion ${VERSION}. Built ${today}. Free and open source under the MIT License.\n\nThese are the complete instructions for an AI assistant using ShapeShft. They are generated from the ShapeShft skill files, so they say the same thing as the Claude skills. If you are an AI assistant reading this: follow these instructions for the whole conversation. Start with "ShapeShft onboarding and routing" when the user is new or unsure what to do.\n\n## Contents\n\n1. ShapeShft core rules\n2. ShapeShft onboarding and routing\n3. ShapeShft Career Discovery\n4. ShapeShft Resume Builder\n5. Resume Workbench JSON specification\n6. ShapeShft Conversation Coach\n7. Practice sessions\n8. Interview preparation, employer questions and reflection\n9. Offline practice guides\n10. Career file templates`,
  demote(S.core), demote(stripFront(S.onboarding)), demote(stripFront(S.discovery)), demote(stripFront(S.resume)),
  demote(S.spec), demote(stripFront(S.coach)), demote(S.sessions), demote(S.interview), demote(S.offline),
  `## Career file templates\n\nUse these exact structures when creating or updating the user's files.\n\n### Template: career-profile.md\n\n${fence(S.tProfile)}\n\n### Template: job-library.md\n\n${fence(S.tJobs)}\n\n### Template: practice-journal.md\n\n${fence(S.tJournal)}`
].join('\n\n---\n\n')
  .replace(/\(`references\/core-rules\.md`, or the "ShapeShft core rules" section of the combined instructions\)/g, '(the "ShapeShft core rules" section of these instructions)')
  .replace(/`references\/[a-z-]+\.(?:md|html)` \(or (the [^)]*?) of the combined instructions\)/g, '$1 of these instructions');
if (/combined instructions\)|`references\/core-rules/.test(combined)) throw new Error('A skill reference was not rewritten for the combined instructions.');
write(path.join(OUT, '1-AI-Setup/ShapeShft-AI-Instructions.md'), combined);
log('Combined AI instructions: ' + Math.round(combined.length / 1024) + ' KB, about ' + Math.round(combined.length / 4 / 1000) + 'k tokens');
copy('adapters/Project-Instructions.txt', path.join(OUT, '1-AI-Setup/Project-Instructions.txt'));

const skillRefs = {
  'onboarding': { name: 'shapeshft-onboarding', refs: {} },
  'career-discovery': { name: 'shapeshft-career-discovery', refs: { 'career-profile-template.md': 'templates/career-profile.md' } },
  'resume-tailoring': { name: 'shapeshft-resume-builder', refs: { 'workbench-json-spec.md': 'docs/workbench-json-spec.md', 'career-profile-template.md': 'templates/career-profile.md', 'job-library-template.md': 'templates/job-library.md' } },
  'conversation-coach': { name: 'shapeshft-conversation-coach', refs: {
    'practice-sessions.md': 'skills/conversation-coach/references/practice-sessions.md', 'interview-prep.md': 'skills/conversation-coach/references/interview-prep.md',
    'offline-guides.md': 'skills/conversation-coach/references/offline-guides.md', 'practice-journal-template.md': 'templates/practice-journal.md',
    'job-library-template.md': 'templates/job-library.md', 'career-profile-template.md': 'templates/career-profile.md', 'offline-guide-template.html': 'templates/offline-guide-template.html' } }
};
const stage = path.join(DIST, '.skills');
fs.rmSync(stage, { recursive: true, force: true });
for (const [dir, def] of Object.entries(skillRefs)) {
  const sd = path.join(stage, def.name);
  write(path.join(sd, 'SKILL.md'), read(`skills/${dir}/SKILL.md`));
  write(path.join(sd, 'references/core-rules.md'), S.core);
  for (const [to, from] of Object.entries(def.refs)) write(path.join(sd, 'references', to), read(from));
  const zipPath = path.join(OUT, '1-AI-Setup/Claude-Skills', def.name + '.zip');
  fs.mkdirSync(path.dirname(zipPath), { recursive: true });
  execFileSync('zip', ['-qrX', zipPath, def.name], { cwd: stage });
}
fs.rmSync(stage, { recursive: true, force: true });
copy('adapters/About-Claude-Skills.txt', path.join(OUT, '1-AI-Setup/Claude-Skills/About-Claude-Skills.txt'));
log('Claude skill ZIPs');

/* ---------- 3-My-Files, 4-Prompts, 5-Examples ---------- */
for (const f of ['career-profile.md', 'job-library.md', 'practice-journal.md']) copy('templates/' + f, path.join(OUT, '3-My-Files', f));
copy('adapters/About-My-Files.txt', path.join(OUT, '3-My-Files/About-These-Files.txt'));
copy('prompts/starter-prompts.md', path.join(OUT, '4-Prompts/Starter-Prompts.md'));
for (const person of fs.readdirSync(exDir)) {
  const pdir = path.join(exDir, person);
  if (!fs.statSync(pdir).isDirectory()) { copy('examples/' + person, path.join(OUT, '5-Examples', person)); continue; }
  for (const f of fs.readdirSync(pdir)) copy(`examples/${person}/${f}`, path.join(OUT, '5-Examples', person, f));
}
log('Templates, prompts and examples');

/* ---------- Help pages and START HERE (static HTML, no scripts) ---------- */
const DOC_CSS = `body{margin:0;background:#fff;color:#17222d;font:17px/1.6 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif}main{max-width:46rem;margin:0 auto;padding:16px 16px 48px}h1{font-size:1.8rem;line-height:1.2}h2{font-size:1.35rem;margin-top:2rem;border-top:1px solid #d5dde4;padding-top:1rem}h3{font-size:1.1rem}a{color:#1d5f86}code{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:.9em;background:#eef2f5;padding:0 .25em;border-radius:3px}pre{background:#eef2f5;padding:12px;border-radius:6px;white-space:pre-wrap;overflow-wrap:anywhere}pre code{background:none;padding:0}table{border-collapse:collapse;width:100%;font-size:.95rem;display:block;overflow-x:auto}th,td{border:1px solid #d5dde4;padding:6px 8px;text-align:left;vertical-align:top}th{background:#eef2f5}blockquote{margin:1rem 0;padding:.5rem 1rem;border-left:4px solid #2f7d63;background:#eef6f2}img{max-width:100%;border:1px solid #d5dde4;border-radius:6px}li{margin:.3rem 0}@media (prefers-color-scheme:dark){body{background:#10161c;color:#e6ebf0}a{color:#8cc4e8}code,pre,th{background:#1d2731}th,td{border-color:#2c3945}blockquote{background:#15291f}}@media print{body{font-size:11pt;background:#fff;color:#000}main{max-width:none;padding:0}h2{break-after:avoid}pre,blockquote,tr,img{break-inside:avoid}a{color:#000}}`;
const DOC_CSP = "default-src 'none'; style-src 'unsafe-inline'; img-src 'self' data:; base-uri 'none'; form-action 'none'";
function page(title, md, linkMap) {
  const body = render(md, { images: true, mapLink: linkMap });
  return `<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="Content-Security-Policy" content="${DOC_CSP}"><title>${title}</title><style>${DOC_CSS}</style></head><body><main>\n${body}\n</main></body></html>\n`;
}
const helpDocs = fs.readdirSync(path.join(ROOT, 'docs/user')).filter(f => f.endsWith('.md'));
const helpLink = h => {
  const m = h.match(/^(?:\.\.\/)*(?:docs\/user\/)?([A-Za-z0-9-]+)\.md(#.*)?$/);
  if (m && helpDocs.includes(m[1] + '.md')) return m[1] + '.html' + (m[2] || '');
  return h;
};
for (const f of helpDocs) {
  const md = read('docs/user/' + f).replace(/\]\(\.\.\/images\//g, '](images/');
  const title = (md.match(/^#\s+(.*)$/m) || [, 'ShapeShft help'])[1];
  write(path.join(OUT, 'Help', f.replace(/\.md$/, '.html')), page(title + ' - ShapeShft', md, helpLink));
}
for (const img of fs.existsSync(path.join(ROOT, 'docs/images')) ? fs.readdirSync(path.join(ROOT, 'docs/images')) : []) copy('docs/images/' + img, path.join(OUT, 'Help/images', img));
log('Help pages: ' + helpDocs.length);

const startMd = read('START-HERE.md');
const startLink = h => { const m = h.match(/^docs\/user\/([A-Za-z0-9-]+)\.md(#.*)?$/); return m ? 'Help/' + m[1] + '.html' + (m[2] || '') : h; };
const startHtml = page('START HERE - ShapeShft', startMd.replace(/\]\(docs\/images\//g, '](Help/images/'), startLink);
write(path.join(OUT, 'START-HERE.html'), startHtml);
copy('START-HERE.md', path.join(OUT, 'START-HERE.md'));
if (!NO_PDF) {
  if (!fs.existsSync(CHROME)) throw new Error('Google Chrome not found. Set CHROME_PATH, or run with --no-pdf.');
  // Chrome turns relative links into absolute file:// paths, which would expose the build machine's folders
  // and break on every other computer. In the PDF, links to Help pages become plain text instead.
  const pdfHtml = startHtml.replace(/<a href="Help\/([A-Za-z0-9-]+)\.html(?:#[^"]*)?">([\s\S]*?)<\/a>/g, '$2 (in the Help folder: $1.html)');
  const tmp = path.join(DIST, '.start-here-pdf.html');
  fs.writeFileSync(tmp, pdfHtml.replace(/src="Help\/images\//g, `src="${OUT}/Help/images/`));
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--print-to-pdf=' + path.join(OUT, 'START-HERE.pdf'), 'file://' + tmp], { stdio: 'ignore' });
  fs.rmSync(tmp);
  if (!fs.existsSync(path.join(OUT, 'START-HERE.pdf'))) throw new Error('START-HERE.pdf was not created.');
  if (/file:\/\/|\/Users\/|[A-Z]:\\\\/.test(fs.readFileSync(path.join(OUT, 'START-HERE.pdf')).toString('latin1'))) throw new Error('START-HERE.pdf contains a local file path.');
  log('START-HERE.pdf');
}

/* ---------- legal ---------- */
copy('LICENSE', path.join(OUT, 'LICENSE.txt'));
copy('THIRD-PARTY-NOTICES.md', path.join(OUT, 'THIRD-PARTY-NOTICES.txt'));
copy('adapters/READ-ME-FIRST.txt', path.join(OUT, 'READ-ME-FIRST.txt'));

/* ---------- ZIP ---------- */
execFileSync('zip', ['-qrX', NAME + '.zip', NAME, '-x', '*.DS_Store'], { cwd: DIST });
const size = fs.statSync(path.join(DIST, NAME + '.zip')).size;
console.log(`Done: dist/${NAME}.zip (${(size / 1024 / 1024).toFixed(2)} MB)`);
