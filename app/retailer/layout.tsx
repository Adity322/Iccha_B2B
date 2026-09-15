import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getSession";

export default async function RetailerLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "RETAILER") {
    redirect("/login");
  }

  if (user.retailerProfile?.status !== "APPROVED") {
    redirect(`/application-status?email=${encodeURIComponent(user.email)}`);
  }

  return <>{children}</>;
}