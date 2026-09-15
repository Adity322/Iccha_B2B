import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Video, ShieldCheck, Sparkles, PhoneCall, Building2 } from 'lucide-react';
import PublicHeader from '@/components/layout/PublicHeader';
import Footer from '@/components/layout/Footer';

export default function VideosPage() {
  const videos = [
    {
      title: 'Surat Central Hub: 3-Piece Silk Festive Stitching & Zari Weaving',
      duration: '4:15 min',
      thumbnail: 'https://images.unsplash.com/photo-1551803091-e20673f15770?w=800&auto=format&fit=crop&q=80',
      category: 'Factory Tour & Quality',
      location: 'Surat Hub'
    },
    {
      title: 'Jaipur Cotton Printing: Pure 60x60 Cambric Handblock & Screen Craft',
      duration: '3:45 min',
      thumbnail: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80',
      category: 'Printing & Fabric Inspection',
      location: 'Jaipur Unit'
    },
    {
      title: 'Alia Cut & Nayra Cut V-Yoke Embroidery Finishing Tour',
      duration: '2:50 min',
      thumbnail: 'https://images.unsplash.com/photo-1596783074418-9752b578d665?w=800&auto=format&fit=crop&q=80',
      category: 'Design & Stitching',
      location: 'Surat Hub'
    },
    {
      title: 'Set-Based Packaging & Quality Dispatch Check (M, L, XL, XXL)',
      duration: '3:10 min',
      thumbnail: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80',
      category: 'Packing & Dispatch',
      location: 'Logistics Center'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />

      <main className="flex-1 py-12 bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="max-w-3xl space-y-3">
            <span className="text-xs uppercase font-bold tracking-[0.2em] text-[#831843]">
              Video Showcase
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
              Factory Craft, Stitching & Sample Feeds
            </h1>
            <p className="text-sm text-stone-600 leading-relaxed">
              Watch real production line footage from our Surat and Jaipur manufacturing facilities. Verified retailers can also book one-on-one live video sample calls with our merchandising team.
            </p>
          </div>

          {/* Video Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {videos.map((vid, idx) => (
              <div key={idx} className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-lg transition">
                <div className="relative aspect-video w-full bg-stone-900 group cursor-pointer">
                  <Image
                    src={vid.thumbnail}
                    alt={vid.title}
                    fill
                    className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-stone-950/30 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-[#831843] text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition">
                      <Play className="w-6 h-6 fill-white translate-x-0.5" />
                    </div>
                  </div>
                  <div className="absolute top-3 left-3 bg-stone-950/80 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full">
                    {vid.location}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-stone-950/80 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                    {vid.duration}
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-900">
                    {vid.category}
                  </span>
                  <h3 className="font-serif text-base font-bold text-stone-900 leading-snug">
                    {vid.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Request Video Call Box */}
          <div className="bg-gradient-to-r from-stone-900 via-rose-950 to-stone-900 text-white rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 max-w-xl">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
                <Video className="w-4 h-4" /> Live Video Merchandising
              </div>
              <h3 className="font-serif text-2xl font-bold">
                Want to inspect fabric fall & embroidery live?
              </h3>
              <p className="text-xs text-stone-300">
                Schedule a 15-minute high-definition WhatsApp video call directly with our floor merchandiser before locking your order enquiry.
              </p>
            </div>
            <Link
              href="/register"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-stone-950 font-bold text-xs shadow-lg transition whitespace-nowrap"
            >
              Register for Video Call Access
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
