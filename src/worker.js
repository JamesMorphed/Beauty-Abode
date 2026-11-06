// The Beauty Abode: demo staging Worker.
// Media under /m/ is served from the R2 bucket (with byte-range support for video).
// Everything else, and any media not yet synced to R2, falls back to the static assets in /public.

const TYPES = { webp: 'image/webp', mp4: 'video/mp4', svg: 'image/svg+xml', woff2: 'font/woff2', jpg: 'image/jpeg', png: 'image/png' };

function withStagingHeaders(res) {
  const out = new Response(res.body, res);
  out.headers.set('X-Robots-Tag', 'noindex, nofollow');
  out.headers.set('X-Content-Type-Options', 'nosniff');
  out.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return out;
}

async function fromR2(req, env, key) {
  if (!env.MEDIA) return null;
  const obj = await env.MEDIA.get(key, { range: req.headers, onlyIf: req.headers });
  if (!obj) return null;

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  if (!headers.get('content-type')) headers.set('content-type', TYPES[key.split('.').pop()] || 'application/octet-stream');
  headers.set('etag', obj.httpEtag);
  headers.set('accept-ranges', 'bytes');
  headers.set('cache-control', 'public, max-age=86400');

  if (!('body' in obj)) return new Response(null, { status: 304, headers });

  if (req.headers.has('range') && obj.range) {
    const r = obj.range;
    const offset = r.suffix != null ? obj.size - r.suffix : (r.offset ?? 0);
    const length = r.suffix != null ? r.suffix : (r.length ?? obj.size - offset);
    headers.set('content-range', `bytes ${offset}-${offset + length - 1}/${obj.size}`);
    headers.set('content-length', String(length));
    return new Response(obj.body, { status: 206, headers });
  }
  headers.set('content-length', String(obj.size));
  return new Response(obj.body, { status: 200, headers });
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if ((req.method === 'GET' || req.method === 'HEAD') && url.pathname.startsWith('/m/')) {
      try {
        const res = await fromR2(req, env, decodeURIComponent(url.pathname.slice(1)));
        if (res) return withStagingHeaders(res);
      } catch (err) {
        // fall through to the bundled copy
      }
    }
    return withStagingHeaders(await env.ASSETS.fetch(req));
  }
};
