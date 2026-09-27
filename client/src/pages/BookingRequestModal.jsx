import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Calendar, Users, Phone, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../api/client';

export default function BookingRequestModal({
  isOpen,
  onClose,
  itinerary,
  onSuccess,
}) {
  const [serverError, setServerError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      travelerCount: 2,
      contactPhone: '+1 (555) 234-5678',
      travelStartDate: '2026-11-15',
      travelEndDate: '2026-11-21',
      notes: '',
    },
  });

  if (!isOpen) return null;

  const onSubmit = async (formData) => {
    setServerError('');
    try {
      await api.post('/bookings', {
        itineraryId: itinerary._id,
        travelDates: {
          start: formData.travelStartDate,
          end: formData.travelEndDate,
        },
        travelerCount: Number(formData.travelerCount),
        contactPhone: formData.contactPhone,
        notes: formData.notes,
      });

      setBookingSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      setServerError(err.message || 'Failed to submit booking request');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-navy-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="relative w-full max-w-lg bg-bone-light rounded-3xl p-6 sm:p-8 border border-bone-border shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-bone hover:bg-bone-border text-ink-muted hover:text-ink flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {!bookingSuccess ? (
          <>
            <span className="text-xs font-bold uppercase tracking-wider text-marigold-700">
              Direct Concierge Booking
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-navy mb-1 mt-0.5">
              Request Your Tailored Quote
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted mb-6 leading-relaxed">
              Lock in your customized itinerary for <strong>{itinerary?.destination?.name || 'your vacation'}</strong> at <strong>${itinerary?.totalPriceUSD?.toLocaleString()}</strong> total.
            </p>

            {serverError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-ink-subtle mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    {...register('travelStartDate', { required: 'Start date is required' })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-bone-border text-xs sm:text-sm text-ink outline-none focus:border-navy"
                  />
                  {errors.travelStartDate && (
                    <p className="text-[11px] text-marigold-700 mt-1">{errors.travelStartDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-ink-subtle mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    {...register('travelEndDate', { required: 'End date is required' })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-bone-border text-xs sm:text-sm text-ink outline-none focus:border-navy"
                  />
                  {errors.travelEndDate && (
                    <p className="text-[11px] text-marigold-700 mt-1">{errors.travelEndDate.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-ink-subtle mb-1">
                    Travelers Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    {...register('travelerCount', { required: true, min: 1 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-bone-border text-xs sm:text-sm text-ink outline-none focus:border-navy font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-ink-subtle mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    {...register('contactPhone', { required: 'Contact phone is required' })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-bone-border text-xs sm:text-sm text-ink outline-none focus:border-navy"
                  />
                  {errors.contactPhone && (
                    <p className="text-[11px] text-marigold-700 mt-1">{errors.contactPhone.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-ink-subtle mb-1">
                  Special Notes or Flight Preferences (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Flight recommendations needed, honeymoon room upgrade, dietary needs..."
                  {...register('notes')}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-bone-border text-xs sm:text-sm text-ink outline-none focus:border-navy"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-marigold text-navy font-semibold text-sm hover:bg-marigold-400 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  {isSubmitting ? (
                    'Submitting Request...'
                  ) : (
                    <>
                      <span>Lock Itinerary & Submit Request</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-2xl bg-teal/20 text-teal flex items-center justify-center mx-auto mb-4 border border-teal/40">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-navy mb-2">
              Booking Request Confirmed!
            </h3>
            <p className="text-xs sm:text-sm text-ink-muted mb-6 leading-relaxed max-w-sm mx-auto">
              Your customized itinerary has been submitted to Itinera's destination specialists. You can view its status anytime in <strong>My Bookings</strong>.
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-navy text-bone text-xs font-semibold hover:bg-navy-700"
              >
                Close Window
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
