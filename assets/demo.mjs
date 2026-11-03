// Demo company (gyeoldesk.com/?org=demo): the real app code with fictional data and no database.
// Every request the Supabase client makes is answered here from assets/demo/data.json?v=45094219.
// Reads work; anything that would save, send or sign in is refused with a "Demo" error.
// Nothing here ever calls the real Supabase project.

const DATA_URL = '/assets/demo/data.json?v=45094219';
const BASE_WAR = '2026-11-05';   // the live week the data was written for
const DAY = 86400000;
const realFetch = globalThis.fetch.bind(globalThis);

export const DEMO_TEXT = {
  en: {
    krimaText: 'Status for Tallis Freight', gGN: 'Halyard Works', printPrimeNote: 'Prime shown next to each project no.',
    contactsLede: 'Demo data. In a real workspace this list is copied every hour from your contacts tracker.',
    recLede: 'Demo data. In a real workspace this list is updated every hour from the project folder in Drive and the submittal register.',
    demoBlocked: 'Demo: changes are not saved.',
    demoBar: 'Demo company. Halyard Works Contractors is fictional, from the game Forkline. All data is made up and nothing is saved.',
    demoPlay: 'Play Forkline', demoBack: 'Gyeoldesk home', demoCardSub: 'Demo · fictional company · no sign-in',
    demoFull: 'Open full size',
    accessLede: 'Demo data. In a real workspace this list comes from your org chart. Tick who needs access, then set their email and role.',
  },
  ko: {
    krimaText: 'Tallis Freight 보고 문구', gGN: '핼야드 웍스',
    contactsLede: '데모 데이터입니다. 실제 작업 공간에서는 연락처 트래커에서 매시간 복사됩니다.',
    recLede: '데모 데이터입니다. 실제 작업 공간에서는 드라이브 과업 폴더와 제출물 대장에서 매시간 갱신됩니다.',
    demoBlocked: '데모입니다: 변경 내용은 저장되지 않습니다.',
    demoBar: '데모 회사입니다. 핼야드 웍스 건설은 게임 Forkline에 나오는 가상의 회사이며, 모든 데이터는 가상이고 저장되지 않습니다.',
    demoPlay: 'Forkline 플레이', demoBack: '결데스크 홈', demoCardSub: '데모 · 가상 회사 · 로그인 없이 보기',
    demoFull: '크게 보기',
    accessLede: '데모 데이터입니다. 실제 작업 공간에서는 조직도에서 불러옵니다. 접근이 필요한 사람에 체크하고 이메일과 역할을 정하세요.',
  },
};

// ---- dates: move the whole data set forward by whole weeks so the demo always shows the current week
const iso = (t) => new Date(t).toISOString().slice(0, 10);
function weeksToShift(now = Date.now()) {
  const kst = new Date(now + 9 * 3600000);
  const today = Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate());
  const thu = today + ((4 - new Date(today).getUTCDay() + 7) % 7) * DAY;   // this week's WAR (Thursday)
  return Math.max(0, Math.round((thu - Date.parse(BASE_WAR)) / (7 * DAY)));
}
export function shiftDates(value, weeks) {
  if (!weeks) return value;
  const add = weeks * 7 * DAY;
  const base = Date.parse(BASE_WAR);
  const shiftIso = (s) => s.replace(/\b(\d{4})-(\d{2})-(\d{2})(?=T|\b)/g, (m) => iso(Date.parse(m) + add));
  const shiftYmd = (s) => s.replace(/\b(\d{4})\/(\d{1,2})\/(\d{1,2})\b/g, (_, y, mo, d) => {
    const t = new Date(Date.UTC(+y, mo - 1, +d) + add); return `${t.getUTCFullYear()}/${t.getUTCMonth() + 1}/${t.getUTCDate()}`;
  });
  // Month/day with no year (bullets, key dates): pick the year that puts it nearest the data's week.
  const shiftMd = (s) => s.replace(/(^|[^\d/])(\d{1,2})\/(\d{1,2})(?![\d/])/g, (m, pre, mo, d) => {
    if (+mo < 1 || +mo > 12 || +d < 1 || +d > 31) return m;
    const y = [2025, 2026, 2027].map((yy) => Date.UTC(yy, mo - 1, +d)).sort((a, b) => Math.abs(a - base) - Math.abs(b - base))[0];
    const t = new Date(y + add); return `${pre}${t.getUTCMonth() + 1}/${t.getUTCDate()}`;
  });
  const walk = (v) => {
    if (typeof v === 'string') return shiftMd(shiftYmd(shiftIso(v)));
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === 'object') { const o = {}; for (const k of Object.keys(v)) o[k] = k === 'photo_id' || k === 'drive_file_id' || k === 'evidence_url' ? v[k] : walk(v[k]); return o; }
    return v;
  };
  return walk(value);
}

