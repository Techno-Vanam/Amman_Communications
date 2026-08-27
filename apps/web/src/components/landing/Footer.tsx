import Link from 'next/link';
import { Layers, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0a1f15] text-brand-200/70" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Site footer</h2>
      <div className="container py-16 pb-6">
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-10 pb-12 border-b border-brand-200/10 mb-6">
          {/* Brand col */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="inline-flex items-center gap-2 text-brand-200/90 font-bold text-base no-underline" aria-label="Home">
              <span className="flex items-center justify-center w-8 h-8 bg-brand-100 text-brand-700 rounded-lg">
                <Layers size={18} strokeWidth={2} />
              </span>
              <span>Amman <strong className="text-brand-200">Communications</strong></span>
            </Link>
            <p className="text-sm leading-relaxed text-brand-200/55 max-w-[34ch]">
              The unified platform for managing your service applications safely,
              securely, and efficiently.
            </p>
            <div className="flex flex-col gap-2 mt-1">
              {[
                { icon: <Mail size={13} strokeWidth={2} />, text: 'support@ammancomm.in' },
                { icon: <Phone size={13} strokeWidth={2} />, text: '+91 00000 00000' },
                { icon: <MapPin size={13} strokeWidth={2} />, text: 'Tamil Nadu, India' },
              ].map(({ icon, text }) => (
                <span key={text} className="flex items-center gap-2 text-xs text-brand-200/50">
                  {icon} {text}
                </span>
              ))}
            </div>
          </div>

          {/* Platform links */}
          <nav aria-label="Quick links">
            <h3 className="text-xs font-bold tracking-widest uppercase text-brand-200 mb-4">Platform</h3>
            <ul className="flex flex-col gap-2.5 list-none">
              {[['Services', '/#services'], ['How It Works', '/#how-it-works'], ['About', '/#about'], ['FAQ', '/#contact']].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-brand-200/50 hover:text-white transition-colors duration-150">{label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Account links */}
          <nav aria-label="Account links">
            <h3 className="text-xs font-bold tracking-widest uppercase text-brand-200 mb-4">Account</h3>
            <ul className="flex flex-col gap-2.5 list-none">
              {[['Sign In', '/login'], ['Create Account', '/register'], ['Customer Portal', '/portal']].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-brand-200/50 hover:text-white transition-colors duration-150">{label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Support links */}
          <nav aria-label="Support links">
            <h3 className="text-xs font-bold tracking-widest uppercase text-brand-200 mb-4">Support</h3>
            <ul className="flex flex-col gap-2.5 list-none">
              {[['Contact Us', '/#contact'], ['Privacy Policy', '/privacy'], ['Terms of Service', '/terms']].map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-brand-200/50 hover:text-white transition-colors duration-150">{label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Bottom bar */}
        <p className="text-xs text-brand-200/30">
          &copy; {currentYear} Amman Communications. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
