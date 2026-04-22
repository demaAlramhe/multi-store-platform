"use client";

import Link from "next/link";
import { useMemo, use, useEffect, useState } from "react";
import { useCart } from "@/components/cart/cart-provider";

type CartPageProps = {
  params: Promise<{ storeSlug: string }>;
};

type StoreData = {
  name: string;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
};

export default function CartPage({ params }: CartPageProps) {
  const { storeSlug } = use(params);
  const { getStoreItems, removeItem, clearCart } = useCart();

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

  const items = getStoreItems(storeSlug);

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  return (
    <main
      className="min-h-screen"
      style={{
        background: `linear-gradient(to bottom, ${store?.secondary_color || "#f8fafc"}, #ffffff)`,
      }}
    >
      <section className="border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-8 py-6">
          <div className="flex items-center gap-4">
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
                Your Cart
              </h1>
              <p className="text-sm text-slate-600">{store?.name || storeSlug}</p>
            </div>
          </div>

          <Link
            href={`/${storeSlug}/products`}
            className="rounded-lg border px-4 py-2 font-medium"
          >
            Continue Shopping
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-8 py-10">
        {items.length === 0 ? (
          <div className="rounded-2xl border bg-white p-8 shadow-sm">
            <p>Your cart is empty.</p>
            <Link href={`/${storeSlug}/products`} className="mt-4 inline-block underline">
              Back to products
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.storeSlug}-${item.id}`}
                  className="rounded-2xl border bg-white p-5 shadow-sm"
                >
                  <h2 className="text-xl font-semibold">{item.name}</h2>
                  <p className="mt-2">Price: ₪{item.price}</p>
                  <p>Quantity: {item.quantity}</p>
                  <p>Total: ₪{(item.price * item.quantity).toFixed(2)}</p>

                  <button
                    onClick={() => removeItem(item.id, item.storeSlug)}
                    className="mt-4 rounded-lg border px-4 py-2"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
              <p className="text-2xl font-bold">Grand Total: ₪{total.toFixed(2)}</p>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => clearCart(storeSlug)}
                  className="rounded-lg border px-4 py-2"
                >
                  Clear Cart
                </button>

                <Link
                  href={`/${storeSlug}/products`}
                  className="rounded-lg border px-4 py-2"
                >
                  Continue Shopping
                </Link>

                <Link
                  href={`/${storeSlug}/checkout`}
                  className="rounded-lg px-4 py-2 text-white"
                  style={{ backgroundColor: store?.primary_color || "#111827" }}
                >
                  Checkout
                </Link>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}