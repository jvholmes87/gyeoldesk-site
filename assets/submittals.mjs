// Gyeoldesk Submittals: the Master Submittal Status (all projects) and each project's submittal lines.
// Internal, read-only status view built from PCES tracker tabs 04B/04C (hourly copy in submittal_lines, submittal_notes).
// It is not the official submittal register sent to the Government; those registers are unchanged.
// Pure rendering: callers pass data in and get HTML strings back, so tests run under Node.

export const CATS = [
  { k: 'approved', ko: '승인', en: 'Approved', c: '#1d6b33' },
  { k: 'in_review', ko: '제출 · 검토 중', en: 'Sent · In review', c: '#1a4b9b' },
  { k: 'covered', ko: '기 제출로 충족', en: 'Covered by earlier submittal', c: '#0b6457' },
  { k: 'action', ko: '조치 필요', en: 'Action needed', c: '#b02a1e' },
  { k: 'later', ko: '공사 중 · 준공 · 보류', en: 'During work · Closeout · On hold', c: '#55595f' },
  { k: 'na', ko: '해당 없음 · 삭제', en: 'Not required · Deleted', c: '#8a8f96' },
];
const OPEN = new Set(['in_review', 'covered', 'action']);
export const LATE_DAYS = 30;

const S = {
  ko: {
    title: '제출물 현황', lede: '전체 과업의 제출물 라인별 현황 (내부용). 공식 제출물 대장이 아닙니다. 과업 트래커에서 매시간 갱신 — 수정은 트래커에서.',
    tile: '과업별 제출물 승인·검토·조치 현황.', project: '과업', lines: '라인', followUp: '▶ 후속 조치', total: '합계',
    teamActions: '팀 조치 사항', keyPoints: '핵심 사항', all: '전체 보기', actionOnly: '조치 필요만', filter: '보기',
    noData: '아직 데이터가 없습니다. PCES 트래커 04B 탭이 동기화되면 표시됩니다.', noAction: '조치 필요 항목이 없습니다.',
    days: (n) => `${n}일 대기`, sent: (d) => `${d} 제출`, resp: (d) => `${d} 회신`, af3000: 'AF 3000', notCounted: '목록 외 · 집계 제외',
    open: '미결', back: '← 전체 제출물 현황', linesOf: (n) => `${n}개 라인`, needs: '조치가 필요한 라인', updated: (d) => `${d} 동기화`,
    lateNote: `제출 후 ${LATE_DAYS}일 넘게 회신이 없으면 빨간색으로 표시합니다.`, internal: '내부용 · 공식 제출물 대장 아님',
    onWar: '제출물 현황 보기', none: '–',
  },
  en: {
    title: 'Submittal status', lede: 'Line-by-line submittal status for every project (internal). Not the official submittal register. Updated hourly from the project tracker; make changes in the tracker.',
    tile: 'Approved, in review and action-needed submittals by project.', project: 'Project', lines: 'Lines', followUp: '▶ Follow-up', total: 'Total',
    teamActions: 'Team actions', keyPoints: 'Key points', all: 'Everything', actionOnly: 'Action needed only', filter: 'Show',
    noData: 'No data yet. It appears after the PCES tracker tab 04B syncs.', noAction: 'Nothing needs action.',
    days: (n) => `${n} days waiting`, sent: (d) => `Sent ${d}`, resp: (d) => `Reply ${d}`, af3000: 'AF 3000', notCounted: 'Not a register line · not counted',
    open: 'Open', back: '← All projects', linesOf: (n) => `${n} lines`, needs: 'Lines that need action', updated: (d) => `Synced ${d}`,
    lateNote: `Red: more than ${LATE_DAYS} days since it was sent with no reply.`, internal: 'Internal · not the official register',
    onWar: 'Submittal status', none: '–',
  },
};
export const str = (lang, k, ...a) => { const v = (S[lang] || S.en)[k] ?? S.en[k]; return typeof v === 'function' ? v(...a) : v; };

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pick = (lang, ko, en) => (lang === 'ko' ? (ko || en) : (en || ko)) || '';
const catOf = (k) => CATS.find((c) => c.k === k) || CATS[4];
const safeUrl = (u) => (/^https:\/\/(drive|docs)\.google\.com\//.test(String(u || '')) ? String(u) : null);
const md = (iso) => { const m = String(iso || '').match(/^\d{4}-(\d{2})-(\d{2})$/); return m ? `${+m[1]}/${+m[2]}` : ''; };

/** Whole days from the sent date to today, while a sent line has no reply. null when it does not apply. */
export function daysWaiting(line, today) {
  if (!OPEN.has(line.status) || !line.sent_on || line.response_on) return null;
  const a = Date.parse(line.sent_on + 'T00:00:00Z'); const b = Date.parse(today + 'T00:00:00Z');
  if (!Number.isFinite(a) || !Number.isFinite(b) || b < a) return null;
  return Math.round((b - a) / 86400000);
}
/** Today's date in Korea (KST), as YYYY-MM-DD. */
export const todayKst = (now = Date.now()) => new Date(now + 9 * 3600000).toISOString().slice(0, 10);

/** Counts per category for one project's lines. Lines marked extra are not register lines and are not counted. */
export function counts(lines) {
  const c = Object.fromEntries(CATS.map((x) => [x.k, 0])); let n = 0; let f = 0;
  for (const l of lines) { if (l.follow_up) f++; if (l.extra) continue; c[l.status] = (c[l.status] || 0) + 1; n++; }
  return { ...c, lines: n, follow: f };
}
export const byPid = (rows) => { const m = new Map(); for (const r of rows) { if (!m.has(r.pid)) m.set(r.pid, []); m.get(r.pid).push(r); } return m; };
const pidSort = (a, b) => String(a).localeCompare(String(b), 'en', { numeric: true });

/** Project route key: the project key when known (26-1028), else the PID. */
export const routeKey = (pid, proj) => encodeURIComponent(proj?.project_key || pid);

function chips(c, lang) {
  return `<div class="sm-chips">${CATS.filter((x) => c[x.k]).map((x) => `<span class="sm-chip" style="--c:${x.c}"><b>${c[x.k]}</b>${esc(pick(lang, x.ko, x.en))}</span>`).join('')}</div>`;
}
function legend(lang) {
  return `<p class="sm-legend">${CATS.map((x) => `<span style="--c:${x.c}"><i></i>${esc(pick(lang, x.ko, x.en))}</span>`).join('')}</p>`;
}

/** All-projects page: summary counts, one numbered team-action list, and the Action needed only filter. */
export function summaryHtml({ lines, notes, projects, lang, actionOnly = false, today }) {
  if (!lines.length) return `<p class="empty">${esc(str(lang, 'noData'))}</p>`;
  const L = byPid(lines); const N = byPid(notes);
  const proj = new Map((projects || []).map((p) => [p.pid, p]));
  const pids = [...L.keys()].sort(pidSort);
  const rows = pids.map((pid) => ({ pid, c: counts(L.get(pid)), p: proj.get(pid) }));
  const shown = actionOnly ? rows.filter((r) => r.c.action || r.c.follow) : rows;
  const tot = counts(lines);
  const cell = (v, k) => `<td class="n${v ? '' : ' z'}"${k === 'action' && v ? ' data-hot' : ''}>${v || '–'}</td>`;
  const table = `<div class="sm-scroll"><table class="sm-sum">
    <thead><tr><th scope="col">${esc(str(lang, 'project'))}</th>${CATS.map((x) => `<th scope="col" class="n" style="--c:${x.c}"><span>${esc(pick(lang, x.ko, x.en))}</span></th>`).join('')}
      <th scope="col" class="n">${esc(str(lang, 'lines'))}</th><th scope="col" class="n">▶</th></tr></thead>
    <tbody>${shown.map(({ pid, c, p }) => `<tr><th scope="row"><a href="#/submittals/${routeKey(pid, p)}"><b>${esc(pid)}</b> ${esc(p?.project_key || '')}</a>
        <span class="sm-ptitle">${esc(pick(lang, p?.title_ko, p?.title_en))}</span></th>
      ${CATS.map((x) => cell(c[x.k], x.k)).join('')}<td class="n">${c.lines}</td><td class="n${c.follow ? '' : ' z'}">${c.follow || '–'}</td></tr>`).join('')}</tbody>
    ${actionOnly ? '' : `<tfoot><tr><th scope="row">${esc(str(lang, 'total'))}</th>${CATS.map((x) => cell(tot[x.k], x.k)).join('')}<td class="n">${tot.lines}</td><td class="n">${tot.follow}</td></tr></tfoot>`}
  </table></div>`;

  // One numbered list across projects, in project order.
  let i = 0;
  const actions = pids.flatMap((pid) => (N.get(pid) || []).filter((n) => n.kind === 'action').sort((a, b) => a.ord - b.ord)
    .map((n) => `<li value="${++i}"><a class="sm-pid" href="#/submittals/${routeKey(pid, proj.get(pid))}">${esc(pid)}</a> ${esc(pick(lang, n.text_ko, n.text_en))}</li>`));

  let need = '';
  if (actionOnly) {
    const list = pids.flatMap((pid) => L.get(pid).filter((l) => l.status === 'action' || l.follow_up).map((l) => ({ pid, l })));
    need = `<section><h2>${esc(str(lang, 'needs'))}</h2>${list.length ? `<ul class="sm-need">${list.map(({ pid, l }) =>
      `<li><a class="sm-pid" href="#/submittals/${routeKey(pid, proj.get(pid))}">${esc(pid)}</a> ${lineHtml(l, lang, today, true)}</li>`).join('')}</ul>`
      : `<p class="empty">${esc(str(lang, 'noAction'))}</p>`}</section>`;
  }
  return `${legend(lang)}${table}${need}
    <section><h2>${esc(str(lang, 'teamActions'))}</h2>${actions.length ? `<ol class="sm-actions">${actions.join('')}</ol>` : `<p class="empty">${esc(str(lang, 'noAction'))}</p>`}</section>`;
}

/** One line. Open lines (in review, covered, action) get the full reason; the rest are compact rows. */
export function lineHtml(l, lang, today, withSpec = false) {
  const cat = catOf(l.status); const open = OPEN.has(l.status);
  const d = daysWaiting(l, today);
  const meta = [
    l.sent_on ? esc(str(lang, 'sent', md(l.sent_on))) : '',
    l.response_on && open ? esc(str(lang, 'resp', md(l.response_on))) : '',
    d != null ? `<span class="sm-days${d > LATE_DAYS ? ' late' : ''}">${esc(str(lang, 'days', d))}</span>` : '',
    safeUrl(l.af3000_url) ? `<a href="${esc(safeUrl(l.af3000_url))}" target="_blank" rel="noopener">${esc(str(lang, 'af3000'))} ↗</a>` : '',
    l.extra ? `<span class="sm-extra">${esc(str(lang, 'notCounted'))}</span>` : '',
  ].filter(Boolean).join(' · ');
  const ref = [l.sd ? `SD-${l.sd}` : '', l.para ? `¶${l.para}` : '', l.g === 'G' ? 'G' : ''].filter(Boolean).join(' ');
  return `<div class="sm-line ${open ? 'open' : 'compact'}" style="--c:${cat.c}">
    <span class="sm-no">${l.follow_up ? '<b class="sm-flag" title="▶">▶</b>' : ''}${esc(l.line || '')}</span>
    <div class="sm-body"><div class="sm-item">${withSpec ? `<span class="sm-spec">${esc(l.spec)}</span> ` : ''}${esc(l.item)}${ref ? ` <span class="sm-ref">${esc(ref)}</span>` : ''}</div>
      <div class="sm-why"><span class="sm-cat">${esc(pick(lang, cat.ko, cat.en))}</span> ${esc(pick(lang, l.reason_ko, l.reason_en))}</div>
      ${meta ? `<div class="sm-meta">${meta}</div>` : ''}</div></div>`;
}

/** One project's page: key points, status chips, lines grouped by spec section, team actions. */
export function projectHtml({ pid, lines, notes, project, lang, today, openOnly = false }) {
  const c = counts(lines);
  const key = notes.filter((n) => n.kind === 'key').sort((a, b) => a.ord - b.ord);
  const acts = notes.filter((n) => n.kind === 'action').sort((a, b) => a.ord - b.ord);
  const note = notes.find((n) => n.kind === 'note');
  const groups = new Map();
  for (const l of [...lines].sort((a, b) => a.sort - b.sort)) {
    if (openOnly && !(OPEN.has(l.status) || l.follow_up)) continue;
    const g = l.spec; if (!groups.has(g)) groups.set(g, { title: l.section_title, lines: [] }); groups.get(g).lines.push(l);
  }
  const title = pick(lang, project?.title_ko, project?.title_en);
  return `
    <p class="no-print"><a href="#/submittals">${esc(str(lang, 'back'))}</a></p>
    <header class="sm-head"><p class="sm-eyebrow">${esc(pid)}${project?.project_key ? ` · ${esc(project.project_key)}` : ''}</p>
      <h1>${esc(title || pid)}</h1>${title ? `<p class="alt">${esc(lang === 'ko' ? project?.title_en || '' : project?.title_ko || '')}</p>` : ''}
      <p class="sm-note">${esc(str(lang, 'internal'))}${note ? ` · ${esc(pick(lang, note.text_ko, note.text_en))}` : ''}</p></header>
    ${chips(c, lang)}
    <p class="sm-count">${esc(str(lang, 'linesOf', c.lines))}${c.follow ? ` · ${esc(str(lang, 'followUp'))} ${c.follow}` : ''}</p>
    ${key.length ? `<section><h2>${esc(str(lang, 'keyPoints'))}</h2><ul class="sm-keys">${key.map((n) => `<li>${esc(pick(lang, n.text_ko, n.text_en))}</li>`).join('')}</ul></section>` : ''}
    ${acts.length ? `<section><h2>${esc(str(lang, 'teamActions'))}</h2><ol class="sm-actions">${acts.map((n) => `<li>${esc(pick(lang, n.text_ko, n.text_en))}</li>`).join('')}</ol></section>` : ''}
    <section><div class="sec-head"><h2>${esc(str(lang, 'lines'))}</h2>
      <div class="sm-filter no-print" role="group" aria-label="${esc(str(lang, 'filter'))}">
        <button type="button" data-open="0" aria-pressed="${!openOnly}">${esc(str(lang, 'all'))}</button>
        <button type="button" data-open="1" aria-pressed="${openOnly}">${esc(str(lang, 'open'))}</button></div></div>
      <p class="sm-legend-note">${esc(str(lang, 'lateNote'))}</p>
      ${[...groups.entries()].map(([spec, g]) => `<div class="sm-sec"><h3><span>${esc(spec)}</span> ${esc(g.title || '')}</h3>
        ${g.lines.map((l) => lineHtml(l, lang, today)).join('')}</div>`).join('') || `<p class="empty">${esc(str(lang, 'noAction'))}</p>`}
    </section>`;
}
