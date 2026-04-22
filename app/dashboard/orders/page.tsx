import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";

export const dynamic = "force-dynamic";

export default async function DashboardOrdersPage() {
  const supabase = await createClient();
  const current = await getCurrentProfile();

  if (!current) {
    redirect("/auth/login");
  }
  
  if (!current.profile?.store_id) {
    return (
      <main className="p-8">
        <h1 className="text-3xl font-bold mb-4">Orders</h1>
        <p>No store is linked to this account.</p>
      </main>
    );
  }

  const { data: store, error: storeError } = await supabase
    .from("stores")
    .select("id, name, slug")
    .eq("id", current.profile.store_id)
    .single();

  if (storeError || !store) {
    return (
      <main className="p-8">
        <h1 className="text-3xl font-bold mb-4">Orders</h1>
        <p>Could not load your store.</p>
      </main>
    );
  }

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("*")
    .eq("store_id", store.id)
    .order("created_at", { ascending: false });

  if (ordersError) {
    return (
      <main className="p-8">
        <h1 className="text-3xl font-bold mb-4">Orders</h1>
        <p>Could not load orders.</p>
        <pre>{JSON.stringify(ordersError, null, 2)}</pre>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-2">{store.name} Orders</h1>
      <p className="mb-6 text-slate-600">Store slug: {store.slug}</p>

      {!orders || orders.length === 0 ? (
        <p>No orders found yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/dashboard/orders/${order.id}`}
              className="block rounded-xl border p-4 shadow-sm transition hover:bg-slate-50"
            >
              <div className="grid gap-2 md:grid-cols-2">
                <p>
                  <strong>Order ID:</strong> {order.id}
                </p>
                <p>
                  <strong>Status:</strong> {order.status}
                </p>
                <p>
                  <strong>Customer Name:</strong> {order.customer_name}
                </p>
                <p>
                  <strong>Phone:</strong> {order.customer_phone ?? "-"}
                </p>
                <p>
                  <strong>Email:</strong> {order.customer_email ?? "-"}
                </p>
                <p>
                  <strong>Total Amount:</strong> ₪{order.total_amount}
                </p>
                <p className="md:col-span-2">
                  <strong>Created At:</strong>{" "}
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}