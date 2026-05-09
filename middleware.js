// Basic Auth gate for the AI Resulting site.
// Set SITE_PASSWORD as an environment variable in Vercel project settings.

export const config = {
  matcher: '/((?!api/|a/|_next/|favicon).*)',
};

export default function middleware(request) {
  const auth = request.headers.get('authorization');
  const expected = process.env.SITE_PASSWORD;

  if (!expected) {
    return new Response('Site not configured', { status: 503 });
  }

  if (auth && auth.startsWith('Basic ')) {
    try {
      const decoded = atob(auth.slice(6));
      const password = decoded.slice(decoded.indexOf(':') + 1);
      if (password === expected) {
        return;
      }
    } catch {}
  }

  return new Response('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="AI Resulting Private Preview"',
      'Cache-Control': 'no-store',
    },
  });
}
