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
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [boostingProductId, setBoostingProductId] = useState(null);

  useEffect(() => {
    checkUser();
    fetchProducts();
    fetchReviews();

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

  async function fetchReviews() {
    const { data, error } = await supabase.from("reviews").select("*");

    if (!error) {
      setReviews(data || []);
    }
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

  function getSellerReviewStats(email) {
    if (!email) {
      return { count: 0, average: null };
    }

    const sellerReviews = reviews.filter(
      (review) => review.reviewed_email === email
    );

    if (sellerReviews.length === 0) {
      return { count: 0, average: null };
    }

    const total = sellerReviews.reduce(
      (sum, review) => sum + Number(review.rating || 0),
      0
    );

    return {
      count: sellerReviews.length,
      average: (total / sellerReviews.length).toFixed(1)
    };
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
    <>
      <div className="page">
        <header className="topBar">
          <a href="/" className="logo">
            LocalDeal
          </a>

          <div className="searchWrap">
            <input
              placeholder="Search products, deals, categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="searchInput"
            />

            <button
              onClick={() =>
                document.getElementById("products-section")?.scrollIntoView({
                  behavior: "smooth"
                })
              }
              className="searchButton"
            >
              Search
            </button>
          </div>

          <nav className="nav">
            <a href="/post-product" className="navLink">
              Post Free
            </a>

            {user ? (
              <>
                <span className="email">{user.email}</span>
                <button onClick={logout} className="logoutButton">
                  Logout
                </button>
              </>
            ) : (
              <>
                <a href="/login" className="navLink">
                  Login
                </a>
                <a href="/signup" className="signupButton">
                  Sign Up
                </a>
              </>
            )}
          </nav>
        </header>

        <div className="categoryBar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={category === cat ? "category active" : "category"}
            >
              {cat}
            </button>
          ))}
        </div>

        <section className="hero">
          <div className="heroInner">
            <div>
              <h1>Post products for free. Boost only when you want more views.</h1>

              <p>
                LocalDeal helps UK buyers find local listings and partner deals.
                Basic posting is free. Sellers can pay to bump or feature products
                for more visibility.
              </p>

              <div className="heroButtons">
                <a href="/post-product" className="primaryButton">
                  Post Free Listing
                </a>

                <a href="#products-section" className="secondaryButton">
                  Browse Products
                </a>
              </div>
            </div>

            <div className="priceCard">
              <h3>Seller pricing</h3>

              <div className="priceRow">
                <strong>Free Listing</strong>
                <span>£0</span>
              </div>

              <div className="priceRow">
                <strong>Bump to top</strong>
                <span>£1.99 / 24 hours</span>
              </div>

              <div className="priceRow">
                <strong>Featured placement</strong>
                <span>£4.99 / 7 days</span>
              </div>

              <p>
                Affiliate disclosure: some outbound links may earn LocalDeal a
                commission at no extra cost to the buyer.
              </p>
            </div>
          </div>
        </section>

        <section className="howSection">
          <div className="howInner">
            <h2>How LocalDeal Works</h2>

            <p className="howSubtitle">
              Find local listings, partner deals and useful products in one simple
              place.
            </p>

            <div className="howGrid">
              <div className="howCard">
                <div className="howIcon">🔍</div>
                <h3>Browse Deals</h3>
                <p>
                  Search products, categories and local listings from sellers and
                  partner websites.
                </p>
              </div>

              <div className="howCard">
                <div className="howIcon">📩</div>
                <h3>Contact or Buy</h3>
                <p>
                  Contact local sellers directly or visit trusted partner websites
                  through product links.
                </p>
              </div>

              <div className="howCard">
                <div className="howIcon">🆓</div>
                <h3>Post for Free</h3>
                <p>
                  Sellers can create a free account and post products without a
                  monthly fee.
                </p>
              </div>

              <div className="howCard">
                <div className="howIcon">🚀</div>
                <h3>Boost Visibility</h3>
                <p>
                  Sellers can optionally bump or feature listings to appear higher
                  on LocalDeal.
                </p>
              </div>
            </div>
          </div>
        </section>

        <main id="products-section" className="productsSection">
          <div className="sectionHeader">
            <div>
              <h2>🔥 Featured Products</h2>
              <p>
                Basic listings are free. Featured and bumped products appear
                higher. Some partner links may earn commission.
              </p>
            </div>

            <a href="/post-product" className="primaryButton postButton">
              Post Free Product
            </a>
          </div>

          {loading && <p>Loading products...</p>}

          {!loading && filteredProducts.length === 0 && (
            <p>No products found. Try another search or post the first item.</p>
          )}

          <div className="grid">
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

              const sellerStats = getSellerReviewStats(product.contact_email);

              return (
                <div
                  key={product.id}
                  className={isBoosted ? "card boostedCard" : "card"}
                >
                  <div className="imageWrap">
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

                    {isFeatured && <span className="badge">Featured</span>}

                    {!isFeatured && isBoosted && (
                      <span className="badge">Bumped</span>
                    )}

                    {!isBoosted && product.is_affiliate && (
                      <span className="partnerBadge">Partner</span>
                    )}
                  </div>

                  <div className="cardBody">
                    <p className="meta">
                      {product.source_website || "LocalDeal"} ·{" "}
                      {product.category || "General"}
                    </p>

                    <h3>{product.title}</h3>

                    <p className="description">{product.description}</p>

                    <div className="priceLine">
                      <span className="price">£{product.price}</span>

                      {product.old_price && (
                        <span className="oldPrice">£{product.old_price}</span>
                      )}
                    </div>

                    {discount !== null && (
                      <p className="discount">{discount}% OFF</p>
                    )}

                    <p className="location">📍 {product.location || "Online"}</p>

                    {!product.is_affiliate && (
                      <div className="sellerTrustBox">
                        <p className="sellerName">
                          Seller: {product.seller_name || "Local Seller"}
                        </p>

                        {sellerStats.count > 0 ? (
                          <p className="reviewStats">
                            ⭐ {sellerStats.average} / 5 ({sellerStats.count}{" "}
                            {sellerStats.count === 1 ? "review" : "reviews"})
                          </p>
                        ) : (
                          <p className="reviewStats muted">⭐ No reviews yet</p>
                        )}

                        {product.contact_email && (
                          <a
                            href={`/review?email=${encodeURIComponent(
                              product.contact_email
                            )}&name=${encodeURIComponent(
                              product.seller_name || "Seller"
                            )}&type=seller`}
                            className="reviewLink"
                          >
                            Review Seller
                          </a>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => openProduct(product)}
                      className="darkButton"
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
                          className="outlineButton"
                        >
                          {boostingProductId === product.id
                            ? "Loading..."
                            : "Bump to top — £1.99"}
                        </button>

                        <button
                          onClick={() => startBoost(product.id, "featured_7d")}
                          disabled={boostingProductId === product.id}
                          className="goldButton"
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

        <footer className="footer">
          <p>
            LocalDeal is free to use for basic listings. Partner links may earn
            commission. Sellers can pay to bump or feature listings.
          </p>

          <div className="footerLinks">
            <a href="/about">About</a>
            <a href="/contact">Contact</a>
            <a href="/privacy-policy">Privacy Policy</a>
            <a href="/terms">Terms</a>
            <a href="/affiliate-disclosure">Affiliate Disclosure</a>
          </div>
        </footer>
      </div>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page {
          font-family: Arial, sans-serif;
          background: #f3f4f6;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .topBar {
          background: #111827;
          color: white;
          padding: 12px 40px;
          display: flex;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 20;
          gap: 20px;
        }

        .logo {
          color: white;
          text-decoration: none;
          font-size: 26px;
          font-weight: 800;
          white-space: nowrap;
        }

        .searchWrap {
          flex: 1;
          display: flex;
          min-width: 250px;
        }

        .searchInput {
          flex: 1;
          padding: 13px;
          border: none;
          border-radius: 8px 0 0 8px;
          font-size: 15px;
          min-width: 0;
        }

        .searchButton {
          padding: 13px 22px;
          background: #f4b400;
          border: none;
          border-radius: 0 8px 8px 0;
          cursor: pointer;
          font-weight: bold;
        }

        .nav {
          display: flex;
          align-items: center;
          gap: 16px;
          white-space: nowrap;
        }

        .navLink {
          color: white;
          text-decoration: none;
          font-weight: 500;
        }

        .email {
          font-size: 13px;
          color: #d1d5db;
          max-width: 180px;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .logoutButton {
          background: #ef4444;
          color: white;
          border: none;
          padding: 9px 13px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }

        .signupButton {
          color: #111827;
          background: #f4b400;
          text-decoration: none;
          padding: 9px 13px;
          border-radius: 8px;
          font-weight: 700;
        }

        .categoryBar {
          background: #1f2937;
          padding: 10px 40px;
          display: flex;
          gap: 12px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .categoryBar::-webkit-scrollbar {
          display: none;
        }

        .category {
          border: 1px solid #374151;
          padding: 8px 14px;
          border-radius: 999px;
          cursor: pointer;
          font-weight: 600;
          white-space: nowrap;
          background: transparent;
          color: white;
        }

        .category.active {
          background: #f4b400;
          color: #111827;
        }

        .hero {
          padding: 55px 40px;
          background: linear-gradient(
            135deg,
            #fef3c7 0%,
            #ffffff 45%,
            #dbeafe 100%
          );
        }

        .heroInner {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 35px;
          align-items: center;
        }

        .hero h1 {
          font-size: 54px;
          line-height: 1.05;
          margin-bottom: 18px;
        }

        .hero p {
          font-size: 18px;
          color: #4b5563;
          margin-bottom: 24px;
        }

        .heroButtons {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .primaryButton,
        .secondaryButton {
          padding: 14px 20px;
          border-radius: 10px;
          text-decoration: none;
          font-weight: 700;
          display: inline-block;
        }

        .primaryButton {
          background: #111827;
          color: white;
        }

        .secondaryButton {
          background: white;
          color: #111827;
          border: 1px solid #d1d5db;
        }

        .priceCard {
          background: white;
          border-radius: 18px;
          padding: 25px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .priceRow {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #e5e7eb;
          color: #111827;
          gap: 12px;
        }

        .priceCard p {
          color: #555;
          margin-bottom: 0;
          margin-top: 14px;
        }

        .howSection {
          padding: 45px 40px;
          background: white;
        }

        .howInner {
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
        }

        .howInner h2 {
          font-size: 32px;
          margin-bottom: 12px;
          color: #111827;
        }

        .howSubtitle {
          color: #555;
          font-size: 17px;
          margin-bottom: 35px;
        }

        .howGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 22px;
        }

        .howCard {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
        }

        .howIcon {
          font-size: 34px;
          margin-bottom: 10px;
        }

        .howCard p {
          color: #555;
          font-size: 14px;
          line-height: 1.6;
        }

        .productsSection {
          padding: 45px 40px;
          max-width: 1300px;
          margin: 0 auto;
        }

        .sectionHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          gap: 20px;
        }

        .sectionHeader h2 {
          font-size: 30px;
          margin: 0;
        }

        .sectionHeader p {
          color: #666;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
          gap: 22px;
        }

        .card {
          background: white;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
          min-width: 0;
        }

        .boostedCard {
          border: 2px solid #f4b400;
          box-shadow: 0 8px 22px rgba(244, 180, 0, 0.25);
        }

        .imageWrap {
          position: relative;
        }

        .imageWrap img {
          width: 100%;
          height: 190px;
          object-fit: cover;
          display: block;
        }

        .badge,
        .partnerBadge {
          position: absolute;
          top: 10px;
          left: 10px;
          padding: 5px 8px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
        }

        .badge {
          background: #f4b400;
          color: #111827;
        }

        .partnerBadge {
          background: #111827;
          color: white;
        }

        .cardBody {
          padding: 15px;
        }

        .meta {
          color: #6b7280;
          font-size: 13px;
          margin: 0 0 6px;
        }

        .card h3 {
          margin: 0 0 10px;
          font-size: 17px;
          line-height: 1.25;
          min-height: 42px;
        }

        .description {
          color: #555;
          font-size: 14px;
          min-height: 42px;
        }

        .priceLine {
          margin: 12px 0;
        }

        .price {
          font-size: 22px;
          font-weight: 800;
          color: #111827;
        }

        .oldPrice {
          margin-left: 8px;
          color: #6b7280;
          text-decoration: line-through;
        }

        .discount {
          color: green;
          font-weight: 700;
          margin: 0 0 12px;
        }

        .location {
          font-size: 13px;
          color: #6b7280;
        }

        .sellerTrustBox {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 10px;
          margin-top: 10px;
          margin-bottom: 10px;
        }

        .sellerName {
          margin: 0 0 4px;
          font-size: 13px;
          color: #374151;
          font-weight: 700;
        }

        .reviewStats {
          margin: 0 0 6px;
          font-size: 13px;
          color: #111827;
          font-weight: 700;
        }

        .reviewStats.muted {
          color: #6b7280;
          font-weight: 600;
        }

        .reviewLink {
          display: inline-block;
          color: #111827;
          font-weight: 700;
          text-decoration: underline;
          font-size: 13px;
        }

        .reviewLink:hover {
          color: #f59e0b;
        }

        .darkButton,
        .outlineButton,
        .goldButton {
          width: 100%;
          padding: 12px;
          border-radius: 9px;
          cursor: pointer;
          font-weight: 700;
          margin-top: 8px;
        }

        .darkButton {
          background: #111827;
          color: white;
          border: none;
          margin-top: 10px;
        }

        .outlineButton {
          background: white;
          color: #111827;
          border: 1px solid #d1d5db;
        }

        .goldButton {
          background: #f4b400;
          color: #111827;
          border: none;
        }

        .footer {
          background: #111827;
          color: #d1d5db;
          text-align: center;
          padding: 35px;
        }

        .footerLinks {
          display: flex;
          justify-content: center;
          gap: 18px;
          flex-wrap: wrap;
        }

        .footerLinks a {
          color: #d1d5db;
        }

        @media (max-width: 1024px) {
          .topBar {
            flex-wrap: wrap;
            padding: 14px 24px;
          }

          .searchWrap {
            order: 3;
            width: 100%;
            flex: none;
          }

          .heroInner {
            grid-template-columns: 1fr;
          }

          .hero h1 {
            font-size: 42px;
          }

          .sectionHeader {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (max-width: 640px) {
          .topBar {
            flex-direction: column;
            align-items: stretch;
            padding: 14px;
            gap: 12px;
          }

          .logo {
            text-align: center;
            font-size: 24px;
          }

          .searchWrap {
            width: 100%;
            flex-direction: column;
            min-width: 0;
          }

          .searchInput {
            width: 100%;
            border-radius: 8px;
            margin-bottom: 8px;
          }

          .searchButton {
            width: 100%;
            border-radius: 8px;
          }

          .nav {
            width: 100%;
            justify-content: center;
            flex-wrap: wrap;
            gap: 10px;
          }

          .navLink,
          .signupButton,
          .logoutButton {
            font-size: 14px;
          }

          .email {
            max-width: 100%;
            text-align: center;
          }

          .categoryBar {
            padding: 10px 14px;
          }

          .hero {
            padding: 38px 18px;
          }

          .hero h1 {
            font-size: 34px;
            line-height: 1.1;
          }

          .hero p {
            font-size: 16px;
          }

          .heroButtons {
            flex-direction: column;
          }

          .primaryButton,
          .secondaryButton,
          .postButton {
            width: 100%;
            text-align: center;
          }

          .priceCard {
            padding: 20px;
          }

          .priceRow {
            flex-direction: column;
            align-items: flex-start;
          }

          .howSection {
            padding: 35px 18px;
          }

          .productsSection {
            padding: 35px 18px;
          }

          .sectionHeader {
            align-items: stretch;
          }

          .grid {
            grid-template-columns: 1fr;
          }

          .card {
            width: 100%;
          }

          .imageWrap img {
            height: 220px;
          }

          .footer {
            padding: 28px 18px;
          }

          .footerLinks {
            flex-direction: column;
            gap: 10px;
          }
        }

        @media (max-width: 380px) {
          .hero h1 {
            font-size: 29px;
          }

          .topBar {
            padding: 12px;
          }

          .productsSection,
          .howSection,
          .hero {
            padding-left: 12px;
            padding-right: 12px;
          }
        }
      `}</style>
    </>
  );
}
