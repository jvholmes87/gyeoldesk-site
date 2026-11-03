#!/usr/bin/env python3
"""Build assets/demo/data.json: the fictional demo company for gyeoldesk.com/?org=demo.

Everything here is invented. Halyard Works Contractors, Tallis Freight, Halyard Consortium and the
stations come from Songtan Labs' game Forkline. People, numbers and e-mail addresses are fictional
(.example is a reserved domain). Dates are written for the week of 2026-11-05; the browser moves them
forward by whole weeks so the demo always shows the current week.
"""
import json, os

ORG = 'demo-org'
WEEKS = [('w1', '2026-10-22', 'final', '2026-10-22T08:10:00+00:00'),
         ('w2', '2026-10-29', 'final', '2026-10-29T08:25:00+00:00'),
         ('w3', '2026-11-05', 'live', None)]
CAPTURED = {'w1': '2026-10-22T07:40:00+00:00', 'w2': '2026-10-29T07:55:00+00:00', 'w3': '2026-11-03T00:20:00+00:00'}

def facts(cor, ntp, value, extra=None, built=False):
    # Finished work shows its build period as 'Built', so the board shows no time bar for it.
    span = {'en': 'Built', 'ko': '시공 기간', 'v': ntp} if built else {'en': 'NTP', 'ko': '착공', 'v': ntp}
    out = [{'en': 'COR', 'ko': '감독관', 'v': cor}, span, {'en': 'Value', 'ko': '계약금액', 'v': value}]
    return out + (extra or [])

def kd(date, ko, en):
    from datetime import date as D
    y, m, d = map(int, date.split('-'))
    wd = '월화수목금토일'[D(y, m, d).weekday()]
    return {'date': date, 'date_text': f'{m}/{d} ({wd})', 'ko': ko, 'en': en, 'project': None, 'project_text': None, 'source': None}

