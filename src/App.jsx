import { useState, useEffect, useRef } from 'react';
import './legacy.css';
import './redesign.css';
import {
  Heart, MessageCircle, LogOut, ShieldCheck, Shield, User as UserIcon,
  Plus, X, Trash2, ImagePlus, Loader2, Home, Droplet, Send, ArrowLeft, Search, Share2, Check,
  Lightbulb, Megaphone, Pencil,
  GripVertical, ChevronUp, ChevronDown, Palette, Sparkles, Eye, EyeOff, Undo2, Redo2, RotateCcw,
} from 'lucide-react';

const USERS_KEY = 'rums-users';
const POSTS_KEY = 'rums-posts';
const SESSION_KEY = 'rums-session';
const SUGGESTIONS_KEY = 'rums-suggestions';
const UPDATES_KEY = 'rums-updates';
const SITE_CONFIG_KEY = 'rums-site-config';
const RUMS5_POSTS_KEY = 'rums5-posts';
const RUMS5_SUGGESTIONS_KEY = 'rums5-suggestions';
const RUMS5_UPDATES_KEY = 'rums5-updates';
const RUMS5_SITE_CONFIG_KEY = 'rums5-site-config';
const RUMS_SPACES = {
  rums4: { id: 'rums4', label: 'RUMS 4', subtitle: 'The current archive', description: 'Everything from the current site, including Project Lumina and all older posts.' },
  rums5: { id: 'rums5', label: 'RUMS 5', subtitle: 'The new era', description: 'The same RUMS experience with a fresh feed and no Project Lumina.' },
};
function storageKeysForSpace(space) {
  if (space === 'rums5') return { posts: RUMS5_POSTS_KEY, suggestions: RUMS5_SUGGESTIONS_KEY, updates: RUMS5_UPDATES_KEY, siteConfig: RUMS5_SITE_CONFIG_KEY };
  return { posts: POSTS_KEY, suggestions: SUGGESTIONS_KEY, updates: UPDATES_KEY, siteConfig: SITE_CONFIG_KEY };
}
const DEFAULT_SITE_CONFIG = {
  brandName: 'RUMS', brandTagline: 'YOUR SERVER COMMUNITY', accent: '#3478f6', animations: true,
  heroTitle: 'Your world.', heroText: 'Builds, screenshots and moments from everyone on the server.',
  showDiscover: true, showLumina: true, showUpdates: true, showSuggestions: true,
  customTabs: [], customWidgets: [], textOverrides: {}, elementPositions: {}, feedBoxOrder: ['hero', 'posts'],
  boxOrders: {}, boxStyles: {}, boxTextOverrides: {},
};
const BUILT_IN_PAGES = [
  ['feed', 'Community feed'], ['lumina', 'Project Lumina'], ['upload', 'Add post'],
  ['suggestions', 'Suggestions'], ['updates', 'Server updates'], ['search', 'Discover'],
  ['profile', 'Profiles'], ['postDetail', 'Post detail'],
];
const TAGS = ['General', 'Lumina'];
const LUMINA_SECTIONS = [['overview', 'Overview'], ['metro', 'Districts'], ['community', 'Community']];
const LUMINA_STATIONS = [
  { name: 'Lumen', type: 'Shopping district', description: 'The station beneath Lumina’s main shopping district, putting shops and lively public spaces directly above the platforms.', accent: '#72a8ff' },
  { name: 'Luminelia', type: 'Skyline district', description: 'The station directly beneath Lumina’s skyline, surrounded by the city’s towers and most recognisable architecture.', accent: '#8d84f6' },
  { name: 'Luminarra', type: 'Gateway station', description: 'Lumina’s arrival point beside the teleporter: the gateway where visitors first enter and connect with the city.', accent: '#62bea1' },
];
const lastSeenKey = (username, space = 'rums4') => space === 'rums5' ? `rums5-lastseen-${username}` : `rums-lastseen-${username}`;
const MENTION_RE = /(@[A-Za-z0-9_]+)/g;

const UNIVERSAL_EDIT_BOX_SELECTOR = [
  '.post-card', '.lumina-banner', '.feed-empty', '.lumina-project-hero',
  '.lumina-intro-card', '.lumina-principles > article', '.lumina-wide-action', '.lumina-metro-panel',
  '.lumina-station-detail', '.lumina-community-section', '.lumina-share-card', '.upload-wrap',
  '.drop-zone', '.preview-wrap', '.suggestion-card', '.update-card', '.profile-wrap', '.profile-section',
  '.profile-danger-zone', '.search-wrap', '.user-row', '.admin-post-row', '.site-editor', '.modal-card'
].join(',');
const UNIVERSAL_EDIT_TEXT_SELECTOR = 'h1,h2,h3,h4,p,small,span,b,strong,em';


async function safeGet(key, shared) {
  try {
    return await window.storage.get(key, shared);
  } catch {
    return null;
  }
}

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function safeExternalUrl(value) {
  const raw = value?.trim();
  if (!raw) return '';
  try {
    const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const url = new URL(candidate);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : '';
  } catch {
    return '';
  }
}

function resizeImage(file, maxW = 900) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.75));
      };
      img.onerror = () => reject(new Error('bad image'));
      img.src = ev.target.result;
    };
    reader.onerror = () => reject(new Error('read failed'));
    reader.readAsDataURL(file);
  });
}

