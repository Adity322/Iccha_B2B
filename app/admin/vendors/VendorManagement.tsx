"use client";

import React, { useEffect, useRef, useState } from "react";
import { Search, ArrowDownCircle, Trash2, Store, Loader2 } from "lucide-react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { useApp } from "@/lib/context/AppContext";

interface Vendor {
  id: string;
  userId: string;
  businessName: string;
  contactName: string;
  mobile: string;
  gstin: string;
  isActive: boolean;
  createdAt: string;
  _count: { products: number };
}

export default function VendorManagement() {
  const { addToast } = useApp();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [search, setSearch] = useState("");
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const fetchVendors = async (cursor?: string | null, query = search) => {
    if (cursor) setLoadingMore(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams();
      if (cursor) params.set("cursor", cursor);
      if (query.trim()) params.set("search", query.trim());

      const res = await fetch(`/api/admin/vendors?${params.toString()}`, { cache: "no-store" });
      const result = await res.json();

      if (!res.ok || !result.success) {
        addToast({ type: "error", title: "Failed to load vendors", message: result.error || "Please try again." });
        return;
      }

      setVendors((current) => (cursor ? [...current, ...result.data] : result.data));
      setNextCursor(result.nextCursor);
    } catch {
      addToast({ type: "error", title: "Failed to load vendors", message: "Something went wrong." });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => fetchVendors(null, search), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && nextCursor && !loadingMore) fetchVendors(nextCursor);
      },
      { rootMargin: "200px" }
    );

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [nextCursor, loadingMore]);

  const handleDemote = async (vendor: Vendor) => {
    if (!window.confirm(`Demote ${vendor.businessName} to retailer?`)) return;
    setActionId(vendor.id);

    try {
      const res = await fetch(`/api/admin/users/${vendor.userId}/demote-vendor`, { method: "PATCH" });
      const result = await res.json();

      if (!res.ok || !result.success) {
        addToast({ type: "error", title: "Demotion failed", message: result.error || "Please try again." });
        return;
      }

      setVendors((current) => current.filter((item) => item.id !== vendor.id));
      addToast({ type: "success", title: "Vendor demoted", message: `${vendor.businessName} is now a retailer.` });
    } catch {
      addToast({ type: "error", title: "Demotion failed", message: "Something went wrong." });
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (vendor: Vendor) => {
    if (!window.confirm(`Permanently delete ${vendor.businessName}? This cannot be undone.`)) return;
    setActionId(vendor.id);

    try {
      const res = await fetch(`/api/admin/vendors/${vendor.id}`, { method: "DELETE" });
      const result = await res.json();

      if (!res.ok || !result.success) {
        addToast({ type: "error", title: "Delete failed", message: result.error || "Please try again." });
        return;
      }

      setVendors((current) => current.filter((item) => item.id !== vendor.id));
      addToast({ type: "success", title: "Vendor deleted", message: `${vendor.businessName} was deleted.` });
    } catch {
      addToast({ type: "error", title: "Delete failed", message: "Something went wrong." });
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#faf8f5]">
      <AdminSidebar activeTab="vendors" />
      <main className="flex-1 p-6 lg:p-10 space-y-6 overflow-y-auto">
        <div className="border-b border-stone-200 pb-6">
          <span className="text-xs uppercase font-bold tracking-widest text-[#831843]">Vendor Management</span>
          <h1 className="font-serif text-3xl font-bold text-stone-900 mt-1">Vendors</h1>
          <p className="text-xs text-stone-500 mt-0.5">Manage all vendor accounts registered on the platform.</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex items-center gap-3 text-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by business name, contact, GSTIN..."
              className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rose-900"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-16 bg-white rounded-3xl border border-stone-200 text-center text-xs text-stone-500">Loading vendors...</div>
        ) : (
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden text-xs">
            <table className="w-full">
              <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="text-left p-4">Business</th>
                  <th className="text-left p-4">Contact</th>
                  <th className="text-left p-4">GSTIN</th>
                  <th className="text-left p-4">Products</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-right p-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {vendors.map((vendor) => (
                  <tr key={vendor.id} className="border-t border-stone-100">
                    <td className="p-4">
                      <div className="font-semibold text-stone-900">{vendor.businessName}</div>
                      <div className="text-stone-500 mt-0.5">{vendor.mobile}</div>
                    </td>
                    <td className="p-4 text-stone-600">{vendor.contactName}</td>
                    <td className="p-4 text-stone-600">{vendor.gstin}</td>
                    <td className="p-4 text-stone-600">{vendor._count.products}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${vendor.isActive ? "bg-emerald-100 text-emerald-800" : "bg-stone-100 text-stone-600"}`}>
                        {vendor.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          disabled={actionId === vendor.id}
                          onClick={() => handleDemote(vendor)}
                          className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg font-bold text-[11px] inline-flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <ArrowDownCircle className="w-3.5 h-3.5" /> Demote
                        </button>
                        <button
                          type="button"
                          disabled={actionId === vendor.id}
                          onClick={() => handleDelete(vendor)}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-bold text-[11px] inline-flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {actionId === vendor.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {vendors.length === 0 && <div className="p-12 text-center text-stone-500">No vendors found.</div>}
            <div ref={loadMoreRef} className="h-10 flex items-center justify-center">
              {loadingMore && <Loader2 className="w-4 h-4 animate-spin text-stone-400" />}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
