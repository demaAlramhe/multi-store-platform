import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";

type ProductPageProps = {
  params: Promise<{ storeSlug: string; productSlug: string }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  const { storeSlug, productSlug } = await params;
  const supabase = await createClient();

  const normalizedSlug = productSlug.trim().toLowerCase();

  const { data: store, error: storeError } = await supabase
    .from("stores")
    .select("*")
    .eq("slug", storeSlug)
    .single();

    if (storeError || !store || store.status !== "active") {
      notFound();
    }

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", store.id)
    .eq("is_active", true);

  if (productsError || !products) {
    notFound();
  }

  const product = products.find(
    (item) => item.slug?.trim().toLowerCase() === normalizedSlug
  );

  if (!product) {
    notFound();
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
                {product.name}
              </h1>
              <p className="text-sm text-slate-600">{store.name}</p>
            </div>
          </div>

          <Link
            href={`/${storeSlug}/products`}
            className="rounded-lg border px-4 py-2 font-medium"
          >
            Back to Products
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-8 py-10">
        <div className="grid gap-8 rounded-3xl border bg-white p-8 shadow-sm md:grid-cols-2">
          <div>
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full rounded-2xl border object-cover"
              />
            ) : (
              <div className="flex h-80 w-full items-center justify-center rounded-2xl border text-sm text-slate-500">
                No Image
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <h2 className="text-4xl font-bold">{product.name}</h2>

              <p className="mt-4 text-base leading-7 text-slate-600">
                {product.description ?? "No description available."}
              </p>

              <div className="mt-6 space-y-3">
                <p
                  className="text-3xl font-bold"
                  style={{ color: store.primary_color || "#111827" }}
                >
                  ₪{product.price}
                </p>

                <p className="text-sm text-slate-500">
                  Stock available: {product.stock_quantity}
                </p>

                <p className="text-sm text-slate-500">
                  Product slug: {product.slug}
                </p>
              </div>

              <div className="mt-8">
                <AddToCartButton
                  id={product.id}
                  storeSlug={storeSlug}
                  name={product.name}
                  price={product.price}
                />
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/${storeSlug}`}
                className="rounded-lg border px-4 py-2 font-medium"
              >
                Back to Store
              </Link>

              <Link
                href={`/${storeSlug}/cart`}
                className="rounded-lg border px-4 py-2 font-medium"
              >
                View Cart
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}