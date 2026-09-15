'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';
import PublicHeader from '@/components/layout/PublicHeader';
import Footer from '@/components/layout/Footer';
import { useApp } from '@/lib/context/AppContext';

export default function ContactPage() {
  const { addToast } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    city: '',
    mobile: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    addToast({
      type: 'success',
      title: 'Enquiry Received',
      message: 'Our wholesale team will contact you within 2 business hours.'
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />

      <main className="flex-1 py-12 bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="max-w-3xl space-y-3">
            <span className="text-xs uppercase font-bold tracking-[0.2em] text-[#831843]">
              B2B Assistance
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
              Wholesale Manufacturing Headquarters
            </h1>
            <p className="text-sm text-stone-600 leading-relaxed">
              Connect directly with our Surat and Jaipur production and billing desks for wholesale enquiries, agency partnerships, and transport logistics.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Manufacturing Facilities Cards */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Surat Hub */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-[#831843] text-white">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-stone-900">Surat Division</h3>
                      <span className="text-xs text-rose-900 font-semibold">Iccha Fashions Private Limited</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-stone-100 font-mono text-stone-700 px-2 py-0.5 rounded">
                    Entity A
                  </span>
                </div>

                <div className="space-y-2 text-xs text-stone-600">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-rose-800 shrink-0 mt-0.5" />
                    <span>Plot 412-416, Phase 2, Millennium Textile Market-2, Ring Road, Surat, Gujarat - 395002</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>+91 98251 44550 / +91 98251 44551</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-sky-700 shrink-0" />
                    <span>surat@icchastore.com</span>
                  </div>
                </div>
              </div>

              {/* Jaipur Hub */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-[#9a3412] text-white">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-stone-900">Jaipur Division</h3>
                      <span className="text-xs text-amber-900 font-semibold">Iccha Apparels LLP</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-stone-100 font-mono text-stone-700 px-2 py-0.5 rounded">
                    Entity B
                  </span>
                </div>

                <div className="space-y-2 text-xs text-stone-600">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
                    <span>F-88, RIICO Apparel Park, Mahal Road, Sanganer, Jaipur, Rajasthan - 302029</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>+91 94140 88220 / +91 94140 88221</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-sky-700 shrink-0" />
                    <span>jaipur@icchastore.com</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Quick Contact Form */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-8 border border-stone-200 shadow-sm">
              <h3 className="font-serif text-xl font-bold text-stone-900 mb-1">
                Wholesale Trade Enquiry
              </h3>
              <p className="text-xs text-stone-500 mb-6">
                Are you a garment distributor or multibrand outlet owner? Send your query below.
              </p>

              {submitted ? (
                <div className="p-8 text-center bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="font-serif text-lg font-bold text-stone-900">Thank You!</h4>
                  <p className="text-xs text-stone-600">
                    Your wholesale query has been submitted. Our regional merchandising representative will call you shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-xs text-[#831843] font-bold hover:underline"
                  >
                    Send another query
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Your Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Ramesh Patel"
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-rose-900"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-stone-700 font-semibold mb-1">Business / Store Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.businessName}
                        onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                        placeholder="e.g. Patel Ethnic Boutiques"
                        className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-rose-900"
                      />
                    </div>

                    <div>
                      <label className="block text-stone-700 font-semibold mb-1">City / State *</label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                        placeholder="e.g. Ahmedabad, Gujarat"
                        className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-rose-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Mobile / WhatsApp Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.mobile}
                      onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                      placeholder="e.g. +91 98250 12345"
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-rose-900"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-700 font-semibold mb-1">Estimated Monthly Volume / Enquiry</label>
                    <textarea
                      rows={3}
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us about the kurti categories you are interested in sourcing..."
                      className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-rose-900"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-[#831843] to-[#9a3412] text-white font-bold rounded-xl shadow hover:from-rose-900 hover:to-amber-900 transition flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Wholesale Enquiry</span>
                  </button>
                </form>
              )}
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
