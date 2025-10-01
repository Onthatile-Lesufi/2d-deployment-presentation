// ReviewsModal.jsx
import React, { useState, useEffect } from "react";

export default function ReviewsModal({ onClose, reviews: initialReviews, productName, productId }) {
  // Use a unique localStorage key per product
  const storageKey = productId ? `reviews_${productId}` : "reviews_unknown";
  const [showAddReview, setShowAddReview] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviews, setReviews] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey));
      if (Array.isArray(stored)) return stored;
    } catch {}
    return initialReviews || [];
  });

  useEffect(() => {
    // Save reviews to localStorage for this product only
    localStorage.setItem(storageKey, JSON.stringify(reviews));
  }, [reviews, storageKey]);

  const loggedInUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('loggedInUser'));
    } catch {
      return null;
    }
  })();

  const handleStarClick = (star) => setReviewRating(star);

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!reviewText.trim() || reviewRating === 0) return;
    const newReview = {
      user: loggedInUser?.username || "Anonymous",
      rating: reviewRating,
      comment: reviewText
    };
    setReviews(prev => [newReview, ...prev]);
    setShowAddReview(false);
    setReviewText("");
    setReviewRating(0);
  };

  return (
    <div className="reviews-modal" style={{
      position: "fixed",
      top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 2000
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 16,
        minWidth: 350,
        minHeight: 200,
        maxWidth: 500,
        padding: 32,
        position: "relative"
      }}>
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 12, right: 12,
            background: "none", border: "none", fontSize: 22, color: "#9b1c23", cursor: "pointer"
          }}
          aria-label="Close"
        >×</button>
        {/* Add Review button in the top left corner */}
        {loggedInUser && (
          <button
            onClick={() => setShowAddReview(true)}
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              background: "#e1bb3e",
              color: "#350b0f",
              border: "none",
              borderRadius: 8,
              padding: "6px 14px",
              fontWeight: 700,
              fontSize: 15,
              cursor: "pointer"
            }}
          >
            Add Review
          </button>
        )}
        <h2 style={{ color: "#9b1c23", marginBottom: 18, textAlign: "center" }}>
          Reviews for {productName}
        </h2>
        {(!reviews || reviews.length === 0) ? (
          <div style={{ color: "#888", textAlign: "center" }}>No reviews yet.</div>
        ) : (
          <div style={{ maxHeight: 300, overflowY: "auto" }}>
            {reviews.map((review, idx) => (
              <div key={idx} style={{
                borderBottom: "1px solid #eee",
                padding: "10px 0"
              }}>
                <div style={{ fontWeight: 700, color: "#350b0f" }}>{review.user || "Anonymous"}</div>
                <div style={{ color: "#e1bb3e", fontWeight: 700 }}>★ {review.rating}</div>
                <div style={{ color: "#444" }}>{review.comment}</div>
              </div>
            ))}
          </div>
        )}

        {/* Add Review Modal */}
        {showAddReview && (
          <div style={{
            position: "fixed",
            top: 0, left: 0, width: "100vw", height: "100vh",
            background: "rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 2100
          }}>
            <div style={{
              background: "#fff",
              borderRadius: 16,
              padding: 28,
              minWidth: 320,
              maxWidth: 400,
              boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
              position: "relative"
            }}>
              <button
                onClick={() => setShowAddReview(false)}
                style={{
                  position: "absolute", top: 10, right: 14,
                  background: "none", border: "none", fontSize: 22, color: "#9b1c23", cursor: "pointer"
                }}
                aria-label="Close"
              >×</button>
              <h3 style={{ color: "#9b1c23", marginBottom: 16 }}>Add Your Review</h3>
              <form onSubmit={handleSubmitReview} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <label style={{ fontWeight: 600, color: "#350b0f" }}>Your Rating:</label>
                <div style={{ display: "flex", gap: 4, fontSize: 26 }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <span
                      key={star}
                      style={{ cursor: "pointer", color: reviewRating >= star ? "#e1bb3e" : "#ccc" }}
                      onClick={() => handleStarClick(star)}
                      aria-label={`${star} star`}
                    >★</span>
                  ))}
                </div>
                <textarea
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  placeholder="Write your review here..."
                  rows={4}
                  style={{
                    borderRadius: 8,
                    border: "1px solid #e9c4b4",
                    padding: 10,
                    fontSize: 15,
                    resize: "vertical"
                  }}
                  required
                />
                <button
                  type="submit"
                  style={{
                    background: "#e1bb3e",
                    color: "#350b0f",
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 0",
                    fontWeight: 700,
                    fontSize: 16,
                    cursor: "pointer",
                    marginTop: 8
                  }}
                  disabled={!reviewText.trim() || reviewRating === 0}
                >
                  Submit Review
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}