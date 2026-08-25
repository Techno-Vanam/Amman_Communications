import Link from 'next/link';
import { ArrowRight, ShieldCheck } from 'lucide-react';

function HeroIllustration() {
  return (
    <div className="flex-1 flex items-center justify-center p-8 lg:p-12" aria-hidden="true">
      <svg
        viewBox="0 0 420 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full max-w-md drop-shadow-xl"
        aria-hidden="true"
      >
        <rect x="40" y="40" width="340" height="300" rx="16" fill="#f0f7f2" />
        <rect x="80" y="72" width="220" height="240" rx="10" fill="white" />
        <rect x="80" y="72" width="220" height="240" rx="10" stroke="#d8ebdd" strokeWidth="1.5" />
        <rect x="80" y="72" width="220" height="44" rx="10" fill="#12372A" />
        <rect x="80" y="96" width="220" height="20" fill="#12372A" />
        <rect x="100" y="86" width="120" height="8" rx="4" fill="white" opacity="0.9" />
        <rect x="100" y="98" width="80" height="6" rx="3" fill="white" opacity="0.5" />
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <rect x="100" y={140 + i * 32} width="18" height="18" rx="4"
              fill={i < 3 ? '#12372A' : '#e2e5ea'} />
            {i < 3 && (
              <path d={`M ${104} ${149 + i * 32} l 4 4 l 6 -7`}
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            )}
            <rect x="128" y={145 + i * 32} width={i < 3 ? 110 : 90} height="7" rx="3.5"
              fill={i < 3 ? '#3d4350' : '#b0b8c4'} />
          </g>
        ))}
        <rect x="100" y="305" width="160" height="6" rx="3" fill="#e2e5ea" />
        <rect x="100" y="305" width="112" height="6" rx="3" fill="#12372A" />
        <rect x="268" y="302" width="30" height="12" rx="6" fill="#d8ebdd" />
        <rect x="273" y="305" width="20" height="6" rx="3" fill="#12372A" opacity="0.6" />
        <rect x="255" y="68" width="90" height="28" rx="14" fill="white" />
        <rect x="255" y="68" width="90" height="28" rx="14" stroke="#d8ebdd" strokeWidth="1.5" />
        <circle cx="271" cy="82" r="5" fill="#4D96FF" />
        <rect x="281" y="78" width="50" height="8" rx="4" fill="#3d4350" />
        <rect x="290" y="200" width="90" height="70" rx="10" fill="white" />
        <rect x="290" y="200" width="90" height="70" rx="10" stroke="#d8ebdd" strokeWidth="1.5" />
        <rect x="302" y="213" width="40" height="6" rx="3" fill="#3d4350" />
        <rect x="302" y="225" width="55" height="5" rx="2.5" fill="#b0b8c4" />
        <rect x="302" y="240" width="30" height="14" rx="4" fill="#12372A" />
        <rect x="307" y="244" width="20" height="6" rx="3" fill="white" />
        <circle cx="60" cy="60" r="6" fill="#d8ebdd" />
        <circle cx="380" cy="320" r="8" fill="#12372A" opacity="0.12" />
        <circle cx="380" cy="60" r="4" fill="#d8ebdd" opacity="0.7" />
      </svg>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="bg-white" aria-labelledby="hero-heading">
      <div className="container">
        <div className="flex flex-col lg:flex-row items-center gap-12 py-20 lg:py-28">
          {/* Content */}
          <div className="flex-1 flex flex-col gap-7 max-w-xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-700 text-xs font-semibold rounded-full border border-brand-100 w-fit">
              <ShieldCheck size={14} strokeWidth={2.5} />
              <span>Secure &amp; Trusted Platform</span>
            </div>

            <h1 id="hero-heading" className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
              Your services,<br />
              <span className="text-brand-700">managed in one place.</span>
            </h1>

            <p className="text-lg text-gray-500 leading-relaxed">
              Amman Communications gives you a single, secure platform to create
              applications, upload required documents, and track your progress —
              every step of the way.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-700 text-white font-semibold rounded-xl hover:bg-brand-800 transition-colors duration-150 shadow-md"
              >
                Get Started
                <ArrowRight size={16} strokeWidth={2} />
              </Link>
              <Link
                href="/#services"
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-brand-700 text-brand-700 font-semibold rounded-xl hover:bg-brand-50 transition-colors duration-150"
              >
                Explore Services
              </Link>
            </div>

            <div className="flex items-center gap-6 pt-2">
              {[
                { num: '100%', label: 'Secure' },
                { num: 'Fast', label: 'Processing' },
                { num: '24/7', label: 'Accessible' },
              ].map((s, i) => (
                <div key={s.num} className="flex items-center gap-6">
                  <div className="text-center">
                    <span className="block text-xl font-bold text-brand-700">{s.num}</span>
                    <span className="text-xs text-gray-500 font-medium">{s.label}</span>
                  </div>
                  {i < 2 && <div className="w-px h-8 bg-gray-200" />}
                </div>
              ))}
            </div>
          </div>

          <HeroIllustration />
        </div>
      </div>
    </section>
  );
}
