export default function AdminDashboardPage() {
	return (
		<div className="mx-auto max-w-5xl">
			<p className="text-sm font-semibold uppercase tracking-wider text-brand-700">Admin workspace</p>
			<h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Operations at a glance.</h1>
			<p className="mt-3 text-gray-600">Manage application activity and document verification from one workspace.</p>
			<div className="mt-8 grid gap-4 sm:grid-cols-3">
				{['Applications', 'Pending documents', 'Customers'].map((label) => (
					<section key={label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
						<p className="text-sm text-gray-500">{label}</p>
						<p className="mt-3 text-3xl font-bold">--</p>
						<p className="mt-2 text-xs text-gray-500">Connect to the admin API when reporting is enabled.</p>
					</section>
				))}
			</div>
		</div>
	);
}