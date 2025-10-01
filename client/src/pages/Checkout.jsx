import React, { useState } from 'react';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import '../styles/CheckoutPage.css';
import Confetti from 'react-confetti';
import { useWindowSize } from '@react-hook/window-size';
import useSound from 'use-sound';
import successSound from '../assets/success.mp3'; // Add your sound in assets

const Checkout = () => {
  const [form, setForm] = useState({
    name: '',
    address: '',
    card: '',
    email: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const { cartItems, clearCart } = useCart();
  const [width, height] = useWindowSize();
  const [playSuccess] = useSound(successSound, { volume: 0.5 });

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === 'card') {
      value = value.replace(/\D/g, '');
      value = value.match(/.{1,4}/g)?.join(' ') || '';
      if (value.length > 19) value = value.slice(0, 19);
    }
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.card.replace(/\s/g, '').length !== 16) {
      alert('Please enter a valid 16-digit card number.');
      return;
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const formattedItems = cartItems.map(item => ({
      productId: item._id,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
    }));

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          address: form.address,
          card: form.card,
          items: formattedItems,
          total,
        }),
      });

      if (!res.ok) throw new Error('Failed to create order');
      const data = await res.json();
      console.log('Order saved:', data);

      setSubmitted(true);
      playSuccess();
      clearCart();
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Error processing order. Please try again.');
    }
  };

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1>Checkout</h1>

        {submitted ? (
          <div className="checkout-success">
            <Confetti width={width} height={height} numberOfPieces={200} recycle={false} />
            <h2>Thank you for your purchase!</h2>
            <p>Your order is being processed.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="checkout-form">
            <label>Name
              <input type="text" name="name" value={form.name} onChange={handleChange} required />
            </label>
            <label>Email
              <input type="email" name="email" value={form.email} onChange={handleChange} required />
            </label>
            <label>Address
              <input type="text" name="address" value={form.address} onChange={handleChange} required />
            </label>
            <label>Card Number
              <input
                type="text"
                name="card"
                value={form.card}
                onChange={handleChange}
                maxLength={19}
                placeholder="1234 5678 9012 3456"
                required
              />
            </label>
            <button type="submit">Place Order</button>
          </form>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;
