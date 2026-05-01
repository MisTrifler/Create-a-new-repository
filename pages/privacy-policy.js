export default function PrivacyPolicy() {
  return (
    <div style={pageStyle}>
      <Header />

      <main style={cardStyle}>
        <h1>Privacy Policy</h1>

        <p>Last updated: May 2026</p>

        <p>
          LocalDeal respects your privacy. This Privacy Policy explains how we
          collect, use and protect information when you use our website.
        </p>

        <h2>Information we collect</h2>
        <p>
          When you create an account, post a listing, leave a review or contact
          us, we may collect information such as your email address, product
          details, listing information, review content and messages you send to
          us.
        </p>

        <h2>How we use information</h2>
        <p>
          We use information to operate LocalDeal, show listings, allow users to
          login, help sellers post products, display reviews, respond to support
          requests and improve the website.
        </p>

        <h2>Product listings</h2>
        <p>
          Product listings may include seller names, general locations, product
          descriptions, prices and images. Sellers should not post private
          addresses, full home postcodes or sensitive personal information in
          listings.
        </p>

        <h2>Reviews</h2>
        <p>
          Users may leave reviews about sellers. Reviews are intended to help
          buyers and sellers understand who may be genuine and reliable. Reviews
          should be honest, fair and not abusive.
        </p>

        <h2>Location information</h2>
        <p>
          LocalDeal may ask users to enter a town, city or postcode area, or use
          browser location permission to help show relevant local listings. Users
          can change or clear their selected area at any time.
        </p>

        <h2>Affiliate links</h2>
        <p>
          Some links on LocalDeal may be affiliate or partner links. If you click
          one of these links and make a purchase, we may earn a commission at no
          extra cost to you.
        </p>

        <h2>Advertising</h2>
        <p>
          LocalDeal may use advertising services such as Google AdSense. These
          services may use cookies or similar technologies to show relevant ads
          and measure performance.
        </p>

        <h2>Cookies</h2>
        <p>
          Cookies may be used for login, analytics, advertising, remembering your
          chosen location area and improving user experience. You can control
          cookies through your browser settings.
        </p>

        <h2>Third-party websites</h2>
        <p>
          LocalDeal may link to third-party websites such as retailers, local
          sellers or partner platforms. We are not responsible for the privacy
          practices, content, prices, delivery, refunds or terms of those
          websites.
        </p>

        <h2>Contact</h2>
        <p>
          For privacy questions, contact us at{" "}
          <a href="mailto:viddchoudhary@hotmail.com">
            viddchoudhary@hotmail.com
          </a>.
        </p>
      </main>

      <Footer />
    </div>
  );
}

function Header() {
  return (
    <div style={headerStyle}>
      <a href="/" style={logoStyle}>
        LocalDeal
      </a>

      <nav>
        <a href="/about" style={linkStyle}>
          About
        </a>
        <a href="/contact" style={linkStyle}>
          Contact
        </a>
        <a href="/privacy-policy" style={linkStyle}>
          Privacy
        </a>
        <a href="/terms" style={linkStyle}>
          Terms
        </a>
      </nav>
    </div>
  );
}

function Footer() {
  return (
    <footer style={footerStyle}>
      <p>© LocalDeal. Partner links may earn us a commission.</p>
    </footer>
  );
}

const pageStyle = {
  fontFamily: "Arial, sans-serif",
  background: "#f3f4f6",
  minHeight: "100vh"
};

const headerStyle = {
  padding: "20px 40px",
  background: "#111827",
  color: "white",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
  flexWrap: "wrap"
};

const logoStyle = {
  color: "white",
  textDecoration: "none",
  fontSize: "24px",
  fontWeight: "bold"
};

const linkStyle = {
  color: "white",
  textDecoration: "none",
  marginLeft: "18px"
};

const cardStyle = {
  maxWidth: "850px",
  margin: "50px auto",
  background: "white",
  padding: "40px",
  borderRadius: "14px",
  lineHeight: "1.7",
  boxShadow: "0 6px 18px rgba(0,0,0,0.08)"
};

const footerStyle = {
  textAlign: "center",
  padding: "30px",
  color: "#555"
};
