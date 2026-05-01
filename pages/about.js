export default function About() {
  return (
    <div style={pageStyle}>
      <Header />

      <main style={cardStyle}>
        <h1>About LocalDeal</h1>

        <p>
          LocalDeal helps UK users discover local listings, useful products,
          partner deals and offers in one place.
        </p>

        <p>
          Our goal is to make it easier for buyers to find products from local
          sellers and trusted partner websites without searching across many
          different platforms.
        </p>

        <p>
          Sellers can post basic product listings for free. Some products on
          LocalDeal may link to partner websites such as Amazon or other
          retailers. When users click some partner links and make a purchase,
          LocalDeal may earn a commission at no extra cost to the buyer.
        </p>

        <p>
          We are building LocalDeal to be simple, transparent and useful for UK
          buyers, local sellers and small businesses.
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
