import { API_BASE } from '../config.js';

/* One door to the backend. Every call is a POST of { action, data, token }.
   Works with the Google Sheets backend in apps-script/Code.gs, or any backend that answers the same way: { ok:true, data } | { ok:false, error } */
const KEY = 'pp_admin_session';
export const getSession = () => { try { return JSON.parse(sessionStorage.getItem(KEY)) || null; } catch { return null; } };
export const setSession = (s) => (s ? sessionStorage.setItem(KEY, JSON.stringify(s)) : sessionStorage.removeItem(KEY));

export async function rpc(action, data = {}, { auth = false } = {}) {
  if (!API_BASE) throw new Error('The backend is not connected yet.');
  const body = { action, data };
  if (auth) body.token = getSession()?.token || '';
  /* text/plain keeps this a "simple" request, so Google Apps Script accepts it from another website */
  const r = await fetch(API_BASE, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) });
  const j = await r.json();
  if (!j.ok) throw new Error(j.error || 'Request failed');
  return j.data;
}