# pid, key, title_en, title_ko, station, stage, prime, facts, weeks{week: (en, ko, key dates, tallis_en, tallis_ko)}
P = [
 ('P-01', 'HW-2601', 'Dock 3 pressure-door replacement', '3번 도크 압력문 교체', 'LEO Exchange', 'construction', 'tallis',
  facts('Lt. Mara Okafor', '2026/8/3 → 2027/1/29', '₩1,284,500,000'), {
  'w3': (['Door frame anchors set at all 14 points; torque log signed by the COR’s inspector',
          '10/28 Pressure-seal gaskets arrived (lot 2 of 2); stored in the bonded bay at 18 °C',
          '11/2 Leak test 1 at 0.6 bar: two small weeps at the lower hinge, resealed the same shift',
          '11/4 Leak test 2 booked with an STA Safety witness'],
         ['압력문 프레임 앵커 14개소 설치 완료, 감독관 검측원 토크 기록 서명',
          '10/28 압력 실링 개스킷 입고 (2차분 중 2차), 보세 구역 18 °C 보관',
          '11/2 1차 기밀 시험 0.6 bar: 하부 힌지 미세 누설 2곳, 당일 재실링',
          '11/4 2차 기밀 시험, STA 안전 입회 예약'],
         [kd('2026-11-04', '2차 기밀 시험 (STA 입회)', 'Leak test 2 (STA witness)'), kd('2026-11-13', '3번 도크 화물 운영 인계', 'Dock 3 handed back for cargo')],
         ['Frame and anchors complete. Leak test 1 done; two minor weeps fixed', 'Leak test 2 on 11/4 with an STA witness; dock hand-back planned for 11/13'],
         ['프레임·앵커 완료. 1차 기밀 시험 완료, 미세 누설 2곳 보수', '11/4 STA 입회 2차 기밀 시험, 11/13 도크 인계 예정']),
  'w2': (['Door frame anchors 10 of 14 set', '10/26 Old door removed in one shift; dock sealed with the temporary bulkhead', '10/28 Pressure-seal gaskets arrived (lot 2 of 2)'],
         ['압력문 프레임 앵커 14개소 중 10개소 설치', '10/26 기존 압력문 1교대 내 철거, 임시 격벽으로 도크 밀폐', '10/28 압력 실링 개스킷 입고 (2차분 중 2차)'],
         [kd('2026-11-02', '1차 기밀 시험', 'Leak test 1')], ['Old door out; temporary bulkhead holding', 'Leak test 1 planned for 11/2'], ['기존 압력문 철거, 임시 격벽 유지 중', '11/2 1차 기밀 시험 예정']),
  'w1': (['Temporary bulkhead approved by the Dockmaster', '10/20 Lifting plan for the old door approved by STA Safety'],
         ['임시 격벽 도크 관리소 승인', '10/20 기존 압력문 양중 계획 STA 안전 승인'],
         [kd('2026-10-26', '기존 압력문 철거', 'Old door removal')], ['Lifting plan approved; removal on 10/26'], ['양중 계획 승인, 10/26 철거 예정'])}),
 ('P-02', 'HW-2602', 'Landing pad 2 regolith resurfacing', '2번 착륙장 레골리스 재포장', 'Artemis Base', 'construction', 'tallis',
  facts('Capt. Sena Ito', '2026/9/14 → 2027/3/31', '₩2,310,000,000'), {
  'w3': (['Sintered-tile course 2 of 4 laid on the north half (about 38% of the pad)',
          '10/30 Dust-plume test after course 2: within the Base Operations limit',
          '11/3 Rover 2 track-sensor fault; crew moved to the hand-laid edge strip',
          '11/6 Lander window closes pad 2 for 18 hours; no work on the pad'],
         ['소결 타일 4층 중 2층 북측 시공 (착륙장 약 38%)',
          '10/30 2층 시공 후 분진 시험: 기지 운영 기준 이내',
          '11/3 2호 로버 궤도 센서 고장, 인력은 가장자리 수작업 구간으로 전환',
          '11/6 착륙선 운항 시간대로 2번 착륙장 18시간 폐쇄, 작업 없음'],
         [kd('2026-11-06', '착륙선 운항, 18시간 작업 중지', 'Lander window: 18-hour stop'), kd('2026-11-10', '3층 자재 반입', 'Course 3 material delivery')],
         ['Course 2 of 4 on the north half; dust test passed', 'Rover 2 down for repair; edge strip continues by hand', 'Pad closed 11/6 for the lander window'],
         ['북측 4층 중 2층 완료, 분진 시험 합격', '2호 로버 수리 중, 가장자리 구간 수작업 계속', '11/6 착륙선 운항으로 작업 중지']),
  'w2': (['Course 1 complete on the north half', '10/27 Course 2 started; sinter rig at full output', '10/30 Dust-plume test booked with Base Operations'],
         ['북측 1층 시공 완료', '10/27 2층 시공 시작, 소결 장비 정상 가동', '10/30 기지 운영과 분진 시험 일정 확정'],
         [kd('2026-10-30', '분진 시험', 'Dust-plume test')], ['Course 1 done; course 2 underway'], ['1층 완료, 2층 시공 중']),
  'w1': (['Course 1 at 70% on the north half', '10/19 Rover 2 calibrated after the regolith grade check'],
         ['북측 1층 70% 시공', '10/19 레골리스 지반 확인 후 2호 로버 보정'], [], ['Course 1 at 70%'], ['1층 70% 진행'])}),
 ('P-03', 'HW-2603', 'Bonded warehouse cold-room expansion', '보세 창고 저온실 증설', 'Ceres Station', 'pre-ntp', 'tallis',
  facts('Lt. Mara Okafor', 'Not issued', '₩946,000,000'), {
  'w3': (['Submittals: 9 of 12 approved; insulated panels and refrigerant data under review',
          '10/27 RFI-02 sent: floor load at bay C next to the bonded racks',
          '11/2 Hot-work permit draft returned with two comments from STA Safety',
          'NTP follows the RFI-02 answer and the pre-construction meeting'],
         ['제출물 12건 중 9건 승인, 단열 패널·냉매 자료 검토 중',
          '10/27 RFI-02 발송: 보세 랙 옆 C구역 바닥 하중',
          '11/2 화기 작업 허가 초안 STA 안전 의견 2건과 함께 반려',
          'RFI-02 회신과 착공 전 회의 후 NTP 예정'],
         [kd('2026-11-09', 'RFI-02 회신 기한', 'RFI-02 answer due'), kd('2026-11-12', '착공 전 회의', 'Pre-construction meeting')],
         ['9 of 12 submittals approved', 'RFI-02 on the bay C floor load is with the Government', 'Hot-work permit being revised for two STA comments'],
         ['제출물 12건 중 9건 승인', 'C구역 바닥 하중 RFI-02 발주처 검토 중', '화기 작업 허가 STA 의견 2건 반영 중']),
  'w2': (['Submittals: 7 of 12 approved', '10/27 RFI-02 sent: floor load at bay C', '10/28 Hot-work permit draft sent to STA Safety'],
         ['제출물 12건 중 7건 승인', '10/27 RFI-02 발송: C구역 바닥 하중', '10/28 화기 작업 허가 초안 STA 안전 제출'],
         [kd('2026-11-09', 'RFI-02 회신 기한', 'RFI-02 answer due')], ['7 of 12 submittals approved; RFI-02 sent'], ['제출물 7건 승인, RFI-02 발송']),
  'w1': (['Submittals: 5 of 12 approved', '10/21 Site survey of bay C with the warehouse supervisor'],
         ['제출물 12건 중 5건 승인', '10/21 창고 관리자와 C구역 현장 조사'], [], ['5 of 12 submittals approved'], ['제출물 5건 승인'])}),
 ('P-04', 'HW-2604', 'Shipyard crane rail realignment', '조선소 크레인 레일 재정렬', 'LEO Exchange', 'closeout', 'hwc',
  facts('Lt. Mara Okafor', '2026/3/2 → 2026/9/30', '₩412,000,000', built=True), {
  'w3': (['Final inspection passed 9/29; punch list 3 of 3 closed',
          '10/26 Final invoice submitted for ₩412,000,000',
          '11/2 As-built drawings resubmitted with the COR’s comments',
          'Payment is due 30 days after the invoice is accepted'],
         ['9/29 최종 검사 합격, 펀치 리스트 3건 모두 완료',
          '10/26 최종 기성 ₩412,000,000 청구',
          '11/2 감독관 의견 반영 준공도면 재제출',
          '청구서 접수 후 30일 내 지급 예정'],
         [kd('2026-11-25', '최종 기성 지급 예정', 'Final payment due')], [], []),
  'w2': (['Final invoice submitted 10/26', 'As-built drawings returned with 4 comments'], ['10/26 최종 기성 청구', '준공도면 의견 4건 반려'], [], [], []),
  'w1': (['Punch list closed', '10/20 Final invoice package checked by the COR'], ['펀치 리스트 완료', '10/20 감독관 최종 기성 서류 확인'], [], [], [])}),
 ('P-05', 'HW-2605', 'Habitat ring HVAC duct replacement', '거주 링 공조 덕트 교체', 'Gateway Depot', 'bid', 'tallis',
  facts('—', 'Award pending', 'Bid ₩865,000,000'), {
  'w3': (['10/21 Site walk with the Tallis Freight estimators (Halyard tenant module)',
          '10/30 Price sent to Tallis: ₩865,000,000 and 120 days',
          '11/2 Tallis asked for a night-shift option; reply drafted'],
         ['10/21 Tallis Freight 견적팀과 현장 답사 (Halyard 임차 모듈)',
          '10/30 Tallis에 견적 제출: ₩865,000,000, 공기 120일',
          '11/2 Tallis 야간 작업 대안 요청, 회신 작성 완료'],
         [kd('2026-11-06', '야간 작업 대안 회신', 'Night-shift option reply'), kd('2026-11-16', '낙찰 통보 예정', 'Award notice expected')],
         ['Price submitted 10/30; night-shift option to follow on 11/6'], ['10/30 견적 제출, 11/6 야간 작업 대안 제출 예정']),
  'w2': (['10/21 Site walk with the Tallis Freight estimators', 'Price due 10/30'], ['10/21 Tallis Freight 견적팀과 현장 답사', '10/30 견적 마감'], [kd('2026-10-30', '견적 마감', 'Price due')], [], []),
  'w1': (['Bid documents received from Tallis Freight', '10/21 Site walk booked'], ['Tallis Freight 입찰 서류 수령', '10/21 현장 답사 예약'], [], [], [])}),
 ('P-06', 'HW-2506', 'Foundry exhaust stack repair', '파운드리 배기 스택 보수', 'Psyche Works', 'warranty', 'tallis',
  facts('Lt. Rafael Quint', '2025/4/7 → 2025/10/31', '₩638,000,000', [{'en': 'Warranty', 'ko': '하자 기간', 'v': 'to 2027/4/30'}], built=True), {
  'w3': (['10/29 Month-12 warranty inspection: no defects found',
          '11/1 Psyche Works reported a reading drift; checked remotely: the sensor, not the stack',
          '11/20 Sensor replacement visit booked on the cargo run'],
         ['10/29 12개월 하자 점검: 결함 없음',
          '11/1 Psyche Works 측정값 편차 보고, 원격 확인 결과 스택이 아닌 센서 문제',
          '11/20 화물편으로 센서 교체 방문 예약'],
         [kd('2026-11-20', '센서 교체 방문', 'Sensor replacement visit')],
         ['Month-12 inspection clean; one sensor to replace on 11/20'], ['12개월 점검 이상 없음, 11/20 센서 1개 교체']),
  'w2': (['10/29 Month-12 warranty inspection held'], ['10/29 12개월 하자 점검 실시'], [], [], []),
  'w1': (['Month-12 warranty inspection set for 10/29'], ['10/29 12개월 하자 점검 예정'], [], [], [])}),
 ('P-07', 'HW-2607', 'Radiation shelter door seals', '방사선 대피소 출입문 실링', 'Artemis Base', 'pre-ntp', 'hwc',
  facts('Capt. Sena Ito', 'Not issued', '₩287,000,000'), {
  'w3': (['Awarded 10/15; NTP after the safety plan is approved',
          '10/29 Safety plan and schedule submitted',
          '11/3 Two pre-construction questions from Base Operations answered'],
         ['10/15 낙찰, 안전 계획 승인 후 NTP 예정',
          '10/29 안전 계획·공정표 제출',
          '11/3 기지 운영 착공 전 질의 2건 회신'],
         [kd('2026-11-10', '안전 계획 검토', 'Safety plan review')], [], []),
  'w2': (['Awarded 10/15', '10/29 Safety plan and schedule submitted'], ['10/15 낙찰', '10/29 안전 계획·공정표 제출'], [], [], []),
  'w1': (['Awarded 10/15', 'Safety plan in draft'], ['10/15 낙찰', '안전 계획 작성 중'], [], [], [])}),
 ('P-08', 'HW-2608', 'Cargo lock lighting upgrade (LED)', '화물 에어록 조명 LED 교체', 'Gateway Depot', 'construction', 'hwc',
  facts('Lt. Rafael Quint', '2026/10/5 → 2026/12/18', '₩178,500,000'), {
  'w3': (['Locks A and B done: 42 of 96 fixtures',
          '10/30 Night shift added for lock C; approved by the Dockmaster',
          '11/2 Two fixtures failed burn-in; replacements on the 11/6 cargo run'],
         ['A·B 에어록 완료: 조명 96개 중 42개',
          '10/30 C 에어록 야간 작업 추가, 도크 관리소 승인',
          '11/2 조명 2개 번인 시험 불합격, 11/6 화물편으로 교체품 입고'],
         [kd('2026-11-06', '교체 조명 입고', 'Replacement fixtures arrive'), kd('2026-11-11', 'C 에어록 정전 작업', 'Lock C power outage window')], [], []),
  'w2': (['Lock A done; lock B at 60%', '10/30 Night shift request sent to the Dockmaster'], ['A 에어록 완료, B 에어록 60%', '10/30 도크 관리소에 야간 작업 요청'], [], [], []),
  'w1': (['Lock A at 80%', '10/19 Outage request for lock B approved'], ['A 에어록 80%', '10/19 B 에어록 정전 요청 승인'], [], [], [])}),
]

