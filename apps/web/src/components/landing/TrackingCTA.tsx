import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function TrackingCTA() {
  return (
    <section className="bg-brand-50 border-y border-brand-100 py-20" aria-labelledby="tracking-cta-heading">
      <div className="container">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Content */}
          <div className="flex-1 flex flex-col gap-5 max-w-lg">
            <p className="text-xs font-bold tracking-widest uppercase text-brand-500">Customer Portal</p>
            <h2 id="tracking-cta-heading" className="text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Stay informed at every step.
            </h2>
            <p className="text-gray-500 leading-relaxed">
              Access your customer portal to manage applications, review document
              status, and stay up to date with every update — all from one place.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-brand-700 text-brand-700 font-semibold rounded-xl hover:bg-brand-700 hover:text-white transition-colors duration-200 w-fit"
            >
              Access Customer Portal
              <ArrowRight size={16} strokeWidth={2} />
            </Link>
          </div>

          {/* Graphic */}
          <div className="flex-1 max-w-sm" aria-hidden="true">
            <svg viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full drop-shadow-lg rounded-2xl" aria-hidden="true">
              <rect x="0" y="0" width="280" height="200" rx="16" fill="white" />
              <line x1="56" y1="60" x2="224" y2="60" stroke="rgba(18,55,42,0.15)" strokeWidth="2" />
              <line x1="56" y1="60" x2="160" y2="60" stroke="rgba(18,55,42,0.6)" strokeWidth="2" />
              {[56, 112, 168, 224].map((x, i) => (
                <g key={x}>
                  <circle cx={x} cy="60" r="10" fill={i < 3 ? '#12372A' : 'rgba(18,55,42,0.2)'} />
                  {i < 3 && (
                    <path d={`M${x - 4} 60 l3 3 l6-6`}
                      stroke="white" strokeWidth="1.8"
                      strokeLinecap="round" strokeLinejoin="round" />
                  )}
                </g>
              ))}
              {['Applied', 'Docs', 'Review', 'Complete'].map((label, i) => (
                <text key={label} x={56 + i * 56} y="82"
                  textAnchor="middle" fontSize="9"
                  fill={i < 3 ? '#12372A' : 'rgba(18,55,42,0.4)'}
                  fontFamily="system-ui, sans-serif">
                  {label}
                </text>
              ))}
              <rect x="20" y="108" width="110" height="68" rx="8" fill="white" />
              <rect x="22" y="110" width="106" height="64" rx="7" stroke="rgba(18,55,42,0.1)" strokeWidth="1" />
              <rect x="30" y="118" width="50" height="6" rx="3" fill="rgba(18,55,42,0.8)" />
              <rect x="30" y="130" width="90" height="5" rx="2.5" fill="rgba(18,55,42,0.25)" />
              <rect x="30" y="140" width="70" height="5" rx="2.5" fill="rgba(18,55,42,0.25)" />
              <rect x="30" y="154" width="36" height="14" rx="4" fill="rgba(18,55,42,0.1)" />
              <rect x="35" y="158" width="26" height="6" rx="3" fill="rgba(18,55,42,0.8)" />
              <rect x="150" y="108" width="110" height="68" rx="8" fill="white" />
              <rect x="152" y="110" width="106" height="64" rx="7" stroke="rgba(18,55,42,0.1)" strokeWidth="1" />
              <rect x="160" y="118" width="60" height="6" rx="3" fill="rgba(18,55,42,0.8)" />
              <rect x="160" y="130" width="88" height="5" rx="2.5" fill="rgba(18,55,42,0.25)" />
              <rect x="160" y="140" width="65" height="5" rx="2.5" fill="rgba(18,55,42,0.25)" />
              <circle cx="236" cy="118" r="8" fill="rgba(77, 150, 255, 0.2)" />
              <path d="M232 118l3 3 5-5" stroke="#4D96FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
