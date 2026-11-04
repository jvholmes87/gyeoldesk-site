// Gyeoldesk web app. One codebase for every company:
//   gyeoldesk.com            -> company cards
//   <company>.gyeoldesk.com  -> that company's workspace (sign-in, WAR, team access)
// Local testing: ?org=gnc opens a workspace on any host.
import { createClient } from './vendor/supabase.mjs';
import { photoGallery, bindPhotoErrors, loadDrivePhotos } from './war-photos.mjs?v=a49aabcc';
import { requestPhoto } from './photo-request.mjs?v=9238a66e';
import { demoFetch, demoAuth, demoPhoto, demoPhotoLinks, DEMO_TEXT } from './demo.mjs?v=23525af5';

const SUPABASE_URL = 'https://wltuwsplrkrsfthkthxc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_N8CLXOt4Sh01hSqJu8O9Rg_q8_V1LXh'; // publishable key: safe in the browser, data is protected by row-level security
const ROOT_DOMAIN = 'gyeoldesk.com';

// ?org=demo is the fictional demo company: same code, bundled data, no database (see the demo module).
const DEMO = tenantSlug() === 'demo';
const sb = DEMO
  ? createClient(SUPABASE_URL, SUPABASE_KEY, { auth: demoAuth, global: { fetch: demoFetch } })
  : createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: true, autoRefreshToken: true } });
const app = document.getElementById('app');

