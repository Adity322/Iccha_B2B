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
  Loader2,
  Ruler,
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

/**
 * Same design system as PublicProductCard — kept in sync so both grids
 * read as one cohesive card language:
 * surface #FFFFFF · ivory #F5F0E6 · border #E7DEC9 · ink #18140D
 * ink-soft #F3ECDD · muted #746A5A · subtle #A0937B · gold #B3823C
 */
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
    <div className="group flex flex-col h-full rounded-[18px] bg-white border border-black/[0.07] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 hover:shadow-[0_18px_42px_rgba(0,0,0,0.12)] hover:-translate-y-1">

      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#ECE3D0]">
        <Link href={`/retailer/catalogue/${product.slug}`} className="block w-full h-full">
          {primaryImageUrl && (
            <Image
              src={primaryImageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              referrerPolicy="no-referrer"
            />
          )}
        </Link>

        {/* Seller pill — top-left */}
        <div className="absolute top-3 left-3 max-w-[70%]">
          <span className="inline-flex items-center gap-1.5 max-w-full truncate bg-white/95 backdrop-blur-sm text-[#18140D] text-[10px] font-semibold px-3 py-1.5 rounded-full shadow-sm">
            <Store className="w-3 h-3 text-[#B3823C]" />
            {product.sellerName}
          </span>
        </div>

        {/* Stock pill — top-right */}
        <div className="absolute top-3 right-3">
          {isOutOfStock ? (
            <span className="bg-[#18140D]/90 text-[#C9BFAE] text-[10px] font-semibold px-3 py-1.5 rounded-full shadow-sm">
              Sold Out
            </span>
          ) : isLowStock ? (
            <span className="bg-[#9C4A24] text-white text-[10px] font-semibold px-3 py-1.5 rounded-full shadow-sm">
              Only {product.availableSets} Left
            </span>
          ) : (
            <span className="bg-[#18140D]/90 text-[#D9AE68] text-[10px] font-semibold px-3 py-1.5 rounded-full shadow-sm">
              {product.availableSets} In Stock
            </span>
          )}
        </div>

        {/* In-cart pill — bottom-left over image, reference-style price overlay */}
        {existingSetsInCart > 0 && (
          <div className="absolute bottom-3 left-3 inline-flex items-center gap-1 bg-white/95 backdrop-blur-sm text-[#18140D] text-[10px] font-semibold px-3 py-1.5 rounded-full shadow-sm">
            <Check className="w-3 h-3 text-emerald-700" />
            {existingSetsInCart} in cart
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between p-3.5 space-y-3">
        <div>
          <span className="text-[10px] font-mono font-semibold text-[#A0937B]">{product.sku}</span>

          <Link href={`/retailer/catalogue/${product.slug}`} className="block">
            <h3 className="text-[15px] font-semibold leading-snug text-[#18140D] line-clamp-1 group-hover:text-[#8C6428] transition mt-0.5">
              {product.name}
            </h3>
          </Link>

          <div className="flex items-center gap-3 text-[11px] text-[#746A5A] mt-1">
            <span>{product.fabric}</span>
            <span className="w-px h-3 bg-[#E7DEC9]" />
            <span className="inline-flex items-center gap-1">
              <Ruler className="w-3 h-3 text-[#A0937B]" />
              {product.sizeCombination}
            </span>
          </div>
        </div>

        {/* Price panel — reference "list price" block */}
        <div className="rounded-xl bg-[#F5F0E6] border border-[#E7DEC9] p-3 flex items-baseline justify-between">
          <div>
            <span className="block text-[9px] uppercase tracking-[0.12em] font-semibold text-[#A0937B] mb-0.5">
              Wholesale rate
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-[18px] font-bold text-[#18140D]">
                ₹{product.wholesalePricePerPiece}
              </span>
              <span className="text-[10px] text-[#746A5A]">/ pc</span>
            </div>
          </div>
          <div className="text-right">
            <span className="block text-[9px] uppercase tracking-[0.12em] font-semibold text-[#A0937B] mb-0.5">
              Per lot
            </span>
            <div className="text-[12px] font-bold text-[#8C6428]">
              ₹{Number(product.wholesalePricePerSet).toLocaleString('en-IN')}
              <span className="text-[10px] text-[#746A5A] font-normal"> ({product.piecesPerSet} pcs)</span>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-[10px] text-rose-700 font-semibold bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1.5">
            {error}
          </p>
        )}

        {!isOutOfStock ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-[#E7DEC9] bg-white rounded-xl overflow-hidden shrink-0">
              <button
                type="button"
                onClick={() => setSetsToAdd(Math.max(1, setsToAdd - 1))}
                className="p-2 hover:bg-[#F5F0E6] text-[#746A5A] transition"
                aria-label="Decrease sets"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-[12px] font-bold text-[#18140D] min-w-[20px] text-center">
                {setsToAdd}
              </span>
              <button
                type="button"
                onClick={() => setSetsToAdd(Math.min(product.availableSets, setsToAdd + 1))}
                className="p-2 hover:bg-[#F5F0E6] text-[#746A5A] transition"
                aria-label="Increase sets"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={adding}
              className={`flex-1 py-2.5 px-3 text-[10px] uppercase tracking-[0.12em] font-semibold rounded-full transition flex items-center justify-center gap-1.5 disabled:opacity-70 ${
                justAdded
                  ? 'bg-emerald-800 text-white'
                  : 'bg-[#18140D] hover:bg-[#2A2318] text-[#F3ECDD]'
              }`}
            >
              {adding ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added {setsToAdd} Set{setsToAdd > 1 ? 's' : ''}</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 text-[#D9AE68]" />
                  <span>Add {setsToAdd} Set{setsToAdd > 1 ? 's' : ''}</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <button
            disabled
            className="w-full py-2.5 px-3 bg-[#ECE3D0] text-[#A0937B] text-[10px] uppercase tracking-wider font-semibold rounded-full cursor-not-allowed"
          >
            Lot Out of Stock
          </button>
        )}

        <Link
          href={`/retailer/catalogue/${product.slug}`}
          className="block text-center text-[10px] uppercase tracking-[0.12em] font-semibold text-[#746A5A] hover:text-[#18140D] transition"
        >
          View full lot specs →
        </Link>
      </div>
    </div>
  );
}