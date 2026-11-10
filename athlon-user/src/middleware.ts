import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PublicSeoService, SEORedirectItem } from '@/lib/api/seo';

// In-memory cache for redirects in the Node/Edge runtime
let cachedRedirects: SEORedirectItem[] = [];
let lastFetchTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

async function getRedirects(): Promise<SEORedirectItem[]> {
  const now = Date.now();
  if (cachedRedirects.length > 0 && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedRedirects;
  }
  try {
    const list = await PublicSeoService.getActiveRedirects();
    if (Array.isArray(list)) {
      cachedRedirects = list.filter((r) => r.enabled);
      lastFetchTime = now;
      return cachedRedirects;
    }
  } catch {
    // If backend redirect service is unreachable, return previous cache or empty
  }
  return cachedRedirects;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip static assets, internal Next.js paths, and APIs
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  try {
    const redirects = await getRedirects();
    const normalizedPath = pathname.toLowerCase();

    const matched = redirects.find((r) => {
      const src = r.sourcePath.trim().toLowerCase();
      return src === normalizedPath || src === normalizedPath.replace(/\/+$/, '');
    });

    if (matched) {
      // Fire-and-forget hit counter tracking
      PublicSeoService.trackRedirectHit(matched.sourcePath).catch(() => {});

      const destination = matched.destinationUrl.trim();
      const redirectUrl = destination.startsWith('http')
        ? destination
        : new URL(destination, request.url).toString();

      return NextResponse.redirect(redirectUrl, {
        status: matched.redirectType === 301 ? 301 : 302,
      });
    }
  } catch {
    // Fail-open: continue request pipeline without crashing
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json
     * - public files with extensions
     */
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|sw.js).*)',
  ],
};
