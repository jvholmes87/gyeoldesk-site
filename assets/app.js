// Gyeoldesk web app. One codebase for every company:
//   gyeoldesk.com            -> company cards
//   <company>.gyeoldesk.com  -> that company's workspace (sign-in, WAR, team access)
// Local testing: ?org=gnc opens a workspace on any host.
import { createClient } from './vendor/supabase.mjs';

const SUPABASE_URL = 'https://wltuwsplrkrsfthkthxc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_N8CLXOt4Sh01hSqJu8O9Rg_q8_V1LXh'; // publishable key: safe in the browser, data is protected by row-level security
const ROOT_DOMAIN = 'gyeoldesk.com';

const sb = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: true, autoRefreshToken: true } });
const app = document.getElementById('app');

// ---------------------------------------------------------------- text
const T = {
  ko: {
    tagline: '주한미군 기지 안에서 공사를 수행하는 한국 건설사를 위한 프로젝트 데스크. 과업, 입찰, 제출물, 허가, 하자보수, 주간 보고까지 한국어와 영어로 한곳에서 관리합니다.',
    companies: '회사', openWorkspace: '작업 공간 열기',
    signInTitle: '로그인', signInLede: '회사 이메일을 입력하면 6자리 코드를 보내 드립니다.',
    email: '이메일', sendCode: '코드 받기', sending: '보내는 중…',
    codeTitle: '코드 입력', codeLede: (e) => `${e}로 보낸 코드를 입력하세요. 10분 동안 유효합니다.`,
    code: '로그인 코드', verify: '로그인', verifying: '확인 중…', otherEmail: '다른 이메일 사용', resend: '코드 다시 보내기',
    requestTitle: '접근 요청', requestLede: '이름을 남기면 관리자가 승인합니다. 승인되면 다시 로그인할 필요 없이 이 화면이 바뀝니다.',
    yourName: '이름', nameEn: '영문 이름 (필수)', nameKo: '한글 이름', note: '메모 (선택, 가능하면 영어로)', notePh: '예: Admin team, 26-1028', sendRequest: '요청 보내기',
    waitingTitle: '승인 대기 중', waitingLede: '관리자에게 요청이 전달되었습니다. 승인되면 이 페이지를 새로 고침하세요.', refresh: '새로 고침',
    declinedTitle: '접근 권한 없음', declinedLede: '이 계정은 이 작업 공간에 접근할 수 없습니다. 관리자에게 문의하세요.',
    otherOrgTitle: '다른 회사 계정', otherOrgLede: '이 계정은 다른 회사의 작업 공간에 속해 있습니다.',
    signOut: '로그아웃',
    projectsTitle: '프로젝트', projectsLede: '수주한 과업. 착공 전·시공·준공 정산 단계별로 묶었습니다.', proposalsTitle: '입찰·제안', proposalsLede: '제출한 제안과 작성 중인 제안.', warrantiesTitle: '하자보수', warrantiesLede: '진행 중인 하자보수 요청과 종결된 요청.',
    stPreNtp: '착공 전', stConstruction: '시공', stCloseout: '준공 정산', submitted: '제출 완료', drafts: '작성 중', active: '진행 중', activeRequests: '진행 중인 요청', closedOut: '종결',
    count: (n) => `${n}건`, none: '없음', noDrafts: '작성 중인 제안이 없습니다.', stageNotSet: '단계 미지정', openQuestions: '건의 질문이 답변을 기다리고 있습니다', menu: '메뉴', teamMenu: '팀 접근 권한', settings: '설정',
    latestStatus: '최신 현황', openInWar: (d) => `WAR에서 보기 (${d})`, noStatus: '아직 WAR 현황이 없습니다.', records: '과업 기록', askTitle: '질문하기', askPh: '이 과업에 대한 질문을 한국어나 영어로 적어 주세요.', askSend: '질문 보내기', askSent: '질문을 보냈습니다',
    qOpen: '답변 대기', qAnswered: '답변 완료', answerPh: '답변을 입력하세요', qAskedBy: '질문', qDelete: '삭제', qDeleteConfirm: '이 질문을 삭제할까요? 팀 화면에서 사라집니다.', qDeleted: '삭제했습니다', qAnsweredBy: '답변', qYourAnswer: '내 답변', qWaitNote: '관리자 답변을 기다리고 있습니다. 답변이 등록되면 이메일로 알려 드립니다.', answer: '답변', questionsTitle: '질문', questionsLede: '과업 페이지에서 올라온 질문. 관리자가 답변합니다.', noQuestions: '질문이 없습니다.', projectPage: '과업 페이지 열기',
    recCount: (n, a) => `${n}건 · 승인 ${a}`, recFiles: (n) => `${n}건`, recNone: '없음', recOpen: '열기', recNoFile: '파일 없음', recNotes: '메모', recNotMade: 'AF 3000 미작성 (미제출 항목)', recEmpty: '아직 등록된 기록이 없습니다. 드라이브 과업 폴더와 PCES 제출물 대장에서 매시간 갱신됩니다.', recLede: '드라이브 과업 폴더와 PCES 제출물 대장에서 매시간 갱신. 파일은 구글 드라이브에서 열립니다.', printEyebrow: '주간 현황 — 전체 과업', printPrimeNote: '과업 번호 옆에 원도급사 표시', cont: '계속', printFoot: '금액 단위 원(KRW) · 상세 내용은 주간 현황 보고(WAR) 참조', boardTitle: '주간 현황 보드', weeksNav: '주 선택', backBoard: '보드로 돌아가기', newerWeek: '더 최신 주가 있습니다:', itemNo: (n) => `항목 ${n}`, thisWeek: '이번 주 현황', bothLangs: '한국어·영어 함께 보기', krimaText: 'Krima 현황 시트 문구', otherWeeks: '다른 주', warTitle: '주간 현황 보고', warLede: '매일 갱신되는 이번 주 WAR와 지난 주 기록.',
    accessTitle: '팀 접근 권한', accessLede: '조직도(10_GNC_ORG)에서 불러온 명단입니다. 접근이 필요한 사람에 체크하고 이메일과 역할을 정하세요.',
    reviewTitle: '검토 데스크', reviewLede: '팀원이 한국어로 답하면 영어로 정리됩니다.',
    krimaTitle: 'Krima 현황 시트', krimaLede: 'Krima 과업만 해당. 주간 확정 시 생성됩니다.',
    soon: '준비 중',
    projects: (n) => `과업 ${n}건`, week: (d) => `${d} 주`,
    live: '진행 중', review: '검토 중', final: '확정',
    carried: '지난주 이월', updated: (t) => `갱신 ${t}`,
    startReview: '검토 시작', finalize: '확정하고 잠그기', print: '인쇄 / PDF',
    confirmReview: '이번 주를 검토 단계로 넘길까요? 팀원이 확인 표시를 할 수 있습니다.',
    confirmFinal: '이번 주를 확정할까요? 확정하면 잠기고 새 주가 시작됩니다.',
    showInternal: '내부 메모 보기', internal: '내부 메모 (관리자만)', open: '확인 필요',
    keyDates: '주요 일정', date: '일자', item: '항목', search: '과업 검색', searchPeople: '이름 검색',
    noWeeks: '아직 WAR가 없습니다. 드라이브 00_WAR 주간 폴더에 문서를 넣으면 15분 안에 나타납니다.',
    noMatch: '검색 결과가 없습니다.',
    pending: '승인 요청', noPending: '대기 중인 요청이 없습니다.', matchTo: '명단의 누구인가요?', matchNone: '명단에 없음', approve: '승인', decline: '거절',
    roster: '명단', all: '전체', withAccess: '접근 허용', withoutAccess: '미허용',
    name: '이름', title: '직책', needsAccess: '접근', role: '역할', status: '상태',
    roleAdmin: '관리자', roleExec: '임원', roleTeam: '팀원',
    stActive: '사용 중', stInvited: '초대됨', stNeedsEmail: '이메일 필요', stOff: '—', stDeparted: '퇴사', stDeclined: '꺼짐',
    sumAccess: '접근 허용', sumActive: '로그인 완료', sumNeedEmail: '이메일 없음', noEmailFilter: '이메일 없음', sumTotal: '명단 인원',
    addPerson: '사람 추가', team: '팀', add: '추가', saved: '저장됨',
    roleHelp: '관리자: 전체 + 확정 버튼 + 내부 메모. 임원: 전체 보기. 팀원: WAR 보기와 검토.',
    errGeneric: '저장하지 못했습니다. 다시 시도하세요.', errCode: '코드가 맞지 않거나 만료되었습니다. 새 코드를 받으세요.',
    errEmail: '이메일 주소를 확인하세요.', errRate: '요청이 너무 잦습니다. 1분 후 다시 시도하세요.',
    unknownOrg: '이 주소의 회사를 찾을 수 없습니다.', notOnRoster: '명단에 없는 사용자', shareHelp: '이메일을 모르는 사람은 이 주소로 직접 접근 요청을 보내게 하세요. 요청이 오면 명단의 이름을 골라 승인하면 이메일이 자동으로 채워집니다:', koOnly: '영문 없음 — 한국어 원문', home: '홈', back: '홈으로',
  },
  en: {
    tagline: 'The project desk for Korean contractors building on USFK installations. Task orders, proposals, submittals, permits, warranties and the weekly report, in Korean and English, in one place.',
    companies: 'Companies', openWorkspace: 'Open workspace',
    signInTitle: 'Sign in', signInLede: 'Enter your work email and we will send you a 6-digit code.',
    email: 'Email', sendCode: 'Send code', sending: 'Sending…',
    codeTitle: 'Enter your code', codeLede: (e) => `Enter the code sent to ${e}. It works for 10 minutes.`,
    code: 'Sign-in code', verify: 'Sign in', verifying: 'Checking…', otherEmail: 'Use a different email', resend: 'Send a new code',
    requestTitle: 'Request access', requestLede: 'Leave your name and an admin will approve you. This page updates once you are approved.',
    yourName: 'Name', nameEn: 'Name in English (required)', nameKo: 'Name in Korean', note: 'Note (optional)', notePh: 'e.g. Admin team, working on 26-1028', sendRequest: 'Send request',
    waitingTitle: 'Waiting for approval', waitingLede: 'Your request is with the admin. Refresh this page after you are approved.', refresh: 'Refresh',
    declinedTitle: 'No access', declinedLede: 'This account cannot open this workspace. Contact your admin.',
    otherOrgTitle: 'Account belongs to another company', otherOrgLede: 'This account is set up for another company workspace.',
    signOut: 'Sign out',
    projectsTitle: 'Projects', projectsLede: 'Awarded task orders, grouped by stage: Pre-NTP, Construction and Closeout.', proposalsTitle: 'Proposals', proposalsLede: 'Proposals already submitted, and proposals still in draft.', warrantiesTitle: 'Warranties', warrantiesLede: 'Active warranty requests and requests that are closed out.',
    stPreNtp: 'Pre-NTP', stConstruction: 'Construction', stCloseout: 'Closeout', submitted: 'Submitted', drafts: 'In draft', active: 'Active', activeRequests: 'Active requests', closedOut: 'Closed out',
    count: (n) => `${n}`, none: 'None', noDrafts: 'No proposals in draft.', stageNotSet: 'Stage not set', openQuestions: 'question(s) waiting for an answer', menu: 'Menu', teamMenu: 'Team and access', settings: 'Settings',
    latestStatus: 'Latest status', openInWar: (d) => `Open in WAR (${d})`, noStatus: 'No WAR status for this project yet.', records: 'Project records', askTitle: 'Ask a question', askPh: 'Write your question about this project in Korean or English.', askSend: 'Send question', askSent: 'Question sent',
    qOpen: 'Waiting for an answer', qAnswered: 'Answered', answerPh: 'Write your answer', qAskedBy: 'Question from', qDelete: 'Delete', qDeleteConfirm: 'Delete this question? It disappears for everyone.', qDeleted: 'Deleted', qAnsweredBy: 'Answer from', qYourAnswer: 'Your answer', qWaitNote: 'Waiting for an admin to answer. You will get an email when they do.', answer: 'Answer', questionsTitle: 'Questions', questionsLede: 'Questions asked from project pages. Admins answer them here.', noQuestions: 'No questions yet.', projectPage: 'Open the project page',
    recCount: (n, a) => `${n} · ${a} approved`, recFiles: (n) => `${n}`, recNone: 'None yet', recOpen: 'Open', recNoFile: 'No file', recNotes: 'Notes', recNotMade: 'AF 3000 not yet made (items not submitted)', recEmpty: 'Nothing here yet. This list updates every hour from the project folder in Drive and the PCES submittal register.', recLede: 'Updated every hour from the project folder in Drive and the PCES submittal register. Files open in Google Drive.', printEyebrow: 'Weekly status — all projects', printPrimeNote: 'Prime shown next to each project no.', cont: 'continued', printFoot: 'Values in KRW · full details in the Weekly Action Report', boardTitle: 'Weekly Status Board', weeksNav: 'Choose a week', backBoard: 'Back to the board', newerWeek: 'A newer week is available:', itemNo: (n) => `Item ${n}`, thisWeek: 'This week', bothLangs: 'Show Korean and English', krimaText: 'Krima sheet status text', otherWeeks: 'Other weeks', warTitle: 'Weekly Action Report', warLede: 'This week’s WAR, updated through the day, and every past week.',
    accessTitle: 'Team access', accessLede: 'People from the org chart (10_GNC_ORG). Tick who needs access, then set their email and role.',
    reviewTitle: 'Review Desk', reviewLede: 'The team answers in Korean; answers are put into English for you.',
    krimaTitle: 'Krima status sheet', krimaLede: 'Krima task orders only. Generated when the week is final.',
    soon: 'Coming next',
    projects: (n) => `${n} projects`, week: (d) => `Week of ${d}`,
    live: 'Live', review: 'In review', final: 'Final',
    carried: 'Carried from last week', updated: (t) => `Updated ${t}`,
    startReview: 'Start review', finalize: 'Finalize and lock', print: 'Print / PDF',
    confirmReview: 'Move this week to review? The team can then mark items as checked.',
    confirmFinal: 'Finalize this week? It locks and a new week opens.',
    showInternal: 'Show internal notes', internal: 'Internal notes (admin only)', open: 'To confirm',
    keyDates: 'Key dates', date: 'Date', item: 'Item', search: 'Search projects', searchPeople: 'Search people',
    noWeeks: 'No WAR yet. Docs placed in a 00_WAR week folder on Drive show up here within 15 minutes.',
    noMatch: 'No projects match.',
    pending: 'Access requests', noPending: 'No requests waiting.', matchTo: 'Who is this on the roster?', matchNone: 'Not on roster', approve: 'Approve', decline: 'Decline',
    roster: 'Roster', all: 'All', withAccess: 'Has access', withoutAccess: 'No access',
    name: 'Name', title: 'Title', needsAccess: 'Access', role: 'Role', status: 'Status',
    roleAdmin: 'Admin', roleExec: 'Executive', roleTeam: 'Team',
    stActive: 'Signed in', stInvited: 'Invited', stNeedsEmail: 'Needs email', stOff: '—', stDeparted: 'Left', stDeclined: 'Turned off',
    sumAccess: 'Have access', sumActive: 'Signed in', sumNeedEmail: 'No email yet', noEmailFilter: 'No email yet', sumTotal: 'On roster',
    addPerson: 'Add a person', team: 'Team', add: 'Add', saved: 'Saved',
    roleHelp: 'Admin: everything, the Final button and internal notes. Executive: sees everything. Team: reads the WAR and reviews.',
    errGeneric: 'Could not save. Try again.', errCode: 'That code is wrong or expired. Send a new code.',
    errEmail: 'Check the email address.', errRate: 'Too many tries. Wait a minute and try again.',
    unknownOrg: 'No company uses this address.', notOnRoster: 'Signed-in users not on the roster', shareHelp: 'For anyone without an email here, share this link. They sign in with their own email and request access; you pick their name from the roster and approve, and their email fills in:', koOnly: 'No English text in the source doc yet. Korean original shown.', home: 'Home', back: 'Back to home',
  },
};
// English by default. Each person's choice is kept on this device and, once signed in, on their account.
let lang = 'en';
try { lang = localStorage.getItem('gd.lang') || 'en'; } catch { lang = 'en'; }
const t = (k, ...a) => { const v = T[lang][k] ?? T.en[k] ?? k; return typeof v === 'function' ? v(...a) : v; };
const pick = (ko, en) => (lang === 'ko' ? (ko || en) : (en || ko)) || '';

