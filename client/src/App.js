import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useState } from 'react';

import Welcome from './pages/Welcome';
import GameAuth from './pages/GameScreen';
import GameSuccess from './pages/GameSuccess';
import GameFailure from './pages/GameFailure';
import AccessibilityLogin from './pages/AccessibilityLogin';
import LandingPage from './pages/LandingPage';
import Register from './pages/Register';
import Store from './pages/Store';
import About from './pages/About';
import Checkout from './pages/Checkout';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart'; 
import ChatWidget from './components/ChatWidget';
import AuthModal from './components/AuthModal';
import Navbar from './components/Navbar';
import BecomeSeller from './pages/BecomeSeller';
import SellerApplication from './pages/SellerApplication';
import Wishlist from './pages/Wishlist';
import Dashboard from './pages/Dashboard';
import SellerStore from './pages/SellerStore';

import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function AppRoutes({ handleLoginClick, showAuthModal, setShowAuthModal }) {
  const location = useLocation();
  const showNavbar = !["/", "/game"].includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar onLoginClick={handleLoginClick} />}
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/game" element={<GameAuth />} />
        <Route path="/gamesuccess" element={<GameSuccess />} />
        <Route path="/gamefailure" element={<GameFailure />} />
        <Route path="/accessibility-login" element={<AccessibilityLogin />} />
        <Route path="/landing-page" element={<LandingPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/store" element={<Store />} />
        <Route path="/cart" element={<Cart />} /> 
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/become-seller" element={<BecomeSeller />} />
        <Route path="/become-seller/apply" element={<SellerApplication />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/seller-store" element={<SellerStore />} />
      </Routes>
      {showNavbar && <ChatWidget />}
      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </>
  );
}

export default function App() {
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Helper to pass to Navbar for login button
  const handleLoginClick = () => setShowAuthModal(true);

  return (
    <Router>
      <AppRoutes
        handleLoginClick={handleLoginClick}
        showAuthModal={showAuthModal}
        setShowAuthModal={setShowAuthModal}
      />
    </Router>
  );
}
