import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";

function getWishlistKey() {
  try {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (user && user.email) return `wishlist_${user.email}`;
    if (user && user.username) return `wishlist_${user.username}`;
  } catch {}
  return "wishlist_guest";
}

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    try {
      setWishlist(JSON.parse(localStorage.getItem(getWishlistKey())) || []);
    } catch {
      setWishlist([]);
    }
  }, []);

  // Remove product from wishlist state when unhearted or added to cart
  const handleWishlistChange = (productId, isWishlisted) => {
    if (!isWishlisted) {
      setWishlist(prev => prev.filter(item => item._id !== productId));
      localStorage.setItem(getWishlistKey(), JSON.stringify(
        (JSON.parse(localStorage.getItem(getWishlistKey())) || []).filter(item => item._id !== productId)
      ));
    }
  };

  // Remove product from wishlist when added to cart
  const handleAddToCartAndRemove = (product) => {
    let wishlistArr = [];
    try {
      wishlistArr = JSON.parse(localStorage.getItem(getWishlistKey())) || [];
    } catch {}
    wishlistArr = wishlistArr.filter(item => item._id !== product._id);
    localStorage.setItem(getWishlistKey(), JSON.stringify(wishlistArr));
    setWishlist(wishlistArr);
  };

  if (!wishlist.length) {
    return (
      <div style={{
        minHeight: '100vh',
        width: '100vw',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 22,
        color: '#9b1c23',
        fontWeight: 700,
        position: 'relative',
        boxSizing: 'border-box'
      }}>
        No products in your wishlist.
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 32,
        background: "#000",
        minHeight: "100vh",
        width: "100vw", // Ensure full viewport width
        position: "relative", // Prevents body background from showing
        boxSizing: "border-box"
      }}
    >
      <h2 style={{ color: "#e1bb3e", marginBottom: 24 }}>My Wishlist</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
        {wishlist.map(product => (
          <div key={product._id} className="product-wrapper">
            <ProductCard
              product={product}
              showDescription
              onWishlistChange={handleWishlistChange}
              showAddToCart={true}
              onAddToCartFromWishlist={handleAddToCartAndRemove}
              wishlistKey={getWishlistKey()}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