// ---------------------------------------------------------------- helpers
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
function toast(text) {
  const el = document.createElement('div');
  el.className = 'toast'; el.setAttribute('role', 'status'); el.textContent = text;
  document.body.append(el); setTimeout(() => el.remove(), 2200);
}
function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso.length === 10 ? iso + 'T00:00:00+09:00' : iso);
  return lang === 'ko'
    ? d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short', timeZone: 'Asia/Seoul' })
    : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', weekday: 'short', timeZone: 'Asia/Seoul' });
}
function fmtTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString(lang === 'ko' ? 'ko-KR' : 'en-GB',
    { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Seoul' });
}
const grainSvg = (cls, rows = 9) => {
  let paths = '';
  for (let i = 0; i < rows; i++) {
    const y = 40 + i * 46; const a = 18 + (i % 3) * 10;
    paths += `<path d="M-20 ${y} C 160 ${y - a}, 300 ${y + a}, 480 ${y} S 820 ${y - a}, 1020 ${y + 6}"/>`;
  }
  return `<svg class="${cls}" viewBox="0 0 1000 460" preserveAspectRatio="none" aria-hidden="true">${paths}</svg>`;
};
const logoHtml = (org, variant = 'mark') => {
  const initials = (org.slug || 'G').toUpperCase().slice(0, 3);
  const style = org.brand_color ? ` style="background:${esc(org.brand_color)}"` : '';
  const src = variant === 'wide' ? (lang === 'en' && org.logo_wide_en_url) || org.logo_wide_url || org.logo_url : org.logo_url;
  if (src) return `<img class="org-img ${variant}" src="${esc(src)}" alt="${esc(org.name)}">`;
  return `<span class="org-logo"${style} aria-hidden="true">${esc(initials)}</span>`;
};
function errText(e) {
  const m = String(e?.message || e || '');
  if (/rate|too many|seconds/i.test(m)) return t('errRate');
  if (/expired|invalid|token/i.test(m)) return t('errCode');
  if (/own admin/i.test(m)) return m;
  return t('errGeneric');
}

// ---------------------------------------------------------------- tenant
function tenantSlug() {
  const q = new URLSearchParams(location.search).get('org');
  if (q) return q.toLowerCase();
  const host = location.hostname.toLowerCase();
  if (host.endsWith('.' + ROOT_DOMAIN)) {
    const sub = host.slice(0, -(ROOT_DOMAIN.length + 1));
    if (sub && sub !== 'www') return sub;
  }
  return null;
}
const orgUrl = (slug) => (location.hostname.endsWith(ROOT_DOMAIN) ? `https://${slug}.${ROOT_DOMAIN}/` : `?org=${slug}`);

const state = { slug: tenantSlug(), org: null, orgId: null, user: null, profile: null };
const isAdmin = () => state.profile?.status === 'approved' && state.profile?.role === 'admin';

// ---------------------------------------------------------------- portal
async function renderPortal() {
  document.title = 'Gyeoldesk 결';
  app.innerHTML = `
    <div class="portal">
      <header class="portal-hero">
        ${grainSvg('grain', 11)}
        <h1 class="wordmark" translate="no"><span class="ko" lang="ko">결</span><span class="en">Gyeoldesk</span></h1>
        <p>${esc(t('tagline'))}</p>
      </header>
      <main class="portal-main">
        <h2>${esc(t('companies'))}</h2>
        <div class="org-grid" id="orgs"><p class="empty">…</p></div>
      </main>
      <footer class="portal-foot">gyeoldesk.com
        <span class="lang" style="margin-left:12px">${langButtons()}</span></footer>
    </div>`;
  bindLang();
  const { data, error } = await sb.rpc('org_directory');
  const box = $('#orgs');
  if (error || !data?.length) { box.innerHTML = '<p class="empty">—</p>'; return; }
  box.innerHTML = data.map((o) => `
    <a class="org-card${o.logo_wide_url ? ' has-logo' : ''}" href="${esc(orgUrl(o.slug))}">
      ${o.logo_wide_url ? logoHtml(o, 'wide') : logoHtml(o)}
      <span>${o.logo_wide_url ? '' : `<span class="name">${esc(pick(o.name_ko, o.name))}</span><br>`}
      <span class="sub">${esc(o.slug)}.${ROOT_DOMAIN}</span></span>
    </a>`).join('');
}

// ---------------------------------------------------------------- workspace shell
function langButtons() {
  return `<button type="button" data-lang="ko" aria-pressed="${lang === 'ko'}">한국어</button><button type="button" data-lang="en" aria-pressed="${lang === 'en'}">EN</button>`;
}
function bindLang() {
  $$('[data-lang]').forEach((b) => b.addEventListener('click', () => {
    lang = b.dataset.lang; try { localStorage.setItem('gd.lang', lang); } catch {}
    document.documentElement.lang = lang;
    if (state.user) { sb.rpc('set_my_lang', { l: lang }); if (state.profile) state.profile.lang = lang; }
    route();
  }));
}
function shell(crumb, inner) {
  const org = state.org;
  app.innerHTML = `
    <header class="top"><div class="top-in">
      <a class="org" href="#/">${logoHtml(org)}<span class="org-name">${esc(pick(org.name_ko, org.name))}</span></a>
      ${crumb ? `<span class="crumb">/ ${esc(crumb)}</span>` : ''}
      <span class="spacer"></span>
      <span class="lang">${langButtons()}</span>
      ${state.user ? `<span class="who"><span class="addr">${esc(state.user.email)}</span><button type="button" id="signout">${esc(t('signOut'))}</button></span>` : ''}
      ${state.profile?.status === 'approved' ? `<div class="menu"><button type="button" id="menuBtn" aria-expanded="false" aria-controls="menuList" aria-label="${esc(t('menu'))}">☰</button>
        <nav id="menuList" hidden>
          <a href="#/">${esc(t('home'))}</a>
          <a href="#/questions">${esc(t('questionsTitle'))}</a>
          ${isAdmin() ? `<a href="#/access">${esc(t('teamMenu'))}</a>` : ''}
          <span class="soon-item">${esc(t('settings'))} <span class="chip muted">${esc(t('soon'))}</span></span>
          <button type="button" class="menu-out" id="signout2">${esc(t('signOut'))}<small>${esc(state.user?.email || '')}</small></button>
        </nav></div>` : ''}
    </div></header>
    <main class="page" id="main">${inner}</main>`;
  bindLang();
  const out = async () => { await sb.auth.signOut(); state.user = null; state.profile = null; route(); };
  $('#signout')?.addEventListener('click', out);
  $('#signout2')?.addEventListener('click', out);
  const mb = $('#menuBtn'); const ml = $('#menuList');
  mb?.addEventListener('click', (e) => { e.stopPropagation(); ml.hidden = !ml.hidden; mb.setAttribute('aria-expanded', String(!ml.hidden)); });
  document.addEventListener('click', () => { if (ml && !ml.hidden) { ml.hidden = true; mb.setAttribute('aria-expanded', 'false'); } }, { once: true });
}
function gate(inner) {
  shell('', `<div class="gate"><div class="gate-card"><div class="gate-logo">${logoHtml(state.org, 'wide')}</div>${inner}</div></div>`);
}

// ---------------------------------------------------------------- sign-in
function renderEmailStep(prefill = '', message = '') {
  gate(`
    <h1>${esc(t('signInTitle'))}</h1><p>${esc(t('signInLede'))}</p>
    ${message ? `<div class="msg err" role="alert">${esc(message)}</div>` : ''}
    <form id="f" novalidate>
      <div class="field"><label for="em">${esc(t('email'))}</label>
        <input id="em" type="email" autocomplete="email" inputmode="email" required value="${esc(prefill)}"></div>
      <button class="btn" type="submit">${esc(t('sendCode'))}</button>
    </form>`);
  $('#em').focus();
  $('#f').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const email = $('#em').value.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return renderEmailStep(email, t('errEmail'));
    const btn = ev.submitter || $('button', ev.target); btn.disabled = true; btn.textContent = t('sending');
    const { error } = await sb.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    if (error) return renderEmailStep(email, errText(error));
    renderCodeStep(email);
  });
}
function renderCodeStep(email, message = '') {
  gate(`
    <h1>${esc(t('codeTitle'))}</h1><p>${esc(t('codeLede', email))}</p>
    ${message ? `<div class="msg err" role="alert">${esc(message)}</div>` : ''}
    <form id="f" novalidate>
      <div class="field"><label for="cd">${esc(t('code'))}</label>
        <input id="cd" class="code-input" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="8" pattern="[0-9]*" required></div>
      <button class="btn" type="submit">${esc(t('verify'))}</button>
    </form>
    <p style="margin:16px 0 0;display:flex;justify-content:space-between;gap:12px">
      <button class="linkish" type="button" id="other">${esc(t('otherEmail'))}</button>
      <button class="linkish" type="button" id="again">${esc(t('resend'))}</button></p>`);
  const input = $('#cd'); input.focus();
  input.addEventListener('input', () => { input.value = input.value.replace(/\D/g, ''); if (input.value.length === 6) $('#f').requestSubmit(); });
  $('#other').addEventListener('click', () => renderEmailStep(email));
  $('#again').addEventListener('click', async () => {
    const { error } = await sb.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    error ? renderCodeStep(email, errText(error)) : toast(t('sendCode') + ' ✓');
  });
  $('#f').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const token = input.value.trim();
    if (token.length < 6) return;
    const btn = $('button[type=submit]', ev.target); btn.disabled = true; btn.textContent = t('verifying');
    const { data, error } = await sb.auth.verifyOtp({ email, token, type: 'email' });
    if (error) return renderCodeStep(email, errText(error));
    state.user = data.user; await loadProfile(); route();
  });
}

