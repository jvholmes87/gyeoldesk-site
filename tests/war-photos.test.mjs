import {test} from 'node:test';
import assert from 'node:assert/strict';
import {releasedPhotos,photoGallery,photoStatus,bindPhotoErrors} from '../assets/war-photos.mjs';
const base = {photo_id:'demo_1',project_key:'DEMO',war_date:'2026-11-05',capture_date:'2026-11-02',caption_en:'Surface restoration; acceptance pending.',caption_ko:'표면 복구; 검수 대기.',verification:'verified',release_status:'approved_public',release_reviewed_on:'2026-11-03',release_reference:'DEMO-REVIEW',image_path:'/assets/war-photos/demo.jpg',evidence_url:'https://drive.google.com/file/d/DEMO_NOT_REAL/view'};
const select = (records) => releasedPhotos(records,'DEMO','2026-11-05');
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
  assert.ok(photoGallery([],'DEMO','2026-11-05').includes('Collection status is unconfirmed'));
  assert.ok(photoGallery([base],'DEMO','2026-11-05','ko').includes('작업 사진'));
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
  const set={total:22,in_window:18,date_pending:4,historical:2,verified:0,excluded:0,approved_public:0,withheld:22,approved:[]};
  const html=photoGallery([],'DEMO','2026-11-05','en',false,set);
  assert.ok(html.includes('22 photos recorded for this period'));
  assert.ok(html.includes('22 not shown'));
  assert.ok(html.includes('2 probable earlier captures (historical'));
  assert.ok(html.includes('4 with capture date unconfirmed'));
  assert.ok(!html.includes('<img'));
  assert.ok(!html.includes('Collection status is unconfirmed'));
  const ko=photoGallery([],'DEMO','2026-11-05','ko',false,set);
  assert.ok(ko.includes('이 기간 사진 22장 기록됨'));
  assert.ok(ko.includes('촬영일 미확정 4장'));
});
test('approved photos show with a count of the rest; no set keeps the honest default; errors are visible',()=>{
  const set={total:3,historical:0,date_pending:0};
  const html=photoGallery([base],'DEMO','2026-11-05','en',false,set);
  assert.ok(html.includes('Work photos (1)'));
  assert.ok(html.includes('1 release-approved shown; 2 not shown'));
  assert.equal(photoStatus({total:1},1,'en'),'');
  assert.ok(photoStatus(null,0,'en').includes('Collection status is unconfirmed'));
  assert.ok(photoGallery([],'DEMO','2026-11-05','en',false,'error').includes('could not be loaded'));
  assert.ok(photoGallery([],'DEMO','2026-11-05','en',false,'error').includes('msg err'));
});
