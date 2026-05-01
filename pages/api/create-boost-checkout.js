import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const BOOST_OPTIONS = {
  bump_24h: {
    name: "Bump product to top for 24 hours",
    amount: 199,
    boostType: "bump_24h"
  },
  featured_7d: {
    name: "Featured placement for 7 days",
    amount: 499,
    boostType: "featured_7d"
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { productId, boostType } = req.body;

    if (!productId || !boostType || !BOOST_OPTIONS[boostType]) {
      return res.status(400).json({ error: "Invalid product or boost type" });
    }

    const option = BOOST_OPTIONS[boostType];

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || req.headers.origin || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      client_reference_id: productId,
      metadata: {
        productId,
        boostType: option.boostType
      },
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: {
              name: option.name
            },
            unit_amount: option.amount
          },
          quantity: 1
        }
      ],
      success_url: `${siteUrl}/boost-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/`
    });

    const { error } = await supabaseAdmin
      .from("products")
      .update({
        stripe_session_id: session.id
      })
      .eq("id", productId);

    if (error) {
      console.error("Supabase update error:", error);
    }

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return res.status(500).json({ error: error.message });
  }
}
