import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ProductsPageProps = {
  params: Promise<{ storeSlug: string }>;
};

export default async function StoreProductsPage({ params }: ProductsPageProps) {
  const { storeSlug } = await params;
  const supabase = await createClient();

  const { data: store, error: storeError } = await supabase
    .from("stores")
    .select("*")
    .eq("slug", storeSlug)
    .single();

  if (storeError || !store) {
    notFound();
  }

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", store.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (productsError) {
    return (
      <main className="p-8">
        <h1 className="text-3xl font-bold mb-4">{store.name} Products</h1>
        <p>Could not load products.</p>
        <pre>{JSON.stringify(productsError, null, 2)}</pre>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen"
      style={{
        background: `linear-gradient(to bottom, ${store.secondary_color || "#f8fafc"}, #ffffff)`,
      }}
    >
      <section className="border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-8 py-6">
          <div className="flex items-center gap-4">
            {store.logo_url ? (
              <img
                src={store.logo_url}
                alt={`${store.name} logo`}
                className="h-14 w-14 rounded-xl border bg-white object-cover shadow-sm"
              />
            ) : (
              <div
                className="flex h-14 w-14 items-center justify-center rounded-xl border bg-white text-xl font-bold shadow-sm"
                style={{ borderColor: store.primary_color || "#111827" }}
              >
                {store.name?.charAt(0)?.toUpperCase() || "S"}
              </div>
            )}

            <div>
              <h1
                className="text-3xl font-bold"
                style={{ color: store.primary_color || "#111827" }}
              >
                {store.name} Products
              </h1>
              <p className="text-sm text-slate-600">
                Explore our available products
              </p>
            </div>
          </div>

          <Link
            href={`/${storeSlug}`}
            className="rounded-lg border px-4 py-2 font-medium"
          >
            Back to Store
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-8 py-10">
        {!products || products.length === 0 ? (
          <div className="rounded-2xl border bg-white p-8 text-center shadow-sm">
            <p>No products found for this store.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/${storeSlug}/products/${product.slug}`}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-60 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-60 w-full items-center justify-center bg-slate-50 text-sm text-slate-500">
                    No Image
                  </div>
                )}

                <div className="space-y-3 p-5">
                  <div>
                    <h2 className="text-xl font-semibold">{product.name}</h2>
                    <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                      {product.description ?? "No description"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <p
                      className="text-lg font-bold"
                      style={{ color: store.primary_color || "#111827" }}
                    >
                      ₪{product.price}
                    </p>

                    <span
                      className="rounded-full px-3 py-1 text-xs font-medium"
                      style={{
                        backgroundColor: `${store.secondary_color || "#f59e0b"}22`,
                        color: store.primary_color || "#111827",
                      }}
                    >
                      Stock: {product.stock_quantity}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}