// ---------------------------------------------------------------- text
const T = {
  ko: {
    footLine: '주한미군 기지 공사를 수행하는 한국 건설사를 위한 프로젝트 데스크', featTitle: '결데스크가 하는 일', contactLine: '회사 도입 문의:', tagline: '주한미군 기지 안에서 공사를 수행하는 한국 건설사를 위한 프로젝트 데스크. 과업, 입찰, 제출물, 허가, 하자보수, 주간 보고까지 한국어와 영어로 한곳에서 관리합니다.',
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
    projectsTitle: '과업', projectsLede: '수주한 과업. 착공 전·시공·준공 정산 단계별로 묶었습니다.', proposalsTitle: '입찰·제안', proposalsLede: '제출한 제안과 작성 중인 제안.', warrantiesTitle: '하자보수', warrantiesLede: '진행 중인 하자보수 요청과 종결된 요청.',
    stPreNtp: '착공 전', stConstruction: '시공', stCloseout: '준공 정산', submitted: '제출 완료', drafts: '작성 중', active: '진행 중', activeRequests: '진행 중인 요청', closedOut: '종결',
    count: (n) => `${n}건`, none: '없음', noDrafts: '작성 중인 제안이 없습니다.', stageNotSet: '단계 미지정', openQuestions: '건의 질문이 답변을 기다리고 있습니다', menu: '메뉴', teamMenu: '사용자 및 권한', settings: '설정',
    latestStatus: '최신 현황', openInWar: (d) => `WAR에서 보기 (${d})`, noStatus: '아직 WAR 현황이 없습니다.', records: '과업 기록', askTitle: '질문하기', askPh: '이 과업에 대한 질문을 한국어나 영어로 적어 주세요.', askSend: '질문 보내기', askSent: '질문을 보냈습니다',
    qOpen: '답변 대기', qAnswered: '답변 완료', answerPh: '답변을 입력하세요', qAskedBy: '질문', qDelete: '삭제', qDeleteConfirm: '이 질문을 삭제할까요? 팀 화면에서 사라집니다.', qDeleted: '삭제했습니다', qAnsweredBy: '답변', qYourAnswer: '내 답변', qWaitNote: '관리자 답변을 기다리고 있습니다. 답변이 등록되면 이메일로 알려 드립니다.', answer: '답변', questionsTitle: '질문', questionsLede: '과업 페이지에서 올라온 질문. 관리자가 답변합니다.', noQuestions: '질문이 없습니다.', projectPage: '과업 페이지 열기',
    recCount: (n, a) => `${n}건 · 승인 ${a}`, recFiles: (n) => `${n}건`, recNone: '없음', recOpen: '열기', recNoFile: '파일 없음', recNotes: '메모', recNotMade: 'AF 3000 미작성 (미제출 항목)', recEmpty: '아직 등록된 기록이 없습니다. 드라이브 과업 폴더와 PCES 제출물 대장에서 매시간 갱신됩니다.', recLede: '드라이브 과업 폴더와 PCES 제출물 대장에서 매시간 갱신. 파일은 구글 드라이브에서 열립니다.', printEyebrow: '주간 현황 — 전체 과업', printPrimeNote: '과업 번호 옆에 원도급사 표시', cont: '계속', printFoot: '금액 단위 원(KRW) · 상세 내용은 주간 현황 보고(WAR) 참조', boardTitle: '주간 현황 보드', weeksNav: '주 선택', backBoard: '보드로 돌아가기', toTop: '맨 위로', allStages: '전체', viewList: '목록', viewCards: '카드', sortBy: '정렬', sortStage: '단계별', sortStart: '착공일 (오래된 순)', sortPrime: '원도급사별', stageNav: '단계별 보기', openCard: '상세 카드 열기', recentEvents: '최근 진행', recentRecords: '최근 기록', noRecords: '등록된 기록이 없습니다.', updatedOn: (d) => `${d} 갱신`, timeUsed: (p, d) => `공기 ${p}% 경과 · 남은 기간 ${d}일`, timeOver: (d) => `공기 종료 후 ${d}일 경과`, timeNote: '기간 기준이며 공정률이 아닙니다', startLabel: '착공', endLabel: '준공', newerWeek: '더 최신 주가 있습니다:', itemNo: (n) => `항목 ${n}`, thisWeek: '이번 주 현황', bothLangs: '한국어·영어 함께 보기', krimaText: 'Krima 보고 문구', otherWeeks: '다른 주', warTitle: '주간 현황 보고', warLede: '매일 갱신되는 이번 주 WAR와 지난 주 기록.',
    accessTitle: '사용자 및 권한', accessLede: '조직도(10_GNC_ORG)에서 처음 가져온 팀 명단입니다. 수정을 눌러 이름·팀·직함을 바꾸고, 접근이 필요한 사람에 체크한 뒤 이메일과 역할을 정하세요. 바꾸면 바로 저장됩니다.',
    reviewTitle: '검토 데스크', reviewLede: '팀원이 한국어로 답하면 영어로 정리됩니다.',
    krimaTitle: 'Krima 현황 시트', krimaLede: 'Krima 과업만 해당. 주간 확정 시 생성됩니다.',
    soon: '준비 중',
    projects: (n) => `과업 ${n}건`, week: (d) => `${d} 주`,
    live: '작성 중', review: '검토 중', final: '확정', comingSoon: '준비 중', comingSoonLede: '이 기능은 준비 중입니다. 지금은 WAR부터 사용합니다.', draftNote: '작성 중인 주간 보고입니다. 확정 전까지 한 주 동안 계속 갱신됩니다.', draftPrint: '작성 중 (확정 전)', printFrom: (d) => `${d} 기준`,
    carried: '금주 변동 없음', updated: (t) => `갱신 ${t}`,
    startReview: '검토 시작', finalize: '확정 및 잠금', print: '인쇄 / PDF',
    confirmReview: '이번 주를 검토 단계로 넘길까요? 팀원이 확인 표시를 할 수 있습니다.',
    confirmFinal: '이번 주를 확정할까요? 확정하면 잠기고 새 주가 시작됩니다.',
    showInternal: '내부 메모 보기', internal: '내부 메모 (관리자만)', open: '미결 사항',
    keyDates: '주요 일정', date: '일자', item: '항목', search: '과업 검색', searchPeople: '이름 검색',
    noWeeks: '아직 WAR가 없습니다. 드라이브 00_WAR 주간 폴더에 문서를 넣으면 15분 안에 나타납니다.',
    noMatch: '검색 결과가 없습니다.', noPeople: '일치하는 사람이 없습니다.',
    pending: '승인 요청', noPending: '대기 중인 요청이 없습니다.', matchTo: '명단의 누구인가요?', matchNone: '명단에 없음', approve: '승인', decline: '거절', inviteSent: '안내 메일 발송', inviteOn: (d) => `안내 메일 ${d}`, sendInvite: '안내 메일 보내기', inviteFail: '저장됨. 안내 메일은 발송되지 않았습니다.',
    roster: '명단', all: '전체', withAccess: '접근 허용', withoutAccess: '미허용',
    name: '이름', title: '직책', needsAccess: '접근', role: '역할', status: '상태',
    roleAdmin: '관리자', roleExec: '임원', roleTeam: '팀원',
    stActive: '사용 중', stInvited: '초대됨', stNeedsEmail: '이메일 필요', stOff: '—', stDeparted: '퇴사', stDeclined: '비활성',
    sumAccess: '접근 허용', sumActive: '사용 중', sumNeedEmail: '이메일 없음', noEmailFilter: '이메일 없음', sumTotal: '명단 인원',
    addPerson: '사람 추가', team: '팀', add: '추가', saved: '저장됨',
    rEdit: '수정', rSave: '저장', rCancel: '취소', rRemove: '명단에서 삭제', rNameEn: '영문 이름', rNameKo: '한글 이름', rTitleEn: '직함 (영문)', rTitleKo: '직함 (한글)', rNotes: '메모', rEmployed: '재직 중 (해제하면 접근도 종료)', rAccessLbl: '접근', rSelf: '본인 계정은 여기서 바꿀 수 없습니다.',
    rRemoveAsk: (n) => `${n}님을 명단에서 삭제할까요? 접근 권한도 종료됩니다. 퇴사한 경우에는 \'재직 중\' 체크를 해제하는 편이 기록이 남습니다.`, rRemoved: '삭제됨',
    roleHelp: '관리자: 전체 + 확정 버튼 + 내부 메모. 임원: 전체 보기. 팀원: WAR 보기와 검토.',
    errGeneric: '저장하지 못했습니다. 다시 시도하세요.', errCode: '코드가 맞지 않거나 만료되었습니다. 새 코드를 받으세요.',
    errEmail: '이메일 주소를 확인하세요.', errRate: '요청이 너무 잦습니다. 1분 후 다시 시도하세요.',
    unknownOrg: '이 주소의 회사를 찾을 수 없습니다.', notOnRoster: '명단에 없는 사용자', shareHelp: '이메일을 모르는 사람은 이 주소로 직접 접근 요청을 보내게 하세요. 요청이 오면 명단의 이름을 골라 승인하면 이메일이 자동으로 채워집니다:', koOnly: '영문 없음 — 한국어 원문', home: '홈', back: '홈으로',
  },
  en: {
    footLine: 'The project desk for Korean contractors on USFK installations', featTitle: 'What Gyeoldesk covers', contactLine: 'Want it for your company?', tagline: 'The project desk for Korean contractors building on USFK installations. Task orders, proposals, submittals, permits, warranties and the weekly report, in Korean and English, in one place.',
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
    projectsTitle: 'Projects', projectsLede: 'Awarded task orders, grouped by stage: Pre-NTP, Construction and Closeout.', proposalsTitle: 'Bids & proposals', proposalsLede: 'Proposals already submitted, and proposals still in draft.', warrantiesTitle: 'Warranties', warrantiesLede: 'Active warranty requests and requests that are closed out.',
    stPreNtp: 'Pre-NTP', stConstruction: 'Construction', stCloseout: 'Closeout', submitted: 'Submitted', drafts: 'In draft', active: 'Active', activeRequests: 'Active requests', closedOut: 'Closed out',
    count: (n) => `${n}`, none: 'None', noDrafts: 'No proposals in draft.', stageNotSet: 'Stage not set', openQuestions: 'question(s) waiting for an answer', menu: 'Menu', teamMenu: 'Users & access', settings: 'Settings',
    latestStatus: 'Latest status', openInWar: (d) => `Open in WAR (${d})`, noStatus: 'No WAR status for this project yet.', records: 'Project records', askTitle: 'Ask a question', askPh: 'Write your question about this project in Korean or English.', askSend: 'Send question', askSent: 'Question sent',
    qOpen: 'Waiting for an answer', qAnswered: 'Answered', answerPh: 'Write your answer', qAskedBy: 'Question from', qDelete: 'Delete', qDeleteConfirm: 'Delete this question? It disappears for everyone.', qDeleted: 'Deleted', qAnsweredBy: 'Answer from', qYourAnswer: 'Your answer', qWaitNote: 'Waiting for an admin to answer. You will get an email when they do.', answer: 'Answer', questionsTitle: 'Questions', questionsLede: 'Questions asked from project pages. Admins answer them here.', noQuestions: 'No questions yet.', projectPage: 'Open the project page',
    recCount: (n, a) => `${n} · ${a} approved`, recFiles: (n) => `${n}`, recNone: 'None yet', recOpen: 'Open', recNoFile: 'No file', recNotes: 'Notes', recNotMade: 'AF 3000 not yet made (items not submitted)', recEmpty: 'Nothing here yet. This list updates every hour from the project folder in Drive and the PCES submittal register.', recLede: 'Updated every hour from the project folder in Drive and the PCES submittal register. Files open in Google Drive.', printEyebrow: 'Weekly status — all projects', printPrimeNote: 'Prime shown next to each project no.', cont: 'continued', printFoot: 'Values in KRW · full details in the Weekly Action Report', boardTitle: 'Weekly Status Board', weeksNav: 'Choose a week', backBoard: 'Back to the board', toTop: 'Back to top', allStages: 'All', viewList: 'List', viewCards: 'Cards', sortBy: 'Sort', sortStage: 'By stage', sortStart: 'Start date (oldest first)', sortPrime: 'By prime contractor', stageNav: 'Filter by stage', openCard: 'Open the full card', recentEvents: 'Recent activity', recentRecords: 'Recent records', noRecords: 'No records yet.', updatedOn: (d) => `Updated ${d}`, timeUsed: (p, d) => `${p}% of time used · ${d} days left`, timeOver: (d) => `${d} days past the completion date`, timeNote: 'Based on time, not work complete', startLabel: 'NTP', endLabel: 'Completion', newerWeek: 'A newer week is available:', itemNo: (n) => `Item ${n}`, thisWeek: 'This week', bothLangs: 'Show Korean and English', krimaText: 'Status for Krima', otherWeeks: 'Other weeks', warTitle: 'Weekly Action Report', warLede: 'This week’s WAR, updated through the day, and every past week.',
    accessTitle: 'Users & access', accessLede: 'Your team list, first copied from the org chart (10_GNC_ORG). Tap Edit to change a name, team or title. Tick who needs access, then set their email and role. Every change saves as you make it.',
    reviewTitle: 'Review Desk', reviewLede: 'The team answers in Korean; answers are put into English for you.',
    krimaTitle: 'Krima status sheet', krimaLede: 'Krima task orders only. Generated when the week is final.',
    soon: 'Coming soon',
    projects: (n) => `${n} projects`, week: (d) => `Week of ${d}`,
    live: 'Working draft', review: 'In review', final: 'Final', comingSoon: 'Coming soon', comingSoonLede: 'This part is being built. For now, Gyeoldesk starts with the WAR.', draftNote: 'Working draft. It keeps updating through the week until it is finalized.', draftPrint: 'WORKING DRAFT (not final)', printFrom: (d) => `As of ${d}`,
    carried: 'No update this week', updated: (t) => `Updated ${t}`,
    startReview: 'Start review', finalize: 'Finalize and lock', print: 'Print / PDF',
    confirmReview: 'Move this week to review? The team can then mark items as checked.',
    confirmFinal: 'Finalize this week? It locks and a new week opens.',
    showInternal: 'Show internal notes', internal: 'Internal notes (admin only)', open: 'Open items',
    keyDates: 'Key dates', date: 'Date', item: 'Item', search: 'Search projects', searchPeople: 'Search people',
    noWeeks: 'No WAR yet. Docs placed in a 00_WAR week folder on Drive show up here within 15 minutes.',
    noMatch: 'No projects match.', noPeople: 'No people match.',
    pending: 'Access requests', noPending: 'No requests waiting.', matchTo: 'Who is this on the roster?', matchNone: 'Not on roster', approve: 'Approve', decline: 'Decline', inviteSent: 'Invite email sent', inviteOn: (d) => `Invite emailed ${d}`, sendInvite: 'Send invite email', inviteFail: 'Saved, but the invite email did not send.',
    roster: 'Roster', all: 'All', withAccess: 'Has access', withoutAccess: 'No access',
    name: 'Name', title: 'Title', needsAccess: 'Access', role: 'Role', status: 'Status',
    roleAdmin: 'Admin', roleExec: 'Executive', roleTeam: 'Member',
    stActive: 'Active', stInvited: 'Invited', stNeedsEmail: 'Needs email', stOff: '—', stDeparted: 'Departed', stDeclined: 'Deactivated',
    sumAccess: 'Have access', sumActive: 'Active', sumNeedEmail: 'No email yet', noEmailFilter: 'No email yet', sumTotal: 'On roster',
    addPerson: 'Add a person', team: 'Team', add: 'Add', saved: 'Saved',
    rEdit: 'Edit', rSave: 'Save', rCancel: 'Cancel', rRemove: 'Remove from roster', rNameEn: 'Name (EN)', rNameKo: 'Name (KO)', rTitleEn: 'Title (EN)', rTitleKo: 'Title (KO)', rNotes: 'Note', rEmployed: 'Still with the company (untick and their access ends)', rAccessLbl: 'Access', rSelf: 'Your own account cannot be changed here.',
    rRemoveAsk: (n) => `Remove ${n} from the roster? Their access ends. If they left the company, untick "Still with the company" instead to keep the record.`, rRemoved: 'Removed',
    roleHelp: 'Admin: everything, the Final button and internal notes. Executive: sees everything. Member: reads the WAR and reviews.',
    errGeneric: 'Could not save. Try again.', errCode: 'That code is wrong or expired. Send a new code.',
    errEmail: 'Check the email address.', errRate: 'Too many tries. Wait a minute and try again.',
    unknownOrg: 'No company uses this address.', notOnRoster: 'Signed-in users not on the roster', shareHelp: 'For anyone without an email here, share this link. They sign in with their own email and request access; you pick their name from the roster and approve, and their email fills in:', koOnly: 'No English text in the source doc yet. Korean original shown.', home: 'Home', back: 'Back to home',
  },
};
// English by default. Each person's choice is kept on this device and, once signed in, on their account.
let lang = 'en';
try { lang = localStorage.getItem('gd.lang') || 'en'; } catch { lang = 'en'; }
// Contacts page text (kept apart so the main dictionaries stay readable).
Object.assign(T.ko, {
  contactsTitle: '연락처', contactsLede: 'PCES 트래커(09A·09B·09C)에서 매시간 갱신됩니다. 수정은 트래커에서 하세요.',
  contactsHome: '과업별 계약관·감독관·원도급사 연락처와 권한.', byProject: '과업별', directory: '전체 명단',
  searchContacts: '이름, 이메일, 기관 검색', toLine: '받는 사람', ccLine: '참조', sendFrom: '보내는 계정', copy: '복사', copied: '복사했습니다',
  noEmail: '이메일 없음', verify: '확인 필요', escalate: '상위 보고', earlier: '이전 담당', mobile: '휴대폰', otherCh: '기타 연락',
  adminOnly: '관리자만', allProjects: '전체 공통', noProjectId: 'PID 없음', noContacts: '아직 연락처가 없습니다. 트래커 09 탭이 동기화되면 표시됩니다.',
  verifiedOn: (d) => `확인 ${d}`, nPeople: (n) => `${n}명`, nProjects: (n) => `과업 ${n}건`, roleChanged: '역할 변경', left: '이동·퇴직',
  dTo: '받는 사람', dCc: '참조', dBcc: '숨은 참조', dReq: '요청 시', thru: (d) => `${d}까지`, emailLists: '메일 수신자',
  statPeople: '명', statProjects: '과업', aKO: '정부 구속', aCOR: '변경 권한 없음', aSite: '출입 조율 가능',
  gKO: '계약관(KO) — 금액·범위·공기 변경은 계약관만 가능', gCS: '계약 사무소', gCOR: '감독관(COR) — 기술 감독, 계약 변경 권한 없음',
  gAP: '승인 담당 (해당 항목만)', gUS: '사용 부대 — 현장 통제', gIN: '참고 수신', gPR: '원도급사', gGN: 'GNC', gOT: '기타',
});
Object.assign(T.en, {
  contactsTitle: 'Contacts', contactsLede: 'From the PCES tracker (09A–09C), updated hourly. Make changes in the tracker, not here.',
  contactsHome: 'Who to contact on each project, and what they can approve.', byProject: 'By project', directory: 'Directory',
  searchContacts: 'Search name, email or office', toLine: 'To', ccLine: 'cc', sendFrom: 'Send from', copy: 'Copy', copied: 'Copied',
  noEmail: 'No email on file', verify: 'Verify', escalate: 'Escalate to', earlier: 'Earlier on this project', mobile: 'Mobile', otherCh: 'Other',
  adminOnly: 'Admin only', allProjects: 'All projects', noProjectId: 'No PID', noContacts: 'No contacts yet. They appear after the tracker 09 tabs sync.',
  verifiedOn: (d) => `Verified ${d}`, nPeople: (n) => `${n} people`, nProjects: (n) => `${n} projects`, roleChanged: 'Role changed', left: 'Left',
  dTo: 'To', dCc: 'cc', dBcc: 'bcc', dReq: 'On request', thru: (d) => `thru ${d}`, emailLists: 'Who gets the email',
  statPeople: 'people', statProjects: 'projects', aKO: 'Binds Government', aCOR: 'No contract changes', aSite: 'Site entry',
  gKO: 'Contracting Officer — the only one who can change price, scope or schedule', gCS: 'Contracting office', gCOR: 'COR — technical only, no contract changes',
  gAP: 'Approvals (named items only)', gUS: 'User unit — controls the site', gIN: 'Copied for information', gPR: 'Prime contractor', gGN: 'GNC', gOT: 'Other',
});
if (DEMO) { Object.assign(T.en, DEMO_TEXT.en); Object.assign(T.ko, DEMO_TEXT.ko); }
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
  if (e?.code === 'DEMO') return t('demoBlocked');
  return t('errGeneric');
}

