export default function AffiliateDisclosure() {
  return (
    <div style={pageStyle}>
      <Header />

      <main style={cardStyle}>
        <h1>Affiliate Disclosure</h1>

        <p>
          LocalDeal contains links to products, retailers and partner websites.
          Some of these links may be affiliate links.
        </p>

        <p>
          This means that if you click an affiliate link and make a purchase,
          LocalDeal may earn a commission at no extra cost to you.
        </p>

        <p>
          We aim to clearly label partner deals where possible. Prices,
          availability, delivery, refunds and final purchase terms are controlled
          by the third-party retailer or seller.
        </p>

        <h2>Amazon Associates</h2>
        <p>
          LocalDeal may participate in the Amazon Associates Programme. As an
          Amazon Associate, we may earn from qualifying purchases.
        </p>

        <h2>Other affiliate networks</h2>
        <p>
          LocalDeal may also use links from other partner programmes or affiliate
          networks in the future.
        </p>

        <h2>Our goal</h2>
        <p>
          Our goal is to help users discover useful local listings and partner
          deals while being transparent about how LocalDeal may earn revenue.
        </p>
      </main>

      <Footer />
    </div>
  );
}

function Header() {
  return (
    <div style={headerStyle}>
      <a href="/" style={logoStyle}>LocalDeal</a>
      <nav>
        <a href="/about" style={linkStyle}>About</a>
        <a href="/contact" style={linkStyle}>Contact</a>
        <a href="/privacy-policy" style={linkStyle}>Privacy</a>
        <a href="/terms" style={linkStyle}>Terms</a>
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
  alignItems: "center"
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
