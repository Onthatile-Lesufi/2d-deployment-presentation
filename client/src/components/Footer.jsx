import React from 'react';
import { Link } from "react-router-dom";
import "../styles/Footer.css";

import WhiteLogo from "../assets/WhiteLogo.svg";
import InstaVector from "../assets/Insta-Vector.svg";
import FacebookVector from "../assets/Facebook-Vector.svg";
import YouTubeVector from "../assets/YouTube-Vector.svg";

const Footer = () => {
  const footerRef = React.useRef();
  return (
    <div className="footer" ref={footerRef} id="footer">
        <div className="footer-logo">
            <img src={WhiteLogo} alt="Logo" className="footer-logo-image" />
        </div>
      <div className="footer-content">
        <h3>Long Necks, Strong Drinks</h3>
        <div className="footer-links">
            <Link to="/landing-page">Home</Link>
            <Link to="/about">About Us</Link>
            <Link to="/store">Store</Link>
        </div>
      </div>
      <div className="footer-socials">
        <h3>Follow Us</h3>
        <div className="social-icons">
          <a href="https://www.instagram.com/openwindowinstitute/?hl=en" target="_blank" rel="noopener noreferrer">
            <img src={InstaVector} alt="Instagram" className="social-icon" id='Insta' />
          </a>
          <a href="https://www.facebook.com/theopenwindow/" target="_blank" rel="noopener noreferrer">
            <img src={FacebookVector} alt="Facebook" className="social-icon" id='Facebook' />
          </a>
          <a href="https://www.youtube.com/@theopenwindowschool" target="_blank" rel="noopener noreferrer">
            <img src={YouTubeVector} alt="YouTube" className="social-icon" id='YouTube' />
          </a>
        </div>
      </div>
    </div>
  );
}

export default Footer;