projects, items, snaps, weeks = [], [], [], []
for wid, d, st, fin in WEEKS:
    weeks.append({'id': wid, 'org_id': ORG, 'war_date': d, 'folder_name': d[5:].replace('-', '.'), 'rev': 0, 'status': st,
                  'review_at': None, 'final_at': fin, 'final_by': None, 'correction_reason': None, 'created_at': d + 'T00:00:00+00:00'})
for n, (pid, key, ten, tko, inst, stage, prime, fx, wk) in enumerate(P, 1):
    proj = f'p{n}'
    projects.append({'id': proj, 'org_id': ORG, 'project_key': key, 'pid': pid, 'prime': prime, 'label': None, 'title_ko': tko, 'title_en': ten,
                     'task_order': f'HC-26-T{100 + n}', 'stage': stage, 'facts': fx, 'installation': inst, 'proposal_status': None, 'warranty_status': None})
    for wid, d, st, _ in WEEKS:
        en, ko, kds, ten2, tko2 = wk[wid]
        iid = f'{wid}-i{n}'
        items.append({'id': iid, 'week_id': wid, 'project_id': proj, 'item_no': str(n), 'source_doc_id': None, 'source_title': f'WAR {d} (demo)'})
        snaps.append({'id': f'{iid}-s', 'item_id': iid, 'source_modified_at': CAPTURED[wid], 'captured_at': CAPTURED[wid], 'content_hash': None,
                      'fields': {'status': 'final' if st == 'final' else 'updated', 'title_en': ten, 'title_ko': tko},
                      'en': en, 'ko': ko, 'krima_en': ten2, 'krima_ko': tko2, 'key_dates': kds, 'payments': []})

