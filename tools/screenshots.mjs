// Takes the documentation screenshots from the built tools with headless Chrome.
// Run after `node tools/build.mjs`. Writes docs/images/workbench.png and docs/images/guide-builder.png.
// These are real screenshots of ShapeShft's own tools showing fictional example data.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const VERSION = fs.readFileSync(path.join(ROOT, 'VERSION'), 'utf8').trim();
const TOOLS = path.join(ROOT, 'dist', `ShapeShft-${VERSION}`, '2-Tools');
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT = path.join(ROOT, 'docs/images');
fs.mkdirSync(OUT, { recursive: true });

const shots = [
  { file: 'ShapeShft-Resume-Workbench.html', out: 'workbench.png', size: '1400,900' },
  { file: 'ShapeShft-Practice-Guide-Builder.html', out: 'guide-builder.png', size: '1000,880' }
];
for (const s of shots) {
  const src = path.join(TOOLS, s.file);
  if (!fs.existsSync(src)) throw new Error('Build first: ' + src);
  const profile = fs.mkdtempSync(path.join(ROOT, 'dist', '.chrome-'));
  execFileSync(CHROME, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--user-data-dir=${profile}`, '--force-color-profile=srgb', '--blink-settings=preferredColorScheme=1', '--virtual-time-budget=3000', `--window-size=${s.size}`, `--screenshot=${path.join(OUT, s.out)}`, 'file://' + src], { stdio: 'ignore' });
  fs.rmSync(profile, { recursive: true, force: true });
  console.log('Saved docs/images/' + s.out);
}
