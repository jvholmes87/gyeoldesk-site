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
  return renderGallery(photos, title, lang, both);
}
function renderGallery(photos, title, lang, both, sample = false) {
  const ko = lang === 'ko';
  return `<section class="war-photos${sample ? ' photo-samples' : ''}"><h2>${escape(title)} (${photos.length})</h2>${sample ? `<p class="msg">${ko ? 'AI 생성 예시입니다. 실제 과업 사진이나 작업·검수 증거가 아닙니다. 날짜와 설명도 화면 확인용 예시입니다.' : 'AI-generated examples. Not actual project photos or evidence of work or acceptance. Dates and captions are illustrative.'}</p>` : ''}<div class="photo-grid">${photos.map((p) => {
    const caption = (ko ? p.caption_ko : p.caption_en) || p.caption_en || p.caption_ko;
    const alt = ko ? p.caption_en : p.caption_ko;
    return `<figure><a href="${escape(p.image_path)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer"><img loading="lazy" decoding="async" src="${escape(p.image_path)}" alt="${escape(caption)}"></a><figcaption>${sample ? `<span class="chip muted">${ko ? 'AI 생성 예시' : 'AI-GENERATED SAMPLE'}</span><br>` : ''}<time datetime="${p.capture_date}">${sample ? (ko ? '예시 날짜: ' : 'Example date: ') : ''}${p.capture_date} (KST)</time><p>${escape(caption)}</p>${both && alt && alt !== caption ? `<p class="alt" lang="${ko ? 'en' : 'ko'}">${escape(alt)}</p>` : ''}<a href="${escape(sample ? p.image_path : p.evidence_url)}" target="_blank" rel="noopener noreferrer" referrerpolicy="no-referrer">${sample ? (ko ? '예시 이미지 열기' : 'Open sample image') : (ko ? '승인된 사진 근거 열기' : 'Open approved photo evidence')}</a></figcaption></figure>`;
  }).join('')}</div></section>`;
}
// Separate static fixtures: never stored as verified project evidence or database rows.
export function samplePhotoGallery(lang = 'en', both = true) {
  const captions = [
    ['Before-work example — drain inlet and gravel surface before finishing.','작업 전 예시 — 마감 전 배수구와 자갈 표면.'],
    ['Progress example — concrete curb and inlet beside the prepared subbase.','시공 중 예시 — 준비된 기층 옆 콘크리트 연석과 배수구.'],
    ['Restoration example — finished-looking asphalt around the inlet; no acceptance claim.','복구 예시 — 배수구 주변 아스팔트 마감 모습; 검수 완료를 의미하지 않음.'],
  ];
  return renderGallery(captions.map(([en,ko],i)=>({capture_date:`2026-11-0${i+1}`,caption_en:en,caption_ko:ko,image_path:`/assets/war-photo-samples/sample-${i+1}.webp`})),lang === 'ko' ? '갤러리 미리보기 — 가상 예시' : 'Gallery preview — fictional examples',lang,both,true);
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
