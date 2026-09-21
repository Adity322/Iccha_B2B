'use client';

import React, { createContext, useContext } from 'react';

// Role comes from the server layout (DB role), so the sidebar knows it on the
// very first render and never flashes the full staff menu to a vendor.
const AdminRoleContext = createContext<string | null>(null);

export function AdminRoleProvider({
  role,
  children,
}: {
  role: string;
  children: React.ReactNode;
}) {
  return <AdminRoleContext.Provider value={role}>{children}</AdminRoleContext.Provider>;
}

export function useAdminRole(): string | null {
  return useContext(AdminRoleContext);
}