# Records: a few per project, newest first in the panel.
R = [
 ('p1', 'submittal', 'approved', '08 34 00 #1 Pressure door assembly — approved', '2026-08-21'),
 ('p1', 'submittal', 'approved', '08 71 00 #2 Seal gaskets and hinges — approved', '2026-09-30'),
 ('p1', 'tacw', 'filed', 'Temporary bulkhead work authorization', '2026-10-20'),
 ('p1', 'corr', 'filed', 'Leak test 1 report (0.6 bar)', '2026-11-02'),
 ('p2', 'submittal', 'approved', '32 12 00 #1 Sintered regolith tile — approved', '2026-09-28'),
 ('p2', 'dig', 'filed', 'Pad 2 grade and subsurface clearance', '2026-09-16'),
 ('p2', 'corr', 'filed', 'Dust-plume test record, course 2', '2026-10-30'),
 ('p3', 'submittal', 'approved', '13 21 26 #1 Cold-room layout — approved', '2026-10-14'),
 ('p3', 'submittal', 'submitted', '13 21 26 #4 Insulated panels — under review', '2026-10-26'),
 ('p3', 'submittal', 'submitted', '23 23 00 #2 Refrigerant data — under review', '2026-10-28'),
 ('p3', 'rfi', 'filed', 'RFI-02 Floor load at bay C', '2026-10-27'),
 ('p3', 'submittal', 'not_started', '26 05 00 #3 Electrical panels — not yet sent', None),
 ('p4', 'corr', 'filed', 'Final inspection record', '2026-09-29'),
 ('p4', 'corr', 'filed', 'Final invoice ₩412,000,000', '2026-10-26'),
 ('p4', 'submittal', 'disapproved', 'As-built drawings rev 0 — returned', '2026-10-28'),
 ('p4', 'submittal', 'submitted', 'As-built drawings rev 1 — under review', '2026-11-02'),
 ('p5', 'corr', 'filed', 'Price to Tallis Freight: ₩865,000,000, 120 days', '2026-10-30'),
 ('p6', 'corr', 'filed', 'Month-12 warranty inspection: no defects', '2026-10-29'),
 ('p7', 'submittal', 'submitted', '01 35 26 Safety plan — under review', '2026-10-29'),
 ('p7', 'submittal', 'submitted', '01 32 16 Schedule — under review', '2026-10-29'),
 ('p8', 'outage', 'filed', 'Lock B power outage request — approved', '2026-10-19'),
 ('p8', 'outage', 'filed', 'Lock C night shift — approved by the Dockmaster', '2026-10-30'),
 ('p8', 'submittal', 'approved', '26 51 00 #1 LED fixtures — approved', '2026-09-25'),
]
records = [{'id': f'r{i}', 'org_id': ORG, 'project_id': p, 'category': c, 'status': s, 'title': t, 'ref': None, 'status_date': d,
            'file_id': None, 'file_url': '/assets/demo/record.html', 'mime': 'text/html', 'path': None, 'notes': None,
            'source': 'demo', 'source_key': f'r{i}', 'scan_id': None, 'updated_at': '2026-11-03T00:00:00+00:00'} for i, (p, c, s, t, d) in enumerate(R, 1)]

