import { clerkMiddleware } from '@clerk/nextjs/server';

// Basic Clerk middleware — makes auth state available on all routes.
// No routes are protected by default; existing custom auth continues to work.
// Add route protection later with createRouteMatcher + auth().protect().
export default clerkMiddleware();

export const config = {
  matcher: [
    // Match all routes except Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
