import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { Card } from "@/components/ui/card";
import { createAdminClient } from "../../../../lib/supabase/admin";
import { AdminEditStoreForm } from "@/components/admin/admin-edit-store-form";

export const dynamic = "force-dynamic";

type AdminStorePageProps = {
  params: Promise<{ storeId: string }>;
};

export default async function AdminStorePage({ params }: AdminStorePageProps) {
  const { storeId } = await params;
  const supabase = createAdminClient();

  const { data: store, error } = await supabase
    .from("stores")
    .select("*")
    .eq("id", storeId)
    .single();

  if (error || !store) {
    notFound();
  }

  return (
    <AppShell
      title={`Store: ${store.name}`}
      subtitle="View and edit store details"
    >
      <Card>
        <AdminEditStoreForm
          store={{
            id: store.id,
            name: store.name ?? "",
            slug: store.slug ?? "",
            logoUrl: store.logo_url ?? "",
            bannerUrl: store.banner_url ?? "",
            primaryColor: store.primary_color ?? "#111827",
            secondaryColor: store.secondary_color ?? "#f59e0b",
            phone: store.phone ?? "",
            email: store.email ?? "",
            address: store.address ?? "",
            status: store.status ?? "active",
          }}
        />
      </Card>
    </AppShell>
  );
}