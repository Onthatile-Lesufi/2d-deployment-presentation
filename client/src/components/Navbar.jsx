import React from "react";
import { FaShoppingCart, FaUserCircle, FaHeart, FaSignOutAlt, FaCamera } from "react-icons/fa";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "../styles/Navbar.css";
import LogoNoText from "../assets/Logo-no-text.svg";
import ShinyText from './ShinyText';

export default function Navbar({ onLoginClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems } = useCart();
  // Fix: Always check localStorage for loggedInUser on every render
  const [loggedInUser, setLoggedInUser] = React.useState(() => {
    try {
      return JSON.parse(localStorage.getItem('loggedInUser'));
    } catch {
      return null;
    }
  });
  const [showProfileMenu, setShowProfileMenu] = React.useState(false);
  const [profilePic, setProfilePic] = React.useState(() => {
    try {
      const user = JSON.parse(localStorage.getItem('loggedInUser'));
      return user && user.profilePic ? user.profilePic : localStorage.getItem('profilePic') || null;
    } catch {
      return null;
    }
  });

  // Keep profilePic in sync with localStorage (but NOT loggedInUser, which is now always live)
  React.useEffect(() => {
    const syncPic = () => {
      try {
        const user = JSON.parse(localStorage.getItem('loggedInUser'));
        setProfilePic(user && user.profilePic ? user.profilePic : localStorage.getItem('profilePic') || null);
      } catch {
        setProfilePic(null);
      }
    };
    syncPic();
    window.addEventListener('storage', syncPic);
    window.addEventListener('focus', syncPic);
    document.addEventListener('auth-login', syncPic);
    return () => {
      window.removeEventListener('storage', syncPic);
      window.removeEventListener('focus', syncPic);
      document.removeEventListener('auth-login', syncPic);
    };
  }, []);

  // Listen for login/logout events to update state
  React.useEffect(() => {
    const syncUser = () => {
      try {
        setLoggedInUser(JSON.parse(localStorage.getItem('loggedInUser')));
      } catch {
        setLoggedInUser(null);
      }
    };
    window.addEventListener('storage', syncUser);
    window.addEventListener('focus', syncUser);
    document.addEventListener('auth-login', syncUser);
    return () => {
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('focus', syncUser);
      document.removeEventListener('auth-login', syncUser);
    };
  }, []);

  // Handle logout
  const handleLogout = () => {
    // Remove user from localStorage and update profilePic state
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('profilePic');
    setProfilePic(null);
    setShowProfileMenu(false);
    window.location.reload();
  };

  // Handle profile pic change
  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('profilePic', file);
    fetch('/api/upload-profile-pic', {
      method: 'POST',
      body: formData,
    })
      .then(res => res.json())
      .then(async data => {
        if (data.path) {
          // Update backend user record
          const user = JSON.parse(localStorage.getItem('loggedInUser'));
          await fetch('/api/users/update-profile-pic', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: user.email, profilePic: data.path })
          });
          // Always update both localStorage and user object
          if (user) {
            localStorage.setItem('loggedInUser', JSON.stringify({ ...user, profilePic: data.path }));
          }
          localStorage.setItem('profilePic', data.path);
          setProfilePic(data.path);
          // Force update everywhere
          window.dispatchEvent(new Event('storage'));
        }
      });
  };

  // Helper to resolve image path for local uploads
  const resolveProfilePic = (src) => {
    if (!src) return null;
    if (src.startsWith("/uploads")) {
      return process.env.PUBLIC_URL + src;
    }
    return src;
  };

  return (
    <nav className="navbar">
      <div className="logo-container">
        <img src={LogoNoText} alt="Logo" className="logo" />
        <h3>The Drunken Giraffe</h3>
      </div>

      <div className="navLinksMiddle">
        <Link
          to="/landing-page"
          className={location.pathname === "/landing-page" ? "active" : ""}
        >
          Home
        </Link>
        <Link
          to="/about"
          className={location.pathname === "/about" ? "active" : ""}
        >
          About
        </Link>
        {/* Show both Store and My Store for sellers */}
        {loggedInUser && loggedInUser.isSeller ? (
          <>
            <Link
              to="/store"
              className={location.pathname === "/store" ? "active" : ""}
            >
              Store
            </Link>
            <Link
              to="/seller-store"
              className={location.pathname === "/seller-store" ? "active" : ""}
            >
              My Store
            </Link>
          </>
        ) : (
          <Link
            to="/store"
            className={location.pathname === "/store" ? "active" : ""}
          >
            Store
          </Link>
        )}
      </div>

      <div className="navLinksRight">
        <div
          className="cart-icon"
          style={{ position: "relative", marginTop: "8px", cursor: "pointer" }}
        >
          <Link
            to="/cart"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <FaShoppingCart size={24} />
            {cartItems.length > 0 && (
              <span className="cart-badge">{cartItems.length}</span>
            )}
          </Link>
        </div>
        {/* Only show Login button if not logged in */}
        {!loggedInUser && (
          <button
            className="login-btn"
            onClick={onLoginClick}
            style={{
              marginLeft: 16,
              marginTop: 0,
              background: "#e1bb3e",
              color: "#350b0f",
              border: "none",
              borderRadius: 8,
              padding: "10px 28px",
              fontWeight: 700,
              fontSize: 16,
              cursor: "pointer",
              boxShadow: 'inset 4px 4px 10px rgba(255, 255, 255, 0.3), inset -2px -2px 10px rgba(0, 0, 0, 0.7)',
              transition: "background 0.2s, color 0.2s"
            }}
          >
            <ShinyText text="Login" disabled={false} speed={3} className="nav-button-text" />
          </button>
        )}
        {/* Only show Profile button if logged in */}
        {loggedInUser && (
          <>
            <button
              className="profile-btn"
              onClick={() => setShowProfileMenu((v) => !v)}
              style={{
                marginLeft: 16,
                background: '#e1bb3e',
                color: '#350b0f',
                border: 'none',
                borderRadius: 8,
                padding: '8px 18px',
                fontWeight: 700,
                fontSize: 16,
                cursor: 'pointer'
              }}
            >
              Profile
            </button>
            {/* Show Dashboard button for admin */}
            {loggedInUser.isAdmin && (
              <button
                className="dashboard-btn"
                style={{
                  marginLeft: 16,
                  background: "#e1bb3e",
                  color: "#350b0f",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 18px",
                  fontWeight: 700,
                  fontSize: 16,
                  cursor: "pointer"
                }}
                onClick={() => window.location.href = "/dashboard"}
              >
                Dashboard
              </button>
            )}
          </>
        )}
        {/* ...existing code for profile dropdown menu... */}
        {showProfileMenu && loggedInUser && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 44,
              background: "#fff",
              color: "#350b0f",
              borderRadius: 10,
              boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
              minWidth: 200,
              zIndex: 1000,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {profilePic ? (
                <img
                  src={resolveProfilePic(profilePic)}
                  alt="Profile"
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid #e1bb3e'
                  }}
                />
              ) : (
                <FaUserCircle size={48} color="#9b1c23" />
              )}
              <div>
                <div style={{ fontWeight: 700 }}>{loggedInUser.username}</div>
                <div style={{ fontSize: 13, color: "#888" }}>{loggedInUser.email}</div>
              </div>
            </div>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
                fontSize: 15,
                color: "#9b1c23"
              }}
            >
              <FaCamera />
              <span>Change Profile Picture</span>
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleProfilePicChange}
              />
            </label>
            <Link
              to="/wishlist"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#9b1c23",
                textDecoration: "none",
                fontSize: 15
              }}
              onClick={() => setShowProfileMenu(false)}
            >
              <FaHeart /> View Wishlist
            </Link>
            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "none",
                border: "none",
                color: "#9b1c23",
                fontWeight: 700,
                fontSize: 15,
                cursor: "pointer",
                padding: 0
              }}
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        )}
        <button
          className="become-seller-btn"
          style={{
            marginLeft: 16,
            marginTop: 0,
            background: "#e1bb3e",
            color: "#350b0f",
            border: "none",
            borderRadius: 8,
            padding: "0 18px",
            fontWeight: 700,
            fontSize: 16,
            cursor: "pointer",
            boxShadow: 'inset 4px 4px 10px rgba(255, 255, 255, 0.3), inset -2px -2px 10px rgba(0, 0, 0, 0.7)',
          }}
          onClick={() => {
            window.location.href = "/become-seller";
          }}
        >
          <ShinyText text="Sell" disabled={false} speed={3} className="nav-button-text" />
        </button>
      </div>
    </nav>
  );
}
