// ShapeShft automated tests. Usage: node tests/run.mjs
// Runs without a browser and without network access. Checks the built release too, if dist/ exists.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { validateWorkbench } from '../tools/lib/validate-workbench.mjs';
import { slug } from '../tools/lib/md.mjs';
import { scan } from '../tools/privacy-scan.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const require = createRequire(import.meta.url);
const Guide = require(path.join(ROOT, 'coach/src/guide-format.js'));
const read = p => fs.readFileSync(path.join(ROOT, p), 'utf8');
let passed = 0, failed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('  ok   ' + name); }
  catch (e) { failed++; console.log('  FAIL ' + name + '\n       ' + e.message); }
}
const assert = (c, m) => { if (!c) throw new Error(m || 'assertion failed'); };
const eq = (a, b, m) => assert(JSON.stringify(a) === JSON.stringify(b), `${m || 'not equal'}: got ${JSON.stringify(a)}, expected ${JSON.stringify(b)}`);
const exampleJson = fs.readdirSync(path.join(ROOT, 'examples'), { recursive: true }).filter(f => /application-.*\.json$/.test(f)).map(f => 'examples/' + f);

console.log('\nWorkbench JSON examples');
test('there are example applications', () => assert(exampleJson.length >= 2));
for (const f of exampleJson) {
  test(`${f} passes the specification validator`, () => {
    const r = validateWorkbench(read(f));
    assert(!r.errors.length, r.errors.join('; '));
    assert(!r.warnings.length, r.warnings.join('; '));
  });
  test(`${f} keeps the complete posting from the job library`, () => {
    const o = JSON.parse(read(f));
    const lib = read(path.dirname(f) + '/job-library.md');
    assert(lib.includes(o.posting.split('\n')[0]) && lib.includes(o.posting.slice(-60)), 'posting does not match the job library');
  });
}
test('validator rejects broken files', () => {
  assert(validateWorkbench('{"summary":"x"').errors.length, 'invalid JSON accepted');
  assert(validateWorkbench({ summary: 'x', skills: [] }).errors.some(e => e.includes('"exp"')), 'missing exp accepted');
  assert(validateWorkbench({ summary: 'x', skills: [], exp: [{ title: 'A', org: 'B', start: '01/2020', end: '01/2021', bullets: [] }], map: [{ req: 'r', status: 'unconfirmed' }] }).errors.some(e => e.includes('status')), 'bad map status accepted');
  assert(validateWorkbench({ summary: 'café', skills: [], exp: [] }).errors.some(e => e.includes('Non-ASCII')), 'non-ASCII accepted');
  assert(validateWorkbench({ summary: 'x', skills: [], exp: [
    { title: 'Old', org: 'B', start: '01/2010', end: '01/2012', bullets: [] },
    { title: 'New', org: 'B', start: '01/2015', end: '01/2020', bullets: [] }] }).errors.some(e => e.includes('newest first')), 'wrong order accepted');
});

