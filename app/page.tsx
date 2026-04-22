import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  return (
    <AppShell
      title="Multi-Tenant Ecommerce Starter"
      subtitle="Next.js App Router + Supabase-ready architecture"
    >
      <Card>
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Start with authentication, store dashboards, and public storefronts.
          </p>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link className="font-medium text-slate-900 underline" href="/auth/login">
              Login
            </Link>
            <Link className="font-medium text-slate-900 underline" href="/dashboard">
              Dashboard
            </Link>
            <Link className="font-medium text-slate-900 underline" href="/admin/stores">
              Admin Stores
            </Link>
            <Link className="font-medium text-slate-900 underline" href="/demo-store">
              Demo Storefront
            </Link>
            <Link className="font-medium text-slate-900 underline" href="/test">
              Supabase Test
            </Link>
          </div>
        </div>
      </Card>
    </AppShell>
  );
}