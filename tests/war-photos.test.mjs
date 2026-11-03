import {test} from 'node:test';
import assert from 'node:assert/strict';
import {releasedPhotos,photoGallery,photoStatus,bindPhotoErrors,loadDrivePhotos} from '../assets/war-photos.mjs';
const base = {photo_id:'demo_1',project_key:'DEMO',war_date:'2026-11-05',capture_date:'2026-11-02',caption_en:'Surface restoration; acceptance pending.',caption_ko:'표면 복구; 검수 대기.',verification:'verified',release_status:'approved_public',release_reviewed_on:'2026-11-03',release_reference:'DEMO-REVIEW',image_path:'/assets/war-photos/demo.jpg',evidence_url:'https://drive.google.com/file/d/DEMO_NOT_REAL/view'};
const select = (records) => releasedPhotos(records,'DEMO','2026-11-05');
test('source category stays explicit in English and Korean',()=>{
  const daily={...base,evidence_category:'project daily-report evidence'};
  assert.match(photoGallery([daily],'DEMO','2026-11-05','en'),/Project daily-report evidence · CE transmission not implied/);
  assert.match(photoGallery([daily],'DEMO','2026-11-05','ko'),/CE 전송 여부를 의미하지 않음/);
  assert.match(photoGallery([{...base,evidence_category:'CE-transmitted report evidence'}],'DEMO','2026-11-05','en'),/CE-transmitted report evidence/);
});
test('exact project/week scope and inclusive capture boundaries',()=>{
  assert.equal(select([base]).length,1);
  for(const patch of [{project_key:'OTHER'},{war_date:'2026-10-29'},{capture_date:'2026-10-29'},{capture_date:'2026-11-06'},{capture_date:'2026-02-30'},{capture_date:null}]) assert.equal(select([{...base,...patch}]).length,0);
  assert.equal(select([{...base,capture_date:'2026-10-30'}, {...base,photo_id:'end',capture_date:'2026-11-05'}]).length,2);
});
test('fail closed on missing verification, release or review evidence',()=>{
  for(const patch of [{verification:'pending'},{verification:'excluded'},{release_status:'approved_internal'},{release_status:'withdrawn'},{release_status:null},{release_reference:''},{release_reviewed_on:'bad'},{caption_en:'',caption_ko:''}]) assert.equal(select([{...base,...patch}]).length,0);
});
test('deduplicates, sorts and tolerates malformed optional input',()=>{
  assert.deepEqual(select([null,base,base,{...base,photo_id:'earlier',capture_date:'2026-10-30'}]).map(p=>p.photo_id),['earlier','demo_1']);
  for(const value of [null,undefined,{},'oops']) assert.deepEqual(select(value),[]);
});
test('rejects tracking, script, traversal and private-original URL shapes',()=>{
  for(const image_path of ['https://tracker.test/x.jpg','//tracker.test/x.jpg','/assets/war-photos/../secret.jpg','/assets/war-photos/demo.svg','/assets/war-photos/demo.jpg?token=secret','javascript:alert(1)']) assert.equal(select([{...base,image_path}]).length,0);
  for(const evidence_url of ['javascript:alert(1)','http://drive.google.com/file/d/demo/view','https://drive.google.com.evil.test/file/d/demo/view','https://drive.google.com/drive/folders/demo','https://drive.google.com/file/d/demo/view?token=secret']) assert.equal(select([{...base,evidence_url}]).length,0);
});
test('renders escaped captions, bilingual text, date and safe links',()=>{
  const html=photoGallery([{...base,caption_en:'<script>"bad"</script>'}],'DEMO','2026-11-05','en',true);
  assert.ok(html.includes('&lt;script&gt;&quot;bad&quot;&lt;/script&gt;'));
  assert.ok(!html.includes('<script>'));
  assert.ok(html.includes(base.caption_ko));
  assert.ok(html.includes('2026-11-02 (KST)'));
  assert.ok(html.includes('noopener noreferrer'));
  assert.ok(photoGallery([],'DEMO','2026-11-05').includes('Whether photos were taken has not been confirmed'));
  assert.ok(photoGallery([base],'DEMO','2026-11-05','ko').includes('공사 사진'));
});
test('failed images retain caption/evidence and show a readable fallback',()=>{
  const original=globalThis.document;
  let replacement;
  globalThis.document={createElement:()=>({})};
  const img={complete:true,naturalWidth:0,addEventListener:()=>{},replaceWith:(p)=>{replacement=p;}};
  try { bindPhotoErrors({querySelectorAll:()=>[img]}); assert.match(replacement.textContent,/Photo unavailable/); }
  finally { globalThis.document=original; }
});
test('status counts explain withheld photos without exposing them',()=>{
  const set={total:22,in_window:18,date_pending:4,historical:2,verified:0,excluded:0,approved:[]};
  const html=photoGallery([],'DEMO','2026-11-05','en',false,set);
  assert.ok(html.includes('18 photos taken this week (30 Oct–5 Nov); none shown yet: not selected for the report or awaiting review.'));
  assert.ok(!html.includes('18 not shown'));
  assert.ok(html.includes('4 other files on record are not counted for this week'));
  assert.ok(html.includes('do not confirm completion or acceptance'));
  assert.ok(!html.includes('<img'));
  const ko=photoGallery([],'DEMO','2026-11-05','ko',false,set);
  assert.ok(ko.includes('이번 주(10/30~11/5) 촬영 사진 18장, 아직 표시 없음: 보고서 미선정 또는 검토 대기.'));
  assert.ok(ko.includes('그 외 4건은 이번 주 집계 제외'));
});
test('approved photos show with non-overlapping counts; no set keeps the honest default; errors are visible',()=>{
  const set={total:31,in_window:22,date_pending:9,historical:4};
  const html=photoGallery([base],'DEMO','2026-11-05','en',false,set);
  assert.ok(html.includes('Progress photos (1)'));
  assert.ok(html.includes('Showing 1 of 22 photos taken this week (30 Oct–5 Nov). 21 not shown: not selected for the report or awaiting review. 9 other files on record are not counted for this week'));
  assert.equal(photoStatus({total:1,in_window:1},1,'en','2026-11-05'),'Showing the 1 photo taken this week (30 Oct–5 Nov).\nPhotos record site conditions only; they do not confirm completion or acceptance. Originals stay in the project\'s Google Drive.');
  assert.ok(photoStatus({total:2,in_window:0},0,'en','2026-11-05').startsWith('No photos dated this week (30 Oct–5 Nov). 2 other files'));
  assert.ok(photoStatus({total:1,in_window:0},0,'en','2026-11-05').includes('1 other file on record is not counted'));
  assert.ok(photoStatus(null,0,'en').includes('Whether photos were taken has not been confirmed'));
  assert.ok(photoGallery([],'DEMO','2026-11-05','en',false,'error').includes('could not be loaded'));
  assert.ok(photoGallery([],'DEMO','2026-11-05','en',false,'error').includes('msg err'));
});
const drive = {...base, image_path: undefined, release_status:'approved_internal', drive_file_id:'1AbCdEfGhIjKlMnOpQrStUvWx', evidence_url:'https://drive.google.com/file/d/1AbCdEfGhIjKlMnOpQrStUvWx/view'};
test('Drive photos: team release is enough; image has no src until the members-only loader fills it',()=>{
  assert.equal(select([drive]).length,1);
  for(const patch of [{drive_file_id:'short'},{drive_file_id:'../x/../aaaaaaaaaaaaaaaaaaaa'},{release_status:'restricted'},{release_status:'pending_review'},{verification:'pending'}]) assert.equal(select([{...drive,...patch}]).length,0);
  const html=photoGallery([drive],'DEMO','2026-11-05','en',true);
  assert.ok(html.includes('data-photo-id="demo_1"'));
  assert.ok(!/<img[^>]*src=/.test(html));
  assert.ok(html.includes('Open original in Drive'));
  assert.ok(html.includes(drive.evidence_url));
});
test('Drive loader swaps in the blob and falls back to readable text on failure',async()=>{
  const made=[]; globalThis.document={createElement:()=>{const o={};made.push(o);return o;}};
  globalThis.URL.createObjectURL=()=>'blob:x';
  const mk=()=>{const a={href:'d'};const img={dataset:{photoId:'demo_1'},closest:()=>a,addEventListener:()=>{},replaceWith:(p)=>{img.replaced=p;}};return {img,a};};
  const ok=mk(), bad=mk();
  loadDrivePhotos({querySelectorAll:()=>[ok.img]}, async()=>({type:'image/jpeg'}), 'en');
  loadDrivePhotos({querySelectorAll:()=>[bad.img]}, async()=>{throw new Error('403');}, 'ko');
  await new Promise((r)=>setTimeout(r,10));
  assert.equal(ok.img.src,'blob:x'); assert.equal(ok.a.href,'blob:x');
  assert.match(bad.img.replaced.textContent,/드라이브 링크/);
});
test('Drive loader limits concurrent relay calls and counts decoded images',async()=>{
  let active=0,max=0;
  const imgs=Array.from({length:8},(_,i)=>({dataset:{photoId:String(i)},addEventListener(){},closest:()=>({}),decode:async()=>{}}));
  const result=await loadDrivePhotos({querySelectorAll:()=>imgs},async()=>{active++;max=Math.max(max,active);await new Promise(r=>setTimeout(r,2));active--;return {type:'image/jpeg',size:1};});
  assert.equal(max,3);assert.deepEqual(result,{loaded:8,failed:0});
});
