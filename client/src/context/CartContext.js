import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

function getCartKey() {
  try {
    const user = JSON.parse(localStorage.getItem('loggedInUser'));
    if (user && user.email) return `cart_${user.email}`;
    if (user && user.username) return `cart_${user.username}`;
  } catch {}
  return "cart_guest";
}

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(getCartKey())) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(getCartKey(), JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    const syncCart = () => {
      try {
        setCartItems(JSON.parse(localStorage.getItem(getCartKey())) || []);
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

  const addToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item._id === product._id);
      if (existing) {
        return prev.map(item =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item._id !== id));
  };

  const updateQuantity = (id, quantity) => {
    setCartItems(prev => prev.map(item => item._id === id ? { ...item, quantity } : item));
  };

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
