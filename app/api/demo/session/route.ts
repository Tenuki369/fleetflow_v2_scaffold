import { NextResponse } from "next/server";

import {
  DEMO_SESSION_COOKIE,
  ensureDemoWorkspace,
  isDemoAccessEnabled,
  parseDemoPersona,
} from "@/lib/demo-access";

export async function POST(req: Request) {
  if (!isDemoAccessEnabled()) {
    return NextResponse.json({ error: "Demo access is disabled." }, { status: 404 });
  }

  const contentType = req.headers.get("content-type") ?? "";
  let personaValue: string | null = null;
  let intent = "create";

  if (contentType.includes("application/json")) {
    const body = (await req.json()) as { persona?: string; intent?: string };
    personaValue = body.persona ?? null;
    intent = body.intent ?? "create";
  } else {
    const formData = await req.formData();
    personaValue = String(formData.get("persona") ?? "");
    intent = String(formData.get("intent") ?? "create");
  }

  const response = NextResponse.redirect(new URL(intent === "clear" ? "/" : "/dispatch", req.url), 303);

  if (intent === "clear") {
    response.cookies.set(DEMO_SESSION_COOKIE, "", {
      expires: new Date(0),
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return response;
  }

  const persona = parseDemoPersona(personaValue);
  if (!persona) {
    return NextResponse.json({ error: "Choose a valid demo persona." }, { status: 400 });
  }

  await ensureDemoWorkspace();

  response.cookies.set(DEMO_SESSION_COOKIE, persona, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
  });

  return response;
}
