import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ProfileModal({ user, onClose, onLogout, onProfilePicChange }) {
  // Always load the latest profilePic from localStorage
  const getProfilePic = () => {
    try {
      const userObj = JSON.parse(localStorage.getItem('loggedInUser'));
      return userObj?.profilePic || localStorage.getItem('profilePic') || null;
    } catch {
      return null;
    }
  };
  const [profilePic, setProfilePic] = useState(getProfilePic());
  const [showWishlist, setShowWishlist] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Sync with user prop if it changes or when storage changes
    const syncPic = () => setProfilePic(getProfilePic());
    setProfilePic(getProfilePic());
    window.addEventListener('storage', syncPic);
    return () => window.removeEventListener('storage', syncPic);
  }, [user]);

  useEffect(() => {
    if (showWishlist) {
      try {
        setWishlist(JSON.parse(localStorage.getItem('wishlist')) || []);
      } catch {
        setWishlist([]);
      }
    }
  }, [showWishlist]);

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePic', file);

    try {
      // Upload image to backend
      const res = await fetch('/api/users/upload-profile-pic', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.path) {
        const imgPath = data.path;
        // Update profilePic in backend user record
        await fetch('/api/users/update-profile-pic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email, profilePic: imgPath })
        });
        // Always update both localStorage and user object
        const userObj = JSON.parse(localStorage.getItem('loggedInUser'));
        if (userObj) {
          const updatedUser = { ...userObj, profilePic: imgPath };
          localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
        }
        localStorage.setItem('profilePic', imgPath);
        setProfilePic(imgPath);
        if (onProfilePicChange) onProfilePicChange(imgPath);
        // Force update everywhere
        window.dispatchEvent(new Event('storage'));
      } else {
        alert('Failed to upload image.');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload profile picture.');
    }
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
    <div className="profile-modal-wrapper">
      <div className="profile-modal">
        <button onClick={onClose} className="close-btn">×</button>
        <h2>Profile</h2>
        <div className="profile-pic-wrapper">
          {profilePic ? (
            <img src={resolveProfilePic(profilePic)} alt="Profile" className="profile-pic" />
          ) : (
            <div className="profile-placeholder">?</div>
          )}
          <label className="change-pic-btn">
            Change Profile Picture
            <input type="file" accept="image/*" hidden onChange={handleProfilePicChange} />
          </label>
        </div>
        <div className="user-info"><b>Username:</b> {user.username}</div>
        <button className="wishlist-btn" onClick={() => setShowWishlist(true)}>View Wishlist</button>
        {user?.isAdmin && (
          <button onClick={() => { onClose(); navigate("/dashboard"); }} className="admin-btn">
            Dashboard
          </button>
        )}
        <button onClick={onLogout} className="logout-btn">Logout</button>
      </div>
    </div>
  );
}
