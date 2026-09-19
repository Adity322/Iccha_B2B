'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export interface RailCategory {
  id: string | number;
  name: string;
  slug: string;
  image: string;
  subcategories: readonly string[];
}

interface CategoryRailProps {
  categories: readonly RailCategory[];
}

/**
 * Category "rail" — tall fabric-strip tiles side by side, like garments on a rack.
 * Desktop (lg+): one tile is open at a time; hover or keyboard focus opens another.
 * Below lg: a plain 2-up grid of tiles (no hover needed).
 *
 * Palette: ink #18140D · gold #B3823C · gold-deep #D9AE68 · ivory-deep #ECE3D0
 */
export default function CategoryRail({ categories }: CategoryRailProps) {
  const [active, setActive] = useState(0);

  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:flex lg:h-[560px] lg:gap-3">
      {categories.map((category, i) => {
        const isActive = i === active;
        const chips = category.subcategories.slice(0, 4);
        const extra = category.subcategories.length - chips.length;

        return (
          <li
            key={category.id}
            className="min-w-0 transition-[flex-grow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:flex lg:basis-0"
            style={{ flexGrow: isActive ? 6 : 1 }}
            onMouseEnter={() => setActive(i)}
          >
            <Link
              href={`/categories/${category.slug}`}
              onFocus={() => setActive(i)}
              aria-label={`${category.name} — browse designs`}
              className="group relative block aspect-[3/4] w-full min-w-0 overflow-hidden rounded-[24px] bg-[#ECE3D0] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B3823C] lg:aspect-auto lg:flex-1"
            >
              <Image
                src={category.image}
                alt=""
                fill
                sizes="(max-width: 1024px) 50vw, 45vw"
                className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                referrerPolicy="no-referrer"
              />

              {/* Legibility gradient */}
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-[#18140D]/85 via-[#18140D]/10 to-transparent"
              />

              {/* Dim the closed strips so the open one reads as the focus */}
              <div
                aria-hidden
                className={`absolute inset-0 bg-[#18140D] opacity-0 transition-opacity duration-500 ${
                  isActive ? 'lg:opacity-0' : 'lg:opacity-30'
                }`}
              />

              {/* Closed strip: vertical name (lg only) */}
              <span
                aria-hidden
                className={`pointer-events-none absolute bottom-6 left-1/2 hidden max-h-[75%] -translate-x-1/2 rotate-180 overflow-hidden text-ellipsis whitespace-nowrap font-serif text-[20px] text-white transition-opacity duration-300 [writing-mode:vertical-rl] lg:block ${
                  isActive ? 'opacity-0' : 'opacity-100 delay-200'
                }`}
              >
                {category.name}
              </span>

              {/* Open tile / mobile tile content */}
              <div
                className={`absolute inset-x-0 bottom-0 p-4 transition-opacity duration-300 sm:p-5 lg:w-[360px] lg:p-7 xl:w-[480px] ${
                  isActive ? 'lg:opacity-100 lg:delay-200' : 'lg:opacity-0'
                }`}
              >
                <div className="flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-serif text-[19px] leading-tight text-white sm:text-[22px] lg:text-[32px]">
                      {category.name}
                    </h3>

                    {/* Mobile: quiet one-line hint */}
                    {chips.length > 0 && (
                      <p className="mt-1 truncate text-[12px] text-white/70 lg:hidden">
                        {chips.slice(0, 2).join(', ')}
                      </p>
                    )}

                    {/* Desktop: full subcategory chips */}
                    {chips.length > 0 && (
                      <ul className="mt-4 hidden flex-wrap gap-1.5 lg:flex">
                        {chips.map((sub) => (
                          <li
                            key={sub}
                            className="rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[12px] text-white backdrop-blur-md"
                          >
                            {sub}
                          </li>
                        ))}
                        {extra > 0 && (
                          <li className="rounded-full px-2 py-1 text-[12px] text-white/70">+{extra} more</li>
                        )}
                      </ul>
                    )}
                  </div>

                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-[#18140D] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 lg:h-12 lg:w-12">
                    <ArrowUpRight className="h-4 w-4 lg:h-5 lg:w-5" />
                  </span>
                </div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}