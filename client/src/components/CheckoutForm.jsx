import React from 'react';

const Checkout = () => {
  const [form, setForm] = React.useState({
    name: '',
    address: '',
    card: '',
    email: '',
  });
  const [submitted, setSubmitted] = React.useState(false);

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === 'card') {
      // Remove non-digits
      value = value.replace(/\D/g, '');
      // Insert spaces every 4 digits
      value = value.match(/.{1,4}/g)?.join(' ') || '';
      if (value.length > 19) value = value.slice(0, 19);
    }
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate card length (16 digits without spaces)
    if (form.card.replace(/\s/g, '').length !== 16) {
      alert('Please enter a valid 16-digit card number.');
      return;
    }
    // You can add more validation here if you want
    // For now, just simulate successful submission
    setSubmitted(true);
  };

  return (
    <div
      className="checkout-container"
      style={{
        maxWidth: 400,
        margin: '2rem auto',
        padding: 24,
        background: '#fff',
        borderRadius: 8,
        boxShadow: '0 2px 8px #eee',
      }}
    >
      <h1 style={{ textAlign: 'center' }}>Checkout</h1>

      {submitted ? (
        <div style={{ textAlign: 'center', color: 'green', marginTop: 32 }}>
          <h2>Thank you for your purchase!</h2>
          <p>Your order is being processed.</p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="checkout-form"
          style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
        >
          <label htmlFor="name">
            Name
            <input
              id="name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              autoComplete="name"
            />
          </label>

          <label htmlFor="email">
            Email
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </label>

          <label htmlFor="address">
            Address
            <input
              id="address"
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              required
              autoComplete="street-address"
            />
          </label>

          <label htmlFor="card">
            Card Number
            <input
              id="card"
              type="text"
              name="card"
              value={form.card}
              onChange={handleChange}
              required
              maxLength={19}
              placeholder="1234 5678 9012 3456"
              autoComplete="cc-number"
              inputMode="numeric"
              pattern="[0-9\s]*"
            />
          </label>

          <button
            type="submit"
            style={{
              padding: '0.75rem',
              background: '#2d6cdf',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Place Order
          </button>
        </form>
      )}
    </div>
  );
};

export default Checkout;
