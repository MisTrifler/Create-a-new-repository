import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const categories = [
  "All",
  "Electronics",
  "Phones",
  "Home",
  "Fashion",
  "Cars",
  "Beauty",
  "Fitness",
  "Services"
];

export default function Home() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
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

  function openProduct(product) {
    if (product.affiliate_url && product.affiliate_url.startsWith("http")) {
      window.location.href = product.affiliate_url;
      return;
    }

    if (product.affiliate_url && product.affiliate_url.startsWith("mailto:")) {
      window.location.href = product.affiliate_url;
      return;
    }

    if (product.contact_email) {
      window.location.href = `mailto:${product.contact_email}?subject=Interested in ${product.title}`;
      return;
    }

    alert("No valid link found for this product.");
  }

  const filteredProducts = products.filter((product) => {
    const value = search.toLowerCase();

    const matchesSearch =
      search === "" ||
      product.title?.toLowerCase().includes(value) ||
      product.description?.toLowerCase().includes(value) ||
      product.location?.toLowerCase().includes(value) ||
      product.category?.toLowerCase().includes(value) ||
      product.source_website?.toLowerCase().includes(value);

    const matchesCategory =
      category === "All" || product.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        background: "#f3f4f6",
        minHeight: "100vh"
      }}
    >
      {/* TOP BAR */}
      <div
        style={{
          background: "#111827",
          color: "white",
          padding: "12px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 20
        }}
      >
        <a href="/" style={{ textDecoration: "none", color: "white" }}>
          <h2 style={{ margin: 0 }}>LocalDeal</h2>
        </a>

        <div style={{ flex: 1, margin: "0 30px", display: "flex" }}>
          <input
            placeholder="Search products, deals, categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              padding: "13px",
              border: "none",
              borderRadius: "8px 0 0 8px",
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
              padding: "13px 22px",
              background: "#f4b400",
              border: "none",
              borderRadius: "0 8px 8px 0",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Search
          </button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <a
            href="/post-product"
            style={{
              color: "white",
              textDecoration: "none",
              fontWeight: "500"
            }}
          >
            Sell
          </a>

          {user ? (
            <>
              <span style={{ fontSize: "13px", color: "#d1d5db" }}>
                {user.email}
              </span>

              <button
                onClick={logout}
                style={{
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  padding: "9px 13px",
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
                style={{ color: "white", textDecoration: "none" }}
              >
                Login
              </a>

              <a
                href="/signup"
                style={{
                  color: "#111827",
                  background: "#f4b400",
                  textDecoration: "none",
                  padding: "9px 13px",
                  borderRadius: "8px",
                  fontWeight: "700"
                }}
              >
                Sign Up
              </a>
            </>
          )}
        </div>
      </div>

      {/* CATEGORY BAR */}
      <div
        style={{
          background: "#1f2937",
          padding: "10px 40px",
          display: "flex",
          gap: "12px",
          overflowX: "auto"
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{
              background: category === cat ? "#f4b400" : "transparent",
              color: category === cat ? "#111827" : "white",
              border: "1px solid #374151",
              padding: "8px 14px",
              borderRadius: "999px",
              cursor: "pointer",
              fontWeight: "600",
              whiteSpace: "nowrap"
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* HERO */}
      <div
        style={{
          padding: "55px 40px",
          background:
            "linear-gradient(135deg, #fef3c7 0%, #ffffff 45%, #dbeafe 100%)"
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1.4fr 1fr",
            gap: "35px",
            alignItems: "center"
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "54px",
                lineHeight: "1.05",
                marginBottom: "18px"
              }}
            >
              Shop local deals and partner products in one place
            </h1>

            <p
              style={{
                fontSize: "18px",
                color: "#4b5563",
                marginBottom: "24px"
              }}
            >
              Discover products from local sellers and trusted partner websites.
              Some links may earn LocalDeal a commission.
            </p>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <a
                href="#products-section"
                style={{
                  background: "#111827",
                  color: "white",
                  padding: "14px 20px",
                  borderRadius: "10px",
                  textDecoration: "none",
                  fontWeight: "700"
                }}
              >
                Browse Products
              </a>

              <a
                href="/post-product"
                style={{
                  background: "white",
                  color: "#111827",
                  padding: "14px 20px",
                  borderRadius: "10px",
                  textDecoration: "none",
                  fontWeight: "700",
                  border: "1px solid #d1d5db"
                }}
              >
                Sell Your Product
              </a>
            </div>
          </div>

          <div
            style={{
              background: "white",
              borderRadius: "18px",
              padding: "25px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
            }}
          >
            <h3 style={{ marginTop: 0 }}>How commissions work</h3>
            <p style={{ color: "#555" }}>
              Join affiliate programmes, paste your tracked affiliate links into
              products, and earn when buyers purchase through your links.
            </p>
            <ul style={{ color: "#555", lineHeight: "1.8" }}>
              <li>Amazon Associates links</li>
              <li>eBay Partner Network links</li>
              <li>Awin partner brand links</li>
              <li>Local sellers can post their own items</li>
            </ul>
          </div>
        </div>
      </div>

      {/* PRODUCTS */}
      <div id="products-section" style={{ padding: "45px 40px" }}>
        <div
          style={{
            maxWidth: "1300px",
            margin: "0 auto"
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px"
            }}
          >
            <h2 style={{ fontSize: "30px", margin: 0 }}>
              🔥 Featured Products
            </h2>

            <a
              href="/post-product"
              style={{
                background: "#111827",
                color: "white",
                padding: "12px 18px",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: "700"
              }}
            >
              Post Product
            </a>
          </div>

          <p style={{ color: "#666", marginBottom: "25px" }}>
            Affiliate disclosure: some outbound links may earn LocalDeal a
            commission at no extra cost to the buyer.
          </p>

          {loading && <p>Loading products...</p>}

          {!loading && filteredProducts.length === 0 && (
            <p>No products found. Try another search or post the first item.</p>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
              gap: "22px"
            }}
          >
            {filteredProducts.map((product) => {
              const discount =
                product.old_price && product.price
                  ? Math.round(
                      ((product.old_price - product.price) /
                        product.old_price) *
                        100
                    )
                  : null;

              return (
                <div
                  key={product.id}
                  style={{
                    background: "white",
                    borderRadius: "14px",
                    overflow: "hidden",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
                  }}
                >
                  <div style={{ position: "relative" }}>
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
                        height: "190px",
                        objectFit: "cover"
                      }}
                    />

                    {product.is_affiliate && (
                      <span
                        style={{
                          position: "absolute",
                          top: "10px",
                          left: "10px",
                          background: "#f4b400",
                          color: "#111827",
                          padding: "5px 8px",
                          borderRadius: "999px",
                          fontSize: "12px",
                          fontWeight: "700"
                        }}
                      >
                        Partner
                      </span>
                    )}
                  </div>

                  <div style={{ padding: "15px" }}>
                    <p
                      style={{
                        color: "#6b7280",
                        fontSize: "13px",
                        margin: "0 0 6px"
                      }}
                    >
                      {product.source_website || "LocalDeal"} ·{" "}
                      {product.category || "General"}
                    </p>

                    <h3
                      style={{
                        margin: "0 0 10px",
                        fontSize: "17px",
                        lineHeight: "1.25",
                        minHeight: "42px"
                      }}
                    >
                      {product.title}
                    </h3>

                    <p
                      style={{
                        color: "#555",
                        fontSize: "14px",
                        minHeight: "42px"
                      }}
                    >
                      {product.description}
                    </p>

                    <div style={{ margin: "12px 0" }}>
                      <span
                        style={{
                          fontSize: "22px",
                          fontWeight: "800",
                          color: "#111827"
                        }}
                      >
                        £{product.price}
                      </span>

                      {product.old_price && (
                        <span
                          style={{
                            marginLeft: "8px",
                            color: "#6b7280",
                            textDecoration: "line-through"
                          }}
                        >
                          £{product.old_price}
                        </span>
                      )}
                    </div>

                    {discount !== null && (
                      <p
                        style={{
                          color: "green",
                          fontWeight: "700",
                          margin: "0 0 12px"
                        }}
                      >
                        {discount}% OFF
                      </p>
                    )}

                    <p style={{ fontSize: "13px", color: "#6b7280" }}>
                      📍 {product.location || "Online"}
                    </p>

                    <button
                      onClick={() => openProduct(product)}
                      style={{
                        width: "100%",
                        padding: "12px",
                        background: "#111827",
                        color: "white",
                        border: "none",
                        borderRadius: "9px",
                        cursor: "pointer",
                        fontWeight: "700",
                        marginTop: "10px"
                      }}
                    >
                      {product.is_affiliate
                        ? "View Partner Deal"
                        : "Contact Seller"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div
        style={{
          background: "#111827",
          color: "#d1d5db",
          textAlign: "center",
          padding: "35px"
        }}
      >
        <p style={{ margin: 0 }}>
          LocalDeal may earn commission from partner links. Local seller listings
          are posted by users.
        </p>
      </div>
    </div>
  );
}
