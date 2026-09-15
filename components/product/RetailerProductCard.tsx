'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShoppingBag,
  Check,
  Plus,
  Minus,
  Store,
  Loader2
} from 'lucide-react';

interface RetailerProduct {
  id: string;
  sku: string;
  name: string;
  slug: string;
  sellerName: string;
  wholesalePricePerPiece: string | number;
  piecesPerSet: number;
  wholesalePricePerSet: string | number;
  availableSets: number;
  sizeCombination: string;
  fabric: string;
  clothingType: string;
  media?: { mediaAsset: { publicUrl: string } }[];
}

interface RetailerProductCardProps {
  product: RetailerProduct;
  cartItem?: { productId: string; sets: number };
  onCartChanged: () => void;
}

export default function RetailerProductCard({ product, cartItem, onCartChanged }: RetailerProductCardProps) {
  const [setsToAdd, setSetsToAdd] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const existingSetsInCart = cartItem?.sets || 0;
  const isOutOfStock = product.availableSets <= 0;
  const isLowStock = product.availableSets > 0 && product.availableSets <= 5;

  const handleQuickAdd = async () => {
    if (isOutOfStock || adding) return;
    setAdding(true);
    setError(null);
    try {
      const res = await fetch('/api/retailer/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, sets: setsToAdd }),
      });
      const json = await res.json();
      if (json.success) {
        setJustAdded(true);
        onCartChanged();
        setTimeout(() => setJustAdded(false), 1800);
      } else {
        setError(json.error || 'Could not add to cart');
        setTimeout(() => setError(null), 3000);
      }
    } catch {
      setError('Network error — try again');
      setTimeout(() => setError(null), 3000);
    } finally {
      setAdding(false);
    }
  };

  const primaryImageUrl = product.media?.[0]?.mediaAsset?.publicUrl;

  return (
    <div className="group bg-[#f9f7f2] border border-black/10 hover:border-black/40 transition-all duration-300 flex flex-col h-full overflow-hidden">
      <div className="relative aspect-[3/4] w-full bg-[#ded9d0] overflow-hidden">
        <Link href={`/retailer/catalogue/${product.slug}`} className="block w-full h-full">
          {primaryImageUrl && (
            <Image
              src={primaryImageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
          )}
        </Link>

        <div className="absolute top-3 left-3">
          <span className="text-[9px] font-bold px-2 py-0.5 shadow-sm flex items-center gap-1 uppercase tracking-[0.2em] bg-[#1a1a1a] text-[#f9f7f2]">
            <Store className="w-3 h-3 text-amber-300" />
            {product.sellerName}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          {isOutOfStock ? (
            <span className="bg-[#1a1a1a]/90 text-stone-300 text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 shadow-sm">
              Sold Out
            </span>
          ) : isLowStock ? (
            <span className="bg-amber-700 text-white text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 shadow-sm">
              Only {product.availableSets} Sets Left
            </span>
          ) : (
            <span className="bg-stone-900/90 text-amber-300 text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 shadow-sm">
              {product.availableSets} Sets In Stock
            </span>
          )}
        </div>

        {existingSetsInCart > 0 && (
          <div className="absolute bottom-3 left-3 bg-[#1a1a1a]/90 text-amber-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 shadow-sm flex items-center gap-1.5 border border-white/10">
            <Check className="w-3 h-3 text-emerald-400" />
            {existingSetsInCart} Sets In Cart
          </div>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-[#f9f7f2]">
        <div>
          <div className="flex items-center justify-between text-[10px] text-stone-500 font-bold uppercase tracking-wider mb-1">
            <span className="font-mono text-stone-700 font-semibold">{product.sku}</span>
          </div>

          <Link href={`/retailer/catalogue/${product.slug}`} className="block transition">
            <h3 className="font-serif text-base font-normal text-[#1a1a1a] line-clamp-1 group-hover:italic">
              {product.name}
            </h3>
          </Link>

          <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
            {product.fabric} &bull; {product.sizeCombination}
          </p>
        </div>

        <div className="bg-[#f5f2ea] p-3 border border-black/5 space-y-2">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-stone-500 block">Wholesale Rate</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-[#1a1a1a]">
                  ₹{product.wholesalePricePerPiece}
                </span>
                <span className="text-xs text-stone-500">/ pc</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[9px] uppercase tracking-[0.2em] font-bold text-stone-500 block">Wholesale Lot</span>
              <div className="text-xs font-bold text-amber-800">
                ₹{Number(product.wholesalePricePerSet).toLocaleString('en-IN')}{' '}
                <span className="text-[10px] text-stone-500 font-normal">({product.piecesPerSet} pcs/set)</span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-stone-500 pt-1.5 border-t border-black/5">
            <span className="font-medium">Ratio: {product.sizeCombination}</span>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          {error && (
            <p className="text-[10px] text-rose-700 font-semibold bg-rose-50 border border-rose-200 rounded px-2 py-1">
              {error}
            </p>
          )}

          {!isOutOfStock ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center border border-black/20 bg-white overflow-hidden shadow-sm">
                <button
                  type="button"
                  onClick={() => setSetsToAdd(Math.max(1, setsToAdd - 1))}
                  className="p-1.5 hover:bg-stone-100 text-stone-600 transition"
                  aria-label="Decrease sets"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 text-xs font-bold text-stone-800 min-w-[24px] text-center">
                  {setsToAdd}
                </span>
                <button
                  type="button"
                  onClick={() => setSetsToAdd(Math.min(product.availableSets, setsToAdd + 1))}
                  className="p-1.5 hover:bg-stone-100 text-stone-600 transition"
                  aria-label="Increase sets"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleQuickAdd}
                disabled={adding}
                className={`flex-1 py-2 px-3 text-[10px] uppercase tracking-[0.2em] font-bold shadow-sm transition flex items-center justify-center gap-1.5 disabled:opacity-70 ${
                  justAdded
                    ? 'bg-emerald-800 text-white'
                    : 'bg-[#1a1a1a] hover:bg-black text-[#f9f7f2]'
                }`}
              >
                {adding ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : justAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Added {setsToAdd} Set{setsToAdd > 1 ? 's' : ''}!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
                    <span>Add {setsToAdd} Set ({setsToAdd * product.piecesPerSet} pcs)</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <button
              disabled
              className="w-full py-2 px-3 bg-stone-200 text-stone-500 text-[10px] uppercase tracking-wider font-bold cursor-not-allowed"
            >
              Lot Out of Stock
            </button>
          )}

          <Link
            href={`/retailer/catalogue/${product.slug}`}
            className="block text-center py-1 text-[10px] uppercase tracking-[0.2em] font-bold text-stone-600 hover:text-black transition"
          >
            View Full Lot Specs &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}