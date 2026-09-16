"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Clock3,
  Package,
  Search,
  ShoppingBag,
  Store,
} from "lucide-react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { useApp } from "@/lib/context/AppContext";

type Vendor = {
  id: string;
  businessName: string;
  contactName?: string;
};

type Item = {
  id: string;
  designNumber: string;
  sets: number;
};

type Order = {
  id: string;
  orderNumber: string;
  retailerBusinessName: string;
  retailerApplicantName: string;
  status: string;
  totalDesigns: number;
  totalSets: number;
  totalPieces: number;
  masterTotal: number;
  createdAt: string;
  items: Item[];
};

const statusClass: Record<string, string> = {
  ENQUIRY_RECEIVED: "bg-amber-50 text-amber-700 border-amber-200",
  UNDER_REVIEW: "bg-blue-50 text-blue-700 border-blue-200",
  SELLER_CONTACTED: "bg-violet-50 text-violet-700 border-violet-200",
  ESTIMATE_GENERATED: "bg-indigo-50 text-indigo-700 border-indigo-200",
  CONFIRMED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  AWAITING_PAYMENT: "bg-orange-50 text-orange-700 border-orange-200",
  PROCESSING: "bg-cyan-50 text-cyan-700 border-cyan-200",
  READY_FOR_DISPATCH: "bg-teal-50 text-teal-700 border-teal-200",
  DISPATCHED: "bg-green-50 text-green-700 border-green-200",
  COMPLETED: "bg-stone-100 text-stone-700 border-stone-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

function money(v: number) {
  return `₹${v.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function label(v: string) {
  return v.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

export default function AdminOrdersPage() {
  const { addToast } = useApp();
  const [role, setRole] = useState<string | null>(null);
  const [loadingRole, setLoadingRole] = useState(true);
  const [view, setView] = useState<"mine" | "vendor">("mine");
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [vendorLoading, setVendorLoading] = useState(false);
  const [search, setSearch] = useState("");

  const loadOrders = useCallback(async (mode: "mine" | "vendor", vendorId?: string) => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      p.set("view", mode);
      if (mode === "vendor" && vendorId) p.set("vendorId", vendorId);
      if (search.trim()) p.set("search", search.trim());

      const res = await fetch(`/api/admin/order-enquiries?${p.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Could not load orders.");
      setOrders(json.data || []);
    } catch (e) {
      addToast({
        type: "error",
        title: "Failed to load orders",
        message: e instanceof Error ? e.message : "Could not load orders.",
      });
    } finally {
      setLoading(false);
    }
  }, [addToast, search]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(json => {
        if (!json.success) return;
        const r = json.data.role;
        setRole(r);
        loadOrders("mine");
      })
      .catch(() => addToast({
        type: "error",
        title: "Authentication error",
        message: "Could not determine the current user.",
      }))
      .finally(() => setLoadingRole(false));
  }, [addToast, loadOrders]);

  async function loadVendors() {
    setVendorLoading(true);
    try {
      const res = await fetch("/api/admin/vendors");
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Could not load vendors.");
      setVendors(json.data || []);
    } catch (e) {
      addToast({
        type: "error",
        title: "Failed to load vendors",
        message: e instanceof Error ? e.message : "Could not load vendors.",
      });
    } finally {
      setVendorLoading(false);
    }
  }

  function selectVendor(vendor: Vendor) {
    setSelectedVendor(vendor);
    setView("vendor");
    loadOrders("vendor", vendor.id);
  }

  function openMine() {
    setSelectedVendor(null);
    setView("mine");
    loadOrders("mine");
  }

  if (loadingRole) {
    return <div className="flex min-h-screen bg-[#faf8f5]"><AdminSidebar activeTab="orders" /><main className="flex-1 flex items-center justify-center text-xs text-stone-500">Loading...</main></div>;
  }

  return (
    <div className="flex min-h-screen bg-[#faf8f5]">
      <AdminSidebar activeTab="orders" />
      <main className="flex-1 p-6 lg:p-10 space-y-6 overflow-y-auto">
        <div className="border-b border-stone-200 pb-6">
          <span className="text-xs uppercase font-bold tracking-widest text-[#831843]">Order Management</span>
          <h1 className="font-serif text-3xl font-bold text-stone-900 mt-1">
            {role === "VENDOR" ? "My Order Enquiries" : view === "vendor" && selectedVendor ? `${selectedVendor.businessName} Orders` : "My Orders"}
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            {role === "VENDOR" ? "Only enquiries containing your products are visible." : "Use the two sections below to separate IcchaStore orders from vendor orders."}
          </p>
        </div>

        {role !== "VENDOR" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onClick={openMine} className={`text-left rounded-3xl border p-5 ${view === "mine" ? "bg-[#831843] text-white border-[#831843]" : "bg-white border-stone-200"}`}>
              <Store className="w-5 h-5 mb-3" />
              <div className="text-xs uppercase tracking-widest font-bold opacity-70">Section 01</div>
              <h2 className="font-serif text-xl font-bold mt-1">My Orders</h2>
              <p className="text-xs opacity-70 mt-1">IcchaStore-owned product orders</p>
            </button>

            <button onClick={() => { setView("vendor"); setSelectedVendor(null); setOrders([]); loadVendors(); }} className={`text-left rounded-3xl border p-5 ${view === "vendor" ? "bg-[#831843] text-white border-[#831843]" : "bg-white border-stone-200"}`}>
              <Building2 className="w-5 h-5 mb-3" />
              <div className="text-xs uppercase tracking-widest font-bold opacity-70">Section 02</div>
              <h2 className="font-serif text-xl font-bold mt-1">Vendor Orders</h2>
              <p className="text-xs opacity-70 mt-1">Select one vendor at a time</p>
            </button>
          </div>
        )}

        {role !== "VENDOR" && view === "vendor" && (
          <section className="bg-white rounded-3xl border border-stone-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-serif text-lg font-bold text-stone-900">Select Vendor</h2>
                <p className="text-xs text-stone-500">Only the selected vendor&apos;s orders are loaded.</p>
              </div>
              {vendorLoading && <span className="text-xs text-stone-500">Loading...</span>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {vendors.map(v => (
                <button key={v.id} onClick={() => selectVendor(v)} className={`text-left p-4 rounded-2xl border ${selectedVendor?.id === v.id ? "border-[#831843] bg-rose-50" : "border-stone-200 bg-stone-50 hover:bg-white"}`}>
                  <p className="font-bold text-sm text-stone-900">{v.businessName}</p>
                  <p className="text-[11px] text-stone-500 mt-1">{v.contactName || "Vendor"}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        <form onSubmit={e => { e.preventDefault(); loadOrders(view, selectedVendor?.id); }} className="bg-white rounded-2xl p-4 border border-stone-200 flex items-center gap-3">
          <Search className="w-4 h-4 text-stone-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search order number or retailer..." className="flex-1 bg-transparent text-xs outline-none" />
          <button className="px-4 py-2 bg-stone-800 text-white rounded-xl text-xs font-bold">Search</button>
        </form>

        {view === "vendor" && role !== "VENDOR" && !selectedVendor ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-10 text-center">
            <Building2 className="w-8 h-8 mx-auto text-stone-300" />
            <h3 className="font-serif text-xl font-bold mt-3">Select a vendor</h3>
          </div>
        ) : loading ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-10 text-center text-xs text-stone-500">Loading order enquiries...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-10 text-center">
            <Package className="w-8 h-8 mx-auto text-stone-300" />
            <h3 className="font-serif text-xl font-bold mt-3">No order enquiries</h3>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <Link key={order.id} href={`/admin/orders/${order.id}`} className="block bg-white rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition">
                <div className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-stone-900">{order.orderNumber}</span>
                        <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold ${statusClass[order.status] || "bg-stone-50 text-stone-600 border-stone-200"}`}>{label(order.status)}</span>
                      </div>
                      <p className="text-sm font-semibold text-stone-800 mt-2">{order.retailerBusinessName}</p>
                      <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mt-1"><Clock3 className="w-3.5 h-3.5" />{new Date(order.createdAt).toLocaleString("en-IN")}</div>
                    </div>
                    <div className="flex items-center gap-7">
                      <div><p className="text-[10px] text-stone-400 uppercase">Sets</p><p className="font-bold">{order.totalSets}</p></div>
                      <div><p className="text-[10px] text-stone-400 uppercase">Products</p><p className="font-bold">{order.items.length}</p></div>
                      <div className="text-right"><p className="text-[10px] text-stone-400 uppercase">Value</p><p className="font-bold text-[#831843]">{money(order.masterTotal)}</p></div>
                      <ArrowRight className="w-5 h-5 text-stone-300" />
                    </div>
                  </div>
                  <div className="mt-5 pt-4 border-t border-stone-100 flex flex-wrap gap-2">
                    {order.items.slice(0, 5).map(i => <span key={i.id} className="px-2.5 py-1.5 rounded-lg bg-stone-50 border border-stone-100 text-[10px] text-stone-600">{i.designNumber} · {i.sets} sets</span>)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
