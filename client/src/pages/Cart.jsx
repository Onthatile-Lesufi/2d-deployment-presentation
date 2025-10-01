import React from 'react';
import { useCart } from '../context/CartContext';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import '../styles/CartPage.css';

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();

  // Detect before login state (example: no user in localStorage)
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("loggedInUser"));
    } catch {
      return null;
    }
  })();

  if (!user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            color: "#e1bb3e",
            fontWeight: 700,
            fontSize: 28,
            textAlign: "center",
            fontFamily: "'Montserrat', 'Segoe UI', Arial, sans-serif",
            letterSpacing: 1,
            background: "rgba(30,30,30,0.85)",
            padding: "40px 32px",
            borderRadius: 16,
            boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
            border: "1px solid #e1bb3e"
          }}
        >
          Please log in to view your cart.<br />
          <span style={{ fontWeight: 400, fontSize: 18, color: "#e9c4b4" }}>
            Sign in to continue shopping and checkout your favorite drinks!
          </span>
        </div>
      </div>
    );
  }

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h2>Your Cart</h2>

        {cartItems.length === 0 ? (
          <p className="empty-message">Your cart is empty. Head to the store to add some products!</p>
        ) : (
          <>
            <ul className="cart-list">
              {cartItems.map(item => (
                <li key={item._id} className="cart-item">
                  <div className="cart-item-info">
                    <img
                      src={item.image.startsWith('/uploads') ? process.env.PUBLIC_URL + item.image : item.image}
                      alt={item.title}
                      className="cart-item-image"
                    />
                    <div>
                      <strong>{item.title}</strong>
                      <p>R {item.price.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="cart-item-actions">
                    <label>Qty:</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item._id, Number(e.target.value))}
                    />
                    <button onClick={() => removeFromCart(item._id)} className="remove-btn">Remove</button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="cart-summary">
              <h3>Total: R {total.toFixed(2)}</h3>
              <button onClick={clearCart} className="clear-cart-btn">Clear Cart</button>
              <Link to="/checkout">
                <button className="checkout-btn">Proceed to Checkout</button>
              </Link>
            </div>
          </>
        )}
      </div>

      <Footer className="cart-footer" />
    </div>
  );
}
