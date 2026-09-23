"use client";

import { useState } from "react";
import axios from "axios";
import Footer from "@/components/layout/Footer";
import PublicHeader from "@/components/layout/PublicHeader";

/* =========================================================================
   Iccha Store — Contact section (v2)
   Warmer, quieter palette — espresso ink, brushed brass, dusty rose —
   on a soft ivory background. Solid colors instead of gradients,
   outline icons instead of filled badges, more whitespace throughout.

   Left: contact list + FAQ accordion. Right: the form, posting to
   /api/contact via axios. No header/footer — drop this into a page
   that already has its own.
   ========================================================================= */

type Status = "idle" | "loading" | "success" | "error";

type FormState = {
  name: string;
  shopName: string;
  phone: string;
  email: string;
  city: string;
  message: string;
};

const initialForm: FormState = {
  name: "",
  shopName: "",
  phone: "",
  email: "",
  city: "",
  message: "",
};

const faqs = [
  {
    q: "What's the minimum order quantity?",
    a: "MOQ is fixed per style, usually a set per size-run rather than a flat number across the catalog. Your exact minimum is confirmed when you share your requirement.",
  },
  {
    q: "Do I need a GST number to order?",
    a: "Yes — we bill every order against a GST invoice, so a valid GSTIN is needed to place a wholesale order.",
  },
  {
    q: "Can I see samples before a bulk order?",
    a: "Yes, single-piece samples are available for most styles. Sample cost is adjusted against your bulk order once confirmed.",
  },
  {
    q: "Which cities do you dispatch to?",
    a: "We ship pan-India through your choice of transport. Average dispatch time is about 48 hours from order confirmation.",
  },
];

/* ------------------------------- icons ---------------------------------- */

function MapPinIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M20 10c0 5.5-8 12-8 12s-8-6.5-8-12a8 8 0 1 1 16 0Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path
        d="M4 5c0-.6.4-1 1-1h3l1.5 4.5-2 1.5a12 12 0 0 0 6.5 6.5l1.5-2L19 16v3c0 .6-.4 1-1 1h-1C10.5 20 4 13.5 4 6V5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <circle cx="12" cy="12" r="8.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 7.5V12l3 2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`h-3.5 w-3.5 flex-none stroke-current transition-transform duration-300 ${open ? "rotate-180" : ""}`}
      fill="none"
      aria-hidden="true"
    >
      <path d="M4 6l4 4 4-4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 animate-spin" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/* ---------------------------- small pieces ------------------------------ */

function InfoRow({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 border-t border-[var(--line)] py-5 first:border-t-0 first:pt-0">
      <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-[var(--gold)]/40 text-[var(--gold)]">
        {icon}
      </div>
      <div>
        <h3 className="text-[15px] font-medium text-[var(--ink)]">{title}</h3>
        <div className="mt-1 text-sm leading-relaxed text-[var(--charcoal)]/70">{children}</div>
      </div>
    </div>
  );
}

function FaqItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div className="border-t border-[var(--line)] py-4 first:border-t-0 first:pt-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 text-left text-[15px] text-[var(--ink)]"
        aria-expanded={open}
      >
        <span>{q}</span>
        <ChevronIcon open={open} />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          open ? "mt-2 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-sm leading-relaxed text-[var(--charcoal)]/65">{a}</p>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  textarea = false,
  placeholder,
}: {
  label: string;
  name: keyof FormState;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  required?: boolean;
  textarea?: boolean;
  placeholder?: string;
}) {
  const shared =
    "w-full rounded-md border border-[var(--line)] bg-[var(--paper)] px-3.5 py-2.5 text-sm text-[var(--charcoal)] outline-none transition-colors duration-200 placeholder:text-[var(--charcoal)]/35 focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)]/40";
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-[var(--ink)]/70">{label}</span>
      {textarea ? (
        <textarea name={name} value={value} onChange={onChange} required={required} placeholder={placeholder} rows={12} className={shared} />
      ) : (
        <input name={name} type={type} value={value} onChange={onChange} required={required} placeholder={placeholder} className={shared} />
      )}
    </label>
  );
}

/* -------------------------------- page ----------------------------------- */

