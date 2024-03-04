import AccountContainer from './features/account/AccountContainer';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <AccountContainer />
    </main>
  );
}
