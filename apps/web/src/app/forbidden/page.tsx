import Link from 'next/link';

export default async function ForbiddenPage({ searchParams }: { searchParams: Promise<{ area?: string }> }) {
  const { area } = await searchParams;
  const workspace = area === 'admin' ? 'admin' : 'customer';
  const home = '/login';

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6 text-center text-gray-900">
      <div className="max-w-md">
        <p className="text-sm font-semibold uppercase tracking-wider text-red-700">403 Forbidden</p>
        <h1 className="mt-3 text-3xl font-bold">You do not have access to this workspace.</h1>
        <p className="mt-4 text-gray-600">
          Your account is not allowed to view the {workspace} area. Use the workspace assigned to your account.
        </p>
        <Link href={home} className="mt-7 inline-flex rounded-lg bg-brand-700 px-5 py-3 font-semibold text-white hover:bg-brand-800">
          Return to your login page
        </Link>
      </div>
    </main>
  );
}
