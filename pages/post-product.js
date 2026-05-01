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
  const [sellerName, setSellerName] = useState("");
  const [affiliateUrl, setAffiliateUrl] = useState("");
  const [sourceWebsite, setSourceWebsite] = useState("LocalDeal");
  const [isAffiliate, setIsAffiliate] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageUrl, setImageUrl] = useState("");

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

  function handleFileChange(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file.");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function handlePaste(e) {
    const items = e.clipboardData?.items;

    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();

        if (file) {
          setImageFile(file);
          setImagePreview(URL.createObjectURL(file));
          alert("Image pasted successfully.");
        }

        return;
      }
    }
  }

  async function uploadImageIfNeeded() {
    if (!imageFile) {
      return imageUrl || "";
    }

    const fileExt = imageFile.name.split(".").pop() || "jpg";
    const fileName = `${user.id}/${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(fileName, imageFile, {
        cacheControl: "3600",
        upsert: false
      });

    if (error) {
      throw new Error("Image upload failed: " + error.message);
    }

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    return data.publicUrl;
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

    if (
      affiliateUrl &&
      !affiliateUrl.startsWith("http") &&
      !affiliateUrl.startsWith("mailto:")
    ) {
      alert("Product link must start with http, https, or mailto.");
      return;
    }

    try {
      setSubmitting(true);

      const finalImageUrl = await uploadImageIfNeeded();

      const { error } = await supabase.from("products").insert([
        {
          user_id: user.id,
          title,
          description,
          price: Number(price),
          old_price: oldPrice ? Number(oldPrice) : null,
          location,
          category,
          image_url: finalImageUrl,
          seller_name: sellerName || user.email,
          contact_email: user.email,
          affiliate_url: affiliateUrl,
          source_website: sourceWebsite,
          is_affiliate: isAffiliate,
          is_featured: false,
          boost_type: "free",
          status: "active"
        }
      ]);

      if (error) {
        alert("Error posting product: " + error.message);
        return;
      }

      alert("Product posted successfully.");
      window.location.href = "/";
    } catch (error) {
      alert(error.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (checkingUser) {
    return (
      <div style={{ padding: "50px", fontFamily: "Arial" }}>
        Checking login...
      </div>
    );
  }

  return (
    <>
      <div className="page">
        <header className="header">
          <a href="/" className="logo">
            LocalDeal
          </a>

          <nav>
            <a href="/" className="navLink">
              Home
            </a>
            <a href="/my-listings" className="navLink">
              My Listings
            </a>
          </nav>
        </header>

        <main className="card">
          <h1>Post a Product for Free</h1>

          <p className="intro">
            Add your product details below. You can upload an image from your
            phone/computer or paste an image directly into the image box.
          </p>

          <div className="freeBox">
            <strong>Free listing:</strong> £0 today. No subscription required.
          </div>

          <label>Product title *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Example: iPhone 13 for sale"
          />

          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the product condition, details and reason for selling"
          />

          <label>Price *</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Example: 250"
          />

          <label>Old price optional</label>
          <input
            type="number"
            value={oldPrice}
            onChange={(e) => setOldPrice(e.target.value)}
            placeholder="Example: 300"
          />

          <label>Location *</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Online, Yeovil, Birmingham..."
          />

          <label>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
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

          <label>Product image</label>

          <div
            className="uploadBox"
            onPaste={handlePaste}
            tabIndex={0}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="previewImage" />
            ) : (
              <div>
                <p>
                  <strong>Paste image here</strong>
                </p>
                <p>Or choose an image from your phone/computer below.</p>
              </div>
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />

          <p className="helperText">
            Tip: click inside the image box, then press Ctrl + V to paste an
            image. On mobile, use Choose File.
          </p>

          <label>Seller / store name</label>
          <input
            value={sellerName}
            onChange={(e) => setSellerName(e.target.value)}
            placeholder="Example: John, Local Phone Shop, Amazon"
          />

          <label>Source website</label>
          <input
            value={sourceWebsite}
            onChange={(e) => setSourceWebsite(e.target.value)}
            placeholder="LocalDeal, Amazon, eBay, Awin"
          />

          <label>Product / affiliate link optional</label>
          <input
            value={affiliateUrl}
            onChange={(e) => setAffiliateUrl(e.target.value)}
            placeholder="Paste product, WhatsApp, email, or affiliate link"
          />

          <label className="checkboxLabel">
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
            className="submitButton"
          >
            {submitting ? "Posting..." : "Post Free Product"}
          </button>

          <p className="bottomNote">
            Coming soon: bump your product to the top or pay for featured
            placement.
          </p>
        </main>
      </div>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page {
          font-family: Arial, sans-serif;
          min-height: 100vh;
          background: #f8fafc;
        }

        .header {
          padding: 20px 40px;
          background: #111827;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          color: white;
          text-decoration: none;
          font-size: 26px;
          font-weight: 800;
        }

        .navLink {
          color: white;
          text-decoration: none;
          margin-left: 18px;
          font-weight: 600;
        }

        .card {
          max-width: 650px;
          margin: 50px auto;
          background: white;
          padding: 35px;
          border-radius: 16px;
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
        }

        h1 {
          margin-top: 0;
        }

        .intro {
          color: #555;
          line-height: 1.6;
        }

        .freeBox {
          background: #fef3c7;
          padding: 14px;
          border-radius: 10px;
          margin-bottom: 20px;
          color: #92400e;
        }

        label {
          display: block;
          font-weight: 700;
          margin-top: 14px;
          margin-bottom: 8px;
          color: #111827;
        }

        input,
        textarea,
        select {
          width: 100%;
          padding: 14px;
          margin-bottom: 10px;
          border-radius: 8px;
          border: 1px solid #ccc;
          font-size: 15px;
        }

        textarea {
          min-height: 100px;
          resize: vertical;
        }

        .uploadBox {
          width: 100%;
          min-height: 220px;
          border: 2px dashed #cbd5e1;
          border-radius: 14px;
          background: #f9fafb;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 20px;
          cursor: pointer;
          margin-bottom: 12px;
          outline: none;
        }

        .uploadBox:focus {
          border-color: #f4b400;
          box-shadow: 0 0 0 3px rgba(244, 180, 0, 0.2);
        }

        .uploadBox p {
          color: #555;
          margin: 6px 0;
        }

        .previewImage {
          max-width: 100%;
          max-height: 320px;
          border-radius: 12px;
          object-fit: contain;
        }

        .helperText {
          color: #6b7280;
          font-size: 13px;
          margin-top: 0;
        }

        .checkboxLabel {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 18px 0;
          font-weight: 500;
        }

        .checkboxLabel input {
          width: auto;
          margin: 0;
        }

        .submitButton {
          width: 100%;
          padding: 15px;
          background: #111827;
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: bold;
          font-size: 16px;
          margin-top: 10px;
        }

        .submitButton:disabled {
          background: #777;
          cursor: not-allowed;
        }

        .bottomNote {
          margin-top: 18px;
          color: #666;
          font-size: 14px;
        }

        @media (max-width: 700px) {
          .header {
            flex-direction: column;
            gap: 12px;
            padding: 18px;
          }

          .navLink {
            margin-left: 10px;
            margin-right: 10px;
          }

          .card {
            margin: 25px 14px;
            padding: 24px;
          }

          .uploadBox {
            min-height: 180px;
          }
        }
      `}</style>
    </>
  );
}
