import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";

export default function AdminStoresPage() {
  return (
    <AppShell
      title="Manage Stores"
      subtitle="Super admin view for all tenant stores in the platform"
    >
      <Card>
        <p className="text-sm text-slate-700">
          Render all stores here. Restrict this route to users with `super_admin` role.
        </p>
      </Card>
    </AppShell>
  );
}
