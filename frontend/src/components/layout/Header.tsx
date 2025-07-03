import Link from 'next/link';
import Navigation from './Navigation';
import styles from './Header.module.css'; // We will create this CSS module

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          My Awesome Site
        </Link>
        <Navigation />
      </div>
    </header>
  );
};

export default Header;
