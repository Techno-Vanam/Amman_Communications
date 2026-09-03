import { Metadata } from 'next';
import AuthPage from '../../components/auth/AuthPage';

export const metadata: Metadata = {
  title: 'Sign In | Amman Communications',
  description: 'Sign in to access your customer or admin portal.',
};

export default function LoginPage() {
  return <AuthPage initialMode="login" />;
}
