# Admin update: what was added (nothing was rebuilt from scratch)

Everything below is already applied in this project. This list is for when you want to copy the pieces into your own files.

## New files (just add them)
| File | What it does |
|---|---|
| `src/pages/admin/Leads.jsx` | Card grid for each list, full-details page, Message dropdown, email writing page, Export to Excel |
| `src/pages/admin/Analytics.jsx` | Visitors per day / week / month / year with a bar chart and pie charts |
| `src/pages/admin/Staff.jsx` | Add employees, reset passwords, deactivate (admins only) |
| `src/lib/adminApi.js` | One function, `rpc()`, that talks to the backend; keeps the signed-in session |
| `src/lib/leads.js`, `src/lib/sample.js`, `src/lib/xlsx.js` | Lists, sample data for the preview, and a small Excel file writer (no extra library) |
| `src/lib/track.js` | Counts visits on the public website |
| `apps-script/Code.gs`, `apps-script/SETUP.md` | The free Google Sheets backend and how to install it |

## Small edits to existing files
1. `src/config.js`: add `ADMIN_USERS` and `SHEET_URL` (see the file).
2. `src/lib/library.js`: use `rpc('library.get')` and `rpc('library.save')` when the backend is connected; add `thumbOf(video)`.
3. `src/lib/api.js`: `apiSend` now calls `rpc('lead.create', ...)` and files each form under the right list.
4. `src/components/VideoCard.jsx` and `src/pages/Home.jsx`: use `thumbOf(video)` so a custom thumbnail wins over YouTube's.
5. `src/App.jsx`: call `trackVisit(pathname)` on every page change.
6. `src/pages/admin/Admin.jsx`: the sign-in form, the thumbnail field, the new menu and routes (below).
7. `src/styles/admin.css`: new rules at the bottom (includes the search icon fix).

## Admin.jsx: sign in with a username (replace your old Login)
```jsx
/* ---------- Sign in (username + password) ---------- */
function Login({ onDone }) {
  const [a, setA] = useState(''); const [b, setB] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault(); setErr('');
    if (!API_BASE) {
      const u = ADMIN_USERS.find((x) => x.user.toLowerCase() === a.trim().toLowerCase() && x.pass === b);
      if (u) { setSession({ username: u.user, name: u.user, role: 'admin', preview: true }); onDone(); } else setErr('Wrong username or password.');
      return;
    }
    setBusy(true);
    try { setSession(await rpc('login', { username: a.trim(), password: b })); onDone(); }
    catch (x) { setErr(x.message || 'Sign in failed. Check your details and try again.'); }
    setBusy(false);
  };
  return (
    <div className="ad-login">
      <form className="ad-card" onSubmit={submit}>
        <div className="ad-logo">Pattern &amp; Produce</div>
        <h1>Admin sign in</h1>
        {!API_BASE && <p className="ad-note">Preview mode. Use a username and password from <code>VITE_ADMIN_USERS</code> (default: admin / pattern-admin).</p>}
        <label>Username<input value={a} onChange={(e) => setA(e.target.value)} required autoFocus autoComplete="username" autoCapitalize="none" /></label>
        <label>Password<input type="password" value={b} onChange={(e) => setB(e.target.value)} required autoComplete="current-password" /></label>
        {err && <p className="ad-err">{err}</p>}
        <button className="ad-btn primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
        <Link to="/" className="ad-link">&larr; Back to the website</Link>
      </form>
    </div>
  );
}

/* Shrinks a chosen picture to a 16:9 thumbnail (640 x 360) so it stays small. */
function shrink(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return reject(new Error('Please choose an image file.'));
    const url = URL.createObjectURL(file); const img = new Image();
    img.onload = () => {
      const W = 640, H = 360, c = document.createElement('canvas'); c.width = W; c.height = H;
      const r = Math.max(W / img.width, H / img.height), w = img.width * r, h = img.height * r;
      c.getContext('2d').drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
      URL.revokeObjectURL(url); resolve(c.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read that image.')); };
    img.src = url;
  });
}
```

## Admin.jsx: custom thumbnail in the video form
Add two state lines under `const [link, setLink] = ...`:
```jsx
const [up, setUp] = useState(false);
const [thumbErr, setThumbErr] = useState('');
```
Add this under `const submit = ...`:
```jsx
const shown = v.thumbnail || (id ? thumbUrl(id) : '');
const pick = async (e) => {
  const file = e.target.files?.[0]; e.target.value = ''; if (!file) return;
  setThumbErr(''); setUp(true);
  try {
    const data = await shrink(file);
    const url = API_BASE ? (await rpc('thumb.upload', { data, name: file.name }, { auth: true })).url : data;
    setV((x) => ({ ...x, thumbnail: url }));
  } catch (x) { setThumbErr(x.message || 'Could not use that image.'); }
  setUp(false);
};
```
Replace the old `<div className="ad-thumb">...</div>` with:
```jsx
<div className="ad-thumb">{shown ? <img src={shown} alt="Video thumbnail" /> : <span>Thumbnail preview appears here</span>}</div>
<div className="ad-thumbtools">
  <label className="ad-btn ad-upload"><Icon name="upload" size={18} />{up ? 'Uploading…' : 'Upload custom thumbnail'}<input type="file" accept="image/*" hidden onChange={pick} /></label>
  {v.thumbnail && <button type="button" className="ad-btn" onClick={() => setV({ ...v, thumbnail: '' })}>Use the YouTube thumbnail</button>}
</div>
<label>Or paste an image link (optional)<input value={v.thumbnail && !v.thumbnail.startsWith('data:') ? v.thumbnail : ''} onChange={set('thumbnail')} placeholder="https://…" /></label>
{thumbErr && <p className="ad-err">{thumbErr}</p>}
```
The `shrink(file)` helper (included in the sign-in block above) turns any picture into a small 16:9 thumbnail.

## admin.css: the search icon fix
The old rule lost to `.ad label { display:block }`. These win:
```css
.ad .ad-search{display:flex;align-items:center;gap:8px;flex:1;min-width:200px;padding:0 13px;background:#fff;border:1px solid #d5d5d0;border-radius:10px;margin:0}
.ad .ad-search svg{flex:none;color:#777}
.ad .ad-search input{flex:1;min-width:0;width:auto;border:0;margin:0;padding:11px 0;background:none;outline:0;box-shadow:none}
```

## About the "Preview mode" label
It shows whenever `VITE_API_BASE` is empty, because in that case changes are saved only in the browser and the lists show sample data. It disappears by itself once the backend is connected (apps-script/SETUP.md).
