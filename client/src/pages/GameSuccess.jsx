import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from '../styles/GameFeedback.module.css';

const GameSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/landing-page");
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className={`${styles.container} ${styles.successBg}`}>
      <div className={styles.icon}>✅</div>
      <h1 className={styles.title}>Nice job, bartender!</h1>
      <p className={styles.message}>You're in. Redirecting to your landing page...</p>
    </div>
  );
};

export default GameSuccess;
