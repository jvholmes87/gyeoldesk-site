// Released photos only (verified + approved by a named reviewer). Images stay in Google Drive: a Drive photo is loaded
// through the members-only `photo` function (row-level security decides), never from public hosting.
// Filtering here is defense in depth, never an access-control boundary.
const escape = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const validDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && Number.isFinite(Date.parse(s)) && new Date(s).toISOString().slice(0,10) === s;
function asset(path) {
  // Same-origin, fixed directory, opaque filenames. No remote trackers or signed URLs.
  return typeof path === 'string' && /^\/assets\/war-photos\/[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp)$/.test(path) ? path : null;
}
const driveId = (id) => (typeof id === 'string' && /^[a-zA-Z0-9_-]{20,}$/.test(id) ? id : null);
const RELEASED = ['approved_internal', 'approved_prime', 'approved_public'];
function evidence(url) {
  if (typeof url !== 'string') return null;
  return /^https:\/\/drive\.google\.com\/file\/d\/[a-zA-Z0-9_-]+\/view$/.test(url) ? url : null;
}
export function releasedPhotos(records, projectKey, period) {
  if (!Array.isArray(records) || !validDate(period)) return [];
  const seen = new Set();
  const end = Date.parse(period), start = end - 6 * 86400000;
  return records.filter((p) => {
    if (!p || p.project_key !== projectKey || p.war_date !== period || p.verification !== 'verified' || !RELEASED.includes(p.release_status)) return false;
    if (typeof p.photo_id !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(p.photo_id) || seen.has(p.photo_id)) return false;
    if (!validDate(p.capture_date) || Date.parse(p.capture_date) < start || Date.parse(p.capture_date) > end) return false;
    if (!validDate(p.release_reviewed_on) || typeof p.release_reference !== 'string' || !p.release_reference.trim()) return false;
    if (!(driveId(p.drive_file_id) || (asset(p.image_path) && p.release_status === 'approved_public')) || !evidence(p.evidence_url) || ![p.caption_en,p.caption_ko].some((s) => typeof s === 'string' && s.trim())) return false;
    seen.add(p.photo_id); return true;
  }).sort((a,b) => a.capture_date.localeCompare(b.capture_date) || a.photo_id.localeCompare(b.photo_id));
}
// set: optional photo-status row for this project/week (counts only, from the restricted manifest via the collector).
// It never carries captions, links or images of unreleased photos; it only lets the card say what exists and why
// nothing is shown, instead of implying that no photos were taken.
const n = (v) => (Number.isInteger(v) && v > 0 ? v : 0);
export function photoStatus(set, shown, lang = 'en') {
  const ko = lang === 'ko';
  if (set === 'error') return ko ? '사진 현황을 불러오지 못했습니다. 새로 고침하세요.' : 'Photo status could not be loaded. Refresh to try again.';
  if (!set || !n(set.total)) return shown ? '' : (ko ? '이 기간에 승인된 사진이 없습니다. 사진 수집 여부는 확인되지 않았습니다.' : 'No released photos for this period. Collection status is unconfirmed.');
  const held = Math.max(0, n(set.total) - shown);
  if (!held) return '';
  const parts = [];
  if (n(set.historical)) parts.push(ko ? `이전 촬영 추정 ${n(set.historical)}장 — 이력 참고, 금주 작업 아님` : `${n(set.historical)} probable earlier capture${n(set.historical) > 1 ? 's' : ''} kept as historical reference${n(set.historical) > 1 ? 's' : ''}, not this week's work`);
  if (n(set.date_pending)) parts.push(ko ? `촬영일 미확정 ${n(set.date_pending)}장` : `${n(set.date_pending)} with capture date unconfirmed`);
  const head = ko
    ? `이 기간 사진 ${n(set.total)}장 기록됨. ${shown ? `승인된 갤러리 기록 ${shown}장, ` : ''}${held}장은 갤러리 선택에 포함되지 않습니다`
    : `${n(set.total)} photo${n(set.total) > 1 ? 's' : ''} recorded for this period. ${shown ? `${shown} approved gallery records; ` : ''}${held} not in the gallery selection`;
  const tail = ko ? ' 사진은 과업 구글 드라이브에 보관되며, 사진만으로 완료·승인을 판단하지 않습니다.' : ' Photos stay in the project\'s Google Drive. A photo alone does not establish completion or approval.';
  return head + (parts.length ? ' (' + parts.join(ko ? ', ' : '; ') + ')' : '') + '.' + tail;
}
export function photoGallery(records, projectKey, period, lang = 'en', both = false, set = null) {
  const ko = lang === 'ko';
  const photos = releasedPhotos(records, projectKey, period);
  const title = ko ? '작업 사진' : 'Work photos';
  const note = photoStatus(set, photos.length, lang);
  const noteHtml = note ? `<p class="${set === 'error' ? 'msg err' : 'empty'} photo-status">${escape(note)}</p>` : '';
  if (!photos.length) return `<section class="war-photos"><h2>${title}</h2>${noteHtml}</section>`;
  return renderGallery(photos, title, lang, both).replace('</h2>', `</h2>${noteHtml}`);
}
function renderGallery(photos, title, lang, both) {
  const ko = lang === 'ko';
  return `<section class="war-photos"><h2>${escape(title)} (${photos.length})</h2><div class="photo-grid">${photos.map((p) => {
    const caption = (ko ? p.caption_ko : p.caption_en) || p.caption_en || p.caption_ko;
    const alt = ko ? p.caption_en : p.caption_ko;
    const drive = !!driveId(p.drive_file_id);
    const href = drive ? p.evidence_url : p.image_path;
    const img = drive
      ? `<img loading="lazy" decoding="async" data-photo-id="${escape(p.photo_id)}" alt="${escape(caption)}">`
      : `<img loading="lazy" decoding="async" src="${escape(p.image_path)}" alt="${escape(caption)}">`;
    return `<figure><a href="${escape(href)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">${img}</a><figcaption><time datetime="${p.capture_date}">${p.capture_date} (KST)</time><p>${escape(caption)}</p>${both && alt && alt !== caption ? `<p class="alt" lang="${ko ? 'en' : 'ko'}">${escape(alt)}</p>` : ''}<a href="${escape(p.evidence_url)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">${ko ? '드라이브에서 원본 열기' : 'Open original in Drive'}</a></figcaption></figure>`;
  }).join('')}</div></section>`;
}
export function bindPhotoErrors(container, lang = 'en') {
  container.querySelectorAll('.war-photos img:not([data-photo-id])').forEach((img) => {
    const fail = () => {
      const message = document.createElement('p');
      message.className = 'photo-unavailable';
      message.textContent = lang === 'ko' ? '사진을 불러올 수 없습니다. 근거 링크를 이용하세요.' : 'Photo unavailable. Use the evidence link.';
      img.replaceWith(message);
    };
    img.addEventListener('error', fail, {once:true});
    if (img.complete && !img.naturalWidth) fail();
  });
}

