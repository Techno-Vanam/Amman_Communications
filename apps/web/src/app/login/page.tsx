import Link from 'next/link';
import LoginForm from './LoginForm';

export const metadata = {
  title: 'Sign In | Amman Communications',
  description: 'Sign in to access your customer or admin portal.',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left — form */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-gray-50">
        <div className="w-full max-w-[440px] bg-white rounded-3xl shadow-lg p-10 flex flex-col items-center">
          <Link href="/" className="flex items-center gap-2 text-brand-700 font-bold text-lg mb-8 no-underline" aria-label="Home">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-brand-200">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Amman Comm</span>
          </Link>
          <LoginForm />
        </div>
      </div>

      {/* Right — branding panel */}
      <div className="hidden lg:flex flex-1 bg-brand-700 flex-col justify-center items-center p-12 text-white relative overflow-hidden">
        <div className="absolute -top-[10%] -right-[10%] w-96 h-96 rounded-full bg-brand-200/10 blur-3xl" />
        <div className="absolute -bottom-[10%] -left-[10%] w-72 h-72 rounded-full bg-blue-400/15 blur-3xl" />
        <div className="max-w-[480px] relative z-10">
          <h2 className="text-4xl font-extrabold leading-tight mb-4">
            Manage everything in <span className="text-brand-200">one place.</span>
          </h2>
          <p className="text-white/85 text-lg leading-relaxed">
            Welcome back to Amman Communications. Securely access your dashboard to track applications, manage documents, and stay up to date.
          </p>
        </div>
      </div>
    </div>
  );
}