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

  /* TABLET */
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

  /* MOBILE */
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

  /* VERY SMALL PHONES */
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