# Photos: illustrations, clearly labelled. Never real site photos.
def photo(i, key, date, en, ko):
    fid = f'DEMO_ILLUSTRATION_{i:04d}_not_evidence'
    return {'photo_id': f'demo-{i}', 'project_key': key, 'war_date': '2026-11-05', 'capture_date': date,
            'caption_en': f'Illustration (demo): {en}', 'caption_ko': f'데모 그림: {ko}', 'verification': 'verified',
            'release_status': 'approved_internal', 'release_reviewed_on': '2026-11-03', 'release_reference': f'DEMO-{i}@r1',
            'evidence_url': f'https://drive.google.com/file/d/{fid}/view', 'drive_file_id': fid}
photo_sets = [
 {'org_id': ORG, 'project_key': 'HW-2601', 'war_date': '2026-11-05', 'total': 5, 'in_window': 4, 'date_pending': 0, 'historical': 1, 'verified': 3,
  'excluded': 0, 'approved_public': 0, 'withheld': 2, 'updated_at': '2026-11-03T00:00:00Z', 'approved': [
   photo(1, 'HW-2601', '2026-10-30', 'new door frame anchored at Dock 3', '3번 도크 신규 압력문 프레임 앵커 설치'),
   photo(2, 'HW-2601', '2026-11-02', 'leak test 1 at the lower hinge', '하부 힌지 1차 기밀 시험'),
   photo(3, 'HW-2601', '2026-11-02', 'seal gasket lot 2 in the bonded bay', '보세 구역 실링 개스킷 2차분')]},
 {'org_id': ORG, 'project_key': 'HW-2602', 'war_date': '2026-11-05', 'total': 3, 'in_window': 3, 'date_pending': 0, 'historical': 0, 'verified': 3,
  'excluded': 0, 'approved_public': 0, 'withheld': 0, 'updated_at': '2026-11-03T00:00:00Z', 'approved': [
   photo(4, 'HW-2602', '2026-10-30', 'sintered tile course 2, north half', '북측 소결 타일 2층'),
   photo(5, 'HW-2602', '2026-10-30', 'dust-plume test after course 2', '2층 시공 후 분진 시험'),
   photo(6, 'HW-2602', '2026-11-03', 'hand-laid edge strip while Rover 2 is down', '로버 고장 중 가장자리 수작업 구간')]},
]

