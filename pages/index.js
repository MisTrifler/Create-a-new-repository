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
    <div style={styles.page}>
      <header style={styles.topBar}>
        <a href="/" style={styles.logo}>
          LocalDeal
        </a>

        <div style={styles.searchWrap}>
          <input
            placeholder="Search products, deals, categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />

          <button
            onClick={() =>
              document.getElementById("products-section")?.scrollIntoView({
                behavior: "smooth"
              })
            }
            style={styles.searchButton}
          >
            Search
          </button>
        </div>

        <nav style={styles.nav}>
          <a href="/post-product" style={styles.navLink}>
            Post Free
          </a>

          {user ? (
            <>
              <span style={styles.email}>{user.email}</span>
              <button onClick={logout} style={styles.logoutButton}>
                Logout
              </button>
            </>
          ) : (
            <>
              <a href="/login" style={styles.navLink}>
                Login
              </a>
              <a href="/signup" style={styles.signupButton}>
                Sign Up
              </a>
            </>
          )}
        </nav>
      </header>

      <div style={styles.categoryBar}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{
              ...styles.categoryButton,
              background: category === cat ? "#f4b400" : "transparent",
              color: category === cat ? "#111827" : "white"
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <section style={styles.hero}>
        <div style={styles.heroInner}>
          <div>
            <h1 style={styles.heroTitle}>
              Post products for free. Boost only when you want more views.
            </h1>

            <p style={styles.heroText}>
              LocalDeal helps UK buyers find local listings and partner deals.
              Basic posting is free. Sellers can pay to bump or feature products
              for more visibility.
            </p>

            <div style={styles.heroButtons}>
              <a href="/post-product" style={styles.primaryButton}>
                Post Free Listing
              </a>

              <a href="#products-section" style={styles.secondaryButton}>
                Browse Products
              </a>
            </div>
          </div>

          <div style={styles.priceCard}>
            <h3>Seller pricing</h3>

            <div style={styles.priceRow}>
              <strong>Free Listing</strong>
              <span>£0</span>
            </div>

            <div style={styles.priceRow}>
              <strong>Bump to top</strong>
              <span>£1.99 / 24 hours</span>
            </div>

            <div style={styles.priceRow}>
              <strong>Featured placement</strong>
              <span>£4.99 / 7 days</span>
            </div>

            <p style={styles.smallText}>
              Affiliate disclosure: some outbound links may earn LocalDeal a
              commission at no extra cost to the buyer.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={styles.howSection}>
        <div style={styles.howInner}>
          <h2 style={styles.howTitle}>How LocalDeal Works</h2>

          <p style={styles.howSubtitle}>
            Find local listings, partner deals and useful products in one simple
            place.
          </p>

          <div style={styles.howGrid}>
            <div style={styles.howCard}>
              <div style={styles.howIcon}>🔍</div>
              <h3>Browse Deals</h3>
              <p style={styles.howText}>
                Search products, categories and local listings from sellers and
                partner websites.
              </p>
            </div>

            <div style={styles.howCard}>
              <div style={styles.howIcon}>📩</div>
              <h3>Contact or Buy</h3>
              <p style={styles.howText}>
                Contact local sellers directly or visit trusted partner websites
                through product links.
              </p>
            </div>

            <div style={styles.howCard}>
              <div style={styles.howIcon}>🆓</div>
              <h3>Post for Free</h3>
              <p style={styles.howText}>
                Sellers can create a free account and post products without a
                monthly fee.
              </p>
            </div>

            <div style={styles.howCard}>
              <div style={styles.howIcon}>🚀</div>
              <h3>Boost Visibility</h3>
              <p style={styles.howText}>
                Sellers can optionally bump or feature listings to appear higher
                on LocalDeal.
              </p>
            </div>
          </div>
        </div>
      </section>

      <main id="products-section" style={styles.productsSection}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>🔥 Featured Products</h2>
            <p style={styles.sectionText}>
              Basic listings are free. Featured and bumped products appear
              higher. Some partner links may earn commission.
            </p>
          </div>

          <a href="/post-product" style={styles.primaryButton}>
            Post Free Product
          </a>
        </div>

        {loading && <p>Loading products...</p>}

        {!loading && filteredProducts.length === 0 && (
          <p>No products found. Try another search or post the first item.</p>
        )}

        <div style={styles.grid}>
          {filteredProducts.map((product) => {
            const discount =
              product.old_price && product.price
                ? Math.round(
                    ((product.old_price - product.price) / product.old_price) *
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
                  ...styles.card,
                  border: isBoosted
                    ? "2px solid #f4b400"
                    : "1px solid #e5e7eb"
                }}
              >
                <div style={styles.imageWrap}>
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
                    style={styles.image}
                  />

                  {isFeatured && <span style={styles.badge}>Featured</span>}

                  {!isFeatured && isBoosted && (
                    <span style={styles.badge}>Bumped</span>
                  )}

                  {!isBoosted && product.is_affiliate && (
                    <span style={styles.partnerBadge}>Partner</span>
                  )}
                </div>

                <div style={styles.cardBody}>
                  <p style={styles.meta}>
                    {product.source_website || "LocalDeal"} ·{" "}
                    {product.category || "General"}
                  </p>

                  <h3 style={styles.productTitle}>{product.title}</h3>

                  <p style={styles.description}>{product.description}</p>

                  <div style={styles.priceLine}>
                    <span style={styles.price}>£{product.price}</span>

                    {product.old_price && (
                      <span style={styles.oldPrice}>£{product.old_price}</span>
                    )}
                  </div>

                  {discount !== null && (
                    <p style={styles.discount}>{discount}% OFF</p>
                  )}

                  <p style={styles.location}>📍 {product.location || "Online"}</p>

                  <button
                    onClick={() => openProduct(product)}
                    style={styles.darkButton}
                  >
                    {product.is_affiliate
                      ? "View Partner Deal"
                      : "Contact Seller"}
                  </button>

                  {!product.is_affiliate && (
                    <>
                      <button
                        onClick={() => startBoost(product.id, "bump_24h")}
                        disabled={boostingProductId === product.id}
                        style={styles.outlineButton}
                      >
                        {boostingProductId === product.id
                          ? "Loading..."
                          : "Bump to top — £1.99"}
                      </button>

                      <button
                        onClick={() => startBoost(product.id, "featured_7d")}
                        disabled={boostingProductId === product.id}
                        style={styles.goldButton}
                      >
                        {boostingProductId === product.id
                          ? "Loading..."
                          : "Featured 7 days — £4.99"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <footer style={styles.footer}>
        <p style={{ marginBottom: "18px" }}>
          LocalDeal is free to use for basic listings. Partner links may earn
          commission. Sellers can pay to bump or feature listings.
        </p>

        <div style={styles.footerLinks}>
          <a href="/about" style={styles.footerLink}>
            About
          </a>
          <a href="/contact" style={styles.footerLink}>
            Contact
          </a>
          <a href="/privacy-policy" style={styles.footerLink}>
            Privacy Policy
          </a>
          <a href="/terms" style={styles.footerLink}>
            Terms
          </a>
          <a href="/affiliate-disclosure" style={styles.footerLink}>
            Affiliate Disclosure
          </a>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  page: {
    fontFamily: "Arial, sans-serif",
    background: "#f3f4f6",
    minHeight: "100vh"
  },
  topBar: {
    background: "#111827",
    color: "white",
    padding: "12px 40px",
    display: "flex",
    alignItems: "center",
    position: "sticky",
    top: 0,
    zIndex: 20
  },
  logo: {
    color: "white",
    textDecoration: "none",
    fontSize: "26px",
    fontWeight: "800"
  },
  searchWrap: {
    flex: 1,
    margin: "0 30px",
    display: "flex"
  },
  searchInput: {
    flex: 1,
    padding: "13px",
    border: "none",
    borderRadius: "8px 0 0 8px",
    fontSize: "15px"
  },
  searchButton: {
    padding: "13px 22px",
    background: "#f4b400",
    border: "none",
    borderRadius: "0 8px 8px 0",
    cursor: "pointer",
    fontWeight: "bold"
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: "16px"
  },
  navLink: {
    color: "white",
    textDecoration: "none",
    fontWeight: "500"
  },
  email: {
    fontSize: "13px",
    color: "#d1d5db"
  },
  logoutButton: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "9px 13px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600"
  },
  signupButton: {
    color: "#111827",
    background: "#f4b400",
    textDecoration: "none",
    padding: "9px 13px",
    borderRadius: "8px",
    fontWeight: "700"
  },
  categoryBar: {
    background: "#1f2937",
    padding: "10px 40px",
    display: "flex",
    gap: "12px",
    overflowX: "auto"
  },
  categoryButton: {
    border: "1px solid #374151",
    padding: "8px 14px",
    borderRadius: "999px",
    cursor: "pointer",
    fontWeight: "600",
    whiteSpace: "nowrap"
  },
  hero: {
    padding: "55px 40px",
    background:
      "linear-gradient(135deg, #fef3c7 0%, #ffffff 45%, #dbeafe 100%)"
  },
  heroInner: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1.4fr 1fr",
    gap: "35px",
    alignItems: "center"
  },
  heroTitle: {
    fontSize: "54px",
    lineHeight: "1.05",
    marginBottom: "18px"
  },
  heroText: {
    fontSize: "18px",
    color: "#4b5563",
    marginBottom: "24px"
  },
  heroButtons: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap"
  },
  primaryButton: {
    background: "#111827",
    color: "white",
    padding: "14px 20px",
    borderRadius: "10px",
    textDecoration: "none",
    fontWeight: "700"
  },
  secondaryButton: {
    background: "white",
    color: "#111827",
    padding: "14px 20px",
    borderRadius: "10px",
    textDecoration: "none",
    fontWeight: "700",
    border: "1px solid #d1d5db"
  },
  priceCard: {
    background: "white",
    borderRadius: "18px",
    padding: "25px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
  },
  priceRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 0",
    borderBottom: "1px solid #e5e7eb",
    color: "#111827"
  },
  smallText: {
    color: "#555",
    marginBottom: 0,
    marginTop: "14px"
  },
  howSection: {
    padding: "45px 40px",
    background: "white"
  },
  howInner: {
    maxWidth: "1200px",
    margin: "0 auto",
    textAlign: "center"
  },
  howTitle: {
    fontSize: "32px",
    marginBottom: "12px",
    color: "#111827"
  },
  howSubtitle: {
    color: "#555",
    fontSize: "17px",
    marginBottom: "35px"
  },
  howGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "22px"
  },
  howCard: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.05)"
  },
  howIcon: {
    fontSize: "34px",
    marginBottom: "10px"
  },
  howText: {
    color: "#555",
    fontSize: "14px",
    lineHeight: "1.6"
  },
  productsSection: {
    padding: "45px 40px",
    maxWidth: "1300px",
    margin: "0 auto"
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    gap: "20px"
  },
  sectionTitle: {
    fontSize: "30px",
    margin: 0
  },
  sectionText: {
    color: "#666"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
    gap: "22px"
  },
  card: {
    background: "white",
    borderRadius: "14px",
    overflow: "hidden",
    boxShadow: "0 4px 14px rgba(0,0,0,0.08)"
  },
  imageWrap: {
    position: "relative"
  },
  image: {
    width: "100%",
    height: "190px",
    objectFit: "cover"
  },
  badge: {
    position: "absolute",
    top: "10px",
    left: "10px",
    background: "#f4b400",
    color: "#111827",
    padding: "5px 8px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700"
  },
  partnerBadge: {
    position: "absolute",
    top: "10px",
    left: "10px",
    background: "#111827",
    color: "white",
    padding: "5px 8px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "700"
  },
  cardBody: {
    padding: "15px"
  },
  meta: {
    color: "#6b7280",
    fontSize: "13px",
    margin: "0 0 6px"
  },
  productTitle: {
    margin: "0 0 10px",
    fontSize: "17px",
    lineHeight: "1.25",
    minHeight: "42px"
  },
  description: {
    color: "#555",
    fontSize: "14px",
    minHeight: "42px"
  },
  priceLine: {
    margin: "12px 0"
  },
  price: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#111827"
  },
  oldPrice: {
    marginLeft: "8px",
    color: "#6b7280",
    textDecoration: "line-through"
  },
  discount: {
    color: "green",
    fontWeight: "700",
    margin: "0 0 12px"
  },
  location: {
    fontSize: "13px",
    color: "#6b7280"
  },
  darkButton: {
    width: "100%",
    padding: "12px",
    background: "#111827",
    color: "white",
    border: "none",
    borderRadius: "9px",
    cursor: "pointer",
    fontWeight: "700",
    marginTop: "10px"
  },
  outlineButton: {
    width: "100%",
    padding: "10px",
    background: "white",
    color: "#111827",
    border: "1px solid #d1d5db",
    borderRadius: "9px",
    cursor: "pointer",
    fontWeight: "700",
    marginTop: "8px"
  },
  goldButton: {
    width: "100%",
    padding: "10px",
    background: "#f4b400",
    color: "#111827",
    border: "none",
    borderRadius: "9px",
    cursor: "pointer",
    fontWeight: "700",
    marginTop: "8px"
  },
  footer: {
    background: "#111827",
    color: "#d1d5db",
    textAlign: "center",
    padding: "35px"
  },
  footerLinks: {
    display: "flex",
    justifyContent: "center",
    gap: "18px",
    flexWrap: "wrap"
  },
  footerLink: {
    color: "#d1d5db"
  }
};
