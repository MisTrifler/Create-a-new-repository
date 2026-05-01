export default function Terms() {
  return (
    <div style={pageStyle}>
      <Header />

      <main style={cardStyle}>
        <h1>Terms of Use</h1>

        <p>Last updated: May 2026</p>

        <p>
          By using LocalDeal, you agree to these Terms of Use. If you do not
          agree, please do not use the website.
        </p>

        <h2>What LocalDeal does</h2>
        <p>
          LocalDeal helps users discover local listings, products, partner deals
          and offers. Some products are posted by users, and some may link to
          third-party partner websites.
        </p>

        <h2>User listings</h2>
        <p>
          Users are responsible for the accuracy of listings they post. Do not
          post misleading, illegal, unsafe, stolen, counterfeit or inappropriate
          products.
        </p>

        <h2>Partner and affiliate links</h2>
        <p>
          Some links on LocalDeal may be affiliate links. If you buy through
          those links, LocalDeal may earn a commission at no extra cost to you.
          Prices, availability and final purchase terms are controlled by the
          third-party website.
        </p>

        <h2>No guarantee</h2>
        <p>
          We do our best to keep listings useful and accurate, but we cannot
          guarantee product availability, seller behaviour, delivery, pricing or
          third-party website content.
        </p>

        <h2>Reporting listings</h2>
        <p>
          If you see a listing that appears misleading or unsafe, contact us at{" "}
          <a href="mailto:support@localdeal.co.uk">
            support@localdeal.co.uk
          </a>.
        </p>

        <h2>Changes to the website</h2>
        <p>
          We may update, remove or change listings, features, pages or these
          terms at any time.
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
