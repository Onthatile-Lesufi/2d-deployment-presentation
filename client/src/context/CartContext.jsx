import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

function getCartKey() {
  try {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (user && user.email) return `cartItems_${user.email}`;
    if (user && user.username) return `cartItems_${user.username}`;
  } catch {}
  return "cartItems_guest";
}

export function CartProvider({ children }) {
  // Load cart from localStorage on mount
  const [cartItems, setCartItems] = useState(() => {
    try {
      const key = getCartKey();
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  });

  // Save cart to user-specific localStorage key
  useEffect(() => {
    const key = getCartKey();
    localStorage.setItem(key, JSON.stringify(cartItems));
  }, [cartItems]);

  // When user logs in/out, load their cart
  useEffect(() => {
    const syncCart = () => {
      const key = getCartKey();
      try {
        setCartItems(JSON.parse(localStorage.getItem(key)) || []);
      } catch {
        setCartItems([]);
      }
    };
    window.addEventListener('storage', syncCart);
    window.addEventListener('focus', syncCart);
    document.addEventListener('auth-login', syncCart);
    return () => {
      window.removeEventListener('storage', syncCart);
      window.removeEventListener('focus', syncCart);
      document.removeEventListener('auth-login', syncCart);
    };
  }, []);

  // Example addToCart:
  const addToCart = (product) => {
    setCartItems(prev => {
      const exists = prev.find(item => item._id === product._id);
      if (exists) {
        return prev.map(item =>
          item._id === product._id
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      setCartItems,
      addToCart,
      // ...other cart functions...
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}