# Contacts (read-only copy of a tracker in a real workspace).
E = lambda u, d='halyard': f'{u}@{d}.example'
corgs = [
 ('ORG-01', 'Halyard Consortium — Contracting Office', 'Gov-Contracting', 'Contracting Directorate, LEO Exchange', E('contracting')),
 ('ORG-02', 'Halyard Consortium — Facilities Engineering', 'Gov-Engineering', 'Station Facilities Branch', E('facilities')),
 ('ORG-03', 'Tallis Freight — Station Projects', 'Prime', 'Station Projects Office', E('projects', 'tallis')),
 ('ORG-04', 'LEO Exchange Dockmaster', 'User unit', 'Dock operations', E('dockmaster', 'leo-exchange')),
 ('ORG-05', 'Artemis Base Operations', 'User unit', 'Base operations', E('ops', 'artemis-base')),
 ('ORG-06', 'STA Safety', 'Approvals', 'Solar Transit Authority, safety permits', E('safety', 'sta')),
 ('ORG-07', 'Halyard Works Contractors', 'Contractor', 'Project office', E('office', 'halyardworks')),
]
contact_orgs = [{'org_key': k, 'name_en': n, 'name_ko': None, 'type': ty, 'office': o, 'mailbox': m, 'address': '', 'main_phone': '', 'notes': 'Demo organization (fictional).'} for k, n, ty, o, m in corgs]
ppl = [
 ('C-001', 'Helen Marsh', None, 'Contracting Officer (KO)', 'ORG-01', E('h.marsh'), 'LEO ext. 3100', 'Only the KO changes the contract or appoints CORs.'),
 ('C-002', 'Tomas Lindqvist', None, 'Contract Specialist', 'ORG-01', E('t.lindqvist'), 'LEO ext. 3104', None),
 ('C-003', 'Lt. Mara Okafor', None, 'COR, LEO Exchange and Ceres', 'ORG-02', E('m.okafor'), 'LEO ext. 3220', None),
 ('C-004', 'Capt. Sena Ito', None, 'COR, Artemis Base', 'ORG-02', E('s.ito'), 'ART ext. 410', None),
 ('C-005', 'Lt. Rafael Quint', None, 'COR, Gateway Depot and Psyche Works', 'ORG-02', E('r.quint'), 'GWD ext. 72', None),
 ('C-006', 'Ines Duarte', None, 'Project Manager', 'ORG-03', E('i.duarte', 'tallis'), 'LEO ext. 5510', None),
 ('C-007', 'Kofi Mensah', None, 'Site Lead', 'ORG-03', E('k.mensah', 'tallis'), 'ART ext. 552', None),
 ('C-008', 'Rook Halvorsen', None, 'Dockmaster', 'ORG-04', E('r.halvorsen', 'leo-exchange'), 'LEO ext. 1001', 'Approves dock closures and night shifts.'),
 ('C-009', 'Wen Aldana', None, 'Base Operations Officer', 'ORG-05', E('w.aldana', 'artemis-base'), 'ART ext. 100', None),
 ('C-010', 'Lena Moreau', None, 'Safety Permits Officer', 'ORG-06', E('l.moreau', 'sta'), 'STA ch. 9', 'Witnesses pressure and hot-work tests.'),
 ('HWC-01', 'Han Ji-won', '한지원', 'Project Manager', 'ORG-07', E('jiwon.han', 'halyardworks'), 'LEO ext. 6600', None),
 ('HWC-02', 'Moon Tae-ho', '문태호', 'Site Superintendent', 'ORG-07', E('taeho.moon', 'halyardworks'), 'LEO ext. 6610', None),
 ('HWC-03', 'Jeong Ha-neul', '정하늘', 'Quality Control Manager', 'ORG-07', E('haneul.jeong', 'halyardworks'), 'LEO ext. 6620', None),
 ('HWC-04', 'Kang Da-on', '강다온', 'Safety Manager', 'ORG-07', E('daon.kang', 'halyardworks'), 'ART ext. 660', None),
 ('HWC-05', 'Lim Chae-yun', '임채윤', 'Document Control', 'ORG-07', E('chaeyun.lim', 'halyardworks'), 'LEO ext. 6630', None),
]
contacts = [{'contact_key': k, 'name_en': en, 'name_ko': ko, 'rank_title': title, 'contact_org_key': o, 'office_symbol': None, 'kind': 'Person',
             'work_email': em, 'office_phone': ph, 'comm_phone': None, 'language': 'KO/EN' if ko else 'EN', 'status': 'Active',
             'verified_on': '2026-10-30', 'source': 'Demo data', 'notes': nt} for k, en, ko, title, o, em, ph, nt in ppl]
