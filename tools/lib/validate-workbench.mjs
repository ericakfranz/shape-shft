// Validates Resume Workbench JSON against docs/workbench-json-spec.md.
// errors: the Workbench would refuse the file, or a hard rule in the spec is broken.
// warnings: the file loads, but the Workbench checks would flag it.

export function validateWorkbench(text) {
  const errors = [], warnings = [];
  let o;
  try { o = typeof text === 'string' ? JSON.parse(text) : text; } catch (e) { return { errors: ['Not valid JSON: ' + e.message], warnings }; }
  if (!o || typeof o !== 'object' || Array.isArray(o)) return { errors: ['The top level must be one JSON object.'], warnings };

  ['summary', 'skills', 'exp'].forEach(k => { if (o[k] == null) errors.push(`Missing required key "${k}".`); });
  if (o.skills != null && !Array.isArray(o.skills)) errors.push('"skills" must be a list.');
  if (o.exp != null && !Array.isArray(o.exp)) errors.push('"exp" must be a list.');
  if (o.edu != null && !Array.isArray(o.edu)) errors.push('"edu" must be a list.');
  if (o.letter != null && (typeof o.letter !== 'object' || !(Array.isArray(o.letter.body) || typeof o.letter.body === 'string'))) errors.push('"letter" needs a "body" list of paragraphs.');

  const strings = [];
  (function walk(v, path) {
    if (typeof v === 'string') strings.push([path, v]);
    else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${i}]`));
    else if (v && typeof v === 'object') Object.keys(v).forEach(k => walk(v[k], path ? `${path}.${k}` : k));
  })(o, '');
  strings.forEach(([p, s]) => { if (/[^\x20-\x7E\n]/.test(s)) errors.push(`Non-ASCII character in ${p}.`); });

  const mmYYYY = /^\d{2}\/\d{4}$/;
  const toNum = d => { const m = String(d).match(/^(\d{2})\/(\d{4})$/); return m ? +m[2] * 12 + +m[1] : null; };
  if (Array.isArray(o.exp)) {
    o.exp.forEach((e, i) => {
      const w = `exp[${i}]`;
      ['title', 'org', 'start', 'end'].forEach(k => { if (typeof e[k] !== 'string' || !e[k].trim()) errors.push(`${w} is missing "${k}".`); });
      if (!Array.isArray(e.bullets)) errors.push(`${w} needs a "bullets" list.`);
      if (e.start && !mmYYYY.test(e.start)) errors.push(`${w}.start must be MM/YYYY.`);
      if (e.end && !mmYYYY.test(e.end) && !/^present$/i.test(e.end)) errors.push(`${w}.end must be MM/YYYY or Present.`);
      if (mmYYYY.test(e.start || '') && mmYYYY.test(e.end || '') && toNum(e.end) < toNum(e.start)) errors.push(`${w} ends before it starts.`);
      (e.bullets || []).forEach((b, j) => {
        if (b.length > 300) errors.push(`${w}.bullets[${j}] is over 300 characters (${b.length}).`);
        if (!/^[A-Z]/.test(b)) warnings.push(`${w}.bullets[${j}] should start with a capital action verb.`);
      });
      if ((e.bullets || []).length > 6) warnings.push(`${w} has more than 6 bullets.`);
    });
    const ends = o.exp.map(e => /^present$/i.test(e.end || '') ? 1e9 : toNum(e.end));
    for (let i = 1; i < ends.length; i++) if (ends[i] != null && ends[i - 1] != null && ends[i] > ends[i - 1]) errors.push(`exp is not newest first (role ${i + 1} ends after role ${i}).`);
  }
  if (typeof o.summary === 'string' && o.summary.length > 650) errors.push(`summary is over 650 characters (${o.summary.length}).`);
  if (typeof o.title === 'string' && o.title.length >= 75) warnings.push(`title is ${o.title.length} characters; keep it under 75.`);
  if (typeof o.contact === 'string' && !/@/.test(o.contact) && !/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(o.contact)) errors.push('contact needs an email address or a phone number.');
  if (Array.isArray(o.skills)) o.skills.forEach((s, i) => { if (typeof s.label !== 'string' || typeof s.value !== 'string') errors.push(`skills[${i}] needs "label" and "value" strings.`); });
  (o.certs || []).forEach((c, i) => { if (!c.name) errors.push(`certs[${i}] needs "name".`); if (c.date && !mmYYYY.test(c.date)) errors.push(`certs[${i}].date must be MM/YYYY.`); });
  (o.edu || []).forEach((d, i) => { if (!d.name) errors.push(`edu[${i}] needs "name".`); if (d.date && !/^(\d{2}\/)?\d{4}$/.test(d.date)) errors.push(`edu[${i}].date must be MM/YYYY or YYYY.`); });
  if (o.template != null && !['t1', 't2'].includes(o.template)) errors.push('template must be "t1" or "t2".');
  if (o.map != null) {
    if (!Array.isArray(o.map)) errors.push('"map" must be a list.');
    else o.map.forEach((m, i) => {
      if (!['covered', 'partial', 'gap'].includes(m.status)) errors.push(`map[${i}].status must be covered, partial or gap.`);
      if (!m.req) errors.push(`map[${i}] needs "req".`);
    });
  }
  if (o.meta && o.meta.role && typeof o.title === 'string' && !o.title.toLowerCase().includes(o.meta.role.toLowerCase())) warnings.push('The headline does not contain the posting title from meta.role.');
  if (o.letter && Array.isArray(o.letter.body)) {
    const words = o.letter.body.join(' ').split(/\s+/).filter(Boolean).length;
    if (words > 350) warnings.push(`The letter body has ${words} words (over 350).`);
    if ([o.letter.greeting, o.letter.closing, ...o.letter.body].some(t => /\[[^\]]*\]/.test(String(t || '')))) errors.push('The letter contains a placeholder in square brackets.');
  }
  if (o.checks != null) {
    ['confirmedTerms', 'doNotClaim', 'confirmedNumbers'].forEach(k => { if (o.checks[k] != null && !Array.isArray(o.checks[k])) errors.push(`checks.${k} must be a list.`); });
  }
  if (typeof o.posting !== 'string' || o.posting.length < 200) warnings.push('posting is missing or very short; it should hold the complete posting.');
  return { errors, warnings };
}