async function loadProfile() {
  if (!state.user) { state.profile = null; return; }
  const { data } = await sb.from('profiles').select('user_id,org_id,email,name,role,status,requested_note,lang').eq('user_id', state.user.id).maybeSingle();
  state.profile = data || null;
  if (data?.lang && data.lang !== lang) { lang = data.lang; try { localStorage.setItem('gd.lang', lang); } catch {} }
  if (state.profile?.status === 'approved' && !state.orgId) {
    const { data: o } = await sb.from('orgs').select('id').eq('slug', state.slug).maybeSingle();
    state.orgId = o?.id || null;
  }
}

function renderRequest() {
  gate(`
    <h1>${esc(t('requestTitle'))}</h1><p>${esc(t('requestLede'))}</p>
    <form id="f">
      <div class="field"><label for="nm">${esc(t('nameEn'))}</label><input id="nm" type="text" autocomplete="name" required maxlength="60" placeholder="Ra-Hee Kim"></div>
      <div class="field"><label for="nk">${esc(t('nameKo'))}</label><input id="nk" type="text" maxlength="30" placeholder="김라희"></div>
      <div class="field"><label for="nt">${esc(t('note'))}</label><input id="nt" type="text" maxlength="500" placeholder="${esc(t('notePh'))}"></div>
      <button class="btn" type="submit">${esc(t('sendRequest'))}</button>
    </form>`);
  $('#nm').focus();
  $('#f').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const en = $('#nm').value.trim(); const ko = $('#nk').value.trim();
    if (!en) return $('#nm').focus();
    const { error } = await sb.rpc('request_access', { org_slug: state.slug, full_name: ko ? `${en} (${ko})` : en, note: $('#nt').value });
    if (error) return toast(errText(error));
    await loadProfile(); route();
  });
}
function renderNotice(titleKey, ledeKey, withRefresh) {
  gate(`<h1>${esc(t(titleKey))}</h1><p>${esc(t(ledeKey))}</p>
    ${withRefresh ? `<button class="btn" type="button" id="rf">${esc(t('refresh'))}</button>` : ''}`);
  $('#rf')?.addEventListener('click', async () => { await loadProfile(); route(); });
}

// ---------------------------------------------------------------- home
// ---------------------------------------------------------------- WAR
const warView = { q: '', both: false };
const STAGES = [
  { k: 'construction', en: 'Construction', ko: '시공', den: 'NTP issued, work on site', dko: '착공 후 현장 작업', c: '#1F6B3A' },
  { k: 'pre-ntp', en: 'Pre-NTP', ko: '착공 전', den: 'Submittals and permits before start', dko: '착공 전 제출물·허가', c: '#2A4FA3' },
  { k: 'closeout', en: 'Closeout', ko: '준공 정산', den: 'Work done, payment open', dko: '작업 완료, 기성 진행', c: '#8A6A12' },
  { k: 'bid', en: 'Bid', ko: '입찰', den: 'Quoted, awaiting award', dko: '견적 제출, 낙찰 대기', c: '#1D6E6E' },
  { k: 'warranty', en: 'Warranty', ko: '하자보수', den: 'Warranty clocks running', dko: '하자 기간 진행 중', c: '#8E1F3F' },
  { k: 'other', en: 'Other', ko: '기타', den: 'Stage not set yet', dko: '단계 미지정', c: '#5B6775' },
];
const PRIMES = { krima: 'KRIMA', livart: 'LIVART', gnc: 'GNC', geumjang: 'GEUMJANG' };
function stageOf(p, f) {
  const s = String(p?.stage || f?.stage || '').toLowerCase();
  if (s.includes('warrant')) return 'warranty';
  if (s.includes('pre')) return 'pre-ntp';
  if (s.includes('close')) return 'closeout';
  if (s.includes('bid')) return 'bid';
  if (s.includes('constr')) return 'construction';
  return 'other';
}
const primeOf = (p, f) => String(p?.prime || f?.prime || '').toLowerCase();
const keyLabel = (k) => (/^\d{2}-\d{4}$/.test(k || '') ? `SMYU ${k}` : (k || ''));
const primeTag = (pr) => (pr ? `<span class="prime prime-${esc(pr)}">${esc(PRIMES[pr] || pr.toUpperCase())}</span>` : '');
function factsBox(facts) {
  if (!facts?.length) return '';
  return `<dl class="facts">${facts.map((x) => `<dt>${esc(lang === 'ko' ? (x.ko || x.en) : x.en)}</dt><dd>${esc(x.v)}</dd>`).join('')}</dl>`;
}
function upcoming(kd, warDate, n = 2) {
  return (kd || []).filter((r) => r.date_text && (!r.date || r.date >= warDate)).sort((a, b) => String(a.date || '9').localeCompare(String(b.date || '9'))).slice(0, n);
}
function bullets(list) {
  return `<ul>${(list || []).map((x) => x.startsWith('· ') ? `<li class="sub">${esc(x)}</li>` : `<li>${esc(x)}</li>`).join('')}</ul>`;
}
const latestSnap = (it) => it.snapshots?.[0] || {};

async function loadWeeks() {
  const { data, error } = await sb.from('weeks').select('id,war_date,status,rev,final_at,review_at').order('war_date', { ascending: false }).order('rev', { ascending: false });
  if (error) throw error;
  return data;
}
function weekNav(weeks, current, suffix = '') {
  return `<nav class="weeks" aria-label="${esc(t('weeksNav'))}">${weeks.map((w) => `
    <a href="#/war/${w.war_date}${suffix}" ${w.id === current.id ? 'aria-current="page"' : ''}>
      <span class="d">${esc(fmtDate(w.war_date))}</span><span class="chip ${w.status}">${esc(t(w.status))}</span></a>`).join('')}</nav>`;
}

