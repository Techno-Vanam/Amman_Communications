export default function PortalDashboardPage() {
	return (
		<div className="mx-auto max-w-5xl">
			<p className="text-sm font-semibold uppercase tracking-wider text-brand-700">Customer portal</p>
			<h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Your applications, in one place.</h1>
			<p className="mt-3 text-gray-600">Track your applications and keep your documents ready for review.</p>
			<section className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
				<p className="text-sm text-gray-500">My applications</p>
				<p className="mt-3 text-3xl font-bold">--</p>
				<p className="mt-2 text-sm text-gray-500">Your customer-specific application data will appear here.</p>
			</section>
		</div>
	);
}