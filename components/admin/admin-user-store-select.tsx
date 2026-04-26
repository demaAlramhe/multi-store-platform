"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type StoreOption = {
  id: string;
  name: string;
  slug: string;
};

type AdminUserStoreSelectProps = {
  userId: string;
  currentStoreId: string | null;
  currentRole: string | null;
  stores: StoreOption[];
};

export function AdminUserStoreSelect({
  userId,
  currentStoreId,
  currentRole,
  stores,
}: AdminUserStoreSelectProps) {
  const router = useRouter();
  const [storeId, setStoreId] = useState(currentStoreId ?? "");
  const [loading, setLoading] = useState(false);

  async function handleChange(nextStoreId: string) {
    setStoreId(nextStoreId);

    try {
      setLoading(true);

      const response = await fetch(`/api/admin/users/${userId}/store`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storeId: nextStoreId || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Failed to update assigned store.");
        setStoreId(currentStoreId ?? "");
        return;
      }

      router.refresh();
    } catch (error) {
      alert("Something went wrong while updating the store assignment.");
      setStoreId(currentStoreId ?? "");
    } finally {
      setLoading(false);
    }
  }

  const disabled = loading || currentRole === "super_admin";

  return (
    <select
      value={storeId}
      onChange={(e) => handleChange(e.target.value)}
      disabled={disabled}
      className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
    >
      <option value="">No store</option>
      {stores.map((store) => (
        <option key={store.id} value={store.id}>
          {store.name} ({store.slug})
        </option>
      ))}
    </select>
  );
}