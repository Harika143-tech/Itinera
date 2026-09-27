import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  Package,
  MapPin,
  Building,
  Compass,
  Calendar,
  Plus,
  CheckCircle2,
  AlertCircle,
  Shield,
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboardPage() {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('packages'); // packages, destinations, hotels, activities, bookings

  // Forms
  const destForm = useForm();
  const hotelForm = useForm();
  const actForm = useForm();

  // Queries
  const { data: packagesData, refetch: refetchPackages } = useQuery({
    queryKey: ['admin-packages'],
    queryFn: () => api.get('/packages'),
  });

  const { data: destData, refetch: refetchDestinations } = useQuery({
    queryKey: ['admin-destinations'],
    queryFn: () => api.get('/destinations'),
  });

  const { data: hotelsData, refetch: refetchHotels } = useQuery({
    queryKey: ['admin-hotels'],
    queryFn: () => api.get('/hotels'),
  });

  const { data: activitiesData, refetch: refetchActivities } = useQuery({
    queryKey: ['admin-activities'],
    queryFn: () => api.get('/activities'),
  });

  const { data: bookingsData, refetch: refetchBookings } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: () => api.get('/bookings'),
  });

  // Mutations
  const createDestMutation = useMutation({
    mutationFn: (data) => api.post('/destinations', data),
    onSuccess: () => {
      refetchDestinations();
      destForm.reset();
    },
  });

  const createHotelMutation = useMutation({
    mutationFn: (data) => api.post('/hotels', data),
    onSuccess: () => {
      refetchHotels();
      hotelForm.reset();
    },
  });

  const createActMutation = useMutation({
    mutationFn: (data) => api.post('/activities', data),
    onSuccess: () => {
      refetchActivities();
      actForm.reset();
    },
  });

  const updateBookingStatusMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/bookings/${id}/status`, { status }),
    onSuccess: () => refetchBookings(),
  });

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <Shield className="w-12 h-12 text-marigold-700 mx-auto mb-3" />
        <h2 className="font-serif text-2xl font-bold text-navy mb-2">Admin Access Required</h2>
        <p className="text-xs text-ink-muted mb-4">
          Please sign in using an administrator account to view the catalog management portal.
        </p>
      </div>
    );
  }

  const destinations = destData?.destinations || [];
  const hotels = hotelsData?.hotels || [];
  const activities = activitiesData?.activities || [];
  const packages = packagesData?.packages || [];
  const bookings = bookingsData?.bookings || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="pb-6 mb-8 border-b border-bone-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-marigold-700">
            Catalog Management
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-navy mt-1">
            Itinera Admin Portal
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Manage holiday packages, hotel inventory, activities, and incoming traveler quote requests.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-bone-border overflow-x-auto">
          {[
            { id: 'packages', label: 'Packages', count: packages.length },
            { id: 'destinations', label: 'Destinations', count: destinations.length },
            { id: 'hotels', label: 'Hotels', count: hotels.length },
            { id: 'activities', label: 'Activities', count: activities.length },
            { id: 'bookings', label: 'Bookings', count: bookings.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-navy text-bone shadow-xs'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === tab.id ? 'bg-marigold text-navy font-bold' : 'bg-bone text-ink-subtle'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: PACKAGES */}
      {activeTab === 'packages' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-bone-border shadow-xs overflow-x-auto">
            <h3 className="font-serif text-xl font-bold text-navy mb-4">Live Holiday Packages</h3>
            <table className="w-full text-left text-xs">
              <thead className="border-b border-bone-border text-ink-subtle uppercase">
                <tr>
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Destination</th>
                  <th className="pb-3">Nights</th>
                  <th className="pb-3">Default Hotel</th>
                  <th className="pb-3">Base Price</th>
                  <th className="pb-3">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bone-border/60">
                {packages.map((p) => (
                  <tr key={p._id} className="hover:bg-bone/40">
                    <td className="py-3 font-semibold text-navy">{p.title}</td>
                    <td className="py-3 text-ink-muted">{p.destination?.name}</td>
                    <td className="py-3 text-ink-muted">{p.defaultNights}N</td>
                    <td className="py-3 text-ink-muted">{p.defaultHotel?.name}</td>
                    <td className="py-3 font-mono font-bold text-navy">${p.basePriceUSD}</td>
                    <td className="py-3 text-marigold-700 font-semibold">{p.ratingAvg}★</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: DESTINATIONS */}
      {activeTab === 'destinations' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-bone-border shadow-xs overflow-x-auto">
            <h3 className="font-serif text-xl font-bold text-navy mb-4">Destinations Catalog</h3>
            <div className="space-y-3">
              {destinations.map((d) => (
                <div key={d._id} className="p-4 rounded-2xl bg-bone border border-bone-border">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-bold text-base text-navy">
                      {d.name}, {d.country}
                    </h4>
                    <span className="text-[11px] text-teal font-semibold">{d.bestSeason}</span>
                  </div>
                  <p className="text-xs text-ink-muted mt-1">{d.heroNote || d.description}</p>
                  <div className="flex gap-1.5 mt-2">
                    {(d.tags || []).map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded text-[10px] bg-white border border-bone-border text-navy font-semibold uppercase"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Destination Form */}
          <div className="bg-white rounded-3xl p-6 border border-bone-border shadow-xs">
            <h3 className="font-serif text-lg font-bold text-navy mb-3">Add Destination</h3>
            <form
              onSubmit={destForm.handleSubmit((d) => createDestMutation.mutate(d))}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-ink-subtle font-bold uppercase mb-1">Name</label>
                <input
                  type="text"
                  placeholder="e.g. Kyoto"
                  {...destForm.register('name', { required: true })}
                  className="w-full px-3 py-2 rounded-xl bg-bone border border-bone-border"
                />
              </div>
              <div>
                <label className="block text-ink-subtle font-bold uppercase mb-1">Country</label>
                <input
                  type="text"
                  placeholder="e.g. Japan"
                  {...destForm.register('country', { required: true })}
                  className="w-full px-3 py-2 rounded-xl bg-bone border border-bone-border"
                />
              </div>
              <div>
                <label className="block text-ink-subtle font-bold uppercase mb-1">Hero Note</label>
                <input
                  type="text"
                  placeholder="Short editorial headline"
                  {...destForm.register('heroNote')}
                  className="w-full px-3 py-2 rounded-xl bg-bone border border-bone-border"
                />
              </div>
              <div>
                <label className="block text-ink-subtle font-bold uppercase mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  placeholder="culture, food, temples"
                  {...destForm.register('tags')}
                  className="w-full px-3 py-2 rounded-xl bg-bone border border-bone-border"
                />
              </div>
              <button
                type="submit"
                disabled={createDestMutation.isPending}
                className="w-full py-2.5 rounded-xl bg-navy text-bone font-semibold mt-2 hover:bg-navy-700"
              >
                {createDestMutation.isPending ? 'Saving...' : 'Add Destination'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: HOTELS */}
      {activeTab === 'hotels' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-bone-border shadow-xs overflow-x-auto">
            <h3 className="font-serif text-xl font-bold text-navy mb-4">Hotels & Stays</h3>
            <table className="w-full text-left text-xs">
              <thead className="border-b border-bone-border text-ink-subtle uppercase">
                <tr>
                  <th className="pb-3">Hotel Name</th>
                  <th className="pb-3">Destination</th>
                  <th className="pb-3">Rating</th>
                  <th className="pb-3">Nightly Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bone-border/60">
                {hotels.map((h) => (
                  <tr key={h._id}>
                    <td className="py-3 font-semibold text-navy">{h.name}</td>
                    <td className="py-3 text-ink-muted">{h.destination?.name}</td>
                    <td className="py-3 text-marigold-700 font-bold">{h.starRating}★</td>
                    <td className="py-3 font-mono font-bold text-navy">${h.nightlyRateUSD}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Hotel Form */}
          <div className="bg-white rounded-3xl p-6 border border-bone-border shadow-xs">
            <h3 className="font-serif text-lg font-bold text-navy mb-3">Add Hotel</h3>
            <form
              onSubmit={hotelForm.handleSubmit((d) => createHotelMutation.mutate(d))}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-ink-subtle font-bold uppercase mb-1">Destination</label>
                <select
                  {...hotelForm.register('destination', { required: true })}
                  className="w-full px-3 py-2 rounded-xl bg-bone border border-bone-border"
                >
                  <option value="">Select Destination</option>
                  {destinations.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-ink-subtle font-bold uppercase mb-1">Hotel Name</label>
                <input
                  type="text"
                  placeholder="e.g. Royal Mirage Hotel"
                  {...hotelForm.register('name', { required: true })}
                  className="w-full px-3 py-2 rounded-xl bg-bone border border-bone-border"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-ink-subtle font-bold uppercase mb-1">Stars (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    defaultValue="4"
                    {...hotelForm.register('starRating', { required: true })}
                    className="w-full px-3 py-2 rounded-xl bg-bone border border-bone-border font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-ink-subtle font-bold uppercase mb-1">Rate (USD/night)</label>
                  <input
                    type="number"
                    min="10"
                    placeholder="200"
                    {...hotelForm.register('nightlyRateUSD', { required: true })}
                    className="w-full px-3 py-2 rounded-xl bg-bone border border-bone-border font-semibold"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={createHotelMutation.isPending}
                className="w-full py-2.5 rounded-xl bg-navy text-bone font-semibold mt-2 hover:bg-navy-700"
              >
                {createHotelMutation.isPending ? 'Saving...' : 'Add Hotel'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: ACTIVITIES */}
      {activeTab === 'activities' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-bone-border shadow-xs overflow-x-auto">
            <h3 className="font-serif text-xl font-bold text-navy mb-4">Activities & Excursions</h3>
            <table className="w-full text-left text-xs">
              <thead className="border-b border-bone-border text-ink-subtle uppercase">
                <tr>
                  <th className="pb-3">Activity</th>
                  <th className="pb-3">Destination</th>
                  <th className="pb-3">Duration</th>
                  <th className="pb-3">Cost (USD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bone-border/60">
                {activities.map((a) => (
                  <tr key={a._id}>
                    <td className="py-3 font-semibold text-navy">{a.name}</td>
                    <td className="py-3 text-ink-muted">{a.destination?.name}</td>
                    <td className="py-3 text-ink-muted">{a.durationHours} hrs</td>
                    <td className="py-3 font-mono font-bold text-navy">${a.costUSD}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Activity Form */}
          <div className="bg-white rounded-3xl p-6 border border-bone-border shadow-xs">
            <h3 className="font-serif text-lg font-bold text-navy mb-3">Add Activity</h3>
            <form
              onSubmit={actForm.handleSubmit((d) => createActMutation.mutate(d))}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-ink-subtle font-bold uppercase mb-1">Destination</label>
                <select
                  {...actForm.register('destination', { required: true })}
                  className="w-full px-3 py-2 rounded-xl bg-bone border border-bone-border"
                >
                  <option value="">Select Destination</option>
                  {destinations.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-ink-subtle font-bold uppercase mb-1">Activity Name</label>
                <input
                  type="text"
                  placeholder="e.g. Scuba Dive Safari"
                  {...actForm.register('name', { required: true })}
                  className="w-full px-3 py-2 rounded-xl bg-bone border border-bone-border"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-ink-subtle font-bold uppercase mb-1">Cost (USD)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="45"
                    {...actForm.register('costUSD', { required: true })}
                    className="w-full px-3 py-2 rounded-xl bg-bone border border-bone-border font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-ink-subtle font-bold uppercase mb-1">Duration (Hrs)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="2.5"
                    {...actForm.register('durationHours')}
                    className="w-full px-3 py-2 rounded-xl bg-bone border border-bone-border font-semibold"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={createActMutation.isPending}
                className="w-full py-2.5 rounded-xl bg-navy text-bone font-semibold mt-2 hover:bg-navy-700"
              >
                {createActMutation.isPending ? 'Saving...' : 'Add Activity'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 5: BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-bone-border shadow-xs overflow-x-auto">
          <h3 className="font-serif text-xl font-bold text-navy mb-4">Traveler Booking Requests</h3>
          <table className="w-full text-left text-xs">
            <thead className="border-b border-bone-border text-ink-subtle uppercase">
              <tr>
                <th className="pb-3">Traveler</th>
                <th className="pb-3">Destination</th>
                <th className="pb-3">Travel Dates</th>
                <th className="pb-3">Party</th>
                <th className="pb-3">Phone</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bone-border/60">
              {bookings.map((b) => (
                <tr key={b._id}>
                  <td className="py-3">
                    <div className="font-semibold text-navy">{b.user?.name}</div>
                    <div className="text-[11px] text-ink-muted">{b.user?.email}</div>
                  </td>
                  <td className="py-3 text-ink">{b.itinerary?.destination?.name}</td>
                  <td className="py-3 text-ink-muted">
                    {new Date(b.travelDates.start).toLocaleDateString()} – {new Date(b.travelDates.end).toLocaleDateString()}
                  </td>
                  <td className="py-3 text-ink-muted">{b.travelerCount} Guests</td>
                  <td className="py-3 font-mono text-ink-muted">{b.contactPhone}</td>
                  <td className="py-3 font-mono font-bold text-navy">
                    ${b.itinerary?.totalPriceUSD?.toLocaleString()}
                  </td>
                  <td className="py-3">
                    <select
                      value={b.status}
                      onChange={(e) =>
                        updateBookingStatusMutation.mutate({
                          id: b._id,
                          status: e.target.value,
                        })
                      }
                      className="px-2 py-1 rounded-lg bg-bone border border-bone-border text-xs font-semibold outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="contacted">Contacted</option>
                      <option value="closed">Closed / Confirmed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
