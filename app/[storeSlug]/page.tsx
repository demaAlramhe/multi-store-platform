import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type StorePageProps = {
  params: Promise<{ storeSlug: string }>;
};

export default async function StorePage({ params }: StorePageProps) {
  const { storeSlug } = await params;
  const supabase = await createClient();

  const { data: store, error } = await supabase
    .from("stores")
    .select("*")
    .eq("slug", storeSlug)
    .single();

  if (error || !store) {
    notFound();
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-4">{store.name}</h1>

      <div className="space-y-2 mb-6">
        <p><strong>Slug:</strong> {store.slug}</p>
        <p><strong>Email:</strong> {store.email ?? "-"}</p>
        <p><strong>Phone:</strong> {store.phone ?? "-"}</p>
        <p><strong>Status:</strong> {store.status}</p>
        <p><strong>Primary Color:</strong> {store.primary_color}</p>
        <p><strong>Secondary Color:</strong> {store.secondary_color}</p>
      </div>

      <Link
        href={`/${storeSlug}/products`}
        className="inline-block rounded-lg border px-4 py-2 font-medium"
      >
        Browse Products
      </Link>
    </main>
  );
}