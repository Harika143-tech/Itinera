import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Compass, MapPin, Calendar, Sun, ArrowRight } from 'lucide-react';
import { api } from '../api/client';

export default function DestinationsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['destinations-page'],
    queryFn: () => api.get('/destinations'),
  });

  const destinations = data?.destinations || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs font-bold uppercase tracking-wider text-marigold-700 px-3 py-1 rounded-full bg-marigold-50 border border-marigold-200">
          World Destinations
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-navy mt-2 mb-3">
          Explore Curated Holiday Escapes
        </h1>
        <p className="text-sm sm:text-base text-ink-muted">
          Each destination features handpicked luxury resorts, verified local excursions, and instant DIY customization.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-72 bg-white rounded-3xl border border-bone-border" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {destinations.map((d) => (
            <div
              key={d._id}
              className="bg-white rounded-3xl p-8 border border-bone-border shadow-card hover:border-navy/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5 text-xs text-marigold-700 font-bold uppercase tracking-wider">
                    <MapPin className="w-4 h-4" />
                    <span>{d.country}</span>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-bone text-ink-muted border border-bone-border">
                    {d.bestSeason}
                  </span>
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-navy mb-2">
                  {d.name}
                </h2>

                <p className="text-sm font-serif italic text-navy/80 mb-3">
                  "{d.heroNote || d.description}"
                </p>

                <p className="text-xs text-ink-muted leading-relaxed mb-6">
                  {d.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-6">
                  {(d.tags || []).map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-bone text-navy border border-bone-border"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-bone-border flex items-center justify-between">
                <span className="text-xs text-ink-muted flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5 text-marigold-700" />
                  <span>{d.climate || 'Tropical & Warm'}</span>
                </span>

                <Link
                  to={`/packages?destination=${d._id}`}
                  className="px-4 py-2 rounded-xl bg-navy text-bone text-xs font-semibold hover:bg-navy-700 transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <span>View Packages</span>
                  <ArrowRight className="w-3.5 h-3.5 text-marigold" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
