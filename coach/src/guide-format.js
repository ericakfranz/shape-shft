/* ShapeShft offline guide format.
   Converts "guide text" written by an AI assistant into one self-contained HTML file with no JavaScript.
   Every piece of text is escaped. The only markup that comes out is the markup this file writes.
   Used by the Practice Guide Builder page and by the build and test tools, so there is one implementation. */
(function (root) {
  'use strict';

  const VERSION = '1.0';
  const MAX_SOURCE = 400000;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /* Inline formatting after escaping: **bold** and *italic*. Nothing else. Links are never created. */
  function inline(s) {
    return esc(s)
      .replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?=[^*\w]|$)/g, '$1<em>$2</em>');
  }

  /* Remove control characters and invisible direction marks that could disguise text. */
  function clean(src) {
    return String(src == null ? '' : src)
      .replace(/\r\n?/g, '\n')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮⁦-⁩﻿]/g, '');
  }

  const HEADER_KEYS = { title: 'title', subtitle: 'subtitle', for: 'forName', date: 'date', level: 'level', time: 'time' };

  function parse(src) {
    const lines = clean(src).split('\n');
    const meta = { title: '', subtitle: '', forName: '', date: '', level: '', time: '' };
    let i = 0;
    while (i < lines.length && !lines[i].trim()) i++;
    for (; i < lines.length; i++) {
      const m = lines[i].match(/^\s*(title|subtitle|for|date|level|time)\s*:\s*(.*)$/i);
      if (!m) break;
      meta[HEADER_KEYS[m[1].toLowerCase()]] = m[2].trim();
    }
    const sections = [];
    let cur = null;
    const stack = [];
    const blocksOf = () => {
      if (stack.length) return stack[stack.length - 1].blocks;
      if (!cur) { cur = { title: '', blocks: [] }; sections.push(cur); }
      return cur.blocks;
    };
    let para = null, list = null;
    const flush = () => { para = null; list = null; };
    for (; i < lines.length; i++) {
      const raw = lines[i], t = raw.trim();
      if (!t) { flush(); continue; }
      let m;
      if ((m = t.match(/^:::\s*(open|closed|example)\b\s*(.*)$/i))) {
        flush();
        const box = { type: m[1].toLowerCase(), title: m[2].trim(), blocks: [] };
        blocksOf().push(box); stack.push(box); continue;
      }
      if (t === ':::') { flush(); if (stack.length) stack.pop(); continue; }
      if ((m = t.match(/^#\s+(.*)$/))) {
        flush(); stack.length = 0;
        cur = { title: m[1].trim(), blocks: [] }; sections.push(cur); continue;
      }
      if ((m = t.match(/^##\s+(.*)$/))) { flush(); blocksOf().push({ type: 'h3', text: m[1].trim() }); continue; }
      if (/^-{3,}$/.test(t)) { flush(); blocksOf().push({ type: 'hr' }); continue; }
      if ((m = t.match(/^>\s?(.*)$/))) { flush(); blocksOf().push({ type: 'say', text: m[1].trim() }); continue; }
      if ((m = t.match(/^!\s?(.*)$/))) { flush(); blocksOf().push({ type: 'note', text: m[1].trim() }); continue; }
      if ((m = t.match(/^[-*]\s+(.*)$/)) || (m = t.match(/^(\d+)[.)]\s+(.*)$/))) {
        const ordered = /^\d/.test(t), text = ordered ? m[2] : m[1];
        para = null;
        if (!list || list.ordered !== ordered) { list = { type: 'list', ordered, items: [] }; blocksOf().push(list); }
        list.items.push(text.trim()); continue;
      }
      if (list && /^\s{2,}\S/.test(raw)) { list.items[list.items.length - 1] += ' ' + t; continue; }
      list = null;
      if (para) para.text += ' ' + t;
      else { para = { type: 'p', text: t }; blocksOf().push(para); }
    }
    return { meta, sections: sections.filter(s => s.title || s.blocks.length) };
  }

  function renderBlocks(blocks) {
    return blocks.map(b => {
      switch (b.type) {
        case 'p': return `<p>${inline(b.text)}</p>`;
        case 'h3': return `<h3>${inline(b.text)}</h3>`;
        case 'hr': return '<hr>';
        case 'say': return `<blockquote class="say"><p>${inline(b.text)}</p></blockquote>`;
        case 'note': return `<p class="note">${inline(b.text)}</p>`;
        case 'list': {
          const tag = b.ordered ? 'ol' : 'ul';
          return `<${tag}>${b.items.map(x => `<li>${inline(x)}</li>`).join('')}</${tag}>`;
        }
        case 'example':
          return `<div class="example"><p class="example-label">${b.title ? inline(b.title) + ' - ' : ''}Example only. Use your own words.</p>${renderBlocks(b.blocks)}</div>`;
        case 'open': case 'closed':
          return `<details${b.type === 'open' ? ' open' : ''}><summary>${inline(b.title || 'More')}</summary><div class="details-body">${renderBlocks(b.blocks)}</div></details>`;
        default: return '';
      }
    }).join('\n');
  }

  const START_SECTION = {
    title: 'How to use this guide',
    blocks: [
      { type: 'note', text: '**The practice is talking out loud to yourself.** Read a prompt, then start speaking. Reading, thinking or writing alone is not the exercise.' },
      { type: 'list', ordered: false, items: [
        'You do not need to sound polished. Stumbling, pausing, repeating yourself and going off on tangents are all part of it.',
        'Keep talking even if you are not sure where the story is going yet.',
        'If you lose your train of thought, stop for a moment, then keep going. There is a list of ways to restart at the end.',
        'Keep this guide open and look at it as often as you need. You do not need to remember any of it.',
        'If you can, take the practice outside for an easy walk somewhere you feel comfortable talking to yourself. **Stop somewhere safe before you read your phone.** Practicing at home, sitting or standing, works just as well.',
        'Afterward, tell your AI coach what you remembered and where you got stuck.'
      ] }
    ]
  };

  const STUCK_SECTION = {
    title: 'If you get stuck',
    blocks: [
      { type: 'p', text: 'Pick any of these and say it out loud. Then keep going. They are tools for thinking, not scripts.' },
      { type: 'list', ordered: false, items: [
        '"The reason that mattered was..."',
        '"What led me to that decision was..."',
        '"What made that especially hard was..."',
        '"What that meant for the people involved was..."',
        '"My part in it was..."',
        '"Looking back, I think..."',
        '"Another way I could have handled it was..."',
        '"That reminds me of another time when..."',
        '"The main point I am trying to make is..."'
      ] },
      { type: 'h3', text: 'Ways to restart' },
      { type: 'list', ordered: false, items: [
        'Pause. Take a breath. You do not need to apologize.',
        'Start the story again from a different point, for example from the end.',
        'Ask yourself a question out loud: "Why did that matter?"',
        'Describe one small detail: a place, a person, a sound, a tool.',
        'Say the same idea in different words.'
      ] }
    ]
  };

  const CSS = `
:root{color-scheme:light dark;--bg:#f4f6f8;--card:#ffffff;--ink:#17222d;--muted:#4f5f6f;--line:#d5dde4;--accent:#1d5f86;--say-bg:#eef6f2;--say-line:#2f7d63;--note-bg:#fff3d9;--note-line:#a86b00;--ex-bg:#f1f1f6;--ex-line:#6b6b8f}
@media (prefers-color-scheme:dark){:root{--bg:#10161c;--card:#18212a;--ink:#e6ebf0;--muted:#a3b0bd;--line:#2c3945;--accent:#8cc4e8;--say-bg:#15291f;--say-line:#6cc5a0;--note-bg:#2e2410;--note-line:#e0b25a;--ex-bg:#1e1f2b;--ex-line:#a3a3d1}}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font:1.125rem/1.6 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;overflow-wrap:break-word}
header,main,footer{max-width:46rem;margin:0 auto;padding:1rem}
header{padding-top:1.5rem}
h1{font-size:1.75rem;line-height:1.2;margin:.25rem 0 .5rem}
h2{font-size:1.4rem;line-height:1.25;margin:0 0 .75rem}
h3{font-size:1.15rem;margin:1.25rem 0 .5rem}
p,ul,ol{margin:.5rem 0 1rem}
li{margin:.4rem 0}
.sub{color:var(--muted);margin:0 0 .25rem}
.meta{color:var(--muted);font-size:1rem;margin:0}
nav{margin:1rem 0 0}
nav h2{font-size:1rem;color:var(--muted);margin:0 0 .5rem}
nav ol{list-style:none;padding:0;margin:0;display:grid;gap:.5rem}
nav a{display:block;min-height:2.75rem;padding:.6rem .9rem;background:var(--card);border:1px solid var(--line);border-radius:.6rem;color:var(--accent);text-decoration:none;font-weight:600}
a:focus-visible,summary:focus-visible{outline:3px solid var(--accent);outline-offset:2px}
section{background:var(--card);border:1px solid var(--line);border-radius:.9rem;padding:1.1rem 1.1rem .4rem;margin:0 0 1.1rem;scroll-margin-top:.5rem}
.top{display:inline-block;margin:.25rem 0 .9rem;font-size:1rem;color:var(--accent)}
blockquote.say{margin:.75rem 0;padding:.6rem 1rem;background:var(--say-bg);border-left:.3rem solid var(--say-line);border-radius:.4rem}
blockquote.say p{margin:.2rem 0;font-weight:500}
.note{background:var(--note-bg);border-left:.3rem solid var(--note-line);padding:.7rem 1rem;border-radius:.4rem}
.example{background:var(--ex-bg);border-left:.3rem solid var(--ex-line);padding:.5rem 1rem;border-radius:.4rem;margin:.75rem 0 1rem}
.example-label{font-size:.95rem;font-weight:700;color:var(--muted);margin:.4rem 0}
details{border:1px solid var(--line);border-radius:.6rem;margin:.75rem 0 1rem;background:var(--card)}
summary{cursor:pointer;min-height:2.75rem;padding:.6rem .9rem;font-weight:600;color:var(--accent)}
.details-body{padding:0 1rem .25rem}
hr{border:0;border-top:1px solid var(--line);margin:1.25rem 0}
footer{color:var(--muted);font-size:.95rem;padding-bottom:2rem}
@media (min-width:40rem){body{font-size:1.15rem}nav ol{grid-template-columns:1fr 1fr}section{padding:1.5rem 1.6rem .6rem}}
@media print{
  :root{--bg:#fff;--card:#fff;--ink:#000;--muted:#333;--line:#999;--accent:#000;--say-bg:#fff;--note-bg:#fff;--ex-bg:#fff}
  body{font-size:11pt;background:#fff;color:#000}
  header,main,footer{max-width:none;padding:0}
  nav,.top{display:none}
  section{border:0;border-top:1px solid #999;border-radius:0;padding:.5rem 0;break-inside:auto}
  h2,h3,summary{break-after:avoid}
  blockquote.say,.note,.example{break-inside:avoid}
}`;

  const CSP = "default-src 'none'; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none'";

  function build(src, opts) {
    opts = Object.assign({ start: true, stuck: true, generated: '' }, opts || {});
    src = String(src == null ? '' : src);
    if (src.length > MAX_SOURCE) throw new Error('The guide text is too long. Ask your AI assistant for a shorter guide, or split it into two guides.');
    const doc = parse(src);
    if (!doc.sections.length) throw new Error('The guide text is empty.');
    const m = doc.meta;
    const title = m.title || 'Practice guide';
    const sections = (opts.start ? [START_SECTION] : []).concat(doc.sections, opts.stuck ? [STUCK_SECTION] : []);
    const nav = sections.map((s, n) => s.title ? `<li><a href="#s${n + 1}">${inline(s.title)}</a></li>` : '').join('');
    const facts = [m.forName && `Prepared for ${inline(m.forName)}`, m.date && inline(m.date), m.level && `Support level: ${inline(m.level)}`, m.time && `Time: ${inline(m.time)}`].filter(Boolean).join(' &middot; ');
    const body = sections.map((s, n) =>
      `<section id="s${n + 1}">${s.title ? `<h2>${inline(s.title)}</h2>` : ''}\n${renderBlocks(s.blocks)}\n<a class="top" href="#contents">Back to contents</a></section>`
    ).join('\n');
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${CSP}">
<meta name="referrer" content="no-referrer">
<meta name="robots" content="noindex, nofollow">
<meta name="generator" content="ShapeShft offline guide ${VERSION}">
<title>${esc(title)}</title>
<style>${CSS}
</style>
</head>
<body>
<header>
<p class="meta">ShapeShft Conversation Coach</p>
<h1>${inline(title)}</h1>
${m.subtitle ? `<p class="sub">${inline(m.subtitle)}</p>` : ''}
${facts ? `<p class="meta">${facts}</p>` : ''}
<nav id="contents" aria-label="Contents"><h2>Contents</h2><ol>${nav}</ol></nav>
</header>
<main>
${body}
</main>
<footer>
<p>This guide is a snapshot made${opts.generated ? ' on ' + esc(opts.generated) : ''} from your ShapeShft files. Your Career Profile is the up-to-date record. When you remember something new, tell your AI coach so it can be added there.</p>
<p>This file contains personal career information. Keep it private, and delete it when you no longer need it. It works offline and contains no code.</p>
</footer>
</body>
</html>
`;
  }

  /* Checks a finished HTML file against the offline rules. Returns a list of problems; an empty list means it passed. */
  /* Only tags and style blocks can make a page run code or load something, so those are what it inspects.
     Escaped text such as "https://example.com" in a paragraph is plain text and is allowed. */
  function check(html) {
    const h = String(html), problems = [], add = m => { if (!problems.includes(m)) problems.push(m); };
    const styles = (h.match(/<style\b[^>]*>[\s\S]*?<\/style>/gi) || []).join('\n');
    const tags = h.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '<style>').match(/<[^>]*>/g) || [];
    tags.forEach(t => {
      const name = (t.match(/^<\/?\s*([a-z0-9-]+)/i) || [, ''])[1].toLowerCase();
      if (/^<!(doctype|--)/i.test(t)) return;
      if (name === 'script') add('contains a script element');
      if (/^(iframe|object|embed|frame|frameset|applet|form|input|button|textarea|select|base|link|svg|math|img|picture|video|audio|source|track|portal|template)$/.test(name)) add('contains an element that is not allowed: ' + name);
      if (/\son[a-z]+\s*=/i.test(t)) add('contains an event handler attribute');
      if (/javascript\s*:|vbscript\s*:|data\s*:\s*text\/html/i.test(t)) add('contains an executable address');
      if (/https?:\/\/|=\s*["']?\/\//i.test(t) && !/http-equiv="Content-Security-Policy"/i.test(t)) add('contains a web address in a tag');
      if (/\ssrc\s*=/i.test(t)) add('has a src attribute');
      if (/\sstyle\s*=/i.test(t)) add('has an inline style attribute');
      if (/http-equiv\s*=\s*["']?refresh/i.test(t)) add('contains a refresh redirect');
      const href = t.match(/\shref\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/i);
      if (href && !/^["']?#[A-Za-z0-9_-]+["']?$/.test(href[1])) add('has a link that is not inside the page');
    });
    if (/@import|url\s*\(|expression\s*\(|https?:|behavior\s*:|-moz-binding/i.test(styles)) add('has a stylesheet that could load or run something');
    if ((h.match(/<style\b/gi) || []).length !== 1) add('should have exactly one style block');
    if (!/<meta http-equiv="Content-Security-Policy" content="default-src 'none';/i.test(h)) add('has no restrictive Content Security Policy');
    if (!/<meta name="viewport"/i.test(h)) add('has no mobile viewport setting');
    return problems;
  }

  function fileName(src) {
    const t = parse(src).meta.title || 'Practice guide';
    const base = t.normalize ? t.normalize('NFKD') : t;
    return 'ShapeShft-' + (base.replace(/[^A-Za-z0-9 ]/g, ' ').trim().split(/\s+/).slice(0, 8).join('-') || 'Practice-Guide') + '.html';
  }

  const api = { VERSION, build, check, parse, fileName, esc };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ShapeShftGuide = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
