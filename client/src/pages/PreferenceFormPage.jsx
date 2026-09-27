import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import {
  Calendar,
  DollarSign,
  Star,
  Plus,
  Trash2,
  Check,
  ArrowRight,
  Shield,
  Compass,
  Sparkles,
} from 'lucide-react';
import { api } from '../api/client';

const ALL_INTEREST_TAGS = [
  { id: 'beach', label: 'Beach & Coastal', icon: '🏖️' },
  { id: 'mountains', label: 'Mountains & Alpine', icon: '🏔️' },
  { id: 'hiking', label: 'Hiking & Trails', icon: '🥾' },
  { id: 'nightlife', label: 'Nightlife & Bars', icon: '🍸' },
  { id: 'food', label: 'Food & Culinary', icon: '🍜' },
  { id: 'culture', label: 'Culture & History', icon: '🏛️' },
  { id: 'relaxed', label: 'Relaxation & Slow Travel', icon: '🧘' },
  { id: 'adventurous', label: 'Action & Adventure', icon: '🏄' },
  { id: 'nature', label: 'Nature & Wildlife', icon: '🌿' },
  { id: 'shopping', label: 'Boutiques & Markets', icon: '🛍️' },
  { id: 'wellness', label: 'Spas & Wellness', icon: '♨️' },
];

