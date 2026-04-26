import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">
          Manage platform users and tenant stores.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/admin/users"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Go to Users
          </Link>
          <Link
            href="/admin/stores"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            Go to Stores
          </Link>
        </div>
      </div>
    </main>
  );
}