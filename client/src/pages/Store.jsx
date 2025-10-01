import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import FilterPanel from '../components/FilterPanel';
import SearchBar from '../components/SearchBar';
import Footer from '../components/Footer';
import ReviewsModal from '../components/ReviewsModal';
import AuthModal from '../components/AuthModal';
import AddProductModal from '../components/AddProductModal';
import EditProductModal from '../components/EditProductModal';
import PriceFilterPanel from '../components/PriceFilterPanel';
import '../styles/StorePage.css';
import '../styles/PriceFilterPanel.css';
import Masonry from 'react-masonry-css';
import priceRanges from '../constants/priceRanges';
import Accordion from 'react-bootstrap/Accordion';

const Store = () => {
  const getStoredUser = () => {
    try {
      const user = JSON.parse(localStorage.getItem('loggedInUser'));
      return user || null;
    } catch {
      return null;
    }
  };
  const getStoredProfilePic = () => {
    try {
      return localStorage.getItem('profilePic') || null;
    } catch {
      return null;
    }
  };
  const loggedInUser = getStoredUser();
  const profilePic = getStoredProfilePic();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [priceSort, setPriceSort] = useState(""); // "low-high" | "high-low" | ""
  const [priceRangeIdx, setPriceRangeIdx] = useState(priceRanges.length - 1); // default to "All"
  const [activeFilterAccordion, setActiveFilterAccordion] = useState('0');

  const isAdmin = (() => {
    try {
      const user = JSON.parse(localStorage.getItem('loggedInUser'));
      return user && user.isAdmin;
    } catch {
      return false;
    }
  })();

  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  // New state for seller products
  const [sellerProducts, setSellerProducts] = useState([]);

  // Show/hide external seller products page
  const [showSellerProductsPage, setShowSellerProductsPage] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        setProducts(data);
        setFilteredProducts(data);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    // Fetch all products added by sellers (i.e., products with a seller field)
    const fetchSellerProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        // Filter products that have a seller field (not empty/undefined/null)
        const sellerProds = data.filter(p => p.seller && p.seller.trim() !== "");
        setSellerProducts(sellerProds);
      } catch (err) {
        setSellerProducts([]);
      }
    };
    fetchSellerProducts();
  }, []);

  useEffect(() => {
    let updated = [...products];
    if (categoryFilter !== 'All') {
      updated = updated.filter(p => p.category.toLowerCase() === categoryFilter.toLowerCase());
    }
    if (searchQuery) {
      updated = updated.filter(
        p =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    const { min, max } = priceRanges[priceRangeIdx];
    if (priceRangeIdx !== priceRanges.length - 1) {
      updated = updated.filter(p => p.price >= min && p.price < max);
    }
    if (priceSort === "low-high") {
      updated.sort((a, b) => a.price - b.price);
    } else if (priceSort === "high-low") {
      updated.sort((a, b) => b.price - a.price);
    } else if (priceSort === "a-z") {
      updated.sort((a, b) => a.title.localeCompare(b.title));
    }
    setFilteredProducts(updated);
  }, [searchQuery, categoryFilter, products, priceSort, priceRangeIdx]);

  const breakpointCols = {
    default: 4,
    1920: 3,
    1100: 2,
    700: 1
  };

  function getCurrentCols() {
    const width = window.innerWidth;
    if (width <= 700) return 1;
    if (width <= 1100) return 2;
    if (width <= 1920) return 3;
    return 4;
  }

  const [currentCols, setCurrentCols] = useState(getCurrentCols());

  useEffect(() => {
    const handleResize = () => setCurrentCols(getCurrentCols());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const useMasonry = filteredProducts.length > currentCols;

  const handleLoginToBuy = () => setShowAuthModal(true);

  const handleAddProduct = () => setShowAddProductModal(true);

  const handleEditProduct = (product) => {
    setEditProduct(product);
    setShowEditProductModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      setProducts(products => products.filter(p => p._id !== productId));
      setFilteredProducts(filtered => filtered.filter(p => p._id !== productId));
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  // Restore original AddProductModal usage
  const handleProductAdded = (product) => {
    setProducts(products => [...products, product]);
    setFilteredProducts(filtered => [...filtered, product]);
    setShowAddProductModal(false);
  };

  return (
    <div className="store-page">
      <div className="store-layout">
        <div className="sidebar">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            products={products}
            setFilteredProducts={setFilteredProducts}
          />
          <Accordion
            activeKey={activeFilterAccordion}
            onSelect={setActiveFilterAccordion}
            className="category-filter-accordion"
            style={{ marginBottom: 8 }}
          >
            <Accordion.Item eventKey="0">
              <Accordion.Header>Filter by Category</Accordion.Header>
              <Accordion.Body>
                <FilterPanel
                  categoryFilter={categoryFilter}
                  setCategoryFilter={setCategoryFilter}
                />
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
          <Accordion
            activeKey={activeFilterAccordion}
            onSelect={setActiveFilterAccordion}
            className="price-filter-accordion"
            style={{
              marginBottom: 0,
              marginTop: 8,
              width: '100%',
              backgroundColor: '#000000',
              marginLeft: 0,
            }}
          >
            <Accordion.Item eventKey="1">
              <Accordion.Header>Filter by Price</Accordion.Header>
              <Accordion.Body>
                <PriceFilterPanel
                  priceSort={priceSort}
                  setPriceSort={setPriceSort}
                  priceRangeIdx={priceRangeIdx}
                  setPriceRangeIdx={setPriceRangeIdx}
                />
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
          {isAdmin && (
            <button
              className="store-add-product-btn"
              onClick={() => setShowAddProductModal(true)}
              style={{ marginTop: 16, width: '100%' }}
            >
              Add Product
            </button>
          )}
        </div>
        <div className="main-content">
          <div>
            <h2 style={{ color: "#e1bb3e", marginBottom: 24 }}>All Products</h2>
            {/* --- External Seller Products Section Button --- */}
            {isAdmin && (
              <div style={{ margin: "0 0 32px 0", display: "flex", alignItems: "center" }}>
                <button
                  style={{
                    background: "linear-gradient(90deg, #e1bb3e 60%, #e35537 100%)",
                    color: "#350b0f",
                    border: "none",
                    borderRadius: 24,
                    padding: "14px 32px",
                    fontWeight: 700,
                    fontSize: 18,
                    cursor: "pointer",
                    boxShadow: "0 2px 8px #e1bb3e22",
                    marginRight: 18,
                  }}
                  onClick={() => setShowSellerProductsPage(true)}
                >
                  View External Seller Products
                </button>
              </div>
            )}
            {/* Hide main store if viewing seller products */}
            {!showSellerProductsPage && (
              <>
                {useMasonry ? (
                  <Masonry
                    breakpointCols={breakpointCols}
                    className="product-grid"
                    columnClassName="product-grid-column"
                  >
                    {filteredProducts.map((product) => (
                      <div key={product._id} className="product-wrapper">
                        <ProductCard product={product} onLoginToBuy={handleLoginToBuy} />
                        <div className="product-actions">
                          {isAdmin && (
                            <>
                              <button onClick={() => handleEditProduct(product)} className="edit-btn">Edit</button>
                              <button onClick={() => handleDeleteProduct(product._id)} className="delete-btn">Delete</button>
                            </>
                          )}
                          <button
                            onClick={() => { setSelectedProduct(product); setShowReviewsModal(true); }}
                            className="reviews-button"
                          >
                            Reviews
                          </button>
                        </div>
                      </div>
                    ))}
                  </Masonry>
                ) : (
                  <div className="product-grid normal-grid">
                    {filteredProducts.map((product) => (
                      <div key={product._id} className="product-wrapper">
                        <ProductCard product={product} onLoginToBuy={handleLoginToBuy} />
                        <div className="product-actions">
                          {isAdmin && (
                            <>
                              <button onClick={() => handleEditProduct(product)} className="edit-btn">Edit</button>
                              <button onClick={() => handleDeleteProduct(product._id)} className="delete-btn">Delete</button>
                            </>
                          )}
                          <button
                            onClick={() => { setSelectedProduct(product); setShowReviewsModal(true); }}
                            className="reviews-button"
                          >
                            Reviews
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            {/* --- External Seller Products Page --- */}
            {showSellerProductsPage && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
                  <h2 style={{ color: "#e1bb3e", marginBottom: 0, marginRight: 24 }}>External Seller Products</h2>
                  <button
                    style={{
                      background: "#232323",
                      color: "#e1bb3e",
                      border: "none",
                      borderRadius: 18,
                      padding: "10px 28px",
                      fontWeight: 700,
                      fontSize: 16,
                      cursor: "pointer",
                      marginLeft: 8,
                      boxShadow: "0 2px 8px #0006"
                    }}
                    onClick={() => setShowSellerProductsPage(false)}
                  >
                    Back to All Products
                  </button>
                </div>
                {sellerProducts.length === 0 ? (
                  <div style={{ color: "#fff", fontWeight: 500, fontSize: 18, marginTop: 24 }}>
                    No external seller products available.
                  </div>
                ) : (
                  <div className="product-grid normal-grid">
                    {sellerProducts.map((product) => (
                      <div key={product._id} className="product-wrapper">
                        <ProductCard product={product} onLoginToBuy={handleLoginToBuy} />
                        <div className="product-actions">
                          {isAdmin && (
                            <>
                              <button onClick={() => handleEditProduct(product)} className="edit-btn">Edit</button>
                              <button onClick={() => handleDeleteProduct(product._id)} className="delete-btn">Delete</button>
                            </>
                          )}
                          <button
                            onClick={() => { setSelectedProduct(product); setShowReviewsModal(true); }}
                            className="reviews-button"
                          >
                            Reviews
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {isAdmin && showAddProductModal && (
        <AddProductModal
          onClose={() => setShowAddProductModal(false)}
          onSave={handleProductAdded}
        />
      )}
      {isAdmin && showEditProductModal && editProduct && (
        <EditProductModal
          product={editProduct}
          onClose={() => setShowEditProductModal(false)}
          onProductUpdated={updatedProduct => {
            setProducts(products => products.map(p => p._id === updatedProduct._id ? updatedProduct : p));
            setFilteredProducts(filtered => filtered.map(p => p._id === updatedProduct._id ? updatedProduct : p));
          }}
        />
      )}
      {showReviewsModal && (
        <ReviewsModal
          onClose={() => setShowReviewsModal(false)}
          reviews={selectedProduct ? selectedProduct.reviews : []}
          productName={selectedProduct ? selectedProduct.title : ''}
          productId={selectedProduct ? selectedProduct._id : undefined}
        />
      )}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
      <Footer className="store-footer" />
    </div>
  );
};

export default Store;
