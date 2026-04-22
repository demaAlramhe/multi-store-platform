"use client";

import Link from "next/link";
import { useMemo, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/cart-provider";

type CheckoutPageProps = {
  params: Promise<{ storeSlug: string }>;
};

export default function CheckoutPage({ params }: CheckoutPageProps) {
  const { storeSlug } = use(params);
  const router = useRouter();
  const { getStoreItems, clearCart } = useCart();

  const items = getStoreItems(storeSlug);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      {items.length === 0 ? (
        <div className="space-y-4">
          <p>Your cart is empty.</p>
          <Link href={`/${storeSlug}/products`} className="underline">
            Back to products
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          <div>
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

          <div>
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

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Order"}
              </button>
            </form>

            <Link
              href={`/${storeSlug}/cart`}
              className="mt-4 inline-block underline"
            >
              Back to cart
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}