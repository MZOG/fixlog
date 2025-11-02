// app/api/stripe/update-subscription/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

export async function POST(req: Request) {
  const { userId } = await req.json();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_subscription_id")
    .eq("id", userId)
    .single();

  if (!profile?.stripe_subscription_id) {
    return NextResponse.json({ error: "No subscription" }, { status: 400 });
  }

  const { data: buildings } = await supabase
    .from("buildings")
    .select("id")
    .eq("user_id", userId);

  const quantity = buildings?.length ?? 0;

  const subscription = await stripe.subscriptions.retrieve(
    profile.stripe_subscription_id,
    {
      expand: ["items"],
    }
  );

  // Znajdź item z Twoim priceId
  const priceId = process.env.STRIPE_PRICE_ID!;
  const subscriptionItem = subscription.items.data.find(
    (item) => item.price.id === priceId
  );

  if (!subscriptionItem) {
    return NextResponse.json(
      { error: "Price not found in subscription" },
      { status: 400 }
    );
  }

  await stripe.subscriptionItems.update(subscriptionItem.id, {
    quantity,
  });

  return NextResponse.json({ success: true, quantity });
}
