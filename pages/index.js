import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUser();
    fetchProducts();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function checkUser() {
    const { data } = await supabase.auth.getUser();
    setUser(data?.user || null);
  }

  async function fetchProducts() {
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      alert("Supabase error: " + error.message);
      setProducts([]);
    } else {
      setProducts(data || []);
    }

    setLoading(false);
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
    alert("Logged out successfully.");
  }

  const filteredProducts = products.filter((product) => {
    const value = search.toLowerCase();

    return (
      search === "" ||
      product.title?.toLowerCase().includes(value) ||
      product.location?.toLowerCase().includes(value) ||
      product.category?.toLowerCase().includes(value) ||
      product.seller_name?.toLowerCase().includes(value)
    );
  });

  function contactSeller(product) {
    if (product.product_url && product.product_url.startsWith("http")) {
      window.location.href = product.product_url;
      return;
    }

    if (product.contact_email) {
      window.location.href = `mailto:${product.contact_email}?subject=Interested in ${product.title}`;
      return;
    }

    alert("No contact details available for this product.");
  }

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        background: "#f8fafc",
        minHeight: "100vh"
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 40px",
          background: "white",
          borderBottom: "1px solid #e5e7eb",
          position: "sticky",
          top: 0,
          zIndex: 10
        }}
      >
        <a href="/" style={{ textDecoration: "none", color: "#111" }}>
          <h2 style={{ margin: 0 }}>LocalDeal</h2>
        </a>

        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <a
            href="/post-product"
            style={{
              textDecoration: "none",
              color: "#111",
              fontWeight: "500"
            }}
          >
            Post Product
          </a>

          {user ? (
            <>
              <span style={{ fontSize: "14px", color: "#555" }}>
                {user.email}
              </span>

              <button
                onClick={logout}
                style={{
                  padding: "10px 16px",
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600"
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <a
                href="/login"
                style={{
                  textDecoration: "none",
                  color: "#111",
                  fontWeight: "500"
                }}
              >
                Login
              </a>

              <a
                href="/signup"
                style={{
                  padding: "10px 16px",
                  background: "#111827",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "8px",
                  fontWeight: "600"
                }}
              >
                Sign Up
              </a>
            </>
          )}
        </div>
      </div>

      {/* HERO */}
      <div
        style={{
          textAlign: "center",
          padding: "80px 20px",
          background: "white"
        }}
      >
        <h1
          style={{
            fontSize: "52px",
            marginBottom: "15px",
            lineHeight: "1.1"
          }}
        >
          Buy and Sell Local Products Near You
        </h1>

        <p
          style={{
            color: "#555",
            fontSize: "18px",
            marginBottom: "30px"
          }}
        >
          Find local deals, second-hand products, services and offers from people
          and businesses nearby.
        </p>

        <input
          placeholder="Search by town, product or category"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "15px",
            width: "320px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            marginRight: "10px",
            fontSize: "15px"
          }}
        />

        <button
          onClick={() => {
            document
              .getElementById("products-section")
              ?.scrollIntoView({ behavior: "smooth" });
          }}
          style={{
            padding: "15px 26px",
            background: "#f4b400",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "15px"
          }}
        >
          Search
        </button>
      </div>

      {/* PRODUCTS */}
      <div id="products-section" style={{ padding: "55px 45px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "25px"
          }}
        >
          <h2 style={{ fontSize: "28px", margin: 0 }}>🔥 Latest Products</h2>

          <a
            href="/post-product"
            style={{
              padding: "12px 18px",
              background: "#111827",
              color: "white",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "600"
            }}
          >
            Sell Something
          </a>
        </div>

        {loading && <p>Loading products...</p>}

        {!loading && filteredProducts.length === 0 && (
          <p>No products found. Try another search or post the first product.</p>
        )}

        <div
          style={{
            display: "flex",
            gap: "28px",
            flexWrap: "wrap"
          }}
        >
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              style={{
                width: "285px",
                background: "white",
                borderRadius: "16px",
                overflow: "hidden",
                border: "1px solid #e5e7eb",
                boxShadow: "0 6px 18px rgba(0,0,0,0.08)"
              }}
            >
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
                style={{
                  width: "100%",
                  height: "180px",
                  objectFit: "cover"
                }}
              />

              <div style={{ padding: "18px" }}>
                <p
                  style={{
                    color: "#666",
                    fontSize: "14px",
                    margin: "0 0 8px"
                  }}
                >
                  {product.category || "General"} ·{" "}
                  {product.location || "Local Area"}
                </p>

                <h3 style={{ margin: "0 0 12px", fontSize: "20px" }}>
                  {product.title}
                </h3>

                {product.description && (
                  <p
                    style={{
                      color: "#555",
                      fontSize: "14px",
                      minHeight: "40px"
                    }}
                  >
                    {product.description}
                  </p>
                )}

                <p
                  style={{
                    fontSize: "22px",
                    fontWeight: "bold",
                    margin: "12px 0"
                  }}
                >
                  £{product.price}
                </p>

                <p style={{ color: "#666", fontSize: "14px" }}>
                  Seller: {product.seller_name || "Local Seller"}
                </p>

                <button
                  onClick={() => contactSeller(product)}
                  style={{
                    width: "100%",
                    padding: "13px",
                    background: "#111827",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    marginTop: "12px"
                  }}
                >
                  Contact Seller
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div
        style={{
          textAlign: "center",
          padding: "45px",
          color: "#666"
        }}
      >
        <p>🔥 New local listings added daily</p>
        <p>📍 Built for local buyers, sellers and businesses</p>
      </div>
    </div>
  );
}
