import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The actual active role is stored in Zustand (client-side), which middleware can't directly read.
  // In a real app, we would read a cookie here. 
  // For this mock implementation, we'll allow routes and let client-side components enforce the redirect 
  // to `/workspace-select` if the state doesn't match, or we could set a mock cookie when logging in.
  // Since we are strictly using Zustand for the mock, client-side guards are better for this assignment.
  // Let's just pass through in middleware, and implement the guard in a Client Component Layout.

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
