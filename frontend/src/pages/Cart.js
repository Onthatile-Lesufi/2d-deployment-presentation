// pages/Cart.js
import React, { useState } from "react";
import CartItem from "../components/CartItem";
import OutlineButton from "../components/OutlineButton";
import "./css/Cart.css";
import DummyImg from "../assets/images/Asset_58x.png";
import axios from "axios";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [coupon, setCoupon] = useState("");
  const [subtotal, setSubTotal] = useState(0);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleRemove = async (id) => {
    try {
      await axios.put(`https://dv200-deployment-presentation-4af1d27ec0f4.herokuapp.com/api/users/removeFromCart/${user.email}`,{
        productID: id
      });
      fetchProducts();
    } catch (error) {
      console.log("Error removing item from cart", error);
      
    }
  };

  
  const discount = coupon === "DISCOUNT10" ? 0.1 * subtotal : 0;
  const grandTotal = subtotal - discount;
  const [displayMaxCount, setDisplayMaxCount] = useState(20);
   const fetchProducts = async () => {
      try {
        const userRes = await axios.get(
          `https://dv200-deployment-presentation-4af1d27ec0f4.herokuapp.com/api/users/${user.email}`
        );

        const productIDs = userRes.data.cartIds;
        const productPromises = productIDs.map(async (id) => {
          try {
            const res = await axios.get(
              `https://dv200-deployment-presentation-4af1d27ec0f4.herokuapp.com/api/products/${id}`
            );
            return res.data;
          } catch (err) {
            //run logic to remove this from the users wishlist
            console.log(`Product not found: ${id}`, err.response?.status);
            return null;
          }
        });
        let productResponses = await Promise.all(productPromises);
        productResponses = productResponses.filter((data) => data != null);
        let mergedResponses = [];

        productResponses.forEach((product) => {
          const index = mergedResponses.findIndex(
            (item) => item.product._id === product._id
          );

          if (index !== -1) {
            mergedResponses[index].quantity += 1;
          } else {
            mergedResponses.push({ product, quantity: 1 });
          }
        });

        setCartItems(mergedResponses.map((res) => res));
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
  useEffect(() => {
    async function GetCurrentUser() {
        try {
            const _res = await axios.get("https://dv200-deployment-presentation-4af1d27ec0f4.herokuapp.com/api/users/logged", {
                withCredentials: true, // Ensure cookies are sent with the request
            });
            if (_res.data) setUser(_res.data.user);
        } catch (error) {
            console.log("Error checking credentials:", error);
        }
    }

    GetCurrentUser();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    fetchProducts();
    
  }, [user]);
  useEffect(() =>{
    const tempSubTotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  setSubTotal(tempSubTotal);
  }, [cartItems])

  // Function to handle increase and decrease of quantity

 const handleIncrease = async (productId) => {
  if (!user) {
    console.warn("User not set yet");
    return;
  }

  try {
   await axios.put(`https://dv200-deployment-presentation-4af1d27ec0f4.herokuapp.com/api/users/increaseFromCart/${user.email}`, {
      productID: productId
    });
    fetchProducts(); 
  } catch (error) {
    console.error("Error increasing quantity:", error);
  }
};

const handleDecrease = async (productId) => {
  if (!user) {
    console.warn("User not set yet");
    return;
  }

  try {
    await axios.put(`https://dv200-deployment-presentation-4af1d27ec0f4.herokuapp.com/api/users/decreaseFromCart/${user.email}`, {
      productID: productId
    });
    fetchProducts();
  } catch (error) {
    console.error("Error decreasing quantity:", error);
  }
};
const clearCart = async() => {
  if (!user) {
    console.warn("User not set yet");
    return;
  }
  try {
    await axios.put(`https://dv200-deployment-presentation-4af1d27ec0f4.herokuapp.com/api/users/clearCart/${user.email}`)
    fetchProducts();
  } catch (error) {
    console.error("Error clearing cart", error);
    
  }
}
const clearCartAndBuy = async() => {
  
  if (!user) {
    console.warn("User not set yet");
    return;
  }
  try {
    await axios.put(`https://dv200-deployment-presentation-4af1d27ec0f4.herokuapp.com/api/users/clearCart/${user.email}`)
    fetchProducts();
    navigate('/purchase');
  } catch (error) {
    console.error("Error clearing cart", error);
    
  }
}



  return (
    <div className="cart-container">
      <h1>Your Cart</h1>
      <table className="cart-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {cartItems.length > 0 ? (
            cartItems.map((item) => (
              <CartItem key={item.product._id} item={item} onRemove={handleRemove} onIncrease={handleIncrease}
               onDecrease={handleDecrease}/>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: "center" }}>
                Your cart is empty.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="cart-summary">
        <div className="summary-box">
          <h3>Summary</h3>
          <div className="summary-line">
            <span>Subtotal:</span>
            <span>R{subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-line">
            <label htmlFor="coupon">Coupon:</label>
            <input
              type="text"
              id="coupon"
              placeholder="Enter coupon"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
            />
          </div>
          <div className="summary-line total">
            <span>Grand Total:</span>
            <span>R{grandTotal.toFixed(2)}</span>
          </div>
          {grandTotal>0 ? <OutlineButton buttonLabel={"BUY"} buttonFunction={clearCartAndBuy} buttonLink={'/purchase'}/> : <OutlineButton buttonLabel={"BUY"} buttonLink={'/purchase'} disabled={true}/>}
        </div>
      </div>
    </div>
  );
}

export default Cart;
