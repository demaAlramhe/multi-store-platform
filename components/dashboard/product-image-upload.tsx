"use client";

import { useState } from "react";

type ProductImageUploadProps = {
  value: string;
  onChange: (url: string) => void;
};

export function ProductImageUpload({
  value,
  onChange,
}: ProductImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setMessage("");

      const signResponse = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          folder: "multi-store-products",
        }),
      });

      const signResult = await signResponse.json();
      console.log("Cloudinary sign result:", signResult);

      if (!signResponse.ok) {
        setMessage(signResult.error || "Failed to prepare upload.");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signResult.apiKey);
      formData.append("timestamp", signResult.timestamp);
      formData.append("signature", signResult.signature);
      formData.append("folder", signResult.folder);

      const uploadResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${signResult.cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const uploadResult = await uploadResponse.json();
      console.log("Cloudinary upload result:", uploadResult);

      if (!uploadResponse.ok) {
        setMessage(uploadResult.error?.message || "Upload failed.");
        return;
      }

      if (!uploadResult.secure_url) {
        setMessage("Upload finished but no image URL was returned.");
        return;
      }

      onChange(uploadResult.secure_url);
      setMessage("Image uploaded successfully.");
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      setMessage("Something went wrong while uploading the image.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1 block font-medium">Product Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full rounded-lg border px-3 py-2"
        />
      </div>

      {uploading && <p className="text-sm text-slate-600">Uploading image...</p>}
      {message && <p className="text-sm text-slate-600">{message}</p>}

      {value && (
        <div className="space-y-2">
          <img
            src={value}
            alt="Uploaded product"
            className="h-40 w-40 rounded-lg border object-cover"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="rounded-lg border px-3 py-2 text-sm"
          >
            Remove Image
          </button>
        </div>
      )}
    </div>
  );
}