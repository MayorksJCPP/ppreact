import { API_BASE } from '../config.js';
import { rpc } from './adminApi.js';
import { sampleLeads } from './sample.js';
import { downloadXlsx } from './xlsx.js';

export const KINDS = {
  registrations: { label: 'Registered users', one: 'registration', blurb: 'People who registered for training.' },
  consultations: { label: 'Consultation requests', one: 'consultation request', blurb: 'Visitors who asked for a consultation.' },
  quotes: { label: 'Quote requests', one: 'quote request', blurb: 'Visitors who asked for a quotation.' },
  contacts: { label: 'Contact messages', one: 'message', blurb: 'Visitors who are trying to contact us.' },
};
export const LABELS = {
  first_name: 'First name', last_name: 'Last name', dob: 'Date of birth', age: 'Age', sex: 'Sex', school: 'School', phone: 'Mobile number', email: 'Email address', address: 'Address', lga: 'LGA',
  motivation: 'Why a garment industry skill will help', can_devote: 'Can devote time to learn', availability: 'Availability', parents_afford: 'Parents can afford the training',
  guardian_name: 'Parent / guardian name', guardian_phone: 'Parent / guardian mobile', guardian_address: 'Parent / guardian address',
  enquiry_type: 'Enquiry type', interest: 'Interest', quantity: 'Estimated quantity', message: 'Message', page: 'Submitted from', submitted_at: 'Submitted',
};
const ORDER = Object.keys(LABELS);
const HIDE = ['page', 'submitted_at', 'type'];

export const fullName = (r) => `${r.data.first_name || ''} ${r.data.last_name || ''}`.trim() || r.data.email || 'Unknown';
export const initials = (r) => fullName(r).split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
export const when = (iso) => { const d = new Date(iso); return isNaN(d) ? '' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); };
export const fieldsOf = (r) => Object.keys(r.data).filter((k) => !HIDE.includes(k) && r.data[k] !== '' && r.data[k] != null).sort((a, b) => (ORDER.indexOf(a) + 99) % 99 - (ORDER.indexOf(b) + 99) % 99);

let mem = null; const cache = {};
const sample = () => (mem ||= sampleLeads());

export async function listLeads(kind, force = false) {
  if (!force && cache[kind]) return cache[kind];
  const rows = API_BASE ? await rpc('leads.list', { kind }, { auth: true }) : sample()[kind];
  cache[kind] = rows.slice().sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  return cache[kind];
}
export async function markLeads(kind, ids, patch) {
  if (API_BASE) await rpc('leads.mark', { kind, ids, ...patch }, { auth: true });
  else sample()[kind].forEach((r) => { if (ids.includes(r.id)) Object.assign(r, patch); });
  cache[kind] = (cache[kind] || []).map((r) => (ids.includes(r.id) ? { ...r, ...patch } : r));
}
export async function sendEmail({ kind, ids, subject, body }) {
  if (API_BASE) return rpc('email.send', { kind, ids, subject, body }, { auth: true });
  await new Promise((r) => setTimeout(r, 700));
  return { sent: ids.length, failed: 0, sample: true };
}

/* Download as a real Excel file. */
export function exportLeads(kind, rows) {
  const keys = [...new Set(rows.flatMap((r) => Object.keys(r.data)))].filter((k) => !['type'].includes(k)).sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));
  const head = ['Date', 'Status', 'Exported', ...keys.map((k) => LABELS[k] || k)];
  const body = rows.map((r) => [when(r.createdAt), r.status, r.exported ? 'Yes' : 'No', ...keys.map((k) => String(r.data[k] ?? ''))]);
  downloadXlsx([head, ...body], `${KINDS[kind].label.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.xlsx`, KINDS[kind].label);
}
