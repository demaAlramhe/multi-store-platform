"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProductImageUpload } from "@/components/dashboard/product-image-upload";

type AdminEditStoreFormProps = {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string;
    bannerUrl: string;
    primaryColor: string;
    secondaryColor: string;
    phone: string;
    email: string;
    address: string;
    status: string;
  };
};

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

export function AdminEditStoreForm({ store }: AdminEditStoreFormProps) {
  const router = useRouter();

  const [name, setName] = useState(store.name);
  const [slug, setSlug] = useState(store.slug);
  const [logoUrl, setLogoUrl] = useState(store.logoUrl);
  const [bannerUrl, setBannerUrl] = useState(store.bannerUrl);
  const [primaryColor, setPrimaryColor] = useState(store.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(store.secondaryColor);
  const [phone, setPhone] = useState(store.phone);
  const [email, setEmail] = useState(store.email);
  const [address, setAddress] = useState(store.address);
  const [status, setStatus] = useState(store.status);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!name.trim() || !slug.trim()) {
      setMessage("Store name and slug are required.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`/api/admin/stores/${store.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          slug: normalizeSlug(slug),
          logoUrl,
          bannerUrl,
          primaryColor,
          secondaryColor,
          phone,
          email,
          address,
          status,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setMessage(result.error || "Failed to update store.");
        return;
      }

      setMessage("Store updated successfully.");
      router.refresh();
    } catch (error) {
      setMessage("Something went wrong while updating the store.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="mb-1 block font-medium">Store Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block font-medium">Slug</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <p className="mb-2 font-medium">Logo</p>
          <ProductImageUpload value={logoUrl} onChange={setLogoUrl} />
        </div>

        <div>
          <p className="mb-2 font-medium">Banner</p>
          <ProductImageUpload value={bannerUrl} onChange={setBannerUrl} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-1 block font-medium">Primary Color</label>
          <input
            type="color"
            value={primaryColor}
            onChange={(e) => setPrimaryColor(e.target.value)}
            className="h-12 w-full rounded-lg border px-2 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">Secondary Color</label>
          <input
            type="color"
            value={secondaryColor}
            onChange={(e) => setSecondaryColor(e.target.value)}
            className="h-12 w-full rounded-lg border px-2 py-2"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block font-medium">Phone</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label className="mb-1 block font-medium">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block font-medium">Address</label>
        <textarea
          rows={3}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block font-medium">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full rounded-lg border px-3 py-2"
        >
          <option value="active">active</option>
          <option value="inactive">inactive</option>
        </select>
      </div>

      {message && <p className="text-sm text-slate-600">{message}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>

        <Link
          href="/admin/stores"
          className="rounded-lg border px-4 py-2 font-medium"
        >
          Back
        </Link>
      </div>
    </form>
  );
}