import { FilePlus, Upload, ClipboardCheck, Send, Eye } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    title: 'Create Your Application',
    description:
      'Register on the platform and start a new application. Provide the required information to get the process underway.',
    icon: <FilePlus size={22} strokeWidth={1.8} />,
  },
  {
    number: '02',
    title: 'Upload Required Documents',
    description:
      'Attach all necessary documents to your application directly through the portal. Accepted formats are clearly indicated.',
    icon: <Upload size={22} strokeWidth={1.8} />,
  },
  {
    number: '03',
    title: 'Documents Are Reviewed',
    description:
      'Our team reviews your submitted documents. You will be notified if any corrections or additional information are required.',
    icon: <ClipboardCheck size={22} strokeWidth={1.8} />,
  },
  {
    number: '04',
    title: 'Application Is Submitted',
    description:
      'Once everything is in order, your application is marked as submitted and processing begins.',
    icon: <Send size={22} strokeWidth={1.8} />,
  },
  {
    number: '05',
    title: 'Track Your Progress',
    description:
      'Stay informed through your customer portal. View updates, download results, and manage any follow-up requirements.',
    icon: <Eye size={22} strokeWidth={1.8} />,
  },
] as const;

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-24" aria-labelledby="how-heading">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-bold tracking-widest uppercase text-brand-500 mb-3">The Process</p>
          <h2 id="how-heading" className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            How it works
          </h2>
          <p className="text-gray-500 leading-relaxed">
            A straightforward process designed to keep you informed and in
            control from start to finish.
          </p>
        </div>

        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8" aria-label="Application process steps">
          {STEPS.map((step, index) => (
            <li key={step.number} className="relative flex flex-col gap-4">
              {/* Connector line between steps on large screens */}
              {index < STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-7 left-[calc(50%+28px)] right-0 h-px bg-brand-100 -translate-y-1/2 z-0" aria-hidden="true" />
              )}
              <div className="flex items-center gap-3 relative z-10">
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-50 text-brand-700 font-bold text-sm border border-brand-100">
                  {step.icon}
                </div>
                <span className="text-xs font-bold text-brand-400 tracking-widest lg:hidden">{step.number}</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1.5">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
