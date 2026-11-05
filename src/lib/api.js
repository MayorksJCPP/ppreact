import { API_BASE, EMAILJS, FORM_MODE } from '../config.js';
import { rpc } from './adminApi.js';

export const FAIL = 'Sorry, we could not send your message. Please try again, or message us on WhatsApp: +234 903 990 2994.';

function emailSend(params) {
  return fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ service_id: EMAILJS.service, template_id: EMAILJS.template, user_id: EMAILJS.publicKey, template_params: params }),
  }).then((r) => {
    if (!r.ok) return r.text().then((t) => { throw new Error(t || 'Error ' + r.status); });
    return true;
  });
}

/* Sends a copy to the dashboard backend, filed under the right list. */
const LIST_FOR = { biz: 'consultations', quote: 'quotes', learn: 'contacts' };
function apiSend(kind, data) {
  const list = kind === 'registrations' ? 'registrations' : kind === 'enquiries' ? LIST_FOR[data.type] || 'contacts' : 'contacts';
  const payload = kind === 'checklist'
    ? { first_name: 'Checklist request', email: data.email, enquiry_type: 'Tech pack checklist', interest: 'Free checklist', page: data.page, submitted_at: data.submitted_at }
    : data;
  return rpc('lead.create', { kind: list, data: payload }).then(() => true);
}

/* Every form goes through here. kind: 'registrations' | 'enquiries' | 'checklist'.
   Succeeds if at least one delivery method works (email now, dashboard later). */
export function submitForm(kind, data, emailParams) {
  const jobs = [];
  if (FORM_MODE === 'emailjs' || FORM_MODE === 'both') jobs.push(emailSend(emailParams));
  if ((FORM_MODE === 'api' || FORM_MODE === 'both') && API_BASE) jobs.push(apiSend(kind, data));
  if (!jobs.length) return Promise.reject(new Error('No delivery method set'));
  return Promise.all(jobs.map((p) => p.then(() => true, () => false))).then((r) => {
    if (!r.includes(true)) throw new Error('failed');
  });
}

export const fieldsOf = (form) => {
  const fd = new FormData(form);
  const g = (k) => (fd.get(k) || '').toString().trim();
  return { g, honey: !!g('company') };
};
