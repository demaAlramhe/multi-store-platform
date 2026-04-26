import { AppShell } from "@/components/layout/app-shell";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { AdminCreateStoreForm } from "@/components/admin/admin-create-store-form";
import { AdminStoreStatusButton } from "@/components/admin/admin-store-status-button";
import { createAdminClient } from "../../../lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";

export const dynamic = "force-dynamic";

type StoreWithOwner = {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  status: string | null;
  address: string | null;
  created_at: string | null;
  owner_name: string | null;
  owner_email: string | null;
  owner_role: string | null;
};

type AdminStoresPageProps = {
  searchParams: Promise<{ status?: string; q?: string }>;
};

function StatusBadge({ status }: { status: string | null }) {
  const styles =
    status === "active"
      ? { backgroundColor: "#dcfce7", color: "#166534" }
      : status === "inactive"
      ? { backgroundColor: "#fee2e2", color: "#991b1b" }
      : { backgroundColor: "#e5e7eb", color: "#374151" };

  return (
    <span
      className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
      style={styles}
    >
      {status ?? "unknown"}
    </span>
  );
}

const FILTERS = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Archived", value: "archived" },
];

export default async function AdminStoresPage({
  searchParams,
}: AdminStoresPageProps) {
  await requireSuperAdmin();

  const { status, q } = await searchParams;
  const selectedStatus =
    status && ["active", "inactive", "archived"].includes(status)
      ? status
      : "all";

  const searchQuery = q?.trim().toLowerCase() ?? "";

  const supabase = createAdminClient();

  const { data: allStores, error: allStoresError } = await supabase
    .from("stores")
    .select("*")
    .order("created_at", { ascending: false });

  const counters = {
    total: allStores?.length ?? 0,
    active: allStores?.filter((store) => store.status === "active").length ?? 0,
    inactive:
      allStores?.filter((store) => store.status === "inactive").length ?? 0,
    archived:
      allStores?.filter((store) => store.status === "archived").length ?? 0,
  };

  const statusFilteredStores =
    selectedStatus === "all"
      ? allStores ?? []
      : (allStores ?? []).filter((store) => store.status === selectedStatus);

  let storesWithOwners: StoreWithOwner[] = [];

  if (statusFilteredStores.length > 0) {
    const storeIds = statusFilteredStores.map((store) => store.id);

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("full_name, role, store_id, id")
      .in("store_id", storeIds);

    let authUsersMap: Record<string, string> = {};

    if (!profilesError && profiles && profiles.length > 0) {
      const userIds = profiles.map((profile) => profile.id);

      const { data: authUsersData, error: authUsersError } =
        await supabase.auth.admin.listUsers();

      if (!authUsersError && authUsersData?.users) {
        authUsersMap = Object.fromEntries(
          authUsersData.users
            .filter((user) => userIds.includes(user.id))
            .map((user) => [user.id, user.email ?? ""])
        );
      }

      storesWithOwners = statusFilteredStores.map((store) => {
        const ownerProfile =
          profiles.find((profile) => profile.store_id === store.id) ?? null;

        return {
          ...store,
          owner_name: ownerProfile?.full_name ?? null,
          owner_email: ownerProfile ? authUsersMap[ownerProfile.id] ?? null : null,
          owner_role: ownerProfile?.role ?? null,
        };
      });
    } else {
      storesWithOwners = statusFilteredStores.map((store) => ({
        ...store,
        owner_name: null,
        owner_email: null,
        owner_role: null,
      }));
    }
  }

  const finalStores = searchQuery
    ? storesWithOwners.filter((store) => {
        const haystack = [
          store.name,
          store.slug,
          store.email,
          store.phone,
          store.address,
          store.owner_name,
          store.owner_email,
          store.owner_role,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(searchQuery);
      })
    : storesWithOwners;

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

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Total Stores</p>
              <p className="text-3xl font-bold text-slate-900">{counters.total}</p>
            </div>
          </Card>

          <Card>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Active</p>
              <p className="text-3xl font-bold text-green-700">{counters.active}</p>
            </div>
          </Card>

          <Card>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Inactive</p>
              <p className="text-3xl font-bold text-red-700">{counters.inactive}</p>
            </div>
          </Card>

          <Card>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Archived</p>
              <p className="text-3xl font-bold text-slate-700">{counters.archived}</p>
            </div>
          </Card>
        </div>

        <Card>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">All Stores</h2>

              <div className="flex flex-wrap gap-2">
                {FILTERS.map((filter) => {
                  const isActive = selectedStatus === filter.value;
                  const hrefBase =
                    filter.value === "all"
                      ? "/admin/stores"
                      : `/admin/stores?status=${filter.value}`;

                  const href =
                    searchQuery.length > 0
                      ? `${hrefBase}${hrefBase.includes("?") ? "&" : "?"}q=${encodeURIComponent(
                          searchQuery
                        )}`
                      : hrefBase;

                  return (
                    <Link
                      key={filter.value}
                      href={href}
                      className="rounded-lg px-4 py-2 text-sm font-medium"
                      style={{
                        backgroundColor: isActive ? "#111827" : "#ffffff",
                        color: isActive ? "#ffffff" : "#111827",
                        border: "1px solid #cbd5e1",
                      }}
                    >
                      {filter.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            <form action="/admin/stores" className="flex flex-wrap gap-3">
              <input type="hidden" name="status" value={selectedStatus === "all" ? "" : selectedStatus} />
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder="Search by store name, slug, owner, email..."
                className="min-w-[280px] flex-1 rounded-lg border px-3 py-2"
              />
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-4 py-2 text-white"
              >
                Search
              </button>
              <Link
                href={selectedStatus === "all" ? "/admin/stores" : `/admin/stores?status=${selectedStatus}`}
                className="rounded-lg border px-4 py-2 font-medium"
              >
                Clear
              </Link>
            </form>

            {allStoresError ? (
              <div>
                <p className="text-sm text-red-600">Could not load stores.</p>
                <pre className="mt-2 text-xs text-slate-600">
                  {JSON.stringify(allStoresError, null, 2)}
                </pre>
              </div>
            ) : !finalStores || finalStores.length === 0 ? (
              <p className="text-sm text-slate-600">No stores found for this filter/search.</p>
            ) : (
              <div className="space-y-4">
                {finalStores.map((store) => (
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
                        <strong>Status:</strong> <StatusBadge status={store.status} />
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

                    <div className="mt-4 rounded-lg bg-slate-50 p-4">
                      <h3 className="mb-2 font-semibold">Owner Info</h3>
                      <div className="grid gap-2 md:grid-cols-2">
                        <p>
                          <strong>Name:</strong> {store.owner_name ?? "-"}
                        </p>
                        <p>
                          <strong>Email:</strong> {store.owner_email ?? "-"}
                        </p>
                        <p>
                          <strong>Role:</strong> {store.owner_role ?? "-"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-3">
                      <Link
                        href={`/admin/stores/${store.id}`}
                        className="rounded-lg border px-4 py-2 font-medium"
                      >
                        View / Edit
                      </Link>

                      <AdminStoreStatusButton
                        storeId={store.id}
                        currentStatus={store.status}
                      />
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