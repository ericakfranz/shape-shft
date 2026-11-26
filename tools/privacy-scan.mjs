// Scans the repository (and the latest build, if present) for personal information.
// Usage: node tools/privacy-scan.mjs
// Exit code 1 if anything is found. Also used by tests/run.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const PRIVATE = path.join(ROOT, 'tools/private-terms.local.txt');
const SKIP_DIRS = new Set(['.git', 'node_modules', '.claude', 'private']); // private/ is ignored by Git and never published
const SKIP_FILES = new Set(['tools/private-terms.local.txt']);
const VENDOR = /^workbench\/vendor\//;
const TEXT = /\.(md|txt|html|js|mjs|json|yml|yaml|css|gitignore)$|^(LICENSE|VERSION)$/;

function files(dir, rel = '') {
  let out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const r = rel ? rel + '/' + e.name : e.name;
    if (e.isDirectory()) out = out.concat(files(path.join(dir, e.name), r));
    else if (!SKIP_FILES.has(r)) out.push(r);
  }
  return out;
}

/* A term matches only as a whole word, so a short name does not match inside a longer word. */
const wordRe = t => new RegExp('(^|[^a-z0-9])' + t.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '($|[^a-z0-9])');

function zipEntries(zip) {
  try { return execFileSync('unzip', ['-Z1', zip], { encoding: 'utf8' }).split('\n').filter(Boolean); } catch { return []; }
}

export function scan() {
  const lines = fs.existsSync(PRIVATE)
    ? fs.readFileSync(PRIVATE, 'utf8').split('\n').map(s => s.trim()).filter(s => s && !s.startsWith('#'))
    : [];
  const terms = lines.filter(s => !s.startsWith('!'));
  const allowed = new Set(lines.filter(s => s.startsWith('!')).map(s => s.slice(1).trim()));
  const findings = [];
  const add = (file, what) => findings.push(`${file}: ${what}`);
  const all = files(ROOT);
  for (const f of all) {
    const base = path.basename(f);
    if (!TEXT.test(base) && !TEXT.test(f)) {
      if (/\.(png|jpe?g|pdf|zip)$/i.test(f)) continue;
      continue;
    }
    if (f.startsWith('dist/') && f.endsWith('.zip')) continue;
    const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
    const lower = s.toLowerCase();
    if (!allowed.has(f) && !allowed.has(base)) for (const t of terms) if (wordRe(t).test(lower)) add(f, `private term "${t.slice(0, 3)}..." (see tools/private-terms.local.txt)`);
    if (VENDOR.test(f) || /\.min\.js$/.test(f)) continue;
    // Built tools include the third-party libraries, whose credits name their authors. Check only ShapeShft's own code.
    const own = s.replace(/<script>\/\* (jspdf\.umd|pdf-lib)\.min\.js[\s\S]*?<\/script>/g, '');
    for (const m of own.matchAll(/[A-Za-z0-9._%+-]+@([A-Za-z0-9.-]+\.[A-Za-z]{2,})/g)) {
      const domain = m[1].toLowerCase();
      if (/(^|\.)example\.(com|org)$/.test(domain) || domain === 'anthropic.com') continue;
      add(f, `email address with domain ${domain}`);
    }
    for (const m of own.matchAll(/(?<![\d.\w-])\(?(\d{3})\)?[-. ](\d{3})[-. ](\d{4})(?![\d-])/g)) {
      if (m[2] === '555' || m[1] === '555') continue;
      add(f, `phone-like number ending ${m[3]}`);
    }
    if (/(sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY-----)/.test(s)) add(f, 'something that looks like a secret key');
    if (/claude\.ai\/(code\/)?artifact\//.test(s)) add(f, 'a link to a private Claude artifact');
  }
  // Release ZIPs: check file names for anything personal or unexpected.
  const dist = path.join(ROOT, 'dist');
  if (fs.existsSync(dist)) {
    for (const z of fs.readdirSync(dist).filter(n => n.endsWith('.zip'))) {
      for (const e of zipEntries(path.join(dist, z))) {
        if (/\.DS_Store|__MACOSX|\.local\.|private-terms/i.test(e)) add(`dist/${z}`, `unexpected entry ${e}`);
        for (const t of terms) if (e.toLowerCase().includes(t.toLowerCase())) add(`dist/${z}`, 'entry name contains a private term');
      }
    }
  }
  return { findings, termsChecked: terms.length, filesChecked: all.length };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const r = scan();
  if (!r.termsChecked) console.log('Note: tools/private-terms.local.txt not found. Only the general checks ran.');
  if (r.findings.length) { console.log('Possible personal information found:'); r.findings.forEach(f => console.log('  ' + f)); process.exit(1); }
  console.log(`Privacy scan passed: ${r.filesChecked} files, ${r.termsChecked} private terms, plus email, phone and secret checks.`);
}
