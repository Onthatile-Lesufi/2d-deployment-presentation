// components/CartItem.js
import React from 'react';
import './css/CartItem.css'; // Create this CSS file for styling

function CartItem({ item, onRemove,  onIncrease, onDecrease }) {
  if (!item || !item.product) return null;
  return (
    <tr className="cart-item">
      <td className="cart-product-info">
        <img src={item.product.image} alt={item.product.productName} className="product-image" />
        <div className="product-details">
          <span>{item.product.productName}</span>
          <button className="remove-btn" onClick={() => onRemove(item.product._id)}>Remove</button>
        </div>
      </td>
      <td>R{item.product.price}</td>
       <td className='quantity-cart'>
      <button  onClick={() => onDecrease(item.product._id)}>-</button>
      <span style={{ margin: '0 8px' }}>{item.quantity}</span>
      <button  onClick={() => onIncrease(item.product._id)}>+</button>
    </td>
      <td>R{item.product.price * item.quantity}</td>
    </tr>
  );
}

export default CartItem;
