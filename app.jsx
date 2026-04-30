import { useState } from "react";

function Homepage({ onEnter }) {
  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1 style={{ fontSize: "42px" }}>
        Find the Best Local Deals Near You
      </h1>

      <p style={{ color: "#555", marginBottom: "20px" }}>
        Save up to 70% on food, services & more
      </p>

      <button
        onClick={onEnter}
        style={{
          padding: "12px 24px",
          background: "#f4b400",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer"
        }}
      >
        Browse Deals
      </button>
    </div>
  );
}

function Deals() {
  const deals = [
    { title: "Restaurant Voucher", old: 50, price: 19 },
    { title: "Car Wash", old: 25, price: 10 },
    { title: "Gym Pass", old: 40, price: 15 }
  ];

  return (
    <div style={{ padding: "30px" }}>
      <h2>Deals Near You</h2>

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        {deals.map((d, i) => (
          <div key={i} style={{ border: "1px solid #ddd", padding: "15px", borderRadius: "10px" }}>
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

export default function App() {
  const [entered, setEntered] = useState(false);

  if (!entered) {
    return <Homepage onEnter={() => setEntered(true)} />;
  }

  return <Deals />;
}
