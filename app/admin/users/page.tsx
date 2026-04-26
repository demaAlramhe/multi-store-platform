import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { createAdminClient } from "../../../lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { AdminUserRoleSelect } from "@/components/admin/admin-user-role-select";
import { AdminUserStoreSelect } from "@/components/admin/admin-user-store-select";

export const dynamic = "force-dynamic";

type UserRow = {
  id: string;
  full_name: string | null;
  role: string | null;
  store_id: string | null;
  email: string | null;
  store_name: string | null;
  store_slug: string | null;
};

type StoreOption = {
  id: string;
  name: string;
  slug: string;
};

type AdminUsersPageProps = {
  searchParams: Promise<{ role?: string; q?: string }>;
};

const ROLE_FILTERS = [
  { label: "All", value: "all" },
  { label: "Super Admin", value: "super_admin" },
  { label: "Store Owner", value: "store_owner" },
];

function RoleBadge({ role }: { role: string | null }) {
  const styles =
    role === "super_admin"
      ? { backgroundColor: "#dbeafe", color: "#1d4ed8" }
      : role === "store_owner"
      ? { backgroundColor: "#dcfce7", color: "#166534" }
      : { backgroundColor: "#e5e7eb", color: "#374151" };

  return (
    <span
      className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
      style={styles}
    >
      {role ?? "unknown"}
    </span>
  );
}

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  await requireSuperAdmin();

  const { role, q } = await searchParams;
  const selectedRole =
    role && ["super_admin", "store_owner"].includes(role) ? role : "all";
  const searchQuery = q?.trim().toLowerCase() ?? "";

  const supabase = createAdminClient();

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, full_name, role, store_id")
    .order("full_name", { ascending: true });

  const { data: allStores } = await supabase
    .from("stores")
    .select("id, name, slug")
    .order("name", { ascending: true });

  const storeOptions: StoreOption[] = allStores ?? [];

  let users: UserRow[] = [];

  if (!profilesError && profiles && profiles.length > 0) {
    const storeIds = profiles
      .map((profile) => profile.store_id)
      .filter((id): id is string => Boolean(id));

    const { data: stores } = storeIds.length
      ? await supabase
          .from("stores")
          .select("id, name, slug")
          .in("id", storeIds)
      : { data: [] as { id: string; name: string; slug: string }[] };

    const storesMap = Object.fromEntries(
      (stores ?? []).map((store) => [store.id, store])
    );

    const { data: authUsersData, error: authUsersError } =
      await supabase.auth.admin.listUsers();

    const authUsersMap =
      !authUsersError && authUsersData?.users
        ? Object.fromEntries(
            authUsersData.users.map((user) => [user.id, user.email ?? ""])
          )
        : {};

    users = profiles.map((profile) => {
      const store = profile.store_id ? storesMap[profile.store_id] : null;

      return {
        id: profile.id,
        full_name: profile.full_name ?? null,
        role: profile.role ?? null,
        store_id: profile.store_id ?? null,
        email: authUsersMap[profile.id] ?? null,
        store_name: store?.name ?? null,
        store_slug: store?.slug ?? null,
      };
    });
  }

  const filteredByRole =
    selectedRole === "all"
      ? users
      : users.filter((user) => user.role === selectedRole);

  const finalUsers = searchQuery
    ? filteredByRole.filter((user) => {
        const haystack = [
          user.full_name,
          user.email,
          user.role,
          user.store_name,
          user.store_slug,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(searchQuery);
      })
    : filteredByRole;

  const counters = {
    total: users.length,
    super_admin: users.filter((user) => user.role === "super_admin").length,
    store_owner: users.filter((user) => user.role === "store_owner").length,
  };

  return (
    <AppShell
      title="Manage Users"
      subtitle="Super admin view for all users in the platform"
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Total Users</p>
              <p className="text-3xl font-bold text-slate-900">{counters.total}</p>
            </div>
          </Card>

          <Card>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Super Admins</p>
              <p className="text-3xl font-bold text-blue-700">
                {counters.super_admin}
              </p>
            </div>
          </Card>

          <Card>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Store Owners</p>
              <p className="text-3xl font-bold text-green-700">
                {counters.store_owner}
              </p>
            </div>
          </Card>
        </div>

        <Card>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">All Users</h2>

              <div className="flex flex-wrap gap-2">
                {ROLE_FILTERS.map((filter) => {
                  const isActive = selectedRole === filter.value;
                  const hrefBase =
                    filter.value === "all"
                      ? "/admin/users"
                      : `/admin/users?role=${filter.value}`;

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

            <form action="/admin/users" className="flex flex-wrap gap-3">
              <input
                type="hidden"
                name="role"
                value={selectedRole === "all" ? "" : selectedRole}
              />
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder="Search by name, email, role, store..."
                className="min-w-[280px] flex-1 rounded-lg border px-3 py-2"
              />
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-4 py-2 text-white"
              >
                Search
              </button>
              <Link
                href={selectedRole === "all" ? "/admin/users" : `/admin/users?role=${selectedRole}`}
                className="rounded-lg border px-4 py-2 font-medium"
              >
                Clear
              </Link>
            </form>

            {profilesError ? (
              <div>
                <p className="text-sm text-red-600">Could not load users.</p>
                <pre className="mt-2 text-xs text-slate-600">
                  {JSON.stringify(profilesError, null, 2)}
                </pre>
              </div>
            ) : finalUsers.length === 0 ? (
              <p className="text-sm text-slate-600">No users found for this filter/search.</p>
            ) : (
              <div className="space-y-4">
                {finalUsers.map((user) => (
                  <div
                    key={user.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="grid gap-2 md:grid-cols-2">
                      <p>
                        <strong>Full Name:</strong> {user.full_name ?? "-"}
                      </p>
                      <p>
                        <strong>Email:</strong> {user.email ?? "-"}
                      </p>
                      <div className="flex items-center gap-2">
                        <strong>Role:</strong>
                        <RoleBadge role={user.role} />
                      </div>
                      <p>
                        <strong>User ID:</strong> {user.id}
                      </p>
                      <p>
                        <strong>Store Name:</strong> {user.store_name ?? "-"}
                      </p>
                      <p>
                        <strong>Store Slug:</strong> {user.store_slug ?? "-"}
                      </p>
                    </div>

                    {user.role === "store_owner" && !user.store_id && (
                      <div className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
                        Warning: This store owner is not assigned to any store yet.
                      </div>
                    )}

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="mb-2 text-sm font-medium text-slate-700">
                          Change Role
                        </p>
                        <AdminUserRoleSelect
                          userId={user.id}
                          currentRole={user.role}
                        />
                      </div>

                      <div>
                        <p className="mb-2 text-sm font-medium text-slate-700">
                          Assign Store
                        </p>
                        <AdminUserStoreSelect
                          userId={user.id}
                          currentStoreId={user.store_id}
                          currentRole={user.role}
                          stores={storeOptions}
                        />
                      </div>
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