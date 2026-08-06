import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import storage from './lib/storage';
// To use Firebase instead of localStorage, swap the import above for:
// import storage from './lib/storage.firebase';

// The original component was built for an environment that injects a global
// `window.storage` API. We polyfill that here so App.jsx needs no changes.
window.storage = storage;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
