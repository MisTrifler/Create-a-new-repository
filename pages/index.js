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
  const [buyerLocation, setBuyerLocation] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [category, setCategory] = useState("All");
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [boostingProductId, setBoostingProductId] = useState(null);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const popularAreas = [
    "Birmingham",
    "Walsall",
    "Manchester",
    "London",
    "Leeds",
    "Glasgow",
    "Cardiff"
  ];

  useEffect(() => {
    checkUser();
    fetchProducts();
    fetchReviews();

    const savedLocation = localStorage.getItem("localdeal_location");
    if (savedLocation) {
      const cleaned = cleanLocationText(savedLocation);
      setBuyerLocation(cleaned);
      setLocationInput(cleaned);
    }

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  function cleanLocationText(value) {
    return String(value || "")
      .replace(/^near\s+/i, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function normaliseLocation(value) {
    return cleanLocationText(value).toLowerCase();
  }

  function getLocationKeywords(value) {
    const cleaned = normaliseLocation(value);

    if (!cleaned) return [];

    const keywords = [cleaned];

    const areaGroups = {
      "west midlands": [
        "birmingham",
        "walsall",
        "west bromwich",
        "wolverhampton",
        "solihull",
        "dudley",
        "sutton coldfield",
        "sandwell",
        "coventry",
        "west midlands"
      ],
      manchester: [
        "manchester",
        "greater manchester",
        "salford",
        "stockport",
        "bolton",
        "oldham",
        "rochdale",
        "bury",
        "trafford"
      ],
      london: [
        "london",
        "greater london",
        "westminster",
        "camden",
        "hackney",
        "croydon",
        "greenwich",
        "ealing",
        "barking",
        "waltham forest"
      ],
      leeds: [
        "leeds",
        "west yorkshire",
        "bradford",
        "wakefield",
        "huddersfield"
      ],
      glasgow: ["glasgow", "glasgow city", "paisley", "east kilbride"],
      cardiff: ["cardiff", "newport", "caerphilly", "vale of glamorgan"]
    };

    Object.values(areaGroups).forEach((group) => {
      const matched = group.some((area) => cleaned.includes(area));

      if (matched) {
        keywords.push(...group);
      }
    });

    return [...new Set(keywords)];
  }

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

  function saveLocation() {
    const cleaned = cleanLocationText(locationInput);

    if (!cleaned) {
      alert(
        "Please enter your town, city or postcode area, for example Birmingham, Walsall, B12 or Solihull."
      );
      return;
    }

    setBuyerLocation(cleaned);
    setLocationInput(cleaned);
    localStorage.setItem("localdeal_location", cleaned);

    document.getElementById("products-section")?.scrollIntoView({
      behavior: "smooth"
    });
  }

  function clearLocation() {
    setBuyerLocation("");
    setLocationInput("");
    localStorage.removeItem("localdeal_location");
  }

  function choosePopularArea(area) {
    const cleaned = cleanLocationText(area);

    setBuyerLocation(cleaned);
    setLocationInput(cleaned);
    localStorage.setItem("localdeal_location", cleaned);

    document.getElementById("products-section")?.scrollIntoView({
      behavior: "smooth"
    });
  }

  async function useMyLocation() {
    if (!navigator.geolocation) {
      alert(
        "Your browser does not support location detection. Please type your town or postcode instead."
      );
      return;
    }

    setDetectingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
          );

          const data = await response.json();

          const detectedLocation =
            data.city ||
            data.locality ||
            data.principalSubdivision ||
            data.countryName ||
            "";

          if (!detectedLocation) {
            alert(
              "We could not detect your town. Please type your town or postcode manually."
            );
            setDetectingLocation(false);
            return;
          }

          const cleaned = cleanLocationText(detectedLocation);

          setBuyerLocation(cleaned);
          setLocationInput(cleaned);
          localStorage.setItem("localdeal_location", cleaned);

          setDetectingLocation(false);

          document.getElementById("products-section")?.scrollIntoView({
            behavior: "smooth"
          });
        } catch (error) {
          setDetectingLocation(false);
          alert(
            "Could not convert your location into a town. Please type your town or postcode instead."
          );
        }
      },
      () => {
        setDetectingLocation(false);
        alert(
          "Location permission was blocked. Please type your town or postcode instead."
        );
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 600000
      }
    );
  }

  function openProduct(product) {
    if (product.affiliate_url && product.affiliate_url.startsWith("http")) {
      window.location.href = product.affiliate_url;
      return;
    }

    if (product.is_affiliate) {
      alert("No valid partner link found for this product.");
      return;
    }

    if (!user) {
      alert("Please login to message this seller.");
      window.location.href = "/login";
      return;
    }

    window.location.href = `/messages?productId=${product.id}`;
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
    const searchValue = search.toLowerCase();

    const matchesSearch =
      search === "" ||
      product.title?.toLowerCase().includes(searchValue) ||
      product.description?.toLowerCase().includes(searchValue) ||
      product.location?.toLowerCase().includes(searchValue) ||
      product.category?.toLowerCase().includes(searchValue) ||
      product.source_website?.toLowerCase().includes(searchValue);

    const matchesCategory = category === "All" || product.category === category;

    const sourceWebsite = product.source_website?.toLowerCase() || "";
    const productLocation = normaliseLocation(product.location);

    const isOnlineOrAffiliate =
      product.is_affiliate ||
      productLocation === "online" ||
      sourceWebsite === "amazon" ||
      sourceWebsite === "ebay" ||
      sourceWebsite === "awin";

    const buyerLocationKeywords = getLocationKeywords(buyerLocation);

    const matchesBuyerLocation =
      !buyerLocation ||
      isOnlineOrAffiliate ||
      buyerLocationKeywords.some(
        (keyword) =>
          productLocation.includes(keyword) || keyword.includes(productLocation)
      );

    return matchesSearch && matchesCategory && matchesBuyerLocation;
  });

  const pageTitle = buyerLocation
    ? `Deals near ${cleanLocationText(buyerLocation)}`
    : "Deals near you";

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

            <a href="/my-listings" className="navLink">
              My Listings
            </a>

            <a href="/messages" className="navLink">
              Messages
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
              <p className="eyebrow">Local listings + partner deals</p>

              <h1>{pageTitle}</h1>

              <p>
                Enter your town or postcode area, use your location, or choose a
                popular UK area below. Online partner deals still appear for
                everyone.
              </p>

              <div className="locationBox">
                <input
                  placeholder="Enter town or postcode e.g. Birmingham, Walsall, B12"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  className="locationInput"
                />

                <button onClick={saveLocation} className="locationButton">
                  Show Deals
                </button>

                <button
                  onClick={useMyLocation}
                  className="detectButton"
                  disabled={detectingLocation}
                >
                  {detectingLocation ? "Finding area..." : "Use my location"}
                </button>
              </div>

              {buyerLocation && (
                <p className="currentLocation">
                  Showing local results for{" "}
                  <strong>{cleanLocationText(buyerLocation)}</strong>{" "}
                  <button onClick={clearLocation}>Change</button>
                </p>
              )}

              <div className="popularAreasBox">
                <p>Popular UK areas</p>

                <div className="popularAreaButtons">
                  {popularAreas.map((area) => (
                    <button
                      key={area}
                      onClick={() => choosePopularArea(area)}
                      className={
                        normaliseLocation(buyerLocation) ===
                        normaliseLocation(area)
                          ? "areaButton activeArea"
                          : "areaButton"
                      }
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>

              <div className="heroButtons">
                <a href="/post-product" className="primaryButton">
                  Post Free Listing
                </a>

                <a href="/my-listings" className="secondaryButton">
                  Manage My Listings
                </a>

                <a href="/messages" className="secondaryButton">
                  Messages
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
                Sellers choose their listing location. Buyers can message sellers
                safely inside LocalDeal without sharing personal contact details.
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
                <div className="howIcon">📍</div>
                <h3>Choose Your Area</h3>
                <p>
                  Enter your town or postcode area, pick a popular UK city, or
                  use location detection to find deals near you.
                </p>
              </div>

              <div className="howCard">
                <div className="howIcon">🔍</div>
                <h3>Browse Deals</h3>
                <p>
                  Search products, categories and local listings from sellers and
                  partner websites.
                </p>
              </div>

              <div className="howCard">
                <div className="howIcon">💬</div>
                <h3>Message Safely</h3>
                <p>
                  Buyers and sellers can chat inside LocalDeal without displaying
                  phone numbers or email addresses publicly.
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
                <div className="howIcon">⭐</div>
                <h3>Build Trust</h3>
                <p>
                  Buyers can leave reviews to help show which sellers are genuine
                  and reliable.
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
              <h2>🔥 {pageTitle}</h2>
              <p>
                Basic listings are free. Featured and bumped products appear
                higher. Online partner deals may earn commission.
              </p>
            </div>

            <a href="/post-product" className="primaryButton postButton">
              Post Free Product
            </a>
          </div>

          {loading && <p>Loading products...</p>}

          {!loading && filteredProducts.length === 0 && (
            <div className="emptyResults">
              <h3>No local listings found yet.</h3>
              <p>
                Try another town/postcode, choose another popular area, clear
                your location filter, or post the first product in your area.
              </p>
              <button onClick={clearLocation}>Clear location filter</button>
            </div>
          )}

          <div className="grid">
            {filteredProducts.map((product) => {
              const isAffiliate = Boolean(product.is_affiliate);

              const discount =
                !isAffiliate && product.old_price && product.price
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

                    {!isBoosted && isAffiliate && (
                      <span className="partnerBadge">Partner</span>
                    )}

                    {isAffiliate && (
                      <span className="imageNote">Illustration</span>
                    )}
                  </div>

                  <div className="cardBody">
                    <p className="meta">
                      {product.source_website || "LocalDeal"} ·{" "}
                      {product.category || "General"}
                    </p>

                    <h3>{product.title}</h3>

                    <p className="description">{product.description}</p>

                    {isAffiliate ? (
                      <div className="partnerPriceBox">
                        <p className="checkPrice">Check latest price</p>
                        <p className="priceNote">
                          Price, image and availability may change on Amazon.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="priceLine">
                          <span className="price">£{product.price}</span>

                          {product.old_price && (
                            <span className="oldPrice">
                              £{product.old_price}
                            </span>
                          )}
                        </div>

                        {discount !== null && (
                          <p className="discount">{discount}% OFF</p>
                        )}
                      </>
                    )}

                    <p className="location">📍 {product.location || "Online"}</p>

                    {isAffiliate && (
                      <p className="affiliateWarning">
                        Partner deal. Image may be for illustration. Check exact
                        product details on Amazon before buying.
                      </p>
                    )}

                    {!isAffiliate && (
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
                      {isAffiliate ? "View Partner Deal" : "Message Seller"}
                    </button>

                    {!isAffiliate && (
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

        .eyebrow {
          color: #92400e !important;
          font-weight: 800;
          font-size: 14px !important;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin-bottom: 10px !important;
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

        .locationBox {
          background: white;
          padding: 14px;
          border-radius: 18px;
          display: grid;
          grid-template-columns: 1fr auto auto;
          gap: 10px;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
          margin-bottom: 16px;
          border: 1px solid #e5e7eb;
        }

        .locationInput {
          width: 100%;
          padding: 15px;
          border: 1px solid #d1d5db;
          border-radius: 12px;
          font-size: 15px;
          background: #f9fafb;
        }

        .locationInput:focus {
          outline: none;
          border-color: #f4b400;
          box-shadow: 0 0 0 3px rgba(244, 180, 0, 0.2);
          background: white;
        }

        .locationButton,
        .detectButton {
          padding: 15px 18px;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 800;
          white-space: nowrap;
        }

        .locationButton {
          background: #111827;
          color: white;
        }

        .locationButton:hover {
          background: #030712;
        }

        .detectButton {
          background: #f4b400;
          color: #111827;
        }

        .detectButton:hover {
          background: #eab308;
        }

        .detectButton:disabled {
          background: #d1d5db;
          cursor: not-allowed;
        }

        .currentLocation {
          font-size: 14px !important;
          color: #374151 !important;
          margin-bottom: 18px !important;
        }

        .currentLocation button {
          border: none;
          background: transparent;
          color: #111827;
          text-decoration: underline;
          font-weight: 800;
          cursor: pointer;
        }

        .popularAreasBox {
          margin: 16px 0 20px;
        }

        .popularAreasBox p {
          margin: 0 0 10px !important;
          font-size: 14px !important;
          color: #374151 !important;
          font-weight: 800;
        }

        .popularAreaButtons {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .areaButton {
          background: white;
          border: 1px solid #d1d5db;
          color: #111827;
          padding: 10px 14px;
          border-radius: 999px;
          cursor: pointer;
          font-weight: 800;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .areaButton:hover {
          background: #f4b400;
          border-color: #f4b400;
          color: #111827;
        }

        .activeArea {
          background: #111827;
          color: white;
          border-color: #111827;
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

        .emptyResults {
          background: white;
          border: 1px solid #e5e7eb;
          padding: 25px;
          border-radius: 14px;
          margin-bottom: 25px;
        }

        .emptyResults button {
          background: #111827;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 11px 14px;
          font-weight: 800;
          cursor: pointer;
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
        .partnerBadge,
        .imageNote {
          position: absolute;
          padding: 5px 8px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
        }

        .badge {
          top: 10px;
          left: 10px;
          background: #f4b400;
          color: #111827;
        }

        .partnerBadge {
          top: 10px;
          left: 10px;
          background: #111827;
          color: white;
        }

        .imageNote {
          right: 10px;
          bottom: 10px;
          background: rgba(255, 255, 255, 0.92);
          color: #111827;
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

        .partnerPriceBox {
          margin: 12px 0;
          background: #fffbeb;
          border: 1px solid #fde68a;
          padding: 12px;
          border-radius: 10px;
        }

        .checkPrice {
          font-size: 18px;
          font-weight: 900;
          color: #111827;
          margin: 0 0 5px;
        }

        .priceNote {
          color: #92400e;
          font-size: 13px;
          margin: 0;
          line-height: 1.4;
        }

        .location {
          font-size: 13px;
          color: #6b7280;
        }

        .affiliateWarning {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          padding: 10px;
          border-radius: 10px;
          color: #555;
          font-size: 12px;
          line-height: 1.45;
          margin: 10px 0;
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

          .locationBox {
            grid-template-columns: 1fr;
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

          .locationBox {
            padding: 10px;
          }

          .popularAreaButtons {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }

          .areaButton {
            width: 100%;
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