contacts_private = [{'contact_key': 'HWC-01', 'mobile': 'Relay 7-2214', 'other_channel': 'Crew channel 4'},
                    {'contact_key': 'C-006', 'mobile': 'Relay 5-0931', 'other_channel': None}]
cor_of = {p[0]: p[7][0]['v'] for p in P}
cor_key = {'Lt. Mara Okafor': 'C-003', 'Capt. Sena Ito': 'C-004', 'Lt. Rafael Quint': 'C-005'}
user_unit = {'LEO Exchange': 'C-008', 'Artemis Base': 'C-009'}
asg, sort = [], 0
def a(pid, no, key, role, auth, dist, notes=None, esc=None):
    global sort; sort += 1
    asg.append({'pid': pid, 'project_no': no, 'contact_key': key, 'role': role, 'authority': auth, 'designation': None, 'effective_thru': None,
                'distribution': dist, 'send_from': None, 'sla_contract': '', 'sla_measured': '', 'escalation_key': esc, 'status': 'Active', 'notes': notes, 'sort': sort})
for pid, key, *_rest in P:
    inst = _rest[2]; prime = _rest[4]
    a(pid, key, 'C-001', 'Contracting Officer', 'KO — binds Government', 'cc')
    if cor_of[pid] in cor_key: a(pid, key, cor_key[cor_of[pid]], 'Contracting Officer’s Representative', 'COR — technical direction, no contract changes', 'To', esc='C-001')
    if prime == 'tallis': a(pid, key, 'C-006', 'Prime contractor PM', 'Prime contractor', 'To')
    if inst in user_unit: a(pid, key, user_unit[inst], 'User unit', 'User unit — controls the site and site entry', 'cc')
    if pid in ('P-01', 'P-03'): a(pid, key, 'C-010', 'Permits and test witness', 'Approval — hot work and pressure tests', 'cc')
    a(pid, key, 'HWC-01', 'Project Manager', 'Contractor staff', 'To')
    a(pid, key, 'HWC-02' if pid in ('P-01', 'P-04', 'P-08') else 'HWC-04', 'Site lead', 'Contractor staff', 'cc')
