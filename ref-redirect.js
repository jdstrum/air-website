module.exports = function handler(req, res) {
  // Extract the agent slug from the path: /a/mike → mike
  const slug = (req.url || '').replace(/^\/a\//, '').split('?')[0].split('/')[0] || '';

  if (!slug) {
    return res.writeHead(302, { Location: '/assessment' }).end();
  }

  // Set a cookie with the ref — HttpOnly so it's invisible to page JS except our own reader,
  // 30-day expiry so it survives if they come back later, SameSite=Lax for normal nav
  const cookie = `_air_ref=${encodeURIComponent(slug)}; Path=/; Max-Age=2592000; SameSite=Lax`;

  res.writeHead(302, {
    'Set-Cookie': cookie,
    Location: '/assessment'
  }).end();
};
