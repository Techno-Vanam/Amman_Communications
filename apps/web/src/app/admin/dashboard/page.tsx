import { getAccessToken } from '@/lib/server-auth';

type AdminSummary = { customers: number; applications: number; documents: number };

async function getSummary(): Promise<AdminSummary | null> {
	const token = await getAccessToken();
	const apiBaseUrl = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:3003';
	if (!token) return null;

	try {
		const response = await fetch(`${apiBaseUrl}/admin/dashboard/summary`, {
			headers: { Authorization: `Bearer ${token}` },
			cache: 'no-store',
		});
		return response.ok ? response.json() as Promise<AdminSummary> : null;
	} catch {
		return null;
	}
}


export default async function AdminDashboardPage() {
	const summary = await getSummary();
	const values = summary ? [summary.applications, summary.documents, summary.customers] : ['--', '--', '--'];

	return (
		<div className="mx-auto max-w-5xl">
			<p className="text-sm font-semibold uppercase tracking-wider text-brand-700">Admin workspace</p>
			<h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Operations at a glance.</h1>
			<p className="mt-3 text-gray-600">Manage application activity and document verification from one workspace.</p>
			<div className="mt-8 grid gap-4 sm:grid-cols-3">
				{['Applications', 'Pending documents', 'Customers'].map((label, index) => (
					<section key={label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
						<p className="text-sm text-gray-500">{label}</p>
						<p className="mt-3 text-3xl font-bold">{values[index]}</p>
						<p className="mt-2 text-xs text-gray-500">Live data from the protected admin API.</p>
					</section>
				))}
			</div>
		</div>
	);
}
