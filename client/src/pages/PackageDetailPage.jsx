import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  MapPin,
  Star,
  Calendar,
  Building,
  Check,
  Compass,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function PackageDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, demoLogin } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['package-detail', id],
    queryFn: () => api.get(`/packages/${id}`),
  });

  const pkg = data?.package;
  const destinationHotels = data?.destinationHotels || [];
  const destinationActivities = data?.destinationActivities || [];

  const handleCustomize = async () => {
    if (!isAuthenticated) {
      await demoLogin('traveler');
    }
    try {
      const res = await api.post('/itineraries', { packageId: id });
      navigate(`/itineraries/${res.itinerary._id}/edit`);
    } catch (err) {
      console.error('Failed to create itinerary:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center animate-pulse">
        <div className="h-8 w-64 bg-bone-border/50 rounded-xl mx-auto mb-4" />
        <div className="h-96 bg-white rounded-3xl border border-bone-border" />
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="font-serif text-2xl font-bold text-navy mb-2">Package Not Found</h2>
        <Link to="/packages" className="text-sm font-semibold text-marigold-700">
          ← Back to Packages
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-4 text-xs font-semibold text-ink-muted">
        <Link to="/packages" className="hover:text-navy">
          ← All Packages
        </Link>
        <span className="text-bone-border">/</span>
        <span className="text-marigold-700 uppercase tracking-wider">{pkg.destination?.name}</span>
      </div>

      {/* Package Header Card */}
      <div className="bg-gradient-to-br from-navy via-navy-600 to-teal rounded-3xl p-8 sm:p-10 text-bone shadow-card mb-8 relative overflow-hidden">
        <div className="max-w-2xl relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-teal/40 text-teal-100 border border-teal-300/30">
              <Star className="w-3.5 h-3.5 text-marigold fill-marigold" />
              <span>{pkg.ratingAvg || 4.9} ({pkg.ratingCount || 30} verified reviews)</span>
            </span>
            <span className="text-xs text-bone/70 bg-navy-800/80 px-2.5 py-1 rounded-full">
              {pkg.defaultNights} Nights / {pkg.defaultNights + 1} Days
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-marigold font-semibold mb-2">
            <MapPin className="w-4 h-4" />
            <span>{pkg.destination?.name}, {pkg.destination?.country}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-bone leading-tight mb-4">
            {pkg.title}
          </h1>

          <p className="text-sm sm:text-base text-bone/80 leading-relaxed mb-6 font-normal">
            {pkg.destination?.heroNote || pkg.destination?.description}
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-4 border-t border-navy-500/80">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-bone/60 block">
                Starting Base Price
              </span>
              <span className="font-serif text-3xl font-bold text-marigold">
                ${pkg.basePriceUSD?.toLocaleString()}
              </span>
              <span className="text-xs text-bone/70 ml-2">/ person total</span>
            </div>

            <button
              onClick={handleCustomize}
              className="px-6 py-3.5 rounded-2xl bg-marigold text-navy font-semibold text-sm hover:bg-marigold-400 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg sm:ml-auto"
            >
              <span>Customize This Trip</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Ambient watermark motif */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full border-8 border-bone/10 pointer-events-none" />
      </div>

      {/* Package Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="p-6 rounded-3xl bg-white border border-bone-border shadow-xs">
          <Building className="w-6 h-6 text-marigold-700 mb-3" />
          <h3 className="font-serif text-lg font-bold text-navy mb-1">
            Default Stay: {pkg.defaultHotel?.name}
          </h3>
          <p className="text-xs text-ink-muted leading-relaxed mb-3">
            {pkg.defaultHotel?.description || 'Curated luxury accommodations with premium amenities.'}
          </p>
          <span className="text-xs font-semibold text-teal">
            {pkg.defaultHotel?.starRating}★ · ${pkg.defaultHotel?.nightlyRateUSD}/night (Swappable)
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-bone-border shadow-xs">
          <Compass className="w-6 h-6 text-teal mb-3" />
          <h3 className="font-serif text-lg font-bold text-navy mb-1">
            {pkg.defaultActivities?.length || 0} Included Activities
          </h3>
          <p className="text-xs text-ink-muted leading-relaxed mb-3">
            Handpicked experiences ranging from cultural tours to aquatic adventures.
          </p>
          <span className="text-xs font-semibold text-teal">
            Toggle on/off with instant price updates
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-bone-border shadow-xs">
          <ShieldCheck className="w-6 h-6 text-marigold-700 mb-3" />
          <h3 className="font-serif text-lg font-bold text-navy mb-1">
            DIY Live Customization
          </h3>
          <p className="text-xs text-ink-muted leading-relaxed mb-3">
            Our server-side price engine updates hotel and activity costs with zero reload.
          </p>
          <span className="text-xs font-semibold text-teal">
            Lock quote when you are happy
          </span>
        </div>
      </div>

      {/* Default Day-by-Day Itinerary Preview */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-bone-border shadow-card mb-8">
        <div className="pb-4 mb-6 border-b border-bone-border flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold text-navy">
              Default Day-by-Day Schedule
            </h2>
            <p className="text-xs text-ink-muted mt-0.5">
              This is the initial blueprint. Click "Customize This Trip" to swap any stay or tour.
            </p>
          </div>

          <button
            onClick={handleCustomize}
            className="px-4 py-2 rounded-xl bg-navy text-bone text-xs font-semibold hover:bg-navy-700 transition-colors"
          >
            Open in DIY Editor
          </button>
        </div>

        <div className="space-y-6">
          {[...Array(pkg.defaultNights)].map((_, idx) => {
            const dayNum = idx + 1;
            const activity = (pkg.defaultActivities || [])[idx % Math.max(1, (pkg.defaultActivities || []).length)];

            return (
              <div key={dayNum} className="border-l-2 border-navy pl-5 relative">
                <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-navy" />
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs uppercase font-bold text-marigold-700 tracking-wider">
                    Day {dayNum}
                  </span>
                  <span className="text-xs text-ink-subtle">· {pkg.destination?.name}</span>
                </div>
                <div className="font-semibold text-sm text-ink mb-1">
                  Stay: {pkg.defaultHotel?.name} ({pkg.defaultHotel?.starRating}★)
                </div>
                {activity && (
                  <div className="p-3 rounded-xl bg-bone text-xs text-ink mt-2 inline-flex items-center gap-2">
                    <Compass className="w-3.5 h-3.5 text-teal shrink-0" />
                    <span>
                      Activity: <strong>{activity.name}</strong> (${activity.costUSD})
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
