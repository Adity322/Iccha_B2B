'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  Sparkles, 
  UserCheck, 
  Lock, 
  Layers, 
  FileText, 
  Phone, 
  Video, 
  Search,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '@/lib/context/AppContext';

export default function PublicHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { setRole } = useApp();

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Categories', href: '/categories' },
    { label: 'Collections', href: '/collections' },
    { label: 'About IcchaStore', href: '/about' },
    { label: 'Craft & Videos', href: '/videos' },
    { label: 'Contact', href: '/contact' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#f9f7f2]/95 backdrop-blur-md border-b border-black/10 transition-all">
      {/* Top Wholesale Editorial Advisory Bar */}
      <div className="bg-[#1a1a1a] text-[#f9f7f2] text-xs py-2 px-4 border-b border-black/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="bg-[#f9f7f2] text-[#1a1a1a] text-[9px] uppercase font-bold tracking-[0.25em] px-2 py-0.5 rounded-sm">B2B Archive</span>
            <span className="text-[11px] tracking-wide text-stone-300">Stitched 2-Piece & 3-Piece Women&apos;s Ethnic Kurti Manufacturing Hubs &bull; Surat & Jaipur</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-[11px] text-stone-300 font-medium">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> GST Verified Commercial Access</span>
            <span className="text-white/20">|</span>
            <Link href="/register" className="text-white underline underline-offset-4 font-semibold uppercase text-[10px] tracking-[0.2em] hover:text-amber-200 transition">Apply For Account &rarr;</Link>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-sm bg-[#1a1a1a] text-[#f9f7f2] flex items-center justify-center font-serif text-xl font-bold border border-black/10 group-hover:bg-black transition">
              इ
            </div>
            <div>
              <span className="font-serif italic text-2xl tracking-tighter text-[#1a1a1a] font-normal block leading-none">
                Iccha<span className="font-bold not-italic">Store.</span>
              </span>
              <span className="text-[9px] tracking-[0.35em] uppercase text-stone-500 font-bold block mt-1">
                Wholesale Manufacturing &bull; Vol. 26
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-[11px] font-bold uppercase tracking-[0.25em] text-[#1a1a1a]">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-all hover:opacity-100 py-1 border-b-2 ${
                    isActive ? 'border-black opacity-100' : 'border-transparent opacity-50 hover:border-black/30'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1a1a] hover:bg-black/5 border border-black/20 rounded-sm transition"
            >
              <Lock className="w-3.5 h-3.5" />
              Retailer Login
            </Link>

            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.25em] text-[#f9f7f2] bg-[#1a1a1a] hover:bg-black rounded-sm shadow-sm transition"
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              Apply Access
            </Link>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              href="/login"
              className="p-2 text-stone-800 hover:text-black"
              title="Login"
            >
              <Lock className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-sm text-stone-800 hover:bg-black/5 focus:outline-none"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-black/10 bg-[#f9f7f2] px-6 pt-5 pb-8 space-y-4 shadow-xl">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between py-2 text-xs font-bold uppercase tracking-[0.2em] border-b border-black/5 ${
                  pathname === link.href ? 'text-[#1a1a1a] font-bold' : 'text-stone-600'
                }`}
              >
                <span>{link.label}</span>
                <ChevronRight className="w-4 h-4 text-stone-400" />
              </Link>
            ))}
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 px-4 rounded-sm bg-[#1a1a1a] text-[#f9f7f2] font-bold uppercase text-[10px] tracking-[0.25em] shadow flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              Apply for Wholesale Access
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 px-4 rounded-sm border border-black/20 text-[#1a1a1a] font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-black/5"
            >
              Retailer Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
