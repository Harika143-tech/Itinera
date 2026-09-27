import React, { useState, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Filter,
  Star,
  MapPin,
  Building,
  Check,
  ArrowRight,
  Sliders,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function BrowsePackagesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, demoLogin } = useAuth();

  // Filter state
  const destinationParam = searchParams.get('destination') || '';
  const minStarsParam = searchParams.get('minStars') || '';
  const minNightsParam = searchParams.get('minNights') || '';
  const maxBudgetParam = searchParams.get('maxBudget') || '4000';

  const [destination, setDestination] = useState(destinationParam);
  const [minStars, setMinStars] = useState(minStarsParam);
  const [minNights, setMinNights] = useState(minNightsParam);
  const [maxBudget, setMaxBudget] = useState(Number(maxBudgetParam));

  // Fetch Destinations for filter dropdown
  const { data: destData } = useQuery({
    queryKey: ['destinations-filter'],
    queryFn: () => api.get('/destinations'),
  });

  // Fetch Packages with query filters
  const { data: packagesData, isLoading } = useQuery({
    queryKey: ['packages', destination, minStars, minNights, maxBudget],
    queryFn: () => {
      const params = new URLSearchParams();
      if (destination && destination !== 'all') params.set('destination', destination);
      if (minStars) params.set('minStars', minStars);
      if (minNights) params.set('minNights', minNights);
      if (maxBudget) params.set('maxBudget', maxBudget.toString());
      return api.get(`/packages?${params.toString()}`);
    },
  });

  const packages = packagesData?.packages || [];
  const destinations = destData?.destinations || [];

  const handleResetFilters = () => {
    setDestination('');
    setMinStars('');
    setMinNights('');
    setMaxBudget(4000);
    setSearchParams({});
  };

  const handleCustomize = async (packageId) => {
    if (!isAuthenticated) {
      await demoLogin('traveler');
    }
    try {
      const res = await api.post('/itineraries', { packageId });
      navigate(`/itineraries/${res.itinerary._id}/edit`);
    } catch (err) {
      navigate(`/packages/${packageId}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="pb-6 mb-8 border-b border-bone-border">
        <span className="text-xs font-bold uppercase tracking-wider text-marigold-700">
          Holiday Packages Catalog
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-navy mt-1">
          Browse & Customize Holiday Packages
        </h1>
        <p className="text-sm text-ink-muted mt-1">
          Filter packages by destination, budget, hotel tier, and nights. Customize every itinerary live.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Filter Sidebar */}
        <aside className="lg:col-span-1 bg-white rounded-3xl p-6 border border-bone-border shadow-card sticky top-24">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-bone-border">
            <div className="flex items-center gap-2 text-navy font-serif font-bold text-lg">
              <Sliders className="w-4 h-4 text-marigold-700" />
              <span>Filters</span>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-xs text-ink-subtle hover:text-navy flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <div className="space-y-6">
            {/* Destination filter */}
            <div>
              <label className="block text-xs uppercase font-bold text-ink-subtle tracking-wider mb-2">
                Destination
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-bone border border-bone-border text-xs sm:text-sm text-ink outline-none focus:border-navy"
              >
                <option value="">All Destinations</option>
                {destinations.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}, {d.country}
                  </option>
                ))}
              </select>
            </div>

            {/* Budget Range Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs uppercase font-bold text-ink-subtle tracking-wider">
                  Max Budget
                </label>
                <span className="font-serif font-bold text-sm text-navy">
                  ${maxBudget.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="500"
                max="4000"
                step="100"
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                className="w-full accent-marigold cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-ink-subtle mt-1">
                <span>$500</span>
                <span>$4,000+</span>
              </div>
            </div>

            {/* Minimum Hotel Stars */}
            <div>
              <label className="block text-xs uppercase font-bold text-ink-subtle tracking-wider mb-2">
                Minimum Hotel Rating
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: 'Any', value: '' },
                  { label: '3★+', value: '3' },
                  { label: '4★+', value: '4' },
                  { label: '5★', value: '5' },
                ].map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => setMinStars(s.value)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      minStars === s.value
                        ? 'bg-navy text-bone border-navy shadow-xs'
                        : 'bg-bone hover:bg-bone-border text-ink border-bone-border'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration / Nights */}
            <div>
              <label className="block text-xs uppercase font-bold text-ink-subtle tracking-wider mb-2">
                Trip Duration
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: 'Any', value: '' },
                  { label: '4-5N', value: '4' },
                  { label: '6N+', value: '6' },
                ].map((n) => (
                  <button
                    key={n.label}
                    type="button"
                    onClick={() => setMinNights(n.value)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      minNights === n.value
                        ? 'bg-navy text-bone border-navy shadow-xs'
                        : 'bg-bone hover:bg-bone-border text-ink border-bone-border'
                    }`}
                  >
                    {n.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Packages Results Grid */}
        <main className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-ink-muted">
              Showing <strong>{packages.length}</strong> holiday packages
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-80 rounded-3xl bg-white/70 border border-bone-border" />
              ))}
            </div>
          ) : packages.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-bone-border">
              <Compass className="w-10 h-10 text-ink-subtle mx-auto mb-3" />
              <h3 className="font-serif text-xl font-bold text-ink mb-1">No Packages Match Your Filter</h3>
              <p className="text-xs text-ink-muted mb-4">Try expanding your budget ceiling or clearing hotel star filters.</p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl bg-navy text-bone text-xs font-semibold"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {packages.map((pkg) => (
                <div
                  key={pkg._id}
                  className="bg-white rounded-3xl border border-bone-border overflow-hidden hover:border-navy/40 hover:shadow-card transition-all flex flex-col justify-between group"
                >
                  {/* Pattern & Destination Banner */}
                  <div className="relative h-44 bg-gradient-to-br from-navy via-navy-600 to-teal p-5 text-bone flex flex-col justify-between overflow-hidden">
                    <div className="flex items-center justify-between z-10">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal/40 text-teal-100 border border-teal-300/30">
                        <Star className="w-3 h-3 text-marigold fill-marigold" />
                        <span>{pkg.ratingAvg || 4.9} ({pkg.ratingCount || 30})</span>
                      </span>

                      <span className="text-[11px] font-semibold text-bone/80 bg-navy-800/60 px-2 py-0.5 rounded-full">
                        {pkg.defaultNights} Nights / {pkg.defaultNights + 1} Days
                      </span>
                    </div>

                    <div className="z-10">
                      <div className="flex items-center gap-1.5 text-xs text-marigold font-semibold">
                        <MapPin className="w-3 h-3" />
                        <span>{pkg.destination?.name}, {pkg.destination?.country}</span>
                      </div>
                      <h3 className="font-serif text-xl font-bold text-bone line-clamp-2 mt-0.5">
                        {pkg.title}
                      </h3>
                    </div>

                    <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full border-4 border-bone/10 pointer-events-none" />
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Default Hotel badge */}
                      {pkg.defaultHotel && (
                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-bone text-xs text-ink mb-3">
                          <Building className="w-4 h-4 text-marigold-700 shrink-0" />
                          <div className="truncate">
                            <span className="text-ink-subtle">Default Stay:</span>{' '}
                            <strong>{pkg.defaultHotel.name}</strong> ({pkg.defaultHotel.starRating}★)
                          </div>
                        </div>
                      )}

                      {/* Included activities count */}
                      <div className="text-xs text-ink-muted mb-4">
                        Includes <strong>{pkg.defaultActivities?.length || 0} top-rated activities</strong> (all customizable)
                      </div>

                      {/* Highlights */}
                      <ul className="space-y-1.5 text-xs text-ink-muted mb-4">
                        {(pkg.highlights || []).slice(0, 2).map((h, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-teal shrink-0 mt-0.5" />
                            <span className="line-clamp-1">{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Price & Actions Row */}
                    <div className="pt-4 border-t border-bone-border flex items-baseline justify-between gap-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-ink-subtle block">
                          Starting From
                        </span>
                        <span className="font-serif text-2xl font-bold text-navy">
                          ${pkg.basePriceUSD?.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          to={`/packages/${pkg._id}`}
                          className="px-3 py-2 rounded-xl bg-bone hover:bg-bone-border text-ink text-xs font-semibold transition-colors"
                        >
                          Details
                        </Link>
                        <button
                          onClick={() => handleCustomizePackage(pkg._id)}
                          className="px-4 py-2 rounded-xl bg-marigold text-navy text-xs font-semibold hover:bg-marigold-400 transition-colors shadow-xs"
                        >
                          Customize
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
