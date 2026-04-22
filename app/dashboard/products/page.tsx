import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DeleteProductButton } from "@/components/dashboard/delete-product-button";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";

export const dynamic = "force-dynamic";

export default async function DashboardProductsPage() {
  const supabase = await createClient();
  const current = await getCurrentProfile();

  if (!current) {
    redirect("/auth/login");
  }

  if (!current.profile?.store_id) {
    return (
      <main className="p-8">
        <h1 className="text-3xl font-bold mb-4">Products</h1>
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
        <h1 className="text-3xl font-bold mb-4">Products</h1>
        <p>Could not load your store.</p>
      </main>
    );
  }

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", store.id)
    .order("created_at", { ascending: false });

  if (productsError) {
    return (
      <main className="p-8">
        <h1 className="text-3xl font-bold mb-4">Products</h1>
        <p>Could not load products.</p>
        <pre>{JSON.stringify(productsError, null, 2)}</pre>
      </main>
    );
  }

  return (
    <main className="p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{store.name} Products</h1>
          <p className="mt-2 text-slate-600">Store slug: {store.slug}</p>
        </div>

        <Link
          href="/dashboard/products/new"
          className="rounded-lg bg-slate-900 px-4 py-2 text-white"
        >
          Add Product
        </Link>
      </div>

      {!products || products.length === 0 ? (
        <p>No products found yet.</p>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="rounded-xl border p-4 shadow-sm"
            >
              <div className="grid gap-6 md:grid-cols-[180px_1fr]">
                <div>
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-40 w-40 rounded-lg border object-cover"
                    />
                  ) : (
                    <div className="flex h-40 w-40 items-center justify-center rounded-lg border text-sm text-slate-500">
                      No Image
                    </div>
                  )}
                </div>

                <div>
                  <div className="grid gap-2 md:grid-cols-2">
                    <p>
                      <strong>Name:</strong> {product.name}
                    </p>
                    <p>
                      <strong>Slug:</strong> {product.slug}
                    </p>
                    <p>
                      <strong>Price:</strong> ₪{product.price}
                    </p>
                    <p>
                      <strong>Stock:</strong> {product.stock_quantity}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      {product.is_active ? "Active" : "Inactive"}
                    </p>
                    <p>
                      <strong>Created At:</strong>{" "}
                      {new Date(product.created_at).toLocaleString()}
                    </p>
                  </div>

                  {product.description && (
                    <p className="mt-3 text-sm text-slate-600">
                      {product.description}
                    </p>
                  )}

                  <div className="mt-4 flex gap-3">
                    <Link
                      href={`/dashboard/products/${product.id}/edit`}
                      className="rounded-lg border px-4 py-2 font-medium"
                    >
                      Edit
                    </Link>

                    <DeleteProductButton productId={product.id} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}