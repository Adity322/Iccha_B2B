'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  Sparkles, 
  Lock, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function PublicHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      {/* Top Wholesale Editorial Advisory Bar — now also carries the primary CTAs */}
      <div className="bg-[#1a1a1a] text-[#f9f7f2] text-xs py-2.5 px-4 border-b border-black/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden md:flex items-center gap-3 min-w-0">
            <span className="shrink-0 bg-[#f9f7f2] text-[#1a1a1a] text-[9px] uppercase font-bold tracking-[0.25em] px-2 py-0.5">B2B Archive</span>
            <span className="text-[11px] tracking-wide text-stone-300 truncate">Stitched 2-Piece &amp; 3-Piece Women&apos;s Ethnic Kurti Manufacturing &bull; Surat &amp; Jaipur</span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-[11px] text-stone-300 font-medium shrink-0">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--brand-accent)]" />
            <span className="hidden lg:inline">GST Verified</span>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-auto md:ml-0">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-white/90 hover:text-white border border-white/25 hover:border-white/50 transition whitespace-nowrap"
            >
              <Lock className="w-3 h-3" />
              Login
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#1a1a1a] bg-[#f9f7f2] hover:bg-white transition whitespace-nowrap"
            >
              <Sparkles className="w-3 h-3 text-[var(--brand-accent)]" />
              Apply Access
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header Bar — logo + nav only, single line, nothing else competing for width */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo — single line, tagline dropped (already stated in bar above) */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 bg-[#1a1a1a] text-[#f9f7f2] flex items-center justify-center font-serif text-lg font-bold border border-black/10 group-hover:bg-black transition">
              इ
            </div>
            <div className="leading-none">
              <span className="font-serif italic text-xl tracking-tighter text-[#1a1a1a] font-normal whitespace-nowrap block">
                Iccha<span className="font-bold not-italic">Store.</span>
              </span>
              <span className="text-[9px] tracking-[0.3em] uppercase text-[var(--text-subtle)] font-bold whitespace-nowrap block mt-1">
                Wholesale Manufacturing &bull; Vol. 26
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-[11px] font-bold uppercase tracking-[0.12em] text-[#1a1a1a]">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`whitespace-nowrap transition-all hover:opacity-100 py-1 border-b-2 ${
                    isActive ? 'border-black opacity-100' : 'border-transparent opacity-50 hover:border-black/30'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 lg:hidden text-stone-800 hover:bg-black/5 focus:outline-none shrink-0"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
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
              className="w-full text-center py-3 px-4 bg-[#1a1a1a] text-[#f9f7f2] font-bold uppercase text-[10px] tracking-[0.25em] shadow flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[var(--brand-accent)]" />
              Apply for Wholesale Access
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-3 px-4 border border-black/20 text-[#1a1a1a] font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-black/5"
            >
              Retailer Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}