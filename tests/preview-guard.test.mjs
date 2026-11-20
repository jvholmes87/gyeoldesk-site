import {test} from 'node:test';
import assert from 'node:assert/strict';
import {isLiveWrite, lockedFetch} from '../assets/preview-guard.mjs';
const B='https://x.supabase.co';
test('reads and sign-in pass; writes, emails and unlisted RPCs are live writes',()=>{
  assert.equal(isLiveWrite(`${B}/rest/v1/weeks?select=*`,'GET'),false);
  assert.equal(isLiveWrite(`${B}/auth/v1/otp`,'POST'),false);
  assert.equal(isLiveWrite(`${B}/auth/v1/token?grant_type=refresh_token`,'POST'),false);
  for (const r of ['org_directory','set_my_lang','request_access']) assert.equal(isLiveWrite(`${B}/rest/v1/rpc/${r}`,'POST'),false);
  for (const r of ['finalize_week','set_week_review','decide_access','delete_question']) assert.equal(isLiveWrite(`${B}/rest/v1/rpc/${r}`,'POST'),true);
  assert.equal(isLiveWrite(`${B}/rest/v1/roster?id=eq.1`,'PATCH'),true);
  assert.equal(isLiveWrite(`${B}/rest/v1/roster?id=eq.1`,'DELETE'),true);
  assert.equal(isLiveWrite(`${B}/rest/v1/roster`,'POST'),true);
  assert.equal(isLiveWrite(`${B}/functions/v1/notify`,'POST'),true);
  assert.equal(isLiveWrite(`${B}/functions/v1/photo?id=1`,'GET'),false);
});
test('locked: write is refused without a network call; unlocked: it goes through',async()=>{
  let calls=0,blocked=0,locked=true;
  const f=lockedFetch(async()=>{calls++;return new Response('[]',{status:200});},()=>locked,()=>{blocked++;});
  const r=await f(`${B}/rest/v1/rpc/finalize_week`,{method:'POST'});
  assert.equal(r.status,423);assert.equal((await r.json()).code,'preview_locked');
  assert.equal(calls,0);assert.equal(blocked,1);
  assert.equal((await f(`${B}/rest/v1/weeks`,{method:'GET'})).status,200);
  locked=false;
  assert.equal((await f(`${B}/rest/v1/rpc/finalize_week`,{method:'POST'})).status,200);
  assert.equal(calls,2);
});
