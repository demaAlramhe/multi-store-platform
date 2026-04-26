import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { createAdminClient } from "../../../../lib/supabase/admin";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { AdminOrderStatusSelect } from "@/components/admin/admin-order-status-select";

export const dynamic = "force-dynamic";

type AdminOrderPageProps = {
  params: Promise<{ orderId: string }>;
};

export default async function AdminOrderPage({ params }: AdminOrderPageProps) {
  await requireSuperAdmin();

  const { orderId } = await params;
  const supabase = createAdminClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    notFound();
  }

  const { data: store } = await supabase
    .from("stores")
    .select("id, name, slug")
    .eq("id", order.store_id)
    .maybeSingle();

  const { data: orderItems } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", order.id);

  return (
    <AppShell
      title={`Order ${order.id}`}
      subtitle="Super admin order details view"
    >
      <div className="space-y-6">
        <Card>
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Order Info</h2>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">
                Change Order Status
              </p>
              <AdminOrderStatusSelect
                orderId={order.id}
                currentStatus={order.status}
              />
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <p><strong>Status:</strong> {order.status}</p>
              <p><strong>Total:</strong> ₪{order.total_amount}</p>
              <p><strong>Customer Name:</strong> {order.customer_name ?? "-"}</p>
              <p><strong>Phone:</strong> {order.customer_phone ?? "-"}</p>
              <p><strong>Email:</strong> {order.customer_email ?? "-"}</p>
              <p><strong>Store Name:</strong> {store?.name ?? "-"}</p>
              <p><strong>Store Slug:</strong> {store?.slug ?? "-"}</p>
              <p className="md:col-span-2">
                <strong>Created At:</strong>{" "}
                {order.created_at ? new Date(order.created_at).toLocaleString() : "-"}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Order Items</h2>

            {!orderItems || orderItems.length === 0 ? (
              <p className="text-sm text-slate-600">No order items found.</p>
            ) : (
              <div className="space-y-3">
                {orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-slate-200 p-4"
                  >
                    <div className="grid gap-2 md:grid-cols-2">
                      <p><strong>Product Name:</strong> {item.product_name ?? "-"}</p>
                      <p><strong>Quantity:</strong> {item.quantity ?? 0}</p>
                      <p><strong>Unit Price:</strong> ₪{item.unit_price ?? 0}</p>
                      <p><strong>Line Total:</strong> ₪{item.line_total ?? 0}</p>
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