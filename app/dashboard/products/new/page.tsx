import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { NewProductForm } from "@/components/dashboard/new-product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const current = await getCurrentProfile();

  if (!current) {
    redirect("/auth/login");
  }

  if (!current.profile?.store_id) {
    return (
      <main className="p-8">
        <h1 className="mb-6 text-3xl font-bold">Add New Product</h1>
        <p>No store is linked to this account.</p>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="mb-6 text-3xl font-bold">Add New Product</h1>
      <NewProductForm />
    </main>
  );
}