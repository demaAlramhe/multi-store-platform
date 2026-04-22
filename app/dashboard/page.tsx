import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";

export default async function DashboardHomePage() {
  const current = await getCurrentProfile();

  if (!current) {
    redirect("/auth/login");
  }

  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="mb-2 text-4xl font-bold text-slate-900">Dashboard</h1>
      <p className="mb-2 text-slate-600">
        Welcome, {current.profile?.full_name || current.user.email}
      </p>
      <p className="mb-8 text-slate-600">
        Manage your store data, products, and orders.
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        <Link
          href="/dashboard/products"
          className="rounded-xl border bg-white p-6 shadow-sm transition hover:bg-slate-50"
        >
          <h2 className="mb-2 text-xl font-semibold">Products</h2>
          <p className="text-sm text-slate-600">
            View and manage store products.
          </p>
        </Link>

        <Link
          href="/dashboard/orders"
          className="rounded-xl border bg-white p-6 shadow-sm transition hover:bg-slate-50"
        >
          <h2 className="mb-2 text-xl font-semibold">Orders</h2>
          <p className="text-sm text-slate-600">
            View customer orders and track their status.
          </p>
        </Link>

        <Link
          href="/dashboard/products/new"
          className="rounded-xl border bg-white p-6 shadow-sm transition hover:bg-slate-50"
        >
          <h2 className="mb-2 text-xl font-semibold">Add Product</h2>
          <p className="text-sm text-slate-600">
            Create a new product for your store.
          </p>
        </Link>
      </div>
    </main>
  );
}