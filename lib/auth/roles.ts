// Edge-safe (no Prisma) — imported by middleware, layouts and route guards.

export const STAFF_ROLES = ["ADMIN", "SUPER_ADMIN", "OPERATIONS_MANAGER"] as const;
export const ADMIN_AREA_ROLES = [...STAFF_ROLES, "VENDOR"] as const;

// The only /admin pages a VENDOR may open. Must match SHARED_LINKS in AdminSidebar.tsx.
// Everything else under /admin is staff-only.
export const VENDOR_ALLOWED_ADMIN_PATHS = [
  "/admin/products",
  "/admin/warehouses",
  "/admin/orders",
  "/admin/sample-call-requests",
  "/admin/profile",
];

export function isStaffRole(role: string | undefined | null): boolean {
  return !!role && (STAFF_ROLES as readonly string[]).includes(role);
}

export function canAccessAdminPath(role: string | undefined | null, pathname: string): boolean {
  if (isStaffRole(role)) return true;
  if (role === "VENDOR") {
    const path = pathname.replace(/\/+$/, "") || "/";
    return VENDOR_ALLOWED_ADMIN_PATHS.some((p) => path === p || path.startsWith(p + "/"));
  }
  return false;
}