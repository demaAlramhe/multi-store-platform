import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";

export default async function AuthRedirectPage() {
  const current = await getCurrentProfile();

  if (!current) {
    redirect("/auth/login");
  }

  if (!current.profile) {
    redirect("/dashboard");
  }

  if (current.profile.role === "super_admin") {
    redirect("/admin/stores");
  }

  if (current.profile.role === "store_owner") {
    redirect("/dashboard");
  }

  redirect("/dashboard");
}