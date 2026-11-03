// Only release-reviewed derivatives belong in this browser-visible contract.
// Filtering here is defense in depth, never an access-control boundary.
const escape = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const validDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && Number.isFinite(Date.parse(s)) && new Date(s).toISOString().slice(0,10) === s;
function asset(path) {
  // Same-origin, fixed directory, opaque filenames. No remote trackers or signed URLs.
  return typeof path === 'string' && /^\/assets\/war-photos\/[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp)$/.test(path) ? path : null;
}
function evidence(url) {
  if (typeof url !== 'string') return null;
  return /^https:\/\/drive\.google\.com\/file\/d\/[a-zA-Z0-9_-]+\/view$/.test(url) ? url : null;
}
export function releasedPhotos(records, projectKey, period) {
  if (!Array.isArray(records) || !validDate(period)) return [];
  const seen = new Set();
  const end = Date.parse(period), start = end - 6 * 86400000;
  return records.filter((p) => {
    if (!p || p.project_key !== projectKey || p.war_date !== period || p.verification !== 'verified' || p.release_status !== 'approved_public') return false;
    if (typeof p.photo_id !== 'string' || !/^[a-zA-Z0-9_-]{1,100}$/.test(p.photo_id) || seen.has(p.photo_id)) return false;
    if (!validDate(p.capture_date) || Date.parse(p.capture_date) < start || Date.parse(p.capture_date) > end) return false;
    if (!validDate(p.release_reviewed_on) || typeof p.release_reference !== 'string' || !p.release_reference.trim()) return false;
    if (!asset(p.image_path) || !evidence(p.evidence_url) || ![p.caption_en,p.caption_ko].some((s) => typeof s === 'string' && s.trim())) return false;
    seen.add(p.photo_id); return true;
  }).sort((a,b) => a.capture_date.localeCompare(b.capture_date) || a.photo_id.localeCompare(b.photo_id));
}
export function photoGallery(records, projectKey, period, lang = 'en', both = false) {
  const ko = lang === 'ko';
  const photos = releasedPhotos(records, projectKey, period);
  const title = ko ? '작업 사진' : 'Work photos';
  if (!photos.length) return `<section class="war-photos"><h2>${title}</h2><p class="empty">${ko ? '이 기간에 공개 승인된 사진이 없습니다. 사진 수집 여부는 확인되지 않았습니다.' : 'No release-approved photos available for this period. Collection status is unconfirmed.'}</p></section>`;
  return `<section class="war-photos"><h2>${title} (${photos.length})</h2><div class="photo-grid">${photos.map((p) => {
    const caption = (ko ? p.caption_ko : p.caption_en) || p.caption_en || p.caption_ko;
    const alt = ko ? p.caption_en : p.caption_ko;
    return `<figure><a href="${escape(p.image_path)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer"><img loading="lazy" decoding="async" src="${escape(p.image_path)}" alt="${escape(caption)}"></a><figcaption><time datetime="${p.capture_date}">${p.capture_date} (KST)</time><p>${escape(caption)}</p>${both && alt && alt !== caption ? `<p class="alt" lang="${ko ? 'en' : 'ko'}">${escape(alt)}</p>` : ''}<a href="${escape(p.evidence_url)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">${ko ? '승인된 사진 근거 열기' : 'Open approved photo evidence'}</a></figcaption></figure>`;
  }).join('')}</div></section>`;
}
export function bindPhotoErrors(container, lang = 'en') {
  container.querySelectorAll('.war-photos img').forEach((img) => {
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
