'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Product } from '@/lib/types';

interface PublicProductCardProps {
  product: Product;
}

/**
 * Photo-first card with a floating frosted info panel.
 *
 * - The garment stays the hero: the panel is inset and compact, not a full-height gradient.
 * - Dark glass (not white glass) so text stays readable on bright photos.
 * - Nothing in the footer can wrap: the price is masked in the meta row and the
 *   CTA is one full-width pill, so the layout survives narrow 4-up columns.
 *
 * Palette: ink #18140D · gold-deep #D9AE68 · border #E7DEC9 · bg #ECE3D0
 */
export default function PublicProductCard({ product }: PublicProductCardProps) {
  const primaryMedia = product.media[0] || {
    url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=900&auto=format&fit=crop&q=80',
    alt: product.name,
  };

  const typeLabel =
    product.clothingType === '3_piece'
      ? '3-Pc Set'
      : product.clothingType === '2_piece'
      ? '2-Pc Set'
      : 'Kurti';

  const glassPill =
    'whitespace-nowrap rounded-full border border-white/15 bg-[#18140D]/45 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-md';

  return (
    <article className="group h-full rounded-[28px] border border-[#E7DEC9] bg-white p-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(0,0,0,0.12)]">
      <div className="relative aspect-[5/8] w-full overflow-hidden rounded-[20px] bg-[#ECE3D0]">
        <Image
          src={primaryMedia.url}
          alt={primaryMedia.alt || product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          referrerPolicy="no-referrer"
        />

        {/* Soft shade so the panel edge doesn't float on a hard photo */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent"
        />

        {/* Top row */}
        <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
          <span className={`shrink-0 ${glassPill}`}>{typeLabel}</span>
          <span className={`min-w-0 truncate tabular-nums ${glassPill}`}>#{product.designNumber}</span>
        </div>

        {/* Floating info panel */}
        <div className="absolute inset-x-2 bottom-2 rounded-[18px] border border-white/15 bg-[#18140D]/60 p-3.5 text-white backdrop-blur-xl backdrop-saturate-150">
          <div className="flex items-center justify-between gap-2 text-[11px]">
            <span className="min-w-0 truncate font-medium text-[#D9AE68]">{product.categoryName}</span>
          </div>

          {/* min-h keeps every panel the same height whether the name runs 1 or 2 lines */}
          <h3 className="mt-1 line-clamp-2 min-h-[2.75em] font-serif text-[17px] leading-snug">
            {product.name}
          </h3>

          <p
            className="mt-1 truncate text-[12px] text-white/65"
            title={`${product.fabric} · ${product.style}`}
          >
            {product.fabric} · {product.style}
          </p>

          <Link
            href="/register"
            className="group/cta mt-3 flex h-10 items-center justify-between rounded-full bg-white pl-4 pr-1 text-[13px] font-semibold text-[#18140D] transition-colors hover:bg-[#F5F0E6]"
          >
            <span className="whitespace-nowrap">Unlock rates</span>
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#18140D] text-white">
              <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5" />
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}