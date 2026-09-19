'use client';

import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  PhoneCall,
  Video,
  Sparkles,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { MOQEvaluation } from '@/lib/types/cart';
import { useApp } from '@/lib/context/AppContext';

interface MOQProgressBarProps {
  evaluation: MOQEvaluation | null;
  onOpenSellerModal?: () => void;
}

export default function MOQProgressBar({ evaluation, onOpenSellerModal }: MOQProgressBarProps) {
  const { openSellerModal } = useApp();
  const handleOpen = onOpenSellerModal || openSellerModal;

  if (!evaluation) return null;

  // Show whichever criterion is furthest from being met, not just sets —
  // otherwise the bar can read "100%" while checkout is still blocked on pieces/designs/value.
  const metrics = [
    { label: 'Sets', current: evaluation.currentSets, required: evaluation.requiredSets },
    { label: 'Pieces', current: evaluation.currentPieces, required: evaluation.requiredPieces },
    { label: 'Designs', current: evaluation.currentDesigns, required: evaluation.requiredDesigns },
  ];

  const binding = metrics.reduce((worst, m) => {
    const ratio = m.required > 0 ? m.current / m.required : 1;
    const worstRatio = worst.required > 0 ? worst.current / worst.required : 1;
    return ratio < worstRatio ? m : worst;
  });

  const current = binding.current;
  const target = binding.required;
  const percent = Math.min(100, Math.round((current / (target || 1)) * 100));


  return (
    <div className={`p-4 rounded-2xl border transition-all ${evaluation.isMet
      ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
      : 'bg-amber-50/90 border-amber-300 text-amber-950 shadow-sm'
      }`}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {evaluation.isMet ? (
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
          )}
          <div>
            <h4 className="font-bold text-sm leading-tight">
              {evaluation.isMet
                ? 'Minimum Order Quantity (MOQ) Requirement Met'
                : 'Minimum Order Quantity (MOQ) Incomplete'}
            </h4>
            <p className="text-xs text-stone-600 mt-0.5">
              {evaluation.overrideApplied
                ? 'Admin Exception Active: MOQ override approved for your account.'
                : evaluation.message}
            </p>
          </div>
        </div>

        {/* Status Chip */}
        <div className="self-start sm:self-center">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${evaluation.isMet
            ? 'bg-emerald-600 text-white'
            : 'bg-amber-200 text-amber-900 border border-amber-300'
            }`}>
            {current} / {target} {binding.label} ({percent}%)
          </span>
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="w-full bg-stone-200 rounded-full h-2.5 overflow-hidden my-3">
        <div
          className={`h-full rounded-full transition-all duration-500 ${evaluation.isMet
            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
            : 'bg-gradient-to-r from-amber-500 to-rose-600'
            }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      {/* Action / Below MOQ Special Workflow */}
      {!evaluation.isMet && (
        <div className="mt-3 pt-3 border-t border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-stone-700">
            <span className="font-semibold text-amber-900">Need sample verification before bulk ordering?</span>
            <p className="text-[11px] text-stone-600">
              Request a direct sample video call or request an MOQ exception from IcchaStore managers.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleOpen()}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-rose-700 hover:from-amber-500 hover:to-rose-600 text-white text-xs font-semibold shadow-sm transition whitespace-nowrap"
          >
            <Video className="w-3.5 h-3.5 text-amber-200" />
            <span>Contact Seller / Request Video Call</span>
          </button>
        </div>
      )}
    </div>
  );
}