console.log('\nWorkbench check code (the real code from workbench/src/workbench.html)');
const wbSrc = read('workbench/src/workbench.html');
const logic = wbSrc.split('/*LOGIC_START*/')[1].split('/*LOGIC_END*/')[0];
const ctx = vm.createContext({ console });
vm.runInContext(logic + '\n;globalThis.__wb={normalizeResume,normalizeLetter,setCheckConfig,runChecks,runLetterChecks,toPlain,STARTER,groupsOf};', ctx);
const W = ctx.__wb;
const checksFor = o => { const r = W.normalizeResume(o); W.setCheckConfig(r); return W.runChecks(Object.assign({}, r, { meta: r.meta }), o.posting || '', null); };
test('the fictional starter resume has no FIX items', () => eq(checksFor(W.STARTER).errors.map(e => e.id), []));
for (const f of exampleJson) {
  test(`${f} has no FIX items and no warnings in the Workbench`, () => {
    const c = checksFor(JSON.parse(read(f)));
    eq(c.errors.map(e => e.msg), [], 'errors');
    eq(c.warnings.map(e => e.msg), [], 'warnings');
  });
  test(`${f} letter has no FIX items or warnings in the Workbench`, () => {
    const o = JSON.parse(read(f)), r = W.normalizeResume(o); W.setCheckConfig(r);
    const lc = W.runLetterChecks(W.normalizeLetter(o.letter), r, o.posting, o.meta, null);
    eq(lc.errors.map(e => e.msg), [], 'errors'); eq(lc.warnings.map(e => e.msg), [], 'warnings');
  });
}
const morgan = JSON.parse(read('examples/morgan-ellery/application-larkspur-operations-manager.json'));
const clone = o => JSON.parse(JSON.stringify(o));
test('a "do not claim" term on the resume is a FIX item', () => {
  const o = clone(morgan); o.exp[0].bullets.push('Managed inventory in SAP for the whole site.');
  assert(checksFor(o).errors.some(e => e.id === 'banned' && /SAP/.test(e.msg)));
});
test('a "do not claim" term inside another word is not flagged', () => {
  const o = clone(morgan); o.exp[0].bullets[0] = 'Reduced inventory discrepancies with a sapling-simple checklist.';
  assert(!checksFor(o).errors.some(e => e.id === 'banned'));
});
test('a placeholder is a FIX item', () => {
  const o = clone(morgan); o.summary = 'Excited to join [Company].';
  assert(checksFor(o).errors.some(e => e.id === 'lplace'));
});
test('an unconfirmed number is a warning', () => {
  const o = clone(morgan); o.exp[0].bullets[0] = 'Cut discrepancies by 65% in six months.';
  assert(checksFor(o).warnings.some(e => e.id === 'nums' && e.msg.includes('65')));
});
test('without confirmedNumbers the number check is off (format 1 files)', () => {
  const o = clone(morgan); delete o.checks; o.exp[0].bullets[0] = 'Cut discrepancies by 65% in six months.';
  assert(!checksFor(o).warnings.some(e => e.id === 'nums'));
});
test('a format 1 file (no edu, no checks) normalizes and checks without errors', () => {
  const o = clone(morgan); delete o.edu; delete o.checks;
  const r = W.normalizeResume(o); eq(r.edu, []); eq(r.checks.doNotClaim, []);
  eq(checksFor(o).errors.map(e => e.id), []);
});
test('present tense in a past role is a warning, but not in a current role', () => {
  const o = clone(morgan); o.exp[1].bullets[0] = 'Lead cycle counts across the site.';
  assert(checksFor(o).warnings.some(e => e.id === 'ptense'));
  const t = JSON.parse(read('examples/teresa-halvorsen/application-kestrel-service-manager.json'));
  assert(!checksFor(t).warnings.some(e => e.id === 'ptense'));
});
test('a contact line with neither email nor phone is a FIX item', () => {
  const o = clone(morgan); o.contact = 'Riverside Falls, OH';
  assert(checksFor(o).errors.some(e => e.id === 'contact'));
});
test('generic filler is a warning', () => {
  const o = clone(morgan); o.summary = 'Results-driven supervisor. ' + o.summary;
  assert(checksFor(o).warnings.some(e => e.id === 'watch'));
});
test('text is normalized to ASCII on load', () => {
  const r = W.normalizeResume(Object.assign(clone(morgan), { summary: '“Smart” quotes — and café' }));
  eq(r.summary, '"Smart" quotes - and cafe');
});
test('education prints in the ATS plain text', () => assert(W.toPlain(W.normalizeResume(morgan)).includes('Education\nHigh school diploma, Riverside Falls High School | 2012')));

console.log('\nOffline guide format');
const guideSources = fs.readdirSync(path.join(ROOT, 'examples'), { recursive: true }).filter(f => /guide-.*\.txt$/.test(f)).map(f => 'examples/' + f);
test('there are example guides', () => assert(guideSources.length >= 4));
for (const f of guideSources) {
  test(`${f} builds, passes the safety check and matches the committed HTML`, () => {
    const html = Guide.build(read(f), { generated: 'the example date' });
    eq(Guide.check(html), []);
    assert(html === read(f.replace(/\.txt$/, '.html')), 'the committed .html is out of date; run node tools/build.mjs');
    assert(/talking out loud to yourself/.test(html), 'missing the speak-out-loud instruction');
    assert(/Stop somewhere safe/.test(html), 'missing the walk safety note');
  });
}
test('hostile text is escaped and produces no active content', () => {
  const evil = 'Title: <script>alert(1)</script>\n# A <img src=x onerror=alert(1)>\n- <a href="javascript:alert(1)">x</a>\n> <iframe src="https://evil.example"></iframe>\n! <style>@import url(https://evil.example/x.css)</style>\n::: closed <svg onload=alert(1)>\n[link](https://evil.example)\n:::\n';
  const html = Guide.build(evil);
  eq(Guide.check(html), []);
  assert(!/<script|<img|<iframe|<svg|<a href="javascript/i.test(html), 'markup leaked through');
});
test('the checker catches unsafe HTML', () => {
  const ok = Guide.build('Title: T\n# S\nText');
  const cases = {
    script: ok.replace('</main>', '<script>x()</script></main>'),
    handler: ok.replace('<main>', '<main onclick="x()">'),
    externalLink: ok.replace('</main>', '<a href="https://example.com">x</a></main>'),
    jsLink: ok.replace('</main>', '<a href="javascript:x()">x</a></main>'),
    image: ok.replace('</main>', '<img src="https://example.com/x.png"></main>'),
    cssImport: ok.replace('<style>', '<style>@import "https://example.com/x.css";'),
    noCsp: ok.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/, ''),
    styleAttr: ok.replace('<main>', '<main style="background:url(https://example.com/x)">')
  };
  for (const [k, h] of Object.entries(cases)) assert(Guide.check(h).length, 'not caught: ' + k);
});
test('plain web addresses in guide text are allowed as text', () => eq(Guide.check(Guide.build('Title: T\n# S\nSee https://example.com for the posting.')), []));
test('an empty guide is refused', () => { let e; try { Guide.build('   '); } catch (x) { e = x; } assert(e); });
test('the offline guide template is current and passes', () => {
  const html = Guide.build(read('templates/offline-guide-template.txt'), { generated: '(date)' });
  eq(Guide.check(html), []); assert(html === read('templates/offline-guide-template.html'), 'template HTML out of date');
});
test('important content is not hidden: closed boxes are only used for recall or extras', () => {
  for (const f of guideSources) {
    const doc = Guide.parse(read(f));
    doc.sections.forEach(s => s.blocks.filter(b => b.type === 'closed').forEach(b => assert(/fact|open after|recall/i.test(b.title), `${f}: closed box "${b.title}"`)));
  }
});

