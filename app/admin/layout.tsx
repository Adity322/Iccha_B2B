import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getSession";

const ADMIN_AREA_ROLES = ["ADMIN", "SUPER_ADMIN", "OPERATIONS_MANAGER", "VENDOR"];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!ADMIN_AREA_ROLES.includes(user.role)) {
    redirect("/login");
  }

  return <>{children}</>;
}