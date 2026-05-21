// Server-side monitoring template for FleetFlow.
//
// This file intentionally avoids importing @sentry/nextjs until the package is
// installed. Keep all credentialed values in deployment config or CI secrets,
// never in the repo.
//
// Recommended environment variables:
// - SENTRY_DSN
// - SENTRY_ENVIRONMENT (optional override; otherwise VERCEL_ENV/NODE_ENV)
// - VERCEL_GIT_COMMIT_SHA or another release identifier
// - SENTRY_AUTH_TOKEN / SENTRY_ORG / SENTRY_PROJECT in CI if sourcemap upload is enabled
//
// Suggested alert coverage outside the repo:
// - any new unhandled server exception in staging/production
// - error spike on core API routes after deploy
// - payment/storage workflow failures if captured as errors
//
// Activation steps:
// import * as Sentry from "@sentry/nextjs";
// Sentry.init({
//   dsn: process.env.SENTRY_DSN,
//   environment:
//     process.env.SENTRY_ENVIRONMENT ??
//     process.env.VERCEL_ENV ??
//     process.env.NODE_ENV,
//   tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
//   profilesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
//   release: process.env.VERCEL_GIT_COMMIT_SHA,
//   ignoreErrors: ["NEXT_NOT_FOUND", "NEXT_REDIRECT"],
// });
export {};
