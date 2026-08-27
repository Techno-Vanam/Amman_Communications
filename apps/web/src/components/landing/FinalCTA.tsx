import Link from 'next/link';
import { ArrowRight, LogIn } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="bg-brand-700 py-20" aria-labelledby="final-cta-heading">
      <div className="container">
        <div className="text-center max-w-xl mx-auto flex flex-col gap-6 items-center">
          <h2 id="final-cta-heading" className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Ready to get started?
          </h2>
          <p className="text-brand-200 leading-relaxed">
            Create your account today and experience a more organised,
            transparent way to manage your applications.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-brand-700 font-semibold rounded-xl hover:bg-brand-100 transition-colors duration-150 shadow-md"
            >
              Create an Account
              <ArrowRight size={16} strokeWidth={2} />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-3 text-brand-200 font-medium hover:text-white transition-colors duration-150"
            >
              <LogIn size={15} strokeWidth={2} />
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