async function renderWar(dateParam) {
  shell('WAR', `<div id="war"><p class="empty">…</p></div>`);
  const box = $('#war');
  let weeks;
  try { weeks = await loadWeeks(); } catch { box.innerHTML = `<div class="msg err">${esc(t('errGeneric'))}</div>`; return; }
  if (!weeks.length) { box.innerHTML = `<h1>${esc(t('warTitle'))}</h1><p class="lede">${esc(t('noWeeks'))}</p>`; return; }
  const wk = weeks.find((w) => w.war_date === dateParam) || weeks[0];

  const { data: items, error } = await sb.from('items')
    .select('id,item_no,projects(project_key,pid,title_ko,title_en,prime,stage,facts,installation),snapshots(id,captured_at,source_modified_at,fields,ko,en,key_dates)')
    .eq('week_id', wk.id)
    .order('source_modified_at', { referencedTable: 'snapshots', ascending: false })
    .limit(1, { referencedTable: 'snapshots' });
  if (error) { box.innerHTML = `<div class="msg err">${esc(t('errGeneric'))}</div>`; return; }
  items.sort((a, b) => (parseInt(a.item_no, 10) || 999) - (parseInt(b.item_no, 10) || 999));
  const lastUpdate = items.map((i) => latestSnap(i).captured_at).filter(Boolean).sort().pop();

  const adminActions = isAdmin() && wk.status !== 'final'
    ? `${wk.status === 'live' ? `<button class="btn quiet" id="toReview">${esc(t('startReview'))}</button>` : ''}
       <button class="btn" id="toFinal">${esc(t('finalize'))}</button>` : '';
  box.innerHTML = `
    <div class="war-head">
      <div class="title"><h1>${esc(t('boardTitle'))}</h1>
        <p class="lede" style="margin:0">${esc(fmtDate(wk.war_date))} <span class="chip ${wk.status}">${esc(t(wk.status))}</span>
        ${esc(t('projects', items.length))}${lastUpdate ? ` <span class="item-key">${esc(t('updated', fmtTime(lastUpdate)))}</span>` : ''}</p></div>
      <div class="actions">${adminActions}<button class="btn quiet" id="print">${esc(t('print'))}</button></div>
    </div>
    ${weekNav(weeks, wk)}
    <div class="war-tools">
      <input type="search" id="q" placeholder="${esc(t('search'))}" value="${esc(warView.q)}" aria-label="${esc(t('search'))}">
      <span class="legend">${STAGES.filter((s) => s.k !== 'other').map((s) => `<span><i style="background:${s.c}"></i>${esc(lang === 'ko' ? s.ko : s.en)}</span>`).join('')}</span>
    </div>
    <div id="board"></div>`;

  const draw = () => {
    const q = warView.q.toLowerCase();
    const list = items.filter((it) => !q || JSON.stringify([it.projects, latestSnap(it).ko, latestSnap(it).en]).toLowerCase().includes(q));
    const groups = STAGES.map((s) => ({ s, cards: list.filter((it) => stageOf(it.projects, latestSnap(it).fields) === s.k) })).filter((g) => g.cards.length);
    $('#board').innerHTML = groups.length ? groups.map(({ s, cards }) => `
      <section class="stage" style="--stage:${s.c}">
        <h2>${esc(lang === 'ko' ? s.ko : s.en)} <span>${esc(lang === 'ko' ? s.dko : s.den)}</span></h2>
        <div class="board">${cards.map((it) => boardCard(it, wk, s)).join('')}</div>
      </section>`).join('') : `<p class="empty">${esc(t('noMatch'))}</p>`;
  };
  draw();
  $('#q').addEventListener('input', (e) => { warView.q = e.target.value; draw(); });
  warView.printData = { wk, items };
  $('#print').addEventListener('click', () => printBoard());
  $('#toReview')?.addEventListener('click', async () => {
    if (!confirm(t('confirmReview'))) return;
    const { error: er } = await sb.rpc('set_week_review', { w: wk.id }); if (er) return toast(errText(er)); renderWar(wk.war_date);
  });
  $('#toFinal')?.addEventListener('click', async () => {
    if (!confirm(t('confirmFinal'))) return;
    const { error: er } = await sb.rpc('finalize_week', { w: wk.id }); if (er) return toast(errText(er)); renderWar(wk.war_date);
  });
}

function boardCard(it, wk, s) {
  const sn = latestSnap(it); const p = it.projects || {}; const f = sn.fields || {};
  const title = pick(f.title_ko || p.title_ko, f.title_en || p.title_en);
  const body = lang === 'ko' ? (sn.ko?.length ? sn.ko : sn.en) : (sn.en?.length ? sn.en : sn.ko);
  const dates = upcoming(sn.key_dates, wk.war_date);
  return `
    <a class="bcard" href="#/war/${wk.war_date}/${encodeURIComponent(p.project_key)}">
      <div class="bc-top"><span class="bc-key">${esc(keyLabel(p.project_key))}</span>${primeTag(primeOf(p, f))}
        <span class="bc-stage">${esc(lang === 'ko' ? s.ko : s.en)}</span></div>
      <h3>${esc(title)}</h3>
      ${p.installation ? `<div class="tags">${instTag(p)}</div>` : ''}
      ${factsBox(p.facts)}
      <ul class="clamp">${(body || []).filter((x) => !x.startsWith('· ')).slice(0, 4).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      ${dates.length ? `<div class="bc-dates">${dates.map((r) => `<div><b>${esc(r.date_text.replace(/\s*\(.+\)$/, ''))}</b><span>${esc(pick(r.ko, r.en))}</span></div>`).join('')}</div>` : ''}
      ${f.status === 'carried' ? `<span class="chip muted bc-carried">${esc(t('carried'))}</span>` : ''}
    </a>`;
}

// ---------------------------------------------------------------- Print: landscape WAR Board
const PRINT_COLS = 7;
function printCard(it, wk, s) {
  const sn = latestSnap(it); const p = it.projects || {}; const f = sn.fields || {};
  const body = lang === 'ko' ? (sn.ko?.length ? sn.ko : sn.en) : (sn.en?.length ? sn.en : sn.ko);
  const dates = upcoming(sn.key_dates, wk.war_date, 2);
  return `<div class="pc" style="--stage:${s.c}">
    <div class="pc-top"><span>${esc(keyLabel(p.project_key))}</span>${primeTag(primeOf(p, f))}</div>
    <div class="pc-stage">${p.pid ? `<span class="pc-pid">${esc(p.pid)}</span> ` : ''}${esc(lang === 'ko' ? s.ko : s.en)}${p.installation ? ` <span class="pc-inst">${esc(p.installation)}</span>` : ''}</div>
    <div class="pc-title">${esc(pick(f.title_ko || p.title_ko, f.title_en || p.title_en))}</div>
    ${p.facts?.length ? `<dl class="pc-facts">${p.facts.map((x) => `<dt>${esc(lang === 'ko' ? (x.ko || x.en) : x.en)}</dt><dd>${esc(x.v)}</dd>`).join('')}</dl>` : ''}
    <ul>${(body || []).filter((x) => !x.startsWith('· ')).slice(0, 4).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    ${dates.length ? `<div class="pc-dates">${dates.map((r) => `<div><b>${esc(r.date_text.replace(/\s*\(.+\)$/, ''))}</b><span>${esc(pick(r.ko, r.en))}</span></div>`).join('')}</div>` : ''}
  </div>`;
}
function printBoard() {
  const d = warView.printData; if (!d) return window.print();
  const { wk, items } = d;
  const groups = STAGES.map((s) => ({ s, cards: items.filter((it) => stageOf(it.projects, latestSnap(it).fields) === s.k) })).filter((g) => g.cards.length);
  // Pack stage sections into rows of PRINT_COLS cards, like the paper board: small stages share a row.
  const rows = []; let cur = []; let used = 0;
  const flush = () => { if (cur.length) rows.push(cur); cur = []; used = 0; };
  for (const g of groups) {
    for (let i = 0; i < g.cards.length; i += PRINT_COLS) {
      const chunk = { s: g.s, cards: g.cards.slice(i, i + PRINT_COLS), cont: i > 0 };
      if (used + chunk.cards.length > PRINT_COLS) flush();
      cur.push(chunk); used += chunk.cards.length;
      if (used === PRINT_COLS) flush();
    }
  }
  flush();
  const org = state.org;
  const date = new Date(wk.war_date + 'T00:00:00+09:00');
  const big = date.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Seoul' }).toUpperCase().replace(',', '');
  const html = `
    <header class="pb-head">
      <div><div class="pb-eyebrow">${esc(org.slug.toUpperCase())} · ${esc(t('printEyebrow'))}</div>
        <h1>[WAR] ${esc(t('boardTitle'))}</h1></div>
      <div class="pb-date"><b>${esc(big)}</b><span>${esc(t(wk.status))} · ${esc(t('projects', items.length))}</span></div>
    </header>
    <div class="pb-legend">${STAGES.filter((s) => s.k !== 'other').map((s) => `<span><i style="background:${s.c}"></i>${esc(lang === 'ko' ? s.ko : s.en)}</span>`).join('')}<span class="pb-note">${esc(t('printPrimeNote'))}</span></div>
    ${rows.map((row) => `<div class="pb-row">${row.map((c) => `
      <section class="pb-sec" style="grid-column: span ${c.cards.length}; --n:${c.cards.length}; --stage:${c.s.c}">
        <h2>${esc(lang === 'ko' ? c.s.ko : c.s.en)}${c.cont ? ` (${esc(t('cont'))})` : ` <span>${esc(lang === 'ko' ? c.s.dko : c.s.den)}</span>`}</h2>
        <div class="pb-cards">${c.cards.map((it) => printCard(it, wk, c.s)).join('')}</div>
      </section>`).join('')}</div>`).join('')}
    <footer class="pb-foot"><span>${esc(t('printFoot'))}</span><span>${esc(pick(org.name_ko, org.name))} · gyeoldesk.com</span></footer>`;
  let root = document.getElementById('print-root');
  if (!root) { root = document.createElement('div'); root.id = 'print-root'; document.body.append(root); }
  root.innerHTML = html;
  // Measure at landscape page width. If the board is only a little taller than one sheet, shrink it to fit;
  // otherwise let rows continue on further landscape sheets.
  root.style.zoom = ''; root.classList.add('measure');
  const PAGE_H = 720; const h = root.scrollHeight;
  root.classList.remove('measure');
  if (h > PAGE_H && h <= PAGE_H * 1.45) root.style.zoom = String(Math.floor((PAGE_H / h) * 100) / 100);
  document.body.classList.add('printing-board');
  const done = () => { document.body.classList.remove('printing-board'); window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done);
  setTimeout(() => window.print(), 50);
}

