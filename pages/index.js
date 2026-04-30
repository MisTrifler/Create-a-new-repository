export default function Home() {
  const deals = [
    { title: "Restaurant Voucher", old: 50, price: 19 },
    { title: "Car Wash", old: 25, price: 10 },
    { title: "Gym Pass", old: 40, price: 15 }
  ];

  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1 style={{ fontSize: "42px" }}>
        Find the Best Local Deals Near You
      </h1>

      <p style={{ color: "#555", marginBottom: "20px" }}>
        Save up to 70% on food, services & more
      </p>

      <button
        style={{
          padding: "12px 24px",
          background: "#f4b400",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          marginBottom: "40px"
        }}
      >
        Browse Deals
      </button>

      <h2>Popular Deals</h2>

      <div style={{
        display: "flex",
        gap: "20px",
        justifyContent: "center",
        marginTop: "20px"
      }}>
        {deals.map((d, i) => (
          <div key={i} style={{
            border: "1px solid #ddd",
            padding: "15px",
            borderRadius: "10px",
            width: "200px"
          }}>
            <h4>{d.title}</h4>
            <p>
              <s>£{d.old}</s> <b>£{d.price}</b>
            </p>
            <p style={{ color: "green" }}>
              {Math.round(((d.old - d.price) / d.old) * 100)}% OFF
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
