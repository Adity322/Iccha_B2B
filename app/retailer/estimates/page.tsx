'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Receipt, 
  Printer, 
  Building2, 
  Search, 
  Eye, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight 
} from 'lucide-react';
import RetailerHeader from '@/components/layout/RetailerHeader';
import Footer from '@/components/layout/Footer';
import EstimateViewModal from '@/components/order/EstimateViewModal';
import { OrderService } from '@/lib/services';
import { EstimateDocument } from '@/lib/types';
import { useApp } from '@/lib/context/AppContext';

export default function RetailerEstimatesPage() {
  const { currentRetailer } = useApp();
  const [estimates, setEstimates] = useState<EstimateDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEstimate, setSelectedEstimate] = useState<EstimateDocument | null>(null);
  const [entityFilter, setEntityFilter] = useState<string>('all');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const orders = await OrderService.getOrders(currentRetailer?.id ? { retailerId: currentRetailer.id } : undefined);
      const allEsts = orders.flatMap(o => o.estimates || []);
      setEstimates(allEsts);
      setLoading(false);
    }
    load();
  }, [currentRetailer]);

  const filteredEstimates = estimates.filter(e => {
    if (entityFilter !== 'all' && e.billingEntity?.id !== entityFilter) return false;
    return true;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <RetailerHeader />

      <main className="flex-1 py-8 bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Breadcrumbs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <nav className="text-xs text-stone-500 mb-1 flex items-center gap-2">
                <Link href="/retailer" className="hover:text-stone-900">Retailer Portal</Link>
                <span>/</span>
                <span className="text-stone-900 font-semibold">Proforma Estimates</span>
              </nav>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                GST Proforma Invoices & Estimates
              </h1>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setEntityFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  entityFilter === 'all' ? 'bg-[#831843] text-white' : 'bg-white border border-stone-200 text-stone-700'
                }`}
              >
                All Entities
              </button>
              <button
                onClick={() => setEntityFilter('entity_a')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  entityFilter === 'entity_a' ? 'bg-[#831843] text-white' : 'bg-white border border-stone-200 text-stone-700'
                }`}
              >
                Surat Hub (GST A)
              </button>
              <button
                onClick={() => setEntityFilter('entity_b')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  entityFilter === 'entity_b' ? 'bg-[#9a3412] text-white' : 'bg-white border border-stone-200 text-stone-700'
                }`}
              >
                Jaipur Hub (GST B)
              </button>
            </div>
          </div>

          {/* Estimates Table / Cards */}
          {loading ? (
            <div className="p-16 bg-white rounded-3xl border border-stone-200 text-center text-xs text-stone-500">
              Loading proforma estimates...
            </div>
          ) : filteredEstimates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredEstimates.map((est) => {
                const isSurat = est.billingEntity?.id === 'entity_a';
                return (
                  <div
                    key={est.id}
                    className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm hover:shadow-md transition space-y-4 text-xs flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase text-white flex items-center gap-1 ${
                          isSurat ? 'bg-[#831843]' : 'bg-[#9a3412]'
                        }`}>
                          <Building2 className="w-3 h-3" />
                          {isSurat ? 'Surat Division' : 'Jaipur Division'}
                        </span>
                        <span className="font-mono text-stone-500 font-semibold">
                          #{est.estimateNumber}
                        </span>
                      </div>

                      <div>
                        <strong className="text-stone-900 text-sm block">{est.billingEntity?.legalName}</strong>
                        <span className="text-[11px] text-stone-500 font-mono">
                          GSTIN: {est.billingEntity?.gstin}
                        </span>
                      </div>

                      <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 space-y-1 text-stone-600">
                        <div className="flex justify-between">
                          <span>Items Included:</span>
                          <strong className="text-stone-900">{est.items.length} Product Lots</strong>
                        </div>
                        <div className="flex justify-between">
                          <span>Taxable Value:</span>
                          <span className="font-mono">₹{est.taxableSubtotal.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>GST (5%):</span>
                          <span className="font-mono">₹{est.totalGst.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between font-bold text-stone-900 border-t border-stone-200 pt-1">
                          <span>Proforma Amount:</span>
                          <span className="font-mono text-rose-900 text-sm">
                            ₹{est.grandTotal.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedEstimate(est)}
                      className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow flex items-center justify-center gap-1.5 transition"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-400" />
                      <span>View & Print Proforma</span>
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-16 bg-white rounded-3xl border border-stone-200 text-center space-y-3">
              <Receipt className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="font-serif text-lg font-bold text-stone-800">No Proforma Estimates Found</h3>
              <p className="text-xs text-stone-500">Estimates are generated automatically upon order enquiry creation.</p>
            </div>
          )}

        </div>
      </main>

      <EstimateViewModal
        estimate={selectedEstimate}
        onClose={() => setSelectedEstimate(null)}
      />

      <Footer />
    </div>
  );
}