a('ALL', 'All projects', 'C-002', 'Contract Specialist', 'Contract specialist — paperwork and modifications', 'cc')
a('ALL', 'All projects', 'HWC-03', 'Quality Control', 'Contractor staff', 'cc')
a('ALL', 'All projects', 'HWC-05', 'Document Control', 'Contractor staff', 'on request')

roster = []
for i, (k, en, ko, title, _o, em, _p, _n) in enumerate([x for x in ppl if x[0].startswith('HWC')], 1):
    roster.append({'id': f'ro{i}', 'org_id': ORG, 'name_en': en, 'name_ko': ko, 'team': 'Project office' if i in (1, 3, 5) else 'Site',
                   'title_en': title, 'title_ko': None, 'email': em, 'employed': True, 'needs_access': True, 'access_role': 'admin' if i == 1 else 'team',
                   'invite_sent_to': em, 'invite_sent_at': '2026-10-01T00:00:00Z', 'notes': None, 'sort': i, 'source': 'demo'})
roster.append({'id': 'ro9', 'org_id': ORG, 'name_en': 'Seo Yu-na', 'name_ko': '서유나', 'team': 'Site', 'title_en': 'Field Engineer', 'title_ko': None,
               'email': None, 'employed': True, 'needs_access': False, 'access_role': None, 'invite_sent_to': None, 'invite_sent_at': None, 'notes': None, 'sort': 9, 'source': 'demo'})
profiles = [{'user_id': 'demo-visitor', 'org_id': ORG, 'email': 'visitor@demo.example', 'name': 'Demo visitor', 'role': 'admin', 'status': 'approved',
             'requested_note': None, 'lang': None, 'created_at': '2026-11-01T00:00:00Z'}]
profiles += [{'user_id': f'u{i}', 'org_id': ORG, 'email': r['email'], 'name': f"{r['name_en']} ({r['name_ko']})", 'role': r['access_role'],
              'status': 'approved', 'requested_note': None, 'lang': 'ko', 'created_at': '2026-10-02T00:00:00Z'} for i, r in enumerate(roster[:5], 1)]
profiles.append({'user_id': 'u9', 'org_id': ORG, 'email': 'yuna.seo@halyardworks.example', 'name': 'Seo Yu-na (서유나)', 'role': 'team', 'status': 'pending',
                 'requested_note': 'Field engineer, Artemis Base', 'lang': 'ko', 'created_at': '2026-11-02T00:00:00Z'})

data = {
  'orgs': [{'id': ORG, 'slug': 'demo', 'name': 'Halyard Works Contractors', 'name_ko': '핼야드 웍스 건설', 'logo_url': '/assets/demo/hwc-mark.svg',
            'logo_wide_url': None, 'logo_wide_en_url': None, 'brand_color': '#1E5A5A'}],
  'projects': projects, 'weeks': weeks, 'items': items, 'snapshots': snaps, 'records': records, 'war_photo_sets': photo_sets,
  'contact_orgs': contact_orgs, 'contacts': contacts, 'contacts_private': contacts_private, 'contact_assignments': asg,
  'roster': roster, 'profiles': profiles, 'questions': [], 'snapshots_internal': [],
}
out = os.path.join(os.path.dirname(__file__), '..', 'assets', 'demo', 'data.json')
with open(out, 'w', encoding='utf-8') as f: json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
print('wrote', os.path.relpath(out), sum(len(v) for v in data.values()), 'rows')
