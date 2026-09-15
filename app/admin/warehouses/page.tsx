'use client';

import React, { useEffect, useState } from 'react';
import {
  Plus,
  Warehouse as WarehouseIcon,
  Loader2,
  MapPin,
  X,
} from 'lucide-react';
import AdminSidebar from '@/components/layout/AdminSidebar';

interface Warehouse {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  isActive: boolean;
  createdAt: string;
}

interface WarehouseForm {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [error, setError] = useState('');

  const [formData, setFormData] = useState<WarehouseForm>({
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });

  // ============================================================
  // LOAD VENDOR WAREHOUSES
  // ============================================================

  const loadWarehouses = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await fetch('/api/vendor/warehouses');

      const json = await res.json();

      if (json.success) {
        setWarehouses(json.data);
      } else {
        setError(json.error || 'Failed to load warehouses.');
      }
    } catch {
      setError('Could not load warehouses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  // ============================================================
  // OPEN ADD MODAL
  // ============================================================

  const openAddModal = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
    });

    setError('');
    setIsModalOpen(true);
  };

  // ============================================================
  // CREATE WAREHOUSE
  // ============================================================

  const handleSaveWarehouse = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/vendor/warehouses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!json.success) {
        setError(json.error || 'Failed to create warehouse.');
        return;
      }

      setWarehouses(prev => [json.data, ...prev]);

      setIsModalOpen(false);

      setFormData({
        name: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
      });
    } catch {
      setError('Could not create warehouse. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="flex min-h-screen bg-[#faf8f5]">

      {/* EXISTING VENDOR / ADMIN SIDEBAR */}
      <AdminSidebar activeTab="warehouses" />

      <main className="flex-1 p-6 lg:p-10 space-y-6 overflow-y-auto">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">

          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-[#831843]">
              Vendor Portal
            </span>

            <h1 className="font-serif text-3xl font-bold text-stone-900 mt-1">
              Warehouses
            </h1>

            <p className="text-xs text-stone-500 mt-0.5">
              Manage the warehouses where your products are stored.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2.5 bg-[#831843] hover:bg-rose-900 text-white rounded-xl font-bold text-xs shadow transition flex items-center gap-2 self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>Add Warehouse</span>
          </button>

        </div>

        {/* ======================================================
            ERROR
        ====================================================== */}

        {error && !isModalOpen && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* ======================================================
            WAREHOUSE LIST
        ====================================================== */}

        {loading ? (

          <div className="p-16 bg-white rounded-3xl border border-stone-200 text-center text-xs text-stone-500">
            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-3" />
            Loading warehouses...
          </div>

        ) : warehouses.length === 0 ? (

          <div className="bg-white rounded-3xl border border-dashed border-stone-300 p-16 text-center">

            <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
              <WarehouseIcon className="w-7 h-7 text-stone-400" />
            </div>

            <h2 className="font-serif text-xl font-bold text-stone-900">
              No warehouses added
            </h2>

            <p className="text-xs text-stone-500 mt-2 max-w-md mx-auto">
              You need to add at least one warehouse before creating products.
            </p>

            <button
              type="button"
              onClick={openAddModal}
              className="mt-5 px-4 py-2.5 bg-[#831843] hover:bg-rose-900 text-white rounded-xl font-bold text-xs shadow transition inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Your First Warehouse
            </button>

          </div>

        ) : (

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

            {warehouses.map((warehouse) => (

              <div
                key={warehouse.id}
                className="bg-white rounded-3xl border border-stone-200 shadow-sm p-5 hover:border-rose-900/40 transition"
              >

                {/* Warehouse Header */}

                <div className="flex items-start justify-between gap-3">

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center shrink-0">
                      <WarehouseIcon className="w-5 h-5 text-stone-600" />
                    </div>

                    <div>
                      <h3 className="font-serif font-bold text-stone-900 text-sm">
                        {warehouse.name}
                      </h3>

                      <span
                        className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          warehouse.isActive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-stone-100 text-stone-500'
                        }`}
                      >
                        {warehouse.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                  </div>

                </div>

                {/* Address */}

                {(warehouse.address ||
                  warehouse.city ||
                  warehouse.state ||
                  warehouse.pincode) && (

                  <div className="mt-5 pt-4 border-t border-stone-100">

                    <div className="flex items-start gap-2">

                      <MapPin className="w-3.5 h-3.5 text-stone-400 mt-0.5 shrink-0" />

                      <div className="text-xs text-stone-500 leading-5">

                        {warehouse.address && (
                          <div>{warehouse.address}</div>
                        )}

                        <div>
                          {[
                            warehouse.city,
                            warehouse.state,
                            warehouse.pincode,
                          ]
                            .filter(Boolean)
                            .join(', ')}
                        </div>

                      </div>

                    </div>

                  </div>
                )}

              </div>

            ))}

          </div>

        )}

        {/* ======================================================
            ADD WAREHOUSE MODAL
        ====================================================== */}

        {isModalOpen && (

          <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">

            <div className="bg-white rounded-3xl max-w-2xl w-full border border-stone-200 shadow-2xl">

              <div className="p-6 sm:p-8">

                {/* Modal Header */}

                <div className="flex items-center justify-between border-b border-stone-200 pb-4 mb-5">

                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#831843]">
                      Vendor Portal
                    </span>

                    <h2 className="font-serif text-xl font-bold text-stone-900 mt-1">
                      Add Warehouse
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="text-stone-400 hover:text-stone-800 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>

                </div>

                {/* Form */}

                <form
                  onSubmit={handleSaveWarehouse}
                  className="space-y-4 text-xs"
                >

                  {/* Warehouse Name */}

                  <div>
                    <label className="block font-bold text-stone-800 mb-1">
                      Warehouse Name *
                    </label>

                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          name: e.target.value,
                        })
                      }
                      placeholder="e.g. Surat Main Warehouse"
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-rose-900"
                    />
                  </div>

                  {/* Address */}

                  <div>
                    <label className="block font-bold text-stone-800 mb-1">
                      Address
                    </label>

                    <textarea
                      rows={3}
                      value={formData.address}
                      onChange={e =>
                        setFormData({
                          ...formData,
                          address: e.target.value,
                        })
                      }
                      placeholder="Complete warehouse address"
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-rose-900"
                    />
                  </div>

                  {/* City / State / Pincode */}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                    <div>
                      <label className="block font-bold text-stone-800 mb-1">
                        City
                      </label>

                      <input
                        type="text"
                        value={formData.city}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            city: e.target.value,
                          })
                        }
                        placeholder="Surat"
                        className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-rose-900"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-800 mb-1">
                        State
                      </label>

                      <input
                        type="text"
                        value={formData.state}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            state: e.target.value,
                          })
                        }
                        placeholder="Gujarat"
                        className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-rose-900"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-stone-800 mb-1">
                        Pincode
                      </label>

                      <input
                        type="text"
                        value={formData.pincode}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            pincode: e.target.value,
                          })
                        }
                        placeholder="395003"
                        className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-rose-900"
                      />
                    </div>

                  </div>

                  {/* Modal Error */}

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-xs text-red-700">
                      {error}
                    </div>
                  )}

                  {/* Buttons */}

                  <div className="flex gap-2 pt-3 border-t border-stone-100">

                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 py-3 bg-[#831843] hover:bg-rose-900 text-white rounded-xl font-bold shadow flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {saving && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}

                      <span>
                        {saving ? 'Saving...' : 'Save Warehouse'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-5 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold"
                    >
                      Cancel
                    </button>

                  </div>

                </form>

              </div>

            </div>

          </div>

        )}

      </main>
    </div>
  );
}