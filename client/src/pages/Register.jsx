import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import styles from '../styles/LoginRegister.module.css';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();

    const userData = {
      email,
      password,
      username,
      profilePhoto: profilePhoto ? URL.createObjectURL(profilePhoto) : null,
    };

    localStorage.setItem('user', JSON.stringify(userData));
    alert('Account created! You can now log in.');
    navigate('/accessibility-login');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfilePhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Create Account</h1>
      <form className={styles.form} onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Username"
          className={styles.input}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div style={{ position: 'relative', width: '100%' }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ paddingRight: 40 }}
          />
          <span
            style={{
              position: 'absolute',
              right: 12,
              top: 14,
              cursor: 'pointer',
              color: '#9b1c23'
            }}
            onClick={() => setShowPassword(v => !v)}
            tabIndex={0}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {/* Show open eye when showing password, crossed eye when hidden */}
            {showPassword ? <FaEye /> : <FaEyeSlash />}
          </span>
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className={styles.input}
        />
        {preview && (
          <img src={preview} alt="Profile Preview" className={styles.preview} />
        )}
        <button type="submit" className={styles.button}>
          <h5>Register</h5>
        </button>
      </form>
    </div>
  );
}
