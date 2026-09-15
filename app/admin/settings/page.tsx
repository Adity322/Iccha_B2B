'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Save, 
  CheckCircle2, 
  ShieldCheck, 
  Receipt, 
  Truck, 
  Landmark,
  Sparkles
} from 'lucide-react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { EntityService } from '@/lib/services';
import { BillingEntity } from '@/lib/types';
import { useApp } from '@/lib/context/AppContext';

export default function AdminSettingsPage() {
  const { addToast } = useApp();
  const [entities, setEntities] = useState<BillingEntity[]>([]);
  const [loading, setLoading] = useState(true);

  // Editable fields for Entity A (Surat)
  const [entityA, setEntityA] = useState<BillingEntity | null>(null);
  // Editable fields for Entity B (Jaipur)
  const [entityB, setEntityB] = useState<BillingEntity | null>(null);

  useEffect(() => {
    let isMounted = true;
    const runLoad = async () => {
      const data = await EntityService.getEntities();
      if (isMounted) {
        setEntities(data);
        setEntityA(data.find(e => e.id === 'entity_a') || null);
        setEntityB(data.find(e => e.id === 'entity_b') || null);
        setLoading(false);
      }
    };
    runLoad();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveEntity = async (entity: BillingEntity) => {
    await EntityService.updateEntity(entity.id, entity);
    addToast({
      type: 'success',
      title: 'Entity Details Saved',
      message: `${entity.tradeName || entity.legalName} commercial settings updated.`
    });
    const freshEntities = await EntityService.getEntities();
    setEntities(freshEntities);
    setEntityA(freshEntities.find(e => e.id === 'entity_a') || null);
    setEntityB(freshEntities.find(e => e.id === 'entity_b') || null);
  };

  if (loading || !entityA || !entityB) {
    return (
      <div className="flex min-h-screen bg-[#faf8f5]">
        <AdminSidebar activeTab="settings" />
        <main className="flex-1 p-16 text-center text-xs text-stone-500">
          Loading legal entity settings...
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#faf8f5]">
      <AdminSidebar activeTab="settings" />

      <main className="flex-1 p-6 lg:p-10 space-y-8 overflow-y-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-[#831843]">
              Multi-Entity Legal & Tax Hubs
            </span>
            <h1 className="font-serif text-3xl font-bold text-stone-900 mt-1">
              Dual GST Entities & Banking Configuration
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Configure registered legal trade names, GSTINs, state jurisdictions, and official RTGS/NEFT settlement bank accounts.
            </p>
          </div>
        </div>

        {/* Dual Entity Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Entity A: Surat Silk Division */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6 text-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#831843] text-white rounded-2xl">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-bold text-stone-900">
                    Surat Division (GST Entity A)
                  </h2>
                  <span className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">
                    Silk & Festive Jacquard Hub
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-900 text-[10px] font-bold">
                Gujarat State (24)
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-bold text-stone-800 mb-1">Registered Legal Entity Name *</label>
                <input
                  type="text"
                  value={entityA.legalName}
                  onChange={e => setEntityA({ ...entityA, legalName: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium focus:outline-none focus:border-rose-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-800 mb-1">GSTIN Number *</label>
                  <input
                    type="text"
                    value={entityA.gstin}
                    onChange={e => setEntityA({ ...entityA, gstin: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono font-bold text-stone-900 focus:outline-none focus:border-rose-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-800 mb-1">State Code *</label>
                  <input
                    type="text"
                    value={entityA.stateCode}
                    onChange={e => setEntityA({ ...entityA, stateCode: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono focus:outline-none focus:border-rose-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">Warehouse / Factory Address *</label>
                <input
                  type="text"
                  value={entityA.registeredAddress}
                  onChange={e => setEntityA({ ...entityA, registeredAddress: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium focus:outline-none focus:border-rose-900"
                />
              </div>

              {/* Bank Details */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <h4 className="font-serif text-sm font-bold text-stone-900 flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-[#831843]" />
                  RTGS / NEFT Settlement Bank Account
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-700 mb-0.5">Bank Name</label>
                    <input
                      type="text"
                      value={entityA.bankDetails.bankName}
                      onChange={e => setEntityA({ ...entityA, bankDetails: { ...entityA.bankDetails, bankName: e.target.value } })}
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-700 mb-0.5">IFSC Code</label>
                    <input
                      type="text"
                      value={entityA.bankDetails.ifsc}
                      onChange={e => setEntityA({ ...entityA, bankDetails: { ...entityA.bankDetails, ifsc: e.target.value.toUpperCase() } })}
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg font-mono text-xs"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-stone-700 mb-0.5">Current Account Number</label>
                    <input
                      type="text"
                      value={entityA.bankDetails.accountNumber}
                      onChange={e => setEntityA({ ...entityA, bankDetails: { ...entityA.bankDetails, accountNumber: e.target.value } })}
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg font-mono font-bold text-xs"
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSaveEntity(entityA)}
                className="w-full py-3 bg-[#831843] hover:bg-rose-900 text-white font-bold rounded-xl shadow transition flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Surat Entity Configuration</span>
              </button>
            </div>
          </div>

          {/* Entity B: Jaipur Handblock Unit */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6 text-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#9a3412] text-white rounded-2xl">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif text-lg font-bold text-stone-900">
                    Jaipur Unit (GST Entity B)
                  </h2>
                  <span className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">
                    Cotton & Handblock Bagru Hub
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 text-[10px] font-bold">
                Rajasthan State (08)
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-bold text-stone-800 mb-1">Registered Legal Entity Name *</label>
                <input
                  type="text"
                  value={entityB.legalName}
                  onChange={e => setEntityB({ ...entityB, legalName: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium focus:outline-none focus:border-rose-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-800 mb-1">GSTIN Number *</label>
                  <input
                    type="text"
                    value={entityB.gstin}
                    onChange={e => setEntityB({ ...entityB, gstin: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono font-bold text-stone-900 focus:outline-none focus:border-rose-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-800 mb-1">State Code *</label>
                  <input
                    type="text"
                    value={entityB.stateCode}
                    onChange={e => setEntityB({ ...entityB, stateCode: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono focus:outline-none focus:border-rose-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">Warehouse / Factory Address *</label>
                <input
                  type="text"
                  value={entityB.registeredAddress}
                  onChange={e => setEntityB({ ...entityB, registeredAddress: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium focus:outline-none focus:border-rose-900"
                />
              </div>

              {/* Bank Details */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <h4 className="font-serif text-sm font-bold text-stone-900 flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-[#9a3412]" />
                  RTGS / NEFT Settlement Bank Account
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-700 mb-0.5">Bank Name</label>
                    <input
                      type="text"
                      value={entityB.bankDetails.bankName}
                      onChange={e => setEntityB({ ...entityB, bankDetails: { ...entityB.bankDetails, bankName: e.target.value } })}
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-700 mb-0.5">IFSC Code</label>
                    <input
                      type="text"
                      value={entityB.bankDetails.ifsc}
                      onChange={e => setEntityB({ ...entityB, bankDetails: { ...entityB.bankDetails, ifsc: e.target.value.toUpperCase() } })}
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg font-mono text-xs"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-stone-700 mb-0.5">Current Account Number</label>
                    <input
                      type="text"
                      value={entityB.bankDetails.accountNumber}
                      onChange={e => setEntityB({ ...entityB, bankDetails: { ...entityB.bankDetails, accountNumber: e.target.value } })}
                      className="w-full px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg font-mono font-bold text-xs"
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSaveEntity(entityB)}
                className="w-full py-3 bg-[#9a3412] hover:bg-amber-900 text-white font-bold rounded-xl shadow transition flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Jaipur Entity Configuration</span>
              </button>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
