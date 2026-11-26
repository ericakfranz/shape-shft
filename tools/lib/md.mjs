// Small Markdown-to-HTML renderer for ShapeShft's own documentation (START HERE and Help pages).
// It handles the subset the docs use: headings, paragraphs, nested lists, tables, code, quotes, links, bold, italic.
// Input is trusted project documentation, but text is still escaped and only http(s), mailto and relative links are kept.

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function slug(t) {
  return String(t).toLowerCase().replace(/<[^>]+>/g, '').replace(/[^a-z0-9 -]/g, '').trim().replace(/\s+/g, '-');
}

function inline(s, opts) {
  const codes = [];
  s = String(s).replace(/`([^`]+)`/g, (_, c) => { codes.push(`<code>${esc(c)}</code>`); return `\u0000${codes.length - 1}\u0000`; });
  s = esc(s)
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, src) => opts.images ? `<img src="${esc(src)}" alt="${alt}">` : alt)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text, href) => {
      const h = href.replace(/&amp;/g, '&');
      if (!/^(https?:|mailto:|#|[\w./-])/i.test(h) || /^javascript:/i.test(h)) return text;
      return `<a href="${esc(opts.mapLink ? opts.mapLink(h) : h)}">${text}</a>`;
    })
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?=[^*\w]|$)/g, '$1<em>$2</em>');
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => codes[+i]);
}

export function render(md, opts = {}) {
  const lines = String(md).replace(/\r\n?/g, '\n').split('\n');
  const out = [];
  let i = 0;
  const isTableSep = l => /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/.test(l);
  const cells = l => l.trim().replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map(c => c.trim().replace(/\\\|/g, '|'));
  while (i < lines.length) {
    const l = lines[i];
    if (!l.trim()) { i++; continue; }
    let m;
    if ((m = l.match(/^```/))) {
      const buf = []; i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++; out.push(`<pre><code>${esc(buf.join('\n'))}</code></pre>`); continue;
    }
    if ((m = l.match(/^(#{1,6})\s+(.*)$/))) {
      const n = m[1].length, t = inline(m[2], opts);
      out.push(`<h${n} id="${slug(m[2])}">${t}</h${n}>`); i++; continue;
    }
    if (/^-{3,}\s*$/.test(l)) { out.push('<hr>'); i++; continue; }
    if (l.includes('|') && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      const head = cells(l); i += 2; const rows = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].trim()) rows.push(cells(lines[i++]));
      out.push(`<table><thead><tr>${head.map(c => `<th>${inline(c, opts)}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => `<td>${inline(c, opts)}</td>`).join('')}</tr>`).join('')}</tbody></table>`);
      continue;
    }
    if (/^>\s?/.test(l)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ''));
      out.push(`<blockquote>${render(buf.join('\n'), opts)}</blockquote>`); continue;
    }
    if (/^\s*([-*]|\d+[.)])\s+/.test(l)) {
      const buf = [];
      while (i < lines.length && (/^\s*([-*]|\d+[.)])\s+/.test(lines[i]) || (/^\s{2,}\S/.test(lines[i]) && buf.length) || (!lines[i].trim() && i + 1 < lines.length && /^\s{2,}([-*]|\d+[.)])\s+/.test(lines[i + 1])))) buf.push(lines[i++]);
      out.push(renderList(buf, opts)); continue;
    }
    const buf = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|```|>|\s*([-*]|\d+[.)])\s+|-{3,}\s*$)/.test(lines[i])) buf.push(lines[i++].trim());
    out.push(`<p>${inline(buf.join(' '), opts)}</p>`);
  }
  return out.join('\n');
}

function renderList(lines, opts) {
  const indent = l => l.match(/^\s*/)[0].length;
  const base = indent(lines[0]);
  const ordered = /^\s*\d+[.)]/.test(lines[0]);
  const items = [];
  for (const l of lines) {
    if (!l.trim()) continue;
    if (indent(l) === base && /^\s*([-*]|\d+[.)])\s+/.test(l)) items.push({ text: l.replace(/^\s*([-*]|\d+[.)])\s+/, ''), sub: [] });
    else if (items.length) {
      if (indent(l) > base && /^\s*([-*]|\d+[.)])\s+/.test(l)) items[items.length - 1].sub.push(l);
      else if (items[items.length - 1].sub.length) items[items.length - 1].sub.push(l);
      else items[items.length - 1].text += ' ' + l.trim();
    }
  }
  const tag = ordered ? 'ol' : 'ul';
  return `<${tag}>${items.map(it => `<li>${inline(it.text, opts)}${it.sub.length ? renderList(it.sub, opts) : ''}</li>`).join('')}</${tag}>`;
}
