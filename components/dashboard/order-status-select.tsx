"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type OrderStatusSelectProps = {
  orderId: string;
  currentStatus: string;
};

const statuses = ["pending", "confirmed", "completed", "cancelled"];

export function OrderStatusSelect({
  orderId,
  currentStatus,
}: OrderStatusSelectProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleChange(newStatus: string) {
    setStatus(newStatus);
    setMessage("");

    try {
      setLoading(true);

      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "Failed to update status.");
        return;
      }

      setMessage("Status updated successfully.");
      router.refresh();
    } catch (error) {
      setMessage("Something went wrong while updating status.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block font-medium">Order Status</label>
        <select
          value={status}
          onChange={(e) => handleChange(e.target.value)}
          disabled={loading}
          className="rounded-lg border px-3 py-2"
        >
          {statuses.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      {message && <p className="text-sm text-slate-600">{message}</p>}
    </div>
  );
}