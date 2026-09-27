import React from 'react';
import { AlertTriangle, Compass, DollarSign, Calendar, CheckCircle2, Users } from 'lucide-react';

export default function ConflictPanel({ conflicts = [], dateAnalysis, budgetAnalysis, onResolveClick }) {
  if (!conflicts || conflicts.length === 0) {
    return (
      <div className="bg-teal-50 border border-teal-200/80 rounded-2xl p-6 text-teal-900 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center shrink-0 text-teal-700">
            <CheckCircle2 className="w-5 h-5 text-teal" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold text-teal-900 mb-1">
              Consensus Harmony Achieved
            </h3>
            <p className="text-sm text-teal-800/80 leading-relaxed">
              No conflicting dates, budget barriers, or polar activity preferences detected. All members are aligned on this trip plan!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-sienna/30 bg-gradient-to-br from-sienna-50/80 via-parchment to-parchment p-6 sm:p-7 shadow-conflict">
      {/* Visual Accent Top Bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sienna via-sienna-400 to-teal" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-sienna/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sienna/10 border border-sienna/30 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-sienna animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-sienna px-2 py-0.5 rounded-full bg-sienna-100 border border-sienna/30">
                Core Differentiator
              </span>
              <span className="text-xs text-ink-muted">
                {conflicts.length} {conflicts.length === 1 ? 'disagreement surfaced' : 'disagreements surfaced'}
              </span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-ink mt-0.5">
              The Conflicts & Compromise Panel
            </h3>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-ink-muted max-w-xs sm:text-right">
          Instead of endless WhatsApp arguments, we surface hidden friction so you can choose transparent compromises.
        </p>
      </div>

      {/* Conflict Cards Grid */}
      <div className="space-y-4">
        {conflicts.map((conflictText, index) => {
          const isVibe = conflictText.toLowerCase().includes('vibe') || conflictText.toLowerCase().includes('split');
          const isBudget = conflictText.toLowerCase().includes('budget');
          const isDate = conflictText.toLowerCase().includes('date');

          return (
            <div
              key={index}
              className="bg-white/90 backdrop-blur-sm rounded-xl p-4 sm:p-5 border border-sienna/25 shadow-sm hover:border-sienna/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    isVibe
                      ? 'bg-purple-100 text-purple-800 border border-purple-200'
                      : isBudget
                      ? 'bg-amber-100 text-amber-900 border border-amber-200'
                      : 'bg-sienna-100 text-sienna border border-sienna-200'
                  }`}
                >
                  {isVibe && <Compass className="w-4 h-4" />}
                  {isBudget && <DollarSign className="w-4 h-4" />}
                  {isDate && <Calendar className="w-4 h-4" />}
                  {!isVibe && !isBudget && !isDate && <AlertTriangle className="w-4 h-4" />}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                      {isVibe ? 'Activity Preference Split' : isBudget ? 'Budget Window Gap' : isDate ? 'Schedule Disparity' : 'Group Conflict'}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base font-medium text-ink leading-relaxed">
                    {conflictText}
                  </p>
                </div>
              </div>

              {/* Action / Compromise suggestion */}
              <div className="shrink-0 pl-12 md:pl-0">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-parchment-light border border-sienna/20 text-sienna-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-sienna" />
                  Auto-balanced in itinerary
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Suggested Exclusion Analysis if Budget Infeasible */}
      {budgetAnalysis && !budgetAnalysis.isFeasible && budgetAnalysis.suggestedDrop && (
        <div className="mt-5 p-4 rounded-xl bg-amber-50/90 border border-amber-200 text-xs sm:text-sm text-amber-900">
          <div className="flex items-center gap-2 font-semibold mb-1">
            <Users className="w-4 h-4 text-amber-700" />
            <span>Optimal Subset Feasibility:</span>
          </div>
          <p className="leading-relaxed">
            By excluding <strong className="underline">{budgetAnalysis.suggestedDrop.droppedMembers.map(m => m.name).join(', ')}</strong>, the remaining {budgetAnalysis.suggestedDrop.keptMembers.length} members achieve an overlapping budget of <strong>${budgetAnalysis.suggestedDrop.resultingRange.min} – ${budgetAnalysis.suggestedDrop.resultingRange.max}</strong>.
          </p>
        </div>
      )}

      {/* Near Miss Exclusions if Date Infeasible */}
      {dateAnalysis && !dateAnalysis.isCompleteOverlap && dateAnalysis.overlap && (
        <div className="mt-4 p-4 rounded-xl bg-teal-50/90 border border-teal-200 text-xs sm:text-sm text-teal-900">
          <div className="flex items-center gap-2 font-semibold mb-1">
            <Calendar className="w-4 h-4 text-teal" />
            <span>Best Near-Miss Date Window:</span>
          </div>
          <p className="leading-relaxed">
            {new Date(dateAnalysis.overlap.start).toLocaleDateString()} to {new Date(dateAnalysis.overlap.end).toLocaleDateString()} ({dateAnalysis.overlap.days} days) fits {dateAnalysis.overlap.membersCoveredCount} of {dateAnalysis.overlap.totalMembers} members. Excluded: <span className="font-medium">{dateAnalysis.overlap.excludedMemberNames?.join(', ') || 'None'}</span>.
          </p>
        </div>
      )}
    </div>
  );
}
