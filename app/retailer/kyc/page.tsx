'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Building2, 
  CheckCircle2, 
  FileText, 
  ShieldCheck, 
  Download, 
  ArrowLeft 
} from 'lucide-react';
import RetailerHeader from '@/components/layout/RetailerHeader';
import Footer from '@/components/layout/Footer';
import { useApp } from '@/lib/context/AppContext';

export default function RetailerKYCRecordsPage() {
  const { currentRetailer } = useApp();

  return (
    <div className="flex flex-col min-h-screen">
      <RetailerHeader />

      <main className="flex-1 py-8 bg-[#faf8f5]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          <nav className="text-xs text-stone-500 mb-1 flex items-center gap-2">
            <Link href="/retailer" className="hover:text-stone-900">Retailer Portal</Link>
            <span>/</span>
            <Link href="/retailer/profile" className="hover:text-stone-900">Profile</Link>
            <span>/</span>
            <span className="text-stone-900 font-semibold">KYC Verification</span>
          </nav>

          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm space-y-6 text-xs">
            
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h1 className="font-serif text-2xl font-bold text-stone-900">
                  KYC & Trade Compliance Status
                </h1>
                <p className="text-xs text-stone-500 mt-0.5">
                  Verified B2B wholesale access records for {currentRetailer?.businessName}.
                </p>
              </div>

              <span className="px-3 py-1 bg-emerald-100 text-emerald-900 font-bold rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Active
              </span>
            </div>

            {/* Document Verification Log */}
            <div className="space-y-3">
              <h3 className="font-serif text-sm font-bold text-stone-900">
                Verified Compliance Documents
              </h3>

              <div className="space-y-2">
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="text-stone-900 text-sm block">Form GST REG-06 Certificate</strong>
                      <span className="text-stone-500 font-mono text-[11px]">
                        Registration: {currentRetailer?.gstin} &bull; Verified on GST Portal
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                    Verified
                  </span>
                </div>

                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="text-stone-900 text-sm block">Wholesale Reseller Declaration</strong>
                      <span className="text-stone-500 text-[11px]">
                        Accepted commercial non-disclosure and factory lot terms
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                    Accepted
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-between items-center">
              <Link href="/retailer/profile" className="text-stone-600 hover:text-stone-900 font-semibold flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Back to Profile
              </Link>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
