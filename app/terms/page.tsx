import React from 'react';
import Link from 'next/link';
import PublicHeader from '@/components/layout/PublicHeader';
import Footer from '@/components/layout/Footer';

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />

      <main className="flex-1 py-12 bg-[#faf8f5]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-3xl p-8 sm:p-12 border border-stone-200 shadow-sm space-y-6 text-xs text-stone-700 leading-relaxed">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#831843]">
            B2B Commercial Terms
          </span>
          <h1 className="font-serif text-3xl font-bold text-stone-900">
            Terms of Wholesale Sale & Order Enquiries
          </h1>
          <p className="text-stone-500">Effective from August 2026</p>

          <div className="space-y-4 pt-4 border-t border-stone-200">
            <h3 className="font-bold text-sm text-stone-900">1. Semi-Ecommerce Order Enquiry System</h3>
            <p>
              Placing an order on IcchaStore creates a commercial Master Order Enquiry and generates formal Proforma Estimates. No instant credit card or online payment gateway is processed on the storefront. Official payment is completed through direct bank RTGS / NEFT transfer upon proforma confirmation.
            </p>

            <h3 className="font-bold text-sm text-stone-900">2. Set-Based Ordering (Fixed Size Ratio)</h3>
            <p>
              All products are packed in fixed wholesale sets (standard 4 pieces: M, L, XL, XXL). Individual piece picking is strictly not permitted unless an explicit sample exception is granted by administration.
            </p>

            <h3 className="font-bold text-sm text-stone-900">3. Minimum Order Quantity (MOQ)</h3>
            <p>
              Standard wholesale checkout requires a minimum of 4 complete sets (or as determined by category rules). Orders below MOQ are routed to our &quot;Contact Seller / Request Video Call&quot; desk for evaluation and sample approvals.
            </p>

            <h3 className="font-bold text-sm text-stone-900">4. Dual Entity GST Invoicing</h3>
            <p>
              Invoices are issued legally by either <strong>Iccha Fashions Pvt Ltd (Surat, Gujarat)</strong> or <strong>Iccha Apparels LLP (Jaipur, Rajasthan)</strong> based on manufacturing origin. Retailers receive separate compliant tax invoices.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
