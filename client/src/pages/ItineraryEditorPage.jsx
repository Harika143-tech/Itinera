import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building,
  Compass,
  Star,
  Plus,
  Trash2,
  Sliders,
  Check,
  Calendar,
  DollarSign,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import { api } from '../api/client';
import PriceBreakdownPanel from '../components/PriceBreakdownPanel';
import BookingRequestModal from './BookingRequestModal';

export default function ItineraryEditorPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  // Modal states for hotel swap & activity toggles
  const [hotelModalDay, setHotelModalDay] = useState(null); // dayNumber or null
  const [activityModalDay, setActivityModalDay] = useState(null); // dayNumber or null
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  // Fetch Itinerary + Available Destination Hotels & Activities
  const { data, isLoading } = useQuery({
    queryKey: ['itinerary-editor', id],
    queryFn: () => api.get(`/itineraries/${id}`),
  });

  // Hotel Swap Mutation
  const swapHotelMutation = useMutation({
    mutationFn: ({ dayNumber, hotelId }) =>
      api.patch(`/itineraries/${id}/hotel`, { dayNumber, hotelId }),
    onSuccess: (res) => {
      queryClient.setQueryData(['itinerary-editor', id], (old) => ({
        ...old,
        itinerary: res.itinerary,
      }));
      setHotelModalDay(null);
    },
  });

  // Activity Toggle Mutation
  const toggleActivityMutation = useMutation({
    mutationFn: ({ dayNumber, activityId }) =>
      api.patch(`/itineraries/${id}/activity`, { dayNumber, activityId }),
    onSuccess: (res) => {
      queryClient.setQueryData(['itinerary-editor', id], (old) => ({
        ...old,
        itinerary: res.itinerary,
      }));
    },
  });

  // Save Itinerary Mutation
  const saveItineraryMutation = useMutation({
    mutationFn: () => api.post(`/itineraries/${id}/save`),
    onSuccess: (res) => {
      queryClient.setQueryData(['itinerary-editor', id], (old) => ({
        ...old,
        itinerary: res.itinerary,
      }));
    },
  });

  const itinerary = data?.itinerary;
  const availableHotels = data?.availableHotels || [];
  const availableActivities = data?.availableActivities || [];

  const destination = itinerary?.destination;
  const days = itinerary?.days || [];
  const isUpdating = swapHotelMutation.isPending || toggleActivityMutation.isPending;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center animate-pulse">
        <div className="h-8 w-64 bg-bone-border/50 rounded-xl mx-auto mb-4" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-white rounded-3xl border border-bone-border" />
          <div className="h-80 bg-navy/80 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="font-serif text-2xl font-bold text-navy mb-2">Itinerary Not Found</h2>
        <Link to="/packages" className="text-sm font-semibold text-marigold-700">
          ← Return to Packages
        </Link>
      </div>
    );
  }

  const activeDayForActivities = days.find((d) => d.dayNumber === activityModalDay);
  const selectedActivityIdsForDay = new Set(
    (activeDayForActivities?.activities || []).map((a) => (a._id || a.id || a).toString())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Banner */}
      <div className="pb-6 mb-8 border-b border-bone-border">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-ink-muted">
          <Link to="/packages" className="hover:text-navy">
            ← Packages
          </Link>
          <span className="text-bone-border">/</span>
          <span className="text-marigold-700 uppercase tracking-wider">{destination?.name}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal">
                DIY Live Customizer
              </span>
              <span className="text-xs text-ink-muted">
                · {days.length} Nights in {destination?.name}
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-navy mt-0.5">
              {itinerary.package?.title || `${destination?.name} Customized Escape`}
            </h1>
            <p className="text-xs sm:text-sm text-ink-muted mt-1">
              Swap any night's hotel or toggle activities below. The price panel on the right recalculates instantly.
            </p>
          </div>
        </div>
      </div>

      {/* Main Layout: 2 Columns (Days on left, Live Price Panel on right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Day-by-day customization cards */}
        <div className="lg:col-span-2 space-y-6">
          {days.map((day) => {
            const dayActs = day.activities || [];
            const dayHotel = day.hotel;

            return (
              <div
                key={day.dayNumber}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-bone-border shadow-xs hover:border-navy/30 transition-all"
              >
                {/* Day Header */}
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-bone-border">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-navy text-bone font-serif font-bold text-sm flex items-center justify-center shadow-xs">
                      {day.dayNumber}
                    </span>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-navy">
                        Day {day.dayNumber} — {day.city || destination?.name}
                      </h3>
                      <span className="text-[11px] text-ink-muted">
                        Hotel Night {day.dayNumber} · {dayActs.length} {dayActs.length === 1 ? 'activity' : 'activities'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hotel Card for Day */}
                <div className="p-4 rounded-2xl bg-bone border border-bone-border mb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-navy/10 text-navy flex items-center justify-center shrink-0 mt-0.5">
                        <Building className="w-5 h-5 text-marigold-700" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm text-navy">{dayHotel?.name}</h4>
                          <span className="text-xs text-marigold-700 font-bold">
                            {dayHotel?.starRating}★
                          </span>
                        </div>
                        <p className="text-xs text-ink-muted mt-0.5">
                          {dayHotel?.roomType || 'Standard Room'} · ${dayHotel?.nightlyRateUSD}/night
                        </p>
                      </div>
                    </div>

                    {/* Change Hotel Button */}
                    <button
                      type="button"
                      onClick={() => setHotelModalDay(day.dayNumber)}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-bone-border text-navy text-xs font-semibold border border-bone-border transition-colors shadow-xs shrink-0"
                    >
                      Change Hotel
                    </button>
                  </div>
                </div>

                {/* Activities for Day */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs uppercase font-bold tracking-wider text-ink-subtle">
                      Scheduled Activities ({dayActs.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => setActivityModalDay(day.dayNumber)}
                      className="text-xs font-semibold text-marigold-700 hover:text-marigold-800 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add / Toggle Activities</span>
                    </button>
                  </div>

                  {dayActs.length === 0 ? (
                    <div className="p-4 rounded-2xl border-2 border-dashed border-bone-border text-center text-xs text-ink-muted">
                      No activities scheduled for this day.{' '}
                      <button
                        onClick={() => setActivityModalDay(day.dayNumber)}
                        className="text-navy font-semibold underline underline-offset-2"
                      >
                        Explore available tours
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {dayActs.map((act) => (
                        <div
                          key={act._id}
                          className="p-3 rounded-xl bg-white border border-bone-border flex items-center justify-between gap-3 shadow-2xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Compass className="w-4 h-4 text-teal shrink-0" />
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-ink truncate">{act.name}</div>
                              <div className="text-[11px] text-ink-muted">
                                {act.durationHours} hrs · {act.tags?.join(', ')}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="font-mono text-xs font-bold text-navy">
                              ${act.costUSD}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                toggleActivityMutation.mutate({
                                  dayNumber: day.dayNumber,
                                  activityId: act._id,
                                })
                              }
                              className="text-ink-subtle hover:text-red-600 transition-colors p-1"
                              title="Remove activity"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Signature Persistent Live Price Breakdown Panel */}
        <div className="lg:col-span-1">
          <PriceBreakdownPanel
            breakdown={itinerary.priceBreakdown}
            daysCount={days.length}
            isUpdating={isUpdating}
            onSave={() => saveItineraryMutation.mutate()}
            onRequestQuote={() => setBookingModalOpen(true)}
            isSaving={saveItineraryMutation.isPending}
            itineraryStatus={itinerary.status}
          />
        </div>
      </div>

      {/* Hotel Swap Modal */}
      {hotelModalDay && (
        <div className="fixed inset-0 z-50 bg-navy-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-bone-light rounded-3xl p-6 sm:p-8 border border-bone-border shadow-card max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setHotelModalDay(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-bone hover:bg-bone-border text-ink-muted hover:text-ink flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold uppercase tracking-wider text-marigold-700">
              Day {hotelModalDay} Hotel Swap
            </span>
            <h3 className="font-serif text-2xl font-bold text-navy mb-2 mt-0.5">
              Select an Alternative Stay
            </h3>
            <p className="text-xs text-ink-muted mb-6">
              Prices adjust automatically in the live price panel when you select an upgrade or boutique stay.
            </p>

            <div className="space-y-3">
              {availableHotels.map((h) => {
                const currentDayHotelId = (
                  days.find((d) => d.dayNumber === hotelModalDay)?.hotel?._id || ''
                ).toString();
                const isCurrent = currentDayHotelId === h._id.toString();

                return (
                  <div
                    key={h._id}
                    onClick={() =>
                      swapHotelMutation.mutate({
                        dayNumber: hotelModalDay,
                        hotelId: h._id,
                      })
                    }
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isCurrent
                        ? 'bg-navy-50 border-2 border-navy shadow-xs'
                        : 'bg-white border-bone-border hover:border-navy/40'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-navy">{h.name}</span>
                        <span className="text-xs text-marigold-700 font-bold">{h.starRating}★</span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold uppercase bg-teal/20 text-teal px-2 py-0.5 rounded-full">
                            Current Stay
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-ink-muted mt-0.5 line-clamp-1">{h.description}</p>
                      <span className="text-[11px] text-ink-subtle">{h.roomType}</span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono text-base font-bold text-navy block">
                        ${h.nightlyRateUSD}
                      </span>
                      <span className="text-[10px] text-ink-subtle">/ night</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Activity Toggle Modal */}
      {activityModalDay && (
        <div className="fixed inset-0 z-50 bg-navy-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-bone-light rounded-3xl p-6 sm:p-8 border border-bone-border shadow-card max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setActivityModalDay(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-bone hover:bg-bone-border text-ink-muted hover:text-ink flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="text-xs font-bold uppercase tracking-wider text-marigold-700">
              Day {activityModalDay} Excursions
            </span>
            <h3 className="font-serif text-2xl font-bold text-navy mb-2 mt-0.5">
              Available Destination Activities
            </h3>
            <p className="text-xs text-ink-muted mb-6">
              Toggle on or off. Added excursions automatically update your activities total and package quote.
            </p>

            <div className="space-y-3">
              {availableActivities.map((act) => {
                const isSelected = selectedActivityIdsForDay.has(act._id.toString());

                return (
                  <div
                    key={act._id}
                    onClick={() =>
                      toggleActivityMutation.mutate({
                        dayNumber: activityModalDay,
                        activityId: act._id,
                      })
                    }
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-teal/10 border-2 border-teal shadow-xs'
                        : 'bg-white border-bone-border hover:border-navy/40'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                          isSelected ? 'bg-teal text-bone border-teal' : 'border-bone-border bg-bone'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>

                      <div className="min-w-0">
                        <div className="font-semibold text-sm text-navy">{act.name}</div>
                        <p className="text-xs text-ink-muted mt-0.5 line-clamp-2">
                          {act.description}
                        </p>
                        <span className="text-[11px] text-ink-subtle">
                          Duration: {act.durationHours} hrs · {(act.tags || []).join(', ')}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-mono text-base font-bold text-navy block">
                        ${act.costUSD}
                      </span>
                      <span className="text-[10px] text-ink-subtle">per person</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-bone-border flex justify-end">
              <button
                type="button"
                onClick={() => setActivityModalDay(null)}
                className="px-5 py-2.5 rounded-xl bg-navy text-bone text-xs font-semibold hover:bg-navy-700"
              >
                Done Customizing Day {activityModalDay}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking / Quote Request Modal */}
      <BookingRequestModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        itinerary={itinerary}
        onSuccess={() => {
          queryClient.invalidateQueries(['itinerary-editor', id]);
        }}
      />
    </div>
  );
}
