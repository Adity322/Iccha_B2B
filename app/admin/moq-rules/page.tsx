'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sliders, 
  Save, 
  CheckCircle2, 
  Users, 
  Building2, 
  Sparkles, 
  Plus, 
  Search,
  ShieldCheck
} from 'lucide-react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { MOQService, RetailerService } from '@/lib/services';
import { MOQRuleConfig, Retailer } from '@/lib/types';
import { useApp } from '@/lib/context/AppContext';

export default function AdminMOQRulesPage() {
  const { addToast } = useApp();
  const [config, setConfig] = useState<MOQRuleConfig | null>(null);
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [minSets, setMinSets] = useState(4);
  const [allowSampleOrders, setAllowSampleOrders] = useState(true);
  const [sampleOrderMaxSets, setSampleOrderMaxSets] = useState(2);
  const [entitySpecificMOQ, setEntitySpecificMOQ] = useState(false);
  const [minSuratSets, setMinSuratSets] = useState(2);
  const [minJaipurSets, setMinJaipurSets] = useState(2);

  useEffect(() => {
    let isMounted = true;
    const runLoad = async () => {
      const [c, r] = await Promise.all([
        MOQService.getConfig(),
        RetailerService.getRetailers()
      ]);
      if (isMounted) {
        setConfig(c);
        setMinSets(c.minimumSetsPerOrder);
        setAllowSampleOrders(c.allowSampleOrders);
        setSampleOrderMaxSets(c.sampleOrderMaxSets);
        setEntitySpecificMOQ(c.entitySpecificMOQ);
        setMinSuratSets(c.entityRules?.entity_a?.minimumSets || 2);
        setMinJaipurSets(c.entityRules?.entity_b?.minimumSets || 2);
        setRetailers(r);
        setLoading(false);
      }
    };
    runLoad();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSaveGlobalMOQ = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = await MOQService.updateConfig({
      minimumSetsPerOrder: Number(minSets),
      allowSampleOrders,
      sampleOrderMaxSets: Number(sampleOrderMaxSets),
      entitySpecificMOQ,
      entityRules: {
        entity_a: { entityId: 'entity_a', minimumSets: Number(minSuratSets) },
        entity_b: { entityId: 'entity_b', minimumSets: Number(minJaipurSets) }
      }
    });

    setConfig(updated);
    addToast({
      type: 'success',
      title: 'MOQ Policy Saved',
      message: `Global wholesale minimum set requirement updated to ${minSets} sets.`
    });
  };

  const handleToggleRetailerOverride = async (retailerId: string, override: boolean, val: number) => {
    await RetailerService.setMOQOverride(retailerId, override, val);
    addToast({
      type: 'info',
      title: 'Override Modified',
      message: 'Retailer custom MOQ updated.'
    });
    const freshRetailers = await RetailerService.getRetailers();
    setRetailers(freshRetailers);
  };

  return (
    <div className="flex min-h-screen bg-[#faf8f5]">
      <AdminSidebar activeTab="moq" />

      <main className="flex-1 p-6 lg:p-10 space-y-8 overflow-y-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-[#831843]">
              Commercial Order Rules
            </span>
            <h1 className="font-serif text-3xl font-bold text-stone-900 mt-1">
              Minimum Order Quantity (MOQ) Policy
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Enforce factory lot dispatch minimums, sample testing privileges, and retailer-specific overrides.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Global Policy Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6 text-xs">
            <div className="border-b border-stone-100 pb-3">
              <h2 className="font-serif text-lg font-bold text-stone-900">
                1. System-Wide Default MOQ Rules
              </h2>
              <p className="text-stone-500 text-[11px] mt-0.5">
                Applied to all newly approved wholesale retailers by default.
              </p>
            </div>

            <form onSubmit={handleSaveGlobalMOQ} className="space-y-5">
              
              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  Global Minimum Garment Sets per Order *
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={50}
                    required
                    value={minSets}
                    onChange={e => setMinSets(Number(e.target.value))}
                    className="w-32 px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono text-base font-bold text-stone-900 focus:outline-none focus:border-rose-900"
                  />
                  <span className="text-stone-500">Sets per checkout (4 pieces per set = {minSets * 4} total pieces)</span>
                </div>
              </div>

              {/* Sample Orders Option */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <label className="flex items-center gap-2.5 font-bold text-stone-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowSampleOrders}
                    onChange={e => setAllowSampleOrders(e.target.checked)}
                    className="rounded text-[#831843]"
                  />
                  <span>Enable &quot;Request Sample / Video Call&quot; for Below-MOQ Carts</span>
                </label>
                <p className="text-[11px] text-stone-500 leading-relaxed">
                  When enabled, retailers with fewer sets in their cart can request an official merchandising video call or submit a sample approval request.
                </p>

                {allowSampleOrders && (
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-stone-700 font-semibold">Max Sample Sets Allowed:</span>
                    <input
                      type="number"
                      min={1}
                      max={3}
                      value={sampleOrderMaxSets}
                      onChange={e => setSampleOrderMaxSets(Number(e.target.value))}
                      className="w-20 px-2.5 py-1 bg-white border border-stone-300 rounded-lg font-mono font-bold"
                    />
                  </div>
                )}
              </div>

              {/* Entity Specific MOQ Option */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <label className="flex items-center gap-2.5 font-bold text-stone-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={entitySpecificMOQ}
                    onChange={e => setEntitySpecificMOQ(e.target.checked)}
                    className="rounded text-[#831843]"
                  />
                  <span>Enable Per-Hub Specific MOQ (Surat vs. Jaipur)</span>
                </label>

                {entitySpecificMOQ && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">Surat Hub (GST A)</label>
                      <input
                        type="number"
                        value={minSuratSets}
                        onChange={e => setMinSuratSets(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">Jaipur Hub (GST B)</label>
                      <input
                        type="number"
                        value={minJaipurSets}
                        onChange={e => setMinJaipurSets(Number(e.target.value))}
                        className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg font-mono font-bold"
                      />
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#831843] hover:bg-rose-900 text-white font-bold rounded-xl shadow transition flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Save Global MOQ Rules</span>
              </button>

            </form>
          </div>

          {/* Right: Retailer Specific Overrides Matrix */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4 text-xs">
            <div className="border-b border-stone-100 pb-3">
              <h2 className="font-serif text-lg font-bold text-stone-900">
                2. Retailer Custom Overrides
              </h2>
              <p className="text-stone-500 text-[11px] mt-0.5">
                Grant tailored privileges for premium boutique clients or new trial accounts.
              </p>
            </div>

            <div className="space-y-3">
              {retailers.map(ret => (
                <div
                  key={ret.id}
                  className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <strong className="text-stone-900 text-sm">{ret.businessName}</strong>
                    <span className="font-mono text-[10px] text-stone-500">{ret.address?.city || 'India'}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-stone-600">Active MOQ:</span>
                    <select
                      value={ret.moqOverride ? (ret.customMoqSets || 1) : 'default'}
                      onChange={e => {
                        const v = e.target.value;
                        if (v === 'default') {
                          handleToggleRetailerOverride(ret.id, false, 4);
                        } else {
                          handleToggleRetailerOverride(ret.id, true, Number(v));
                        }
                      }}
                      className="px-2.5 py-1 bg-white border border-stone-300 rounded-lg font-bold text-stone-800"
                    >
                      <option value="default">Default ({minSets} Sets)</option>
                      <option value={1}>1 Set (Sample Trial)</option>
                      <option value={2}>2 Sets (Boutique Tier)</option>
                      <option value={3}>3 Sets</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
