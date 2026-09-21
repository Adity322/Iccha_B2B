'use client';

import React, { useState, useEffect } from 'react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { useApp } from '@/lib/context/AppContext';
import { Save, Building2, CreditCard, MapPin, User, Pencil, X, Lock } from 'lucide-react';

interface VendorProfileData {
  businessName: string;
  contactName: string;
  mobile: string;
  email: string;
  gstin: string;
  pan: string | null;
  address: string;
  city: string;
  state: string;
  stateCode: string;
  bankName: string | null;
  accountHolder: string | null;
  accountNumber: string | null;
  ifsc: string | null;
  branch: string | null;
  upiId: string | null;
  invoicePrefix: string;
  defaultGstRate: string;
  isActive: boolean;
}

export default function VendorProfilePage() {
  const { addToast } = useApp();
  const [profile, setProfile] = useState<VendorProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [form, setForm] = useState({
    contactName: '',
    mobile: '',
    address: '',
    city: '',
    state: '',
    stateCode: '',
    bankName: '',
    accountHolder: '',
    accountNumber: '',
    ifsc: '',
    branch: '',
    upiId: '',
  });

  const buildFormFromProfile = (data: VendorProfileData) => ({
    contactName: data.contactName || '',
    mobile: data.mobile || '',
    address: data.address || '',
    city: data.city || '',
    state: data.state || '',
    stateCode: data.stateCode || '',
    bankName: data.bankName || '',
    accountHolder: data.accountHolder || '',
    accountNumber: data.accountNumber || '',
    ifsc: data.ifsc || '',
    branch: data.branch || '',
    upiId: data.upiId || '',
  });

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/vendor/profile');
      const json = await res.json();
      if (json.success) {
        setProfile(json.data);
        setForm(buildFormFromProfile(json.data));
      } else {
        addToast({ type: 'error', title: 'Failed to load profile', message: json.error });
      }
    } catch {
      addToast({ type: 'error', title: 'Network error', message: 'Could not load profile.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (profile) setForm(buildFormFromProfile(profile)); // discard unsaved changes
    setIsEditing(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/vendor/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        addToast({ type: 'success', title: 'Profile Updated', message: 'Your details have been saved.' });
        await loadProfile();
        setIsEditing(false);
      } else {
        addToast({ type: 'error', title: 'Update failed', message: json.error });
      }
    } catch {
      addToast({ type: 'error', title: 'Network error', message: 'Could not save changes.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex min-h-screen bg-[#faf8f5]">
        <AdminSidebar activeTab="profile" />
        <main className="flex-1 p-6 lg:p-10 flex items-center justify-center">
          <div className="text-xs text-stone-500">Loading profile...</div>
        </main>
      </div>
    );
  }

  const fieldClass = (editable: boolean) =>
    `w-full px-3 py-2 rounded-xl border focus:outline-none transition ${editable
      ? 'bg-stone-50 border-stone-300 focus:border-rose-900'
      : 'bg-stone-100 border-stone-200 text-stone-600 cursor-not-allowed'
    }`;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addToast({ type: 'error', title: 'Passwords don\'t match', message: 'New password and confirmation must match.' });
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch('/api/vendor/profile/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwordForm),
      });
      const json = await res.json();

      if (json.success) {
        addToast({ type: 'success', title: 'Password Changed', message: 'Use your new password next time you log in.' });
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setIsChangingPassword(false);
      } else {
        addToast({ type: 'error', title: 'Change failed', message: json.error });
      }
    } catch {
      addToast({ type: 'error', title: 'Network error', message: 'Could not change password.' });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleCancelPasswordChange = () => {
    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setIsChangingPassword(false);
  };

  return (
    <div className="flex min-h-screen bg-[#faf8f5]">
      <AdminSidebar activeTab="profile" />

      <main className="flex-1 min-w-0 p-6 lg:p-10 overflow-y-auto">
        <div className="w-full max-w-4xl space-y-6">

        <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-6">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-[#831843]">
              My Account
            </span>
            <h1 className="font-serif text-3xl font-bold text-stone-900 mt-1">
              Vendor Profile
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Manage your contact, address, and payout details. Legal identifiers (GSTIN, PAN, business name) require staff approval to change — contact support.
            </p>
          </div>

          {!isEditing && (
            <button
              type="button"
              onClick={handleEdit}
              className="px-4 py-2.5 bg-[#831843] hover:bg-rose-900 text-white rounded-xl font-bold text-xs shadow transition flex items-center gap-2 shrink-0"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit Details</span>
            </button>
          )}
        </div>

        {/* Locked / staff-only fields, always read-only */}
        <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-3 text-xs">
          <div className="flex items-center gap-2 font-bold text-stone-800 mb-1">
            <Building2 className="w-4 h-4 text-stone-500" />
            Business Identity (Staff-Managed)
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Business Name</span>
              <span className="font-semibold text-stone-800">{profile.businessName}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Login Email</span>
              <span className="font-semibold text-stone-800">{profile.email}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block">GSTIN</span>
              <span className="font-mono font-semibold text-stone-800">{profile.gstin}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block">PAN</span>
              <span className="font-mono font-semibold text-stone-800">{profile.pan || '—'}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Invoice Prefix</span>
              <span className="font-mono font-semibold text-stone-800">{profile.invoicePrefix}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block">Default GST Rate</span>
              <span className="font-semibold text-stone-800">{profile.defaultGstRate}%</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6 text-xs">

          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
            <h3 className="font-serif text-base font-bold text-stone-900 border-b border-stone-100 pb-2 flex items-center gap-2">
              <User className="w-4 h-4" /> Contact Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Contact Name</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={form.contactName}
                  onChange={e => setForm({ ...form, contactName: e.target.value })}
                  className={fieldClass(isEditing)}
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  disabled={!isEditing}
                  value={form.mobile}
                  onChange={e => setForm({ ...form, mobile: e.target.value })}
                  className={fieldClass(isEditing)}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
            <h3 className="font-serif text-base font-bold text-stone-900 border-b border-stone-100 pb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Business Address
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Address</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  className={fieldClass(isEditing)}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">City</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={form.city}
                    onChange={e => setForm({ ...form, city: e.target.value })}
                    className={fieldClass(isEditing)}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">State</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={form.state}
                    onChange={e => setForm({ ...form, state: e.target.value })}
                    className={fieldClass(isEditing)}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">State Code</label>
                  <input
                    type="text"
                    maxLength={2}
                    disabled={!isEditing}
                    value={form.stateCode}
                    onChange={e => setForm({ ...form, stateCode: e.target.value })}
                    className={`${fieldClass(isEditing)} font-mono`}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
            <h3 className="font-serif text-base font-bold text-stone-900 border-b border-stone-100 pb-2 flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Payout Bank Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={form.bankName}
                  onChange={e => setForm({ ...form, bankName: e.target.value })}
                  className={fieldClass(isEditing)}
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Account Holder Name</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={form.accountHolder}
                  onChange={e => setForm({ ...form, accountHolder: e.target.value })}
                  className={fieldClass(isEditing)}
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Account Number</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={form.accountNumber}
                  onChange={e => setForm({ ...form, accountNumber: e.target.value })}
                  className={`${fieldClass(isEditing)} font-mono`}
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">IFSC Code</label>
                <input
                  type="text"
                  maxLength={11}
                  disabled={!isEditing}
                  value={form.ifsc}
                  onChange={e => setForm({ ...form, ifsc: e.target.value.toUpperCase() })}
                  className={`${fieldClass(isEditing)} font-mono`}
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Branch</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={form.branch}
                  onChange={e => setForm({ ...form, branch: e.target.value })}
                  className={fieldClass(isEditing)}
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">UPI ID</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={form.upiId}
                  onChange={e => setForm({ ...form, upiId: e.target.value })}
                  className={fieldClass(isEditing)}
                />
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3.5 bg-[#831843] hover:bg-rose-900 text-white rounded-xl font-bold shadow transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="px-6 py-3.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </form>
        <form onSubmit={handleChangePassword} className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <h3 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
              <Lock className="w-4 h-4" /> Login Password
            </h3>
            {!isChangingPassword && (
              <button
                type="button"
                onClick={() => setIsChangingPassword(true)}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg font-bold text-[11px] transition"
              >
                Change Password
              </button>
            )}
          </div>

          {isChangingPassword ? (
            <>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwordForm.oldPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-rose-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="Minimum 8 characters"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-rose-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-rose-900"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="flex-1 py-2.5 bg-[#831843] hover:bg-rose-900 text-white rounded-xl font-bold shadow transition disabled:opacity-60"
                >
                  {changingPassword ? 'Updating...' : 'Update Password'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelPasswordChange}
                  disabled={changingPassword}
                  className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <p className="text-stone-500">Click "Change Password" to update your login credentials.</p>
          )}
        </form>
        </div>
      </main>
    </div>
  );
}