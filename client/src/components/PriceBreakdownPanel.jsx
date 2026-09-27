import React from 'react';
import { DollarSign, Sparkles, Building, Compass, Check, ArrowRight, ShieldCheck } from 'lucide-react';

export default function PriceBreakdownPanel({
  breakdown = { hotelTotal: 0, activitiesTotal: 0, total: 0 },
  daysCount = 5,
  isUpdating = false,
  onSave,
  onRequestQuote,
  isSaving = false,
  itineraryStatus = 'draft',
}) {
  const hotelTotal = breakdown?.hotelTotal || 0;
  const activitiesTotal = breakdown?.activitiesTotal || 0;
  const grandTotal = breakdown?.total || hotelTotal + activitiesTotal;
  const perNightAvg = Math.round(grandTotal / Math.max(1, daysCount));

  return (
    <div className="sticky top-20 z-30 rounded-3xl bg-navy text-bone p-6 sm:p-7 shadow-pricing border-2 border-navy-600/80 transition-all">
      {/* Top Tag & Live Indicator */}
      <div className="flex items-center justify-between pb-4 mb-5 border-b border-navy-600">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1 items-center">
            <div className="w-4 h-4 rounded-full bg-marigold" />
            <div className="w-4 h-4 rounded-full bg-teal opacity-90" />
          </div>
          <span className="font-serif font-bold text-base text-bone tracking-wide">
            Live DIY Price Engine
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isUpdating ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-marigold/20 text-marigold border border-marigold/40 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-marigold animate-ping" />
              Recalculating...
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-teal/30 text-teal-100 border border-teal/40">
              <Check className="w-3 h-3 text-teal-200" />
              Real-time Synced
            </span>
          )}
        </div>
      </div>

      {/* Prominent Grand Total Display */}
      <div className="mb-6">
        <span className="text-xs uppercase tracking-wider font-semibold text-bone/60 block">
          Total Estimated Package Price
        </span>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="font-serif text-4xl sm:text-5xl font-bold text-marigold tracking-tight">
            ${grandTotal.toLocaleString()}
          </span>
          <span className="text-xs text-bone/70">/ {daysCount} nights total</span>
        </div>
        <p className="text-xs text-bone/60 mt-1">
          Approx. <strong className="text-bone">${perNightAvg}</strong> per night (Hotels + Activities)
        </p>
      </div>

      {/* Component Splits: Hotels vs Activities */}
      <div className="space-y-3 p-4 rounded-2xl bg-navy-800/80 border border-navy-700 mb-6">
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-bone/80">
            <Building className="w-4 h-4 text-marigold" />
            <span>Stays & Accommodations ({daysCount} nights)</span>
          </div>
          <span className="font-mono font-bold text-bone">
            ${hotelTotal.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2 text-bone/80">
            <Compass className="w-4 h-4 text-teal-200" />
            <span>Curated Excursions & Activities</span>
          </div>
          <span className="font-mono font-bold text-bone">
            ${activitiesTotal.toLocaleString()}
          </span>
        </div>

        <div className="pt-2 border-t border-navy-700/80 flex items-center justify-between text-[11px] text-bone/60">
          <span>Taxes & service charges</span>
          <span className="text-teal-200 font-semibold">Included</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {onRequestQuote && (
          <button
            type="button"
            onClick={onRequestQuote}
            className="w-full py-3.5 px-4 rounded-2xl bg-marigold text-navy font-semibold text-sm hover:bg-marigold-400 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <span>Proceed to Booking / Quote</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        {onSave && (
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="w-full py-3 px-4 rounded-2xl bg-navy-700 hover:bg-navy-600 text-bone text-xs font-semibold border border-navy-600 transition-colors flex items-center justify-center gap-1.5"
          >
            {isSaving ? (
              'Saving to Account...'
            ) : itineraryStatus === 'saved' ? (
              <>
                <Check className="w-3.5 h-3.5 text-marigold" />
                <span>Saved to My Itineraries</span>
              </>
            ) : (
              <span>Save Customized Draft</span>
            )}
          </button>
        )}
      </div>

      {/* Trust reassurance note */}
      <div className="mt-4 pt-3 border-t border-navy-700 flex items-center gap-2 text-[11px] text-bone/50">
        <ShieldCheck className="w-4 h-4 text-teal-200 shrink-0" />
        <span>Strict server-side validation. Instant quote lock without hidden agent fees.</span>
      </div>
    </div>
  );
}
