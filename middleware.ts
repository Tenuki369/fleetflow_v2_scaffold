import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

import { DEMO_SESSION_COOKIE, isDemoAccessEnabled, parseDemoPersona } from "@/lib/demo-access";

const isPublicRoute = createRouteMatcher([
  "/",
  "/demo(.*)",
  "/v2(.*)",
  "/login(.*)",
  "/signup(.*)",
  "/legal/(.*)",
  "/api/demo/session",
  "/api/health",
  "/api/stripe/webhook",
]);

export default clerkMiddleware(async (auth, req) => {
  const demoPersona = parseDemoPersona(req.cookies.get(DEMO_SESSION_COOKIE)?.value);
  if (demoPersona && isDemoAccessEnabled()) {
    return;
  }

  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js)).*)",
    "/(api|trpc)(.*)",
  ],
};
