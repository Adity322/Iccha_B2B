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
 * Same language as PublicProductCard: photo-first, dark floating panel.
 * The panel carries the commercial info (rate, lot, stepper, add) so the
 * price is always legible regardless of the photo behind it.
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
  const detailHref = `/retailer/catalogue/${product.slug}`;
  const setLabel = `${setsToAdd} Set${setsToAdd > 1 ? 's' : ''}`;

  const glassPill =
    'whitespace-nowrap rounded-full border border-white/15 bg-[#18140D]/45 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-md';

  return (
    <article className="group h-full rounded-[28px] border border-[#E7DEC9] bg-white p-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(0,0,0,0.12)]">
      <div className="relative aspect-[5/8] w-full overflow-hidden rounded-[20px] bg-[#ECE3D0]">
        {/* Photo — whole image links to the lot page */}
        <Link href={detailHref} className="absolute inset-0 block" aria-label={`View ${product.name}`}>
          {primaryImageUrl && (
            <Image
              src={primaryImageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className={`object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.04] ${
                isOutOfStock ? 'grayscale opacity-80' : ''
              }`}
              referrerPolicy="no-referrer"
            />
          )}
        </Link>

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent"
        />

        {/* Top row: seller + stock */}
        <div className="pointer-events-none absolute inset-x-3 top-3 flex items-center justify-between gap-2">
          <span className={`inline-flex min-w-0 items-center gap-1.5 ${glassPill}`}>
            <Store className="h-3 w-3 shrink-0 text-[#D9AE68]" />
            <span className="truncate">{product.sellerName}</span>
          </span>

          {isOutOfStock ? (
            <span className="shrink-0 whitespace-nowrap rounded-full bg-[#18140D]/75 px-3 py-1.5 text-[11px] font-medium text-white/70">
              Sold out
            </span>
          ) : isLowStock ? (
            <span className="shrink-0 whitespace-nowrap rounded-full bg-[#9C4A24] px-3 py-1.5 text-[11px] font-medium text-white">
              Only {product.availableSets} left
            </span>
          ) : (
            <span className={`shrink-0 ${glassPill}`}>{product.availableSets} in stock</span>
          )}
        </div>

        {/* Floating panel */}
        <div className="absolute inset-x-2 bottom-2 rounded-[18px] border border-white/15 bg-[#18140D]/60 p-3.5 text-white backdrop-blur-xl backdrop-saturate-150">
          <div className="flex items-center justify-between gap-2">
            <Link href={detailHref} className="min-w-0">
              <h3 className="truncate font-serif text-[18px] leading-snug" title={product.name}>
                {product.name}
              </h3>
            </Link>
            {existingSetsInCart > 0 && (
              <span className="inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
                <Check className="h-3 w-3" />
                {existingSetsInCart} in cart
              </span>
            )}
          </div>

          <p
            className="mt-0.5 truncate text-[12px] text-white/65"
            title={`${product.fabric} · ${product.sizeCombination} · ${product.sku}`}
          >
            {product.fabric} · {product.sizeCombination}
          </p>

          {/* Rates */}
          <div className="mt-2.5 flex items-baseline justify-between gap-2">
            <span className="shrink-0 whitespace-nowrap text-[19px] font-semibold leading-none">
              ₹{product.wholesalePricePerPiece}
              <span className="ml-1 text-[11px] font-normal text-white/60">/ pc</span>
            </span>
            <span className="min-w-0 truncate text-[11px] text-white/65">
              ₹{Number(product.wholesalePricePerSet).toLocaleString('en-IN')} / {product.piecesPerSet} pcs
            </span>
          </div>

          {error && (
            <p className="mt-2 rounded-xl bg-rose-900/70 px-3 py-1.5 text-[11px] font-medium text-rose-50">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {!isOutOfStock ? (
              <>
                <div className="flex h-10 shrink-0 items-center rounded-full border border-white/25 px-1">
                  <button
                    type="button"
                    onClick={() => setSetsToAdd(Math.max(1, setsToAdd - 1))}
                    className="grid h-7 w-7 place-items-center rounded-full text-white/80 transition hover:bg-white/15"
                    aria-label="Decrease sets"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="min-w-[20px] text-center text-[13px] font-semibold tabular-nums">
                    {setsToAdd}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSetsToAdd(Math.min(product.availableSets, setsToAdd + 1))}
                    className="grid h-7 w-7 place-items-center rounded-full text-white/80 transition hover:bg-white/15"
                    aria-label="Increase sets"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleQuickAdd}
                  disabled={adding}
                  className="flex h-10 min-w-[104px] flex-1 items-center justify-between rounded-full bg-white pl-4 pr-1 text-[13px] font-semibold text-[#18140D] transition-colors hover:bg-[#F5F0E6] disabled:opacity-70"
                >
                  <span className="truncate whitespace-nowrap">
                    {justAdded ? `Added ${setLabel}` : `Add ${setLabel}`}
                  </span>
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-white transition-colors ${
                      justAdded ? 'bg-emerald-700' : 'bg-[#18140D]'
                    }`}
                  >
                    {adding ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : justAdded ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <ShoppingBag className="h-4 w-4" />
                    )}
                  </span>
                </button>
              </>
            ) : (
              <span className="flex h-10 flex-1 cursor-not-allowed items-center justify-center rounded-full bg-white/15 text-[13px] font-semibold text-white/60">
                Lot out of stock
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}