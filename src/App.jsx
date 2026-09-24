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
const PLATFORM_NAME = 'RUMS Plaza';
const RUMS_SPACES = {
  rums4: { id: 'rums4', label: 'RUMS 4', subtitle: 'The current archive', description: 'Everything from the current site, including Project Lumina and all older posts.' },
  rums5: { id: 'rums5', label: 'RUMS 5', subtitle: 'The new era', description: 'The same RUMS experience with a fresh feed and no Project Lumina.' },
};
function storageKeysForSpace(space) {
  if (space === 'rums5') return { posts: RUMS5_POSTS_KEY, suggestions: RUMS5_SUGGESTIONS_KEY, updates: RUMS5_UPDATES_KEY, siteConfig: RUMS5_SITE_CONFIG_KEY };
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
  body: 'A fresh new look, smoother interactions and loads of new features — while keeping the glossy, modern RUMS aesthetic. Explore RUMS 4 and RUMS 5, emoji reactions, custom emojis, the visual editor and more.',
  image: '',
  actionLabel: '',
  actionUrl: '',
  color: '#eaf4ff',
  animation: 'none',
};

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
const CUSTOM_EMOJIS_KEY = 'rums-custom-emojis';
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
  useEffect(() => { document.title = PLATFORM_NAME; }, []);
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
  const [glassDragging, setGlassDragging] = useState(false);
  const [luminaView, setLuminaView] = useState('overview');
  const [activeLuminaStation, setActiveLuminaStation] = useState(1);
  const fileInputRef = useRef(null);
  const commentInputRefs = useRef({});
  const avatarInputRef = useRef(null);
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
  const [rumsVersionDragging, setRumsVersionDragging] = useState(false);
  const activeStorageKeys = storageKeysForSpace(rumsSpace || 'rums4');
  const isRums5 = rumsSpace === 'rums5';
  const activeSpace = rumsSpace ? RUMS_SPACES[rumsSpace] : null;

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

  useEffect(() => {
    siteConfigRef.current = siteConfig;
  }, [siteConfig]);

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
    return rect && clientX >= rect.left + rect.width / 2 ? 'rums5' : 'rums4';
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
    const rect = e.currentTarget.getBoundingClientRect();
    rumsVersionDragRef.current = { pointerId: e.pointerId, x: e.clientX, y: e.clientY, moved: false, rect, frame: 0, pendingX: e.clientX, target: rumsSpace };
    e.currentTarget.setPointerCapture?.(e.pointerId);
    e.currentTarget.style.setProperty('--version-drag-direction', rumsSpace === 'rums5' ? '-1' : '1');
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
      const [p, u, sg, up, cfg, emojiRec] = await Promise.all([
        safeGet(activeStorageKeys.posts, true),
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
          freshConfig = isRums5 ? sanitizeConfigForRums5(migrated.config) : migrated.config;
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
        if (loadedConfig.brandName === 'RUMS') loadedConfig.brandName = PLATFORM_NAME;
      } else if (space === 'rums5') {
        loadedConfig = sanitizeConfigForRums5(siteConfigRef.current);
        // Never hold the version switch hostage to a Firestore write.
        void window.storage.set(keys.siteConfig, JSON.stringify(loadedConfig), true).catch((e) => console.error(e));
      } else {
        loadedConfig = DEFAULT_SITE_CONFIG;
      }
      const migratedConfig = migratePlazaOverhaulAnnouncement(loadedConfig);
      loadedConfig = migratedConfig.config;
      if (space === 'rums5') loadedConfig = sanitizeConfigForRums5(loadedConfig);
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
        if (loadedConfig.brandName === 'RUMS') loadedConfig.brandName = PLATFORM_NAME;
      } else if (space === 'rums5') {
        const rums4ConfigRecord = await safeGet(SITE_CONFIG_KEY, true);
        const rums4Config = rums4ConfigRecord ? { ...DEFAULT_SITE_CONFIG, ...JSON.parse(rums4ConfigRecord.value) } : DEFAULT_SITE_CONFIG;
        if (rums4Config.brandName === 'RUMS') rums4Config.brandName = PLATFORM_NAME;
        loadedConfig = sanitizeConfigForRums5(rums4Config);
        try { await window.storage.set(keys.siteConfig, JSON.stringify(loadedConfig), true); } catch { /* first-load clone can retry later */ }
      } else {
        loadedConfig = DEFAULT_SITE_CONFIG;
      }
      const migratedConfig = migratePlazaOverhaulAnnouncement(loadedConfig);
      loadedConfig = migratedConfig.config;
      if (space === 'rums5') loadedConfig = sanitizeConfigForRums5(loadedConfig);
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
      reactions: {},
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
    return Boolean(post) && (post.tag !== 'Lumina' || reactionContext === 'luminaFeed');
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
  }

  async function toggleSuggestionReaction(suggestionId, emoji) {
    if (!currentUser || !reactionIsAvailable(emoji)) return;
    const next = suggestions.map((s) => s.id === suggestionId
      ? { ...s, reactions: cleanedReactions(s.reactions, emoji, currentUser.username) }
      : s
    );
    await saveSuggestions(next);
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
    const text = `${post.username} shared a photo${post.tag === 'Lumina' ? ' from Lumina' : ''} on ${PLATFORM_NAME}${post.caption ? `: "${post.caption}"` : ''}`;
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
        await navigator.share(file ? { title: PLATFORM_NAME, text, files: [file] } : { title: PLATFORM_NAME, text });
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
        safeGet(keys.posts, true),
        safeGet(keys.suggestions, true),
      ]);
      const spacePosts = postRecord ? JSON.parse(postRecord.value) : [];
      const spaceSuggestions = suggestionRecord ? JSON.parse(suggestionRecord.value) : [];
      const cleanedPosts = spacePosts.map((post) => ({ ...post, reactions: strip(post.reactions) }));
      const cleanedSuggestions = spaceSuggestions.map((suggestion) => ({ ...suggestion, reactions: strip(suggestion.reactions) }));
      await Promise.all([
        window.storage.set(keys.posts, JSON.stringify(cleanedPosts), true),
        window.storage.set(keys.suggestions, JSON.stringify(cleanedSuggestions), true),
      ]);
      if (space === rumsSpace) {
        setPosts(cleanedPosts);
        setSuggestions(cleanedSuggestions);
      }
    }));
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
      reactions: {},
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
    return <section data-feed-box="posts" data-edit-box-id="feed:posts" className={`editable-built-in-box ${selectedBoxId === 'feed:posts' ? 'is-editor-selected' : ''}`} key="posts" onPointerDownCapture={() => { if (editMode && isOwner) setSelectedBoxId('feed:posts'); }}>{feedBoxHandle('posts')}<div className="section-heading"><h2>Recent posts</h2><span>{visiblePosts.length} {visiblePosts.length === 1 ? 'post' : 'posts'}</span></div>{feedFilter === 'lumina' && <div className="lumina-banner clickable-row" onClick={openLumina}><div className="droplet-badge lumina-page-badge"><Droplet size={18} color="white" />{sessionNewCountOnPage('lumina') > 0 && <span className="page-new-indicator page-new-count" title={`${sessionNewCountOnPage('lumina')} new in Project Lumina`}>{sessionNewCountOnPage('lumina') > 99 ? '99+' : sessionNewCountOnPage('lumina')}</span>}</div><div><h4>Lumina</h4><p>Screenshots from the city district, in one place.</p></div><span className="lumina-banner-arrow">About the city →</span></div>}{visiblePosts.length === 0 ? <div className="feed-empty"><div className="r-badge">R</div><h3>{feedFilter === 'lumina' ? 'No Lumina posts yet' : 'No posts yet'}</h3><p>{feedFilter === 'lumina' ? 'Be the first to share a view of Lumina.' : 'Be the first to share something from RUMS.'}</p></div> : visiblePosts.map((post) => renderPost(post, { reactionContext: feedFilter === 'lumina' ? 'luminaFeed' : 'default', newPageKey: 'feed' }))}</section>;
  }

  function renderFeedTabs() {
    if (isRums5) return null;
    return (
      <div ref={tabsRef} className={`feed-tabs ${tabsDragging ? 'is-dragging' : ''}`}
        style={{ '--seg-translate': feedFilter === 'lumina' ? '100%' : '0%' }}
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
    const visualVersion = spaceSwitchBusy || rumsSpace;
    return (
      <div
        ref={rumsVersionSwitchRef}
        className={`universal-rums-switcher ${rumsVersionDragging ? 'is-dragging' : ''}`}
        role="group"
        aria-label="Switch between RUMS 4 and RUMS 5"
        style={{ '--version-seg-translate': visualVersion === 'rums5' ? '100%' : '0%' }}
        onPointerDown={handleRumsVersionPointerDown}
        onPointerMove={handleRumsVersionPointerMove}
        onPointerUp={handleRumsVersionPointerEnd}
        onPointerCancel={handleRumsVersionPointerEnd}
        onClickCapture={(e) => {
          if (rumsVersionSuppressClickRef.current) {
            rumsVersionSuppressClickRef.current = false;
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        <button
          type="button"
          className={visualVersion === 'rums4' ? 'active' : ''}
          aria-pressed={rumsSpace === 'rums4'}
          onClick={() => { if (rumsSpace !== 'rums4' && !spaceSwitchBusy) void switchRumsSpace('rums4'); }}
          disabled={Boolean(spaceSwitchBusy)}
          title="Open RUMS 4"
        >
          <span>RUMS</span><strong>{spaceSwitchBusy === 'rums4' ? <Loader2 size={12} className="spin" /> : '4'}</strong>
        </button>
        <button
          type="button"
          className={visualVersion === 'rums5' ? 'active' : ''}
          aria-pressed={rumsSpace === 'rums5'}
          onClick={() => { if (rumsSpace !== 'rums5' && !spaceSwitchBusy) void switchRumsSpace('rums5'); }}
          disabled={Boolean(spaceSwitchBusy)}
          title="Open RUMS 5"
        >
          <span>RUMS</span><strong>{spaceSwitchBusy === 'rums5' ? <Loader2 size={12} className="spin" /> : '5'}</strong>
        </button>
        <span className="drag-refraction version-drag-refraction" aria-hidden="true">
          <span className="drag-refraction-content">
            <span className={visualVersion === 'rums4' ? 'active' : ''}><span>RUMS</span><strong>4</strong></span>
            <span className={visualVersion === 'rums5' ? 'active' : ''}><span>RUMS</span><strong>5</strong></span>
          </span>
        </span>
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
  function renderPost(post, { reactionContext = 'default', newPageKey = null } = {}) {
    const liked = post.likes.includes(currentUser.username);
    const showComments = !!openComments[post.id];
    return (
      <div className="post-card" data-edit-box-id={`post:${post.id}`} data-session-new-key={newPageKey ? sessionNewKey(newPageKey, 'post', post.id) : undefined} key={post.id}>
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
          {renderReactionAddButton(post, 'post', '', reactionContext)}
        </div>
        {renderReactionBar(post, 'post', reactionContext)}
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
            <span className="space-chooser-kicker">RUMS PLAZA</span>
            <h1 id="rums-space-title">Welcome to RUMS Plaza</h1>
            <p className="space-chooser-intro">Choose which RUMS era you want to enter. Your Plaza account works in both.</p>
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

        {screen !== 'spaceSelect' && screen !== 'loading' && screen !== 'login' && screen !== 'signup' && currentUser && (
          <>
            <aside className="desktop-rail">
              <div className="rail-brand"><span className="rail-orb">{siteConfig.brandName.slice(0,1).toUpperCase()}</span><span>{siteConfig.brandName}<small>{siteConfig.brandTagline}</small></span></div>
              <div className="rail-label">EXPLORE</div>
              <button className={`rail-link ${screen === 'feed' ? 'selected' : ''}`} onClick={() => { setScreen('feed'); setFeedFilter('all'); }}>{navIconWithNew(<Home size={19} />, 'feed')} Community feed</button>
              {siteConfig.showDiscover && <button className={`rail-link ${screen === 'search' ? 'selected' : ''}`} onClick={() => setScreen('search')}>{navIconWithNew(<Search size={19} />, 'search')} Discover</button>}
              {!isRums5 && siteConfig.showLumina && <button className={`rail-link ${screen === 'lumina' ? 'selected' : ''}`} onClick={openLumina}>{navIconWithNew(<Droplet size={19} />, 'lumina')} Project Lumina</button>}
              <div className="rail-label">COMMUNITY</div>
              {siteConfig.showUpdates && <button className={`rail-link ${screen === 'updates' ? 'selected' : ''}`} onClick={() => setScreen('updates')}>{navIconWithNew(<Megaphone size={19} />, 'updates')} Server updates</button>}
              {siteConfig.showSuggestions && <button className={`rail-link ${screen === 'suggestions' ? 'selected' : ''}`} onClick={() => setScreen('suggestions')}>{navIconWithNew(<Lightbulb size={19} />, 'suggestions')} Suggestions</button>}
              {siteConfig.customTabs.map((tab) => <button key={tab.id} className={`rail-link ${screen === 'custom' && customPageId === tab.id ? 'selected' : ''}`} onClick={() => { setCustomPageId(tab.id); setScreen('custom'); }}>{navIconWithNew(<Pencil size={19} />, `custom:${tab.id}`)} {tab.label}</button>)}
              {canEditSite && <button className={`rail-link ${screen === 'admin' ? 'selected' : ''}`} onClick={() => setScreen('admin')}><Shield size={19} /> Admin space</button>}
              {isOwner && <button className={`rail-link edit-mode-toggle ${editMode ? 'selected' : ''}`} onClick={() => setEditMode(true)}>{editMode ? <Check size={19} /> : <Eye size={19} />} {editMode ? 'Editing website' : 'Edit website'}</button>}
              <button className="rail-create" onClick={() => setScreen('upload')}>{navIconWithNew(<Plus size={19} />, 'upload')} Share a build</button>
              <div className="rail-footer"><span className="status-light" /> A world built together <small>RUMS Plaza · Minecraft community</small></div>
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
                  {navIconWithNew(<Search size={18} />, 'search')}
                </button>}
                <button className="pill pill-btn profile-pill-with-new" onClick={openOwnProfile} title="Your profile">
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

            <div className="content">
              {siteConfig.customTabs.length > 0 && <div className="custom-mobile-tabs">{siteConfig.customTabs.map((tab) => <button key={tab.id} className={screen === 'custom' && customPageId === tab.id ? 'active' : ''} onClick={() => { setCustomPageId(tab.id); setScreen('custom'); }}>{tab.label}{sessionNewCountOnPage(`custom:${tab.id}`) > 0 && <span className="custom-tab-new">{sessionNewCountOnPage(`custom:${tab.id}`) > 99 ? '99+' : sessionNewCountOnPage(`custom:${tab.id}`)}</span>}</button>)}</div>}
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
                    {luminaPosts.length ? <div className="lumina-gallery">{luminaPosts.slice(0, 8).map((p) => <button key={p.id} data-session-new-key={sessionNewKey('lumina', 'post', p.id)} onClick={() => openPost(p.id)} aria-label={`Open post by ${p.username}`}>{newContentLabel('lumina', 'post', p.id)}<img src={p.image} alt="" /><span>{p.username}</span>{p.caption && <small>{p.caption}</small>}</button>)}</div> : <div className="lumina-gallery-empty"><Droplet size={22} /><p>No Lumina views have been shared yet.</p><button onClick={() => { setTag('Lumina'); setScreen('upload'); }}>Share the first</button></div>}
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
                            <Heart size={14} fill={voted ? '#e0546b' : 'none'} />
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

              {screen === 'updates' && (
                <div className="updates-page">
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
                        <div className="appearance-heading"><div><div className="field-label">Appearance</div><p>Adjust the transparency of the glass controls on this device.</p></div><span data-glass-value>{glassStrength}%</span></div>
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
                      <label>Plaza name<input value={siteConfig.brandName} onChange={(e) => setSiteConfig((cfg) => ({ ...cfg, brandName: e.target.value }))} onBlur={() => saveSiteConfig(siteConfig)} /></label>
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

                  <section className="site-editor custom-emoji-admin">
                    <div className="admin-section-title"><ImagePlus size={16} /> Custom emojis <span>{customEmojiStatus}</span></div>
                    <p className="editor-intro">Custom emojis are shared across RUMS 4 and RUMS 5 and appear in the same reaction picker as the native emoji library.</p>
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
                  {navIconWithNew(<Home size={19} />, 'feed')}
                </span>
                <span className="nav-label">Feed</span>
              </button>
              {siteConfig.showSuggestions && <button className={`nav-btn ${screen === 'suggestions' ? 'active' : ''}`} onClick={() => { setError(''); setScreen('suggestions'); }}>
                <span className="nav-icon-wrap">{navIconWithNew(<Lightbulb size={19} />, 'suggestions')}</span><span className="nav-label">Ideas</span>
              </button>}
              <button className="nav-upload" onClick={() => { setError(''); setScreen('upload'); }}>
                {navIconWithNew(<Plus size={24} />, 'upload')}
              </button>
              {siteConfig.showUpdates && <button className={`nav-btn ${screen === 'updates' ? 'active' : ''}`} onClick={() => { setError(''); setScreen('updates'); }}>
                <span className="nav-icon-wrap">{navIconWithNew(<Megaphone size={19} />, 'updates')}</span><span className="nav-label">Updates</span>
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
