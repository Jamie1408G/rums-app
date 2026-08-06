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

function isValidKey(key) {
  return typeof key === 'string' && key.length > 0 && key.length <= 200 && !/[\s/\\'"]/.test(key);
}

function collectionName(shared) {
  return shared ? 'shared' : 'local';
}

const storage = {
  async get(key, shared = false) {
    if (!isValidKey(key)) throw new Error('Invalid key');
    const ref = doc(db, collectionName(shared), key);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return { key, value: snap.data().value, shared };
  },

  async set(key, value, shared = false) {
    if (!isValidKey(key)) throw new Error('Invalid key');
    if (typeof value !== 'string') throw new Error('Value must be a string');
    const ref = doc(db, collectionName(shared), key);
    await setDoc(ref, { value });
    return { key, value, shared };
  },

  async delete(key, shared = false) {
    if (!isValidKey(key)) throw new Error('Invalid key');
    const ref = doc(db, collectionName(shared), key);
    const snap = await getDoc(ref);
    const existed = snap.exists();
    await deleteDoc(ref);
    return { key, deleted: existed, shared };
  },

  async list(prefix = '', shared = false) {
    const colRef = collection(db, collectionName(shared));
    const snap = await getDocs(query(colRef));
    const keys = [];
    snap.forEach((d) => {
      if (d.id.startsWith(prefix)) keys.push(d.id);
    });
    return { keys, prefix: prefix || undefined, shared };
  },
};

export default storage;
