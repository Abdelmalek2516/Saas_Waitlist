import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Only /dashboard and /admin require authentication.
// The waitlist home page stays fully public.
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/admin(.*)"]);
export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
