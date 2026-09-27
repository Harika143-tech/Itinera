import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Compass, DollarSign, Calendar, MapPin, Tag } from 'lucide-react';
import { api } from '../api/client';

export default function DestinationsCatalogPage() {
  const [selectedTag, setSelectedTag] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['destinations-catalog'],
    queryFn: () => api.get('/destinations'),
  });

  const destinations = data?.destinations || [];

  const allTags = ['all', ...new Set(destinations.flatMap((d) => d.tags || []))];

  const filtered = selectedTag === 'all'
    ? destinations
    : destinations.filter((d) => d.tags?.includes(selectedTag));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-bold uppercase tracking-wider text-sienna px-3 py-1 rounded-full bg-sienna-50 border border-sienna-200">
          Inspiration
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink mt-2 mb-3">
          Explore Curated Destinations
        </h1>
        <p className="text-sm text-ink-muted">
          Browse destinations evaluated by our consensus algorithm with average daily costs, best months, and activity tags.
        </p>

        {/* Filter tags */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all border ${
                selectedTag === tag
                  ? 'bg-teal text-parchment border-teal shadow-xs'
                  : 'bg-white hover:bg-parchment text-ink-muted border-parchment-border'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 rounded-3xl bg-white/70 border border-parchment-border" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((dest) => (
            <div
              key={dest._id}
              className="bg-white rounded-3xl border border-parchment-border overflow-hidden hover:shadow-card transition-all flex flex-col justify-between"
            >
              <div className="relative h-48 overflow-hidden bg-parchment">
                {dest.imageUrl ? (
                  <img
                    src={dest.imageUrl}
                    alt={dest.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-teal">
                    <Compass className="w-8 h-8" />
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-ink/80 backdrop-blur-sm text-parchment px-2.5 py-0.5 rounded-full text-xs font-mono font-bold">
                  ${dest.avgCostPerDayUSD}/day
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-sienna font-semibold mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{dest.country}</span>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-ink mb-2">
                    {dest.name}
                  </h3>

                  <p className="text-xs text-ink-muted leading-relaxed line-clamp-3 mb-4">
                    {dest.description}
                  </p>
                </div>

                <div>
                  <div className="flex flex-wrap gap-1.5 pt-3 border-t border-parchment-border/80">
                    {(dest.tags || []).map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase bg-parchment text-teal border border-parchment-border"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
