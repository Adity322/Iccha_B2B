import React from 'react';
import Link from 'next/link';
import PublicHeader from '@/components/layout/PublicHeader';
import Footer from '@/components/layout/Footer';

export default function PrivacyPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />

      <main className="flex-1 py-12 bg-[#faf8f5]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-3xl p-8 sm:p-12 border border-stone-200 shadow-sm space-y-6 text-xs text-stone-700 leading-relaxed">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#831843]">
            B2B Commercial Compliance
          </span>
          <h1 className="font-serif text-3xl font-bold text-stone-900">
            Privacy Policy & B2B Data Handling
          </h1>
          <p className="text-stone-500">Last updated: August 2026</p>

          <div className="space-y-4 pt-4 border-t border-stone-200">
            <h3 className="font-bold text-sm text-stone-900">1. Collection of Business & KYC Information</h3>
            <p>
              IcchaStore operates exclusively as a Business-to-Business (B2B) wholesale apparel manufacturing platform. To protect wholesale pricing and comply with Indian GST laws, we collect verified business data including GSTIN certificates, PAN, business registrations, and authorized contact information.
            </p>

            <h3 className="font-bold text-sm text-stone-900">2. B2B Wholesale Price Protection</h3>
            <p>
              Wholesale lot rates, minimum order volume formulas, and commercial inventory balances are strictly confidential trade assets. Retailers agree not to publicly redistribute wholesale quotes or proforma estimates to end-consumers.
            </p>

            <h3 className="font-bold text-sm text-stone-900">3. Multi-Entity Data Processing</h3>
            <p>
              Depending on the kurti categories ordered, billing records and GSTIN details are processed between our legal entities: <strong>Iccha Fashions Private Limited (Surat)</strong> and <strong>Iccha Apparels LLP (Jaipur)</strong> solely for invoice generation, state e-way bill generation, and commercial dispatch.
            </p>

            <h3 className="font-bold text-sm text-stone-900">4. Contact</h3>
            <p>
              For privacy and business record queries, contact our legal desk at <span className="font-mono">compliance@icchastore.com</span>.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
