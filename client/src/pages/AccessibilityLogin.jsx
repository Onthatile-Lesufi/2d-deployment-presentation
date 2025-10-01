import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/LoginRegister.module.css';

export default function AccessibilityLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    const savedUser = JSON.parse(localStorage.getItem('user'));
    
    if (
      savedUser &&
      savedUser.email === email &&
      savedUser.password === password
    ) {
      // Optionally save logged-in user to sessionStorage
      sessionStorage.setItem('currentUser', JSON.stringify(savedUser));

      alert(`Welcome back, ${savedUser.username || 'User'}!`);
      navigate('/game');
    } else {
      alert('Invalid credentials. Try again or register.');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Log in Here</h1>
      <form className={styles.form} onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className={styles.button}>
          <h5>Log in</h5>
        </button>
      </form>
    </div>
  );
}
