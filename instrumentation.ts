// Runtime monitoring hook.
//
// This stays safe by default:
// - no fake credentials live in the repo
// - no Sentry package import is evaluated unless monitoring is explicitly enabled
// - local development can leave monitoring off without changing app behavior
//
// To activate later:
// 1. install @sentry/nextjs
// 2. set FLEETFLOW_ENABLE_SENTRY=true in staging/production
// 3. provide SENTRY_DSN / NEXT_PUBLIC_SENTRY_DSN in the host environment
// 4. uncomment the Sentry.init blocks in the config files
export async function register() {
  const monitoringEnabled =
    process.env.FLEETFLOW_ENABLE_SENTRY === "true" &&
    process.env.NODE_ENV !== "development";

  if (!monitoringEnabled) {
    return;
  }

  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.SENTRY_DSN) {
    await import("./sentry.server.config");
  }
}
