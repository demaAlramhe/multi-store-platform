export type AppRole = "super_admin" | "store_owner" | "store_staff" | "customer";

export type AppUser = {
  id: string;
  email: string;
  role: AppRole;
  storeId: string | null;
};
