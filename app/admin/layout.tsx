import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getCurrentUser } from "@/lib/auth/getSession";
import { ADMIN_AREA_ROLES, canAccessAdminPath } from "@/lib/auth/roles";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Uses the role stored in the DB, not the (up to 7-day-old) role inside the JWT.
  if (!(ADMIN_AREA_ROLES as readonly string[]).includes(user.role)) {
    redirect("/login");
  }

  const pathname = (await headers()).get("x-pathname") ?? "/admin";
  if (!canAccessAdminPath(user.role, pathname)) {
    redirect("/admin/products");
  }

  return <>{children}</>;
}