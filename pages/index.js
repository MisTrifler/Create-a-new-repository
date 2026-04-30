import { useState } from "react";

export default function Home() {
  const [user, setUser] = useState(null);

  const deals = [
    {
      title: "Restaurant Voucher",
      old: 50,
      price: 19,
      image: "https://images.unsplash.com/photo-1555992336-03a23c7b20ee"
    },
    {
      title: "Spa Day",
      old: 80,
      price: 35,
      image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874"
    }
  ];

  const products = [
    {
      title: "Wireless Headphones",
      price: 59,
      image: "https://images.unsplash.com/photo-1518441902117-6f2c2d6db82b",
      link: "https://example.com"
    },
    {
      title: "Smart Watch",
      price: 99,
      image: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c",
      link: "https://example.com"
    }
  ];

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
          {user ? (
            <span>Welcome 👋</span>
          ) : (
            <>
              <button onClick={() => setUser(true)} style={{ marginRight: "10px" }}>
                Login
              </button>
              <button onClick={() => setUser(true)}>
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>

      {/* HERO */}
      <div style={{ textAlign: "center", padding: "50px" }}>
        <h1>Find Deals & Products Near You</h1>
        <p>Save money on local services and trending products</p>

        <input
          placeholder="Enter postcode"
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
        <h2>🔥 Local Deals</h2>

        <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
          {deals.map((d, i) => (
            <div key={i} style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              width: "250px"
            }}>
              <img src={d.image} style={{ width: "100%", height: "150px", objectFit: "cover" }} />

              <div style={{ padding: "10px" }}>
                <h4>{d.title}</h4>
                <p><s>£{d.old}</s> <b>£{d.price}</b></p>
                <p style={{ color: "green" }}>
                  {Math.round(((d.old - d.price) / d.old) * 100)}% OFF
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PRODUCTS */}
      <div style={{ padding: "40px" }}>
        <h2>🛍️ Popular Products</h2>

        <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
          {products.map((p, i) => (
            <div key={i} style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              width: "250px"
            }}>
              <img src={p.image} style={{ width: "100%", height: "150px", objectFit: "cover" }} />

              <div style={{ padding: "10px" }}>
                <h4>{p.title}</h4>
                <p>£{p.price}</p>

                <a href={p.link} target="_blank">
                  <button style={{
                    marginTop: "10px",
                    padding: "8px 12px",
                    background: "#0070f3",
                    color: "white",
                    border: "none",
                    borderRadius: "6px"
                  }}>
                    View Deal
                  </button>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
