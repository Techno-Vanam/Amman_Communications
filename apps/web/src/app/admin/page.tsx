import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50 text-gray-900">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border border-gray-200 text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-sm text-gray-600">Successfully signed in as Administrator.</p>
        <div className="pt-4">
          <Link
            href="/login"
            className="inline-block px-5 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors text-sm"
          >
            Sign Out
          </Link>
        </div>
      </div>
    </div>
  );
}
