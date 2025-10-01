import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import placeholder from "../assets/images/call-to-action.jpg";
import "./css/IndividualProduct.css";
import OutlineButton from "../components/OutlineButton";
import RatingDisplay from "../components/RatingDisplay";
import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom"; //lets us read the id
import { useNavigate } from "react-router-dom";
import ReviewContainer from "../components/ReviewContainer";
import heartIcon from '../assets/images/HeartIcon.png';
// import { set } from "mongoose";

const mockProduct = {
  image: placeholder,
  productName: "Her little Glock 18",
  rating: 3.5,
  description: [
    "The perfect self defense tool for the little lady in your life.",
    "Select fire with semi-auto and fully automatic modes.",
    "Beautiful faceted jewels",
  ],
  price: "$149.99",
  vendor: "Baby Girl Defense Systems LTD",
};

function Admin() {
  const navigate = useNavigate();

  const [image, setImage] = useState("");
  const [productName, setProductName] = useState("");
  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [vendor, setVendor] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState("");
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isFlagged, setIsFlagged] = useState(false);
  const { id } = useParams();
  const flagProduct = async() => {
    //run update
    const status = 'flagged';
    
    try {
      const res = await axios.put(`http://localhost:5000/api/products/updateStatus/${id}`, {
        status
      });
      setIsFlagged(true);
    } catch (error) {
      console.log("Error updating status to flagged", error);
      
    }
  }
  useEffect(() => {
    async function CheckCredentials() {
      try {
        const _user = await axios.get("http://localhost:5000/api/users/logged", {
            withCredentials: true, // Ensure cookies are sent with the request
        });
        if (_user) {
          setUser(_user.data.user);
          setRole(_user.data.user.role);
        }
      } catch (error) {
        console.log(error);
      }
    }

    fetchProducts();
    CheckCredentials();
  }, [id]);
  const addToCart = async () => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/users/cart/${user.email}`,
        {
          productID: id,
        }
      );
    } catch (error) {
      console.log("Error adding to cart" + error);
    }
  };
  const fetchProducts = async () => {
    try {
      
      const res = await axios.get(`http://localhost:5000/api/products/${id}`);
      setImage(res.data.image);
      setProductName(res.data.productName);
      setRating(res.data.rating);
      setDescription(res.data.description);
      setPrice(res.data.price);
      setVendor(res.data.vendor);
      setType(res.data.type);
      if (res.data.status == "flagged") {
        setIsFlagged(true);
      }
    } catch (error) {
      console.log("Error fetching product data:", error);
    }
  };
  const addToWishlist = async () => {
    try {
      const res = await axios.put(
        `http://localhost:5000/api/users/wishlist/${user.email}`,
        {
          productID: id,
        }
      );
    } catch (error) {
      console.log("Error adding to wishlist" + error);
    }
  };

  return (
    <div className="product-page-container">
      
      {(role === "admin" || role === "vendor") ? 
        <Link to={`/adminEdit/${id}`}>
          <button className="edit-button">Edit</button>
        </Link>
        :
        null
      }

      <Container style={{ marginTop: "40px", marginBottom: "40px" }}>
        <Row
          style={{
            marginTop: "20px",
            marginBottom: "20px",
            color: "white",
            textAlign: "left",
          }}
          className="indivProduct-row"
        >
          <Col md={6} lg={6} className="product-image-col">
            <img src={image} alt="Product" className="product-image" />
          </Col>
          <Col md={{ span: 5, offset: 1 }}>
            <div className="product-info">
              <h1 className="product-title">{productName}</h1>
              <h4 className="product-vendor">{vendor}</h4>
              <h6 className="product-type">{type}</h6>
              <div className="product-rating">
                <RatingDisplay value={rating} readOnly={true} />
              </div>
              <p className="product-features">{description}</p>
              <Row>
                <Col md={5} className="product-price-col">
                  <p className="product-price">{`R ` + price}</p>
                </Col>
                <Col md={{ span: 5, offset: 0 }} className="product-buy-col">
                  {/* <OutlineButton buttonLabel={"Buy Now"} onClick={addToCart} buttonLink={""}  /> */}
                  {/* The outline button is not letting me do an onclick. we need to add functionality for that*/}
                  <OutlineButton
                    buttonLabel={"Buy now"}
                    buttonFunction={addToCart}
                  />
                  {/* add to the cart */}
                </Col>
                <Col md={{ span: 2, offset: 0 }} className="product-wishlist-col">
                  <OutlineButton
                    buttonLabel={<img src={heartIcon} style={{width:'100%'}}/>}
                    buttonFunction={addToWishlist}
                  />
                </Col>
              </Row>
              <Row style={{marginTop: '2vh'}}>
                <div className="admin-button-group">
                  <Button
                    variant={isFlagged ? "danger" : "outline-danger"}
                    className="admin-flag-button"
                    onClick={flagProduct} 
                  >
                    {isFlagged ? "Flagged" : "Flag Product"}
                  </Button>
                </div>
              </Row>
            </div>
          </Col>
        </Row>
      </Container>
      <ReviewContainer productId={id} />
    </div>
  );
}

export default Admin;
