import {test} from 'node:test';
import assert from 'node:assert/strict';
import {requestPhoto} from '../assets/photo-request.mjs';
const auth={getSession:async()=>({data:{session:{access_token:'test-old'}}}),refreshSession:async()=>({data:{session:{access_token:'test-new'}}})};
const image={type:'image/jpeg',size:10};
test('one expired session refreshes once before retrying',async()=>{
  const headers=[];
  const result=await requestPhoto('https://example.invalid/photo','test-key',auth,async(_,o)=>{headers.push(o.headers.Authorization);return headers.length===1?{ok:false,status:401}:{ok:true,status:200,blob:async()=>image};});
  assert.deepEqual(headers,['Bearer test-old','Bearer test-new']);assert.equal(result,image);
});
test('access denial does not refresh or bypass authorization',async()=>{
  let refreshed=false;
  await assert.rejects(()=>requestPhoto('url','key',{...auth,refreshSession:async()=>{refreshed=true;}},async()=>({ok:false,status:403})),e=>e.status===403);
  assert.equal(refreshed,false);
});
test('missing session does not send a request; invalid image responses are rejected',async()=>{
  await assert.rejects(()=>requestPhoto('url','key',{getSession:async()=>({data:{session:null}})},()=>{throw Error('should not fetch');}),e=>e.status===401);
  await assert.rejects(()=>requestPhoto('url','key',auth,async()=>({ok:true,status:200,blob:async()=>({type:'text/html',size:10})})),e=>e.status===502);
});
