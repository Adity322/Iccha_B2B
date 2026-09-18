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
  Store,
  ReceiptText,
  ExternalLink,
  UserCog,
  UserCircle,
  Menu,
  X,
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab?: string;
}

interface NavLink {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const STAFF_ONLY_LINKS: NavLink[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Hero Banners', href: '/admin/hero', icon: Sparkles, badge: 'WebGL' },
  { label: 'Retailers', href: '/admin/retailers', icon: Users },
  { label: 'Vendors', href: '/admin/vendors', icon: Store },
  { label: 'KYC Applications', href: '/admin/kyc', icon: FileCheck, badge: '2 Pending' },
  { label: 'Role Management', href: '/admin/roles', icon: UserCog },
];

const SHARED_LINKS: NavLink[] = [
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Warehouses', href: '/admin/warehouses', icon: Boxes },
  { label: 'Order Enquiries', href: '/admin/orders', icon: ShoppingBag },
  { label: 'My Profile', href: '/admin/profile', icon: UserCircle },
];

const STAFF_ONLY_TRAILING_LINKS: NavLink[] = [
  { label: 'Categories & GST', href: '/admin/categories', icon: FolderTree },
  { label: 'Inventory & Sets', href: '/admin/inventory', icon: Boxes },
  { label: 'MOQ Rules', href: '/admin/moq-rules', icon: Sliders },
  { label: 'Billing & Settings', href: '/admin/settings', icon: ReceiptText },
];

export default function AdminSidebar({ activeTab }: AdminSidebarProps = {}) {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/auth/me', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled && json.success) {
          setRole(json.data.role);
        }
      })
      .catch(() => {
        if (!cancelled) setRole(null);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadNewOrderCount() {
      try {
        const res = await fetch('/api/admin/order-enquiries/new-count', {
          cache: 'no-store',
        });
        const json = await res.json();

        if (!cancelled && res.ok && json.success) {
          setNewOrderCount(Number(json.count ?? 0));
        }
      } catch {
        if (!cancelled) setNewOrderCount(0);
      }
    }

    loadNewOrderCount();

    const interval = window.setInterval(loadNewOrderCount, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isVendor = role === 'VENDOR';

  const navLinks: NavLink[] = isVendor
    ? SHARED_LINKS
    : [...STAFF_ONLY_LINKS, ...SHARED_LINKS, ...STAFF_ONLY_TRAILING_LINKS];

  const getBadge = (item: NavLink) => {
    if (item.href === '/admin/orders') {
      return newOrderCount > 0 ? `${newOrderCount} New` : null;
    }

    return item.badge ?? null;
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
        className="lg:hidden fixed top-4 left-4 z-40 w-10 h-10 rounded-xl bg-stone-950 text-white border border-stone-800 shadow-lg flex items-center justify-center"
      >
        <Menu className="w-5 h-5" />
      </button>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/60"
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 min-h-screen shrink-0
          bg-stone-950 text-stone-300
          flex flex-col border-r border-stone-800
          transition-transform duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-5 border-b border-stone-800 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <Link
              href={isVendor ? '/admin/products' : '/admin'}
              className="flex items-center gap-3 min-w-0"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-600 to-amber-600 text-white flex items-center justify-center font-serif text-xl font-bold shadow-lg shrink-0">
                इ
              </div>

              <div className="min-w-0">
                <span className="font-serif text-lg tracking-tight text-white font-bold block leading-none truncate">
                  ICCHA<span className="text-rose-500 font-normal">ADMIN</span>
                </span>
                <span className="text-[10px] tracking-wider uppercase text-amber-400 font-semibold block mt-1">
                  {isVendor ? 'Vendor Portal' : 'Wholesale Operations'}
                </span>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
              className="lg:hidden w-8 h-8 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 flex items-center justify-center shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <div className="text-[10px] uppercase font-bold tracking-wider text-stone-400 px-3 mb-2">
            {isVendor ? 'My Catalogue' : 'Management & Verification'}
          </div>

          {navLinks.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href));

            const Icon = item.icon;
            const badge = getBadge(item);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center justify-between gap-3
                  px-3 py-2.5 rounded-lg text-xs font-medium transition
                  ${
                    isActive
                      ? 'bg-rose-950/80 text-rose-300 font-semibold border border-rose-800/60 shadow-sm'
                      : 'text-stone-300 hover:bg-stone-900 hover:text-white'
                  }
                `}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-rose-400' : 'text-stone-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {badge && (
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-amber-500/40 shrink-0 whitespace-nowrap">
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-stone-800 bg-stone-900/60 space-y-2 shrink-0">
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
    </>
  );
}
