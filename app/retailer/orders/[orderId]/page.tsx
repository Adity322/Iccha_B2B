"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import {
  Building2,
  Receipt,
  Truck,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Printer,
  MapPin,
  PackageCheck,
} from "lucide-react";
import RetailerHeader from "@/components/layout/RetailerHeader";
import Footer from "@/components/layout/Footer";
import EstimateViewModal from "@/components/order/EstimateViewModal";
import { useApp } from "@/lib/context/AppContext";

type OrderDetail = {
  id: string;
  orderNumber: string;
  retailerBusinessName: string;
  retailerApplicantName: string;
  retailerGstin: string | null;
  retailerContact: string;
  retailerEmail: string;
  billingAddress: any;
  shippingAddress: any;
  totalDesigns: number;
  totalSets: number;
  totalPieces: number;
  subtotal: number;
  totalGst: number;
  shipping: number;
  masterTotal: number;
  status: string;
  customerRemarks: string | null;
  internalNotes: string | null;
  createdAt: string;
  updatedAt: string;
  items: any[];
  estimates: any[];
  timeline: {
    id: string;
    status: string;
    actorUserId: string | null;
    actorName: string;
    notes: string | null;
    timestamp: string;
  }[];
};

const ROADMAP = [
  {
    title: "1. Enquiry Logged",
    statuses: ["enquiry_received"],
    desc: "Requirements recorded",
  },
  {
    title: "2. Under Review",
    statuses: ["under_review", "seller_contacted", "estimate_generated"],
    desc: "Order is being processed",
  },
  {
    title: "3. Confirmed / Payment",
    statuses: ["confirmed", "awaiting_payment"],
    desc: "Commercial confirmation",
  },
  {
    title: "4. Processing",
    statuses: ["processing"],
    desc: "Quality & packing",
  },
  {
    title: "5. Ready for Dispatch",
    statuses: ["ready_for_dispatch"],
    desc: "Dispatch preparation",
  },
  {
    title: "6. Dispatched",
    statuses: ["dispatched"],
    desc: "LR / Bilty tracking",
  },
  {
    title: "7. Completed",
    statuses: ["completed"],
    desc: "Order completed",
  },
];

