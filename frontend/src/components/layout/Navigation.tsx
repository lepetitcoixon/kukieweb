import Link from 'next/link';
import styles from './Navigation.module.css';

const Navigation = () => {
  return (
    <nav className={styles.nav}>
      <ul className={styles.navList}>
        <li>
          <Link href="/" className={styles.navLink}>
            Home
          </Link>
        </li>
        <li>
          <Link href="/posts" className={styles.navLink}>
            Posts
          </Link>
        </li>
        <li>
          <Link href="/about" className={styles.navLink}>
            About
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
