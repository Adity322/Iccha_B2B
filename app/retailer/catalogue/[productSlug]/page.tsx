'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { 
  Building2, 
  ShoppingBag, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Video, 
  ShieldCheck, 
  ArrowLeft, 
  Plus, 
  Minus, 
  Sparkles, 
  Scissors, 
  Truck, 
  FileText 
} from 'lucide-react';
import RetailerHeader from '@/components/layout/RetailerHeader';
import Footer from '@/components/layout/Footer';
import { ProductService, CategoryService } from '@/lib/services';
import { Product, Category } from '@/lib/types';
import { useApp } from '@/lib/context/AppContext';

export default function RetailerProductDetailPage() {
  const params = useParams();
  const productSlug = params?.productSlug as string;
  const { addToCart, cart, openSellerModal, addToast } = useApp();

  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [setsToAdd, setSetsToAdd] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!productSlug) return;
      setLoading(true);
      const p = await ProductService.getProductBySlug(productSlug);
      if (p) {
        setProduct(p);
        const c = await CategoryService.getCategoryById(p.categoryId);
        setCategory(c || null);
      }
      setLoading(false);
    }
    load();
  }, [productSlug]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <RetailerHeader />
        <main className="flex-1 py-16 text-center text-xs text-stone-500">
          Loading product specifications...
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen">
        <RetailerHeader />
        <main className="flex-1 py-16 text-center space-y-3">
          <h2 className="font-serif text-xl font-bold text-stone-900">Design Not Found</h2>
          <p className="text-xs text-stone-500">The requested kurti design is no longer in active production.</p>
          <Link href="/retailer/catalogue" className="px-4 py-2 bg-[#831843] text-white text-xs font-semibold rounded-lg inline-block">
            Return to Catalogue
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const isSurat = product.billingEntityId === 'entity_a';
  const cartItem = cart.items.find(i => i.productId === product.id);
  const existingSets = cartItem?.selectedSets || 0;

  const handleAddToCart = () => {
    addToCart(product, setsToAdd);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <RetailerHeader />

      <main className="flex-1 py-8 bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Breadcrumbs */}
          <nav className="text-xs text-stone-500 flex items-center gap-2">
            <Link href="/retailer" className="hover:text-stone-900">Retailer Portal</Link>
            <span>/</span>
            <Link href="/retailer/catalogue" className="hover:text-stone-900">Catalogue</Link>
            <span>/</span>
            <span className="text-stone-900 font-semibold">{product.name}</span>
          </nav>

          {/* Product Detail Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Product Images Gallery */}
            <div className="lg:col-span-6 space-y-4">
              {/* Primary Featured Image */}
              <div className="relative aspect-[3/4] w-full rounded-3xl overflow-hidden bg-stone-100 border border-stone-200 shadow-md">
                <Image
                  src={product.media[selectedImageIdx]?.url || product.media[0]?.url}
                  alt={product.name}
                  fill
                  priority
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  referrerPolicy="no-referrer"
                />

                {/* Entity Hub Tag */}
                <div className="absolute top-4 left-4">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full text-white shadow-md flex items-center gap-1.5 uppercase tracking-wider ${
                    isSurat ? 'bg-[#831843]' : 'bg-[#9a3412]'
                  }`}>
                    <Building2 className="w-3.5 h-3.5" />
                    {isSurat ? 'Surat Hub (GST Entity A)' : 'Jaipur Hub (GST Entity B)'}
                  </span>
                </div>

                {/* Stock Tag */}
                <div className="absolute top-4 right-4 bg-stone-900/90 text-amber-300 text-xs font-bold px-3 py-1 rounded-full shadow">
                  {product.availableSets} Sets In Stock ({product.availableSets * product.piecesPerSet} pcs)
                </div>
              </div>

              {/* Thumbnails list */}
              {product.media.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.media.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIdx(idx)}
                      className={`relative w-20 h-24 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                        selectedImageIdx === idx ? 'border-rose-800 ring-2 ring-rose-200' : 'border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      <Image
                        src={img.url}
                        alt={img.alt || product.name}
                        fill
                        className="object-cover object-top"
                        referrerPolicy="no-referrer"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: B2B Pricing, Sets & Specifications */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Product Header */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <span className="font-mono text-rose-900 font-bold">{product.sku}</span>
                  <span>&bull;</span>
                  <span>Design #{product.designNumber}</span>
                  <span>&bull;</span>
                  <span className="text-stone-700 font-medium">{product.categoryName}</span>
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                  {product.name}
                </h1>

                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Real Wholesale Pricing Box */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-stone-100 pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                      Wholesale Piece Rate
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-bold text-stone-900">
                        ₹{product.wholesalePricePerPiece}
                      </span>
                      <span className="text-xs text-stone-500 font-medium">/ piece (+ GST {product.gstRate}%)</span>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                      Set Lot Price ({product.piecesPerSet} pcs)
                    </span>
                    <div className="text-xl font-bold text-rose-900">
                      ₹{product.wholesalePricePerSet.toLocaleString('en-IN')}{' '}
                      <span className="text-xs text-stone-500 font-normal">/ set</span>
                    </div>
                  </div>
                </div>

                {/* Size & Ratio Breakdown */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <strong className="text-stone-800">Fixed Wholesale Size Combination:</strong>
                    <span className="font-semibold text-rose-900">{product.sizeCombination}</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    {(product.sizes || []).map((size) => (
                      <div key={size} className="p-2 bg-stone-50 rounded-xl border border-stone-200">
                        <div className="font-bold text-stone-900">{size}</div>
                        <div className="text-[10px] text-stone-500">1 Piece</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-stone-400">
                    * Single pieces are not broken. Minimum order quantity rule applies at checkout.
                  </p>
                </div>

                {/* Add to Wholesale Cart Controls */}
                <div className="pt-2 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-stone-300 rounded-xl bg-stone-50 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setSetsToAdd(Math.max(1, setsToAdd - 1))}
                        className="p-3 hover:bg-stone-200 text-stone-700 transition"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <div className="px-4 text-sm font-bold text-stone-900 text-center min-w-[70px]">
                        <div>{setsToAdd} Set{setsToAdd > 1 ? 's' : ''}</div>
                        <div className="text-[10px] text-stone-400 font-normal">{setsToAdd * product.piecesPerSet} pcs</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSetsToAdd(Math.min(product.availableSets, setsToAdd + 1))}
                        className="p-3 hover:bg-stone-200 text-stone-700 transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="flex-1 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#831843] to-[#9a3412] hover:from-[#701a75] hover:to-[#852e10] text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4 text-amber-300" />
                      <span>Add {setsToAdd} Set ({setsToAdd * product.piecesPerSet} pcs) &bull; ₹{(setsToAdd * product.wholesalePricePerSet).toLocaleString('en-IN')}</span>
                    </button>
                  </div>

                  {existingSets > 0 && (
                    <div className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <strong>{existingSets} Sets</strong> currently in your wholesale cart.
                      </span>
                      <Link href="/retailer/cart" className="font-bold underline">
                        View Cart
                      </Link>
                    </div>
                  )}
                </div>

                {/* Video Call Request Option */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
                  <span>Want to see embroidery quality on video?</span>
                  <button
                    type="button"
                    onClick={openSellerModal}
                    className="text-[#831843] font-bold hover:underline inline-flex items-center gap-1"
                  >
                    <Video className="w-3.5 h-3.5" />
                    Request Live Sample Call
                  </button>
                </div>
              </div>

              {/* Technical Specifications Table */}
              <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4 text-xs">
                <h3 className="font-serif text-base font-bold text-stone-900 border-b border-stone-100 pb-2">
                  Garment & Fabric Specifications
                </h3>

                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                  <div>
                    <span className="text-stone-400 text-[10px] uppercase font-bold block">Fabric</span>
                    <strong className="text-stone-800">{product.fabric}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[10px] uppercase font-bold block">Work / Craft</span>
                    <strong className="text-stone-800">{product.workType}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[10px] uppercase font-bold block">Style / Silhouette</span>
                    <strong className="text-stone-800">{product.style}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[10px] uppercase font-bold block">Clothing Type</span>
                    <strong className="text-stone-800">
                      {product.clothingType === '3_piece' ? '3-Piece (Kurti + Pant + Dupatta)' : '2-Piece (Kurti + Pant)'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[10px] uppercase font-bold block">HSN Code</span>
                    <strong className="font-mono text-stone-800">{product.hsn}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[10px] uppercase font-bold block">GST Rate</span>
                    <strong className="text-stone-800">{product.gstRate}% Applicable</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[10px] uppercase font-bold block">Lining</span>
                    <strong className="text-stone-800">Premium Crepe Attached</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[10px] uppercase font-bold block">Margins</span>
                    <strong className="text-stone-800">2-inch Boutique Alteration Margin</strong>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
