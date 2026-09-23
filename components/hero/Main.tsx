"use client";

import axios from 'axios';
import React, { useEffect, useState } from 'react'
import PublicProductCard from '@/components/product/PublicProductCard';
import CategoryRail from '@/components/category/CategoryRail';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Craft from './Craft';

function HomeElements() {
    const [products, setProducts] = useState<any[]>([])
    const [categories, setCategories] = useState([])


      const getData = async () => {
        const req = await axios.get("/api/home")
        if (req.status === 200) {
          console.log(req.data)
          setProducts(req.data.products)
          setCategories(req.data.categories)
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
                Every category we manufacture
              </h2>

              <Link
                href="/categories"
                className="inline-flex items-center gap-1.5 text-[15px] font-medium text-black group pb-0.5 border-b border-black transition-opacity duration-200 ease-out hover:opacity-60 shrink-0"
              >
                <span>View full catalogue</span>
                <ChevronRight className="w-4 h-4 transform transition-transform duration-200 ease-out group-hover:translate-x-1" />
              </Link>
            </div>

            <p className="reveal text-[15px] text-neutral-500 leading-relaxed max-w-xl mb-16">
              {categories.length} styles, cut and stitched across our Surat and Jaipur units — from
              festive 3-piece sets to everyday cambric cotton.
            </p>

        {
            categories.length > 0 && (
            <div className="reveal">
              <CategoryRail categories={categories} />
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

            {/* Representative Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {products.length > 0 && products.map((product, i) => (
                <div
                  key={product.id}
                  className="reveal"
                  style={{ '--reveal-delay': `${(i % 4) * 70}ms` } as React.CSSProperties}
                >
                  <PublicProductCard product={product} />
                </div>
              ))}
            </div>

          </div>
        </section>
</>
  )
}

export default HomeElements