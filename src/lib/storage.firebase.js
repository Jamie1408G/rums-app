// OPTIONAL: Firebase Firestore-backed replacement for the `window.storage`
// API, for true cross-user shared data (all visitors see the same
// posts/users/likes), instead of the default localStorage version.

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// BUG FIX: "local" (shared: false) data used to be stored at doc(db, 'local', key)
// — just the raw key name, with no per-browser scoping. That made it ONE global
// document shared by every visitor (e.g. everyone's session lived at
// local/rums-session), so whoever logged in most recently silently logged in
// everyone else too. We now tag every non-shared document with a client ID that's
// generated once and persisted in this browser's real localStorage (not through
// window.storage, to avoid a chicken-and-egg problem).
const CLIENT_ID_KEY = 'rums-client-id';

function getClientId() {
  try {
    let id = window.localStorage.getItem(CLIENT_ID_KEY);
    if (!id) {
      id = (crypto.randomUUID && crypto.randomUUID()) || `c-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      window.localStorage.setItem(CLIENT_ID_KEY, id);
    }
    return id;
  } catch {
    // localStorage unavailable (e.g. private mode edge cases): fall back to an
    // in-memory id for this page load — non-shared data just won't persist
    // across reloads, which is safe (fails toward "logged out"), never toward
    // "logged in as someone else".
    return `c-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

const clientId = getClientId();

function isValidKey(key) {
  return typeof key === 'string' && key.length > 0 && key.length <= 200 && !/[\s/\\'"]/.test(key);
}

function collectionName(shared) {
  return shared ? 'shared' : 'local';
}

// For non-shared data, namespace the doc id by client so different browsers/devices
// never collide. Shared data is untouched — it's supposed to be global.
function docId(key, shared) {
  return shared ? key : `${clientId}::${key}`;
}

const storage = {
  async get(key, shared = false) {
    if (!isValidKey(key)) throw new Error('Invalid key');
    const ref = doc(db, collectionName(shared), docId(key, shared));
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { key, value: snap.data().value, shared };
  },

  async set(key, value, shared = false) {
    if (!isValidKey(key)) throw new Error('Invalid key');
    if (typeof value !== 'string') throw new Error('Value must be a string');
    const ref = doc(db, collectionName(shared), docId(key, shared));
    await setDoc(ref, { value });
    return { key, value, shared };
  },

  async delete(key, shared = false) {
    if (!isValidKey(key)) throw new Error('Invalid key');
    const ref = doc(db, collectionName(shared), docId(key, shared));
    const snap = await getDoc(ref);
    const existed = snap.exists();
    await deleteDoc(ref);
    return { key, deleted: existed, shared };
  },

  async list(prefix = '', shared = false) {
    const colRef = collection(db, collectionName(shared));
    const snap = await getDocs(query(colRef));
    const ownPrefix = shared ? '' : `${clientId}::`;
    const keys = [];
    snap.forEach((d) => {
      if (!d.id.startsWith(ownPrefix)) return; // skip other clients' local docs
      const bareKey = shared ? d.id : d.id.slice(ownPrefix.length);
      if (bareKey.startsWith(prefix)) keys.push(bareKey);
    });
    return { keys, prefix: prefix || undefined, shared };
  },
};

export default storage;
