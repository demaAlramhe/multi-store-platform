import Link from "next/link";

type SuccessPageProps = {
  params: Promise<{ storeSlug: string }>;
  searchParams: Promise<{ orderId?: string }>;
};

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: SuccessPageProps) {
  const { storeSlug } = await params;
  const { orderId } = await searchParams;

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-4">Order Submitted Successfully</h1>

      <p className="mb-4">
        Thank you. Your order has been received successfully.
      </p>

      {orderId && (
        <p className="mb-6 text-sm text-slate-600">
          Order ID: {orderId}
        </p>
      )}

      <div className="flex gap-4">
        <Link
          href={`/${storeSlug}`}
          className="rounded-lg border px-4 py-2"
        >
          Back to Store
        </Link>

        <Link
          href={`/${storeSlug}/products`}
          className="rounded-lg border px-4 py-2"
        >
          Continue Shopping
        </Link>
      </div>
    </main>
  );
}