let dbPromise = null;
const loadDb = () => (dbPromise ||= realFetch(DATA_URL).then((r) => r.json()).then((d) => shiftDates(d, weeksToShift())));

// ---- a small read-only PostgREST: select with embeds, eq/neq/in/is/not.is filters, order, limit
function splitTop(s) { const out = []; let d = 0, cur = ''; for (const c of s) { if (c === '(') d++; if (c === ')') d--; if (c === ',' && d === 0) { out.push(cur); cur = ''; } else cur += c; } if (cur) out.push(cur); return out; }
function parseSel(s) { return splitTop(s || '*').map((f) => { const m = f.match(/^([a-z_]+)(!inner)?\((.*)\)$/); return m ? { embed: m[1], inner: !!m[2], sel: parseSel(m[3]) } : { col: f }; }); }
const sing = (t) => t.replace(/s$/, '');
const cmp = (a, b) => (a == null ? (b == null ? 0 : 1) : b == null ? -1 : a < b ? -1 : a > b ? 1 : 0);
function applyOrder(rows, spec) {
  if (!spec) return rows;
  const keys = spec.split(',').map((x) => { const [c, dir] = x.split('.'); return [c, dir === 'desc']; });
  return rows.slice().sort((a, b) => { for (const [c, desc] of keys) { const r = cmp(a[c], b[c]); if (r) return desc ? -r : r; } return 0; });
}
function matchFilter(v, f) {
  const [op, ...rest] = f.split('.'); const val = rest.join('.');
  if (op === 'eq') return String(v) === val;
  if (op === 'neq') return String(v) !== val;
  if (op === 'in') return val.replace(/^\(|\)$/g, '').split(',').map((x) => x.replace(/^"|"$/g, '')).includes(String(v));
  if (op === 'is') return val === 'null' ? v == null : true;
  if (op === 'not') return !matchFilter(v, val);
  return true;
}
function shape(D, table, row, sel, params, prefix) {
  const out = {}; let keep = true;
  for (const f of sel) {
    if (f.col) { if (f.col === '*') Object.assign(out, row); else out[f.col] = row[f.col]; continue; }
    const child = D[f.embed] || []; const key = prefix + f.embed;
    const own = (k) => k.startsWith(key + '.') && !k.slice(key.length + 1).includes('.') && !['order', 'limit'].includes(k.slice(key.length + 1));
    if ((sing(f.embed) + '_id') in row) {
      const r = child.find((c) => c.id === row[sing(f.embed) + '_id']);
      let ok = !!r;
      for (const [k, v] of Object.entries(params)) if (own(k) && r) ok = ok && matchFilter(r[k.slice(key.length + 1)], v);
      if (f.inner && !ok) keep = false;
      out[f.embed] = ok && r ? shape(D, f.embed, r, f.sel, params, key + '.').out : null;
    } else {
      let rows = child.filter((c) => c[sing(table) + '_id'] === row.id);
      rows = applyOrder(rows, params[key + '.order']);
      if (params[key + '.limit']) rows = rows.slice(0, +params[key + '.limit']);
      out[f.embed] = rows.map((r) => shape(D, f.embed, r, f.sel, params, key + '.').out);
      if (f.inner && !rows.length) keep = false;
    }
  }
  return { out, keep };
}
function select(D, table, url) {
  const params = {}; url.searchParams.forEach((v, k) => { params[k] = v; });
  let rows = (D[table] || []).filter((r) => Object.entries(params).every(([k, v]) => (['select', 'order', 'limit', 'offset'].includes(k) || k.includes('.')) ? true : matchFilter(r[k], v)));
  rows = applyOrder(rows, params.order);
  let out = rows.map((r) => shape(D, table, r, parseSel(params.select), params, '')).filter((x) => x.keep).map((x) => x.out);
  if (params.limit) out = out.slice(0, +params.limit);
  return out;
}

