export default function Contact() {
  return (
    <div style={pageStyle}>
      <Header />

      <main style={cardStyle}>
        <h1>Contact LocalDeal</h1>

        <p>
          If you have a question about a listing, product, partner link, or need
          help using LocalDeal, you can contact us.
        </p>

        <h3>Email</h3>
        <p>
          <a href="mailto:support@localdeal.co.uk">
            support@localdeal.co.uk
          </a>
        </p>

        <p>
          If that email is not active yet, use your current support email and
          replace it later when you buy a domain email.
        </p>

        <h3>Report a listing</h3>
        <p>
          If you believe a listing is incorrect, misleading, expired or unsafe,
          email us with the product title and reason for reporting it.
        </p>

        <p>
          <a href="mailto:support@localdeal.co.uk?subject=Report a LocalDeal listing">
            Report a listing
          </a>
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
