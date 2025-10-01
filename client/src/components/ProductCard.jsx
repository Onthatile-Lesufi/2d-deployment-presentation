import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import '../styles/ProductCard.css';
import { FaHeart, FaRegHeart } from "react-icons/fa";

function getWishlistKey() {
  try {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (user && user.email) return `wishlist_${user.email}`;
    if (user && user.username) return `wishlist_${user.username}`;
  } catch {}
  return "wishlist_guest";
}

const ProductCard = ({
  product,
  showAddToCart = true,
  onLoginToBuy,
  showDescription,
  onWishlistChange,
  onAddToCartFromWishlist,
  wishlistKey // optional, fallback to getWishlistKey()
}) => {
  const [expanded, setExpanded] = useState(false);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  const loggedInUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('loggedInUser'));
    } catch {
      return null;
    }
  })();

  const key = wishlistKey || getWishlistKey();
  const [wishlisted, setWishlisted] = useState(() => {
    try {
      const wishlist = JSON.parse(localStorage.getItem(key)) || [];
      return wishlist.some(item => item._id === product._id);
    } catch {
      return false;
    }
  });

  const handleWishlist = (e) => {
    e.stopPropagation && e.stopPropagation();
    let wishlist = [];
    try {
      wishlist = JSON.parse(localStorage.getItem(key)) || [];
    } catch {}
    let newWishlisted;
    if (wishlisted) {
      wishlist = wishlist.filter(item => item._id !== product._id);
      newWishlisted = false;
    } else {
      wishlist.push(product);
      newWishlisted = true;
    }
    localStorage.setItem(key, JSON.stringify(wishlist));
    setWishlisted(newWishlisted);
    if (onWishlistChange) {
      onWishlistChange(product._id, newWishlisted);
    }
  };

  const handleCardClick = (e) => {
    if (
      showAddToCart &&
      (e.target.closest('.add-to-cart-btn') ||
        e.target.classList.contains('add-to-cart-btn'))
    ) {
      return;
    }
    setExpanded((prev) => !prev);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product);
    setAdded(true);
    if (onAddToCartFromWishlist) {
      onAddToCartFromWishlist(product);
    }
    setTimeout(() => setAdded(false), 1200);
  };

  const displayRating = product.averageRating || 0;

  return (
    <div
      className={`product-card${expanded ? " expanded" : ""}`}
      onClick={handleCardClick}
      style={{ cursor: "pointer" }}
    >
      <img src={product.image} alt={product.title} className="product-image" />
      <div className="product-info">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <div className="product-title">{product.title}</div>
          {loggedInUser && (
            <span
              style={{ cursor: "pointer", color: wishlisted ? "#e35537" : "#bdbdbd", fontSize: 20 }}
              title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              onClick={handleWishlist}
            >
              {wishlisted ? <FaHeart /> : <FaRegHeart />}
            </span>
          )}
        </div>
        <div className="category-stock">
          <span className="product-category">{product.category}</span>
          <span className="product-stock">Stock: {product.stock}</span>
        </div>
        <div className="price-rating">
          <span className="product-price">R {product.price.toFixed(2)}</span>
          <span className="product-rating">★ {displayRating.toFixed(2)}</span>
        </div>
        {(expanded || showDescription) && product.description && (
          <div
            className="product-description"
            style={{
              wordBreak: "break-word",
              whiteSpace: "pre-line",
              overflowWrap: "break-word",
              maxWidth: "100%",
            }}
          >
            {product.description}
          </div>
        )}
        {showAddToCart && (
          !loggedInUser ? (
            <button
              className="ghost-login-btn"
              style={{
                background: 'none',
                border: '1px solid #e1bb3e',
                color: '#9b1c23',
                borderRadius: 8,
                padding: '10px 0',
                width: '100%',
                fontWeight: 700,
                marginTop: 8,
                cursor: 'pointer'
              }}
              onClick={onLoginToBuy}
            >
              Login to buy
            </button>
          ) : (
            <button
              className="add-to-cart-btn"
              onClick={handleAddToCart}
              style={{
                background: added ? "#2ecc40" : undefined,
                color: added ? "#fff" : undefined,
                transition: "background 0.2s, color 0.2s"
              }}
              disabled={added}
            >
              {added ? "Successfully added to cart" : "Add to Cart"}
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default ProductCard;
