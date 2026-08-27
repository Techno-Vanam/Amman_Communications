import { ShieldCheck, LayoutDashboard, ClipboardList, MessageSquare } from 'lucide-react';

const TRUST_ITEMS = [
  {
    icon: <ShieldCheck size={20} strokeWidth={1.8} />,
    title: 'Secure Document Handling',
    description: 'Your documents are stored and processed with care.',
  },
  {
    icon: <LayoutDashboard size={20} strokeWidth={1.8} />,
    title: 'Clear Application Tracking',
    description: 'See exactly where your application stands at all times.',
  },
  {
    icon: <ClipboardList size={20} strokeWidth={1.8} />,
    title: 'Organised Process',
    description: 'A structured workflow guides you from start to finish.',
  },
  {
    icon: <MessageSquare size={20} strokeWidth={1.8} />,
    title: 'Dedicated Support',
    description: 'Help is available whenever you need assistance.',
  },
] as const;

export default function TrustSection() {
  return (
    <section className="bg-brand-50 border-y border-brand-100 py-10" aria-label="Key benefits">
      <div className="container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {TRUST_ITEMS.map(({ icon, title, description }) => (
            <div key={title} className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white text-brand-700 flex items-center justify-center shadow-sm border border-brand-100">
                {icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-0.5">{title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

