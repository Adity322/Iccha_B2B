'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  FileCheck2, 
  FileText, 
  User, 
  LogOut, 
  Search, 
  Menu, 
  X, 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  Package, 
  ChevronDown,
  Layers
} from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';

export default function RetailerHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentRetailer, cart, setRole, setCurrentRetailer, addToast } = useApp();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLogout = () => {
    setRole('public');
    setCurrentRetailer(null);
    addToast({
      type: 'info',
      title: 'Logged Out',
      message: 'You have exited the authenticated retailer session.'
    });
    router.push('/');
  };

  const navItems = [
    { label: 'B2B Catalogue', href: '/retailer/catalogue', icon: Layers },
    { label: 'Categories', href: '/categories', icon: Package },
    { label: 'Order Enquiries', href: '/retailer/orders', icon: FileCheck2 },
    { label: 'Estimates & Proforma', href: '/retailer/estimates', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#1a1a1a] text-[#f9f7f2] border-b border-white/10 shadow-sm">
      {/* Top B2B Commercial Status Bar */}
      <div className="bg-[#111111] text-stone-300 text-xs py-1.5 px-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 bg-white/10 text-amber-300 px-2 py-0.5 text-[10px] uppercase font-bold tracking-[0.2em] border border-white/20">
              <ShieldCheck className="w-3 h-3 text-amber-300" />
              Verified Wholesale Session
            </span>
            <span className="hidden sm:inline text-stone-400 font-mono text-[11px]">
              GSTIN: <span className="text-stone-200">{currentRetailer?.gstin || '07AAECR8812M1Z4'}</span>
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="text-stone-400 hidden md:inline">
              Tier: <strong className="text-amber-300 font-normal uppercase tracking-wider">{currentRetailer?.classification || 'Tier 1 - Platinum'}</strong>
            </span>
            <Link href="/retailer/kyc" className="text-stone-300 hover:text-white transition text-[11px]">
              KYC Status: <span className="uppercase tracking-wider text-amber-400 font-bold">{currentRetailer?.status?.replace('_', ' ') || 'Approved'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Retailer Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & B2B Badge */}
          <div className="flex items-center gap-4">
            <Link href="/retailer" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#f9f7f2] text-[#1a1a1a] flex items-center justify-center font-serif text-lg font-bold border border-black/20">
                इ
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-xl tracking-tight text-white font-normal block leading-none">
                    ICCHA<span className="italic text-amber-300 font-light ml-0.5">STORE</span>
                  </span>
                  <span className="bg-white/10 text-stone-300 text-[9px] uppercase font-bold tracking-[0.25em] px-1.5 py-0.5 border border-white/20">
                    B2B ARCHIVE
                  </span>
                </div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1 ml-6 text-xs uppercase tracking-[0.2em] font-bold">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/retailer' && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 transition ${
                      isActive
                        ? 'bg-white/10 text-amber-300 border-b border-amber-300'
                        : 'text-stone-400 hover:text-[#f9f7f2]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-3">
            
            {/* Wholesale Cart Trigger */}
            <Link
              href="/retailer/cart"
              className={`relative inline-flex items-center gap-2 px-3.5 py-1.5 text-xs uppercase tracking-[0.2em] font-bold transition border ${
                pathname === '/retailer/cart'
                  ? 'bg-white text-[#1a1a1a] border-white'
                  : 'bg-transparent border-white/20 text-stone-200 hover:border-white'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Wholesale Cart</span>
              {cart.totalSets > 0 && (
                <span className="bg-amber-400 text-stone-950 text-[10px] font-bold px-1.5 py-0.2">
                  {cart.totalSets}
                </span>
              )}
            </Link>

            {/* User Account Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-stone-200 border border-white/15 text-xs font-medium transition"
                aria-expanded={userDropdownOpen}
              >
                <div className="w-5 h-5 bg-[#ded9d0] text-[#1a1a1a] flex items-center justify-center text-[10px] font-bold uppercase">
                  {currentRetailer?.applicantName?.[0] || 'R'}
                </div>
                <div className="text-left hidden lg:block">
                  <div className="text-xs font-medium leading-tight text-stone-100 truncate max-w-[140px]">
                    {currentRetailer?.businessName || 'Rajeshwari Boutique'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#1a1a1a] border border-white/20 shadow-2xl py-2 z-50 divide-y divide-white/10">
                  <div className="px-4 py-2.5">
                    <p className="text-xs font-serif italic text-white truncate">
                      {currentRetailer?.businessName || 'Rajeshwari Boutique'}
                    </p>
                    <p className="text-[11px] text-stone-400 truncate mt-0.5">
                      {currentRetailer?.email || 'rajeshwari.kurtis@gmail.com'}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1 text-[9px] uppercase tracking-[0.2em] bg-white/10 text-amber-300 border border-white/20 px-2 py-0.5">
                      <ShieldCheck className="w-3 h-3" /> Approved Retailer
                    </div>
                  </div>

                  <div className="py-1 text-xs uppercase tracking-wider">
                    <Link
                      href="/retailer"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-stone-300 hover:bg-white/10 hover:text-white"
                    >
                      <Package className="w-3.5 h-3.5 text-stone-400" />
                      Retailer Dashboard
                    </Link>
                    <Link
                      href="/retailer/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-stone-300 hover:bg-white/10 hover:text-white"
                    >
                      <Building2 className="w-3.5 h-3.5 text-stone-400" />
                      Business Profile
                    </Link>
                    <Link
                      href="/retailer/kyc"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-stone-300 hover:bg-white/10 hover:text-white"
                    >
                      <FileCheck2 className="w-3.5 h-3.5 text-stone-400" />
                      KYC Documents
                    </Link>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs uppercase tracking-wider text-rose-300 hover:bg-white/10"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Logout Portal
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Nav Toggle */}
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="p-2 bg-white/10 md:hidden text-stone-300 hover:text-white"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Retailer Navigation Drawer */}
      {mobileNavOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#1a1a1a] px-4 py-3 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileNavOpen(false)}
                className={`flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-[0.2em] font-bold ${
                  pathname === item.href ? 'bg-white/10 text-amber-300' : 'text-stone-300 hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4 text-stone-400" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
