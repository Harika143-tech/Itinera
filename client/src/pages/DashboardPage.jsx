import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Plus,
  KeyRound,
  Users,
  Calendar,
  DollarSign,
  Compass,
  ArrowRight,
  Copy,
  Check,
  Lock,
  Sparkles,
  MapPin,
  Clock,
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import CreateJoinTripModal from './CreateJoinTripModal';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('create');
  const [copiedCode, setCopiedCode] = useState(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['my-groups'],
    queryFn: async () => {
      return api.get('/groups');
    },
  });

  const groups = data?.groups || [];

  const copyCode = (code, e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'locked':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Lock className="w-3 h-3" />
            Locked & Ready
          </span>
        );
      case 'finalizing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">
            <Sparkles className="w-3 h-3 text-teal" />
            Consensus Ready
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200">
            <Clock className="w-3 h-3" />
            Collecting Preferences
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 mb-8 border-b border-parchment-border">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sienna">
            Personal Dashboard
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink mt-0.5">
            Welcome back, {user?.name}
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Coordinate dates, budgets, and bucket lists with your travel circles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setModalTab('join');
              setModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-parchment-border/40 text-ink font-semibold text-xs sm:text-sm border border-parchment-border transition-all flex items-center gap-2 shadow-sm"
          >
            <KeyRound className="w-4 h-4 text-ink-muted" />
            <span>Join with Code</span>
          </button>

          <button
            onClick={() => {
              setModalTab('create');
              setModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-teal text-parchment font-semibold text-xs sm:text-sm hover:bg-teal-700 active:scale-[0.99] transition-all flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Start New Trip</span>
          </button>
        </div>
      </div>

      {/* Trip Groups List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-white/60 border border-parchment-border" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl p-10 sm:p-14 border border-parchment-border text-center max-w-xl mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-teal-50 text-teal flex items-center justify-center mx-auto mb-4 border border-teal-100">
            <Compass className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-ink mb-2">No Active Trips Yet</h2>
          <p className="text-sm text-ink-muted mb-6 leading-relaxed">
            Create a trip group to invite friends and start finding mutual date and budget availability.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                setModalTab('create');
                setModalOpen(true);
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal text-parchment text-sm font-semibold hover:bg-teal-700 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Trip</span>
            </button>
            <button
              onClick={() => {
                setModalTab('join');
                setModalOpen(true);
              }}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-parchment hover:bg-parchment-border text-ink text-sm font-semibold border border-parchment-border transition-all"
            >
              <span>Join via Code</span>
            </button>
          </div>
        </div>
      ) : (
        /* Grid of Trips */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => {
            const isCreator = group.createdBy?._id === user?._id;
            const dest = group.finalItinerary?.destination;

            return (
              <div
                key={group._id}
                onClick={() => navigate(`/groups/${group._id}`)}
                className="bg-white rounded-3xl border border-parchment-border overflow-hidden hover:border-teal/50 hover:shadow-card transition-all cursor-pointer flex flex-col justify-between group"
              >
                {/* Destination Image or Pattern Banner */}
                <div className="relative h-40 bg-parchment overflow-hidden">
                  {dest?.imageUrl ? (
                    <img
                      src={dest.imageUrl}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-teal-700 to-teal flex items-center justify-center p-6 text-parchment">
                      <div className="flex items-center gap-2 font-serif text-lg font-semibold tracking-wide">
                        <Compass className="w-6 h-6 text-sienna-300" />
                        <span>{group.name}</span>
                      </div>
                    </div>
                  )}

                  {/* Status Overlay */}
                  <div className="absolute top-3 left-3">{getStatusBadge(group.status)}</div>

                  {/* Creator badge */}
                  {isCreator && (
                    <div className="absolute top-3 right-3 bg-ink/75 backdrop-blur-sm text-parchment text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                      Host
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-xl font-bold text-ink mb-1 group-hover:text-teal transition-colors">
                      {group.name}
                    </h3>

                    {dest && (
                      <div className="flex items-center gap-1.5 text-xs text-sienna font-medium mb-3">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{dest.name}, {dest.country}</span>
                      </div>
                    )}

                    {/* Invite Code row */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-parchment border border-parchment-border/80 my-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-ink-subtle block">
                          Invite Code
                        </span>
                        <span className="font-mono font-bold text-xs text-teal tracking-wider">
                          {group.inviteCode}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => copyCode(group.inviteCode, e)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-parchment-border hover:bg-parchment text-ink text-[11px] font-medium flex items-center gap-1 transition-colors"
                      >
                        {copiedCode === group.inviteCode ? (
                          <>
                            <Check className="w-3 h-3 text-teal" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-ink-muted" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Member count & navigation action */}
                  <div className="pt-4 border-t border-parchment-border/60 flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2 text-xs text-ink-muted">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {group.members.slice(0, 4).map((member, idx) => (
                          <div
                            key={idx}
                            className="w-6 h-6 rounded-full border border-white bg-teal-100 flex items-center justify-center text-[10px] font-bold text-teal"
                            title={member.name}
                          >
                            {member.avatarUrl ? (
                              <img src={member.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                            ) : (
                              member.name?.charAt(0) || 'U'
                            )}
                          </div>
                        ))}
                      </div>
                      <span>{group.members.length} {group.members.length === 1 ? 'member' : 'members'}</span>
                    </div>

                    <div className="inline-flex items-center gap-1 text-xs font-semibold text-teal group-hover:translate-x-1 transition-transform">
                      <span>Open Board</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <CreateJoinTripModal
        isOpen={modalOpen}
        initialTab={modalTab}
        onClose={() => setModalOpen(false)}
        onTripCreated={(newGroup) => {
          refetch();
          navigate(`/groups/${newGroup._id}`);
        }}
        onTripJoined={(joinedGroup) => {
          refetch();
          navigate(`/groups/${joinedGroup._id}`);
        }}
      />
    </div>
  );
}
