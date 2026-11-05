# Pattern & Produce (React)

React + Vite website. Same design as the approved version, with the new Workforce Upskilling pages, tutorial library and admin.

## Run it on your computer
1. Install Node.js (version 18 or newer) from nodejs.org.
2. Open Terminal in this folder and run:
   - `npm install`   (first time only)
   - `npm run dev`   (opens the site at http://localhost:5173)
3. Admin page: http://localhost:5173/admin  (passcode is in `.env.production`, default `pattern-admin`).

## Put it on the internet (GitHub + Vercel)
1. Push this whole folder to GitHub (do not upload `node_modules` or `dist`; `.gitignore` already skips them).
2. In Vercel: Add New > Project > import the repo. Vercel detects Vite by itself (build command `npm run build`, output folder `dist`).
3. Every `git push` redeploys the site.

## Adding tutorial videos
Upload each video to YouTube as Unlisted, then:
1. Open `/admin`, sign in, choose **Tutorial videos > Add video**.
2. Paste the YouTube ID (or the full link), type the title and description, pick the phase.
3. Rename phases in **Phases** (names are yours to decide).
4. Preview mode saves in your browser only. To publish: **Publish & backup > Download videos.json**, replace `public/data/videos.json` with it, then `git push`.

## Where things live
- `src/pages/` one file per page. `src/components/` shared parts. `src/styles/` all styling.
- `src/config.js` contact details, EmailJS public settings, switches.
- `public/data/videos.json` and `content.json`: videos, phases and editable page text.
- `src/assets/img/` photos (WebP). Blur previews are in `src/lib/lqip.js`.
- Forms: `src/components/Forms.jsx` and `src/lib/api.js` (EmailJS now, dashboard later).

## Speed
Each page loads only its own code, fonts are self-hosted, photos are fingerprinted and cached for a year with blur-up previews, YouTube loads only when a video is played, and other pages are fetched quietly while the browser is idle.

## Admin features and the free Google Sheets backend
See ADMIN-UPDATE.md (what changed), apps-script/SETUP.md (install the backend) and ADMIN-INTEGRATION.md (technical contract).

## Connecting the real /admin dashboard
See ADMIN-INTEGRATION.md. Set `VITE_API_BASE` in Vercel and switch the preview admin off.
