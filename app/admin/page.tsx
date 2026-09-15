'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Users, 
  FileCheck, 
  Receipt, 
  Boxes, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Truck, 
  DollarSign, 
  Eye,
  Sliders
} from 'lucide-react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { KYCService, OrderService, ProductService, RetailerService } from '@/lib/services';
import { KYCApplication, OrderEnquiry, Product, Retailer } from '@/lib/types';
import { useApp } from '@/lib/context/AppContext';

export default function AdminDashboardPage() {
  const { setRole } = useApp();
  const [kycApps, setKycApps] = useState<KYCApplication[]>([]);
  const [orders, setOrders] = useState<OrderEnquiry[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [k, o, p, r] = await Promise.all([
        KYCService.getApplications(),
        OrderService.getOrders(),
        ProductService.getProducts(),
        RetailerService.getRetailers()
      ]);
      setKycApps(k);
      setOrders(o);
      setProducts(p);
      setRetailers(r);
      setLoading(false);
    }
    loadData();
  }, []);

  const pendingKYC = kycApps.filter(a => a.status === 'pending_kyc' || a.status === 'under_review');
  const pendingOrders = orders.filter(o => o.status === 'enquiry_received' || o.status === 'estimate_generated');
  const lowStockProducts = products.filter(p => p.availableSets <= 8);

  const totalWholesaleVolume = orders.reduce((acc, o) => acc + (o.masterTotal || 0), 0);
  const totalSetsOrdered = orders.reduce((acc, o) => acc + o.totalSets, 0);

  return (
    <div className="flex min-h-screen bg-[#faf8f5]">
      {/* Sidebar Navigation */}
      <AdminSidebar activeTab="dashboard" />

      {/* Main Admin Content */}
      <main className="flex-1 p-6 lg:p-10 space-y-8 overflow-y-auto">
        
        {/* Admin Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-widest text-[#831843]">
                IcchaStore Operations Desk
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold">
                Admin Console
              </span>
            </div>
            <h1 className="font-serif text-3xl font-bold text-stone-900 mt-1">
              Wholesale Merchandising Overview
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/products"
              className="px-4 py-2 bg-[#831843] hover:bg-rose-900 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5"
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>Manage Catalogue</span>
            </Link>
          </div>
        </div>

        {/* High-Level Metric Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-xs uppercase font-bold tracking-wider">Pending KYC Queue</span>
              <FileCheck className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-3xl font-bold text-stone-900 font-mono">
              {pendingKYC.length} <span className="text-xs font-sans text-amber-700 font-semibold">Verification Queue</span>
            </div>
            <div className="text-xs text-stone-500 pt-1">
              {kycApps.length} total applications on file
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-xs uppercase font-bold tracking-wider">Active Order Enquiries</span>
              <Receipt className="w-4 h-4 text-rose-800" />
            </div>
            <div className="text-3xl font-bold text-stone-900 font-mono">
              {orders.length} <span className="text-xs font-sans text-rose-800 font-semibold">Enquiries</span>
            </div>
            <div className="text-xs text-stone-500 pt-1">
              {totalSetsOrdered} garment sets allocated
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-xs uppercase font-bold tracking-wider">Gross Enquiry Pipeline</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-bold font-mono text-stone-900">
              ₹{totalWholesaleVolume.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-stone-500 pt-1">
              Across Surat & Jaipur divisions
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-stone-400">
              <span className="text-xs uppercase font-bold tracking-wider">Live Kurti Catalogue</span>
              <Boxes className="w-4 h-4 text-sky-600" />
            </div>
            <div className="text-3xl font-bold text-stone-900 font-mono">
              {products.length} <span className="text-xs font-sans text-sky-800 font-semibold">Designs</span>
            </div>
            <div className="text-xs text-stone-500 pt-1">
              {lowStockProducts.length} designs in low stock
            </div>
          </div>

        </div>

        {/* Urgent Action Grid: KYC Approvals & Recent Enquiries */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Pending KYC Applications Review Table */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#831843]" />
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Pending KYC Applications
                </h3>
              </div>
              <Link href="/admin/kyc" className="text-xs font-bold text-[#831843] hover:underline">
                View All ({kycApps.length}) &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {pendingKYC.length > 0 ? (
                pendingKYC.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <strong className="text-stone-900 text-sm block">{app.businessName}</strong>
                      <span className="text-stone-500 font-mono">
                        GSTIN: {app.gstin} &bull; {app.applicantName} ({app.mobile})
                      </span>
                      <div className="text-[10px] text-stone-400 mt-0.5">
                        {app.address?.city}, {app.address?.state} &bull; Applied: {app.submittedAt}
                      </div>
                    </div>

                    <Link
                      href={`/admin/kyc?reviewId=${app.id}`}
                      className="px-3 py-1.5 bg-[#831843] hover:bg-rose-900 text-white rounded-lg font-bold text-[11px] shadow transition whitespace-nowrap"
                    >
                      Audit & Approve
                    </Link>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-stone-500">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  All KYC applications have been reviewed!
                </div>
              )}
            </div>
          </div>

          {/* Recent Order Enquiries */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-800" />
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Recent Wholesale Enquiries
                </h3>
              </div>
              <Link href="/admin/orders" className="text-xs font-bold text-[#831843] hover:underline">
                View All Enquiries &rarr;
              </Link>
            </div>

            <div className="space-y-3">
              {orders.slice(0, 3).map((order) => (
                <div
                  key={order.id}
                  className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-stone-900 text-sm">Order #{order.orderNumber}</strong>
                      <span className="text-[10px] bg-stone-200 px-2 py-0.5 rounded font-bold uppercase">
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-stone-600 mt-0.5">
                      Retailer: <strong>{order.retailerBusinessName}</strong> &bull; {order.totalSets} Sets ({order.totalPieces} Pcs)
                    </div>
                    <div className="text-[10px] text-stone-400">
                      Surat ({order.estimates?.find(e => e.billingEntity?.id === 'entity_a')?.totalSets || 0} Sets) + Jaipur ({order.estimates?.find(e => e.billingEntity?.id === 'entity_b')?.totalSets || 0} Sets)
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-sm font-bold text-rose-900 block">
                      ₹{(order.masterTotal || 0).toLocaleString('en-IN')}
                    </span>
                    <Link
                      href={`/admin/orders?orderId=${order.id}`}
                      className="text-[11px] font-bold text-stone-700 hover:text-stone-900 underline mt-1 inline-block"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Low Stock Lots Warning Banner */}
        {lowStockProducts.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-amber-900 font-serif font-bold text-base">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
              Low Stock Wholesale Lots Notice ({lowStockProducts.length} Designs &le; 8 Sets)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {lowStockProducts.slice(0, 3).map(p => (
                <div key={p.id} className="p-3 bg-white rounded-xl border border-amber-200 flex justify-between items-center">
                  <div>
                    <strong className="text-stone-900 block truncate">{p.name}</strong>
                    <span className="text-[10px] text-stone-500 font-mono">SKU: {p.sku}</span>
                  </div>
                  <span className="font-bold text-amber-800 font-mono bg-amber-100 px-2 py-1 rounded">
                    {p.availableSets} Sets Left
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}