// ---- the fake session (memory only: nothing is written to the browser)
const b64 = (o) => btoa(JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
const EXP = 4102444800;   // 2100-01-01
const USER = { id: 'demo-visitor', email: 'visitor@demo.example', aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: '2026-11-01T00:00:00Z' };
const SESSION = { access_token: `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: USER.id, email: USER.email, role: 'authenticated', aud: 'authenticated', exp: EXP })}.demo`,
  token_type: 'bearer', expires_in: EXP - Math.floor(Date.now() / 1000), expires_at: EXP, refresh_token: 'demo', user: USER };
export const demoAuth = {
  persistSession: true, autoRefreshToken: false, detectSessionInUrl: false, storageKey: 'gd-demo-auth',
  storage: { getItem: () => JSON.stringify(SESSION), setItem: () => {}, removeItem: () => {} },
};

const json = (body, status = 200) => new Response(body == null && status === 204 ? null : JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
const refuse = () => json({ code: 'DEMO', message: 'Demo: changes are not saved', details: null, hint: null }, 400);

export async function demoFetch(input, init = {}) {
  const url = new URL(typeof input === 'string' ? input : input.url);
  const method = String(init.method || (typeof input === 'object' && input.method) || 'GET').toUpperCase();
  const p = url.pathname;
  if (p.startsWith('/auth/v1/')) {
    if (p.endsWith('/user')) return json(USER);
    if (p.endsWith('/token')) return json(SESSION);
    if (p.endsWith('/logout')) return json(null, 204);
    return refuse();   // sign-in codes are never sent from the demo
  }
  if (p.startsWith('/functions/v1/')) return refuse();
  if (p.startsWith('/rest/v1/rpc/')) {
    const fn = p.split('/').pop();
    if (fn === 'org_directory') return json((await loadDb()).orgs);
    if (fn === 'set_my_lang') return json(null, 204);
    return refuse();
  }
  if (p.startsWith('/rest/v1/')) {
    if (method !== 'GET' && method !== 'HEAD') return refuse();
    const D = await loadDb();
    const rows = select(D, p.split('/').pop(), url);
    const headers = new Headers(init.headers || {});
    if (/vnd\.pgrst\.object/.test(headers.get('accept') || '')) return rows.length ? json(rows[0]) : json({ code: 'PGRST116', message: 'no rows' }, 406);
    return json(rows);
  }
  return json({ message: 'not found' }, 404);
}

// Photos in the demo are illustrations bundled with the site. Their links open the image itself, not Drive.
export async function demoPhoto(photoId) {
  if (!/^demo-\d+$/.test(photoId)) throw Object.assign(new Error('not a demo photo'), { status: 404 });
  const r = await realFetch(`/assets/demo/photos/${photoId}.jpg`);
  if (!r.ok) throw Object.assign(new Error('missing'), { status: r.status });
  return r.blob();
}
export function demoPhotoLinks(box, label) {
  box.querySelectorAll('.war-photos figure').forEach((fig) => {
    const id = fig.querySelector('img[data-photo-id]')?.dataset.photoId;
    if (!id) return;
    fig.querySelectorAll('a[href^="https://drive.google.com/"]').forEach((a) => { a.href = `/assets/demo/photos/${id}.jpg`; });
    const last = fig.querySelector('figcaption > a:last-child'); if (last) last.textContent = label;
  });
}
