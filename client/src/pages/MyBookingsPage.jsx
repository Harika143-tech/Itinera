import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Users, Phone, MapPin, CheckCircle2, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { api } from '../api/client';

export default function MyBookingsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => api.get('/bookings/mine'),
  });

  const bookings = data?.bookings || [];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'contacted':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal/20 text-teal border border-teal/40 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Concierge Contacted
          </span>
        );
      case 'closed':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            Confirmed & Booked
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            Under Review
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="pb-6 mb-8 border-b border-bone-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-marigold-700">
            Booking Tracking
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-navy mt-1">
            My Booking & Quote Requests
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Track status updates from destination specialists for your customized holidays.
          </p>
        </div>

        <Link
          to="/packages"
          className="px-5 py-2.5 rounded-xl bg-navy text-bone text-xs sm:text-sm font-semibold hover:bg-navy-700 transition-colors shadow-xs self-start sm:self-auto"
        >
          Browse Packages
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 bg-white rounded-3xl border border-bone-border" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-bone-border max-w-lg mx-auto shadow-card">
          <Calendar className="w-12 h-12 text-marigold-700 mx-auto mb-3" />
          <h3 className="font-serif text-xl font-bold text-navy mb-1">No Booking Requests Yet</h3>
          <p className="text-xs text-ink-muted mb-6 leading-relaxed">
            Customize a package and click "Request Quote / Book" in the DIY editor to submit your dates.
          </p>
          <Link
            to="/packages"
            className="px-5 py-2.5 rounded-xl bg-marigold text-navy text-xs font-semibold hover:bg-marigold-400"
          >
            Explore Packages
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map((b) => {
            const itin = b.itinerary;
            const dest = itin?.destination;

            return (
              <div
                key={b._id}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-bone-border shadow-xs hover:border-navy/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    {getStatusBadge(b.status)}
                    <span className="text-xs text-ink-subtle">
                      Submitted on {new Date(b.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif text-xl font-bold text-navy">
                      {itin?.package?.title || `${dest?.name || 'Custom'} Holiday Package`}
                    </h3>
                    <div className="text-xs text-marigold-700 font-semibold flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{dest?.name}, {dest?.country}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-ink-muted flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-navy" />
                      {new Date(b.travelDates.start).toLocaleDateString()} – {new Date(b.travelDates.end).toLocaleDateString()}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-navy" />
                      {b.travelerCount} Travelers
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-navy" />
                      {b.contactPhone}
                    </span>
                  </div>

                  {b.notes && (
                    <p className="text-xs text-ink-muted bg-bone p-3 rounded-xl border border-bone-border italic">
                      "{b.notes}"
                    </p>
                  )}
                </div>

                <div className="text-left md:text-right shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-bone-border">
                  <span className="text-[10px] uppercase font-bold text-ink-subtle block">
                    Estimated Locked Price
                  </span>
                  <span className="font-serif text-3xl font-bold text-navy">
                    ${itin?.totalPriceUSD?.toLocaleString()}
                  </span>
                  <div className="mt-3">
                    <Link
                      to={`/itineraries/${itin?._id}/edit`}
                      className="px-4 py-2 rounded-xl bg-bone hover:bg-bone-border text-navy text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                    >
                      <span>View Itinerary</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
