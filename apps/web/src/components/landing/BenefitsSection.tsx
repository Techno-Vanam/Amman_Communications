import {
  LayoutDashboard,
  FolderOpen,
  Clock,
  MessageCircle,
  ShieldCheck,
  Database,
} from 'lucide-react';

const BENEFITS = [
  {
    icon: <LayoutDashboard size={20} strokeWidth={1.8} />,
    title: 'One Place for Everything',
    description:
      'Manage all your applications from a single, organised dashboard — no scattered paperwork or multiple portals.',
  },
  {
    icon: <FolderOpen size={20} strokeWidth={1.8} />,
    title: 'Organised Document Management',
    description:
      'Upload, view, and manage required documents in one place. Track which documents are pending, approved, or need correction.',
  },
  {
    icon: <Clock size={20} strokeWidth={1.8} />,
    title: 'Clear Status Visibility',
    description:
      'Always know exactly where your application stands. No guessing, no uncertainty — just clear, real-time updates.',
  },
  {
    icon: <MessageCircle size={20} strokeWidth={1.8} />,
    title: 'Easier Communication',
    description:
      'Receive notifications and instructions directly through the platform, keeping all communication in one accessible location.',
  },
  {
    icon: <ShieldCheck size={20} strokeWidth={1.8} />,
    title: 'Secure Access',
    description:
      'Your account and information are protected. Only you can access your applications and documents when you log in.',
  },
  {
    icon: <Database size={20} strokeWidth={1.8} />,
    title: 'Centralised Records',
    description:
      'All your application history, documents, and status updates are stored in one place and accessible whenever you need them.',
  },
] as const;

export default function BenefitsSection() {
  return (
    <section id="about" className="bg-gray-50 py-24" aria-labelledby="benefits-heading">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-bold tracking-widest uppercase text-brand-500 mb-3">Why Amman Communications</p>
          <h2 id="benefits-heading" className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            A better way to manage your applications
          </h2>
          <p className="text-gray-500 leading-relaxed">
            The platform is built to reduce the complexity of managing service
            applications, giving you clarity and control at every step.
          </p>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
          {BENEFITS.map(({ icon, title, description }) => (
            <li key={title} className="flex items-start gap-4 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-brand-200 transition-all duration-200">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center">
                {icon}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