export default function ContactSection() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [status, setStatus] = useState<Status>("idle");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      await axios.post("/api/contact", form);
      setStatus("success");
      setForm(initialForm);
    } catch (err) {
      setStatus("error");
    }
  }

  return (
    <section
      style={
        {
          "--ink": "#2E2620",
          "--paper": "#FAF6EF",
          "--card": "#FFFFFF",
          "--gold": "#B8873B",
          "--rose": "#9C5A56",
          "--success": "#4B6B4F",
          "--line": "#E8E1D3",
          "--charcoal": "#34302A",
        } as React.CSSProperties
      }
      className="bg-[var(--paper)] text-[var(--charcoal)] [font-family:var(--font-body)]"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=IBM+Plex+Sans:wght@400;500&display=swap');
        :root {
          --font-display: 'Fraunces', ui-serif, Georgia, serif;
          --font-body: 'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif;
        }
        @keyframes riseIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .rise { animation: riseIn 0.45s ease-out forwards; }
        @media (prefers-reduced-motion: reduce) {
          .rise { animation: none !important; opacity: 1 !important; transform: none !important; }
        }
      `}</style>

  <PublicHeader />
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-16 px-6 py-20 sm:py-28 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        {/* ------------------------------ Left column ------------------------------ */}
        <div>
          <p className="text-sm text-[var(--gold)]">Get in touch</p>
          <h2 className="mt-2 [font-family:var(--font-display)] text-3xl leading-tight text-[var(--ink)] sm:text-4xl">
            Questions before you order? Start here.
          </h2>
          <p className="mt-4 max-w-md leading-relaxed text-[var(--charcoal)]/70">
            Reach us directly, or check the answers retailers ask most before
            placing their first order.
          </p>

          <div className="mt-8">
            <InfoRow icon={<MapPinIcon />} title="Visit the showroom">
              Iccha Store, Shop 14, Wholesale Cloth Market, Main Road
              <br />
              <a href="#" className="text-[var(--gold)] underline-offset-2 hover:underline">
                Get directions
              </a>
            </InfoRow>

            <InfoRow icon={<PhoneIcon />} title="Call or WhatsApp">
              <a href="tel:+910000000000" className="hover:text-[var(--ink)]">
                +91 00000 00000
              </a>
              <br />
              <a href="https://wa.me/910000000000" className="text-[var(--gold)] underline-offset-2 hover:underline">
                Chat on WhatsApp
              </a>
            </InfoRow>

            <InfoRow icon={<ClockIcon />} title="Showroom hours">
              Mon–Sat, 10:00 AM – 8:00 PM
              <br />
              Closed on Sundays and market holidays
            </InfoRow>
          </div>

          <div className="mt-10">
            <h3 className="text-lg text-[var(--ink)]">Frequently asked</h3>
            <div className="mt-1">
              {faqs.map((f, i) => (
                <FaqItem
                  key={f.q}
                  q={f.q}
                  a={f.a}
                  open={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ------------------------------ Right column ------------------------------ */}
        <div className="rounded-2xl border-t-2 border-[var(--gold)] bg-[var(--card)] min-h-0 p-7 shadow-[0_2px_24px_-8px_rgba(46,38,32,0.12)] sm:p-9">
          <h3 className="[font-family:var(--font-display)] text-2xl text-[var(--ink)]">
            Send us your requirement
          </h3>
          <p className="mt-1.5 text-sm text-[var(--charcoal)]/60">
            Share a few details and we&rsquo;ll get back within a day.
          </p>

          {status === "success" ? (
            <div className="rise mt-10 flex flex-col items-center py-6 text-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--success)]/40 text-[var(--success)]">
                <CheckIcon />
              </div>
              <p className="mt-4 text-[var(--ink)]">
                Thanks — your message is in. We&rsquo;ll reach out shortly.
              </p>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="mt-3 text-sm text-[var(--gold)] underline underline-offset-2"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Your name" name="name" value={form.name} onChange={handleChange} required placeholder="Full name" />
                <Field label="Shop / business name" name="shopName" value={form.shopName} onChange={handleChange} required placeholder="Your store" />
                <Field label="Phone number" name="phone" type="tel" value={form.phone} onChange={handleChange} required placeholder="10-digit mobile" />
                <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
              </div>
              <Field label="City" name="city" value={form.city} onChange={handleChange} required placeholder="Where's your store?" />
              <Field
                label="What are you looking for?"
                name="message"
                value={form.message}
                onChange={handleChange}
                textarea
                required
                placeholder="Categories, quantity, and any style preferences"
              />

              {status === "error" && (
                <p className="text-sm text-[var(--rose)]">
                  Something went wrong sending your message. Please try again.
                </p>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[var(--ink)] px-6 py-3 text-sm font-medium text-[var(--paper)] transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {status === "loading" && <Spinner />}
                {status === "loading" ? "Sending…" : "Send message"}
              </button>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </section>
  );
}