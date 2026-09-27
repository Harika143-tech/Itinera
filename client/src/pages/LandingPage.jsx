import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Compass,
  Calendar,
  DollarSign,
  Star,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Sliders,
  Check,
  Building,
  Quote,
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, demoLogin } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Search-first hero form state
  const [selectedDest, setSelectedDest] = useState('');
  const [selectedBudget, setSelectedBudget] = useState('');
  const [selectedNights, setSelectedNights] = useState('');

  // Fetch Packages & Destinations
  const { data: packagesData } = useQuery({
    queryKey: ['landing-packages'],
    queryFn: () => api.get('/packages'),
  });

  const { data: destinationsData } = useQuery({
    queryKey: ['landing-destinations'],
    queryFn: () => api.get('/destinations'),
  });

  const packages = packagesData?.packages || [];
  const destinations = destinationsData?.destinations || [];

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedDest) params.set('destination', selectedDest);
    if (selectedBudget) params.set('maxBudget', selectedBudget);
    if (selectedNights) params.set('minNights', selectedNights);
    navigate(`/packages?${params.toString()}`);
  };

  const handleCustomizePackage = async (packageId) => {
    if (!isAuthenticated) {
      // Auto login as demo traveler Samantha to remove all friction
      await demoLogin('traveler');
    }
    try {
      const res = await api.post('/itineraries', { packageId });
      navigate(`/itineraries/${res.itinerary._id}/edit`);
    } catch (err) {
      console.error(err);
      navigate(`/packages/${packageId}`);
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Search-First Hero Section with Elegant Geometric Gradients */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 bg-gradient-to-b from-bone via-bone-light to-bone border-b border-bone-border">
        {/* Subtle SVG Grid Texture */}
        <div className="absolute inset-0 opacity-25 pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(22,35,58,0.15)" strokeWidth="0.75" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-marigold-100 border border-marigold-300 text-marigold-900 text-xs sm:text-sm font-semibold mb-6 shadow-xs">
            <Sparkles className="w-4 h-4 text-marigold-700" />
            <span>The DIY Holiday-Package Platform</span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-navy leading-[1.1] mb-6">
            Build your holiday package.{' '}
            <span className="italic font-normal text-marigold-700 block sm:inline">
              Customize every detail.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-xl text-ink-muted leading-relaxed mb-10 font-normal">
            Browse handpicked destination packages. Swap hotels per night, add or remove activities,
            and watch the total price recalculate live — no waiting for travel agents.
          </p>

          {/* Search-First Form Filter Bar */}
          <div className="max-w-4xl mx-auto bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-5 border-2 border-bone-border shadow-card text-left">
            <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {/* Destination select */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-ink-subtle mb-1">
                  Destination
                </label>
                <select
                  value={selectedDest}
                  onChange={(e) => setSelectedDest(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bone border border-bone-border text-sm text-ink font-medium outline-none focus:border-navy"
                >
                  <option value="">Any Destination</option>
                  {destinations.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}, {d.country}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nights select */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-ink-subtle mb-1">
                  Duration
                </label>
                <select
                  value={selectedNights}
                  onChange={(e) => setSelectedNights(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bone border border-bone-border text-sm text-ink font-medium outline-none focus:border-navy"
                >
                  <option value="">Any Nights</option>
                  <option value="4">4+ Nights</option>
                  <option value="5">5+ Nights</option>
                  <option value="6">6+ Nights</option>
                </select>
              </div>

              {/* Budget limit */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-ink-subtle mb-1">
                  Budget Cap
                </label>
                <select
                  value={selectedBudget}
                  onChange={(e) => setSelectedBudget(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-bone border border-bone-border text-sm text-ink font-medium outline-none focus:border-navy"
                >
                  <option value="">Any Budget</option>
                  <option value="1200">Under $1,200</option>
                  <option value="2000">Under $2,000</option>
                  <option value="3500">Under $3,500</option>
                </select>
              </div>

              {/* Submit CTA */}
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-3 px-5 rounded-xl bg-navy text-bone font-semibold text-sm hover:bg-navy-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>Explore Packages</span>
                  <ArrowRight className="w-4 h-4 text-marigold" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Popular Escapes Showcase */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-marigold-700">
              Curated Escapes
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-navy mt-1">
              Popular Tailor-Made Packages
            </h2>
            <p className="text-sm text-ink-muted mt-1">
              Select any package below to inspect the day-by-day plan or customize stays and tours.
            </p>
          </div>

          <Link
            to="/packages"
            className="text-xs sm:text-sm font-semibold text-navy hover:text-marigold-700 flex items-center gap-1.5"
          >
            <span>View all packages</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Packages Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg._id}
              className="bg-white rounded-3xl border border-bone-border overflow-hidden hover:border-navy/40 hover:shadow-card transition-all flex flex-col justify-between group"
            >
              {/* Pattern Header with Gradient */}
              <div className="relative h-44 bg-gradient-to-br from-navy via-navy-600 to-teal p-5 text-bone flex flex-col justify-between overflow-hidden">
                <div className="flex items-center justify-between z-10">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal/40 text-teal-100 border border-teal-300/30">
                    <Star className="w-3 h-3 text-marigold fill-marigold" />
                    <span>{pkg.ratingAvg || 4.9} ({pkg.ratingCount || 28})</span>
                  </span>

                  <span className="text-[11px] font-semibold text-bone/80 bg-navy-800/60 px-2 py-0.5 rounded-full">
                    {pkg.defaultNights}N / {pkg.defaultNights + 1}D
                  </span>
                </div>

                <div className="z-10">
                  <div className="flex items-center gap-1.5 text-xs text-marigold font-semibold">
                    <MapPin className="w-3 h-3" />
                    <span>{pkg.destination?.name}, {pkg.destination?.country}</span>
                  </div>
                  <h3 className="font-serif text-lg font-bold text-bone line-clamp-2 mt-0.5">
                    {pkg.title}
                  </h3>
                </div>

                {/* Geometric circle watermark */}
                <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full border-4 border-bone/10 pointer-events-none" />
              </div>

              {/* Package Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  {/* Default Stay Tag */}
                  {pkg.defaultHotel && (
                    <div className="flex items-center gap-2 p-2 rounded-xl bg-bone text-xs text-ink mb-3">
                      <Building className="w-3.5 h-3.5 text-marigold-700 shrink-0" />
                      <span className="truncate">
                        Stay: <strong>{pkg.defaultHotel.name}</strong> ({pkg.defaultHotel.starRating}★)
                      </span>
                    </div>
                  )}

                  {/* Highlights checklist */}
                  <ul className="space-y-1.5 text-xs text-ink-muted mb-4">
                    {(pkg.highlights || []).slice(0, 2).map((h, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-teal shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Price and CTA row */}
                <div className="pt-4 border-t border-bone-border flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-ink-subtle block">
                      Starting From
                    </span>
                    <span className="font-serif text-2xl font-bold text-navy">
                      ${pkg.basePriceUSD?.toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => handleCustomizePackage(pkg._id)}
                    className="px-3.5 py-2 rounded-xl bg-marigold text-navy text-xs font-semibold hover:bg-marigold-400 transition-colors shadow-xs"
                  >
                    Customize Trip
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3-Step Sequence: How It Works */}
      <section className="py-16 sm:py-24 bg-white/80 border-y border-bone-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-marigold-700 px-3 py-1 rounded-full bg-marigold-50 border border-marigold-200">
              The DIY Advantage
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-navy mt-3 mb-4">
              How DIY Holiday Planning Works
            </h2>
            <p className="text-ink-muted text-base">
              Say goodbye to rigid pre-packaged tours and days spent waiting for travel agent quotes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-bone border border-bone-border flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-navy text-bone font-serif font-bold text-xl flex items-center justify-center mb-6 shadow-sm">
                  1
                </div>
                <h3 className="font-serif text-xl font-bold text-navy mb-2">
                  Pick a Curated Base
                </h3>
                <p className="text-sm text-ink-muted leading-relaxed">
                  Browse packages designed by destination specialists with recommended hotels, seamless city routes, and top-rated excursions.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-bone-border/70 text-xs font-semibold text-teal flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified 4 & 5-star partners</span>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-bone border border-bone-border flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-marigold text-navy font-serif font-bold text-xl flex items-center justify-center mb-6 shadow-sm">
                  2
                </div>
                <h3 className="font-serif text-xl font-bold text-navy mb-2">
                  Swap, Toggle & Customise
                </h3>
                <p className="text-sm text-ink-muted leading-relaxed">
                  Swap out hotels for beachfront villas, toggle activities you want or skip, and watch your total price update immediately on screen.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-bone-border/70 text-xs font-semibold text-marigold-700 flex items-center gap-1.5">
                <Sliders className="w-4 h-4" />
                <span>Live recalculation engine</span>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-bone border border-bone-border flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-teal text-bone font-serif font-bold text-xl flex items-center justify-center mb-6 shadow-sm">
                  3
                </div>
                <h3 className="font-serif text-xl font-bold text-navy mb-2">
                  Lock Quote & Book
                </h3>
                <p className="text-sm text-ink-muted leading-relaxed">
                  Once your itinerary looks perfect, lock in your dates and submit your booking request. Our on-ground concierge coordinates the rest.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-bone-border/70 text-xs font-semibold text-teal flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Transparent price lock guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Traveler Testimonials Strip */}
      <section className="py-16 sm:py-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-navy text-bone border border-navy-700 shadow-card flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <Quote className="w-8 h-8 text-marigold mb-4 opacity-80" />
            <blockquote className="font-serif text-xl sm:text-2xl font-normal leading-relaxed text-bone/95 mb-4">
              "Being able to swap the standard hotel for an overwater bungalow and immediately see the exact price change was unbelievable. No waiting 48 hours for an agency email."
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-marigold text-navy font-bold flex items-center justify-center text-sm">
                MK
              </div>
              <div>
                <div className="font-semibold text-sm text-bone">Marcus & Kelly Chen</div>
                <div className="text-xs text-bone/60">Traveled to Maldives & Bali with Itinera</div>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-center md:items-end gap-3 text-center md:text-right">
            <div className="text-3xl font-serif font-bold text-marigold">4.9 / 5.0</div>
            <div className="flex items-center gap-1 text-marigold">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-marigold" />
              ))}
            </div>
            <span className="text-xs text-bone/60">Over 3,400 customized holidays booked</span>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 bg-navy-800 text-bone border-t border-navy-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
            Build your dream holiday in minutes.
          </h2>
          <p className="text-bone/70 text-sm sm:text-base max-w-xl mx-auto mb-8">
            Filter by destination, star rating, and budget. Customize stays and activities with live pricing.
          </p>
          <Link
            to="/packages"
            className="px-8 py-4 rounded-2xl bg-marigold text-navy font-semibold text-base hover:bg-marigold-400 transition-all shadow-lg active:scale-95 inline-flex items-center gap-2"
          >
            <span>Start Customizing a Package</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => navigate('/packages')}
      />
    </div>
  );
}
