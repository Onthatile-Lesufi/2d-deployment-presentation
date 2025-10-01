import { useState } from 'react';
import '../styles/AddProductModal.css';

export default function AddProductModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: '', description: '', price: 0, category: '', stock: 0, image: ''
  });

  // Get seller username from localStorage (not editable)
  const sellerUsername = (() => {
    try {
      const user = JSON.parse(localStorage.getItem("loggedInUser"));
      return user?.username || "";
    } catch {
      return "";
    }
  })();

  const handleChange = async (e) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files && files.length > 0) {
      const data = new FormData();
      data.append('image', files[0]);
      const res = await fetch('/api/upload', { method: 'POST', body: data });
      const file = await res.json();
      setFormData(prev => ({ ...prev, image: file.filePath }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Always set seller field to logged-in seller's username
      const formWithSeller = { ...formData, seller: sellerUsername };
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formWithSeller),
      });

      let saved;
      if (res.ok) {
        saved = await res.json();
        onSave(saved); // This updates the My Store page
        onClose();
      } else {
        let errorMsg = "Unknown error";
        try {
          const errorData = await res.json();
          errorMsg = errorData.message || JSON.stringify(errorData);
        } catch {
          errorMsg = await res.text();
        }
        console.error('Backend error:', errorMsg);
        alert(`Error: ${errorMsg}`);
      }
    } catch (err) {
      console.error('Add failed:', err);
      alert('Error adding product');
    }
  };

  return (
    <div className="edit-modal-overlay">
      <div className="edit-modal">
        <h2>Add New Product</h2>
        <form onSubmit={handleSubmit}>
          <label>Title:</label>
          <input name="title" value={formData.title} onChange={handleChange} />
          <label>Description:</label>
          <textarea name="description" value={formData.description} onChange={handleChange} />
          <label>Price:</label>
          <input name="price" value={formData.price} onChange={handleChange} />
          <label>Category:</label>
          <input name="category" value={formData.category} onChange={handleChange} />
          <label>Stock:</label>
          <input name="stock" value={formData.stock} onChange={handleChange} />
          <label>Image:</label>
          <input type="file" name="image" accept="image/*" onChange={handleChange} />
          {/* Show seller username for admin/audit, but not editable */}
          <div style={{ margin: "8px 0", color: "#888", fontSize: 13 }}>
            <b>Seller:</b> {sellerUsername}
          </div>
          <div className="edit-buttons">
            <button type="submit">Save</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
