import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
// The demo module loads its data through fetch; serve the bundled file and fail on anything else.
const seen = [];
globalThis.fetch = async (u) => { seen.push(String(u)); if (String(u).startsWith('/assets/demo/data.json')) return new Response(readFileSync(new URL('../assets/demo/data.json', import.meta.url))); throw new Error('network: ' + u); };
const { demoFetch, shiftDates, demoPhoto } = await import('../assets/demo.mjs');
const SB = 'https://wltuwsplrkrsfthkthxc.supabase.co';
test('reads come from the bundled data and never reach the network', async () => {
  const r = await demoFetch(`${SB}/rest/v1/projects?select=project_key,stage&order=project_key.asc`);
  const rows = await r.json();
  assert.equal(rows.length, 8); assert.equal(rows[0].project_key, 'HW-2506');
  assert.ok(seen.every((u) => u.startsWith('/assets/demo/')), 'only bundled files are fetched');
});
test('every write, RPC, function call and sign-in is refused', async () => {
  for (const [path, method] of [['/rest/v1/roster', 'POST'], ['/rest/v1/roster?id=eq.ro1', 'PATCH'], ['/rest/v1/roster?id=eq.ro1', 'DELETE'],
    ['/rest/v1/rpc/finalize_week', 'POST'], ['/rest/v1/rpc/decide_access', 'POST'], ['/functions/v1/notify', 'POST'], ['/auth/v1/otp', 'POST']]) {
    const r = await demoFetch(SB + path, { method });
    assert.equal(r.status, 400, `${method} ${path}`); assert.equal((await r.json()).code, 'DEMO');
  }
});
test('the company list only ever holds the demo company', async () => {
  const orgs = await (await demoFetch(`${SB}/rest/v1/rpc/org_directory`, { method: 'POST' })).json();
  assert.deepEqual(orgs.map((o) => o.slug), ['demo']);
});
test('dates move by whole weeks, weekday labels stay right', () => {
  const out = shiftDates({ d: '2026-11-05', ts: '2026-11-03T00:20:00+00:00', ntp: '2026/12/28 → 2027/1/4', b: '10/28 gaskets arrived', k: '11/6 (금)', photo_id: 'demo-1' }, 2);
  assert.deepEqual(out, { d: '2026-11-19', ts: '2026-11-17T00:20:00+00:00', ntp: '2027/1/11 → 2027/1/18', b: '11/11 gaskets arrived', k: '11/20 (금)', photo_id: 'demo-1' });
});
test('only bundled demo illustrations can be loaded as photos', async () => {
  await assert.rejects(() => demoPhoto('1AbCdEfGhIjKlMnOpQrStUvWxYz'), (e) => e.status === 404);
});