console.log('\nAI instructions');
const skillDirs = ['onboarding', 'career-discovery', 'resume-tailoring', 'conversation-coach'];
for (const d of skillDirs) {
  test(`skills/${d}/SKILL.md has valid frontmatter`, () => {
    const s = read(`skills/${d}/SKILL.md`);
    const fm = s.match(/^---\nname: ([^\n]+)\ndescription: ([^\n]+)\n---\n/);
    assert(fm, 'missing frontmatter');
    assert(/^[a-z0-9-]{1,64}$/.test(fm[1]), 'bad name');
    assert(fm[2].length <= 1024, 'description too long');
    assert(s.includes('core rules'), 'does not point to the core rules');
  });
}
test('the Conversation Coach makes speaking out loud central', () => {
  const all = ['SKILL.md', 'references/practice-sessions.md', 'references/offline-guides.md', 'references/interview-prep.md'].map(f => read('skills/conversation-coach/' + f)).join('\n');
  assert((all.match(/out loud/gi) || []).length >= 20, 'too few out-loud instructions');
  assert(/never claim you heard/i.test(all), 'missing the rule about not claiming to hear practice');
});
test('the core rules forbid fabrication and promises', () => {
  const c = read('skills/_shared/core-rules.md');
  ['Never invent a professional fact', 'Never silently turn an interpretation into a fact', 'Do not promise interviews', '**complete** updated file'].forEach(t => assert(c.includes(t), 'missing: ' + t));
});
test('every starter prompt required by the specification is present', () => {
  const p = read('prompts/starter-prompts.md');
  ['Initial setup', 'Start Career Discovery', 'Update my Career Profile', 'Tailor an application', 'Revise an application', 'Fix JSON', 'Start Conversation Coaching', "Today's spoken practice", 'Practice with a specific job', 'Seven-day offline', 'Prepare for a specific interview', 'Questions to ask', 'After an interview', 'Compare opportunities', 'Update my Practice Journal', 'new chat'].forEach(t => assert(p.includes(t), 'missing prompt: ' + t));
});

console.log('\nDocumentation links');
const mdFiles = fs.readdirSync(ROOT, { recursive: true }).filter(f => f.endsWith('.md') && !f.startsWith('dist') && !f.startsWith('.git') && !f.startsWith('node_modules'));
test('every relative link and anchor in the documentation resolves', () => {
  const problems = [];
  for (const f of mdFiles) {
    const s = read(f).replace(/```[\s\S]*?```/g, '');
    for (const m of s.matchAll(/\]\(([^)\s]+)\)/g)) {
      const href = m[1];
      if (/^(https?:|mailto:)/.test(href) || href.startsWith('../../releases')) continue;
      const [p, anchor] = href.split('#');
      const target = p ? path.join(path.dirname(path.join(ROOT, f)), p) : path.join(ROOT, f);
      if (!fs.existsSync(target)) { problems.push(`${f} -> ${href}`); continue; }
      if (anchor && target.endsWith('.md')) {
        const slugs = (fs.readFileSync(target, 'utf8').match(/^#{1,6} .*$/gm) || []).map(h => slug(h.replace(/^#+ /, '')));
        if (!slugs.includes(anchor)) problems.push(`${f} -> ${href} (anchor)`);
      }
    }
  }
  eq(problems, []);
});

