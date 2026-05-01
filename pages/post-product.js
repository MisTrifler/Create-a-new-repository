import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function PostProduct() {
  const [user, setUser] = useState(null);
  const [checkingUser, setCheckingUser] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState("");
  const [location, setLocation] = useState("Online");
  const [category, setCategory] = useState("General");
  const [imageUrl, setImageUrl] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [affiliateUrl, setAffiliateUrl] = useState("");
  const [sourceWebsite, setSourceWebsite] = useState("LocalDeal");
  const [isAffiliate, setIsAffiliate] = useState(false);
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

    if (affiliateUrl && !affiliateUrl.startsWith("http") && !affiliateUrl.startsWith("mailto:")) {
      alert("Product link must start with http, https, or mailto.");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("products").insert([
      {
        user_id: user.id,
        title,
        description,
        price: Number(price),
        old_price: oldPrice ? Number(oldPrice) : null,
        location,
        category,
        image_url: imageUrl,
        seller_name: sellerName || user.email,
        contact_email: user.email,
        affiliate_url: affiliateUrl,
        source_website: sourceWebsite,
        is_affiliate: isAffiliate,
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
    return <div style={{ padding: "50px", fontFamily: "Arial" }}>Checking login...</div>;
  }

  return (
    <div style={{ fontFamily: "Arial, sans-serif", minHeight: "100vh", background: "#f8fafc" }}>
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
          maxWidth: "650px",
          margin: "50px auto",
          background: "white",
          padding: "35px",
          borderRadius: "16px",
          boxShadow: "0 6px 18px rgba(0,0,0,0.08)"
        }}
      >
        <h1>Post Product or Affiliate Deal</h1>
        <p style={{ color: "#555" }}>
          Add a local product, service, or affiliate partner product.
        </p>

        <label>Product title *</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Example: Wireless Headphones" style={inputStyle} />

        <label>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the product" style={{ ...inputStyle, minHeight: "100px" }} />

        <label>Price *</label>
        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Example: 39.99" style={inputStyle} />

        <label>Old price optional</label>
        <input type="number" value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} placeholder="Example: 59.99" style={inputStyle} />

        <label>Location *</label>
        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Online, Yeovil, London..." style={inputStyle} />

        <label>Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
          <option>General</option>
          <option>Electronics</option>
          <option>Phones</option>
          <option>Home</option>
          <option>Fashion</option>
          <option>Cars</option>
          <option>Beauty</option>
          <option>Fitness</option>
          <option>Services</option>
        </select>

        <label>Image URL</label>
        <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Paste an image link" style={inputStyle} />

        <label>Seller / store name</label>
        <input value={sellerName} onChange={(e) => setSellerName(e.target.value)} placeholder="Example: Amazon, eBay, Local Seller" style={inputStyle} />

        <label>Source website</label>
        <input value={sourceWebsite} onChange={(e) => setSourceWebsite(e.target.value)} placeholder="Amazon, eBay, Awin, Local Seller" style={inputStyle} />

        <label>Product / affiliate link</label>
        <input value={affiliateUrl} onChange={(e) => setAffiliateUrl(e.target.value)} placeholder="Paste your affiliate link or product link" style={inputStyle} />

        <label style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "18px" }}>
          <input
            type="checkbox"
            checked={isAffiliate}
            onChange={(e) => setIsAffiliate(e.target.checked)}
          />
          This is an affiliate / commission link
        </label>

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
            fontSize: "16px"
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
