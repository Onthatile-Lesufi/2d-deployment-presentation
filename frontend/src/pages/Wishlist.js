import { Container, Row, Col } from "react-bootstrap";
import { Typeahead } from "react-bootstrap-typeahead";
import OutlineButton from "../components/OutlineButton.js";
import "./css/Shop.css";
import ShopItemCard from "../components/ShopItemCard.js";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";


function Wishlist() {
  const [displayMaxCount, setDisplayMaxCount] = useState(20);
  const [products, setProducts] = useState([]);
  const [email,setEmail] = useState("");
  const [user, setUser] = useState(null);

useEffect(() => {
  async function GetCurrentUser() {
      try {
          const _res = await axios.get("https://dv200-deployment-presentation-4af1d27ec0f4.herokuapp.com/api/users/logged", {
              withCredentials: true, // Ensure cookies are sent with the request
          });
          if (_res.data) {
            setUser(_res.data.user);
            setEmail(_res.data.user.email);
          }
      } catch (error) {
          console.log("Error checking credentials:", error);
      }
  }
  
  GetCurrentUser();
}, []);

useEffect(() => {
  if (!email) return;

  const fetchProducts = async () => {
    try {
      const userRes = await axios.get(`https://dv200-deployment-presentation-4af1d27ec0f4.herokuapp.com/api/users/${email}`);
      const productIDs = userRes.data.wishlist;
      const productPromises = productIDs.map(async (id) => {
        try {
          const res = await axios.get(`https://dv200-deployment-presentation-4af1d27ec0f4.herokuapp.com/api/products/${id}`);
          return res.data;
        } catch (err) {
          //run logic to remove this from the users wishlist
          console.log(`Product not found: ${id}`, err.response?.status);
          return null;
        }
      });
      let productResponses = await Promise.all(productPromises);
      productResponses = productResponses.filter(data => data != null);
      
      setProducts(productResponses.map(res => res));
    } catch (error) {
      console.error("Fetch error:", error);
    }
  };

  fetchProducts();
}, [email]);

  return (
    <div className="shop-container">
      <Container id="shop-item-shop-container">
        <Row className="g-4 justify-content-center">
          {products.slice(0, displayMaxCount).map((product, index) => (
            <Col key={index} xs={12} sm={6} md={4} lg={3}>
              <Link to={`/product/${product._id}`}>
               
                  <ShopItemCard
                    productImage={product.image}
                    productName={product.productName}
                    productPrice={product.price}
                    productRating={product.rating}
                  />
              
              </Link>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
}

export default Wishlist;
