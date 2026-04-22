import { AppShell } from "@/components/layout/app-shell";
import Link from "next/link";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { Card } from "@/components/ui/card";
import { AdminCreateStoreForm } from "@/components/admin/admin-create-store-form";
import { createAdminClient } from "../../../lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminStoresPage() {
  await requireSuperAdmin();
  const supabase = createAdminClient();

  const { data: stores, error } = await supabase
    .from("stores")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <AppShell
      title="Manage Stores"
      subtitle="Super admin view for all tenant stores in the platform"
    >
      <div className="space-y-6">
        <Card>
          <div className="space-y-4">
            <p className="text-sm text-slate-700">
              Create a new store and its owner account. Restrict this route to users with{" "}
              <code>super_admin</code> role.
            </p>
            <AdminCreateStoreForm />
          </div>
        </Card>

        <Card>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">All Stores</h2>

            {error ? (
              <div>
                <p className="text-sm text-red-600">Could not load stores.</p>
                <pre className="mt-2 text-xs text-slate-600">
                  {JSON.stringify(error, null, 2)}
                </pre>
              </div>
            ) : !stores || stores.length === 0 ? (
              <p className="text-sm text-slate-600">No stores found yet.</p>
            ) : (
              <div className="space-y-4">
                {stores.map((store) => (
                  <div
                    key={store.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="grid gap-2 md:grid-cols-2">
                      <p>
                        <strong>Name:</strong> {store.name}
                      </p>
                      <p>
                        <strong>Slug:</strong> {store.slug}
                      </p>
                      <p>
                        <strong>Email:</strong> {store.email ?? "-"}
                      </p>
                      <p>
                        <strong>Phone:</strong> {store.phone ?? "-"}
                      </p>
                      <p>
                        <strong>Status:</strong> {store.status}
                      </p>
                      <p>
                        <strong>Created At:</strong>{" "}
                        {store.created_at
                          ? new Date(store.created_at).toLocaleString()
                          : "-"}
                      </p>
                      <p className="md:col-span-2">
                        <strong>Address:</strong> {store.address ?? "-"}
                      </p>
                    </div>

                    <div className="mt-4">
                      <Link
                        href={`/admin/stores/${store.id}`}
                        className="rounded-lg border px-4 py-2 font-medium"
                      >
                        View / Edit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}