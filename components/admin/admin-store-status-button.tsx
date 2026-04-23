"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type AdminStoreStatusButtonProps = {
  storeId: string;
  currentStatus: string | null;
};

export function AdminStoreStatusButton({
  storeId,
  currentStatus,
}: AdminStoreStatusButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const nextStatus =
    currentStatus === "active"
      ? "inactive"
      : currentStatus === "inactive"
      ? "active"
      : "active";

  async function handleToggle() {
    try {
      setLoading(true);

      const response = await fetch(`/api/admin/stores/${storeId}/status`, {
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
        alert(result.error || "Failed to update store status.");
        return;
      }

      router.refresh();
    } catch (error) {
      alert("Something went wrong while updating store status.");
    } finally {
      setLoading(false);
    }
  }

  async function handleArchive() {
    const confirmed = window.confirm(
      "Are you sure you want to archive this store?"
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const response = await fetch(`/api/admin/stores/${storeId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "archived",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Failed to archive store.");
        return;
      }

      router.refresh();
    } catch (error) {
      alert("Something went wrong while archiving the store.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={handleToggle}
        disabled={loading || currentStatus === "archived"}
        className="rounded-lg border px-4 py-2 font-medium disabled:opacity-50"
      >
        {loading
          ? "Updating..."
          : currentStatus === "active"
          ? "Set Inactive"
          : currentStatus === "inactive"
          ? "Set Active"
          : "Archived"}
      </button>

      {currentStatus !== "archived" && (
        <button
          type="button"
          onClick={handleArchive}
          disabled={loading}
          className="rounded-lg border border-red-300 px-4 py-2 font-medium text-red-600 disabled:opacity-50"
        >
          Archive
        </button>
      )}
    </div>
  );
}