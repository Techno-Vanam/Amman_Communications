import { getAccessToken } from '@/lib/server-auth';

type CustomerSummary = { applications: number; documents: number };

async function getSummary(): Promise<CustomerSummary | null> {
	const token = await getAccessToken();
	const apiBaseUrl = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3003';
	if (!token) return null;

	try {
		const response = await fetch(`${apiBaseUrl}/customer/dashboard/summary`, {
			headers: { Authorization: `Bearer ${token}` },
			cache: 'no-store',
		});
		return response.ok ? response.json() as Promise<CustomerSummary> : null;
	} catch {
		return null;
	}
}


export default async function PortalDashboardPage() {
	const summary = await getSummary();

	return (
		<div className="mx-auto max-w-5xl">
			<p className="text-sm font-semibold uppercase tracking-wider text-brand-700">Customer portal</p>
			<h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Your applications, in one place.</h1>
			<p className="mt-3 text-gray-600">Track your applications and keep your documents ready for review.</p>
			<section className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
				<p className="text-sm text-gray-500">My applications</p>
				<p className="mt-3 text-3xl font-bold">{summary?.applications ?? '--'}</p>
				<p className="mt-2 text-sm text-gray-500">{summary ? `${summary.documents} documents on file.` : 'Unable to load your application data.'}</p>
			</section>
		</div>
	);
}