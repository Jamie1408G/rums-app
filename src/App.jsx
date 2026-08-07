import { useState, useEffect, useRef } from 'react';
import {
  Heart, MessageCircle, LogOut, ShieldCheck, Shield, User as UserIcon,
  Plus, X, Trash2, ImagePlus, Loader2, Home, Droplet, Send, ArrowLeft, Search, Share2, Check,
} from 'lucide-react';

const USERS_KEY = 'rums-users';
const POSTS_KEY = 'rums-posts';
const SESSION_KEY = 'rums-session';
const TAGS = ['General', 'Lumina'];
const lastSeenKey = (username) => `rums-lastseen-${username}`;
const MENTION_RE = /(@[A-Za-z0-9_]+)/g;

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

function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const maxW = 900;
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
  const [screen, setScreen] = useState('loading');
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
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
  const fileInputRef = useRef(null);
  const commentInputRefs = useRef({});

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll the shared posts store so new posts (and their notification badges)
  // show up without needing to log out/in.
  useEffect(() => {
    if (!currentUser) return;
    const id = setInterval(async () => {
      const p = await safeGet(POSTS_KEY, true);
      if (p) {
        try {
          setPosts(JSON.parse(p.value));
        } catch {
          /* ignore malformed payload */
        }
      }
    }, 15000);
    return () => clearInterval(id);
  }, [currentUser]);

  // Mark the currently-viewed feed tab as "seen" once its newest post is on screen.
  useEffect(() => {
    if (screen !== 'feed' || !currentUser) return;
    const activeTag = feedFilter === 'lumina' ? 'Lumina' : 'General';
    const latest = posts
      .filter((p) => (activeTag === 'Lumina' ? p.tag === 'Lumina' : p.tag !== 'Lumina'))
      .reduce((max, p) => Math.max(max, p.timestamp), 0);
    if (latest > (lastSeen[activeTag] || 0)) {
      saveLastSeen(currentUser.username, { ...lastSeen, [activeTag]: latest });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, feedFilter, posts, currentUser]);

  async function init() {
    try {
      const [u, p, s] = await Promise.all([
        safeGet(USERS_KEY, true),
        safeGet(POSTS_KEY, true),
        safeGet(SESSION_KEY, false),
      ]);
      const loadedUsers = u ? JSON.parse(u.value) : [];
      const loadedPosts = p ? JSON.parse(p.value) : [];
      setUsers(loadedUsers);
      setPosts(loadedPosts);
      if (s) {
        const sess = JSON.parse(s.value);
        const found = loadedUsers.find((x) => x.username === sess.username);
        if (found) {
          setCurrentUser(found);
          await loadLastSeen(found.username);
          setScreen('feed');
          return;
        }
      }
      setScreen('login');
    } catch (e) {
      console.error(e);
      setScreen('login');
    }
  }

  async function loadLastSeen(username) {
    const rec = await safeGet(lastSeenKey(username), false);
    if (rec) {
      try {
        setLastSeen(JSON.parse(rec.value));
        return;
      } catch {
        /* fall through to reseed */
      }
    }
    // First time we've seen this user: don't flag existing posts as "new".
    const now = Date.now();
    await saveLastSeen(username, { General: now, Lumina: now });
  }

  async function saveLastSeen(username, next) {
    setLastSeen(next);
    try {
      await window.storage.set(lastSeenKey(username), JSON.stringify(next), false);
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
      await window.storage.set(POSTS_KEY, JSON.stringify(next), true);
    } catch (e) {
      console.error(e);
      setError('Could not save — try again.');
    }
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
        await saveUsers(next);
        setCurrentUser(newUser);
        await loadLastSeen(newUser.username);
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
        await loadLastSeen(found.username);
        await window.storage.set(SESSION_KEY, JSON.stringify({ username: found.username }), false);
        setScreen('feed');
      }
      setAuthForm({ username: '', password: '' });
    } catch (e) {
      console.error(e);
      setError('Something went wrong. Try again.');
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
      tag,
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
          <span className="mention-tag" key={i}>
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
  const unseenGeneral = currentUser
    ? posts.filter((p) => p.tag !== 'Lumina' && p.timestamp > (lastSeen.General || 0) && p.username !== currentUser.username).length
    : 0;
  const unseenLumina = currentUser
    ? posts.filter((p) => p.tag === 'Lumina' && p.timestamp > (lastSeen.Lumina || 0) && p.username !== currentUser.username).length
    : 0;
  const hasNewPosts = unseenGeneral > 0 || unseenLumina > 0;
  const visiblePosts = posts
    .slice()
    .sort((a, b) => b.timestamp - a.timestamp)
    .filter((p) => (feedFilter === 'lumina' ? p.tag === 'Lumina' : p.tag !== 'Lumina'));

  const q = searchQuery.trim().toLowerCase();
  const matchedUsers = q ? users.filter((u) => u.username.toLowerCase().includes(q)) : [];
  const matchedPosts = q
    ? posts
        .filter((p) => p.username.toLowerCase().includes(q) || (p.caption || '').toLowerCase().includes(q))
        .sort((a, b) => b.timestamp - a.timestamp)
    : [];

  return (
    <div className="aero-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700;800&family=Inter:wght@400;500;600;700&display=swap');

        .aero-root {
          --sky: #4fc3f7;
          --teal: #0fb8a6;
          --deep: #0a3a4d;
          --mist: #eaf8f8;
          --white: #ffffff;
          --sun: #ffcf5c;
          --leaf: #8dd06a;
          --line: #cdeef0;
          min-height: 100%;
          width: 100%;
          background:
            radial-gradient(1200px 400px at 50% -10%, #d7f4ff 0%, transparent 60%),
            linear-gradient(180deg, var(--mist) 0%, #f6fcfb 100%);
          font-family: 'Inter', sans-serif;
          color: var(--deep);
          display: flex;
          justify-content: center;
          position: relative;
        }
        .aero-frame {
          width: 100%;
          max-width: 430px;
          min-height: 640px;
          background: var(--white);
          position: relative;
          box-shadow: 0 0 60px rgba(15, 184, 166, 0.12);
          display: flex;
          flex-direction: column;
        }
        .aero-h1, .aero-brand { font-family: 'Baloo 2', cursive; }

        .aero-header {
          position: sticky; top: 0; z-index: 20;
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 18px;
          background: linear-gradient(180deg, rgba(255,255,255,0.96), rgba(234,248,248,0.9));
          backdrop-filter: blur(6px);
          border-bottom: 1px solid var(--line);
        }
        .aero-brand {
          display: flex; align-items: center; gap: 8px;
          font-weight: 800; font-size: 20px; color: var(--deep);
          letter-spacing: 0.2px;
        }
        .r-badge {
          width: 30px; height: 30px; border-radius: 50%;
          background: linear-gradient(135deg, var(--sky), var(--teal));
          display: flex; align-items: center; justify-content: center;
          box-shadow: inset -3px -3px 6px rgba(0,0,0,0.15), inset 2px 2px 5px rgba(255,255,255,0.6);
          color: white; font-family: 'Baloo 2', cursive; font-weight: 800; font-size: 15px;
        }

        .pill {
          display: flex; align-items: center; gap: 6px;
          background: var(--white);
          border: 1px solid var(--line);
          padding: 6px 10px 6px 12px;
          border-radius: 999px;
          font-size: 13px; font-weight: 600;
          box-shadow: 0 1px 0 rgba(255,255,255,0.8) inset, 0 2px 6px rgba(10,58,77,0.06);
        }
        .icon-btn {
          border: none; background: transparent; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: var(--deep); opacity: 0.75; padding: 4px; border-radius: 8px;
        }
        .icon-btn:hover { opacity: 1; background: var(--mist); }

        .content { flex: 1; overflow-y: auto; padding-bottom: 90px; }

        /* Feed tabs */
        .feed-tabs {
          position: sticky; top: 61px; z-index: 15;
          display: flex; gap: 8px; padding: 10px 14px;
          background: rgba(255,255,255,0.96); backdrop-filter: blur(6px);
          border-bottom: 1px solid var(--line);
        }
        .tab-btn {
          border: 1.5px solid var(--line); background: white; cursor: pointer;
          border-radius: 999px; padding: 7px 14px; font-size: 12.5px; font-weight: 700;
          color: #4a7f8c; display: flex; align-items: center; gap: 5px;
        }
        .tab-btn.active {
          background: linear-gradient(180deg, #66d3f6, #12a9c9); color: white; border: none;
        }
        .lumina-banner {
          margin: 14px 14px 4px; border-radius: 18px; padding: 18px;
          background: linear-gradient(135deg, #dff6ff 0%, #d3f3ee 100%);
          border: 1px solid #bdeaea;
          display: flex; align-items: center; gap: 12px;
        }
        .lumina-banner .droplet-badge {
          width: 40px; height: 40px; border-radius: 50% 50% 50% 4px;
          background: linear-gradient(135deg, var(--sky), var(--teal));
          transform: rotate(45deg); flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          box-shadow: inset -3px -3px 6px rgba(0,0,0,0.15), inset 2px 2px 5px rgba(255,255,255,0.6);
        }
        .lumina-banner .droplet-badge svg { transform: rotate(-45deg); }
        .lumina-banner h4 { margin: 0; font-family: 'Baloo 2', cursive; font-size: 16px; }
        .lumina-banner p { margin: 2px 0 0; font-size: 12px; color: #4a7f8c; }

        .tag-pill {
          display: inline-flex; align-items: center; gap: 4px;
          background: linear-gradient(135deg, var(--sky), var(--teal)); color: white;
          font-size: 10.5px; font-weight: 700; padding: 3px 9px 3px 7px; border-radius: 999px;
          margin-left: 8px;
        }

        /* Auth screen */
        .auth-wrap {
          flex: 1; display: flex; flex-direction: column; align-items: center;
          justify-content: center; padding: 40px 28px; text-align: center;
          background:
            radial-gradient(500px 260px at 50% 0%, #d3f3ff 0%, transparent 65%);
        }
        .auth-logo { width: 66px; height: 66px; border-radius: 50%;
          background: linear-gradient(135deg, var(--sky), var(--teal));
          display: flex; align-items: center; justify-content: center;
          box-shadow: inset -5px -5px 10px rgba(0,0,0,0.18), inset 3px 3px 8px rgba(255,255,255,0.7), 0 10px 24px rgba(15,184,166,0.25);
          margin-bottom: 18px; color: white; font-family: 'Baloo 2', cursive; font-weight: 800; font-size: 30px;
        }
        .auth-title { font-size: 28px; font-weight: 800; margin: 0 0 4px; }
        .auth-sub { font-size: 14px; color: #4a7f8c; margin: 0 0 28px; line-height: 1.4; }
        .auth-form { width: 100%; display: flex; flex-direction: column; gap: 12px; }
        .aero-input {
          width: 100%; box-sizing: border-box;
          border: 1.5px solid var(--line); border-radius: 14px;
          padding: 13px 16px; font-size: 15px; font-family: 'Inter', sans-serif;
          background: var(--white); outline: none; color: var(--deep);
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .aero-input:focus { border-color: var(--teal); box-shadow: 0 0 0 3px rgba(15,184,166,0.15); }
        .aero-btn {
          border: none; cursor: pointer; border-radius: 14px;
          padding: 13px 18px; font-size: 15px; font-weight: 700;
          font-family: 'Inter', sans-serif;
          color: white;
          background: linear-gradient(180deg, #66d3f6 0%, #12a9c9 60%, #0f93b8 100%);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.6), 0 6px 16px rgba(20,150,180,0.35);
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .aero-btn:active { transform: translateY(1px); }
        .aero-btn:disabled { opacity: 0.6; cursor: default; }
        .switch-line { font-size: 13.5px; color: #4a7f8c; margin-top: 4px; }
        .switch-link { color: var(--teal); font-weight: 700; cursor: pointer; text-decoration: underline; }
        .error-pill {
          background: #fff0ee; color: #b5432f; border: 1px solid #ffd4cc;
          padding: 9px 14px; border-radius: 12px; font-size: 13px; font-weight: 500;
          text-align: left;
        }

        /* Feed */
        .feed-empty {
          text-align: center; padding: 70px 30px; color: #5a8892;
        }
        .feed-empty .r-badge { margin: 0 auto 16px; width: 44px; height: 44px; font-size: 20px; }
        .feed-empty h3 { font-family:'Baloo 2', cursive; font-size: 19px; color: var(--deep); margin: 0 0 6px; }
        .feed-empty p { font-size: 13.5px; margin: 0; }

        .post-card {
          margin: 0 0 18px; background: var(--white);
          border-bottom: 1px solid var(--line);
        }
        .post-top {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 14px;
        }
        .post-user { display: flex; align-items: center; gap: 9px; }
        .avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: linear-gradient(135deg, var(--sky), var(--leaf));
          display: flex; align-items: center; justify-content: center;
          color: white; font-weight: 700; font-size: 13px;
          box-shadow: inset -2px -2px 4px rgba(0,0,0,0.15);
        }
        .post-user-name { font-weight: 700; font-size: 13.5px; display: flex; align-items: center; }
        .post-time { font-size: 11px; color: #7ba3ac; }
        .post-img-wrap {
          position: relative; width: 100%; max-height: 520px; overflow: hidden;
          background: var(--mist);
          display: flex; align-items: center; justify-content: center;
        }
        .post-img-wrap img { width: 100%; max-height: 520px; object-fit: contain; display: block; }
        .post-sheen {
          position: absolute; top: 0; left: 0; right: 0; height: 40%;
          background: linear-gradient(180deg, rgba(255,255,255,0.28), rgba(255,255,255,0));
          pointer-events: none;
        }
        .post-actions { display: flex; align-items: center; gap: 4px; padding: 10px 10px 2px; }
        .like-btn, .comment-btn {
          display: flex; align-items: center; gap: 6px; border: none; background: transparent;
          cursor: pointer; padding: 6px 8px; border-radius: 10px; font-size: 13px; font-weight: 600;
          color: var(--deep);
        }
        .like-btn:hover, .comment-btn:hover { background: var(--mist); }
        .like-btn.liked { color: #e0546b; }
        .post-caption { padding: 4px 14px 12px; font-size: 13.5px; line-height: 1.4; }
        .post-caption b { margin-right: 6px; }
        .manage-btn { margin-left: auto; }

        .comments-box { padding: 0 14px 14px; }
        .comment-row {
          display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;
          font-size: 13px; margin-bottom: 6px; line-height: 1.35;
        }
        .comment-text b { margin-right: 6px; }
        .comment-actions { display: flex; align-items: center; gap: 4px; flex-shrink: 0; margin-top: 1px; }
        .comment-like-btn, .comment-del-btn {
          border: none; background: transparent; cursor: pointer; display: flex; align-items: center; gap: 3px;
          color: #8db4bb; font-size: 11px; font-weight: 700; padding: 2px 4px; border-radius: 6px;
        }
        .comment-like-btn:hover, .comment-del-btn:hover { background: var(--mist); }
        .comment-like-btn.liked { color: #e0546b; }
        .comment-del-btn:hover { color: #c14a35; }
        .mention-tag { color: var(--teal); font-weight: 700; }
        .comment-input-wrap { position: relative; margin-top: 8px; }
        .mention-dropdown {
          position: absolute; bottom: 100%; left: 0; right: 0; margin-bottom: 6px;
          background: var(--white); border: 1.5px solid var(--line); border-radius: 14px;
          box-shadow: 0 8px 20px rgba(10,58,77,0.15); overflow: hidden; z-index: 25;
        }
        .mention-option {
          width: 100%; display: flex; align-items: center; gap: 8px; border: none;
          background: var(--white); cursor: pointer; padding: 8px 12px;
          font-size: 13px; font-weight: 600; color: var(--deep); text-align: left;
          font-family: 'Inter', sans-serif;
        }
        .mention-option:hover { background: var(--mist); }
        .tab-badge {
          background: #e0546b; color: white; font-size: 10px; font-weight: 800;
          border-radius: 999px; padding: 1px 6px; line-height: 1.4;
        }
        .nav-icon-wrap { position: relative; display: flex; }
        .nav-badge-dot {
          position: absolute; top: -2px; right: -3px; width: 9px; height: 9px;
          border-radius: 50%; background: #e0546b; border: 2px solid white;
        }
        .comment-input-row { display: flex; gap: 8px; margin-top: 0; }
        .comment-input-row input {
          flex: 1; border: 1.5px solid var(--line); border-radius: 999px;
          padding: 9px 14px; font-size: 13px; outline: none; font-family: 'Inter', sans-serif;
        }
        .comment-input-row input:focus { border-color: var(--teal); }
        .comment-send {
          border: none; background: var(--teal); color: white; border-radius: 50%;
          width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;
          cursor: pointer; flex-shrink: 0;
        }
        .comment-send:disabled { opacity: 0.4; }

        /* Upload */
        .upload-wrap { padding: 20px 18px; }
        .drop-zone {
          border: 2px dashed #a9dde0; border-radius: 18px; background: var(--mist);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 40px 16px; cursor: pointer; text-align: center; gap: 10px;
        }
        .drop-zone p { margin: 0; font-size: 13.5px; color: #4a7f8c; }
        .preview-wrap {
          position: relative; border-radius: 18px; overflow: hidden;
          background: var(--mist); display: flex; align-items: center; justify-content: center;
        }
        .preview-wrap img { width: 100%; display: block; max-height: 400px; object-fit: contain; }
        .preview-clear {
          position: absolute; top: 10px; right: 10px; background: rgba(10,58,77,0.65);
          border: none; color: white; border-radius: 50%; width: 30px; height: 30px;
          display: flex; align-items: center; justify-content: center; cursor: pointer;
        }
        .caption-area {
          width: 100%; box-sizing: border-box; margin-top: 14px;
          border: 1.5px solid var(--line); border-radius: 14px; padding: 12px 14px;
          font-family: 'Inter', sans-serif; font-size: 14px; resize: none; outline: none;
          min-height: 70px;
        }
        .caption-area:focus { border-color: var(--teal); }
        .field-label { font-size: 12px; font-weight: 700; color: #4a7f8c; margin: 16px 0 8px; text-transform: uppercase; letter-spacing: 0.4px; }
        .tag-select { display: flex; gap: 8px; }
        .tag-chip {
          flex: 1; border: 1.5px solid var(--line); background: white; cursor: pointer;
          border-radius: 14px; padding: 12px; font-size: 13.5px; font-weight: 700;
          color: #4a7f8c; display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .tag-chip.active { background: linear-gradient(135deg, var(--sky), var(--teal)); color: white; border: none; }

        /* Search */
        .search-wrap { padding: 16px 18px; }
        .search-bar {
          display: flex; align-items: center; gap: 8px;
          border: 1.5px solid var(--line); border-radius: 999px;
          padding: 10px 14px; background: var(--mist); margin-bottom: 14px;
        }
        .search-bar input {
          flex: 1; border: none; background: transparent; outline: none;
          font-family: 'Inter', sans-serif; font-size: 14px; color: var(--deep);
        }

        /* Admin */
        .admin-wrap { padding: 16px 18px; }
        .admin-section-title {
          font-family: 'Baloo 2', cursive; font-size: 15px; margin: 18px 0 10px; color: var(--deep);
          display: flex; align-items: center; gap: 6px;
        }
        .user-row {
          display: flex; align-items: center; justify-content: space-between;
          background: var(--mist); border-radius: 14px; padding: 10px 14px; margin-bottom: 8px;
        }
        .user-row-left { display: flex; align-items: center; gap: 10px; font-size: 13.5px; font-weight: 600; }
        .admin-toggle {
          border: 1.5px solid var(--line); background: white; border-radius: 999px;
          padding: 5px 12px; font-size: 12px; font-weight: 700; cursor: pointer;
          display: flex; align-items: center; gap: 5px; color: var(--deep);
        }
        .admin-toggle.is-admin { background: linear-gradient(180deg,#66d3f6,#12a9c9); color: white; border: none; }
        .admin-post-row {
          display: flex; align-items: center; gap: 10px; background: var(--mist);
          border-radius: 14px; padding: 8px; margin-bottom: 8px;
        }
        .admin-post-row img { width: 44px; height: 44px; border-radius: 10px; object-fit: cover; }
        .admin-post-meta { flex: 1; font-size: 12.5px; }
        .admin-post-meta b { display: flex; align-items: center; font-size: 13px; }
        .del-btn {
          border: none; background: #fff0ee; color: #c14a35; border-radius: 10px;
          width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer;
        }

        /* Bottom nav */
        .bottom-nav {
          position: absolute; bottom: 0; left: 0; right: 0; z-index: 30;
          display: flex; align-items: center; justify-content: space-around;
          padding: 10px 20px calc(10px + env(safe-area-inset-bottom));
          background: linear-gradient(0deg, rgba(255,255,255,0.98) 60%, rgba(234,248,248,0.85));
          backdrop-filter: blur(8px);
          border-top: 1px solid var(--line);
          box-shadow: 0 -6px 18px rgba(10,58,77,0.06);
        }
        .nav-btn {
          border: none; background: transparent; cursor: pointer;
          display: flex; flex-direction: column; align-items: center; gap: 3px;
          color: #8db4bb; font-size: 10.5px; font-weight: 700; padding: 4px 10px;
        }
        .nav-btn.active { color: var(--teal); }
        .nav-upload {
          width: 52px; height: 52px; border-radius: 50%;
          background: linear-gradient(180deg, #6fdcf9, #0fb8a6);
          display: flex; align-items: center; justify-content: center; color: white;
          box-shadow: inset 0 2px 3px rgba(255,255,255,0.6), 0 8px 18px rgba(15,184,166,0.4);
          margin-top: -22px; border: 3px solid white;
        }
        .center-loading { flex:1; display:flex; align-items:center; justify-content:center; color:#7ba3ac; gap: 8px; font-size: 14px; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="aero-frame">
        {screen === 'loading' && (
          <div className="center-loading">
            <Loader2 size={18} className="spin" /> Loading RUMS…
          </div>
        )}

        {(screen === 'login' || screen === 'signup') && (
          <div className="auth-wrap">
            <div className="auth-logo">R</div>
            <h1 className="auth-title">RUMS</h1>
            <p className="auth-sub">The server's photo feed — share builds and screenshots from anywhere on RUMS, with a special corner for Lumina.</p>
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

        {screen !== 'loading' && screen !== 'login' && screen !== 'signup' && currentUser && (
          <>
            <div className="aero-header">
              <div className="aero-brand">
                <div className="r-badge">R</div>
                RUMS
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button className="icon-btn" onClick={() => setScreen('search')} title="Search">
                  <Search size={18} />
                </button>
                <div className="pill">
                  {currentUser.isAdmin ? <ShieldCheck size={14} color="#0fb8a6" /> : <UserIcon size={14} />}
                  {currentUser.username}
                </div>
                <button className="icon-btn" onClick={handleLogout} title="Log out">
                  <LogOut size={18} />
                </button>
              </div>
            </div>

            {screen === 'feed' && (
              <div className="feed-tabs">
                <button className={`tab-btn ${feedFilter === 'all' ? 'active' : ''}`} onClick={() => setFeedFilter('all')}>
                  All RUMS
                  {unseenGeneral > 0 && <span className="tab-badge">{unseenGeneral}</span>}
                </button>
                <button className={`tab-btn ${feedFilter === 'lumina' ? 'active' : ''}`} onClick={() => setFeedFilter('lumina')}>
                  <Droplet size={12} /> Lumina
                  {unseenLumina > 0 && <span className="tab-badge">{unseenLumina}</span>}
                </button>
              </div>
            )}

            <div className="content">
              {error && (
                <div style={{ padding: '10px 16px 0' }}>
                  <div className="error-pill">{error}</div>
                </div>
              )}

              {screen === 'feed' && (
                <>
                  {feedFilter === 'lumina' && (
                    <div className="lumina-banner">
                      <div className="droplet-badge"><Droplet size={18} color="white" /></div>
                      <div>
                        <h4>Lumina</h4>
                        <p>Screenshots from the city district, in one place.</p>
                      </div>
                    </div>
                  )}
                  {visiblePosts.length === 0 ? (
                    <div className="feed-empty">
                      <div className="r-badge">R</div>
                      <h3>{feedFilter === 'lumina' ? 'No Lumina posts yet' : 'No posts yet'}</h3>
                      <p>{feedFilter === 'lumina' ? 'Be the first to share a view of Lumina.' : 'Be the first to share something from RUMS.'}</p>
                    </div>
                  ) : (
                    visiblePosts.map((post) => {
                      const liked = post.likes.includes(currentUser.username);
                      const showComments = !!openComments[post.id];
                      return (
                        <div className="post-card" key={post.id}>
                          <div className="post-top">
                            <div className="post-user">
                              <div className="avatar">{post.username.slice(0, 2).toUpperCase()}</div>
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
                              <button className="icon-btn manage-btn" onClick={() => deletePost(post.id)} title="Delete post">
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
                              <b>{post.username}</b>{post.caption}
                            </div>
                          )}
                          {showComments && (
                            <div className="comments-box">
                              {post.comments.map((c) => {
                                const cLiked = (c.likes || []).includes(currentUser.username);
                                return (
                                  <div className="comment-row" key={c.id}>
                                    <div className="comment-text"><b>{c.username}</b>{renderCommentText(c.text)}</div>
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
                                        <div className="avatar" style={{ width: 22, height: 22, fontSize: 9 }}>
                                          {u.username.slice(0, 2).toUpperCase()}
                                        </div>
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
                    })
                  )}
                </>
              )}

              {screen === 'upload' && (
                <div className="upload-wrap">
                  {!uploadPreview ? (
                    <div className="drop-zone" onClick={() => fileInputRef.current?.click()}>
                      <ImagePlus size={30} color="#0fb8a6" />
                      <p><b>Tap to choose a screenshot</b><br />JPG or PNG from anywhere on RUMS</p>
                    </div>
                  ) : (
                    <div className="preview-wrap">
                      <img src={uploadPreview} alt="preview" />
                      <button className="preview-clear" onClick={() => setUploadPreview(null)}><X size={16} /></button>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileSelect} />

                  <div className="field-label">Where's this from?</div>
                  <div className="tag-select">
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
                  </div>

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

              {screen === 'admin' && currentUser.isAdmin && (
                <div className="admin-wrap">
                  <div className="admin-section-title"><Shield size={16} /> Members ({users.length})</div>
                  {users.map((u) => (
                    <div className="user-row" key={u.username}>
                      <div className="user-row-left">
                        <div className="avatar" style={{ width: 26, height: 26, fontSize: 11 }}>{u.username.slice(0, 2).toUpperCase()}</div>
                        {u.username}
                      </div>
                      <button
                        className={`admin-toggle ${u.isAdmin ? 'is-admin' : ''}`}
                        onClick={() => toggleAdmin(u.username)}
                        disabled={u.username === currentUser.username && users.filter((x) => x.isAdmin).length === 1}
                        title={u.username === currentUser.username && users.filter((x) => x.isAdmin).length === 1 ? "Can't remove the last admin" : ''}
                      >
                        {u.isAdmin ? <ShieldCheck size={13} /> : <Shield size={13} />}
                        {u.isAdmin ? 'Admin' : 'Make admin'}
                      </button>
                    </div>
                  ))}

                  <div className="admin-section-title"><Trash2 size={16} /> Posts ({posts.length})</div>
                  {posts.length === 0 && <p style={{ fontSize: 13, color: '#7ba3ac' }}>Nothing posted yet.</p>}
                  {posts.slice().sort((a, b) => b.timestamp - a.timestamp).map((p) => (
                    <div className="admin-post-row" key={p.id}>
                      <img src={p.image} alt="" />
                      <div className="admin-post-meta">
                        <b>{p.username}{p.tag === 'Lumina' ? ' · Lumina' : ''}</b>
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

                  {!q && <p className="switch-line" style={{ padding: '0 4px' }}>Search covers all posts on RUMS, including Lumina.</p>}

                  {q && (
                    <>
                      <div className="admin-section-title"><UserIcon size={15} /> Accounts</div>
                      {matchedUsers.length === 0 && <p style={{ fontSize: 13, color: '#7ba3ac' }}>No accounts found.</p>}
                      {matchedUsers.map((u) => (
                        <div className="user-row" key={u.username}>
                          <div className="user-row-left">
                            <div className="avatar" style={{ width: 26, height: 26, fontSize: 11 }}>{u.username.slice(0, 2).toUpperCase()}</div>
                            {u.username}
                          </div>
                          {u.isAdmin && <span className="tag-pill" style={{ background: 'linear-gradient(180deg,#66d3f6,#12a9c9)' }}><ShieldCheck size={10} /> Admin</span>}
                        </div>
                      ))}

                      <div className="admin-section-title"><ImagePlus size={15} /> Posts</div>
                      {matchedPosts.length === 0 && <p style={{ fontSize: 13, color: '#7ba3ac' }}>No posts found.</p>}
                      {matchedPosts.map((p) => (
                        <div className="admin-post-row" key={p.id}>
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
                  <Home size={20} />
                  {hasNewPosts && <span className="nav-badge-dot" />}
                </span>
                Feed
              </button>
              <button className="nav-upload" onClick={() => { setError(''); setScreen('upload'); }}>
                <Plus size={24} />
              </button>
              {currentUser.isAdmin ? (
                <button className={`nav-btn ${screen === 'admin' ? 'active' : ''}`} onClick={() => setScreen('admin')}>
                  <ShieldCheck size={20} /> Admin
                </button>
              ) : (
                <button className="nav-btn" onClick={() => setScreen('feed')} style={{ visibility: 'hidden' }}>
                  <ArrowLeft size={20} /> —
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
