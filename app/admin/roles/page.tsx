'use client';

import React, { useState, useEffect } from 'react';
import { UserCog, Search, ArrowUpCircle } from 'lucide-react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { useApp } from '@/lib/context/AppContext';

interface UserRow {
  id: string;
  email: string;
  name: string;
  role: string;
  businessName: string | null;
  retailerStatus: string | null;
  businessType: string | null;
  gstin: string | null;
  vendorActive: boolean | null;
}

export default function AdminRolesPage() {
  const { addToast } = useApp();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [promoting, setPromoting] = useState<UserRow | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    contactName: '',
    gstin: '',
    address: '',
    city: '',
    state: '',
    stateCode: '',
  });

  const fetchUsers = async () => {
    setLoading(true);
    const res = await fetch('/api/admin/users');
    const result = await res.json();
    if (res.ok && result.success) {
      setUsers(result.data);
    } else {
      addToast({ type: 'error', title: 'Failed to load users', message: result.error || '' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openPromote = (u: UserRow) => {
    setPromoting(u);
    setForm({
      contactName: u.name,
      gstin: u.gstin || '',
      address: '',
      city: '',
      state: '',
      stateCode: '',
    });
  };

  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/users/${promoting.id}/promote-vendor`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        addToast({ type: 'error', title: 'Promotion failed', message: result.error || 'Please check the details.' });
        setSubmitting(false);
        return;
      }

      addToast({ type: 'success', title: 'Promoted to Vendor', message: `${promoting.businessName} can now log in as a vendor.` });
      setPromoting(null);
      await fetchUsers();
    } catch (err) {
      console.error(err);
      addToast({ type: 'error', title: 'Promotion failed', message: 'Something went wrong.' });
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = users.filter(u => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (u.businessName || '').toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex min-h-screen bg-[#faf8f5]">
      <AdminSidebar activeTab="roles" />

      <main className="flex-1 p-6 lg:p-10 space-y-6 overflow-y-auto">

        <div className="border-b border-stone-200 pb-6">
          <span className="text-xs uppercase font-bold tracking-widest text-[#831843]">
            Access Control
          </span>
          <h1 className="font-serif text-3xl font-bold text-stone-900 mt-1">
            Role Management
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Promote an approved retailer account to a Vendor so they can list and manage their own products.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm flex items-center gap-3 text-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by business name, email..."
              className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rose-900"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-16 bg-white rounded-3xl border border-stone-200 text-center text-xs text-stone-500">
            Loading accounts...
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden text-xs">
            <table className="w-full">
              <thead className="bg-stone-50 text-stone-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="text-left p-4">Business</th>
                  <th className="text-left p-4">Email</th>
                  <th className="text-left p-4">Current Role</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-right p-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-t border-stone-100">
                    <td className="p-4 font-semibold text-stone-900">{u.businessName || '—'}</td>
                    <td className="p-4 text-stone-600">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.role === 'VENDOR' ? 'bg-purple-100 text-purple-900' : 'bg-stone-100 text-stone-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-stone-600">
                      {u.role === 'VENDOR' ? (u.vendorActive ? 'Active' : 'Inactive') : u.retailerStatus}
                    </td>
                    <td className="p-4 text-right">
                      {u.role === 'RETAILER' && u.retailerStatus === 'APPROVED' && (
                        <button
                          type="button"
                          onClick={() => openPromote(u)}
                          className="px-3 py-1.5 bg-[#831843] hover:bg-rose-900 text-white rounded-lg font-bold text-[11px] shadow transition inline-flex items-center gap-1.5"
                        >
                          <ArrowUpCircle className="w-3.5 h-3.5" />
                          <span>Promote to Vendor</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="p-12 text-center text-stone-500">No accounts found.</div>
            )}
          </div>
        )}

      </main>

      {promoting && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handlePromote}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-stone-200 shadow-2xl space-y-4 text-xs max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                <UserCog className="w-5 h-5 text-[#831843]" />
                Promote {promoting.businessName} to Vendor
              </h3>
              <button type="button" onClick={() => setPromoting(null)} className="text-stone-400 font-bold text-sm">
                &times;
              </button>
            </div>

            <p className="text-stone-500">
              Vendor accounts need billing details on file. Fill these in once — the retailer's existing name, mobile, and PAN carry over automatically.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block font-semibold text-stone-700 mb-1">Contact Name</label>
                <input
                  type="text"
                  value={form.contactName}
                  onChange={e => setForm({ ...form, contactName: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-rose-900"
                />
              </div>
              <div className="col-span-2">
                <label className="block font-semibold text-stone-700 mb-1">GSTIN *</label>
                <input
                  type="text"
                  required
                  value={form.gstin}
                  onChange={e => setForm({ ...form, gstin: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono focus:outline-none focus:border-rose-900"
                />
              </div>
              <div className="col-span-2">
                <label className="block font-semibold text-stone-700 mb-1">Address *</label>
                <input
                  type="text"
                  required
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-rose-900"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={form.city}
                  onChange={e => setForm({ ...form, city: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-rose-900"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">State *</label>
                <input
                  type="text"
                  required
                  value={form.state}
                  onChange={e => setForm({ ...form, state: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-rose-900"
                />
              </div>
              <div className="col-span-2">
                <label className="block font-semibold text-stone-700 mb-1">State Code * (e.g. 08)</label>
                <input
                  type="text"
                  required
                  maxLength={2}
                  value={form.stateCode}
                  onChange={e => setForm({ ...form, stateCode: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono focus:outline-none focus:border-rose-900"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setPromoting(null)}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2.5 bg-[#831843] hover:bg-rose-900 text-white rounded-xl font-bold shadow transition disabled:opacity-60"
              >
                {submitting ? 'Promoting...' : 'Confirm Promotion'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}