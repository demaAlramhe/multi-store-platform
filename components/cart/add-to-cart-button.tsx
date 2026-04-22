"use client";

import { useCart } from "@/components/cart/cart-provider";

type AddToCartButtonProps = {
  id: string;
  storeSlug: string;
  name: string;
  price: number;
};

export function AddToCartButton({
  id,
  storeSlug,
  name,
  price,
}: AddToCartButtonProps) {
  const { addItem } = useCart();

  return (
    <button
      onClick={() => addItem({ id, storeSlug, name, price })}
      className="rounded-lg bg-slate-900 px-4 py-2 text-white"
    >
      Add to Cart
    </button>
  );
}