console.log('\nPrivacy');
test('the privacy scan finds no personal information', () => {
  const r = scan();
  eq(r.findings, []);
  if (!r.termsChecked) console.log('       (note: no private term list on this machine; only general checks ran)');
});

const version = read('VERSION').trim();
const dist = path.join(ROOT, 'dist', 'ShapeShft-' + version);
if (fs.existsSync(dist)) {
  console.log('\nBuilt release (dist/)');
  const tools = ['ShapeShft-Resume-Workbench.html', 'ShapeShft-Practice-Guide-Builder.html'].map(f => fs.readFileSync(path.join(dist, '2-Tools', f), 'utf8'));
  test('the release tools load nothing from outside the file and have a Content Security Policy', () => {
    for (const h of tools) {
      const outside = h.replace(/<script>[\s\S]*?<\/script>/g, '');
      assert(!/<script\s+src=|<link\b|@import|https?:\/\/fonts/i.test(outside), 'external resource');
      assert(/http-equiv="Content-Security-Policy" content="default-src 'none';[^"]*connect-src 'none'/.test(h), 'missing CSP');
    }
  });
  test('the release ZIP has the expected layout and no stray files', () => {
    const entries = execFileSync('unzip', ['-Z1', path.join(ROOT, 'dist', `ShapeShft-${version}.zip`)], { encoding: 'utf8' }).split('\n').filter(Boolean);
    const need = ['START-HERE.pdf', 'START-HERE.html', 'READ-ME-FIRST.txt', 'LICENSE.txt', 'THIRD-PARTY-NOTICES.txt', '1-AI-Setup/ShapeShft-AI-Instructions.md', '1-AI-Setup/Project-Instructions.txt',
      '1-AI-Setup/Claude-Skills/shapeshft-conversation-coach.zip', '2-Tools/ShapeShft-Resume-Workbench.html', '2-Tools/ShapeShft-Practice-Guide-Builder.html',
      '3-My-Files/career-profile.md', '3-My-Files/job-library.md', '3-My-Files/practice-journal.md', '4-Prompts/Starter-Prompts.md', 'Help/troubleshooting.html', 'Help/images/workbench.png'];
    need.forEach(n => assert(entries.includes(`ShapeShft-${version}/${n}`), 'missing ' + n));
    assert(!entries.some(e => /\.DS_Store|__MACOSX|\.local\.|tools\/|tests\/|node_modules/.test(e)), 'stray file');
  });
  test('the combined AI instructions contain every part and no unresolved references', () => {
    const c = fs.readFileSync(path.join(dist, '1-AI-Setup/ShapeShft-AI-Instructions.md'), 'utf8');
    ['ShapeShft core rules', 'ShapeShft onboarding and routing', 'ShapeShft Career Discovery', 'ShapeShft Resume Builder', 'Resume Workbench JSON specification', 'ShapeShft Conversation Coach', 'Practice sessions', 'Interview preparation', 'Offline practice guides', 'Template: career-profile.md'].forEach(t => assert(c.includes(t), 'missing ' + t));
    assert(!/combined instructions\)|^name: shapeshft/m.test(c), 'unresolved reference or frontmatter');
  });
  test('each Claude skill ZIP has one folder with SKILL.md and the core rules', () => {
    for (const z of fs.readdirSync(path.join(dist, '1-AI-Setup/Claude-Skills')).filter(f => f.endsWith('.zip'))) {
      const e = execFileSync('unzip', ['-Z1', path.join(dist, '1-AI-Setup/Claude-Skills', z)], { encoding: 'utf8' }).split('\n').filter(Boolean);
      const name = z.replace('.zip', '');
      assert(e.includes(`${name}/SKILL.md`) && e.includes(`${name}/references/core-rules.md`), z);
      assert(e.every(x => x.startsWith(name + '/')), z + ' has files outside its folder');
    }
  });
  test('no built file (including the PDF) contains a local file path from the build machine', () => {
    const bad = fs.readdirSync(dist, { recursive: true }).filter(f => !f.endsWith('.zip') && fs.statSync(path.join(dist, f)).isFile())
      .filter(f => /file:\/\/\/|\/Users\/[a-z]|\/home\/[a-z]|[A-Z]:\\Users\\/.test(fs.readFileSync(path.join(dist, f)).toString('latin1')));
    eq(bad, []);
  });
  test('help pages contain no scripts', () => {
    for (const f of fs.readdirSync(path.join(dist, 'Help')).filter(f => f.endsWith('.html'))) assert(!/<script/i.test(fs.readFileSync(path.join(dist, 'Help', f), 'utf8')), f);
  });
} else console.log('\n(dist/ not built; release checks skipped. Run node tools/build.mjs first.)');

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
