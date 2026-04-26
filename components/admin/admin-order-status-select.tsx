"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type AdminOrderStatusSelectProps = {
  orderId: string;
  currentStatus: string | null;
};

export function AdminOrderStatusSelect({
  orderId,
  currentStatus,
}: AdminOrderStatusSelectProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus ?? "pending");
  const [loading, setLoading] = useState(false);

  async function handleChange(nextStatus: string) {
    setStatus(nextStatus);

    try {
      setLoading(true);

      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: nextStatus,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Failed to update order status.");
        setStatus(currentStatus ?? "pending");
        return;
      }

      router.refresh();
    } catch (error) {
      alert("Something went wrong while updating order status.");
      setStatus(currentStatus ?? "pending");
    } finally {
      setLoading(false);
    }
  }

  return (
    <select
      value={status}
      onChange={(e) => handleChange(e.target.value)}
      disabled={loading}
      className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
    >
      <option value="pending">pending</option>
      <option value="confirmed">confirmed</option>
      <option value="completed">completed</option>
      <option value="cancelled">cancelled</option>
    </select>
  );
}