import { AuthForm } from '../components/auth/AuthForm';
import styles from './LoginPage.module.css';

export function LoginPage() {
  return (
    <div className={styles.page}>
      <AuthForm />
    </div>
  );
}
