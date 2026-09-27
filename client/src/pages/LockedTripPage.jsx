import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Lock,
  Printer,
  Share2,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react';
import { api } from '../api/client';

export default function LockedTripPage() {
  const { id } = useParams();
  const [copiedLink, setCopiedLink] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['locked-itinerary', id],
    queryFn: () => api.get(`/groups/${id}/itinerary`),
  });

  const { data: groupData } = useQuery({
    queryKey: ['group', id],
    queryFn: () => api.get(`/groups/${id}`),
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center animate-pulse">
        <div className="h-10 w-64 bg-parchment-border/40 rounded-xl mx-auto mb-4" />
        <div className="h-96 bg-white rounded-3xl border border-parchment-border" />
      </div>
    );
  }

  const itinerary = data?.itinerary;
  const group = groupData?.group;
  const dest = itinerary?.destination;
  const days = itinerary?.days || [];

  const copyShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Non-print top bar */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-parchment-border">
        <div>
          <Link
            to="/dashboard"
            className="text-xs font-semibold text-ink-muted hover:text-ink mb-1 inline-block"
          >
            ← Return to Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <Lock className="w-3 h-3" />
              Locked & Confirmed Plan
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={copyShare}
            className="px-4 py-2 rounded-xl bg-white border border-parchment-border hover:bg-parchment text-ink text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            {copiedLink ? <Check className="w-4 h-4 text-teal" /> : <Share2 className="w-4 h-4" />}
            <span>{copiedLink ? 'Link Copied!' : 'Share Trip Link'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-teal text-parchment text-xs font-semibold hover:bg-teal-700 flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Print / PDF Export</span>
          </button>
        </div>
      </div>

      {/* Hero Printable Summary Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-parchment-border shadow-sm mb-10">
        {/* Destination Image Banner if available */}
        {dest?.imageUrl && (
          <div className="relative h-64 -mx-6 -mt-6 sm:-mx-10 sm:-mt-10 mb-8 rounded-t-3xl overflow-hidden">
            <img
              src={dest.imageUrl}
              alt={dest.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
            <div className="absolute bottom-6 left-6 sm:left-10 text-white">
              <span className="text-xs uppercase font-bold tracking-widest text-sienna-300">
                Official Final Itinerary
              </span>
              <h1 className="font-serif text-3xl sm:text-5xl font-bold mt-1">
                {group?.name || `${dest.name} Trip`}
              </h1>
            </div>
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-8 border-b border-parchment-border">
          <div>
            <div className="flex items-center gap-1.5 text-xs uppercase font-bold text-ink-subtle mb-1">
              <MapPin className="w-3.5 h-3.5 text-sienna" />
              <span>Location</span>
            </div>
            <div className="font-serif text-xl font-bold text-ink">{dest?.name}</div>
            <div className="text-xs text-ink-muted">{dest?.country}</div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs uppercase font-bold text-ink-subtle mb-1">
              <Calendar className="w-3.5 h-3.5 text-teal" />
              <span>Dates</span>
            </div>
            <div className="font-serif text-xl font-bold text-ink">
              {itinerary?.dateRange && (
                <>
                  {new Date(itinerary.dateRange.start).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  –{' '}
                  {new Date(itinerary.dateRange.end).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </>
              )}
            </div>
            <div className="text-xs text-ink-muted">{days.length} days total</div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs uppercase font-bold text-ink-subtle mb-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span>Group Status</span>
            </div>
            <div className="font-serif text-xl font-bold text-ink">100% Consensus</div>
            <div className="text-xs text-ink-muted">All conflicts resolved & frozen</div>
          </div>
        </div>

        {/* Days List */}
        <div className="mt-8 space-y-8">
          {days.map((day) => (
            <div key={day.dayNumber} className="border-l-2 border-teal pl-6 relative">
              {/* Timeline marker */}
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-teal border-2 border-white" />

              <div className="flex items-baseline justify-between mb-3">
                <h3 className="font-serif text-xl font-bold text-ink">
                  Day {day.dayNumber}
                </h3>
              </div>

              <div className="space-y-3">
                {(day.activities || []).map((act, idx) => (
                  <div
                    key={act._id || idx}
                    className="p-4 rounded-2xl bg-parchment-light border border-parchment-border/80 flex items-start justify-between gap-4"
                  >
                    <div>
                      <h4 className="font-semibold text-sm text-ink">{act.name}</h4>
                      {act.description && (
                        <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">
                          {act.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        {act.durationHours && (
                          <span className="text-[11px] text-ink-subtle">
                            {act.durationHours} hours
                          </span>
                        )}
                        {(act.tags || []).map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white border border-parchment-border text-teal"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="font-mono text-sm font-bold text-teal shrink-0">
                      ${act.estimatedCostUSD}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
