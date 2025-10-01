import { useState } from 'react';
import '../styles/ReviewForm.css'; 

const ReviewForm = ({ productId, onReviewSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const review = { rating: parseFloat(rating), comment, user: 'Anonymous' }; // Replace 'Anonymous' with real user later

    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review),
      });
      const data = await res.json();
      onReviewSubmit(data);
      setRating(0);
      setComment('');
    } catch (err) {
      console.error('Error adding review:', err);
      alert('Error adding review');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="review-form">
      <label>Rating (0-5):</label>
      <input
        type="number"
        step="0.25"
        min="0"
        max="5"
        value={rating}
        onChange={(e) => setRating(e.target.value)}
        required
      />
      <label>Comment:</label>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} />
      <button type="submit">Submit Review</button>
    </form>
  );
};

export default ReviewForm;
