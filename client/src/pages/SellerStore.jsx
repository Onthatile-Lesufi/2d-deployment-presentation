import React, { useEffect, useState } from "react";
import ProductCard from "../components/ProductCard";
import AddProductModal from "../components/AddProductModal";
import EditProductModal from "../components/EditProductModal";
import Footer from "../components/Footer";
import ReviewsModal from "../components/ReviewsModal"; // <-- Add this import
import { FaArrowRight } from "react-icons/fa"; // Add this for the right arrow icon

export default function SellerStore() {
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [expandedCardId, setExpandedCardId] = useState(null);

  // Get logged-in seller info
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("loggedInUser"));
      if (user && user.isSeller) {
        setSeller(user);
      } else {
        window.location.href = "/become-seller";
      }
    } catch {
      window.location.href = "/become-seller";
    }
  }, []);

  // Fetch only this seller's products
  useEffect(() => {
    if (!seller) return;
    async function fetchSellerProducts() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/products?seller=${encodeURIComponent(seller.username)}`
        );
        const data = await res.json();
        // Filter in case backend returns extra products
        setProducts(data.filter(
          p => p.seller && p.seller.toLowerCase() === seller.username.toLowerCase()
        ));
      } catch {
        setProducts([]);
      }
      setLoading(false);
    }
    fetchSellerProducts();
  }, [seller]);

  // Add product handler
  const handleProductAdded = (product) => {
    setProducts((prev) => [...prev, product]);
    setShowAddProductModal(false);
  };

  // Edit product handler
  const handleEditProduct = (product) => {
    setEditProduct(product);
    setShowEditProductModal(true);
  };

  // Update product after edit
  const handleProductUpdated = (updatedProduct) => {
    setProducts((products) =>
      products.map((p) => (p._id === updatedProduct._id ? updatedProduct : p))
    );
    setShowEditProductModal(false);
    setEditProduct(null);
  };

  // Delete product handler
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await fetch(`/api/products/${productId}`, { method: "DELETE" });
      setProducts((products) => products.filter((p) => p._id !== productId));
    } catch {
      alert("Failed to delete product");
    }
  };

  if (!seller) {
    return null;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        fontFamily: '"Merriweather", serif',
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h2
        style={{
          color: "#e1bb3e",
          marginBottom: 32,
          fontWeight: 800,
          fontSize: 36,
          letterSpacing: 1,
          textShadow: "0 2px 12px #000",
          paddingLeft: 48,
        }}
      >
        My Store
      </h2>
      <div style={{ marginBottom: 32, paddingLeft: 48 }}>
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
            marginBottom: 16,
          }}
          onClick={() => setShowAddProductModal(true)}
        >
          Add Product
        </button>
      </div>
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: 28,
        justifyContent: "flex-start",
        alignItems: "flex-start", // Align cards to the left
        width: "100%",
        maxWidth: 1100,
        margin: "0 auto",
       marginLeft:40,
        zIndex: 1,
        position: "relative",
      }}>
        {loading ? (
          <div
            style={{
              color: "#e1bb3e",
              fontWeight: 700,
              fontSize: 22,
              textAlign: "center",
              marginTop: 80,
            }}
          >
            Loading your products...
          </div>
        ) : products.length === 0 ? (
          <div
            style={{
              color: "#e1bb3e",
              fontWeight: 700,
              fontSize: 22,
              textAlign: "center",
              marginTop: 80,
            }}
          >
            No products yet. Click "Add Product" to get started!
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 28,
              justifyContent: "flex-start",
              alignItems: "stretch",
              width: "100%",
              maxWidth: 1100,
              margin: "0 auto",
              padding: "0 32px",
              zIndex: 1,
              position: "relative",
            }}
          >
            {products.map((product) => {
              const expanded = expandedCardId === product._id;
              return (
                <div
                  key={product._id}
                  className="product-wrapper"
                  style={{
                    background: "#181818",
                    borderRadius: 22,
                    boxShadow: "0 4px 24px 0 rgba(0,0,0,0.18)",
                    padding: "28px 40px",
                    minHeight: 160,
                    minWidth: 1140,
                    margin: "0",
                    border: "1.5px solid #2a070b",
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    position: "relative",
                    transition: "box-shadow 0.18s, border 0.18s",
                    width: "100%",
                  }}
                >
                  {/* Left: Info */}
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{
                      fontWeight: 700,
                      fontSize: 22,
                      color: "#fff",
                      marginBottom: 2,
                      letterSpacing: 0.2,
                      textAlign: "left",
                    }}>
                      {product.title}
                    </div>
                    <div style={{
                      color: "#e1bb3e",
                      fontWeight: 700,
                      fontSize: 18,
                      marginBottom: 2,
                      textAlign: "left",
                    }}>
                      R {product.price.toFixed(2)}
                    </div>
                    <div style={{
                      color: "#fff",
                      fontSize: 15,
                      marginBottom: 2,
                      textAlign: "left",
                    }}>
                      Stock: <b>{product.stock}</b>
                    </div>
                    <div style={{
                      color: "#e1bb3e",
                      fontSize: 14,
                      marginBottom: 2,
                      textAlign: "left",
                    }}>
                      {product.category}
                    </div>
                    {/* Always show description under category */}
                    <div style={{
                      color: "#ccc",
                      fontSize: 14,
                      marginBottom: 10,
                      textAlign: "left",
                      opacity: 0.92,
                      minHeight: 18,
                      wordBreak: "break-word", // Ensure long words wrap
                      whiteSpace: "pre-line", // Allow wrapping and respect line breaks
                      overflowWrap: "break-word", // Extra safety for wrapping
                      maxWidth: "100%", // Prevent overflow
                    }}>
                      {product.description}
                    </div>
                    {/* Reviews button always below description */}
                    <button
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        background: "linear-gradient(90deg, #e1bb3e 60%, #e35537 100%)",
                        color: "#350b0f",
                        border: "none",
                        borderRadius: 999,
                        padding: "8px 22px",
                        fontWeight: 700,
                        fontSize: 15,
                        cursor: "pointer",
                        marginTop: 10,
                        boxShadow: "0 1px 4px #0001",
                        transition: "background 0.18s",
                        width: "fit-content",
                      }}
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowReviewsModal(true);
                      }}
                    >
                      Reviews
                    </button>
                  </div>
                  {/* Right: Image */}
                  <div style={{
                    flex: "0 0 220px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    position: "relative",
                    flexDirection: "column",
                  }}>
                    <div style={{
                      background: "#232323",
                      borderRadius: 22,
                      boxShadow: "0 2px 12px #0002",
                      width: 180,
                      height: 180,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "visible",
                      position: "relative",
                      flexDirection: "column",
                    }}>
                      <img
                        src={product.image}
                        alt={product.title}
                        style={{
                          width: 160,
                          height: 160,
                          objectFit: "cover",
                          borderRadius: 18,
                          background: "#fff",
                          boxShadow: "0 2px 12px #0007"
                        }}
                      />
                      {/* Edit and Delete buttons always visible under the image */}
                      <div
                        style={{
                          display: "flex",
                          gap: 12,
                          justifyContent: "center",
                          alignItems: "center",
                          marginTop: 10,
                        }}
                      >
                        <button
                          style={{
                            background: "#fff",
                            color: "#2ecc40",
                            border: "2px solid #2ecc40",
                            borderRadius: 22,
                            padding: "10px 36px",
                            fontWeight: 700,
                            fontSize: 18,
                            cursor: "pointer",
                            boxShadow: "0 4px 16px #0002",
                            zIndex: 2,
                          }}
                          onClick={e => {
                            e.stopPropagation();
                            handleEditProduct(product);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          style={{
                            background: "#fff",
                            color: "#9b1c23",
                            border: "2px solid #9b1c23",
                            borderRadius: 22,
                            padding: "10px 36px",
                            fontWeight: 700,
                            fontSize: 18,
                            cursor: "pointer",
                            boxShadow: "0 4px 16px #0002",
                            zIndex: 2,
                          }}
                          onClick={e => {
                            e.stopPropagation();
                            handleDeleteProduct(product._id);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* ...no expanded actions at the bottom, handled above... */}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {showAddProductModal && (
        <AddProductModal
          onClose={() => setShowAddProductModal(false)}
          onSave={handleProductAdded}
        />
      )}
      {showEditProductModal && editProduct && (
        <EditProductModal
          product={editProduct}
          onClose={() => setShowEditProductModal(false)}
          onProductUpdated={handleProductUpdated}
        />
      )}
      {/* Reviews Modal */}
      {showReviewsModal && (
        <ReviewsModal
          onClose={() => setShowReviewsModal(false)}
          reviews={selectedProduct ? selectedProduct.reviews : []}
          productName={selectedProduct ? selectedProduct.title : ""}
          productId={selectedProduct ? selectedProduct._id : undefined}
        />
      )}
      <Footer />
      {/* Example floating buttons container */}
      <div
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 100,
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          pointerEvents: "none", // allow clicks to pass through except on buttons
        }}
      >
        <div style={{
          display: "flex",
          gap: 16,
          margin: "0 32px 32px 0",
          pointerEvents: "auto", // allow clicks on buttons
        }}>
          {/* Replace with your actual floating buttons */}
          {/* <button style={{ borderRadius: 999, padding: "14px 28px", background: "#e1bb3e", color: "#350b0f", fontWeight: 700, fontSize: 16, border: "none", boxShadow: "0 2px 8px #0006" }}>Chat</button>
          <button style={{ borderRadius: 999, padding: "14px 28px", background: "#9b1c23", color: "#fff", fontWeight: 700, fontSize: 16, border: "none", boxShadow: "0 2px 8px #0006" }}>Contact Us</button> */}
        </div>
      </div>
    </div>
  );
}