async function renderProject(dateParam, keyParam) {
  const key = decodeURIComponent(keyParam);
  shell('WAR', `<div id="proj"><p class="empty">…</p></div>`);
  const box = $('#proj');
  let weeks;
  try { weeks = await loadWeeks(); } catch { box.innerHTML = `<div class="msg err">${esc(t('errGeneric'))}</div>`; return; }
  const wk = weeks.find((w) => w.war_date === dateParam) || weeks[0];
  const intl = isAdmin() ? ',snapshots_internal(internal_notes,open_items)' : '';
  const { data: rows, error } = await sb.from('items')
    .select(`id,item_no,week_id,projects!inner(project_key,title_ko,title_en,prime,stage,facts,installation),snapshots(id,captured_at,source_modified_at,fields,ko,en,krima_ko,krima_en,key_dates,payments${intl})`)
    .eq('projects.project_key', key)
    .order('source_modified_at', { referencedTable: 'snapshots', ascending: false });
  if (error) { box.innerHTML = `<div class="msg err">${esc(t('errGeneric'))}</div>`; return; }
  const weekById = new Map(weeks.map((w) => [w.id, w]));
  const appearances = rows.map((r) => ({ r, w: weekById.get(r.week_id) })).filter((x) => x.w).sort((a, b) => b.w.war_date.localeCompare(a.w.war_date));
  const here = appearances.find((x) => x.w.id === wk.id) || appearances[0];
  if (!here) { box.innerHTML = `<p class="empty">${esc(t('noMatch'))}</p><a class="btn quiet" href="#/war/${wk.war_date}">${esc(t('backBoard'))}</a>`; return; }
  const it = here.r; const w = here.w; const p = it.projects || {}; const sn = latestSnap(it); const f = sn.fields || {};
  const st = STAGES.find((s) => s.k === stageOf(p, f));
  const newest = appearances[0];
  const ko = sn.ko || []; const en = sn.en || [];
  const main = lang === 'ko' ? (ko.length ? ko : en) : (en.length ? en : ko);
  const alt = lang === 'ko' ? en : ko;
  const krima = lang === 'ko' ? (sn.krima_ko?.length ? sn.krima_ko : sn.krima_en) : (sn.krima_en?.length ? sn.krima_en : sn.krima_ko);
  const si = Array.isArray(sn.snapshots_internal) ? sn.snapshots_internal[0] : sn.snapshots_internal;
  const kd = (sn.key_dates || []).filter((r) => r.date_text);

  box.innerHTML = `
    <p class="no-print"><a href="#/war/${w.war_date}">← ${esc(t('backBoard'))} (${esc(fmtDate(w.war_date))})</a></p>
    ${newest.w.id !== w.id ? `<div class="msg ok no-print">${esc(t('newerWeek'))} <a href="#/war/${newest.w.war_date}/${encodeURIComponent(key)}">${esc(fmtDate(newest.w.war_date))}</a></div>` : ''}
    <article class="detail" style="--stage:${st.c}">
      <div class="bc-top"><span class="bc-key">${esc(keyLabel(p.project_key))}</span>${primeTag(primeOf(p, f))}
        <span class="bc-stage">${esc(lang === 'ko' ? st.ko : st.en)}</span>
        <span class="spacer"></span>${instTag(p)}<span class="item-key">${esc(t('itemNo', it.item_no || '–'))}</span></div>
      <p class="no-print" style="margin:6px 0 0"><a href="#/p/${encodeURIComponent(key)}">${esc(t('projectPage'))}</a></p>
      <h1>${esc(pick(f.title_ko || p.title_ko, f.title_en || p.title_en))}</h1>
      <p class="alt">${esc(lang === 'ko' ? (f.title_en || p.title_en || '') : (f.title_ko || p.title_ko || ''))}</p>
      <p class="item-key">${esc(fmtDate(w.war_date))} <span class="chip ${w.status}">${esc(t(w.status))}</span>
        ${sn.captured_at ? esc(t('updated', fmtTime(sn.captured_at))) : ''}${f.status === 'carried' ? ` <span class="chip muted">${esc(t('carried'))}</span>` : ''}</p>
      ${factsBox(p.facts)}
      <section><div class="sec-head"><h2>${esc(t('thisWeek'))}</h2>
        ${alt.length ? `<label class="toggle no-print"><input type="checkbox" id="both" ${warView.both ? 'checked' : ''}> ${esc(t('bothLangs'))}</label>` : ''}</div>
        <div class="${warView.both && alt.length ? 'two' : ''}">
          <div>${!en.length && lang === 'en' && ko.length ? `<p class="alt">${esc(t('koOnly'))}</p>` : ''}${bullets(main)}</div>
          ${warView.both && alt.length ? `<div class="altcol" lang="${lang === 'ko' ? 'en' : 'ko'}">${bullets(alt)}</div>` : ''}
        </div></section>
      ${kd.length ? `<section><h2>${esc(t('keyDates'))}</h2><table class="kd">
        <thead><tr><th scope="col">${esc(t('date'))}</th><th scope="col">${esc(t('item'))}</th></tr></thead>
        <tbody>${kd.map((r) => `<tr><td>${esc(r.date_text)}</td><td>${esc(pick(r.ko, r.en))}${warView.both ? `<div class="alt">${esc(lang === 'ko' ? r.en : r.ko)}</div>` : ''}</td></tr>`).join('')}</tbody></table></section>` : ''}
      ${krima?.length ? `<section><h2>${esc(t('krimaText'))}</h2>${bullets(krima)}</section>` : ''}
      ${si && ((si.internal_notes || []).length || (si.open_items || []).length) ? `<section class="internal no-print">
        ${(si.internal_notes || []).length ? `<h3>${esc(t('internal'))}</h3>${bullets(si.internal_notes)}` : ''}
        ${(si.open_items || []).length ? `<h3>${esc(t('open'))}</h3><ul>${si.open_items.map((o) => `<li class="${o.done ? 'done' : ''}">${esc(o.text)}</li>`).join('')}</ul>` : ''}
      </section>` : ''}
      ${appearances.length > 1 ? `<section class="no-print"><h2>${esc(t('otherWeeks'))}</h2><nav class="weeks">${appearances.map(({ w: aw }) => `
        <a href="#/war/${aw.war_date}/${encodeURIComponent(key)}" ${aw.id === w.id ? 'aria-current="page"' : ''}><span class="d">${esc(fmtDate(aw.war_date))}</span><span class="chip ${aw.status}">${esc(t(aw.status))}</span></a>`).join('')}</nav></section>` : ''}
    </article>`;
  $('#both')?.addEventListener('change', (e) => { warView.both = e.target.checked; renderProject(dateParam, keyParam); });
}

async function renderHome() {
  shell('', `<h1 class="sr">${esc(t('home'))}</h1><div class="desk" id="tiles"><p class="empty">…</p></div><div id="qstrip"></div>`);
  const [{ data: projects }, { data: weeks }, { data: qs }] = await Promise.all([
    sb.from('projects').select('id,stage,proposal_status,warranty_status'),
    sb.from('weeks').select('id,war_date,status,rev').order('war_date', { ascending: false }).order('rev', { ascending: false }).limit(1),
    sb.from('questions').select('id,status').eq('status', 'open'),
  ]);
  const ps = projects || [];
  const wk = weeks?.[0];
  const n = (f) => ps.filter(f).length;

  const tile = (href, title, lede, stats, main = false) => `
    <a class="dtile${main ? ' main' : ''}" href="${href}">
      ${main ? grainSvg('grain', 7) : ''}
      <h2>${esc(title)}</h2><p>${esc(lede)}</p>
      <span class="stat">${stats}</span>
    </a>`;
  const stat = (num, label) => `<span class="num"><b>${num}</b>${esc(label)}</span>`;
  $('#tiles').innerHTML =
    tile('#/projects', t('projectsTitle'), t('projectsLede'),
      stat(n((p) => stageKey(p) === 'pre-ntp'), t('stPreNtp')) + stat(n((p) => stageKey(p) === 'construction'), t('stConstruction')) + stat(n((p) => stageKey(p) === 'closeout'), t('stCloseout')), true) +
    tile('#/proposals', t('proposalsTitle'), t('proposalsLede'),
      stat(n((p) => p.proposal_status === 'submitted' || (!p.proposal_status && stageKey(p) === 'bid')), t('submitted')) + stat(n((p) => p.proposal_status === 'draft'), t('drafts'))) +
    tile(wk ? `#/war/${wk.war_date}` : '#/war', 'WAR', t('warLede'),
      wk ? `<span class="chip ${wk.status}">${esc(t(wk.status))}</span> <span>${esc(fmtDate(wk.war_date))}</span>` : esc(t('noWeeks'))) +
    tile('#/warranties', t('warrantiesTitle'), t('warrantiesLede'),
      stat(n((p) => p.warranty_status === 'active' || (!p.warranty_status && stageKey(p) === 'warranty')), t('active')) + stat(n((p) => p.warranty_status === 'closed'), t('closedOut')));

  const open = qs?.length || 0;
  $('#qstrip').innerHTML = open ? `<a class="qstrip" href="#/questions"><b>${open}</b> ${esc(t('openQuestions'))}</a>` : '';
}

