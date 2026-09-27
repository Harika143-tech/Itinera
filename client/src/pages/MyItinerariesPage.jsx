import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Compass, Calendar, DollarSign, ArrowRight, Building, Clock, CheckCircle2 } from 'lucide-react';
import { api } from '../api/client';

export default function MyItinerariesPage() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['my-itineraries'],
    queryFn: () => api.get('/itineraries/mine'),
  });

  const itineraries = data?.itineraries || [];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'quote_requested':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200">
            Quote Requested
          </span>
        );
      case 'saved':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal/20 text-teal border border-teal/40">
            Saved Plan
          </span>
        );
      case 'confirmed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Confirmed Booking
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-bone border border-bone-border text-ink-muted">
            Draft
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="pb-6 mb-8 border-b border-bone-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-marigold-700">
            Saved Trips
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-navy mt-1">
            My Customized Itineraries
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Revisit, customize, or request quotes for your customized holiday packages.
          </p>
        </div>

        <Link
          to="/packages"
          className="px-5 py-2.5 rounded-xl bg-navy text-bone text-xs sm:text-sm font-semibold hover:bg-navy-700 transition-colors shadow-xs self-start sm:self-auto"
        >
          Explore New Packages
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-white/70 border border-bone-border" />
          ))}
        </div>
      ) : itineraries.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-bone-border max-w-lg mx-auto shadow-card">
          <Compass className="w-12 h-12 text-marigold-700 mx-auto mb-3" />
          <h3 className="font-serif text-xl font-bold text-navy mb-1">No Itineraries Saved Yet</h3>
          <p className="text-xs text-ink-muted mb-6">
            Browse our packages, swap hotels, and save your tailored holiday plan here.
          </p>
          <Link
            to="/packages"
            className="px-5 py-2.5 rounded-xl bg-marigold text-navy text-xs font-semibold hover:bg-marigold-400"
          >
            Start Browsing Packages
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {itineraries.map((itin) => {
            const dest = itin.destination;
            const pkg = itin.package;
            const daysCount = itin.days?.length || 5;

            return (
              <div
                key={itin._id}
                className="bg-white rounded-3xl border border-bone-border p-6 shadow-xs hover:border-navy/40 hover:shadow-card transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    {getStatusBadge(itin.status)}
                    <span className="text-xs text-ink-subtle">{daysCount} Nights</span>
                  </div>

                  <h3 className="font-serif text-xl font-bold text-navy mb-1 line-clamp-2">
                    {pkg?.title || `${dest?.name} Escape`}
                  </h3>
                  <div className="text-xs text-marigold-700 font-semibold mb-4">
                    {dest?.name}, {dest?.country}
                  </div>

                  {/* Breakdown snapshot */}
                  <div className="p-3.5 rounded-2xl bg-bone border border-bone-border space-y-1.5 text-xs text-ink mb-4">
                    <div className="flex justify-between">
                      <span className="text-ink-muted">Hotels Total:</span>
                      <span className="font-mono font-bold">${itin.priceBreakdown?.hotelTotal || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-muted">Activities Total:</span>
                      <span className="font-mono font-bold">${itin.priceBreakdown?.activitiesTotal || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-bone-border flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-ink-subtle block">
                      Total Price
                    </span>
                    <span className="font-serif text-2xl font-bold text-navy">
                      ${itin.totalPriceUSD?.toLocaleString()}
                    </span>
                  </div>

                  <Link
                    to={`/itineraries/${itin._id}/edit`}
                    className="px-4 py-2 rounded-xl bg-navy text-bone text-xs font-semibold hover:bg-navy-700 transition-colors flex items-center gap-1.5"
                  >
                    <span>Resume DIY</span>
                    <ArrowRight className="w-3.5 h-3.5 text-marigold" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
