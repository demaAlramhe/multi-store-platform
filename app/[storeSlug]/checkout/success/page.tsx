"use client";

import Link from "next/link";
import { useSearchParams, useParams } from "next/navigation";
import { useEffect, useState } from "react";

type StoreData = {
  name: string;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
};

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const storeSlug = params.storeSlug as string;
  const orderId = searchParams.get("orderId");

  const [store, setStore] = useState<StoreData | null>(null);

  useEffect(() => {
    async function loadStore() {
      const response = await fetch(`/api/public-store/${storeSlug}`);
      const result = await response.json();

      if (response.ok) {
        setStore(result.store);
      }
    }

    loadStore();
  }, [storeSlug]);

  return (
    <main
      className="min-h-screen"
      style={{
        background: `linear-gradient(to bottom, ${store?.secondary_color || "#f8fafc"}, #ffffff)`,
      }}
    >
      <section className="border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-8 py-6">
          {store?.logo_url ? (
            <img
              src={store.logo_url}
              alt={`${store.name} logo`}
              className="h-14 w-14 rounded-xl border bg-white object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-xl border bg-white text-xl font-bold shadow-sm">
              {store?.name?.charAt(0)?.toUpperCase() || "S"}
            </div>
          )}

          <div>
            <h1
              className="text-3xl font-bold"
              style={{ color: store?.primary_color || "#111827" }}
            >
              Order Submitted
            </h1>
            <p className="text-sm text-slate-600">{store?.name || storeSlug}</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-8 py-12">
        <div className="rounded-3xl border bg-white p-10 text-center shadow-sm">
          <div
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold text-white"
            style={{ backgroundColor: store?.primary_color || "#111827" }}
          >
            ✓
          </div>

          <h2 className="text-3xl font-bold text-slate-900">
            Thank you for your order!
          </h2>

          <p className="mt-4 text-slate-600">
            Your order has been submitted successfully.
          </p>

          {orderId && (
            <p className="mt-3 text-sm text-slate-500">
              Order ID: {orderId}
            </p>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={`/${storeSlug}`}
              className="rounded-lg border px-4 py-2 font-medium"
            >
              Back to Store
            </Link>

            <Link
              href={`/${storeSlug}/products`}
              className="rounded-lg px-4 py-2 text-white"
              style={{ backgroundColor: store?.primary_color || "#111827" }}
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}