// ---------------------------------------------------------------- Desk lists
function stageKey(p) { return stageOf(p, {}); }
function isAwarded(p) { return ['pre-ntp', 'construction', 'closeout'].includes(stageKey(p)) || (!p.stage && !p.proposal_status && !p.warranty_status); }
const instTag = (p) => (p?.installation ? `<span class="inst">${esc(p.installation)}</span>` : '');
function projectCard(p, href) {
  const s = STAGES.find((x) => x.k === stageKey(p));
  return `
    <a class="bcard pcard" href="${href}" style="--stage:${s.c}">
      <div class="bc-top"><span class="bc-key">${esc(keyLabel(p.project_key))}</span>${primeTag(primeOf(p, {}))}
        <span class="bc-stage">${esc(lang === 'ko' ? s.ko : s.en)}</span></div>
      <h3>${esc(pick(p.title_ko, p.title_en))}</h3>
      <div class="tags">${instTag(p)}${p.pid ? `<span class="inst muted">${esc(p.pid)}</span>` : ''}</div>
      ${factsBox(p.facts)}
    </a>`;
}
async function listPage(crumb, title, lede, groups) {
  shell(crumb, `<h1>${esc(title)}</h1><p class="lede">${esc(lede)}</p><div id="list"><p class="empty">…</p></div>`);
  const { data, error } = await sb.from('projects').select('*').order('project_key');
  if (error) { $('#list').innerHTML = `<div class="msg err">${esc(t('errGeneric'))}</div>`; return; }
  $('#list').innerHTML = groups.map((g) => {
    const rows = data.filter(g.test);
    return `<section class="stage" style="--stage:${g.c}"><h2>${esc(g.title)} <span>${esc(t('count', rows.length))}</span></h2>
      ${rows.length ? `<div class="board">${rows.map((p) => projectCard(p, `#/p/${encodeURIComponent(p.project_key)}`)).join('')}</div>`
        : `<p class="empty">${esc(g.empty)}</p>`}</section>`;
  }).join('');
}
function renderProjects() {
  const st = (k) => STAGES.find((s) => s.k === k);
  return listPage(t('projectsTitle'), t('projectsTitle'), t('projectsLede'), [
    { title: lang === 'ko' ? st('pre-ntp').ko : st('pre-ntp').en, c: st('pre-ntp').c, test: (p) => stageKey(p) === 'pre-ntp', empty: t('none') },
    { title: lang === 'ko' ? st('construction').ko : st('construction').en, c: st('construction').c, test: (p) => stageKey(p) === 'construction', empty: t('none') },
    { title: lang === 'ko' ? st('closeout').ko : st('closeout').en, c: st('closeout').c, test: (p) => stageKey(p) === 'closeout', empty: t('none') },
    { title: t('stageNotSet'), c: st('other').c, test: (p) => stageKey(p) === 'other' && !p.proposal_status && !p.warranty_status, empty: t('none') },
  ]);
}
function renderProposals() {
  return listPage(t('proposalsTitle'), t('proposalsTitle'), t('proposalsLede'), [
    { title: t('submitted'), c: '#1D6E6E', test: (p) => p.proposal_status === 'submitted' || (!p.proposal_status && stageKey(p) === 'bid'), empty: t('none') },
    { title: t('drafts'), c: '#5B6775', test: (p) => p.proposal_status === 'draft', empty: t('noDrafts') },
  ]);
}
function renderWarranties() {
  return listPage(t('warrantiesTitle'), t('warrantiesTitle'), t('warrantiesLede'), [
    { title: t('activeRequests'), c: '#8E1F3F', test: (p) => p.warranty_status === 'active' || (!p.warranty_status && stageKey(p) === 'warranty'), empty: t('none') },
    { title: t('closedOut'), c: '#5B6775', test: (p) => p.warranty_status === 'closed', empty: t('none') },
  ]);
}

// ---------------------------------------------------------------- Project page
const RECORDS = [
  ['submittal', 'Submittal register', '제출물 대장'], ['af3000', 'AF Form 3000s', 'AF Form 3000'], ['rfi', 'RFIs (sent and received)', 'RFI (발신·수신)'],
  ['dig', 'Dig permits (AF 103)', '굴착 허가 (AF 103)'], ['tacw', 'TACW and RA', 'TACW·RA'], ['outage', 'Outage requests', '단수·단전 요청'],
  ['jk75', 'JK-75 customs forms', 'JK-75 통관 서류'], ['corr', 'Correspondence', '서신·공문'],
];
const REC_HELP = {
  approved: ['The Government approved it (register says Approved, or the file is in an Approved folder or marked approved/signed).', '발주처 승인 완료 (제출물 대장 승인, 또는 승인 폴더·승인/서명 표시 파일).'],
  submitted: ['Sent to the Government and waiting for a decision.', '발주처에 제출했으며 결정을 기다리는 중.'],
  disapproved: ['The Government rejected it. Fix and send again.', '발주처 반려. 수정 후 다시 제출해야 함.'],
  not_started: ['Not sent yet: still in preparation or a draft.', '아직 제출 전: 준비 중이거나 초안.'],
  filed: ['Kept in the project folder. The file name and register do not say approved or rejected, so check the file. Letters are always here.', '과업 폴더에 보관된 파일. 파일명·대장에 승인/반려 표시가 없어 확인 필요. 서신은 모두 여기에 표시.'],
  closed: ['Finished and no longer active.', '종결되어 더 이상 진행하지 않음.'],
  needs3000: ['Register items not submitted yet. Each needs an AF Form 3000 when it is sent.', '아직 제출하지 않은 대장 항목. 제출할 때 AF Form 3000이 필요함.'],
};
const recHelp = (k) => (REC_HELP[k] ? REC_HELP[k][lang === 'ko' ? 1 : 0] : '');
const REC_STATUS = [
  ['approved', 'Approved', '승인', 'final'], ['submitted', 'Under review', '검토 중', 'review'], ['disapproved', 'Disapproved — resubmit', '반려 — 재제출', 'warn'],
  ['not_started', 'Not yet submitted', '미제출', 'muted'], ['filed', 'Filed', '보관', 'muted'], ['closed', 'Closed', '종결', 'muted'],
];
const recName = (k) => { const r = RECORDS.find((x) => x[0] === k); return r ? (lang === 'ko' ? r[2] : r[1]) : k; };
const statName = (k) => { const r = REC_STATUS.find((x) => x[0] === k); return r ? (lang === 'ko' ? r[2] : r[1]) : k; };
const statCls = (k) => (REC_STATUS.find((x) => x[0] === k) || [])[3] || 'muted';
async function renderProjectPage(keyParam) {
  const key = decodeURIComponent(keyParam);
  shell(t('projectsTitle'), `<div id="pp"><p class="empty">…</p></div>`);
  const box = $('#pp');
  const [{ data: p }, { data: rows }, weeks] = await Promise.all([
    sb.from('projects').select('*').eq('project_key', key).maybeSingle(),
    sb.from('items').select('id,week_id,projects!inner(project_key),snapshots(captured_at,source_modified_at,fields,ko,en,key_dates)')
      .eq('projects.project_key', key).order('source_modified_at', { referencedTable: 'snapshots', ascending: false }).limit(1, { referencedTable: 'snapshots' }),
    loadWeeks().catch(() => []),
  ]);
  if (!p) { box.innerHTML = `<p class="empty">${esc(t('noMatch'))}</p>`; return; }
  const s = STAGES.find((x) => x.k === stageKey(p));
  const byId = new Map(weeks.map((w) => [w.id, w]));
  const latest = (rows || []).map((r) => ({ r, w: byId.get(r.week_id) })).filter((x) => x.w).sort((a, b) => b.w.war_date.localeCompare(a.w.war_date))[0];
  const sn = latest?.r.snapshots?.[0] || {};
  const lines = lang === 'ko' ? (sn.ko?.length ? sn.ko : sn.en) : (sn.en?.length ? sn.en : sn.ko);
  const dates = upcoming(sn.key_dates, latest?.w.war_date || '', 5);
  box.innerHTML = `
    <p><a href="#/projects">← ${esc(t('projectsTitle'))}</a></p>
    <article class="detail" style="--stage:${s.c}">
      <div class="bc-top"><span class="bc-key">${esc(keyLabel(p.project_key))}</span>${primeTag(primeOf(p, {}))}
        <span class="bc-stage">${esc(lang === 'ko' ? s.ko : s.en)}</span><span class="spacer"></span>${instTag(p)}</div>
      <h1>${esc(pick(p.title_ko, p.title_en))}</h1>
      <p class="alt">${esc(lang === 'ko' ? (p.title_en || '') : (p.title_ko || ''))}${p.task_order ? ` · ${esc(p.task_order)}` : ''}</p>
      ${factsBox(p.facts)}
      <section><div class="sec-head"><h2>${esc(t('latestStatus'))}</h2>
        ${latest ? `<a href="#/war/${latest.w.war_date}/${encodeURIComponent(key)}">${esc(t('openInWar', fmtDate(latest.w.war_date)))}</a>` : ''}</div>
        ${lines?.length ? bullets(lines) : `<p class="empty" style="padding:0">${esc(t('noStatus'))}</p>`}
        ${dates.length ? `<table class="kd"><tbody>${dates.map((r) => `<tr><td>${esc(r.date_text)}</td><td>${esc(pick(r.ko, r.en))}</td></tr>`).join('')}</tbody></table>` : ''}
      </section>
      <section><h2>${esc(t('records'))}</h2>
        <div class="records" id="recgrid">${RECORDS.map(([k]) => `<a class="rec" href="#/p/${encodeURIComponent(key)}/${k}"><span>${esc(recName(k))}</span><span class="chip muted">…</span></a>`).join('')}</div>
      </section>
      <section><h2>${esc(t('askTitle'))}</h2>
        <form id="ask" class="ask">
          <label class="sr" for="qb">${esc(t('askTitle'))}</label>
          <textarea id="qb" rows="3" maxlength="4000" placeholder="${esc(t('askPh'))}" required></textarea>
          <button class="btn" type="submit">${esc(t('askSend'))}</button>
        </form>
        <div id="qlist"></div>
      </section>
    </article>`;
  sb.from('records').select('category,status').eq('project_id', p.id).then(({ data }) => {
    const recs = data || [];
    $('#recgrid').innerHTML = RECORDS.map(([k]) => {
      const mine = recs.filter((r) => r.category === k);
      const ok = mine.filter((r) => r.status === 'approved').length;
      const label = mine.length ? (ok ? t('recCount', mine.length, ok) : t('recFiles', mine.length)) : t('recNone');
      return `<a class="rec${mine.length ? '' : ' empty-rec'}" href="#/p/${encodeURIComponent(key)}/${k}"><span>${esc(recName(k))}</span><span class="chip ${mine.length ? (ok ? 'final' : 'review') : 'muted'}">${esc(label)}</span></a>`;
    }).join('');
  });
  const drawQs = async () => {
    const { data: qs } = await sb.from('questions').select('*').eq('project_id', p.id).order('created_at', { ascending: false });
    $('#qlist').innerHTML = (qs || []).map(qItem).join('') || '';
    bindAnswer($('#qlist'), drawQs);
  };
  drawQs();
  $('#ask').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const body = $('#qb').value.trim(); if (!body) return;
    const { data: nq, error } = await sb.from('questions').insert({ org_id: state.orgId, project_id: p.id, body, asked_name: state.profile?.name || state.user.email }).select('id').single();
    if (error) return toast(errText(error));
    notify(nq.id, 'asked');
    $('#qb').value = ''; toast(t('askSent')); drawQs();
  });
}
// Email the admins (new question) or the asker (answer). Failures never block the page.
function notify(id, event) {
  sb.functions.invoke('notify', { body: { question_id: id, event } }).catch(() => {});
}
async function renderRecords(keyParam, cat) {
  const key = decodeURIComponent(keyParam);
  shell(recName(cat), `<div id="rl"><p class="empty">…</p></div>`);
  const { data: p } = await sb.from('projects').select('id,project_key,title_en,title_ko,prime,stage,installation').eq('project_key', key).maybeSingle();
  if (!p) { $('#rl').innerHTML = `<p class="empty">${esc(t('noMatch'))}</p>`; return; }
  const cats = cat === 'af3000' ? ['af3000', 'submittal'] : [cat];
  const { data } = await sb.from('records').select('*').eq('project_id', p.id).in('category', cats).order('title');
  let recs = (data || []).filter((r) => r.category === cat);
  // AF 3000 page: register lines not yet submitted still need a transmittal, so list them as "not yet made".
  const needs = cat === 'af3000' ? (data || []).filter((r) => r.category === 'submittal' && r.status === 'not_started') : [];
  const groups = REC_STATUS.map(([st]) => ({ st, rows: recs.filter((r) => r.status === st) })).filter((g) => g.rows.length);
  const row = (r) => `
    <li class="recrow">
      <div class="rr-main">
        <b>${esc(r.title)}</b>
        <span class="rr-meta">${esc([r.ref, r.status_date, r.source === 'drive' && r.path ? r.path.split(' / ').slice(1).join(' / ') : ''].filter(Boolean).join(' · '))}</span>
        ${r.notes ? `<details><summary>${esc(t('recNotes'))}</summary><p>${esc(r.notes)}</p></details>` : ''}
      </div>
      ${r.file_url ? `<a class="btn small quiet" href="${esc(r.file_url)}" target="_blank" rel="noopener">${esc(t('recOpen'))}</a>` : `<span class="chip muted">${esc(t('recNoFile'))}</span>`}
    </li>`;
  $('#rl').innerHTML = `
    <p><a href="#/p/${encodeURIComponent(key)}">← ${esc(keyLabel(p.project_key))} ${esc(pick(p.title_ko, p.title_en))}</a></p>
    <h1>${esc(recName(cat))}</h1>
    <p class="lede">${esc(t('recLede'))}</p>
    ${groups.map((g) => `<section class="recgroup"><h2><span class="chip ${statCls(g.st)}">${esc(statName(g.st))}</span> <span class="item-key">${g.rows.length}</span></h2>
      <p class="rec-help">${esc(recHelp(g.st))}</p>
      <ul class="reclist">${g.rows.map(row).join('')}</ul></section>`).join('')}
    ${needs.length ? `<section class="recgroup"><h2><span class="chip warn">${esc(t('recNotMade'))}</span> <span class="item-key">${needs.length}</span></h2>
      <p class="rec-help">${esc(recHelp('needs3000'))}</p>
      <ul class="reclist">${needs.map(row).join('')}</ul></section>` : ''}
    ${!groups.length && !needs.length ? `<p class="empty">${esc(t('recEmpty'))}</p>` : ''}`;
}
function qItem(q, withProject) {
  const open = q.status === 'open';
  const proj = withProject && q.projects ? `<a class="q-proj" href="#/p/${encodeURIComponent(q.projects.project_key)}">${esc(keyLabel(q.projects.project_key))}</a>` : '';
  return `<article class="qcard ${open ? 'is-open' : 'is-done'}">
    <header class="q-head">${proj}<span class="chip ${open ? 'live' : 'final'}">${esc(t(open ? 'qOpen' : 'qAnswered'))}</span>
      ${isAdmin() ? `<button type="button" class="q-del" data-del="${q.id}">${esc(t('qDelete'))}</button>` : ''}</header>
    <div class="msgb ask">
      <div class="msgb-who"><span class="who-role">${esc(t('qAskedBy'))}</span> <b>${esc(q.asked_name || '—')}</b> <time>${esc(fmtTime(q.created_at))}</time></div>
      <p>${esc(q.body)}</p>
    </div>
    ${q.answer ? `<div class="msgb reply">
      <div class="msgb-who"><span class="who-role">${esc(t('qAnsweredBy'))}</span> <b>${esc(q.answered_name || '—')}</b> ${q.answered_at ? `<time>${esc(fmtTime(q.answered_at))}</time>` : ''}</div>
      <p>${esc(q.answer)}</p>
    </div>` : ''}
    ${isAdmin() && open ? `<form class="ans" data-q="${q.id}">
      <label class="sr" for="a-${q.id}">${esc(t('qYourAnswer'))}</label>
      <textarea id="a-${q.id}" rows="2" placeholder="${esc(t('answerPh'))}" required></textarea>
      <button class="btn small" type="submit">${esc(t('answer'))}</button></form>`
      : open ? `<p class="q-wait">${esc(t('qWaitNote'))}</p>` : ''}
  </article>`;
}
function bindAnswer(root, redraw) {
  $$('[data-del]', root).forEach((b) => b.addEventListener('click', async () => {
    if (!confirm(t('qDeleteConfirm'))) return;
    const { error } = await sb.from('questions').update({ deleted_at: new Date().toISOString(), deleted_by: state.user.id }).eq('id', b.dataset.del);
    if (error) return toast(errText(error)); toast(t('qDeleted')); redraw();
  }));
  $$('form.ans', root).forEach((f) => f.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const answer = $('textarea', f).value.trim(); if (!answer) return;
    const { error } = await sb.from('questions').update({ answer, status: 'answered', answered_by: state.user.id, answered_name: state.profile?.name || state.user.email, answered_at: new Date().toISOString() }).eq('id', f.dataset.q);
    if (error) return toast(errText(error));
    notify(f.dataset.q, 'answered');
    toast(t('saved')); redraw();
  }));
}
async function renderQuestions() {
  shell(t('questionsTitle'), `<h1>${esc(t('questionsTitle'))}</h1><p class="lede">${esc(t('questionsLede'))}</p><div id="qlist"><p class="empty">…</p></div>`);
  const draw = async () => {
    const { data } = await sb.from('questions').select('*,projects(project_key)').order('status').order('created_at', { ascending: false });
    $('#qlist').innerHTML = (data || []).map((q) => qItem(q, true)).join('') || `<p class="empty">${esc(t('noQuestions'))}</p>`;
    bindAnswer($('#qlist'), draw);
  };
  draw();
}

