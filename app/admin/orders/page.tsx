'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Receipt, 
  Search, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Building2, 
  Printer, 
  Eye, 
  Sliders, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import EstimateViewModal from '@/components/order/EstimateViewModal';
import { OrderService } from '@/lib/services';
import { OrderEnquiry, EstimateDocument, OrderStatus } from '@/lib/types';
import { useApp } from '@/lib/context/AppContext';

function AdminOrdersContent() {
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get('orderId');
  const { addToast } = useApp();

  const [orders, setOrders] = useState<OrderEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedEstimate, setSelectedEstimate] = useState<EstimateDocument | null>(null);

  useEffect(() => {
    let isMounted = true;
    const runFetch = async () => {
      const data = await OrderService.getOrders();
      if (isMounted) {
        setOrders(data);
        setLoading(false);
      }
    };
    runFetch();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    const updated = await OrderService.updateOrderStatus(orderId, newStatus);
    if (updated) {
      addToast({
        type: 'success',
        title: `Order Status: ${newStatus.replace('_', ' ').toUpperCase()}`,
        message: `Order #${updated.orderNumber} lifecycle updated.`
      });
      const freshOrders = await OrderService.getOrders();
      setOrders(freshOrders);
    }
  };

  const filteredOrders = orders.filter(o => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        (o.retailerBusinessName || '').toLowerCase().includes(q) ||
        (o.retailerContact || '').includes(q)
      );
    }
    return true;
  });

  return (
    <div className="flex min-h-screen bg-[#faf8f5]">
      <AdminSidebar activeTab="orders" />

      <main className="flex-1 p-6 lg:p-10 space-y-6 overflow-y-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-[#831843]">
              B2B Order Merchandising
            </span>
            <h1 className="font-serif text-3xl font-bold text-stone-900 mt-1">
              Master Order Enquiries Management
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Review multi-entity proforma allocations, log RTGS advance receipts, and manage dispatch logistics.
            </p>
          </div>
        </div>

        {/* Search & Status Filters */}
        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by Order #, Retailer Name, Phone..."
              className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rose-900"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {['all', 'enquiry_received', 'proforma_generated', 'payment_confirmed', 'in_production', 'dispatched'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                  statusFilter === st
                    ? 'bg-[#831843] text-white shadow'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {st.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="p-16 bg-white rounded-3xl border border-stone-200 text-center text-xs text-stone-500">
            Loading order records...
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-5">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm hover:shadow-md transition space-y-6 text-xs"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-serif text-xl font-bold text-stone-900">
                        Order #{order.orderNumber}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                        order.status === 'dispatched' || order.status === 'completed' ? 'bg-emerald-100 text-emerald-900' :
                        order.status === 'confirmed' ? 'bg-purple-100 text-purple-900' :
                        order.status === 'estimate_generated' ? 'bg-sky-100 text-sky-900' :
                        'bg-amber-100 text-amber-900'
                      }`}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="text-stone-600 mt-1">
                      Retailer: <strong className="text-stone-900 text-sm">{order.retailerBusinessName}</strong> &bull; Contact: {order.retailerContact} &bull; Placed: {order.createdAt}
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">Master Total</span>
                    <span className="text-xl font-bold font-mono text-[#831843]">
                      ₹{(order.masterTotal || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Split Entities Badges */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(order.estimates || []).map(est => {
                    const isSurat = est.billingEntity?.id === 'entity_a';

                    return (
                      <div
                        key={est.id}
                        className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                          isSurat ? 'bg-rose-50/60 border-rose-200' : 'bg-amber-50/60 border-amber-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl text-white ${isSurat ? 'bg-[#831843]' : 'bg-[#9a3412]'}`}>
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <strong className="text-stone-900 block text-sm">
                              {est.billingEntity?.tradeName || (isSurat ? 'Surat Division' : 'Jaipur Unit')}
                            </strong>
                            <span className="text-stone-600 font-mono text-[11px]">
                              {est.totalSets} Sets ({est.items.length} Lots) &bull; ₹{(est.grandTotal || 0).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedEstimate(est)}
                          className="px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-800 rounded-lg font-bold text-[11px] border border-stone-200 shadow-sm transition flex items-center gap-1"
                        >
                          <Printer className="w-3.5 h-3.5 text-stone-600" />
                          <span>Proforma</span>
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Transporter / Notes */}
                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-stone-600">
                  <strong>Transport & Instructions:</strong> {order.customerRemarks || 'Road transport express delivery'}
                </div>

                {/* Status Action Controls */}
                <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-stone-500 font-medium">Update Lifecycle State:</span>

                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(order.id, 'estimate_generated')}
                      className="px-3 py-1.5 bg-sky-100 hover:bg-sky-200 text-sky-900 rounded-lg font-bold transition"
                    >
                      Proforma Ready
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                      className="px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-lg font-bold transition"
                    >
                      Confirm RTGS Advance
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(order.id, 'processing')}
                      className="px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-900 rounded-lg font-bold transition"
                    >
                      Packing / Finishing
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(order.id, 'dispatched')}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow transition flex items-center gap-1"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Dispatch Consignment</span>
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 bg-white rounded-3xl border border-stone-200 text-center text-xs text-stone-500">
            No order enquiries found.
          </div>
        )}

      </main>

      <EstimateViewModal
        estimate={selectedEstimate}
        onClose={() => setSelectedEstimate(null)}
      />

    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-stone-500">Loading Orders...</div>}>
      <AdminOrdersContent />
    </Suspense>
  );
}
