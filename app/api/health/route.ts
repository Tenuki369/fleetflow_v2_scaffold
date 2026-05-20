import { NextResponse } from "next/server";
import { basePrisma } from "@/lib/auth/tenancy";
import { getDocumentStorageDiagnostics } from "@/lib/storage/documents";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getStripeDiagnostics() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const missingEnv = [
    !secretKey ? "STRIPE_SECRET_KEY" : null,
    !webhookSecret ? "STRIPE_WEBHOOK_SECRET" : null,
    !appUrl ? "NEXT_PUBLIC_APP_URL" : null,
  ].filter((value): value is string => Boolean(value));

  let webhookUrl: string | null = null;
  if (appUrl) {
    try {
      webhookUrl = new URL("/api/stripe/webhook", appUrl).toString();
    } catch {
      webhookUrl = "invalid";
    }
  }

  return {
    configured: missingEnv.length === 0,
    mode: secretKey?.startsWith("sk_live_")
      ? "live"
      : secretKey?.startsWith("sk_test_")
        ? "test"
        : secretKey
          ? "unknown"
          : "missing",
    webhookSecretConfigured: Boolean(webhookSecret),
    appUrlConfigured: Boolean(appUrl),
    webhookUrl,
    missingEnv,
  };
}

function getClerkDiagnostics() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const secretKey = process.env.CLERK_SECRET_KEY;
  const signInUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL;
  const signUpUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL;
  const afterSignInUrl = process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL;
  const missingEnv = [
    !publishableKey ? "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" : null,
    !secretKey ? "CLERK_SECRET_KEY" : null,
    !signInUrl ? "NEXT_PUBLIC_CLERK_SIGN_IN_URL" : null,
    !signUpUrl ? "NEXT_PUBLIC_CLERK_SIGN_UP_URL" : null,
    !afterSignInUrl ? "NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL" : null,
  ].filter((value): value is string => Boolean(value));

  return {
    configured: missingEnv.length === 0,
    mode: publishableKey?.startsWith("pk_live_")
      ? "live"
      : publishableKey?.startsWith("pk_test_")
        ? "test"
        : publishableKey
          ? "unknown"
          : "missing",
    publishableKeyConfigured: Boolean(publishableKey),
    secretKeyConfigured: Boolean(secretKey),
    signInUrl,
    signUpUrl,
    afterSignInUrl,
    missingEnv,
  };
}

export async function GET() {
  const start = Date.now();
  const storage = getDocumentStorageDiagnostics();
  const stripe = getStripeDiagnostics();
  const clerk = getClerkDiagnostics();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? null;
  const runtimeEnv = process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown";

  try {
    await basePrisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      db: "ok",
      environment: {
        runtime: runtimeEnv,
        appUrl,
      },
      readiness: {
        clerk: {
          status: clerk.configured ? "ready" : "needs_config",
          ...clerk,
        },
        storage: {
          status: storage.configured && storage.clientInitialization === "ok" ? "ready" : "needs_config",
          ...storage,
        },
        stripe: {
          status: stripe.configured ? "ready" : "needs_config",
          ...stripe,
        },
      },
      uptimeMs: Math.round(process.uptime() * 1000),
      latencyMs: Date.now() - start,
      commit: process.env.VERCEL_GIT_COMMIT_SHA ?? "local",
    });
  } catch (err) {
    return NextResponse.json(
      {
        status: "degraded",
        db: "error",
        environment: {
          runtime: runtimeEnv,
          appUrl,
        },
        readiness: {
          clerk: {
            status: clerk.configured ? "ready" : "needs_config",
            ...clerk,
          },
          storage: {
            status: storage.configured && storage.clientInitialization === "ok" ? "ready" : "needs_config",
            ...storage,
          },
          stripe: {
            status: stripe.configured ? "ready" : "needs_config",
            ...stripe,
          },
        },
        error: (err as Error).message,
        latencyMs: Date.now() - start,
      },
      { status: 503 },
    );
  }
}
