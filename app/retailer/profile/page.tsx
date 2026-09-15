'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Building2, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Mail, 
  FileText, 
  ShieldCheck, 
  Sliders,
  ArrowRight
} from 'lucide-react';
import RetailerHeader from '@/components/layout/RetailerHeader';
import Footer from '@/components/layout/Footer';
import { useApp } from '@/lib/context/AppContext';

export default function RetailerProfilePage() {
  const { currentRetailer } = useApp();

  return (
    <div className="flex flex-col min-h-screen">
      <RetailerHeader />

      <main className="flex-1 py-8 bg-[#faf8f5]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          <nav className="text-xs text-stone-500 mb-1 flex items-center gap-2">
            <Link href="/retailer" className="hover:text-stone-900">Retailer Portal</Link>
            <span>/</span>
            <span className="text-stone-900 font-semibold">Boutique Profile</span>
          </nav>

          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm space-y-8">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-rose-50 text-[#831843] flex items-center justify-center font-serif text-2xl font-bold">
                  {currentRetailer?.businessName.charAt(0) || 'A'}
                </div>
                <div>
                  <h1 className="font-serif text-2xl font-bold text-stone-900">
                    {currentRetailer?.businessName}
                  </h1>
                  <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified Wholesale Reseller
                  </span>
                </div>
              </div>

              <Link
                href="/retailer/kyc"
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 self-start sm:self-center"
              >
                <ShieldCheck className="w-4 h-4 text-[#831843]" />
                <span>View KYC Records</span>
              </Link>
            </div>

            {/* Profile Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              
              <div className="space-y-4">
                <h3 className="font-serif text-sm font-bold text-stone-900 border-b border-stone-100 pb-1.5">
                  Authorized Contact
                </h3>
                <div className="space-y-2 text-stone-700">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">Proprietor / Buyer</span>
                    <strong className="text-stone-900 text-sm">{currentRetailer?.applicantName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">Mobile Phone</span>
                    <strong className="text-stone-900">{currentRetailer?.mobile}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">Email Address</span>
                    <strong className="text-stone-900">{currentRetailer?.email}</strong>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-serif text-sm font-bold text-stone-900 border-b border-stone-100 pb-1.5">
                  Tax & Regulatory Identifiers
                </h3>
                <div className="space-y-2 text-stone-700">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">GSTIN Number</span>
                    <strong className="font-mono text-stone-900 text-sm">{currentRetailer?.gstin}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">PAN Number</span>
                    <strong className="font-mono text-stone-900">{currentRetailer?.pan}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">MOQ Requirement</span>
                    <strong className="text-stone-900">
                      {currentRetailer?.moqOverride ? `Custom Override (${currentRetailer.customMoqSets || 2} Sets)` : 'Default 4 Sets MOQ'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Billing Address */}
              <div className="space-y-2">
                <h3 className="font-serif text-sm font-bold text-stone-900 border-b border-stone-100 pb-1.5">
                  Registered Billing Address
                </h3>
                <div className="text-stone-700 leading-relaxed">
                  <div>{currentRetailer?.address?.street}</div>
                  <div>{currentRetailer?.address?.city}, {currentRetailer?.address?.state} - {currentRetailer?.address?.pincode}</div>
                  <div className="text-stone-500 mt-1">State Code: {currentRetailer?.address?.stateCode}</div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-2">
                <h3 className="font-serif text-sm font-bold text-stone-900 border-b border-stone-100 pb-1.5">
                  Default Consignee Shipping Address
                </h3>
                <div className="text-stone-700 leading-relaxed">
                  <div>{(currentRetailer?.deliveryAddresses?.[0] || currentRetailer?.address)?.street}</div>
                  <div>{(currentRetailer?.deliveryAddresses?.[0] || currentRetailer?.address)?.city}, {(currentRetailer?.deliveryAddresses?.[0] || currentRetailer?.address)?.state} - {(currentRetailer?.deliveryAddresses?.[0] || currentRetailer?.address)?.pincode}</div>
                  <div className="text-stone-500 mt-1">State Code: {(currentRetailer?.deliveryAddresses?.[0] || currentRetailer?.address)?.stateCode}</div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
