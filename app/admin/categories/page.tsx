'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  Save,
  FolderTree
} from 'lucide-react';
import AdminSidebar from '@/components/layout/AdminSidebar';
import { useApp } from '@/lib/context/AppContext';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  requiresSize: boolean;
  mediaAsset?: { publicUrl: string } | null;
  _count?: { products: number };
}

export default function AdminCategoriesPage() {
  const { addToast } = useApp();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    requiresSize: false
  });

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/categories');
      const json = await res.json();
      if (json.success) {
        setCategories(json.data);
      } else {
        addToast({ type: 'error', title: 'Failed to load categories', message: json.error });
      }
    } catch {
      addToast({ type: 'error', title: 'Network error', message: 'Could not load categories.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', slug: '', description: '', requiresSize: false });
    setIsModalOpen(true);
  };

  const openEditModal = (c: Category) => {
    setEditingCategory(c);
    setFormData({ name: c.name, slug: c.slug, description: c.description || '', requiresSize: c.requiresSize });
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const slug = formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    let mediaAssetId: string | undefined;

    if (imageFile) {
      setUploading(true);
      try {
        const uploadForm = new FormData();
        uploadForm.append('file', imageFile);
        uploadForm.append('mediaType', 'CATEGORY_BANNER');
        const uploadRes = await fetch('/api/admin/media/upload', {
          method: 'POST',
          body: uploadForm,
        });
        const uploadJson = await uploadRes.json();
        if (uploadJson.success) {
          mediaAssetId = uploadJson.data.id;
        } else {
          addToast({ type: 'error', title: 'Image upload failed', message: uploadJson.error?.message || 'Try again.' });
          setUploading(false);
          return;
        }
      } catch {
        addToast({ type: 'error', title: 'Network error', message: 'Could not upload image.' });
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    const payload: Record<string, unknown> = {
      name: formData.name,
      slug,
      description: formData.description,
      requiresSize: formData.requiresSize
    };
    if (mediaAssetId) {
      payload.mediaAssetId = mediaAssetId;
    }

    try {
      if (editingCategory) {
        const res = await fetch(`/api/admin/categories/${editingCategory.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (json.success) {
          addToast({ type: 'success', title: 'Category Updated', message: `${formData.name} modified successfully.` });
        } else {
          addToast({ type: 'error', title: 'Update failed', message: json.error });
          return;
        }
      } else {
        const res = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const json = await res.json();
        if (json.success) {
          addToast({ type: 'success', title: 'Category Created', message: `${formData.name} added.` });
        } else {
          addToast({ type: 'error', title: 'Creation failed', message: json.error });
          return;
        }
      }

      setImageFile(null);
      setIsModalOpen(false);
      loadCategories();
    } catch {
      addToast({ type: 'error', title: 'Network error', message: 'Could not save category.' });
    }
  };

  const handleDelete = async (c: Category) => {
    if (!confirm(`Delete "${c.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/categories/${c.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        addToast({ type: 'info', title: 'Category Deleted', message: 'Category removed.' });
        loadCategories();
      } else {
        addToast({ type: 'error', title: 'Cannot delete', message: json.error });
      }
    } catch {
      addToast({ type: 'error', title: 'Network error', message: 'Could not delete category.' });
    }
  };

  const filtered = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-[#faf8f5]">
      <AdminSidebar activeTab="categories" />

      <main className="flex-1 p-6 lg:p-10 space-y-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-[#831843]">
              Taxonomy & Categorization
            </span>
            <h1 className="font-serif text-3xl font-bold text-stone-900 mt-1">
              Wholesale Kurti Categories ({categories.length})
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Manage product classifications and catalogue filters.
            </p>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2.5 bg-[#831843] hover:bg-rose-900 text-white rounded-xl font-bold text-xs shadow transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Category</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-sm text-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search through categories..."
              className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rose-900"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-16 bg-white rounded-3xl border border-stone-200 text-center text-xs text-stone-500">
            Loading categories...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-xs">
            {filtered.length === 0 && (
              <div className="col-span-full p-8 text-center text-stone-400 bg-white rounded-2xl border border-stone-200">
                No categories found.
              </div>
            )}
            {filtered.map((cat) => (
              <div
                key={cat.id}
                className="bg-white rounded-3xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                                    <div className="relative aspect-video w-full bg-stone-100">
                    {cat.mediaAsset?.publicUrl ? (
                      <Image
                        src={cat.mediaAsset.publicUrl}
                        alt={cat.name}
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FolderTree className="w-8 h-8 text-stone-300" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-stone-900/80 text-white font-mono text-[10px] px-2 py-0.5 rounded font-bold">
                      {cat._count?.products ?? 0} Products
                    </div>
                    <div className={`absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded font-bold ${cat.requiresSize ? 'bg-amber-500 text-stone-900' : 'bg-stone-700/80 text-white'}`}>
                      {cat.requiresSize ? 'SIZE REQUIRED' : 'NO SIZE'}
                    </div>
                  </div>

                  <div className="p-4 space-y-1">
                    <h3 className="font-serif text-base font-bold text-stone-900 line-clamp-1">{cat.name}</h3>
                    <p className="text-stone-500 line-clamp-2 text-[11px]">{cat.description || 'No description'}</p>
                  </div>
                </div>

                <div className="p-4 pt-0 border-t border-stone-100 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-stone-400">/{cat.slug}</span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(cat)}
                      className="p-1.5 hover:bg-stone-100 text-stone-700 rounded-lg"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cat)}
                      className="p-1.5 hover:bg-rose-50 text-rose-700 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-stone-200 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="font-serif text-lg font-bold text-stone-900">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 font-bold text-sm">
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div>
                <label className="block font-bold text-stone-800 mb-1">Category Title *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Bandhani Print Kurtis"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-rose-900"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">Slug URL Identifier</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={e => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="Auto-generated if left blank"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono focus:outline-none focus:border-rose-900"
                />
              </div>
              <div>
                <label className="block font-bold text-stone-800 mb-1">Cover Image</label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={e => setImageFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-[11px]"
                />
              </div>

              <div className="flex items-center justify-between gap-3 p-3 bg-stone-50 border border-stone-200 rounded-xl">
                <div>
                  <p className="font-bold text-stone-800">Size Required for Products</p>
                  <p className="text-[10px] text-stone-500 mt-0.5">Vendors must enter available sizes and stock quantities for products in this category.</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.requiresSize}
                  onChange={e => setFormData({ ...formData, requiresSize: e.target.checked })}
                  className="w-4 h-4 accent-rose-900"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-rose-900"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-stone-100">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 py-2.5 bg-[#831843] hover:bg-rose-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  {uploading ? 'Uploading image...' : 'Save Category'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}