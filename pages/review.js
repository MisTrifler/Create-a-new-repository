import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function ReviewPage() {
  const [user, setUser] = useState(null);
  const [checkingUser, setCheckingUser] = useState(true);

  const [sellerEmail, setSellerEmail] = useState("");
  const [sellerName, setSellerName] = useState("");
  const [reviewType, setReviewType] = useState("seller");

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    loadPage();
  }, []);

  async function loadPage() {
    const params = new URLSearchParams(window.location.search);

    const email = params.get("email") || "";
    const name = params.get("name") || "Seller";
    const type = params.get("type") || "seller";

    setSellerEmail(email);
    setSellerName(name);
    setReviewType(type);

    const { data } = await supabase.auth.getUser();

    if (!data?.user) {
      alert("Please login before leaving a review.");
      window.location.href = "/login";
      return;
    }

    setUser(data.user);
    setCheckingUser(false);

    if (email) {
      fetchReviews(email);
    }
  }

  async function fetchReviews(email) {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("reviewed_email", email)
      .order("created_at", { ascending: false });

    if (!error) {
      setReviews(data || []);
    }
  }

  async function submitReview() {
    if (!user) {
      alert("You must be logged in.");
      return;
    }

    if (!sellerEmail) {
      alert("Missing seller email.");
      return;
    }

    if (!rating || rating < 1 || rating > 5) {
      alert("Please choose a rating between 1 and 5.");
      return;
    }

    if (!comment.trim()) {
      alert("Please write a short review.");
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.from("reviews").insert([
      {
        reviewer_id: user.id,
        reviewed_email: sellerEmail,
        reviewed_name: sellerName,
        reviewed_type: reviewType,
        rating: Number(rating),
        comment
      }
    ]);

    setSubmitting(false);

    if (error) {
      alert("Could not submit review: " + error.message);
      return;
    }

    alert("Review submitted successfully.");
    setComment("");
    setRating(5);
    fetchReviews(sellerEmail);
  }

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + Number(review.rating), 0) /
          reviews.length
        ).toFixed(1)
      : null;

  if (checkingUser) {
    return <div style={{ padding: "50px", fontFamily: "Arial" }}>Checking login...</div>;
  }

  return (
    <div style={pageStyle}>
      <header style={headerStyle}>
        <a href="/" style={logoStyle}>LocalDeal</a>
        <a href="/" style={homeLink}>Back Home</a>
      </header>

      <main style={cardStyle}>
        <h1>Review {sellerName}</h1>

        <p style={{ color: "#555" }}>
          Leave an honest review to help buyers and sellers know who is genuine.
        </p>

        {averageRating ? (
          <div style={ratingBox}>
            <strong>Current rating:</strong> ⭐ {averageRating} / 5 from {reviews.length} review(s)
          </div>
        ) : (
          <div style={ratingBox}>
            No reviews yet. Be the first to review this seller.
          </div>
        )}

        <label>Rating</label>
        <select
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          style={inputStyle}
        >
          <option value={5}>5 stars - Excellent</option>
          <option value={4}>4 stars - Good</option>
          <option value={3}>3 stars - Okay</option>
          <option value={2}>2 stars - Poor</option>
          <option value={1}>1 star - Bad</option>
        </select>

        <label>Review</label>
        <textarea
          placeholder="Example: Good communication, product matched the listing, genuine seller."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          style={{ ...inputStyle, minHeight: "120px" }}
        />

        <button
          onClick={submitReview}
          disabled={submitting}
          style={{
            width: "100%",
            padding: "14px",
            background: submitting ? "#777" : "#111827",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontWeight: "bold",
            cursor: submitting ? "not-allowed" : "pointer"
          }}
        >
          {submitting ? "Submitting..." : "Submit Review"}
        </button>

        <hr style={{ margin: "35px 0" }} />

        <h2>Previous Reviews</h2>

        {reviews.length === 0 && <p>No reviews yet.</p>}

        {reviews.map((review) => (
          <div key={review.id} style={reviewBox}>
            <strong>⭐ {review.rating} / 5</strong>
            <p>{review.comment}</p>
            <small style={{ color: "#777" }}>
              {new Date(review.created_at).toLocaleDateString()}
            </small>
          </div>
        ))}
      </main>
    </div>
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

const homeLink = {
  color: "white",
  textDecoration: "none"
};

const cardStyle = {
  maxWidth: "650px",
  margin: "50px auto",
  background: "white",
  padding: "35px",
  borderRadius: "16px",
  boxShadow: "0 6px 18px rgba(0,0,0,0.08)"
};

const inputStyle = {
  width: "100%",
  padding: "14px",
  marginTop: "8px",
  marginBottom: "16px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "15px"
};

const ratingBox = {
  background: "#fef3c7",
  padding: "14px",
  borderRadius: "10px",
  marginBottom: "22px",
  color: "#92400e"
};

const reviewBox = {
  border: "1px solid #e5e7eb",
  padding: "16px",
  borderRadius: "10px",
  marginBottom: "14px",
  background: "#f9fafb"
};