// ---------------------------------------------------------------- Team access
const accessView = { filter: 'all', q: '' };
const norm = (x) => String(x || '').toLowerCase().replace(/[^a-z가-힣]/g, '');
function guessMatch(p, r) {
  const n = norm(p.name);
  return !!n && ((r.name_ko && n.includes(norm(r.name_ko))) || (r.name_en && n.includes(norm(r.name_en))));
}
async function renderAccess() {
  if (!isAdmin()) { location.hash = '#/'; return; }
  shell(t('accessTitle'), `<h1>${esc(t('accessTitle'))}</h1><p class="lede">${esc(t('accessLede'))}</p><div id="acc"><p class="empty">…</p></div>`);
  const [{ data: roster, error: e1 }, { data: profiles, error: e2 }] = await Promise.all([
    sb.from('roster').select('*').eq('org_id', state.orgId).order('sort', { ascending: true, nullsFirst: false }).order('name_en'),
    sb.from('profiles').select('user_id,email,name,role,status,requested_note,created_at').eq('org_id', state.orgId),
  ]);
  const box = $('#acc');
  if (e1 || e2) { box.innerHTML = `<div class="msg err">${esc(t('errGeneric'))}</div>`; return; }
  const byEmail = new Map((profiles || []).map((p) => [p.email.toLowerCase(), p]));
  const rosterEmails = new Set(roster.filter((r) => r.email).map((r) => r.email.toLowerCase()));
  const pending = (profiles || []).filter((p) => p.status === 'pending');

  const statusOf = (r) => {
    if (!r.employed) return ['muted', t('stDeparted')];
    if (!r.needs_access) return ['muted', t('stOff')];
    if (!r.email) return ['warn', t('stNeedsEmail')];
    const p = byEmail.get(r.email.toLowerCase());
    if (p?.status === 'approved') return ['final', t('stActive')];
    if (p?.status === 'declined') return ['warn', t('stDeclined')];
    return ['review', t('stInvited')];
  };
  const counts = {
    access: roster.filter((r) => r.needs_access && r.employed && r.email).length,
    active: roster.filter((r) => r.needs_access && r.email && byEmail.get(r.email.toLowerCase())?.status === 'approved').length,
    needEmail: roster.filter((r) => r.employed && !r.email).length,
    total: roster.filter((r) => r.employed).length,
  };
  const roleSel = (id, val, disabled) => `<select data-f="access_role" data-id="${id}" ${disabled ? 'disabled' : ''} aria-label="${esc(t('role'))}">
      ${['team', 'exec', 'admin'].map((r) => `<option value="${r}" ${val === r ? 'selected' : ''}>${esc(t('role' + r[0].toUpperCase() + r.slice(1)))}</option>`).join('')}</select>`;

  const rows = () => {
    const q = accessView.q.toLowerCase();
    const list = roster.filter((r) =>
      (accessView.filter === 'all' || (accessView.filter === 'on' ? r.needs_access : accessView.filter === 'noemail' ? (r.employed && !r.email) : !r.needs_access)) &&
      (!q || [r.name_en, r.name_ko, r.email, r.team, r.title_en, r.title_ko].join(' ').toLowerCase().includes(q)));
    let team = null; let html = '';
    for (const r of list) {
      if (r.team !== team) { team = r.team; html += `<tr class="team"><td colspan="6">${esc(team || '—')}</td></tr>`; }
      const [cls, label] = statusOf(r);
      const self = r.email && r.email.toLowerCase() === state.user.email.toLowerCase();
      html += `<tr class="${r.employed ? '' : 'off'}" data-row="${r.id}">
        <td class="nm">${esc(pick(r.name_ko, r.name_en))}<small>${esc(lang === 'ko' ? r.name_en : (r.name_ko || ''))}</small>
          ${r.notes ? `<span class="note">${esc(r.notes)}</span>` : ''}</td>
        <td>${esc(pick(r.title_ko, r.title_en))}</td>
        <td class="keep"><input type="email" data-f="email" data-id="${r.id}" value="${esc(r.email || '')}" placeholder="name@company.com" aria-label="${esc(t('email'))}" ${self ? 'disabled' : ''}></td>
        <td class="keep inl"><input type="checkbox" data-f="needs_access" data-id="${r.id}" ${r.needs_access ? 'checked' : ''} ${!r.employed || self ? 'disabled' : ''} aria-label="${esc(t('needsAccess'))}"></td>
        <td class="keep inl">${roleSel(r.id, r.access_role, self || !r.employed)}</td>
        <td class="inl"><span class="chip ${cls}">${esc(label)}</span> <span class="fb" aria-live="polite"></span></td>
      </tr>`;
    }
    return html || `<tr><td colspan="6" class="empty">${esc(t('noMatch'))}</td></tr>`;
  };

  const extra = (profiles || []).filter((p) => p.status === 'approved' && !rosterEmails.has(p.email.toLowerCase()));
  box.innerHTML = `
    <div class="summary">
      <div><b>${counts.access}</b><span>${esc(t('sumAccess'))}</span></div>
      <div><b>${counts.active}</b><span>${esc(t('sumActive'))}</span></div>
      <button type="button" class="sumbtn" id="needEmail"><b>${counts.needEmail}</b><span>${esc(t('sumNeedEmail'))}</span></button>
      <div><b>${counts.total}</b><span>${esc(t('sumTotal'))}</span></div>
    </div>
    <section class="panel">
      <header><h2>${esc(t('pending'))}</h2>${pending.length ? `<span class="chip live">${pending.length}</span>` : ''}</header>
      ${pending.length ? pending.map((p) => `
        <div class="req"><div><b>${esc(p.name || p.email)}</b> <span class="item-key">${esc(p.email)}</span>
          ${p.requested_note ? `<div class="note">${esc(p.requested_note)}</div>` : ''}</div>
          <div class="act">
            <select data-match="${p.user_id}" aria-label="${esc(t('matchTo'))}" style="width:auto;max-width:220px">
              <option value="">${esc(t('matchNone'))}</option>
              ${roster.filter((r) => r.employed && !r.email).map((r) => `<option value="${r.id}" ${guessMatch(p, r) ? 'selected' : ''}>${esc(r.name_en)}${r.name_ko ? ` (${esc(r.name_ko)})` : ''} — ${esc(r.team || '')}</option>`).join('')}
            </select>
            ${roleSel('req-' + p.user_id, 'team', false)}
            <button class="btn small" data-approve="${p.user_id}">${esc(t('approve'))}</button>
            <button class="btn small quiet" data-decline="${p.user_id}">${esc(t('decline'))}</button></div></div>`).join('')
        : `<p class="empty">${esc(t('noPending'))}</p>`}
      <p class="empty" style="font-size:13px;border-top:1px solid var(--line-2)">${esc(t('shareHelp'))} <b>https://${esc(state.slug)}.${ROOT_DOMAIN}</b></p>
    </section>
    <section class="panel">
      <header><h2>${esc(t('roster'))}</h2>
        <input type="search" id="rq" placeholder="${esc(t('searchPeople'))}" value="${esc(accessView.q)}" style="max-width:220px" aria-label="${esc(t('searchPeople'))}">
        <select id="rf" style="width:auto" aria-label="filter">
          <option value="all" ${accessView.filter === 'all' ? 'selected' : ''}>${esc(t('all'))}</option>
          <option value="on" ${accessView.filter === 'on' ? 'selected' : ''}>${esc(t('withAccess'))}</option>
          <option value="off" ${accessView.filter === 'off' ? 'selected' : ''}>${esc(t('withoutAccess'))}</option>
          <option value="noemail" ${accessView.filter === 'noemail' ? 'selected' : ''}>${esc(t('noEmailFilter'))}</option>
        </select></header>
      <div style="overflow-x:auto"><table class="roster">
        <thead><tr><th scope="col">${esc(t('name'))}</th><th scope="col">${esc(t('title'))}</th><th scope="col">${esc(t('email'))}</th>
          <th scope="col">${esc(t('needsAccess'))}</th><th scope="col">${esc(t('role'))}</th><th scope="col">${esc(t('status'))}</th></tr></thead>
        <tbody id="rows">${rows()}</tbody></table></div>
      <p class="empty" style="font-size:13px">${esc(t('roleHelp'))}</p>
      <form class="addrow" id="add">
        <div class="field" style="margin:0"><label for="a1">${esc(t('name'))} (EN)</label><input id="a1" type="text" required></div>
        <div class="field" style="margin:0"><label for="a2">${esc(t('name'))} (KO)</label><input id="a2" type="text"></div>
        <div class="field" style="margin:0"><label for="a3">${esc(t('team'))}</label><input id="a3" type="text" list="teams"></div>
        <div class="field" style="margin:0"><label for="a4">${esc(t('title'))}</label><input id="a4" type="text"></div>
        <div class="field" style="margin:0"><label for="a5">${esc(t('email'))}</label><input id="a5" type="email"></div>
        <button class="btn" type="submit">${esc(t('add'))}</button>
        <datalist id="teams">${[...new Set(roster.map((r) => r.team).filter(Boolean))].map((x) => `<option value="${esc(x)}">`).join('')}</datalist>
      </form>
    </section>
    ${extra.length ? `<section class="panel"><header><h2>${esc(t('notOnRoster'))}</h2></header>
      ${extra.map((p) => `<div class="req"><div><b>${esc(p.name || p.email)}</b> <span class="item-key">${esc(p.email)}</span></div><span class="chip final">${esc(t('role' + p.role[0].toUpperCase() + p.role.slice(1)))}</span></div>`).join('')}</section>` : ''}`;

  const tbody = $('#rows');
  const rebind = () => {
    $$('[data-f]', tbody).forEach((el) => el.addEventListener('change', async () => {
      const id = el.dataset.id; const fld = el.dataset.f;
      const value = el.type === 'checkbox' ? el.checked : el.value.trim();
      const row = roster.find((r) => r.id === id);
      const patch = { [fld]: value === '' ? null : value };
      // Ticking access for someone with an exec title defaults them to Executive.
      if (fld === 'needs_access' && value && row.access_role === 'team' && /executive|president|director|대표|사장|이사/i.test(row.title_en + row.title_ko)) patch.access_role = 'exec';
      const fb = $(`tr[data-row="${id}"] .fb`);
      const { data, error } = await sb.from('roster').update(patch).eq('id', id).select().single();
      if (error) { fb.className = 'fb err'; fb.textContent = errText(error); if (el.type === 'checkbox') el.checked = !value; return; }
      Object.assign(row, data);
      const { data: ps } = await sb.from('profiles').select('user_id,email,name,role,status,requested_note,created_at').eq('org_id', state.orgId);
      byEmail.clear(); (ps || []).forEach((p) => byEmail.set(p.email.toLowerCase(), p));
      tbody.innerHTML = rows(); rebind();
      const fb2 = $(`tr[data-row="${id}"] .fb`); if (fb2) { fb2.className = 'fb saved'; fb2.textContent = t('saved'); }
    }));
  };
  rebind();
  $('#needEmail').addEventListener('click', () => { accessView.filter = 'noemail'; $('#rf').value = 'noemail'; tbody.innerHTML = rows(); rebind(); $('#rf').scrollIntoView({ behavior: 'smooth', block: 'center' }); });
  $('#rq').addEventListener('input', (e) => { accessView.q = e.target.value; tbody.innerHTML = rows(); rebind(); });
  $('#rf').addEventListener('change', (e) => { accessView.filter = e.target.value; tbody.innerHTML = rows(); rebind(); });
  $$('[data-approve]').forEach((b) => b.addEventListener('click', async () => {
    const id = b.dataset.approve; const role = $(`select[data-id="req-${id}"]`).value;
    const match = $(`select[data-match="${id}"]`)?.value;
    const prof = pending.find((p) => p.user_id === id);
    // Matched to a roster person: write their email onto the roster row and tick access. The roster sync approves the account.
    const { error } = match
      ? await sb.from('roster').update({ email: prof.email, needs_access: true, access_role: role }).eq('id', match)
      : await sb.rpc('decide_access', { target: id, approve: true, new_role: role });
    if (error) return toast(errText(error)); toast(t('saved')); renderAccess();
  }));
  $$('[data-decline]').forEach((b) => b.addEventListener('click', async () => {
    const { error } = await sb.rpc('decide_access', { target: b.dataset.decline, approve: false });
    if (error) return toast(errText(error)); toast(t('saved')); renderAccess();
  }));
  $('#add').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const row = { org_id: state.orgId, name_en: $('#a1').value.trim(), name_ko: $('#a2').value.trim() || null, team: $('#a3').value.trim() || null,
      title_en: $('#a4').value.trim() || null, email: $('#a5').value.trim() || null, sort: 900, source: 'manual' };
    if (!row.name_en) return;
    const { error } = await sb.from('roster').insert(row);
    if (error) return toast(errText(error)); toast(t('saved')); renderAccess();
  });
}

