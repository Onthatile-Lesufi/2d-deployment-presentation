import React, { useState } from "react";
import "../styles/LandingPage.css";
import { Link, useNavigate } from "react-router-dom";

// import BlackLogo from "../assets/BlackLogo.svg";
import WhiteLogo from "../assets/WhiteLogo.svg";
import HeroImage from "../assets/HeroImage.svg";
import OurStoryImage from "../assets/OurStoryImage.svg";
import OurProductsImage from "../assets/OurProductsImage.svg";
import LogoNoText from "../assets/Logo-no-text.svg";

import Footer from "../components/Footer";
import AuthModal from "../components/AuthModal";
import ProfileModal from "../components/ProfileModal";

const LandingPage = () => {
  // Load user and profilePic from localStorage if available
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

  const [loggedInUser, setLoggedInUser] = useState(getStoredUser());
  const [profilePic, setProfilePic] = useState(getStoredProfilePic());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const navigate = useNavigate();

  // Listen for login from AuthModal
  function handleAuthModalClose(user) {
    setShowAuthModal(false);
    // Only log in if a valid user object is returned
    if (
      user &&
      typeof user === "object" &&
      !user.hasOwnProperty('stateNode') &&
      user.username &&
      user.email
    ) {
      const safeUser = {
        username: user.username,
        email: user.email,
        profilePic: user.profilePic || null
      };
      setLoggedInUser(safeUser);
      localStorage.setItem('loggedInUser', JSON.stringify(safeUser));
      setShowProfileModal(true);
    } else {
      // If no user, ensure logged out state
      setLoggedInUser(null);
      localStorage.removeItem('loggedInUser');
      localStorage.removeItem('profilePic');
    }
  }

  function handleProfilePicChange(url, file) {
    setProfilePic(url);
    setLoggedInUser((prev) => (prev ? { ...prev, profilePic: url } : prev));
    localStorage.setItem('profilePic', url);
    if (loggedInUser) {
      localStorage.setItem('loggedInUser', JSON.stringify({ ...loggedInUser, profilePic: url }));
    }
    // Force update everywhere
    window.dispatchEvent(new Event('storage'));
  }

  // Listen for profilePic changes and force re-render
  React.useEffect(() => {
    const syncPic = () => setProfilePic(getStoredProfilePic());
    window.addEventListener('storage', syncPic);
    return () => window.removeEventListener('storage', syncPic);
  }, []);

  // Show login modal on logout
  function handleLogout() {
    setShowProfileModal(false);
    setLoggedInUser(null);
    setProfilePic(null);
    setShowAuthModal(false); // Do NOT show login modal immediately
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('profilePic');
    // Redirect to landing page ("/landing-page" or "/")
    navigate("/landing-page");
  }

  // REMOVE the <Navbar ... /> from here, only render it in App.js!
  return (
    <div className="landing-page">
      {/* <Navbar
        onLoginClick={() => setShowAuthModal(true)}
        showLogin={!loggedInUser}
        showProfile={!!loggedInUser}
        onProfileClick={() => setShowProfileModal(true)}
        profilePic={profilePic}
      /> */}

      <div className="hero-section">
        <div className="hero-text">
          <h1>The Drunken Giraffe</h1>
        </div>
      </div>

      <div className="our-story-section">
        <img src={OurStoryImage} alt="Our Story" className="our-story-image" />
        <div className="our-story-text">
          <h2>Our Story</h2>
          <p>
            At The Drunken Giraffe, we believe liquor should be more than just a
            drink — it should be a journey of craftsmanship, culture, and
            discovery. Born from a love for premium spirits and a respect for
            local artistry, we curate and craft a refined collection of in-house
            creations, rare imports, and standout local distillery gems. Whether
            you’re a seasoned connoisseur or simply crave something extraordinary,
            we’re here to elevate your experience, one sip at a time.
          </p>
          <button className="Read-more-button">
            <Link to="/about" className="read-more-link">
              <h3>Read More</h3>
            </Link>
          </button>
        </div>
      </div>

      <div className="our-products-section">
        <div className="our-products-text">
          <h2>Our Products</h2>
          <p>
            Our collection is a testament to our commitment to quality and
            craftsmanship. From our in-house creations to rare imports and
            standout local distillery gems, we offer a diverse range of spirits
            that cater to every palate. Each bottle tells a story, and we invite
            you to explore the world of flavors, aromas, and experiences that
            await you at The Drunken Giraffe.
          </p>
          <button className="Read-more-button" id="view-collection">
            <Link to="/store" className="read-more-link">
              <h3>View the collection</h3>
            </Link>
          </button>
        </div>
        <img src={OurProductsImage} alt="Our Products" className="our-products-image" />
      </div>

      <div className="footer-section">
        <Footer />
      </div>
      {showAuthModal && (
        <AuthModal
          onClose={(user) => handleAuthModalClose(user)}
        />
      )}
      {showProfileModal && loggedInUser && (
        <ProfileModal
          user={loggedInUser}
          onClose={() => setShowProfileModal(false)}
          onLogout={handleLogout}
          onProfilePicChange={handleProfilePicChange}
        />
      )}
    </div>
  );
};

export default LandingPage;