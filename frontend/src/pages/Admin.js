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

function Product() {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [image, setImage] = useState("");
  const [productName, setProductName] = useState("");
  const [rating, setRating] = useState(0);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [vendor, setVendor] = useState("");
  const [email,setEmail] = useState("");
  const [type, setType] = useState("");
  const [role, setRole] = useState("");
  const [pendingProducts, setPendingProducts] = useState ([]);
  const { id } = useParams();
  const [currentIndex, setCurrentIndex] = useState(-1);

  useEffect(() => {
    fetchProducts();
    setEmail(JSON.parse(localStorage.getItem("email")));

  }, [id]);
  useEffect(() => {
    displayIndividualProducts();
  }, [isLoaded]);
  useEffect(() => {
    fetchUserRole();
  }, [email]);

  const fetchUserRole = async () => {
    try {
      const res = await axios.get(`https://dv200-deployment-presentation-4af1d27ec0f4.herokuapp.com/api/users/${email}`);
      setRole(res.data.role);
    } catch (error) {
      console.log("Error finding the user's role");
    }
  };
  //Fetch all products and only display pending products one at a time
  const fetchProducts = async () => {
    try {
      setIsLoaded(false);
      const res = await axios.get(`https://dv200-deployment-presentation-4af1d27ec0f4.herokuapp.com/api/products/`);
      let pending = [];
      for (let index = 0; index < res.data.length; index++) {
        let temp = res.data[index];
        if (temp.status === "pending" || temp.status==="flagged") {
          pending.push(temp);
        }
      }
      //Add all pending products to the useState
      setPendingProducts(pending);
      setIsLoaded(true);
    } catch (error) {
      console.log("Error fetching product data:", error);
    }
  };
  const displayIndividualProducts = () => {
    if (pendingProducts.length<=0) {
      return;
    }
    setImage(pendingProducts[0].image);
    setProductName(pendingProducts[0].productName);
    setRating(pendingProducts[0].rating);
    setDescription(pendingProducts[0].description);
    setPrice(pendingProducts[0].price);
    setVendor(pendingProducts[0].vendor);
    setType(pendingProducts[0].type);
  }
  const approveProduct = async() => {
    //run update
    const status = 'approved';
    
    try {
      const res = await axios.put(`https://dv200-deployment-presentation-4af1d27ec0f4.herokuapp.com/api/products/updateStatus/${pendingProducts[0]._id}`, {
        status
      });
      fetchProducts();
    } catch (error) {
      console.log("Error updating status to approved", error);
      
    }
  }
  const denyProduct = async() => {
    try {
      const res = await axios.delete(`https://dv200-deployment-presentation-4af1d27ec0f4.herokuapp.com/api/products/delete/${pendingProducts[0]._id}`);
      fetchProducts();
    } catch (error) {
      console.log("Error updating status to approved", error);
      
    }
  }
  if (!pendingProducts.length>0) {
    return (
      <div style={{height:'65vh'}}>
        <h1>No new products to review</h1>
      </div>
    )
  }
  
  return (
    <div className="product-page-container">
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
              <h4 className="product-type">{type}</h4> 
              <div className="product-rating">
                <RatingDisplay value={rating} readOnly={true} />
              </div>
              <p className="product-features">{description}</p>
              <Row>
                <Col md={5} className="product-price-col">
                  <p className="product-price">{`R ` + price}</p>
                </Col>
                <Col md={{ span: 5, offset: 2 }} className="product-buy-col">

                </Col>
                
              </Row>
            </div>
          </Col>
        </Row>
        <Row>
          <Col lg={6}>
            <OutlineButton buttonLabel={"Approve"} buttonFunction={approveProduct}/>
          </Col>
          <Col lg={6}>
            <OutlineButton buttonLabel={"Deny"} buttonFunction={denyProduct}/>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Product;
