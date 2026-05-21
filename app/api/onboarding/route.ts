import { NextResponse } from "next/server";

import { createFirstOrgForCurrentUser } from "@/lib/onboarding";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { name?: unknown };
    const name = typeof body.name === "string" ? body.name : "";
    const result = await createFirstOrgForCurrentUser({ name });

    return NextResponse.json(
      {
        org: {
          id: result.org.id,
          name: result.org.name,
          slug: result.org.slug,
        },
        created: result.created,
        redirectTo: "/dispatch",
      },
      { status: result.created ? 201 : 200 },
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "UNAUTHENTICATED") {
        return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
      }

      if (error.message === "USER_HAS_NO_EMAIL") {
        return NextResponse.json(
          { error: "Your account needs an email address before creating an organization." },
          { status: 400 },
        );
      }

      if (error.message === "ORG_NAME_REQUIRED") {
        return NextResponse.json({ error: "Enter an organization name." }, { status: 400 });
      }
    }

    return NextResponse.json(
      { error: "We could not create your organization. Please try again." },
      { status: 500 },
    );
  }
}
