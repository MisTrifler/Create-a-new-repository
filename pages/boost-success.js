import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function BoostSuccess() {
  const [message, setMessage] = useState("Activating your boost...");

  useEffect(() => {
    activateBoost();
  }, []);

  async function activateBoost() {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");

    if (!sessionId) {
      setMessage("Missing payment session. Please contact support.");
      return;
    }

    const { data: product, error } = await supabase
      .from("products")
      .select("*")
      .eq("stripe_session_id", sessionId)
      .single();

    if (error || !product) {
      setMessage("Could not find the product for this payment.");
      return;
    }

    let updateData = {
      boost_paid_at: new Date().toISOString()
    };

    if (product.boost_type === "featured_7d") {
      updateData = {
        ...updateData,
        is_featured: true,
        bumped_until: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString()
      };
    } else {
      updateData = {
        ...updateData,
        is_featured: false,
        bumped_until: new Date(
          Date.now() + 24 * 60 * 60 * 1000
        ).toISOString()
      };
    }

    const { error: updateError } = await supabase
      .from("products")
      .update(updateData)
      .eq("id", product.id);

    if (updateError) {
      setMessage(
        "Payment succeeded, but boost activation failed. Contact support."
      );
      return;
    }

    setMessage("Boost activated successfully. Redirecting you home...");

    setTimeout(() => {
      window.location.href = "/";
    }, 2000);
  }

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        padding: "60px",
        textAlign: "center"
      }}
    >
      <h1>Boost Payment</h1>
      <p>{message}</p>
      <a href="/">Go back home</a>
    </div>
  );
}
