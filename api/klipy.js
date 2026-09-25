const KLIPY_BASE = 'https://api.klipy.com/v2';

function getKey() {
  return process.env.KLIPY_APP_KEY || '';
}

function safeText(value, max = 120) {
  return String(value || '').slice(0, max);
}

function simplify(item) {
  const formats = item?.media_formats || {};
  const full = formats.gif || formats.mediumgif || formats.tinygif || formats.nanogif;
  const preview = formats.tinygif || formats.mediumgif || formats.gif || formats.nanogif;
  if (!full?.url) return null;
  return {
    id: safeText(item.id, 80),
    title: safeText(item.content_description || item.title || 'KLIPY GIF', 180),
    url: full.url,
    preview: preview?.url || full.url,
    dims: Array.isArray(full.dims) ? full.dims.slice(0, 2) : [],
    itemUrl: safeText(item.itemurl || item.url, 500),
  };
}

export default async function handler(req, res) {
  const key = getKey();
  if (!key) {
    return res.status(503).json({ error: 'KLIPY is not configured yet. Add KLIPY_APP_KEY in Vercel Environment Variables.' });
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    if (body.action !== 'share' || !body.id) return res.status(400).json({ error: 'Invalid request.' });
    try {
      const url = new URL(`${KLIPY_BASE}/registershare`);
      url.searchParams.set('key', key);
      url.searchParams.set('id', safeText(body.id, 100));
      const response = await fetch(url, { headers: { Accept: 'application/json' } });
      return res.status(response.ok ? 200 : response.status).json({ ok: response.ok });
    } catch {
      return res.status(200).json({ ok: false });
    }
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const q = safeText(req.query?.q, 100).trim();
    const pos = safeText(req.query?.pos, 200).trim();
    const limit = Math.max(8, Math.min(50, Number(req.query?.limit) || 32));
    const endpoint = q ? 'search' : 'featured';
    const url = new URL(`${KLIPY_BASE}/${endpoint}`);
    url.searchParams.set('key', key);
    if (q) url.searchParams.set('q', q);
    if (pos) url.searchParams.set('pos', pos);
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('country', 'NL');
    url.searchParams.set('locale', 'nl_NL');
    url.searchParams.set('contentfilter', 'high');
    url.searchParams.set('media_filter', 'gif,mediumgif,tinygif');

    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) return res.status(response.status).json({ error: payload?.error || 'KLIPY request failed.' });

    const results = (Array.isArray(payload.results) ? payload.results : []).map(simplify).filter(Boolean);
    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300');
    return res.status(200).json({ results, next: safeText(payload.next, 200) });
  } catch (error) {
    console.error('KLIPY proxy error', error);
    return res.status(500).json({ error: 'Could not load KLIPY GIFs.' });
  }
}
