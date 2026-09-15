'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { 
  Building2, 
  Receipt, 
  Truck, 
  CheckCircle2, 
  Clock, 
  ArrowLeft, 
  Printer, 
  ShieldCheck, 
  Sparkles, 
  Copy, 
  FileText,
  MapPin
} from 'lucide-react';
import RetailerHeader from '@/components/layout/RetailerHeader';
import Footer from '@/components/layout/Footer';
import EstimateViewModal from '@/components/order/EstimateViewModal';
import { OrderService } from '@/lib/services';
import { OrderEnquiry, EstimateDocument, OrderStatus } from '@/lib/types';
import { useApp } from '@/lib/context/AppContext';

export default function RetailerOrderDetailPage() {
  const params = useParams();
  const orderId = params?.orderId as string;
  const { addToast } = useApp();

  const [order, setOrder] = useState<OrderEnquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEstimate, setSelectedEstimate] = useState<EstimateDocument | null>(null);

  useEffect(() => {
    async function load() {
      if (!orderId) return;
      setLoading(true);
      const data = await OrderService.getOrderById(orderId);
      setOrder(data || null);
      setLoading(false);
    }
    load();
  }, [orderId]);

  const handleSimulateStatus = async (newStatus: OrderStatus) => {
    if (!order) return;
    const updated = await OrderService.updateOrderStatus(order.id, newStatus);
    if (updated) {
      setOrder(updated);
      addToast({
        type: 'info',
        title: `Order Status Updated to ${newStatus.replace('_', ' ').toUpperCase()}`,
        message: 'Order lifecycle updated.'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <RetailerHeader />
        <main className="flex-1 py-16 text-center text-xs text-stone-500">
          Loading order details...
        </main>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col min-h-screen">
        <RetailerHeader />
        <main className="flex-1 py-16 text-center space-y-3 bg-[#faf8f5]">
          <h2 className="font-serif text-xl font-bold text-stone-900">Order Not Found</h2>
          <Link href="/retailer/orders" className="text-xs text-[#831843] font-bold underline">
            Back to Orders List
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <RetailerHeader />

      <main className="flex-1 py-8 bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Breadcrumbs & Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <nav className="text-xs text-stone-500 mb-1 flex items-center gap-2">
                <Link href="/retailer" className="hover:text-stone-900">Retailer Portal</Link>
                <span>/</span>
                <Link href="/retailer/orders" className="hover:text-stone-900">Orders</Link>
                <span>/</span>
                <span className="text-stone-900 font-semibold">#{order.orderNumber}</span>
              </nav>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                Order Enquiry #{order.orderNumber}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/retailer/orders"
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Orders</span>
              </Link>
            </div>
          </div>

          {/* Test Status Switcher */}
          <div className="p-4 bg-stone-900 text-white rounded-2xl border border-stone-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px]">
                Interactive Order State Simulator:
              </span>
              <span className="text-stone-400 text-[10px]">Switch state to test entire lifecycle</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {(['enquiry_received', 'proforma_generated', 'payment_confirmed', 'in_production', 'dispatched', 'delivered'] as OrderStatus[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleSimulateStatus(st)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                    order.status === st
                      ? 'bg-amber-500 text-stone-950 shadow'
                      : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                  }`}
                >
                  {st.replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Lifecycle Step Tracker */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
            <h3 className="font-serif text-base font-bold text-stone-900">
              Wholesale Dispatch Roadmap
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              {[
                { title: '1. Enquiry Logged', key: 'enquiry_received', desc: 'Requirements recorded' },
                { title: '2. Proforma Issued', key: 'proforma_generated', desc: 'Dual GST estimates ready' },
                { title: '3. RTGS Confirmed', key: 'payment_confirmed', desc: 'Commercial advance logged' },
                { title: '4. Quality & Packing', key: 'in_production', desc: 'Heavy poly bale boxing' },
                { title: '5. Road Dispatch', key: 'dispatched', desc: 'LR / Bilty tracking shared' }
              ].map((step, idx) => {
                const isPassed = ['enquiry_received', 'proforma_generated', 'payment_confirmed', 'in_production', 'dispatched', 'delivered'].indexOf(order.status) >= idx;
                return (
                  <div
                    key={step.key}
                    className={`p-3.5 rounded-2xl border ${
                      isPassed ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-stone-50 border-stone-200 text-stone-400'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      {isPassed ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Clock className="w-4 h-4 text-stone-300" />}
                      <span>{step.title}</span>
                    </div>
                    <div className="text-[10px] text-stone-500 mt-1">{step.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dual Entities & Items Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left 8 Cols: Entity Orders */}
            <div className="lg:col-span-8 space-y-6">
              {(order.estimates || []).map((estimateDoc) => {
                const isSurat = estimateDoc.billingEntity?.id === 'entity_a';

                return (
                  <div
                    key={estimateDoc.id}
                    className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6"
                  >
                    {/* Entity Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-2xl text-white ${isSurat ? 'bg-[#831843]' : 'bg-[#9a3412]'}`}>
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-serif text-lg font-bold text-stone-900">
                            {isSurat ? 'Surat Manufacturing Hub (Entity A)' : 'Jaipur Handblock Hub (Entity B)'}
                          </h3>
                          <div className="text-xs text-stone-500">
                            Legal Name: <strong>{estimateDoc.billingEntity?.legalName}</strong> &bull; GSTIN: <span className="font-mono font-bold text-stone-800">{estimateDoc.billingEntity?.gstin}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedEstimate(estimateDoc)}
                        className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow flex items-center gap-1.5 self-start sm:self-center"
                      >
                        <Printer className="w-3.5 h-3.5 text-amber-400" />
                        <span>Print Proforma #{estimateDoc.estimateNumber}</span>
                      </button>
                    </div>

                    {/* Items Table */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase text-stone-400 tracking-wider">
                        Allocated Wholesale Lots ({estimateDoc.items.length})
                      </h4>

                      <div className="space-y-3">
                        {estimateDoc.items.map((item) => (
                          <div
                            key={item.productId}
                            className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative w-14 h-16 rounded-xl overflow-hidden bg-stone-200 shrink-0">
                                <Image
                                  src={item.imageUrl || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400'}
                                  alt={item.productName}
                                  fill
                                  className="object-cover object-top"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <div>
                                <strong className="text-stone-900 text-sm block">{item.productName}</strong>
                                <span className="text-[11px] text-stone-500 font-mono">
                                  SKU: {item.sku} &bull; Set: {item.sizeCombination}
                                </span>
                              </div>
                            </div>

                            <div className="text-left sm:text-right">
                              <div className="font-bold text-stone-900">
                                {item.sets} Sets &times; ₹{item.setRate.toLocaleString('en-IN')}
                              </div>
                              <span className="text-[11px] font-mono text-rose-900 font-bold">
                                = ₹{item.lineSubtotal.toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Subtotal & Taxes for Entity */}
                    <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1.5 text-xs">
                      <div className="flex justify-between text-stone-600">
                        <span>Taxable Amount:</span>
                        <span className="font-mono">₹{estimateDoc.taxableSubtotal.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-stone-600">
                        <span>GST (5%):</span>
                        <span className="font-mono">₹{estimateDoc.totalGst.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-stone-600">
                        <span>Surface Freight:</span>
                        <span className="font-mono">₹{estimateDoc.shippingCharge.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between items-baseline pt-2 border-t border-stone-200 font-bold text-stone-900">
                        <span>Division Proforma Total:</span>
                        <span className="font-mono text-base text-[#831843]">₹{estimateDoc.grandTotal.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

            {/* Right 4 Cols: Commercial Settlement & Delivery Info */}
            <div className="lg:col-span-4 space-y-6 text-xs">
              
              {/* Grand Total Card */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-md space-y-4">
                <h3 className="font-serif text-base font-bold text-stone-900">
                  Master Commercial Summary
                </h3>

                <div className="space-y-2 text-stone-600">
                  <div className="flex justify-between">
                    <span>Total Garment Sets:</span>
                    <strong className="text-stone-900">{order.totalSets} Sets ({order.totalPieces} pcs)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Grand Taxable:</span>
                    <span className="font-mono">₹{order.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total GST:</span>
                    <span className="font-mono">₹{order.totalGst.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Freight:</span>
                    <span className="font-mono">₹{(order.shipping || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-3 border-t-2 border-stone-900 text-stone-900 font-bold">
                    <span className="text-sm">Grand Total:</span>
                    <span className="font-serif text-xl font-mono text-[#831843]">
                      ₹{(order.masterTotal || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-950 leading-relaxed">
                  <strong>Terms of Dispatch:</strong> 50% advance for packing lot allocation, balance 50% upon sharing transport Bilty/LR copy.
                </div>
              </div>

              {/* Delivery Consignee Info */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-3">
                <h4 className="font-serif text-sm font-bold text-stone-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-800" />
                  Consignee & Shipping Destination
                </h4>
                <div className="text-stone-700 leading-relaxed">
                  <strong>{order.retailerBusinessName}</strong>
                  <div>{order.shippingAddress?.street}</div>
                  <div>{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</div>
                  <div className="mt-1 text-stone-500">Contact: {order.retailerContact}</div>
                </div>
              </div>

              {/* Transporter Details */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-2">
                <h4 className="font-serif text-sm font-bold text-stone-900 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#831843]" />
                  Logistics & Transport Instructions
                </h4>
                <p className="text-stone-600">{order.customerRemarks || 'Direct road express transport'}</p>
              </div>

            </div>

          </div>

        </div>
      </main>

      {/* Proforma View Modal */}
      <EstimateViewModal
        estimate={selectedEstimate}
        onClose={() => setSelectedEstimate(null)}
      />

      <Footer />
    </div>
  );
}
