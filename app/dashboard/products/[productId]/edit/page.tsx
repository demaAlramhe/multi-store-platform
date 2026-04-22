import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { EditProductForm } from "@/components/dashboard/edit-product-form";

export const dynamic = "force-dynamic";

type EditProductPageProps = {
  params: Promise<{ productId: string }>;
};

export default async function EditProductPage({ params }: EditProductPageProps) {
  const current = await getCurrentProfile();

  if (!current) {
    redirect("/auth/login");
  }

  if (!current.profile?.store_id) {
    return (
      <main className="p-8">
        <h1 className="text-3xl font-bold mb-4">Edit Product</h1>
        <p>No store is linked to this account.</p>
      </main>
    );
  }

  const { productId } = await params;
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .eq("store_id", current.profile.store_id)
    .single();

  if (error || !product) {
    notFound();
  }

  return (
    <main className="p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Edit Product</h1>

        <Link
          href="/dashboard/products"
          className="rounded-lg border px-4 py-2 font-medium"
        >
          Back to Products
        </Link>
      </div>

      <EditProductForm
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description ?? "",
          price: Number(product.price),
          stockQuantity: product.stock_quantity,
          isActive: product.is_active,
          imageUrl: product.image_url ?? "",
        }}
      />
    </main>
  );
}