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
      console.error(error);
      alert("Could not load deals");
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
      deal.title?.toLowerCase().includes(search)
    );
  });

  return (
    <div style={{ fontFamily: "Arial, sans-serif", background: "#f8fafc", minHeight: "100vh" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 40px",
          background: "white",
          borderBottom: "1px solid #e5e7eb"
        }}
      >
        <a href="/" style={{ textDecoration: "none", color: "#111" }}>
          <h2 style={{ margin: 0 }}>LocalDeal</h2>
        </a>

        <div>
          <a href="/post-deal" style={{ marginRight: "20px", textDecoration: "none", color: "#111" }}>
            Post Deal
          </a>

          <a href="/login" style={{ textDecoration: "none", color: "#111" }}>
            Login
          </a>
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "70px 20px", background: "white" }}>
        <h1 style={{ fontSize: "46px", marginBottom: "10px" }}>
          Find the Best Local Deals Near You
        </h1>

        <p style={{ color: "#555", fontSize: "18px", marginBottom: "25px" }}>
          Save money on food, gyms, car washes, beauty, services and more.
        </p>

        <input
          placeholder="Enter town or postcode"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
          style={{
            padding: "14px",
            width: "260px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            marginRight: "10px"
          }}
        />

        <button
          style={{
            padding: "14px 24px",
            background: "#f4b400",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Search Deals
        </button>
      </div>

      <div style={{ padding: "50px 40px" }}>
        <h2 style={{ marginBottom: "25px" }}>🔥 Deals Near You</h2>

        {loading && <p>Loading deals...</p>}

        {!loading && filteredDeals.length === 0 && (
          <p>No deals found. Try another town or postcode.</p>
        )}

        <div
          style={{
            display: "flex",
            gap: "25px",
            flexWrap: "wrap"
          }}
        >
          {filteredDeals.map((deal) => {
            const discount =
              deal.old_price && deal.price
                ? Math.round(((deal.old_price - deal.price) / deal.old_price) * 100)
                : null;

            return (
              <div
                key={deal.id}
                style={{
                  width: "280px",
                  background: "white",
                  borderRadius: "14px",
                  overflow: "hidden",
                  border: "1px solid #e5e7eb",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)"
                }}
              >
                <img
                  src={
                    deal.image_url ||
                    "https://images.unsplash.com/photo-1607082349566-187342175e2f"
                  }
                  alt={deal.title}
                  style={{
                    width: "100%",
                    height: "170px",
                    objectFit: "cover"
                  }}
                />

                <div style={{ padding: "18px" }}>
                  <p style={{ color: "#666", fontSize: "14px", margin: "0 0 6px" }}>
                    {deal.business_name || "Local Business"} · {deal.location}
                  </p>

                  <h3 style={{ margin: "0 0 10px" }}>{deal.title}</h3>

                  {deal.description && (
                    <p style={{ color: "#555", fontSize: "14px" }}>
                      {deal.description}
                    </p>
                  )}

                  <p style={{ fontSize: "18px" }}>
                    {deal.old_price && <s>£{deal.old_price}</s>}{" "}
                    <b>£{deal.price}</b>
                  </p>

                  {discount !== null && (
                    <p style={{ color: "green", fontWeight: "bold" }}>
                      {discount}% OFF
                    </p>
                  )}

                  <button
                    style={{
                      marginTop: "10px",
                      width: "100%",
                      padding: "12px",
                      background: "#111827",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer"
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

      <div style={{ textAlign: "center", padding: "40px", color: "#666" }}>
        <p>🔥 New local deals added daily</p>
        <p>📍 Built for local businesses and local customers</p>
      </div>
    </div>
  );
}
