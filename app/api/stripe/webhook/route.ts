import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { basePrisma } from "@/lib/auth/tenancy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// apiVersion left unset — SDK uses the version pinned in the Stripe dashboard.
let _stripe: Stripe | null = null;
function stripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("Missing STRIPE_SECRET_KEY");
  _stripe = new Stripe(key);
  return _stripe;
}

const SIGNING_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

async function alreadyProcessed(eventId: string): Promise<boolean> {
  try {
    await basePrisma.$executeRawUnsafe(
      `INSERT INTO "StripeEvent" ("id", "createdAt") VALUES ($1, NOW())`,
      eventId,
    );
    return false;
  } catch {
    return true;
  }
}

export async function POST(req: NextRequest) {
  if (!SIGNING_SECRET) {
    return NextResponse.json({ error: "Misconfigured" }, { status: 500 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(rawBody, sig, SIGNING_SECRET);
  } catch (err) {
    return NextResponse.json(
      { error: `Invalid signature: ${(err as Error).message}` },
      { status: 400 },
    );
  }

  if (await alreadyProcessed(event.id)) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    switch (event.type) {
      case "invoice.paid": {
        const inv = event.data.object as Stripe.Invoice;
        await basePrisma.invoice.updateMany({
          where: { stripeId: inv.id },
          data: { status: "PAID", paidAt: new Date() },
        });
        break;
      }
      case "invoice.payment_failed": {
        const inv = event.data.object as Stripe.Invoice;
        await basePrisma.invoice.updateMany({
          where: { stripeId: inv.id },
          data: { status: "OVERDUE" },
        });
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        // Placeholder for org-level subscription state changes.
        break;
      }
      default:
        break;
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("stripe webhook handler failed", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }
}
