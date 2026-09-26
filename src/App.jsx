import { useState, useEffect, useRef } from 'react';
import './legacy.css';
import './redesign.css';
import {
  Heart, MessageCircle, SmilePlus, Star, LogOut, ShieldCheck, Shield, User as UserIcon, Menu,
  Plus, X, Trash2, ImagePlus, Loader2, Home, Droplet, Send, ArrowLeft, Search, Share2, Check,
  Lightbulb, Megaphone, Newspaper, Pencil, Video, Link2,
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
const LUMINA_POSTS_KEY = 'rums-lumina-posts';
const PLATFORM_NAME = 'RUMS Plaza';
const THEME_STORAGE_KEY = 'rums-plaza-theme';
const UPDATE_SEEN_KEY = 'rums-plaza-last-build';
const UPDATE_SCREEN_KEY = 'rums-plaza-update-screen';
const UPDATE_RELOAD_KEY = 'rums-plaza-update-reload';
const UPDATE_SCREEN_MS = 10000;
const UPDATE_AUDIO_TRACKS = [
  { id: 'url-lake', src: '/audio/update-url-lake.mp3', title: 'URL 湖', artist: 'Webinar™' },
  { id: 'warmpop', src: '/audio/update-warmpop.mp3', title: 'Warmpop', artist: 'ESPRIT 空想, George Clanton' },
  { id: 'new-look', src: '/audio/update-new-look.mp3', title: 'New Look - Wii U Mii Maker Lofi Mix', artist: 'Secret Potion' },
  { id: 'lotus-waters', src: '/audio/update-lotus-waters.mp3', title: 'lotus waters (nightcore sped up)', artist: 'yume 2kki' },
  { id: 'xscape', src: '/audio/update-xscape.mp3', title: 'xscape', artist: '13 Miles' },
];
const UPDATE_AUDIO_TRACK_IDS = UPDATE_AUDIO_TRACKS.map((track) => track.id);
const pickUpdateAudioTrack = () => UPDATE_AUDIO_TRACK_IDS[Math.floor(Math.random() * UPDATE_AUDIO_TRACK_IDS.length)];

const TUTORIAL_VERSION = 21;
const JAMIE_TUTORIAL_VERSION = 21;
// TEMP while the interactive tutorial is still being developed: bump both versions on every tutorial update.
const ROBLOX_THEMES = [
  { id: 'roblox2008', name: 'Roblox 2008', year: '2008', description: 'Classic Virtual Playworld portal with blue bars, framed modules and early-web controls', swatches: ['#d8e8f8', '#4e86b8', '#ffffff'] },
  { id: 'roblox2010', name: 'Roblox 2010', year: '2010', description: 'Sky-blue classic site with framed dashboard modules, blue tabs and bevelled buttons', swatches: ['#dcecf9', '#4e86b8', '#f6c33d'] },
  { id: 'roblox2014', name: 'Roblox 2014', year: '2014', description: 'Blue top navigation, grey sidebar, global search and clean white content canvas', swatches: ['#f3f3f3', '#2d6ca2', '#d8d8d8'] },
  { id: 'roblox2016', name: 'Roblox 2016', year: '2016', description: 'Grey dashboard, white cards, bright cyan actions and the classic mid-2010s home layout', swatches: ['#e3e3e3', '#00a2ff', '#ffffff'] },
  { id: 'roblox2017', name: 'Roblox 2017', year: '2017', description: 'Post-rebrand blue navigation, crisp white cards, game-grid UI and lighter modern spacing', swatches: ['#f2f2f2', '#0074bd', '#e2231a'] },
  { id: 'roblox2020', name: 'Roblox 2020', year: '2020', description: 'Modern light Roblox web UI with soft grey surfaces, minimal borders and restrained controls', swatches: ['#f2f4f5', '#ffffff', '#00b06f'] },
  { id: 'roblox2026', name: 'Roblox 2026', year: '2026', description: 'Current light Roblox Home UI: icon rail, pale search, bold sections, social circles and image-first discovery', swatches: ['#ffffff', '#f2f3f5', '#111111'] },
];
const FRUTIGER_THEME_IDS = ['frutiger', 'frutigereco', 'frutigermetro', 'vectorflourish'];
const PUNK_THEME_IDS = ['solarpunk', 'cyberpunk'];
const RUMS_THEMES = [
  { id: 'standard', name: 'Light', description: 'Glossy modern RUMS Plaza', swatches: ['#f6f8fc', '#3478f6', '#b8d7ff'] },
  ...ROBLOX_THEMES,
  { id: 'dark', name: 'Dark', description: 'Deep graphite glass with cool blue accents', swatches: ['#12151b', '#2c3440', '#6da8ff'] },
  { id: 'minecraft', name: 'Minecraft', description: 'Blocky stone, grass and dirt-inspired UI', swatches: ['#7cab43', '#6b4c2e', '#9a9a9a'] },
  { id: 'frutiger', name: 'Frutiger Aero', description: 'Apple Aqua meets Windows Longhorn/Aero: silver glass, candy-blue controls and translucent chrome', swatches: ['#e9f5ff', '#2f9de0', '#aebfd0'] },
  { id: 'frutigereco', name: 'Frutiger Eco', description: 'Bright eco-web optimism with blue sky, glossy white cards and vivid leaf-green accents', swatches: ['#effff0', '#72d26b', '#6fc7ff'] },
  { id: 'frutigermetro', name: 'Frutiger Metro', description: 'Mid-2000s Vectordelia: bold flat vectors, swooshes, silhouettes, circles and high-energy gradients', swatches: ['#f25ca2', '#9bd82d', '#16b7d6'] },
  { id: 'vectorflourish', name: 'Vector Flourish', description: 'Ornamental 2000s vector bloom with floral curls, psychedelic gradients and Art Nouveau-inspired flourishes', swatches: ['#fff6dc', '#de4b91', '#799d32'] },
  { id: 'liquidglass', name: 'Liquid Glass', description: 'Clear layered translucency inspired by Apple-style liquid glass interfaces', swatches: ['#f6fbff', '#cfe8ff', '#8bc5ff'] },
  { id: 'solarpunk', name: 'Solarpunk', description: 'Warm natural materials, botanical greens and hopeful community energy', swatches: ['#f7f0dc', '#87b85d', '#d7c59a'] },
  { id: 'cyberpunk', name: 'Cyberpunk', description: 'Neon cyan, magenta and yellow over a dark high-tech interface', swatches: ['#0d1018', '#22e6ff', '#ff4fd8'] },
  { id: 'brutalism', name: 'Brutalism', description: 'Raw high-contrast editorial UI with hard edges, bold type and stark structure', swatches: ['#f3f0e8', '#111111', '#ff5f2e'] },
  { id: 'y2k', name: 'Y2K Futurism', description: 'Chrome, aqua and lavender 2000s futurism', swatches: ['#dce5f4', '#55d8e8', '#a693ff'] },
];
const FRUTIGER_THEMES = RUMS_THEMES.filter((item) => FRUTIGER_THEME_IDS.includes(item.id));
const PUNK_THEMES = RUMS_THEMES.filter((item) => PUNK_THEME_IDS.includes(item.id));
const MAIN_THEME_OPTIONS = RUMS_THEMES.filter((item) => !item.id.startsWith('roblox') && !FRUTIGER_THEME_IDS.includes(item.id) && !PUNK_THEME_IDS.includes(item.id));
const RUMS_SPACES = {
  rums4: { id: 'rums4', label: 'RUMS 4', subtitle: 'The current archive', description: 'Everything from the current site, including Project Lumina and all older posts.' },
  rums5: { id: 'rums5', label: 'Creative', subtitle: 'The new era', description: 'The same RUMS experience with a fresh feed and no Project Lumina.' },
};
const projectSpaceId = (projectId) => `project:${projectId}`;
const isProjectSpaceId = (space) => typeof space === 'string' && space.startsWith('project:') && space.length > 8;
const projectIdFromSpace = (space) => isProjectSpaceId(space) ? space.slice(8) : null;
const isContentSpaceId = (space) => space === 'rums4' || space === 'rums5' || isProjectSpaceId(space);
function storageKeysForSpace(space) {
  if (space === 'rums5') return { posts: RUMS5_POSTS_KEY, suggestions: RUMS5_SUGGESTIONS_KEY, updates: RUMS5_UPDATES_KEY, siteConfig: RUMS5_SITE_CONFIG_KEY };
  if (isProjectSpaceId(space)) {
    const safeId = projectIdFromSpace(space).replace(/[^A-Za-z0-9_-]/g, '');
    return { posts: `rums-project-${safeId}-posts`, suggestions: `rums-project-${safeId}-suggestions`, updates: `rums-project-${safeId}-updates`, siteConfig: `rums-project-${safeId}-site-config` };
  }
  return { posts: POSTS_KEY, suggestions: SUGGESTIONS_KEY, updates: UPDATES_KEY, siteConfig: SITE_CONFIG_KEY };
}
const DEFAULT_SITE_CONFIG = {
  brandName: 'RUMS Plaza', brandTagline: 'YOUR SERVER COMMUNITY', accent: '#3478f6', animations: true,
  heroTitle: 'Your world.', heroText: 'Builds, screenshots and moments from everyone on the server.',
  showDiscover: true, showLumina: true, showUpdates: true, showSuggestions: true,
  customTabs: [], customWidgets: [], textOverrides: {}, elementPositions: {}, feedBoxOrder: ['hero', 'posts'],
  boxOrders: {}, boxStyles: {}, boxTextOverrides: {}, migrations: {},
};

const PLAZA_OVERHAUL_WIDGET_ID = 'plaza-overhaul-2026';
const PLAZA_OVERHAUL_MIGRATION = 'plaza-overhaul-announcement-v1';
const PLAZA_OVERHAUL_WIDGET = {
  id: PLAZA_OVERHAUL_WIDGET_ID,
  placement: 'feed',
  title: '✨ RUMS Plaza has been completely overhauled!',
  body: 'A fresh new look, smoother interactions and loads of new features — while keeping the glossy, modern RUMS aesthetic. Explore RUMS 4, Creative and Projects, emoji reactions, custom emojis, the visual editor and more.',
  image: '',
  actionLabel: '',
  actionUrl: '',
  color: '#eaf4ff',
  animation: 'none',
};

function requiredTutorialVersionForUser(user) {
  if (!user?.username) return TUTORIAL_VERSION;
  return user.username.trim().toLowerCase() === 'jamie' ? JAMIE_TUTORIAL_VERSION : TUTORIAL_VERSION;
}

function migratePlazaOverhaulAnnouncement(config) {
  const next = { ...DEFAULT_SITE_CONFIG, ...(config || {}), migrations: { ...(config?.migrations || {}) } };
  if (next.migrations[PLAZA_OVERHAUL_MIGRATION]) return { config: next, changed: false };
  const isLegacyOverhaulBox = (widget) => {
    const text = `${widget?.title || ''} ${widget?.body || ''}`
      .toLowerCase()
      .replace(/[’‘]/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
    return widget?.id === PLAZA_OVERHAUL_WIDGET_ID
      || text.includes("our site's gotten a new look")
      || text.includes("our site's gotten a complete overhaul")
      || (text.includes('complete overhaul') && text.includes('glossy') && text.includes('modern aesthetic'));
  };
  const customWidgets = (next.customWidgets || []).filter((widget) => !isLegacyOverhaulBox(widget));
  return {
    config: {
      ...next,
      customWidgets: [PLAZA_OVERHAUL_WIDGET, ...customWidgets],
      migrations: { ...next.migrations, [PLAZA_OVERHAUL_MIGRATION]: true },
    },
    changed: true,
  };
}

const BUILT_IN_PAGES = [
  ['feed', 'Community feed'], ['lumina', 'Project Lumina'], ['upload', 'Add post'],
  ['suggestions', 'Suggestions'], ['updates', 'Server updates'], ['news', 'Plaza News'], ['chat', 'Chat'], ['search', 'Discover'], ['plazaPlus', 'Plaza+'],
  ['profile', 'Profiles'], ['postDetail', 'Post detail'],
];
const TAGS = ['General', 'Lumina'];
const LUMINA_SECTIONS = [['overview', 'Overview'], ['metro', 'Districts'], ['community', 'Community']];
const LUMINA_STATIONS = [
  { name: 'Lumen', type: 'Shopping district', description: 'The station beneath Lumina’s main shopping district, putting shops and lively public spaces directly above the platforms.', accent: '#72a8ff' },
  { name: 'Luminelia', type: 'Skyline district', description: 'The station directly beneath Lumina’s skyline, surrounded by the city’s towers and most recognisable architecture.', accent: '#8d84f6' },
  { name: 'Luminarra', type: 'Gateway station', description: 'Lumina’s arrival point beside the teleporter: the gateway where visitors first enter and connect with the city.', accent: '#62bea1' },
];
const lastSeenKey = (username, space = 'rums4') => space === 'rums5' ? `rums5-lastseen-${username}` : isProjectSpaceId(space) ? `rums-project-${projectIdFromSpace(space)}-lastseen-${username}` : `rums-lastseen-${username}`;
const MENTION_RE = /(@[A-Za-z0-9_]+)/g;

const SPOTIFY_URL_RE = /https?:\/\/open\.spotify\.com\/[^\s<>"']+/gi;
const SPOTIFY_EMBED_TYPES = new Set(['track', 'album', 'playlist', 'artist', 'episode', 'show', 'audiobook']);

function spotifyEmbedFromText(text = '') {
  const matches = String(text).match(SPOTIFY_URL_RE) || [];
  for (const rawMatch of matches) {
    const raw = rawMatch.replace(/[),.!?;:]+$/, '');
    try {
      const url = new URL(raw);
      if (url.hostname !== 'open.spotify.com') continue;

      const parts = url.pathname.split('/').filter(Boolean);
      const intlIndex = parts[0]?.startsWith('intl-') ? 1 : 0;
      const type = parts[intlIndex];
      const id = parts[intlIndex + 1];

      if (!SPOTIFY_EMBED_TYPES.has(type) || !id) continue;
      if (!/^[A-Za-z0-9]+$/.test(id)) continue;

      return {
        type,
        id,
        originalUrl: raw,
        embedUrl: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`,
      };
    } catch {
      // Ignore malformed URLs and keep rendering the message normally.
    }
  }
  return null;
}


function stripSpotifyLinks(text = '') {
  return String(text)
    .replace(/https?:\/\/open\.spotify\.com\/(?:intl-[A-Za-z-]+\/)?(?:track|album|playlist|artist|episode|show|audiobook)\/[A-Za-z0-9]+(?:\?[^\s<>"']*)?/gi, '')
    .replace(/\[[^\]]*\]\(\s*\)/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function SpotifyMessageEmbed({ text }) {
  const spotify = spotifyEmbedFromText(text);
  if (!spotify) return null;

  const compact = spotify.type === 'track' || spotify.type === 'episode';

  return (
    <div className="chat-spotify-embed">
      <iframe
        src={spotify.embedUrl}
        title={`Spotify ${spotify.type}`}
        width="100%"
        height={compact ? 152 : 352}
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      />
    </div>
  );
}

function KlipyMedia({ gif, className = '', controls = false }) {
  if (!gif) return null;
  const mp4 = gif.mp4 || gif.tinymp4 || '';
  const image = gif.preview || gif.url || '';
  if (mp4) {
    return <video className={className} src={mp4} poster={image || undefined} autoPlay loop muted playsInline controls={controls} preload="metadata" />;
  }
  if (image) return <img className={className} src={image} alt={gif.title || 'GIF'} loading="lazy" referrerPolicy="no-referrer" />;
  return null;
}

const CUSTOM_EMOJIS_KEY = 'rums-custom-emojis';
const CHAT_MESSAGES_KEY = 'rums-chat-messages';
const SITE_ANNOUNCEMENT_KEY = 'rums-site-announcement';
const CHAT_ROOM_ID = 'plaza';
const chatReadKey = (username) => `rums-chat-read-${username}`;
const chatSeenKey = (reader, sender) => `rums-chat-seen-${reader}-${sender}`;
const PLAZA_PLUS_KEY = 'rums-plaza-plus';
const PLAZA_NEWS_KEY = 'rums-plaza-news';
const NEWS_CATEGORIES = ['Plaza', 'Community', 'Projects', 'Events', 'Updates'];
const NEWS_SOURCES = ['RUMS 4', 'Lumina', 'Creative'];
const notificationReadKey = (username) => `rums-notification-read-${encodeURIComponent(username)}`;
const PROJECT_INDEX_KEY = 'rums-project-directory-v2';
const projectRecordKey = (id) => `rums-project-record-${String(id).replace(/[^A-Za-z0-9_-]/g, '')}`;
const projectSummary = ({ id, name, description, category, owner, followers, timestamp }) => ({ id, name, description, category, owner, followers, timestamp });
const PLAZA_PLUS_VERSION = 1;
const DEFAULT_PLAZA_PLUS = {
  version: PLAZA_PLUS_VERSION,
  follows: {}, bookmarks: {}, collections: {}, profiles: {}, presence: {},
  activities: [], notificationReads: {}, events: [], groups: [], projects: [], wiki: [], builds: [],
  reports: [], audit: [], invites: [], roles: {}, achievements: {}, xp: {}, drafts: {}, scheduled: [],
  polls: {}, chatGroups: [], chatReactions: {}, typing: {}, changelog: [], themePresets: [], pageThemes: {},
  accessibility: {}, commandHistory: {},
};

function normalizePlazaPlus(value) {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  return { ...DEFAULT_PLAZA_PLUS, ...source };
}
const EMOJI_SKIN_TONES = ['🏻', '🏼', '🏽', '🏾', '🏿'];
const EMOJI_CATEGORY_META = [
  ['smileys', '😀'], ['people', '👋'], ['nature', '🌿'], ['food', '🍕'], ['activities', '⚽'],
  ['travel', '🚆'], ['objects', '💡'], ['symbols', '✨'], ['flags', '🏳️'], ['other', '🪩'], ['custom', 'R'],
];

function nativeEmojiCategory(cp) {
  if ((cp >= 0x1f600 && cp <= 0x1f64f) || (cp >= 0x1f910 && cp <= 0x1f97f) || (cp >= 0x1fae0 && cp <= 0x1faef)) return 'smileys';
  if ((cp >= 0x1f440 && cp <= 0x1f487) || cp === 0x1f4aa || (cp >= 0x1f574 && cp <= 0x1f57a) || (cp >= 0x1f645 && cp <= 0x1f64f) || (cp >= 0x1f90c && cp <= 0x1f93a) || (cp >= 0x1f9b0 && cp <= 0x1f9df)) return 'people';
  if ((cp >= 0x1f300 && cp <= 0x1f344) || (cp >= 0x1f400 && cp <= 0x1f43f) || (cp >= 0x1f980 && cp <= 0x1f9af) || (cp >= 0x1fab0 && cp <= 0x1fabf)) return 'nature';
  if ((cp >= 0x1f345 && cp <= 0x1f37f) || (cp >= 0x1f950 && cp <= 0x1f96f)) return 'food';
  if ((cp >= 0x1f3a0 && cp <= 0x1f3ff) || (cp >= 0x1f93c && cp <= 0x1f945)) return 'activities';
  if (cp >= 0x1f680 && cp <= 0x1f6ff) return 'travel';
  if ((cp >= 0x1f4a0 && cp <= 0x1f5ff) || (cp >= 0x1f7e0 && cp <= 0x1f7eb)) return 'objects';
  if ((cp >= 0x2600 && cp <= 0x27bf) || (cp >= 0x1f500 && cp <= 0x1f53d)) return 'symbols';
  return 'other';
}

function buildNativeEmojiCatalog() {
  let pictographic = null;
  let modifierBase = null;
  try {
    pictographic = new RegExp('\\p{Extended_Pictographic}', 'u');
    modifierBase = new RegExp('\\p{Emoji_Modifier_Base}', 'u');
  } catch { /* modern Chromium supports these; fallback still keeps the seeded set */ }
  const byCategory = Object.fromEntries(EMOJI_CATEGORY_META.map(([key]) => [key, []]));
  const seen = new Set();
  const add = (value, category) => {
    if (!value || seen.has(value)) return;
    seen.add(value);
    (byCategory[category] || byCategory.other).push(value);
  };
  const ranges = [[0x2600, 0x27bf], [0x1f000, 0x1faff]];
  for (const [start, end] of ranges) {
    for (let cp = start; cp <= end; cp += 1) {
      const raw = String.fromCodePoint(cp);
      if (pictographic && !pictographic.test(raw)) continue;
      const rendered = cp <= 0x27bf ? `${raw}️` : raw;
      const category = nativeEmojiCategory(cp);
      add(rendered, category);
      if (modifierBase?.test(raw)) EMOJI_SKIN_TONES.forEach((tone) => add(`${raw}${tone}`, 'people'));
    }
  }
  ['#️⃣', '*️⃣', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'].forEach((emoji) => add(emoji, 'symbols'));
  const peopleZwjs = [
    '👨‍⚕️','👩‍⚕️','🧑‍⚕️','👨‍🎓','👩‍🎓','🧑‍🎓','👨‍🏫','👩‍🏫','🧑‍🏫','👨‍⚖️','👩‍⚖️','🧑‍⚖️',
    '👨‍🌾','👩‍🌾','🧑‍🌾','👨‍🍳','👩‍🍳','🧑‍🍳','👨‍🔧','👩‍🔧','🧑‍🔧','👨‍🏭','👩‍🏭','🧑‍🏭',
    '👨‍💼','👩‍💼','🧑‍💼','👨‍🔬','👩‍🔬','🧑‍🔬','👨‍💻','👩‍💻','🧑‍💻','👨‍🎤','👩‍🎤','🧑‍🎤',
    '👨‍🎨','👩‍🎨','🧑‍🎨','👨‍✈️','👩‍✈️','🧑‍✈️','👨‍🚀','👩‍🚀','🧑‍🚀','👨‍🚒','👩‍🚒','🧑‍🚒',
    '👨‍🦰','👩‍🦰','👨‍🦱','👩‍🦱','👨‍🦳','👩‍🦳','👨‍🦲','👩‍🦲','🧑‍🦰','🧑‍🦱','🧑‍🦳','🧑‍🦲',
    '👪','👨‍👩‍👦','👨‍👩‍👧','👨‍👩‍👧‍👦','👨‍👩‍👦‍👦','👨‍👩‍👧‍👧','👩‍👩‍👦','👩‍👩‍👧','👨‍👨‍👦','👨‍👨‍👧',
    '👩‍❤️‍👨','👩‍❤️‍👩','👨‍❤️‍👨','👩‍❤️‍💋‍👨','👩‍❤️‍💋‍👩','👨‍❤️‍💋‍👨',
  ];
  peopleZwjs.forEach((emoji) => add(emoji, 'people'));
  try {
    const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
    for (let a = 65; a <= 90; a += 1) {
      for (let b = 65; b <= 90; b += 1) {
        const code = String.fromCharCode(a, b);
        if (regionNames.of(code) === code) continue;
        const flag = String.fromCodePoint(0x1f1e6 + a - 65, 0x1f1e6 + b - 65);
        add(flag, 'flags');
      }
    }
  } catch { ['🇳🇱','🇺🇸','🇬🇧','🇫🇷','🇩🇪','🇯🇵','🇨🇦','🇦🇺','🇧🇷','🇰🇷'].forEach((emoji) => add(emoji, 'flags')); }
  ['🏴','🏳️','🏳️‍🌈','🏳️‍⚧️','🏴‍☠️'].forEach((emoji) => add(emoji, 'flags'));
  // Make the most familiar reactions easy to find at the start of their groups.
  ['👍','😂','🔥','😮','🎉','💯'].forEach((emoji) => {
    const category = nativeEmojiCategory(emoji.codePointAt(0));
    const list = byCategory[category] || byCategory.other;
    const index = list.indexOf(emoji);
    if (index > 0) list.unshift(list.splice(index, 1)[0]);
  });
  return byCategory;
}
const NATIVE_EMOJIS_BY_CATEGORY = buildNativeEmojiCatalog();
const NATIVE_REACTION_EMOJIS = Object.values(NATIVE_EMOJIS_BY_CATEGORY).flat();
const NATIVE_REACTION_EMOJI_SET = new Set(NATIVE_REACTION_EMOJIS);

const EMOJI_CODEPOINT_SEARCH_NAMES = {"2600":"black sun with rays","2601":"cloud","2602":"umbrella","2603":"snowman","2604":"comet","260e":"black telephone","2611":"ballot box with check","2614":"umbrella with rain drops","2615":"hot beverage","2618":"shamrock","261d":"white up pointing index","2620":"skull and crossbones","2622":"radioactive sign","2623":"biohazard sign","2626":"orthodox cross","262a":"star and crescent","262e":"peace symbol","262f":"yin yang","2638":"wheel of dharma","2639":"white frowning face","263a":"white smiling face","2640":"female sign","2642":"male sign","2648":"aries","2649":"taurus","264a":"gemini","264b":"cancer","264c":"leo","264d":"virgo","264e":"libra","264f":"scorpius","2650":"sagittarius","2651":"capricorn","2652":"aquarius","2653":"pisces","265f":"black chess pawn","2660":"black spade suit","2663":"black club suit","2665":"black heart suit","2666":"black diamond suit","2668":"hot springs","267b":"black universal recycling symbol","267e":"permanent paper sign","267f":"wheelchair symbol","2692":"hammer and pick","2693":"anchor","2694":"crossed swords","2695":"staff of aesculapius","2696":"scales","2697":"alembic","2699":"gear","269b":"atom symbol","269c":"fleur-de-lis","26a0":"warning sign","26a1":"high voltage sign","26a7":"male with stroke and male and female sign","26aa":"medium white circle","26ab":"medium black circle","26b0":"coffin","26b1":"funeral urn","26bd":"soccer ball","26be":"baseball","26c4":"snowman without snow","26c5":"sun behind cloud","26c8":"thunder cloud and rain","26ce":"ophiuchus","26cf":"pick","26d1":"helmet with white cross","26d3":"chains","26d4":"no entry","26e9":"shinto shrine","26ea":"church","26f0":"mountain","26f1":"umbrella on ground","26f2":"fountain","26f3":"flag in hole","26f4":"ferry","26f5":"sailboat","26f7":"skier","26f8":"ice skate","26f9":"person with ball","26fa":"tent","26fd":"fuel pump","2702":"black scissors","2705":"white heavy check mark","2708":"airplane","2709":"envelope","270a":"raised fist","270b":"raised hand","270c":"victory hand","270d":"writing hand","270f":"pencil","2712":"black nib","2714":"heavy check mark","2716":"heavy multiplication x","271d":"latin cross","2721":"star of david","2728":"sparkles","2733":"eight spoked asterisk","2734":"eight pointed black star","2744":"snowflake","2747":"sparkle","274c":"cross mark","274e":"negative squared cross mark","2753":"black question mark ornament","2754":"white question mark ornament","2755":"white exclamation mark ornament","2757":"heavy exclamation mark symbol","2763":"heavy heart exclamation mark ornament","2764":"heavy black heart","2795":"heavy plus sign","2796":"heavy minus sign","2797":"heavy division sign","27a1":"black rightwards arrow","27b0":"curly loop","27bf":"double curly loop","1f004":"mahjong tile red dragon","1f0cf":"playing card black joker","1f170":"negative squared latin capital letter a","1f171":"negative squared latin capital letter b","1f17e":"negative squared latin capital letter o","1f17f":"negative squared latin capital letter p","1f18e":"negative squared ab","1f191":"squared cl","1f192":"squared cool","1f193":"squared free","1f194":"squared id","1f195":"squared new","1f196":"squared ng","1f197":"squared ok","1f198":"squared sos","1f199":"squared up with exclamation mark","1f19a":"squared vs","1f1e6":"regional indicator symbol letter a","1f1e7":"regional indicator symbol letter b","1f1e8":"regional indicator symbol letter c","1f1e9":"regional indicator symbol letter d","1f1ea":"regional indicator symbol letter e","1f1eb":"regional indicator symbol letter f","1f1ec":"regional indicator symbol letter g","1f1ed":"regional indicator symbol letter h","1f1ee":"regional indicator symbol letter i","1f1ef":"regional indicator symbol letter j","1f1f0":"regional indicator symbol letter k","1f1f1":"regional indicator symbol letter l","1f1f2":"regional indicator symbol letter m","1f1f3":"regional indicator symbol letter n","1f1f4":"regional indicator symbol letter o","1f1f5":"regional indicator symbol letter p","1f1f6":"regional indicator symbol letter q","1f1f7":"regional indicator symbol letter r","1f1f8":"regional indicator symbol letter s","1f1f9":"regional indicator symbol letter t","1f1fa":"regional indicator symbol letter u","1f1fb":"regional indicator symbol letter v","1f1fc":"regional indicator symbol letter w","1f1fd":"regional indicator symbol letter x","1f1fe":"regional indicator symbol letter y","1f1ff":"regional indicator symbol letter z","1f201":"squared katakana koko","1f202":"squared katakana sa","1f21a":"squared cjk unified ideograph-7121","1f22f":"squared cjk unified ideograph-6307","1f232":"squared cjk unified ideograph-7981","1f233":"squared cjk unified ideograph-7a7a","1f234":"squared cjk unified ideograph-5408","1f235":"squared cjk unified ideograph-6e80","1f236":"squared cjk unified ideograph-6709","1f237":"squared cjk unified ideograph-6708","1f238":"squared cjk unified ideograph-7533","1f239":"squared cjk unified ideograph-5272","1f23a":"squared cjk unified ideograph-55b6","1f250":"circled ideograph advantage","1f251":"circled ideograph accept","1f300":"cyclone","1f301":"foggy","1f302":"closed umbrella","1f303":"night with stars","1f304":"sunrise over mountains","1f305":"sunrise","1f306":"cityscape at dusk","1f307":"sunset over buildings","1f308":"rainbow","1f309":"bridge at night","1f30a":"water wave","1f30b":"volcano","1f30c":"milky way","1f30d":"earth globe europe-africa","1f30e":"earth globe americas","1f30f":"earth globe asia-australia","1f310":"globe with meridians","1f311":"new moon symbol","1f312":"waxing crescent moon symbol","1f313":"first quarter moon symbol","1f314":"waxing gibbous moon symbol","1f315":"full moon symbol","1f316":"waning gibbous moon symbol","1f317":"last quarter moon symbol","1f318":"waning crescent moon symbol","1f319":"crescent moon","1f31a":"new moon with face","1f31b":"first quarter moon with face","1f31c":"last quarter moon with face","1f31d":"full moon with face","1f31e":"sun with face","1f31f":"glowing star","1f320":"shooting star","1f321":"thermometer","1f324":"white sun with small cloud","1f325":"white sun behind cloud","1f326":"white sun behind cloud with rain","1f327":"cloud with rain","1f328":"cloud with snow","1f329":"cloud with lightning","1f32a":"cloud with tornado","1f32b":"fog","1f32c":"wind blowing face","1f32d":"hot dog","1f32e":"taco","1f32f":"burrito","1f330":"chestnut","1f331":"seedling","1f332":"evergreen tree","1f333":"deciduous tree","1f334":"palm tree","1f335":"cactus","1f336":"hot pepper","1f337":"tulip","1f338":"cherry blossom","1f339":"rose","1f33a":"hibiscus","1f33b":"sunflower","1f33c":"blossom","1f33d":"ear of maize","1f33e":"ear of rice","1f33f":"herb","1f340":"four leaf clover","1f341":"maple leaf","1f342":"fallen leaf","1f343":"leaf fluttering in wind","1f344":"mushroom","1f345":"tomato","1f346":"aubergine","1f347":"grapes","1f348":"melon","1f349":"watermelon","1f34a":"tangerine","1f34b":"lemon","1f34c":"banana","1f34d":"pineapple","1f34e":"red apple","1f34f":"green apple","1f350":"pear","1f351":"peach","1f352":"cherries","1f353":"strawberry","1f354":"hamburger","1f355":"slice of pizza","1f356":"meat on bone","1f357":"poultry leg","1f358":"rice cracker","1f359":"rice ball","1f35a":"cooked rice","1f35b":"curry and rice","1f35c":"steaming bowl","1f35d":"spaghetti","1f35e":"bread","1f35f":"french fries","1f360":"roasted sweet potato","1f361":"dango","1f362":"oden","1f363":"sushi","1f364":"fried shrimp","1f365":"fish cake with swirl design","1f366":"soft ice cream","1f367":"shaved ice","1f368":"ice cream","1f369":"doughnut","1f36a":"cookie","1f36b":"chocolate bar","1f36c":"candy","1f36d":"lollipop","1f36e":"custard","1f36f":"honey pot","1f370":"shortcake","1f371":"bento box","1f372":"pot of food","1f373":"cooking","1f374":"fork and knife","1f375":"teacup without handle","1f376":"sake bottle and cup","1f377":"wine glass","1f378":"cocktail glass","1f379":"tropical drink","1f37a":"beer mug","1f37b":"clinking beer mugs","1f37c":"baby bottle","1f37d":"fork and knife with plate","1f37e":"bottle with popping cork","1f37f":"popcorn","1f380":"ribbon","1f381":"wrapped present","1f382":"birthday cake","1f383":"jack-o-lantern","1f384":"christmas tree","1f385":"father christmas","1f386":"fireworks","1f387":"firework sparkler","1f388":"balloon","1f389":"party popper","1f38a":"confetti ball","1f38b":"tanabata tree","1f38c":"crossed flags","1f38d":"pine decoration","1f38e":"japanese dolls","1f38f":"carp streamer","1f390":"wind chime","1f391":"moon viewing ceremony","1f392":"school satchel","1f393":"graduation cap","1f396":"military medal","1f397":"reminder ribbon","1f399":"studio microphone","1f39a":"level slider","1f39b":"control knobs","1f39e":"film frames","1f39f":"admission tickets","1f3a0":"carousel horse","1f3a1":"ferris wheel","1f3a2":"roller coaster","1f3a3":"fishing pole and fish","1f3a4":"microphone","1f3a5":"movie camera","1f3a6":"cinema","1f3a7":"headphone","1f3a8":"artist palette","1f3a9":"top hat","1f3aa":"circus tent","1f3ab":"ticket","1f3ac":"clapper board","1f3ad":"performing arts","1f3ae":"video game","1f3af":"direct hit","1f3b0":"slot machine","1f3b1":"billiards","1f3b2":"game die","1f3b3":"bowling","1f3b4":"flower playing cards","1f3b5":"musical note","1f3b6":"multiple musical notes","1f3b7":"saxophone","1f3b8":"guitar","1f3b9":"musical keyboard","1f3ba":"trumpet","1f3bb":"violin","1f3bc":"musical score","1f3bd":"running shirt with sash","1f3be":"tennis racquet and ball","1f3bf":"ski and ski boot","1f3c0":"basketball and hoop","1f3c1":"chequered flag","1f3c2":"snowboarder","1f3c3":"runner","1f3c4":"surfer","1f3c5":"sports medal","1f3c6":"trophy","1f3c7":"horse racing","1f3c8":"american football","1f3c9":"rugby football","1f3ca":"swimmer","1f3cb":"weight lifter","1f3cc":"golfer","1f3cd":"racing motorcycle","1f3ce":"racing car","1f3cf":"cricket bat and ball","1f3d0":"volleyball","1f3d1":"field hockey stick and ball","1f3d2":"ice hockey stick and puck","1f3d3":"table tennis paddle and ball","1f3d4":"snow capped mountain","1f3d5":"camping","1f3d6":"beach with umbrella","1f3d7":"building construction","1f3d8":"house buildings","1f3d9":"cityscape","1f3da":"derelict house building","1f3db":"classical building","1f3dc":"desert","1f3dd":"desert island","1f3de":"national park","1f3df":"stadium","1f3e0":"house building","1f3e1":"house with garden","1f3e2":"office building","1f3e3":"japanese post office","1f3e4":"european post office","1f3e5":"hospital","1f3e6":"bank","1f3e7":"automated teller machine","1f3e8":"hotel","1f3e9":"love hotel","1f3ea":"convenience store","1f3eb":"school","1f3ec":"department store","1f3ed":"factory","1f3ee":"izakaya lantern","1f3ef":"japanese castle","1f3f0":"european castle","1f3f3":"waving white flag","1f3f4":"waving black flag","1f3f5":"rosette","1f3f7":"label","1f3f8":"badminton racquet and shuttlecock","1f3f9":"bow and arrow","1f3fa":"amphora","1f3fb":"emoji modifier fitzpatrick type-1-2","1f3fc":"emoji modifier fitzpatrick type-3","1f3fd":"emoji modifier fitzpatrick type-4","1f3fe":"emoji modifier fitzpatrick type-5","1f3ff":"emoji modifier fitzpatrick type-6","1f400":"rat","1f401":"mouse","1f402":"ox","1f403":"water buffalo","1f404":"cow","1f405":"tiger","1f406":"leopard","1f407":"rabbit","1f408":"cat","1f409":"dragon","1f40a":"crocodile","1f40b":"whale","1f40c":"snail","1f40d":"snake","1f40e":"horse","1f40f":"ram","1f410":"goat","1f411":"sheep","1f412":"monkey","1f413":"rooster","1f414":"chicken","1f415":"dog","1f416":"pig","1f417":"boar","1f418":"elephant","1f419":"octopus","1f41a":"spiral shell","1f41b":"bug","1f41c":"ant","1f41d":"honeybee","1f41e":"lady beetle","1f41f":"fish","1f420":"tropical fish","1f421":"blowfish","1f422":"turtle","1f423":"hatching chick","1f424":"baby chick","1f425":"front-facing baby chick","1f426":"bird","1f427":"penguin","1f428":"koala","1f429":"poodle","1f42a":"dromedary camel","1f42b":"bactrian camel","1f42c":"dolphin","1f42d":"mouse face","1f42e":"cow face","1f42f":"tiger face","1f430":"rabbit face","1f431":"cat face","1f432":"dragon face","1f433":"spouting whale","1f434":"horse face","1f435":"monkey face","1f436":"dog face","1f437":"pig face","1f438":"frog face","1f439":"hamster face","1f43a":"wolf face","1f43b":"bear face","1f43c":"panda face","1f43d":"pig nose","1f43e":"paw prints","1f43f":"chipmunk","1f440":"eyes","1f441":"eye","1f442":"ear","1f443":"nose","1f444":"mouth","1f445":"tongue","1f446":"white up pointing backhand index","1f447":"white down pointing backhand index","1f448":"white left pointing backhand index","1f449":"white right pointing backhand index","1f44a":"fisted hand sign","1f44b":"waving hand sign","1f44c":"ok hand sign","1f44d":"thumbs up sign","1f44e":"thumbs down sign","1f44f":"clapping hands sign","1f450":"open hands sign","1f451":"crown","1f452":"womans hat","1f453":"eyeglasses","1f454":"necktie","1f455":"t-shirt","1f456":"jeans","1f457":"dress","1f458":"kimono","1f459":"bikini","1f45a":"womans clothes","1f45b":"purse","1f45c":"handbag","1f45d":"pouch","1f45e":"mans shoe","1f45f":"athletic shoe","1f460":"high-heeled shoe","1f461":"womans sandal","1f462":"womans boots","1f463":"footprints","1f464":"bust in silhouette","1f465":"busts in silhouette","1f466":"boy","1f467":"girl","1f468":"man","1f469":"woman","1f46a":"family","1f46b":"man and woman holding hands","1f46c":"two men holding hands","1f46d":"two women holding hands","1f46e":"police officer","1f46f":"woman with bunny ears","1f470":"bride with veil","1f471":"person with blond hair","1f472":"man with gua pi mao","1f473":"man with turban","1f474":"older man","1f475":"older woman","1f476":"baby","1f477":"construction worker","1f478":"princess","1f479":"japanese ogre","1f47a":"japanese goblin","1f47b":"ghost","1f47c":"baby angel","1f47d":"extraterrestrial alien","1f47e":"alien monster","1f47f":"imp","1f480":"skull","1f481":"information desk person","1f482":"guardsman","1f483":"dancer","1f484":"lipstick","1f485":"nail polish","1f486":"face massage","1f487":"haircut","1f488":"barber pole","1f489":"syringe","1f48a":"pill","1f48b":"kiss mark","1f48c":"love letter","1f48d":"ring","1f48e":"gem stone","1f48f":"kiss","1f490":"bouquet","1f491":"couple with heart","1f492":"wedding","1f493":"beating heart","1f494":"broken heart","1f495":"two hearts","1f496":"sparkling heart","1f497":"growing heart","1f498":"heart with arrow","1f499":"blue heart","1f49a":"green heart","1f49b":"yellow heart","1f49c":"purple heart","1f49d":"heart with ribbon","1f49e":"revolving hearts","1f49f":"heart decoration","1f4a0":"diamond shape with a dot inside","1f4a1":"electric light bulb","1f4a2":"anger symbol","1f4a3":"bomb","1f4a4":"sleeping symbol","1f4a5":"collision symbol","1f4a6":"splashing sweat symbol","1f4a7":"droplet","1f4a8":"dash symbol","1f4a9":"pile of poo","1f4aa":"flexed biceps","1f4ab":"dizzy symbol","1f4ac":"speech balloon","1f4ad":"thought balloon","1f4ae":"white flower","1f4af":"hundred points symbol","1f4b0":"money bag","1f4b1":"currency exchange","1f4b2":"heavy dollar sign","1f4b3":"credit card","1f4b4":"banknote with yen sign","1f4b5":"banknote with dollar sign","1f4b6":"banknote with euro sign","1f4b7":"banknote with pound sign","1f4b8":"money with wings","1f4b9":"chart with upwards trend and yen sign","1f4ba":"seat","1f4bb":"personal computer","1f4bc":"briefcase","1f4bd":"minidisc","1f4be":"floppy disk","1f4bf":"optical disc","1f4c0":"dvd","1f4c1":"file folder","1f4c2":"open file folder","1f4c3":"page with curl","1f4c4":"page facing up","1f4c5":"calendar","1f4c6":"tear-off calendar","1f4c7":"card index","1f4c8":"chart with upwards trend","1f4c9":"chart with downwards trend","1f4ca":"bar chart","1f4cb":"clipboard","1f4cc":"pushpin","1f4cd":"round pushpin","1f4ce":"paperclip","1f4cf":"straight ruler","1f4d0":"triangular ruler","1f4d1":"bookmark tabs","1f4d2":"ledger","1f4d3":"notebook","1f4d4":"notebook with decorative cover","1f4d5":"closed book","1f4d6":"open book","1f4d7":"green book","1f4d8":"blue book","1f4d9":"orange book","1f4da":"books","1f4db":"name badge","1f4dc":"scroll","1f4dd":"memo","1f4de":"telephone receiver","1f4df":"pager","1f4e0":"fax machine","1f4e1":"satellite antenna","1f4e2":"public address loudspeaker","1f4e3":"cheering megaphone","1f4e4":"outbox tray","1f4e5":"inbox tray","1f4e6":"package","1f4e7":"e-mail symbol","1f4e8":"incoming envelope","1f4e9":"envelope with downwards arrow above","1f4ea":"closed mailbox with lowered flag","1f4eb":"closed mailbox with raised flag","1f4ec":"open mailbox with raised flag","1f4ed":"open mailbox with lowered flag","1f4ee":"postbox","1f4ef":"postal horn","1f4f0":"newspaper","1f4f1":"mobile phone","1f4f2":"mobile phone with rightwards arrow at left","1f4f3":"vibration mode","1f4f4":"mobile phone off","1f4f5":"no mobile phones","1f4f6":"antenna with bars","1f4f7":"camera","1f4f8":"camera with flash","1f4f9":"video camera","1f4fa":"television","1f4fb":"radio","1f4fc":"videocassette","1f4fd":"film projector","1f4ff":"prayer beads","1f500":"twisted rightwards arrows","1f501":"clockwise rightwards and leftwards open circle arrows","1f502":"clockwise rightwards and leftwards open circle arrows with circled one overlay","1f503":"clockwise downwards and upwards open circle arrows","1f504":"anticlockwise downwards and upwards open circle arrows","1f505":"low brightness symbol","1f506":"high brightness symbol","1f507":"speaker with cancellation stroke","1f508":"speaker","1f509":"speaker with one sound wave","1f50a":"speaker with three sound waves","1f50b":"battery","1f50c":"electric plug","1f50d":"left-pointing magnifying glass","1f50e":"right-pointing magnifying glass","1f50f":"lock with ink pen","1f510":"closed lock with key","1f511":"key","1f512":"lock","1f513":"open lock","1f514":"bell","1f515":"bell with cancellation stroke","1f516":"bookmark","1f517":"link symbol","1f518":"radio button","1f519":"back with leftwards arrow above","1f51a":"end with leftwards arrow above","1f51b":"on with exclamation mark with left right arrow above","1f51c":"soon with rightwards arrow above","1f51d":"top with upwards arrow above","1f51e":"no one under eighteen symbol","1f51f":"keycap ten","1f520":"input symbol for latin capital letters","1f521":"input symbol for latin small letters","1f522":"input symbol for numbers","1f523":"input symbol for symbols","1f524":"input symbol for latin letters","1f525":"fire","1f526":"electric torch","1f527":"wrench","1f528":"hammer","1f529":"nut and bolt","1f52a":"hocho","1f52b":"pistol","1f52c":"microscope","1f52d":"telescope","1f52e":"crystal ball","1f52f":"six pointed star with middle dot","1f530":"japanese symbol for beginner","1f531":"trident emblem","1f532":"black square button","1f533":"white square button","1f534":"large red circle","1f535":"large blue circle","1f536":"large orange diamond","1f537":"large blue diamond","1f538":"small orange diamond","1f539":"small blue diamond","1f53a":"up-pointing red triangle","1f53b":"down-pointing red triangle","1f53c":"up-pointing small red triangle","1f53d":"down-pointing small red triangle","1f549":"om symbol","1f54a":"dove of peace","1f54b":"kaaba","1f54c":"mosque","1f54d":"synagogue","1f54e":"menorah with nine branches","1f550":"clock face one oclock","1f551":"clock face two oclock","1f552":"clock face three oclock","1f553":"clock face four oclock","1f554":"clock face five oclock","1f555":"clock face six oclock","1f556":"clock face seven oclock","1f557":"clock face eight oclock","1f558":"clock face nine oclock","1f559":"clock face ten oclock","1f55a":"clock face eleven oclock","1f55b":"clock face twelve oclock","1f55c":"clock face one-thirty","1f55d":"clock face two-thirty","1f55e":"clock face three-thirty","1f55f":"clock face four-thirty","1f560":"clock face five-thirty","1f561":"clock face six-thirty","1f562":"clock face seven-thirty","1f563":"clock face eight-thirty","1f564":"clock face nine-thirty","1f565":"clock face ten-thirty","1f566":"clock face eleven-thirty","1f567":"clock face twelve-thirty","1f56f":"candle","1f570":"mantelpiece clock","1f573":"hole","1f574":"man in business suit levitating","1f575":"sleuth or spy","1f576":"dark sunglasses","1f577":"spider","1f578":"spider web","1f579":"joystick","1f57a":"man dancing","1f587":"linked paperclips","1f58a":"lower left ballpoint pen","1f58b":"lower left fountain pen","1f58c":"lower left paintbrush","1f58d":"lower left crayon","1f590":"raised hand with fingers splayed","1f595":"reversed hand with middle finger extended","1f596":"raised hand with part between middle and ring fingers","1f5a4":"black heart","1f5a5":"desktop computer","1f5a8":"printer","1f5b1":"three button mouse","1f5b2":"trackball","1f5bc":"frame with picture","1f5c2":"card index dividers","1f5c3":"card file box","1f5c4":"file cabinet","1f5d1":"wastebasket","1f5d2":"spiral note pad","1f5d3":"spiral calendar pad","1f5dc":"compression","1f5dd":"old key","1f5de":"rolled-up newspaper","1f5e1":"dagger knife","1f5e3":"speaking head in silhouette","1f5e8":"left speech bubble","1f5ef":"right anger bubble","1f5f3":"ballot box with ballot","1f5fa":"world map","1f5fb":"mount fuji","1f5fc":"tokyo tower","1f5fd":"statue of liberty","1f5fe":"silhouette of japan","1f5ff":"moyai","1f600":"grinning face","1f601":"grinning face with smiling eyes","1f602":"face with tears of joy","1f603":"smiling face with open mouth","1f604":"smiling face with open mouth and smiling eyes","1f605":"smiling face with open mouth and cold sweat","1f606":"smiling face with open mouth and tightly-closed eyes","1f607":"smiling face with halo","1f608":"smiling face with horns","1f609":"winking face","1f60a":"smiling face with smiling eyes","1f60b":"face savouring delicious food","1f60c":"relieved face","1f60d":"smiling face with heart-shaped eyes","1f60e":"smiling face with sunglasses","1f60f":"smirking face","1f610":"neutral face","1f611":"expressionless face","1f612":"unamused face","1f613":"face with cold sweat","1f614":"pensive face","1f615":"confused face","1f616":"confounded face","1f617":"kissing face","1f618":"face throwing a kiss","1f619":"kissing face with smiling eyes","1f61a":"kissing face with closed eyes","1f61b":"face with stuck-out tongue","1f61c":"face with stuck-out tongue and winking eye","1f61d":"face with stuck-out tongue and tightly-closed eyes","1f61e":"disappointed face","1f61f":"worried face","1f620":"angry face","1f621":"pouting face","1f622":"crying face","1f623":"persevering face","1f624":"face with look of triumph","1f625":"disappointed but relieved face","1f626":"frowning face with open mouth","1f627":"anguished face","1f628":"fearful face","1f629":"weary face","1f62a":"sleepy face","1f62b":"tired face","1f62c":"grimacing face","1f62d":"loudly crying face","1f62e":"face with open mouth","1f62f":"hushed face","1f630":"face with open mouth and cold sweat","1f631":"face screaming in fear","1f632":"astonished face","1f633":"flushed face","1f634":"sleeping face","1f635":"dizzy face","1f636":"face without mouth","1f637":"face with medical mask","1f638":"grinning cat face with smiling eyes","1f639":"cat face with tears of joy","1f63a":"smiling cat face with open mouth","1f63b":"smiling cat face with heart-shaped eyes","1f63c":"cat face with wry smile","1f63d":"kissing cat face with closed eyes","1f63e":"pouting cat face","1f63f":"crying cat face","1f640":"weary cat face","1f641":"slightly frowning face","1f642":"slightly smiling face","1f643":"upside-down face","1f644":"face with rolling eyes","1f645":"face with no good gesture","1f646":"face with ok gesture","1f647":"person bowing deeply","1f648":"see-no-evil monkey","1f649":"hear-no-evil monkey","1f64a":"speak-no-evil monkey","1f64b":"happy person raising one hand","1f64c":"person raising both hands in celebration","1f64d":"person frowning","1f64e":"person with pouting face","1f64f":"person with folded hands","1f680":"rocket","1f681":"helicopter","1f682":"steam locomotive","1f683":"railway car","1f684":"high-speed train","1f685":"high-speed train with bullet nose","1f686":"train","1f687":"metro","1f688":"light rail","1f689":"station","1f68a":"tram","1f68b":"tram car","1f68c":"bus","1f68d":"oncoming bus","1f68e":"trolleybus","1f68f":"bus stop","1f690":"minibus","1f691":"ambulance","1f692":"fire engine","1f693":"police car","1f694":"oncoming police car","1f695":"taxi","1f696":"oncoming taxi","1f697":"automobile","1f698":"oncoming automobile","1f699":"recreational vehicle","1f69a":"delivery truck","1f69b":"articulated lorry","1f69c":"tractor","1f69d":"monorail","1f69e":"mountain railway","1f69f":"suspension railway","1f6a0":"mountain cableway","1f6a1":"aerial tramway","1f6a2":"ship","1f6a3":"rowboat","1f6a4":"speedboat","1f6a5":"horizontal traffic light","1f6a6":"vertical traffic light","1f6a7":"construction sign","1f6a8":"police cars revolving light","1f6a9":"triangular flag on post","1f6aa":"door","1f6ab":"no entry sign","1f6ac":"smoking symbol","1f6ad":"no smoking symbol","1f6ae":"put litter in its place symbol","1f6af":"do not litter symbol","1f6b0":"potable water symbol","1f6b1":"non-potable water symbol","1f6b2":"bicycle","1f6b3":"no bicycles","1f6b4":"bicyclist","1f6b5":"mountain bicyclist","1f6b6":"pedestrian","1f6b7":"no pedestrians","1f6b8":"children crossing","1f6b9":"mens symbol","1f6ba":"womens symbol","1f6bb":"restroom","1f6bc":"baby symbol","1f6bd":"toilet","1f6be":"water closet","1f6bf":"shower","1f6c0":"bath","1f6c1":"bathtub","1f6c2":"passport control","1f6c3":"customs","1f6c4":"baggage claim","1f6c5":"left luggage","1f6cb":"couch and lamp","1f6cc":"sleeping accommodation","1f6cd":"shopping bags","1f6ce":"bellhop bell","1f6cf":"bed","1f6d0":"place of worship","1f6d1":"octagonal sign","1f6d2":"shopping trolley","1f6d5":"hindu temple","1f6d6":"hut","1f6d7":"elevator","1f6dc":"wireless","1f6dd":"playground slide","1f6de":"wheel","1f6df":"ring buoy","1f6e0":"hammer and wrench","1f6e1":"shield","1f6e2":"oil drum","1f6e3":"motorway","1f6e4":"railway track","1f6e5":"motor boat","1f6e9":"small airplane","1f6eb":"airplane departure","1f6ec":"airplane arriving","1f6f0":"satellite","1f6f3":"passenger ship","1f6f4":"scooter","1f6f5":"motor scooter","1f6f6":"canoe","1f6f7":"sled","1f6f8":"flying saucer","1f6f9":"skateboard","1f6fa":"auto rickshaw","1f6fb":"pickup truck","1f6fc":"roller skate","1f7e0":"large orange circle","1f7e1":"large yellow circle","1f7e2":"large green circle","1f7e3":"large purple circle","1f7e4":"large brown circle","1f7e5":"large red square","1f7e6":"large blue square","1f7e7":"large orange square","1f7e8":"large yellow square","1f7e9":"large green square","1f7ea":"large purple square","1f7eb":"large brown square","1f7f0":"heavy equals sign","1f90c":"pinched fingers","1f90d":"white heart","1f90e":"brown heart","1f90f":"pinching hand","1f910":"zipper-mouth face","1f911":"money-mouth face","1f912":"face with thermometer","1f913":"nerd face","1f914":"thinking face","1f915":"face with head-bandage","1f916":"robot face","1f917":"hugging face","1f918":"sign of the horns","1f919":"call me hand","1f91a":"raised back of hand","1f91b":"left-facing fist","1f91c":"right-facing fist","1f91d":"handshake","1f91e":"hand with index and middle fingers crossed","1f91f":"i love you hand sign","1f920":"face with cowboy hat","1f921":"clown face","1f922":"nauseated face","1f923":"rolling on the floor laughing","1f924":"drooling face","1f925":"lying face","1f926":"face palm","1f927":"sneezing face","1f928":"face with one eyebrow raised","1f929":"grinning face with star eyes","1f92a":"grinning face with one large and one small eye","1f92b":"face with finger covering closed lips","1f92c":"serious face with symbols covering mouth","1f92d":"smiling face with smiling eyes and hand covering mouth","1f92e":"face with open mouth vomiting","1f92f":"shocked face with exploding head","1f930":"pregnant woman","1f931":"breast-feeding","1f932":"palms up together","1f933":"selfie","1f934":"prince","1f935":"man in tuxedo","1f936":"mother christmas","1f937":"shrug","1f938":"person doing cartwheel","1f939":"juggling","1f93a":"fencer","1f93c":"wrestlers","1f93d":"water polo","1f93e":"handball","1f93f":"diving mask","1f940":"wilted flower","1f941":"drum with drumsticks","1f942":"clinking glasses","1f943":"tumbler glass","1f944":"spoon","1f945":"goal net","1f947":"first place medal","1f948":"second place medal","1f949":"third place medal","1f94a":"boxing glove","1f94b":"martial arts uniform","1f94c":"curling stone","1f94d":"lacrosse stick and ball","1f94e":"softball","1f94f":"flying disc","1f950":"croissant","1f951":"avocado","1f952":"cucumber","1f953":"bacon","1f954":"potato","1f955":"carrot","1f956":"baguette bread","1f957":"green salad","1f958":"shallow pan of food","1f959":"stuffed flatbread","1f95a":"egg","1f95b":"glass of milk","1f95c":"peanuts","1f95d":"kiwifruit","1f95e":"pancakes","1f95f":"dumpling","1f960":"fortune cookie","1f961":"takeout box","1f962":"chopsticks","1f963":"bowl with spoon","1f964":"cup with straw","1f965":"coconut","1f966":"broccoli","1f967":"pie","1f968":"pretzel","1f969":"cut of meat","1f96a":"sandwich","1f96b":"canned food","1f96c":"leafy green","1f96d":"mango","1f96e":"moon cake","1f96f":"bagel","1f970":"smiling face with smiling eyes and three hearts","1f971":"yawning face","1f972":"smiling face with tear","1f973":"face with party horn and party hat","1f974":"face with uneven eyes and wavy mouth","1f975":"overheated face","1f976":"freezing face","1f977":"ninja","1f978":"disguised face","1f979":"face holding back tears","1f97a":"face with pleading eyes","1f97b":"sari","1f97c":"lab coat","1f97d":"goggles","1f97e":"hiking boot","1f97f":"flat shoe","1f980":"crab","1f981":"lion face","1f982":"scorpion","1f983":"turkey","1f984":"unicorn face","1f985":"eagle","1f986":"duck","1f987":"bat","1f988":"shark","1f989":"owl","1f98a":"fox face","1f98b":"butterfly","1f98c":"deer","1f98d":"gorilla","1f98e":"lizard","1f98f":"rhinoceros","1f990":"shrimp","1f991":"squid","1f992":"giraffe face","1f993":"zebra face","1f994":"hedgehog","1f995":"sauropod","1f996":"t-rex","1f997":"cricket","1f998":"kangaroo","1f999":"llama","1f99a":"peacock","1f99b":"hippopotamus","1f99c":"parrot","1f99d":"raccoon","1f99e":"lobster","1f99f":"mosquito","1f9a0":"microbe","1f9a1":"badger","1f9a2":"swan","1f9a3":"mammoth","1f9a4":"dodo","1f9a5":"sloth","1f9a6":"otter","1f9a7":"orangutan","1f9a8":"skunk","1f9a9":"flamingo","1f9aa":"oyster","1f9ab":"beaver","1f9ac":"bison","1f9ad":"seal","1f9ae":"guide dog","1f9af":"probing cane","1f9b0":"emoji component red hair","1f9b1":"emoji component curly hair","1f9b2":"emoji component bald","1f9b3":"emoji component white hair","1f9b4":"bone","1f9b5":"leg","1f9b6":"foot","1f9b7":"tooth","1f9b8":"superhero","1f9b9":"supervillain","1f9ba":"safety vest","1f9bb":"ear with hearing aid","1f9bc":"motorized wheelchair","1f9bd":"manual wheelchair","1f9be":"mechanical arm","1f9bf":"mechanical leg","1f9c0":"cheese wedge","1f9c1":"cupcake","1f9c2":"salt shaker","1f9c3":"beverage box","1f9c4":"garlic","1f9c5":"onion","1f9c6":"falafel","1f9c7":"waffle","1f9c8":"butter","1f9c9":"mate drink","1f9ca":"ice cube","1f9cb":"bubble tea","1f9cc":"troll","1f9cd":"standing person","1f9ce":"kneeling person","1f9cf":"deaf person","1f9d0":"face with monocle","1f9d1":"adult","1f9d2":"child","1f9d3":"older adult","1f9d4":"bearded person","1f9d5":"person with headscarf","1f9d6":"person in steamy room","1f9d7":"person climbing","1f9d8":"person in lotus position","1f9d9":"mage","1f9da":"fairy","1f9db":"vampire","1f9dc":"merperson","1f9dd":"elf","1f9de":"genie","1f9df":"zombie","1f9e0":"brain","1f9e1":"orange heart","1f9e2":"billed cap","1f9e3":"scarf","1f9e4":"gloves","1f9e5":"coat","1f9e6":"socks","1f9e7":"red gift envelope","1f9e8":"firecracker","1f9e9":"jigsaw puzzle piece","1f9ea":"test tube","1f9eb":"petri dish","1f9ec":"dna double helix","1f9ed":"compass","1f9ee":"abacus","1f9ef":"fire extinguisher","1f9f0":"toolbox","1f9f1":"brick","1f9f2":"magnet","1f9f3":"luggage","1f9f4":"lotion bottle","1f9f5":"spool of thread","1f9f6":"ball of yarn","1f9f7":"safety pin","1f9f8":"teddy bear","1f9f9":"broom","1f9fa":"basket","1f9fb":"roll of paper","1f9fc":"bar of soap","1f9fd":"sponge","1f9fe":"receipt","1f9ff":"nazar amulet","1fa70":"ballet shoes","1fa71":"one-piece swimsuit","1fa72":"briefs","1fa73":"shorts","1fa74":"thong sandal","1fa75":"light blue heart","1fa76":"grey heart","1fa77":"pink heart","1fa78":"drop of blood","1fa79":"adhesive bandage","1fa7a":"stethoscope","1fa7b":"x-ray","1fa7c":"crutch","1fa80":"yo-yo","1fa81":"kite","1fa82":"parachute","1fa83":"boomerang","1fa84":"magic wand","1fa85":"pinata","1fa86":"nesting dolls","1fa87":"maracas","1fa88":"flute","1fa90":"ringed planet","1fa91":"chair","1fa92":"razor","1fa93":"axe","1fa94":"diya lamp","1fa95":"banjo","1fa96":"military helmet","1fa97":"accordion","1fa98":"long drum","1fa99":"coin","1fa9a":"carpentry saw","1fa9b":"screwdriver","1fa9c":"ladder","1fa9d":"hook","1fa9e":"mirror","1fa9f":"window","1faa0":"plunger","1faa1":"sewing needle","1faa2":"knot","1faa3":"bucket","1faa4":"mouse trap","1faa5":"toothbrush","1faa6":"headstone","1faa7":"placard","1faa8":"rock","1faa9":"mirror ball","1faaa":"identification card","1faab":"low battery","1faac":"hamsa","1faad":"folding hand fan","1faae":"hair pick","1faaf":"khanda","1fab0":"fly","1fab1":"worm","1fab2":"beetle","1fab3":"cockroach","1fab4":"potted plant","1fab5":"wood","1fab6":"feather","1fab7":"lotus","1fab8":"coral","1fab9":"empty nest","1faba":"nest with eggs","1fabb":"hyacinth","1fabc":"jellyfish","1fabd":"wing","1fabf":"goose","1fac0":"anatomical heart","1fac1":"lungs","1fac2":"people hugging","1fac3":"pregnant man","1fac4":"pregnant person","1fac5":"person with crown","1face":"moose","1facf":"donkey","1fad0":"blueberries","1fad1":"bell pepper","1fad2":"olive","1fad3":"flatbread","1fad4":"tamale","1fad5":"fondue","1fad6":"teapot","1fad7":"pouring liquid","1fad8":"beans","1fad9":"jar","1fada":"ginger root","1fadb":"pea pod","1fae0":"melting face","1fae1":"saluting face","1fae2":"face with open eyes and hand over mouth","1fae3":"face with peeking eye","1fae4":"face with diagonal mouth","1fae5":"dotted line face","1fae6":"biting lip","1fae7":"bubbles","1fae8":"shaking face","1faf0":"hand with index finger and thumb crossed","1faf1":"rightwards hand","1faf2":"leftwards hand","1faf3":"palm down hand","1faf4":"palm up hand","1faf5":"index pointing at the viewer","1faf6":"heart hands","1faf7":"leftwards pushing hand","1faf8":"rightwards pushing hand","2194":"left right arrow","2195":"up down arrow","23":"number sign","2a":"asterisk","30":"digit zero","31":"digit one","32":"digit two","33":"digit three","34":"digit four","35":"digit five","36":"digit six","37":"digit seven","38":"digit eight","39":"digit nine"};
const EMOJI_SKIN_TONE_SEARCH_NAMES = {
  '1f3fb': 'light skin tone',
  '1f3fc': 'medium light skin tone',
  '1f3fd': 'medium skin tone',
  '1f3fe': 'medium dark skin tone',
  '1f3ff': 'dark skin tone',
};
const EMOJI_SEARCH_NAME_CACHE = new Map();
let emojiRegionDisplayNames = null;
try { emojiRegionDisplayNames = new Intl.DisplayNames(['en'], { type: 'region' }); } catch { /* optional */ }

function flagRegionCode(emoji) {
  const codePoints = Array.from(emoji, (char) => char.codePointAt(0));
  if (codePoints.length !== 2 || !codePoints.every((cp) => cp >= 0x1f1e6 && cp <= 0x1f1ff)) return '';
  return codePoints.map((cp) => String.fromCharCode(65 + cp - 0x1f1e6)).join('');
}

function nativeEmojiSearchName(emoji) {
  if (EMOJI_SEARCH_NAME_CACHE.has(emoji)) return EMOJI_SEARCH_NAME_CACHE.get(emoji);
  const regionCode = flagRegionCode(emoji);
  if (regionCode) {
    let regionName = regionCode;
    try { regionName = emojiRegionDisplayNames?.of(regionCode) || regionCode; } catch { /* fallback */ }
    const label = `flag ${regionName} ${regionCode}`.toLowerCase();
    EMOJI_SEARCH_NAME_CACHE.set(emoji, label);
    return label;
  }
  const parts = [];
  for (const char of Array.from(emoji)) {
    const cp = char.codePointAt(0);
    if (cp === 0xfe0f || cp === 0x200d || cp === 0x20e3) continue;
    const key = cp.toString(16);
    const friendlyTone = EMOJI_SKIN_TONE_SEARCH_NAMES[key];
    const name = friendlyTone || EMOJI_CODEPOINT_SEARCH_NAMES[key];
    if (name && !parts.includes(name)) parts.push(name);
  }
  const label = parts.join(' ');
  EMOJI_SEARCH_NAME_CACHE.set(emoji, label);
  return label;
}

const UNIVERSAL_EDIT_BOX_SELECTOR = [
  '.post-card', '.lumina-banner', '.feed-empty', '.lumina-project-hero',
  '.lumina-intro-card', '.lumina-principles > article', '.lumina-wide-action', '.lumina-metro-panel',
  '.lumina-station-detail', '.lumina-community-section', '.lumina-share-card', '.upload-wrap',
  '.drop-zone', '.preview-wrap', '.suggestion-card', '.update-card', '.profile-wrap', '.profile-section',
  '.profile-danger-zone', '.search-wrap', '.user-row', '.admin-post-row', '.site-editor', '.modal-card',
  '.plaza-plus-hero', '.plaza-plus-panel', '.collection-card', '.event-card', '.group-card', '.project-card',
  '.wiki-card', '.creator-grid > article', '.profile-custom-section', '.post-poll', '.chat-media-gallery'
].join(',');
const UNIVERSAL_EDIT_TEXT_SELECTOR = 'h1,h2,h3,h4,p,small,span,b,strong,em';


async function safeGet(key, shared) {
  try {
    return await window.storage.get(key, shared);
  } catch {
    return null;
  }
}

function storageArray(record) {
  if (!record?.value) return [];
  try {
    const parsed = JSON.parse(record.value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function loadPostsRecordForSpace(space = 'rums4') {
  const keys = storageKeysForSpace(space);
  const mainRecord = await safeGet(keys.posts, true);
  if (space !== 'rums4') return mainRecord;

  const mainPosts = storageArray(mainRecord);
  const generalPosts = mainPosts.filter((post) => post?.tag !== 'Lumina');
  const legacyLuminaPosts = mainPosts.filter((post) => post?.tag === 'Lumina');
  const luminaRecord = await safeGet(LUMINA_POSTS_KEY, true);
  const dedicatedLuminaPosts = storageArray(luminaRecord);
  const mergedLumina = [...new Map([...legacyLuminaPosts, ...dedicatedLuminaPosts].filter((post) => post?.id).map((post) => [post.id, post])).values()]
    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  // One-time safe migration: write Lumina first, then shrink the old RUMS 4 record.
  // If the second write fails, duplicates are harmless because reads de-duplicate by id.
  if (legacyLuminaPosts.length) {
    try {
      await window.storage.set(LUMINA_POSTS_KEY, JSON.stringify(mergedLumina), true);
      await window.storage.set(keys.posts, JSON.stringify(generalPosts), true);
    } catch (error) {
      console.error('Could not migrate Lumina posts yet', error);
    }
  }

  return { value: JSON.stringify([...generalPosts, ...mergedLumina].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))) };
}

async function persistPostsForSpace(space = 'rums4', posts = []) {
  const keys = storageKeysForSpace(space);
  if (space !== 'rums4') {
    await window.storage.set(keys.posts, JSON.stringify(posts), true);
    return;
  }

  const generalPosts = posts.filter((post) => post?.tag !== 'Lumina');
  const luminaPosts = posts.filter((post) => post?.tag === 'Lumina');
  // Save the new Lumina record first so an interrupted migration cannot lose posts.
  await window.storage.set(LUMINA_POSTS_KEY, JSON.stringify(luminaPosts), true);
  await window.storage.set(keys.posts, JSON.stringify(generalPosts), true);
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


function readMediaFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(String(event.target?.result || ''));
    reader.onerror = () => reject(new Error('read failed'));
    reader.readAsDataURL(file);
  });
}

function newsVideoInfo(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return null;
  if (raw.startsWith('data:video/')) return { kind: 'video', src: raw };
  try {
    const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    const url = new URL(normalized);
    const host = url.hostname.replace(/^www\./, '').toLowerCase();
    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      if (id) return { kind: 'embed', src: `https://www.youtube.com/embed/${id}` };
    }
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const id = url.searchParams.get('v') || (url.pathname.startsWith('/shorts/') ? url.pathname.split('/')[2] : '') || (url.pathname.startsWith('/embed/') ? url.pathname.split('/')[2] : '');
      if (id) return { kind: 'embed', src: `https://www.youtube.com/embed/${id}` };
    }
    if (host === 'vimeo.com' || host === 'player.vimeo.com') {
      const parts = url.pathname.split('/').filter(Boolean);
      const id = parts.find((part) => /^\d+$/.test(part));
      if (id) return { kind: 'embed', src: `https://player.vimeo.com/video/${id}` };
    }
    return { kind: 'video', src: url.href };
  } catch {
    return null;
  }
}

function NewsVideo({ src, title = 'News video' }) {
  const info = newsVideoInfo(src);
  if (!info) return null;
  if (info.kind === 'embed') {
    return <div className="news-video-frame"><iframe src={info.src} title={title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen loading="lazy" /></div>;
  }
  return <div className="news-video-frame"><video src={info.src} controls playsInline preload="metadata" /></div>;
}

function resizeEmojiImage(file, size = 96) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, size / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, size, size);
        ctx.drawImage(img, Math.round((size - width) / 2), Math.round((size - height) / 2), width, height);
        resolve(canvas.toDataURL('image/webp', 0.86));
      };
      img.onerror = () => reject(new Error('bad image'));
      img.src = ev.target.result;
    };
    reader.onerror = () => reject(new Error('read failed'));
    reader.readAsDataURL(file);
  });
}

export default function RUMS() {
  const [updateUntil, setUpdateUntil] = useState(0);
  const [updateTargetVersion, setUpdateTargetVersion] = useState('');
  const [updateTrackId] = useState(() => pickUpdateAudioTrack());
  const updateTrack = UPDATE_AUDIO_TRACKS.find((track) => track.id === updateTrackId) || UPDATE_AUDIO_TRACKS[0];
  const updateAudioContextRef = useRef(null);
  const updateAudioBufferRef = useRef(null);
  const updateAudioSourceRef = useRef(null);
  const updateAudioGainRef = useRef(null);
  const updateAudioLoadingRef = useRef(null);
  const updateStartedForVersionRef = useRef('');
  const [updateMusicState, setUpdateMusicState] = useState('ready');

  const ensureUpdateAudioReady = async ({ resume = false } = {}) => {
    if (typeof window === 'undefined') return null;
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) return null;

    if (!updateAudioContextRef.current) {
      const context = new AudioContextCtor();
      const gain = context.createGain();
      gain.gain.value = 0.72;
      gain.connect(context.destination);
      updateAudioContextRef.current = context;
      updateAudioGainRef.current = gain;
    }

    const context = updateAudioContextRef.current;
    if (resume && context.state !== 'running') {
      try { await context.resume(); } catch { /* browser may require another gesture */ }
    }

    if (!updateAudioBufferRef.current) {
      if (!updateAudioLoadingRef.current) {
        updateAudioLoadingRef.current = fetch(updateTrack.src, { cache: 'force-cache' })
          .then((response) => {
            if (!response.ok) throw new Error('Could not load update soundtrack');
            return response.arrayBuffer();
          })
          .then((bytes) => context.decodeAudioData(bytes.slice(0)))
          .then((buffer) => {
            updateAudioBufferRef.current = buffer;
            return buffer;
          })
          .catch((error) => {
            updateAudioLoadingRef.current = null;
            throw error;
          });
      }
      try { await updateAudioLoadingRef.current; } catch { return null; }
    }

    return context;
  };

  const startUpdateMusic = async () => {
    setUpdateMusicState('starting');
    const context = await ensureUpdateAudioReady({ resume: true });
    if (!context || context.state !== 'running' || !updateAudioBufferRef.current) {
      setUpdateMusicState('blocked');
      return false;
    }

    try {
      if (updateAudioSourceRef.current) {
        try { updateAudioSourceRef.current.stop(); } catch {}
        updateAudioSourceRef.current.disconnect();
      }
      const source = context.createBufferSource();
      source.buffer = updateAudioBufferRef.current;
      source.connect(updateAudioGainRef.current);
      source.addEventListener('ended', () => {
        if (updateUntil > Date.now()) setUpdateMusicState('paused');
      }, { once: true });
      updateAudioSourceRef.current = source;
      source.start(0);
      setUpdateMusicState('playing');
      return true;
    } catch {
      setUpdateMusicState('blocked');
      return false;
    }
  };

  useEffect(() => {
    // Unlock one persistent Web Audio context from the user's first ordinary
    // Plaza interaction. Once running, this context can start the local update
    // soundtrack later without creating a fresh media element at update time.
    let armed = false;
    const arm = async () => {
      if (armed) return;
      armed = true;
      const context = await ensureUpdateAudioReady({ resume: true });
      if (!context || context.state !== 'running') armed = false;
      else setUpdateMusicState('ready');
    };
    document.addEventListener('pointerdown', arm, { capture: true, passive: true });
    document.addEventListener('keydown', arm, true);
    return () => {
      document.removeEventListener('pointerdown', arm, true);
      document.removeEventListener('keydown', arm, true);
    };
  }, [updateTrack.src]);

  useEffect(() => {
    if (!import.meta.env.PROD) return undefined;
    let stopped = false;
    let checking = false;
    const checkForUpdate = async () => {
      if (stopped || checking || !navigator.onLine || updateUntil > Date.now()) return;
      checking = true;
      try {
        const response = await fetch(`/version.json?check=${Date.now()}`, { cache: 'no-store' });
        if (!response.ok) return;
        const { version } = await response.json();
        if (stopped || !version || version === __RUMS_BUILD_ID__) return;
        if (updateStartedForVersionRef.current === version) return;
        updateStartedForVersionRef.current = version;
        setUpdateTargetVersion(version);
        setUpdateUntil(Date.now() + UPDATE_SCREEN_MS);
      } catch { /* stay on current build when offline/check fails */ }
      finally { checking = false; }
    };
    void checkForUpdate();
    const timer = window.setInterval(checkForUpdate, 15000);
    const onVisible = () => { if (!document.hidden) void checkForUpdate(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      stopped = true;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [updateUntil]);

  useEffect(() => {
    if (!updateUntil || updateUntil <= Date.now()) return undefined;
    let cancelled = false;
    const launch = async () => {
      const context = await ensureUpdateAudioReady({ resume: false });
      if (cancelled) return;
      if (context?.state === 'running') {
        await startUpdateMusic();
      } else {
        setUpdateMusicState('blocked');
      }
    };
    void launch();
    return () => { cancelled = true; };
  }, [updateUntil, updateTrack.src]);

  useEffect(() => {
    if (!updateUntil || !updateTargetVersion) return undefined;
    const timer = window.setTimeout(() => {
      if (updateAudioSourceRef.current) {
        try { updateAudioSourceRef.current.stop(); } catch {}
        try { updateAudioSourceRef.current.disconnect(); } catch {}
        updateAudioSourceRef.current = null;
      }
      try {
        localStorage.setItem(UPDATE_SEEN_KEY, updateTargetVersion);
        sessionStorage.removeItem(UPDATE_SCREEN_KEY);
        sessionStorage.removeItem(UPDATE_RELOAD_KEY);
      } catch { /* ignore */ }
      window.location.reload();
    }, Math.max(0, updateUntil - Date.now()));
    return () => window.clearTimeout(timer);
  }, [updateUntil, updateTargetVersion]);

  useEffect(() => () => {
    if (updateAudioSourceRef.current) {
      try { updateAudioSourceRef.current.stop(); } catch {}
      try { updateAudioSourceRef.current.disconnect(); } catch {}
    }
    if (updateAudioContextRef.current) {
      try { updateAudioContextRef.current.close(); } catch {}
    }
  }, []);

  useEffect(() => {
    document.title = PLATFORM_NAME;
    let manifest = document.querySelector('link[rel="manifest"]');
    if (!manifest) { manifest = document.createElement('link'); manifest.rel = 'manifest'; manifest.href = '/manifest.webmanifest'; document.head.appendChild(manifest); }
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
  }, []);
  const [screen, setScreen] = useState('spaceSelect');
  const [entryAuth, setEntryAuth] = useState(false);
  const [entrySessionReady, setEntrySessionReady] = useState(false);
  const [rumsSpace, setRumsSpace] = useState(null);
  const [sharedPostRequest] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const postId = params.get('post');
      const space = params.get('space');
      return postId && isContentSpaceId(space) ? { postId, space } : null;
    } catch {
      return null;
    }
  });
  const [spaceSwitchBusy, setSpaceSwitchBusy] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [plazaNews, setPlazaNews] = useState([]);
  const [newsFilter, setNewsFilter] = useState('All');
  const [newsSelectedId, setNewsSelectedId] = useState(null);
  const [newsComposeOpen, setNewsComposeOpen] = useState(false);
  const [newsDraft, setNewsDraft] = useState({ title: '', summary: '', body: '', category: 'Plaza', source: 'RUMS 4', image: '', video: '', breaking: false, pinned: false });
  const [newsBusy, setNewsBusy] = useState(false);
  const [newsImageBusy, setNewsImageBusy] = useState(false);
  const [newsVideoBusy, setNewsVideoBusy] = useState(false);
  const [newsCommentDrafts, setNewsCommentDrafts] = useState({});
  const [siteAnnouncement, setSiteAnnouncement] = useState(null);
  const [announcementDraft, setAnnouncementDraft] = useState('');
  const [announcementBusy, setAnnouncementBusy] = useState(false);
  const [dismissedAnnouncement, setDismissedAnnouncement] = useState({ username: '', id: '' });
  const [chatMessages, setChatMessages] = useState([]);
  const [chatReadState, setChatReadState] = useState({});
  const [chatSeenReceipt, setChatSeenReceipt] = useState({ threadId: '', id: '' });
  const [activeChat, setActiveChat] = useState('plaza');
  const [chatDraft, setChatDraft] = useState('');
  const [chatImageDraft, setChatImageDraft] = useState('');
  const [chatGifDraft, setChatGifDraft] = useState(null);
  const [gifPickerOpen, setGifPickerOpen] = useState(false);
  const [gifQuery, setGifQuery] = useState('');
  const [gifResults, setGifResults] = useState([]);
  const [gifNext, setGifNext] = useState('');
  const [gifLoading, setGifLoading] = useState(false);
  const [gifError, setGifError] = useState('');
  const gifSearchTimerRef = useRef(null);
  const gifSearchRequestRef = useRef(0);
  const [chatSearch, setChatSearch] = useState('');
  const [chatListOpen, setChatListOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatBusy, setChatBusy] = useState(false);
  const [chatImageBusy, setChatImageBusy] = useState(false);
  const [plazaPlus, setPlazaPlus] = useState(DEFAULT_PLAZA_PLUS);
  const [notificationRead, setNotificationRead] = useState({ username: null, at: 0 });
  const [plusTab, setPlusTab] = useState('notifications');
  const [followingOnly, setFollowingOnly] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const [profileEdit, setProfileEdit] = useState({ bio: '', status: 'Online', accent: '#3478f6', banner: '' });
  const [profileSectionDraft, setProfileSectionDraft] = useState({ title: '', body: '' });
  const [collectionDraft, setCollectionDraft] = useState('');
  const [activeCollectionId, setActiveCollectionId] = useState(null);
  const [collectionRenameDraft, setCollectionRenameDraft] = useState('');
  const [collectionEditing, setCollectionEditing] = useState(false);
  const [eventDraft, setEventDraft] = useState({ title: '', when: '', location: '', description: '' });
  const [groupDraft, setGroupDraft] = useState({ name: '', description: '' });
  const [projectDraft, setProjectDraft] = useState({ name: '', description: '', category: 'rums4' });
  const [projectCreateOpen, setProjectCreateOpen] = useState(false);
  const [projectCategory, setProjectCategory] = useState('rums4');
  const [projectDirectoryProjects, setProjectDirectoryProjects] = useState([]);
  const [projectRecord, setProjectRecord] = useState(null);
  const [projectImageBusy, setProjectImageBusy] = useState(false);
  const [projectTab, setProjectTab] = useState('overview');
  const [projectTopicDraft, setProjectTopicDraft] = useState({ title: '', body: '' });
  const [projectReplyDraft, setProjectReplyDraft] = useState({});
  const [projectUpdateDraft, setProjectUpdateDraft] = useState({ title: '', body: '' });
  const [projectCardDraft, setProjectCardDraft] = useState('');
  const [projectCardImage, setProjectCardImage] = useState('');
  const [projectOpenTopic, setProjectOpenTopic] = useState(null);
  const [projectEditField, setProjectEditField] = useState(null);
  const [projectEditValue, setProjectEditValue] = useState('');
  const [wikiDraft, setWikiDraft] = useState({ title: '', body: '' });
  const [buildDraft, setBuildDraft] = useState({ name: '', location: '', owner: '', description: '' });
  const [reportDraft, setReportDraft] = useState({ target: '', reason: '' });
  const [chatReplyTo, setChatReplyTo] = useState(null);
  const [chatMediaOpen, setChatMediaOpen] = useState(false);
  const [chatReactionOpen, setChatReactionOpen] = useState(null);
  const [draftCaption, setDraftCaption] = useState('');
  const [scheduleWhen, setScheduleWhen] = useState('');
  const [searchFilters, setSearchFilters] = useState({ type: 'all', tag: 'all', author: '', from: '', to: '' });
  const [accessibilityPrefs, setAccessibilityPrefs] = useState({ reducedMotion: false, highContrast: false, largeText: false, reducedTransparency: false });
  const [themeBuilder, setThemeBuilder] = useState({ accent: '#3478f6', radius: 18, blur: 24 });
  const [customThemeEnabled, setCustomThemeEnabled] = useState(false);
  const [pageThemeTarget, setPageThemeTarget] = useState('feed');
  const [currentUser, setCurrentUser] = useState(null);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [pushStatus, setPushStatus] = useState('');
  const [error, setError] = useState('');
  const [actionToast, setActionToast] = useState(null);
  const actionToastTimerRef = useRef(null);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [tutorialActive, setTutorialActive] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [tutorialRect, setTutorialRect] = useState(null);
  const [tutorialNavRect, setTutorialNavRect] = useState(null);
  const [tutorialReturningUser, setTutorialReturningUser] = useState(false);
  const [tutorialActionPulse, setTutorialActionPulse] = useState(0);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [uploadGallery, setUploadGallery] = useState([]);
  const [postAltText, setPostAltText] = useState('');
  const [postLink, setPostLink] = useState('');
  const [postVideoUrl, setPostVideoUrl] = useState('');
  const [postPollDraft, setPostPollDraft] = useState({ question: '', options: ['', ''] });
  const [caption, setCaption] = useState('');
  const [tag, setTag] = useState('General');
  const [commentDrafts, setCommentDrafts] = useState({});
  const [commentReplyTo, setCommentReplyTo] = useState({});
  const [openComments, setOpenComments] = useState({});
  const [feedFilter, setFeedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [shareStatus, setShareStatus] = useState({});
  const [reactionMenus, setReactionMenus] = useState({});
  const [reactionPickerCategory, setReactionPickerCategory] = useState('smileys');
  const [reactionSearch, setReactionSearch] = useState('');
  const [customEmojis, setCustomEmojis] = useState([]);
  const [customEmojiDraft, setCustomEmojiDraft] = useState({ name: '', image: '' });
  const [customEmojiBusy, setCustomEmojiBusy] = useState(false);
  const [customEmojiStatus, setCustomEmojiStatus] = useState('');
  const [mention, setMention] = useState(null); // { postId, query, start }
  const [lastSeen, setLastSeen] = useState({ General: 0, Lumina: 0 });
  const [sessionNewItems, setSessionNewItems] = useState({});
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
  const [theme, setTheme] = useState(() => {
    try {
      const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
      return RUMS_THEMES.some((item) => item.id === saved) ? saved : 'standard';
    } catch { return 'standard'; }
  });
  const [robloxThemeMenuOpen, setRobloxThemeMenuOpen] = useState(() => {
    try { return (window.localStorage.getItem(THEME_STORAGE_KEY) || '').startsWith('roblox'); } catch { return false; }
  });
  const [frutigerThemeMenuOpen, setFrutigerThemeMenuOpen] = useState(() => {
    try { return FRUTIGER_THEME_IDS.includes(window.localStorage.getItem(THEME_STORAGE_KEY) || ''); } catch { return false; }
  });
  const [punkThemeMenuOpen, setPunkThemeMenuOpen] = useState(() => {
    try { return PUNK_THEME_IDS.includes(window.localStorage.getItem(THEME_STORAGE_KEY) || ''); } catch { return false; }
  });
  const [glassDragging, setGlassDragging] = useState(false);
  const [luminaView, setLuminaView] = useState('overview');
  const [activeLuminaStation, setActiveLuminaStation] = useState(1);
  const fileInputRef = useRef(null);
  const commentInputRefs = useRef({});
  const avatarInputRef = useRef(null);
  const chatImageInputRef = useRef(null);
  const chatMessageListRef = useRef(null);
  const chatPinnedRef = useRef(true);
  const rootRef = useRef(null);
  const siteConfigRef = useRef(DEFAULT_SITE_CONFIG);
  const spaceLoadTokenRef = useRef(0);
  const sessionKnownContentRef = useRef(new Set());
  const sessionNewTrackingSpaceRef = useRef(null);
  const sessionNewSeenTimersRef = useRef(new Map());
  const historyPastRef = useRef([]);
  const historyFutureRef = useRef([]);
  const historyApplyingRef = useRef(false);
  const tabsRef = useRef(null);
  const tabsDragRef = useRef(null);
  const [tabsDragging, setTabsDragging] = useState(false);
  const luminaTabsRef = useRef(null);
  const luminaTabsDragRef = useRef(null);
  const [luminaTabsDragging, setLuminaTabsDragging] = useState(false);
  const locationTabsRef = useRef(null);
  const locationTabsDragRef = useRef(null);
  const [locationTabsDragging, setLocationTabsDragging] = useState(false);
  const rumsVersionSwitchRef = useRef(null);
  const rumsVersionDragRef = useRef(null);
  const rumsVersionSuppressClickRef = useRef(false);
  const lastNotificationCountRef = useRef(0);
  const lastTypingWriteRef = useRef({});
  const [rumsVersionDragging, setRumsVersionDragging] = useState(false);
  const activeStorageKeys = storageKeysForSpace(rumsSpace || 'rums4');

  useEffect(() => { setMobileMenuOpen(false); }, [screen]);

  useEffect(() => {
    let stopped = false;
    const loadAnnouncement = async () => {
      try {
        const record = await safeGet(SITE_ANNOUNCEMENT_KEY, true);
        if (stopped) return;
        const parsed = record ? JSON.parse(record.value) : null;
        setSiteAnnouncement(parsed?.id && parsed?.text ? parsed : null);
      } catch (error) { console.error('Could not load site announcement', error); }
    };
    void loadAnnouncement();
    const timer = window.setInterval(loadAnnouncement, 5000);
    return () => { stopped = true; window.clearInterval(timer); };
  }, []);

  useEffect(() => {
    let stopped = false;
    const loadNews = async () => {
      try {
        const record = await safeGet(PLAZA_NEWS_KEY, true);
        if (stopped) return;
        const parsed = record ? JSON.parse(record.value) : [];
        if (Array.isArray(parsed)) setPlazaNews(parsed);
      } catch (error) { console.error('Could not load Plaza News', error); }
    };
    void loadNews();
    const timer = window.setInterval(loadNews, 5000);
    return () => { stopped = true; window.clearInterval(timer); };
  }, []);

  useEffect(() => {
    const username = currentUser?.username || 'guest';
    try {
      setDismissedAnnouncement({ username, id: localStorage.getItem(`rums-announcement-dismissed-${username}`) || '' });
    } catch { setDismissedAnnouncement({ username, id: '' }); }
  }, [currentUser?.username]);
  const isRums5 = rumsSpace === 'rums5';
  const isProjectSpace = isProjectSpaceId(rumsSpace);
  const activeProject = isProjectSpace ? (projectRecord?.id === projectIdFromSpace(rumsSpace) ? projectRecord : projectDirectoryProjects.find((project) => project.id === projectIdFromSpace(rumsSpace)) || (plazaPlus.projects || []).find((project) => project.id === projectIdFromSpace(rumsSpace))) : null;
  const hasLumina = rumsSpace === 'rums4';
  const activeSpace = isProjectSpace ? { id: rumsSpace, label: activeProject?.name || 'Project', subtitle: activeProject?.category === 'outside' ? 'Outside RUMS' : activeProject?.category === 'rums5' ? 'Creative project' : 'RUMS 4 project', description: activeProject?.description || 'Community project' } : (rumsSpace ? RUMS_SPACES[rumsSpace] : null);

  function pageKeyForPlacement(placement) {
    if (!placement) return null;
    if (BUILT_IN_PAGES.some(([id]) => id === placement)) return placement;
    return `custom:${placement}`;
  }

  function trackedContentEntries(sourcePosts = posts, sourceSuggestions = suggestions, sourceUpdates = updates, sourceConfig = siteConfig, space = rumsSpace || 'rums4') {
    const entries = [];
    const isSpace5 = space === 'rums5';
    for (const post of sourcePosts || []) {
      entries.push({ key: `feed|post:${post.id}`, page: 'feed', kind: 'post', id: post.id });
      if (!isSpace5 && post.tag === 'Lumina') entries.push({ key: `lumina|post:${post.id}`, page: 'lumina', kind: 'post', id: post.id });
    }
    for (const suggestion of sourceSuggestions || []) entries.push({ key: `suggestions|suggestion:${suggestion.id}`, page: 'suggestions', kind: 'suggestion', id: suggestion.id });
    for (const update of sourceUpdates || []) entries.push({ key: `updates|update:${update.id}`, page: 'updates', kind: 'update', id: update.id });
    for (const widget of sourceConfig?.customWidgets || []) {
      const page = pageKeyForPlacement(widget.placement);
      if (page && !(isSpace5 && page === 'lumina')) entries.push({ key: `${page}|widget:${widget.id}`, page, kind: 'widget', id: widget.id });
    }
    return entries;
  }

  function primeSessionNewBaseline(space, sourcePosts, sourceSuggestions, sourceUpdates, sourceConfig) {
    const entries = trackedContentEntries(sourcePosts, sourceSuggestions, sourceUpdates, sourceConfig, space);
    sessionKnownContentRef.current = new Set(entries.map((entry) => entry.key));
    sessionNewTrackingSpaceRef.current = space;
    sessionNewSeenTimersRef.current.forEach((timer) => clearTimeout(timer));
    sessionNewSeenTimersRef.current.clear();
    setSessionNewItems({});
  }

  function sessionNewCountOnPage(page) {
    return Object.values(sessionNewItems).filter((item) => item.page === page).length;
  }

  function hasSessionNewOnPage(page) {
    return sessionNewCountOnPage(page) > 0;
  }

  function isSessionNew(page, kind, id) {
    return Boolean(sessionNewItems[`${page}|${kind}:${id}`]);
  }

  function sessionNewKey(page, kind, id) {
    return `${page}|${kind}:${id}`;
  }

  function markSessionNewSeen(key) {
    setSessionNewItems((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function newContentLabel(page, kind, id) {
    return isSessionNew(page, kind, id) ? <span className="session-new-label">NEW</span> : null;
  }

  function navIconWithNew(icon, page, title = 'New content') {
    const count = sessionNewCountOnPage(page);
    const badgeText = count > 99 ? '99+' : String(count);
    const badgeTitle = count === 1 ? `1 ${title.toLowerCase()}` : `${count} ${title.toLowerCase()}`;
    return <span className="page-nav-icon">{icon}{count > 0 && <span className="page-new-indicator page-new-count" title={badgeTitle} aria-label={badgeTitle}>{badgeText}</span>}</span>;
  }


  function chatThreadForMessage(message, username = currentUser?.username) {
    if (!message || !username) return null;
    if (message.type === 'room' && message.room === CHAT_ROOM_ID) return 'plaza';
    if (message.type === 'group' && message.room) {
      const group = (plazaPlus.groups || []).find((g) => g.id === message.room);
      return group?.members?.includes(username) ? `group:${message.room}` : null;
    }
    if (message.type !== 'dm' || !Array.isArray(message.participants) || !message.participants.includes(username)) return null;
    const other = message.participants.find((name) => name !== username);
    return other ? `dm:${other}` : null;
  }

  function chatMessagesForThread(threadId = activeChat) {
    if (!currentUser) return [];
    return chatMessages
      .filter((message) => chatThreadForMessage(message, currentUser.username) === threadId)
      .slice()
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  function chatUnreadCount(threadId = null) {
    if (!currentUser) return 0;
    return chatMessages.filter((message) => {
      if (message.sender === currentUser.username) return false;
      const messageThread = chatThreadForMessage(message, currentUser.username);
      if (!messageThread || (threadId && messageThread !== threadId)) return false;
      return message.timestamp > Number(chatReadState[messageThread] || 0);
    }).length;
  }

  function chatNavIcon(size = 19) {
    const count = chatUnreadCount() + sessionNewCountOnPage('chat');
    const badgeText = count > 99 ? '99+' : String(count);
    const label = count === 1 ? '1 unread chat message' : `${count} unread chat messages`;
    return <span className="page-nav-icon"><MessageCircle size={size} />{count > 0 && <span className="page-new-indicator page-new-count chat-unread-count" title={label} aria-label={label}>{badgeText}</span>}</span>;
  }

  function activeChatLabel() {
    if (activeChat === 'plaza') return 'Plaza Chat';
    if (activeChat.startsWith('group:')) return (plazaPlus.groups || []).find((g) => g.id === activeChat.slice(6))?.name || 'Group chat';
    return activeChat.startsWith('dm:') ? activeChat.slice(3) : 'Chat';
  }

  async function commitPlazaPlus(mutator) {
    try {
      const record = await safeGet(PLAZA_PLUS_KEY, true);
      const latest = normalizePlazaPlus(record ? JSON.parse(record.value) : plazaPlus);
      const next = normalizePlazaPlus(typeof mutator === 'function' ? mutator(latest) : mutator);
      await window.storage.set(PLAZA_PLUS_KEY, JSON.stringify(next), true);
      setPlazaPlus(next);
      const previousIds = new Set((latest.activities || []).map((activity) => activity.id));
      const activityIds = (next.activities || []).filter((activity) => !previousIds.has(activity.id)).slice(0, 20).map((activity) => activity.id);
      if (activityIds.length) void fetch('/api/push', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'notify', activityIds }) }).catch(() => {});
      return next;
    } catch (e) {
      console.error(e);
      setError('Could not save that Plaza feature right now.');
      return null;
    }
  }

  function plusProfile(username = currentUser?.username) {
    return plazaPlus.profiles?.[username] || { bio: '', status: 'Online', accent: '#3478f6', banner: '', pinnedPostIds: [], profileSections: [] };
  }

  function presenceLabel(username) {
    const heartbeat = plazaPlus.presence?.[username];
    if (!heartbeat || Date.now() - Number(heartbeat.at || 0) > 90000) return 'Offline';
    return heartbeat.status || plusProfile(username).status || 'Online';
  }

  function followedUsers(username = currentUser?.username) {
    return plazaPlus.follows?.[username] || [];
  }

  function isFollowing(username) {
    return followedUsers().includes(username);
  }

  async function toggleFollow(username) {
    if (!currentUser || !username || username === currentUser.username) return;
    const nowFollowing = !isFollowing(username);
    await commitPlazaPlus((data) => {
      const mine = new Set(data.follows?.[currentUser.username] || []);
      if (nowFollowing) mine.add(username); else mine.delete(username);
      const activity = nowFollowing ? [{ id: `act-${Date.now()}-${Math.random().toString(36).slice(2,6)}`, type: 'follow', actor: currentUser.username, targetUser: username, text: `${currentUser.username} followed you`, timestamp: Date.now() }, ...(data.activities || [])].slice(0,800) : (data.activities || []);
      return { ...data, follows: { ...data.follows, [currentUser.username]: [...mine] }, activities: activity };
    });
  }

  function bookmarkedPosts(username = currentUser?.username) {
    return plazaPlus.bookmarks?.[username] || [];
  }

  function showActionToast(kind, message) {
    if (actionToastTimerRef.current) window.clearTimeout(actionToastTimerRef.current);
    setActionToast({ id: `${kind}-${Date.now()}`, kind, message });
    actionToastTimerRef.current = window.setTimeout(() => {
      setActionToast(null);
      actionToastTimerRef.current = null;
    }, 1900);
  }

  async function toggleBookmark(postId) {
    if (!currentUser) return;
    const wasBookmarked = bookmarkedPosts().includes(postId);
    const saved = await commitPlazaPlus((data) => {
      const mine = new Set(data.bookmarks?.[currentUser.username] || []);
      if (mine.has(postId)) mine.delete(postId); else mine.add(postId);
      return { ...data, bookmarks: { ...data.bookmarks, [currentUser.username]: [...mine] } };
    });
    if (saved) showActionToast('save', wasBookmarked ? 'Removed from saved posts' : 'Saved to Plaza+');
  }

  async function createCollection() {
    const name = collectionDraft.trim().slice(0, 40);
    if (!currentUser || !name) return;
    await commitPlazaPlus((data) => ({ ...data, collections: { ...data.collections, [currentUser.username]: [...(data.collections?.[currentUser.username] || []), { id: `col-${Date.now()}`, name, postIds: [] }] } }));
    setCollectionDraft('');
  }

  async function addPostToCollection(postId, collectionId) {
    if (!currentUser || !collectionId) return;
    await commitPlazaPlus((data) => ({ ...data, collections: { ...data.collections, [currentUser.username]: (data.collections?.[currentUser.username] || []).map((collection) => collection.id === collectionId ? { ...collection, postIds: [...new Set([...(collection.postIds || []), postId])] } : collection) } }));
  }

  async function removePostFromCollection(postId, collectionId) {
    if (!currentUser || !collectionId) return;
    await commitPlazaPlus((data) => ({
      ...data,
      collections: {
        ...data.collections,
        [currentUser.username]: (data.collections?.[currentUser.username] || []).map((collection) =>
          collection.id === collectionId
            ? { ...collection, postIds: (collection.postIds || []).filter((id) => id !== postId) }
            : collection
        ),
      },
    }));
  }

  async function renameCollection(collectionId) {
    const name = collectionRenameDraft.trim().slice(0, 40);
    if (!currentUser || !collectionId || !name) return;
    await commitPlazaPlus((data) => ({
      ...data,
      collections: {
        ...data.collections,
        [currentUser.username]: (data.collections?.[currentUser.username] || []).map((collection) =>
          collection.id === collectionId ? { ...collection, name } : collection
        ),
      },
    }));
    setCollectionEditing(false);
    setCollectionRenameDraft('');
  }

  async function deleteCollection(collectionId) {
    if (!currentUser || !collectionId) return;
    const collection = (plazaPlus.collections?.[currentUser.username] || []).find((item) => item.id === collectionId);
    if (!window.confirm(`Delete "${collection?.name || 'this collection'}"? Saved posts themselves will stay saved.`)) return;
    await commitPlazaPlus((data) => ({
      ...data,
      collections: {
        ...data.collections,
        [currentUser.username]: (data.collections?.[currentUser.username] || []).filter((collection) => collection.id !== collectionId),
      },
    }));
    setActiveCollectionId(null);
    setCollectionEditing(false);
    setCollectionRenameDraft('');
  }

  async function togglePinnedPost(postId) {
    if (!currentUser) return;
    await commitPlazaPlus((data) => {
      const profile = { ...plusProfile(currentUser.username), ...(data.profiles?.[currentUser.username] || {}) };
      const pins = new Set(profile.pinnedPostIds || []);
      if (pins.has(postId)) pins.delete(postId); else { if (pins.size >= 3) pins.delete([...pins][0]); pins.add(postId); }
      return { ...data, profiles: { ...data.profiles, [currentUser.username]: { ...profile, pinnedPostIds: [...pins] } } };
    });
  }

  async function saveProfileExtras() {
    if (!currentUser) return;
    await commitPlazaPlus((data) => ({ ...data, profiles: { ...data.profiles, [currentUser.username]: { ...plusProfile(currentUser.username), ...profileEdit } } }));
  }

  async function addProfileSection() {
    if (!currentUser || !profileSectionDraft.title.trim() || !profileSectionDraft.body.trim()) return;
    await commitPlazaPlus((data) => {
      const profile = { ...plusProfile(currentUser.username), ...(data.profiles?.[currentUser.username] || {}) };
      return { ...data, profiles: { ...data.profiles, [currentUser.username]: { ...profile, profileSections: [...(profile.profileSections || []), { id:`section-${Date.now()}`, title:profileSectionDraft.title.trim().slice(0,60), body:profileSectionDraft.body.trim().slice(0,600) }] } } };
    });
    setProfileSectionDraft({ title:'', body:'' });
  }

  function xpFor(username) {
    const base = plazaPlus.xp?.[username] || 0;
    const postXp = posts.filter((p) => p.username === username).length * 20;
    const commentXp = posts.reduce((sum, p) => sum + (p.comments || []).filter((c) => c.username === username).length * 4, 0);
    return base + postXp + commentXp;
  }

  function levelFor(username) { return Math.max(1, Math.floor(Math.sqrt(xpFor(username) / 50)) + 1); }

  function badgesFor(username) {
    const list = [];
    if (users.find((u) => u.username === username)?.isAdmin) list.push('Admin');
    if (posts.filter((p) => p.username === username).length >= 10) list.push('Creator');
    if (followedUsers(username).length >= 5) list.push('Explorer');
    if (username.toLowerCase() === 'jamie') list.push('Founder');
    return list;
  }

  function notificationsForCurrentUser() {
    if (!currentUser) return [];
    const read = Math.max(Number(plazaPlus.notificationReads?.[currentUser.username] || 0), notificationRead.username === currentUser.username ? notificationRead.at : 0);
    return (plazaPlus.activities || []).filter((a) => a.targetUser === currentUser.username && a.actor !== currentUser.username && Number(a.timestamp) > read);
  }

  async function markNotificationsRead(through = Date.now()) {
    if (!currentUser) return;
    const username = currentUser.username;
    const at = Math.max(through, notificationRead.username === username ? notificationRead.at : 0);
    setNotificationRead({ username, at });
    try { await window.storage.set(notificationReadKey(username), String(at), true); }
    catch (error) { console.error(error); setError('Could not save your notification read status.'); }
  }

  async function updateAccessibilityPref(key, value) {
    const next = { ...accessibilityPrefs, [key]: value };
    setAccessibilityPrefs(next);
    if (!currentUser) return;
    await commitPlazaPlus((data) => ({ ...data, accessibility: { ...data.accessibility, [currentUser.username]: next } }));
  }

  async function createInvite() {
    if (!currentUser) return;
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    await commitPlazaPlus((data) => ({ ...data, invites: [{ id:`invite-${Date.now()}`, code, creator:currentUser.username, createdAt:Date.now(), uses:0 }, ...(data.invites||[])].slice(0,100), audit:[{id:`audit-${Date.now()}`,actor:currentUser.username,action:`Created invite ${code}`,target:code,timestamp:Date.now()},...(data.audit||[])].slice(0,800) }));
  }

  async function createEvent() {
    if (!currentUser || !eventDraft.title.trim()) return;
    const event = { id: `evt-${Date.now()}`, title: eventDraft.title.trim().slice(0,80), when: eventDraft.when, location: eventDraft.location.trim().slice(0,80), description: eventDraft.description.trim().slice(0,500), creator: currentUser.username, rsvps: { going: [currentUser.username], maybe: [], no: [] }, timestamp: Date.now() };
    await commitPlazaPlus((data) => ({ ...data, events: [event, ...(data.events || [])], activities: [{ id:`act-${Date.now()}`, type:'event', actor:currentUser.username, text:`${currentUser.username} created an event: ${event.title}`, timestamp:Date.now() }, ...(data.activities || [])].slice(0,800) }));
    setEventDraft({ title:'', when:'', location:'', description:'' });
  }

  async function rsvpEvent(eventId, choice) {
    if (!currentUser) return;
    await commitPlazaPlus((data) => ({ ...data, events: (data.events || []).map((event) => {
      if (event.id !== eventId) return event;
      const rsvps = { going:[...(event.rsvps?.going||[])], maybe:[...(event.rsvps?.maybe||[])], no:[...(event.rsvps?.no||[])] };
      Object.keys(rsvps).forEach((key) => { rsvps[key] = rsvps[key].filter((u) => u !== currentUser.username); });
      rsvps[choice].push(currentUser.username);
      return { ...event, rsvps };
    }) }));
  }

  async function createGroup() {
    if (!currentUser || !groupDraft.name.trim()) return;
    const group = { id:`grp-${Date.now()}`, name:groupDraft.name.trim().slice(0,50), description:groupDraft.description.trim().slice(0,300), owner:currentUser.username, members:[currentUser.username], timestamp:Date.now() };
    await commitPlazaPlus((data) => ({ ...data, groups:[group,...(data.groups||[])], activities:[{id:`act-${Date.now()}-group`,type:'group',actor:currentUser.username,targetUser:null,text:`${currentUser.username} created community ${group.name}`,timestamp:Date.now()},...(data.activities||[])].slice(0,800) }));
    setGroupDraft({ name:'', description:'' });
  }

  async function toggleGroupMembership(groupId) {
    if (!currentUser) return;
    await commitPlazaPlus((data) => ({ ...data, groups:(data.groups||[]).map((group) => group.id === groupId ? { ...group, members:(group.members||[]).includes(currentUser.username) ? group.members.filter((u)=>u!==currentUser.username) : [...(group.members||[]),currentUser.username] } : group) }));
  }

  async function toggleChatReaction(messageId, emoji) {
    if (!currentUser) return;
    await commitPlazaPlus((data) => {
      const messageReactions = { ...(data.chatReactions?.[messageId] || {}) };
      const usersForEmoji = new Set(messageReactions[emoji] || []);
      if (usersForEmoji.has(currentUser.username)) usersForEmoji.delete(currentUser.username); else usersForEmoji.add(currentUser.username);
      if (usersForEmoji.size) messageReactions[emoji] = [...usersForEmoji]; else delete messageReactions[emoji];
      return { ...data, chatReactions: { ...data.chatReactions, [messageId]: messageReactions } };
    });
  }

  function typingThreadKey(thread = activeChat) {
    if (!currentUser || !thread.startsWith('dm:')) return thread;
    const other = thread.slice(3);
    return `dm:${[currentUser.username, other].sort().map(encodeURIComponent).join('|')}`;
  }

  async function noteTyping() {
    if (!currentUser) return;
    const thread = typingThreadKey();
    const now = Date.now();
    if (now - (lastTypingWriteRef.current[thread] || 0) < 1200) return;
    lastTypingWriteRef.current[thread] = now;
    await commitPlazaPlus((data) => ({ ...data, typing: { ...data.typing, [thread]: { ...(data.typing?.[thread] || {}), [currentUser.username]: now } } }));
  }

  function typingUsersForActiveChat() {
    const record = plazaPlus.typing?.[typingThreadKey()] || {};
    return Object.entries(record).filter(([username, at]) => username !== currentUser?.username && Date.now() - Number(at) < 4500).map(([username]) => username);
  }

  async function readProjectDirectory(legacy = plazaPlus.projects || []) {
    const record = await window.storage.get(PROJECT_INDEX_KEY, true);
    const indexed = record ? JSON.parse(record.value) : [];
    return [...indexed, ...legacy.filter((old) => !indexed.some((item) => item.id === old.id))];
  }

  async function writeProjectIndex(project) {
    const indexed = await readProjectDirectory();
    const next = [projectSummary(project), ...indexed.filter((item) => item.id !== project.id).map(projectSummary)];
    await window.storage.set(PROJECT_INDEX_KEY, JSON.stringify(next), true);
    setProjectDirectoryProjects(next);
  }

  async function saveProjectRecord(project) {
    if (JSON.stringify(project).length > 850000) throw new Error('This project has reached its image limit. Remove an image before adding another.');
    await window.storage.set(projectRecordKey(project.id), JSON.stringify(project), true);
    setProjectRecord(project);
    await writeProjectIndex(project);
  }

  async function pickProjectImage(event, apply) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Choose an image file.'); return; }
    setProjectImageBusy(true);
    try {
      const image = await resizeImage(file, 600);
      if (image.length > 125000) throw new Error('That image is too large after resizing. Try a smaller image.');
      await apply(image);
    } catch (e) { setError(e.message || 'Could not add the image.'); }
    finally { setProjectImageBusy(false); }
  }

  async function createProject() {
    if (!currentUser || !projectDraft.name.trim()) return;
    const category = ['rums4','rums5','outside'].includes(projectDraft.category) ? projectDraft.category : 'rums4';
    const project={id:`prj-${Date.now()}`,name:projectDraft.name.trim().slice(0,60),description:projectDraft.description.trim().slice(0,500),category,owner:currentUser.username,followers:[currentUser.username],milestones:[],timestamp:Date.now()};
    try {
      await window.storage.set(projectRecordKey(project.id), JSON.stringify(project), true);
      await writeProjectIndex(project);
      setProjectDraft({name:'',description:'',category});
      return true;
    } catch (e) { console.error(e); setError('Could not save this project for everyone. Try again.'); return false; }
  }

  async function toggleProjectFollow(projectId) {
    if (!currentUser) return;
    try {
      const record = await window.storage.get(projectRecordKey(projectId), true);
      const project = record ? JSON.parse(record.value) : (await readProjectDirectory()).find((item) => item.id === projectId);
      if (!project) return;
      const followers = project.followers || [];
      await saveProjectRecord({ ...project, followers: followers.includes(currentUser.username) ? followers.filter((u) => u !== currentUser.username) : [...followers, currentUser.username] });
    } catch (e) { setError('Could not update your follow right now.'); }
  }

  async function editActiveProject(change) {
    if (!activeProject || activeProject.owner !== currentUser?.username) return false;
    try {
      const record = await window.storage.get(projectRecordKey(activeProject.id), true);
      const latest = record ? JSON.parse(record.value) : activeProject;
      if (latest.owner !== currentUser.username) return false;
      await saveProjectRecord(change(latest));
      return true;
    } catch (e) { console.error(e); setError(e.message || 'Could not save this project.'); return false; }
  }

  async function addProjectTopic() {
    const title = projectTopicDraft.title.trim().slice(0, 100);
    const body = projectTopicDraft.body.trim().slice(0, 3000);
    if (!title || !body) return;
    if (await editActiveProject((project) => ({ ...project, topics: [{ id: `topic-${Date.now()}`, title, body, image: projectTopicDraft.image || '', author: currentUser.username, replies: [], timestamp: Date.now() }, ...(project.topics || [])] }))) setProjectTopicDraft({ title: '', body: '', image: '' });
  }

  async function replyToProjectTopic(topicId) {
    const body = (projectReplyDraft[topicId] || '').trim().slice(0, 2000);
    if (!body) return;
    if (await editActiveProject((project) => ({ ...project, topics: (project.topics || []).map((topic) => topic.id === topicId ? { ...topic, replies: [...(topic.replies || []), { id: `reply-${Date.now()}`, body, image: projectReplyDraft[`${topicId}-image`] || '', author: currentUser.username, timestamp: Date.now() }] } : topic) }))) setProjectReplyDraft((draft) => ({ ...draft, [topicId]: '', [`${topicId}-image`]: '' }));
  }

  async function addProjectUpdate() {
    if (activeProject?.owner !== currentUser?.username) return;
    const title = projectUpdateDraft.title.trim().slice(0, 100);
    const body = projectUpdateDraft.body.trim().slice(0, 3000);
    if (!title || !body) return;
    if (await editActiveProject((project) => ({ ...project, projectUpdates: [{ id: `update-${Date.now()}`, title, body, image: projectUpdateDraft.image || '', author: currentUser.username, timestamp: Date.now() }, ...(project.projectUpdates || [])] }))) setProjectUpdateDraft({ title: '', body: '', image: '' });
  }

  async function addProjectCard() {
    if (activeProject?.owner !== currentUser?.username) return;
    const title = projectCardDraft.trim().slice(0, 100);
    if (!title) return;
    await editActiveProject((project) => ({ ...project, board: [...(project.board || []), { id: `card-${Date.now()}`, title, image: projectCardImage, column: 'planned', timestamp: Date.now() }] }));
    setProjectCardDraft('');
    setProjectCardImage('');
  }

  function renderProjectWorkspace() {
    if (!activeProject) return <div className="project-workspace"><p>This project is no longer available.</p><button onClick={() => void openProjectsDirectory()}>Browse projects</button></div>;
    const owner = activeProject.owner === currentUser?.username;
    const topics = activeProject.topics || [];
    const projectUpdates = activeProject.projectUpdates || [];
    const board = activeProject.board || [];
    const categoryLabel = activeProject.category === 'rums5' ? 'Creative' : activeProject.category === 'outside' ? 'Outside RUMS' : 'RUMS 4';
    return <div className="project-workspace">
      <header className="project-workspace-header">
        <button className="project-workspace-back" onClick={() => void openProjectsDirectory()}>← All projects</button>
        <div className="project-workspace-title">{activeProject.cover && <img className="project-cover" src={activeProject.cover} alt={`${activeProject.name} cover`}/>}<span className={`project-space-badge ${activeProject.category}`}>{categoryLabel}</span>{projectEditField === 'name' ? <form className="project-inline-edit" onSubmit={async (event) => { event.preventDefault(); if (projectEditValue.trim() && await editActiveProject((project) => ({ ...project, name: projectEditValue.trim().slice(0, 60) }))) setProjectEditField(null); }}><input autoFocus className="aero-input" aria-label="Project name" value={projectEditValue} maxLength={60} onChange={(event) => setProjectEditValue(event.target.value)}/><button className="aero-btn" type="submit">Save</button><button className="pill pill-btn" type="button" onClick={() => setProjectEditField(null)}>Cancel</button></form> : <div className="project-title-row"><h1>{activeProject.name}</h1>{owner && <button className="project-edit-description" onClick={() => { setProjectEditValue(activeProject.name); setProjectEditField('name'); }}>Edit name</button>}</div>}<p>{activeProject.description || 'No description yet.'}</p><small>Created by {activeProject.owner} · {activeProject.followers?.length || 0} followers</small></div>
        <div className="project-workspace-actions">
          <button className="pill pill-btn" onClick={() => void toggleProjectFollow(activeProject.id)}>{activeProject.followers?.includes(currentUser.username) ? 'Following ✓' : 'Follow project'}</button>
          {owner && <label className="project-image-pick">Cover image<input type="file" accept="image/*" disabled={projectImageBusy} onChange={(event) => void pickProjectImage(event, (image) => editActiveProject((project) => ({ ...project, cover: image })))} /></label>}{owner && <label>Project version<select className="aero-input" value={activeProject.category || 'rums4'} onChange={(event) => { const category = event.target.value; void editActiveProject((project) => ({ ...project, category })); }}><option value="rums4">RUMS 4</option><option value="rums5">Creative</option><option value="outside">Outside RUMS</option></select></label>}
        </div>
      </header>
      <nav className="project-workspace-tabs" aria-label="Project sections">{[['overview','Overview'],['forum','Forum'],['updates','Updates'],['board','Board']].map(([id,label]) => <button key={id} className={projectTab === id ? 'active' : ''} onClick={() => setProjectTab(id)} aria-current={projectTab === id ? 'page' : undefined}>{label}</button>)}</nav>
      {projectTab === 'overview' && <div className="project-overview-grid">
        <section className="project-panel"><div className="project-panel-heading"><h2>About the project</h2>{owner && projectEditField !== 'description' && <button className="project-edit-description" onClick={() => { setProjectEditValue(activeProject.description || ''); setProjectEditField('description'); }}>Edit description</button>}</div>{projectEditField === 'description' ? <form className="project-inline-edit description" onSubmit={async (event) => { event.preventDefault(); if (await editActiveProject((project) => ({ ...project, description: projectEditValue.trim().slice(0, 500) }))) setProjectEditField(null); }}><textarea autoFocus className="aero-input" rows={4} aria-label="Project description" maxLength={500} value={projectEditValue} onChange={(event) => setProjectEditValue(event.target.value)}/><div><button className="aero-btn" type="submit">Save</button><button className="pill pill-btn" type="button" onClick={() => setProjectEditField(null)}>Cancel</button></div></form> : <p>{activeProject.description || 'The creator has not added a description yet.'}</p>}<p className="project-muted">Part of {categoryLabel} · Created by {activeProject.owner}</p></section>
        <section className="project-panel"><div className="project-panel-heading"><h2>Latest updates</h2><button onClick={() => setProjectTab('updates')}>View all →</button></div>{projectUpdates.length ? projectUpdates.slice(0, 3).map((item) => <article className="project-list-item" key={item.id}><strong>{item.title}</strong><p>{item.body}</p><small>{timeAgo(item.timestamp)}</small></article>) : <p className="project-muted">No updates yet.</p>}</section>
        <section className="project-panel"><div className="project-panel-heading"><h2>Forum</h2><button onClick={() => setProjectTab('forum')}>Open forum →</button></div>{topics.length ? topics.slice(0, 3).map((item) => <button className="project-topic-preview" key={item.id} onClick={() => { setProjectOpenTopic(item.id); setProjectTab('forum'); }}><strong>{item.title}</strong><small>{item.replies?.length || 0} replies · {item.author}</small></button>) : <p className="project-muted">Start the first discussion.</p>}</section>
        <section className="project-panel"><div className="project-panel-heading"><h2>Board</h2><button onClick={() => setProjectTab('board')}>Open board →</button></div><p>{board.filter((item) => item.column === 'done').length} done · {board.filter((item) => item.column === 'doing').length} in progress · {board.filter((item) => item.column === 'planned').length} planned</p></section>
      </div>}
      {projectTab === 'forum' && <div className="project-section"><div className="project-section-heading"><h2>Forum</h2><p>Read the creator’s discussions and progress.</p></div>{owner && <form className="project-panel project-form" onSubmit={(event) => { event.preventDefault(); void addProjectTopic(); }}><h3>New discussion</h3><input className="aero-input" placeholder="Discussion title" maxLength={100} value={projectTopicDraft.title} onChange={(event) => setProjectTopicDraft({ ...projectTopicDraft, title: event.target.value })}/><textarea className="aero-input" placeholder="What would you like to talk about?" rows={3} value={projectTopicDraft.body} onChange={(event) => setProjectTopicDraft({ ...projectTopicDraft, body: event.target.value })}/><label className="project-image-pick">Add image<input type="file" accept="image/*" disabled={projectImageBusy} onChange={(event) => void pickProjectImage(event, (image) => setProjectTopicDraft((draft) => ({ ...draft, image })))} /></label>{projectTopicDraft.image && <img className="project-attached-image" src={projectTopicDraft.image} alt="Discussion image preview"/>}<button className="aero-btn" disabled={projectImageBusy || !projectTopicDraft.title.trim() || !projectTopicDraft.body.trim()}>Post discussion</button></form>}{topics.length ? topics.map((topic) => <article className="project-panel project-discussion" key={topic.id}><button className="project-discussion-title" onClick={() => setProjectOpenTopic(projectOpenTopic === topic.id ? null : topic.id)} aria-expanded={projectOpenTopic === topic.id}><strong>{topic.title}</strong><small>{topic.author} · {timeAgo(topic.timestamp)} · {topic.replies?.length || 0} replies</small></button>{projectOpenTopic === topic.id && <>{owner && <button className="project-edit-description" onClick={() => { const body = window.prompt('Edit discussion', topic.body); if (body !== null) void editActiveProject((project) => ({ ...project, topics: (project.topics || []).map((item) => item.id === topic.id ? { ...item, body: body.trim().slice(0, 3000) } : item) })); }}>Edit discussion</button>}<p>{topic.body}</p>{topic.image && <img className="project-attached-image" src={topic.image} alt={`Image for ${topic.title}`}/>}{(topic.replies || []).map((reply) => <div className="project-reply" key={reply.id}><small>{reply.author} · {timeAgo(reply.timestamp)}</small><p>{reply.body}</p>{reply.image && <img className="project-attached-image" src={reply.image} alt="Reply attachment"/>}</div>)}{owner && <form className="project-reply-form" onSubmit={(event) => { event.preventDefault(); void replyToProjectTopic(topic.id); }}><input className="aero-input" placeholder="Write a reply" value={projectReplyDraft[topic.id] || ''} onChange={(event) => setProjectReplyDraft({ ...projectReplyDraft, [topic.id]: event.target.value })}/><label className="project-image-pick">Image<input type="file" accept="image/*" disabled={projectImageBusy} onChange={(event) => void pickProjectImage(event, (image) => setProjectReplyDraft((draft) => ({ ...draft, [`${topic.id}-image`]: image })))} /></label>{projectReplyDraft[`${topic.id}-image`] && <img className="project-attached-image" src={projectReplyDraft[`${topic.id}-image`]} alt="Reply preview"/>}<button className="aero-btn" disabled={projectImageBusy || !projectReplyDraft[topic.id]?.trim()}>Reply</button></form>}</>}</article>) : <div className="project-panel project-muted">No discussions yet.</div>}</div>}
      {projectTab === 'updates' && <div className="project-section"><div className="project-section-heading"><h2>Project updates</h2><p>Progress and announcements from the project creator.</p></div>{owner && <form className="project-panel project-form" onSubmit={(event) => { event.preventDefault(); void addProjectUpdate(); }}><h3>Publish an update</h3><input className="aero-input" placeholder="Update title" maxLength={100} value={projectUpdateDraft.title} onChange={(event) => setProjectUpdateDraft({ ...projectUpdateDraft, title: event.target.value })}/><textarea className="aero-input" placeholder="What changed?" rows={4} value={projectUpdateDraft.body} onChange={(event) => setProjectUpdateDraft({ ...projectUpdateDraft, body: event.target.value })}/><label className="project-image-pick">Add image<input type="file" accept="image/*" disabled={projectImageBusy} onChange={(event) => void pickProjectImage(event, (image) => setProjectUpdateDraft((draft) => ({ ...draft, image })))} /></label>{projectUpdateDraft.image && <img className="project-attached-image" src={projectUpdateDraft.image} alt="Update preview"/>}<button className="aero-btn" disabled={projectImageBusy || !projectUpdateDraft.title.trim() || !projectUpdateDraft.body.trim()}>Publish update</button></form>}{projectUpdates.length ? projectUpdates.map((item) => <article className="project-panel project-list-item" key={item.id}><small>{timeAgo(item.timestamp)} · {item.author}</small><h3>{item.title}</h3>{owner && <button className="project-edit-description" onClick={() => { const body = window.prompt('Edit update', item.body); if (body !== null) void editActiveProject((project) => ({ ...project, projectUpdates: (project.projectUpdates || []).map((entry) => entry.id === item.id ? { ...entry, body: body.trim().slice(0, 3000) } : entry) })); }}>Edit update</button>}<p>{item.body}</p>{item.image && <img className="project-attached-image" src={item.image} alt={`Image for ${item.title}`}/>}</article>) : <div className="project-panel project-muted">No project updates yet.</div>}</div>}
      {projectTab === 'board' && <div className="project-section"><div className="project-section-heading"><h2>Project board</h2><p>Track what is planned, in progress, and complete.</p></div>{owner && <form className="project-panel project-card-form" onSubmit={(event) => { event.preventDefault(); void addProjectCard(); }}><input className="aero-input" placeholder="Add a task or idea" maxLength={100} value={projectCardDraft} onChange={(event) => setProjectCardDraft(event.target.value)}/><label className="project-image-pick">Image<input type="file" accept="image/*" disabled={projectImageBusy} onChange={(event) => void pickProjectImage(event, (image) => setProjectCardImage(image))}/></label>{projectCardImage && <img className="project-attached-image" src={projectCardImage} alt="Board card preview"/>}<button className="aero-btn" disabled={projectImageBusy || !projectCardDraft.trim()}>Add card</button></form>}<div className="project-board">{[['planned','Planned'],['doing','In progress'],['done','Done']].map(([column,label]) => <section className="project-board-column" key={column}><h3>{label} <span>{board.filter((item) => item.column === column).length}</span></h3>{board.filter((item) => item.column === column).map((item) => <article className="project-board-card" key={item.id}><strong>{item.title}</strong>{item.image && <img className="project-attached-image" src={item.image} alt={`Image for ${item.title}`}/>} {owner && <div className="project-board-card-actions"><button onClick={() => { const title = window.prompt('Edit card', item.title); if (title?.trim()) void editActiveProject((project) => ({ ...project, board: (project.board || []).map((card) => card.id === item.id ? { ...card, title: title.trim().slice(0, 100) } : card) })); }} aria-label={`Edit ${item.title}`}>✎</button>{column !== 'planned' && <button onClick={() => void editActiveProject((project) => ({ ...project, board: (project.board || []).map((card) => card.id === item.id ? { ...card, column: column === 'done' ? 'doing' : 'planned' } : card) }))} aria-label={`Move ${item.title} back`}>←</button>}{column !== 'done' && <button onClick={() => void editActiveProject((project) => ({ ...project, board: (project.board || []).map((card) => card.id === item.id ? { ...card, column: column === 'planned' ? 'doing' : 'done' } : card) }))} aria-label={`Move ${item.title} forward`}>→</button>}<button onClick={() => void editActiveProject((project) => ({ ...project, board: (project.board || []).filter((card) => card.id !== item.id) }))} aria-label={`Delete ${item.title}`}>×</button></div>}</article>)}{!board.some((item) => item.column === column) && <p className="project-muted">No cards yet.</p>}</section>)}</div></div>}
    </div>;
  }

  async function addWikiPage() {
    if (!currentUser || !wikiDraft.title.trim() || !wikiDraft.body.trim()) return;
    const page={id:`wiki-${Date.now()}`,title:wikiDraft.title.trim().slice(0,80),body:wikiDraft.body.trim().slice(0,4000),author:currentUser.username,updatedAt:Date.now()};
    await commitPlazaPlus((data)=>({...data,wiki:[page,...(data.wiki||[])],activities:[{id:`act-${Date.now()}-wiki`,type:'wiki',actor:currentUser.username,targetUser:null,text:`${currentUser.username} added wiki page ${page.title}`,timestamp:Date.now()},...(data.activities||[])].slice(0,800)}));
    setWikiDraft({title:'',body:''});
  }

  async function addBuildEntry() {
    if (!currentUser || !buildDraft.name.trim()) return;
    const build={id:`build-${Date.now()}`,name:buildDraft.name.trim().slice(0,80),location:buildDraft.location.trim().slice(0,120),owner:buildDraft.owner.trim().slice(0,60)||currentUser.username,description:buildDraft.description.trim().slice(0,500),author:currentUser.username,timestamp:Date.now()};
    await commitPlazaPlus((data)=>({...data,builds:[build,...(data.builds||[])],activities:[{id:`act-${Date.now()}-build`,type:'build',actor:currentUser.username,targetUser:null,text:`${currentUser.username} added build ${build.name}`,timestamp:Date.now()},...(data.activities||[])].slice(0,800)}));
    setBuildDraft({name:'',location:'',owner:'',description:''});
  }

  async function submitReport() {
    if (!currentUser || !reportDraft.target.trim() || !reportDraft.reason.trim()) return;
    const report={id:`report-${Date.now()}`,reporter:currentUser.username,target:reportDraft.target.trim().slice(0,120),reason:reportDraft.reason.trim().slice(0,700),status:'open',timestamp:Date.now()};
    await commitPlazaPlus((data)=>({...data,reports:[report,...(data.reports||[])],audit:[{id:`audit-${Date.now()}`,actor:currentUser.username,action:'Submitted report',target:report.target,timestamp:Date.now()},...(data.audit||[])].slice(0,800)}));
    setReportDraft({target:'',reason:''});
  }

  async function saveDraftPost() {
    if (!currentUser || (!caption.trim() && !uploadPreview)) return;
    await commitPlazaPlus((data)=>({...data,drafts:{...data.drafts,[currentUser.username]:[...(data.drafts?.[currentUser.username]||[]),{id:`draft-${Date.now()}`,caption,tag,image:uploadPreview,timestamp:Date.now()}]}}));
    setDraftCaption('Saved');
    setTimeout(()=>setDraftCaption(''),1200);
  }

  async function scheduleCurrentPost() {
    if (!currentUser || !scheduleWhen || !uploadPreview) return;
    await commitPlazaPlus((data)=>({...data,scheduled:[...(data.scheduled||[]),{id:`sched-${Date.now()}`,username:currentUser.username,caption,tag,image:uploadPreview,space:rumsSpace||'rums4',when:new Date(scheduleWhen).getTime(),createdAt:Date.now()}]}));
    setScheduleWhen('');
  }

  async function applyDueScheduledPosts() {
    if (!currentUser) return;
    const due=(plazaPlus.scheduled||[]).filter((item)=>item.when<=Date.now() && (item.space||'rums4') === (rumsSpace||'rums4'));
    if (!due.length) return;
    const newPosts=due.map((item)=>({id:`${item.when}-${Math.random().toString(36).slice(2,8)}`,username:item.username,image:item.image,images:[item.image],caption:item.caption,tag:item.tag||'General',timestamp:item.when,likes:[],comments:[],reactions:{},editHistory:[]}));
    await savePosts([...newPosts,...posts]);
    const dueIds=new Set(due.map((item)=>item.id));
    await commitPlazaPlus((data)=>({...data,scheduled:(data.scheduled||[]).filter((item)=>!dueIds.has(item.id))}));
  }

  function hashtagsIn(text='') { return [...new Set((text.match(/#[A-Za-z0-9_]+/g)||[]).map((tag)=>tag.toLowerCase()))]; }

  function trendingPosts() {
    return [...posts].sort((a,b)=>((b.likes?.length||0)+(b.comments?.length||0)*2+Object.values(b.reactions||{}).reduce((n,v)=>n+(v?.length||0),0))-((a.likes?.length||0)+(a.comments?.length||0)*2+Object.values(a.reactions||{}).reduce((n,v)=>n+(v?.length||0),0)));
  }

  function buildTutorialSteps() {
    return [
      {
        id: 'welcome',
        title: `Welcome to the new ${PLATFORM_NAME}`,
        body: tutorialReturningUser
          ? 'This tour is hands-on now. I’ll point out the important changes and sometimes ask you to use them before we continue.'
          : 'This is a hands-on Plaza tour. You’ll actually open and use the main features as we go.',
        screen: 'feed',
      },
      {
        id: 'versions',
        title: 'Your Plaza spaces',
        body: 'RUMS 4, Creative and Projects live in this switcher. You can move between them without leaving Plaza.',
        screen: 'feed',
        target: '[data-tutorial="version-switch"]',
      },
      hasLumina && siteConfig.showLumina ? {
        id: 'try-lumina-filter',
        title: 'Try the Lumina feed',
        body: 'Tap Lumina now. The feed below will switch to only posts from Project Lumina.',
        screen: 'feed',
        target: '[data-tutorial-action="lumina-tab"]',
        interaction: { selector: '[data-tutorial-action="lumina-tab"]', label: 'Tap Lumina to continue' },
      } : null,
      hasLumina && siteConfig.showLumina ? {
        id: 'lumina-feed',
        title: 'This is the Lumina feed',
        body: 'Lumina posts have their own focused feed while still belonging to RUMS 4. The About Lumina action takes you into the project itself.',
        screen: 'feed',
        feedFilter: 'lumina',
        target: '[data-tutorial="feed-layout"]',
      } : null,
      hasLumina && siteConfig.showLumina ? {
        id: 'open-lumina',
        title: 'Open Project Lumina',
        body: 'Tap About Lumina so you can see the dedicated project experience.',
        feedFilter: 'lumina',
        target: '[data-tutorial-action="about-lumina"]',
        interaction: { selector: '[data-tutorial-action="about-lumina"]', label: 'Open About Lumina to continue' },
      } : null,
      hasLumina && siteConfig.showLumina ? {
        id: 'project-lumina',
        title: 'Project Lumina',
        body: 'Lumina now has its own cleaner project home. Creating a post from here also preselects Lumina as the post location.',
        screen: 'lumina',
        target: '.lumina-project-hero',
      } : null,
      {
        id: 'open-share',
        title: 'Create a post',
        body: 'Now open Share a build using the highlighted create button.',
        target: '[data-tutorial-nav="upload"]',
        interaction: { selector: '[data-tutorial-nav="upload"]', label: 'Open Share a build to continue' },
      },
      {
        id: 'share',
        title: 'The post composer',
        body: 'Add a screenshot, caption and location here. When you enter from Lumina, Lumina is selected automatically.',
        screen: 'upload',
        target: '.composer-heading',
      },
      {
        id: 'open-news',
        title: 'Open Plaza News',
        body: 'Tap News. It is now a full news system rather than another social feed.',
        target: '[data-tutorial-nav="news"]',
        interaction: { selector: '[data-tutorial-nav="news"]', label: 'Open News to continue' },
      },
      {
        id: 'news',
        title: 'Plaza News',
        body: 'The newest article leads the page, recent breaking articles can temporarily take over, and every article can be labelled RUMS 4, Lumina or Creative.',
        screen: 'news',
        target: '.news-site-top',
      },
      {
        id: 'open-chat',
        title: 'Open Chat',
        body: 'Tap Chat to see the upgraded messaging system.',
        target: '[data-tutorial-nav="chat"]',
        interaction: { selector: '[data-tutorial-nav="chat"]', label: 'Open Chat to continue' },
      },
      {
        id: 'chat',
        title: 'Chat is much richer now',
        body: 'You have public chat, DMs, groups, replies, reactions, images, Spotify embeds and searchable GIFs.',
        screen: 'chat',
        target: '.chat-conversation-header',
      },
      {
        id: 'try-gif',
        title: 'Try the GIF picker',
        body: 'Tap GIF. You don’t have to send anything — just open the picker so you can see how it works.',
        screen: 'chat',
        target: '[data-tutorial-action="gif-open"]',
        interaction: { selector: '[data-tutorial-action="gif-open"]', label: 'Open GIF to continue' },
      },
      {
        id: 'gif-picker',
        title: 'Search GIFs live',
        body: 'The GIF library updates while you type. Results are kept compact so the picker stays fast and easy to browse.',
        screen: 'chat',
        target: '.gif-picker-panel',
      },
      {
        id: 'close-gif',
        title: 'Close the GIF picker',
        body: 'Tap the close button and we’ll continue.',
        screen: 'chat',
        target: '[data-tutorial-action="gif-close"]',
        interaction: { selector: '[data-tutorial-action="gif-close"]', label: 'Close GIF to continue' },
      },
      {
        id: 'open-plus',
        title: 'Open Plaza+',
        body: 'Tap Plaza+ — this is where most of the new community tools live.',
        target: '[data-tutorial-nav="plazaPlus"]',
        interaction: { selector: '[data-tutorial-nav="plazaPlus"]', label: 'Open Plaza+ to continue' },
      },
      {
        id: 'plaza-plus',
        title: 'Plaza+',
        body: 'Notifications, following, saved collections, activity, events, groups, Projects, wiki/build tools, creator tools, accessibility and device notifications all live here.',
        screen: 'plazaPlus',
        target: '.plaza-plus-hero',
      },
      {
        id: 'feed-social',
        title: 'Posts are more social too',
        body: 'Posts support likes, comments, replies, emoji reactions and saving. Saved posts can be organised into collections in Plaza+.',
        screen: 'feed',
        feedFilter: 'all',
        target: '[data-tutorial="feed-layout"]',
      },
      siteConfig.showDiscover ? {
        id: 'discover',
        title: 'Discover',
        body: 'Discover searches members and posts in the Plaza space you are currently using.',
        screen: 'search',
        target: '[data-tutorial="discover-page"]',
      } : null,
      siteConfig.showSuggestions ? {
        id: 'suggestions',
        title: 'Suggestions',
        body: 'Community ideas still live here, with voting and reactions to help useful suggestions stand out.',
        screen: 'suggestions',
        target: '[data-tutorial="suggestions-page"]',
      } : null,
      siteConfig.showUpdates ? {
        id: 'updates',
        title: 'Server updates',
        body: 'Official server changes live here, with unread indicators that stay until you actually view them.',
        screen: 'updates',
        target: '[data-tutorial="updates-page"]',
      } : null,
      {
        id: 'profile',
        title: 'Your profile',
        body: 'Profiles now tie into follows, activity, XP and badges. Your own profile also contains Plaza appearance controls.',
        screen: 'profile',
        target: '[data-tutorial="profile-page"]',
      },
      {
        id: 'appearance',
        title: 'Make Plaza yours',
        body: 'Appearance includes glass strength and the complete theme library, from Light and Dark to Roblox eras, Frutiger styles, Liquid Glass, Solarpunk and more.',
        screen: 'profile',
        target: '[data-tutorial="appearance"]',
      },
      {
        id: 'shortcuts',
        title: 'One last power feature',
        body: 'Press ⌘K on Mac or Ctrl+K elsewhere anytime to open the command palette and jump around Plaza quickly.',
        screen: 'profile',
        target: '[data-tutorial="appearance"]',
      },
      {
        id: 'done',
        title: 'You’re ready',
        body: 'That’s the new Plaza. This interactive update tour only runs once, and you can replay it later from Profile → Appearance.',
        screen: 'feed',
      },
    ].filter(Boolean);
  }

  function startTutorial() {
    setEditMode(false);
    setViewedProfile(null);
    setFeedFilter('all');
    setTutorialStep(0);
    setTutorialRect(null);
    setTutorialNavRect(null);
    setTutorialReturningUser(false);
    setTutorialActive(true);
    setScreen('feed');
  }

  async function completeTutorial() {
    setTutorialActive(false);
    setTutorialRect(null);
    setTutorialNavRect(null);
    setTutorialStep(0);
    setViewedProfile(null);
    setFeedFilter('all');
    setScreen('feed');
    if (!currentUser) return;
    try {
      const record = await safeGet(USERS_KEY, true);
      let latestUsers = users;
      if (record) {
        try {
          const parsed = JSON.parse(record.value);
          if (Array.isArray(parsed)) latestUsers = parsed;
        } catch { /* use local users */ }
      }
      const requiredVersion = requiredTutorialVersionForUser(currentUser);
      const next = latestUsers.map((user) => user.username === currentUser.username ? { ...user, tutorialVersion: requiredVersion } : user);
      await window.storage.set(USERS_KEY, JSON.stringify(next), true);
      setUsers(next);
      setCurrentUser((user) => user ? { ...user, tutorialVersion: requiredTutorialVersionForUser(user) } : user);
    } catch (e) {
      console.error(e);
    }
  }

  function moveTutorial(direction) {
    const steps = buildTutorialSteps();
    const nextIndex = tutorialStep + direction;
    if (nextIndex < 0) return;
    if (nextIndex >= steps.length) {
      void completeTutorial();
      return;
    }
    setTutorialRect(null);
    setTutorialNavRect(null);
    setTutorialStep(nextIndex);
  }

  useEffect(() => {
    if (!tutorialActive) return undefined;
    const steps = buildTutorialSteps();
    const step = steps[Math.min(tutorialStep, steps.length - 1)];
    if (!step) return undefined;

    if (step.screen === 'profile') {
      setViewedProfile(null);
      if (screen !== 'profile') setScreen('profile');
    } else if (step.screen && screen !== step.screen) {
      setScreen(step.screen);
    }
    if (step.screen === 'feed' && step.feedFilter && feedFilter !== step.feedFilter) setFeedFilter(step.feedFilter);

    let cancelled = false;
    let timer = 0;
    let retryCount = 0;
    const contentScroller = document.querySelector('.content');

    const findVisible = (selector) => {
      if (!selector) return null;
      const candidates = [...document.querySelectorAll(selector)];
      return candidates.find((node) => {
        const rect = node.getBoundingClientRect();
        const style = window.getComputedStyle(node);
        return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
      }) || null;
    };

    const measure = (scrollIntoView = false) => {
      if (cancelled) return;
      const target = findVisible(step.target);
      if (!target) {
        if (!step.target) setTutorialRect(null);
        if (step.target && retryCount < 18) {
          retryCount += 1;
          timer = window.setTimeout(() => measure(retryCount === 1), 90);
        }
        return;
      }
      if (scrollIntoView) target.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });
      const rect = target.getBoundingClientRect();
      setTutorialRect({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
      setTutorialNavRect(null);
    };

    const blockWrongInteraction = (event) => {
      if (!step.interaction?.selector) return;
      if (event.target.closest?.('.tutorial-card')) return;
      const required = findVisible(step.interaction.selector);
      if (!required || !required.contains(event.target)) {
        event.preventDefault();
        event.stopPropagation();
        setTutorialActionPulse((value) => value + 1);
        return;
      }
      // The required control is allowed to perform its normal action. A separate
      // state-driven effect advances only after Plaza confirms the requested state.
      return;
    };

    timer = window.setTimeout(() => measure(true), 120);
    const update = () => measure(false);
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, { passive: true });
    contentScroller?.addEventListener('scroll', update, { passive: true });
    if (step.interaction?.selector) document.addEventListener('click', blockWrongInteraction, true);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      // Do not cancel a successful interaction's advance timer here.
      // Required actions often change screen/feed state, which re-runs this effect
      // before the short advance delay has fired.
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update);
      contentScroller?.removeEventListener('scroll', update);
      if (step.interaction?.selector) document.removeEventListener('click', blockWrongInteraction, true);
    };
  }, [tutorialActive, tutorialStep, screen, feedFilter, rumsSpace]);

  // Interactive tutorial steps advance from the RESULTING app state, not from
  // click timing. This survives React rerenders/navigation and also verifies that
  // the requested action actually happened.
  useEffect(() => {
    if (!tutorialActive) return;
    const steps = buildTutorialSteps();
    const step = steps[Math.min(tutorialStep, Math.max(0, steps.length - 1))];
    if (!step?.interaction) return;

    let completed = false;
    if (step.id === 'try-lumina-filter') completed = screen === 'feed' && feedFilter === 'lumina';
    else if (step.id === 'open-lumina') completed = screen === 'lumina';
    else if (step.id === 'open-share') completed = screen === 'upload';
    else if (step.id === 'open-news') completed = screen === 'news';
    else if (step.id === 'open-chat') completed = screen === 'chat';
    else if (step.id === 'try-gif') completed = screen === 'chat' && gifPickerOpen;
    else if (step.id === 'close-gif') completed = screen === 'chat' && !gifPickerOpen;
    else if (step.id === 'open-plus') completed = screen === 'plazaPlus';

    if (!completed) return;
    const id = window.setTimeout(() => moveTutorial(1), 80);
    return () => window.clearTimeout(id);
  }, [tutorialActive, tutorialStep, screen, feedFilter, gifPickerOpen]);

  useEffect(() => {
    siteConfigRef.current = siteConfig;
  }, [siteConfig]);

  useEffect(() => {
    if (!currentUser) { setPlazaPlus(DEFAULT_PLAZA_PLUS); return undefined; }
    let cancelled = false;
    const loadPlus = async () => {
      const record = await safeGet(PLAZA_PLUS_KEY, true);
      if (cancelled) return;
      if (!record) { setPlazaPlus(DEFAULT_PLAZA_PLUS); return; }
      try { setPlazaPlus(normalizePlazaPlus(JSON.parse(record.value))); } catch { setPlazaPlus(DEFAULT_PLAZA_PLUS); }
    };
    loadPlus();
    const poll = window.setInterval(loadPlus, 5000);
    return () => { cancelled = true; window.clearInterval(poll); };
  }, [currentUser?.username]);

  useEffect(() => {
    if (!currentUser || !('serviceWorker' in navigator)) { setPushEnabled(false); return; }
    let cancelled = false;
    navigator.serviceWorker.getRegistration('/').then((registration) => registration?.pushManager?.getSubscription()).then((subscription) => {
      if (!cancelled) setPushEnabled(Boolean(subscription) && Notification.permission === 'granted');
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [currentUser?.username]);

  useEffect(() => {
    if (!currentUser || !rumsSpace) return;
    const url = new URL(window.location.href);
    const destination = url.searchParams.get('notification');
    if (destination !== 'chat' && destination !== 'plazaPlus') return;
    setScreen(destination);
    if (destination === 'plazaPlus') setPlusTab('notifications');
    url.searchParams.delete('notification');
    window.history.replaceState(window.history.state, '', url.toString());
  }, [currentUser?.username, rumsSpace]);

  useEffect(() => {
    const username = currentUser?.username;
    if (!username) { setNotificationRead({ username: null, at: 0 }); return undefined; }
    let cancelled = false;
    setNotificationRead((previous) => previous.username === username ? previous : { username, at: 0 });
    const loadRead = async () => {
      try {
        const record = await window.storage.get(notificationReadKey(username), true);
        if (!cancelled && record) setNotificationRead((previous) => ({ username, at: Math.max(previous.username === username ? previous.at : 0, Number(record.value) || 0) }));
      } catch (error) { console.error('Could not load notification reads', error); }
    };
    void loadRead();
    const timer = window.setInterval(loadRead, 5000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [currentUser?.username]);

  useEffect(() => {
    if (!currentUser) return;
    const profile = plusProfile(currentUser.username);
    setProfileEdit({ bio: profile.bio || '', status: profile.status || 'Online', accent: profile.accent || '#3478f6', banner: profile.banner || '' });
    setAccessibilityPrefs(plazaPlus.accessibility?.[currentUser.username] || { reducedMotion:false, highContrast:false, largeText:false, reducedTransparency:false });
  }, [currentUser?.username, Boolean(currentUser && plazaPlus.profiles?.[currentUser.username]), Boolean(currentUser && plazaPlus.accessibility?.[currentUser.username])]);

  useEffect(() => {
    if (!currentUser) return;
    const count = notificationsForCurrentUser().length;
    if (count > lastNotificationCountRef.current && lastNotificationCountRef.current >= 0 && document.hidden && 'Notification' in window && Notification.permission === 'granted') {
      try { new Notification('RUMS Plaza', { body: `You have ${count} new notification${count === 1 ? '' : 's'}.` }); } catch { /* ignore browser notification failures */ }
    }
    lastNotificationCountRef.current = count;
  }, [plazaPlus.activities, plazaPlus.notificationReads, notificationRead.at, notificationRead.username, currentUser?.username]);

  useEffect(() => {
    if (!currentUser) return undefined;
    let stopped = false;
    const heartbeat = async () => {
      if (stopped) return;
      try {
        const record = await safeGet(PLAZA_PLUS_KEY, true);
        const latest = normalizePlazaPlus(record ? JSON.parse(record.value) : null);
        const next = { ...latest, presence: { ...latest.presence, [currentUser.username]: { at: Date.now(), status: profileEdit.status || 'Online' } } };
        await window.storage.set(PLAZA_PLUS_KEY, JSON.stringify(next), true);
        if (!stopped) setPlazaPlus(next);
      } catch { /* presence is best-effort */ }
    };
    heartbeat();
    const timer = window.setInterval(heartbeat, 30000);
    return () => { stopped = true; window.clearInterval(timer); };
  }, [currentUser?.username, profileEdit.status]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.classList.toggle('pref-reduced-motion', !!accessibilityPrefs.reducedMotion);
    root.classList.toggle('pref-high-contrast', !!accessibilityPrefs.highContrast);
    root.classList.toggle('pref-large-text', !!accessibilityPrefs.largeText);
    root.classList.toggle('pref-reduced-transparency', !!accessibilityPrefs.reducedTransparency);
  }, [accessibilityPrefs]);

  useEffect(() => {
    if (!currentUser) {
      setChatMessages([]);
      setChatReadState({});
      setActiveChat('plaza');
      return undefined;
    }
    let cancelled = false;
    const loadMessages = async () => {
      const record = await safeGet(CHAT_MESSAGES_KEY, true);
      if (cancelled || !record) return;
      try {
        const parsed = JSON.parse(record.value);
        if (Array.isArray(parsed)) setChatMessages((current) => JSON.stringify(current) === record.value ? current : parsed);
      } catch { /* ignore malformed chat payload */ }
    };
    const loadReadState = async () => {
      setChatReadState({});
      const record = await safeGet(chatReadKey(currentUser.username), false);
      if (cancelled) return;
      if (!record) {
        const baseline = { plaza: Date.now() };
        setChatReadState(baseline);
        void window.storage.set(chatReadKey(currentUser.username), JSON.stringify(baseline), false).catch((e) => console.error(e));
        return;
      }
      try {
        const parsed = JSON.parse(record.value);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) setChatReadState(parsed);
      } catch { /* ignore malformed read state */ }
    };
    loadMessages();
    loadReadState();
    const poll = window.setInterval(loadMessages, 3000);
    return () => {
      cancelled = true;
      window.clearInterval(poll);
    };
  }, [currentUser?.username]);

  useEffect(() => {
    if (!currentUser || screen !== 'chat') return;
    const threadMessages = chatMessagesForThread(activeChat);
    const latestTimestamp = threadMessages.reduce((latest, message) => Math.max(latest, Number(message.timestamp || 0)), 0);
    if (!latestTimestamp) return;
    setChatReadState((current) => {
      if (latestTimestamp <= Number(current[activeChat] || 0)) return current;
      const next = { ...current, [activeChat]: latestTimestamp };
      void window.storage.set(chatReadKey(currentUser.username), JSON.stringify(next), false).catch((e) => console.error(e));
      return next;
    });
  }, [screen, activeChat, chatMessages, currentUser?.username]);

  useEffect(() => {
    if (screen !== 'chat') return;
    const id = window.requestAnimationFrame(() => {
      const list = chatMessageListRef.current;
      if (list && chatPinnedRef.current) list.scrollTo({ top: list.scrollHeight, behavior: 'smooth' });
    });
    return () => window.cancelAnimationFrame(id);
  }, [screen, activeChat, chatMessages.length]);

  useEffect(() => { chatPinnedRef.current = true; }, [activeChat]);

  // A receipt is shared per DM direction, so the sender can see it on another device.
  useEffect(() => {
    if (!currentUser || screen !== 'chat' || !activeChat.startsWith('dm:')) return;
    const other = activeChat.slice(3);
    const lastMessage = chatMessagesForThread(activeChat).at(-1);
    if (!lastMessage) return;
    let cancelled = false;
    const markSeen = async () => {
      try {
        const key = chatSeenKey(currentUser.username, other);
        const record = await safeGet(key, true);
        if (cancelled || JSON.parse(record?.value || 'null')?.id === lastMessage.id) return;
        await window.storage.set(key, JSON.stringify({ id: lastMessage.id }), true);
      } catch (error) { console.error('Could not save chat receipt', error); }
    };
    void markSeen();
    return () => { cancelled = true; };
  }, [screen, activeChat, chatMessages, currentUser?.username]);

  useEffect(() => {
    if (!currentUser || screen !== 'chat' || !activeChat.startsWith('dm:')) {
      setChatSeenReceipt({ threadId: '', id: '' });
      return undefined;
    }
    let cancelled = false;
    const threadId = activeChat;
    const loadReceipt = async () => {
      try {
        const record = await safeGet(chatSeenKey(threadId.slice(3), currentUser.username), true);
        if (cancelled) return;
        const id = JSON.parse(record?.value || 'null')?.id || '';
        setChatSeenReceipt((previous) => previous.threadId === threadId && previous.id === id ? previous : { threadId, id });
      } catch (error) { console.error('Could not load chat receipt', error); }
    };
    setChatSeenReceipt({ threadId, id: '' });
    void loadReceipt();
    const timer = window.setInterval(loadReceipt, 3000);
    return () => { cancelled = true; window.clearInterval(timer); };
  }, [screen, activeChat, currentUser?.username]);

  useEffect(() => {
    let cancelled = false;
    safeGet(CUSTOM_EMOJIS_KEY, true).then((record) => {
      if (cancelled || !record) return;
      try {
        const parsed = JSON.parse(record.value);
        if (Array.isArray(parsed)) setCustomEmojis(parsed);
      } catch { /* ignore malformed custom emoji payload */ }
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!rumsSpace || sessionNewTrackingSpaceRef.current !== rumsSpace) return;
    const entries = trackedContentEntries(posts, suggestions, updates, siteConfig, rumsSpace);
    const known = sessionKnownContentRef.current;
    const added = {};
    for (const entry of entries) {
      if (known.has(entry.key)) continue;
      known.add(entry.key);
      added[entry.key] = entry;
    }
    if (Object.keys(added).length) setSessionNewItems((current) => ({ ...current, ...added }));
  }, [posts, suggestions, updates, siteConfig.customWidgets, rumsSpace]);

  useEffect(() => {
    const activeKeys = new Set(Object.keys(sessionNewItems));
    if (!activeKeys.size) return undefined;
    const timers = sessionNewSeenTimersRef.current;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const key = entry.target.getAttribute('data-session-new-key');
        if (!key || !activeKeys.has(key)) continue;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.45) {
          if (!timers.has(key)) {
            const timer = window.setTimeout(() => {
              timers.delete(key);
              markSessionNewSeen(key);
            }, 550);
            timers.set(key, timer);
          }
        } else if (timers.has(key)) {
          clearTimeout(timers.get(key));
          timers.delete(key);
        }
      }
    }, { threshold: [0, 0.45, 0.75] });
    document.querySelectorAll('[data-session-new-key]').forEach((node) => {
      const key = node.getAttribute('data-session-new-key');
      if (key && activeKeys.has(key)) observer.observe(node);
    });
    return () => {
      observer.disconnect();
      timers.forEach((timer, key) => {
        if (activeKeys.has(key)) {
          clearTimeout(timer);
          timers.delete(key);
        }
      });
    };
  }, [sessionNewItems, screen, feedFilter, customPageId, luminaView]);

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

  function tabForPointer(clientX, rect = tabsDragRef.current?.rect || tabsRef.current?.getBoundingClientRect()) {
    return rect && clientX >= rect.left + rect.width / 2 ? 'lumina' : 'all';
  }

  function applyTabDrag(clientX, drag = tabsDragRef.current) {
    const node = tabsRef.current;
    const rect = drag?.rect;
    if (!node || !rect) return;
    const offset = Math.max(0, Math.min(rect.width / 2, clientX - rect.left - rect.width / 4));
    const direction = clientX >= (drag.lastX ?? drag.x) ? 1 : -1;
    drag.lastX = clientX;
    drag.target = tabForPointer(clientX, rect);
    node.dataset.dragTarget = drag.target;
    node.style.setProperty('--seg-translate', `${offset}px`);
    node.style.setProperty('--tab-reflection-x', `${clientX - rect.left - offset}px`);
    node.style.setProperty('--tab-pointer-x', `${clientX - rect.left}px`);
    node.style.setProperty('--tab-tail-offset', `${direction * -15}px`);
    node.style.setProperty('--glass-control-width', `${rect.width}px`);
  }

  function handleTabsPointerDown(e) {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const rect = e.currentTarget.getBoundingClientRect();
    tabsDragRef.current = { pointerId: e.pointerId, x: e.clientX, y: e.clientY, moved: false, rect, frame: 0, pendingX: e.clientX, target: feedFilter };
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
    drag.pendingX = e.clientX;
    if (drag.frame) return;
    drag.frame = window.requestAnimationFrame(() => {
      const current = tabsDragRef.current;
      if (!current) return;
      current.frame = 0;
      applyTabDrag(current.pendingX, current);
    });
  }

  function handleTabsPointerEnd(e) {
    const drag = tabsDragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    if (drag.frame) window.cancelAnimationFrame(drag.frame);
    if (drag.moved) applyTabDrag(e.clientX, drag);
    if (e.type !== 'pointercancel') setFeedFilter(tabForPointer(e.clientX, drag.rect));
    setTabsDragging(false);
    tabsRef.current?.removeAttribute('data-drag-target');
    if (tabsRef.current?.hasPointerCapture(e.pointerId)) tabsRef.current.releasePointerCapture(e.pointerId);
    // A browser may synthesize a click on the starting button after a drag.
    setTimeout(() => { if (tabsDragRef.current === drag) tabsDragRef.current = null; }, 0);
  }

  function rumsVersionForPointer(clientX, rect = rumsVersionDragRef.current?.rect || rumsVersionSwitchRef.current?.getBoundingClientRect()) {
    if (!rect) return rumsSpace || 'rums4';
    const buttons = rumsVersionSwitchRef.current?.querySelectorAll('button[data-space]');
    if (!buttons?.length) return rumsSpace || 'rums4';
    const closest = [...buttons].reduce((best, button) => {
      const bounds = button.getBoundingClientRect();
      const distance = Math.max(bounds.left - clientX, 0, clientX - bounds.right);
      return distance < best.distance ? { space: button.dataset.space, distance } : best;
    }, { space: 'rums4', distance: Infinity });
    return closest.space;
  }

  function applyRumsVersionDrag(clientX, drag = rumsVersionDragRef.current) {
    const node = rumsVersionSwitchRef.current;
    const rect = drag?.rect;
    if (!node || !rect) return;
    const localX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const direction = clientX >= (drag.lastX ?? drag.x) ? 1 : -1;
    drag.lastX = clientX;
    node.style.setProperty('--version-pointer-x', `${localX}px`);
    node.style.setProperty('--version-reflection-x', `${localX}px`);
    node.style.setProperty('--version-tail-offset', `${direction * -12}px`);
    node.style.setProperty('--version-drag-direction', `${direction}`);
    node.style.setProperty('--glass-control-width', `${rect.width}px`);
    const target = rumsVersionForPointer(clientX, rect);
    if (drag.target !== target) {
      drag.target = target;
      node.dataset.dragTarget = target;
    }
  }

  function handleRumsVersionPointerDown(e) {
    if (spaceSwitchBusy) return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    rumsVersionSuppressClickRef.current = false;
    const rect = e.currentTarget.getBoundingClientRect();
    rumsVersionDragRef.current = { pointerId: e.pointerId, x: e.clientX, y: e.clientY, moved: false, rect, frame: 0, pendingX: e.clientX, target: rumsSpace };
    e.currentTarget.setPointerCapture?.(e.pointerId);
    e.currentTarget.style.setProperty('--version-drag-direction', rumsSpace === 'projects' ? '-1' : rumsSpace === 'rums5' ? '0' : '1');
  }

  function handleRumsVersionPointerMove(e) {
    const drag = rumsVersionDragRef.current;
    if (!drag || drag.pointerId !== e.pointerId || spaceSwitchBusy) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    if (!drag.moved && Math.abs(dx) >= 3 && Math.abs(dx) >= Math.abs(dy)) {
      drag.moved = true;
      setRumsVersionDragging(true);
      rumsVersionSwitchRef.current?.setAttribute('data-drag-target', rumsSpace);
    }
    if (!drag.moved) return;
    drag.pendingX = e.clientX;
    if (drag.frame) return;
    drag.frame = window.requestAnimationFrame(() => {
      const current = rumsVersionDragRef.current;
      if (!current) return;
      current.frame = 0;
      applyRumsVersionDrag(current.pendingX, current);
    });
  }

  function handleRumsVersionPointerEnd(e) {
    const drag = rumsVersionDragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    if (drag.frame) window.cancelAnimationFrame(drag.frame);
    if (drag.moved) applyRumsVersionDrag(e.clientX, drag);
    const target = e.type === 'pointercancel' ? rumsSpace : rumsVersionForPointer(e.clientX, drag.rect);
    setRumsVersionDragging(false);
    rumsVersionSwitchRef.current?.removeAttribute('data-drag-target');
    if (rumsVersionSwitchRef.current?.hasPointerCapture?.(e.pointerId)) rumsVersionSwitchRef.current.releasePointerCapture(e.pointerId);

    // Pointer capture lives on the segmented control itself, so a normal tap can
    // be retargeted away from the child button. Handle both taps and drags here.
    if (e.type !== 'pointercancel' && target && target !== rumsSpace && !spaceSwitchBusy) {
      rumsVersionSuppressClickRef.current = true;
      void switchRumsSpace(target);
    }
    rumsVersionDragRef.current = null;
  }

  function luminaViewForPointer(clientX, rect = luminaTabsDragRef.current?.rect || luminaTabsRef.current?.getBoundingClientRect()) {
    if (!rect) return luminaView;
    const index = Math.max(0, Math.min(2, Math.floor((clientX - rect.left) / (rect.width / 3))));
    return LUMINA_SECTIONS[index][0];
  }

  function applyLuminaTabDrag(clientX, drag = luminaTabsDragRef.current) {
    const node = luminaTabsRef.current;
    const rect = drag?.rect;
    if (!node || !rect) return;
    const segment = (rect.width - 10) / 3;
    const offset = Math.max(0, Math.min(segment * 2, clientX - rect.left - 5 - segment / 2));
    const direction = clientX >= (drag.lastX ?? drag.x) ? 1 : -1;
    drag.lastX = clientX;
    drag.target = luminaViewForPointer(clientX, rect);
    node.dataset.dragTarget = drag.target;
    node.style.setProperty('--lumina-drag-tilt', `${direction * 3.5}deg`);
    node.style.setProperty('--lumina-tail-offset', `${direction * -15}px`);
    node.style.setProperty('--lumina-reflection-x', `${clientX - rect.left - 5 - offset}px`);
    node.style.setProperty('--lumina-pointer-x', `${clientX - rect.left}px`);
    node.style.setProperty('--glass-control-width', `${rect.width}px`);
  }

  function handleLuminaTabsPointerDown(e) {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const rect = e.currentTarget.getBoundingClientRect();
    luminaTabsDragRef.current = { pointerId: e.pointerId, x: e.clientX, y: e.clientY, moved: false, rect, frame: 0, pendingX: e.clientX, target: luminaView };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handleLuminaTabsPointerMove(e) {
    const drag = luminaTabsDragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    if (!drag.moved && Math.abs(dx) >= 3 && Math.abs(dx) >= Math.abs(dy)) { drag.moved = true; setLuminaTabsDragging(true); }
    if (!drag.moved) return;
    drag.pendingX = e.clientX;
    if (drag.frame) return;
    drag.frame = window.requestAnimationFrame(() => {
      const current = luminaTabsDragRef.current;
      if (!current) return;
      current.frame = 0;
      applyLuminaTabDrag(current.pendingX, current);
    });
  }

  function handleLuminaTabsPointerEnd(e) {
    const drag = luminaTabsDragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    if (drag.frame) window.cancelAnimationFrame(drag.frame);
    if (drag.moved) applyLuminaTabDrag(e.clientX, drag);
    if (e.type !== 'pointercancel') setLuminaView(luminaViewForPointer(e.clientX, drag.rect));
    setLuminaTabsDragging(false);
    luminaTabsRef.current?.removeAttribute('data-drag-target');
    if (luminaTabsRef.current?.hasPointerCapture(e.pointerId)) luminaTabsRef.current.releasePointerCapture(e.pointerId);
    setTimeout(() => { if (luminaTabsDragRef.current === drag) luminaTabsDragRef.current = null; }, 0);
  }

  function locationTagForPointer(clientX, rect = locationTabsDragRef.current?.rect || locationTabsRef.current?.getBoundingClientRect()) {
    return rect && clientX >= rect.left + rect.width / 2 ? 'Lumina' : 'General';
  }

  function applyLocationTabDrag(clientX, drag = locationTabsDragRef.current) {
    const node = locationTabsRef.current;
    const rect = drag?.rect;
    if (!node || !rect) return;
    drag.target = locationTagForPointer(clientX, rect);
    node.dataset.dragTarget = drag.target;
    node.style.setProperty('--location-pointer-x', `${clientX - rect.left}px`);
    node.style.setProperty('--glass-control-width', `${rect.width}px`);
  }

  function handleLocationTabsPointerDown(e) {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const rect = e.currentTarget.getBoundingClientRect();
    locationTabsDragRef.current = { pointerId: e.pointerId, x: e.clientX, y: e.clientY, moved: false, rect, frame: 0, pendingX: e.clientX, target: tag };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handleLocationTabsPointerMove(e) {
    const drag = locationTabsDragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    if (!drag.moved && Math.abs(dx) >= 3 && Math.abs(dx) >= Math.abs(dy)) { drag.moved = true; setLocationTabsDragging(true); }
    if (!drag.moved) return;
    drag.pendingX = e.clientX;
    if (drag.frame) return;
    drag.frame = window.requestAnimationFrame(() => {
      const current = locationTabsDragRef.current;
      if (!current) return;
      current.frame = 0;
      applyLocationTabDrag(current.pendingX, current);
    });
  }

  function handleLocationTabsPointerEnd(e) {
    const drag = locationTabsDragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    if (drag.frame) window.cancelAnimationFrame(drag.frame);
    if (drag.moved) applyLocationTabDrag(e.clientX, drag);
    if (e.type !== 'pointercancel') setTag(locationTagForPointer(e.clientX, drag.rect));
    setLocationTabsDragging(false);
    locationTabsRef.current?.removeAttribute('data-drag-target');
    if (locationTabsRef.current?.hasPointerCapture(e.pointerId)) locationTabsRef.current.releasePointerCapture(e.pointerId);
    setTimeout(() => { if (locationTabsDragRef.current === drag) locationTabsDragRef.current = null; }, 0);
  }

  function previewGlassStrength(rawValue, input, applyGlobally = false) {
    const value = Math.max(35, Math.min(95, Number(rawValue) || 72));
    const section = input?.closest('.appearance-section');
    const shell = input?.closest('.glass-slider-shell');
    shell?.style.setProperty('--slider-position', `${(value - 35) / 60 * 100}%`);
    const valueLabel = section?.querySelector('[data-glass-value]');
    const description = section?.querySelector('[data-glass-description]');
    const preview = section?.querySelector('.glass-live-preview');
    preview?.style.setProperty('--glass-alpha', `${value / 100}`);
    if (applyGlobally) rootRef.current?.style.setProperty('--glass-alpha', `${value / 100}`);
    if (valueLabel) valueLabel.textContent = `${value}%`;
    if (description) description.textContent = value < 55 ? 'Clear and light' : value < 78 ? 'Balanced glass' : 'Soft and frosted';
    preview?.setAttribute('aria-label', `Glass appearance preview at ${value} percent`);
    return value;
  }

  function commitGlassStrength(input) {
    const value = previewGlassStrength(input?.value, input, true);
    setGlassStrength(value);
  }

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const interactive = 'button, .clickable-row, .profile-grid-thumb, .drop-zone';
    const move = (event) => {
      if (event.pointerType === 'touch') return;
      if (event.target.closest('.feed-tabs.is-dragging,.lumina-view-switch.is-dragging,.location-tabs.is-dragging,.universal-rums-switcher.is-dragging,.glass-slider-shell.is-dragging')) return;
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
    const chatScrollPositions = new WeakMap();
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
      // Chat has its own scrollers; their actual scroll distance is handled below.
      if (event.target instanceof Element && event.target.closest('.chat-page')) return;
      phase += event.deltaY;
      if (!frame) frame = window.requestAnimationFrame(updateGlossMotion);
    };
    const onChatScroll = (event) => {
      const list = event.target;
      if (!(list instanceof Element) || !list.matches('.chat-message-list,.chat-user-list')) return;
      const previous = chatScrollPositions.get(list) ?? 0;
      chatScrollPositions.set(list, list.scrollTop);
      phase += (list.scrollTop - previous) * 0.06;
      if (!frame) frame = window.requestAnimationFrame(updateGlossMotion);
    };
    updateGlossMotion();
    scroller?.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    root.addEventListener('wheel', onWheel, { passive: true });
    root.addEventListener('scroll', onChatScroll, true);
    return () => {
      scroller?.removeEventListener('scroll', onScroll);
      window.removeEventListener('scroll', onScroll);
      root.removeEventListener('wheel', onWheel);
      root.removeEventListener('scroll', onChatScroll, true);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [currentUser]);

  useEffect(() => {
    try { window.localStorage.setItem('rums-glass-strength', String(glassStrength)); } catch { /* browser preferences unavailable */ }
  }, [glassStrength]);

  useEffect(() => {
    const onKey = (event) => {
      const target = event.target;
      const editing = target instanceof HTMLElement && (target.isContentEditable || ['INPUT','TEXTAREA','SELECT'].includes(target.tagName));
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault(); setCommandOpen((open) => !open); return;
      }
      if (editing || event.metaKey || event.ctrlKey || event.altKey) return;
      const key = event.key.toLowerCase();
      if (key === 'g') setScreen('feed');
      else if (key === 'c') setScreen('chat');
      else if (key === 'n') openPostComposer();
      else if (key === '/') { event.preventDefault(); setScreen('search'); setTimeout(() => document.querySelector('.search-bar')?.focus(), 50); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => { void applyDueScheduledPosts(); }, [plazaPlus.scheduled?.length, currentUser?.username]);

  useEffect(() => {
    try { window.localStorage.setItem(THEME_STORAGE_KEY, theme); } catch { /* browser preferences unavailable */ }
  }, [theme]);

  // Poll the shared stores so new posts/suggestions/updates (and their
  // notification badges) show up without needing to log out/in, and so an
  // account deleted elsewhere (by an admin, or by the user themself on
  // another device) gets logged out here too.
  useEffect(() => {
    if (!currentUser) return;
    const id = setInterval(async () => {
      const [p, u, sg, up, cfg, emojiRec] = await Promise.all([
        loadPostsRecordForSpace(rumsSpace || 'rums4'),
        safeGet(USERS_KEY, true),
        safeGet(activeStorageKeys.suggestions, true),
        safeGet(activeStorageKeys.updates, true),
        safeGet(activeStorageKeys.siteConfig, true),
        safeGet(CUSTOM_EMOJIS_KEY, true),
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
          let freshConfig = { ...DEFAULT_SITE_CONFIG, ...JSON.parse(cfg.value) };
          if (freshConfig.brandName === 'RUMS') freshConfig.brandName = PLATFORM_NAME;
          const migrated = migratePlazaOverhaulAnnouncement(freshConfig);
          freshConfig = (isRums5 || isProjectSpace) ? sanitizeConfigForNoLumina(migrated.config) : migrated.config;
          setSiteConfig(freshConfig);
          siteConfigRef.current = freshConfig;
          if (migrated.changed) void window.storage.set(activeStorageKeys.siteConfig, JSON.stringify(freshConfig), true).catch((e) => console.error(e));
        } catch { /* ignore malformed payload */ }
      }
      if (emojiRec) {
        try {
          const freshEmojis = JSON.parse(emojiRec.value);
          if (Array.isArray(freshEmojis)) setCustomEmojis(freshEmojis);
        } catch { /* ignore malformed custom emoji payload */ }
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
    const activeTag = hasLumina && feedFilter === 'lumina' ? 'Lumina' : 'General';
    const latest = posts
      .filter((p) => (activeTag === 'Lumina' ? p.tag === 'Lumina' : p.tag !== 'Lumina'))
      .reduce((max, p) => Math.max(max, p.timestamp), 0);
    if (latest > (lastSeen[activeTag] || 0)) {
      saveLastSeen(currentUser.username, { ...lastSeen, [activeTag]: latest });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, feedFilter, posts, currentUser]);

  function sanitizeConfigForNoLumina(config) {
    return {
      ...DEFAULT_SITE_CONFIG,
      ...config,
      showLumina: false,
      customWidgets: (config?.customWidgets || []).filter((widget) => widget.placement !== 'lumina'),
    };
  }

  async function openProjectsDirectory() {
    setEditMode(false);
    setSelectedBoxId(null);
    setFeedFilter('all');
    setTag('General');
    setNavStack([]);
    try {
      const [record, userRecord, sessionRecord] = await Promise.all([
        safeGet(PLAZA_PLUS_KEY, true),
        safeGet(USERS_KEY, true),
        safeGet(SESSION_KEY, false),
      ]);
      const latest = normalizePlazaPlus(record ? JSON.parse(record.value) : plazaPlus);
      setProjectDirectoryProjects((await readProjectDirectory(latest.projects || [])).map((project) => ({ ...project, category: project.category === 'outside' ? 'outside' : project.category === 'rums5' ? 'rums5' : 'rums4' })));
      setPlazaPlus(latest);
      if (userRecord) {
        const latestUsers = JSON.parse(userRecord.value);
        if (Array.isArray(latestUsers)) {
          setUsers(latestUsers);
          if (sessionRecord) {
            const session = JSON.parse(sessionRecord.value);
            const found = latestUsers.find((user) => user.username === session?.username);
            if (found) setCurrentUser(found);
          }
        }
      }
    } catch (e) { console.error(e); }
    setScreen('projectsDirectory');
  }

  async function chooseProject(project) {
    if (!project?.id) return;
    try {
      const record = await safeGet(projectRecordKey(project.id), true);
      setProjectRecord(record ? JSON.parse(record.value) : project);
      setProjectTab('overview');
    } catch { setProjectRecord(project); }
    await chooseRumsSpace(projectSpaceId(project.id));
  }

  async function chooseRumsSpace(space) {
    if (!isContentSpaceId(space)) return;
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

  useEffect(() => {
    let cancelled = false;
    Promise.all([safeGet(USERS_KEY, true), safeGet(SESSION_KEY, false)])
      .then(([usersRecord, sessionRecord]) => {
        if (cancelled) return;
        const savedUsers = usersRecord ? JSON.parse(usersRecord.value) : [];
        setUsers(Array.isArray(savedUsers) ? savedUsers : []);
        if (sessionRecord) {
          const savedSession = JSON.parse(sessionRecord.value);
          const found = savedUsers.find((user) => user.username === savedSession?.username);
          if (found) setCurrentUser(found);
        }
      })
      .catch((error) => console.error('Could not restore Plaza session', error))
      .finally(() => { if (!cancelled) setEntrySessionReady(true); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!sharedPostRequest || rumsSpace) return;
    void chooseRumsSpace(sharedPostRequest.space);
    // This runs only for a post permalink opened from outside the app.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!sharedPostRequest || !currentUser || rumsSpace !== sharedPostRequest.space) return;
    if (!posts.some((post) => post.id === sharedPostRequest.postId)) return;
    setViewingPostId(sharedPostRequest.postId);
    setScreen('postDetail');
  }, [sharedPostRequest, currentUser, rumsSpace, posts]);

  async function switchRumsSpace(space) {
    if (space === 'projects') { await openProjectsDirectory(); return; }
    if (!isContentSpaceId(space) || space === rumsSpace || spaceSwitchBusy) return;
    if (!currentUser) {
      await chooseRumsSpace(space);
      return;
    }

    const requestId = ++spaceLoadTokenRef.current;
    setSpaceSwitchBusy(space);
    try {
      const keys = storageKeysForSpace(space);
      const [p, sg, up, cfg] = await Promise.all([
        loadPostsRecordForSpace(space),
        safeGet(keys.suggestions, true),
        safeGet(keys.updates, true),
        safeGet(keys.siteConfig, true),
      ]);
      if (requestId !== spaceLoadTokenRef.current) return;

      const loadedPosts = p ? JSON.parse(p.value) : [];
      let loadedConfig;
      if (cfg) {
        loadedConfig = { ...DEFAULT_SITE_CONFIG, ...JSON.parse(cfg.value) };
        if (loadedConfig.brandName === 'RUMS') loadedConfig.brandName = PLATFORM_NAME;
      } else if (space === 'rums5' || isProjectSpaceId(space)) {
        if (isProjectSpaceId(space)) {
          const project = projectRecord?.id === projectIdFromSpace(space) ? projectRecord : (await readProjectDirectory()).find((item) => item.id === projectIdFromSpace(space));
          const parentConfigKey = project?.category === 'rums5' ? RUMS5_SITE_CONFIG_KEY : SITE_CONFIG_KEY;
          const parentRecord = await safeGet(parentConfigKey, true);
          const parentConfig = parentRecord ? { ...DEFAULT_SITE_CONFIG, ...JSON.parse(parentRecord.value) } : DEFAULT_SITE_CONFIG;
          loadedConfig = sanitizeConfigForNoLumina(parentConfig);
          if (project) loadedConfig = { ...loadedConfig, brandName: project.name, heroTitle: project.name, heroText: project.description || `Updates and community posts for ${project.name}.` };
        } else {
          loadedConfig = sanitizeConfigForNoLumina(siteConfigRef.current);
        }
        // Never hold the version switch hostage to a Firestore write.
        void window.storage.set(keys.siteConfig, JSON.stringify(loadedConfig), true).catch((e) => console.error(e));
      } else {
        loadedConfig = DEFAULT_SITE_CONFIG;
      }
      const migratedConfig = migratePlazaOverhaulAnnouncement(loadedConfig);
      loadedConfig = migratedConfig.config;
      if (space === 'rums5' || isProjectSpaceId(space)) loadedConfig = sanitizeConfigForNoLumina(loadedConfig);
      if (migratedConfig.changed) void window.storage.set(keys.siteConfig, JSON.stringify(loadedConfig), true).catch((e) => console.error(e));

      primeSessionNewBaseline(space, loadedPosts, sg ? JSON.parse(sg.value) : [], up ? JSON.parse(up.value) : [], loadedConfig);
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
    setEntryAuth(false);
    setScreen('spaceSelect');
  }

  function openEntryLogin() {
    setEntryAuth(true);
    setAuthMode('login');
    setAuthForm({ username: '', password: '' });
    setError('');
    setScreen('login');
  }

  async function logoutFromEntrance() {
    await handleLogout();
    setEntryAuth(false);
    setScreen('spaceSelect');
  }

  async function init(space = rumsSpace || 'rums4', requestId = spaceLoadTokenRef.current) {
    try {
      const keys = storageKeysForSpace(space);
      const [u, p, sessRec, sg, up, cfg] = await Promise.all([
        safeGet(USERS_KEY, true),
        loadPostsRecordForSpace(space),
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
        if (loadedConfig.brandName === 'RUMS') loadedConfig.brandName = PLATFORM_NAME;
      } else if (space === 'rums5' || isProjectSpaceId(space)) {
        let project = null;
        if (isProjectSpaceId(space)) {
          try {
            const projectRecord = await safeGet(PLAZA_PLUS_KEY, true);
            const latestPlus = normalizePlazaPlus(projectRecord ? JSON.parse(projectRecord.value) : plazaPlus);
            setPlazaPlus(latestPlus);
            const directory = await readProjectDirectory(latestPlus.projects || []);
            setProjectDirectoryProjects(directory);
            const detail = await safeGet(projectRecordKey(projectIdFromSpace(space)), true);
            project = detail ? JSON.parse(detail.value) : directory.find((item) => item.id === projectIdFromSpace(space)) || null;
            setProjectRecord(project);
          } catch { /* project can still open with the generic layout */ }
        }
        const parentConfigKey = project?.category === 'rums5' ? RUMS5_SITE_CONFIG_KEY : SITE_CONFIG_KEY;
        const parentConfigRecord = await safeGet(parentConfigKey, true);
        const parentConfig = parentConfigRecord ? { ...DEFAULT_SITE_CONFIG, ...JSON.parse(parentConfigRecord.value) } : DEFAULT_SITE_CONFIG;
        if (parentConfig.brandName === 'RUMS') parentConfig.brandName = PLATFORM_NAME;
        loadedConfig = sanitizeConfigForNoLumina(parentConfig);
        if (project) loadedConfig = { ...loadedConfig, brandName: project.name, heroTitle: project.name, heroText: project.description || `Updates and community posts for ${project.name}.` };
        try { await window.storage.set(keys.siteConfig, JSON.stringify(loadedConfig), true); } catch { /* first-load clone can retry later */ }
      } else {
        loadedConfig = DEFAULT_SITE_CONFIG;
      }
      const migratedConfig = migratePlazaOverhaulAnnouncement(loadedConfig);
      loadedConfig = migratedConfig.config;
      if (space === 'rums5' || isProjectSpaceId(space)) loadedConfig = sanitizeConfigForNoLumina(loadedConfig);
      if (migratedConfig.changed) {
        try { await window.storage.set(keys.siteConfig, JSON.stringify(loadedConfig), true); } catch { /* migration can retry on a later load */ }
      }
      if (requestId !== spaceLoadTokenRef.current) return;
      const loadedSuggestions = sg ? JSON.parse(sg.value) : [];
      const loadedUpdates = up ? JSON.parse(up.value) : [];
      primeSessionNewBaseline(space, loadedPosts, loadedSuggestions, loadedUpdates, loadedConfig);
      setUsers(loadedUsers);
      setPosts(loadedPosts);
      setSuggestions(loadedSuggestions);
      setUpdates(loadedUpdates);
      setSiteConfig(loadedConfig);
      siteConfigRef.current = loadedConfig;
      if (sessRec) {
        const sess = JSON.parse(sessRec.value);
        const found = loadedUsers.find((x) => x.username === sess.username);
        if (found) {
          setCurrentUser(found);
          setScreen('feed');
          if (Number(found.tutorialVersion || 0) < requiredTutorialVersionForUser(found)) {
            setTutorialStep(0);
            setTutorialReturningUser(true);
            setTutorialActive(true);
          }
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
    const seeded = space === 'rums4' ? { General: now, Lumina: now } : { General: now, Lumina: 0 };
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

  async function saveCustomEmojis(next) {
    setCustomEmojis(next);
    setCustomEmojiStatus('Saving…');
    try {
      await window.storage.set(CUSTOM_EMOJIS_KEY, JSON.stringify(next), true);
      setCustomEmojiStatus('Saved');
    } catch (e) {
      console.error(e);
      setCustomEmojiStatus('Could not save');
    } finally {
      setTimeout(() => setCustomEmojiStatus(''), 1600);
    }
  }

  async function savePosts(next) {
    try {
      await persistPostsForSpace(rumsSpace || 'rums4', next);
      setPosts(next);
      return true;
    } catch (e) {
      console.error(e);
      setError('Could not save — try again.');
      return false;
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


  async function savePlazaNews(next) {
    setPlazaNews(next);
    try {
      await window.storage.set(PLAZA_NEWS_KEY, JSON.stringify(next), true);
    } catch (e) {
      console.error(e);
      setError('Could not save Plaza News — try again.');
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
    if (isRums5 || isProjectSpace) next = sanitizeConfigForNoLumina(next);
    const previous = siteConfigRef.current;
    if (recordHistory && JSON.stringify(previous) !== JSON.stringify(next)) recordSiteHistory(previous);
    siteConfigRef.current = next;
    setSiteConfig(next);
    setSiteConfigBusy(true);
    setSiteConfigStatus('Saving…');
    try {
      await window.storage.set(activeStorageKeys.siteConfig, JSON.stringify((isRums5 || isProjectSpace) ? sanitizeConfigForNoLumina(next) : next), true);
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
        const newUser = { username: uname, password: pass, isAdmin: users.length === 0, tutorialVersion: 0 };
        const next = [...users, newUser];
        // Account creation must wait for a successful write. Do not show a
        // signed-in account that only exists in this tab's React state.
        await window.storage.set(USERS_KEY, JSON.stringify(next), true);
        setUsers(next);
        setCurrentUser(newUser);
        await loadLastSeen(newUser.username, rumsSpace || 'rums4');
        await window.storage.set(SESSION_KEY, JSON.stringify({ username: uname }), false);
        setScreen(entryAuth ? 'spaceSelect' : 'feed');
        setTutorialStep(0);
        setTutorialReturningUser(false);
        setTutorialActive(!entryAuth);
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
        setScreen(entryAuth ? 'spaceSelect' : 'feed');
        if (Number(found.tutorialVersion || 0) < requiredTutorialVersionForUser(found)) {
          setTutorialStep(0);
          setTutorialReturningUser(true);
          setTutorialActive(!entryAuth);
        }
      }
      setEntryAuth(false);
      setAuthForm({ username: '', password: '' });
    } catch (e) {
      console.error(e);
      setError(e?.message || 'Something went wrong. Try again.');
    }
    setBusy(false);
  }

  async function handleLogout() {
    await disableDeviceNotifications();
    setCurrentUser(null);
    try {
      await window.storage.delete(SESSION_KEY, false);
    } catch {
      /* ignore */
    }
    setScreen('login');
  }

  const pushPublicKey = import.meta.env.VITE_PUSH_VAPID_PUBLIC_KEY;
  function pushKeyBytes(key) {
    const base64 = key.replace(/-/g, '+').replace(/_/g, '/');
    const raw = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='));
    return Uint8Array.from(raw, (character) => character.charCodeAt(0));
  }

  async function sendDeviceTest(subscription) {
    const response = await fetch('/api/push', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'test', username: currentUser.username, password: currentUser.password, endpoint: subscription.endpoint }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Could not deliver the test notification.');
    setPushStatus('Push service accepted the test alert. Check this device’s notifications.');
  }

  async function testDeviceNotifications() {
    if (!currentUser || pushBusy) return;
    setPushBusy(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) throw new Error('This device is no longer subscribed. Turn notifications off and on again.');
      await sendDeviceTest(subscription);
    } catch (error) { setPushStatus(error.message || 'Could not send a test alert.'); }
    finally { setPushBusy(false); }
  }

  async function enableDeviceNotifications() {
    if (!currentUser || pushBusy) return;
    if (!pushPublicKey) { setPushStatus('Device notifications need push keys configured on the server.'); return; }
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) { setPushStatus('This browser does not support device notifications.'); return; }
    if (/iPhone|iPad|iPod/.test(navigator.userAgent) && !window.navigator.standalone && !window.matchMedia('(display-mode: standalone)').matches) { setPushStatus('On iPhone, use Share → Add to Home Screen, then open RUMS Plaza from its new icon.'); return; }
    setPushBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') { setPushStatus('Allow notifications for RUMS Plaza in your device settings.'); return; }
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();
      const expectedKey = pushKeyBytes(pushPublicKey);
      const existingKey = subscription?.options?.applicationServerKey;
      if (existingKey && (existingKey.byteLength !== expectedKey.length || !new Uint8Array(existingKey).every((byte, index) => byte === expectedKey[index]))) {
        await subscription.unsubscribe();
        subscription = null;
      }
      if (!subscription) subscription = await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: expectedKey });
      const response = await fetch('/api/push', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'subscribe', username: currentUser.username, password: currentUser.password, subscription: subscription.toJSON() }) });
      if (!response.ok) throw new Error((await response.json()).error || 'Could not register this device.');
      setPushEnabled(true);
      await sendDeviceTest(subscription);
    } catch (error) { setPushStatus(error.message || 'Could not enable notifications.'); }
    finally { setPushBusy(false); }
  }

  async function disableDeviceNotifications() {
    if (!('serviceWorker' in navigator)) return;
    try {
      const registration = await navigator.serviceWorker.getRegistration('/');
      const subscription = await registration?.pushManager?.getSubscription();
      if (subscription) {
        try { await fetch('/api/push', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'unsubscribe', endpoint: subscription.endpoint }), signal: AbortSignal.timeout(5000) }); }
        catch (error) { console.error('Could not remove server subscription', error); }
        await subscription.unsubscribe();
      }
    } catch (error) { console.error('Could not remove device subscription', error); }
    setPushEnabled(false);
    setPushStatus('Device notifications are off.');
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

  function openPostComposer(preferredTag = null) {
    setError('');
    const fromLuminaContext = hasLumina && (
      preferredTag === 'Lumina' ||
      screen === 'lumina' ||
      (screen === 'feed' && feedFilter === 'lumina')
    );
    setTag(fromLuminaContext ? 'Lumina' : (preferredTag || 'General'));
    setScreen('upload');
  }

  function openLumina() {
    if (isRums5 || isProjectSpace) return;
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
      images: [uploadPreview, ...uploadGallery].filter(Boolean).slice(0, 6),
      altText: postAltText.trim().slice(0, 240),
      link: postLink.trim().slice(0, 500),
      videoUrl: postVideoUrl.trim().slice(0, 500),
      poll: postPollDraft.question.trim() ? { question: postPollDraft.question.trim().slice(0, 120), options: postPollDraft.options.map((option) => ({ id: `${Date.now()}-${Math.random().toString(36).slice(2,5)}`, text: option.trim().slice(0,80), votes: [] })).filter((option) => option.text).slice(0, 4) } : null,
      editHistory: [],
      caption: caption.trim(),
      tag: (isRums5 || isProjectSpace) ? 'General' : tag,
      timestamp: Date.now(),
      likes: [],
      comments: [],
      reactions: {},
    };
    const saved = await savePosts([newPost, ...posts]);
    if (!saved) {
      setBusy(false);
      return;
    }
    const mentioned = [...new Set(((newPost.caption || '').match(/@[A-Za-z0-9_]+/g) || []).map((m)=>m.slice(1)).filter((name)=>users.some((u)=>u.username.toLowerCase()===name.toLowerCase()) && name.toLowerCase()!==currentUser.username.toLowerCase()))];
    if (mentioned.length) void commitPlazaPlus((data)=>({...data,activities:[...mentioned.map((targetUser,i)=>({id:`act-${Date.now()}-post-${i}`,type:'mention',actor:currentUser.username,targetUser,postId:newPost.id,text:`${currentUser.username} mentioned you in a post`,timestamp:Date.now()})),...(data.activities||[])].slice(0,800)}));
    setUploadPreview(null);
    setUploadGallery([]);
    setPostAltText('');
    setPostLink('');
    setPostVideoUrl('');
    setPostPollDraft({ question: '', options: ['', ''] });
    setCaption('');
    setTag('General');
    setBusy(false);
    setScreen('feed');
  }

  async function editPostCaption(postId) {
    const post = posts.find((p) => p.id === postId);
    if (!post || (post.username !== currentUser.username && !currentUser.isAdmin)) return;
    const nextCaption = window.prompt('Edit caption', post.caption || '');
    if (nextCaption === null || nextCaption.trim() === (post.caption || '').trim()) return;
    const next = posts.map((p) => p.id === postId ? { ...p, caption: nextCaption.trim().slice(0,1200), editHistory: [...(p.editHistory || []), { caption: p.caption || '', editedAt: Date.now(), editor: currentUser.username }].slice(-25) } : p);
    await savePosts(next);
  }

  async function votePostPoll(postId, optionId) {
    if (!currentUser) return;
    const next = posts.map((post) => {
      if (post.id !== postId || !post.poll) return post;
      return { ...post, poll: { ...post.poll, options: post.poll.options.map((option) => ({ ...option, votes: option.id === optionId ? [...new Set([...(option.votes || []).filter((u)=>u!==currentUser.username), currentUser.username])] : (option.votes || []).filter((u)=>u!==currentUser.username) })) } };
    });
    await savePosts(next);
  }

  async function toggleLike(postId) {
    const post = posts.find((p) => p.id === postId);
    if (!post || !currentUser) return;
    const previousPosts = posts;
    const wasLiked = post.likes.includes(currentUser.username);
    const next = posts.map((p) => {
      if (p.id !== postId) return p;
      return {
        ...p,
        likes: wasLiked ? p.likes.filter((u) => u !== currentUser.username) : [...p.likes, currentUser.username],
      };
    });

    // Optimistic UI: update the heart immediately, then persist in the background.
    setPosts(next);
    try {
      await persistPostsForSpace(rumsSpace || 'rums4', next);
      showActionToast('like', wasLiked ? 'Like removed' : 'Post liked');
      const becameLiked = !wasLiked;
      if (becameLiked && post.username !== currentUser.username) {
        void commitPlazaPlus((data) => ({ ...data, activities: [{ id:`act-${Date.now()}-${Math.random().toString(36).slice(2,5)}`, type:'like', actor:currentUser.username, targetUser:post.username, postId, text:`${currentUser.username} liked your post`, timestamp:Date.now() }, ...(data.activities||[])].slice(0,800) }));
      }
    } catch (e) {
      console.error(e);
      setPosts(previousPosts);
      setError('Could not save — try again.');
    }
  }


  function cleanedReactions(reactions, emoji, username) {
    const next = { ...(reactions || {}) };
    const users = Array.isArray(next[emoji]) ? next[emoji] : [];
    next[emoji] = users.includes(username) ? users.filter((u) => u !== username) : [...users, username];
    if (next[emoji].length === 0) delete next[emoji];
    return next;
  }

  function customEmojiForKey(key) {
    if (!key?.startsWith('custom:')) return null;
    const id = key.slice('custom:'.length);
    return customEmojis.find((emoji) => emoji.id === id) || null;
  }

  function reactionIsAvailable(key) {
    return NATIVE_REACTION_EMOJI_SET.has(key) || Boolean(customEmojiForKey(key));
  }

  function reactionLabel(key) {
    const custom = customEmojiForKey(key);
    return custom ? `:${custom.name}:` : key;
  }

  function renderReactionGlyph(key, className = '') {
    const custom = customEmojiForKey(key);
    return custom
      ? <img className={`custom-reaction-emoji ${className}`} src={custom.image} alt={`:${custom.name}:`} />
      : <span className={className}>{key}</span>;
  }

  function canReactToPost(post, reactionContext = 'default') {
    return Boolean(post);
  }

  async function togglePostReaction(postId, emoji, reactionContext = 'default') {
    if (!currentUser || !reactionIsAvailable(emoji)) return;
    const post = posts.find((p) => p.id === postId);
    if (!canReactToPost(post, reactionContext)) return;
    const next = posts.map((p) => p.id === postId
      ? { ...p, reactions: cleanedReactions(p.reactions, emoji, currentUser.username) }
      : p
    );
    await savePosts(next);
    const target = posts.find((p)=>p.id===postId);
    const added = target && !(target.reactions?.[emoji] || []).includes(currentUser.username);
    if (added && target?.username !== currentUser.username) void commitPlazaPlus((data)=>({...data,activities:[{id:`act-${Date.now()}-reaction`,type:'reaction',actor:currentUser.username,targetUser:target.username,postId,text:`${currentUser.username} reacted to your post`,timestamp:Date.now()},...(data.activities||[])].slice(0,800)}));
  }

  async function toggleSuggestionReaction(suggestionId, emoji) {
    if (!currentUser || !reactionIsAvailable(emoji)) return;
    const next = suggestions.map((s) => s.id === suggestionId
      ? { ...s, reactions: cleanedReactions(s.reactions, emoji, currentUser.username) }
      : s
    );
    await saveSuggestions(next);
    const target = suggestions.find((s)=>s.id===suggestionId);
    const added = target && !(target.reactions?.[emoji] || []).includes(currentUser.username);
    if (added && target?.username !== currentUser.username) void commitPlazaPlus((data)=>({...data,activities:[{id:`act-${Date.now()}-sreaction`,type:'reaction',actor:currentUser.username,targetUser:target.username,text:`${currentUser.username} reacted to your suggestion`,timestamp:Date.now()},...(data.activities||[])].slice(0,800)}));
  }

  function toggleReactionMenu(menuKey) {
    setReactionMenus((menus) => ({ [menuKey]: !menus[menuKey] }));
    setReactionPickerCategory('smileys');
    setReactionSearch('');
  }

  function renderReactionAddButton(item, kind, className = '', reactionContext = 'default') {
    if (!currentUser || (kind === 'post' && !canReactToPost(item, reactionContext))) return null;
    const menuKey = `${kind}:${item.id}`;
    const menuOpen = !!reactionMenus[menuKey];
    return (
      <button
        type="button"
        className={`reaction-add reaction-action ${menuOpen ? 'active' : ''} ${className}`}
        onClick={() => toggleReactionMenu(menuKey)}
        aria-label={menuOpen ? 'Close emoji picker' : 'Add reaction'}
        title={menuOpen ? 'Close emoji picker' : 'Add reaction'}
      >
        <Plus size={16} />
      </button>
    );
  }

  function renderReactionPicker(item, kind, menuKey, reactions, reactionContext = 'default') {
    const toggle = kind === 'post'
      ? (id, emoji) => togglePostReaction(id, emoji, reactionContext)
      : toggleSuggestionReaction;
    const category = reactionPickerCategory;
    const query = reactionSearch.trim().toLowerCase();
    const searching = query.length > 0;
    const native = searching
      ? NATIVE_REACTION_EMOJIS.filter((emoji) => nativeEmojiSearchName(emoji).includes(query)).slice(0, 240)
      : (category === 'custom' ? [] : (NATIVE_EMOJIS_BY_CATEGORY[category] || []));
    const custom = searching
      ? customEmojis.filter((emoji) => emoji.name.toLowerCase().includes(query)).slice(0, 80)
      : (category === 'custom' ? customEmojis : []);
    const noResults = searching && native.length === 0 && custom.length === 0;
    return (
      <div className="reaction-picker" aria-label="Choose a reaction">
        <div className="reaction-picker-search">
          <Search size={14} aria-hidden="true" />
          <input
            type="search"
            value={reactionSearch}
            onChange={(event) => setReactionSearch(event.target.value)}
            placeholder="Search emoji by name"
            aria-label="Search emoji by name"
            autoComplete="off"
            spellCheck="false"
          />
          {reactionSearch && (
            <button type="button" className="reaction-picker-search-clear" onClick={() => setReactionSearch('')} aria-label="Clear emoji search">
              <X size={13} />
            </button>
          )}
        </div>
        <div className={`reaction-picker-tabs ${searching ? 'is-searching' : ''}`} role="tablist" aria-label="Emoji categories">
          {EMOJI_CATEGORY_META.map(([key, icon]) => {
            if (key === 'custom' && customEmojis.length === 0) return null;
            return (
              <button
                type="button"
                role="tab"
                aria-selected={!searching && category === key}
                className={!searching && category === key ? 'selected' : ''}
                key={key}
                onClick={() => {
                  setReactionPickerCategory(key);
                  setReactionSearch('');
                }}
                title={key.charAt(0).toUpperCase() + key.slice(1)}
              >
                {key === 'custom' ? <b>R</b> : icon}
              </button>
            );
          })}
        </div>
        <div className="reaction-picker-grid">
          {custom.map((emoji) => {
            const key = `custom:${emoji.id}`;
            const mine = (reactions[key] || []).includes(currentUser.username);
            return (
              <button
                type="button"
                key={key}
                className={mine ? 'selected' : ''}
                onClick={() => toggle(item.id, key)}
                aria-pressed={mine}
                title={`:${emoji.name}:`}
              >
                <img className="custom-reaction-emoji picker-custom-emoji" src={emoji.image} alt={`:${emoji.name}:`} />
              </button>
            );
          })}
          {native.map((emoji) => {
            const mine = (reactions[emoji] || []).includes(currentUser.username);
            const emojiName = nativeEmojiSearchName(emoji);
            return (
              <button
                type="button"
                key={emoji}
                className={mine ? 'selected' : ''}
                onClick={() => toggle(item.id, emoji)}
                aria-pressed={mine}
                title={emojiName || emoji}
              >{emoji}</button>
            );
          })}
          {!searching && category === 'custom' && custom.length === 0 && <div className="reaction-picker-empty">No custom emoji yet.</div>}
          {noResults && <div className="reaction-picker-empty">No emoji found for “{reactionSearch.trim()}”.</div>}
        </div>
      </div>
    );
  }

  function renderReactionBar(item, kind, reactionContext = 'default') {
    if (!currentUser || (kind === 'post' && !canReactToPost(item, reactionContext))) return null;
    const menuKey = `${kind}:${item.id}`;
    const reactions = item.reactions || {};
    const visible = Object.keys(reactions).filter((key) => reactionIsAvailable(key) && (reactions[key] || []).length > 0);
    const menuOpen = !!reactionMenus[menuKey];
    if (!visible.length && !menuOpen) return null;
    const toggle = kind === 'post'
      ? (id, emoji) => togglePostReaction(id, emoji, reactionContext)
      : toggleSuggestionReaction;
    return (
      <div className={`reaction-bar ${menuOpen ? 'is-open' : ''}`}>
        {visible.length > 0 && (
          <div className="reaction-chips">
            {visible.map((emoji) => {
              const users = reactions[emoji] || [];
              const mine = users.includes(currentUser.username);
              return (
                <button
                  type="button"
                  key={emoji}
                  className={`reaction-chip ${mine ? 'mine' : ''}`}
                  onClick={() => toggle(item.id, emoji)}
                  title={`${reactionLabel(emoji)} · ${users.length} reaction${users.length === 1 ? '' : 's'}`}
                  aria-pressed={mine}
                >
                  {renderReactionGlyph(emoji)}<b>{users.length}</b>
                </button>
              );
            })}
          </div>
        )}
        {menuOpen && renderReactionPicker(item, kind, menuKey, reactions, reactionContext)}
      </div>
    );
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
      ...(commentReplyTo[postId] ? { parentId: commentReplyTo[postId] } : {}),
    };
    const next = posts.map((p) =>
      p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p
    );
    await savePosts(next);
    const post = posts.find((p) => p.id === postId);
    const mentioned = [...new Set((text.match(/@[A-Za-z0-9_]+/g) || []).map((m) => m.slice(1)).filter((name) => users.some((u) => u.username.toLowerCase() === name.toLowerCase())))];
    const repliedTo = post?.comments?.find((comment) => comment.id === commentReplyTo[postId]);
    const targets = new Set([...(post?.username && post.username !== currentUser.username ? [post.username] : []), ...(repliedTo?.username && repliedTo.username !== currentUser.username ? [repliedTo.username] : []), ...mentioned.filter((name) => name !== currentUser.username)]);
    if (targets.size) void commitPlazaPlus((data) => ({ ...data, activities: [...[...targets].map((targetUser, i) => ({ id:`act-${Date.now()}-${i}-${Math.random().toString(36).slice(2,5)}`, type:mentioned.some((m)=>m.toLowerCase()===targetUser.toLowerCase())?'mention':'comment', actor:currentUser.username, targetUser, postId, text:mentioned.some((m)=>m.toLowerCase()===targetUser.toLowerCase()) ? `${currentUser.username} mentioned you in a comment` : `${currentUser.username} commented on your post`, timestamp:Date.now() })), ...(data.activities||[])].slice(0,800) }));
    setCommentDrafts((d) => ({ ...d, [postId]: '' }));
    setCommentReplyTo((d) => ({ ...d, [postId]: null }));
  }

  async function deleteComment(postId, commentId) {
    const next = posts.map((p) =>
      p.id === postId ? { ...p, comments: p.comments.filter((c) => c.id !== commentId && c.parentId !== commentId) } : p
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

  function postPermalink(post) {
    const url = new URL(window.location.href);
    url.search = '';
    url.hash = '';
    url.searchParams.set('space', rumsSpace || 'rums4');
    url.searchParams.set('post', post.id);
    return url.toString();
  }

  async function sharePost(post) {
    const url = postPermalink(post);
    const title = `${post.username} on ${PLATFORM_NAME}`;
    const text = `${post.username} shared a post${post.tag === 'Lumina' ? ' from Lumina' : ''} on ${PLATFORM_NAME}${post.caption ? `: "${post.caption}"` : ''}`;
    const clipboardText = `${text}\n${url}`;
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        setShareStatus((s) => ({ ...s, [post.id]: 'shared' }));
      } else {
        await navigator.clipboard.writeText(clipboardText);
        setShareStatus((s) => ({ ...s, [post.id]: 'copied' }));
      }
    } catch (e) {
      if (e?.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(clipboardText);
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

  async function handleCustomEmojiFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setCustomEmojiBusy(true);
    setCustomEmojiStatus('Processing…');
    try {
      const image = await resizeEmojiImage(file, 96);
      setCustomEmojiDraft((draft) => ({ ...draft, image }));
      setCustomEmojiStatus('Ready');
    } catch (e) {
      console.error(e);
      setCustomEmojiStatus('Could not read image');
    } finally {
      setCustomEmojiBusy(false);
      event.target.value = '';
      setTimeout(() => setCustomEmojiStatus(''), 1600);
    }
  }

  async function addCustomEmoji() {
    const name = customEmojiDraft.name.trim().replace(/^:+|:+$/g, '').replace(/[^A-Za-z0-9_-]/g, '').toLowerCase();
    if (!name || !customEmojiDraft.image || customEmojiBusy) {
      setCustomEmojiStatus(!name ? 'Add a name' : 'Choose an image');
      return;
    }
    if (customEmojis.some((emoji) => emoji.name.toLowerCase() === name)) {
      setCustomEmojiStatus('That name already exists');
      return;
    }
    if (customEmojis.length >= 80) {
      setCustomEmojiStatus('Custom emoji limit reached');
      return;
    }
    const next = [...customEmojis, { id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`, name, image: customEmojiDraft.image }];
    await saveCustomEmojis(next);
    setCustomEmojiDraft({ name: '', image: '' });
  }

  async function removeCustomEmoji(id) {
    const key = `custom:${id}`;
    const next = customEmojis.filter((emoji) => emoji.id !== id);
    await saveCustomEmojis(next);
    const strip = (reactions) => {
      const cleaned = { ...(reactions || {}) };
      delete cleaned[key];
      return cleaned;
    };
    // Custom emoji are universal, so removing one also cleans its stored reactions in both RUMS spaces.
    await Promise.all(['rums4', 'rums5'].map(async (space) => {
      const keys = storageKeysForSpace(space);
      const [postRecord, suggestionRecord] = await Promise.all([
        loadPostsRecordForSpace(space),
        safeGet(keys.suggestions, true),
      ]);
      const spacePosts = postRecord ? JSON.parse(postRecord.value) : [];
      const spaceSuggestions = suggestionRecord ? JSON.parse(suggestionRecord.value) : [];
      const cleanedPosts = spacePosts.map((post) => ({ ...post, reactions: strip(post.reactions) }));
      const cleanedSuggestions = spaceSuggestions.map((suggestion) => ({ ...suggestion, reactions: strip(suggestion.reactions) }));
      await Promise.all([
        persistPostsForSpace(space, cleanedPosts),
        window.storage.set(keys.suggestions, JSON.stringify(cleanedSuggestions), true),
      ]);
      if (space === rumsSpace) {
        setPosts(cleanedPosts);
        setSuggestions(cleanedSuggestions);
      }
    }));
  }

  async function loadKlipyGifs({ query = gifQuery, next = '', append = false } = {}) {
    const requestId = ++gifSearchRequestRef.current;
    setGifLoading(true);
    setGifError('');
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set('q', query.trim());
      if (next) params.set('pos', next);
      params.set('limit', '8');
      const response = await fetch(`/api/klipy?${params.toString()}`);
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.error || 'Could not load GIFs.');
      if (requestId !== gifSearchRequestRef.current) return;
      const incoming = Array.isArray(payload.results) ? payload.results : [];
      setGifResults((current) => append ? [...current, ...incoming] : incoming);
      setGifNext(payload.next || '');
    } catch (error) {
      if (requestId !== gifSearchRequestRef.current) return;
      console.error(error);
      setGifError(error?.message || 'Could not load GIFs.');
      if (!append) setGifResults([]);
    } finally {
      if (requestId === gifSearchRequestRef.current) setGifLoading(false);
    }
  }

  function queueGifSearch(value) {
    setGifQuery(value);
    if (gifSearchTimerRef.current) clearTimeout(gifSearchTimerRef.current);
    gifSearchTimerRef.current = setTimeout(() => {
      void loadKlipyGifs({ query: value, next: '', append: false });
    }, 220);
  }

  function openGifPicker() {
    setGifPickerOpen((open) => {
      const nextOpen = !open;
      if (nextOpen && gifResults.length === 0 && !gifLoading) void loadKlipyGifs({ query: '', next: '', append: false });
      return nextOpen;
    });
  }

  async function selectKlipyGif(gif) {
    if (!gif?.url) return;
    setChatGifDraft(gif);
    setChatImageDraft('');
    setGifPickerOpen(false);
    try {
      await fetch('/api/klipy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'share', id: gif.id }),
      });
    } catch { /* selection still works if share tracking fails */ }
  }

  async function handleChatImagePick(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    setChatImageBusy(true);
    try {
      const image = await resizeImage(file);
      setChatImageDraft(image);
      setChatGifDraft(null);
    } catch (e) {
      console.error(e);
      setError('Could not load that image.');
    } finally {
      setChatImageBusy(false);
    }
  }

  async function sendChatMessage() {
    if (!currentUser || chatBusy || chatImageBusy) return;
    const text = chatDraft.trim().slice(0, 1200);
    const image = chatImageDraft || '';
    const gif = chatGifDraft ? { id: chatGifDraft.id || '', title: chatGifDraft.title || 'GIF', url: chatGifDraft.url || '', preview: chatGifDraft.preview || '', mp4: chatGifDraft.mp4 || '', tinymp4: chatGifDraft.tinymp4 || '' } : null;
    if (!text && !image && !gif) return;
    if (activeChat !== 'plaza' && !activeChat.startsWith('dm:') && !activeChat.startsWith('group:')) return;
    const recipient = activeChat.startsWith('dm:') ? activeChat.slice(3) : null;
    const groupId = activeChat.startsWith('group:') ? activeChat.slice(6) : null;
    const group = groupId ? (plazaPlus.groups || []).find((g) => g.id === groupId) : null;
    if (groupId && !group?.members?.includes(currentUser.username)) return;
    if (recipient && !users.some((user) => user.username === recipient)) {
      setError('That user is no longer available.');
      return;
    }
    setChatBusy(true);
    const message = {
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      type: recipient ? 'dm' : groupId ? 'group' : 'room',
      room: recipient ? null : groupId || CHAT_ROOM_ID,
      participants: recipient ? [currentUser.username, recipient].sort((a, b) => a.localeCompare(b)) : groupId ? [...(group?.members || [])] : [],
      sender: currentUser.username,
      text,
      image,
      gif,
      replyTo: chatReplyTo ? { id: chatReplyTo.id, sender: chatReplyTo.sender, text: chatReplyTo.text || '', image: chatReplyTo.image || '' } : null,
      timestamp: Date.now(),
    };
    try {
      const record = await safeGet(CHAT_MESSAGES_KEY, true);
      let latest = chatMessages;
      if (record) {
        try {
          const parsed = JSON.parse(record.value);
          if (Array.isArray(parsed)) latest = parsed;
        } catch { /* keep local copy */ }
      }
      const next = [...latest.filter((item) => item?.id !== message.id), message]
        .filter((item) => item && item.id && item.sender && (item.text || item.image || item.gif))
        .slice(-2500);
      await window.storage.set(CHAT_MESSAGES_KEY, JSON.stringify(next), true);
      setChatMessages(next);
      const chatTargets = new Set();
      if (recipient) chatTargets.add(recipient);
      for (const mention of ((text || '').match(/@[A-Za-z0-9_]+/g) || [])) {
        const name = mention.slice(1);
        const found = users.find((u)=>u.username.toLowerCase()===name.toLowerCase());
        if (found && found.username !== currentUser.username) chatTargets.add(found.username);
      }
      if (groupId) (group?.members || []).filter((u)=>u!==currentUser.username).forEach((u)=>chatTargets.add(u));
      if (chatTargets.size) {
        const preview = text ? `${text.replace(/\s+/g, ' ').trim().slice(0, 140)}${image ? ' · Photo' : gif ? ' · GIF' : ''}` : gif ? 'Sent a GIF' : 'Sent a photo';
        void commitPlazaPlus((data)=>({...data,activities:[...[...chatTargets].map((targetUser,i)=>({id:`act-${Date.now()}-chat-${i}`,type:'message',actor:currentUser.username,targetUser,text:`${currentUser.username} sent you a chat message`,preview,timestamp:Date.now()})),...(data.activities||[])].slice(0,800)}));
      }
      setChatDraft('');
      setChatImageDraft('');
      setChatGifDraft(null);
      setChatReplyTo(null);
      setChatReadState((current) => {
        const nextRead = { ...current, [activeChat]: message.timestamp };
        void window.storage.set(chatReadKey(currentUser.username), JSON.stringify(nextRead), false).catch((e) => console.error(e));
        return nextRead;
      });
    } catch (e) {
      console.error(e);
      setError('Could not send that message — try again.');
    } finally {
      setChatBusy(false);
    }
  }

  async function deleteChatMessage(messageId) {
    if (!currentUser) return;
    const target = chatMessages.find((message) => message.id === messageId);
    if (!target || (target.sender !== currentUser.username && !canModerate)) return;
    try {
      const record = await safeGet(CHAT_MESSAGES_KEY, true);
      let latest = chatMessages;
      if (record) {
        try {
          const parsed = JSON.parse(record.value);
          if (Array.isArray(parsed)) latest = parsed;
        } catch { /* keep local copy */ }
      }
      const next = latest.filter((message) => message.id !== messageId);
      await window.storage.set(CHAT_MESSAGES_KEY, JSON.stringify(next), true);
      setChatMessages(next);
    } catch (e) {
      console.error(e);
      setError('Could not delete that message.');
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
        reactions: Object.fromEntries(Object.entries(p.reactions || {}).map(([emoji, names]) => [emoji, (names || []).filter((u) => u !== username)]).filter(([, names]) => names.length)),
        comments: p.comments
          .filter((c) => c.username !== username)
          .map((c) => ({ ...c, likes: (c.likes || []).filter((u) => u !== username) })),
      }));
    await savePosts(nextPosts);
    const nextSuggestions = suggestions
      .filter((s) => s.username !== username)
      .map((s) => ({ ...s, votes: (s.votes || []).filter((u) => u !== username), reactions: Object.fromEntries(Object.entries(s.reactions || {}).map(([emoji, names]) => [emoji, (names || []).filter((u) => u !== username)]).filter(([, names]) => names.length)) }));
    await saveSuggestions(nextSuggestions);
    try {
      const chatRecord = await safeGet(CHAT_MESSAGES_KEY, true);
      const allMessages = chatRecord ? JSON.parse(chatRecord.value) : chatMessages;
      const cleanedMessages = (Array.isArray(allMessages) ? allMessages : [])
        .filter((message) => message.sender !== username && !(message.type === 'dm' && (message.participants || []).includes(username)));
      await window.storage.set(CHAT_MESSAGES_KEY, JSON.stringify(cleanedMessages), true);
      setChatMessages(cleanedMessages);
      try { await window.storage.delete(chatReadKey(username), false); } catch { /* ignore */ }
    } catch { /* chat cleanup can retry later */ }
    try {
      await commitPlazaPlus((data) => {
        const omitKey = (obj = {}) => Object.fromEntries(Object.entries(obj).filter(([key]) => key !== username));
        const removeNameFromLists = (obj = {}) => Object.fromEntries(Object.entries(obj).filter(([key]) => key !== username).map(([key, value]) => [key, Array.isArray(value) ? value.filter((name) => name !== username) : value]));
        const cleanedChatReactions = Object.fromEntries(Object.entries(data.chatReactions || {}).map(([messageId, reactions]) => [messageId, Object.fromEntries(Object.entries(reactions || {}).map(([emoji, names]) => [emoji, (names || []).filter((name) => name !== username)]).filter(([, names]) => names.length))]));
        const cleanedTyping = Object.fromEntries(Object.entries(data.typing || {}).map(([thread, typing]) => [thread, Object.fromEntries(Object.entries(typing || {}).filter(([name]) => name !== username))]));
        return {
          ...data,
          follows: removeNameFromLists(data.follows), bookmarks: omitKey(data.bookmarks), collections: omitKey(data.collections), profiles: omitKey(data.profiles), presence: omitKey(data.presence), notificationReads: omitKey(data.notificationReads), roles: omitKey(data.roles), xp: omitKey(data.xp), drafts: omitKey(data.drafts), pageThemes: omitKey(data.pageThemes), accessibility: omitKey(data.accessibility), commandHistory: omitKey(data.commandHistory),
          activities: (data.activities || []).filter((item) => item.actor !== username && item.targetUser !== username),
          events: (data.events || []).map((event) => ({ ...event, creator: event.creator === username ? 'Deleted user' : event.creator, rsvps: Object.fromEntries(Object.entries(event.rsvps || {}).map(([key, names]) => [key, (names || []).filter((name) => name !== username)])) })),
          groups: (data.groups || []).map((group) => ({ ...group, owner: group.owner === username ? ((group.members || []).find((name) => name !== username) || 'Deleted user') : group.owner, members: (group.members || []).filter((name) => name !== username) })).filter((group) => group.members.length > 0),
          projects: (data.projects || []).map((project) => ({ ...project, owner: project.owner === username ? 'Deleted user' : project.owner, followers: (project.followers || []).filter((name) => name !== username) })),
          wiki: (data.wiki || []).map((page) => ({ ...page, author: page.author === username ? 'Deleted user' : page.author })),
          builds: (data.builds || []).map((build) => ({ ...build, owner: build.owner === username ? 'Deleted user' : build.owner, author: build.author === username ? 'Deleted user' : build.author })),
          reports: (data.reports || []).filter((report) => report.reporter !== username),
          audit: (data.audit || []).map((entry) => ({ ...entry, actor: entry.actor === username ? 'Deleted user' : entry.actor })),
          invites: (data.invites || []).filter((invite) => invite.creator !== username),
          scheduled: (data.scheduled || []).filter((item) => item.username !== username),
          chatReactions: cleanedChatReactions,
          typing: cleanedTyping,
          changelog: (data.changelog || []).map((entry) => ({ ...entry, author: entry.author === username ? 'Deleted user' : entry.author })),
          themePresets: (data.themePresets || []).filter((preset) => preset.owner !== username),
        };
      });
    } catch { /* Plaza+ cleanup can retry later */ }
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
        reactions: Object.fromEntries(Object.entries(p.reactions || {}).map(([emoji, names]) => [emoji, (names || []).map((u) => (u === oldUsername ? trimmed : u))])),
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
        reactions: Object.fromEntries(Object.entries(s.reactions || {}).map(([emoji, names]) => [emoji, (names || []).map((u) => (u === oldUsername ? trimmed : u))])),
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
        const chatRecord = await safeGet(CHAT_MESSAGES_KEY, true);
        const allMessages = chatRecord ? JSON.parse(chatRecord.value) : chatMessages;
        const renamedMessages = (Array.isArray(allMessages) ? allMessages : []).map((message) => ({
          ...message,
          sender: message.sender === oldUsername ? trimmed : message.sender,
          participants: Array.isArray(message.participants)
            ? message.participants.map((name) => (name === oldUsername ? trimmed : name)).sort((a, b) => a.localeCompare(b))
            : message.participants,
        }));
        await window.storage.set(CHAT_MESSAGES_KEY, JSON.stringify(renamedMessages), true);
        setChatMessages(renamedMessages);
        const chatReadRecord = await safeGet(chatReadKey(oldUsername), false);
        if (chatReadRecord) {
          let renamedRead = JSON.parse(chatReadRecord.value);
          if (renamedRead && typeof renamedRead === 'object') {
            const oldDmKey = `dm:${oldUsername}`;
            const newDmKey = `dm:${trimmed}`;
            if (renamedRead[oldDmKey] != null && renamedRead[newDmKey] == null) {
              renamedRead = { ...renamedRead, [newDmKey]: renamedRead[oldDmKey] };
              delete renamedRead[oldDmKey];
            }
            await window.storage.set(chatReadKey(trimmed), JSON.stringify(renamedRead), false);
          }
          await window.storage.delete(chatReadKey(oldUsername), false);
        }
        if (activeChat === `dm:${oldUsername}`) setActiveChat(`dm:${trimmed}`);
      } catch { /* chat rename can retry later */ }

      try {
        await commitPlazaPlus((data) => {
          const renameKey = (obj = {}) => Object.fromEntries(Object.entries(obj).map(([key, value]) => [key === oldUsername ? trimmed : key, value]));
          const renameLists = (obj = {}) => Object.fromEntries(Object.entries(obj).map(([key, value]) => [key === oldUsername ? trimmed : key, Array.isArray(value) ? value.map((name) => name === oldUsername ? trimmed : name) : value]));
          const chatReactions = Object.fromEntries(Object.entries(data.chatReactions || {}).map(([messageId, reactions]) => [messageId, Object.fromEntries(Object.entries(reactions || {}).map(([emoji, names]) => [emoji, (names || []).map((name) => name === oldUsername ? trimmed : name)]))]));
          const typing = Object.fromEntries(Object.entries(data.typing || {}).map(([thread, typingMap]) => [thread === `dm:${oldUsername}` ? `dm:${trimmed}` : thread, Object.fromEntries(Object.entries(typingMap || {}).map(([name, at]) => [name === oldUsername ? trimmed : name, at]))]));
          return {
            ...data,
            follows: renameLists(data.follows), bookmarks: renameKey(data.bookmarks), collections: renameKey(data.collections), profiles: renameKey(data.profiles), presence: renameKey(data.presence), notificationReads: renameKey(data.notificationReads), roles: renameKey(data.roles), xp: renameKey(data.xp), drafts: renameKey(data.drafts), pageThemes: renameKey(data.pageThemes), accessibility: renameKey(data.accessibility), commandHistory: renameKey(data.commandHistory),
            activities: (data.activities || []).map((item) => ({ ...item, actor: item.actor === oldUsername ? trimmed : item.actor, targetUser: item.targetUser === oldUsername ? trimmed : item.targetUser })),
            events: (data.events || []).map((event) => ({ ...event, creator: event.creator === oldUsername ? trimmed : event.creator, rsvps: Object.fromEntries(Object.entries(event.rsvps || {}).map(([key, names]) => [key, (names || []).map((name) => name === oldUsername ? trimmed : name)])) })),
            groups: (data.groups || []).map((group) => ({ ...group, owner: group.owner === oldUsername ? trimmed : group.owner, members: (group.members || []).map((name) => name === oldUsername ? trimmed : name) })),
            projects: (data.projects || []).map((project) => ({ ...project, owner: project.owner === oldUsername ? trimmed : project.owner, followers: (project.followers || []).map((name) => name === oldUsername ? trimmed : name) })),
            wiki: (data.wiki || []).map((page) => ({ ...page, author: page.author === oldUsername ? trimmed : page.author })),
            builds: (data.builds || []).map((build) => ({ ...build, owner: build.owner === oldUsername ? trimmed : build.owner, author: build.author === oldUsername ? trimmed : build.author })),
            reports: (data.reports || []).map((report) => ({ ...report, reporter: report.reporter === oldUsername ? trimmed : report.reporter })),
            audit: (data.audit || []).map((entry) => ({ ...entry, actor: entry.actor === oldUsername ? trimmed : entry.actor })),
            invites: (data.invites || []).map((invite) => ({ ...invite, creator: invite.creator === oldUsername ? trimmed : invite.creator })),
            scheduled: (data.scheduled || []).map((item) => ({ ...item, username: item.username === oldUsername ? trimmed : item.username })),
            chatReactions,
            typing,
            changelog: (data.changelog || []).map((entry) => ({ ...entry, author: entry.author === oldUsername ? trimmed : entry.author })),
            themePresets: (data.themePresets || []).map((preset) => ({ ...preset, owner: preset.owner === oldUsername ? trimmed : preset.owner })),
          };
        });
      } catch { /* Plaza+ rename can retry later */ }

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

  async function handleNewsImagePick(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please choose an image file.'); return; }
    setNewsImageBusy(true);
    try {
      const image = await resizeImage(file);
      setNewsDraft((draft) => ({ ...draft, image }));
    } catch (e) {
      console.error(e);
      setError('Could not load that news image.');
    } finally { setNewsImageBusy(false); }
  }

  async function handleNewsVideoPick(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('video/')) { setError('Please choose a video file.'); return; }
    if (file.size > 20 * 1024 * 1024) { setError('Video files must be 20 MB or smaller. For larger videos, paste a YouTube, Vimeo, MP4 or WebM link instead.'); return; }
    setNewsVideoBusy(true);
    try {
      const video = await readMediaFile(file);
      setNewsDraft((draft) => ({ ...draft, video }));
    } catch (e) {
      console.error(e);
      setError('Could not load that news video.');
    } finally { setNewsVideoBusy(false); }
  }

  async function publishNewsArticle() {
    if (!canEditSite || newsBusy) return;
    const title = newsDraft.title.trim().slice(0, 120);
    const summary = newsDraft.summary.trim().slice(0, 260);
    const body = newsDraft.body.trim().slice(0, 8000);
    if (!title || !body) return;
    setNewsBusy(true);
    const image = newsDraft.image?.startsWith('data:image/') ? newsDraft.image : safeExternalUrl(newsDraft.image || '');
    const video = newsDraft.video?.startsWith('data:video/') ? newsDraft.video : safeExternalUrl(newsDraft.video || '');
    const article = {
      id: `news-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title, summary, body,
      category: NEWS_CATEGORIES.includes(newsDraft.category) ? newsDraft.category : 'Plaza',
      source: NEWS_SOURCES.includes(newsDraft.source) ? newsDraft.source : 'RUMS 4',
      image,
      video,
      breaking: !!newsDraft.breaking,
      pinned: !!newsDraft.pinned,
      author: currentUser.username,
      timestamp: Date.now(),
      reactions: {},
      comments: [],
    };
    const next = [article, ...plazaNews].slice(0, 300);
    await savePlazaNews(next);
    void commitPlazaPlus((data) => ({ ...data, activities: [{ id:`act-${Date.now()}-news`, type:'news', actor:currentUser.username, targetUser:null, text:`Plaza News: ${article.title}`, timestamp:Date.now() }, ...(data.activities || [])].slice(0,800) }));
    setNewsDraft({ title: '', summary: '', body: '', category: 'Plaza', source: 'RUMS 4', image: '', video: '', breaking: false, pinned: false });
    setNewsSelectedId(article.id);
    setNewsBusy(false);
  }

  async function deleteNewsArticle(id) {
    if (!canEditSite) return;
    await savePlazaNews(plazaNews.filter((article) => article.id !== id));
    if (newsSelectedId === id) setNewsSelectedId(null);
  }

  async function toggleNewsReaction(id, emoji) {
    if (!currentUser) return;
    const next = plazaNews.map((article) => {
      if (article.id !== id) return article;
      const reactions = { ...(article.reactions || {}) };
      const usersForEmoji = [...(reactions[emoji] || [])];
      const has = usersForEmoji.includes(currentUser.username);
      reactions[emoji] = has ? usersForEmoji.filter((name) => name !== currentUser.username) : [...usersForEmoji, currentUser.username];
      return { ...article, reactions };
    });
    await savePlazaNews(next);
  }

  async function submitNewsComment(articleId) {
    if (!currentUser) return;
    const text = (newsCommentDrafts[articleId] || '').trim().slice(0, 1200);
    if (!text) return;
    const next = plazaNews.map((article) => article.id === articleId ? {
      ...article,
      comments: [...(article.comments || []), { id:`comment-${Date.now()}-${Math.random().toString(36).slice(2,7)}`, username:currentUser.username, text, timestamp:Date.now() }].slice(-300)
    } : article);
    await savePlazaNews(next);
    setNewsCommentDrafts((drafts) => ({ ...drafts, [articleId]: '' }));
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
      reactions: {},
    };
    await saveSuggestions([newS, ...suggestions]);
    const mentioned = [...new Set((text.match(/@[A-Za-z0-9_]+/g)||[]).map((m)=>m.slice(1)).filter((name)=>users.some((u)=>u.username.toLowerCase()===name.toLowerCase()) && name.toLowerCase()!==currentUser.username.toLowerCase()))];
    if (mentioned.length) void commitPlazaPlus((data)=>({...data,activities:[...mentioned.map((targetUser,i)=>({id:`act-${Date.now()}-suggestion-${i}`,type:'mention',actor:currentUser.username,targetUser,text:`${currentUser.username} mentioned you in a suggestion`,timestamp:Date.now()})),...(data.activities||[])].slice(0,800)}));
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
    const target = suggestions.find((s)=>s.id===id);
    const added = target && !(target.votes || []).includes(currentUser.username);
    if (added && target?.username !== currentUser.username) void commitPlazaPlus((data)=>({...data,activities:[{id:`act-${Date.now()}-vote`,type:'vote',actor:currentUser.username,targetUser:target.username,text:`${currentUser.username} upvoted your suggestion`,timestamp:Date.now()},...(data.activities||[])].slice(0,800)}));
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
    void commitPlazaPlus((data)=>({...data,activities:[{id:`act-${Date.now()}-update`,type:'update',actor:currentUser.username,targetUser:null,text:`Server update: ${newU.title}`,timestamp:Date.now()},...(data.activities||[])].slice(0,800),changelog:[{id:`change-${Date.now()}`,title:newU.title,body:newU.body||'Server update',timestamp:Date.now(),author:currentUser.username},...(data.changelog||[])].slice(0,150)}));
    setUpdateDraft({ title: '', body: '' });
    setUpdateBusy(false);
  }

  async function publishAnnouncement() {
    if (!currentUser?.isAdmin || announcementBusy) return;
    const text = announcementDraft.trim().slice(0, 500);
    if (!text) return;
    setAnnouncementBusy(true);
    try {
      const announcement = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, text, author: currentUser.username, timestamp: Date.now() };
      await window.storage.set(SITE_ANNOUNCEMENT_KEY, JSON.stringify(announcement), true);
      setSiteAnnouncement(announcement);
      setAnnouncementDraft('');
    } catch (error) { console.error(error); setError('Could not publish the announcement. Try again.'); }
    finally { setAnnouncementBusy(false); }
  }

  async function clearAnnouncement() {
    if (!currentUser?.isAdmin || announcementBusy) return;
    setAnnouncementBusy(true);
    try {
      await window.storage.delete(SITE_ANNOUNCEMENT_KEY, true);
      setSiteAnnouncement(null);
    } catch (error) { console.error(error); setError('Could not clear the announcement. Try again.'); }
    finally { setAnnouncementBusy(false); }
  }

  function dismissAnnouncement() {
    if (!siteAnnouncement) return;
    const username = currentUser?.username || 'guest';
    setDismissedAnnouncement({ username, id: siteAnnouncement.id });
    try { localStorage.setItem(`rums-announcement-dismissed-${username}`, siteAnnouncement.id); } catch { /* session dismissal still works */ }
  }

  async function deleteUpdate(id) {
    if (!currentUser?.isAdmin) return;
    await saveUpdates(updates.filter((u) => u.id !== id));
  }

  function avatarNode(username, size = 32, fontSize) {
    const url = users.find((u) => u.username === username)?.avatar;
    const style = { width: size, height: size };
    const online = presenceLabel(username) === 'Online';
    return (
      <span className="avatar-presence" style={style} title={online ? 'Online' : undefined}>
        {url ? <img className="avatar avatar-img" src={url} alt={username} style={style} /> :
          <span className="avatar" style={{ ...style, fontSize: fontSize ?? Math.round(size * 0.42) }}>{username.slice(0, 2).toUpperCase()}</span>}
        {online && <span className="avatar-online-dot" aria-label="Online" />}
      </span>
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
  const currentRole = plazaPlus.roles?.[currentUser?.username] || (currentUser?.isAdmin ? 'Admin' : isOwner ? 'Owner' : 'Member');
  const canModerate = Boolean(currentUser?.isAdmin || isOwner || ['Moderator','Admin','Owner'].includes(currentRole));
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
          <article data-position-id={widget.id} data-widget-placement={widget.placement} data-session-new-key={sessionNewKey(pageKeyForPlacement(widget.placement), 'widget', widget.id)} className={`custom-site-widget ${widget.id === PLAZA_OVERHAUL_WIDGET_ID ? 'plaza-overhaul-announcement' : ''} ${widget.image ? 'has-widget-image' : 'no-widget-image'} widget-animation-${widget.animation || 'none'} ${editMode && isOwner ? 'is-editing' : ''} ${selectedBoxId === `widget:${widget.id}` ? 'is-editor-selected' : ''}`} key={widget.id} style={{ '--widget-color': widget.color || '#ffffff' }} onPointerDownCapture={(event) => { if (editMode && isOwner && !(event.target instanceof Element && event.target.closest('.widget-edit-controls'))) setSelectedBoxId(`widget:${widget.id}`); }}>
            {newContentLabel(pageKeyForPlacement(widget.placement), 'widget', widget.id)}
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
  const unseenLumina = hasLumina && currentUser
    ? posts.filter((p) => p.tag === 'Lumina' && p.timestamp > (lastSeen.Lumina || 0) && p.username !== currentUser.username).length
    : 0;
  const hasNewPosts = unseenGeneral > 0 || unseenLumina > 0;
  const visiblePosts = posts
    .slice()
    .sort((a, b) => b.timestamp - a.timestamp)
    .filter((p) => !hasLumina || feedFilter !== 'lumina' ? p.tag !== 'Lumina' : p.tag === 'Lumina')
    .filter((p) => !followingOnly || p.username === currentUser?.username || followedUsers().includes(p.username));

  const visibleSuggestions = suggestions
    .slice()
    .sort((a, b) => (b.votes?.length || 0) - (a.votes?.length || 0) || b.timestamp - a.timestamp);

  const visibleUpdates = updates.slice().sort((a, b) => b.timestamp - a.timestamp);
  const visibleNews = plazaNews.slice().filter((article) => newsFilter === 'All' || article.category === newsFilter).sort((a, b) => b.timestamp - a.timestamp);
  const BREAKING_HERO_MS = 13 * 60 * 60 * 1000;
  const newestNewsArticle = visibleNews[0] || null;
  const activeBreakingNews = visibleNews.find((article) => article.breaking && (Date.now() - Number(article.timestamp || 0)) <= BREAKING_HERO_MS) || null;
  const heroNewsArticle = activeBreakingNews || newestNewsArticle;
  const newsAfterHero = heroNewsArticle ? visibleNews.filter((article) => article.id !== heroNewsArticle.id) : [];
  const selectedNewsArticle = plazaNews.find((article) => article.id === newsSelectedId) || null;
  const luminaPosts = !hasLumina ? [] : posts.filter((p) => p.tag === 'Lumina').sort((a, b) => b.timestamp - a.timestamp);
  const feedBoxHandle = (id) => editMode && isOwner && selectedBoxId === `feed:${id}` ? <button type="button" className="built-in-box-handle" onPointerDown={(event) => { setSelectedBoxId(`feed:${id}`); startFeedBoxReorder(id, event); }}><GripVertical size={15} /> Move box</button> : null;
  function renderFeedBox(id) {
    if (id === 'hero') return <section data-feed-box="hero" data-edit-box-id="feed:hero" className={`editable-built-in-box ${selectedBoxId === 'feed:hero' ? 'is-editor-selected' : ''}`} key="hero" onPointerDownCapture={() => { if (editMode && isOwner) setSelectedBoxId('feed:hero'); }}>{feedBoxHandle('hero')}<div className="community-hero"><div className="hero-copy"><span className="eyebrow">{siteConfig.brandName} COMMUNITY</span><h1 {...(feedFilter === 'all' ? editableTextProps('feed.heading') : {})}>{feedFilter === 'lumina' ? 'Lumina' : siteText('feed.heading', siteConfig.heroTitle)}{feedFilter === 'all' && textDragHandle('feed.heading')}</h1><p {...(feedFilter === 'all' ? editableTextProps('feed.description') : {})}>{feedFilter === 'lumina' ? 'A closer look at the city being built on RUMS.' : siteText('feed.description', siteConfig.heroText)}{feedFilter === 'all' && textDragHandle('feed.description')}</p></div><button className="hero-create" onClick={() => openPostComposer()} aria-label="Create post"><Plus size={20} /></button></div></section>;
    return <section data-feed-box="posts" data-edit-box-id="feed:posts" className={`editable-built-in-box ${selectedBoxId === 'feed:posts' ? 'is-editor-selected' : ''} ${feedFilter === 'lumina' ? 'lumina-feed-posts' : ''}`} key="posts" onPointerDownCapture={() => { if (editMode && isOwner) setSelectedBoxId('feed:posts'); }}>{feedBoxHandle('posts')}<div className="section-heading"><h2>{followingOnly ? 'Following feed' : 'Recent posts'}</h2><div className="feed-heading-actions">{feedFilter === 'lumina' && <button data-tutorial-action="about-lumina" className="pill pill-btn lumina-about-pill" onClick={openLumina}><Droplet size={12}/> About Lumina</button>}<button className={`pill pill-btn ${followingOnly?'active':''}`} onClick={()=>setFollowingOnly((v)=>!v)}>{followingOnly?'Show everyone':'Following'}</button><span>{visiblePosts.length} {visiblePosts.length === 1 ? 'post' : 'posts'}</span></div></div>{visiblePosts.length === 0 ? <div className="feed-empty"><div className="r-badge">R</div><h3>{feedFilter === 'lumina' ? 'No Lumina posts yet' : 'No posts yet'}</h3><p>{feedFilter === 'lumina' ? 'Be the first to share a view of Lumina.' : 'Be the first to share something from RUMS.'}</p></div> : visiblePosts.map((post) => renderPost(post, { reactionContext: feedFilter === 'lumina' ? 'luminaFeed' : 'default', newPageKey: 'feed' }))}</section>;
  }

  function renderFeedTabs() {
    if (!hasLumina) return null;
    return (
      <div ref={tabsRef} data-tutorial="feed-tabs" className={`feed-tabs ${tabsDragging ? 'is-dragging' : ''}`}
        style={{ '--seg-translate': feedFilter === 'lumina' ? '100%' : '0%' }}
        onPointerDown={handleTabsPointerDown} onPointerMove={handleTabsPointerMove}
        onPointerUp={handleTabsPointerEnd} onPointerCancel={handleTabsPointerEnd}
        onClickCapture={(e) => { if (tabsDragRef.current?.moved) { e.preventDefault(); e.stopPropagation(); } }}>
        <button className={`tab-btn ${feedFilter === 'all' ? 'active' : ''}`} onClick={() => setFeedFilter('all')}>
          All RUMS
          {unseenGeneral > 0 && <span className="tab-badge">{unseenGeneral}</span>}
        </button>
        <button data-tutorial-action="lumina-tab" className={`tab-btn ${feedFilter === 'lumina' ? 'active' : ''}`} onClick={() => setFeedFilter('lumina')}>
          <Droplet size={12} /> Lumina
          {unseenLumina > 0 && <span className="tab-badge">{unseenLumina}</span>}
        </button>
        <span className="drag-refraction feed-drag-refraction" aria-hidden="true"><span className="drag-refraction-content"><span className={feedFilter === 'all' ? 'active' : ''}>All RUMS</span><span className={feedFilter === 'lumina' ? 'active' : ''}><Droplet size={12} /> Lumina</span></span></span>
      </div>
    );
  }

  function renderRumsVersionSwitcher() {
    const visualVersion = spaceSwitchBusy || (isProjectSpace ? 'projects' : rumsSpace);
    const options = [['rums4', 'RUMS', '4'], ['rums5', 'CREATIVE', ''], ['projects', 'PROJECTS', '']];
    return (
      <div
        ref={rumsVersionSwitchRef}
        data-tutorial="version-switch"
        className={`universal-rums-switcher ${rumsVersionDragging ? 'is-dragging' : ''}`}
        role="group"
        aria-label="Switch between RUMS 4, Creative and Projects"
        onPointerDown={handleRumsVersionPointerDown}
        onPointerMove={handleRumsVersionPointerMove}
        onPointerUp={handleRumsVersionPointerEnd}
        onPointerCancel={handleRumsVersionPointerEnd}
        onClickCapture={(e) => {
          if (rumsVersionSuppressClickRef.current) { rumsVersionSuppressClickRef.current = false; e.preventDefault(); e.stopPropagation(); }
        }}
      >
        {options.map(([id, label, number]) => (
          <button key={id} type="button" data-space={id} className={visualVersion === id ? 'active' : ''} aria-pressed={id === 'projects' ? isProjectSpace : rumsSpace === id}
            onClick={() => { if (!spaceSwitchBusy && (id === 'projects' || rumsSpace !== id)) void switchRumsSpace(id); }} disabled={Boolean(spaceSwitchBusy)} title={`Open ${id === 'rums4' ? 'RUMS 4' : id === 'rums5' ? 'Creative' : 'Projects'}`}>
            <span>{label}</span>{number && <strong>{spaceSwitchBusy === id ? <Loader2 size={12} className="spin" /> : number}</strong>}{id === 'projects' && spaceSwitchBusy === id && <Loader2 size={12} className="spin" />}
          </button>
        ))}
        <span className="drag-refraction version-drag-refraction" aria-hidden="true"><span className="drag-refraction-content">
          {options.map(([id,label,number]) => <span key={id} className={visualVersion === id ? 'active' : ''}><span>{label}</span>{number&&<strong>{number}</strong>}</span>)}
        </span></span>
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
  const matchedPosts = (q || searchFilters.author || searchFilters.tag !== 'all' || searchFilters.from || searchFilters.to)
    ? posts
        .filter((p) => !q || p.username.toLowerCase().includes(q) || (p.caption || '').toLowerCase().includes(q) || hashtagsIn(p.caption || '').some((tag)=>tag.includes(q)))
        .filter((p) => !searchFilters.author || p.username.toLowerCase().includes(searchFilters.author.toLowerCase()))
        .filter((p) => searchFilters.tag === 'all' || p.tag === searchFilters.tag)
        .filter((p) => !searchFilters.from || p.timestamp >= new Date(searchFilters.from).getTime())
        .filter((p) => !searchFilters.to || p.timestamp <= new Date(searchFilters.to).getTime() + 86400000)
        .sort((a, b) => b.timestamp - a.timestamp)
    : [];

  // Renders a single post card. Shared by the feed list and the single-post
  // detail view (reached by clicking a post from search results).
  function renderPost(post, { reactionContext = 'default', newPageKey = null } = {}) {
    const liked = post.likes.includes(currentUser.username);
    const showComments = !!openComments[post.id];
    const postComments = post.comments || [];
    const startReply = (comment) => {
      setOpenComments((open) => ({ ...open, [post.id]: true }));
      setCommentReplyTo((replies) => ({ ...replies, [post.id]: comment.id }));
      commentInputRefs.current[post.id]?.focus();
    };
    const renderComment = (c, reply = false) => {
      const cLiked = (c.likes || []).includes(currentUser.username);
      const commentSpotify = spotifyEmbedFromText(c.text || '');
      const commentVisibleText = stripSpotifyLinks(c.text || '');
      const spotifyOnlyComment = !!commentSpotify && !commentVisibleText;
      return <div className={`comment-row ${reply ? 'comment-reply' : ''} ${commentSpotify ? 'has-spotify-comment' : ''}`} key={c.id}>
        <div className="comment-avatar clickable-row" onClick={() => openProfile(c.username)}>{avatarNode(c.username, reply ? 25 : 30, 10)}</div>
        <div className="comment-content">
          <div className={`comment-bubble ${spotifyOnlyComment ? 'spotify-only-comment' : ''}`}>
            <b className="clickable-text" onClick={() => openProfile(c.username)}>{c.username}</b>
            {commentVisibleText && <div className="comment-text">{renderCommentText(commentVisibleText)}</div>}
            {commentSpotify && <SpotifyMessageEmbed text={c.text} />}
          </div>
          <div className="comment-actions"><span>{timeAgo(c.timestamp)}</span><button className={cLiked ? 'liked' : ''} onClick={() => toggleCommentLike(post.id, c.id)} aria-label={`Like ${c.username}'s comment`}><Heart size={13} fill={cLiked ? 'currentColor' : 'none'} /> {(c.likes || []).length || 'Like'}</button><button onClick={() => startReply(reply ? postComments.find((parent) => parent.id === c.parentId) || c : c)}>Reply</button>{canManageComment(c) && <button className="comment-del-btn" onClick={() => deleteComment(post.id, c.id)} aria-label="Delete comment"><Trash2 size={13} /></button>}</div>
        </div>
      </div>;
    };
    return (
      <div className="post-card" data-tutorial="post-card" data-edit-box-id={`post:${post.id}`} data-session-new-key={newPageKey ? sessionNewKey(newPageKey, 'post', post.id) : undefined} key={post.id}>
        <div className="post-top">
          {newPageKey && newContentLabel(newPageKey, 'post', post.id)}
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
        <div className={`post-img-wrap ${post.images?.length > 1 ? 'post-multi-media' : ''}`}>
          {(post.images?.length ? post.images : [post.image]).map((src, index) => <img key={`${post.id}-img-${index}`} src={src} alt={post.altText || post.caption || `RUMS screenshot ${index + 1}`} loading="lazy" />)}
          <div className="post-sheen" />
        </div>
        <div className="post-actions">
          <button className={`like-btn ${liked ? 'liked' : ''}`} onClick={() => toggleLike(post.id)} aria-label={liked ? 'Unlike post' : 'Like post'}>
            <span className="post-action-icon post-action-like-icon"><Heart size={18} fill={liked ? 'currentColor' : 'none'} /></span>
            {post.likes.length > 0 ? post.likes.length : 'Like'}
          </button>
          <button
            className="comment-btn"
            onClick={() => setOpenComments((o) => ({ ...o, [post.id]: !o[post.id] }))}
          >
            <span className="post-action-icon"><MessageCircle size={17} /></span>
            {postComments.length > 0 ? postComments.length : 'Comments'}
          </button>
          <button className={`comment-btn post-react-btn ${reactionMenus[`post:${post.id}`] ? 'active' : ''}`} onClick={() => toggleReactionMenu(`post:${post.id}`)} aria-label="React to post" title="React to post"><span className="post-action-icon"><SmilePlus size={18} /></span></button>
          <button className={`comment-btn share-btn ${shareStatus[post.id] ? 'share-done' : ''}`} onClick={() => sharePost(post)}>
            <span className="post-action-icon post-action-share-icon">{shareStatus[post.id] ? <Check size={16} /> : <Share2 size={16} />}</span>
            {shareStatus[post.id] === 'copied' ? 'Copied' : shareStatus[post.id] === 'shared' ? 'Shared' : ''}
          </button>
          <button className={`comment-btn bookmark-btn ${bookmarkedPosts().includes(post.id) ? 'active' : ''}`} onClick={() => toggleBookmark(post.id)} title={bookmarkedPosts().includes(post.id) ? 'Remove from favorites' : 'Add to favorites'} aria-label={bookmarkedPosts().includes(post.id) ? 'Remove from favorites' : 'Add to favorites'} aria-pressed={bookmarkedPosts().includes(post.id)}><span className="post-action-icon"><Star size={18} fill={bookmarkedPosts().includes(post.id) ? 'currentColor' : 'none'} /></span></button>
          {post.username === currentUser.username && <button className={`comment-btn pin-btn ${plusProfile().pinnedPostIds?.includes(post.id) ? 'active' : ''}`} onClick={() => togglePinnedPost(post.id)} title="Pin to profile">📌</button>}
        </div>
        {renderReactionBar(post, 'post', reactionContext)}
        {post.caption && (
          <div className="post-caption">
            <b className="clickable-text" onClick={() => openProfile(post.username)}>{post.username}</b>
            {post.caption}
            {(post.editHistory || []).length > 0 && <small className="post-edited-label" title={`${post.editHistory.length} edit${post.editHistory.length===1?'':'s'}`}> · edited</small>}
          </div>
        )}
        {(post.username === currentUser.username || currentUser.isAdmin) && <div className="post-owner-tools"><button onClick={() => editPostCaption(post.id)}>Edit post</button>{(post.editHistory || []).length > 0 && <details><summary>History</summary>{post.editHistory.slice().reverse().map((entry,index)=><div key={`${entry.editedAt}-${index}`}><small>{new Date(entry.editedAt).toLocaleString()} · {entry.editor}</small><p>{entry.caption || 'No caption'}</p></div>)}</details>}</div>}
        {post.link && <a className="post-rich-link" href={post.link} target="_blank" rel="noreferrer">🔗 {post.link.replace(/^https?:\/\//,'').slice(0,90)}</a>}
        {post.videoUrl && <div className="post-video-link"><a href={post.videoUrl} target="_blank" rel="noreferrer">▶ Open attached clip</a></div>}
        {post.poll && <div className="post-poll"><strong>{post.poll.question}</strong>{post.poll.options.map((option)=>{const total=post.poll.options.reduce((sum,o)=>sum+(o.votes?.length||0),0);const mine=(option.votes||[]).includes(currentUser.username);const pct=total?Math.round((option.votes.length/total)*100):0;return <button key={option.id} className={mine?'active':''} onClick={()=>votePostPoll(post.id,option.id)}><span>{option.text}</span><b>{pct}% · {option.votes?.length||0}</b></button>;})}</div>}
        {hashtagsIn(post.caption || '').length > 0 && <div className="post-hashtags">{hashtagsIn(post.caption).map((hash)=><button key={hash} onClick={()=>{setSearchQuery(hash);setScreen('search');}}>{hash}</button>)}</div>}
        {showComments && (
          <div className="comments-box">
            <div className="comments-heading"><strong>Conversation</strong><span>{postComments.length} {postComments.length === 1 ? 'comment' : 'comments'}</span></div>
            {postComments.length === 0 && <p className="comments-empty">Start the conversation.</p>}
            {postComments.filter((c) => !c.parentId || !postComments.some((parent) => parent.id === c.parentId)).map((c) => <div className="comment-thread" key={c.id}>{renderComment(c)}{postComments.filter((reply) => reply.parentId === c.id).map((reply) => renderComment(reply, true))}</div>)}
            <div className="comment-input-wrap">
              {commentReplyTo[post.id] && <div className="comment-reply-context">Replying to <b>{postComments.find((c) => c.id === commentReplyTo[post.id])?.username}</b><button onClick={() => setCommentReplyTo((replies) => ({ ...replies, [post.id]: null }))} aria-label="Cancel reply"><X size={14} /></button></div>}
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
                {avatarNode(currentUser.username, 30, 10)}
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

  const tutorialSteps = buildTutorialSteps();
  const tutorialCurrent = tutorialSteps[Math.min(tutorialStep, Math.max(0, tutorialSteps.length - 1))] || null;
  const tutorialProgress = tutorialSteps.length ? Math.round(((Math.min(tutorialStep, tutorialSteps.length - 1) + 1) / tutorialSteps.length) * 100) : 0;
  const tutorialCardPosition = (() => {
    if (!tutorialRect || !tutorialCurrent?.target) return { className: 'tutorial-card-center', style: {} };
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const gap = 18;
    const cardW = Math.min(440, vw - 24);
    const estimatedH = vw <= 700 ? 215 : 230;
    if (vw <= 700) {
      const roomBelow = vh - (tutorialRect.top + tutorialRect.height);
      if (roomBelow >= estimatedH + gap) return { className: 'tutorial-card-free', style: { top: Math.min(vh - estimatedH - 10, tutorialRect.top + tutorialRect.height + gap), left: 10, width: vw - 20 } };
      return { className: 'tutorial-card-free', style: { top: Math.max(10, tutorialRect.top - estimatedH - gap), left: 10, width: vw - 20 } };
    }
    const rightRoom = vw - (tutorialRect.left + tutorialRect.width);
    const leftRoom = tutorialRect.left;
    if (rightRoom >= cardW + gap) return { className: 'tutorial-card-free', style: { top: Math.max(16, Math.min(vh - estimatedH - 16, tutorialRect.top)), left: tutorialRect.left + tutorialRect.width + gap, width: cardW } };
    if (leftRoom >= cardW + gap) return { className: 'tutorial-card-free', style: { top: Math.max(16, Math.min(vh - estimatedH - 16, tutorialRect.top)), left: tutorialRect.left - cardW - gap, width: cardW } };
    const roomBelow = vh - (tutorialRect.top + tutorialRect.height);
    if (roomBelow >= estimatedH + gap) return { className: 'tutorial-card-free', style: { top: tutorialRect.top + tutorialRect.height + gap, left: Math.max(16, Math.min(vw - cardW - 16, tutorialRect.left + tutorialRect.width / 2 - cardW / 2)), width: cardW } };
    return { className: 'tutorial-card-free', style: { top: Math.max(16, tutorialRect.top - estimatedH - gap), left: Math.max(16, Math.min(vw - cardW - 16, tutorialRect.left + tutorialRect.width / 2 - cardW / 2)), width: cardW } };
  })();

  return (
    <div data-theme={plazaPlus.pageThemes?.[currentUser?.username]?.[screen] || theme} className={`aero-root ${screen === 'chat' ? 'screen-chat' : ''} ${screen === 'news' ? 'screen-news' : ''} ${customThemeEnabled ? 'custom-theme-enabled' : ''} ${siteConfig.animations ? '' : 'site-motion-off'} ${editMode ? 'visual-edit-mode' : ''} ${rumsSpace ? (isProjectSpace ? 'space-project' : `space-${rumsSpace}`) : 'space-chooser-active'}`} ref={rootRef} style={{ '--glass-alpha': glassStrength / 100, '--site-accent': customThemeEnabled ? themeBuilder.accent : siteConfig.accent, '--custom-radius': `${themeBuilder.radius}px`, '--custom-blur': `${themeBuilder.blur}px` }}>
      {updateUntil > Date.now() && <div className="site-update-screen" role="status" aria-live="polite">
        <div className="site-update-card">
          <div className="site-update-mark" aria-hidden="true">R</div>
          <span className="site-update-kicker">RUMS PLAZA</span>
          <h1>Updating the website</h1>
          <p>Loading the latest version. You’ll be back in a moment.</p>
          <div
            className={`site-update-now-playing ${updateMusicState === 'playing' ? 'is-playing' : ''} ${updateMusicState === 'blocked' || updateMusicState === 'paused' ? 'needs-tap' : ''}`}
            aria-label={`Now playing ${updateTrack.title} by ${updateTrack.artist}`}
          >
            <div className="site-update-now-icon" aria-hidden="true">
              <span/><span/><span/><span/>
            </div>
            <div className="site-update-now-copy">
              <small>NOW PLAYING</small>
              <strong>{updateTrack.title}</strong>
              <span>{updateTrack.artist}</span>
            </div>
            {updateMusicState === 'blocked' || updateMusicState === 'paused' ? (
              <button type="button" className="site-update-play-fallback" onClick={startUpdateMusic} aria-label={`Play ${updateTrack.title}`} title="Play update soundtrack">▶</button>
            ) : (
              <div className="site-update-music-badge" aria-hidden="true">♫</div>
            )}
          </div>
          <div className="site-update-loader" aria-hidden="true"><span /></div>
        </div>
      </div>}
      {siteAnnouncement && !(dismissedAnnouncement.username === (currentUser?.username || 'guest') && dismissedAnnouncement.id === siteAnnouncement.id) && (
        <aside className="site-announcement" role="status" aria-live="polite">
          <span className="site-announcement-icon"><Megaphone size={19} /></span>
          <div className="site-announcement-copy"><strong>Announcement from {siteAnnouncement.author || 'RUMS Plaza'}</strong><p>{siteAnnouncement.text}</p></div>
          <button type="button" className="site-announcement-close" onClick={dismissAnnouncement} aria-label="Dismiss announcement"><X size={18} /></button>
        </aside>
      )}
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
            <div className="entrance-account" aria-label="Account">
              {!entrySessionReady ? <span className="entrance-account-loading">Checking account…</span> : currentUser ? <><span className="entrance-account-user">{avatarNode(currentUser.username, 26, 10)}<span>{currentUser.username}</span></span><button type="button" className="entrance-account-button" onClick={() => void logoutFromEntrance()}>Log out</button></> : <button type="button" className="entrance-account-button primary" onClick={openEntryLogin}>Log in</button>}
            </div>
            <div className="space-chooser-mark">R</div>
            <span className="space-chooser-kicker">RUMS PLAZA</span>
            <h1 id="rums-space-title">Welcome to RUMS Plaza</h1>
            <p className="space-chooser-intro">Choose where you want to enter. Projects opens a directory of community-made spaces inside RUMS 4, Creative and outside RUMS.</p>
            <div className="space-choice-grid">
              <button type="button" className="space-choice-card rums4-choice" onClick={() => chooseRumsSpace('rums4')}>
                <span className="space-choice-number">04</span>
                <span className="space-choice-copy"><strong>RUMS 4</strong></span>
              </button>
              <button type="button" className="space-choice-card rums5-choice" onClick={() => chooseRumsSpace('rums5')}>
                <span className="space-choice-number">✦</span>
                <span className="space-choice-copy"><strong>Creative</strong></span>
              </button>
              <button type="button" className="space-choice-card projects-choice" onClick={() => void openProjectsDirectory()}>
                <span className="space-choice-number">PR</span>
                <span className="space-choice-copy"><strong>Projects</strong></span>
              </button>
            </div>
          </section>
        )}

        {screen === 'projectsDirectory' && (
          <section className="projects-directory-page">
            <div className="projects-directory-topbar">
              <button type="button" className="projects-back-btn" onClick={openRumsChooser}>← Back</button>
              <div className="projects-directory-heading">
                <span className="space-chooser-kicker">RUMS PLAZA</span>
                <h1>Projects</h1>
                <p>Choose a project to enter, or create your own.</p>
              </div>
              <button type="button" className="projects-create-btn" onClick={()=>{ if (currentUser) setProjectCreateOpen(true); else window.alert('Log in to RUMS Plaza first, then return to Projects to add a project.'); }}>+ Add Project</button>
            </div>
            {!currentUser && <div className="project-directory-login-note">Browse any project now. Log in to create your own.</div>}

            <div className="project-directory-groups simple">
              <section className="project-directory-section">
                <div className="project-directory-section-head"><div><span className="project-space-badge rums4">RUMS 4</span><h2>RUMS 4 Projects</h2></div><span>{(projectDirectoryProjects.length ? projectDirectoryProjects : plazaPlus.projects || []).filter((project)=>project.category !== 'rums5' && project.category !== 'outside').length} projects</span></div>
                <div className="project-directory-grid">
                  {(projectDirectoryProjects.length ? projectDirectoryProjects : plazaPlus.projects || []).filter((project)=>project.category !== 'rums5' && project.category !== 'outside').map((project)=><button type="button" className="project-directory-card simple-card" key={project.id} onClick={()=>void chooseProject(project)}><div className="project-card-top"><span className="project-space-badge rums4">RUMS 4</span><span className="space-choice-arrow">→</span></div><strong>{project.name}</strong><p>{project.description || 'Community project'}</p><small>by {project.owner} · {project.followers?.length || 0} followers</small></button>)}
                  {!(projectDirectoryProjects.length ? projectDirectoryProjects : plazaPlus.projects || []).some((project)=>project.category !== 'rums5' && project.category !== 'outside') && <div className="project-directory-empty">No RUMS 4 projects yet.</div>}
                </div>
              </section>

              <section className="project-directory-section">
                <div className="project-directory-section-head"><div><span className="project-space-badge rums5">Creative</span><h2>Creative Projects</h2></div><span>{(projectDirectoryProjects.length ? projectDirectoryProjects : plazaPlus.projects || []).filter((project)=>project.category === 'rums5').length} projects</span></div>
                <div className="project-directory-grid">
                  {(projectDirectoryProjects.length ? projectDirectoryProjects : plazaPlus.projects || []).filter((project)=>project.category === 'rums5').map((project)=><button type="button" className="project-directory-card simple-card" key={project.id} onClick={()=>void chooseProject(project)}><div className="project-card-top"><span className="project-space-badge rums5">Creative</span><span className="space-choice-arrow">→</span></div><strong>{project.name}</strong><p>{project.description || 'Community project'}</p><small>by {project.owner} · {project.followers?.length || 0} followers</small></button>)}
                  {!(projectDirectoryProjects.length ? projectDirectoryProjects : plazaPlus.projects || []).some((project)=>project.category === 'rums5') && <div className="project-directory-empty">No Creative projects yet.</div>}
                </div>
              </section>

              <section className="project-directory-section">
                <div className="project-directory-section-head"><div><span className="project-space-badge outside">OUTSIDE RUMS</span><h2>Outside RUMS</h2></div><span>{(projectDirectoryProjects.length ? projectDirectoryProjects : plazaPlus.projects || []).filter((project)=>project.category === 'outside').length} projects</span></div>
                <div className="project-directory-grid">
                  {(projectDirectoryProjects.length ? projectDirectoryProjects : plazaPlus.projects || []).filter((project)=>project.category === 'outside').map((project)=><button type="button" className="project-directory-card simple-card" key={project.id} onClick={()=>void chooseProject(project)}><div className="project-card-top"><span className="project-space-badge outside">OUTSIDE RUMS</span><span className="space-choice-arrow">→</span></div><strong>{project.name}</strong><p>{project.description || 'Independent project'}</p><small>by {project.owner} · {project.followers?.length || 0} followers</small></button>)}
                  {!(projectDirectoryProjects.length ? projectDirectoryProjects : plazaPlus.projects || []).some((project)=>project.category === 'outside') && <div className="project-directory-empty">No outside projects yet.</div>}
                </div>
              </section>
            </div>

            {projectCreateOpen && currentUser && <div className="project-create-overlay" onMouseDown={(e)=>{if(e.target===e.currentTarget)setProjectCreateOpen(false);}}>
              <section className="project-create-modal">
                <button type="button" className="project-create-close" onClick={()=>setProjectCreateOpen(false)}>×</button>
                <span className="space-chooser-kicker">NEW PROJECT</span><h2>Create Project</h2><p>Pick where it belongs. Your project will open as its own complete RUMS Plaza-style space.</p>
                <div className="project-directory-create-form modal-form">
                  <label>Project group<select className="aero-input" value={projectDraft.category} onChange={(e)=>setProjectDraft({...projectDraft,category:e.target.value})}><option value="rums4">RUMS 4</option><option value="rums5">Creative</option><option value="outside">Outside RUMS</option></select></label>
                  <label>Project name<input className="aero-input" placeholder="My project" value={projectDraft.name} onChange={(e)=>setProjectDraft({...projectDraft,name:e.target.value})}/></label>
                  <label>Description<textarea className="aero-input" rows="4" placeholder="What is this project?" value={projectDraft.description} onChange={(e)=>setProjectDraft({...projectDraft,description:e.target.value})}/></label>
                  <div className="project-create-actions"><button type="button" className="pill pill-btn" onClick={()=>setProjectCreateOpen(false)}>Cancel</button><button className="aero-btn" type="button" onClick={async()=>{if(await createProject())setProjectCreateOpen(false);}}>Create Project</button></div>
                </div>
              </section>
            </div>}
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
            <p className="auth-sub">{entryAuth ? 'Your account works across RUMS 4, Creative, and Projects.' : isProjectSpace ? `${activeProject?.name || 'This project'} is its own RUMS-style community space.` : isRums5 ? 'The new RUMS era — a fresh community feed with the same social features.' : "The server's photo feed — including the full Project Lumina archive and older posts."}</p>
            <button type="button" className="auth-space-switch" onClick={openRumsChooser}>← Choose a Plaza space</button>
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
              {authMode === 'signup' ? 'Already have an account? ' : 'New to RUMS Plaza? '}
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

        {screen !== 'spaceSelect' && screen !== 'projectsDirectory' && screen !== 'loading' && screen !== 'login' && screen !== 'signup' && currentUser && (
          <>
            <aside className="desktop-rail">
              <div className="rail-brand"><span className="rail-orb">{siteConfig.brandName.slice(0,1).toUpperCase()}</span><span>{siteConfig.brandName}<small>{siteConfig.brandTagline}</small></span></div>
              <div className="rail-label">EXPLORE</div>
              <button data-tutorial-nav="feed" className={`rail-link ${screen === 'feed' && (!isProjectSpace || projectTab === 'overview') ? 'selected' : ''}`} onClick={() => { setScreen('feed'); setFeedFilter('all'); setProjectTab('overview'); }}>{navIconWithNew(<Home size={19} />, 'feed')} {isProjectSpace ? 'Project home' : 'Community feed'}</button>
              {isProjectSpace && <><button className={`rail-link ${screen === 'feed' && projectTab === 'forum' ? 'selected' : ''}`} onClick={() => { setProjectTab('forum'); setScreen('feed'); }}><MessageCircle size={19}/> Forum</button><button className={`rail-link ${screen === 'feed' && projectTab === 'updates' ? 'selected' : ''}`} onClick={() => { setProjectTab('updates'); setScreen('feed'); }}><Megaphone size={19}/> Project updates</button><button className={`rail-link ${screen === 'feed' && projectTab === 'board' ? 'selected' : ''}`} onClick={() => { setProjectTab('board'); setScreen('feed'); }}><GripVertical size={19}/> Board</button></>}
              {!isProjectSpace && <>
              {siteConfig.showDiscover && <button data-tutorial-nav="search" className={`rail-link ${screen === 'search' ? 'selected' : ''}`} onClick={() => setScreen('search')}>{navIconWithNew(<Search size={19} />, 'search')} Discover</button>}
              <button data-tutorial-nav="plazaPlus" className={`rail-link ${screen === 'plazaPlus' ? 'selected' : ''}`} onClick={() => { setScreen('plazaPlus'); setPlusTab('notifications'); }}><Sparkles size={19} /> Plaza+ {notificationsForCurrentUser().length > 0 && <span className="rail-mini-count">{notificationsForCurrentUser().length > 99 ? '99+' : notificationsForCurrentUser().length}</span>}</button>
              
              {hasLumina && siteConfig.showLumina && <button data-tutorial-nav="lumina" className={`rail-link ${screen === 'lumina' ? 'selected' : ''}`} onClick={openLumina}>{navIconWithNew(<Droplet size={19} />, 'lumina')} Project Lumina</button>}
              </>}
              <div className="rail-label">COMMUNITY</div>
              <button data-tutorial-nav="news" className={`rail-link ${screen === 'news' ? 'selected' : ''}`} onClick={() => setScreen('news')}>{navIconWithNew(<Newspaper size={19} />, 'news')} Plaza News</button>
              <button data-tutorial-nav="chat" className={`rail-link ${screen === 'chat' ? 'selected' : ''}`} onClick={() => setScreen('chat')}>{chatNavIcon(19)} Chat</button>
              {!isProjectSpace && siteConfig.showUpdates && <button data-tutorial-nav="updates" className={`rail-link ${screen === 'updates' ? 'selected' : ''}`} onClick={() => setScreen('updates')}>{navIconWithNew(<Megaphone size={19} />, 'updates')} Server updates</button>}
              {!isProjectSpace && siteConfig.showSuggestions && <button data-tutorial-nav="suggestions" className={`rail-link ${screen === 'suggestions' ? 'selected' : ''}`} onClick={() => setScreen('suggestions')}>{navIconWithNew(<Lightbulb size={19} />, 'suggestions')} Suggestions</button>}
              {siteConfig.customTabs.map((tab) => <button key={tab.id} className={`rail-link ${screen === 'custom' && customPageId === tab.id ? 'selected' : ''}`} onClick={() => { setCustomPageId(tab.id); setScreen('custom'); }}>{navIconWithNew(<Pencil size={19} />, `custom:${tab.id}`)} {tab.label}</button>)}
              {canEditSite && <button className={`rail-link ${screen === 'admin' ? 'selected' : ''}`} onClick={() => setScreen('admin')}><Shield size={19} /> Admin space</button>}
              {isOwner && <button className={`rail-link edit-mode-toggle ${editMode ? 'selected' : ''}`} onClick={() => setEditMode(true)}>{editMode ? <Check size={19} /> : <Eye size={19} />} {editMode ? 'Editing website' : 'Edit website'}</button>}
              {!isProjectSpace && <button data-tutorial-nav="upload" className="rail-create" onClick={() => openPostComposer()}>{navIconWithNew(<Plus size={19} />, 'upload')} Share a build</button>}
              <div className="rail-footer"><span className="status-light" /> A world built together <small>RUMS Plaza · Minecraft community</small></div>
            </aside>
            <div className="aero-header">
              <div className="aero-brand aero-brand-version-switch">
                {renderRumsVersionSwitcher()}
              </div>
              {screen === 'feed' && !isProjectSpace && <div className="aero-header-center">{renderFeedTabs()}</div>}
              <button className="mobile-header-menu-button" type="button" onClick={() => setMobileMenuOpen((open) => !open)} aria-label="Open site menu" aria-expanded={mobileMenuOpen}><Menu size={21} />{notificationsForCurrentUser().length > 0 && <span className="mobile-header-menu-dot" />}</button>
              {mobileMenuOpen && <nav className="mobile-header-menu" aria-label="Site menu">
                <div className="mobile-menu-heading"><span className="mobile-menu-mark">✦</span><span>RUMS PLAZA<small>Quick access</small></span></div>
                {hasLumina && !isProjectSpace && <div className="mobile-menu-feed"><span className="mobile-menu-caption">COMMUNITY FEED</span><div className="mobile-menu-feed-options"><button type="button" className={feedFilter === 'all' && screen === 'feed' ? 'active' : ''} onClick={() => { setFeedFilter('all'); setScreen('feed'); setMobileMenuOpen(false); }}>All RUMS</button><button type="button" className={feedFilter === 'lumina' && screen === 'feed' ? 'active' : ''} onClick={() => { setFeedFilter('lumina'); setScreen('feed'); setMobileMenuOpen(false); }}><Droplet size={13} /> Lumina</button></div></div>}
                <button type="button" onClick={() => { setMobileMenuOpen(false); setScreen('plazaPlus'); setPlusTab('notifications'); }}><span className="mobile-menu-icon"><Sparkles size={17} /></span> Plaza+ and notifications {notificationsForCurrentUser().length > 0 && <b>{notificationsForCurrentUser().length}</b>}</button>
                {siteConfig.showDiscover && <button type="button" onClick={() => { setMobileMenuOpen(false); setScreen('search'); }}><span className="mobile-menu-icon"><Search size={17} /></span> Discover</button>}
                {siteConfig.showUpdates && <button type="button" onClick={() => { setMobileMenuOpen(false); setScreen('updates'); }}><span className="mobile-menu-icon"><Megaphone size={17} /></span> Server updates</button>}
                <button type="button" onClick={() => { setMobileMenuOpen(false); openOwnProfile(); }}><span className="mobile-menu-icon"><UserIcon size={17} /></span> My profile</button>
                {canEditSite && <button type="button" onClick={() => { setMobileMenuOpen(false); setScreen('admin'); }}><span className="mobile-menu-icon"><ShieldCheck size={17} /></span> Admin space</button>}
                {isOwner && <button type="button" onClick={() => { setMobileMenuOpen(false); setEditMode((editing) => !editing); }}><span className="mobile-menu-icon"><Pencil size={17} /></span> {editMode ? 'Finish editing' : 'Edit website'}</button>}
                <button type="button" onClick={() => { setMobileMenuOpen(false); void handleLogout(); }}><span className="mobile-menu-icon"><LogOut size={17} /></span> Log out</button>
              </nav>}
              <div className="aero-header-actions">
                {editMode && isOwner ? <button className="finish-editing-button" onClick={() => setEditMode(false)}><Check size={17} /> Finish editing</button> : <>
                {isOwner && <button className="icon-btn" onClick={() => setEditMode(true)} title="Edit website"><Pencil size={18} /></button>}
                <button className="icon-btn header-plus-button" onClick={() => { setScreen('plazaPlus'); setPlusTab('notifications'); }} title="Notifications and Plaza+"><Sparkles size={18} />{notificationsForCurrentUser().length > 0 && <span className="header-unread-count">{notificationsForCurrentUser().length > 99 ? '99+' : notificationsForCurrentUser().length}</span>}</button>
                <button className="icon-btn header-chat-button" onClick={() => setScreen('chat')} title="Chat">{chatNavIcon(18)}</button>
                {siteConfig.showDiscover && <button className="icon-btn" onClick={() => setScreen('search')} title="Search">
                  {navIconWithNew(<Search size={18} />, 'search')}
                </button>}
                <button data-tutorial-nav="profile" className="pill pill-btn profile-pill-with-new" onClick={openOwnProfile} title="Your profile">
                  <span className="profile-avatar-new-wrap">{avatarNode(currentUser.username, 18, 8)}{sessionNewCountOnPage('profile') > 0 && <span className="page-new-indicator page-new-count" title={`${sessionNewCountOnPage('profile')} new profile ${sessionNewCountOnPage('profile') === 1 ? 'item' : 'items'}`}>{sessionNewCountOnPage('profile') > 99 ? '99+' : sessionNewCountOnPage('profile')}</span>}</span>
                  {currentUser.username}
                  {currentUser.isAdmin && <ShieldCheck size={13} color="#0fb8a6" />}
                </button>
                <button className="icon-btn" onClick={handleLogout} title="Log out">
                  <LogOut size={18} />
                </button>
                </>}
              </div>
            </div>

            <div className={`content ${screen === 'plazaPlus' ? 'content-plaza-plus' : ''} ${screen === 'chat' ? 'content-chat' : ''} ${screen === 'news' ? 'content-news' : ''}`}>
              {siteConfig.customTabs.length > 0 && <div className="custom-mobile-tabs">{siteConfig.customTabs.map((tab) => <button key={tab.id} className={screen === 'custom' && customPageId === tab.id ? 'active' : ''} onClick={() => { setCustomPageId(tab.id); setScreen('custom'); }}>{tab.label}{sessionNewCountOnPage(`custom:${tab.id}`) > 0 && <span className="custom-tab-new">{sessionNewCountOnPage(`custom:${tab.id}`) > 99 ? '99+' : sessionNewCountOnPage(`custom:${tab.id}`)}</span>}</button>)}</div>}
              {editMode && isOwner && screen !== 'admin' && renderVisualEditToolbar()}
              {error && (
                <div style={{ padding: '10px 16px 0' }}>
                  <div className="error-pill">{error}</div>
                </div>
              )}

              {activePlacement && screen !== 'admin' && renderCustomWidgets(activePlacement)}

              {screen === 'feed' && (isProjectSpace ? renderProjectWorkspace() :
                <div className="feed-box-layout" data-tutorial="feed-layout">{(siteConfig.feedBoxOrder || ['hero', 'posts']).map(renderFeedBox)}</div>
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

              {screen === 'lumina' && hasLumina && (
                <div className="lumina-page" data-tutorial="lumina-page">
                  <div className="lumina-topbar"><button className="glass-circle-btn" onClick={goBack} aria-label="Back"><ArrowLeft size={19} /></button><span>Project</span><button className="glass-circle-btn" onClick={() => { openPostComposer('Lumina'); }} aria-label="Share from Lumina"><Plus size={19} /></button></div>
                  <section className="lumina-project-hero">
                    <div className="lumina-project-glow" aria-hidden="true"><span /><span /></div>
                    <div className="lumina-project-copy"><span className="lumina-kicker"><Droplet size={12} /> A CITY ON RUMS</span><h1 {...editableTextProps('lumina.heading')}>{siteText('lumina.heading', 'Project Lumina')}{textDragHandle('lumina.heading')}</h1><p {...editableTextProps('lumina.description')}>{siteText('lumina.description', 'A bright community city where Frutiger Aero optimism, Frutiger Eco nature and solarpunk urbanism meet.')}{textDragHandle('lumina.description')}</p><div className="lumina-hero-actions"><button onClick={() => setLuminaView('metro')}>Explore the metro</button><button onClick={() => { openPostComposer('Lumina'); }}><Plus size={14} /> Share a view</button></div></div>
                    <div className="lumina-project-stats"><div><strong>{luminaPosts.length}</strong><span>community posts</span></div><div><strong>M1</strong><span>every minute</span></div></div>
                  </section>

                  <nav ref={luminaTabsRef} className={`lumina-view-switch ${luminaTabsDragging ? 'is-dragging' : ''}`} style={{ '--lumina-tab-index': LUMINA_SECTIONS.findIndex(([value]) => value === luminaView) }} aria-label="Project Lumina sections" onPointerDown={handleLuminaTabsPointerDown} onPointerMove={handleLuminaTabsPointerMove} onPointerUp={handleLuminaTabsPointerEnd} onPointerCancel={handleLuminaTabsPointerEnd}>{LUMINA_SECTIONS.map(([value,label]) => <button key={value} className={luminaView === value ? 'active' : ''} onClick={() => { if (!luminaTabsDragRef.current?.moved) setLuminaView(value); }}>{label}</button>)}<span className="drag-refraction lumina-drag-refraction" aria-hidden="true"><span className="drag-refraction-content">{LUMINA_SECTIONS.map(([value,label]) => <span key={value} className={luminaView === value ? 'active' : ''}>{label}</span>)}</span></span></nav>

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
                    {luminaPosts.length ? <div className="lumina-gallery">{luminaPosts.slice(0, 8).map((p) => <button key={p.id} data-session-new-key={sessionNewKey('lumina', 'post', p.id)} onClick={() => openPost(p.id)} aria-label={`Open post by ${p.username}`}>{newContentLabel('lumina', 'post', p.id)}<img src={p.image} alt="" /><span>{p.username}</span>{p.caption && <small>{p.caption}</small>}</button>)}</div> : <div className="lumina-gallery-empty"><Droplet size={22} /><p>No Lumina views have been shared yet.</p><button onClick={() => { openPostComposer('Lumina'); }}>Share the first</button></div>}
                    <button className="lumina-share-card" onClick={() => { openPostComposer('Lumina'); }}><span className="composer-upload-icon"><ImagePlus size={21} /></span><span><b>Add your view of Lumina</b><small>Share a build, street or skyline moment</small></span><Plus size={18} /></button>
                  </section>}
                </div>
              )}

              {screen === 'upload' && (
                <div className="upload-wrap" data-tutorial="upload-page">
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
                    <div className="rums5-location-chip"><Check size={13} /> Creative</div>
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
                    placeholder="Write a caption… hashtags like #metro work too"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                  />
                  <div className="rich-post-grid">
                    <label className="rich-post-field"><span>Alt text</span><input className="aero-input" value={postAltText} onChange={(e)=>setPostAltText(e.target.value)} placeholder="Describe the image for accessibility" /></label>
                    <label className="rich-post-field"><span>Link</span><input className="aero-input" value={postLink} onChange={(e)=>setPostLink(e.target.value)} placeholder="https://…" /></label>
                    <label className="rich-post-field"><span>Short clip URL</span><input className="aero-input" value={postVideoUrl} onChange={(e)=>setPostVideoUrl(e.target.value)} placeholder="Video or clip URL" /></label>
                    <label className="rich-post-field"><span>Add more images ({uploadGallery.length}/5)</span><input type="file" accept="image/*" multiple disabled={uploadGallery.length>=5} onChange={async(e)=>{const files=[...(e.target.files||[])].slice(0,5-uploadGallery.length);const next=[];for(const file of files){try{next.push(await resizeImage(file));}catch{}}setUploadGallery((items)=>[...items,...next].slice(0,5));e.target.value='';}} /></label>
                  </div>
                  {uploadGallery.length>0&&<div className="upload-gallery-preview">{uploadGallery.map((src,index)=><div key={index}><img src={src} alt="Additional upload preview"/><button onClick={()=>setUploadGallery((items)=>items.filter((_,i)=>i!==index))}><X size={12}/></button></div>)}</div>}
                  <div className="poll-composer"><input className="aero-input" placeholder="Optional poll question" value={postPollDraft.question} onChange={(e)=>setPostPollDraft({...postPollDraft,question:e.target.value})}/>{postPollDraft.question&&<div className="poll-options-editor">{postPollDraft.options.map((option,index)=><input key={index} className="aero-input" placeholder={`Option ${index+1}`} value={option} onChange={(e)=>setPostPollDraft({...postPollDraft,options:postPollDraft.options.map((item,i)=>i===index?e.target.value:item)})}/>)}{postPollDraft.options.length<4&&<button className="pill pill-btn" onClick={()=>setPostPollDraft({...postPollDraft,options:[...postPollDraft.options,'']})}>+ Option</button>}</div>}</div>
                  <div className="publish-tools">
                    <button className="pill pill-btn" onClick={saveDraftPost}>Save draft</button>
                    <input className="aero-input schedule-input" type="datetime-local" value={scheduleWhen} onChange={(e)=>setScheduleWhen(e.target.value)} />
                    <button className="pill pill-btn" onClick={scheduleCurrentPost} disabled={!scheduleWhen || !uploadPreview}>Schedule</button>
                    {draftCaption&&<small>{draftCaption}</small>}
                  </div>
                  <button className="aero-btn" style={{ marginTop: 14 }} onClick={handlePublish} disabled={busy || !uploadPreview}>
                    {busy && <Loader2 size={15} className="spin" />}
                    Share to RUMS
                  </button>
                </div>
              )}

              {screen === 'chat' && (
                <div className="chat-page" data-tutorial="chat-page">
                  <aside className={`chat-sidebar ${chatListOpen ? 'mobile-open' : ''}`} aria-label="Conversations" onClickCapture={(event) => { if (event.target instanceof Element && event.target.closest('.chat-thread-button')) setChatListOpen(false); }}>
                    <div className="chat-sidebar-heading">
                      <div><span className="eyebrow">RUMS PLAZA</span><h2>Chat</h2></div>
                      <span className="chat-live-pill"><span /> live</span>
                      <button className="chat-mobile-close" type="button" onClick={() => setChatListOpen(false)} aria-label="Close conversations"><X size={18} /></button>
                    </div>
                    <button className={`chat-thread-button chat-room-button ${activeChat === 'plaza' ? 'active' : ''}`} onClick={() => setActiveChat('plaza')}>
                      <span className="chat-thread-avatar plaza-chat-avatar"><MessageCircle size={18} /></span>
                      <span className="chat-thread-copy"><strong>Plaza Chat</strong><small>Everyone on RUMS</small></span>
                      {chatUnreadCount('plaza') > 0 && <span className="chat-thread-unread">{chatUnreadCount('plaza') > 99 ? '99+' : chatUnreadCount('plaza')}</span>}
                    </button>
                    {(plazaPlus.groups || []).filter((group) => group.members?.includes(currentUser.username)).length > 0 && <>
                      <div className="chat-sidebar-label">GROUP CHATS</div>
                      <div className="chat-user-list">{(plazaPlus.groups || []).filter((group) => group.members?.includes(currentUser.username)).map((group) => {
                        const threadId = `group:${group.id}`;
                        const unread = chatUnreadCount(threadId);
                        return <button key={group.id} className={`chat-thread-button ${activeChat === threadId ? 'active' : ''}`} onClick={() => setActiveChat(threadId)}>
                          <span className="chat-thread-avatar plaza-chat-avatar"><MessageCircle size={16} /></span>
                          <span className="chat-thread-copy"><strong>{group.name}</strong><small>{group.members.length} members</small></span>
                          {unread > 0 && <span className="chat-thread-unread">{unread > 99 ? '99+' : unread}</span>}
                        </button>;
                      })}</div>
                    </>}
                    <div className="chat-sidebar-label">DIRECT MESSAGES</div>
                    <div className="chat-user-search"><Search size={14} /><input value={chatSearch} onChange={(event) => setChatSearch(event.target.value)} placeholder="Find a person…" /></div>
                    <div className="chat-user-list">
                      {users
                        .filter((user) => user.username !== currentUser.username && user.username.toLowerCase().includes(chatSearch.trim().toLowerCase()))
                        .sort((a, b) => {
                          const aUnread = chatUnreadCount(`dm:${a.username}`);
                          const bUnread = chatUnreadCount(`dm:${b.username}`);
                          return bUnread - aUnread || a.username.localeCompare(b.username);
                        })
                        .map((user) => {
                          const threadId = `dm:${user.username}`;
                          const unread = chatUnreadCount(threadId);
                          return <button key={user.username} className={`chat-thread-button ${activeChat === threadId ? 'active' : ''}`} onClick={() => setActiveChat(threadId)}>
                            <span className="chat-thread-avatar">{avatarNode(user.username, 34, 12)}</span>
                            <span className="chat-thread-copy"><strong>{user.username}</strong><small>{user.isAdmin ? 'Admin · direct message' : 'Direct message'}</small></span>
                            {unread > 0 && <span className="chat-thread-unread">{unread > 99 ? '99+' : unread}</span>}
                          </button>;
                        })}
                      {users.filter((user) => user.username !== currentUser.username && user.username.toLowerCase().includes(chatSearch.trim().toLowerCase())).length === 0 && <p className="chat-no-users">No people found.</p>}
                    </div>
                  </aside>

                  <section className="chat-conversation" aria-label={activeChatLabel()}>
                    <header className="chat-conversation-header">
                      <button className="chat-mobile-conversations" type="button" onClick={() => setChatListOpen((open) => !open)} aria-label="Choose conversation"><MessageCircle size={18} /><span>Chats</span></button>
                      <div className="chat-conversation-identity">
                        {activeChat === 'plaza' ? <span className="chat-header-avatar plaza-chat-avatar"><MessageCircle size={20} /></span> : <span className="chat-header-avatar">{avatarNode(activeChatLabel(), 38, 13)}</span>}
                        <div><strong>{activeChatLabel()}</strong><small>{activeChat === 'plaza' ? 'Shared across RUMS 4, Creative and Projects' : 'Direct message'}</small></div>
                      </div>
                      <div className="chat-header-actions">
                        <button className="pill pill-btn" onClick={() => setChatMediaOpen((open) => !open)}>Media</button>
                        {activeChat.startsWith('dm:') && <button className="pill pill-btn" onClick={() => openProfile(activeChatLabel())}>View profile</button>}
                      </div>
                    </header>
                    {chatMediaOpen && <div className="chat-media-gallery">{chatMessagesForThread(activeChat).filter((m) => m.image || m.gif).map((m) => m.gif ? <button key={m.id} type="button" title={`GIF shared by ${m.sender}`}><KlipyMedia gif={m.gif} /></button> : <button key={m.id} onClick={() => window.open(m.image, '_blank', 'noopener,noreferrer')}><img src={m.image} alt={`Shared by ${m.sender}`} /></button>)}{chatMessagesForThread(activeChat).filter((m) => m.image || m.gif).length === 0 && <small>No shared media in this conversation yet.</small>}</div>}

                    <div className="chat-message-list" ref={chatMessageListRef} onScroll={(event) => { const list = event.currentTarget; chatPinnedRef.current = list.scrollHeight - list.scrollTop - list.clientHeight < 80; }}>
                      {chatMessagesForThread(activeChat).length === 0 ? (
                        <div className="chat-empty"><span className="plaza-chat-avatar"><MessageCircle size={22} /></span><h3>{activeChat === 'plaza' ? 'Start the Plaza Chat' : `Say hi to ${activeChatLabel()}`}</h3><p>{activeChat === 'plaza' ? 'Messages here are visible to everyone using RUMS Plaza.' : 'There are no messages in this conversation yet.'}</p></div>
                      ) : chatMessagesForThread(activeChat).map((message, index, list) => {
                        const own = message.sender === currentUser.username;
                        const previous = list[index - 1];
                        const grouped = previous && previous.sender === message.sender && message.timestamp - previous.timestamp < 5 * 60 * 1000;
                        const seenIndex = chatSeenReceipt.threadId === activeChat ? list.findIndex((item) => item.id === chatSeenReceipt.id) : -1;
                        const showSeen = own && activeChat.startsWith('dm:') && seenIndex >= index && !list.slice(index + 1).some((item) => item.sender === currentUser.username);
                        const spotifyEmbed = spotifyEmbedFromText(message.text || '');
                        const spotifyVisibleText = stripSpotifyLinks(message.text || '');
                        const spotifyOnly = !!spotifyEmbed && !spotifyVisibleText && !message.image && !message.gif && !message.replyTo;
                        return <div key={message.id} className={`chat-message ${own ? 'own' : ''} ${grouped ? 'grouped' : ''} ${spotifyEmbed ? 'has-spotify' : ''} ${spotifyOnly ? 'spotify-only' : ''}`}>
                          {!grouped && <button className="chat-message-avatar" onClick={() => openProfile(message.sender)} aria-label={`Open ${message.sender}'s profile`}>{avatarNode(message.sender, 32, 11)}</button>}
                          <div className="chat-message-main">
                            {!grouped && <div className="chat-message-meta"><button onClick={() => openProfile(message.sender)}>{message.sender}</button><span>{timeAgo(message.timestamp)}</span></div>}
                            <div className="chat-message-bubble">
                              {message.replyTo && <div className="chat-reply-quote"><b>{message.replyTo.sender}</b><span>{message.replyTo.text || 'Image'}</span></div>}
                              {message.gif && <div className="chat-klipy-message" title={message.gif.title || 'GIF'}><KlipyMedia gif={message.gif} className="chat-klipy-media" /></div>}
                              {message.image && <button className="chat-message-image-button" onClick={() => window.open(message.image, '_blank', 'noopener,noreferrer')} title="Open image"><img className="chat-message-image" src={message.image} alt={message.text ? `Image sent by ${message.sender}` : `Chat image from ${message.sender}`} loading="lazy" /></button>}
                              {message.text && <>
                                {spotifyVisibleText && <div className="chat-message-text">{spotifyVisibleText}</div>}
                                {spotifyEmbed && <SpotifyMessageEmbed text={message.text} />}
                              </>}
                            </div>
                            <div className="chat-message-tools">
                              <button type="button" onClick={() => setChatReplyTo(message)}>Reply</button>
                              <button type="button" onClick={() => setChatReactionOpen(chatReactionOpen === message.id ? null : message.id)}>React</button>
                              {Object.entries(plazaPlus.chatReactions?.[message.id] || {}).map(([emoji, names]) => names?.length ? <button key={emoji} className={names.includes(currentUser.username) ? 'active' : ''} onClick={() => toggleChatReaction(message.id, emoji)}>{emoji} {names.length}</button> : null)}
                              {chatReactionOpen === message.id && <span className="chat-reaction-picker">{['👍','❤️','😂','🔥','😮','🎉'].map((emoji)=><button key={emoji} onClick={() => { toggleChatReaction(message.id, emoji); setChatReactionOpen(null); }}>{emoji}</button>)}</span>}
                            </div>
                            {showSeen && <span className="chat-seen-label">Seen</span>}
                          </div>
                          {(own || canModerate) && <button className="chat-message-delete" onClick={() => deleteChatMessage(message.id)} title="Delete message"><Trash2 size={13} /></button>}
                        </div>;
                      })}
                      {typingUsersForActiveChat().length > 0 && <div className="chat-typing">{typingUsersForActiveChat().join(', ')} {typingUsersForActiveChat().length === 1 ? 'is' : 'are'} typing…</div>}
                    </div>

                    <div className="chat-composer">
                      {chatReplyTo && <div className="chat-replying"><span>Replying to <b>{chatReplyTo.sender}</b>: {chatReplyTo.text || 'Image'}</span><button onClick={() => setChatReplyTo(null)}><X size={13} /></button></div>}
                      {chatImageDraft && <div className="chat-image-preview"><img src={chatImageDraft} alt="Selected chat upload" /><button type="button" className="chat-image-remove" onClick={() => setChatImageDraft('')} aria-label="Remove image"><X size={14} /></button></div>}
                      {chatGifDraft && <div className="chat-image-preview chat-gif-preview"><KlipyMedia gif={chatGifDraft} /><button type="button" className="chat-image-remove" onClick={() => setChatGifDraft(null)} aria-label="Remove GIF"><X size={14} /></button></div>}
                      {gifPickerOpen && <div className="gif-picker-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setGifPickerOpen(false); }}>
                        <section className="gif-picker-panel" role="dialog" aria-modal="true" aria-label="GIF picker">
                          <header className="gif-picker-header">
                            <div className="gif-picker-title">
                              <span className="gif-picker-mark">GIF</span>
                              <div><strong>Choose a GIF</strong><small>Search or pick one below</small></div>
                            </div>
                            <button data-tutorial-action="gif-close" type="button" className="gif-picker-close" onClick={() => setGifPickerOpen(false)} aria-label="Close GIF picker"><X size={18} /></button>
                          </header>

                          <form className="gif-picker-search" onSubmit={(event) => { event.preventDefault(); if (gifSearchTimerRef.current) clearTimeout(gifSearchTimerRef.current); void loadKlipyGifs({ query: gifQuery, next: '', append: false }); }}>
                            <Search size={17} />
                            <input value={gifQuery} onChange={(event) => queueGifSearch(event.target.value)} placeholder="Search GIFs" aria-label="Search GIFs" autoFocus />
                            {gifQuery && <button type="button" onClick={() => { if (gifSearchTimerRef.current) clearTimeout(gifSearchTimerRef.current); setGifQuery(''); void loadKlipyGifs({ query: '', next: '', append: false }); }} aria-label="Clear GIF search"><X size={14} /></button>}
                          </form>

                          <div className="gif-picker-section-label">
                            <strong>{gifQuery.trim() ? 'Search results' : 'Trending'}</strong>
                            {!gifLoading && gifResults.length > 0 && <span>{gifResults.length} GIFs</span>}
                          </div>

                          <div className="gif-picker-body">
                            {gifError ? <div className="gif-picker-state"><span>Couldn’t load GIFs.</span><button type="button" onClick={() => void loadKlipyGifs({ query: gifQuery, next: '', append: false })}>Try again</button></div> : <>
                              {gifLoading && gifResults.length === 0 ? <div className="gif-picker-skeletons">{Array.from({ length: 8 }).map((_, index) => <span key={index} />)}</div> : <div className="gif-picker-grid">
                                {gifResults.slice(0, 8).map((gif) => <button key={gif.id} type="button" className="gif-picker-item" onClick={() => { void selectKlipyGif(gif); }} title={gif.title || 'Send GIF'}>
                                  <img src={gif.preview || gif.url} alt={gif.title || 'GIF'} loading="lazy" decoding="async" referrerPolicy="no-referrer" />
                                </button>)}
                              </div>}
                              {!gifLoading && gifResults.length === 0 && <div className="gif-picker-state"><span>No GIFs found.</span><small>Try a different search.</small></div>}
                            </>}
                          </div>

                          <footer className="gif-picker-footer">
                            <span>{gifLoading && gifResults.length > 0 ? 'Loading more…' : 'Pick a GIF to attach it'}</span>
                            {gifNext && <button type="button" className="gif-picker-more" disabled={gifLoading} onClick={() => { void loadKlipyGifs({ query: gifQuery, next: gifNext, append: true }); }}>{gifLoading ? 'Loading…' : 'Load more'}</button>}
                          </footer>
                        </section>
                      </div>}
                      <textarea
                        value={chatDraft}
                        onChange={(event) => { setChatDraft(event.target.value.slice(0, 1200)); void noteTyping(); }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault();
                            void sendChatMessage();
                          }
                        }}
                        placeholder={activeChat === 'plaza' ? 'Message Plaza Chat…' : `Message ${activeChatLabel()}…`}
                        aria-label="Message"
                      />
                      <input ref={chatImageInputRef} type="file" accept="image/*" hidden onChange={(event) => { void handleChatImagePick(event); }} />
                      <div className="chat-composer-bottom">
                        <div className="chat-composer-tools">
                          <button className="chat-attach-button" type="button" onClick={() => chatImageInputRef.current?.click()} disabled={chatBusy || chatImageBusy}>
                            {chatImageBusy ? <Loader2 size={15} className="spin" /> : <ImagePlus size={15} />}
                            <span>{chatImageDraft ? 'Change image' : 'Add image'}</span>
                          </button>
                          <button data-tutorial-action="gif-open" className={`chat-attach-button klipy-button ${gifPickerOpen ? 'active' : ''}`} type="button" onClick={openGifPicker} disabled={chatBusy || chatImageBusy}>
                            <span className="klipy-button-gif">GIF</span>
                            <span>GIF</span>
                          </button>
                          <small>{chatDraft.length}/1200 · Shift+Enter for a new line</small>
                        </div>
                        <button className="chat-send-button" onClick={sendChatMessage} disabled={chatBusy || chatImageBusy || (!chatDraft.trim() && !chatImageDraft && !chatGifDraft)}>{chatBusy ? <Loader2 size={17} className="spin" /> : <Send size={17} />}<span>Send</span></button>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {screen === 'suggestions' && (
                <div className="upload-wrap" data-tutorial="suggestions-page">
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
                      <div className="suggestion-card" data-edit-box-id={`suggestion:${s.id}`} data-session-new-key={sessionNewKey('suggestions', 'suggestion', s.id)} key={s.id}>
                        <div className="suggestion-top">
                          {newContentLabel('suggestions', 'suggestion', s.id)}
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
                        <div className="suggestion-actions">
                          <button
                            className={`like-btn suggestion-vote-btn ${voted ? 'liked' : ''}`}
                            onClick={() => toggleSuggestionVote(s.id)}
                          >
                            <Heart size={14} fill={voted ? 'currentColor' : 'none'} />
                            {(s.votes || []).length > 0 ? (s.votes || []).length : 'Upvote'}
                          </button>
                          {renderReactionAddButton(s, 'suggestion')}
                        </div>
                        {renderReactionBar(s, 'suggestion')}
                      </div>
                    );
                  })}
                </div>
              )}

              {screen === 'news' && (
                <div className="plaza-news-site" data-tutorial="news-page">
                  <header className="news-site-top">
                    <div className="news-site-brand-row">
                      <button className="news-site-logo" type="button" onClick={()=>{setNewsFilter('All');setNewsSelectedId(null);}} aria-label="Plaza News home">
                        <span>PLAZA</span><b>NEWS</b>
                      </button>
                      <div className="news-site-tagline">News from across RUMS Plaza</div>
                      {canEditSite && <button className="news-site-publish" type="button" onClick={()=>setNewsComposeOpen((open)=>!open)}><Plus size={16}/>{newsComposeOpen ? 'Close' : 'Publish'}</button>}
                    </div>
                    <nav className="news-site-nav" aria-label="Plaza News sections">
                      {['All', ...NEWS_CATEGORIES].map((category)=><button key={category} className={newsFilter===category?'active':''} onClick={()=>{setNewsFilter(category);setNewsSelectedId(null);}}>{category==='All'?'Home':category}</button>)}
                    </nav>
                  </header>

                  {canEditSite && newsComposeOpen && <section className="news-site-composer news-room-editor">
                    <div className="news-composer-head"><div><span className="news-editor-eyebrow">PLAZA NEWS DESK</span><b>Create article</b><small>Build the article exactly as it will appear on the news site.</small></div><button type="button" onClick={()=>setNewsComposeOpen(false)} aria-label="Close editor"><X size={17}/></button></div>
                    <div className="news-editor-fields">
                      <label className="news-editor-field news-editor-title"><span>Headline</span><input className="aero-input" placeholder="Write a clear, factual headline" maxLength={120} value={newsDraft.title} onChange={(e)=>setNewsDraft({...newsDraft,title:e.target.value})}/><small>{newsDraft.title.length}/120</small></label>
                      <label className="news-editor-field news-editor-category"><span>Section</span><select className="aero-input" value={newsDraft.category} onChange={(e)=>setNewsDraft({...newsDraft,category:e.target.value})}>{NEWS_CATEGORIES.map((category)=><option key={category}>{category}</option>)}</select></label>
                      <label className="news-editor-field news-editor-source"><span>Source</span><select className="aero-input" value={newsDraft.source} onChange={(e)=>setNewsDraft({...newsDraft,source:e.target.value})}>{NEWS_SOURCES.map((source)=><option key={source}>{source}</option>)}</select></label>
                      <label className="news-editor-field news-editor-summary"><span>Standfirst</span><textarea className="caption-area" rows={3} placeholder="Summarise the article in one or two sentences" maxLength={260} value={newsDraft.summary} onChange={(e)=>setNewsDraft({...newsDraft,summary:e.target.value})}/><small>{newsDraft.summary.length}/260</small></label>
                      <label className="news-editor-field news-editor-body"><span>Article</span><textarea className="caption-area" rows={12} placeholder="Write the full article. Use blank lines to start a new paragraph." value={newsDraft.body} onChange={(e)=>setNewsDraft({...newsDraft,body:e.target.value})}/><small>{newsDraft.body.length}/8000</small></label>
                    </div>

                    <section className="news-media-editor" aria-label="Article media">
                      <div className="news-media-editor-head"><div><b>Media</b><small>Add a lead image and/or a video. Images are also used as article thumbnails.</small></div></div>
                      <div className="news-media-controls">
                        <label className="news-media-upload"><ImagePlus size={16}/><span><b>{newsImageBusy ? 'Processing image…' : 'Upload image'}</b><small>JPG, PNG, WebP or GIF</small></span><input hidden type="file" accept="image/*" onChange={handleNewsImagePick} disabled={newsImageBusy}/></label>
                        <label className="news-media-upload"><Video size={16}/><span><b>{newsVideoBusy ? 'Loading video…' : 'Upload video'}</b><small>Up to 20 MB</small></span><input hidden type="file" accept="video/*" onChange={handleNewsVideoPick} disabled={newsVideoBusy}/></label>
                      </div>
                      <div className="news-media-url-grid">
                        <label><span><Link2 size={13}/> Image URL</span><input className="aero-input" placeholder="https://…" value={newsDraft.image?.startsWith('data:') ? '' : newsDraft.image} onChange={(e)=>setNewsDraft({...newsDraft,image:e.target.value})}/></label>
                        <label><span><Link2 size={13}/> Video URL</span><input className="aero-input" placeholder="YouTube, Vimeo, MP4 or WebM URL" value={newsDraft.video?.startsWith('data:') ? '' : newsDraft.video} onChange={(e)=>setNewsDraft({...newsDraft,video:e.target.value})}/></label>
                      </div>
                      {(newsDraft.image || newsDraft.video) && <div className="news-media-preview-grid">
                        {newsDraft.image && <div className="news-media-preview"><div className="news-media-preview-label">Lead image</div><img src={newsDraft.image} alt="News preview"/><button type="button" onClick={()=>setNewsDraft({...newsDraft,image:''})} aria-label="Remove image"><X size={14}/></button></div>}
                        {newsDraft.video && <div className="news-media-preview news-video-preview"><div className="news-media-preview-label">Video</div><NewsVideo src={newsDraft.video} title="News video preview"/><button type="button" onClick={()=>setNewsDraft({...newsDraft,video:''})} aria-label="Remove video"><X size={14}/></button></div>}
                      </div>}
                    </section>

                    <div className="news-editor-footer">
                      <div className="news-editor-options">
                        <label className="news-toggle"><input type="checkbox" checked={newsDraft.breaking} onChange={(e)=>setNewsDraft({...newsDraft,breaking:e.target.checked})}/><span>Breaking news</span></label>
                        <label className="news-toggle"><input type="checkbox" checked={newsDraft.pinned} onChange={(e)=>setNewsDraft({...newsDraft,pinned:e.target.checked})}/><span>Lead article</span></label>
                      </div>
                      <button className="news-editor-publish" disabled={newsBusy || newsImageBusy || newsVideoBusy || !newsDraft.title.trim() || !newsDraft.body.trim()} onClick={async()=>{await publishNewsArticle();setNewsComposeOpen(false);}}>{newsBusy ? <Loader2 size={16} className="spin"/> : <Newspaper size={16}/>} Publish article</button>
                    </div>
                  </section>}

                  {selectedNewsArticle ? <main className="news-article-page">
                    <div className="news-article-breadcrumb"><button onClick={()=>setNewsSelectedId(null)}>Plaza News</button><span>›</span><span>{selectedNewsArticle.category}</span></div>
                    <article className="news-article-main">
                      <div className="news-article-kicker">{selectedNewsArticle.breaking && <span className="news-site-breaking">LIVE / BREAKING</span>}<span>{selectedNewsArticle.category}</span><span className={`news-source-badge news-source-${String(selectedNewsArticle.source || 'RUMS 4').toLowerCase().replace(/[^a-z0-9]+/g,'-')}`}>{selectedNewsArticle.source || 'RUMS 4'}</span></div>
                      <h1>{selectedNewsArticle.title}</h1>
                      {selectedNewsArticle.summary && <p className="news-article-standfirst">{selectedNewsArticle.summary}</p>}
                      <div className="news-article-meta"><span>By <button onClick={()=>openProfile(selectedNewsArticle.author)}>{selectedNewsArticle.author}</button></span><span>Published {new Date(selectedNewsArticle.timestamp).toLocaleString([], { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}</span></div>
                      {selectedNewsArticle.image && <figure className="news-article-hero"><img src={selectedNewsArticle.image} alt=""/></figure>}
                      {selectedNewsArticle.video && <div className="news-article-video"><NewsVideo src={selectedNewsArticle.video} title={selectedNewsArticle.title}/></div>}
                      <div className="news-article-body">{selectedNewsArticle.body.split('\n').map((line,i)=>line ? <p key={i}>{line}</p> : <br key={i}/>)}</div>
                      <div className="news-article-reactions"><span>What do you think?</span>{['❤️','👍','🔥','🎉'].map((emoji)=>{const names=selectedNewsArticle.reactions?.[emoji]||[];return <button key={emoji} className={names.includes(currentUser.username)?'active':''} onClick={()=>toggleNewsReaction(selectedNewsArticle.id,emoji)}>{emoji}{names.length ? <b>{names.length}</b> : null}</button>})}</div>
                      <section className="news-article-comments">
                        <header><h2>Comments</h2><span>{selectedNewsArticle.comments?.length || 0}</span></header>
                        <div className="news-comment-compose"><input className="aero-input" placeholder="Join the discussion…" value={newsCommentDrafts[selectedNewsArticle.id]||''} onChange={(e)=>setNewsCommentDrafts({...newsCommentDrafts,[selectedNewsArticle.id]:e.target.value})} onKeyDown={(e)=>{if(e.key==='Enter'){e.preventDefault();void submitNewsComment(selectedNewsArticle.id);}}}/><button className="aero-btn" onClick={()=>submitNewsComment(selectedNewsArticle.id)}>Post</button></div>
                        <div className="news-comment-list">{(selectedNewsArticle.comments||[]).slice().reverse().map((comment)=><div className="news-comment" key={comment.id}>{avatarNode(comment.username,32,11)}<div><div><button onClick={()=>openProfile(comment.username)}>{comment.username}</button><span>{timeAgo(comment.timestamp)}</span></div><p>{comment.text}</p></div></div>)}{!(selectedNewsArticle.comments||[]).length&&<p className="news-no-comments">No comments yet.</p>}</div>
                      </section>
                      {canEditSite && <button className="news-delete" onClick={()=>deleteNewsArticle(selectedNewsArticle.id)}><Trash2 size={14}/> Delete article</button>}
                    </article>
                    <aside className="news-article-side">
                      <h3>More from Plaza News</h3>
                      {plazaNews.filter((article)=>article.id!==selectedNewsArticle.id).sort((a,b)=>b.timestamp-a.timestamp).slice(0,5).map((article)=><button key={article.id} onClick={()=>setNewsSelectedId(article.id)}><span>{article.category} · {article.source || 'RUMS 4'}</span><b>{article.title}</b><small>{timeAgo(article.timestamp)}</small></button>)}
                    </aside>
                  </main> : <>
                    {visibleNews.length > 0 ? <main className="news-home-layout">
                      <section className="news-home-main">
                        <div className="news-top-grid">
                          <article className="news-top-story" onClick={()=>setNewsSelectedId(heroNewsArticle.id)}>
                            <div className="news-top-image">{heroNewsArticle.image ? <img src={heroNewsArticle.image} alt=""/> : <span><Newspaper size={44}/></span>}</div>
                            <div className="news-top-copy">
                              <div>{heroNewsArticle.breaking ? <span className="news-site-breaking">BREAKING</span> : <span className="news-site-new">NEW</span>}<span className="news-site-category">{heroNewsArticle.category}</span><span className={`news-source-badge news-source-${String(heroNewsArticle.source || 'RUMS 4').toLowerCase().replace(/[^a-z0-9]+/g,'-')}`}>{heroNewsArticle.source || 'RUMS 4'}</span></div>
                              <h1>{heroNewsArticle.title}</h1>
                              <p>{heroNewsArticle.summary || heroNewsArticle.body.slice(0,220)}</p>
                              <small>{timeAgo(heroNewsArticle.timestamp)} · {heroNewsArticle.comments?.length||0} comments</small>
                            </div>
                          </article>
                          <div className="news-top-secondary">
                            {newsAfterHero.slice(0,2).map((article)=><article key={article.id} onClick={()=>setNewsSelectedId(article.id)}>
                              {article.image && <img src={article.image} alt=""/>}
                              <div><div className="news-secondary-tags"><span>{article.category}</span><span className={`news-source-badge news-source-${String(article.source || 'RUMS 4').toLowerCase().replace(/[^a-z0-9]+/g,'-')}`}>{article.source || 'RUMS 4'}</span></div><h2>{article.title}</h2><small>{timeAgo(article.timestamp)}</small></div>
                            </article>)}
                          </div>
                        </div>

                        <section className="news-latest-section">
                          <div className="news-section-heading"><h2>Latest news</h2><span>{visibleNews.length} articles</span></div>
                          <div className="news-latest-list">
                            {newsAfterHero.slice(2).map((article)=><article key={article.id} onClick={()=>setNewsSelectedId(article.id)}>
                              <div className="news-latest-time">{new Date(article.timestamp).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</div>
                              <div className="news-latest-copy"><div className="news-latest-tags"><span>{article.breaking?'BREAKING · ':''}{article.category}</span><span className={`news-source-badge news-source-${String(article.source || 'RUMS 4').toLowerCase().replace(/[^a-z0-9]+/g,'-')}`}>{article.source || 'RUMS 4'}</span></div><h3>{article.title}</h3><p>{article.summary || article.body.slice(0,150)}</p><small>{article.author} · {article.comments?.length||0} comments</small></div>
                              {article.image && <img src={article.image} alt=""/>}
                            </article>)}
                            {newsAfterHero.length <= 2 && <div className="news-list-empty">More articles will appear here as they are published.</div>}
                          </div>
                        </section>
                      </section>

                      <aside className="news-home-rail">
                        <section className="news-rail-block news-net-binnen">
                          <div className="news-rail-title"><h2>Just in</h2><span>LIVE</span></div>
                          <div>{visibleNews.slice(0,7).map((article)=><button key={article.id} onClick={()=>setNewsSelectedId(article.id)}><time>{new Date(article.timestamp).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</time><span>{article.title}</span></button>)}</div>
                        </section>
                        <section className="news-rail-block news-most-discussed">
                          <div className="news-rail-title"><h2>Most discussed</h2></div>
                          <ol>{plazaNews.slice().sort((a,b)=>(b.comments?.length||0)-(a.comments?.length||0)).slice(0,5).map((article,index)=><li key={article.id}><button onClick={()=>setNewsSelectedId(article.id)}><b>{index+1}</b><span>{article.title}</span></button></li>)}</ol>
                        </section>
                      </aside>
                    </main> : <div className="news-empty"><Newspaper size={30}/><h3>No articles yet</h3><p>{newsFilter==='All'?'Plaza News is ready for its first article.':`No ${newsFilter} articles have been published.`}</p>{canEditSite&&<button className="aero-btn" onClick={()=>setNewsComposeOpen(true)}><Plus size={15}/> Publish the first article</button>}</div>}
                  </>}
                </div>
              )}

              {screen === 'updates' && (
                <div className="updates-page" data-tutorial="updates-page">
                  {currentUser.isAdmin && (
                    <section className="updates-composer" aria-label="Post a server update">
                      <div className="field-label">Post an update</div>
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
                      <div className="updates-composer-actions">
                        <button
                          className="aero-btn"
                          onClick={submitUpdate}
                          disabled={updateBusy || !updateDraft.title.trim()}
                        >
                          {updateBusy && <Loader2 size={15} className="spin" />}
                          Post update
                        </button>
                      </div>
                    </section>
                  )}

                  <section className="updates-feed" aria-label="Server updates">
                    <div className="admin-section-title updates-heading">
                      <Megaphone size={16} /> Updates
                    </div>
                    {visibleUpdates.length === 0 ? (
                      <p className="updates-empty">No updates posted yet.</p>
                    ) : (
                      <div className="updates-list">
                        {visibleUpdates.map((u) => (
                          <article className="update-card" data-edit-box-id={`update:${u.id}`} data-session-new-key={sessionNewKey('updates', 'update', u.id)} key={u.id}>
                            <div className="post-top">
                              {newContentLabel('updates', 'update', u.id)}
                              <div className="update-card-copy">
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
                            {u.body && <div className="post-caption update-card-body">{u.body}</div>}
                          </article>
                        ))}
                      </div>
                    )}
                  </section>
                </div>
              )}


              {screen === 'plazaPlus' && (
                <div className="plaza-plus-page" data-tutorial="plaza-plus-page">
                  <div className="plaza-plus-hero">
                    <div><span className="eyebrow">RUMS PLAZA</span><h1>Plaza+</h1><p>Your social hub for notifications, saved posts, events, groups, projects, wiki, customization and community tools.</p></div>
                    <button className="pill pill-btn" onClick={() => setCommandOpen(true)}>⌘K Command palette</button>
                  </div>
                  <div className="plaza-plus-layout">
                    <nav className="plaza-plus-tabs" aria-label="Plaza+ sections">{[
                      ['Community', [['notifications','Notifications'],['activity','Activity'],['saved','Saved posts']]],
                      ['Spaces', [['events','Events'],['groups','Groups'],['projects','Projects'],['knowledge','Wiki & builds']]],
                      ['Your tools', [['creator','Creator'],['settings','Settings'],['safety','Safety']]]
                    ].map(([group,items]) => <div className="plaza-plus-nav-group" key={group}><span className="plaza-plus-nav-heading">{group}</span>{items.map(([id,label]) => <button key={id} type="button" className={plusTab===id?'active':''} aria-current={plusTab===id?'page':undefined} onClick={() => setPlusTab(id)}><span>{label}</span>{id==='notifications'&&notificationsForCurrentUser().length>0?<em>{notificationsForCurrentUser().length}</em>:null}</button>)}</div>)}</nav>
                    <main className="plaza-plus-main">

                  {plusTab === 'notifications' && <section className="plaza-plus-panel"><div className="plus-section-head"><div><h2>Notifications</h2><p>Mentions, follows, likes, comments and community activity.</p></div><button className="pill pill-btn" onClick={() => void markNotificationsRead()} disabled={notificationsForCurrentUser().length === 0}>Mark all read</button></div><div className="plus-list">{notificationsForCurrentUser().slice(0,60).map((a)=><button key={a.id} className="plus-row" onClick={()=>{void markNotificationsRead(Number(a.timestamp) || Date.now());if(a.postId){setViewingPostId(a.postId);setScreen('postDetail');}}}><span className="plus-row-icon">{a.type==='follow'?'👤':a.type==='mention'?'@':a.type==='like'?'♥':'●'}</span><span><b>{a.text}</b><small>{timeAgo(a.timestamp)}</small></span></button>)}{notificationsForCurrentUser().length === 0 && <div className="plus-empty">You're all caught up.</div>}</div></section>}

                  {plusTab === 'saved' && (() => {
                    const myCollections = plazaPlus.collections?.[currentUser.username] || [];
                    const activeCollection = myCollections.find((collection) => collection.id === activeCollectionId) || null;
                    const allSavedIds = bookmarkedPosts();
                    const savedPosts = posts.filter((post) => allSavedIds.includes(post.id));
                    const collectionPosts = activeCollection ? posts.filter((post) => (activeCollection.postIds || []).includes(post.id)) : [];
                    return <section className="plaza-plus-panel saved-library-panel">
                      {!activeCollection ? <>
                        <div className="plus-section-head saved-library-head">
                          <div><h2>Saved posts & collections</h2><p>Keep builds, ideas and inspiration organised in your own Plaza library.</p></div>
                          <div className="saved-library-total"><Star size={15}/><b>{savedPosts.length}</b><span>saved</span></div>
                        </div>

                        <div className="saved-create-row">
                          <div><strong>Create a collection</strong><small>Group saved posts by project, district, build style or anything else.</small></div>
                          <div className="plus-inline-form">
                            <input className="aero-input" value={collectionDraft} onChange={(e)=>setCollectionDraft(e.target.value)} placeholder="Collection name" maxLength={40}/>
                            <button className="aero-btn" onClick={createCollection} disabled={!collectionDraft.trim()}>Create</button>
                          </div>
                        </div>

                        <div className="plus-subheading saved-subheading">Collections</div>
                        {myCollections.length ? <div className="collection-grid collection-library-grid">
                          {myCollections.map((collection) => {
                            const items = posts.filter((post) => (collection.postIds || []).includes(post.id));
                            const preview = items.filter((post) => post.image).slice(0,3);
                            return <button type="button" key={collection.id} className="collection-card collection-library-card" onClick={() => { setActiveCollectionId(collection.id); setCollectionEditing(false); }}>
                              <div className={`collection-preview collection-preview-${Math.min(preview.length,3)}`}>
                                {preview.length ? preview.map((post) => <img key={post.id} src={post.image} alt=""/>) : <span><Star size={20}/></span>}
                              </div>
                              <div className="collection-card-copy">
                                <h3>{collection.name}</h3>
                                <p>{items.length} {items.length === 1 ? 'post' : 'posts'}</p>
                              </div>
                              <span className="collection-open-arrow">→</span>
                            </button>
                          })}
                        </div> : <div className="plus-empty saved-library-empty">No collections yet. Create one above, then add saved posts to it.</div>}

                        <div className="plus-subheading saved-subheading">All saved posts</div>
                        {savedPosts.length ? <div className="saved-post-grid">
                          {savedPosts.map((post)=><div className="saved-post-wrap" key={`saved-${post.id}`}>
                            {renderPost(post)}
                            {myCollections.length>0&&<select className="aero-input saved-collection-select" defaultValue="" onChange={(e)=>{if(e.target.value){void addPostToCollection(post.id,e.target.value);e.currentTarget.value='';}}}>
                              <option value="">Add to collection…</option>
                              {myCollections.map((collection)=><option key={collection.id} value={collection.id}>{collection.name}</option>)}
                            </select>}
                          </div>)}
                        </div> : <div className="plus-empty saved-library-empty">Save a post with ☆ and it will appear here.</div>}
                      </> : <>
                        <div className="collection-detail-head">
                          <button type="button" className="pill pill-btn collection-back" onClick={() => { setActiveCollectionId(null); setCollectionEditing(false); }}><ArrowLeft size={14}/> All collections</button>
                          <div className="collection-detail-title">
                            {collectionEditing ? <div className="collection-rename-row">
                              <input className="aero-input" autoFocus maxLength={40} value={collectionRenameDraft} onChange={(e)=>setCollectionRenameDraft(e.target.value)} onKeyDown={(e)=>{if(e.key==='Enter'){e.preventDefault();void renameCollection(activeCollection.id);}if(e.key==='Escape'){setCollectionEditing(false);}}}/>
                              <button className="aero-btn" onClick={()=>void renameCollection(activeCollection.id)} disabled={!collectionRenameDraft.trim()}>Save</button>
                              <button className="pill pill-btn" onClick={()=>setCollectionEditing(false)}>Cancel</button>
                            </div> : <>
                              <div><span className="eyebrow">SAVED COLLECTION</span><h2>{activeCollection.name}</h2><p>{collectionPosts.length} {collectionPosts.length === 1 ? 'saved post' : 'saved posts'}</p></div>
                              <div className="collection-detail-actions">
                                <button className="pill pill-btn" onClick={()=>{setCollectionRenameDraft(activeCollection.name);setCollectionEditing(true);}}><Pencil size={13}/> Rename</button>
                                <button className="pill pill-btn collection-delete" onClick={()=>void deleteCollection(activeCollection.id)}><Trash2 size={13}/> Delete</button>
                              </div>
                            </>}
                          </div>
                        </div>
                        {collectionPosts.length ? <div className="saved-post-grid collection-detail-grid">
                          {collectionPosts.map((post)=><div className="saved-post-wrap collection-post-wrap" key={`collection-${activeCollection.id}-${post.id}`}>
                            {renderPost(post)}
                            <button type="button" className="pill pill-btn remove-from-collection" onClick={()=>void removePostFromCollection(post.id,activeCollection.id)}><X size={13}/> Remove from collection</button>
                          </div>)}
                        </div> : <div className="plus-empty collection-detail-empty"><Star size={22}/><strong>This collection is empty</strong><span>Go back to All saved posts and add something to {activeCollection.name}.</span></div>}
                      </>}
                    </section>;
                  })()}

                  {plusTab === 'activity' && <section className="plaza-plus-panel"><div className="plus-section-head"><div><h2>Activity & discovery</h2><p>Follow people, see what is trending and keep up with the community.</p></div><button className={`pill pill-btn ${followingOnly?'active':''}`} onClick={()=>setFollowingOnly((v)=>!v)}>{followingOnly?'Following feed':'Show following feed'}</button></div><div className="plus-stats-strip"><span><b>{followedUsers().length}</b> following</span><span><b>{levelFor(currentUser.username)}</b> level</span><span><b>{xpFor(currentUser.username)}</b> XP</span><span><b>{badgesFor(currentUser.username).length}</b> badges</span></div><div className="plus-subheading">Trending posts</div><div className="saved-post-grid">{trendingPosts().filter((p)=>!followingOnly||followedUsers().includes(p.username)).slice(0,6).map((p)=>renderPost(p))}</div><div className="plus-subheading">Recent activity</div><div className="plus-list">{(plazaPlus.activities||[]).slice(0,30).map((a)=><div key={a.id} className="plus-row static"><span className="plus-row-icon">◎</span><span><b>{a.text}</b><small>{timeAgo(a.timestamp)}</small></span></div>)}</div></section>}

                  {plusTab === 'events' && <section className="plaza-plus-panel"><div className="plus-section-head"><div><h2>Events & calendar</h2><p>Create server nights, launches, meetings or build events and RSVP.</p></div></div><div className="plus-form-grid"><input className="aero-input" placeholder="Event title" value={eventDraft.title} onChange={(e)=>setEventDraft({...eventDraft,title:e.target.value})}/><input className="aero-input" type="datetime-local" value={eventDraft.when} onChange={(e)=>setEventDraft({...eventDraft,when:e.target.value})}/><input className="aero-input" placeholder="Location / server area" value={eventDraft.location} onChange={(e)=>setEventDraft({...eventDraft,location:e.target.value})}/><textarea className="caption-area" placeholder="Description" value={eventDraft.description} onChange={(e)=>setEventDraft({...eventDraft,description:e.target.value})}/><button className="aero-btn" onClick={createEvent}>Create event</button></div><div className="event-grid">{(plazaPlus.events||[]).map((event)=><article key={event.id} className="event-card"><span className="eyebrow">{event.when?new Date(event.when).toLocaleString():'DATE TBA'}</span><h3>{event.title}</h3><p>{event.description}</p><small>{event.location||'RUMS'} · by {event.creator}</small><div className="rsvp-row"><button onClick={()=>rsvpEvent(event.id,'going')}>Going {event.rsvps?.going?.length||0}</button><button onClick={()=>rsvpEvent(event.id,'maybe')}>Maybe {event.rsvps?.maybe?.length||0}</button><button onClick={()=>rsvpEvent(event.id,'no')}>Can’t {event.rsvps?.no?.length||0}</button></div></article>)}</div></section>}

                  {plusTab === 'groups' && <section className="plaza-plus-panel"><div className="plus-section-head"><div><h2>Communities & group chats</h2><p>Create clubs for builders, transit, architecture, roleplay or anything else.</p></div></div><div className="plus-inline-form"><input className="aero-input" placeholder="Community name" value={groupDraft.name} onChange={(e)=>setGroupDraft({...groupDraft,name:e.target.value})}/><input className="aero-input" placeholder="What is it about?" value={groupDraft.description} onChange={(e)=>setGroupDraft({...groupDraft,description:e.target.value})}/><button className="aero-btn" onClick={createGroup}>Create</button></div><div className="group-grid">{(plazaPlus.groups||[]).map((group)=><article key={group.id} className="group-card"><h3>{group.name}</h3><p>{group.description}</p><small>{group.members?.length||0} members · owner {group.owner}</small><div className="plus-card-actions"><button onClick={()=>toggleGroupMembership(group.id)}>{group.members?.includes(currentUser.username)?'Leave':'Join'}</button>{group.members?.includes(currentUser.username)&&<button onClick={()=>{setActiveChat(`group:${group.id}`);setScreen('chat');}}>Open chat</button>}</div></article>)}</div></section>}

                  {plusTab === 'projects' && <section className="plaza-plus-panel"><div className="plus-section-head"><div><h2>Projects</h2><p>Explore community projects and their boards, forums and updates.</p></div></div><button className="aero-btn" onClick={() => void openProjectsDirectory()}>Open project directory</button></section>}

                  {plusTab === 'knowledge' && <section className="plaza-plus-panel"><div className="plus-section-head"><div><h2>Wiki, server map & build directory</h2><p>Document lore, locations and important builds in one searchable community knowledge base.</p></div></div><div className="knowledge-columns"><div><h3>Wiki</h3><input className="aero-input" placeholder="Page title" value={wikiDraft.title} onChange={(e)=>setWikiDraft({...wikiDraft,title:e.target.value})}/><textarea className="caption-area" placeholder="Wiki content" value={wikiDraft.body} onChange={(e)=>setWikiDraft({...wikiDraft,body:e.target.value})}/><button className="aero-btn" onClick={addWikiPage}>Add page</button>{(plazaPlus.wiki||[]).map((page)=><article className="wiki-card" key={page.id}><h4>{page.title}</h4><p>{page.body}</p><small>Updated {timeAgo(page.updatedAt)} by {page.author}</small></article>)}</div><div><h3>Build directory / schematic map</h3><input className="aero-input" placeholder="Build name" value={buildDraft.name} onChange={(e)=>setBuildDraft({...buildDraft,name:e.target.value})}/><input className="aero-input" placeholder="Location / district" value={buildDraft.location} onChange={(e)=>setBuildDraft({...buildDraft,location:e.target.value})}/><input className="aero-input" placeholder="Owner" value={buildDraft.owner} onChange={(e)=>setBuildDraft({...buildDraft,owner:e.target.value})}/><textarea className="caption-area" placeholder="Description" value={buildDraft.description} onChange={(e)=>setBuildDraft({...buildDraft,description:e.target.value})}/><button className="aero-btn" onClick={addBuildEntry}>Add build</button><div className="server-map-schematic">{(plazaPlus.builds||[]).map((build,i)=><button key={build.id} style={{left:`${12+(i*23)%74}%`,top:`${18+(i*31)%65}%`}} title={`${build.name} · ${build.location}`}>◆</button>)}<span>RUMS schematic map</span></div>{(plazaPlus.builds||[]).map((build)=><article key={build.id} className="build-row"><b>{build.name}</b><span>{build.location}</span><small>{build.owner}</small></article>)}</div></div></section>}

                  {plusTab === 'creator' && <section className="plaza-plus-panel"><div className="plus-section-head"><div><h2>Creator tools</h2><p>Drafts, scheduled posts, richer publishing and the RUMS Plaza changelog.</p></div></div><div className="creator-grid"><article><h3>Drafts</h3>{(plazaPlus.drafts?.[currentUser.username]||[]).map((draft)=><button key={draft.id} className="plus-row" onClick={()=>{setCaption(draft.caption);setTag(draft.tag);setUploadPreview(draft.image);setScreen('upload');}}><span>Draft</span><small>{draft.caption||'Image post'} · {timeAgo(draft.timestamp)}</small></button>)}{!(plazaPlus.drafts?.[currentUser.username]||[]).length&&<p>No drafts yet. Save them from Share a build.</p>}</article><article><h3>Scheduled</h3>{(plazaPlus.scheduled||[]).filter((item)=>item.username===currentUser.username).map((item)=><div className="plus-row static" key={item.id}><span>{item.caption||'Scheduled post'}</span><small>{new Date(item.when).toLocaleString()}</small></div>)}</article><article><h3>What’s new</h3>{(plazaPlus.changelog||[]).length?(plazaPlus.changelog||[]).map((item)=><div key={item.id} className="plus-row static"><span>{item.title}</span><small>{item.body}</small></div>):<p>RUMS Plaza overhaul: themes, reactions, chat, tutorials and Plaza+.</p>}</article></div></section>}

                  {plusTab === 'settings' && <section className="plaza-plus-panel"><div className="plus-section-head"><div><h2>Accessibility & personalization</h2><p>Make RUMS Plaza easier and more comfortable to use.</p></div></div><div className="settings-grid">{[['reducedMotion','Reduced motion'],['highContrast','High contrast'],['largeText','Larger text'],['reducedTransparency','Reduced transparency']].map(([key,label])=><label className="setting-toggle" key={key}><span>{label}</span><input type="checkbox" checked={!!accessibilityPrefs[key]} onChange={(e)=>updateAccessibilityPref(key,e.target.checked)}/></label>)}</div><div className="plus-subheading">Custom theme preset</div><div className="theme-builder-row"><label>Accent <input type="color" value={themeBuilder.accent} onChange={(e)=>setThemeBuilder({...themeBuilder,accent:e.target.value})}/></label><label>Roundness <input type="range" min="0" max="30" value={themeBuilder.radius} onChange={(e)=>setThemeBuilder({...themeBuilder,radius:Number(e.target.value)})}/></label><label>Blur <input type="range" min="0" max="40" value={themeBuilder.blur} onChange={(e)=>setThemeBuilder({...themeBuilder,blur:Number(e.target.value)})}/></label><button className={`pill pill-btn ${customThemeEnabled?'active':''}`} onClick={()=>setCustomThemeEnabled((v)=>!v)}>{customThemeEnabled?'Custom theme on':'Apply custom'}</button><button className="aero-btn" onClick={()=>commitPlazaPlus((data)=>({...data,themePresets:[...(data.themePresets||[]),{id:`preset-${Date.now()}`,owner:currentUser.username,...themeBuilder}]}))}>Save preset</button></div><div className="plus-subheading">Theme preset library</div><div className="preset-grid">{(plazaPlus.themePresets||[]).map((preset)=><button key={preset.id} onClick={()=>{setThemeBuilder({accent:preset.accent,radius:preset.radius,blur:preset.blur});setCustomThemeEnabled(true);}}><span style={{background:preset.accent}}/><b>{preset.owner}'s preset</b><small>Radius {preset.radius} · Blur {preset.blur}</small></button>)}{!(plazaPlus.themePresets||[]).length&&<p>No shared presets yet.</p>}</div><div className="plus-subheading">Per-page theme</div><div className="per-page-theme-row"><select className="aero-input" value={pageThemeTarget} onChange={(e)=>setPageThemeTarget(e.target.value)}><option value="feed">Feed</option><option value="chat">Chat</option><option value="news">Plaza News</option><option value="suggestions">Suggestions</option><option value="updates">Updates</option><option value="search">Discover</option><option value="profile">Profile</option>{hasLumina&&<option value="lumina">Project Lumina</option>}</select><select className="aero-input" value={plazaPlus.pageThemes?.[currentUser.username]?.[pageThemeTarget]||''} onChange={(e)=>commitPlazaPlus((data)=>({...data,pageThemes:{...data.pageThemes,[currentUser.username]:{...(data.pageThemes?.[currentUser.username]||{}),[pageThemeTarget]:e.target.value}}}))}><option value="">Use global theme</option>{RUMS_THEMES.map((t)=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div><div className="plus-subheading">Keyboard shortcuts</div><div className="shortcut-grid"><span><kbd>⌘/Ctrl K</kbd> Command palette</span><span><kbd>G</kbd> Feed</span><span><kbd>C</kbd> Chat</span><span><kbd>N</kbd> New post</span><span><kbd>/</kbd> Search</span></div><div className="push-settings"><strong>Device notifications</strong><p>Get alerts for chats, mentions, replies and other Plaza+ activity when the site is closed.</p><button className="pill pill-btn" type="button" disabled={pushBusy} onClick={pushEnabled ? disableDeviceNotifications : enableDeviceNotifications}>{pushBusy ? 'Working…' : pushEnabled ? 'Turn off on this device' : 'Enable on this device'}</button>{pushEnabled && <button className="pill pill-btn" type="button" disabled={pushBusy} onClick={testDeviceNotifications}>Send test alert</button>}{pushStatus && <small role="status">{pushStatus}</small>}</div></section>}

                  {plusTab === 'safety' && <section className="plaza-plus-panel"><div className="plus-section-head"><div><h2>Safety, roles & invites</h2><p>Report problems, manage community roles and keep an audit trail.</p></div></div><div className="plus-form-grid"><input className="aero-input" placeholder="Post, message or username" value={reportDraft.target} onChange={(e)=>setReportDraft({...reportDraft,target:e.target.value})}/><textarea className="caption-area" placeholder="What happened?" value={reportDraft.reason} onChange={(e)=>setReportDraft({...reportDraft,reason:e.target.value})}/><button className="aero-btn" onClick={submitReport}>Submit report</button></div>{canModerate&&<><div className="plus-subheading">Invite links</div><div className="invite-tools"><button className="aero-btn" onClick={createInvite}>Create invite code</button>{(plazaPlus.invites||[]).slice(0,8).map((invite)=><code key={invite.id}>rums-plaza?invite={invite.code}</code>)}</div><div className="plus-subheading">Roles</div><div className="role-grid">{users.map((user)=><label key={user.username}><span>{user.username}</span><select value={plazaPlus.roles?.[user.username]|| (user.isAdmin?'Admin':'Member')} onChange={(e)=>commitPlazaPlus((data)=>({...data,roles:{...data.roles,[user.username]:e.target.value},audit:[{id:`audit-${Date.now()}`,actor:currentUser.username,action:`Changed ${user.username} role to ${e.target.value}`,target:user.username,timestamp:Date.now()},...(data.audit||[])].slice(0,800)}))}><option>Member</option><option>Builder</option><option>Moderator</option><option>Admin</option><option>Owner</option></select></label>)}</div><div className="plus-subheading">Reports</div>{(plazaPlus.reports||[]).map((report)=><div key={report.id} className="plus-row static"><span><b>{report.target}</b> — {report.reason}</span><small>{report.reporter} · {report.status}</small></div>)}<div className="plus-subheading">Audit log</div>{(plazaPlus.audit||[]).slice(0,40).map((entry)=><div key={entry.id} className="plus-row static"><span>{entry.action}</span><small>{entry.actor} · {timeAgo(entry.timestamp)}</small></div>)}</>}</section>}
                    </main>
                  </div>
                </div>
              )}

              {screen === 'profile' && (
                <div className="profile-wrap" data-tutorial="profile-page">
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
                          <div className="profile-social-meta">
                            <span className={`profile-status-dot ${presenceLabel(u.username)==='Offline'?'offline':''}`} /> <b>{presenceLabel(u.username)}</b>
                            <span>Level {levelFor(u.username)}</span><span>{xpFor(u.username)} XP</span>
                          </div>
                          {plusProfile(u.username).bio && <p className="profile-bio">{plusProfile(u.username).bio}</p>}
                          <div className="profile-badges">{badgesFor(u.username).map((badge)=><span key={badge}>{badge}</span>)}</div>
                          {(plusProfile(u.username).profileSections || []).map((section)=><section className="profile-custom-section" key={section.id}><h4>{section.title}</h4><p>{section.body}</p></section>)}
                          <div className="profile-follow-row"><button className={`aero-btn ${isFollowing(u.username)?'active':''}`} onClick={()=>toggleFollow(u.username)}>{isFollowing(u.username)?'Following':'Follow'}</button><span>{theirPosts.length} post{theirPosts.length === 1 ? '' : 's'}</span></div>
                          {plusProfile(u.username).pinnedPostIds?.length>0&&<div className="profile-pinned"><span className="field-label">Pinned</span><div className="profile-post-grid">{theirPosts.filter((p)=>plusProfile(u.username).pinnedPostIds.includes(p.id)).map((p)=><div className="profile-grid-thumb" key={`pin-${p.id}`} onClick={()=>openPost(p.id)}><img src={p.image} alt=""/><span className="pin-marker">📌</span></div>)}</div></div>}
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
                      <div className="profile-social-meta"><span className={`profile-status-dot ${presenceLabel(currentUser.username)==='Offline'?'offline':''}`}/><b>{presenceLabel(currentUser.username)}</b><span>Level {levelFor(currentUser.username)}</span><span>{xpFor(currentUser.username)} XP</span></div>
                      <div className="profile-badges">{badgesFor(currentUser.username).map((badge)=><span key={badge}>{badge}</span>)}</div>
                      <p className="switch-line">Tap your photo to change it.</p>
                      {avatarBusy && (
                        <p className="switch-line"><Loader2 size={13} className="spin" style={{ verticalAlign: 'middle', marginRight: 4 }} /> Updating photo…</p>
                      )}
                      {profileError && <div className="error-pill" style={{ marginTop: 10 }}>{profileError}</div>}

                      <div className="profile-section profile-customize-section">
                        <div className="field-label">Profile customization</div>
                        <textarea className="caption-area" placeholder="Short bio" value={profileEdit.bio} onChange={(e)=>setProfileEdit({...profileEdit,bio:e.target.value.slice(0,220)})}/>
                        <div className="profile-customize-row"><select className="aero-input" value={profileEdit.status} onChange={(e)=>setProfileEdit({...profileEdit,status:e.target.value})}><option>Online</option><option>Away</option><option>Do Not Disturb</option><option>Offline</option></select><label className="profile-accent-input">Accent <input type="color" value={profileEdit.accent} onChange={(e)=>setProfileEdit({...profileEdit,accent:e.target.value})}/></label></div>
                        <input className="aero-input" placeholder="Banner image URL / data image (optional)" value={profileEdit.banner} onChange={(e)=>setProfileEdit({...profileEdit,banner:e.target.value})}/>
                        <button className="aero-btn" onClick={saveProfileExtras}>Save profile</button>
                        <div className="profile-section-builder"><input className="aero-input" placeholder="Custom section title" value={profileSectionDraft.title} onChange={(e)=>setProfileSectionDraft({...profileSectionDraft,title:e.target.value})}/><textarea className="caption-area" placeholder="Custom profile section" value={profileSectionDraft.body} onChange={(e)=>setProfileSectionDraft({...profileSectionDraft,body:e.target.value})}/><button className="pill pill-btn" onClick={addProfileSection}>Add profile section</button></div>
                        {(plusProfile().profileSections || []).map((section)=><section className="profile-custom-section" key={section.id}><h4>{section.title}</h4><p>{section.body}</p></section>)}
                      </div>

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

                      <div className="profile-section appearance-section" data-tutorial="appearance">
                        <div className="appearance-heading"><div><div className="field-label">Appearance</div><p>Choose a RUMS Plaza theme, then fine-tune its glass transparency on this device.</p></div><span className="appearance-current-theme">{RUMS_THEMES.find((item) => item.id === theme)?.name || 'Light'}</span></div>
                        <div className="appearance-heading glass-strength-heading"><div><div className="field-label">Glass strength</div><p>Adjust the transparency of glass controls for the selected theme.</p></div><span data-glass-value>{glassStrength}%</span></div>
                        <div className="glass-live-preview" aria-label={`Glass appearance preview at ${glassStrength} percent`}>
                          <div className="preview-sun" /><div className="preview-hill" />
                          <div className="preview-island"><span className="preview-icon"><Droplet size={16} /></span><span><b>Glass preview</b><small data-glass-description>{glassStrength < 55 ? 'Clear and light' : glassStrength < 78 ? 'Balanced glass' : 'Soft and frosted'}</small></span><span className="preview-action"><Plus size={14} /></span></div>
                        </div>
                        <div className={`glass-slider-shell ${glassDragging ? 'is-dragging' : ''}`} style={{ '--slider-position': `${(glassStrength - 35) / 60 * 100}%` }}>
                          <input className="glass-range" type="range" min="35" max="95" step="1" defaultValue={glassStrength}
                            aria-label="Glass transparency" onInput={(e) => previewGlassStrength(e.currentTarget.value, e.currentTarget)}
                            onPointerDown={() => setGlassDragging(true)} onPointerUp={(e) => { setGlassDragging(false); commitGlassStrength(e.currentTarget); }} onPointerCancel={(e) => { setGlassDragging(false); commitGlassStrength(e.currentTarget); }} onBlur={(e) => { setGlassDragging(false); commitGlassStrength(e.currentTarget); }} onKeyUp={(e) => commitGlassStrength(e.currentTarget)} />
                        </div>
                        <div className="glass-slider-labels"><span>Clear</span><span>Frosted</span></div>
                        <div className="theme-picker" role="radiogroup" aria-label="RUMS Plaza theme">
                          {['standard', 'dark'].map((id) => MAIN_THEME_OPTIONS.find((item) => item.id === id)).filter(Boolean).map((item) => (
                            <button
                              type="button"
                              role="radio"
                              aria-checked={theme === item.id}
                              key={item.id}
                              className={`theme-option theme-option-${item.id} ${theme === item.id ? 'active' : ''}`}
                              onClick={() => setTheme(item.id)}
                            >
                              <span className="theme-option-preview" aria-hidden="true">
                                {item.swatches.map((color, index) => <span key={`${item.id}-${index}`} style={{ background: color }} />)}
                              </span>
                              <span className="theme-option-copy"><strong>{item.name}</strong><small>{item.description}</small></span>
                              {theme === item.id && <Check size={15} className="theme-option-check" />}
                            </button>
                          ))}

                          <button
                            type="button"
                            className={`theme-option theme-family-option theme-family-roblox ${theme.startsWith('roblox') ? 'active' : ''}`}
                            aria-expanded={robloxThemeMenuOpen}
                            onClick={() => setRobloxThemeMenuOpen((open) => !open)}
                          >
                            <span className="theme-option-preview roblox-family-preview" aria-hidden="true"><span /><span /><span /></span>
                            <span className="theme-option-copy"><strong>Roblox</strong><small>Choose a researched Roblox era from 2008–2026</small></span>
                            <ChevronDown size={15} className={`theme-family-chevron ${robloxThemeMenuOpen ? 'open' : ''}`} />
                          </button>

                          {robloxThemeMenuOpen && (
                            <div className="roblox-theme-family-panel" role="group" aria-label="Roblox theme year">
                              <div className="roblox-theme-family-heading"><strong>Roblox eras</strong><small>Each year recreates the web design language of that period.</small></div>
                              <div className="roblox-theme-year-grid">
                                {ROBLOX_THEMES.map((item) => (
                                  <button
                                    type="button"
                                    role="radio"
                                    aria-checked={theme === item.id}
                                    key={item.id}
                                    className={`roblox-theme-year roblox-theme-year-${item.year} ${theme === item.id ? 'active' : ''}`}
                                    onClick={() => setTheme(item.id)}
                                  >
                                    <span className="roblox-year-number">{item.year}</span>
                                    <span className="roblox-year-swatch" aria-hidden="true">{item.swatches.map((color, index) => <span key={`${item.id}-year-${index}`} style={{ background: color }} />)}</span>
                                    <span className="roblox-year-copy"><strong>{item.name}</strong><small>{item.description}</small></span>
                                    {theme === item.id && <Check size={14} className="roblox-year-check" />}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}


                          <button
                            type="button"
                            className={`theme-option theme-family-option theme-family-frutiger ${FRUTIGER_THEME_IDS.includes(theme) ? 'active' : ''}`}
                            aria-expanded={frutigerThemeMenuOpen}
                            onClick={() => setFrutigerThemeMenuOpen((open) => !open)}
                          >
                            <span className="theme-option-preview frutiger-family-preview" aria-hidden="true"><span /><span /><span /></span>
                            <span className="theme-option-copy"><strong>Frutiger Family</strong><small>Aqua/Aero, Eco, Metro and Vector Flourish</small></span>
                            <ChevronDown size={15} className={`theme-family-chevron ${frutigerThemeMenuOpen ? 'open' : ''}`} />
                          </button>

                          {frutigerThemeMenuOpen && (
                            <div className="frutiger-theme-family-panel" role="group" aria-label="Frutiger Family themes">
                              <div className="frutiger-theme-family-heading"><strong>Frutiger Family</strong><small>Four related 2000s aesthetics, from glossy Aero to vector-heavy Metro.</small></div>
                              <div className="frutiger-theme-grid">
                                {FRUTIGER_THEMES.map((item) => (
                                  <button
                                    type="button"
                                    role="radio"
                                    aria-checked={theme === item.id}
                                    key={item.id}
                                    className={`frutiger-theme-item frutiger-theme-item-${item.id} ${theme === item.id ? 'active' : ''}`}
                                    onClick={() => setTheme(item.id)}
                                  >
                                    <span className="frutiger-theme-swatch" aria-hidden="true">{item.swatches.map((color, index) => <span key={`${item.id}-family-${index}`} style={{ background: color }} />)}</span>
                                    <span className="frutiger-theme-copy"><strong>{item.name}</strong><small>{item.description}</small></span>
                                    {theme === item.id && <Check size={14} className="frutiger-theme-check" />}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          <button
                            type="button"
                            className={`theme-option theme-family-option theme-family-punk ${PUNK_THEME_IDS.includes(theme) ? 'active' : ''}`}
                            aria-expanded={punkThemeMenuOpen}
                            onClick={() => setPunkThemeMenuOpen((open) => !open)}
                          >
                            <span className="theme-option-preview punk-family-preview" aria-hidden="true"><span /><span /><span /></span>
                            <span className="theme-option-copy"><strong>Punk Family</strong><small>Solarpunk and Cyberpunk</small></span>
                            <ChevronDown size={15} className={`theme-family-chevron ${punkThemeMenuOpen ? 'open' : ''}`} />
                          </button>

                          {punkThemeMenuOpen && (
                            <div className="punk-theme-family-panel" role="group" aria-label="Punk Family themes">
                              <div className="punk-theme-family-heading"><strong>Punk Family</strong><small>Two opposing futures: ecological optimism and neon high-tech dystopia.</small></div>
                              <div className="punk-theme-grid">
                                {PUNK_THEMES.map((item) => (
                                  <button
                                    type="button"
                                    role="radio"
                                    aria-checked={theme === item.id}
                                    key={item.id}
                                    className={`punk-theme-item punk-theme-item-${item.id} ${theme === item.id ? 'active' : ''}`}
                                    onClick={() => setTheme(item.id)}
                                  >
                                    <span className="punk-theme-swatch" aria-hidden="true">{item.swatches.map((color, index) => <span key={`${item.id}-punk-${index}`} style={{ background: color }} />)}</span>
                                    <span className="punk-theme-copy"><strong>{item.name}</strong><small>{item.description}</small></span>
                                    {theme === item.id && <Check size={14} className="punk-theme-check" />}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {MAIN_THEME_OPTIONS.filter((item) => !['standard', 'dark'].includes(item.id)).map((item) => (
                            <button
                              type="button"
                              role="radio"
                              aria-checked={theme === item.id}
                              key={item.id}
                              className={`theme-option theme-option-${item.id} ${theme === item.id ? 'active' : ''}`}
                              onClick={() => setTheme(item.id)}
                            >
                              <span className="theme-option-preview" aria-hidden="true">
                                {item.swatches.map((color, index) => <span key={`${item.id}-${index}`} style={{ background: color }} />)}
                              </span>
                              <span className="theme-option-copy"><strong>{item.name}</strong><small>{item.description}</small></span>
                              {theme === item.id && <Check size={15} className="theme-option-check" />}
                            </button>
                          ))}
                        </div>
                        <div className="tutorial-replay-row">
                          <div><strong>Need a refresher?</strong><small>Replay the guided RUMS Plaza tour anytime.</small></div>
                          <button type="button" className="tutorial-replay-button" onClick={startTutorial}><Sparkles size={14} /> Replay tutorial</button>
                        </div>
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
                  {currentUser.isAdmin && <section className="site-editor announcement-editor">
                    <div className="admin-section-title"><Megaphone size={16} /> Site-wide announcement</div>
                    <p className="editor-intro">Publish a banner across RUMS Plaza. Everyone with the site open will see it within a few seconds.</p>
                    <textarea className="caption-area" value={announcementDraft} maxLength={500} onChange={(event) => setAnnouncementDraft(event.target.value)} placeholder="Write an announcement for everyone…" />
                    <div className="announcement-editor-actions">
                      <button className="aero-btn" type="button" onClick={() => void publishAnnouncement()} disabled={announcementBusy || !announcementDraft.trim()}>{announcementBusy ? 'Saving…' : 'Publish announcement'}</button>
                      {siteAnnouncement && <button className="pill pill-btn" type="button" onClick={() => void clearAnnouncement()} disabled={announcementBusy}>Clear current announcement</button>}
                    </div>
                    {siteAnnouncement && <p className="announcement-editor-current"><b>Current:</b> {siteAnnouncement.text}</p>}
                  </section>}
                  <section className="site-editor">
                    <div className="admin-section-title"><Pencil size={16} /> Site settings <span>{siteConfigStatus}</span></div>
                    <p className="editor-intro">Changes publish to everyone. Jamie is always treated as the owner.</p>
                    <div className="editor-grid">
                      <label>Plaza name<input value={siteConfig.brandName} onChange={(e) => setSiteConfig((cfg) => ({ ...cfg, brandName: e.target.value }))} onBlur={() => saveSiteConfig(siteConfig)} /></label>
                      <label>Tagline<input value={siteConfig.brandTagline} onChange={(e) => setSiteConfig((cfg) => ({ ...cfg, brandTagline: e.target.value }))} onBlur={() => saveSiteConfig(siteConfig)} /></label>
                      <label>Feed headline<input value={siteConfig.heroTitle} onChange={(e) => setSiteConfig((cfg) => ({ ...cfg, heroTitle: e.target.value }))} onBlur={() => saveSiteConfig(siteConfig)} /></label>
                      <label>Accent colour<input type="color" value={siteConfig.accent} onChange={(e) => updateSiteConfig({ accent: e.target.value })} /></label>
                      <label className="editor-wide">Feed description<textarea value={siteConfig.heroText} onChange={(e) => setSiteConfig((cfg) => ({ ...cfg, heroText: e.target.value }))} onBlur={() => saveSiteConfig(siteConfig)} /></label>
                    </div>
                    <div className="editor-toggles">
                      {[['animations','Animations'],['showDiscover','Discover'],...(hasLumina ? [['showLumina','Project Lumina']] : []),['showUpdates','Updates'],['showSuggestions','Suggestions']].map(([key,label]) => <button key={key} className={siteConfig[key] ? 'enabled' : ''} onClick={() => updateSiteConfig({ [key]: !siteConfig[key] })}><Check size={14} /> {label}</button>)}
                    </div>
                    <div className="editor-subsection"><h3>Custom navigation tabs</h3><div className="editor-add-row"><input value={tabDraft} onChange={(e) => setTabDraft(e.target.value)} placeholder="New tab name" /><button onClick={addCustomTab}><Plus size={15} /> Add tab</button></div>{siteConfig.customTabs.map((tab) => <div className="editor-item" key={tab.id}><span>{tab.label}</span><button onClick={() => removeCustomTab(tab.id)}><Trash2 size={14} /></button></div>)}</div>
                  </section>

                  <section className="site-editor custom-emoji-admin">
                    <div className="admin-section-title"><ImagePlus size={16} /> Custom emojis <span>{customEmojiStatus}</span></div>
                    <p className="editor-intro">Custom emojis are shared across RUMS 4, Creative and Projects and appear in the same reaction picker as the native emoji library.</p>
                    <div className="custom-emoji-create">
                      <div className={`custom-emoji-preview ${customEmojiDraft.image ? 'has-image' : ''}`}>
                        {customEmojiDraft.image ? <img src={customEmojiDraft.image} alt="Custom emoji preview" /> : <span>+</span>}
                      </div>
                      <label className="custom-emoji-name">
                        Emoji name
                        <div className="custom-emoji-name-input"><span>:</span><input value={customEmojiDraft.name} maxLength={28} placeholder="metro" onChange={(e) => setCustomEmojiDraft((draft) => ({ ...draft, name: e.target.value }))} /><span>:</span></div>
                      </label>
                      <label className="custom-emoji-upload">
                        <ImagePlus size={15} /> {customEmojiDraft.image ? 'Replace image' : 'Choose image'}
                        <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleCustomEmojiFile} disabled={customEmojiBusy} />
                      </label>
                      <button className="aero-btn custom-emoji-add" type="button" onClick={addCustomEmoji} disabled={customEmojiBusy || !customEmojiDraft.name.trim() || !customEmojiDraft.image}>
                        {customEmojiBusy ? <Loader2 size={14} className="spin" /> : <Plus size={14} />} Add emoji
                      </button>
                    </div>
                    {customEmojis.length > 0 ? (
                      <div className="custom-emoji-library">
                        {customEmojis.map((emoji) => (
                          <div className="custom-emoji-admin-item" key={emoji.id}>
                            <img src={emoji.image} alt={`:${emoji.name}:`} />
                            <span>:{emoji.name}:</span>
                            <button type="button" className="row-del-btn" onClick={() => removeCustomEmoji(emoji.id)} title={`Delete :${emoji.name}:`}><Trash2 size={13} /></button>
                          </div>
                        ))}
                      </div>
                    ) : <p className="custom-emoji-empty">No custom emojis yet.</p>}
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
                <div className="search-wrap" data-tutorial="discover-page">
                  <div className="search-bar">
                    <Search size={16} color="#7ba3ac" />
                    <input
                      autoFocus
                      placeholder="Search users, captions or #hashtags…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button className="icon-btn" onClick={() => setSearchQuery('')}><X size={15} /></button>
                    )}
                  </div>
                  <div className="search-filter-row">
                    <select className="aero-input" value={searchFilters.tag} onChange={(e)=>setSearchFilters({...searchFilters,tag:e.target.value})}><option value="all">All locations</option><option value="General">General</option>{hasLumina&&<option value="Lumina">Lumina</option>}</select>
                    <input className="aero-input" placeholder="Author" value={searchFilters.author} onChange={(e)=>setSearchFilters({...searchFilters,author:e.target.value})}/>
                    <input className="aero-input" type="date" value={searchFilters.from} onChange={(e)=>setSearchFilters({...searchFilters,from:e.target.value})}/>
                    <input className="aero-input" type="date" value={searchFilters.to} onChange={(e)=>setSearchFilters({...searchFilters,to:e.target.value})}/>
                    <button className="pill pill-btn" onClick={()=>setSearchFilters({type:'all',tag:'all',author:'',from:'',to:''})}>Reset</button>
                  </div>

                  {!q && !searchFilters.author && searchFilters.tag==='all' && !searchFilters.from && !searchFilters.to && <p className="switch-line" style={{ padding: '0 4px' }}>{isProjectSpace ? `Search covers posts in ${activeProject?.name || 'this project'}. Tap a result to jump to it.` : isRums5 ? 'Search covers all Creative posts. Tap a result to jump to it.' : 'Search covers all RUMS 4 posts, including Lumina. Tap a result to jump to it.'}</p>}

                  {(q || searchFilters.author || searchFilters.tag !== 'all' || searchFilters.from || searchFilters.to) && (
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
              <button data-tutorial-nav="feed" className={`nav-btn ${screen === 'feed' ? 'active' : ''}`} onClick={() => setScreen('feed')}>
                <span className="nav-icon-wrap">
                  {navIconWithNew(<Home size={19} />, 'feed')}
                </span>
                <span className="nav-label">Feed</span>
              </button>
              <button data-tutorial-nav="chat" className={`nav-btn ${screen === 'chat' ? 'active' : ''}`} onClick={() => { setError(''); setScreen('chat'); }}>
                <span className="nav-icon-wrap">{chatNavIcon(19)}</span><span className="nav-label">Chat</span>
              </button>
              <button data-tutorial-nav="upload" className="nav-upload" onClick={() => openPostComposer()}>
                {navIconWithNew(<Plus size={24} />, 'upload')}
              </button>
              <button data-tutorial-nav="plazaPlus" className={`nav-btn ${screen === 'plazaPlus' ? 'active' : ''}`} onClick={() => { setScreen('plazaPlus'); setPlusTab('notifications'); }} aria-label="Plaza+ and notifications">
                <span className="nav-icon-wrap"><span className="page-nav-icon"><Sparkles size={19} />{notificationsForCurrentUser().length > 0 && <span className="page-new-indicator page-new-count" aria-label={`${notificationsForCurrentUser().length} notifications`}>{notificationsForCurrentUser().length > 99 ? '99+' : notificationsForCurrentUser().length}</span>}</span></span><span className="nav-label">Plaza+</span>
              </button>
              <button data-tutorial-nav="news" className={`nav-btn ${screen === 'news' ? 'active' : ''}`} onClick={() => { setError(''); setScreen('news'); }}>
                <span className="nav-icon-wrap">{navIconWithNew(<Newspaper size={19} />, 'news')}</span><span className="nav-label">News</span>
              </button>
            </div>
          </>
        )}

        {commandOpen && <div className="command-palette-layer" onMouseDown={(e)=>{if(e.target===e.currentTarget)setCommandOpen(false);}}><section className="command-palette" role="dialog" aria-modal="true" aria-label="Command palette"><div className="command-search"><Search size={17}/><input autoFocus value={commandQuery} onChange={(e)=>setCommandQuery(e.target.value)} placeholder="Jump anywhere or run a command…"/><button onClick={()=>setCommandOpen(false)}><X size={15}/></button></div><div className="command-list">{[
          ['Community feed',()=>setScreen('feed')],['Chat',()=>setScreen('chat')],['Share a build',()=>openPostComposer()],['Discover',()=>setScreen('search')],['Plaza News',()=>setScreen('news')],['Suggestions',()=>setScreen('suggestions')],['Server updates',()=>setScreen('updates')],['Profile',()=>{setViewedProfile(null);setScreen('profile');}],['Notifications & Plaza+',()=>{setScreen('plazaPlus');setPlusTab('notifications');}],['Saved posts',()=>{setScreen('plazaPlus');setPlusTab('saved');}],['Events',()=>{setScreen('plazaPlus');setPlusTab('events');}],['Groups',()=>{setScreen('plazaPlus');setPlusTab('groups');}],['Projects',()=>{void openProjectsDirectory();}],['Wiki & builds',()=>{setScreen('plazaPlus');setPlusTab('knowledge');}],['Accessibility',()=>{setScreen('plazaPlus');setPlusTab('settings');}],...(hasLumina?[['Project Lumina',openLumina]]:[])
        ].filter(([label])=>label.toLowerCase().includes(commandQuery.trim().toLowerCase())).map(([label,action])=><button key={label} onClick={()=>{action();setCommandOpen(false);setCommandQuery('');}}><span>{label}</span><small>Open</small></button>)}</div></section></div>}

        {tutorialActive && tutorialCurrent && (
          <div className="tutorial-layer" aria-live="polite">
            <div className="tutorial-blocker" />
            {tutorialRect && tutorialCurrent.target && (
              <div
                className={`tutorial-spotlight ${tutorialCurrent.interaction ? 'tutorial-spotlight-interactive' : ''}`}
                style={{
                  top: Math.max(6, tutorialRect.top - 7),
                  left: Math.max(6, tutorialRect.left - 7),
                  width: Math.max(24, Math.min(window.innerWidth - 12, tutorialRect.width + 14)),
                  height: Math.max(24, Math.min(window.innerHeight - 12, tutorialRect.height + 14)),
                }}
              />
            )}
            <section
              className={`tutorial-card ${tutorialCardPosition.className} ${tutorialCurrent.interaction ? 'tutorial-card-task' : ''} ${tutorialActionPulse ? 'tutorial-card-pulse' : ''}`}
              style={tutorialCardPosition.style}
              role="dialog"
              aria-modal="true"
              aria-label="RUMS Plaza tutorial"
              key={`${tutorialCurrent.id}-${tutorialActionPulse}`}
            >
              <div className="tutorial-card-topline">
                <span className="tutorial-step-count">{Math.min(tutorialStep + 1, tutorialSteps.length)} / {tutorialSteps.length}</span>
                <button type="button" className="tutorial-skip" onClick={() => { void completeTutorial(); }}>Skip tutorial</button>
              </div>
              <div className="tutorial-progress"><span style={{ width: `${tutorialProgress}%` }} /></div>
              <div className="tutorial-icon"><Sparkles size={19} /></div>
              <h2>{tutorialCurrent.title}</h2>
              <p>{tutorialCurrent.body}</p>
              {tutorialCurrent.interaction && <div className="tutorial-task"><span className="tutorial-task-dot" /><strong>{tutorialCurrent.interaction.label}</strong></div>}
              <div className="tutorial-actions">
                <button type="button" className="tutorial-back" onClick={() => moveTutorial(-1)} disabled={tutorialStep === 0}><ArrowLeft size={15} /> Back</button>
                {tutorialCurrent.interaction ? (
                  <span className="tutorial-waiting">Waiting for you…</span>
                ) : (
                  <button type="button" className="tutorial-next" onClick={() => {
                    if (tutorialStep >= tutorialSteps.length - 1) void completeTutorial();
                    else moveTutorial(1);
                  }}>
                    {tutorialStep >= tutorialSteps.length - 1 ? <><Check size={15} /> Finish</> : <>Next <span>→</span></>}
                  </button>
                )}
              </div>
            </section>
          </div>
        )}

        {actionToast && (
          <div className={`plaza-action-toast plaza-action-toast-${actionToast.kind}`} key={actionToast.id} role="status" aria-live="polite">
            <span className="plaza-action-toast-icon">{actionToast.kind === 'like' ? <Heart size={16} fill="currentColor" /> : <Star size={16} fill="currentColor" />}</span>
            <span>{actionToast.message}</span>
            <Check size={14} className="plaza-action-toast-check" />
          </div>
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
