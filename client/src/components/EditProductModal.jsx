import { useState } from 'react';
import '../styles/EditProductModal.css';

export default function EditProductModal({ product, onClose, onSave }) {
  const [formData, setFormData] = useState({ ...product });

  const handleChange = async (e) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files.length > 0) {
      const data = new FormData();
      data.append('image', files[0]);
      const res = await fetch('/api/upload', { method: 'POST', body: data });
      const file = await res.json();
      setFormData(prev => ({ ...prev, image: file.filePath }));
    } else {
      setFormData(prev => ({ ...prev, [name]: name === 'price' || name === 'stock' ? Number(value) : value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/products/${formData._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const updated = await res.json();
      onSave(updated);
      onClose();
    } catch (err) {
      console.error('Edit failed:', err);
      alert('Error editing product');
    }
  };

  return (
    <div className="edit-modal-overlay">
      <div className="edit-modal">
        <h2>Edit Product</h2>
        <form onSubmit={handleSubmit}>
          <label>Title:</label><input name="title" value={formData.title} onChange={handleChange} />
          <label>Description:</label><textarea name="description" value={formData.description} onChange={handleChange} />
          <label>Price:</label><input name="price" type="number" value={formData.price} onChange={handleChange} />
          <label>Category:</label><input name="category" value={formData.category} onChange={handleChange} />
          <label>Stock:</label><input name="stock" type="number" value={formData.stock} onChange={handleChange} />
          <label>Image:</label><input type="file" name="image" accept="image/*" onChange={handleChange} />
          <div className="edit-buttons">
            <button type="submit">Save</button><button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
