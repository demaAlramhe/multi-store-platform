import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { StoreSettingsForm } from "../../../components/dashboard/store-settings-form";

export const dynamic = "force-dynamic";

export default async function DashboardSettingsPage() {
  const current = await getCurrentProfile();

  if (!current) {
    redirect("/auth/login");
  }

  if (!current.profile?.store_id) {
    return (
      <main className="p-8">
        <h1 className="mb-6 text-3xl font-bold">Store Settings</h1>
        <p>No store is linked to this account.</p>
      </main>
    );
  }

  const supabase = await createClient();

  const { data: store, error } = await supabase
    .from("stores")
    .select("*")
    .eq("id", current.profile.store_id)
    .single();

  if (error || !store) {
    return (
      <main className="p-8">
        <h1 className="mb-6 text-3xl font-bold">Store Settings</h1>
        <p>Could not load store settings.</p>
      </main>
    );
  }

  return (
    <main className="p-8">
      <h1 className="mb-6 text-3xl font-bold">Store Settings</h1>

      <StoreSettingsForm
        store={{
          id: store.id,
          name: store.name ?? "",
          logoUrl: store.logo_url ?? "",
          bannerUrl: store.banner_url ?? "",
          primaryColor: store.primary_color ?? "#111827",
          secondaryColor: store.secondary_color ?? "#f59e0b",
          phone: store.phone ?? "",
          email: store.email ?? "",
          address: store.address ?? "",
        }}
      />
    </main>
  );
}