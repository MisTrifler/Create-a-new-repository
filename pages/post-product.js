import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function PostProduct() {
  const [user, setUser] = useState(null);
  const [checkingUser, setCheckingUser] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("General");
  const [imageUrl, setImageUrl] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data } = await supabase.auth.getUser();

    if (!data?.user) {
      alert("You need to login before posting a product.");
      window.location.href = "/login";
      return;
    }

    setUser(data.user);
    setCheckingUser(false);
  }

  async function submitProduct() {
    if (!user) {
      alert("You must be logged in.");
      return;
    }

    if (!title || !price || !location) {
      alert("Please fill in title, price and location.");
      return;
    }

    if (Number(price) < 0) {
      alert("Price cannot be negative.");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("products").insert([
      {
        user_id: user.id,
        title,
        description,
        price: Number(price),
        location,
        category,
        image_url: imageUrl,
        seller_name: sellerName,
        contact_email: user.email,
        product_url: productUrl,
        status: "active"
      }
    ]);

    setSubmitting(false);

    if (error) {
      console.error(error);
      alert("Error posting product: " + error.message);
      return;
    }

    alert("Product posted successfully.");
    window.location.href = "/";
  }

  if (checkingUser) {
    return (
      <div style={{ padding: "50px", fontFamily: "Arial" }}>
        Checking login...
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        minHeight: "100vh",
        background: "#f8fafc"
      }}
    >
      <div
        style={{
          padding: "20px 40px",
          background: "white",
          borderBottom: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between"
        }}
      >
        <a href="/" style={{ textDecoration: "none", color: "#111" }}>
          <h2 style={{ margin: 0 }}>LocalDeal</h2>
        </a>

        <a href="/" style={{ color: "#111", textDecoration: "none" }}>
          Back Home
        </a>
      </div>

      <div
        style={{
          maxWidth: "620px",
          margin: "50px auto",
          background: "white",
          padding: "35px",
          borderRadius: "16px",
          boxShadow: "0 6px 18px rgba(0,0,0,0.08)"
        }}
      >
        <h1>Post a Product for Sale</h1>
        <p style={{ color: "#555" }}>
          Add your product details below. Buyers will be able to contact you by
          email.
        </p>

        <label>Product title *</label>
        <input
          placeholder="Example: iPhone 13 for sale"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={inputStyle}
        />

        <label>Description</label>
        <textarea
          placeholder="Describe the product condition, details and reason for selling"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ ...inputStyle, minHeight: "100px" }}
        />

        <label>Price *</label>
        <input
          placeholder="Example: 250"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          style={inputStyle}
        />

        <label>Location *</label>
        <input
          placeholder="Example: Yeovil"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={inputStyle}
        />

        <label>Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={inputStyle}
        >
          <option>General</option>
          <option>Electronics</option>
          <option>Cars</option>
          <option>Home</option>
          <option>Clothes</option>
          <option>Food</option>
          <option>Services</option>
          <option>Beauty</option>
          <option>Fitness</option>
        </select>

        <label>Image URL</label>
        <input
          placeholder="Paste an image link"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          style={inputStyle}
        />

        <label>Your name / business name</label>
        <input
          placeholder="Example: Vidyut or Local Phone Shop"
          value={sellerName}
          onChange={(e) => setSellerName(e.target.value)}
          style={inputStyle}
        />

        <label>Product link optional</label>
        <input
          placeholder="Optional website / WhatsApp / product link"
          value={productUrl}
          onChange={(e) => setProductUrl(e.target.value)}
          style={inputStyle}
        />

        <button
          onClick={submitProduct}
          disabled={submitting}
          style={{
            width: "100%",
            padding: "15px",
            background: submitting ? "#777" : "#111827",
            color: "white",
            border: "none",
            borderRadius: "10px",
            cursor: submitting ? "not-allowed" : "pointer",
            fontWeight: "bold",
            fontSize: "16px",
            marginTop: "15px"
          }}
        >
          {submitting ? "Posting..." : "Post Product"}
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "14px",
  marginTop: "8px",
  marginBottom: "16px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "15px"
};
