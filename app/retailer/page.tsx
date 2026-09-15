'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Building2, 
  ShoppingBag, 
  Receipt, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Sliders, 
  Layers, 
  PhoneCall, 
  FileText,
  Boxes
} from 'lucide-react';
import RetailerHeader from '@/components/layout/RetailerHeader';
import Footer from '@/components/layout/Footer';
import { useApp } from '@/lib/context/AppContext';
import { MOCK_CATEGORIES } from '@/lib/data/mockData';

export default function RetailerDashboardPage() {
  const { currentRetailer, cart, moqEvaluation } = useApp();

  return (
    <div className="flex flex-col min-h-screen">
      <RetailerHeader />

      <main className="flex-1 py-10 bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-stone-900 via-rose-950 to-stone-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-400/30">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified KYC Retailer
                </div>
                <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold">
                  Welcome, {currentRetailer?.businessName || 'Ananya Designer Boutiques'}
                </h1>
                <p className="text-xs sm:text-sm text-stone-300 max-w-xl">
                  Authorized Buyer: <strong className="text-white">{currentRetailer?.applicantName}</strong> &bull; GSTIN: <span className="font-mono text-amber-300">{currentRetailer?.gstin}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/retailer/catalogue"
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-stone-950 font-bold text-xs shadow-lg transition flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Browse Wholesale Catalogue</span>
                </Link>

                <Link
                  href="/retailer/cart"
                  className="px-5 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold border border-stone-700 transition flex items-center gap-1.5"
                >
                  <span>Wholesale Cart ({cart.totalSets} Sets)</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-xs uppercase font-bold tracking-wider">Wholesale Cart</span>
                <ShoppingBag className="w-4 h-4 text-[#831843]" />
              </div>
              <div className="text-2xl font-bold text-stone-900 font-mono">
                {cart.totalSets} Sets <span className="text-xs text-stone-500 font-normal font-sans">({cart.totalPieces} pcs)</span>
              </div>
              <div className="text-xs text-stone-500 pt-1">
                Value: <strong className="text-stone-800">₹{cart.subtotal.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-xs uppercase font-bold tracking-wider">MOQ Requirement</span>
                <Sliders className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-stone-900">
                {moqEvaluation?.isMet ? (
                  <span className="text-emerald-700 text-lg flex items-center gap-1">
                    <CheckCircle2 className="w-5 h-5" /> Met ({moqEvaluation.currentSets}/{moqEvaluation.requiredSets})
                  </span>
                ) : (
                  <span className="text-amber-700 text-lg flex items-center gap-1">
                    <Clock className="w-5 h-5" /> Incomplete ({moqEvaluation?.currentSets}/{moqEvaluation?.requiredSets})
                  </span>
                )}
              </div>
              <div className="text-xs text-stone-500 pt-1">
                {currentRetailer?.moqOverride ? 'Admin Override Active' : 'Default 4 Sets MOQ'}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-xs uppercase font-bold tracking-wider">Active Proformas</span>
                <Receipt className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-2xl font-bold text-stone-900 font-mono">
                2 Estimates
              </div>
              <div className="text-xs text-stone-500 pt-1">
                Surat & Jaipur divisions
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-1">
              <div className="flex items-center justify-between text-stone-400">
                <span className="text-xs uppercase font-bold tracking-wider">Manufacturing Hubs</span>
                <Building2 className="w-4 h-4 text-rose-800" />
              </div>
              <div className="text-sm font-bold text-stone-900">
                Surat (A) & Jaipur (B)
              </div>
              <div className="text-xs text-stone-500 pt-1">
                Ready for dispatch
              </div>
            </div>

          </div>

          {/* Quick Action Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/retailer/catalogue"
              className="p-6 bg-white rounded-3xl border border-stone-200 hover:border-rose-300 hover:shadow-lg transition space-y-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#831843] flex items-center justify-center">
                <Boxes className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-rose-900">
                Live Wholesale Catalogue &rarr;
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Filter through ready-to-dispatch 2-piece and 3-piece lots with factory piece rates and live lot availability.
              </p>
            </Link>

            <Link
              href="/retailer/orders"
              className="p-6 bg-white rounded-3xl border border-stone-200 hover:border-rose-300 hover:shadow-lg transition space-y-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
                <Receipt className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-amber-800">
                Order Enquiries & Estimates &rarr;
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Review master order enquiry status, download dual GST proforma invoices, and track consignment dispatch.
              </p>
            </Link>

            <Link
              href="/retailer/cart"
              className="p-6 bg-white rounded-3xl border border-stone-200 hover:border-rose-300 hover:shadow-lg transition space-y-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900 group-hover:text-emerald-800">
                Wholesale Cart & MOQ &rarr;
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Check your automated Surat & Jaipur entity breakdown, adjust set quantities, or request a video call.
              </p>
            </Link>
          </div>

          {/* Quick Categories Bar */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Wholesale Product Categories
              </h3>
              <Link href="/retailer/catalogue" className="text-xs font-bold text-[#831843] hover:underline">
                View All Categories &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
              {MOCK_CATEGORIES.slice(0, 8).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/retailer/catalogue?category=${cat.id}`}
                  className="p-2.5 rounded-xl bg-stone-50 hover:bg-rose-50 border border-stone-200/80 hover:border-rose-300 text-center transition group"
                >
                  <div className="relative aspect-square w-full rounded-lg overflow-hidden mb-1.5 bg-stone-200">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover group-hover:scale-105 transition"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-stone-800 group-hover:text-rose-900 line-clamp-1">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
