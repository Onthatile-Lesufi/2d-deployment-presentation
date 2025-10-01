import { Link } from 'react-router-dom';
import styles from '../styles/Welcome.module.css';

export default function Welcome() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Spirited Entry 🍸</h1>
      <p className={styles.subtitle}>Match the bottles to the right shelves to prove you're not a lightweight.</p>
      <Link to="/game" className={styles.button}>
        <h3>Enter with Bartender Game</h3>
       </Link>
    </div>
  );
}
