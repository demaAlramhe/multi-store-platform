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

  if (storeError || !store) {
    notFound();
  }

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*")
    .eq("store_id", store.id)
    .eq("is_active", true);

  const product =
    products?.find(
      (item) => String(item.slug ?? "").trim().toLowerCase() === normalizedSlug
    ) ?? null;

  if (productsError || !product) {
    notFound();
  }

  return (
    <main className="p-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full rounded-xl border object-cover"
            />
          ) : (
            <div className="flex h-80 w-full items-center justify-center rounded-xl border text-sm text-slate-500">
              No Image
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

          <div className="space-y-3">
            <p className="text-slate-600">
              {product.description ?? "No description available."}
            </p>

            <p className="text-xl font-bold">₪{product.price}</p>

            <p className="text-sm text-slate-500">
              Stock available: {product.stock_quantity}
            </p>

            <p className="text-sm text-slate-500">
              Product slug: {product.slug}
            </p>

            <AddToCartButton
              id={product.id}
              storeSlug={storeSlug}
              name={product.name}
              price={product.price}
            />
          </div>

          <div className="mt-6 flex gap-4">
            <Link
              href={`/${storeSlug}/products`}
              className="inline-block rounded-lg border px-4 py-2 font-medium"
            >
              Back to products
            </Link>

            <Link
              href={`/${storeSlug}`}
              className="inline-block rounded-lg border px-4 py-2 font-medium"
            >
              Back to store
            </Link>

            <Link
              href={`/${storeSlug}/cart`}
              className="inline-block rounded-lg border px-4 py-2 font-medium"
            >
              View cart
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}