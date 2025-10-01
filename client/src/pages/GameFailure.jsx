import { useNavigate } from 'react-router-dom';
import styles from '../styles/GameFeedback.module.css';

export default function GameFailure() {
  const navigate = useNavigate();
  return (
    <div className={`${styles.container} ${styles.failureBg}`}>
      <h1 className={`${styles.title} ${styles.animateShake}`}>Oops! A bottle’s out of place.</h1>
      <p className={styles.message}>Try again, bartender.</p>
      <button onClick={() => navigate('/game')} className={styles.button}>Retry</button>
    </div>
  );
}