// ---------------------------------------------------------------- tenant
function tenantSlug() {
  const q = new URLSearchParams(location.search).get('org');
  if (q) return q.toLowerCase();
  const host = location.hostname.toLowerCase();
  if (host.endsWith('.' + ROOT_DOMAIN)) {
    const sub = host.slice(0, -(ROOT_DOMAIN.length + 1));
    if (sub && sub !== 'www' && sub !== 'preview') return sub;
  }
  return null;
}
// preview.gyeoldesk.com runs the next build against the live database; companies are picked with ?org=<slug>.
const PREVIEW = location.hostname.toLowerCase() === 'preview.' + ROOT_DOMAIN;
const LIVE_HOST = location.hostname.endsWith(ROOT_DOMAIN) && !PREVIEW;
const orgUrl = (slug) => (slug === 'demo' ? (LIVE_HOST ? `https://${ROOT_DOMAIN}/?org=demo` : '?org=demo') : LIVE_HOST ? `https://${slug}.${ROOT_DOMAIN}/` : `?org=${slug}`);
function previewBar() {
  if (!PREVIEW || document.getElementById('previewBar')) return;
  const build = document.querySelector('meta[name="gd-build"]')?.content || '';
  const bar = document.createElement('div');
  bar.id = 'previewBar'; bar.className = 'preview-bar'; bar.setAttribute('role', 'status');
  bar.textContent = `PREVIEW 미리보기${build ? ' · ' + build : ''} · live data`;
  bar.title = 'Test build. It uses the live database: anything you save here is real. / 테스트 빌드 — 실제 데이터에 저장됩니다.';
  document.body.prepend(bar);
}
previewBar();
// Demo banner on every demo page: says the company is fictional and links to the game it comes from.
function demoBar() {
  if (!DEMO) return;
  let bar = document.getElementById('demoBar');
  if (!bar) { bar = document.createElement('div'); bar.id = 'demoBar'; bar.className = 'demo-bar no-print'; bar.setAttribute('role', 'note'); document.body.prepend(bar); }
  bar.innerHTML = `<b>DEMO</b><span>${esc(t('demoBar'))}</span>
    <a href="https://playforkline.com/" target="_blank" rel="noopener">${esc(t('demoPlay'))} ↗</a><a href="https://${ROOT_DOMAIN}/">${esc(t('demoBack'))}</a>`;
}
if (DEMO) {
  const m = document.createElement('meta'); m.name = 'robots'; m.content = 'noindex, follow';
  document.querySelector('meta[name="robots"]')?.remove(); document.head.append(m);
}

const state = { slug: tenantSlug(), org: null, orgId: null, user: null, profile: null };
const isAdmin = () => state.profile?.status === 'approved' && state.profile?.role === 'admin';