// Load Drive photos for signed-in members. fetcher(photoId) must resolve to an image Blob (see app.js).
// The full-size link opens the same members-only copy; on failure the image is replaced by a readable message and the
// Drive link stays (Drive itself enforces who may open the original).
export async function loadDrivePhotos(container, fetcher, lang = 'en') {
  const images = [...container.querySelectorAll('.war-photos img[data-photo-id]')];
  let next = 0, loaded = 0, failed = 0;
  const fail = (img, error) => {
    const message = document.createElement('p');
    message.className = 'photo-unavailable';
    message.textContent = error?.status === 401
      ? (lang === 'ko' ? '사진을 보려면 다시 로그인하세요.' : 'Sign in again to load this photo.')
      : error?.status === 403
        ? (lang === 'ko' ? '이 계정으로 사진에 접근할 수 없습니다. 드라이브 링크를 확인하세요.' : 'This account cannot access the photo. Check the Drive link.')
        : (lang === 'ko' ? '사진을 불러올 수 없습니다. 드라이브 링크를 이용하세요.' : 'Photo could not be loaded. Use the Drive link.');
    img.replaceWith(message);
  };
  async function worker() {
    while (next < images.length) {
      const img = images[next++];
      let url;
      try {
        const blob = await fetcher(img.dataset.photoId);
        if (!blob || !/^image\//.test(blob.type || '') || blob.size === 0) throw new Error('not an image');
        url = URL.createObjectURL(blob);
        // Blob bytes are already fetched; lazy loading can stall decode off screen
        // and block the worker queue from reaching the remaining photos.
        img.loading = 'eager';
        img.src = url;
        if (typeof img.decode === 'function') await img.decode();
        else img.addEventListener('error', () => fail(img), { once: true });
        const a = img.closest('a'); if (a) a.href = url;
        loaded++;
      } catch (error) {
        if (url) URL.revokeObjectURL(url);
        failed++; fail(img, error);
      }
    }
  }
  // Apps Script is a relay, not an image CDN. Avoid launching every photo at once.
  await Promise.all(Array.from({length:Math.min(3,images.length)},worker));
  return {loaded,failed};
}
