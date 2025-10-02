import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import "../components/css/AddProduct.css";

const AddProductPage = () => {
  const [productName, setProductName] = useState("");
  const [vendor, setVendor] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [rating, setRating] = useState("");
  // const [type, setType] = useState("");
  const [selectedType, setSelectedType] = useState("product");
  const [message, setMessage] = useState("");
  const [productId, setProductId] = useState([]);
  const [productImage, setProductImage] = useState([]);

  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      setImage(reader.result); // Base64 string
      setPreviewUrl(reader.result);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/products/register", {
        productName,
        description,
        price: parseFloat(price),
        image,
        rating: parseFloat(rating),
        vendor,
        type: selectedType,
      });

      setMessage(`${selectedType === "product" ? "Product" : "Service"} Product added successfully!`);
      setShowSuccess(true);
      setShowError(false);

      setTimeout(() => {
        window.location.href = "/shop"; // Redirect
      }, 2000);

    } catch (error) {
      console.error("Error creating product:", error);
      setMessage(`Failed to add ${selectedType === "product" ? "product" : "service"}.`);
      setShowSuccess(false);
      setShowError(true);

      setTimeout(() => {
        setShowError(false);
      }, 3000);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/products");
      const ids = res.data.map(product => product._id);
      const dataImages = res.data.map(product => product.image);
      setProductId(ids);
      setProductImage(dataImages);
    } catch (error) {
      console.error("Error fetching product IDs:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="addproduct-container">

    <Row className="addPorS-container mb-4">
  <Col className="addPorS-button-group d-flex justify-content-center gap-3">
    <Button
      className={`addPorS-button ${selectedType === "product" ? "addPorS-active" : ""}`}
      onClick={() => setSelectedType("product")}
     
    >
      Add Product
    </Button>
    <Button
      className={`addPorS-button ${selectedType === "service" ? "addPorS-active" : ""}`}
      onClick={() => setSelectedType("service")}
     
    >
      Add Service
    </Button>
  </Col>
</Row>



      {/* Success and Error Popups */}
      {showSuccess && (
        <div className="admin-success-popup">
          Product added successfully!
        </div>
      )}

      {showError && (
        <div className="admin-success-popup error">
          Failed to add product. Please try again.
        </div>
      )}

      <Container className="mt-5 mb-5">
        <Row className="addproduct-row">
          <Col md={6} className="addproduct-image-col">
            <div
              className="addproduct-placeholder"
              onClick={triggerFileInput}
              style={{ cursor: "pointer" }}
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Product preview"
                  className="addproduct-image"
                />
              ) : (
                <span>Click to upload image</span>
              )}
            </div>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              ref={fileInputRef}
              style={{ display: "none" }}
            />
            <Button
              variant="outline-success"
              className="addproduct-button mt-3"
              onClick={triggerFileInput}
            >
              {image ? "Choose another image" : "Upload image"}
            </Button>
          </Col>

          <Col md={{ span: 5, offset: 1 }} className="addproduct-form-col">
            <div className="addproduct-form-wrapper">
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formProductName">
                  <Form.Label className="addproduct-label">Product Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="addproduct-input"
                  />
                </Form.Group>

                <Form.Group controlId="formVendor">
                  <Form.Label className="addproduct-label">Vendor</Form.Label>
                  <Form.Control
                    type="text"
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    className="addproduct-input"
                  />
                </Form.Group>

                <Form.Group controlId="formDescription">
                  <Form.Label className="addproduct-label">Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="addproduct-input"
                  />
                </Form.Group>

                <Form.Group controlId="formPrice">
                  <Form.Label className="addproduct-label">Price (R)</Form.Label>
                  <Form.Control
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="addproduct-input"
                  />
                </Form.Group>

                <Button
                  variant="outline-success"
                  className="addproduct-button mt-3"
                  type="submit"
                >
                  Post Product
                </Button>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AddProductPage;
