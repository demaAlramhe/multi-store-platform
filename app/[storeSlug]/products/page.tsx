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
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">{store.name} Products</h1>

      {!products || products.length === 0 ? (
        <p>No products found for this store.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/${storeSlug}/products/${product.slug}`}
              className="block rounded-xl border p-4 shadow-sm transition hover:bg-slate-50"
            >
              <div className="space-y-4">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-56 w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-56 w-full items-center justify-center rounded-lg border text-sm text-slate-500">
                    No Image
                  </div>
                )}

                <div>
                  <h2 className="text-xl font-semibold">{product.name}</h2>
                  <p className="mt-2 text-sm text-slate-600">
                    {product.description ?? "No description"}
                  </p>
                  <p className="mt-3 font-bold">₪{product.price}</p>
                  <p className="text-sm text-slate-500">
                    Stock: {product.stock_quantity}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Link
        href={`/${storeSlug}`}
        className="mt-6 inline-block text-sm font-medium underline"
      >
        Back to store
      </Link>
    </main>
  );
}