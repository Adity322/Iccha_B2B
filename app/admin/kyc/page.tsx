'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  FileText,
} from 'lucide-react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { useApp } from '@/lib/context/AppContext';

type KycStatus =
  | 'APPLICATION_RECEIVED'
  | 'UNDER_REVIEW'
  | 'ADDITIONAL_INFORMATION_REQUIRED'
  | 'APPROVED'
  | 'REJECTED'
  | 'SUSPENDED';

interface KycApplication {
  id: string;
  status: KycStatus;
  businessName: string;
  applicantName: string;
  mobile: string;
  email: string;
  gstin: string | null;
  pan: string | null;
  businessType?: string;
  submittedAt: string;
  reviewedAt: string | null;
  rejectionReason: string | null;
  infoRequestNotes: string | null;
  documents: { id: string; name: string; type: string; size: string }[];
}

function AdminKYCContent() {
  const searchParams = useSearchParams();
  const reviewIdParam = searchParams.get('reviewId');
  const { addToast } = useApp();

  const [applications, setApplications] = useState<KycApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<KycApplication | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [reviewerRemarks, setReviewerRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/kyc');
    const result = await res.json();
    if (res.ok && result.success) {
      setApplications(result.data);
      if (reviewIdParam) {
        const found = result.data.find((a: KycApplication) => a.id === reviewIdParam);
        if (found) setSelectedApp(found);
      }
    } else {
      addToast({ type: 'error', title: 'Failed to load applications', message: result.error || '' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviewIdParam]);

  const filteredApps = applications.filter(a => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        a.businessName.toLowerCase().includes(q) ||
        (a.gstin || '').toLowerCase().includes(q) ||
        a.applicantName.toLowerCase().includes(q) ||
        a.mobile.includes(q)
      );
    }
    return true;
  });

  const handleUpdateStatus = async (action: 'approve' | 'reject' | 'request_info') => {
    if (!selectedApp) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/kyc/${selectedApp.id}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes: reviewerRemarks }),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        addToast({ type: 'error', title: 'Update failed', message: result.error || 'Please try again.' });
        setSubmitting(false);
        return;
      }

      addToast({
        type: 'success',
        title: `Application ${result.data.status.replace('_', ' ')}`,
        message: `${selectedApp.businessName} updated.`
      });

      setSelectedApp(null);
      setReviewerRemarks('');
      await fetchApplications();
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Update failed', message: 'Something went wrong.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#faf8f5]">
      <AdminSidebar activeTab="kyc" />

      <main className="flex-1 p-6 lg:p-10 space-y-6 overflow-y-auto">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-[#831843]">
              Retailer Onboarding Verification
            </span>
            <h1 className="font-serif text-3xl font-bold text-stone-900 mt-1">
              KYC & Trade License Applications
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Verify GSTINs, proof documents, and activate wholesale pricing access for verified retailers.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by Business Name, GSTIN, Phone, Owner..."
              className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rose-900"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {['all', 'APPLICATION_RECEIVED', 'UNDER_REVIEW', 'ADDITIONAL_INFORMATION_REQUIRED', 'APPROVED', 'REJECTED'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                  statusFilter === st
                    ? 'bg-[#831843] text-white shadow'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {st.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-16 bg-white rounded-3xl border border-stone-200 text-center text-xs text-stone-500">
            Loading KYC records...
          </div>
        ) : filteredApps.length > 0 ? (
          <div className="space-y-4">
            {filteredApps.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm hover:shadow-md transition space-y-4 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="font-serif text-lg text-stone-900">{app.businessName}</strong>
                      <span className="text-[10px] bg-stone-100 text-stone-700 font-mono px-2 py-0.5 rounded font-bold">
                        #{app.id.slice(0, 8)}
                      </span>
                      {app.businessType === 'drop_shipper' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-900">
                          DROP SHIPPER
                        </span>
                      )}
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        app.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-900' :
                        app.status === 'APPLICATION_RECEIVED' ? 'bg-amber-100 text-amber-900' :
                        app.status === 'UNDER_REVIEW' ? 'bg-sky-100 text-sky-900' :
                        app.status === 'ADDITIONAL_INFORMATION_REQUIRED' ? 'bg-orange-100 text-orange-900' :
                        'bg-rose-100 text-rose-900'
                      }`}>
                        {app.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="text-stone-600 mt-1">
                      Applicant: <strong>{app.applicantName}</strong> &bull; Contact: {app.mobile} &bull; Email: {app.email}
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">GSTIN</span>
                    <span className="font-mono font-bold text-stone-900 text-sm">
                      {app.gstin || 'Not Required'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-700">Documents Attached:</span>
                    {app.documents.length === 0 ? (
                      <span className="text-stone-400 italic">None</span>
                    ) : (
                      app.documents.map(doc => (
                        <span key={doc.id} className="p-1.5 bg-stone-50 border border-stone-200 rounded-lg text-stone-800 text-[11px] flex items-center gap-1 font-mono">
                          <FileText className="w-3.5 h-3.5 text-stone-500" />
                          {doc.name}
                        </span>
                      ))
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedApp(app);
                      setReviewerRemarks(app.rejectionReason || app.infoRequestNotes || '');
                    }}
                    className="px-4 py-2 bg-[#831843] hover:bg-rose-900 text-white rounded-xl font-bold text-xs shadow transition flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Review & Adjudicate</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 bg-white rounded-3xl border border-stone-200 text-center space-y-2 text-xs text-stone-500">
            No KYC applications match current filter.
          </div>
        )}

      </main>

      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-stone-200 shadow-2xl space-y-6 text-xs max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-rose-900 tracking-wider">
                  KYC Audit & Compliance Adjudication
                </span>
                <h2 className="font-serif text-xl font-bold text-stone-900 mt-0.5">
                  {selectedApp.businessName}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="text-stone-400 hover:text-stone-700 text-sm font-bold p-1"
              >
                &times; Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-stone-50 p-4 rounded-2xl border border-stone-200">
              <div>
                <span className="text-stone-400 text-[10px] uppercase font-bold block">Proprietor / Buyer</span>
                <strong className="text-stone-900">{selectedApp.applicantName}</strong>
              </div>
              <div>
                <span className="text-stone-400 text-[10px] uppercase font-bold block">Mobile Phone</span>
                <strong className="text-stone-900">{selectedApp.mobile}</strong>
              </div>
              <div>
                <span className="text-stone-400 text-[10px] uppercase font-bold block">GSTIN</span>
                <strong className="font-mono text-stone-900 text-sm text-[#831843]">
                  {selectedApp.gstin || 'Not Required (Drop Shipper)'}
                </strong>
              </div>
              <div>
                <span className="text-stone-400 text-[10px] uppercase font-bold block">PAN Number</span>
                <strong className="font-mono text-stone-900">{selectedApp.pan || '—'}</strong>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-stone-800">Uploaded Verification Proofs:</h4>
              {selectedApp.documents.length === 0 ? (
                <p className="text-stone-500 italic">No documents attached.</p>
              ) : (
                selectedApp.documents.map(doc => (
                  <div key={doc.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#831843]" />
                      <div>
                        <strong className="text-stone-900 block">{doc.name}</strong>
                        <span className="text-[10px] text-stone-500 font-mono">{doc.type} &bull; {doc.size}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-stone-800">
                Compliance Reviewer Remarks (Visible to Retailer):
              </label>
              <textarea
                rows={2}
                value={reviewerRemarks}
                onChange={e => setReviewerRemarks(e.target.value)}
                placeholder="e.g. GSTIN verified against national database. Approved for wholesale catalog access."
                className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-rose-900 text-xs"
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-200">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleUpdateStatus('approve')}
                className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve & Unlock Wholesale Pricing</span>
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleUpdateStatus('request_info')}
                className="px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Request Document Clarification</span>
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleUpdateStatus('reject')}
                className="px-4 py-3 bg-rose-800 hover:bg-rose-900 text-white rounded-xl font-bold shadow flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default function AdminKYCPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-stone-500">Loading KYC Management...</div>}>
      <AdminKYCContent />
    </Suspense>
  );
}