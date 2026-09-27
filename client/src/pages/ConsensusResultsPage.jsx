import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calendar,
  DollarSign,
  Compass,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Trophy,
  MapPin,
  Clock,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { api } from '../api/client';
import ConflictPanel from '../components/ConflictPanel';

export default function ConsensusResultsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedDestId, setSelectedDestId] = useState(null);

  // Fetch Itinerary + Consensus Report
  const { data, isLoading } = useQuery({
    queryKey: ['itinerary-results', id],
    queryFn: () => api.get(`/groups/${id}/itinerary`),
  });

  // Re-generate or switch destination mutation
  const generateMutation = useMutation({
    mutationFn: (destId) =>
      api.post(`/groups/${id}/generate`, {
        destinationId: destId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['itinerary-results', id]);
      navigate(`/groups/${id}/itinerary`);
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center animate-pulse">
        <div className="h-10 w-72 bg-parchment-border/40 rounded-xl mx-auto mb-4" />
        <div className="h-6 w-96 bg-parchment-border/40 rounded-xl mx-auto mb-10" />
        <div className="h-96 bg-white rounded-3xl border border-parchment-border" />
      </div>
    );
  }

  const report = data?.consensusReport;
  const itinerary = data?.itinerary;
  const dateAnalysis = report?.dateAnalysis;
  const budgetAnalysis = report?.budgetAnalysis;
  const rankedDestinations = report?.rankedDestinations || [];
  const conflicts = report?.conflicts || [];

  const topDestination = rankedDestinations[0];
  const activeDestId = selectedDestId || topDestination?.destinationId;

  const handleGenerate = (destId) => {
    generateMutation.mutate(destId);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Breadcrumb & Title */}
      <div className="pb-6 mb-8 border-b border-parchment-border">
        <Link
          to={`/groups/${id}`}
          className="text-xs font-semibold text-ink-muted hover:text-ink mb-2 inline-block"
        >
          ← Trip Hub
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal">
                Algorithmic Consensus
              </span>
              <span className="text-xs text-ink-muted">· {report?.totalPreferences || 'All'} members analyzed</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink mt-0.5">
              Consensus & Overlap Breakdown
            </h1>
          </div>

          {itinerary && (
            <Link
              to={`/groups/${id}/itinerary`}
              className="px-5 py-2.5 rounded-2xl bg-teal text-parchment font-semibold text-xs sm:text-sm hover:bg-teal-700 transition-all flex items-center gap-2 shadow-sm self-start sm:self-auto"
            >
              <span>Go to Drag & Drop Itinerary</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* 1. SIGNATURE CONFLICTS PANEL (Top Priority) */}
      <div className="mb-10">
        <ConflictPanel
          conflicts={conflicts}
          dateAnalysis={dateAnalysis}
          budgetAnalysis={budgetAnalysis}
        />
      </div>

      {/* 2. OVERLAP MATRICES: DATES & BUDGET */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Date Overlap Window */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-parchment-border shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-bold text-ink">Overlap Date Window</h3>
              </div>
              {dateAnalysis?.isCompleteOverlap ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  100% Free
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                  Near-Miss Window
                </span>
              )}
            </div>

            {dateAnalysis?.overlap ? (
              <div className="p-4 rounded-2xl bg-parchment border border-parchment-border my-2">
                <div className="text-xs uppercase font-bold text-ink-subtle">Agreed Travel Dates</div>
                <div className="font-serif text-2xl font-bold text-ink mt-0.5">
                  {new Date(dateAnalysis.overlap.start).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  –{' '}
                  {new Date(dateAnalysis.overlap.end).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
                <div className="text-xs text-ink-muted mt-1 font-medium">
                  Duration: {dateAnalysis.overlap.days} Days · Covers {dateAnalysis.membersCoveredCount} of {dateAnalysis.totalMembers} members
                </div>
              </div>
            ) : (
              <p className="text-sm text-sienna py-4">No overlapping date window discovered.</p>
            )}
          </div>

          <p className="text-xs text-ink-muted mt-3">
            Computed via interval intersection across all member submissions.
          </p>
        </div>

        {/* Budget Overlap Window */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-parchment-border shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sienna-50 text-sienna flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-bold text-ink">Agreed Budget Range</h3>
              </div>
              {budgetAnalysis?.isFeasible ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Feasible
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sienna-100 text-sienna border border-sienna-200">
                  Gap Flagged
                </span>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-parchment border border-parchment-border my-2">
              <div className="text-xs uppercase font-bold text-ink-subtle">Group Spending Ceiling</div>
              <div className="font-serif text-2xl font-bold text-ink mt-0.5">
                ${budgetAnalysis?.commonRange?.min ?? 300} – ${budgetAnalysis?.commonRange?.max ?? 1200}
                <span className="text-xs font-normal text-ink-muted ml-2 font-sans">total / person</span>
              </div>
              <div className="text-xs text-ink-muted mt-1 font-medium">
                ~${Math.round((budgetAnalysis?.commonRange?.max || 1000) / (dateAnalysis?.overlap?.days || 4))}/day for lodging & activities
              </div>
            </div>
          </div>

          <p className="text-xs text-ink-muted mt-3">
            Derived from intersection formula: [max(mins), min(maxes)].
          </p>
        </div>
      </div>

      {/* 3. RANKED DESTINATIONS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-parchment-border shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-parchment-border">
          <div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-sienna">
                Consensus Rankings
              </span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-ink mt-0.5">
              Ranked Destinations
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
              Weighted by direct member star votes + group interest tag overlap bonus, filtered by budget.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {rankedDestinations.map((item, index) => {
            const isWinner = index === 0;
            const isSelected = activeDestId === item.destinationId;

            return (
              <div
                key={item.destinationId}
                onClick={() => setSelectedDestId(item.destinationId)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isSelected
                    ? 'bg-parchment-light border-2 border-teal shadow-md'
                    : 'bg-white border-parchment-border hover:border-parchment-border/80'
                }`}
              >
                {/* Left info with thumbnail */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-8 font-serif font-bold text-xl text-ink-muted text-center shrink-0">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </div>

                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0 border border-parchment-border"
                    />
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-serif text-lg sm:text-xl font-bold text-ink">
                        {item.name}
                      </h3>
                      <span className="text-xs text-ink-muted">· {item.country}</span>
                      {isWinner && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sienna text-parchment uppercase tracking-wider">
                          Top Consensus Pick
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-ink-muted mt-1 flex-wrap">
                      <span>Est. ${item.totalEstimatedCost} total (${item.avgCostPerDayUSD}/day)</span>
                      <span>·</span>
                      <span>Avg Vote: {item.avgVoteScore} / 5</span>
                    </div>

                    {/* Matching Tags */}
                    {item.matchingTags?.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        {item.matchingTags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-parchment border border-parchment-border text-teal-800 capitalize"
                          >
                            ✓ {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Score & Action */}
                <div className="flex items-center justify-between md:justify-end gap-4 pl-12 md:pl-0 border-t md:border-t-0 pt-3 md:pt-0 border-parchment-border/60">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-ink-subtle block">
                      Overlap Score
                    </span>
                    <span className="font-serif text-2xl font-bold text-teal">
                      {item.totalScore}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleGenerate(item.destinationId);
                    }}
                    disabled={generateMutation.isPending}
                    className={`px-4 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all shadow-sm ${
                      isSelected
                        ? 'bg-teal text-parchment hover:bg-teal-700'
                        : 'bg-white hover:bg-parchment text-ink border border-parchment-border'
                    }`}
                  >
                    <span>{itinerary ? 'Select & Regulate Itinerary' : 'Build Itinerary'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
