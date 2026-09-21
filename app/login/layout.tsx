import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getSession";
import { isStaffRole } from "@/lib/auth/roles";


export default async function LoginLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (user) {
    if (isStaffRole(user.role)) {
      redirect("/admin");
    }

    if (user.role === "VENDOR") {
      redirect("/admin/products");
    }

    if (user.role === "RETAILER") {
      if (user.retailerProfile?.status === "APPROVED") {
        redirect("/retailer/catalogue");
      }
      redirect(`/application-status?email=${encodeURIComponent(user.email)}`);
    }
  }

  return <>{children}</>;
}