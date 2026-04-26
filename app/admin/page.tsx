import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { createAdminClient } from "../../lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireSuperAdmin();

  const supabase = createAdminClient();

  const [
    { count: totalStores },
    { count: activeStores },
    { count: inactiveStores },
    { count: archivedStores },
    { count: totalUsers },
    { count: totalOrders },
    { count: pendingOrders },
  ] = await Promise.all([
    supabase.from("stores").select("*", { count: "exact", head: true }),
    supabase
      .from("stores")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("stores")
      .select("*", { count: "exact", head: true })
      .eq("status", "inactive"),
    supabase
      .from("stores")
      .select("*", { count: "exact", head: true })
      .eq("status", "archived"),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
  ]);

  return (
    <AppShell
      title="Admin Overview"
      subtitle="High-level platform overview for the super admin"
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <Card>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Total Stores</p>
              <p className="text-3xl font-bold text-slate-900">{totalStores ?? 0}</p>
            </div>
          </Card>

          <Card>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Active Stores</p>
              <p className="text-3xl font-bold text-green-700">{activeStores ?? 0}</p>
            </div>
          </Card>

          <Card>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Inactive Stores</p>
              <p className="text-3xl font-bold text-red-700">{inactiveStores ?? 0}</p>
            </div>
          </Card>

          <Card>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Archived Stores</p>
              <p className="text-3xl font-bold text-slate-700">{archivedStores ?? 0}</p>
            </div>
          </Card>

          <Card>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Total Users</p>
              <p className="text-3xl font-bold text-blue-700">{totalUsers ?? 0}</p>
            </div>
          </Card>

          <Card>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Total Orders</p>
              <p className="text-3xl font-bold text-amber-700">{totalOrders ?? 0}</p>
            </div>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Quick Actions</h2>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/admin/stores"
                  className="rounded-lg border px-4 py-2 font-medium"
                >
                  Manage Stores
                </Link>

                <Link
                  href="/admin/users"
                  className="rounded-lg border px-4 py-2 font-medium"
                >
                  Manage Users
                </Link>
              </div>
            </div>
          </Card>

          <Card>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Orders Snapshot</h2>
              <p className="text-sm text-slate-600">
                Pending orders across all stores:
              </p>
              <p className="text-4xl font-bold text-slate-900">
                {pendingOrders ?? 0}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}