import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import localStorageBackend from './lib/storage';

// The original component was built for an environment that injects a global
// `window.storage` API. We polyfill that here so App.jsx needs no changes.
const firebaseConfigPresent = [
  import.meta.env.VITE_FIREBASE_API_KEY,
  import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  import.meta.env.VITE_FIREBASE_PROJECT_ID,
  import.meta.env.VITE_FIREBASE_APP_ID,
].every(Boolean);

async function start() {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  if (!firebaseConfigPresent && import.meta.env.PROD) {
    root.render(<main style={{ maxWidth: 540, margin: '12vh auto', padding: 24, fontFamily: 'system-ui' }}>
      <h1>RUMS is temporarily unavailable</h1>
      <p>The server connection has not been configured. Your existing accounts and posts have not been changed.</p>
    </main>);
    return;
  }
  try {
    // A local development copy may use browser storage for previews.
    // A production build only ever uses the configured shared Firestore.
    window.storage = firebaseConfigPresent
      ? (await import('./lib/storage.firebase')).default
      : localStorageBackend;
    root.render(<React.StrictMode><App /></React.StrictMode>);
  } catch (error) {
    console.error('RUMS could not start', error);
    root.render(<main style={{ maxWidth: 540, margin: '12vh auto', padding: 24, fontFamily: 'system-ui' }}>
      <h1>RUMS is temporarily unavailable</h1>
      <p>Could not connect to the community data. Please try again later.</p>
    </main>);
  }
}

start();
