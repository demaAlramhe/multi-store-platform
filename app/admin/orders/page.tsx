import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { createAdminClient } from "../../../lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";

export const dynamic = "force-dynamic";

type AdminOrderRow = {
  id: string;
  status: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  total_amount: number | null;
  created_at: string | null;
  store_name: string | null;
  store_slug: string | null;
};

type AdminOrdersPageProps = {
  searchParams: Promise<{ status?: string; q?: string }>;
};

const ORDER_FILTERS = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

function OrderStatusBadge({ status }: { status: string | null }) {
  const styles =
    status === "pending"
      ? { backgroundColor: "#fef3c7", color: "#92400e" }
      : status === "confirmed"
      ? { backgroundColor: "#dbeafe", color: "#1d4ed8" }
      : status === "completed"
      ? { backgroundColor: "#dcfce7", color: "#166534" }
      : status === "cancelled"
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

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  await requireSuperAdmin();

  const { status, q } = await searchParams;
  const selectedStatus =
    status && ["pending", "confirmed", "completed", "cancelled"].includes(status)
      ? status
      : "all";
  const searchQuery = q?.trim().toLowerCase() ?? "";

  const supabase = createAdminClient();

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  let rows: AdminOrderRow[] = [];

  if (!ordersError && orders && orders.length > 0) {
    const storeIds = [...new Set(orders.map((order) => order.store_id).filter(Boolean))];

    const { data: stores } = storeIds.length
      ? await supabase
          .from("stores")
          .select("id, name, slug")
          .in("id", storeIds)
      : { data: [] as { id: string; name: string; slug: string }[] };

    const storesMap = Object.fromEntries(
      (stores ?? []).map((store) => [store.id, store])
    );

    rows = orders.map((order) => {
      const store = order.store_id ? storesMap[order.store_id] : null;

      return {
        id: order.id,
        status: order.status ?? null,
        customer_name: order.customer_name ?? null,
        customer_phone: order.customer_phone ?? null,
        customer_email: order.customer_email ?? null,
        total_amount: order.total_amount ?? null,
        created_at: order.created_at ?? null,
        store_name: store?.name ?? null,
        store_slug: store?.slug ?? null,
      };
    });
  }

  const counters = {
    total: rows.length,
    pending: rows.filter((order) => order.status === "pending").length,
    confirmed: rows.filter((order) => order.status === "confirmed").length,
    completed: rows.filter((order) => order.status === "completed").length,
    cancelled: rows.filter((order) => order.status === "cancelled").length,
  };

  const filteredByStatus =
    selectedStatus === "all"
      ? rows
      : rows.filter((order) => order.status === selectedStatus);

  const finalRows = searchQuery
    ? filteredByStatus.filter((order) => {
        const haystack = [
          order.id,
          order.customer_name,
          order.customer_phone,
          order.customer_email,
          order.status,
          order.store_name,
          order.store_slug,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(searchQuery);
      })
    : filteredByStatus;

  return (
    <AppShell
      title="Manage Orders"
      subtitle="Super admin view for all orders across all stores"
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Total Orders</p>
              <p className="text-3xl font-bold text-slate-900">{counters.total}</p>
            </div>
          </Card>

          <Card>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Pending</p>
              <p className="text-3xl font-bold text-amber-700">{counters.pending}</p>
            </div>
          </Card>

          <Card>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Confirmed</p>
              <p className="text-3xl font-bold text-blue-700">{counters.confirmed}</p>
            </div>
          </Card>

          <Card>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Completed</p>
              <p className="text-3xl font-bold text-green-700">{counters.completed}</p>
            </div>
          </Card>

          <Card>
            <div className="space-y-1">
              <p className="text-sm text-slate-500">Cancelled</p>
              <p className="text-3xl font-bold text-red-700">{counters.cancelled}</p>
            </div>
          </Card>
        </div>

        <Card>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">All Orders</h2>

              <div className="flex flex-wrap gap-2">
                {ORDER_FILTERS.map((filter) => {
                  const isActive = selectedStatus === filter.value;
                  const hrefBase =
                    filter.value === "all"
                      ? "/admin/orders"
                      : `/admin/orders?status=${filter.value}`;

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

            <form action="/admin/orders" className="flex flex-wrap gap-3">
              <input
                type="hidden"
                name="status"
                value={selectedStatus === "all" ? "" : selectedStatus}
              />
              <input
                type="text"
                name="q"
                defaultValue={searchQuery}
                placeholder="Search by order id, customer, email, phone, store..."
                className="min-w-[280px] flex-1 rounded-lg border px-3 py-2"
              />
              <button
                type="submit"
                className="rounded-lg bg-slate-900 px-4 py-2 text-white"
              >
                Search
              </button>
              <Link
                href={selectedStatus === "all" ? "/admin/orders" : `/admin/orders?status=${selectedStatus}`}
                className="rounded-lg border px-4 py-2 font-medium"
              >
                Clear
              </Link>
            </form>

            {ordersError ? (
              <div>
                <p className="text-sm text-red-600">Could not load orders.</p>
                <pre className="mt-2 text-xs text-slate-600">
                  {JSON.stringify(ordersError, null, 2)}
                </pre>
              </div>
            ) : finalRows.length === 0 ? (
              <p className="text-sm text-slate-600">No orders found for this filter/search.</p>
            ) : (
              <div className="space-y-4">
                {finalRows.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="grid gap-2 md:grid-cols-2">
                      <p>
                        <strong>Order ID:</strong> {order.id}
                      </p>
                      <div className="flex items-center gap-2">
                        <strong>Status:</strong>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <p>
                        <strong>Customer Name:</strong> {order.customer_name ?? "-"}
                      </p>
                      <p>
                        <strong>Phone:</strong> {order.customer_phone ?? "-"}
                      </p>
                      <p>
                        <strong>Email:</strong> {order.customer_email ?? "-"}
                      </p>
                      <p>
                        <strong>Total Amount:</strong> ₪{order.total_amount ?? 0}
                      </p>
                      <p>
                        <strong>Store Name:</strong> {order.store_name ?? "-"}
                      </p>
                      <p>
                        <strong>Store Slug:</strong> {order.store_slug ?? "-"}
                      </p>
                      <p className="md:col-span-2">
                        <strong>Created At:</strong>{" "}
                        {order.created_at
                          ? new Date(order.created_at).toLocaleString()
                          : "-"}
                      </p>
                    </div>

                    <div className="mt-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="rounded-lg border px-4 py-2 font-medium"
                      >
                        View Order
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