// ---------------------------------------------------------------- router
async function route() {
  document.documentElement.lang = lang;
  if (!state.slug) return renderPortal();
  if (!state.org) {
    const { data } = await sb.rpc('org_directory');
    state.org = (data || []).find((o) => o.slug === state.slug) || null;
    if (!state.org) {
      app.innerHTML = `<div class="gate"><div class="gate-card"><h1>Gyeoldesk</h1><p>${esc(t('unknownOrg'))}</p>
        <a class="btn" href="https://${ROOT_DOMAIN}/">${esc(t('back'))}</a></div></div>`;
      return;
    }
    document.title = `${state.org.name} · Gyeoldesk`;
  }
  if (!state.user) return renderEmailStep();
  if (!state.profile) await loadProfile();
  const p = state.profile;
  if (!p) return renderNotice('waitingTitle', 'waitingLede', true);
  if (p.status === 'pending') return p.org_id ? renderNotice('waitingTitle', 'waitingLede', true) : renderRequest();
  if (p.status === 'declined') return renderNotice('declinedTitle', 'declinedLede', false);
  if (!state.orgId || p.org_id !== state.orgId) return renderNotice('otherOrgTitle', 'otherOrgLede', false);

  const [, page, arg] = (location.hash || '#/').split('/');
  const sub = (location.hash || '').split('/')[3];
  if (page === 'war' && arg && sub) return renderProject(arg, sub);
  if (page === 'war') return renderWar(arg);
  if (page === 'access') return renderAccess();
  if (page === 'projects') return renderProjects();
  if (page === 'proposals') return renderProposals();
  if (page === 'warranties') return renderWarranties();
  if (page === 'questions') return renderQuestions();
  const sub2 = (location.hash || '').split('/')[3];
  if (page === 'p' && arg && sub2) return renderRecords(arg, sub2);
  if (page === 'p' && arg) return renderProjectPage(arg);
  return renderHome();
}

window.addEventListener('hashchange', route);
(async () => {
  const { data } = await sb.auth.getSession();
  state.user = data.session?.user || null;
  route();
})();
