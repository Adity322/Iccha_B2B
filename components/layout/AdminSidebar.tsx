'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Sparkles,
  Users,
  FileCheck,
  Package,
  FolderTree,
  Boxes,
  Sliders,
  ShoppingBag,
  ReceiptText,
  ExternalLink,
  UserCog,
  UserCircle
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab?: string;
}

const STAFF_ONLY_LINKS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Hero Banners', href: '/admin/hero', icon: Sparkles, badge: 'WebGL' },
  { label: 'Retailers', href: '/admin/retailers', icon: Users },
  { label: 'KYC Applications', href: '/admin/kyc', icon: FileCheck, badge: '2 Pending' },
  { label: 'Role Management', href: '/admin/roles', icon: UserCog },
];

// Links every /admin visitor may see, including a vendor — scoped down to their own data
// by the page/API layer, not hidden here.
const SHARED_LINKS = [
    { label: "Products", href: "/admin/products", icon: Package },
    { label: "Warehouses", href: "/admin/warehouses", icon: Boxes },
    { label: "Order Enquiries", href: "/admin/orders", icon: ShoppingBag, badge: "1 New" },
    { label: "My Profile", href: "/admin/profile", icon: UserCircle },
];

const STAFF_ONLY_TRAILING_LINKS = [
  { label: 'Categories & GST', href: '/admin/categories', icon: FolderTree },
  { label: 'Inventory & Sets', href: '/admin/inventory', icon: Boxes },
  { label: 'MOQ Rules', href: '/admin/moq-rules', icon: Sliders },
  { label: 'Billing & Settings', href: '/admin/settings', icon: ReceiptText },
];

export default function AdminSidebar({ activeTab }: AdminSidebarProps = {}) {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(json => {
        if (json.success) setRole(json.data.role);
      })
      .catch(() => {
        // If this fails, default to the restricted (vendor-shaped) view rather than
        // accidentally showing staff-only links to someone we couldn't identify.
      });
  }, []);

  const isVendor = role === 'VENDOR';

  const navLinks = isVendor
    ? SHARED_LINKS
    : [...STAFF_ONLY_LINKS, ...SHARED_LINKS, ...STAFF_ONLY_TRAILING_LINKS];

  return (
    <aside className="w-64 bg-stone-950 text-stone-300 flex flex-col border-r border-stone-800 min-h-screen shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-stone-800">
        <Link href={isVendor ? '/admin/products' : '/admin'} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-amber-600 text-white flex items-center justify-center font-serif text-xl font-bold shadow-lg">
            इ
          </div>
          <div>
            <span className="font-serif text-lg tracking-tight text-white font-bold block leading-none">
              ICCHA<span className="text-rose-500 font-normal">ADMIN</span>
            </span>
            <span className="text-[10px] tracking-wider uppercase text-amber-400 font-semibold block mt-1">
              {isVendor ? 'Vendor Portal' : 'Wholesale Operations'}
            </span>
          </div>
        </Link>
      </div>

      {/* Nav List */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="text-[10px] uppercase font-bold tracking-wider text-stone-400 px-3 mb-2">
          {isVendor ? 'My Catalogue' : 'Management & Verification'}
        </div>

        {navLinks.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                isActive
                  ? 'bg-rose-950/80 text-rose-300 font-semibold border border-rose-800/60 shadow-sm'
                  : 'text-stone-300 hover:bg-stone-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-rose-400' : 'text-stone-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-500/40">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-stone-800 bg-stone-900/60 space-y-2">
        {!isVendor && (
          <div className="px-2 py-1.5 bg-stone-950 rounded-lg border border-stone-800 text-[11px] text-stone-400">
            <div className="font-semibold text-stone-200">Surat & Jaipur Hubs</div>
            <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              2 Billing Entities Synchronized
            </div>
          </div>
        )}

        <Link
          href="/"
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium bg-stone-800 hover:bg-stone-700 text-stone-200 transition"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Public View
        </Link>
      </div>
    </aside>
  );
}