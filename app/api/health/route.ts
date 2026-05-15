import { NextResponse } from "next/server";
import { basePrisma } from "@/lib/auth/tenancy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const start = Date.now();
  try {
    await basePrisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      db: "ok",
      uptimeMs: Math.round(process.uptime() * 1000),
      latencyMs: Date.now() - start,
      commit: process.env.VERCEL_GIT_COMMIT_SHA ?? "local",
    });
  } catch (err) {
    return NextResponse.json(
      {
        status: "degraded",
        db: "error",
        error: (err as Error).message,
        latencyMs: Date.now() - start,
      },
      { status: 503 },
    );
  }
}