export default function RUMS() {
  const [screen, setScreen] = useState('spaceSelect');
  const [rumsSpace, setRumsSpace] = useState(null);
  const [spaceSwitchBusy, setSpaceSwitchBusy] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [tag, setTag] = useState('General');
  const [commentDrafts, setCommentDrafts] = useState({});
  const [openComments, setOpenComments] = useState({});
  const [feedFilter, setFeedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [shareStatus, setShareStatus] = useState({});
  const [mention, setMention] = useState(null); // { postId, query, start }
  const [lastSeen, setLastSeen] = useState({ General: 0, Lumina: 0 });
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null); // { type: 'self' | 'admin', username }
  const [newUsername, setNewUsername] = useState('');
  const [usernameBusy, setUsernameBusy] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [suggestionDraft, setSuggestionDraft] = useState('');
  const [suggestionBusy, setSuggestionBusy] = useState(false);
  const [updateDraft, setUpdateDraft] = useState({ title: '', body: '' });
  const [updateBusy, setUpdateBusy] = useState(false);
  const [siteConfig, setSiteConfig] = useState(DEFAULT_SITE_CONFIG);
  const [siteConfigBusy, setSiteConfigBusy] = useState(false);
  const [siteConfigStatus, setSiteConfigStatus] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [selectedBoxId, setSelectedBoxId] = useState(null);
  const [historyRevision, setHistoryRevision] = useState(0);
  const [customPageId, setCustomPageId] = useState(null);
  const [tabDraft, setTabDraft] = useState('');
  const [viewedProfile, setViewedProfile] = useState(null); // username being viewed, or null = own profile
  const [viewingPostId, setViewingPostId] = useState(null);
  const [navStack, setNavStack] = useState([]);
  const [glassStrength, setGlassStrength] = useState(() => {
    try {
      const saved = Number(window.localStorage.getItem('rums-glass-strength'));
      return Number.isFinite(saved) && saved >= 35 && saved <= 95 ? saved : 72;
    } catch { return 72; }
  });
  const [glassDragging, setGlassDragging] = useState(false);
  const [luminaView, setLuminaView] = useState('overview');
  const [activeLuminaStation, setActiveLuminaStation] = useState(1);
  const fileInputRef = useRef(null);
  const commentInputRefs = useRef({});
  const avatarInputRef = useRef(null);
  const rootRef = useRef(null);
  const siteConfigRef = useRef(DEFAULT_SITE_CONFIG);
  const spaceLoadTokenRef = useRef(0);
  const historyPastRef = useRef([]);
  const historyFutureRef = useRef([]);
  const historyApplyingRef = useRef(false);
  const tabsRef = useRef(null);
  const tabsDragRef = useRef(null);
  const [tabsDragging, setTabsDragging] = useState(false);
  const [tabOffset, setTabOffset] = useState(0);
  const luminaTabsRef = useRef(null);
  const luminaTabsDragRef = useRef(null);
  const [luminaTabsDragging, setLuminaTabsDragging] = useState(false);
  const [luminaTabOffset, setLuminaTabOffset] = useState(0);
  const locationTabsRef = useRef(null);
  const locationTabsDragRef = useRef(null);
  const [locationTabsDragging, setLocationTabsDragging] = useState(false);
  const activeStorageKeys = storageKeysForSpace(rumsSpace || 'rums4');
  const isRums5 = rumsSpace === 'rums5';
  const activeSpace = rumsSpace ? RUMS_SPACES[rumsSpace] : null;

  useEffect(() => {
    siteConfigRef.current = siteConfig;
  }, [siteConfig]);

  useEffect(() => {
    if (editMode) {
      historyPastRef.current = [];
      historyFutureRef.current = [];
      bumpHistory();
    } else {
      setSelectedBoxId(null);
    }
  }, [editMode]);

  useEffect(() => {
    if (editMode) setSelectedBoxId(null);
  }, [screen, customPageId, feedFilter, luminaView]);

  function tabForPointer(clientX) {
    const rect = tabsRef.current?.getBoundingClientRect();
    return rect && clientX >= rect.left + rect.width / 2 ? 'lumina' : 'all';
  }

  function updateTabDrag(clientX) {
    const rect = tabsRef.current?.getBoundingClientRect();
    if (!rect) return;
    const offset = Math.max(0, Math.min(rect.width / 2, clientX - rect.left - rect.width / 4));
    setTabOffset(offset);
    tabsRef.current.style.setProperty('--tab-reflection-x', `${clientX - rect.left - offset}px`);
    tabsRef.current.style.setProperty('--tab-pointer-x', `${clientX - rect.left}px`);
    tabsRef.current.style.setProperty('--glass-control-width', `${rect.width}px`);
    setFeedFilter(tabForPointer(clientX));
  }

  function handleTabsPointerDown(e) {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    tabsDragRef.current = { pointerId: e.pointerId, x: e.clientX, y: e.clientY, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.style.setProperty('--tab-drag-direction', feedFilter === 'lumina' ? '-1' : '1');
  }

  function handleTabsPointerMove(e) {
    const drag = tabsDragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    if (!drag.moved && Math.abs(dx) >= 3 && Math.abs(dx) >= Math.abs(dy)) { drag.moved = true; setTabsDragging(true); }
    if (!drag.moved) return;
    const direction = e.clientX >= (drag.lastX ?? drag.x) ? 1 : -1;
    tabsRef.current?.style.setProperty('--tab-tail-offset', `${direction * -15}px`);
    drag.lastX = e.clientX;
    updateTabDrag(e.clientX);
  }

  function handleTabsPointerEnd(e) {
    const drag = tabsDragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    if (e.type !== 'pointercancel') setFeedFilter(tabForPointer(e.clientX));
    setTabsDragging(false);
    if (tabsRef.current?.hasPointerCapture(e.pointerId)) tabsRef.current.releasePointerCapture(e.pointerId);
    // A browser may synthesize a click on the starting button after a drag.
    setTimeout(() => { if (tabsDragRef.current === drag) tabsDragRef.current = null; }, 0);
  }

  function luminaViewForPointer(clientX) {
    const rect = luminaTabsRef.current?.getBoundingClientRect();
    if (!rect) return luminaView;
    const index = Math.max(0, Math.min(2, Math.floor((clientX - rect.left) / (rect.width / 3))));
    return LUMINA_SECTIONS[index][0];
  }

  function updateLuminaTabDrag(clientX) {
    const rect = luminaTabsRef.current?.getBoundingClientRect();
    if (!rect) return;
    const segment = (rect.width - 10) / 3;
    const offset = Math.max(0, Math.min(segment * 2, clientX - rect.left - 5 - segment / 2));
    setLuminaTabOffset(offset);
    luminaTabsRef.current.style.setProperty('--lumina-reflection-x', `${clientX - rect.left - 5 - offset}px`);
    luminaTabsRef.current.style.setProperty('--lumina-pointer-x', `${clientX - rect.left}px`);
    luminaTabsRef.current.style.setProperty('--glass-control-width', `${rect.width}px`);
    setLuminaView(luminaViewForPointer(clientX));
  }

  function handleLuminaTabsPointerDown(e) {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    luminaTabsDragRef.current = { pointerId: e.pointerId, x: e.clientX, y: e.clientY, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handleLuminaTabsPointerMove(e) {
    const drag = luminaTabsDragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    if (!drag.moved && Math.abs(dx) >= 3 && Math.abs(dx) >= Math.abs(dy)) { drag.moved = true; setLuminaTabsDragging(true); }
    if (!drag.moved) return;
    const direction = e.clientX >= (drag.lastX ?? drag.x) ? 1 : -1;
    luminaTabsRef.current?.style.setProperty('--lumina-drag-tilt', `${direction * 3.5}deg`);
    luminaTabsRef.current?.style.setProperty('--lumina-tail-offset', `${direction * -15}px`);
    drag.lastX = e.clientX;
    updateLuminaTabDrag(e.clientX);
  }

  function handleLuminaTabsPointerEnd(e) {
    const drag = luminaTabsDragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    if (e.type !== 'pointercancel') setLuminaView(luminaViewForPointer(e.clientX));
    setLuminaTabsDragging(false);
    if (luminaTabsRef.current?.hasPointerCapture(e.pointerId)) luminaTabsRef.current.releasePointerCapture(e.pointerId);
    setTimeout(() => { if (luminaTabsDragRef.current === drag) luminaTabsDragRef.current = null; }, 0);
  }

  function locationTagForPointer(clientX) {
    const rect = locationTabsRef.current?.getBoundingClientRect();
    return rect && clientX >= rect.left + rect.width / 2 ? 'Lumina' : 'General';
  }

  function updateLocationTabDrag(clientX) {
    const rect = locationTabsRef.current?.getBoundingClientRect();
    if (!rect) return;
    locationTabsRef.current.style.setProperty('--location-pointer-x', `${clientX - rect.left}px`);
    locationTabsRef.current.style.setProperty('--glass-control-width', `${rect.width}px`);
    setTag(locationTagForPointer(clientX));
  }

  function handleLocationTabsPointerDown(e) {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    locationTabsDragRef.current = { pointerId: e.pointerId, x: e.clientX, y: e.clientY, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handleLocationTabsPointerMove(e) {
    const drag = locationTabsDragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    if (!drag.moved && Math.abs(dx) >= 3 && Math.abs(dx) >= Math.abs(dy)) { drag.moved = true; setLocationTabsDragging(true); }
    if (!drag.moved) return;
    updateLocationTabDrag(e.clientX);
  }

  function handleLocationTabsPointerEnd(e) {
    const drag = locationTabsDragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    if (e.type !== 'pointercancel') setTag(locationTagForPointer(e.clientX));
    setLocationTabsDragging(false);
    if (locationTabsRef.current?.hasPointerCapture(e.pointerId)) locationTabsRef.current.releasePointerCapture(e.pointerId);
    setTimeout(() => { if (locationTabsDragRef.current === drag) locationTabsDragRef.current = null; }, 0);
  }

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const interactive = 'button, .clickable-row, .profile-grid-thumb, .drop-zone';
    const move = (event) => {
      if (event.pointerType === 'touch') return;
      const target = event.target.closest(interactive);
      if (!target || !root.contains(target)) return;
      const rect = target.getBoundingClientRect();
      target.style.setProperty('--glass-x', `${event.clientX - rect.left}px`);
      target.style.setProperty('--glass-y', `${event.clientY - rect.top}px`);
    };
    const press = (event) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const target = event.target.closest(interactive);
      if (!target || !root.contains(target) || target.disabled) return;
      const rect = target.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'glass-ripple';
      ripple.style.left = `${event.clientX - rect.left}px`;
      ripple.style.top = `${event.clientY - rect.top}px`;
      target.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    };
    root.addEventListener('pointermove', move);
    root.addEventListener('pointerdown', press);
    return () => { root.removeEventListener('pointermove', move); root.removeEventListener('pointerdown', press); };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const scroller = root?.querySelector('.content');
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    let phase = Math.max(scroller?.scrollTop || 0, window.scrollY || 0);
    const updateGlossMotion = () => {
      frame = 0;
      root.style.setProperty('--orb-a-x', `${Math.sin(phase / 90) * 24}px`);
      root.style.setProperty('--orb-a-y', `${Math.cos(phase / 120) * 18}px`);
      root.style.setProperty('--orb-b-x', `${Math.cos(phase / 105) * 21}px`);
      root.style.setProperty('--orb-b-y', `${Math.sin(phase / 75) * 26}px`);
      root.style.setProperty('--orb-c-x', `${Math.sin(phase / 62) * -18}px`);
      root.style.setProperty('--orb-c-y', `${Math.cos(phase / 88) * 22}px`);
      root.style.setProperty('--orb-tilt', `${Math.sin(phase / 115) * 18}deg`);
      root.style.setProperty('--orb-tilt-reverse', `${Math.sin(phase / 115) * -18}deg`);
      root.style.setProperty('--orb-tilt-soft', `${Math.sin(phase / 115) * 11}deg`);
      root.style.setProperty('--gloss-scroll-small', `${Math.sin(phase / 92) * 5}px`);
    };
    const onScroll = () => {
      phase = Math.max(scroller?.scrollTop || 0, window.scrollY || 0);
      if (!frame) frame = window.requestAnimationFrame(updateGlossMotion);
    };
    const onWheel = (event) => {
      phase += event.deltaY;
      if (!frame) frame = window.requestAnimationFrame(updateGlossMotion);
    };
    updateGlossMotion();
    scroller?.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    root.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      scroller?.removeEventListener('scroll', onScroll);
      window.removeEventListener('scroll', onScroll);
      root.removeEventListener('wheel', onWheel);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [currentUser]);

  useEffect(() => {
    try { window.localStorage.setItem('rums-glass-strength', String(glassStrength)); } catch { /* browser preferences unavailable */ }
  }, [glassStrength]);

  // Poll the shared stores so new posts/suggestions/updates (and their
  // notification badges) show up without needing to log out/in, and so an
  // account deleted elsewhere (by an admin, or by the user themself on
  // another device) gets logged out here too.
  useEffect(() => {
    if (!currentUser) return;
    const id = setInterval(async () => {
      const [p, u, sg, up, cfg] = await Promise.all([
        safeGet(activeStorageKeys.posts, true),
        safeGet(USERS_KEY, true),
        safeGet(activeStorageKeys.suggestions, true),
        safeGet(activeStorageKeys.updates, true),
        safeGet(activeStorageKeys.siteConfig, true),
      ]);
      if (p) {
        try {
          setPosts(JSON.parse(p.value));
        } catch {
          /* ignore malformed payload */
        }
      }
      if (sg) {
        try {
          setSuggestions(JSON.parse(sg.value));
        } catch {
          /* ignore malformed payload */
        }
      }
      if (up) {
        try {
          setUpdates(JSON.parse(up.value));
        } catch {
          /* ignore malformed payload */
        }
      }
      if (cfg) {
        try {
          const freshConfig = { ...DEFAULT_SITE_CONFIG, ...JSON.parse(cfg.value) };
          setSiteConfig(isRums5 ? sanitizeConfigForRums5(freshConfig) : freshConfig);
        } catch { /* ignore malformed payload */ }
      }
      if (u) {
        try {
          const freshUsers = JSON.parse(u.value);
          setUsers(freshUsers);
          const stillExists = freshUsers.find((x) => x.username === currentUser.username);
          if (!stillExists) {
            try {
              await window.storage.delete(SESSION_KEY, false);
            } catch {
              /* ignore */
            }
            setCurrentUser(null);
            setScreen('login');
          } else if (JSON.stringify(stillExists) !== JSON.stringify(currentUser)) {
            setCurrentUser(stillExists);
          }
        } catch {
          /* ignore malformed payload */
        }
      }
    }, 15000);
    return () => clearInterval(id);
  }, [currentUser, rumsSpace]);

  // Mark the currently-viewed feed tab as "seen" once its newest post is on screen.
  useEffect(() => {
    if (screen !== 'feed' || !currentUser) return;
    const activeTag = !isRums5 && feedFilter === 'lumina' ? 'Lumina' : 'General';
    const latest = posts
      .filter((p) => (activeTag === 'Lumina' ? p.tag === 'Lumina' : p.tag !== 'Lumina'))
      .reduce((max, p) => Math.max(max, p.timestamp), 0);
    if (latest > (lastSeen[activeTag] || 0)) {
      saveLastSeen(currentUser.username, { ...lastSeen, [activeTag]: latest });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, feedFilter, posts, currentUser]);

  function sanitizeConfigForRums5(config) {
    return {
      ...DEFAULT_SITE_CONFIG,
      ...config,
      showLumina: false,
      customWidgets: (config?.customWidgets || []).filter((widget) => widget.placement !== 'lumina'),
    };
  }

  async function chooseRumsSpace(space) {
    if (!RUMS_SPACES[space]) return;
    const requestId = ++spaceLoadTokenRef.current;
    setEditMode(false);
    setSelectedBoxId(null);
    setFeedFilter('all');
    setTag('General');
    setNavStack([]);
    setRumsSpace(space);
    setScreen('loading');
    await init(space, requestId);
  }

  async function switchRumsSpace(space) {
    if (!RUMS_SPACES[space] || space === rumsSpace || spaceSwitchBusy) return;
    if (!currentUser) {
      await chooseRumsSpace(space);
      return;
    }

    const requestId = ++spaceLoadTokenRef.current;
    setSpaceSwitchBusy(space);
    try {
      const keys = storageKeysForSpace(space);
      const [p, sg, up, cfg] = await Promise.all([
        safeGet(keys.posts, true),
        safeGet(keys.suggestions, true),
        safeGet(keys.updates, true),
        safeGet(keys.siteConfig, true),
      ]);
      if (requestId !== spaceLoadTokenRef.current) return;

      const loadedPosts = p ? JSON.parse(p.value) : [];
      let loadedConfig;
      if (cfg) {
        loadedConfig = { ...DEFAULT_SITE_CONFIG, ...JSON.parse(cfg.value) };
      } else if (space === 'rums5') {
        loadedConfig = sanitizeConfigForRums5(siteConfigRef.current);
        // Never hold the version switch hostage to a Firestore write.
        void window.storage.set(keys.siteConfig, JSON.stringify(loadedConfig), true).catch((e) => console.error(e));
      } else {
        loadedConfig = DEFAULT_SITE_CONFIG;
      }
      if (space === 'rums5') loadedConfig = sanitizeConfigForRums5(loadedConfig);

      setEditMode(false);
      setSelectedBoxId(null);
      setFeedFilter('all');
      setTag('General');
      setNavStack([]);
      setCustomPageId(null);
      setRumsSpace(space);
      setPosts(loadedPosts);
      setSuggestions(sg ? JSON.parse(sg.value) : []);
      setUpdates(up ? JSON.parse(up.value) : []);
      setSiteConfig(loadedConfig);
      siteConfigRef.current = loadedConfig;
      setScreen('feed');

      // Last-seen bookkeeping must never block navigation.
      void loadLastSeen(currentUser.username, space, loadedPosts).catch((e) => console.error(e));
    } catch (e) {
      console.error(e);
    } finally {
      if (requestId === spaceLoadTokenRef.current) setSpaceSwitchBusy(null);
    }
  }

  function openRumsChooser() {
    setEditMode(false);
    setSelectedBoxId(null);
    setFeedFilter('all');
    setTag('General');
    setNavStack([]);
    setScreen('spaceSelect');
  }

  async function init(space = rumsSpace || 'rums4', requestId = spaceLoadTokenRef.current) {
    try {
      const keys = storageKeysForSpace(space);
      const [u, p, sessRec, sg, up, cfg] = await Promise.all([
        safeGet(USERS_KEY, true),
        safeGet(keys.posts, true),
        safeGet(SESSION_KEY, false),
        safeGet(keys.suggestions, true),
        safeGet(keys.updates, true),
        safeGet(keys.siteConfig, true),
      ]);
      const loadedUsers = u ? JSON.parse(u.value) : [];
      const loadedPosts = p ? JSON.parse(p.value) : [];
      let loadedConfig;
      if (cfg) {
        loadedConfig = { ...DEFAULT_SITE_CONFIG, ...JSON.parse(cfg.value) };
      } else if (space === 'rums5') {
        const rums4ConfigRecord = await safeGet(SITE_CONFIG_KEY, true);
        const rums4Config = rums4ConfigRecord ? { ...DEFAULT_SITE_CONFIG, ...JSON.parse(rums4ConfigRecord.value) } : DEFAULT_SITE_CONFIG;
        loadedConfig = sanitizeConfigForRums5(rums4Config);
        try { await window.storage.set(keys.siteConfig, JSON.stringify(loadedConfig), true); } catch { /* first-load clone can retry later */ }
      } else {
        loadedConfig = DEFAULT_SITE_CONFIG;
      }
      if (space === 'rums5') loadedConfig = sanitizeConfigForRums5(loadedConfig);
      if (requestId !== spaceLoadTokenRef.current) return;
      setUsers(loadedUsers);
      setPosts(loadedPosts);
      setSuggestions(sg ? JSON.parse(sg.value) : []);
      setUpdates(up ? JSON.parse(up.value) : []);
      setSiteConfig(loadedConfig);
      siteConfigRef.current = loadedConfig;
      if (sessRec) {
        const sess = JSON.parse(sessRec.value);
        const found = loadedUsers.find((x) => x.username === sess.username);
        if (found) {
          setCurrentUser(found);
          setScreen('feed');
          void loadLastSeen(found.username, space, loadedPosts).catch((e) => console.error(e));
          return;
        }
      }
      setCurrentUser(null);
      setScreen('login');
    } catch (e) {
      console.error(e);
      setCurrentUser(null);
      setScreen('login');
    }
  }

  async function loadLastSeen(username, space = rumsSpace || 'rums4', sourcePosts = posts) {
    const rec = await safeGet(lastSeenKey(username, space), false);
    if (rec) {
      try {
        setLastSeen(JSON.parse(rec.value));
        return;
      } catch {
        /* fall through to reseed */
      }
    }
    const now = Date.now();
    const seeded = space === 'rums5' ? { General: now, Lumina: 0 } : { General: now, Lumina: now };
    setLastSeen(seeded);
    void window.storage.set(lastSeenKey(username, space), JSON.stringify(seeded), false).catch((e) => console.error(e));
  }

  async function saveLastSeen(username, next, space = rumsSpace || 'rums4') {
    setLastSeen(next);
    try {
      await window.storage.set(lastSeenKey(username, space), JSON.stringify(next), false);
    } catch (e) {
      console.error(e);
    }
  }

  async function saveUsers(next) {
    setUsers(next);
    try {
      await window.storage.set(USERS_KEY, JSON.stringify(next), true);
    } catch (e) {
      console.error(e);
      setError('Could not save — try again.');
    }
  }

  async function savePosts(next) {
    setPosts(next);
    try {
      await window.storage.set(activeStorageKeys.posts, JSON.stringify(next), true);
    } catch (e) {
      console.error(e);
      setError('Could not save — try again.');
    }
  }

  async function saveSuggestions(next) {
    setSuggestions(next);
    try {
      await window.storage.set(activeStorageKeys.suggestions, JSON.stringify(next), true);
    } catch (e) {
      console.error(e);
      setError('Could not save — try again.');
    }
  }

  async function saveUpdates(next) {
    setUpdates(next);
    try {
      await window.storage.set(activeStorageKeys.updates, JSON.stringify(next), true);
    } catch (e) {
      console.error(e);
      setError('Could not save — try again.');
    }
  }

  function cloneSiteConfig(value) {
    if (typeof structuredClone === 'function') return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
  }

  function bumpHistory() {
    setHistoryRevision((value) => value + 1);
  }

  function recordSiteHistory(previous) {
    if (historyApplyingRef.current || !editMode || currentUser?.username?.toLowerCase() !== 'jamie') return;
    const stack = historyPastRef.current;
    const snapshot = cloneSiteConfig(previous);
    const last = stack[stack.length - 1];
    if (last && JSON.stringify(last) === JSON.stringify(snapshot)) return;
    stack.push(snapshot);
    if (stack.length > 80) stack.shift();
    historyFutureRef.current = [];
    bumpHistory();
  }

  async function saveSiteConfig(next, { recordHistory = true } = {}) {
    if (isRums5) next = sanitizeConfigForRums5(next);
    const previous = siteConfigRef.current;
    if (recordHistory && JSON.stringify(previous) !== JSON.stringify(next)) recordSiteHistory(previous);
    siteConfigRef.current = next;
    setSiteConfig(next);
    setSiteConfigBusy(true);
    setSiteConfigStatus('Saving…');
    try {
      await window.storage.set(activeStorageKeys.siteConfig, JSON.stringify(isRums5 ? sanitizeConfigForRums5(next) : next), true);
      setSiteConfigStatus('Published');
    } catch (e) {
      console.error(e);
      setSiteConfigStatus('Could not save');
    } finally {
      setSiteConfigBusy(false);
      setTimeout(() => setSiteConfigStatus(''), 1800);
    }
  }

  function applyHistorySnapshot(next) {
    historyApplyingRef.current = true;
    saveSiteConfig(cloneSiteConfig(next), { recordHistory: false }).finally(() => {
      historyApplyingRef.current = false;
    });
  }

  function undoSiteEdit() {
    const previous = historyPastRef.current.pop();
    if (!previous) return;
    historyFutureRef.current.push(cloneSiteConfig(siteConfigRef.current));
    applyHistorySnapshot(previous);
    bumpHistory();
  }

  function redoSiteEdit() {
    const next = historyFutureRef.current.pop();
    if (!next) return;
    historyPastRef.current.push(cloneSiteConfig(siteConfigRef.current));
    applyHistorySnapshot(next);
    bumpHistory();
  }

  function updateSiteConfig(patch) {
    saveSiteConfig({ ...siteConfigRef.current, ...patch });
  }

  function addCustomTab() {
    const label = tabDraft.trim();
    if (!label) return;
    const id = `tab-${Date.now()}`;
    saveSiteConfig({ ...siteConfig, customTabs: [...siteConfig.customTabs, { id, label }] });
    setTabDraft('');
  }

  function removeCustomTab(id) {
    saveSiteConfig({ ...siteConfig, customTabs: siteConfig.customTabs.filter((tab) => tab.id !== id), customWidgets: siteConfig.customWidgets.filter((widget) => widget.placement !== id) });
    if (customPageId === id) { setCustomPageId(null); setScreen('feed'); }
  }

  function renameCustomTab(id, label) {
    const nextLabel = label.trim();
    if (!nextLabel) return;
    saveSiteConfig({ ...siteConfig, customTabs: siteConfig.customTabs.map((tab) => tab.id === id ? { ...tab, label: nextLabel } : tab) });
  }

  function addWidgetToPage(placement) {
    const widget = { id: `widget-${Date.now()}`, placement, title: 'New box', body: 'Tap this text to edit it.', image: '', actionLabel: '', actionUrl: '', color: '#ffffff', animation: 'none' };
    saveSiteConfig({ ...siteConfig, customWidgets: [...siteConfig.customWidgets, widget] });
  }

  function updateCustomWidget(id, patch) {
    saveSiteConfig({ ...siteConfig, customWidgets: siteConfig.customWidgets.map((widget) => widget.id === id ? { ...widget, ...patch } : widget) });
  }

  function moveCustomWidget(id, direction) {
    const widgets = [...siteConfig.customWidgets];
    const index = widgets.findIndex((widget) => widget.id === id);
    if (index < 0) return;
    const siblingIndexes = widgets.map((widget, i) => widget.placement === widgets[index].placement ? i : -1).filter((i) => i >= 0);
    const siblingPosition = siblingIndexes.indexOf(index);
    const swapIndex = siblingIndexes[siblingPosition + direction];
    if (swapIndex == null) return;
    [widgets[index], widgets[swapIndex]] = [widgets[swapIndex], widgets[index]];
    saveSiteConfig({ ...siteConfig, customWidgets: widgets });
  }

  function dropCustomWidget(draggedId, targetId) {
    if (!draggedId || draggedId === targetId) return;
    const widgets = [...siteConfig.customWidgets];
    const from = widgets.findIndex((widget) => widget.id === draggedId);
    const to = widgets.findIndex((widget) => widget.id === targetId);
    if (from < 0 || to < 0 || widgets[from].placement !== widgets[to].placement) return;
    const [moved] = widgets.splice(from, 1);
    widgets.splice(to, 0, moved);
    saveSiteConfig({ ...siteConfig, customWidgets: widgets });
  }

  function startWidgetReorder(id, event) {
    if (!editMode || !isOwner) return;
    event.preventDefault();
    event.stopPropagation();
    const widget = siteConfigRef.current.customWidgets.find((item) => item.id === id);
    const element = document.querySelector(`[data-position-id="${CSS.escape(id)}"]`);
    const stack = element?.closest('.custom-widget-stack');
    if (!widget || !element || !stack) return;
    const startX = event.clientX;
    const startY = event.clientY;
    const handle = event.currentTarget;
    handle.setPointerCapture?.(event.pointerId);
    const siblings = [...stack.querySelectorAll(':scope > [data-position-id]')];
    const baseOrder = siblings.map((node) => node.dataset.positionId).filter(Boolean);
    let previewOrder = [...baseOrder];
    let activeTarget = null;
    const applyPreview = () => siblings.forEach((node) => {
      const index = previewOrder.indexOf(node.dataset.positionId);
      node.style.order = index >= 0 ? String(index) : '';
    });
    const setTarget = (node) => {
      if (activeTarget === node) return;
      activeTarget?.classList.remove('is-live-drop-target');
      activeTarget = node;
      activeTarget?.classList.add('is-live-drop-target');
    };
    element.classList.add('is-widget-reordering');
    document.documentElement.classList.add('is-reordering-widget');
    const move = (moveEvent) => {
      element.style.setProperty('--reorder-x', `${moveEvent.clientX - startX}px`);
      element.style.setProperty('--reorder-y', `${moveEvent.clientY - startY}px`);
      const candidates = siblings.filter((node) => node !== element);
      const target = candidates.reduce((closest, node) => {
        const rect = node.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height / 2 - moveEvent.clientY);
        return !closest || distance < closest.distance ? { node, distance, rect } : closest;
      }, null);
      if (!target) return;
      setTarget(target.node);
      const next = previewOrder.filter((item) => item !== id);
      const targetIndex = next.indexOf(target.node.dataset.positionId);
      const after = moveEvent.clientY > target.rect.top + target.rect.height / 2;
      next.splice(Math.max(0, targetIndex + (after ? 1 : 0)), 0, id);
      if (next.join('|') !== previewOrder.join('|')) { previewOrder = next; applyPreview(); }
    };
    const end = (endEvent) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      const cancelled = endEvent.type === 'pointercancel';
      element.classList.remove('is-widget-reordering');
      document.documentElement.classList.remove('is-reordering-widget');
      element.style.removeProperty('--reorder-x');
      element.style.removeProperty('--reorder-y');
      setTarget(null);
      if (handle.hasPointerCapture?.(event.pointerId)) handle.releasePointerCapture(event.pointerId);
      siblings.forEach((node) => { node.style.order = ''; });
      if (cancelled || previewOrder.join('|') === baseOrder.join('|')) return;
      const current = siteConfigRef.current;
      const reordered = [...current.customWidgets];
      const placementIndexes = reordered.map((item, index) => item.placement === widget.placement ? index : -1).filter((index) => index >= 0);
      const byId = new Map(reordered.map((item) => [item.id, item]));
      previewOrder.forEach((widgetId, index) => { if (placementIndexes[index] != null && byId.has(widgetId)) reordered[placementIndexes[index]] = byId.get(widgetId); });
      saveSiteConfig({ ...current, customWidgets: reordered });
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
  }

  function startFeedBoxReorder(id, event) {
    if (!editMode || !isOwner) return;
    event.preventDefault();
    event.stopPropagation();
    const element = document.querySelector(`[data-feed-box="${id}"]`);
    const layout = element?.closest('.feed-box-layout');
    if (!element || !layout) return;
    const startX = event.clientX;
    const startY = event.clientY;
    const handle = event.currentTarget;
    handle.setPointerCapture?.(event.pointerId);
    const siblings = [...layout.querySelectorAll(':scope > [data-feed-box]')];
    const baseOrder = siblings.map((node) => node.dataset.feedBox).filter(Boolean);
    let previewOrder = [...baseOrder];
    let activeTarget = null;
    const applyPreview = () => siblings.forEach((node) => {
      const index = previewOrder.indexOf(node.dataset.feedBox);
      node.style.order = index >= 0 ? String(index) : '';
    });
    const setTarget = (node) => {
      if (activeTarget === node) return;
      activeTarget?.classList.remove('is-live-drop-target');
      activeTarget = node;
      activeTarget?.classList.add('is-live-drop-target');
    };
    element.classList.add('is-widget-reordering');
    document.documentElement.classList.add('is-reordering-widget');
    const move = (moveEvent) => {
      element.style.setProperty('--reorder-x', `${moveEvent.clientX - startX}px`);
      element.style.setProperty('--reorder-y', `${moveEvent.clientY - startY}px`);
      const candidates = siblings.filter((node) => node !== element);
      const target = candidates.reduce((closest, node) => {
        const rect = node.getBoundingClientRect();
        const distance = Math.abs(rect.top + rect.height / 2 - moveEvent.clientY);
        return !closest || distance < closest.distance ? { node, distance, rect } : closest;
      }, null);
      if (!target) return;
      setTarget(target.node);
      const next = previewOrder.filter((item) => item !== id);
      const targetIndex = next.indexOf(target.node.dataset.feedBox);
      const after = moveEvent.clientY > target.rect.top + target.rect.height / 2;
      next.splice(Math.max(0, targetIndex + (after ? 1 : 0)), 0, id);
      if (next.join('|') !== previewOrder.join('|')) { previewOrder = next; applyPreview(); }
    };
    const end = (endEvent) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      const cancelled = endEvent.type === 'pointercancel';
      element.classList.remove('is-widget-reordering');
      element.style.removeProperty('--reorder-x');
      element.style.removeProperty('--reorder-y');
      document.documentElement.classList.remove('is-reordering-widget');
      setTarget(null);
      if (handle.hasPointerCapture?.(event.pointerId)) handle.releasePointerCapture(event.pointerId);
      siblings.forEach((node) => { node.style.order = ''; });
      if (cancelled || previewOrder.join('|') === baseOrder.join('|')) return;
      const current = siteConfigRef.current;
      saveSiteConfig({ ...current, feedBoxOrder: previewOrder });
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
  }

  function updateSiteText(key, value) {
    saveSiteConfig({ ...siteConfig, textOverrides: { ...(siteConfig.textOverrides || {}), [key]: value.trim() } });
  }

  function startPositionDrag(kind, id, event) {
    if (!editMode || !isOwner) return;
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startY = event.clientY;
    const widget = kind === 'widget' ? siteConfig.customWidgets.find((item) => item.id === id) : null;
    const saved = widget ? { x: widget.x || 0, y: widget.y || 0 } : (siteConfig.elementPositions?.[id] || { x: 0, y: 0 });
    const element = document.querySelector(`[data-position-id="${CSS.escape(id)}"]`);
    const elementRect = element?.getBoundingClientRect();
    const parentRect = element?.parentElement?.getBoundingClientRect();
    const snap = (value) => {
      const snapped = Math.round(value / 8) * 8;
      return Math.abs(snapped) <= 12 ? 0 : snapped;
    };
    const positionFor = (pointerEvent) => {
      let x = snap(saved.x + pointerEvent.clientX - startX);
      const y = snap(saved.y + pointerEvent.clientY - startY);
      if (elementRect && parentRect) {
        const minX = saved.x + parentRect.left + 8 - elementRect.left;
        const maxX = saved.x + parentRect.right - 8 - elementRect.right;
        x = snap(Math.max(minX, Math.min(maxX, x)));
      }
      return { x, y };
    };
    element?.classList.add('is-position-dragging');
    const move = (moveEvent) => {
      const { x, y } = positionFor(moveEvent);
      if (element) { element.style.setProperty('--position-x', `${x}px`); element.style.setProperty('--position-y', `${y}px`); }
    };
    const end = (endEvent) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      element?.classList.remove('is-position-dragging');
      const { x, y } = positionFor(endEvent);
      if (kind === 'widget') updateCustomWidget(id, { x, y });
      else saveSiteConfig({ ...siteConfig, elementPositions: { ...(siteConfig.elementPositions || {}), [id]: { x, y } } });
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
  }

  function removeCustomWidget(id) {
    saveSiteConfig({ ...siteConfigRef.current, customWidgets: siteConfigRef.current.customWidgets.filter((widget) => widget.id !== id) });
  }

  function updateUniversalBoxStyle(id, patch) {
    if (!id) return;
    const current = siteConfigRef.current;
    saveSiteConfig({
      ...current,
      boxStyles: {
        ...(current.boxStyles || {}),
        [id]: { ...(current.boxStyles?.[id] || {}), ...patch },
      },
    });
  }

  function resetUniversalBoxStyle(id) {
    if (!id) return;
    const current = siteConfigRef.current;
    const nextStyles = { ...(current.boxStyles || {}) };
    delete nextStyles[id];
    saveSiteConfig({ ...current, boxStyles: nextStyles });
  }

  function updateUniversalBoxText(boxId, textKey, value) {
    if (!boxId || !textKey) return;
    const current = siteConfigRef.current;
    saveSiteConfig({
      ...current,
      boxTextOverrides: {
        ...(current.boxTextOverrides || {}),
        [boxId]: { ...(current.boxTextOverrides?.[boxId] || {}), [textKey]: value.trim() },
      },
    });
  }

  function reorderUniversalBoxes(parentKey, draggedId, targetId) {
    if (!parentKey || !draggedId || !targetId || draggedId === targetId) return;
    const root = rootRef.current;
    const parent = root?.querySelector(`[data-editor-parent-key="${CSS.escape(parentKey)}"]`);
    if (!parent) return;
    const liveIds = [...parent.children]
      .filter((child) => child.classList?.contains('universal-edit-box'))
      .map((child) => child.dataset.editorBoxId)
      .filter(Boolean);
    const saved = siteConfigRef.current.boxOrders?.[parentKey] || [];
    const order = [...saved.filter((id) => liveIds.includes(id)), ...liveIds.filter((id) => !saved.includes(id))];
    const from = order.indexOf(draggedId);
    const to = order.indexOf(targetId);
    if (from < 0 || to < 0) return;
    const [moved] = order.splice(from, 1);
    order.splice(to, 0, moved);
    const current = siteConfigRef.current;
    saveSiteConfig({ ...current, boxOrders: { ...(current.boxOrders || {}), [parentKey]: order } });
  }

  function moveUniversalBoxByDirection(boxId, direction) {
    if (!boxId) return;
    const box = rootRef.current?.querySelector(`[data-editor-box-id="${CSS.escape(boxId)}"]`);
    const parent = box?.parentElement;
    const parentKey = box?.dataset.editorParentKey;
    if (!box || !parent || !parentKey) return;
    if (box.dataset.feedBox) {
      const current = siteConfigRef.current;
      const order = [...(current.feedBoxOrder || ['hero', 'posts'])];
      const index = order.indexOf(box.dataset.feedBox);
      const swapIndex = index + direction;
      if (index < 0 || swapIndex < 0 || swapIndex >= order.length) return;
      [order[index], order[swapIndex]] = [order[swapIndex], order[index]];
      saveSiteConfig({ ...current, feedBoxOrder: order });
      return;
    }
    const liveIds = [...parent.children]
      .filter((child) => child.classList?.contains('universal-edit-box'))
      .map((child) => child.dataset.editorBoxId)
      .filter(Boolean);
    const saved = siteConfigRef.current.boxOrders?.[parentKey] || [];
    const order = [...saved.filter((id) => liveIds.includes(id)), ...liveIds.filter((id) => !saved.includes(id))];
    const index = order.indexOf(boxId);
    const target = order[index + direction];
    if (index < 0 || !target) return;
    reorderUniversalBoxes(parentKey, boxId, target);
  }

  function startUniversalBoxReorder(element, event) {
    if (!editMode || currentUser?.username?.toLowerCase() !== 'jamie') return;
    const parentKey = element?.dataset.editorParentKey;
    const boxId = element?.dataset.editorBoxId;
    const parent = element?.parentElement;
    if (!parentKey || !boxId || !parent) return;
    event.preventDefault();
    event.stopPropagation();
    setSelectedBoxId(boxId);
    const startX = event.clientX;
    const startY = event.clientY;
    const siblings = [...parent.children].filter((child) => child.classList?.contains('universal-edit-box'));
    const liveIds = siblings.map((child) => child.dataset.editorBoxId).filter(Boolean);
    const saved = siteConfigRef.current.boxOrders?.[parentKey] || [];
    const baseOrder = [...saved.filter((id) => liveIds.includes(id)), ...liveIds.filter((id) => !saved.includes(id))];
    let previewOrder = [...baseOrder];
    let activeTarget = null;
    const parentStyle = getComputedStyle(parent);
    const horizontal = parentStyle.display.includes('flex') && parentStyle.flexDirection.startsWith('row');
    const applyPreview = () => siblings.forEach((node) => {
      const index = previewOrder.indexOf(node.dataset.editorBoxId);
      node.style.order = index >= 0 ? String(100 + index) : '';
    });
    const setTarget = (node) => {
      if (activeTarget === node) return;
      activeTarget?.classList.remove('is-live-drop-target');
      activeTarget = node;
      activeTarget?.classList.add('is-live-drop-target');
    };
    element.classList.add('is-universal-box-dragging');
    document.documentElement.classList.add('is-reordering-widget');
    const move = (moveEvent) => {
      element.style.setProperty('--universal-drag-x', `${moveEvent.clientX - startX}px`);
      element.style.setProperty('--universal-drag-y', `${moveEvent.clientY - startY}px`);
      const candidates = siblings.filter((node) => node !== element);
      const target = candidates.reduce((closest, node) => {
        const rect = node.getBoundingClientRect();
        const distance = parentStyle.display.includes('grid')
          ? Math.hypot(rect.left + rect.width / 2 - moveEvent.clientX, rect.top + rect.height / 2 - moveEvent.clientY)
          : Math.abs((horizontal ? rect.left + rect.width / 2 - moveEvent.clientX : rect.top + rect.height / 2 - moveEvent.clientY));
        return !closest || distance < closest.distance ? { node, distance, rect } : closest;
      }, null);
      if (!target) return;
      setTarget(target.node);
      const next = previewOrder.filter((id) => id !== boxId);
      const targetId = target.node.dataset.editorBoxId;
      const targetIndex = next.indexOf(targetId);
      let after;
      if (parentStyle.display.includes('grid')) {
        const dy = moveEvent.clientY - (target.rect.top + target.rect.height / 2);
        const dx = moveEvent.clientX - (target.rect.left + target.rect.width / 2);
        after = Math.abs(dy) >= Math.abs(dx) ? dy > 0 : dx > 0;
      } else {
        after = horizontal
          ? moveEvent.clientX > target.rect.left + target.rect.width / 2
          : moveEvent.clientY > target.rect.top + target.rect.height / 2;
      }
      next.splice(Math.max(0, targetIndex + (after ? 1 : 0)), 0, boxId);
      if (next.join('|') !== previewOrder.join('|')) { previewOrder = next; applyPreview(); }
    };
    const end = (endEvent) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
      const cancelled = endEvent.type === 'pointercancel';
      element.classList.remove('is-universal-box-dragging');
      document.documentElement.classList.remove('is-reordering-widget');
      element.style.removeProperty('--universal-drag-x');
      element.style.removeProperty('--universal-drag-y');
      setTarget(null);
      if (cancelled) {
        previewOrder = baseOrder;
        applyPreview();
        return;
      }
      if (previewOrder.join('|') === baseOrder.join('|')) return;
      const current = siteConfigRef.current;
      saveSiteConfig({ ...current, boxOrders: { ...(current.boxOrders || {}), [parentKey]: previewOrder } });
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
  }

  async function handleInlineWidgetImage(id, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try { updateCustomWidget(id, { image: await resizeImage(file, 1200) }); }
    catch { setSiteConfigStatus('Could not read image'); }
    e.target.value = '';
  }

  async function handleAuth(e) {
    e.preventDefault();
    setError('');
    const uname = authForm.username.trim();
    const pass = authForm.password;
    if (!uname || !pass) {
      setError('Enter a username and password.');
      return;
    }
    setBusy(true);
    try {
      if (authMode === 'signup') {
        if (users.some((u) => u.username.toLowerCase() === uname.toLowerCase())) {
          setError('That username is taken.');
          setBusy(false);
          return;
        }
        const newUser = { username: uname, password: pass, isAdmin: users.length === 0 };
        const next = [...users, newUser];
        // Account creation must wait for a successful write. Do not show a
        // signed-in account that only exists in this tab's React state.
        await window.storage.set(USERS_KEY, JSON.stringify(next), true);
        setUsers(next);
        setCurrentUser(newUser);
        await loadLastSeen(newUser.username, rumsSpace || 'rums4');
        await window.storage.set(SESSION_KEY, JSON.stringify({ username: uname }), false);
        setScreen('feed');
      } else {
        const found = users.find(
          (u) => u.username.toLowerCase() === uname.toLowerCase() && u.password === pass
        );
        if (!found) {
          setError('Wrong username or password.');
          setBusy(false);
          return;
        }
        setCurrentUser(found);
        await loadLastSeen(found.username, rumsSpace || 'rums4');
        await window.storage.set(SESSION_KEY, JSON.stringify({ username: found.username }), false);
        setScreen('feed');
      }
      setAuthForm({ username: '', password: '' });
    } catch (e) {
      console.error(e);
      setError(e?.message || 'Something went wrong. Try again.');
    }
    setBusy(false);
  }

  async function handleLogout() {
    setCurrentUser(null);
    try {
      await window.storage.delete(SESSION_KEY, false);
    } catch {
      /* ignore */
    }
    setScreen('login');
  }

  // --- Navigation helpers: a lightweight back-stack so search results,
  // profile links, and post links can push into a detail screen and pop
  // back to wherever the user came from. ---
  function goTo(nextScreen) {
    setNavStack((s) => [...s, screen]);
    setScreen(nextScreen);
  }

  function goBack() {
    setNavStack((s) => {
      const copy = [...s];
      const prev = copy.pop();
      setScreen(prev || 'feed');
      return copy;
    });
  }

  function openProfile(username) {
    setViewedProfile(username);
    setProfileError('');
    setUsernameError('');
    setNewUsername('');
    goTo('profile');
  }

  function openOwnProfile() {
    setViewedProfile(null);
    setProfileError('');
    setUsernameError('');
    setNewUsername('');
    goTo('profile');
  }

  function openPost(postId) {
    setViewingPostId(postId);
    goTo('postDetail');
  }

  function openLumina() {
    if (isRums5) return;
    goTo('lumina');
  }

  async function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    try {
      const dataUrl = await resizeImage(file);
      setUploadPreview(dataUrl);
    } catch {
      setError('Could not read that image.');
    }
  }

  async function handlePublish() {
    if (!uploadPreview) {
      setError('Choose a screenshot first.');
      return;
    }
    setBusy(true);
    const newPost = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      username: currentUser.username,
      image: uploadPreview,
      caption: caption.trim(),
      tag: isRums5 ? 'General' : tag,
      timestamp: Date.now(),
      likes: [],
      comments: [],
    };
    await savePosts([newPost, ...posts]);
    setUploadPreview(null);
    setCaption('');
    setTag('General');
    setBusy(false);
    setScreen('feed');
  }

  async function toggleLike(postId) {
    const next = posts.map((p) => {
      if (p.id !== postId) return p;
      const liked = p.likes.includes(currentUser.username);
      return {
        ...p,
        likes: liked ? p.likes.filter((u) => u !== currentUser.username) : [...p.likes, currentUser.username],
      };
    });
    await savePosts(next);
  }

  async function submitComment(postId) {
    const text = (commentDrafts[postId] || '').trim();
    if (!text) return;
    const newComment = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      username: currentUser.username,
      text,
      timestamp: Date.now(),
      likes: [],
    };
    const next = posts.map((p) =>
      p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p
    );
    await savePosts(next);
    setCommentDrafts((d) => ({ ...d, [postId]: '' }));
  }

  async function deleteComment(postId, commentId) {
    const next = posts.map((p) =>
      p.id === postId ? { ...p, comments: p.comments.filter((c) => c.id !== commentId) } : p
    );
    await savePosts(next);
  }

  async function toggleCommentLike(postId, commentId) {
    const next = posts.map((p) => {
      if (p.id !== postId) return p;
      return {
        ...p,
        comments: p.comments.map((c) => {
          if (c.id !== commentId) return c;
          const liked = (c.likes || []).includes(currentUser.username);
          return {
            ...c,
            likes: liked
              ? c.likes.filter((u) => u !== currentUser.username)
              : [...(c.likes || []), currentUser.username],
          };
        }),
      };
    });
    await savePosts(next);
  }

  async function sharePost(post) {
    const text = `${post.username} shared a photo${post.tag === 'Lumina' ? ' from Lumina' : ''} on RUMS${post.caption ? `: "${post.caption}"` : ''}`;
    try {
      let file = null;
      try {
        const res = await fetch(post.image);
        const blob = await res.blob();
        file = new File([blob], `rums-${post.id}.jpg`, { type: blob.type || 'image/jpeg' });
      } catch {
        file = null;
      }
      if (navigator.share && (!file || (navigator.canShare && navigator.canShare({ files: [file] })))) {
        await navigator.share(file ? { title: 'RUMS', text, files: [file] } : { title: 'RUMS', text });
        setShareStatus((s) => ({ ...s, [post.id]: 'shared' }));
      } else {
        await navigator.clipboard.writeText(text);
        setShareStatus((s) => ({ ...s, [post.id]: 'copied' }));
      }
    } catch (e) {
      if (e?.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(text);
          setShareStatus((s) => ({ ...s, [post.id]: 'copied' }));
        } catch {
          setError('Could not share this post.');
        }
      }
    }
    setTimeout(() => setShareStatus((s) => ({ ...s, [post.id]: null })), 2000);
  }

  async function deletePost(postId) {
    await savePosts(posts.filter((p) => p.id !== postId));
  }

  async function toggleAdmin(username) {
    const next = users.map((u) => (u.username === username ? { ...u, isAdmin: !u.isAdmin } : u));
    await saveUsers(next);
    if (currentUser?.username === username) {
      setCurrentUser(next.find((u) => u.username === username));
    }
  }

  // Removes a user account plus every trace of them across posts: their own
  // posts, their likes on other posts, their comments, and their likes on
  // other people's comments.
  async function deleteAccountEverywhere(username) {
    const nextUsers = users.filter((u) => u.username !== username);
    await saveUsers(nextUsers);
    const nextPosts = posts
      .filter((p) => p.username !== username)
      .map((p) => ({
        ...p,
        likes: p.likes.filter((u) => u !== username),
        comments: p.comments
          .filter((c) => c.username !== username)
          .map((c) => ({ ...c, likes: (c.likes || []).filter((u) => u !== username) })),
      }));
    await savePosts(nextPosts);
    const nextSuggestions = suggestions
      .filter((s) => s.username !== username)
      .map((s) => ({ ...s, votes: (s.votes || []).filter((u) => u !== username) }));
    await saveSuggestions(nextSuggestions);
  }

  async function deleteMyAccount() {
    if (!currentUser) return;
    const username = currentUser.username;
    await deleteAccountEverywhere(username);
    try { await window.storage.delete(SESSION_KEY, false); } catch { /* ignore */ }
    for (const space of ['rums4', 'rums5']) { try { await window.storage.delete(lastSeenKey(username, space), false); } catch { /* ignore */ } }
    setCurrentUser(null);
    setScreen('login');
  }

  async function confirmDeleteAction() {
    if (!confirmDelete) return;
    setBusy(true);
    try {
      if (confirmDelete.type === 'self') {
        await deleteMyAccount();
      } else {
        await deleteAccountEverywhere(confirmDelete.username);
      }
    } catch (e) {
      console.error(e);
      setError('Could not delete that account — try again.');
    }
    setConfirmDelete(null);
    setBusy(false);
  }

  async function handleAvatarSelect(e) {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    setProfileError('');
    setAvatarBusy(true);
    try {
      const dataUrl = await resizeImage(file, 240);
      const nextUsers = users.map((u) => (u.username === currentUser.username ? { ...u, avatar: dataUrl } : u));
      await saveUsers(nextUsers);
      setCurrentUser((c) => ({ ...c, avatar: dataUrl }));
    } catch {
      setProfileError('Could not update your photo.');
    }
    setAvatarBusy(false);
    if (avatarInputRef.current) avatarInputRef.current.value = '';
  }

  // Renames a user everywhere their username is referenced: the account
  // record, their posts and likes, their comments and comment-likes, their
  // suggestions and suggestion-votes, and update authorship — then migrates
  // their session and last-seen record to the new name.
  async function handleChangeUsername() {
    setUsernameError('');
    if (!currentUser) return;
    const trimmed = newUsername.trim();
    if (!trimmed) {
      setUsernameError('Enter a new username.');
      return;
    }
    if (!/^[A-Za-z0-9_]+$/.test(trimmed)) {
      setUsernameError('Usernames can only contain letters, numbers, and underscores.');
      return;
    }
    const oldUsername = currentUser.username;
    if (trimmed.toLowerCase() === oldUsername.toLowerCase()) {
      setUsernameError("That's already your username.");
      return;
    }
    if (users.some((u) => u.username.toLowerCase() === trimmed.toLowerCase())) {
      setUsernameError('That username is taken.');
      return;
    }
    setUsernameBusy(true);
    try {
      const nextUsers = users.map((u) => (u.username === oldUsername ? { ...u, username: trimmed } : u));
      const nextPosts = posts.map((p) => ({
        ...p,
        username: p.username === oldUsername ? trimmed : p.username,
        likes: p.likes.map((u) => (u === oldUsername ? trimmed : u)),
        comments: p.comments.map((c) => ({
          ...c,
          username: c.username === oldUsername ? trimmed : c.username,
          likes: (c.likes || []).map((u) => (u === oldUsername ? trimmed : u)),
        })),
      }));
      const nextSuggestions = suggestions.map((s) => ({
        ...s,
        username: s.username === oldUsername ? trimmed : s.username,
        votes: (s.votes || []).map((u) => (u === oldUsername ? trimmed : u)),
      }));
      const nextUpdates = updates.map((u) => ({
        ...u,
        author: u.author === oldUsername ? trimmed : u.author,
      }));

      await Promise.all([
        saveUsers(nextUsers),
        savePosts(nextPosts),
        saveSuggestions(nextSuggestions),
        saveUpdates(nextUpdates),
      ]);

      try {
        for (const space of ['rums4', 'rums5']) {
          const rec = await safeGet(lastSeenKey(oldUsername, space), false);
          if (rec) {
            await window.storage.set(lastSeenKey(trimmed, space), rec.value, false);
            await window.storage.delete(lastSeenKey(oldUsername, space), false);
          }
        }
      } catch {
        /* ignore */
      }
      try {
        await window.storage.set(SESSION_KEY, JSON.stringify({ username: trimmed }), false);
      } catch {
        /* ignore */
      }

      setCurrentUser(nextUsers.find((u) => u.username === trimmed));
      if (viewedProfile === oldUsername) setViewedProfile(trimmed);
      setNewUsername('');
    } catch (e) {
      console.error(e);
      setUsernameError('Could not change your username — try again.');
    }
    setUsernameBusy(false);
  }

  async function submitSuggestion() {
    const text = suggestionDraft.trim();
    if (!text || !currentUser) return;
    setSuggestionBusy(true);
    const newS = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      username: currentUser.username,
      text,
      timestamp: Date.now(),
      votes: [],
    };
    await saveSuggestions([newS, ...suggestions]);
    setSuggestionDraft('');
    setSuggestionBusy(false);
  }

  async function toggleSuggestionVote(id) {
    const next = suggestions.map((s) => {
      if (s.id !== id) return s;
      const voted = (s.votes || []).includes(currentUser.username);
      return {
        ...s,
        votes: voted
          ? s.votes.filter((u) => u !== currentUser.username)
          : [...(s.votes || []), currentUser.username],
      };
    });
    await saveSuggestions(next);
  }

  async function deleteSuggestion(id) {
    await saveSuggestions(suggestions.filter((s) => s.id !== id));
  }

  async function submitUpdate() {
    if (!currentUser?.isAdmin) return;
    const title = updateDraft.title.trim();
    if (!title) return;
    setUpdateBusy(true);
    const newU = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      body: updateDraft.body.trim(),
      timestamp: Date.now(),
      author: currentUser.username,
    };
    await saveUpdates([newU, ...updates]);
    setUpdateDraft({ title: '', body: '' });
    setUpdateBusy(false);
  }

  async function deleteUpdate(id) {
    if (!currentUser?.isAdmin) return;
    await saveUpdates(updates.filter((u) => u.id !== id));
  }

  function avatarNode(username, size = 32, fontSize) {
    const url = users.find((u) => u.username === username)?.avatar;
    const style = { width: size, height: size };
    if (url) {
      return <img className="avatar avatar-img" src={url} alt={username} style={style} />;
    }
    return (
      <div className="avatar" style={{ ...style, fontSize: fontSize ?? Math.round(size * 0.42) }}>
        {username.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  function handleCommentInput(postId, e) {
    const value = e.target.value;
    const cursor = e.target.selectionStart;
    setCommentDrafts((d) => ({ ...d, [postId]: value }));
    const uptoCursor = value.slice(0, cursor);
    const atIndex = uptoCursor.lastIndexOf('@');
    if (atIndex === -1 || /\s/.test(uptoCursor.slice(atIndex + 1))) {
      setMention((m) => (m && m.postId === postId ? null : m));
      return;
    }
    setMention({ postId, query: uptoCursor.slice(atIndex + 1), start: atIndex });
  }

  function selectMention(username) {
    if (!mention) return;
    const { postId, start } = mention;
    const text = commentDrafts[postId] || '';
    const input = commentInputRefs.current[postId];
    const cursor = input ? input.selectionStart : text.length;
    const newText = `${text.slice(0, start)}@${username} ${text.slice(cursor)}`;
    setCommentDrafts((d) => ({ ...d, [postId]: newText }));
    setMention(null);
    requestAnimationFrame(() => {
      const el = commentInputRefs.current[postId];
      if (el) {
        const pos = start + username.length + 2;
        el.focus();
        el.setSelectionRange(pos, pos);
      }
    });
  }

  function renderCommentText(text) {
    return text.split(MENTION_RE).map((part, i) => {
      const m = part.match(/^@([A-Za-z0-9_]+)$/);
      if (m && users.some((u) => u.username.toLowerCase() === m[1].toLowerCase())) {
        return (
          <span
            className="mention-tag clickable-text"
            key={i}
            onClick={() => openProfile(users.find((u) => u.username.toLowerCase() === m[1].toLowerCase()).username)}
          >
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  }

  const mentionMatches = mention
    ? users.filter((u) => u.username.toLowerCase().startsWith(mention.query.toLowerCase())).slice(0, 5)
    : [];

  const canManage = (post) => currentUser?.isAdmin || currentUser?.username === post.username;
  const canManageComment = (c) => currentUser?.isAdmin || currentUser?.username === c.username;
  const canManageSuggestion = (s) => currentUser?.isAdmin || currentUser?.username === s.username;
  const isLastAdmin = (u) => u.isAdmin && users.filter((x) => x.isAdmin).length === 1;
  const isOwner = currentUser?.username?.toLowerCase() === 'jamie';
  const canEditSite = Boolean(currentUser?.isAdmin || isOwner);
  const activePlacement = screen === 'custom' ? customPageId : screen;
  const canUndoSiteEdit = historyRevision >= 0 && historyPastRef.current.length > 0;
  const canRedoSiteEdit = historyRevision >= 0 && historyFutureRef.current.length > 0;
  const selectedBoxStyle = selectedBoxId ? (siteConfig.boxStyles?.[selectedBoxId] || {}) : {};

  useEffect(() => {
    if (!editMode || !isOwner) return undefined;
    const onKeyDown = (event) => {
      if (!(event.metaKey || event.ctrlKey) || event.altKey) return;
      const target = event.target;
      if (target instanceof Element && target.closest('input,textarea,select,[contenteditable="true"]')) return;
      const key = event.key.toLowerCase();
      if (key === 'z' && !event.shiftKey) {
        if (!historyPastRef.current.length) return;
        event.preventDefault();
        undoSiteEdit();
      } else if (key === 'y' || (key === 'z' && event.shiftKey)) {
        if (!historyFutureRef.current.length) return;
        event.preventDefault();
        redoSiteEdit();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [editMode, isOwner]);

  useEffect(() => {
    const content = rootRef.current?.querySelector('.content');
    if (!content) return undefined;
    let frame = 0;
    const touchedParents = new Set();
    const touchedBoxes = new Set();

    const stableClass = (element) => [...element.classList].find((name) => ![
      'universal-edit-box', 'is-universal-box-selected', 'is-universal-box-dragging',
      'has-universal-box-color', 'universal-box-animation-float', 'universal-box-animation-pulse',
      'universal-box-animation-shimmer', 'clickable-row'
    ].includes(name)) || element.tagName.toLowerCase();

    const nodeToken = (element) => {
      const name = stableClass(element);
      const parent = element.parentElement;
      if (!parent) return name;
      const peers = [...parent.children].filter((node) => stableClass(node) === name);
      return `${name}-${Math.max(0, peers.indexOf(element))}`;
    };

    const parentKeyFor = (parent) => {
      if (parent === content) return `${activePlacement || screen}:root`;
      const parts = [];
      let node = parent;
      while (node && node !== content) {
        parts.unshift(nodeToken(node));
        node = node.parentElement;
      }
      return `${activePlacement || screen}:root/${parts.join('/')}`;
    };

    const decorate = () => {
      frame = 0;
      const candidates = [...content.querySelectorAll('*')].filter((element) => {
        const looksLikeBox = element.matches(UNIVERSAL_EDIT_BOX_SELECTOR) || [...element.classList].some((name) => /(?:card|wrap|panel|section|row|box|banner|shell|zone|grid)$/i.test(name));
        return looksLikeBox &&
          !element.closest('.visual-edit-toolbar,.widget-edit-controls,.mention-dropdown') &&
          !element.classList.contains('editable-built-in-box') &&
          !element.classList.contains('custom-site-widget') &&
          !element.classList.contains('content');
      });
      const groups = new Map();
      const localCounters = new Map();

      candidates.forEach((box) => {
        const parent = box.parentElement;
        if (!parent) return;
        const parentKey = parentKeyFor(parent);
        const base = box.dataset.editBoxId || stableClass(box);
        const counterKey = `${parentKey}|${base}`;
        const index = localCounters.get(counterKey) || 0;
        localCounters.set(counterKey, index + 1);
        const boxId = box.dataset.editBoxId || `${parentKey}:${base}:${index}`;
        box.dataset.editorBoxId = boxId;
        box.dataset.editorParentKey = parentKey;
        box.classList.add('universal-edit-box');
        box.classList.toggle('is-universal-box-selected', Boolean(editMode && isOwner && selectedBoxId === boxId));
        touchedBoxes.add(box);
        parent.dataset.editorParentKey = parentKey;
        touchedParents.add(parent);
        if (!groups.has(parent)) groups.set(parent, []);
        groups.get(parent).push(box);

        const style = siteConfig.boxStyles?.[boxId] || {};
        box.classList.remove('universal-box-animation-float', 'universal-box-animation-pulse', 'universal-box-animation-shimmer');
        if (style.animation && style.animation !== 'none') box.classList.add(`universal-box-animation-${style.animation}`);
        if (style.color) {
          box.classList.add('has-universal-box-color');
          box.style.setProperty('--universal-box-color', style.color);
        } else {
          box.classList.remove('has-universal-box-color');
          box.style.removeProperty('--universal-box-color');
        }

        const leafText = [...box.querySelectorAll(UNIVERSAL_EDIT_TEXT_SELECTOR)].filter((node) =>
          node.closest('.universal-edit-box') === box &&
          !node.closest('button,a,label,input,textarea,select,.widget-edit-controls') &&
          node.children.length === 0 && node.textContent.trim()
        );
        leafText.forEach((node, textIndex) => {
          const textKey = `${node.tagName.toLowerCase()}-${textIndex}`;
          node.dataset.editorTextKey = textKey;
          node.classList.toggle('universal-editable-text', Boolean(editMode && isOwner));
          const override = siteConfig.boxTextOverrides?.[boxId]?.[textKey];
          if (override != null && document.activeElement !== node && node.textContent !== override) node.textContent = override;
        });
      });

      groups.forEach((boxes, parent) => {
        const parentKey = parent.dataset.editorParentKey;
        const liveIds = boxes.map((box) => box.dataset.editorBoxId);
        const saved = siteConfig.boxOrders?.[parentKey] || [];
        const effective = [...saved.filter((id) => liveIds.includes(id)), ...liveIds.filter((id) => !saved.includes(id))];
        if (!parent.dataset.editorOriginalDisplay) parent.dataset.editorOriginalDisplay = getComputedStyle(parent).display;
        const originalDisplay = parent.dataset.editorOriginalDisplay;
        parent.classList.toggle('universal-box-order-stack', Boolean(boxes.length > 1 && (saved.length || (editMode && isOwner)) && !originalDisplay.includes('flex') && !originalDisplay.includes('grid')));
        boxes.forEach((box) => { box.style.order = saved.length || (editMode && isOwner) ? String(100 + effective.indexOf(box.dataset.editorBoxId)) : ''; });
      });
    };

    const scheduleDecorate = () => {
      if (!frame) frame = requestAnimationFrame(decorate);
    };
    scheduleDecorate();
    const observer = new MutationObserver(scheduleDecorate);
    observer.observe(content, { childList: true, subtree: true });

    const onPointerDown = (event) => {
      if (!editMode || !isOwner || !(event.target instanceof Element)) return;
      const box = event.target.closest('.universal-edit-box');
      if (!box || !content.contains(box)) return;
      setSelectedBoxId(box.dataset.editorBoxId || null);
      const rect = box.getBoundingClientRect();
      const isSelected = selectedBoxId === box.dataset.editorBoxId;
      const inHandle = isSelected && event.target === box && event.clientX >= rect.left + 6 && event.clientX <= rect.left + 132 && event.clientY >= rect.top - 43 && event.clientY <= rect.top - 4;
      if (inHandle) startUniversalBoxReorder(box, event);
    };

    const onDoubleClick = (event) => {
      if (!editMode || !isOwner || !(event.target instanceof Element)) return;
      const textNode = event.target.closest('[data-editor-text-key]');
      const box = textNode?.closest('.universal-edit-box');
      if (!textNode || !box || textNode.closest('button,a,label,input,textarea,select')) return;
      event.preventDefault();
      event.stopPropagation();
      setSelectedBoxId(box.dataset.editorBoxId || null);
      textNode.contentEditable = 'true';
      textNode.classList.add('is-live-box-text-edit');
      textNode.focus();
      const range = document.createRange();
      range.selectNodeContents(textNode);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      const finish = () => {
        textNode.removeEventListener('blur', finish);
        textNode.contentEditable = 'false';
        textNode.classList.remove('is-live-box-text-edit');
        updateUniversalBoxText(box.dataset.editorBoxId, textNode.dataset.editorTextKey, textNode.textContent);
      };
      textNode.addEventListener('blur', finish, { once: true });
    };

    content.addEventListener('pointerdown', onPointerDown, true);
    content.addEventListener('dblclick', onDoubleClick, true);
    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
      content.removeEventListener('pointerdown', onPointerDown, true);
      content.removeEventListener('dblclick', onDoubleClick, true);
      touchedBoxes.forEach((box) => {
        box.classList.remove('is-universal-box-selected');
        if (!editMode) box.classList.remove('universal-editable-text');
      });
      touchedParents.forEach((parent) => { if (!siteConfig.boxOrders?.[parent.dataset.editorParentKey]?.length) parent.classList.remove('universal-box-order-stack'); });
    };
  }, [screen, customPageId, feedFilter, luminaView, posts.length, suggestions.length, updates.length, users.length, siteConfig.boxOrders, siteConfig.boxStyles, siteConfig.boxTextOverrides, editMode, isOwner, selectedBoxId]);

  const siteText = (key, fallback) => siteConfig.textOverrides?.[key] || fallback;
  const editableTextProps = (key) => ({
    contentEditable: Boolean(editMode && isOwner),
    suppressContentEditableWarning: true,
    className: editMode && isOwner ? 'inline-site-text-edit' : undefined,
    'data-position-id': `text-${key}`,
    style: { '--position-x': `${siteConfig.elementPositions?.[`text-${key}`]?.x || 0}px`, '--position-y': `${siteConfig.elementPositions?.[`text-${key}`]?.y || 0}px` },
    onBlur: editMode && isOwner ? (event) => updateSiteText(key, event.currentTarget.textContent) : undefined,
  });
  const textDragHandle = (key) => editMode && isOwner ? <span className="text-position-handle" contentEditable={false} onPointerDown={(event) => startPositionDrag('text', `text-${key}`, event)} title="Drag text"><GripVertical size={12} /></span> : null;
  const renderCustomWidgets = (placement) => {
    const widgets = siteConfig.customWidgets.filter((widget) => widget.placement === placement);
    if (!widgets.length) return null;
    return (
      <div className="custom-widget-stack" data-widget-stack={placement}>
        {widgets.map((widget) => (
          <article data-position-id={widget.id} data-widget-placement={widget.placement} className={`custom-site-widget ${widget.image ? 'has-widget-image' : 'no-widget-image'} widget-animation-${widget.animation || 'none'} ${editMode && isOwner ? 'is-editing' : ''} ${selectedBoxId === `widget:${widget.id}` ? 'is-editor-selected' : ''}`} key={widget.id} style={{ '--widget-color': widget.color || '#ffffff' }} onPointerDownCapture={(event) => { if (editMode && isOwner && !(event.target instanceof Element && event.target.closest('.widget-edit-controls'))) setSelectedBoxId(`widget:${widget.id}`); }}>
            {editMode && isOwner && selectedBoxId === `widget:${widget.id}` && <div className="widget-edit-controls"><button type="button" className="widget-drag-handle" onPointerDown={(event) => startWidgetReorder(widget.id, event)} title="Hold and drag to move this box"><GripVertical size={15} /> Move box</button><button onClick={() => moveCustomWidget(widget.id, -1)} title="Move up"><ChevronUp size={14} /></button><button onClick={() => moveCustomWidget(widget.id, 1)} title="Move down"><ChevronDown size={14} /></button><label title="Box colour"><Palette size={14} /><input type="color" value={widget.color || '#ffffff'} onChange={(e) => updateCustomWidget(widget.id, { color: e.target.value })} /></label><label title="Image"><ImagePlus size={14} /><input type="file" accept="image/*" onChange={(e) => handleInlineWidgetImage(widget.id, e)} /></label><label title="Animation"><Sparkles size={14} /><select value={widget.animation || 'none'} onChange={(e) => updateCustomWidget(widget.id, { animation: e.target.value })}><option value="none">Still</option><option value="float">Float</option><option value="pulse">Breathe</option><option value="shimmer">Shimmer</option></select></label><button className="danger" onClick={() => removeCustomWidget(widget.id)} title="Delete"><Trash2 size={14} /></button></div>}
            {widget.image && <img src={widget.image} alt="" />}
            <div><h3 contentEditable={editMode && isOwner} suppressContentEditableWarning onBlur={(e) => updateCustomWidget(widget.id, { title: e.currentTarget.textContent.trim() })}>{widget.title}</h3>{widget.body && <p contentEditable={editMode && isOwner} suppressContentEditableWarning onBlur={(e) => updateCustomWidget(widget.id, { body: e.currentTarget.textContent.trim() })}>{widget.body}</p>}
              {widget.actionLabel && widget.actionUrl && <a href={widget.actionUrl} target="_blank" rel="noreferrer">{widget.actionLabel}</a>}
            </div>
          </article>
        ))}
      </div>
    );
  };
  const unseenGeneral = currentUser
    ? posts.filter((p) => p.tag !== 'Lumina' && p.timestamp > (lastSeen.General || 0) && p.username !== currentUser.username).length
    : 0;
  const unseenLumina = !isRums5 && currentUser
    ? posts.filter((p) => p.tag === 'Lumina' && p.timestamp > (lastSeen.Lumina || 0) && p.username !== currentUser.username).length
    : 0;
  const hasNewPosts = unseenGeneral > 0 || unseenLumina > 0;
  const visiblePosts = posts
    .slice()
    .sort((a, b) => b.timestamp - a.timestamp)
    .filter((p) => isRums5 || feedFilter !== 'lumina' ? p.tag !== 'Lumina' : p.tag === 'Lumina');

  const visibleSuggestions = suggestions
    .slice()
    .sort((a, b) => (b.votes?.length || 0) - (a.votes?.length || 0) || b.timestamp - a.timestamp);

  const visibleUpdates = updates.slice().sort((a, b) => b.timestamp - a.timestamp);
  const luminaPosts = isRums5 ? [] : posts.filter((p) => p.tag === 'Lumina').sort((a, b) => b.timestamp - a.timestamp);
  const feedBoxHandle = (id) => editMode && isOwner && selectedBoxId === `feed:${id}` ? <button type="button" className="built-in-box-handle" onPointerDown={(event) => { setSelectedBoxId(`feed:${id}`); startFeedBoxReorder(id, event); }}><GripVertical size={15} /> Move box</button> : null;
  function renderFeedBox(id) {
    if (id === 'hero') return <section data-feed-box="hero" data-edit-box-id="feed:hero" className={`editable-built-in-box ${selectedBoxId === 'feed:hero' ? 'is-editor-selected' : ''}`} key="hero" onPointerDownCapture={() => { if (editMode && isOwner) setSelectedBoxId('feed:hero'); }}>{feedBoxHandle('hero')}<div className="community-hero"><div className="hero-copy"><span className="eyebrow">{siteConfig.brandName} COMMUNITY</span><h1 {...(feedFilter === 'all' ? editableTextProps('feed.heading') : {})}>{feedFilter === 'lumina' ? 'Lumina' : siteText('feed.heading', siteConfig.heroTitle)}{feedFilter === 'all' && textDragHandle('feed.heading')}</h1><p {...(feedFilter === 'all' ? editableTextProps('feed.description') : {})}>{feedFilter === 'lumina' ? 'A closer look at the city being built on RUMS.' : siteText('feed.description', siteConfig.heroText)}{feedFilter === 'all' && textDragHandle('feed.description')}</p></div><button className="hero-create" onClick={() => setScreen('upload')} aria-label="Create post"><Plus size={20} /></button></div></section>;
    return <section data-feed-box="posts" data-edit-box-id="feed:posts" className={`editable-built-in-box ${selectedBoxId === 'feed:posts' ? 'is-editor-selected' : ''}`} key="posts" onPointerDownCapture={() => { if (editMode && isOwner) setSelectedBoxId('feed:posts'); }}>{feedBoxHandle('posts')}<div className="section-heading"><h2>Recent posts</h2><span>{visiblePosts.length} {visiblePosts.length === 1 ? 'post' : 'posts'}</span></div>{feedFilter === 'lumina' && <div className="lumina-banner clickable-row" onClick={openLumina}><div className="droplet-badge"><Droplet size={18} color="white" /></div><div><h4>Lumina</h4><p>Screenshots from the city district, in one place.</p></div><span className="lumina-banner-arrow">About the city →</span></div>}{visiblePosts.length === 0 ? <div className="feed-empty"><div className="r-badge">R</div><h3>{feedFilter === 'lumina' ? 'No Lumina posts yet' : 'No posts yet'}</h3><p>{feedFilter === 'lumina' ? 'Be the first to share a view of Lumina.' : 'Be the first to share something from RUMS.'}</p></div> : visiblePosts.map((post) => renderPost(post))}</section>;
  }

  function renderFeedTabs() {
    if (isRums5) return null;
    return (
      <div ref={tabsRef} className={`feed-tabs ${tabsDragging ? 'is-dragging' : ''}`}
        style={{ '--seg-translate': tabsDragging ? `${tabOffset}px` : feedFilter === 'lumina' ? '100%' : '0%' }}
        onPointerDown={handleTabsPointerDown} onPointerMove={handleTabsPointerMove}
        onPointerUp={handleTabsPointerEnd} onPointerCancel={handleTabsPointerEnd}
        onClickCapture={(e) => { if (tabsDragRef.current?.moved) { e.preventDefault(); e.stopPropagation(); } }}>
        <button className={`tab-btn ${feedFilter === 'all' ? 'active' : ''}`} onClick={() => setFeedFilter('all')}>
          All RUMS
          {unseenGeneral > 0 && <span className="tab-badge">{unseenGeneral}</span>}
        </button>
        <button className={`tab-btn ${feedFilter === 'lumina' ? 'active' : ''}`} onClick={() => setFeedFilter('lumina')}>
          <Droplet size={12} /> Lumina
          {unseenLumina > 0 && <span className="tab-badge">{unseenLumina}</span>}
        </button>
        <span className="drag-refraction feed-drag-refraction" aria-hidden="true"><span className="drag-refraction-content"><span className={feedFilter === 'all' ? 'active' : ''}>All RUMS</span><span className={feedFilter === 'lumina' ? 'active' : ''}><Droplet size={12} /> Lumina</span></span></span>
      </div>
    );
  }

  function renderRumsVersionSwitcher() {
    return (
      <div className="universal-rums-switcher" role="group" aria-label="Switch between RUMS 4 and RUMS 5">
        <button
          type="button"
          className={rumsSpace === 'rums4' ? 'active' : ''}
          aria-pressed={rumsSpace === 'rums4'}
          onClick={() => { if (rumsSpace !== 'rums4') switchRumsSpace('rums4'); }}
          disabled={Boolean(spaceSwitchBusy)}
          title="Open RUMS 4"
        >
          <span>RUMS</span><strong>{spaceSwitchBusy === 'rums4' ? <Loader2 size={12} className="spin" /> : '4'}</strong>
        </button>
        <button
          type="button"
          className={rumsSpace === 'rums5' ? 'active' : ''}
          aria-pressed={rumsSpace === 'rums5'}
          onClick={() => { if (rumsSpace !== 'rums5') switchRumsSpace('rums5'); }}
          disabled={Boolean(spaceSwitchBusy)}
          title="Open RUMS 5"
        >
          <span>RUMS</span><strong>{spaceSwitchBusy === 'rums5' ? <Loader2 size={12} className="spin" /> : '5'}</strong>
        </button>
      </div>
    );
  }

  function renderVisualEditToolbar() {
    return (
      <div className="visual-edit-toolbar">
        <div className="visual-edit-toolbar-main">
          <span className="editor-context-label"><Pencil size={14} /> Editing <b>{screen === 'custom' ? siteConfig.customTabs.find((tab) => tab.id === customPageId)?.label : BUILT_IN_PAGES.find(([id]) => id === screen)?.[1] || screen}</b></span>
          <div className="editor-primary-actions">
            <button type="button" onClick={undoSiteEdit} disabled={!canUndoSiteEdit} title="Undo · Command/Control Z"><Undo2 size={14} /> Undo</button>
            <button type="button" onClick={redoSiteEdit} disabled={!canRedoSiteEdit} title="Redo · Command/Control Y or Shift+Command/Control Z"><Redo2 size={14} /> Redo</button>
            <button type="button" onClick={() => addWidgetToPage(activePlacement)}><Plus size={14} /> Add box</button>
            <label title="Site accent colour"><Palette size={14} /><input type="color" value={siteConfig.accent} onChange={(e) => updateSiteConfig({ accent: e.target.value })} /></label>
            <button type="button" onClick={() => updateSiteConfig({ animations: !siteConfig.animations })}>{siteConfig.animations ? <Sparkles size={14} /> : <EyeOff size={14} />} Motion</button>
          </div>
        </div>
        {selectedBoxId && (
          <div className="selected-box-toolbar">
            <strong className="selected-box-chip" title={selectedBoxId}>Selected box</strong>
            <button type="button" onClick={() => moveUniversalBoxByDirection(selectedBoxId, -1)} title="Move selected box one slot up/left"><ChevronUp size={14} /></button>
            <button type="button" onClick={() => moveUniversalBoxByDirection(selectedBoxId, 1)} title="Move selected box one slot down/right"><ChevronDown size={14} /></button>
            <label className="box-color-control" style={{ '--selected-box-color': selectedBoxStyle.color || '#ffffff' }} title="Selected box colour"><Palette size={14} /><input type="color" value={selectedBoxStyle.color || '#ffffff'} onChange={(e) => updateUniversalBoxStyle(selectedBoxId, { color: e.target.value })} /></label>
            <label className="box-animation-control" title="Selected box animation"><Sparkles size={14} /><select value={selectedBoxStyle.animation || 'none'} onChange={(e) => updateUniversalBoxStyle(selectedBoxId, { animation: e.target.value })}><option value="none">Still</option><option value="float">Float</option><option value="pulse">Breathe</option><option value="shimmer">Shimmer</option></select></label>
            <button type="button" onClick={() => resetUniversalBoxStyle(selectedBoxId)} title="Reset selected box style"><RotateCcw size={14} /> Reset</button>
          </div>
        )}
      </div>
    );
  }

  const q = searchQuery.trim().toLowerCase();
  const matchedUsers = q ? users.filter((u) => u.username.toLowerCase().includes(q)) : [];
  const matchedPosts = q
    ? posts
        .filter((p) => p.username.toLowerCase().includes(q) || (p.caption || '').toLowerCase().includes(q))
        .sort((a, b) => b.timestamp - a.timestamp)
    : [];

  // Renders a single post card. Shared by the feed list and the single-post
  // detail view (reached by clicking a post from search results).
  function renderPost(post) {
    const liked = post.likes.includes(currentUser.username);
    const showComments = !!openComments[post.id];
    return (
      <div className="post-card" data-edit-box-id={`post:${post.id}`} key={post.id}>
        <div className="post-top">
          <div className="post-user clickable-row" onClick={() => openProfile(post.username)}>
            {avatarNode(post.username, 32)}
            <div>
              <div className="post-user-name">
                {post.username}
                {post.tag === 'Lumina' && (
                  <span className="tag-pill"><Droplet size={9} /> Lumina</span>
                )}
              </div>
              <div className="post-time">{timeAgo(post.timestamp)}</div>
            </div>
          </div>
          {canManage(post) && (
            <button
              className="icon-btn manage-btn"
              onClick={(e) => { e.stopPropagation(); deletePost(post.id); }}
              title="Delete post"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
        <div className="post-img-wrap">
          <img src={post.image} alt={post.caption || 'RUMS screenshot'} />
          <div className="post-sheen" />
        </div>
        <div className="post-actions">
          <button className={`like-btn ${liked ? 'liked' : ''}`} onClick={() => toggleLike(post.id)}>
            <Heart size={19} fill={liked ? '#e0546b' : 'none'} />
            {post.likes.length > 0 ? post.likes.length : ''}
          </button>
          <button
            className="comment-btn"
            onClick={() => setOpenComments((o) => ({ ...o, [post.id]: !o[post.id] }))}
          >
            <MessageCircle size={18} />
            {post.comments.length > 0 ? post.comments.length : ''}
          </button>
          <button className="comment-btn" onClick={() => sharePost(post)}>
            {shareStatus[post.id] ? <Check size={17} color="#0fb8a6" /> : <Share2 size={17} />}
            {shareStatus[post.id] === 'copied' ? 'Copied' : shareStatus[post.id] === 'shared' ? 'Shared' : ''}
          </button>
        </div>
        {post.caption && (
          <div className="post-caption">
            <b className="clickable-text" onClick={() => openProfile(post.username)}>{post.username}</b>
            {post.caption}
          </div>
        )}
        {showComments && (
          <div className="comments-box">
            {post.comments.map((c) => {
              const cLiked = (c.likes || []).includes(currentUser.username);
              return (
                <div className="comment-row" key={c.id}>
                  <div className="comment-text">
                    <b className="clickable-text" onClick={() => openProfile(c.username)}>{c.username}</b>
                    {renderCommentText(c.text)}
                  </div>
                  <div className="comment-actions">
                    <button className={`comment-like-btn ${cLiked ? 'liked' : ''}`} onClick={() => toggleCommentLike(post.id, c.id)}>
                      <Heart size={12} fill={cLiked ? '#e0546b' : 'none'} />
                      {(c.likes || []).length > 0 ? c.likes.length : ''}
                    </button>
                    {canManageComment(c) && (
                      <button className="comment-del-btn" onClick={() => deleteComment(post.id, c.id)}>
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            <div className="comment-input-wrap">
              {mention && mention.postId === post.id && mentionMatches.length > 0 && (
                <div className="mention-dropdown">
                  {mentionMatches.map((u) => (
                    <button
                      key={u.username}
                      type="button"
                      className="mention-option"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectMention(u.username)}
                    >
                      {avatarNode(u.username, 22, 9)}
                      {u.username}
                    </button>
                  ))}
                </div>
              )}
              <div className="comment-input-row">
                <input
                  ref={(el) => { commentInputRefs.current[post.id] = el; }}
                  placeholder="Add a comment… @ to mention"
                  value={commentDrafts[post.id] || ''}
                  onChange={(e) => handleCommentInput(post.id, e)}
                  onKeyDown={(e) => {
                    if (mention && mention.postId === post.id && mentionMatches.length > 0) {
                      if (e.key === 'Enter') { e.preventDefault(); selectMention(mentionMatches[0].username); return; }
                      if (e.key === 'Escape') { setMention(null); return; }
                    }
                    if (e.key === 'Enter') submitComment(post.id);
                  }}
                />
                <button className="comment-send" onClick={() => submitComment(post.id)} disabled={!(commentDrafts[post.id] || '').trim()}>
                  <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`aero-root ${siteConfig.animations ? '' : 'site-motion-off'} ${editMode ? 'visual-edit-mode' : ''} ${rumsSpace ? `space-${rumsSpace}` : 'space-chooser-active'}`} ref={rootRef} style={{ '--glass-alpha': glassStrength / 100, '--site-accent': siteConfig.accent }}>
      <svg className="liquid-glass-filters" aria-hidden="true" focusable="false">
        <defs>
          <filter id="liquid-glass-refraction" x="-20%" y="-35%" width="140%" height="170%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.085" numOctaves="1" seed="8" result="lensNoise" />
            <feDisplacementMap in="SourceGraphic" in2="lensNoise" scale="8" xChannelSelector="R" yChannelSelector="B" result="refracted" />
            <feGaussianBlur in="refracted" stdDeviation="0.18" />
          </filter>
        </defs>
      </svg>
      <div className="aero-frame">
        {screen === 'spaceSelect' && (
          <section className="rums-space-chooser" aria-labelledby="rums-space-title">
            <div className="space-chooser-mark">R</div>
            <span className="space-chooser-kicker">RUMS COMMUNITY</span>
            <h1 id="rums-space-title">Choose your RUMS</h1>
            <p className="space-chooser-intro">Pick which era you want to enter. Your account works in both.</p>
            <div className="space-choice-grid">
              <button type="button" className="space-choice-card rums4-choice" onClick={() => chooseRumsSpace('rums4')}>
                <span className="space-choice-number">04</span>
                <span className="space-choice-copy"><strong>RUMS 4</strong><small>The current archive</small><em>Project Lumina · older posts · existing community content</em></span>
                <span className="space-choice-arrow">→</span>
              </button>
              <button type="button" className="space-choice-card rums5-choice" onClick={() => chooseRumsSpace('rums5')}>
                <span className="space-choice-number">05</span>
                <span className="space-choice-copy"><strong>RUMS 5</strong><small>The new era</small><em>Fresh posts · same features · no Project Lumina</em></span>
                <span className="space-choice-arrow">→</span>
              </button>
            </div>
          </section>
        )}

        {screen === 'loading' && (
          <div className="center-loading">
            <Loader2 size={18} className="spin" /> Loading {activeSpace?.label || 'RUMS'}…
          </div>
        )}

        {(screen === 'login' || screen === 'signup') && (
          <div className="auth-wrap">
            <div className="auth-logo">R</div>
            <h1 className="auth-title">{activeSpace?.label || 'RUMS'}</h1>
            <p className="auth-sub">{isRums5 ? 'The new RUMS era — a fresh community feed with the same social features.' : "The server's photo feed — including the full Project Lumina archive and older posts."}</p>
            <button type="button" className="auth-space-switch" onClick={openRumsChooser}>← Choose RUMS 4 or 5</button>
            <form className="auth-form" onSubmit={handleAuth}>
              {error && <div className="error-pill">{error}</div>}
              <input
                className="aero-input"
                placeholder="Username"
                value={authForm.username}
                onChange={(e) => setAuthForm((f) => ({ ...f, username: e.target.value }))}
                autoComplete="username"
              />
              <input
                className="aero-input"
                placeholder="Password"
                type="password"
                value={authForm.password}
                onChange={(e) => setAuthForm((f) => ({ ...f, password: e.target.value }))}
                autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
              />
              <button className="aero-btn" type="submit" disabled={busy}>
                {busy && <Loader2 size={15} className="spin" />}
                {authMode === 'signup' ? 'Create account' : 'Log in'}
              </button>
            </form>
            <p className="switch-line">
              {authMode === 'signup' ? 'Already have an account? ' : 'New to RUMS? '}
              <span
                className="switch-link"
                onClick={() => { setAuthMode(authMode === 'signup' ? 'login' : 'signup'); setError(''); }}
              >
                {authMode === 'signup' ? 'Log in' : 'Sign up'}
              </span>
            </p>
            {users.length === 0 && authMode === 'signup' && (
              <p className="switch-line" style={{ marginTop: 14, color: '#0fb8a6' }}>
                You'll be the first account on the server — that makes you an admin automatically.
              </p>
            )}
          </div>
        )}

        {screen !== 'spaceSelect' && screen !== 'loading' && screen !== 'login' && screen !== 'signup' && currentUser && (
          <>
            <aside className="desktop-rail">
              <div className="rail-brand"><span className="rail-orb">{siteConfig.brandName.slice(0,1).toUpperCase()}</span><span>{siteConfig.brandName}<small>{siteConfig.brandTagline}</small></span></div>
              <div className="rail-label">EXPLORE</div>
              <button className={`rail-link ${screen === 'feed' ? 'selected' : ''}`} onClick={() => { setScreen('feed'); setFeedFilter('all'); }}><Home size={19} /> Community feed {hasNewPosts && <span className="rail-dot" />}</button>
              {siteConfig.showDiscover && <button className={`rail-link ${screen === 'search' ? 'selected' : ''}`} onClick={() => setScreen('search')}><Search size={19} /> Discover</button>}
              {!isRums5 && siteConfig.showLumina && <button className={`rail-link ${screen === 'lumina' ? 'selected' : ''}`} onClick={openLumina}><Droplet size={19} /> Project Lumina</button>}
              <div className="rail-label">COMMUNITY</div>
              {siteConfig.showUpdates && <button className={`rail-link ${screen === 'updates' ? 'selected' : ''}`} onClick={() => setScreen('updates')}><Megaphone size={19} /> Server updates</button>}
              {siteConfig.showSuggestions && <button className={`rail-link ${screen === 'suggestions' ? 'selected' : ''}`} onClick={() => setScreen('suggestions')}><Lightbulb size={19} /> Suggestions</button>}
              {siteConfig.customTabs.map((tab) => <button key={tab.id} className={`rail-link ${screen === 'custom' && customPageId === tab.id ? 'selected' : ''}`} onClick={() => { setCustomPageId(tab.id); setScreen('custom'); }}><Pencil size={19} /> {tab.label}</button>)}
              {canEditSite && <button className={`rail-link ${screen === 'admin' ? 'selected' : ''}`} onClick={() => setScreen('admin')}><Shield size={19} /> Admin space</button>}
              {isOwner && <button className={`rail-link edit-mode-toggle ${editMode ? 'selected' : ''}`} onClick={() => setEditMode(true)}>{editMode ? <Check size={19} /> : <Eye size={19} />} {editMode ? 'Editing website' : 'Edit website'}</button>}
              <button className="rail-create" onClick={() => setScreen('upload')}><Plus size={19} /> Share a build</button>
              <div className="rail-footer"><span className="status-light" /> A world built together <small>RUMS · Minecraft community</small></div>
            </aside>
            <div className="aero-header">
              <div className="aero-brand aero-brand-version-switch">
                {renderRumsVersionSwitcher()}
              </div>
              {screen === 'feed' && <div className="aero-header-center">{renderFeedTabs()}</div>}
              <div className="aero-header-actions">
                {editMode && isOwner ? <button className="finish-editing-button" onClick={() => setEditMode(false)}><Check size={17} /> Finish editing</button> : <>
                {isOwner && <button className="icon-btn" onClick={() => setEditMode(true)} title="Edit website"><Pencil size={18} /></button>}
                {siteConfig.showDiscover && <button className="icon-btn" onClick={() => setScreen('search')} title="Search">
                  <Search size={18} />
                </button>}
                <button className="pill pill-btn" onClick={openOwnProfile} title="Your profile">
                  {avatarNode(currentUser.username, 18, 8)}
                  {currentUser.username}
                  {currentUser.isAdmin && <ShieldCheck size={13} color="#0fb8a6" />}
                </button>
                <button className="icon-btn" onClick={handleLogout} title="Log out">
                  <LogOut size={18} />
                </button>
                </>}
              </div>
            </div>

            <div className="content">
              {siteConfig.customTabs.length > 0 && <div className="custom-mobile-tabs">{siteConfig.customTabs.map((tab) => <button key={tab.id} className={screen === 'custom' && customPageId === tab.id ? 'active' : ''} onClick={() => { setCustomPageId(tab.id); setScreen('custom'); }}>{tab.label}</button>)}</div>}
              {editMode && isOwner && screen !== 'admin' && renderVisualEditToolbar()}
              {error && (
                <div style={{ padding: '10px 16px 0' }}>
                  <div className="error-pill">{error}</div>
                </div>
              )}

              {activePlacement && screen !== 'admin' && renderCustomWidgets(activePlacement)}

              {screen === 'feed' && (
                <div className="feed-box-layout">{(siteConfig.feedBoxOrder || ['hero', 'posts']).map(renderFeedBox)}</div>
              )}

              {screen === 'postDetail' && (
                <div>
                  <div className="detail-back-row">
                    <button className="icon-btn detail-back-btn" onClick={goBack}>
                      <ArrowLeft size={18} /> Back
                    </button>
                  </div>
                  {(() => {
                    const post = posts.find((p) => p.id === viewingPostId);
                    if (!post) {
                      return (
                        <div className="feed-empty">
                          <div className="r-badge">R</div>
                          <h3>Post not found</h3>
                          <p>This post may have been deleted.</p>
                        </div>
                      );
                    }
                    return renderPost(post);
                  })()}
                </div>
              )}

              {screen === 'lumina' && !isRums5 && (
                <div className="lumina-page">
                  <div className="lumina-topbar"><button className="glass-circle-btn" onClick={goBack} aria-label="Back"><ArrowLeft size={19} /></button><span>Project</span><button className="glass-circle-btn" onClick={() => { setTag('Lumina'); setScreen('upload'); }} aria-label="Share from Lumina"><Plus size={19} /></button></div>
                  <section className="lumina-project-hero">
                    <div className="lumina-project-glow" aria-hidden="true"><span /><span /></div>
                    <div className="lumina-project-copy"><span className="lumina-kicker"><Droplet size={12} /> A CITY ON RUMS</span><h1 {...editableTextProps('lumina.heading')}>{siteText('lumina.heading', 'Project Lumina')}{textDragHandle('lumina.heading')}</h1><p {...editableTextProps('lumina.description')}>{siteText('lumina.description', 'A bright community city where Frutiger Aero optimism, Frutiger Eco nature and solarpunk urbanism meet.')}{textDragHandle('lumina.description')}</p><div className="lumina-hero-actions"><button onClick={() => setLuminaView('metro')}>Explore the metro</button><button onClick={() => { setTag('Lumina'); setScreen('upload'); }}><Plus size={14} /> Share a view</button></div></div>
                    <div className="lumina-project-stats"><div><strong>{luminaPosts.length}</strong><span>community posts</span></div><div><strong>M1</strong><span>every minute</span></div></div>
                  </section>

                  <nav ref={luminaTabsRef} className={`lumina-view-switch ${luminaTabsDragging ? 'is-dragging' : ''}`} style={{ '--lumina-tab-index': LUMINA_SECTIONS.findIndex(([value]) => value === luminaView), ...(luminaTabsDragging ? { '--lumina-drag-translate': `${luminaTabOffset}px` } : {}) }} aria-label="Project Lumina sections" onPointerDown={handleLuminaTabsPointerDown} onPointerMove={handleLuminaTabsPointerMove} onPointerUp={handleLuminaTabsPointerEnd} onPointerCancel={handleLuminaTabsPointerEnd}>{LUMINA_SECTIONS.map(([value,label]) => <button key={value} className={luminaView === value ? 'active' : ''} onClick={() => { if (!luminaTabsDragRef.current?.moved) setLuminaView(value); }}>{label}</button>)}<span className="drag-refraction lumina-drag-refraction" aria-hidden="true"><span className="drag-refraction-content">{LUMINA_SECTIONS.map(([value,label]) => <span key={value} className={luminaView === value ? 'active' : ''}>{label}</span>)}</span></span></nav>

                  {luminaView === 'overview' && <div className="lumina-view-panel lumina-overview-view">
                    <section className="lumina-intro-card"><span className="eyebrow">THE IDEA</span><h2>Optimism built into a city.</h2><p>Lumina mixes the glossy blue skies and friendly technology of Frutiger Aero, the natural calm of Frutiger Eco and the green, people-first future of solarpunk. Each district has its own role, while the metro keeps everything close.</p><div className="lumina-fact-row"><span><b>Community built</b>Made together on RUMS</span><span><b>Transit first</b>Three connected districts</span><span><b>Always evolving</b>New views and builds</span></div></section>
                    <section className="lumina-principles"><article><span>01</span><h3>Frutiger Aero</h3><p>Clear water, bright skies and friendly futuristic technology.</p></article><article><span>02</span><h3>Frutiger Eco</h3><p>Soft natural forms, greenery and a calm connection to the landscape.</p></article><article><span>03</span><h3>Solarpunk</h3><p>Walkable neighbourhoods, clean transit and architecture shaped around people.</p></article></section>
                    <button className="lumina-wide-action" onClick={() => setLuminaView('metro')}><span><b>Explore Lumina Metro</b><small>See every district on the route</small></span><span>→</span></button>
                  </div>}

                  {luminaView === 'metro' && <section className="lumina-view-panel lumina-metro-panel">
                    <div className="lumina-section-copy"><span className="eyebrow">M1 · DISTRICT EXPLORER</span><h2>Choose a destination</h2><p>Move between Lumina’s three metro districts.</p><div className="lumina-service-facts"><span><b>1 min</b> service</span><span><b>3</b> stations</span><span><b>Platform screen doors</b> at every station</span></div></div>
                    <div className="lumina-line" aria-label="Lumina districts">{LUMINA_STATIONS.map((station,index) => <button className={`lumina-station ${activeLuminaStation === index ? 'active' : ''}`} key={station.name} onClick={() => setActiveLuminaStation(index)} aria-pressed={activeLuminaStation === index} style={{ '--station-accent': station.accent }}><span><small>0{index + 1}</small></span><b>{station.name}</b><em>{station.type}</em></button>)}</div>
                    <div className="lumina-station-detail" style={{ '--station-accent': LUMINA_STATIONS[activeLuminaStation].accent }}><div className="station-number">0{activeLuminaStation + 1}</div><div><span>{LUMINA_STATIONS[activeLuminaStation].type}</span><h3>{LUMINA_STATIONS[activeLuminaStation].name}</h3><p>{LUMINA_STATIONS[activeLuminaStation].description}</p></div><button onClick={() => { setFeedFilter('lumina'); setScreen('feed'); }}>View posts</button></div>
                    <div className="lumina-map-help"><span>Tap a district to explore</span><span>Swipe to browse →</span></div>
                  </section>}

                  {luminaView === 'community' && <section className="lumina-view-panel lumina-community-section">
                    <div className="lumina-section-heading"><div><span className="eyebrow">FROM THE COMMUNITY</span><h2>Latest views</h2><p>Places and progress shared by RUMS members.</p></div><button onClick={() => { setFeedFilter('lumina'); setScreen('feed'); }}>Open feed</button></div>
                    {luminaPosts.length ? <div className="lumina-gallery">{luminaPosts.slice(0, 8).map((p) => <button key={p.id} onClick={() => openPost(p.id)} aria-label={`Open post by ${p.username}`}><img src={p.image} alt="" /><span>{p.username}</span>{p.caption && <small>{p.caption}</small>}</button>)}</div> : <div className="lumina-gallery-empty"><Droplet size={22} /><p>No Lumina views have been shared yet.</p><button onClick={() => { setTag('Lumina'); setScreen('upload'); }}>Share the first</button></div>}
                    <button className="lumina-share-card" onClick={() => { setTag('Lumina'); setScreen('upload'); }}><span className="composer-upload-icon"><ImagePlus size={21} /></span><span><b>Add your view of Lumina</b><small>Share a build, street or skyline moment</small></span><Plus size={18} /></button>
                  </section>}
                </div>
              )}

              {screen === 'upload' && (
                <div className="upload-wrap">
                  <div className="composer-heading"><span className="eyebrow">NEW POST</span><h2 {...editableTextProps('upload.heading')}>{siteText('upload.heading', 'Share a moment')}{textDragHandle('upload.heading')}</h2><p {...editableTextProps('upload.description')}>{siteText('upload.description', 'Show everyone what you’ve built or discovered on RUMS.')}{textDragHandle('upload.description')}</p></div>
                  {!uploadPreview ? (
                    <div className="drop-zone" role="button" tabIndex={0} onClick={() => fileInputRef.current?.click()}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}>
                      <span className="composer-upload-icon"><ImagePlus size={25} /></span>
                      <p><b>Choose a screenshot</b><br />JPG or PNG from anywhere on RUMS</p>
                    </div>
                  ) : (
                    <div className="preview-wrap">
                      <img src={uploadPreview} alt="preview" />
                      <button className="preview-clear" onClick={() => setUploadPreview(null)} aria-label="Remove screenshot"><X size={16} /></button>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileSelect} />

                  <div className="field-label">Where was it taken?</div>
                  {isRums5 ? (
                    <div className="rums5-location-chip"><Check size={13} /> RUMS 5</div>
                  ) : (
                    <div ref={locationTabsRef} className={`tag-select location-tabs ${locationTabsDragging ? 'is-dragging' : ''}`} style={{ '--location-tab-index': tag === 'Lumina' ? 1 : 0 }} onPointerDown={handleLocationTabsPointerDown} onPointerMove={handleLocationTabsPointerMove} onPointerUp={handleLocationTabsPointerEnd} onPointerCancel={handleLocationTabsPointerEnd} onClickCapture={(e) => { if (locationTabsDragRef.current?.moved) { e.preventDefault(); e.stopPropagation(); } }}>
                      {TAGS.map((t) => (
                        <button
                          key={t}
                          className={`tag-chip ${tag === t ? 'active' : ''}`}
                          onClick={() => setTag(t)}
                          type="button"
                        >
                          {t === 'Lumina' && <Droplet size={13} />} {t}
                        </button>
                      ))}
                      <span className="drag-refraction location-drag-refraction" aria-hidden="true"><span className="drag-refraction-content"><span className={tag === 'General' ? 'active' : ''}>General</span><span className={tag === 'Lumina' ? 'active' : ''}><Droplet size={13} /> Lumina</span></span></span>
                    </div>
                  )}

                  <div className="field-label">Caption</div>
                  <textarea
                    className="caption-area"
                    placeholder="Write a caption…"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                  />
                  <button className="aero-btn" style={{ marginTop: 14 }} onClick={handlePublish} disabled={busy || !uploadPreview}>
                    {busy && <Loader2 size={15} className="spin" />}
                    Share to RUMS
                  </button>
                </div>
              )}

              {screen === 'suggestions' && (
                <div className="upload-wrap">
                  <div className="field-label" style={{ marginTop: 0 }}>Share an idea</div>
                  <textarea
                    className="caption-area"
                    style={{ marginTop: 0 }}
                    placeholder="What should RUMS do next?"
                    value={suggestionDraft}
                    onChange={(e) => setSuggestionDraft(e.target.value)}
                  />
                  <button
                    className="aero-btn"
                    style={{ marginTop: 12 }}
                    onClick={submitSuggestion}
                    disabled={suggestionBusy || !suggestionDraft.trim()}
                  >
                    {suggestionBusy && <Loader2 size={15} className="spin" />}
                    Submit suggestion
                  </button>

                  <div className="admin-section-title"><Lightbulb size={16} /> Suggestions ({suggestions.length})</div>
                  {visibleSuggestions.length === 0 && (
                    <p style={{ fontSize: 13, color: '#7ba3ac' }}>No suggestions yet — be the first!</p>
                  )}
                  {visibleSuggestions.map((s) => {
                    const voted = (s.votes || []).includes(currentUser.username);
                    return (
                      <div className="suggestion-card" data-edit-box-id={`suggestion:${s.id}`} key={s.id}>
                        <div className="suggestion-top">
                          <div className="user-row-left clickable-row" onClick={() => openProfile(s.username)}>
                            {avatarNode(s.username, 24, 10)}
                            {s.username}
                          </div>
                          {canManageSuggestion(s) && (
                            <button className="row-del-btn" onClick={() => deleteSuggestion(s.id)} title="Delete suggestion">
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                        <div className="suggestion-text">{s.text}</div>
                        <button
                          className={`like-btn suggestion-vote-btn ${voted ? 'liked' : ''}`}
                          onClick={() => toggleSuggestionVote(s.id)}
                        >
                          <Heart size={14} fill={voted ? '#e0546b' : 'none'} />
                          {(s.votes || []).length > 0 ? (s.votes || []).length : 'Upvote'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {screen === 'updates' && (
                <div className="upload-wrap">
                  {currentUser.isAdmin && (
                    <>
                      <div className="field-label" style={{ marginTop: 0 }}>Post an update</div>
                      <input
                        className="aero-input"
                        placeholder="Title"
                        value={updateDraft.title}
                        onChange={(e) => setUpdateDraft((d) => ({ ...d, title: e.target.value }))}
                      />
                      <textarea
                        className="caption-area"
                        placeholder="What changed?"
                        value={updateDraft.body}
                        onChange={(e) => setUpdateDraft((d) => ({ ...d, body: e.target.value }))}
                      />
                      <button
                        className="aero-btn"
                        style={{ marginTop: 12 }}
                        onClick={submitUpdate}
                        disabled={updateBusy || !updateDraft.title.trim()}
                      >
                        {updateBusy && <Loader2 size={15} className="spin" />}
                        Post update
                      </button>
                    </>
                  )}

                  <div className="admin-section-title" style={{ marginTop: currentUser.isAdmin ? 24 : 0 }}>
                    <Megaphone size={16} /> Updates
                  </div>
                  {visibleUpdates.length === 0 && (
                    <p style={{ fontSize: 13, color: '#7ba3ac' }}>No updates posted yet.</p>
                  )}
                  {visibleUpdates.map((u) => (
                    <div className="update-card" data-edit-box-id={`update:${u.id}`} key={u.id}>
                      <div className="post-top">
                        <div>
                          <div className="post-user-name">{u.title}</div>
                          <div className="post-time">
                            {timeAgo(u.timestamp)} ·{' '}
                            <span className="clickable-text" onClick={() => openProfile(u.author)}>{u.author}</span>
                          </div>
                        </div>
                        {currentUser.isAdmin && (
                          <button className="icon-btn manage-btn" onClick={() => deleteUpdate(u.id)} title="Delete update">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                      {u.body && <div className="post-caption">{u.body}</div>}
                    </div>
                  ))}
                </div>
              )}

              {screen === 'profile' && (
                <div className="profile-wrap">
                  <div className="profile-back-row">
                    <button className="icon-btn detail-back-btn" onClick={goBack}>
                      <ArrowLeft size={18} /> Back
                    </button>
                  </div>

                  {viewedProfile && viewedProfile !== currentUser.username ? (
                    (() => {
                      const u = users.find((x) => x.username === viewedProfile);
                      if (!u) {
                        return (
                          <div className="feed-empty">
                            <div className="r-badge">R</div>
                            <h3>Account not found</h3>
                            <p>This user may have deleted their account.</p>
                          </div>
                        );
                      }
                      const theirPosts = posts
                        .filter((p) => p.username === u.username)
                        .sort((a, b) => b.timestamp - a.timestamp);
                      return (
                        <>
                          {avatarNode(u.username, 84, 30)}
                          <h3 className="profile-name">
                            {u.username}
                            {u.isAdmin && (
                              <span className="tag-pill" style={{ marginLeft: 8 }}><ShieldCheck size={10} /> Admin</span>
                            )}
                          </h3>
                          <p className="switch-line">{theirPosts.length} post{theirPosts.length === 1 ? '' : 's'}</p>
                          {theirPosts.length === 0 ? (
                            <p className="switch-line" style={{ marginTop: 20 }}>No posts yet.</p>
                          ) : (
                            <div className="profile-post-grid">
                              {theirPosts.map((p) => (
                                <div className="profile-grid-thumb" key={p.id} onClick={() => openPost(p.id)}>
                                  <img src={p.image} alt="" />
                                  {p.tag === 'Lumina' && (
                                    <span className="thumb-lumina-badge"><Droplet size={10} color="white" /></span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      );
                    })()
                  ) : (
                    <>
                      <div className="profile-avatar-wrap" onClick={() => avatarInputRef.current?.click()}>
                        {avatarNode(currentUser.username, 84, 30)}
                        <div className="avatar-edit-badge"><ImagePlus size={14} /></div>
                      </div>
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleAvatarSelect}
                      />
                      <h3 className="profile-name">
                        {currentUser.username}
                        {currentUser.isAdmin && (
                          <span className="tag-pill" style={{ marginLeft: 8 }}><ShieldCheck size={10} /> Admin</span>
                        )}
                      </h3>
                      <p className="switch-line">Tap your photo to change it.</p>
                      {avatarBusy && (
                        <p className="switch-line"><Loader2 size={13} className="spin" style={{ verticalAlign: 'middle', marginRight: 4 }} /> Updating photo…</p>
                      )}
                      {profileError && <div className="error-pill" style={{ marginTop: 10 }}>{profileError}</div>}

                      <div className="profile-section">
                        <div className="field-label">Change username</div>
                        <div className="username-edit-row">
                          <input
                            className="aero-input"
                            placeholder={currentUser.username}
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            autoComplete="off"
                          />
                          <button
                            className="aero-btn"
                            onClick={handleChangeUsername}
                            disabled={usernameBusy || !newUsername.trim()}
                            title="Save new username"
                          >
                            {usernameBusy ? <Loader2 size={15} className="spin" /> : <Pencil size={15} />}
                          </button>
                        </div>
                        {usernameError && <div className="error-pill" style={{ marginTop: 8 }}>{usernameError}</div>}
                      </div>

                      <div className="profile-section appearance-section">
                        <div className="appearance-heading"><div><div className="field-label">Appearance</div><p>Adjust the transparency of the glass controls on this device.</p></div><span>{glassStrength}%</span></div>
                        <div className="glass-live-preview" aria-label={`Glass appearance preview at ${glassStrength} percent`}>
                          <div className="preview-sun" /><div className="preview-hill" />
                          <div className="preview-island"><span className="preview-icon"><Droplet size={16} /></span><span><b>Glass preview</b><small>{glassStrength < 55 ? 'Clear and light' : glassStrength < 78 ? 'Balanced glass' : 'Soft and frosted'}</small></span><span className="preview-action"><Plus size={14} /></span></div>
                        </div>
                        <div className={`glass-slider-shell ${glassDragging ? 'is-dragging' : ''}`} style={{ '--slider-position': `${(glassStrength - 35) / 60 * 100}%` }}>
                          <input className="glass-range" type="range" min="35" max="95" step="1" value={glassStrength}
                            aria-label="Glass transparency" onChange={(e) => setGlassStrength(Number(e.target.value))}
                            onPointerDown={() => setGlassDragging(true)} onPointerUp={() => setGlassDragging(false)} onPointerCancel={() => setGlassDragging(false)} onBlur={() => setGlassDragging(false)} />
                        </div>
                        <div className="glass-slider-labels"><span>Clear</span><span>Frosted</span></div>
                      </div>

                      <div className="profile-section">
                        <div className="field-label">Your posts</div>
                        {(() => {
                          const myPosts = posts
                            .filter((p) => p.username === currentUser.username)
                            .sort((a, b) => b.timestamp - a.timestamp);
                          if (myPosts.length === 0) {
                            return <p className="switch-line">You haven't posted anything yet.</p>;
                          }
                          return (
                            <div className="profile-post-grid">
                              {myPosts.map((p) => (
                                <div className="profile-grid-thumb" key={p.id} onClick={() => openPost(p.id)}>
                                  <img src={p.image} alt="" />
                                  {p.tag === 'Lumina' && (
                                    <span className="thumb-lumina-badge"><Droplet size={10} color="white" /></span>
                                  )}
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>

                      <div className="profile-danger-zone">
                        {isLastAdmin(currentUser) ? (
                          <p className="switch-line" style={{ color: '#c14a35' }}>
                            You're the only admin — make someone else an admin before deleting this account.
                          </p>
                        ) : (
                          <>
                            <button
                              className="aero-btn danger-btn"
                              onClick={() => setConfirmDelete({ type: 'self', username: currentUser.username })}
                            >
                              <Trash2 size={15} /> Delete my account
                            </button>
                            <p className="switch-line">This permanently removes your account, posts, and comments.</p>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {screen === 'custom' && customPageId && (
                <div className="custom-page-wrap">
                  <div className="section-heading"><div><span className="eyebrow">CUSTOM SPACE</span><h2 contentEditable={editMode && isOwner} suppressContentEditableWarning onBlur={(e) => renameCustomTab(customPageId, e.currentTarget.textContent)}>{siteConfig.customTabs.find((tab) => tab.id === customPageId)?.label || 'Page'}</h2></div></div>
                  {!siteConfig.customWidgets.some((widget) => widget.placement === customPageId) && <div className="feed-empty"><h3>Nothing here yet</h3><p>Use Edit website → Add box to add content to this page.</p></div>}
                </div>
              )}

              {screen === 'admin' && canEditSite && (
                <div className="admin-wrap">
                  <section className="site-editor">
                    <div className="admin-section-title"><Pencil size={16} /> Site settings <span>{siteConfigStatus}</span></div>
                    <p className="editor-intro">Changes publish to everyone. Jamie is always treated as the owner.</p>
                    <div className="editor-grid">
                      <label>Site name<input value={siteConfig.brandName} onChange={(e) => setSiteConfig((cfg) => ({ ...cfg, brandName: e.target.value }))} onBlur={() => saveSiteConfig(siteConfig)} /></label>
                      <label>Tagline<input value={siteConfig.brandTagline} onChange={(e) => setSiteConfig((cfg) => ({ ...cfg, brandTagline: e.target.value }))} onBlur={() => saveSiteConfig(siteConfig)} /></label>
                      <label>Feed headline<input value={siteConfig.heroTitle} onChange={(e) => setSiteConfig((cfg) => ({ ...cfg, heroTitle: e.target.value }))} onBlur={() => saveSiteConfig(siteConfig)} /></label>
                      <label>Accent colour<input type="color" value={siteConfig.accent} onChange={(e) => updateSiteConfig({ accent: e.target.value })} /></label>
                      <label className="editor-wide">Feed description<textarea value={siteConfig.heroText} onChange={(e) => setSiteConfig((cfg) => ({ ...cfg, heroText: e.target.value }))} onBlur={() => saveSiteConfig(siteConfig)} /></label>
                    </div>
                    <div className="editor-toggles">
                      {[['animations','Animations'],['showDiscover','Discover'],...(!isRums5 ? [['showLumina','Project Lumina']] : []),['showUpdates','Updates'],['showSuggestions','Suggestions']].map(([key,label]) => <button key={key} className={siteConfig[key] ? 'enabled' : ''} onClick={() => updateSiteConfig({ [key]: !siteConfig[key] })}><Check size={14} /> {label}</button>)}
                    </div>
                    <div className="editor-subsection"><h3>Custom navigation tabs</h3><div className="editor-add-row"><input value={tabDraft} onChange={(e) => setTabDraft(e.target.value)} placeholder="New tab name" /><button onClick={addCustomTab}><Plus size={15} /> Add tab</button></div>{siteConfig.customTabs.map((tab) => <div className="editor-item" key={tab.id}><span>{tab.label}</span><button onClick={() => removeCustomTab(tab.id)}><Trash2 size={14} /></button></div>)}</div>
                  </section>
                  <div className="admin-section-title"><Shield size={16} /> Members ({users.length})</div>
                  {users.map((u) => (
                    <div className="user-row" data-edit-box-id={`admin-user:${u.username}`} key={u.username}>
                      <div className="user-row-left clickable-row" onClick={() => openProfile(u.username)}>
                        {avatarNode(u.username, 26, 11)}
                        {u.username}
                      </div>
                      <div className="user-row-right">
                        <button
                          className={`admin-toggle ${u.isAdmin ? 'is-admin' : ''}`}
                          onClick={() => toggleAdmin(u.username)}
                          disabled={u.username === currentUser.username && users.filter((x) => x.isAdmin).length === 1}
                          title={u.username === currentUser.username && users.filter((x) => x.isAdmin).length === 1 ? "Can't remove the last admin" : ''}
                        >
                          {u.isAdmin ? <ShieldCheck size={13} /> : <Shield size={13} />}
                          {u.isAdmin ? 'Admin' : 'Make admin'}
                        </button>
                        {u.username !== currentUser.username && (
                          <button
                            className="row-del-btn"
                            onClick={() => setConfirmDelete({ type: 'admin', username: u.username })}
                            title="Delete account"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="admin-section-title"><Trash2 size={16} /> Posts ({posts.length})</div>
                  {posts.length === 0 && <p style={{ fontSize: 13, color: '#7ba3ac' }}>Nothing posted yet.</p>}
                  {posts.slice().sort((a, b) => b.timestamp - a.timestamp).map((p) => (
                    <div className="admin-post-row" data-edit-box-id={`admin-post:${p.id}`} key={p.id}>
                      <img
                        src={p.image}
                        alt=""
                        style={{ cursor: 'pointer' }}
                        onClick={() => openPost(p.id)}
                      />
                      <div className="admin-post-meta">
                        <b className="clickable-text" onClick={() => openProfile(p.username)}>
                          {p.username}{p.tag === 'Lumina' ? ' · Lumina' : ''}
                        </b>
                        {p.caption ? p.caption.slice(0, 40) : timeAgo(p.timestamp)}
                      </div>
                      <button className="del-btn" onClick={() => deletePost(p.id)}><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              )}

              {screen === 'search' && (
                <div className="search-wrap">
                  <div className="search-bar">
                    <Search size={16} color="#7ba3ac" />
                    <input
                      autoFocus
                      placeholder="Search accounts or posts…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button className="icon-btn" onClick={() => setSearchQuery('')}><X size={15} /></button>
                    )}
                  </div>

                  {!q && <p className="switch-line" style={{ padding: '0 4px' }}>{isRums5 ? 'Search covers all RUMS 5 posts. Tap a result to jump to it.' : 'Search covers all RUMS 4 posts, including Lumina. Tap a result to jump to it.'}</p>}

                  {q && (
                    <>
                      <div className="admin-section-title"><UserIcon size={15} /> Accounts</div>
                      {matchedUsers.length === 0 && <p style={{ fontSize: 13, color: '#7ba3ac' }}>No accounts found.</p>}
                      {matchedUsers.map((u) => (
                        <div className="user-row clickable-row" data-edit-box-id={`search-user:${u.username}`} key={u.username} onClick={() => openProfile(u.username)}>
                          <div className="user-row-left">
                            {avatarNode(u.username, 26, 11)}
                            {u.username}
                          </div>
                          {u.isAdmin && <span className="tag-pill" style={{ background: 'linear-gradient(180deg,#66d3f6,#12a9c9)' }}><ShieldCheck size={10} /> Admin</span>}
                        </div>
                      ))}

                      <div className="admin-section-title"><ImagePlus size={15} /> Posts</div>
                      {matchedPosts.length === 0 && <p style={{ fontSize: 13, color: '#7ba3ac' }}>No posts found.</p>}
                      {matchedPosts.map((p) => (
                        <div className="admin-post-row clickable-row" data-edit-box-id={`search-post:${p.id}`} key={p.id} onClick={() => openPost(p.id)}>
                          <img src={p.image} alt="" />
                          <div className="admin-post-meta">
                            <b>
                              {p.username}
                              {p.tag === 'Lumina' && (
                                <span className="tag-pill" style={{ marginLeft: 6 }}><Droplet size={9} /> Lumina</span>
                              )}
                            </b>
                            {p.caption ? p.caption.slice(0, 50) : timeAgo(p.timestamp)}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="bottom-nav">
              <button className={`nav-btn ${screen === 'feed' ? 'active' : ''}`} onClick={() => setScreen('feed')}>
                <span className="nav-icon-wrap">
                  <Home size={19} />
                  {hasNewPosts && <span className="nav-badge-dot" />}
                </span>
                <span className="nav-label">Feed</span>
              </button>
              {siteConfig.showSuggestions && <button className={`nav-btn ${screen === 'suggestions' ? 'active' : ''}`} onClick={() => { setError(''); setScreen('suggestions'); }}>
                <span className="nav-icon-wrap"><Lightbulb size={19} /></span><span className="nav-label">Ideas</span>
              </button>}
              <button className="nav-upload" onClick={() => { setError(''); setScreen('upload'); }}>
                <Plus size={24} />
              </button>
              {siteConfig.showUpdates && <button className={`nav-btn ${screen === 'updates' ? 'active' : ''}`} onClick={() => { setError(''); setScreen('updates'); }}>
                <span className="nav-icon-wrap"><Megaphone size={19} /></span><span className="nav-label">Updates</span>
              </button>}
              {canEditSite ? (
                <button className={`nav-btn ${screen === 'admin' ? 'active' : ''}`} onClick={() => setScreen('admin')}>
                  <span className="nav-icon-wrap"><ShieldCheck size={19} /></span><span className="nav-label">Admin</span>
                </button>
              ) : (
                <button className="nav-btn nav-placeholder" tabIndex={-1} aria-hidden="true">
                  <ArrowLeft size={19} /> —
                </button>
              )}
            </div>
          </>
        )}

        {confirmDelete && (
          <div className="modal-overlay" onClick={() => !busy && setConfirmDelete(null)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <h4>
                Delete {confirmDelete.type === 'self' ? 'your account' : `@${confirmDelete.username}`}?
              </h4>
              <p>
                This permanently removes {confirmDelete.type === 'self' ? 'your' : 'their'} account, posts,
                and comments across RUMS. This can't be undone.
              </p>
              <div className="modal-actions">
                <button className="modal-btn cancel" onClick={() => setConfirmDelete(null)} disabled={busy}>
                  Cancel
                </button>
                <button className="modal-btn danger" onClick={confirmDeleteAction} disabled={busy}>
                  {busy && <Loader2 size={14} className="spin" />}
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
