import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getCurrentUser } from "@/lib/auth/getSession";

export default async function RetailerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "RETAILER") {
    redirect("/login");
  }

  const status = user.retailerProfile?.status;

  const headerStore = await headers();
  const pathname = headerStore.get("x-pathname") || "";

  // IMPORTANT: this must come before the APPROVED check.
  if (status === "DEACTIVATED") {
    if (pathname !== "/retailer/deactivated") {
      redirect("/retailer/deactivated");
    }

    return <>{children}</>;
  }

  if (status !== "APPROVED") {
    redirect(
      `/application-status?email=${encodeURIComponent(user.email)}`
    );
  }

  return <>{children}</>;
}