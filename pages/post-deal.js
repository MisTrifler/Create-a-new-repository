import { useState } from "react";

export default function PostDeal() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");

  const handleSubmit = () => {
    alert("Deal submitted (we’ll connect database next)");
  };

  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h1>Post a Deal</h1>

      <input
        placeholder="Deal title"
        onChange={(e) => setTitle(e.target.value)}
        style={{ display: "block", margin: "10px auto", padding: "10px" }}
      />

      <input
        placeholder="Original price"
        onChange={(e) => setOldPrice(e.target.value)}
        style={{ display: "block", margin: "10px auto", padding: "10px" }}
      />

      <input
        placeholder="Discount price"
        onChange={(e) => setPrice(e.target.value)}
        style={{ display: "block", margin: "10px auto", padding: "10px" }}
      />

      <button onClick={handleSubmit} style={{ padding: "10px 20px" }}>
        Submit Deal
      </button>
    </div>
  );
}
