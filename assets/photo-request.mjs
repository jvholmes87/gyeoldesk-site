// Never expose sessions, relay signatures or response bodies in UI/logs.
export async function requestPhoto(url, key, auth, fetcher = fetch) {
  const {data} = await auth.getSession();
  let token = data.session?.access_token;
  if (!token) throw Object.assign(new Error('Sign-in required'),{status:401});
  const get = () => fetcher(url,{headers:{Authorization:`Bearer ${token}`,apikey:key}});
  let response = await get();
  if (response.status === 401) {
    const refreshed = await auth.refreshSession();
    token = refreshed.data?.session?.access_token;
    if (token && !refreshed.error) response = await get();
  }
  if (!response.ok) throw Object.assign(new Error('Photo request failed'),{status:response.status});
  const blob = await response.blob();
  if (!/^image\/(jpeg|png|webp)$/.test(blob.type || '') || !blob.size) throw Object.assign(new Error('Invalid image response'),{status:502});
  return blob;
}
