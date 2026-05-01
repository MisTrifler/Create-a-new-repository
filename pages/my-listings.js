import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function MyListings() {
  const [user, setUser] = useState(null);
  const [checkingUser, setCheckingUser] = useState(true);
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    price: "",
    old_price: "",
    location: "",
    category: "",
    image_url: "",
    seller_name: "",
    affiliate_url: "",
    source_website: "",
    status: "active"
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data } = await supabase.auth.getUser();

    if (!data?.user) {
      alert("Please login to manage your listings.");
      window.location.href = "/login";
      return;
    }

    setUser(data.user);
    setCheckingUser(false);
    fetchMyListings(data.user.id);
  }

  async function fetchMyListings(userId) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      alert("Could not load your listings: " + error.message);
      setProducts([]);
      return;
    }

    setProducts(data || []);
  }

  function startEdit(product) {
    setEditingId(product.id);
    setImageFile(null);
    setImagePreview(product.image_url || "");

    setEditForm({
      title: product.title || "",
      description: product.description || "",
      price: product.price || "",
      old_price: product.old_price || "",
      location: product.location || "",
      category: product.category || "General",
      image_url: product.image_url || "",
      seller_name: product.seller_name || "",
      affiliate_url: product.affiliate_url || "",
      source_website: product.source_website || "LocalDeal",
      status: product.status || "active"
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setImageFile(null);
    setImagePreview("");
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
      return editForm.image_url || "";
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

  async function saveListing(productId) {
    if (!editForm.title || !editForm.price || !editForm.location) {
      alert("Title, price and location are required.");
      return;
    }

    if (Number(editForm.price) < 0) {
      alert("Price cannot be negative.");
      return;
    }

    try {
      setSaving(true);

      const finalImageUrl = await uploadImageIfNeeded();

      const { error } = await supabase
        .from("products")
        .update({
          title: editForm.title,
          description: editForm.description,
          price: Number(editForm.price),
          old_price: editForm.old_price ? Number(editForm.old_price) : null,
          location: editForm.location,
          category: editForm.category,
          image_url: finalImageUrl,
          seller_name: editForm.seller_name,
          affiliate_url: editForm.affiliate_url,
          source_website: editForm.source_website,
          status: editForm.status
        })
        .eq("id", productId)
        .eq("user_id", user.id);

      if (error) {
        alert("Could not save listing: " + error.message);
        return;
      }

      alert("Listing updated successfully.");
      setEditingId(null);
      setImageFile(null);
      setImagePreview("");
      fetchMyListings(user.id);
    } catch (error) {
      alert(error.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function markSold(productId) {
    const confirmSold = confirm("Mark this listing as sold?");
    if (!confirmSold) return;

    const { error } = await supabase
      .from("products")
      .update({ status: "sold" })
      .eq("id", productId)
      .eq("user_id", user.id);

    if (error) {
      alert("Could not mark as sold: " + error.message);
      return;
    }

    alert("Listing marked as sold.");
    fetchMyListings(user.id);
  }

  async function reactivateListing(productId) {
    const { error } = await supabase
      .from("products")
      .update({ status: "active" })
      .eq("id", productId)
      .eq("user_id", user.id);

    if (error) {
      alert("Could not reactivate listing: " + error.message);
      return;
    }

    alert("Listing reactivated.");
    fetchMyListings(user.id);
  }

  async function deleteListing(productId) {
    const confirmDelete = confirm(
      "Are you sure you want to permanently delete this listing?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId)
      .eq("user_id", user.id);

    if (error) {
      alert("Could not delete listing: " + error.message);
      return;
    }

    alert("Listing deleted.");
    fetchMyListings(user.id);
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
            <a href="/post-product" className="navLink">
              Post Product
            </a>
            <a href="/messages" className="navLink">
              Messages
            </a>
          </nav>
        </header>

        <main className="container">
          <div className="topSection">
            <div>
              <h1>My Listings</h1>
              <p>
                Manage, edit, mark as sold, reactivate or delete your product
                listings.
              </p>
            </div>

            <a href="/post-product" className="postButton">
              Post New Product
            </a>
          </div>

          {products.length === 0 && (
            <div className="emptyBox">
              <h2>No listings yet</h2>
              <p>You have not posted any products yet.</p>
              <a href="/post-product" className="postButton">
                Post your first product
              </a>
            </div>
          )}

          <div className="listings">
            {products.map((product) => (
              <div key={product.id} className="listingCard">
                <img
                  src={
                    product.image_url ||
                    "https://images.unsplash.com/photo-1607082349566-187342175e2f"
                  }
                  alt={product.title || "Product"}
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1607082349566-187342175e2f";
                  }}
                />

                <div className="listingContent">
                  {editingId === product.id ? (
                    <div className="editForm">
                      <label>Title *</label>
                      <input
                        value={editForm.title}
                        onChange={(e) =>
                          setEditForm({ ...editForm, title: e.target.value })
                        }
                      />

                      <label>Description</label>
                      <textarea
                        value={editForm.description}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            description: e.target.value
                          })
                        }
                      />

                      <label>Price *</label>
                      <input
                        type="number"
                        value={editForm.price}
                        onChange={(e) =>
                          setEditForm({ ...editForm, price: e.target.value })
                        }
                      />

                      <label>Old price</label>
                      <input
                        type="number"
                        value={editForm.old_price}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            old_price: e.target.value
                          })
                        }
                      />

                      <label>Location *</label>
                      <input
                        value={editForm.location}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            location: e.target.value
                          })
                        }
                      />

                      <label>Category</label>
                      <select
                        value={editForm.category}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            category: e.target.value
                          })
                        }
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
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="previewImage"
                          />
                        ) : (
                          <div>
                            <p>
                              <strong>Paste image here</strong>
                            </p>
                            <p>
                              Or choose an image from your phone/computer below.
                            </p>
                          </div>
                        )}
                      </div>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                      />

                      <p className="helperText">
                        Tip: click inside the image box, then press Ctrl + V to
                        paste an image. On mobile, use Choose File.
                      </p>

                      <label>Seller / store name</label>
                      <input
                        value={editForm.seller_name}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            seller_name: e.target.value
                          })
                        }
                      />

                      <label>Product / affiliate link</label>
                      <input
                        value={editForm.affiliate_url}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            affiliate_url: e.target.value
                          })
                        }
                      />

                      <label>Source website</label>
                      <input
                        value={editForm.source_website}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            source_website: e.target.value
                          })
                        }
                      />

                      <label>Status</label>
                      <select
                        value={editForm.status}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            status: e.target.value
                          })
                        }
                      >
                        <option value="active">Active</option>
                        <option value="sold">Sold</option>
                      </select>

                      <div className="actions">
                        <button
                          onClick={() => saveListing(product.id)}
                          disabled={saving}
                          className="saveButton"
                        >
                          {saving ? "Saving..." : "Save Changes"}
                        </button>

                        <button onClick={cancelEdit} className="cancelButton">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="listingHeader">
                        <h2>{product.title}</h2>
                        <span
                          className={
                            product.status === "active"
                              ? "statusActive"
                              : "statusSold"
                          }
                        >
                          {product.status || "active"}
                        </span>
                      </div>

                      <p className="meta">
                        {product.category || "General"} ·{" "}
                        {product.location || "Online"}
                      </p>

                      <p className="description">{product.description}</p>

                      <p className="price">£{product.price}</p>

                      {product.old_price && (
                        <p className="oldPrice">
                          Old price: £{product.old_price}
                        </p>
                      )}

                      <p className="smallText">
                        Posted:{" "}
                        {product.created_at
                          ? new Date(product.created_at).toLocaleDateString()
                          : "Unknown"}
                      </p>

                      <div className="actions">
                        <button
                          onClick={() => startEdit(product)}
                          className="editButton"
                        >
                          Edit
                        </button>

                        {product.status === "active" ? (
                          <button
                            onClick={() => markSold(product.id)}
                            className="soldButton"
                          >
                            Mark Sold
                          </button>
                        ) : (
                          <button
                            onClick={() => reactivateListing(product.id)}
                            className="reactivateButton"
                          >
                            Reactivate
                          </button>
                        )}

                        <button
                          onClick={() => deleteListing(product.id)}
                          className="deleteButton"
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page {
          font-family: Arial, sans-serif;
          background: #f3f4f6;
          min-height: 100vh;
        }

        .header {
          background: #111827;
          color: white;
          padding: 18px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
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

        .container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 45px 30px;
        }

        .topSection {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 30px;
        }

        .topSection h1 {
          margin-bottom: 8px;
        }

        .topSection p {
          color: #555;
        }

        .postButton {
          background: #111827;
          color: white;
          padding: 13px 18px;
          border-radius: 10px;
          text-decoration: none;
          font-weight: 700;
          white-space: nowrap;
        }

        .emptyBox {
          background: white;
          padding: 35px;
          border-radius: 16px;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
          text-align: center;
        }

        .listings {
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .listingCard {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          display: grid;
          grid-template-columns: 240px 1fr;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
          border: 1px solid #e5e7eb;
        }

        .listingCard > img {
          width: 100%;
          height: 100%;
          min-height: 230px;
          object-fit: cover;
        }

        .listingContent {
          padding: 24px;
        }

        .listingHeader {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: flex-start;
        }

        .listingHeader h2 {
          margin: 0 0 8px;
        }

        .statusActive,
        .statusSold {
          padding: 5px 10px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 700;
          text-transform: capitalize;
        }

        .statusActive {
          background: #dcfce7;
          color: #166534;
        }

        .statusSold {
          background: #fee2e2;
          color: #991b1b;
        }

        .meta {
          color: #6b7280;
          font-size: 14px;
        }

        .description {
          color: #555;
          line-height: 1.5;
        }

        .price {
          font-size: 24px;
          font-weight: 800;
          margin: 10px 0;
        }

        .oldPrice {
          color: #6b7280;
          text-decoration: line-through;
        }

        .smallText {
          color: #777;
          font-size: 13px;
        }

        .actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 18px;
        }

        button {
          border: none;
          padding: 11px 14px;
          border-radius: 9px;
          cursor: pointer;
          font-weight: 700;
        }

        button:disabled {
          background: #777;
          cursor: not-allowed;
        }

        .editButton,
        .saveButton {
          background: #111827;
          color: white;
        }

        .soldButton {
          background: #f4b400;
          color: #111827;
        }

        .reactivateButton {
          background: #16a34a;
          color: white;
        }

        .deleteButton {
          background: #ef4444;
          color: white;
        }

        .cancelButton {
          background: #e5e7eb;
          color: #111827;
        }

        .editForm label {
          display: block;
          font-weight: 700;
          margin-bottom: 6px;
          margin-top: 12px;
        }

        .editForm input,
        .editForm textarea,
        .editForm select {
          width: 100%;
          padding: 13px;
          border-radius: 8px;
          border: 1px solid #ccc;
          font-size: 15px;
        }

        .editForm textarea {
          min-height: 100px;
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
          margin-top: 4px;
        }

        @media (max-width: 760px) {
          .header {
            flex-direction: column;
            gap: 14px;
            padding: 18px;
          }

          .navLink {
            margin-left: 10px;
            margin-right: 10px;
          }

          .container {
            padding: 30px 16px;
          }

          .topSection {
            flex-direction: column;
            align-items: stretch;
          }

          .postButton {
            text-align: center;
          }

          .listingCard {
            grid-template-columns: 1fr;
          }

          .listingCard > img {
            height: 220px;
          }

          .listingHeader {
            flex-direction: column;
            gap: 10px;
          }

          .actions {
            flex-direction: column;
          }

          button {
            width: 100%;
          }

          .uploadBox {
            min-height: 180px;
          }
        }
      `}</style>
    </>
  );
}
