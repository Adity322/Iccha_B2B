"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock3, Package, Store, Warehouse } from "lucide-react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { useApp } from "@/lib/context/AppContext";

type Item = {
  id: string; productName: string; sku: string; designNumber: string;
  categoryName: string; sets: number; totalPieces: number;
  lineSubtotal: number; gstAmount: number; totalWithGst: number;
  imageUrl?: string | null;
  product?: {
    vendorId: string | null;
    vendor?: { id: string; businessName: string } | null;
    warehouse?: { id: string; name: string; city: string | null; state: string | null } | null;
  };
};

type History = { id: string; status: string; actorName: string; notes: string | null; createdAt: string };

type Order = {
  id: string; orderNumber: string; retailerBusinessName: string;
  retailerApplicantName: string; retailerContact: string; retailerEmail: string;
  status: string; totalDesigns: number; totalSets: number; totalPieces: number;
  subtotal: number; totalGst: number; shipping: number; masterTotal: number;
  createdAt: string; items: Item[]; history: History[]; scope: "admin" | "vendor";
};

function money(v: number) { return `₹${v.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`; }
function label(v: string) { return v.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase()); }

export default function AdminOrderDetailPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { addToast } = useApp();
  const [id, setId] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { params.then(p => setId(p.orderId)); }, [params]);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/order-enquiries/${encodeURIComponent(id)}`)
      .then(async r => {
        const j = await r.json();
        if (!r.ok || !j.success) throw new Error(j.error || "Could not load order.");
        setOrder(j.data);
      })
      .catch(e => addToast({ type: "error", title: "Could not load order", message: e instanceof Error ? e.message : "Order could not be loaded." }))
      .finally(() => setLoading(false));
  }, [id, addToast]);

  if (loading) return <div className="flex min-h-screen bg-[#faf8f5]"><AdminSidebar activeTab="orders" /><main className="flex-1 flex items-center justify-center text-xs text-stone-500">Loading order...</main></div>;

  if (!order) return <div className="flex min-h-screen bg-[#faf8f5]"><AdminSidebar activeTab="orders" /><main className="flex-1 p-6 lg:p-10"><Link href="/admin/orders" className="inline-flex items-center gap-2 text-xs font-bold text-stone-600"><ArrowLeft className="w-4 h-4" />Back to Order Enquiries</Link><div className="mt-8 bg-white rounded-3xl border p-10 text-center"><Package className="w-8 h-8 mx-auto text-stone-300" /><h1 className="font-serif text-2xl font-bold mt-3">Order not found</h1></div></main></div>;

  return (
    <div className="flex min-h-screen bg-[#faf8f5]">
      <AdminSidebar activeTab="orders" />
      <main className="flex-1 p-6 lg:p-10 space-y-6 overflow-y-auto">
        <Link href="/admin/orders" className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-[#831843]"><ArrowLeft className="w-4 h-4" />Back to Order Enquiries</Link>

        <div className="border-b border-stone-200 pb-6">
          <span className="text-xs uppercase font-bold tracking-widest text-[#831843]">Order Enquiry</span>
          <h1 className="font-serif text-3xl font-bold text-stone-900 mt-1">{order.orderNumber}</h1>
          <p className="text-xs text-stone-500 mt-1">{order.scope === "vendor" ? "Only products belonging to your vendor account are shown." : "Complete master order."}</p>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-3xl border border-stone-200 p-5"><p className="text-[10px] uppercase tracking-widest text-stone-400">Retailer</p><p className="font-bold mt-2">{order.retailerBusinessName}</p><p className="text-xs text-stone-500 mt-1">{order.retailerApplicantName}</p><p className="text-xs text-stone-500 mt-1">{order.retailerContact}</p></div>
          <div className="bg-white rounded-3xl border border-stone-200 p-5"><p className="text-[10px] uppercase tracking-widest text-stone-400">Summary</p><div className="grid grid-cols-3 gap-3 mt-3"><div><p className="text-[10px] text-stone-400">Designs</p><p className="font-bold">{order.totalDesigns}</p></div><div><p className="text-[10px] text-stone-400">Sets</p><p className="font-bold">{order.totalSets}</p></div><div><p className="text-[10px] text-stone-400">Pieces</p><p className="font-bold">{order.totalPieces}</p></div></div></div>
          <div className="bg-white rounded-3xl border border-stone-200 p-5"><p className="text-[10px] uppercase tracking-widest text-stone-400">Visible Value</p><p className="font-serif text-2xl font-bold text-[#831843] mt-2">{money(order.masterTotal)}</p><p className="text-[11px] text-stone-500 mt-1">Subtotal {money(order.subtotal)} + GST {money(order.totalGst)}</p></div>
        </section>

        <section className="bg-white rounded-3xl border border-stone-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100"><h2 className="font-serif text-xl font-bold">Ordered Products</h2></div>
          <div className="divide-y divide-stone-100">
            {order.items.map(item => (
              <div key={item.id} className="p-5 flex flex-col lg:flex-row gap-5">
                <div className="w-20 h-20 rounded-2xl bg-stone-100 overflow-hidden shrink-0">
                  {item.imageUrl ? <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="w-6 h-6 text-stone-300" /></div>}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between gap-4"><div><h3 className="font-bold">{item.productName}</h3><p className="text-xs text-stone-500 mt-1">SKU {item.sku} · Design {item.designNumber}</p><p className="text-xs text-stone-500 mt-1">{item.categoryName}</p></div><p className="font-bold text-[#831843]">{money(item.totalWithGst)}</p></div>
                  <div className="grid grid-cols-3 gap-3 mt-4"><div className="rounded-xl bg-stone-50 p-3"><p className="text-[10px] text-stone-400">Sets</p><p className="font-bold">{item.sets}</p></div><div className="rounded-xl bg-stone-50 p-3"><p className="text-[10px] text-stone-400">Pieces</p><p className="font-bold">{item.totalPieces}</p></div><div className="rounded-xl bg-stone-50 p-3"><p className="text-[10px] text-stone-400">GST</p><p className="font-bold">{money(item.gstAmount)}</p></div></div>
                  <div className="flex flex-wrap gap-3 mt-4">
                    {item.product?.vendor && <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-50 border border-rose-100 text-[11px] font-bold text-[#831843]"><Store className="w-3.5 h-3.5" />{item.product.vendor.businessName}</div>}
                    {item.product?.warehouse && <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-stone-50 border border-stone-200 text-[11px] text-stone-600"><Warehouse className="w-3.5 h-3.5" />{item.product.warehouse.name}{item.product.warehouse.city ? ` · ${item.product.warehouse.city}` : ""}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-3xl border border-stone-200 p-5">
          <div className="flex items-center gap-2"><Clock3 className="w-5 h-5 text-[#831843]" /><h2 className="font-serif text-xl font-bold">Order Timeline</h2></div>
          <div className="mt-6 space-y-5">
            {order.history.map((h, i) => <div key={h.id} className="flex gap-4"><div className="flex flex-col items-center"><div className={`w-3 h-3 rounded-full ${i === order.history.length - 1 ? "bg-[#831843]" : "bg-stone-300"}`} />{i < order.history.length - 1 && <div className="w-px flex-1 bg-stone-200 mt-1" />}</div><div><p className="font-bold text-sm">{label(h.status)}</p><p className="text-[11px] text-stone-400 mt-1">{new Date(h.createdAt).toLocaleString("en-IN")} · {h.actorName}</p>{h.notes && <p className="text-xs text-stone-500 mt-2">{h.notes}</p>}</div></div>)}
          </div>
        </section>
      </main>
    </div>
  );
}
