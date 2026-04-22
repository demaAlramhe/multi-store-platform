"use client";

import Link from "next/link";
import { useMemo, use } from "react";
import { useCart } from "@/components/cart/cart-provider";

type CartPageProps = {
  params: Promise<{ storeSlug: string }>;
};

export default function CartPage({ params }: CartPageProps) {
  const { storeSlug } = use(params);
  const { getStoreItems, removeItem, clearCart } = useCart();

  const items = getStoreItems(storeSlug);

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      {items.length === 0 ? (
        <div className="space-y-4">
          <p>Your cart is empty.</p>
          <Link href={`/${storeSlug}/products`} className="underline">
            Back to products
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={`${item.storeSlug}-${item.id}`}
                className="rounded-xl border p-4"
              >
                <h2 className="text-xl font-semibold">{item.name}</h2>
                <p>Price: ₪{item.price}</p>
                <p>Quantity: {item.quantity}</p>
                <p>Total: ₪{(item.price * item.quantity).toFixed(2)}</p>

                <button
                  onClick={() => removeItem(item.id, item.storeSlug)}
                  className="mt-3 rounded-lg border px-4 py-2"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-3">
            <p className="text-xl font-bold">Grand Total: ₪{total.toFixed(2)}</p>

            <div className="flex gap-3">
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
                className="rounded-lg bg-slate-900 px-4 py-2 text-white"
              >
                Checkout
              </Link>
            </div>
          </div>
        </>
      )}
    </main>
  );
}