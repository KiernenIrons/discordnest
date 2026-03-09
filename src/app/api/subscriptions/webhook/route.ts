import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const config = { api: { bodyParser: false } };

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (!userId || !session.subscription) break;

      await prisma.subscription.upsert({
        where: { userId },
        update: {
          stripeSubscriptionId: session.subscription as string,
          status: "ACTIVE",
        },
        create: {
          userId,
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
          status: "ACTIVE",
        },
      });
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const existing = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: sub.id },
      });
      if (!existing) break;

      await prisma.subscription.update({
        where: { stripeSubscriptionId: sub.id },
        data: {
          status: sub.status.toUpperCase() as never,
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const existing = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: sub.id },
      });
      if (!existing) break;

      await prisma.subscription.update({
        where: { stripeSubscriptionId: sub.id },
        data: { status: "CANCELED" },
      });

      // Unpublish premium servers owned by this user beyond the free limit
      await prisma.server.updateMany({
        where: { ownerId: existing.userId, isPremium: true },
        data: { isPublished: false, isPremium: false },
      });
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      if (!invoice.subscription) break;

      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: invoice.subscription as string },
        data: { status: "PAST_DUE" },
      });
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      if (!invoice.subscription) break;

      await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: invoice.subscription as string },
        data: { status: "ACTIVE" },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
