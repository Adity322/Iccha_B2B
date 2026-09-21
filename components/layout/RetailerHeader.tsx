'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShoppingBag,
  FileCheck2,
  FileText,
  User,
  LogOut,
  Menu,
  X,
  Building2,
  ShieldCheck,
  Package,
  ChevronDown,
  Layers,
  PhoneCall,
  LayoutDashboard,
  UserCircle,
  CreditCard,
} from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';

const navItems = [
  {
    label: 'Catalogue',
    href: '/retailer/catalogue',
    icon: Layers,
  },
  {
    label: 'Categories',
    href: '/categories',
    icon: Package,
  },
  {
    label: 'Orders',
    href: '/retailer/orders',
    icon: FileCheck2,
  },
  {
    label: 'Sample Calls',
    href: '/retailer/sample-call-requests',
    icon: PhoneCall,
  },
  {
    label: 'Estimates',
    href: '/retailer/estimates',
    icon: FileText,
  },
];

export default function RetailerHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const {
    cart,
    setRole,
    setCurrentRetailer,
    addToast,
  } = useApp();

  // Real logged-in retailer, from the session (not the demo/mock context)
  const [account, setAccount] = useState<{
    businessName: string | null;
    name: string | null;
    email: string | null;
    gstin: string | null;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/me', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (cancelled || !json.success) return;
        setAccount({
          businessName: json.data.retailerBusinessName ?? null,
          name: json.data.name ?? null,
          email: json.data.email ?? null,
          gstin: json.data.retailerGstin ?? null,
        });
      })
      .catch(() => {
        // Header falls back to generic "Retailer Account" text.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const currentRetailer = account;

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const cartCount = cart?.items?.length || 0;

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    setMobileNavOpen(false);

    try {
      // Actually end the server session (clears the httpOnly cookie)
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Continue clearing local state even if the request fails.
    }

    setRole('public');
    setCurrentRetailer(null);

    addToast?.({ type: 'success', title: 'Logged out successfully', message: '' });

    router.push('/');
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === '/categories') {
      return pathname === href || pathname.startsWith('/categories/');
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const closeMobileMenu = () => {
    setMobileNavOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[#171717] text-[#f8f5ef] border-b border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.18)]">
        {/* =========================================================
    TOP STATUS BAR
========================================================= */}
        <div className="border-b border-white/[0.06] bg-[#111111]">
          <div className="mx-auto flex h-9 max-w-[1400px] items-center justify-end px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 text-[9px] uppercase tracking-[0.14em]">

              {/* GST */}
              {currentRetailer?.gstin && (
                <div className="flex items-center gap-2 text-stone-500">
                  <span>GSTIN</span>

                  <span className="text-stone-300">
                    {currentRetailer.gstin}
                  </span>
                </div>
              )}

              <span className="h-3 w-px bg-white/10" />

              {/* VERIFIED ACCOUNT */}
              <div className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck size={12} strokeWidth={1.8} />

                <span>Verified Account</span>
              </div>
            </div>
          </div>
        </div>
        {/* =========================================================
            MAIN NAVBAR
        ========================================================= */}
        <div className="mx-auto flex h-[72px] max-w-[1400px] items-center px-4 sm:px-6 lg:px-8">
          {/* LOGO */}
          <Link
            href="/retailer/catalogue"
            onClick={closeMobileMenu}
            className="group flex shrink-0 items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center border border-amber-400/30 bg-amber-400/[0.07] text-lg font-serif text-amber-300 transition-all duration-300 group-hover:border-amber-300/60 group-hover:bg-amber-400/10">
              इ
            </div>

            <div className="hidden sm:block leading-none">
              <div className="font-serif text-[15px] font-semibold tracking-[0.14em] text-[#f9f7f2]">
                ICCHA
                <span className="ml-1 text-amber-300">STORE</span>
              </div>

              <div className="mt-1.5 text-[7px] font-medium tracking-[0.3em] text-stone-500">
                B2B ARCHIVE
              </div>
            </div>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="ml-8 hidden h-full items-center lg:flex">
            <div className="flex h-full items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative flex h-full items-center gap-2 px-3.5 text-[10px] font-medium uppercase tracking-[0.13em] transition-colors duration-200 ${active
                        ? 'text-amber-300'
                        : 'text-stone-400 hover:text-stone-100'
                      }`}
                  >
                    <Icon
                      size={14}
                      strokeWidth={1.6}
                      className={`transition-colors ${active
                          ? 'text-amber-300'
                          : 'text-stone-500 group-hover:text-stone-300'
                        }`}
                    />

                    <span>{item.label}</span>

                    <span
                      className={`absolute bottom-0 left-3 right-3 h-px bg-amber-300 transition-all duration-300 ${active
                          ? 'opacity-100'
                          : 'opacity-0 group-hover:opacity-40'
                        }`}
                    />
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* RIGHT ACTIONS */}
          <div className="ml-auto flex items-center gap-2">
            {/* CART */}
            <Link
              href="/retailer/cart"
              className={`group relative flex h-10 items-center gap-2.5 rounded-sm border px-3.5 transition-all duration-200 ${pathname.startsWith('/retailer/cart')
                  ? 'border-amber-300/40 bg-amber-300/[0.08] text-amber-300'
                  : 'border-white/10 text-stone-400 hover:border-white/20 hover:bg-white/[0.04] hover:text-white'
                }`}
            >
              <div className="relative">
                <ShoppingBag
                  size={17}
                  strokeWidth={1.7}
                />

                {cartCount > 0 && (
                  <span className="absolute -right-2.5 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-300 px-1 text-[8px] font-bold text-[#171717]">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>

              <span className="hidden xl:block text-[9px] font-medium uppercase tracking-[0.14em]">
                Cart
              </span>
            </Link>

            {/* DIVIDER */}
            <div className="mx-1 hidden h-7 w-px bg-white/[0.08] sm:block" />

            {/* PROFILE */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setUserDropdownOpen((prev) => !prev)
                }
                className={`flex h-10 items-center gap-2.5 rounded-sm border px-2.5 transition-all duration-200 ${userDropdownOpen
                    ? 'border-white/20 bg-white/[0.07]'
                    : 'border-transparent hover:border-white/10 hover:bg-white/[0.04]'
                  }`}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-stone-700 text-[10px] font-semibold text-stone-200 ring-1 ring-white/10">
                  {(
                    currentRetailer?.businessName ||
                    currentRetailer?.name ||
                    'R'
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="hidden text-left xl:block">
                  <p className="max-w-[130px] truncate text-[10px] font-medium text-stone-200">
                    {currentRetailer?.businessName ||
                      currentRetailer?.name ||
                      'Retailer Account'}
                  </p>

                  <p className="mt-0.5 text-[8px] uppercase tracking-[0.12em] text-emerald-400">
                    Approved Retailer
                  </p>
                </div>

                <ChevronDown
                  size={14}
                  className={`hidden text-stone-500 transition-transform duration-200 sm:block ${userDropdownOpen ? 'rotate-180' : ''
                    }`}
                />
              </button>

              {/* PROFILE DROPDOWN */}
              {userDropdownOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Close profile menu"
                    onClick={() => setUserDropdownOpen(false)}
                    className="fixed inset-0 z-40 cursor-default"
                  />

                  <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-72 overflow-hidden rounded-sm border border-white/10 bg-[#202020] shadow-2xl">
                    {/* PROFILE HEADER */}
                    <div className="border-b border-white/[0.07] bg-[#191919] p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-stone-700 text-sm font-semibold text-stone-200 ring-1 ring-white/10">
                          {(
                            currentRetailer?.businessName ||
                            currentRetailer?.name ||
                            'R'
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white">
                            {currentRetailer?.businessName ||
                              currentRetailer?.name ||
                              'Retailer Account'}
                          </p>

                          {currentRetailer?.email && (
                            <p className="mt-1 truncate text-[10px] text-stone-500">
                              {currentRetailer.email}
                            </p>
                          )}

                          <div className="mt-2 inline-flex items-center gap-1.5 text-[8px] uppercase tracking-[0.13em] text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            Approved Retailer
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* PROFILE LINKS */}
                    <div className="p-2">
                      <Link
                        href="/retailer"
                        onClick={() =>
                          setUserDropdownOpen(false)
                        }
                        className="group flex items-center gap-3 rounded-sm px-3 py-2.5 text-stone-400 transition-colors hover:bg-white/[0.05] hover:text-white"
                      >
                        <LayoutDashboard
                          size={15}
                          className="text-stone-500 group-hover:text-amber-300"
                        />

                        <span className="text-[10px] uppercase tracking-[0.1em]">
                          Dashboard
                        </span>
                      </Link>

                      <Link
                        href="/retailer/profile"
                        onClick={() =>
                          setUserDropdownOpen(false)
                        }
                        className="group flex items-center gap-3 rounded-sm px-3 py-2.5 text-stone-400 transition-colors hover:bg-white/[0.05] hover:text-white"
                      >
                        <UserCircle
                          size={15}
                          className="text-stone-500 group-hover:text-amber-300"
                        />

                        <span className="text-[10px] uppercase tracking-[0.1em]">
                          Business Profile
                        </span>
                      </Link>

                      <Link
                        href="/retailer/kyc"
                        onClick={() =>
                          setUserDropdownOpen(false)
                        }
                        className="group flex items-center gap-3 rounded-sm px-3 py-2.5 text-stone-400 transition-colors hover:bg-white/[0.05] hover:text-white"
                      >
                        <CreditCard
                          size={15}
                          className="text-stone-500 group-hover:text-amber-300"
                        />

                        <span className="text-[10px] uppercase tracking-[0.1em]">
                          KYC Details
                        </span>
                      </Link>
                    </div>

                    {/* LOGOUT */}
                    <div className="border-t border-white/[0.07] p-2">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="group flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-stone-500 transition-colors hover:bg-red-500/[0.06] hover:text-red-300"
                      >
                        <LogOut
                          size={15}
                          className="group-hover:text-red-300"
                        />

                        <span className="text-[10px] uppercase tracking-[0.1em]">
                          Sign Out
                        </span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* MOBILE MENU BUTTON */}
            <button
              type="button"
              onClick={() =>
                setMobileNavOpen((prev) => !prev)
              }
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-sm border border-white/10 text-stone-300 transition-colors hover:bg-white/[0.05] hover:text-white lg:hidden"
              aria-label={
                mobileNavOpen
                  ? 'Close navigation'
                  : 'Open navigation'
              }
            >
              {mobileNavOpen ? (
                <X size={19} strokeWidth={1.7} />
              ) : (
                <Menu size={19} strokeWidth={1.7} />
              )}
            </button>
          </div>
        </div>

        {/* =========================================================
            MOBILE NAVIGATION
        ========================================================= */}
        {mobileNavOpen && (
          <div className="border-t border-white/[0.07] bg-[#191919] lg:hidden">
            <div className="mx-auto max-w-[1400px] px-4 py-4 sm:px-6">
              {/* MOBILE ACCOUNT SUMMARY */}
              <div className="mb-3 flex items-center gap-3 border-b border-white/[0.07] pb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-stone-700 text-xs font-semibold text-stone-200">
                  {(
                    currentRetailer?.businessName ||
                    currentRetailer?.name ||
                    'R'
                  )
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-stone-200">
                    {currentRetailer?.businessName ||
                      currentRetailer?.name ||
                      'Retailer Account'}
                  </p>

                  <div className="mt-1 flex items-center gap-1.5 text-[8px] uppercase tracking-[0.12em] text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Verified Account
                  </div>
                </div>
              </div>

              {/* MOBILE NAV ITEMS */}
              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMobileMenu}
                      className={`flex items-center gap-3 rounded-sm px-3.5 py-3 transition-colors ${active
                          ? 'bg-amber-300/[0.08] text-amber-300'
                          : 'text-stone-400 hover:bg-white/[0.04] hover:text-white'
                        }`}
                    >
                      <Icon
                        size={17}
                        strokeWidth={1.6}
                      />

                      <span className="text-[10px] font-medium uppercase tracking-[0.14em]">
                        {item.label}
                      </span>

                      {active && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-300" />
                      )}
                    </Link>
                  );
                })}

                {/* MOBILE CART */}
                <Link
                  href="/retailer/cart"
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 rounded-sm px-3.5 py-3 transition-colors ${pathname.startsWith('/retailer/cart')
                      ? 'bg-amber-300/[0.08] text-amber-300'
                      : 'text-stone-400 hover:bg-white/[0.04] hover:text-white'
                    }`}
                >
                  <ShoppingBag
                    size={17}
                    strokeWidth={1.6}
                  />

                  <span className="text-[10px] font-medium uppercase tracking-[0.14em]">
                    Wholesale Cart
                  </span>

                  {cartCount > 0 && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-300 px-1.5 text-[8px] font-bold text-[#171717]">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>
              </div>

              {/* MOBILE ACCOUNT LINKS */}
              <div className="mt-4 border-t border-white/[0.07] pt-4">
                <p className="mb-2 px-3 text-[8px] uppercase tracking-[0.2em] text-stone-600">
                  Account
                </p>

                <div className="space-y-1">
                  <Link
                    href="/retailer"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 rounded-sm px-3.5 py-2.5 text-stone-500 transition-colors hover:bg-white/[0.04] hover:text-stone-200"
                  >
                    <LayoutDashboard size={15} />

                    <span className="text-[9px] uppercase tracking-[0.12em]">
                      Dashboard
                    </span>
                  </Link>

                  <Link
                    href="/retailer/profile"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 rounded-sm px-3.5 py-2.5 text-stone-500 transition-colors hover:bg-white/[0.04] hover:text-stone-200"
                  >
                    <UserCircle size={15} />

                    <span className="text-[9px] uppercase tracking-[0.12em]">
                      Business Profile
                    </span>
                  </Link>

                  <Link
                    href="/retailer/kyc"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 rounded-sm px-3.5 py-2.5 text-stone-500 transition-colors hover:bg-white/[0.04] hover:text-stone-200"
                  >
                    <CreditCard size={15} />

                    <span className="text-[9px] uppercase tracking-[0.12em]">
                      KYC Details
                    </span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-sm px-3.5 py-2.5 text-stone-500 transition-colors hover:bg-red-500/[0.06] hover:text-red-300"
                  >
                    <LogOut size={15} />

                    <span className="text-[9px] uppercase tracking-[0.12em]">
                      Sign Out
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}