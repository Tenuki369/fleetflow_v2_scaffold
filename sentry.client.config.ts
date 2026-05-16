// Client-side monitoring template for FleetFlow.
//
// This stays documentation-only until @sentry/nextjs is installed and enabled.
// Keep DSNs, environment naming, and replay decisions in deployment config.
//
// Recommended environment variables:
// - NEXT_PUBLIC_SENTRY_DSN
// - NEXT_PUBLIC_VERCEL_ENV or SENTRY_ENVIRONMENT mirrored for the browser
// - NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA for release correlation if available
//
// Privacy notes:
// - keep `maskAllText` enabled unless a deliberate review says otherwise
// - keep `blockAllMedia` enabled for document-heavy workflows
// - treat session replay as optional for launch; error capture matters first
//
// Activation steps:
// import * as Sentry from "@sentry/nextjs";
// Sentry.init({
//   dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
//   environment:
//     process.env.SENTRY_ENVIRONMENT ??
//     process.env.NEXT_PUBLIC_VERCEL_ENV ??
//     "development",
//   tracesSampleRate: 0.1,
//   replaysSessionSampleRate: 0.05,
//   replaysOnErrorSampleRate: 1.0,
//   integrations: [
//     Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true }),
//   ],
//   release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
// });
export {};
