// Drop-in replacement for the Claude-artifact `window.storage` API, backed by
// the browser's localStorage so the app works standalone on Vercel (or any
// static host) with no backend.
//
// NOTE: localStorage is per-browser/per-device. The original API had a
// `shared` flag meaning "visible to all users" (implying a real backend).
// Here `shared` and non-shared data both live in the *same browser's*
// localStorage — so "shared" data is only shared across tabs/sessions on
// that one device, not across different users' devices.
//
// If you need TRUE cross-user shared data (e.g. all visitors see the same
// posts/users), swap this file out for src/lib/storage.firebase.js — see
// README.md for setup instructions. Nothing else in the app needs to change,
// since App.jsx only ever calls window.storage.get/set/delete/list.

const PREFIX = 'rums-storage:';

function makeKey(key, shared) {
  return `${PREFIX}${shared ? 'shared' : 'local'}:${key}`;
}

function isValidKey(key) {
  return typeof key === 'string' && key.length > 0 && key.length <= 200 && !/[\s/\\'"]/.test(key);
}

const storage = {
  async get(key, shared = false) {
    if (!isValidKey(key)) throw new Error('Invalid key');
    const raw = localStorage.getItem(makeKey(key, shared));
    if (raw === null) return null;
    return { key, value: raw, shared };
  },

  async set(key, value, shared = false) {
    if (!isValidKey(key)) throw new Error('Invalid key');
    if (typeof value !== 'string') throw new Error('Value must be a string');
    localStorage.setItem(makeKey(key, shared), value);
    return { key, value, shared };
  },

  async delete(key, shared = false) {
    if (!isValidKey(key)) throw new Error('Invalid key');
    const existed = localStorage.getItem(makeKey(key, shared)) !== null;
    localStorage.removeItem(makeKey(key, shared));
    return { key, deleted: existed, shared };
  },

  async list(prefix = '', shared = false) {
    const scope = `${PREFIX}${shared ? 'shared' : 'local'}:`;
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const fullKey = localStorage.key(i);
      if (fullKey && fullKey.startsWith(scope)) {
        const bareKey = fullKey.slice(scope.length);
        if (bareKey.startsWith(prefix)) keys.push(bareKey);
      }
    }
    return { keys, prefix: prefix || undefined, shared };
  },
};

export default storage;
