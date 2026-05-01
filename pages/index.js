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
  const [boostingProductId, setBoostingProductId] = useState(null);

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
      .order("is_featured", { ascending: false })
      .order("bumped_until", { ascending: false })
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

  async function startBoost(productId, boostType) {
    if (!user) {
      alert("Please login before boosting a listing.");
      window.location.href = "/login";
      return;
    }

    try {
      setBoostingProductId(productId);

      const response = await fetch("/api/create-boost-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          productId,
          boostType
        })
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Could not start boost payment.");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong starting the boost payment.");
    } finally {
      setBoostingProductId(null);
    }
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

    const matchesCategory = category === "All" || product.category === category;

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
            Post Free
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
              Post products for free. Boost only when you want more views.
            </h1>

            <p
              style={{
                fontSize: "18px",
                color: "#4b5563",
                marginBottom: "24px"
              }}
            >
              LocalDeal helps UK buyers find local listings and partner deals.
              Basic posting is free. Sellers can pay to bump or feature products
              for more visibility.
            </p>

            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <a
                href="/post-product"
                style={{
                  background: "#111827",
                  color: "white",
                  padding: "14px 20px",
                  borderRadius: "10px",
                  textDecoration: "none",
                  fontWeight: "700"
                }}
              >
                Post Free Listing
              </a>

              <a
                href="#products-section"
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
                Browse Products
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
            <h3 style={{ marginTop: 0 }}>Seller pricing</h3>

            <div style={priceBox}>
              <strong>Free Listing</strong>
              <span>£0</span>
            </div>

            <div style={priceBox}>
              <strong>Bump to top</strong>
              <span>£1.99 / 24 hours</span>
            </div>

            <div style={priceBox}>
              <strong>Featured placement</strong>
              <span>£4.99 / 7 days</span>
            </div>

            <p style={{ color: "#555", marginBottom: 0, marginTop: "14px" }}>
              Affiliate disclosure: some outbound links may earn LocalDeal a
              commission at no extra cost to the buyer.
            </p>
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
              Post Free Product
            </a>
          </div>

          <p style={{ color: "#666", marginBottom: "25px" }}>
            Basic listings are free. Featured and bumped products appear higher.
            Some partner links may earn commission.
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

              const isCurrentlyBoosted =
                product.bumped_until &&
                new Date(product.bumped_until) > new Date();

              const isFeatured = product.is_featured && isCurrentlyBoosted;
              const isBoosted = isFeatured || isCurrentlyBoosted;

              return (
                <div
                  key={product.id}
                  style={{
                    background: "white",
                    borderRadius: "14px",
                    overflow: "hidden",
                    border: isBoosted
                      ? "2px solid #f4b400"
                      : "1px solid #e5e7eb",
                    boxShadow: isBoosted
                      ? "0 8px 22px rgba(244,180,0,0.25)"
                      : "0 4px 14px rgba(0,0,0,0.08)"
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

                    {isFeatured && (
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
                        Featured
                      </span>
                    )}

                    {!isFeatured && isBoosted && (
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
                        Bumped
                      </span>
                    )}

                    {!isBoosted && product.is_affiliate && (
                      <span
                        style={{
                          position: "absolute",
                          top: "10px",
                          left: "10px",
                          background: "#111827",
                          color: "white",
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

                    {!product.is_affiliate && (
                      <div style={{ marginTop: "8px" }}>
                        <button
                          onClick={() => startBoost(product.id, "bump_24h")}
                          disabled={boostingProductId === product.id}
                          style={{
                            width: "100%",
                            padding: "10px",
                            background: "white",
                            color: "#111827",
                            border: "1px solid #d1d5db",
                            borderRadius: "9px",
                            cursor:
                              boostingProductId === product.id
                                ? "not-allowed"
                                : "pointer",
                            fontWeight: "700",
                            marginTop: "8px"
                          }}
                        >
                          {boostingProductId === product.id
                            ? "Loading..."
                            : "Bump to top — £1.99"}
                        </button>

                        <button
                          onClick={() => startBoost(product.id, "featured_7d")}
                          disabled={boostingProductId === product.id}
                          style={{
                            width: "100%",
                            padding: "10px",
                            background: "#f4b400",
                            color: "#111827",
                            border: "none",
                            borderRadius: "9px",
                            cursor:
                              boostingProductId === product.id
                                ? "not-allowed"
                                : "pointer",
                            fontWeight: "700",
                            marginTop: "8px"
                          }}
                        >
                          {boostingProductId === product.id
                            ? "Loading..."
                            : "Featured 7 days — £4.99"}
                        </button>
                      </div>
                    )}
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
  <p style={{ marginBottom: "18px" }}>
    LocalDeal is free to use for basic listings. Partner links may earn
    commission. Sellers can pay to bump or feature listings.
  </p>

  <div style={{ display: "flex", justifyContent: "center", gap: "18px", flexWrap: "wrap" }}>
    <a href="/about" style={{ color: "#d1d5db" }}>About</a>
    <a href="/contact" style={{ color: "#d1d5db" }}>Contact</a>
    <a href="/privacy-policy" style={{ color: "#d1d5db" }}>Privacy Policy</a>
    <a href="/terms" style={{ color: "#d1d5db" }}>Terms</a>
    <a href="/affiliate-disclosure" style={{ color: "#d1d5db" }}>Affiliate Disclosure</a>
  </div>
</div>
  );
}

const priceBox = {
  display: "flex",
  justifyContent: "space-between",
  padding: "12px 0",
  borderBottom: "1px solid #e5e7eb",
  color: "#111827"
};
