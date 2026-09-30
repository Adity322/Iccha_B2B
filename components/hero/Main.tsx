"use client";

import axios from 'axios';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import PublicProductCard from '@/components/product/PublicProductCard';
// import CategoryRail from '@/components/category/CategoryRail';
import VendorRail, { RailVendor } from '@/components/vendor/VendorRail';
import Craft from './Craft';

function HomeElements() {
    const [products, setProducts] = useState<any[]>([])
    // const [categories, setCategories] = useState([])
    const [vendors, setVendors] = useState<RailVendor[]>([])


      const getData = async () => {
        const req = await axios.get("/api/home")
        if (req.status === 200) {
          console.log(req.data)
          setProducts(req.data.products)
          setVendors(req.data.vendors)
        }
      }
    
      useEffect(() => {
        getData()
      }, [])
  return (
<>
        <section className="py-24 sm:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="reveal flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
              <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-black tracking-tight leading-[1.05] max-w-xl">
                Our trusted vendors
              </h2>
            </div>

            <p className="reveal text-[15px] text-neutral-500 leading-relaxed max-w-xl mb-16">
              {vendors.length} verified manufacturing partners supplying wholesale ethnic wear
              across our platform.
            </p>

        {
            vendors.length > 0 && (
            <div className="reveal">
              <VendorRail vendors={vendors} />
            </div>
            )
        }

          </div>
        </section>

        <Craft />

        {/* ========================================================================= */}
        {/* 4. REPRESENTATIVE COLLECTION (Sensitive B2B info hidden) */}
        {/* ========================================================================= */}
        <section className="py-24 sm:py-32 bg-neutral-50 border-t border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div className="reveal mb-16 max-w-2xl">
              <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-black tracking-tight leading-[1.05] mb-4">
                A sample of what we make
              </h2>
              <p className="text-[15px] text-neutral-500 leading-relaxed">
                These pieces show our fabric cuts, embellishments, and stitching finishes.
                Wholesale rates, live stock, and size ratios unlock once your business is verified.
              </p>
            </div>

            {/* Representative Product Grid: first row open, the rest teased behind a login gate */}
            {(() => {
              const visibleProducts = products.slice(0, 4);
              const lockedProducts = products.slice(4);

              return (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {visibleProducts.map((product, i) => (
                      <div
                        key={product.id}
                        className="reveal"
                        style={{ '--reveal-delay': `${(i % 4) * 70}ms` } as React.CSSProperties}
                      >
                        <PublicProductCard product={product} />
                      </div>
                    ))}
                  </div>

                  {lockedProducts.length > 0 && (
                    <div className="relative mt-6 lg:mt-8 pb-10 overflow-hidden">
                      <div
                        aria-hidden
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 pointer-events-none select-none"
                      >
                        {lockedProducts.map((product) => (
                          <div key={product.id}>
                            <PublicProductCard product={product} />
                          </div>
                        ))}
                      </div>

                      {/* Fades the teased row into the section background, gate sits on top.
                          Stays clear through the top ~30% (the photo) then eases into
                          neutral-50 well before the row's own edge, so the card's drop
                          shadow never pokes out past the fade. */}
                      <div
                        aria-hidden
                        className="absolute inset-x-0 top-0 bottom-0 bg-gradient-to-b from-transparent from-0% via-neutral-50/90 via-75% to-neutral-50 to-100%"
                      />

                      <div className="absolute inset-x-0 top-0 bottom-0 flex items-end sm:items-center justify-center pb-8 sm:pb-0">
                        <Link
                          href="/login"
                          className="inline-flex items-center gap-2 rounded-full bg-black text-white px-8 py-3.5 text-sm font-medium tracking-wide shadow-lg transition-colors duration-200 hover:bg-neutral-800"
                        >
                          <Lock className="w-4 h-4" />
                          Log In To Unlock
                        </Link>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}

          </div>
        </section>
</>
  )
}

export default HomeElements