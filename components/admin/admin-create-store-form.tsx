"use client";

import { useState } from "react";

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

export function AdminCreateStoreForm() {
  const [storeName, setStoreName] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [ownerFullName, setOwnerFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (
      !storeName.trim() ||
      !storeSlug.trim() ||
      !ownerEmail.trim() ||
      !ownerPassword.trim() ||
      !ownerFullName.trim()
    ) {
      setMessage("Store name, store slug, owner name, owner email, and password are required.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/admin/stores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storeName: storeName.trim(),
          storeSlug: normalizeSlug(storeSlug),
          ownerEmail: ownerEmail.trim(),
          ownerPassword,
          ownerFullName: ownerFullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
          address: address.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "Failed to create store.");
        return;
      }

      setMessage("Store and owner created successfully.");

      setStoreName("");
      setStoreSlug("");
      setOwnerEmail("");
      setOwnerPassword("");
      setOwnerFullName("");
      setPhone("");
      setEmail("");
      setAddress("");
    } catch (error) {
      setMessage("Something went wrong while creating the store.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-4">
      <div>
        <label className="mb-1 block font-medium">Store Name</label>
        <input
          type="text"
          value={storeName}
          onChange={(e) => setStoreName(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Store name"
        />
      </div>

      <div>
        <label className="mb-1 block font-medium">Store Slug</label>
        <input
          type="text"
          value={storeSlug}
          onChange={(e) => setStoreSlug(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          placeholder="store-slug"
        />
      </div>

      <div>
        <label className="mb-1 block font-medium">Owner Full Name</label>
        <input
          type="text"
          value={ownerFullName}
          onChange={(e) => setOwnerFullName(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Owner full name"
        />
      </div>

      <div>
        <label className="mb-1 block font-medium">Owner Email</label>
        <input
          type="email"
          value={ownerEmail}
          onChange={(e) => setOwnerEmail(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          placeholder="owner@email.com"
        />
      </div>

      <div>
        <label className="mb-1 block font-medium">Owner Password</label>
        <input
          type="password"
          value={ownerPassword}
          onChange={(e) => setOwnerPassword(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Password"
        />
      </div>

      <div>
        <label className="mb-1 block font-medium">Store Phone</label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Store phone"
        />
      </div>

      <div>
        <label className="mb-1 block font-medium">Store Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Store email"
        />
      </div>

      <div>
        <label className="mb-1 block font-medium">Store Address</label>
        <textarea
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
          rows={3}
          placeholder="Store address"
        />
      </div>

      {message && <p className="text-sm text-slate-600">{message}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Store"}
      </button>
    </form>
  );
}