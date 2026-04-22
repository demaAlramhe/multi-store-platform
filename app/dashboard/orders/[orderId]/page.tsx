import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OrderStatusSelect } from "@/components/dashboard/order-status-select";

export const dynamic = "force-dynamic";

type OrderDetailsPageProps = {
  params: Promise<{ orderId: string }>;
};

type OrderItem = {
  id: string;
  quantity: number;
  unit_price: number;
  product_id: string | null;
};

type ProductMap = Record<
  string,
  {
    name: string;
    slug: string;
  }
>;

export default async function OrderDetailsPage({
  params,
}: OrderDetailsPageProps) {
  const { orderId } = await params;
  const supabase = await createClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    notFound();
  }

  const { data: orderItems, error: itemsError } = await supabase
    .from("order_items")
    .select("id, quantity, unit_price, product_id")
    .eq("order_id", order.id);

  if (itemsError) {
    return (
      <main className="p-8">
        <h1 className="text-3xl font-bold mb-4">Order Details</h1>
        <p>Could not load order items.</p>
        <pre>{JSON.stringify(itemsError, null, 2)}</pre>
      </main>
    );
  }

  const typedItems: OrderItem[] = orderItems ?? [];

  const productIds = typedItems
    .map((item) => item.product_id)
    .filter((id): id is string => Boolean(id));

  let productsMap: ProductMap = {};

  if (productIds.length > 0) {
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, slug")
      .in("id", productIds);

    if (productsError) {
      return (
        <main className="p-8">
          <h1 className="text-3xl font-bold mb-4">Order Details</h1>
          <p>Could not load products.</p>
          <pre>{JSON.stringify(productsError, null, 2)}</pre>
        </main>
      );
    }

    productsMap = Object.fromEntries(
      (products ?? []).map((product) => [
        product.id,
        { name: product.name, slug: product.slug },
      ])
    );
  }

  const computedTotal = typedItems.reduce(
    (sum, item) => sum + Number(item.unit_price) * Number(item.quantity),
    0
  );

  return (
    <main className="p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Order Details</h1>
          <p className="mt-2 text-slate-600">Order ID: {order.id}</p>
        </div>

        <Link
          href="/dashboard/orders"
          className="rounded-lg border px-4 py-2 font-medium"
        >
          Back to Orders
        </Link>
      </div>

      <div className="mb-8 rounded-xl border p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Customer Information</h2>

        <div className="grid gap-2 md:grid-cols-2">
          <p>
            <strong>Name:</strong> {order.customer_name}
          </p>
          <p>
            <strong>Status:</strong> {order.status}
          </p>
          <p>
            <strong>Phone:</strong> {order.customer_phone ?? "-"}
          </p>
          <p>
            <strong>Email:</strong> {order.customer_email ?? "-"}
          </p>
          <p className="md:col-span-2">
            <strong>Created At:</strong>{" "}
            {new Date(order.created_at).toLocaleString()}
          </p>

          <div className="md:col-span-2 mt-4">
            <OrderStatusSelect
              orderId={order.id}
              currentStatus={order.status}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Ordered Items</h2>

        {typedItems.length === 0 ? (
          <p>No items found for this order.</p>
        ) : (
          <div className="space-y-4">
            {typedItems.map((item) => {
              const product = item.product_id ? productsMap[item.product_id] : null;

              return (
                <div
                  key={item.id}
                  className="rounded-lg border border-slate-200 p-4"
                >
                  <h3 className="text-lg font-semibold">
                    {product?.name ?? "Deleted Product"}
                  </h3>

                  <div className="mt-2 grid gap-2 text-sm md:grid-cols-2">
                    <p>
                      <strong>Product Slug:</strong> {product?.slug ?? "-"}
                    </p>
                    <p>
                      <strong>Quantity:</strong> {item.quantity}
                    </p>
                    <p>
                      <strong>Unit Price:</strong> ₪{item.unit_price}
                    </p>
                    <p>
                      <strong>Line Total:</strong> ₪
                      {(Number(item.unit_price) * Number(item.quantity)).toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 border-t pt-4">
          <p className="text-xl font-bold">
            Computed Total: ₪{computedTotal.toFixed(2)}
          </p>
          <p className="text-sm text-slate-500">
            Saved Order Total: ₪{Number(order.total_amount).toFixed(2)}
          </p>
        </div>
      </div>
    </main>
  );
}