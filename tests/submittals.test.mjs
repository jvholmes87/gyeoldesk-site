// Submittals view: counts, days waiting, filters and escaping. Invented data only.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {counts, daysWaiting, summaryHtml, projectHtml, lineHtml, todayKst, LATE_DAYS} from '../assets/submittals.mjs';

const L = (o) => ({pid: 'P-01', spec: '01 33 00', section_title: 'SUBMITTAL PROCEDURES', line: '1', sd: '01', item: 'Item', para: '1.8', g: 'G',
  status: 'approved', follow_up: false, sent_on: null, response_on: null, reason_ko: '승인', reason_en: 'Approved', af3000_url: null, extra: false, sort: 0, ...o});

test('counts skip lines that are not register lines but still count their follow-up', () => {
  const c = counts([L({}), L({status: 'action', follow_up: true}), L({status: 'in_review', extra: true, follow_up: true})]);
  assert.equal(c.lines, 2); assert.equal(c.approved, 1); assert.equal(c.action, 1); assert.equal(c.in_review, 0); assert.equal(c.follow, 2);
});

test('days waiting: open, sent, no reply; KST today', () => {
  assert.equal(daysWaiting(L({status: 'in_review', sent_on: '2026-07-28'}), '2026-11-23'), 118);
  assert.equal(daysWaiting(L({status: 'in_review', sent_on: '2026-11-10', response_on: '2026-11-18'}), '2026-11-24'), null);
  assert.equal(daysWaiting(L({status: 'approved', sent_on: '2026-07-28'}), '2026-11-24'), null);
  assert.equal(daysWaiting(L({status: 'action'}), '2026-11-24'), null);
  assert.equal(todayKst(Date.parse('2026-11-23T16:00:00Z')), '2026-11-24');
  const late = lineHtml(L({status: 'in_review', sent_on: '2026-09-01'}), 'en', '2026-11-24');
  assert.match(late, /sm-days late/); assert.ok(LATE_DAYS === 30);
  assert.doesNotMatch(lineHtml(L({status: 'in_review', sent_on: '2026-11-10'}), 'en', '2026-11-24'), /sm-days late/);
});

test('summary: action-only filter hides quiet projects and lists action lines; team actions numbered across projects', () => {
  const lines = [L({}), L({pid: 'P-02', status: 'action', item: 'Backfill test'}), L({pid: 'P-03', status: 'later'})];
  const notes = [{pid: 'P-01', kind: 'action', ord: 1, text_en: 'First'}, {pid: 'P-02', kind: 'action', ord: 1, text_en: 'Second'}];
  const all = summaryHtml({lines, notes, projects: [], lang: 'en', today: '2026-11-24'});
  assert.match(all, /P-01/); assert.match(all, /P-03/); assert.match(all, /value="2"[^>]*>.*Second/);
  const act = summaryHtml({lines, notes, projects: [], lang: 'en', actionOnly: true, today: '2026-11-24'});
  assert.doesNotMatch(act, /#\/submittals\/P-03/); assert.match(act, /Backfill test/);
  assert.match(summaryHtml({lines: [], notes: [], projects: [], lang: 'ko'}), /아직 데이터가 없습니다/);
});

test('project page: open-only filter, compact rows, Korean reasons', () => {
  const lines = [L({}), L({line: '2', status: 'action', follow_up: true, reason_ko: '미제출', reason_en: 'Not sent'})];
  const html = projectHtml({pid: 'P-01', lines, notes: [], project: {project_key: 'HW-2601', title_ko: '문', title_en: 'Door'}, lang: 'ko', today: '2026-11-24'});
  assert.match(html, /sm-line compact/); assert.match(html, /sm-line open/); assert.match(html, /미제출/); assert.match(html, /▶/);
  const open = projectHtml({pid: 'P-01', lines, notes: [], project: null, lang: 'en', today: '2026-11-24', openOnly: true});
  assert.equal((open.match(/class="sm-line /g) || []).length, 1);
});

test('text is escaped and only Drive links are linked', () => {
  const h = lineHtml(L({item: '<img src=x onerror=1>', reason_en: '"><script>', af3000_url: 'javascript:alert(1)'}), 'en', '2026-11-24');
  assert.doesNotMatch(h, /<img|<script|javascript:/);
  assert.match(lineHtml(L({af3000_url: 'https://drive.google.com/file/d/abc/view'}), 'en', '2026-11-24'), /href="https:\/\/drive\.google\.com\/file\/d\/abc\/view"/);
});