// ---------------------------------------------------------------- portal
const FEATURES = [
  ['Projects by stage', '단계별 과업', 'Every task order from Pre-NTP to construction and closeout, with its installation, prime contractor and COR.', '착공 전부터 시공·준공 정산까지 모든 과업을 기지, 원도급사, 감독관과 함께 봅니다.'],
  ['Submittals and permits', '제출물과 허가', 'Submittal register, AF Form 3000, RFIs, dig permits (AF 103), TACW and RA, outage requests and JK-75 — approved, under review or not yet sent.', '제출물 대장, AF Form 3000, RFI, 굴착 허가(AF 103), TACW·RA, 단수 요청, JK-75를 승인·검토 중·미제출로 구분합니다.'],
  ['Weekly Action Report', '주간 현황 보고', 'A live weekly board for every project. It locks when final and prints as one landscape sheet.', '모든 과업의 주간 현황 보드. 확정하면 잠기고 가로 한 장으로 인쇄됩니다.'],
  ['Korean and English', '한국어와 영어', 'Every screen in both languages. The team asks in Korean, and answers arrive by email.', '모든 화면을 두 언어로. 팀은 한국어로 질문하고 답변은 이메일로 받습니다.'],
];
async function renderPortal() {
  document.title = 'Gyeoldesk 결데스크 — Project desk for Korean contractors on USFK installations';
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
      <section class="portal-main features" aria-labelledby="ft">
        <h2 id="ft">${esc(t('featTitle'))}</h2>
        <div class="feat-grid">${FEATURES.map(([en, ko, den, dko]) => `<div class="feat"><h3>${esc(lang === 'ko' ? ko : en)}</h3><p>${esc(lang === 'ko' ? dko : den)}</p></div>`).join('')}</div>
        <p class="contact">${esc(t('contactLine'))} <a href="mailto:hello@gyeoldesk.com">hello@gyeoldesk.com</a></p>
      </section>
    </div>
    ${siteFoot(`<span class="lang">${langButtons()}</span>`)}`;
  bindLang();
  const { data, error } = await sb.rpc('org_directory');
  const box = $('#orgs');
  const demoCard = `
    <a class="org-card demo-card" href="${esc(orgUrl('demo'))}">
      <img class="org-img mark" src="assets/demo/hwc-mark.svg" alt="">
      <span><span class="name">${esc(lang === 'ko' ? '핼야드 웍스 건설' : 'Halyard Works Contractors')}</span><br>
      <span class="sub">${esc(lang === 'ko' ? '데모 · 가상 회사 · 로그인 없이 보기' : 'Demo · fictional company · no sign-in')}</span></span>
    </a>`;
  if (error || !data?.length) { box.innerHTML = demoCard; return; }
  box.innerHTML = data.filter((o) => o.slug !== 'demo').map((o) => `
    <a class="org-card${o.logo_wide_url ? ' has-logo' : ''}" href="${esc(orgUrl(o.slug))}">
      ${o.logo_wide_url ? logoHtml(o, 'wide') : logoHtml(o)}
      <span>${o.logo_wide_url ? '' : `<span class="name">${esc(pick(o.name_ko, o.name))}</span><br>`}
      <span class="sub">${esc(o.slug)}.${ROOT_DOMAIN}</span></span>
    </a>`).join('') + demoCard;
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
// Gyeoldesk footer on every page (portal, company desks, sign-in, unknown company).
function siteFoot(extra = '') {
  return `<footer class="site-foot" translate="no">
    <a class="sf-brand" href="https://${ROOT_DOMAIN}/" aria-label="Gyeoldesk 결데스크 — ${esc(ROOT_DOMAIN)}"><img src="assets/brand/gyeoldesk-logo.svg" alt="Gyeoldesk 결데스크" height="24"></a>
    <span class="sf-line">${esc(t('footLine'))}</span>
    <span class="sf-right">${extra}<span class="sf-copy">© ${new Date().getFullYear()} Gyeoldesk · <a href="https://${ROOT_DOMAIN}/">${esc(ROOT_DOMAIN)}</a> · <a href="mailto:hello@${ROOT_DOMAIN}">hello@${esc(ROOT_DOMAIN)}</a></span></span>
  </footer>`;
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
          <a href="#/contacts">${esc(t('contactsTitle'))}</a>
          ${isAdmin() ? `<a href="#/access">${esc(t('teamMenu'))}</a>` : ''}
          <button type="button" class="menu-out" id="signout2">${esc(t('signOut'))}<small>${esc(state.user?.email || '')}</small></button>
        </nav></div>` : ''}
    </div></header>
    <main class="page" id="main">${inner}</main>
    ${siteFoot()}`;
  bindLang();
  const out = async () => { if (DEMO) { location.href = `https://${ROOT_DOMAIN}/`; return; } await sb.auth.signOut(); state.user = null; state.profile = null; route(); };
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
const warView = { q: '', both: false, stage: 'all', sort: 'start', mode: 'list' };
try { const v = JSON.parse(localStorage.getItem('gd.warView') || '{}'); if (v.sort) warView.sort = v.sort; if (v.mode) warView.mode = v.mode; } catch {}
const saveWarView = () => { try { localStorage.setItem('gd.warView', JSON.stringify({ sort: warView.sort, mode: warView.mode })); } catch {} };
// Lifecycle order for the stage stepper (the card groups keep their own order).
const LIFECYCLE = ['bid', 'pre-ntp', 'construction', 'closeout', 'warranty'];
const ymd = (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
// NTP and completion come from the project's own facts ("2026/10/10 → 2027/4/30"), so the stage bar needs no hand-kept list.
function ntpSpan(p) {
  const f = (p?.facts || []).find((x) => /^(NTP|착공)/i.test(x.en || '') || /착공/.test(x.ko || ''));
  const m = [...String(f?.v || '').matchAll(/(\d{4})[\/.-](\d{1,2})[\/.-](\d{1,2})/g)].map((x) => ymd(x[1], x[2], x[3]));
  return m.length ? { start: m[0], end: m[1] || null } : null;
}
function timeUsed(span, today) {
  if (!span?.start || !span?.end) return null;
  const a = Date.parse(span.start), b = Date.parse(span.end), n = Date.parse(today);
  if (!(b > a)) return null;
  const pct = Math.max(0, Math.min(100, Math.round(((n - a) / (b - a)) * 100)));
  return { pct, left: Math.ceil((b - n) / 86400000) };
}
const kstToday = () => new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10);
const dated = (x) => /^\s*\d{1,2}\/\d{1,2}\b/.test(x || '');
const STAGES = [
  { k: 'construction', en: 'Construction', ko: '시공', den: 'NTP issued, work on site', dko: '착공 후 현장 작업', c: '#1F6B3A' },
  { k: 'pre-ntp', en: 'Pre-NTP', ko: '착공 전', den: 'Submittals and permits before start', dko: '착공 전 제출물·허가', c: '#2A4FA3' },
  { k: 'closeout', en: 'Closeout', ko: '준공 정산', den: 'Work done, payment open', dko: '작업 완료, 기성 진행', c: '#8A6A12' },
  { k: 'bid', en: 'Bid', ko: '입찰', den: 'Quoted, awaiting award', dko: '견적 제출, 낙찰 대기', c: '#1D6E6E' },
  { k: 'warranty', en: 'Warranty', ko: '하자보수', den: 'Warranty clocks running', dko: '하자 기간 진행 중', c: '#8E1F3F' },
  { k: 'other', en: 'Other', ko: '기타', den: 'Stage not set yet', dko: '단계 미지정', c: '#5B6775' },
];
const PRIMES = { krima: 'KRIMA', livart: 'LIVART', gnc: 'GNC', geumjang: 'GEUMJANG', tallis: 'TALLIS', hwc: 'HWC' };
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
    .select('id,item_no,projects(id,project_key,pid,title_ko,title_en,prime,stage,facts,installation),snapshots(id,captured_at,source_modified_at,fields,ko,en,key_dates)')
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
    ${wk.status !== 'final' ? `<p class="draft-note" role="status">${esc(t('draftNote'))}</p>` : ''}
    ${weekNav(weeks, wk)}
    <nav class="stepper" id="stepper" aria-label="${esc(t('stageNav'))}"></nav>
    <div class="war-tools">
      <input type="search" id="q" placeholder="${esc(t('search'))}" value="${esc(warView.q)}" aria-label="${esc(t('search'))}">
      <label class="sortsel"><span>${esc(t('sortBy'))}</span><select id="sort">
        ${[['start', 'sortStart'], ['prime', 'sortPrime'], ['stage', 'sortStage']].map(([v, k]) => `<option value="${v}" ${warView.sort === v ? 'selected' : ''}>${esc(t(k))}</option>`).join('')}</select></label>
      <div class="seg" role="group" aria-label="${esc(t('viewList'))} / ${esc(t('viewCards'))}">
        <button type="button" data-mode="list" aria-pressed="${warView.mode === 'list'}">${esc(t('viewList'))}</button>
        <button type="button" data-mode="cards" aria-pressed="${warView.mode === 'cards'}">${esc(t('viewCards'))}</button></div>
    </div>
    <div id="board"></div>`;

  const stageKey = (it) => stageOf(it.projects, latestSnap(it).fields);
  const startKey = (it) => ntpSpan(it.projects)?.start || '9999';
  const today = kstToday();
  let recs = null;   // records per project id, loaded once on first panel open
  const loadRecs = async () => {
    if (recs) return recs;
    const ids = items.map((i) => i.projects?.id).filter(Boolean);
    const { data } = ids.length ? await sb.from('records').select('project_id,title,category,status,status_date,file_url')
      .in('project_id', ids).not('status_date', 'is', null).order('status_date', { ascending: false }).limit(400) : { data: [] };
    recs = {}; for (const r of data || []) (recs[r.project_id] ||= []).push(r);
    return recs;
  };
  const drawStepper = () => {
    const n = (k) => items.filter((it) => stageKey(it) === k).length;
    const keys = [...LIFECYCLE, ...(n('other') ? ['other'] : [])];
    $('#stepper').innerHTML = `<button type="button" class="st-all" data-stage="all" aria-pressed="${warView.stage === 'all'}">${esc(t('allStages'))} <b>${items.length}</b></button>
      <ol>${keys.map((k) => { const s = STAGES.find((x) => x.k === k); const c = n(k);
        return `<li style="--stage:${s.c}"><button type="button" data-stage="${k}" aria-pressed="${warView.stage === k}" ${c ? '' : 'disabled'}>
          <i aria-hidden="true"></i><span>${esc(lang === 'ko' ? s.ko : s.en)}</span><b>${c}</b></button></li>`; }).join('')}</ol>`;
    $$('#stepper [data-stage]').forEach((b) => b.addEventListener('click', () => { warView.stage = b.dataset.stage; drawStepper(); draw(); }));
  };
  const sorted = (list) => {
    const byStart = (a, b) => startKey(a).localeCompare(startKey(b)) || (parseInt(a.item_no, 10) || 999) - (parseInt(b.item_no, 10) || 999);
    if (warView.sort === 'prime') return [...list].sort((a, b) => primeOf(a.projects, latestSnap(a).fields).localeCompare(primeOf(b.projects, latestSnap(b).fields)) || byStart(a, b));
    if (warView.sort === 'stage') return [...list].sort((a, b) => LIFECYCLE.indexOf(stageKey(a)) - LIFECYCLE.indexOf(stageKey(b)) || byStart(a, b));
    return [...list].sort(byStart);
  };
  const draw = () => {
    const q = warView.q.toLowerCase();
    const list = items.filter((it) => (warView.stage === 'all' || stageKey(it) === warView.stage) &&
      (!q || JSON.stringify([it.projects, latestSnap(it).ko, latestSnap(it).en]).toLowerCase().includes(q)));
    if (!list.length) { $('#board').innerHTML = `<p class="empty">${esc(t('noMatch'))}</p>`; return; }
    if (warView.mode === 'cards') {
      const groups = STAGES.map((s) => ({ s, cards: sorted(list).filter((it) => stageKey(it) === s.k) })).filter((g) => g.cards.length);
      $('#board').innerHTML = groups.map(({ s, cards }) => `
      <section class="stage" style="--stage:${s.c}">
        <h2>${esc(lang === 'ko' ? s.ko : s.en)} <span>${esc(lang === 'ko' ? s.dko : s.den)}</span></h2>
        <div class="board">${cards.map((it) => boardCard(it, wk, s)).join('')}</div>
      </section>`).join('');
      return;
    }
    $('#board').innerHTML = `<div class="plist">${sorted(list).map((it) => projectRow(it, wk, today)).join('')}</div>`;
    $$('#board details.prow').forEach((d) => d.addEventListener('toggle', async () => {
      if (!d.open || d.dataset.loaded) return; d.dataset.loaded = '1';
      const box = d.querySelector('.pp-recs'); if (!box) return;
      const all = await loadRecs(); const mine = (all[d.dataset.pid] || []).slice(0, 4);
      box.innerHTML = mine.length ? mine.map((r) => `<a class="pp-rec" href="${esc(r.file_url || '#')}" target="_blank" rel="noopener noreferrer">
        <span class="pp-rec-t">${esc(r.title || '')}</span><span class="pp-rec-d">${esc(fmtDate(r.status_date))}</span></a>`).join('') : `<p class="empty">${esc(t('noRecords'))}</p>`;
    }));
  };
  drawStepper();
  draw();
  $('#q').addEventListener('input', (e) => { warView.q = e.target.value; draw(); });
  $('#sort').addEventListener('change', (e) => { warView.sort = e.target.value; saveWarView(); draw(); });
  $$('.seg [data-mode]').forEach((b) => b.addEventListener('click', () => {
    warView.mode = b.dataset.mode; saveWarView(); $$('.seg [data-mode]').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); draw();
  }));
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

// One line per project; opening it shows details, the time bar, recent dated activity and recent records.
function projectRow(it, wk, today) {
  const sn = latestSnap(it); const p = it.projects || {}; const f = sn.fields || {};
  const s = STAGES.find((x) => x.k === stageOf(p, f)) || STAGES[STAGES.length - 1];
  const title = pick(f.title_ko || p.title_ko, f.title_en || p.title_en);
  const body = (lang === 'ko' ? (sn.ko?.length ? sn.ko : sn.en) : (sn.en?.length ? sn.en : sn.ko)) || [];
  const next = upcoming(sn.key_dates, wk.war_date, 1)[0];
  const span = ntpSpan(p); const tu = timeUsed(span, today);
  const events = body.filter(dated); const recent = (events.length ? events.slice(-3) : body.slice(0, 2));
  const st = LIFECYCLE.indexOf(s.k);
  return `<details class="prow" style="--stage:${s.c}" data-pid="${esc(p.id || '')}">
    <summary>
      <span class="pr-key">${esc(keyLabel(p.project_key))}</span>${primeTag(primeOf(p, f))}
      <span class="pr-title">${esc(title)}</span>
      <span class="pr-stage">${esc(lang === 'ko' ? s.ko : s.en)}</span>
      ${next ? `<span class="pr-next"><b>${esc(next.date_text.replace(/\s*\(.+\)$/, ''))}</b> ${esc(pick(next.ko, next.en))}</span>` : '<span class="pr-next"></span>'}
      ${f.status === 'carried' ? `<span class="chip muted">${esc(t('carried'))}</span>` : `<span class="chip live">${esc(t('updatedOn', fmtDate((sn.captured_at || '').slice(0, 10))))}</span>`}
    </summary>
    <div class="ppanel">
      ${st >= 0 ? `<ol class="pp-steps" aria-label="${esc(t('stageNav'))}">${LIFECYCLE.map((k, i) => { const x = STAGES.find((y) => y.k === k);
        return `<li class="${i < st ? 'done' : i === st ? 'now' : ''}"${i === st ? ' aria-current="step"' : ''}><i aria-hidden="true"></i><span>${esc(lang === 'ko' ? x.ko : x.en)}</span></li>`; }).join('')}</ol>` : ''}
      <div class="pp-grid">
        <div>
          ${factsBox(p.facts)}
          ${tu ? `<div class="tbar" role="img" aria-label="${esc(t('timeUsed', tu.pct, Math.max(0, tu.left)))}"><div class="tbar-track"><span style="width:${tu.pct}%"></span></div>
            <div class="tbar-lbl"><span>${esc(t('startLabel'))} ${esc(span.start)}</span><b>${esc(tu.left >= 0 ? t('timeUsed', tu.pct, tu.left) : t('timeOver', -tu.left))}</b><span>${esc(t('endLabel'))} ${esc(span.end)}</span></div>
            <small>${esc(t('timeNote'))}</small></div>` : ''}
        </div>
        <div>
          <h4>${esc(t('recentEvents'))}</h4><ul class="pp-events">${recent.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
          <h4>${esc(t('recentRecords'))}</h4><div class="pp-recs"><p class="empty">…</p></div>
        </div>
      </div>
      <a class="btn quiet small" href="#/war/${wk.war_date}/${encodeURIComponent(p.project_key)}">${esc(t('openCard'))} →</a>
    </div>
  </details>`;
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
      <div class="pb-brand">${org.logo_wide_url || org.logo_url ? `<img class="pb-logo" src="${esc((lang === 'en' && org.logo_wide_en_url) || org.logo_wide_url || org.logo_url)}" alt="${esc(org.name)}">` : ''}
        <div><div class="pb-eyebrow">${esc(org.slug.toUpperCase())} · ${esc(t('printEyebrow'))}</div>
        <h1>[WAR] ${esc(t('boardTitle'))}</h1></div></div>
      <div class="pb-date"><b>${esc(big)}</b><span>${esc(t(wk.status))} · ${esc(t('projects', items.length))}</span>
        ${wk.status !== 'final' ? `<span class="pb-draft">${esc(t('draftPrint'))} · ${esc(t('printFrom', fmtTime(new Date().toISOString())))}</span>` : ''}</div>
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
  // A4 landscape inside 12 mm / 14 mm margins: 269 x 186 mm = 1017 x 703 px.
  const PAGE_H = 700; const h = root.scrollHeight;
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
  // Photo status for this card: counts plus release-approved records only (see war-photos.mjs?v=a49aabcc).
  const { data: ps, error: psErr } = await sb.from('war_photo_sets')
    .select('total,in_window,date_pending,historical,verified,excluded,approved_public,withheld,approved,updated_at')
    .eq('project_key', p.project_key).eq('war_date', w.war_date).maybeSingle();

  box.innerHTML = `
    <p class="no-print"><a href="#/war/${w.war_date}">← ${esc(t('backBoard'))} (${esc(fmtDate(w.war_date))})</a></p>
    ${newest.w.id !== w.id ? `<div class="msg ok no-print">${esc(t('newerWeek'))} <a href="#/war/${newest.w.war_date}/${encodeURIComponent(key)}">${esc(fmtDate(newest.w.war_date))}</a></div>` : ''}
    <article class="detail" style="--stage:${st.c}">
      <div class="bc-top"><span class="bc-key">${esc(keyLabel(p.project_key))}</span>${primeTag(primeOf(p, f))}
        <span class="bc-stage">${esc(lang === 'ko' ? st.ko : st.en)}</span>
        <span class="spacer"></span>${instTag(p)}<span class="item-key">${esc(t('itemNo', it.item_no || '–'))}</span></div>

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
      ${photoGallery([...(Array.isArray(f.photo_evidence) ? f.photo_evidence : []), ...(Array.isArray(ps?.approved) ? ps.approved : [])], p.project_key, w.war_date, lang, warView.both, psErr ? 'error' : ps)}
      ${krima?.length ? `<section><h2>${esc(t('krimaText'))}</h2>${bullets(krima)}</section>` : ''}
      ${si && ((si.internal_notes || []).length || (si.open_items || []).length) ? `<section class="internal no-print">
        ${(si.internal_notes || []).length ? `<h3>${esc(t('internal'))}</h3>${bullets(si.internal_notes)}` : ''}
        ${(si.open_items || []).length ? `<h3>${esc(t('open'))}</h3><ul>${si.open_items.map((o) => `<li class="${o.done ? 'done' : ''}">${esc(o.text)}</li>`).join('')}</ul>` : ''}
      </section>` : ''}
      ${appearances.length > 1 ? `<section class="no-print"><h2>${esc(t('otherWeeks'))}</h2><nav class="weeks">${appearances.map(({ w: aw }) => `
        <a href="#/war/${aw.war_date}/${encodeURIComponent(key)}" ${aw.id === w.id ? 'aria-current="page"' : ''}><span class="d">${esc(fmtDate(aw.war_date))}</span><span class="chip ${aw.status}">${esc(t(aw.status))}</span></a>`).join('')}</nav></section>` : ''}
    </article>`;
  bindPhotoErrors(box, lang);
  if (DEMO) demoPhotoLinks(box, t('demoFull'));
  loadDrivePhotos(box, async (id) => {
    try { return DEMO ? await demoPhoto(id) : await requestPhoto(`${SUPABASE_URL}/functions/v1/photo?id=${encodeURIComponent(id)}&w=1600`,SUPABASE_KEY,sb.auth); }
    catch (error) {
      // Safe diagnostic only. No IDs, bearer tokens, relay URLs or response bodies.
      console.warn('WAR photo request failed', {status:error.status || 'network'});
      throw error;
    }
  }, lang).then(({loaded,failed}) => {
    if (!box.isConnected || !failed) return;   // only report problems; the heading already gives the count
    const status = document.createElement('p'); status.className = failed ? 'msg err' : 'empty';
    status.textContent = lang === 'ko' ? `사진 ${loaded}장 표시${failed ? `, ${failed}장 불러오기 실패` : ''}` : `${loaded} photos loaded${failed ? `; ${failed} could not be loaded` : ''}.`;
    box.querySelector('.war-photos h2')?.after(status);
  });
  $('#both')?.addEventListener('change', (e) => { warView.both = e.target.checked; renderProject(dateParam, keyParam); });
}

// Projects, Proposals, Warranties and project pages are switched off until they are ready (WAR first).
function renderSoon() {
  shell(t('comingSoon'), `<div class="soon-page"><span class="chip muted">${esc(t('comingSoon'))}</span>
    <h1>${esc(t('comingSoon'))}</h1><p class="lede">${esc(t('comingSoonLede'))}</p>
    <p><a class="btn" href="#/war">WAR</a> <a class="btn quiet" href="#/">${esc(t('home'))}</a></p></div>`);
}
async function renderHome() {
  shell('', `<h1 class="sr">${esc(t('home'))}</h1><div class="desk" id="tiles"><p class="empty">…</p></div><div id="qstrip"></div>`);
  const [{ data: projects }, { data: weeks }, { data: qs }] = await Promise.all([
    Promise.resolve({ data: null }),
    sb.from('weeks').select('id,war_date,status,rev').order('war_date', { ascending: false }).order('rev', { ascending: false }).limit(1),
    sb.from('questions').select('id,status').eq('status', 'open'),
  ]);
  const wk = weeks?.[0];

  const tile = (href, title, lede, stats, main = false) => `
    <a class="dtile${main ? ' main' : ''}" href="${href}">
      ${main ? grainSvg('grain', 7) : ''}
      <h2>${esc(title)}</h2><p>${esc(lede)}</p>
      <span class="stat">${stats}</span>
    </a>`;
  // Not open yet: shown so people see what is coming, but not clickable.
  const soonTile = (title, lede) => `
    <div class="dtile soon" aria-disabled="true">
      <h2>${esc(title)}</h2><p>${esc(lede)}</p>
      <span class="stat"><span class="chip muted">${esc(t('comingSoon'))}</span></span>
    </div>`;
  const stat = (num, label) => `<span class="num"><b>${num}</b>${esc(label)}</span>`;
  $('#tiles').innerHTML =
    tile(wk ? `#/war/${wk.war_date}` : '#/war', 'WAR', t('warLede'),
      wk ? `<span class="chip ${wk.status}">${esc(t(wk.status))}</span> <span>${esc(fmtDate(wk.war_date))}</span>` : esc(t('noWeeks')), true) +
    tile('#/contacts', t('contactsTitle'), t('contactsHome'), '<span id="ctStat"></span>') +
    soonTile(t('projectsTitle'), t('projectsLede')) +
    soonTile(t('proposalsTitle'), t('proposalsLede')) +
    soonTile(t('warrantiesTitle'), t('warrantiesLede'));

  void qs; // questions come back with the project pages
  sb.from('contact_assignments').select('pid,project_no,contact_key,status').then(({ data }) => {
    const el = $('#ctStat'); if (!el || !data?.length) return;
    const ppl = new Set(data.filter((a) => a.status !== 'Ended' && !/^(GNC|HWC)-/.test(a.contact_key)).map((a) => a.contact_key)).size;
    const pj = new Set(data.filter((a) => /^P-\d/.test(a.pid || '')).map((a) => a.pid)).size;
    el.innerHTML = `<span class="num"><b>${ppl}</b>${esc(t('statPeople'))}</span><span class="num"><b>${pj}</b>${esc(t('statProjects'))}</span>`;
  });
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
// Welcome email (Korean + English) to someone just given access: who gave it, which desk, what it is, how to sign in.
// Pass { roster_id } or { user_id }. The server sends it once per address. Returns 'sent', 'already_sent', 'fail', …
async function sendInvite(target) {
  try {
    const { data, error } = await sb.functions.invoke('notify', { body: { event: 'invited', ...target } });
    return error ? 'fail' : (data?.status || 'fail');
  } catch { return 'fail'; }
}
const shortDate = (iso) => new Date(iso).toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-GB', { day: 'numeric', month: 'short' });
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
    const { error } = await sb.rpc('delete_question', { qid: b.dataset.del });
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
const accessView = { filter: 'all', q: '', editing: null };
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
  const invitable = (r) => r.employed && r.needs_access && r.email && r.email.toLowerCase() !== state.user.email.toLowerCase();
  const inviteSentTo = (r) => r.invite_sent_to && r.invite_sent_to.toLowerCase() === r.email.toLowerCase();
  const inviteCell = (r) => !invitable(r) ? ''
    : inviteSentTo(r) ? `<small class="inv">${esc(t('inviteOn', shortDate(r.invite_sent_at)))}</small>`
    : `<button type="button" class="linkbtn inv" data-invite="${r.id}">${esc(t('sendInvite'))}</button>`;
  const roleSel = (id, val, disabled) => `<select data-f="access_role" data-id="${id}" ${disabled ? 'disabled' : ''} aria-label="${esc(t('role'))}">
      ${['team', 'exec', 'admin'].map((r) => `<option value="${r}" ${val === r ? 'selected' : ''}>${esc(t('role' + r[0].toUpperCase() + r.slice(1)))}</option>`).join('')}</select>`;

  // Edit a person's details in place. Leaving the company (untick) ends their access through the roster sync.
  const editRow = (r, self) => `<tr class="editrow"><td colspan="6"><form class="redit-form" data-form="${r.id}">
      <div class="field"><label for="e1-${r.id}">${esc(t('rNameEn'))}</label><input id="e1-${r.id}" name="name_en" type="text" required value="${esc(r.name_en || '')}"></div>
      <div class="field"><label for="e2-${r.id}">${esc(t('rNameKo'))}</label><input id="e2-${r.id}" name="name_ko" type="text" value="${esc(r.name_ko || '')}"></div>
      <div class="field"><label for="e3-${r.id}">${esc(t('team'))}</label><input id="e3-${r.id}" name="team" type="text" list="teams" value="${esc(r.team || '')}"></div>
      <div class="field"><label for="e4-${r.id}">${esc(t('rTitleEn'))}</label><input id="e4-${r.id}" name="title_en" type="text" value="${esc(r.title_en || '')}"></div>
      <div class="field"><label for="e5-${r.id}">${esc(t('rTitleKo'))}</label><input id="e5-${r.id}" name="title_ko" type="text" value="${esc(r.title_ko || '')}"></div>
      <div class="field wide"><label for="e6-${r.id}">${esc(t('rNotes'))}</label><input id="e6-${r.id}" name="notes" type="text" value="${esc(r.notes || '')}"></div>
      <label class="chk wide"><input type="checkbox" name="employed" ${r.employed ? 'checked' : ''} ${self ? 'disabled' : ''}> ${esc(t('rEmployed'))}</label>
      ${self ? `<p class="note wide">${esc(t('rSelf'))}</p>` : ''}
      <div class="acts wide"><button class="btn small" type="submit">${esc(t('rSave'))}</button>
        <button class="btn small quiet" type="button" data-cancel>${esc(t('rCancel'))}</button>
        ${self ? '' : `<button class="linkbtn danger" type="button" data-remove="${r.id}">${esc(t('rRemove'))}</button>`}
        <span class="fb" aria-live="polite"></span></div>
    </form></td></tr>`;
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
          ${r.notes ? `<span class="note">${esc(r.notes)}</span>` : ''}
          <button type="button" class="linkbtn redit" data-edit="${r.id}" aria-expanded="${accessView.editing === r.id}">${esc(t('rEdit'))}</button></td>
        <td>${esc(pick(r.title_ko, r.title_en))}</td>
        <td class="keep"><span class="mlbl">${esc(t('email'))}</span><input type="email" data-f="email" data-id="${r.id}" value="${esc(r.email || '')}" placeholder="name@company.com" aria-label="${esc(t('email'))}" ${self ? 'disabled' : ''}></td>
        <td class="keep inl"><label class="mlbl" for="na-${r.id}">${esc(t('rAccessLbl'))}</label><input type="checkbox" id="na-${r.id}" data-f="needs_access" data-id="${r.id}" ${r.needs_access ? 'checked' : ''} ${!r.employed || self ? 'disabled' : ''} aria-label="${esc(t('needsAccess'))}"></td>
        <td class="keep inl">${roleSel(r.id, r.access_role, self || !r.employed)}</td>
        <td class="inl"><span class="chip ${cls}">${esc(label)}</span>${inviteCell(r)} <span class="fb" aria-live="polite"></span></td>
      </tr>${accessView.editing === r.id ? editRow(r, self) : ''}`;
    }
    return html || `<tr><td colspan="6" class="empty">${esc(t('noPeople'))}</td></tr>`;
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
      <p class="empty" style="font-size:13px;border-top:1px solid var(--line-2)">${esc(t('shareHelp'))} <b>${DEMO ? `https://${ROOT_DOMAIN}/?org=demo` : `https://${esc(state.slug)}.${ROOT_DOMAIN}`}</b></p>
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
    $$('[data-edit]', tbody).forEach((b) => b.addEventListener('click', () => {
      accessView.editing = accessView.editing === b.dataset.edit ? null : b.dataset.edit;
      tbody.innerHTML = rows(); rebind(); $(`#e1-${accessView.editing}`)?.focus();
    }));
    $$('[data-cancel]', tbody).forEach((b) => b.addEventListener('click', () => { accessView.editing = null; tbody.innerHTML = rows(); rebind(); }));
    $$('form[data-form]', tbody).forEach((f) => f.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const id = f.dataset.form; const row = roster.find((r) => r.id === id); const fb = $('.fb', f);
      const val = (n) => (f.elements[n].value || '').trim() || null;
      const patch = { name_en: val('name_en'), name_ko: val('name_ko'), team: val('team'), title_en: val('title_en'), title_ko: val('title_ko'), notes: val('notes') };
      if (!f.elements.employed.disabled) { patch.employed = f.elements.employed.checked; if (!patch.employed) patch.needs_access = false; }
      if (!patch.name_en) { fb.className = 'fb err'; fb.textContent = t('rNameEn'); return; }
      const { data, error } = await sb.from('roster').update(patch).eq('id', id).select().single();
      if (error) { fb.className = 'fb err'; fb.textContent = errText(error); return; }
      Object.assign(row, data); accessView.editing = null;
      const { data: ps } = await sb.from('profiles').select('user_id,email,name,role,status,requested_note,created_at').eq('org_id', state.orgId);
      byEmail.clear(); (ps || []).forEach((p) => byEmail.set(p.email.toLowerCase(), p));
      tbody.innerHTML = rows(); rebind();
      const fb2 = $(`tr[data-row="${id}"] .fb`); if (fb2) { fb2.className = 'fb saved'; fb2.textContent = t('saved'); }
    }));
    $$('[data-remove]', tbody).forEach((b) => b.addEventListener('click', async () => {
      const id = b.dataset.remove; const row = roster.find((r) => r.id === id);
      if (!confirm(t('rRemoveAsk', pick(row.name_ko, row.name_en)))) return;
      const { error } = await sb.from('roster').delete().eq('id', id);
      if (error) { const fb = $('.fb', b.closest('form')); fb.className = 'fb err'; fb.textContent = errText(error); return; }
      accessView.editing = null; toast(t('rRemoved')); renderAccess();
    }));
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
      let note = t('saved');
      if ((fld === 'needs_access' || fld === 'email') && invitable(row) && !inviteSentTo(row)) {
        const st = await sendInvite({ roster_id: id });
        if (st === 'sent') { row.invite_sent_to = row.email; row.invite_sent_at = new Date().toISOString(); note = t('inviteSent'); }
        else if (st === 'fail') note = t('inviteFail');
      }
      const { data: ps } = await sb.from('profiles').select('user_id,email,name,role,status,requested_note,created_at').eq('org_id', state.orgId);
      byEmail.clear(); (ps || []).forEach((p) => byEmail.set(p.email.toLowerCase(), p));
      tbody.innerHTML = rows(); rebind();
      const fb2 = $(`tr[data-row="${id}"] .fb`); if (fb2) { fb2.className = note === t('inviteFail') ? 'fb err' : 'fb saved'; fb2.textContent = note; }
    }));
    $$('[data-invite]', tbody).forEach((b) => b.addEventListener('click', async () => {
      const id = b.dataset.invite; const row = roster.find((r) => r.id === id);
      b.disabled = true;
      const st = await sendInvite({ roster_id: id });
      if (st === 'sent' || st === 'already_sent') { row.invite_sent_to = row.email; row.invite_sent_at = row.invite_sent_at || new Date().toISOString(); }
      tbody.innerHTML = rows(); rebind();
      const fb = $(`tr[data-row="${id}"] .fb`);
      if (fb) { fb.className = st === 'fail' ? 'fb err' : 'fb saved'; fb.textContent = st === 'fail' ? t('inviteFail') : t('inviteSent'); }
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
    if (error) return toast(errText(error));
    const st = await sendInvite(match ? { roster_id: match } : { user_id: id });
    toast(st === 'fail' ? t('inviteFail') : st === 'sent' ? t('inviteSent') : t('saved')); renderAccess();
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

// ---------------------------------------------------------------- Contacts (read-only copy of tracker 09A/09B/09C)
const AUTH_GROUPS = [
  ['KO', /^KO/], ['CS', /^Contract specialist/], ['COR', /^COR/], ['AP', /^Approval/], ['US', /^User unit/],
  ['IN', /^Info/], ['PR', /^Prime/], ['GN', /^(GNC|Contractor)/],
];
const groupOf = (a) => (AUTH_GROUPS.find(([, re]) => re.test(a || '')) || ['OT'])[0];
const contactsView = { q: '' };
let contactsCache = null;
async function loadContacts() {
  if (contactsCache) return contactsCache;
  const [o, p, a, pr, pj] = await Promise.all([
    sb.from('contact_orgs').select('*').order('org_key'),
    sb.from('contacts').select('*').order('contact_key'),
    sb.from('contact_assignments').select('*').order('sort'),
    isAdmin() ? sb.from('contacts_private').select('contact_key,mobile,other_channel') : Promise.resolve({ data: [] }),
    sb.from('projects').select('pid,project_key,title_en,title_ko'),
  ]);
  if (o.error || p.error || a.error) return null;
  contactsCache = { orgs: o.data || [], people: p.data || [], asg: a.data || [], priv: new Map((pr.data || []).map((x) => [x.contact_key, x])), projects: pj.data || [] };
  setTimeout(() => { contactsCache = null; }, 5 * 60 * 1000);
  return contactsCache;
}
// Link only a single dialable number. DSN and notes like "(SF 1442) / ..." stay plain text.
const telHref = (v) => { const s = String(v || '').trim(); return /^\+?[\d\s()-]{7,}$/.test(s) && !/^\s*DSN/i.test(s) ? 'tel:' + s.replace(/[^\d+]/g, '') : null; };
const phoneHtml = (label, v) => { if (!v) return ''; const h = telHref(v); return `<div class="ct-ph"><span>${esc(label)}</span>${h ? `<a href="${h}">${esc(v)}</a>` : esc(v)}</div>`; };
function projectSlots(asg) {
  const seen = new Map();
  for (const a of asg) {
    const id = a.pid === 'NO PID' ? a.project_no : a.pid;
    if (id && !seen.has(id)) seen.set(id, { id, pid: a.pid, no: a.project_no });
  }
  const rank = (x) => (/^P-\d/.test(x.pid) ? 0 : x.pid === 'ALL' ? 2 : 1);
  return [...seen.values()].sort((a, b) => rank(a) - rank(b) || String(a.id).localeCompare(String(b.id)));
}
const slotLabel = (x) => (x.pid === 'ALL' ? t('allProjects') : /^P-\d/.test(x.pid) ? x.pid : String(x.no || x.id).replace(/^SMYU\s*/, '').replace(/\s*\(.*\)$/, ''));
function personMatches(p, a, q) {
  if (!q) return true;
  const hay = [p?.name_en, p?.name_ko, p?.work_email, p?.rank_title, p?.office_symbol, p?.notes, a?.role, a?.notes].join(' ').toLowerCase();
  return q.toLowerCase().split(/\s+/).every((w) => hay.includes(w));
}
function contactCard(p, a, c) {
  const priv = c.priv.get(p?.contact_key || a?.contact_key);
  const name = p ? pick(p.name_ko, p.name_en) : (a?.contact_key || '').replace(/^GNC-/, 'GNC · ');
  const alt = p && p.name_ko && p.name_en ? (lang === 'ko' ? p.name_en : p.name_ko) : '';
  const g = a ? groupOf(a.authority) : null;
  const badge = a ? (g === 'KO' ? `<span class="chip auth-ko">${esc(t('aKO'))}</span>` : /site entry/i.test(a.authority || '') ? `<span class="chip auth-site">${esc(t('aSite'))}</span>` : g === 'COR' ? `<span class="chip auth-cor">${esc(t('aCOR'))}</span>` : '') : '';
  const dist = a && { To: 'dTo', cc: 'dCc', bcc: 'dBcc', 'on request': 'dReq' }[a.distribution];
  const esc2 = a?.escalation_key ? c.people.find((x) => x.contact_key === a.escalation_key) : null;
  const flags = [
    (a?.status === 'Verify' || p?.status === 'Verify') ? `<span class="chip warn">${esc(t('verify'))}</span>` : '',
    p?.status === 'Role changed' ? `<span class="chip muted">${esc(t('roleChanged'))}</span>` : '',
    p?.status === 'Left' ? `<span class="chip muted">${esc(t('left'))}</span>` : '',
  ].join('');
  return `<article class="ct-card">
    <div class="ct-head"><h3>${esc(name)}${alt ? ` <span class="alt">${esc(alt)}</span>` : ''}</h3>${dist ? `<span class="chip dist">${esc(t(dist))}</span>` : ''}</div>
    <p class="ct-title">${esc([p?.rank_title, p?.office_symbol].filter(Boolean).join(' · '))}</p>
    ${a?.role ? `<p class="ct-role">${esc(a.role)}${a.effective_thru ? ` · ${esc(t('thru', fmtDate(a.effective_thru)))}` : ''}</p>` : ''}
    ${badge || flags ? `<div class="ct-badges">${badge}${flags}</div>` : ''}
    <div class="ct-lines">
      ${p ? (p.work_email ? `<div class="ct-mail"><a href="mailto:${esc(p.work_email)}">${esc(p.work_email)}</a></div>` : `<div class="ct-mail none">${esc(t('noEmail'))}</div>`) : ''}
      ${phoneHtml('DSN/Office', p?.office_phone)}${phoneHtml('Comm', p?.comm_phone)}
      ${priv ? `<div class="ct-priv" title="${esc(t('adminOnly'))}">${phoneHtml(t('mobile'), priv.mobile)}${priv.other_channel ? `<div class="ct-ph"><span>${esc(t('otherCh'))}</span>${esc(priv.other_channel)}</div>` : ''}</div>` : ''}
    </div>
    ${a?.designation ? `<p class="ct-note">${esc(a.designation)}</p>` : ''}
    ${a?.notes ? `<p class="ct-note">${esc(a.notes)}</p>` : ''}
    ${!a && p?.notes ? `<p class="ct-note">${esc(p.notes)}</p>` : ''}
    ${esc2 ? `<p class="ct-esc">${esc(t('escalate'))}: ${esc(pick(esc2.name_ko, esc2.name_en))}</p>` : ''}
    ${p?.verified_on ? `<p class="ct-ver">${esc(t('verifiedOn', fmtDate(p.verified_on)))}${p.source ? ` · ${esc(p.source)}` : ''}</p>` : ''}
  </article>`;
}
async function renderContacts(arg) {
  const crumb = t('contactsTitle');
  shell(crumb, `<h1>${esc(crumb)}</h1><p class="lede">${esc(t('contactsLede'))}</p><div id="ct"><p class="empty">…</p></div>`);
  const c = await loadContacts();
  const box = $('#ct');
  if (!c) { box.innerHTML = `<div class="msg err">${esc(t('errGeneric'))}</div>`; return; }
  if (!c.people.length) { box.innerHTML = `<p class="empty">${esc(t('noContacts'))}</p>`; return; }
  const byKey = new Map(c.people.map((p) => [p.contact_key, p]));
  const slots = projectSlots(c.asg);
  const dirMode = arg === 'all';
  const sel = dirMode ? null : (slots.find((x) => x.id === decodeURIComponent(arg || '')) || slots[0]);
  const tabs = `<nav class="ct-tabs" aria-label="${esc(t('contactsTitle'))}">
      <a href="#/contacts/${encodeURIComponent(sel?.id || slots[0].id)}" ${!dirMode ? 'aria-current="page"' : ''}>${esc(t('byProject'))}</a>
      <a href="#/contacts/all" ${dirMode ? 'aria-current="page"' : ''}>${esc(t('directory'))}</a></nav>
    <input type="search" id="cq" placeholder="${esc(t('searchContacts'))}" aria-label="${esc(t('searchContacts'))}" value="${esc(contactsView.q)}">`;

  const draw = () => {
    const q = contactsView.q.trim();
    if (dirMode) {
      const groups = c.orgs.map((o) => ({ o, ps: c.people.filter((p) => p.contact_org_key === o.org_key && personMatches(p, null, q)) })).filter((g) => g.ps.length);
      $('#ctBody').innerHTML = groups.length ? groups.map(({ o, ps }) => `<section class="ct-group">
        <h2>${esc(pick(o.name_ko, o.name_en))} <span>${esc(t('nPeople', ps.length))}</span></h2>
        ${o.mailbox ? `<p class="ct-org-mail"><a href="mailto:${esc(o.mailbox)}">${esc(o.mailbox)}</a></p>` : ''}
        <div class="ct-grid">${ps.map((p) => contactCard(p, null, c)).join('')}</div></section>`).join('') : `<p class="empty">${esc(t('noPeople'))}</p>`;
      return;
    }
    const rows = c.asg.filter((a) => (sel.pid === 'NO PID' ? a.project_no === sel.no : a.pid === sel.pid));
    const active = rows.filter((a) => a.status !== 'Ended');
    const ended = rows.filter((a) => a.status === 'Ended');
    const mails = (d) => [...new Set(active.filter((a) => a.distribution === d).map((a) => byKey.get(a.contact_key)?.work_email).filter(Boolean))];
    const to = mails('To'), cc = mails('cc');
    const from = [...new Set(active.map((a) => a.send_from).filter(Boolean))];
    const pj = c.projects.find((x) => x.pid && x.pid === sel.pid) || c.projects.find((x) => sel.no && String(sel.no).includes(x.project_key));
    const shown = active.filter((a) => personMatches(byKey.get(a.contact_key), a, q));
    const groups = [...AUTH_GROUPS.map(([k]) => k), 'OT'].map((k) => ({ k, rows: shown.filter((a) => groupOf(a.authority) === k) })).filter((g) => g.rows.length);
    $('#ctBody').innerHTML = `
      <header class="ct-proj">
        <h2>${esc(sel.pid === 'ALL' ? t('allProjects') : [sel.pid !== 'NO PID' ? sel.pid : '', sel.no].filter(Boolean).join(' · '))}</h2>
        ${pj ? `<p>${esc(pick(pj.title_ko, pj.title_en))}</p>` : ''}
      </header>
      ${to.length || cc.length || from.length ? `<section class="ct-lists"><h3>${esc(t('emailLists'))}</h3>
        ${to.length ? `<div class="ct-list"><b>${esc(t('toLine'))}</b><code id="lTo">${esc(to.join('; '))}</code><button type="button" class="btn quiet sm" data-copy="lTo">${esc(t('copy'))}</button></div>` : ''}
        ${cc.length ? `<div class="ct-list"><b>${esc(t('ccLine'))}</b><code id="lCc">${esc(cc.join('; '))}</code><button type="button" class="btn quiet sm" data-copy="lCc">${esc(t('copy'))}</button></div>` : ''}
        ${from.length ? `<div class="ct-list"><b>${esc(t('sendFrom'))}</b><span>${esc(from.join(' · '))}</span></div>` : ''}
      </section>` : ''}
      ${groups.length ? groups.map((g) => `<section class="ct-group"><h2>${esc(t('g' + g.k))}</h2>
        <div class="ct-grid">${g.rows.map((a) => contactCard(byKey.get(a.contact_key), a, c)).join('')}</div></section>`).join('') : `<p class="empty">${esc(t('noPeople'))}</p>`}
      ${ended.length ? `<details class="ct-ended"><summary>${esc(t('earlier'))} (${ended.length})</summary>
        <div class="ct-grid">${ended.map((a) => contactCard(byKey.get(a.contact_key), a, c)).join('')}</div></details>` : ''}`;
    $('#ctBody').querySelectorAll('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText($('#' + b.dataset.copy).textContent); toast(t('copied')); } catch { /* clipboard blocked: text stays selectable */ }
    }));
  };
  box.innerHTML = `<div class="ct-bar">${tabs}</div>
    ${dirMode ? '' : `<nav class="ct-chips" aria-label="${esc(t('byProject'))}">${slots.map((x) => `<a href="#/contacts/${encodeURIComponent(x.id)}" ${x.id === sel.id ? 'aria-current="page"' : ''}>${esc(slotLabel(x))}</a>`).join('')}</nav>`}
    <div id="ctBody"></div>`;
  $('#cq').addEventListener('input', (e) => { contactsView.q = e.target.value; draw(); });
  draw();
}

// ---------------------------------------------------------------- router
async function route() {
  document.documentElement.lang = lang;
  syncTopBtn();
  demoBar();
  if (!state.slug) return renderPortal();
  if (!state.org) {
    const { data } = await sb.rpc('org_directory');
    state.org = (data || []).find((o) => o.slug === state.slug) || null;
    if (!state.org) {
      app.innerHTML = `<div class="gate"><div class="gate-card"><h1>Gyeoldesk</h1><p>${esc(t('unknownOrg'))}</p>
        <a class="btn" href="https://${ROOT_DOMAIN}/">${esc(t('back'))}</a></div></div>${siteFoot()}`;
      return;
    }
    document.title = DEMO ? `${state.org.name} (demo) · Gyeoldesk` : document.querySelector('meta[name="application-name"]')?.content || `${state.org.name} · Gyeoldesk`;
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
  if (page === 'contacts') return renderContacts(arg);
  if (['projects', 'proposals', 'warranties', 'questions', 'p'].includes(page)) return renderSoon();
  const sub2 = (location.hash || '').split('/')[3];
  if (page === 'p' && arg && sub2) return renderRecords(arg, sub2);
  if (page === 'p' && arg) return renderProjectPage(arg);
  return renderHome();
}

// Scroll: a new page opens at the top; going back to a page you came from
// (the board after a card) returns to where you were on it.
try { history.scrollRestoration = 'manual'; } catch {}
const scrollMemo = new Map();
let lastHash = location.hash;
window.addEventListener('hashchange', async () => {
  scrollMemo.set(lastHash, window.scrollY);
  lastHash = location.hash;
  const y = scrollMemo.get(location.hash) || 0;
  window.scrollTo(0, 0);
  await route();
  if (y) requestAnimationFrame(() => window.scrollTo(0, y));
});

// Back-to-top arrow: appears after scrolling down one screen.
const topBtn = document.createElement('button');
topBtn.type = 'button';
topBtn.className = 'to-top no-print';
topBtn.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
topBtn.addEventListener('click', () => {
  const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
});
document.body.appendChild(topBtn);
function syncTopBtn() {
  const b = document.querySelector('.to-top');
  if (!b) return;
  b.setAttribute('aria-label', t('toTop'));
  b.title = t('toTop');
  b.classList.toggle('show', window.scrollY > window.innerHeight * 0.8);
}
window.addEventListener('scroll', syncTopBtn, { passive: true });
window.addEventListener('resize', syncTopBtn);
syncTopBtn();
(async () => {
  const { data } = await sb.auth.getSession();
  state.user = data.session?.user || null;
  route();
})();
