import { Metadata } from 'next';
import AuthPage from '../../components/auth/AuthPage';

export const metadata: Metadata = {
  title: 'Register | Amman Communications',
  description: 'Create a new customer account with Amman Communications',
};

export default function RegisterPage() {
  return <AuthPage initialMode="signup" />;
}
