import Link from "next/link";
import { LogoutButton } from "@/components/dashboard/logout-button";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireSuperAdmin();

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 p-4 text-sm">
          <div className="flex items-center gap-4">
            <Link className="font-medium text-slate-900" href="/admin">
              Admin
            </Link>

            <Link className="text-slate-700" href="/admin/orders">
  Orders
</Link>

            <Link className="text-slate-700" href="/admin/stores">
              Stores
            </Link>

            <Link className="text-slate-700" href="/admin/users">
              Users
            </Link>
          </div>

          <LogoutButton />
        </div>
      </nav>

      {children}
    </div>
  );
}