import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../styles/ProductDetails.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ProductDetails = ({ products, onAddToCart }) => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const found = products.find(p => p._id === id);
    if (found) setProduct(found);
  }, [id, products]);

  if (!product) return <p>Loading...</p>;

  return (
    <div className="product-details-page">
      <Navbar />
      <div className="product-details-container">
        <img src={product.image} alt={product.title} />
        <div className="details-info">
          <h1>{product.title}</h1>
          <p className="category">{product.category}</p>
          <p>{product.description}</p>
          <p className="price">${product.price.toFixed(2)}</p>
          <p className="stock">Stock: {product.stock}</p>
          <button onClick={() => onAddToCart(product)}>Add to Cart</button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetails;
