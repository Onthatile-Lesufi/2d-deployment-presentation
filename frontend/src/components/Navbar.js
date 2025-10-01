import { Link, NavLink } from "react-router-dom";
import "./css/Navbar.css";
import SmallLogo from "../assets/images/logo_hit_me_up8x.png";
import OutlineButton from "./OutlineButton";
import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import EmptyCart from "../assets/glyphs/EmptyCart.svg";
import FullCart from "../assets/glyphs/FullCart.svg";
import wishlistIcon from "../assets/images/HeartIcon.png";
import Cart from "../pages/Cart";
import App from "../App";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const [cart, setCart] = useState(null);

  const navHeading = [
    {
      value: "/",
      label: "HOME",
    },
    {
      value: "/shop",
      label: "SHOP",
    },
    {
      value: "/about",
      label: "ABOUT",
    },
    // {
    //   value: "/admin",
    //   label: "Admin",
    // },
  ];

  useEffect(() => {
    CheckCredentials()
  }, []);

    async function CheckCredentials() {
      try {
        const _user = await axios.get("http://localhost:5000/api/users/logged", {
            withCredentials: true, // Ensure cookies are sent with the request
        });
        if (_user) {
          setUser(_user);
          setRole(_user.data.user.role);
        }
      } catch (error) {
        console.log(error);
      }
    }

  ///logout function
  async function LogOut() {
    try {
      const res = await axios.get("http://localhost:5000/api/users/logout");
      navigate("/");
      console.log(res);
    } catch (error) {
      console.error("Logout failed", error);
    }
  }


const [menuOpen, setMenuOpen] = useState(false);


  return (
    <div className="navbar-container">
      <Link className="logo-link" to="/">
        <img className="logo-image" src={SmallLogo} alt="Logo" />
      </Link>

      {/* Hamburger Icon */}
    <div
      className="hamburger"
      onClick={() => setMenuOpen((prev) => !prev)}
    >
      <span></span>
      <span></span>
      <span></span>
    </div>

      <div className={`center-buttons ${menuOpen ? "open" : ""}`}>
        {navHeading.map((_heading) => (
          <NavLink
            key={_heading.value}
            to={_heading.value}
            className="navbar-link"
            style={({ isActive }) => ({
              fontWeight: isActive ? "800" : "normal",
            })}
          >
            {_heading.label}
          </NavLink>
        ))}
        {role == 'admin' ? (
            <NavLink
            to={'/admin'}
            className="navbar-link"
            style={({ isActive }) => ({
              fontWeight: isActive ? "800" : "normal",
            })}
          >
            {"ADMIN"}
          </NavLink>
        ): null}
      </div>

      {user ? (
        <div className="user-nav-buttons">
          <button className="logout-button" onClick={LogOut}>
            Logout
          </button>
          <Link to="/cart">
            <img src={cart ? FullCart : EmptyCart} alt="Cart" />
          </Link>
          <Link to="/wishlist">
            <img className="wishlist-Button" src={wishlistIcon} />
          </Link>
        </div>
      ) : (
        <Link to="/log-in" id="entry-button-link">
          <Button id="entry-button">LOG IN/SIGN UP</Button>
        </Link>
      )}
    </div>
  );
}

export default Navbar;
