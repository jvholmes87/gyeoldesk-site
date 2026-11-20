// Preview lock: preview.gyeoldesk.com runs test builds against the live database.
// Until the person unlocks saving for their browser tab, every request that would
// change live data or send email is refused here, before it leaves the browser.
// Sign-in and reading still work. This prevents accidents; it is not a security
// boundary (row-level security in the database is).

// Database functions that only read, or only affect the signed-in person.
export const ALLOWED_RPC = ['org_directory', 'set_my_lang', 'request_access'];
export const LOCKED_MESSAGE = 'Preview: saving to live data is locked. Unlock it in the yellow bar to test a save. / 미리보기: 실제 데이터 저장이 잠겨 있습니다. 노란 바에서 잠금을 해제한 뒤 시험하세요.';

// True when a request would write live data or trigger an email.
export function isLiveWrite(url, method) {
  const m = String(method || 'GET').toUpperCase();
  if (m === 'GET' || m === 'HEAD' || m === 'OPTIONS') return false;
  let path;
  try { path = new URL(String(url)).pathname; } catch { path = String(url); }
  if (path.startsWith('/auth/v1/')) return false;
  const rpc = path.match(/^\/rest\/v1\/rpc\/([A-Za-z0-9_]+)/);
  if (rpc) return !ALLOWED_RPC.includes(rpc[1]);
  return path.startsWith('/rest/v1/') || path.startsWith('/functions/v1/') || path.startsWith('/storage/v1/');
}

// Wraps fetch. isLocked() is read on every request, so unlocking takes effect at once.
export function lockedFetch(baseFetch, isLocked, onBlocked) {
  return async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input?.url;
    const method = init.method || (typeof input === 'object' && input?.method) || 'GET';
    if (isLocked() && isLiveWrite(url, method)) {
      try { onBlocked?.(); } catch {}
      return new Response(JSON.stringify({ message: LOCKED_MESSAGE, code: 'preview_locked' }),
        { status: 423, headers: { 'Content-Type': 'application/json' } });
    }
    return baseFetch(input, init);
  };
}
