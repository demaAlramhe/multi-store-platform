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

    if (error || !store || store.status !== "active") {
      notFound();
    }

  return (
    <main
      className="min-h-screen"
      style={{
        background: `linear-gradient(to bottom, ${store.secondary_color || "#f8fafc"}, #ffffff)`,
      }}
    >
      <section
        className="border-b"
        style={{ borderColor: store.primary_color || "#111827" }}
      >
        {store.banner_url ? (
          <div className="relative h-72 w-full overflow-hidden">
            <img
              src={store.banner_url}
              alt={`${store.name} banner`}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-black/35" />
            <div className="absolute inset-0 flex items-center">
              <div className="mx-auto flex w-full max-w-6xl items-center gap-6 px-8">
                {store.logo_url ? (
                  <img
                    src={store.logo_url}
                    alt={`${store.name} logo`}
                    className="h-24 w-24 rounded-2xl border-4 border-white bg-white object-cover shadow-lg"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-2xl border-4 border-white bg-white text-3xl font-bold shadow-lg">
                    {store.name?.charAt(0)?.toUpperCase() || "S"}
                  </div>
                )}

                <div className="text-white">
                  <h1 className="text-4xl font-bold">{store.name}</h1>
                  <p className="mt-2 text-white/90">
                    Welcome to our store. Explore our latest products and offers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex max-w-6xl items-center gap-6 px-8 py-12">
            {store.logo_url ? (
              <img
                src={store.logo_url}
                alt={`${store.name} logo`}
                className="h-24 w-24 rounded-2xl border bg-white object-cover shadow"
              />
            ) : (
              <div
                className="flex h-24 w-24 items-center justify-center rounded-2xl border text-3xl font-bold shadow"
                style={{ borderColor: store.primary_color || "#111827" }}
              >
                {store.name?.charAt(0)?.toUpperCase() || "S"}
              </div>
            )}

            <div>
              <h1
                className="text-4xl font-bold"
                style={{ color: store.primary_color || "#111827" }}
              >
                {store.name}
              </h1>
              <p className="mt-2 text-slate-600">
                Welcome to our store. Explore our latest products and offers.
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-8 py-10">
        <div className="grid gap-8 md:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-2xl border bg-white p-8 shadow-sm">
            <h2
              className="text-2xl font-semibold"
              style={{ color: store.primary_color || "#111827" }}
            >
              About this store
            </h2>

            <p className="mt-4 text-slate-600">
              Browse our products and discover items selected במיוחד for our customers.
            </p>

            <div className="mt-6">
              <Link
                href={`/${storeSlug}/products`}
                className="inline-block rounded-lg px-5 py-3 font-medium text-white"
                style={{ backgroundColor: store.primary_color || "#111827" }}
              >
                Browse Products
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-8 shadow-sm">
            <h2
              className="text-2xl font-semibold"
              style={{ color: store.primary_color || "#111827" }}
            >
              Contact Info
            </h2>

            <div className="mt-4 space-y-3 text-slate-700">
              <p>
                <strong>Email:</strong> {store.email ?? "-"}
              </p>
              <p>
                <strong>Phone:</strong> {store.phone ?? "-"}
              </p>
              <p>
                <strong>Address:</strong> {store.address ?? "-"}
              </p>
              <p>
                <strong>Status:</strong> {store.status}
              </p>
            </div>

            <div className="mt-6 rounded-xl p-4" style={{ backgroundColor: `${store.secondary_color || "#f59e0b"}22` }}>
              <p className="text-sm text-slate-700">
                <strong>Store Slug:</strong> {store.slug}
              </p>
              <p className="mt-2 text-sm text-slate-700">
                <strong>Primary Color:</strong> {store.primary_color}
              </p>
              <p className="text-sm text-slate-700">
                <strong>Secondary Color:</strong> {store.secondary_color}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}