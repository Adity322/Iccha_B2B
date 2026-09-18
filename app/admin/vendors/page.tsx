import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getSession";
import VendorManagement from "./VendorManagement";

const STAFF_ROLES = ["ADMIN", "SUPER_ADMIN", "OPERATIONS_MANAGER"];

export default async function AdminVendorsPage() {
  const user = await getCurrentUser();

  if (!user || !STAFF_ROLES.includes(user.role)) {
    redirect("/login");
  }

  return <VendorManagement />;
}
