import React, { useState } from 'react';
import LogoNoText from '../assets/Logo-no-text.svg';
import '../styles/AuthModal.css';
import whiskeyImg from '../assets/whiskey.png'; // Use your whiskey bottle image
import notWhiskeyImg from '../assets/wine.png'; // Use a non-whiskey image
import tequilaAudio from '../assets/audio/tequila.mp3';
import redWineAudio from '../assets/audio/redwine.mp3';
import ginJuiceAudio from '../assets/audio/gaj.mp3';
import cheersAudio from '../assets/audio/cheers.mp3';
import sha256 from 'crypto-js/sha256'; // npm install crypto-js
import ProfileModal from './ProfileModal'; // <-- import the new profile modal component
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function AuthModal({ onClose }) {
  const [tab, setTab] = useState('login');
  const [registerForm, setRegisterForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    idNumber: "" // <-- Add this field
  });
  const [registerError, setRegisterError] = useState("");
  const [registerLoading, setRegisterLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showContactHint, setShowContactHint] = useState(false);
  const [emailError, setEmailError] = useState(""); // <-- add this state
  const [showPasswordHint, setShowPasswordHint] = useState(false);
  const [usernameValid, setUsernameValid] = useState({ capital: false, noSpaces: false });
  const [showUsernameHint, setShowUsernameHint] = useState(false);
  // Add password validation state and hint
  const [passwordValid, setPasswordValid] = useState({ capital: false, special: false });
  const [showPasswordHintBox, setShowPasswordHintBox] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [underageError, setUnderageError] = useState(""); // <-- Add this line with other useState hooks
  const [adminMode, setAdminMode] = useState(false);

  // Trivia questions for registration
  const triviaQuestions = [
    { key: "favDrink", label: "What is your favorite drink?" },
    { key: "firstPet", label: "What was the name of your first pet?" },
    { key: "birthCity", label: "In what city were you born?" }
  ];
  const [triviaAnswers, setTriviaAnswers] = useState({
    favDrink: "",
    firstPet: "",
    birthCity: ""
  });

  // Add state for login trivia
  const [loginStep, setLoginStep] = useState(0); // 0: email, 1: password, 2: trivia
  const [loginContact, setLoginContact] = useState(""); // email only
  const [loginPassword, setLoginPassword] = useState("");
  const [loginTriviaIndex, setLoginTriviaIndex] = useState(null);
  const [loginTriviaAnswer, setLoginTriviaAnswer] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);

  // Add these state hooks for login
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoginError, setAdminLoginError] = useState("");
  const [adminLoginLoading, setAdminLoginLoading] = useState(false);
  // Admin registration state
  const [adminTab, setAdminTab] = useState('login'); // 'login' or 'register'
  const [adminRegEmail, setAdminRegEmail] = useState("");
  const [adminRegPassword, setAdminRegPassword] = useState("");
  const [adminRegError, setAdminRegError] = useState("");
  const [adminRegLoading, setAdminRegLoading] = useState(false);
  const navigate = useNavigate();

  function shuffleArray(array) {
    // Fisher-Yates shuffle
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Helper to check age from South African ID number (YYMMDD...)
  function getAgeFromIdNumber(idNumber) {
    if (!/^\d{13}$/.test(idNumber)) return null;
    const year = parseInt(idNumber.slice(0, 2), 10);
    const month = parseInt(idNumber.slice(2, 4), 10);
    const day = parseInt(idNumber.slice(4, 6), 10);
    // Assume IDs from 00-21 are 2000+, else 1900+
    const currentYear = new Date().getFullYear() % 100;
    const century = year <= currentYear ? 2000 : 1900;
    const birthDate = new Date(century + year, month - 1, day);
    if (isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  // Registration submit with trivia
  async function handleRegisterSubmit(e) {
    e.preventDefault();
    setRegisterError("");
    setUnderageError(""); // Reset underage error
    setRegisterLoading(true);

    // Check age from ID number
    const age = getAgeFromIdNumber(registerForm.idNumber);
    if (age === null) {
      setUnderageError("Please enter a valid South African ID number.");
      setRegisterLoading(false);
      return;
    }
    if (age < 18) {
      setUnderageError("You are not allowed on the site because you need to be 18 years old and above.");
      setRegisterLoading(false);
      return;
    }

    // Password validation: at least 1 capital letter and 1 special character
    const password = registerForm.password;
    if (!/[A-Z]/.test(password) || !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setRegisterError("Password must have at least 1 capital letter and 1 special character.");
      setRegisterLoading(false);
      return;
    }

    try {
      // Check if username or email already exists
      const checkRes = await fetch('/api/users/check-exists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: registerForm.username,
          email: registerForm.email
        })
      });

      // Only treat as server error if status is 500+ or fetch fails
      if (!checkRes.ok && checkRes.status >= 500) {
        setRegisterError("A server error occurred. Please try again later.");
        setRegisterLoading(false);
        return;
      }
      let checkData;
      try {
        // Defensive: check for HTML response
        const text = await checkRes.text();
        if (text.startsWith('<!DOCTYPE')) {
          setRegisterError("A server error occurred. Please try again later.");
          setRegisterLoading(false);
          return;
        }
        checkData = JSON.parse(text);
      } catch {
        setRegisterError("A server error occurred. Please try again later.");
        setRegisterLoading(false);
        return;
      }

      if (checkData.exists) {
        setRegisterError("You are already a user. Please login.");
        setRegisterLoading(false);
        return;
      }

      // Hash trivia answers
      const hashedTrivia = {};
      for (const q of triviaQuestions) {
        hashedTrivia[q.key] = sha256(triviaAnswers[q.key].trim().toLowerCase()).toString();
      }

      // Save user to backend with all required fields
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: registerForm.firstName,
          lastName: registerForm.lastName,
          username: registerForm.username,
          email: registerForm.email,
          password: registerForm.password,
          idNumber: registerForm.idNumber, // <-- Include ID number
          trivia: hashedTrivia
        })
      });

      if (!res.ok && res.status >= 500) {
        setRegisterError("A server error occurred. Please try again later.");
        setRegisterLoading(false);
        return;
      }
      let data;
      try {
        // Defensive: check for HTML response
        const text = await res.text();
        if (text.startsWith('<!DOCTYPE')) {
          setRegisterError("A server error occurred. Please try again later.");
          setRegisterLoading(false);
          return;
        }
        data = JSON.parse(text);
      } catch {
        setRegisterError("A server error occurred. Please try again later.");
        setRegisterLoading(false);
        return;
      }
      if (!res.ok) {
        setRegisterError(data.message || "Registration failed");
        setRegisterLoading(false);
        return;
      }
      setShowSuccess(true);
      const userObj = {
        username: registerForm.username,
        email: registerForm.email,
      };
      // Save user to localStorage and fire event for Navbar
      localStorage.setItem('loggedInUser', JSON.stringify(userObj));
      document.dispatchEvent(new Event('auth-login'));
      setTimeout(() => {
        setShowSuccess(false);
        onClose(userObj); // Pass user to parent
      }, 2000);
    } catch (err) {
      setRegisterError("A server error occurred. Please try again later.");
    }
    setRegisterLoading(false);
  }

  // Login process: step-by-step (order: email -> trivia -> password)
  async function handleLoginContactSubmit(e) {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    // Only allow login by email (never username)
    const email = loginContact.trim().toLowerCase();
    if (!email || !email.includes("@")) {
      setLoginError("Please enter a valid email address.");
      setLoginLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/users/check-exists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email
        })
      });
      const data = await res.json();
      if (!data.exists) {
        setLoginError("User not found.");
        setLoginLoading(false);
        return;
      }
      setLoginStep(1); // Show password field
    } catch {
      setLoginError("A server error occurred. Please try again later.");
    }
    setLoginLoading(false);
  }

  // After password, show trivia question
  function handleLoginPasswordContinue(e) {
    e.preventDefault();
    setLoginError("");
    // Pick a random trivia question index each time user logs in
    const idx = Math.floor(Math.random() * triviaQuestions.length);
    setLoginTriviaIndex(idx);
    setLoginStep(2);
  }

  async function handleLoginTriviaSubmit(e) {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    // Send email, password, and trivia answer to backend
    const email = loginContact.trim().toLowerCase();
    const triviaKey = triviaQuestions[loginTriviaIndex].key;
    const triviaAnswer = loginTriviaAnswer.trim();

    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: loginPassword,
          triviaKey,
          triviaAnswer
        })
      });
      if (!res.ok) {
        const data = await res.json();
        setLoginError(data.message || "Incorrect email, password, or trivia answer.");
        setLoginLoading(false);
        return;
      }
      const user = await res.json();
      if (!user || !user.email) {
        setLoginError("User not found.");
        setLoginLoading(false);
        return;
      }
      // Success: pass user to parent and redirect to homepage
      const userObj = {
        username: user.username,
        email: user.email,
      };
      localStorage.setItem('loggedInUser', JSON.stringify(userObj));
      document.dispatchEvent(new Event('auth-login'));
      setLoginSuccess(true);
      setTimeout(() => {
        setLoginSuccess(false);
        onClose(userObj);
        navigate("/landing-page");
      }, 1200);
    } catch {
      setLoginError("A server error occurred. Please try again later.");
    }
    setLoginLoading(false);
  }

  // Email validation handler
  function handleEmailBlur(e) {
    setShowContactHint(false);
    if (!e.target.value.includes("@")) {
      setEmailError("please enter a valid email address");
    } else {
      setEmailError("");
    }
  }

  function handleEmailChange(e) {
    setRegisterForm(f => ({ ...f, email: e.target.value }));
    if (emailError && e.target.value.includes("@")) {
      setEmailError("");
    }
  }

  // Username validation handler
  function handleUsernameChange(e) {
    const value = e.target.value;
    setRegisterForm(f => ({ ...f, username: value }));
    setUsernameValid({
      capital: /^[A-Z]/.test(value),
      noSpaces: !/\s/.test(value) && value.length > 0
    });
  }

  // Password validation handler
  function handlePasswordChange(e) {
    const value = e.target.value;
    setRegisterForm(f => ({ ...f, password: value }));
    setPasswordValid({
      capital: /[A-Z]/.test(value),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(value)
    });
  }

  // Admin registration handler
  async function handleAdminRegister(e) {
    e.preventDefault();
    setAdminRegError("");
    setAdminRegLoading(true);

    // Only allow admin emails ending with @virtualwindow.co.za
    const email = adminRegEmail.trim().toLowerCase();
    if (!email.endsWith("@virtualwindow.co.za")) {
      setAdminRegError("Cannot login as admin");
      setAdminRegLoading(false);
      return;
    }

    // Save admin to backend (must be saved to database)
    try {
      const res = await fetch('/api/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: adminRegPassword
        })
      });
      // If you get a 404, it means your backend does not have this endpoint.
      if (res.status === 404) {
        setAdminRegError("Admin registration is not available. Please ask the backend developer to implement /api/admin/register.");
        setAdminRegLoading(false);
        return;
      }
      if (res.status === 409) {
        setAdminRegError("Admin already registered.");
        setAdminRegLoading(false);
        return;
      }
      if (!res.ok) {
        let msg = "Cannot login as admin";
        try {
          const data = await res.json();
          if (data && data.message) msg = data.message;
        } catch {}
        setAdminRegError(msg);
        setAdminRegLoading(false);
        return;
      }
      setAdminRegLoading(false);
      setAdminTab('login');
      alert("Admin registered. Please login.");
    } catch {
      setAdminRegError("Cannot login as admin");
      setAdminRegLoading(false);
    }
  }

  // Admin login handler
  async function handleAdminLogin(e) {
    e.preventDefault();
    setAdminLoginError("");
    setAdminLoginLoading(true);

    // Only allow admin emails ending with @virtualwindow.co.za
    const email = adminEmail.trim().toLowerCase();
    if (!email.endsWith("@virtualwindow.co.za")) {
      setAdminLoginError("Cannot login as admin");
      setAdminLoginLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password: adminPassword
        })
      });
      if (res.status === 404) {
        setAdminLoginError("Not a regristed admin");
        setAdminLoginLoading(false);
        return;
      }
      if (!res.ok) {
        setAdminLoginError("Cannot login as admin");
        setAdminLoginLoading(false);
        return;
      }
      // Save admin info to localStorage to trigger Navbar profile button
      localStorage.setItem("loggedInUser", JSON.stringify({ email: adminEmail, isAdmin: true }));
      localStorage.setItem("isAdmin", "true");
      document.dispatchEvent(new Event('auth-login'));
      setAdminLoginLoading(false);
      onClose && onClose({ isAdmin: true, email: adminEmail });
    } catch {
      setAdminLoginError("Cannot login as admin");
      setAdminLoginLoading(false);
    }
  }

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          display: 'flex',
          background: '#fff',
          borderRadius: 20,
          boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
          minWidth: 700,
          minHeight: 400,
          overflow: 'hidden',
          position: 'relative'
        }}>
          {/* Left column: Intro */}
          <div style={{
            flex: 1,
            background: 'linear-gradient(135deg, #350b0f 0%, #9b1c23 100%)',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            padding: '48px 36px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <img
                src={LogoNoText}
                alt="Logo"
                style={{ width: 68, height: 68, cursor: "pointer" }}
                onClick={() => setAdminMode(true)}
                title="Admin login"
              />
              <h2 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: 1 }}>
                {adminMode ? "Welcome Back" : "Welcome to The Drunken Giraffe"}
              </h2>
            </div>
            <p style={{ marginTop: 18, fontSize: 18, lineHeight: 1.5, color: '#e9c4b4' }}>
              {adminMode
                ? "Make sure our site withholds a high standard."
                : <>Discover, collect and enjoy premium spirits.<br />
                  Log in or create an account to purchase, review or become a seller.</>
              }
            </p>
          </div>
          {/* Right column: Auth form */}
          <div style={{
            flex: 1,
            background: '#fff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '48px 36px',
            position: 'relative',
            minHeight: 400,
            minWidth: 700,
            maxHeight: 600,
          }}>
            <button
              onClick={onClose}
              style={{
                position: 'absolute', top: 18, right: 18,
                background: 'none', border: 'none', fontSize: 26, color: '#9b1c23', cursor: 'pointer'
              }}
              aria-label="Close"
            >×</button>
            {/* Admin login/register form */}
            {adminMode ? (
              <div style={{ width: "100%" }}>
                <div style={{ display: 'flex', width: '100%', marginBottom: 32 }}>
                  <button
                    onClick={() => setAdminTab('login')}
                    style={{
                      flex: 1,
                      fontWeight: adminTab === 'login' ? 700 : 400,
                      fontSize: 18,
                      background: 'none',
                      border: 'none',
                      borderBottom: adminTab === 'login' ? '3px solid #e1bb3e' : '3px solid transparent',
                      color: adminTab === 'login' ? '#350b0f' : '#9b1c23',
                      padding: '8px 0',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setAdminTab('register')}
                    style={{
                      flex: 1,
                      fontWeight: adminTab === 'register' ? 700 : 400,
                      fontSize: 18,
                      background: 'none',
                      border: 'none',
                      borderBottom: adminTab === 'register' ? '3px solid #e1bb3e' : '3px solid transparent',
                      color: adminTab === 'register' ? '#350b0f' : '#9b1c23',
                      padding: '8px 0',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    Register
                  </button>
                </div>
                {adminTab === 'login' ? (
                  <form style={{ display: 'flex', flexDirection: 'column', gap: 18 }} onSubmit={handleAdminLogin}>
                    <input
                      type="email"
                      placeholder="Admin Email"
                      value={adminEmail}
                      onChange={e => setAdminEmail(e.target.value)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 8,
                        border: '1px solid #e9c4b4',
                        fontSize: 16,
                        marginBottom: 8
                      }}
                      required
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 8,
                        border: '1px solid #e9c4b4',
                        fontSize: 16,
                        marginBottom: 8
                      }}
                      required
                    />
                    {adminLoginError && <div style={{ color: 'red', marginBottom: 8 }}>{adminLoginError}</div>}
                    <button
                      type="submit"
                      className='login-btn'
                      disabled={adminLoginLoading}
                    >
                      {adminLoginLoading ? "Logging in..." : "Login"}
                    </button>
                    <button
                      type="button"
                      style={{
                        marginTop: 12,
                        background: "none",
                        border: "none",
                        color: "#9b1c23",
                        fontWeight: 700,
                        cursor: "pointer",
                        textDecoration: "underline",
                        fontSize: 15
                      }}
                      onClick={() => setAdminMode(false)}
                    >
                      Back to user login
                    </button>
                  </form>
                ) : (
                  <form style={{ display: 'flex', flexDirection: 'column', gap: 18 }} onSubmit={handleAdminRegister}>
                    <input
                      type="email"
                      placeholder="Admin Email"
                      value={adminRegEmail}
                      onChange={e => setAdminRegEmail(e.target.value)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 8,
                        border: '1px solid #e9c4b4',
                        fontSize: 16,
                        marginBottom: 8
                      }}
                      required
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={adminRegPassword}
                      onChange={e => setAdminRegPassword(e.target.value)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 8,
                        border: '1px solid #e9c4b4',
                        fontSize: 16,
                        marginBottom: 8
                      }}
                      required
                    />
                    {adminRegError && <div style={{ color: 'red', marginBottom: 8 }}>{adminRegError}</div>}
                    <button
                      type="submit"
                      className='login-btn'
                      disabled={adminRegLoading}
                    >
                      {adminRegLoading ? "Registering..." : "Register"}
                    </button>
                    <button
                      type="button"
                      style={{
                        marginTop: 12,
                        background: "none",
                        border: "none",
                        color: "#9b1c23",
                        fontWeight: 700,
                        cursor: "pointer",
                        textDecoration: "underline",
                        fontSize: 15
                      }}
                      onClick={() => setAdminTab('login')}
                    >
                      Back to login
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', width: '100%', marginBottom: 32 }}>
                  <button
                    onClick={() => setTab('login')}
                    style={{
                      flex: 1,
                      fontWeight: tab === 'login' ? 700 : 400,
                      fontSize: 18,
                      background: 'none',
                      border: 'none',
                      borderBottom: tab === 'login' ? '3px solid #e1bb3e' : '3px solid transparent',
                      color: tab === 'login' ? '#350b0f' : '#9b1c23',
                      padding: '8px 0',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setTab('register')}
                    style={{
                      flex: 1,
                      fontWeight: tab === 'register' ? 700 : 400,
                      fontSize: 18,
                      background: 'none',
                      border: 'none',
                      borderBottom: tab === 'register' ? '3px solid #e1bb3e' : '3px solid transparent',
                      color: tab === 'register' ? '#350b0f' : '#9b1c23',
                      padding: '8px 0',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    Register
                  </button>
                </div>
                <div style={{
                  width: '100%',
                  // Make registration modal scrollable if needed
                  overflowY: tab === 'register' ? 'auto' : 'visible',
                  maxHeight: tab === 'register' ? 500 : 'none',
                  paddingRight: tab === 'register' ? 8 : 0
                }}>
                  {showSuccess ? (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: 300,
                      width: '100%',
                      textAlign: 'center'
                    }}>
                      <h2 style={{ color: '#350b0f', fontWeight: 800, marginBottom: 16 }}>
                        Registration complete!
                      </h2>
                      <h3 style={{ color: '#9b1c23', fontWeight: 700 }}>
                        {registerForm.username}
                      </h3>
                      <p style={{ fontSize: 20, color: '#350b0f', marginTop: 12 }}>
                        You are now a member.
                      </p>
                      <p style={{ color: '#888', marginTop: 24 }}>
                        Redirecting to homepage...
                      </p>
                    </div>
                  ) : loginSuccess ? (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: 200,
                      width: '100%',
                      textAlign: 'center'
                    }}>
                      <h2 style={{ color: '#2e7d32', fontWeight: 800, marginBottom: 16 }}>
                        Login successful!
                      </h2>
                      <p style={{ color: '#888', marginTop: 24 }}>
                        Redirecting...
                      </p>
                    </div>
                  ) : (
                    tab === 'register' ? (
                      // Registration form (no audio game)
                      <form style={{ display: 'flex', flexDirection: 'column', gap: 18 }} onSubmit={handleRegisterSubmit}>
                        <input
                          type="text"
                          placeholder="First Name"
                          value={registerForm.firstName}
                          onChange={e => setRegisterForm(f => ({ ...f, firstName: e.target.value }))}
                          style={{
                            padding: '12px 16px',
                            borderRadius: 8,
                            border: '1px solid #e9c4b4',
                            fontSize: 16,
                            marginBottom: 8
                          }}
                          required
                        />
                        <input
                          type="text"
                          placeholder="Last Name"
                          value={registerForm.lastName}
                          onChange={e => setRegisterForm(f => ({ ...f, lastName: e.target.value }))}
                          style={{
                            padding: '12px 16px',
                            borderRadius: 8,
                            border: '1px solid #e9c4b4',
                            fontSize: 16,
                            marginBottom: 8
                          }}
                          required
                        />
                        <input
                          type="text"
                          placeholder="ID Number"
                          value={registerForm.idNumber}
                          onChange={e => setRegisterForm(f => ({ ...f, idNumber: e.target.value }))}
                          style={{
                            padding: '12px 16px',
                            borderRadius: 8,
                            border: '1px solid #e9c4b4',
                            fontSize: 16,
                            marginBottom: 8
                          }}
                          required
                        />
                        {underageError && (
                          <div style={{
                            color: '#b71c1c',
                            fontSize: 14,
                            marginBottom: 8,
                            background: '#fffbe7',
                            borderRadius: 6,
                            padding: '6px 10px'
                          }}>
                            {underageError}
                          </div>
                        )}
                        <input
                          type="email"
                          placeholder="Email"
                          value={registerForm.email}
                          onChange={handleEmailChange}
                          onFocus={() => setShowContactHint(true)}
                          onBlur={handleEmailBlur}
                          style={{
                            padding: '12px 16px',
                            borderRadius: 8,
                            border: '1px solid #e9c4b4',
                            fontSize: 16,
                            marginBottom: 8
                          }}
                          required
                        />
                        {emailError && (
                          <div style={{
                            color: '#b71c1c',
                            fontSize: 14,
                            marginBottom: 8,
                            background: '#fffbe7',
                            borderRadius: 6,
                            padding: '6px 10px'
                          }}>
                            {emailError}
                          </div>
                        )}
                        <input
                          type="text"
                          placeholder="Username"
                          value={registerForm.username}
                          onChange={handleUsernameChange}
                          onFocus={() => setShowUsernameHint(true)}
                          onBlur={() => setShowUsernameHint(false)}
                          style={{
                            padding: '12px 16px',
                            borderRadius: 8,
                            border: '1px solid #e9c4b4',
                            fontSize: 16,
                            marginBottom: 4
                          }}
                          required
                        />
                        {showUsernameHint && (
                          <div style={{ marginBottom: 8 }}>
                            <span style={{
                              color: usernameValid.capital ? "#2e7d32" : "#b71c1c",
                              fontWeight: 500,
                              fontSize: 14,
                              marginRight: 12
                            }}>
                              {usernameValid.capital ? "✔" : "✖"} Starts with a capital letter
                            </span>
                            <span style={{
                              color: usernameValid.noSpaces ? "#2e7d32" : "#b71c1c",
                              fontWeight: 500,
                              fontSize: 14
                            }}>
                              {usernameValid.noSpaces ? "✔" : "✖"} No spaces
                            </span>
                          </div>
                        )}
                        {/* Trivia questions */}
                        {triviaQuestions.map(q => (
                          <input
                            key={q.key}
                            type="text"
                            placeholder={q.label}
                            value={triviaAnswers[q.key]}
                            onChange={e => setTriviaAnswers(a => ({ ...a, [q.key]: e.target.value }))}
                            style={{
                              padding: '12px 16px',
                              borderRadius: 8,
                              border: '1px solid #e9c4b4',
                              fontSize: 16,
                              marginBottom: 8
                            }}
                            required
                          />
                        ))}
                        <div style={{ position: 'relative', width: '100%' }}>
                          <input
                            type={showRegisterPassword ? "text" : "password"}
                            placeholder="Set Password"
                            value={registerForm.password}
                            onChange={handlePasswordChange}
                            onFocus={() => setShowPasswordHintBox(true)}
                            onBlur={() => setShowPasswordHintBox(false)}
                            style={{
                              padding: '12px 16px',
                              borderRadius: 8,
                              border: '1px solid #e9c4b4',
                              fontSize: 16,
                              marginBottom: 4,
                              width: '100%',
                              paddingRight: 40
                            }}
                            required
                          />
                          <span
                            style={{
                              position: 'absolute',
                              right: 12,
                              top: 16,
                              cursor: 'pointer',
                              color: '#9b1c23'
                            }}
                            onClick={() => setShowRegisterPassword(v => !v)}
                            tabIndex={0}
                            aria-label={showRegisterPassword ? "Hide password" : "Show password"}
                          >
                            {/* Show open eye when showing password, crossed eye when hidden */}
                            {showRegisterPassword ? <FaEye /> : <FaEyeSlash />}
                          </span>
                        </div>
                        {showPasswordHintBox && (
                          <div style={{ marginBottom: 8 }}>
                            <span style={{
                              color: passwordValid.capital ? "#2e7d32" : "#b71c1c",
                              fontWeight: 500,
                              fontSize: 14,
                              marginRight: 12
                            }}>
                              {passwordValid.capital ? "✔" : "✖"} At least 1 capital letter
                            </span>
                            <span style={{
                              color: passwordValid.special ? "#2e7d32" : "#b71c1c",
                              fontWeight: 500,
                              fontSize: 14
                            }}>
                              {passwordValid.special ? "✔" : "✖"} At least 1 special character
                            </span>
                          </div>
                        )}
                        <button
                          type="submit"
                          disabled={registerLoading}
                          style={{
                            background: 'linear-gradient(90deg, #e1bb3e 60%, #e35537 100%)',
                            color: '#350b0f',
                            border: 'none',
                            borderRadius: 8,
                            padding: '12px 0',
                            fontWeight: 700,
                            fontSize: 18,
                            cursor: registerLoading ? 'not-allowed' : 'pointer',
                            marginTop: 8,
                            opacity: registerLoading ? 0.7 : 1
                          }}
                        >
                          {registerLoading ? "Registering..." : "Register"}
                        </button>
                        {registerError && <div style={{ color: 'red', marginBottom: 8 }}>{registerError}</div>}
                      </form>
                    ) : (
                      // Login form: step-by-step (email -> trivia -> password)
                      <div>
                        <h3 style={{ margin: '0 0 18px 0', fontWeight: 700, color: '#350b0f', fontSize: 22 }}>Welcome back!</h3>
                        <form style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                          {loginStep === 0 && (
                            <>
                              <input
                                type="email"
                                placeholder="Email"
                                value={loginContact}
                                onChange={e => setLoginContact(e.target.value)}
                                style={{
                                  padding: '12px 16px',
                                  borderRadius: 8,
                                  border: '1px solid #e9c4b4',
                                  fontSize: 16,
                                  marginBottom: 8
                                }}
                                required
                              />
                              {loginError && <div style={{ color: 'red', marginBottom: 8 }}>{loginError}</div>}
                              <button
                                type="button"
                                className='login-btn'
                                disabled={loginLoading}
                                onClick={handleLoginContactSubmit}
                              >
                                {loginLoading ? "Checking..." : "Continue"}
                              </button>
                            </>
                          )}
                          {loginStep === 1 && (
                            <>
                              <input
                                type="email"
                                value={loginContact}
                                disabled
                                style={{
                                  padding: '12px 16px',
                                  borderRadius: 8,
                                  border: '1px solid #e9c4b4',
                                  fontSize: 16,
                                  marginBottom: 8,
                                  background: "#f3f3f3"
                                }}
                              />
                              <div style={{ position: 'relative', width: '100%' }}>
                                <input
                                  type={showLoginPassword ? "text" : "password"}
                                  placeholder="Password"
                                  value={loginPassword}
                                  onChange={e => setLoginPassword(e.target.value)}
                                  style={{
                                    padding: '12px 16px',
                                    borderRadius: 8,
                                    border: '1px solid #e9c4b4',
                                    fontSize: 16,
                                    marginBottom: 8,
                                    width: '100%',
                                    paddingRight: 40
                                  }}
                                  required
                                />
                                <span
                                  style={{
                                    position: 'absolute',
                                    right: 12,
                                    top: 16,
                                    cursor: 'pointer',
                                    color: '#9b1c23'
                                  }}
                                  onClick={() => setShowLoginPassword(v => !v)}
                                  tabIndex={0}
                                  aria-label={showLoginPassword ? "Hide password" : "Show password"}
                                >
                                  {/* Show open eye when showing password, crossed eye when hidden */}
                                  {showLoginPassword ? <FaEye /> : <FaEyeSlash />}
                                </span>
                              </div>
                              {loginError && <div style={{ color: 'red', marginBottom: 8 }}>{loginError}</div>}
                              <button
                                type="button"
                                className='login-btn'
                                disabled={loginLoading}
                                onClick={handleLoginPasswordContinue}
                              >
                                Continue
                              </button>
                            </>
                          )}
                          {loginStep === 2 && (
                            <>
                              <input
                                type="email"
                                value={loginContact}
                                disabled
                                style={{
                                  padding: '12px 16px',
                                  borderRadius: 8,
                                  border: '1px solid #e9c4b4',
                                  fontSize: 16,
                                  marginBottom: 8,
                                  background: "#f3f3f3"
                                }}
                              />
                              <input
                                type="password"
                                value={loginPassword}
                                disabled
                                style={{
                                  padding: '12px 16px',
                                  borderRadius: 8,
                                  border: '1px solid #e9c4b4',
                                  fontSize: 16,
                                  marginBottom: 8,
                                  background: "#f3f3f3"
                                }}
                              />
                              {/* Always show the question label if index is set */}
                              {typeof loginTriviaIndex === "number" && triviaQuestions[loginTriviaIndex] && (
                                <label style={{ fontWeight: 500, marginBottom: 4, color: "#000" }}>
                                  {triviaQuestions[loginTriviaIndex].label}
                                </label>
                              )}
                              <input
                                type="text"
                                placeholder="Answer"
                                value={loginTriviaAnswer}
                                onChange={e => setLoginTriviaAnswer(e.target.value)}
                                style={{
                                  padding: '12px 16px',
                                  borderRadius: 8,
                                  border: '1px solid #e9c4b4',
                                  fontSize: 16,
                                  marginBottom: 8
                                }}
                                required
                              />
                              {loginError && <div style={{ color: 'red', marginBottom: 8 }}>{loginError}</div>}
                              <button
                                type="button"
                                className='login-btn'
                                disabled={loginLoading}
                                onClick={handleLoginTriviaSubmit}
                              >
                                {loginLoading ? "Logging in..." : "Login"}
                              </button>
                            </>
                          )}
                        </form>
                    
                        {/* Removed Google and Facebook login buttons */}
                        <div style={{ marginTop: 32, textAlign: 'center', fontSize: 15, color: '#888' }}>
                          Don't have an account?
                          <button
                            type="button"
                            onClick={() => setTab('register')}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#9b1c23',
                              fontWeight: 700,
                              marginLeft: 8,
                              cursor: 'pointer',
                              textDecoration: 'underline',
                              fontSize: 15
                            }}
                          >
                            Create One
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {showProfileModal && loggedInUser && (
        <ProfileModal
          user={loggedInUser}
          onClose={() => setShowProfileModal(false)}
          onLogout={() => {
            setShowProfileModal(false);
            setLoggedInUser(null);
            setTab('login');
            setTimeout(() => onClose(), 0); // Close profile, then show login modal
          }}
        />
      )}
    </>
  );
}
