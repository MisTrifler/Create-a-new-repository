import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
  const [postcode, setPostcode] = useState("");
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeals();
  }, []);

  async function fetchDeals() {
    setLoading(true);

    const { data, error } = await supabase
      .from("deals")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      alert("Supabase error: " + error.message);
      setDeals([]);
    } else {
      setDeals(data || []);
    }

    setLoading(false);
  }

  const filteredDeals = deals.filter((deal) => {
    const search = postcode.toLowerCase();

    return (
      postcode === "" ||
      deal.location?.toLowerCase().includes(search) ||
      deal.title?.toLowerCase().includes(search) ||
      deal.business_name?.toLowerCase().includes(search)
    );
  });

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        background: "#f8fafc",
        minHeight: "100vh"
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 40px",
          background: "white",
          borderBottom: "1px solid #e5e7eb",
          position: "sticky",
          top: 0,
          zIndex: 10
        }}
      >
        <a href="/" style={{ textDecoration: "none", color: "#111" }}>
          <h2 style={{ margin: 0 }}>LocalDeal</h2>
        </a>

        <div>
          <a
            href="/post-deal"
            style={{
              marginRight: "20px",
              textDecoration: "none",
              color: "#111",
              fontWeight: "500"
            }}
          >
            Post Deal
          </a>

          <a
            href="/login"
            style={{
              marginRight: "20px",
              textDecoration: "none",
              color: "#111",
              fontWeight: "500"
            }}
          >
            Login
          </a>

          <a
            href="/signup"
            style={{
              padding: "10px 16px",
              background: "#111827",
              color: "white",
              textDecoration: "none",
              borderRadius: "8px",
              fontWeight: "600"
            }}
          >
            Sign Up
          </a>
        </div>
      </div>

      {/* HERO */}
      <div
        style={{
          textAlign: "center",
          padding: "80px 20px",
          background: "white"
        }}
      >
        <h1
          style={{
            fontSize: "52px",
            marginBottom: "15px",
            lineHeight: "1.1"
          }}
        >
          Find the Best Local Deals Near You
        </h1>

        <p
          style={{
            color: "#555",
            fontSize: "18px",
            marginBottom: "30px"
          }}
        >
          Save money on food, gyms, car washes, beauty, services and more.
        </p>

        <input
          placeholder="Enter town or postcode"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
          style={{
            padding: "15px",
            width: "280px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            marginRight: "10px",
            fontSize: "15px"
          }}
        />

        <button
          onClick={() => {
            document
              .getElementById("deals-section")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
          style={{
            padding: "15px 26px",
            background: "#f4b400",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "15px"
          }}
        >
          Search Deals
        </button>
      </div>

      {/* DEALS */}
      <div id="deals-section" style={{ padding: "55px 45px" }}>
        <h2 style={{ marginBottom: "25px", fontSize: "28px" }}>
          🔥 Deals Near You
        </h2>

        {loading && <p>Loading deals...</p>}

        {!loading && filteredDeals.length === 0 && (
          <p>No deals found. Try another town or postcode.</p>
        )}

        <div
          style={{
            display: "flex",
            gap: "28px",
            flexWrap: "wrap"
          }}
        >
          {filteredDeals.map((deal) => {
            const discount =
              deal.old_price && deal.price
                ? Math.round(
                    ((deal.old_price - deal.price) / deal.old_price) * 100
                  )
                : null;

            return (
              <div
                key={deal.id}
                style={{
                  width: "285px",
                  background: "white",
                  borderRadius: "16px",
                  overflow: "hidden",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.08)"
                }}
              >
                <img
                  src={
                    deal.image_url ||
                    "https://images.unsplash.com/photo-1607082349566-187342175e2f"
                  }
                  alt={deal.title || "Local deal"}
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1607082349566-187342175e2f";
                  }}
                  style={{
                    width: "100%",
                    height: "180px",
                    objectFit: "cover"
                  }}
                />

                <div style={{ padding: "18px" }}>
                  <p
                    style={{
                      color: "#666",
                      fontSize: "14px",
                      margin: "0 0 8px"
                    }}
                  >
                    {deal.business_name || "Local Business"} ·{" "}
                    {deal.location || "Local Area"}
                  </p>

                  <h3 style={{ margin: "0 0 12px", fontSize: "20px" }}>
                    {deal.title}
                  </h3>

                  {deal.description && (
                    <p
                      style={{
                        color: "#555",
                        fontSize: "14px",
                        minHeight: "38px"
                      }}
                    >
                      {deal.description}
                    </p>
                  )}

                  <p style={{ fontSize: "18px", marginBottom: "8px" }}>
                    {deal.old_price && <s>£{deal.old_price}</s>}{" "}
                    <b>£{deal.price}</b>
                  </p>

                  {discount !== null && (
                    <p
                      style={{
                        color: "green",
                        fontWeight: "bold",
                        marginBottom: "14px"
                      }}
                    >
                      {discount}% OFF
                    </p>
                  )}

                  <button
                    onClick={() => {
                      if (deal.deal_url && deal.deal_url.startsWith("http")) {
                        window.location.href = deal.deal_url;
                      } else {
                        alert("No valid link found for this deal.");
                      }
                    }}
                    style={{
                      width: "100%",
                      padding: "13px",
                      background: "#111827",
                      color: "white",
                      border: "none",
                      borderRadius: "10px",
                      cursor: "pointer",
                      fontWeight: "bold"
                    }}
                  >
                    View Deal
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FOOTER */}
      <div
        style={{
          textAlign: "center",
          padding: "45px",
          color: "#666"
        }}
      >
        <p>🔥 New local deals added daily</p>
        <p>📍 Built for local businesses and local customers</p>
      </div>
    </div>
  );
}
