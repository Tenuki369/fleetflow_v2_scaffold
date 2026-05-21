const args = new Set(process.argv.slice(2));
const requireReady = args.has("--require-ready");
const timeoutMs = Number.parseInt(process.env.HEALTH_TIMEOUT_MS ?? "15000", 10);
const base = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;

if (!base) {
  console.error("Set APP_URL or NEXT_PUBLIC_APP_URL before running the staging health check.");
  process.exit(1);
}

let url;
try {
  url = new URL("/api/health", base);
} catch (error) {
  console.error(`Invalid app URL: ${base}`);
  console.error(error);
  process.exit(1);
}

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), timeoutMs);

try {
  const startedAt = Date.now();
  const response = await fetch(url, {
    headers: { accept: "application/json" },
    signal: controller.signal,
  });
  const elapsedMs = Date.now() - startedAt;
  const text = await response.text();

  if (!response.ok) {
    console.error(`Health check failed with ${response.status} in ${elapsedMs}ms`);
    console.error(text);
    process.exit(1);
  }

  const payload = JSON.parse(text);
  const readiness = payload?.readiness ?? {};
  const failedChecks = Object.entries(readiness)
    .filter(([, value]) => {
      if (!requireReady) {
        return false;
      }
      return value?.status !== "ready";
    })
    .map(([key, value]) => `${key}:${value?.status ?? "missing"}`);

  console.log(
    JSON.stringify(
      {
        url: url.toString(),
        latencyMs: elapsedMs,
        status: payload?.status ?? "unknown",
        db: payload?.db ?? "unknown",
        commit: payload?.commit ?? "unknown",
        readiness,
      },
      null,
      2,
    ),
  );

  if (payload?.status !== "ok") {
    console.error("Health endpoint returned a non-ok application status.");
    process.exit(1);
  }

  if (failedChecks.length > 0) {
    console.error(`Readiness checks not ready: ${failedChecks.join(", ")}`);
    process.exit(1);
  }
} catch (error) {
  console.error(`Health check request failed for ${url.toString()}`);
  console.error(error);
  process.exit(1);
} finally {
  clearTimeout(timeout);
}
