export default function Home() {
  const deals = [
    {
      title: "Restaurant Voucher",
      old: 50,
      price: 19,
      image: "https://images.unsplash.com/photo-1555992336-03a23c7b20ee"
    },
    {
      title: "Car Wash",
      old: 25,
      price: 10,
      image: "https://images.unsplash.com/photo-1607863680198-23d4b2565df0"
    },
    {
      title: "Gym Pass",
      old: 40,
      price: 15,
      image: "https://images.unsplash.com/photo-1558611848-73f7eb4001ab"
    }
  ];

  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>
      
      {/* HERO */}
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <h1 style={{ fontSize: "42px", marginBottom: "10px" }}>
          Find the Best Local Deals Near You
        </h1>

        <p style={{ color: "#555", marginBottom: "20px" }}>
          Save up to 70% on food, services & more
        </p>

        <input
          placeholder="Enter your postcode"
          style={{
            padding: "10px",
            width: "200px",
            marginRight: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc"
          }}
        />

        <button
          style={{
            padding: "10px 20px",
            background: "#f4b400",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Search
        </button>
      </div>

      {/* DEALS */}
      <div style={{ padding: "40px" }}>
        <h2 style={{ textAlign: "center" }}>Popular Deals</h2>

        <div
          style={{
            display: "flex",
            gap: "20px",
            justifyContent: "center",
            marginTop: "30px",
            flexWrap: "wrap"
          }}
        >
          {deals.map((d, i) => (
            <div
              key={i}
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                width: "250px",
                overflow: "hidden"
              }}
            >
              <img
                src={d.image}
                style={{ width: "100%", height: "150px", objectFit: "cover" }}
              />

              <div style={{ padding: "15px" }}>
                <h4>{d.title}</h4>

                <p>
                  <s>£{d.old}</s> <b>£{d.price}</b>
                </p>

                <p style={{ color: "green" }}>
                  {Math.round(((d.old - d.price) / d.old) * 100)}% OFF
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TRUST */}
      <div style={{ textAlign: "center", padding: "40px", color: "#555" }}>
        <p>🔥 100+ deals added weekly</p>
        <p>📍 Used by people across the UK</p>
      </div>

    </div>
  );
}