export default function PreferenceFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedTags, setSelectedTags] = useState([]);
  const [destinationScores, setDestinationScores] = useState({});
  const [submitError, setSubmitError] = useState('');

  // Fetch Group Info
  const { data: groupData } = useQuery({
    queryKey: ['group', id],
    queryFn: () => api.get(`/groups/${id}`),
  });

  // Fetch Destinations Catalog
  const { data: destData, isLoading: destLoading } = useQuery({
    queryKey: ['destinations'],
    queryFn: () => api.get('/destinations'),
  });

  // Fetch Existing User Preference (if already submitted)
  const { data: myPrefData } = useQuery({
    queryKey: ['my-preference', id],
    queryFn: () => api.get(`/groups/${id}/preferences/mine`),
  });

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      budgetMin: 300,
      budgetMax: 1200,
      mustHavesText: '',
      dateRanges: [
        {
          start: '2026-10-10',
          end: '2026-10-18',
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'dateRanges',
  });

  const budgetMin = watch('budgetMin');
  const budgetMax = watch('budgetMax');

  // Pre-fill existing preference if present
  useEffect(() => {
    const existing = myPrefData?.preference;
    if (existing) {
      if (existing.budgetRange) {
        setValue('budgetMin', existing.budgetRange.min || 300);
        setValue('budgetMax', existing.budgetRange.max || 1200);
      }
      if (existing.interestTags) {
        setSelectedTags(existing.interestTags);
      }
      if (existing.mustHaves) {
        setValue('mustHavesText', existing.mustHaves.join(', '));
      }
      if (existing.availableDateRanges?.length) {
        setValue(
          'dateRanges',
          existing.availableDateRanges.map((r) => ({
            start: new Date(r.start).toISOString().slice(0, 10),
            end: new Date(r.end).toISOString().slice(0, 10),
          }))
        );
      }
      if (existing.destinationVotes?.length) {
        const scores = {};
        existing.destinationVotes.forEach((v) => {
          const dId = v.destination?._id || v.destination;
          scores[dId] = v.score;
        });
        setDestinationScores(scores);
      }
    }
  }, [myPrefData, setValue]);

  const toggleTag = (tagId) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter((t) => t !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const setScore = (destId, score) => {
    setDestinationScores((prev) => ({
      ...prev,
      [destId]: score,
    }));
  };

  const onSubmit = async (formData) => {
    setSubmitError('');

    if (Number(formData.budgetMin) > Number(formData.budgetMax)) {
      setSubmitError('Minimum budget cannot exceed maximum budget.');
      return;
    }

    if (selectedTags.length === 0) {
      setSubmitError('Please select at least one interest tag.');
      return;
    }

    const availableDateRanges = formData.dateRanges.map((r) => ({
      start: new Date(r.start),
      end: new Date(r.end),
    }));

    const destinationVotes = Object.entries(destinationScores).map(([destination, score]) => ({
      destination,
      score: Number(score),
    }));

    const mustHaves = formData.mustHavesText
      ? formData.mustHavesText
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    const payload = {
      availableDateRanges,
      budgetRange: {
        min: Number(formData.budgetMin),
        max: Number(formData.budgetMax),
      },
      destinationVotes,
      interestTags: selectedTags,
      mustHaves,
    };

    try {
      await api.post(`/groups/${id}/preferences`, payload);
      queryClient.invalidateQueries(['group-status', id]);
      queryClient.invalidateQueries(['my-preference', id]);
      navigate(`/groups/${id}`);
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit preferences');
    }
  };

  const destinations = destData?.destinations || [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="pb-6 mb-8 border-b border-parchment-border">
        <Link
          to={`/groups/${id}`}
          className="text-xs font-semibold text-ink-muted hover:text-ink mb-2 inline-block"
        >
          ← Back to {groupData?.group?.name || 'Trip Board'}
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-sienna">
            Confidential Input
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] text-ink-muted bg-white px-2 py-0.5 rounded-full border border-parchment-border">
            <Shield className="w-3 h-3 text-teal" />
            Hidden from other members
          </span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink mt-1">
          Your Travel Availability & Vibe Preferences
        </h1>
        <p className="text-sm text-ink-muted mt-1 max-w-2xl leading-relaxed">
          Be honest about your dates, budget, and wishes. Our consensus algorithm uses these inputs
          to find mathematical overlaps and highlight compromises without exposing your raw answers.
        </p>
      </div>

      {submitError && (
        <div className="mb-6 p-4 rounded-2xl bg-sienna-50 border border-sienna-200 text-sm text-sienna font-medium">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
        {/* SECTION 1: Available Date Windows */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-parchment-border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-ink">
                1. Your Available Dates
              </h2>
              <p className="text-xs text-ink-muted">
                Add every window you could travel. More windows = easier consensus!
              </p>
            </div>
          </div>

          <div className="space-y-3 mt-6">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="p-4 rounded-2xl bg-parchment border border-parchment-border flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] uppercase font-bold text-ink-subtle mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      {...register(`dateRanges.${index}.start`, { required: true })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-parchment-border text-sm text-ink outline-none focus:border-teal"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase font-bold text-ink-subtle mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      {...register(`dateRanges.${index}.end`, { required: true })}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-parchment-border text-sm text-ink outline-none focus:border-teal"
                    />
                  </div>
                </div>

                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-2 self-end sm:self-center text-ink-subtle hover:text-sienna transition-colors"
                    title="Remove window"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() => append({ start: '', end: '' })}
              className="px-4 py-2 rounded-xl bg-white hover:bg-parchment text-teal text-xs font-semibold border border-parchment-border flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Another Date Window</span>
            </button>
          </div>
        </div>

        {/* SECTION 2: Budget Range */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-parchment-border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-sienna-50 text-sienna flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-ink">
                2. Your Total Trip Budget (USD)
              </h2>
              <p className="text-xs text-ink-muted">
                What is your comfortable spending comfort zone for this trip?
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
            <div className="p-5 rounded-2xl bg-parchment border border-parchment-border">
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
                Minimum Budget (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-ink-muted text-sm font-bold">$</span>
                <input
                  type="number"
                  step="50"
                  min="0"
                  {...register('budgetMin', { required: true, min: 0 })}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white border border-parchment-border font-mono text-base font-bold text-ink outline-none focus:border-teal"
                />
              </div>
              <span className="text-[11px] text-ink-subtle mt-1.5 block">
                The minimum you expect to spend on a great experience.
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-parchment border border-parchment-border">
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2">
                Maximum Budget Limit (USD)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-ink-muted text-sm font-bold">$</span>
                <input
                  type="number"
                  step="50"
                  min="100"
                  {...register('budgetMax', { required: true, min: 100 })}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-white border border-parchment-border font-mono text-base font-bold text-ink outline-none focus:border-teal"
                />
              </div>
              <span className="text-[11px] text-ink-subtle mt-1.5 block">
                Hard ceiling — you will not exceed this total.
              </span>
            </div>
          </div>
        </div>

        {/* SECTION 3: Interest Tag Chips */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-parchment-border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-ink">
                3. Vacation Vibe & Interest Tags
              </h2>
              <p className="text-xs text-ink-muted">
                Select the activities and vibes that excite you most for this trip.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 mt-6">
            {ALL_INTEREST_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium flex items-center gap-2 transition-all border ${
                    isSelected
                      ? 'bg-teal text-parchment border-teal shadow-sm scale-105'
                      : 'bg-parchment hover:bg-parchment-border/60 text-ink border-parchment-border'
                  }`}
                >
                  <span>{tag.icon}</span>
                  <span>{tag.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 4: Destination 1-5 Star Ratings */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-parchment-border shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-ink">
                4. Candidate Destination Ratings (1 to 5 Stars)
              </h2>
              <p className="text-xs text-ink-muted">
                Rate each candidate spot. 5 = Dream trip, 3 = Sounds good, 1 = Pass.
              </p>
            </div>
          </div>

          {destLoading ? (
            <div className="py-8 text-center text-xs text-ink-muted">Loading destinations...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              {destinations.slice(0, 10).map((dest) => {
                const currentScore = destinationScores[dest._id] || 3;
                return (
                  <div
                    key={dest._id}
                    className="p-4 rounded-2xl bg-parchment border border-parchment-border flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {dest.imageUrl && (
                        <img
                          src={dest.imageUrl}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <div className="font-semibold text-sm text-ink truncate">{dest.name}</div>
                        <div className="text-[11px] text-ink-muted truncate">
                          {dest.country} · ${dest.avgCostPerDayUSD}/day
                        </div>
                      </div>
                    </div>

                    {/* 5-Star widget */}
                    <div className="flex items-center gap-1 shrink-0">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setScore(dest._id, star)}
                          className={`p-1 transition-transform hover:scale-125 ${
                            star <= currentScore ? 'text-amber-500' : 'text-parchment-border'
                          }`}
                        >
                          <Star
                            className="w-4 h-4"
                            fill={star <= currentScore ? 'currentColor' : 'none'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 5: Must Haves / Notes */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-parchment-border shadow-sm">
          <h2 className="font-serif text-xl font-bold text-ink mb-1">
            5. Must-Haves & Non-Negotiables
          </h2>
          <p className="text-xs text-ink-muted mb-4">
            Comma-separated (e.g. "Private rooms, Vegetarian food options, Near an airport, Good wifi")
          </p>

          <textarea
            rows={3}
            placeholder="e.g. Beachfront stay, Direct flights only, No hiking before 10 AM..."
            {...register('mustHavesText')}
            className="w-full px-4 py-3 rounded-2xl bg-parchment border border-parchment-border focus:border-teal outline-none text-sm text-ink leading-relaxed"
          />
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-between pt-4">
          <Link
            to={`/groups/${id}`}
            className="text-sm font-semibold text-ink-muted hover:text-ink"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3.5 rounded-2xl bg-teal text-parchment font-semibold text-sm sm:text-base hover:bg-teal-700 active:scale-[0.99] transition-all flex items-center gap-2 shadow-parchment"
          >
            {isSubmitting ? (
              <span>Saving Preferences...</span>
            ) : (
              <>
                <span>Submit Confidential Preferences</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
