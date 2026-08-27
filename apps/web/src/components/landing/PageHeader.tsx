interface PageHeaderProps {
  title: string;
  description: string;
}

export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="py-16 bg-white border-b border-brand-700/5 text-center">
      <div className="container">
        <h1 className="text-3xl font-bold text-brand-700 tracking-tight mb-4">{title}</h1>
        <p className="text-lg text-brand-700/70 max-w-[600px] mx-auto leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

