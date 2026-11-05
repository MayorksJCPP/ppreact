/* One place for every setting. Values come from .env (see .env.example). */
export const API_BASE = (import.meta.env.VITE_API_BASE || "").replace(
  /\/$/,
  "",
);
export const FORM_MODE = import.meta.env.VITE_FORM_MODE || "emailjs";
export const ADMIN_PREVIEW =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_ADMIN_PREVIEW === "true";
/* Preview-mode sign in (used only while no backend is connected). Format: username:password,username2:password2
   This list is visible inside the website code, so it is a convenience lock, not real security. */
export const ADMIN_USERS = (
  import.meta.env.VITE_ADMIN_USERS ||
  "admin:" + (import.meta.env.VITE_ADMIN_PASSCODE || "pattern-admin")
)
  .split(",")
  .map((s) => {
    const i = s.indexOf(":");
    return { user: s.slice(0, i).trim(), pass: s.slice(i + 1).trim() };
  })
  .filter((u) => u.user);
/* Link to the Google Spreadsheet that stores submissions (used by the Export button). */
export const SHEET_URL = import.meta.env.VITE_SHEET_URL || "";

/* EmailJS: only the PUBLIC key belongs in website code. */
export const EMAILJS = {
  service: "service_dv57ntd",
  template: "template_yw3qg9l",
  publicKey: "8SqLisxRd6NTX-azc",
};

export const CONTACT = {
  email: "patternandproduce@gmail.com",
  phone: "+234 903 990 2994",
  phoneHref: "tel:+2349039902994",
  whatsapp: "https://wa.me/2349039902994",
  instagram: "https://www.instagram.com/patternandproduce/",
  address: "312 Murtala Mohammed Way, Alagomeji, Yaba, Lagos.",
  hours: "Monday to Friday, 9:00am to 5:00pm",
};
