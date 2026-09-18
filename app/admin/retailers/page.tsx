'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Sliders,
  Trash2, 
} from 'lucide-react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { useApp } from '@/lib/context/AppContext';

interface Retailer {
  id: string;
  businessName: string;
  applicantName: string;
  mobile: string;
  gstin: string | null;
  status: string;
  businessType: string;
  city: string | null;
  state: string | null;
  moqOverride: boolean;
  customMoqSets: number | null;
  isActive: boolean;
}

export default function AdminRetailersPage() {
  const { addToast } = useApp();
  const [retailers, setRetailers] = useState<Retailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRetailer, setSelectedRetailer] = useState<Retailer | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const fetchRetailers = async (cursor?: string | null, query = search) => {
    if (cursor) setLoadingMore(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams();
      if (cursor) params.set('cursor', cursor);
      if (query.trim()) params.set('search', query.trim());

      const res = await fetch(`/api/admin/retailers?${params.toString()}`);
      const result = await res.json();

      if (res.ok && result.success) {
        setRetailers(prev => cursor ? [...prev, ...result.data] : result.data);
        setNextCursor(result.nextCursor);
      } else {
        addToast({ type: 'error', title: 'Failed to load retailers', message: result.error || '' });
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchRetailers(null, search), 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && nextCursor && !loadingMore) {
          fetchRetailers(nextCursor);
        }
      },
      { rootMargin: '200px' }
    );

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextCursor, loadingMore]);

  useEffect(() => {
    fetchRetailers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (retailer: Retailer) => {
    if (!window.confirm(`Delete ${retailer.businessName}? This cannot be undone.`)) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/retailers/${retailer.id}`, { method: 'DELETE' });
      const result = await res.json();

      if (!res.ok || !result.success) {
        addToast({ type: 'error', title: 'Delete failed', message: result.error || 'Please try again.' });
        return;
      }

      setRetailers(prev => prev.filter(r => r.id !== retailer.id));
      addToast({ type: 'success', title: 'Retailer deleted', message: `${retailer.businessName} was deleted.` });
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Delete failed', message: 'Something went wrong.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetMOQ = async (retailer: Retailer, permittedMinSets: number | null) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/retailers/${retailer.id}/moq`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permittedMinSets }),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        addToast({ type: 'error', title: 'Update failed', message: result.error || 'Please try again.' });
        setSubmitting(false);
        return;
      }

      addToast({
        type: 'success',
        title: 'MOQ Override Updated',
        message: `${retailer.businessName} minimum set rule changed to ${permittedMinSets ? permittedMinSets + ' Sets' : 'Default (4 Sets)'}.`
      });

      setSelectedRetailer(null);
      await fetchRetailers();
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Update failed', message: 'Something went wrong.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#faf8f5]">
      <AdminSidebar activeTab="retailers" />

      <main className="flex-1 p-6 lg:p-10 space-y-6 overflow-y-auto">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-[#831843]">
              B2B Accounts & Wholesalers
            </span>
            <h1 className="font-serif text-3xl font-bold text-stone-900 mt-1">
              Registered Retailers Directory
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Manage retailer account statuses, verified GSTIN records, and configure tailored MOQ policies.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex items-center justify-between gap-3 text-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by Boutique Name, GSTIN, Mobile..."
              className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rose-900"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-16 bg-white rounded-3xl border border-stone-200 text-center text-xs text-stone-500">
            Loading retailer accounts...
          </div>
        ) : retailers.length > 0 ? (
          <><div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {retailers.map((ret) => (
                <div
                  key={ret.id}
                  className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm hover:shadow-md transition space-y-4 text-xs flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#831843] flex items-center justify-center font-bold font-serif text-lg">
                          {ret.businessName.charAt(0)}
                        </div>
                        <div>
                          <strong className="text-stone-900 text-sm block">{ret.businessName}</strong>
                          <span className="text-[10px] text-stone-500">{ret.applicantName} ({ret.mobile})</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        {ret.businessType === 'drop_shipper' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900">
                            DROP SHIPPER
                          </span>
                        )}
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${ret.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-900' :
                            ret.status === 'APPLICATION_RECEIVED' ? 'bg-amber-100 text-amber-900' :
                              ret.status === 'UNDER_REVIEW' ? 'bg-sky-100 text-sky-900' :
                                ret.status === 'ADDITIONAL_INFORMATION_REQUIRED' ? 'bg-orange-100 text-orange-900' :
                                  'bg-rose-100 text-rose-900'}`}>
                          {ret.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-stone-50 rounded-2xl border border-stone-100 space-y-1 text-stone-600">
                      <div className="flex justify-between">
                        <span>GSTIN:</span>
                        <span className="font-mono font-bold text-stone-800">{ret.gstin || 'Not Required'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Location:</span>
                        <span>{ret.city ? `${ret.city}, ${ret.state}` : 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>MOQ Policy:</span>
                        <strong className={ret.moqOverride ? 'text-amber-800 font-bold' : 'text-stone-700'}>
                          {ret.moqOverride ? `Custom (${ret.customMoqSets} Sets)` : 'Default (4 Sets)'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                    <Link
                      href={`/admin/kyc?search=${encodeURIComponent(ret.businessName)}`}
                      className="text-xs font-semibold text-stone-600 hover:text-stone-900"
                    >
                      View KYC Proofs
                    </Link>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedRetailer(ret)}
                        className="px-3.5 py-1.5 bg-[#831843] hover:bg-rose-900 text-white rounded-lg font-bold text-[11px] shadow transition flex items-center gap-1"
                      >
                        <Sliders className="w-3.5 h-3.5 text-amber-300" />
                        <span>Set MOQ Policy</span>
                      </button>
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => handleDelete(ret)}
                        className="p-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 disabled:opacity-50"
                        title="Delete retailer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div><div ref={loadMoreRef} className="h-8 flex items-center justify-center text-[10px] text-stone-400">
                {loadingMore ? 'Loading more retailers...' : nextCursor ? '' : ''}
              </div></>
        ) : (
          <div className="p-16 bg-white rounded-3xl border border-stone-200 text-center text-xs text-stone-500">
            No retailer accounts found.
          </div>
        )}

      </main>

      {selectedRetailer && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-stone-200 shadow-2xl space-y-5 text-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-stone-900">
                Tailor MOQ for {selectedRetailer.businessName}
              </h3>
              <button onClick={() => setSelectedRetailer(null)} className="text-stone-400 font-bold text-sm">
                &times;
              </button>
            </div>

            <p className="text-stone-600 leading-relaxed">
              Default system MOQ is <strong>4 garment sets</strong> per order. Granting an override allows boutique sample testing.
            </p>

            <div className="space-y-3">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSetMOQ(selectedRetailer, null)}
                className={`w-full p-3 rounded-xl border text-left font-medium transition disabled:opacity-60 ${
                  !selectedRetailer.moqOverride ? 'bg-rose-50 border-rose-300 text-[#831843] font-bold' : 'bg-stone-50 border-stone-200'
                }`}
              >
                <div>Standard Policy: 4 Sets MOQ</div>
                <span className="text-[10px] text-stone-500">Standard wholesale lot policy.</span>
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSetMOQ(selectedRetailer, 2)}
                className={`w-full p-3 rounded-xl border text-left font-medium transition disabled:opacity-60 ${
                  selectedRetailer.moqOverride && selectedRetailer.customMoqSets === 2 ? 'bg-amber-50 border-amber-300 text-amber-950 font-bold' : 'bg-stone-50 border-stone-200'
                }`}
              >
                <div>Boutique Tier: 2 Sets MOQ</div>
                <span className="text-[10px] text-stone-500">Enables high-end boutique sample purchasing.</span>
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleSetMOQ(selectedRetailer, 1)}
                className={`w-full p-3 rounded-xl border text-left font-medium transition disabled:opacity-60 ${
                  selectedRetailer.moqOverride && selectedRetailer.customMoqSets === 1 ? 'bg-amber-50 border-amber-300 text-amber-950 font-bold' : 'bg-stone-50 border-stone-200'
                }`}
              >
                <div>Sample Order Trial: 1 Set MOQ</div>
                <span className="text-[10px] text-stone-500">Single trial set purchase for initial quality verification.</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setSelectedRetailer(null)}
              className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

    </div>
  );
}