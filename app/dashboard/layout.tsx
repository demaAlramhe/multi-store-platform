import Link from "next/link";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { requireStoreOwner } from "@/lib/auth/require-store-owner";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireStoreOwner();

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 p-4 text-sm">
          <div className="flex items-center gap-4">
            <Link className="font-medium text-slate-900" href="/dashboard">
              Dashboard
            </Link>

            <Link className="text-slate-700" href="/dashboard/products">
              Products
            </Link>

            <Link className="text-slate-700" href="/dashboard/orders">
              Orders
            </Link>

            <Link className="text-slate-700" href="/dashboard/settings">
              Settings
            </Link>
          </div>

          <LogoutButton />
        </div>
      </nav>

      {children}
    </div>
  );
}