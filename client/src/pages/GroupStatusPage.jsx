import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Copy,
  Check,
  Calendar,
  DollarSign,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  Lock,
  Layers,
  FileEdit,
  Share2,
  AlertCircle,
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function GroupStatusPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [copiedCode, setCopiedCode] = useState(false);
  const [generateError, setGenerateError] = useState('');

  // Fetch Group Details
  const { data: groupData, isLoading: groupLoading } = useQuery({
    queryKey: ['group', id],
    queryFn: () => api.get(`/groups/${id}`),
  });

  // Fetch Group Submission Status
  const { data: statusData, isLoading: statusLoading, refetch: refetchStatus } = useQuery({
    queryKey: ['group-status', id],
    queryFn: () => api.get(`/groups/${id}/status`),
    refetchInterval: 8000, // Poll occasionally for live updates
  });

  // Generate Itinerary Mutation
  const generateMutation = useMutation({
    mutationFn: () => api.post(`/groups/${id}/generate`, {}),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['group', id]);
      queryClient.invalidateQueries(['group-status', id]);
      navigate(`/groups/${id}/results`);
    },
    onError: (err) => {
      setGenerateError(err.message || 'Failed to compute consensus');
    },
  });

  const group = groupData?.group;
  const isHost = group?.createdBy?._id === user?._id;
  const hasSubmitted = statusData?.hasCurrentUserSubmitted;
  const memberStatus = statusData?.memberStatus || [];
  const submittedCount = statusData?.submittedCount || 0;
  const totalCount = statusData?.totalCount || 1;
  const progressPercent = Math.round((submittedCount / Math.max(1, totalCount)) * 100);

  const copyInvite = () => {
    if (group?.inviteCode) {
      navigator.clipboard.writeText(group.inviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  if (groupLoading || statusLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center animate-pulse">
        <div className="h-8 w-64 bg-parchment-border/40 rounded-xl mx-auto mb-4" />
        <div className="h-4 w-96 bg-parchment-border/40 rounded-xl mx-auto mb-8" />
        <div className="h-64 bg-white rounded-3xl border border-parchment-border" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="font-serif text-2xl font-bold text-ink mb-2">Trip Not Found</h2>
        <p className="text-sm text-ink-muted mb-6">
          This trip group doesn't exist or you are not a member.
        </p>
        <Link
          to="/dashboard"
          className="px-5 py-2.5 rounded-xl bg-teal text-parchment text-sm font-semibold hover:bg-teal-700"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-parchment-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/dashboard" className="text-xs font-semibold text-ink-muted hover:text-ink">
              ← Dashboard
            </Link>
            <span className="text-ink-subtle">/</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-sienna">
              Trip Hub
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink">
            {group.name}
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Organized by {group.createdBy?.name || 'Group Host'} · {group.members.length} member(s)
          </p>
        </div>

        {/* Invite Code Badge & Action */}
        <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-parchment-border shadow-sm">
          <div>
            <span className="text-[10px] uppercase font-bold text-ink-subtle block">
              Trip Code
            </span>
            <span className="font-mono font-bold text-sm text-teal tracking-wider">
              {group.inviteCode}
            </span>
          </div>
          <button
            onClick={copyInvite}
            className="p-1.5 ml-2 rounded-lg bg-parchment hover:bg-parchment-border text-ink-muted hover:text-ink transition-colors"
            title="Copy invite code"
          >
            {copiedCode ? <Check className="w-4 h-4 text-teal" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Progress & Submission Status Meter */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-parchment-border shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink">
              {submittedCount} of {totalCount} Members Submitted
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
              {statusData?.allSubmitted
                ? 'Everyone has submitted their preferences! Ready to generate consensus.'
                : 'Waiting for everyone to privately enter their available dates and budgets.'}
            </p>
          </div>

          <div className="text-right">
            <span className="font-serif text-3xl font-bold text-teal">{progressPercent}%</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-3 rounded-full bg-parchment-border/40 overflow-hidden mb-6">
          <div
            className="h-full bg-gradient-to-r from-teal to-sienna rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Action Callouts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* My Submission Action */}
          <div className="p-4 rounded-2xl bg-parchment-light border border-parchment-border flex flex-col justify-between">
            <div className="flex items-start gap-3 mb-4">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  hasSubmitted ? 'bg-emerald-100 text-emerald-800' : 'bg-sienna-100 text-sienna'
                }`}
              >
                {hasSubmitted ? <CheckCircle2 className="w-5 h-5" /> : <FileEdit className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="font-semibold text-sm text-ink">
                  {hasSubmitted ? 'Your Preferences are Saved' : 'Your Input is Required'}
                </h3>
                <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">
                  {hasSubmitted
                    ? 'You can update your availability, budget slider, or destination votes anytime.'
                    : 'Submit your dates, budget range, and vibe votes so the planner can calculate overlap.'}
                </p>
              </div>
            </div>

            <Link
              to={`/groups/${group._id}/preferences`}
              className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                hasSubmitted
                  ? 'bg-white hover:bg-parchment border border-parchment-border text-ink'
                  : 'bg-sienna text-parchment hover:bg-sienna-600 shadow-sm'
              }`}
            >
              <span>{hasSubmitted ? 'Edit Your Preferences' : 'Submit My Preferences'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Consensus / Itinerary Action */}
          <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 flex flex-col justify-between">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-teal text-parchment flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-teal-900">
                  {group.finalItinerary ? 'Consensus Itinerary Active' : 'Run Consensus Planner'}
                </h3>
                <p className="text-xs text-teal-800/80 mt-0.5 leading-relaxed">
                  {group.finalItinerary
                    ? 'Itinerary and conflict analysis are ready to view or modify.'
                    : submittedCount > 0
                    ? `${submittedCount} preferences received. You can run the consensus engine now.`
                    : 'Waiting on initial submissions to compute overlap windows.'}
                </p>
              </div>
            </div>

            {generateError && (
              <div className="mb-2 p-2 rounded-lg bg-sienna-50 border border-sienna-200 text-[11px] text-sienna">
                {generateError}
              </div>
            )}

            {group.finalItinerary ? (
              <div className="flex items-center gap-2">
                <Link
                  to={`/groups/${group._id}/results`}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-white border border-teal-200 text-teal font-semibold text-xs text-center hover:bg-teal-50 transition-colors"
                >
                  Consensus Results
                </Link>
                <Link
                  to={`/groups/${group._id}/itinerary`}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-teal text-parchment font-semibold text-xs text-center hover:bg-teal-700 transition-colors"
                >
                  View Itinerary
                </Link>
              </div>
            ) : (
              <button
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending || submittedCount === 0}
                className="w-full py-2.5 px-4 rounded-xl bg-teal text-parchment text-xs sm:text-sm font-semibold hover:bg-teal-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
              >
                {generateMutation.isPending ? (
                  <span>Computing Intersections...</span>
                ) : (
                  <>
                    <span>Generate Consensus Plan</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Member Roster List */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-parchment-border shadow-sm">
        <h3 className="font-serif text-xl font-bold text-ink mb-1">Group Travel Crew</h3>
        <p className="text-xs text-ink-muted mb-6">
          Track who has submitted and who still needs a reminder.
        </p>

        <div className="divide-y divide-parchment-border/80">
          {memberStatus.map((member) => (
            <div key={member._id} className="py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {member.avatarUrl ? (
                  <img
                    src={member.avatarUrl}
                    alt={member.name}
                    className="w-10 h-10 rounded-full object-cover border border-parchment-border"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-teal-100 text-teal font-bold flex items-center justify-center text-sm">
                    {member.name?.charAt(0) || 'U'}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-ink">{member.name}</span>
                    {group.createdBy?._id === member._id && (
                      <span className="text-[10px] font-bold text-sienna bg-sienna-50 border border-sienna-200 px-2 py-0.5 rounded-full">
                        Trip Host
                      </span>
                    )}
                    {user?._id === member._id && (
                      <span className="text-[10px] font-bold text-teal bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-ink-muted">{member.email}</span>
                </div>
              </div>

              <div>
                {member.hasSubmitted ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Submitted</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Pending</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
