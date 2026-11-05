# Connecting the website to the admin dashboard

The public site contains no admin secrets. It runs the admin screen in **preview mode** until a backend exists.

## Switch to the real backend
The ready-made backend is `apps-script/Code.gs` (Google Sheets, free). Follow `apps-script/SETUP.md`.
In Vercel set `VITE_API_BASE` (the Web app URL), `VITE_SHEET_URL` and `VITE_FORM_MODE=both`, then redeploy.

## The contract (for any other backend)
Every call is `POST {VITE_API_BASE}` with a text/plain body of JSON `{ "action": "...", "data": {...}, "token": "..." }`.
Reply `{ "ok": true, "data": ... }` or `{ "ok": false, "error": "message" }`.

Open to visitors: `login {username,password}` -> `{token,username,name,role}`; `library.get` -> `{phases,videos}` or null; `lead.create {kind,data}` (kind: registrations | consultations | quotes | contacts); `visit {sid,path,device,ref}`.
Needs `token`: `library.save {phases,videos}`; `leads.list {kind}` -> `[{id,createdAt,status,exported,data}]`; `leads.mark {kind,ids,status?,exported?}`; `email.send {kind,ids,subject,body}` -> `{sent,failed}`; `analytics {range: day|week|month|year}` -> `{series:[{label,visitors}],totals:{today,week,month,year},devices,pages,sources}`; `thumb.upload {data,name}` -> `{url}`.
Admin only: `staff.list`, `staff.save {username,name,role,password}`, `staff.setActive {username,active}`.

Contact-form routing: tab "I need a consultation" -> consultations, "Get quote" -> quotes, "I want to learn fashion" and the checklist box -> contacts. Training registrations -> registrations.

## Developer notes
Verify the token on every protected action, validate and rate-limit the public ones, and keep admin and EmailJS private keys out of this project.
Data shapes: phase = { id, name, description, icon, color, order }; video = { id, youtubeId, thumbnail, title, description, phaseId, duration, order, published, featured }.
