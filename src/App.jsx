import { useState, useEffect, useRef } from 'react';
import {
  Heart, MessageCircle, LogOut, ShieldCheck, Shield, User as UserIcon,
  Plus, X, Trash2, ImagePlus, Loader2, Home, Droplet, Send, ArrowLeft, Search, Share2, Check,
  Lightbulb, Megaphone, Pencil,
} from 'lucide-react';

const USERS_KEY = 'rums-users';
const POSTS_KEY = 'rums-posts';
const SESSION_KEY = 'rums-session';
const SUGGESTIONS_KEY = 'rums-suggestions';
const UPDATES_KEY = 'rums-updates';
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
  const [screen, setScreen] = useState('loading');
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
  const [viewedProfile, setViewedProfile] = useState(null); // username being viewed, or null = own profile
  const [viewingPostId, setViewingPostId] = useState(null);
  const [navStack, setNavStack] = useState([]);
  const fileInputRef = useRef(null);
  const commentInputRefs = useRef({});
  const avatarInputRef = useRef(null);

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll the shared stores so new posts/suggestions/updates (and their
  // notification badges) show up without needing to log out/in, and so an
  // account deleted elsewhere (by an admin, or by the user themself on
  // another device) gets logged out here too.
  useEffect(() => {
    if (!currentUser) return;
    const id = setInterval(async () => {
      const [p, u, sg, up] = await Promise.all([
        safeGet(POSTS_KEY, true),
        safeGet(USERS_KEY, true),
        safeGet(SUGGESTIONS_KEY, true),
        safeGet(UPDATES_KEY, true),
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
      const [u, p, s, sg, up] = await Promise.all([
        safeGet(USERS_KEY, true),
        safeGet(POSTS_KEY, true),
        safeGet(SESSION_KEY, false),
        safeGet(SUGGESTIONS_KEY, true),
        safeGet(UPDATES_KEY, true),
      ]);
      const loadedUsers = u ? JSON.parse(u.value) : [];
      const loadedPosts = p ? JSON.parse(p.value) : [];
      setUsers(loadedUsers);
      setPosts(loadedPosts);
      setSuggestions(sg ? JSON.parse(sg.value) : []);
      setUpdates(up ? JSON.parse(up.value) : []);
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

  async function saveSuggestions(next) {
    setSuggestions(next);
    try {
      await window.storage.set(SUGGESTIONS_KEY, JSON.stringify(next), true);
    } catch (e) {
      console.error(e);
      setError('Could not save — try again.');
    }
  }

  async function saveUpdates(next) {
    setUpdates(next);
    try {
      await window.storage.set(UPDATES_KEY, JSON.stringify(next), true);
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
    try { await window.storage.delete(lastSeenKey(username), false); } catch { /* ignore */ }
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
        const rec = await safeGet(lastSeenKey(oldUsername), false);
        if (rec) {
          await window.storage.set(lastSeenKey(trimmed), rec.value, false);
          await window.storage.delete(lastSeenKey(oldUsername), false);
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

  const visibleSuggestions = suggestions
    .slice()
    .sort((a, b) => (b.votes?.length || 0) - (a.votes?.length || 0) || b.timestamp - a.timestamp);

  const visibleUpdates = updates.slice().sort((a, b) => b.timestamp - a.timestamp);

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
      <div className="post-card" key={post.id}>
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
        .pill-btn { cursor: pointer; font-family: 'Inter', sans-serif; color: var(--deep); }
        .pill-btn:active { transform: translateY(1px); }
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
        .lumina-banner.clickable-row { cursor: pointer; }
        .lumina-banner.clickable-row:active { transform: translateY(1px); }
        .lumina-banner-arrow {
          margin-left: auto; flex-shrink: 0; font-size: 11px; font-weight: 700;
          color: var(--teal); white-space: nowrap;
        }

        /* Lumina about page */
        .lumina-page { padding: 4px 4px 16px; }
        .lumina-hero {
          margin: 10px 0 16px; padding: 28px 20px 26px; border-radius: 24px;
          background: linear-gradient(160deg, #bfe9fb 0%, #6fc9ea 55%, #2fa9cf 100%);
          text-align: center; color: white; position: relative; overflow: hidden;
          box-shadow: 0 12px 26px rgba(15, 140, 166, 0.22);
        }
        .lumina-hero::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(240px 120px at 15% 0%, rgba(255,255,255,0.55), transparent 60%);
          pointer-events: none;
        }
        .lumina-hero-badge {
          display: inline-flex; align-items: center; justify-content: center;
          background: white; color: var(--teal); font-family: 'Baloo 2', cursive;
          font-weight: 800; font-size: 13px; padding: 6px 16px; border-radius: 999px;
          box-shadow: 0 2px 6px rgba(10,58,77,0.15); position: relative; z-index: 1;
        }
        .lumina-hero h2 {
          font-family: 'Baloo 2', cursive; font-size: 27px; margin: 14px 0 4px;
          position: relative; z-index: 1;
        }
        .lumina-hero p {
          margin: 0; font-size: 13px; opacity: 0.92; position: relative; z-index: 1;
        }

        .lumina-motto-card {
          margin: 0 0 16px; padding: 20px; border-radius: 18px; text-align: center;
          background: linear-gradient(135deg, #eafcff 0%, #e2f7ef 100%);
          border: 1px solid var(--line);
        }
        .lumina-motto-words {
          font-family: 'Baloo 2', cursive; font-weight: 700; font-size: 14px;
          color: var(--teal); letter-spacing: 0.4px; text-transform: uppercase;
        }
        .lumina-motto-card h3 {
          font-family: 'Baloo 2', cursive; font-size: 21px; margin: 6px 0 0; color: var(--deep);
        }

        .metro-card {
          padding: 22px 20px 20px; border-radius: 20px;
          background: linear-gradient(165deg, #8fdcf4 0%, #35b4dd 100%);
          box-shadow: 0 10px 22px rgba(15, 140, 166, 0.2);
        }
        .metro-card-title {
          display: flex; align-items: center; gap: 8px; margin-bottom: 4px;
          font-family: 'Baloo 2', cursive; font-weight: 800; font-size: 15px; color: white;
        }
        .metro-card-sub { font-size: 12px; color: rgba(255,255,255,0.85); margin: 0 0 16px; }
        .metro-badge {
          display: inline-flex; align-items: center; justify-content: center;
          background: white; color: var(--teal); font-family: 'Baloo 2', cursive;
          font-weight: 800; font-size: 12px; padding: 4px 14px; border-radius: 999px;
          box-shadow: 0 2px 5px rgba(10,58,77,0.15);
        }
        .metro-stops { margin: 4px 0 4px 6px; }
        .metro-stop { display: flex; align-items: center; gap: 14px; position: relative; min-height: 46px; }
        .metro-stop:not(:last-child)::after {
          content: ''; position: absolute; left: 7px; top: 24px; width: 2px; bottom: -2px;
          background: rgba(255,255,255,0.75);
        }
        .metro-stop-dot {
          width: 16px; height: 16px; border-radius: 50%; background: white;
          box-shadow: inset -2px -2px 4px rgba(0,0,0,0.12), 0 2px 4px rgba(10,58,77,0.2);
          flex-shrink: 0; position: relative; z-index: 1;
        }
        .metro-stop-name {
          font-family: 'Baloo 2', cursive; font-weight: 700; font-size: 15.5px; color: white;
        }

        .tag-pill {
          display: inline-flex; align-items: center; gap: 4px;
          background: linear-gradient(135deg, var(--sky), var(--teal)); color: white;
          font-size: 10.5px; font-weight: 700; padding: 3px 9px 3px 7px; border-radius: 999px;
          margin-left: 8px;
        }

        /* Clickable usernames / rows that navigate to a profile or post */
        .clickable-text { cursor: pointer; }
        .clickable-text:hover { text-decoration: underline; }
        .clickable-row { cursor: pointer; }
        .clickable-row:hover { opacity: 0.75; }

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
        .avatar-img { object-fit: cover; background: var(--mist); box-shadow: none; flex-shrink: 0; }
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
        .user-row-right { display: flex; align-items: center; gap: 6px; }
        .row-del-btn {
          border: none; background: #fff0ee; color: #c14a35; border-radius: 10px;
          width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer;
          flex-shrink: 0;
        }
        .row-del-btn:hover { background: #ffe0da; }
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

        /* Profile */
        .profile-wrap {
          padding: 34px 24px; display: flex; flex-direction: column; align-items: center; text-align: center;
        }
        .profile-back-row { align-self: flex-start; margin-bottom: 6px; }
        .profile-avatar-wrap { position: relative; cursor: pointer; }
        .profile-avatar-wrap .avatar, .profile-avatar-wrap .avatar-img {
          box-shadow: inset -5px -5px 10px rgba(0,0,0,0.18), inset 3px 3px 8px rgba(255,255,255,0.7), 0 10px 24px rgba(15,184,166,0.25);
        }
        .avatar-edit-badge {
          position: absolute; bottom: -2px; right: -2px; width: 28px; height: 28px; border-radius: 50%;
          background: var(--teal); color: white; display: flex; align-items: center; justify-content: center;
          border: 3px solid white;
        }
        .profile-name {
          font-family: 'Baloo 2', cursive; font-size: 19px; margin: 16px 0 2px;
          display: flex; align-items: center; justify-content: center;
        }
        .profile-section {
          width: 100%; text-align: left; margin-top: 26px;
        }
        .profile-section .field-label { margin-top: 0; }
        .username-edit-row { display: flex; gap: 8px; }
        .username-edit-row .aero-input { flex: 1; }
        .username-edit-row .aero-btn { width: auto; padding-left: 16px; padding-right: 16px; flex-shrink: 0; }
        .profile-danger-zone { margin-top: 30px; width: 100%; display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .danger-btn {
          background: linear-gradient(180deg, #f2806e 0%, #c14a35 100%) !important;
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.4), 0 6px 16px rgba(193,74,53,0.35) !important;
          width: auto; padding-left: 22px; padding-right: 22px;
        }
        .profile-post-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px;
          width: 100%; margin-top: 20px;
        }
        .profile-grid-thumb {
          position: relative; aspect-ratio: 1; border-radius: 10px; overflow: hidden;
          cursor: pointer; background: var(--mist);
        }
        .profile-grid-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .profile-grid-thumb:hover img { opacity: 0.85; }
        .thumb-lumina-badge {
          position: absolute; bottom: 4px; right: 4px; width: 18px; height: 18px; border-radius: 50%;
          background: linear-gradient(135deg, var(--sky), var(--teal));
          display: flex; align-items: center; justify-content: center;
        }

        /* Suggestions & updates */
        .suggestion-card {
          background: var(--mist); border-radius: 14px; padding: 12px 14px; margin-bottom: 10px;
          display: flex; flex-direction: column; gap: 8px;
        }
        .suggestion-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
        .suggestion-text { font-size: 13.5px; line-height: 1.4; }
        .suggestion-vote-btn {
          align-self: flex-start; padding: 4px 10px; border-radius: 999px; background: var(--white);
          border: 1.5px solid var(--line);
        }
        .update-card {
          border: 1px solid var(--line); border-radius: 16px; margin-bottom: 12px; overflow: hidden;
        }

        /* Delete confirmation modal */
        .modal-overlay {
          position: absolute; inset: 0; background: rgba(10,58,77,0.45);
          display: flex; align-items: center; justify-content: center; z-index: 100; padding: 24px;
        }
        .modal-card {
          background: var(--white); border-radius: 18px; padding: 22px; max-width: 320px; width: 100%;
          box-shadow: 0 20px 50px rgba(10,58,77,0.3);
        }
        .modal-card h4 { margin: 0 0 8px; font-family: 'Baloo 2', cursive; font-size: 17px; color: var(--deep); }
        .modal-card p { margin: 0 0 18px; font-size: 13.5px; color: #4a7f8c; line-height: 1.4; }
        .modal-actions { display: flex; gap: 10px; }
        .modal-btn {
          flex: 1; border: none; border-radius: 12px; padding: 11px; font-size: 13.5px; font-weight: 700;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;
          font-family: 'Inter', sans-serif;
        }
        .modal-btn.cancel { background: var(--mist); color: var(--deep); }
        .modal-btn.danger { background: linear-gradient(180deg, #f2806e, #c14a35); color: white; }
        .modal-btn:disabled { opacity: 0.6; cursor: default; }

        /* Post detail */
        .detail-back-row { padding: 14px 14px 0; }
        .detail-back-btn { display: flex; align-items: center; gap: 6px; font-size: 13.5px; font-weight: 700; }

        /* Bottom nav */
        .bottom-nav {
          position: absolute; bottom: 0; left: 0; right: 0; z-index: 30;
          display: flex; align-items: center; justify-content: space-around;
          padding: 10px 12px calc(10px + env(safe-area-inset-bottom));
          background: linear-gradient(0deg, rgba(255,255,255,0.98) 60%, rgba(234,248,248,0.85));
          backdrop-filter: blur(8px);
          border-top: 1px solid var(--line);
          box-shadow: 0 -6px 18px rgba(10,58,77,0.06);
        }
        .nav-btn {
          border: none; background: transparent; cursor: pointer;
          display: flex; flex-direction: column; align-items: center; gap: 3px;
          color: #8db4bb; font-size: 10px; font-weight: 700; padding: 4px 6px;
        }
        .nav-btn.active { color: var(--teal); }
        .nav-upload {
          width: 52px; height: 52px; border-radius: 50%;
          background: linear-gradient(180deg, #6fdcf9, #0fb8a6);
          display: flex; align-items: center; justify-content: center; color: white;
          box-shadow: inset 0 2px 3px rgba(255,255,255,0.6), 0 8px 18px rgba(15,184,166,0.4);
          margin-top: -22px; border: 3px solid white; flex-shrink: 0;
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
                <button className="pill pill-btn" onClick={openOwnProfile} title="Your profile">
                  {avatarNode(currentUser.username, 18, 8)}
                  {currentUser.username}
                  {currentUser.isAdmin && <ShieldCheck size={13} color="#0fb8a6" />}
                </button>
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
                    <div className="lumina-banner clickable-row" onClick={openLumina}>
                      <div className="droplet-badge"><Droplet size={18} color="white" /></div>
                      <div>
                        <h4>Lumina</h4>
                        <p>Screenshots from the city district, in one place.</p>
                      </div>
                      <span className="lumina-banner-arrow">About the city →</span>
                    </div>
                  )}
                  {visiblePosts.length === 0 ? (
                    <div className="feed-empty">
                      <div className="r-badge">R</div>
                      <h3>{feedFilter === 'lumina' ? 'No Lumina posts yet' : 'No posts yet'}</h3>
                      <p>{feedFilter === 'lumina' ? 'Be the first to share a view of Lumina.' : 'Be the first to share something from RUMS.'}</p>
                    </div>
                  ) : (
                    visiblePosts.map((post) => renderPost(post))
                  )}
                </>
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

              {screen === 'lumina' && (
                <div className="lumina-page">
                  <div className="detail-back-row">
                    <button className="icon-btn detail-back-btn" onClick={goBack}>
                      <ArrowLeft size={18} /> Back
                    </button>
                  </div>

                  <div className="lumina-hero">
                    <span className="lumina-hero-badge">RUMS City Project</span>
                    <h2>Project Lumina</h2>
                    <p>The city district built into the server — and the corner of RUMS that's all about it.</p>
                  </div>

                  <div className="lumina-motto-card">
                    <div className="lumina-motto-words">Green, Free, Utopian</div>
                    <h3>That's Lumina's motto</h3>
                  </div>

                  <div className="metro-card">
                    <div className="metro-card-title"><Droplet size={16} /> metro</div>
                    <p className="metro-card-sub">Lumina's core spine</p>
                    <div className="metro-stops">
                      <span className="metro-badge">metro</span>
                      {['Lumen', 'Luminelia', 'Luminarra'].map((name) => (
                        <div className="metro-stop" key={name}>
                          <span className="metro-stop-dot" />
                          <span className="metro-stop-name">{name}</span>
                        </div>
                      ))}
                      <span className="metro-badge">metro</span>
                    </div>
                  </div>
                </div>
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
                      <div className="suggestion-card" key={s.id}>
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
                    <div className="update-card" key={u.id}>
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

              {screen === 'admin' && currentUser.isAdmin && (
                <div className="admin-wrap">
                  <div className="admin-section-title"><Shield size={16} /> Members ({users.length})</div>
                  {users.map((u) => (
                    <div className="user-row" key={u.username}>
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
                    <div className="admin-post-row" key={p.id}>
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

                  {!q && <p className="switch-line" style={{ padding: '0 4px' }}>Search covers all posts on RUMS, including Lumina. Tap a result to jump to it.</p>}

                  {q && (
                    <>
                      <div className="admin-section-title"><UserIcon size={15} /> Accounts</div>
                      {matchedUsers.length === 0 && <p style={{ fontSize: 13, color: '#7ba3ac' }}>No accounts found.</p>}
                      {matchedUsers.map((u) => (
                        <div className="user-row clickable-row" key={u.username} onClick={() => openProfile(u.username)}>
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
                        <div className="admin-post-row clickable-row" key={p.id} onClick={() => openPost(p.id)}>
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
                Feed
              </button>
              <button className={`nav-btn ${screen === 'suggestions' ? 'active' : ''}`} onClick={() => { setError(''); setScreen('suggestions'); }}>
                <Lightbulb size={19} /> Ideas
              </button>
              <button className="nav-upload" onClick={() => { setError(''); setScreen('upload'); }}>
                <Plus size={24} />
              </button>
              <button className={`nav-btn ${screen === 'updates' ? 'active' : ''}`} onClick={() => { setError(''); setScreen('updates'); }}>
                <Megaphone size={19} /> Updates
              </button>
              {currentUser.isAdmin ? (
                <button className={`nav-btn ${screen === 'admin' ? 'active' : ''}`} onClick={() => setScreen('admin')}>
                  <ShieldCheck size={19} /> Admin
                </button>
              ) : (
                <button className="nav-btn" onClick={() => setScreen('feed')} style={{ visibility: 'hidden' }}>
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