function formatStatus(status: string) {
  return status.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function number(value: unknown) {
  return Number(value ?? 0).toLocaleString("en-IN");
}

export default function RetailerOrderDetailPage() {
  const params = useParams();
  const orderId = params?.orderId as string;
  const { addToast } = useApp();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEstimate, setSelectedEstimate] = useState<any | null>(null);

  useEffect(() => {
    if (!orderId) return;

    let cancelled = false;

    async function loadOrder() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/retailer/order-enquiries/${encodeURIComponent(orderId)}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Could not load this order.");
        }

        if (!cancelled) {
          setOrder(result.data);
        }
      } catch (err) {
        console.error("Load retailer order detail error:", err);

        if (!cancelled) {
          setOrder(null);
          setError(
            err instanceof Error
              ? err.message
              : "Could not load this order."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadOrder();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  const currentStatusIndex = order
    ? ROADMAP.findIndex((step) => step.statuses.includes(order.status))
    : -1;

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <RetailerHeader />
        <main className="flex-1 py-16 text-center text-xs text-stone-500 bg-[#faf8f5]">
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
          <Receipt className="w-10 h-10 text-stone-300 mx-auto" />
          <h2 className="font-serif text-xl font-bold text-stone-900">
            {error || "Order Not Found"}
          </h2>
          <p className="text-xs text-stone-500">
            The order could not be loaded from your order history.
          </p>
          <Link
            href="/retailer/orders"
            className="text-xs text-[#831843] font-bold underline"
          >
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <nav className="text-xs text-stone-500 mb-1 flex items-center gap-2">
                <Link href="/retailer" className="hover:text-stone-900">
                  Retailer Portal
                </Link>
                <span>/</span>
                <Link href="/retailer/orders" className="hover:text-stone-900">
                  Orders
                </Link>
                <span>/</span>
                <span className="text-stone-900 font-semibold">
                  #{order.orderNumber}
                </span>
              </nav>

              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                Order Enquiry #{order.orderNumber}
              </h1>

              <p className="text-xs text-stone-500 mt-1">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>

            <Link
              href="/retailer/orders"
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 self-start"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Orders</span>
            </Link>
          </div>

          {/* Real DB-backed order timeline */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-serif text-base font-bold text-stone-900">
                  Order Timeline
                </h3>
                <p className="text-[11px] text-stone-500 mt-1">
                  Live status history recorded for this order.
                </p>
              </div>

              <span className="px-3 py-1.5 rounded-full bg-rose-50 text-[#831843] border border-rose-200 text-[10px] font-bold uppercase">
                {formatStatus(order.status)}
              </span>
            </div>

            <div className="space-y-3">
              {order.timeline.length > 0 ? (
                order.timeline.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="flex gap-3 items-start"
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-[#831843] text-white flex items-center justify-center shrink-0">
                        {index === order.timeline.length - 1 ? (
                          <PackageCheck className="w-4 h-4" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                      </div>

                      {index < order.timeline.length - 1 && (
                        <div className="w-px h-8 bg-stone-200 mt-1" />
                      )}
                    </div>

                    <div className="pb-2">
                      <div className="font-bold text-xs text-stone-900">
                        {formatStatus(entry.status)}
                      </div>
                      <div className="text-[10px] text-stone-400 mt-0.5">
                        {formatDate(entry.timestamp)} • {entry.actorName}
                      </div>
                      {entry.notes && (
                        <p className="text-[11px] text-stone-600 mt-1">
                          {entry.notes}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-stone-500 bg-stone-50 rounded-2xl p-4">
                  No status history has been recorded yet.
                </div>
              )}
            </div>
          </div>

          {/* Roadmap */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
            <h3 className="font-serif text-base font-bold text-stone-900">
              Wholesale Dispatch Roadmap
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
              {ROADMAP.map((step, index) => {
                const isPassed =
                  currentStatusIndex >= 0 && currentStatusIndex >= index;

                return (
                  <div
                    key={step.title}
                    className={`p-3.5 rounded-2xl border ${
                      isPassed
                        ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                        : "bg-stone-50 border-stone-200 text-stone-400"
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5">
                      {isPassed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-stone-300" />
                      )}
                      <span>{step.title}</span>
                    </div>
                    <div className="text-[10px] text-stone-500 mt-1">
                      {step.desc}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-6">
              {(order.estimates || []).map((estimate) => {
                const isSurat = estimate.billingEntity?.id === "entity_a";

                return (
                  <div
                    key={estimate.id}
                    className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-3 rounded-2xl text-white ${
                            isSurat ? "bg-[#831843]" : "bg-[#9a3412]"
                          }`}
                        >
                          <Building2 className="w-5 h-5" />
                        </div>

                        <div>
                          <h3 className="font-serif text-lg font-bold text-stone-900">
                            {isSurat
                              ? "Surat Manufacturing Hub (Entity A)"
                              : "Jaipur Handblock Hub (Entity B)"}
                          </h3>

                          <div className="text-xs text-stone-500">
                            Legal Name:{" "}
                            <strong>
                              {estimate.billingEntity?.legalName}
                            </strong>{" "}
                            • GSTIN:{" "}
                            <span className="font-mono font-bold text-stone-800">
                              {estimate.billingEntity?.gstin}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedEstimate(estimate)}
                        className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5 text-amber-400" />
                        <span>Print Proforma #{estimate.estimateNumber}</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase text-stone-400 tracking-wider">
                        Allocated Wholesale Lots
                      </h4>

                      {order.items
                        .filter(
                          (item) =>
                            item.billingEntityId === estimate.billingEntityId
                        )
                        .map((item) => (
                          <div
                            key={item.id}
                            className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative w-14 h-16 rounded-xl overflow-hidden bg-stone-200 shrink-0">
                                <Image
                                  src={
                                    item.imageUrl ||
                                    "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400"
                                  }
                                  alt={item.productName}
                                  fill
                                  className="object-cover object-top"
                                  referrerPolicy="no-referrer"
                                />
                              </div>

                              <div>
                                <strong className="text-stone-900 text-sm block">
                                  {item.productName}
                                </strong>
                                <span className="text-[11px] text-stone-500 font-mono">
                                  SKU: {item.sku} • Set:{" "}
                                  {item.sizeCombination}
                                </span>
                              </div>
                            </div>

                            <div className="text-left sm:text-right">
                              <div className="font-bold text-stone-900">
                                {item.sets} Sets × ₹{number(item.setRate)}
                              </div>
                              <span className="text-[11px] font-mono text-rose-900 font-bold">
                                = ₹{number(item.lineSubtotal)}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>

                    <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-1.5 text-xs">
                      <div className="flex justify-between text-stone-600">
                        <span>Taxable Amount:</span>
                        <span className="font-mono">
                          ₹{number(estimate.taxableSubtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-stone-600">
                        <span>GST:</span>
                        <span className="font-mono">
                          ₹{number(estimate.totalGst)}
                        </span>
                      </div>
                      <div className="flex justify-between text-stone-600">
                        <span>Surface Freight:</span>
                        <span className="font-mono">
                          ₹{number(estimate.shippingCharge)}
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline pt-2 border-t border-stone-200 font-bold text-stone-900">
                        <span>Division Proforma Total:</span>
                        <span className="font-mono text-base text-[#831843]">
                          ₹{number(estimate.grandTotal)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="lg:col-span-4 space-y-6 text-xs">
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-md space-y-4">
                <h3 className="font-serif text-base font-bold text-stone-900">
                  Master Commercial Summary
                </h3>

                <div className="space-y-2 text-stone-600">
                  <div className="flex justify-between">
                    <span>Total Garment Sets:</span>
                    <strong className="text-stone-900">
                      {number(order.totalSets)} Sets ({number(order.totalPieces)}{" "}
                      pcs)
                    </strong>
                  </div>

                  <div className="flex justify-between">
                    <span>Grand Taxable:</span>
                    <span className="font-mono">
                      ₹{number(order.subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Total GST:</span>
                    <span className="font-mono">
                      ₹{number(order.totalGst)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Total Freight:</span>
                    <span className="font-mono">
                      ₹{number(order.shipping)}
                    </span>
                  </div>

                  <div className="flex justify-between items-baseline pt-3 border-t-2 border-stone-900 text-stone-900 font-bold">
                    <span className="text-sm">Grand Total:</span>
                    <span className="font-serif text-xl font-mono text-[#831843]">
                      ₹{number(order.masterTotal)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-3">
                <h4 className="font-serif text-sm font-bold text-stone-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-800" />
                  Consignee & Shipping Destination
                </h4>

                <div className="text-stone-700 leading-relaxed">
                  <strong>{order.retailerBusinessName}</strong>
                  <div>{order.shippingAddress?.street}</div>
                  <div>
                    {order.shippingAddress?.city},{" "}
                    {order.shippingAddress?.state} -{" "}
                    {order.shippingAddress?.pincode}
                  </div>
                  <div className="mt-1 text-stone-500">
                    Contact: {order.retailerContact}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-2">
                <h4 className="font-serif text-sm font-bold text-stone-900 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#831843]" />
                  Logistics & Transport Instructions
                </h4>
                <p className="text-stone-600">
                  {order.customerRemarks || "Direct road express transport"}
                </p>
              </div>
            </div>
          </div>
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
