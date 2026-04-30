import { useState } from "react";

export default function Home() {
  const [postcode, setPostcode] = useState("");

  const deals = [
    {
      title: "50% Off Pizza - Yeovil",
      old: 20,
      price: 10,
      location: "Yeovil",
      image: "https://images.unsplash.com/photo-1594007654729-407eedc4be65"
    },
    {
      title: "Car Wash Deal",
      old: 25,
      price: 12,
      location: "Somerset",
      image: "https://images.unsplash.com/photo-1607863680198-23d4b2565df0"
    },
    {
      title: "Gym Day Pass",
      old: 15,
      price: 5,
      location: "Yeovil",
      image: "https://images.unsplash.com/photo-1558611848-73f7eb4001ab"
    }
  ];

  const filteredDeals = deals.filter(d =>
    postcode === "" || d.location.toLowerCase().includes(postcode.toLowerCase())
  );

  return (
    <div style={{ fontFamily: "Arial" }}>
      
      {/* HEADER */}
      <div style={{
  display: "flex",
  justifyContent: "space-between",
  padding: "20px",
  borderBottom: "1px solid #eee"
}}>
  <h2>LocalDeal</h2>

  <div>
    <a href="/post-deal" style={{ marginRight: "15px" }}>Post Deal</a>
    <a href="/login" style={{ marginRight: "10px" }}>Login</a>
    <a href="/signup">Sign Up</a>
  </div>
</div>

      {/* HERO */}
      <div style={{ textAlign: "center", padding: "50px" }}>
        <h1>Find the Best Local Deals Near You</h1>
        <p>Save money on food, services & more</p>

        <input
          placeholder="Enter town or postcode"
          value={postcode}
          onChange={(e) => setPostcode(e.target.value)}
          style={{
            padding: "10px",
            marginRight: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc"
          }}
        />

        <button style={{
          padding: "10px 20px",
          background: "#f4b400",
          border: "none",
          borderRadius: "6px"
        }}>
          Search
        </button>
      </div>

      {/* DEALS */}
      <div style={{ padding: "40px" }}>
        <h2>🔥 Deals Near You</h2>

        <div style={{
          display: "flex",
          gap: "20px",
          marginTop: "20px",
          flexWrap: "wrap"
        }}>
          {filteredDeals.map((d, i) => (
            <div key={i} style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              width: "250px"
            }}>
              <img
                src={d.image}
                style={{ width: "100%", height: "150px", objectFit: "cover" }}
              />

              <div style={{ padding: "10px" }}>
                <h4>{d.title}</h4>
                <p>{d.location}</p>

                <p>
                  <s>£{d.old}</s> <b>£{d.price}</b>
                </p>

                <p style={{ color: "green" }}>
                  {Math.round(((d.old - d.price) / d.old) * 100)}% OFF
                </p>

                <button style={{
                  marginTop: "10px",
                  padding: "8px",
                  width: "100%",
                  background: "#0070f3",
                  color: "white",
                  border: "none",
                  borderRadius: "6px"
                }}>
                  View Deal
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TRUST */}
      <div style={{ textAlign: "center", padding: "40px", color: "#555" }}>
        <p>🔥 New deals added daily</p>
        <p>📍 Local businesses near you</p>
      </div>

    </div>
  );
}
