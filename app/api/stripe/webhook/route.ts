// app/api/stripe/webhook/route.ts

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;

    if (!userId) {
      console.warn("Brak userId w metadata sesji Stripe");
      return NextResponse.json({ received: true });
    }

    const supabase = await createClient();

    try {
      // 1. Pobierz aktualną liczbę budynków
      const { data: buildings, error: buildingsError } = await supabase
        .from("buildings")
        .select("id")
        .eq("user_id", userId);

      if (buildingsError) throw buildingsError;

      const quantity = buildings?.length ?? 1;

      // 2. Pobierz ID subskrypcji z sesji
      const subscriptionId = session.subscription as string;
      if (!subscriptionId) throw new Error("Brak subscription ID");

      // 3. Pobierz subskrypcję z Stripe
      const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ["items"],
      });

      // 4. Znajdź item z Twoim priceId
      const priceId = process.env.STRIPE_PRICE_ID!;
      const subscriptionItem = subscription.items.data.find(
        (item) => item.price.id === priceId
      );

      if (!subscriptionItem) {
        throw new Error("Nie znaleziono priceId w subskrypcji");
      }

      // 5. Ustaw poprawną ilość (quantity)
      await stripe.subscriptionItems.update(subscriptionItem.id, {
        quantity,
      });

      // 6. Zaktualizuj profil w Supabase
      await supabase
        .from("profiles")
        .update({
          has_active_subscription: true,
          stripe_subscription_id: subscriptionId,
        })
        .eq("id", userId);

      console.log(
        `Subskrypcja aktywowana! userId: ${userId}, budynków: ${quantity}, sub: ${subscriptionId}`
      );
    } catch (err: any) {
      console.error("Błąd w webhooku:", err.message);
      return NextResponse.json({ error: "Processing failed" }, { status: 500 });
    }
  }

  // Stripe oczekuje 200 OK
  return NextResponse.json({ received: true });
}
