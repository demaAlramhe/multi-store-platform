"use client";

import Link from "next/link";
import { useMemo, useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/cart-provider";

type CheckoutPageProps = {
  params: Promise<{ storeSlug: string }>;
};

type StoreData = {
  name: string;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
};

export default function CheckoutPage({ params }: CheckoutPageProps) {
  const { storeSlug } = use(params);
  const router = useRouter();
  const { getStoreItems, clearCart } = useCart();

  const [store, setStore] = useState<StoreData | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!customerName.trim()) {
      setError("Customer name is required.");
      return;
    }

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storeSlug,
          customerName,
          customerPhone,
          customerEmail,
          items,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Failed to submit order.");
        return;
      }

      clearCart(storeSlug);
      router.push(`/${storeSlug}/checkout/success?orderId=${result.orderId}`);
    } catch (err) {
      setError("Something went wrong while submitting the order.");
    } finally {
      setLoading(false);
    }
  }

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
                Checkout
              </h1>
              <p className="text-sm text-slate-600">{store?.name || storeSlug}</p>
            </div>
          </div>

          <Link
            href={`/${storeSlug}/cart`}
            className="rounded-lg border px-4 py-2 font-medium"
          >
            Back to cart
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
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={`${item.storeSlug}-${item.id}`}
                    className="rounded-xl border p-4"
                  >
                    <h3 className="font-semibold">{item.name}</h3>
                    <p>Price: ₪{item.price}</p>
                    <p>Quantity: {item.quantity}</p>
                    <p>Total: ₪{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <p className="mt-6 text-xl font-bold">
                Grand Total: ₪{total.toFixed(2)}
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Customer Details</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block font-medium">Full Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-medium">Phone</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-medium">Email</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2"
                    placeholder="Enter your email"
                  />
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg px-4 py-2 text-white disabled:opacity-50"
                  style={{ backgroundColor: store?.primary_color || "#111827" }}
                >
                  {loading ? "Submitting..." : "Submit Order"}
                </button>
              </form>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}