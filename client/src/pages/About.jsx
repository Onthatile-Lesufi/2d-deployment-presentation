import React, { useState } from "react";
import "../styles/LandingPage.css";

// import BlackLogo from "../assets/BlackLogo.svg";
import WhiteLogo from "../assets/WhiteLogo.svg";
import HeroImage from "../assets/HeroImage.svg";
import OurStoryImage from "../assets/OurStoryImage.svg";
import OurProductsImage from "../assets/OurProductsImage.svg";
import LogoNoText from "../assets/Logo-no-text.svg";
import WhoImage from "../assets/WhoImage.svg";
import LoveImage from "../assets/cognacLove.svg";
import MissionImage from "../assets/barrelsMission.svg";


import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import AuthModal from "../components/AuthModal";
import ProfileModal from "../components/ProfileModal";

import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const About = () => {
  // Get user/profilePic from localStorage for nav
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
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Listen for profilePic changes and force re-render
  React.useEffect(() => {
    const syncPic = () => {};
    window.addEventListener('storage', syncPic);
    return () => window.removeEventListener('storage', syncPic);
  }, []);

  return (
    <div className="about-page">
      <div className="hero-about">
        <div className="hero-about-text">
          <h1>About Us</h1>
          <h3>The Story of <br/> The Drunken <br/>Giraffe</h3>
        </div>
      </div>

<div className="accordion" id="accordionExample">
  <div className="accordion-item">
    <h1 className="accordion-header">
      <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne">
        Who are we?
      </button>
    </h1>
    <div id="collapseOne" className="accordion-collapse collapse show" data-bs-parent="#accordionExample">
      <div className="accordion-body" id="accordion-who">
        <div className="who-image">
            <img src={WhoImage} alt="Who are we" className="who-image" />
        </div>
        <div className="who-body"><p>The Drunken Giraffe was founded in the heart of Gauteng, South Africa, inspired by a love for exceptional spirits and the stories behind them. What began as a local passion has grown into a curated destination for those who appreciate the craft, character and culture of fine liquor.</p><p>We pride ourselves on offering more than just premium products. From our in-house craft range to rare imports and standout local distillery finds, every bottle is chosen to reflect quality and distinction.</p><p>Luxury is at the core of our brand, but we believe the experience should always feel personal. Whether you are a seasoned connoisseur or exploring something new, we are here to help you savour the extraordinary.</p>
        </div>
      </div>
    </div>
  </div>
  <div className="accordion-item">
    <h1 className="accordion-header">
      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
        Our love for premium liquor
      </button>
    </h1>
    <div id="collapseTwo" className="accordion-collapse collapse" data-bs-parent="#accordionExample">
      <div className="accordion-body" id="accordion-love">
        <div className="love-body">
            <p>At The Drunken Giraffe, our passion for premium liquor is rooted in a deep appreciation for craft, heritage and detail. Every bottle we offer is carefully selected not only for its exceptional quality, but for the story and tradition it carries.</p>
            <p>We work with dedicated local distillers and renowned international producers who share our pursuit of excellence. From small-batch whiskies and rich aged rums to refined cognacs and unique liqueurs, our collection celebrates the artistry behind every sip.</p>
            <p>For us, premium liquor is not about prestige, but about genuine flavour, character and the experience it creates. Whether you are exploring something new or searching for a timeless favourite, we are here to help you savour the very best.</p>
        </div>
        <div className="who-image">
            <img src={LoveImage} alt="Who are we" className="love-image" />
        </div>
      </div>
    </div>
  </div>
  <div className="accordion-item">
    <h1 className="accordion-header">
      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree">
        Our misson
      </button>
    </h1>
    <div id="collapseThree" className="accordion-collapse collapse" data-bs-parent="#accordionExample">
      <div className="accordion-body" id="accordion-mission">
        <div className="mission-image">
            <img src={MissionImage} alt="Who are we" className="mission-image" />
        </div>
        <div className="mission-body"><p>At The Drunken Giraffe, our mission is to offer a curated selection of premium liquor that celebrates craftsmanship, authenticity and taste. We are driven by a passion for connecting people with spirits that tell a story — whether sourced from acclaimed international producers or crafted by local South African distilleries.</p><p>Our goal is to make luxury feel accessible without losing its sense of occasion. Through careful curation, honest guidance and a focus on quality, we aim to create an experience that is as refined as it is personal.</p>
        </div>
      </div>
    </div>
  </div>
</div>
{showProfileModal && loggedInUser && (
        <ProfileModal
          user={loggedInUser}
          onClose={() => setShowProfileModal(false)}
          onLogout={() => {
            setShowProfileModal(false);
            localStorage.removeItem('loggedInUser');
            localStorage.removeItem('profilePic');
            window.location.reload(); // Or navigate to landing page if you want
          }}
          onProfilePicChange={(url) => {
            localStorage.setItem('profilePic', url);
            // Force update everywhere
            window.dispatchEvent(new Event('storage'));
          }}
        />
      )}
      <div className="footer-section">
        <Footer />
      </div>
    </div>
  );
};

export default About;