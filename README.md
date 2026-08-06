# RUMS

A Vite + React port of the RUMS photo-feed app, ready to run locally and deploy to Vercel.

## Run locally

```bash
npm install
npm run dev
```

## Build & deploy

```bash
npm run build
```

Then deploy the project to Vercel (via the Vercel CLI, `vercel`, or by connecting the
git repo in the Vercel dashboard — it auto-detects Vite). `vercel.json` is included so
client-side routing doesn't 404 on refresh.

## Storage: what changed

The original component was built for an environment that injects a `window.storage`
API (async `get`/`set`/`delete`/`list`, with a `shared` flag for data visible to every
user). That API doesn't exist in a normal browser, so this project ships a **drop-in
polyfill** in `src/lib/storage.js`, wired up in `src/main.jsx` via `window.storage = storage`.
`src/App.jsx` itself is unchanged — it still just calls `window.storage.*`.

Two options are included:

### Option A — localStorage (default, zero config)
`src/lib/storage.js` backs the API with `localStorage`. This works out of the box and
deploys instantly to Vercel with no backend setup. **Limitation:** localStorage is
per-browser. The app's "shared" data (users, posts) is only shared across tabs/sessions
on the *same device* — different visitors on different devices won't see each other's
posts. This is fine for a personal demo, a single-user app, or local testing, but not
for a real multi-user community feed.

### Option B — Firebase Firestore (true cross-user shared data)
`src/lib/storage.firebase.js` implements the same API backed by Firestore, so every
visitor reads/writes the same shared data. To switch to it:

1. `npm install firebase`
2. Create a Firebase project → enable Firestore.
3. Add your Firebase web config as env vars (e.g. in a `.env` file, or as Vercel
   project environment variables — they must be prefixed `VITE_`):
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```
4. In `src/main.jsx`, change the import from `./lib/storage` to `./lib/storage.firebase`.
5. Set Firestore security rules before going to production (see security note below).

Nothing else in the app needs to change either way — both files implement the identical
`get/set/delete/list` shape the component expects.

## ⚠️ Security note (from the original design, unchanged here)

This app stores **plaintext passwords** in the users record and does auth entirely
client-side — there's no server verifying credentials. That was fine for a private,
trusted-server demo artifact, but it is **not safe for a real public deployment**:
anyone with read access to the storage (localStorage via devtools, or an open Firestore
collection) can see every password, and the "admin" check is just a client-side flag
with no server enforcement. If you deploy this beyond a personal/trusted-group demo,
plan to move auth and data writes behind a real backend (e.g. Firebase Auth + Firestore
security rules, or your own API) rather than trusting the client.

## Image storage

Uploaded screenshots are resized and stored as base64 data URLs directly inside the
post record (same as the original). This keeps things simple with no file storage
service, but base64 images are large — with the Firestore backend in particular, watch
document size limits (1 MiB per document) if people upload big screenshots.
