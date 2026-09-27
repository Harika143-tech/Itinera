import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Plus, KeyRound, Copy, Check, ArrowRight } from 'lucide-react';
import { api } from '../api/client';

export default function CreateJoinTripModal({ isOpen, onClose, initialTab = 'create', onTripCreated, onTripJoined }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [createdGroup, setCreatedGroup] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [serverError, setServerError] = useState('');

  const createForm = useForm();
  const joinForm = useForm();

  if (!isOpen) return null;

  const handleCreate = async (data) => {
    setServerError('');
    try {
      const res = await api.post('/groups', { name: data.name });
      setCreatedGroup(res.group);
      if (onTripCreated) onTripCreated(res.group);
    } catch (err) {
      setServerError(err.message || 'Failed to create trip group');
    }
  };

  const handleJoin = async (data) => {
    setServerError('');
    try {
      const cleanCode = data.inviteCode.trim().toUpperCase();
      const res = await api.post(`/groups/${cleanCode}/join`);
      onClose();
      if (onTripJoined) onTripJoined(res.group);
    } catch (err) {
      setServerError(err.message || 'Invalid or expired invite code');
    }
  };

  const copyInviteCode = () => {
    if (createdGroup?.inviteCode) {
      navigator.clipboard.writeText(createdGroup.inviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="relative w-full max-w-lg bg-parchment-light rounded-3xl p-6 sm:p-8 border border-parchment-border shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => {
            setCreatedGroup(null);
            onClose();
          }}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-parchment hover:bg-parchment-border/50 text-ink-muted hover:text-ink flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {!createdGroup ? (
          <>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink mb-1">
              {activeTab === 'create' ? 'Start a New Trip' : 'Join an Existing Trip'}
            </h2>
            <p className="text-sm text-ink-muted mb-6">
              {activeTab === 'create'
                ? 'Create a private group board and invite your travel crew.'
                : 'Enter the invite code shared by your friend to join their board.'}
            </p>

            {/* Tab switch */}
            <div className="grid grid-cols-2 p-1 bg-parchment rounded-xl mb-6 border border-parchment-border/80">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('create');
                  setServerError('');
                }}
                className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'create'
                    ? 'bg-white text-teal shadow-sm border border-parchment-border/50'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                Create Trip
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('join');
                  setServerError('');
                }}
                className={`py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'join'
                    ? 'bg-white text-teal shadow-sm border border-parchment-border/50'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                Join with Code
              </button>
            </div>

            {serverError && (
              <div className="mb-4 p-3 rounded-xl bg-sienna-50 border border-sienna-200 text-xs text-sienna font-medium">
                {serverError}
              </div>
            )}

            {activeTab === 'create' ? (
              <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">
                    Trip or Group Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Summer Eurotrip 2026, Japan Foodie Crew"
                    {...createForm.register('name', { required: 'Trip name is required' })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-parchment-border focus:border-teal focus:ring-1 focus:ring-teal outline-none text-ink text-sm transition-all"
                  />
                  {createForm.formState.errors.name && (
                    <p className="text-xs text-sienna mt-1">{createForm.formState.errors.name.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={createForm.formState.isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-teal text-parchment font-semibold text-sm hover:bg-teal-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm mt-4"
                >
                  {createForm.formState.isSubmitting ? 'Generating Board...' : 'Create Trip Group'}
                </button>
              </form>
            ) : (
              <form onSubmit={joinForm.handleSubmit(handleJoin)} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">
                    Invite Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. BALI-2026 or TRIP-9A4B"
                    {...joinForm.register('inviteCode', { required: 'Invite code is required' })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-parchment-border focus:border-teal focus:ring-1 focus:ring-teal outline-none text-ink text-sm uppercase tracking-wider font-mono transition-all"
                  />
                  {joinForm.formState.errors.inviteCode && (
                    <p className="text-xs text-sienna mt-1">{joinForm.formState.errors.inviteCode.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={joinForm.formState.isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-sienna text-parchment font-semibold text-sm hover:bg-sienna-600 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm mt-4"
                >
                  {joinForm.formState.isSubmitting ? 'Verifying Code...' : 'Join Trip Board'}
                </button>
              </form>
            )}
          </>
        ) : (
          /* Trip Created Success Screen */
          <div className="text-center py-2">
            <div className="w-14 h-14 rounded-2xl bg-teal/10 border border-teal/30 text-teal flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7" />
            </div>

            <h3 className="font-serif text-2xl font-bold text-ink mb-1">
              "{createdGroup.name}" is Ready!
            </h3>
            <p className="text-sm text-ink-muted mb-6 max-w-sm mx-auto">
              Share this invite code with your friends so they can submit their confidential dates and budget preferences.
            </p>

            <div className="bg-parchment rounded-2xl p-4 border border-parchment-border mb-6 flex items-center justify-between">
              <div className="text-left">
                <span className="text-[11px] uppercase font-bold text-ink-muted">Trip Invite Code</span>
                <div className="font-mono text-xl font-bold tracking-widest text-teal">
                  {createdGroup.inviteCode}
                </div>
              </div>

              <button
                type="button"
                onClick={copyInviteCode}
                className="px-4 py-2 rounded-xl bg-white border border-parchment-border hover:bg-parchment text-ink text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-teal" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-ink-muted" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                if (onTripCreated) onTripCreated(createdGroup);
              }}
              className="w-full py-3 px-4 rounded-xl bg-teal text-parchment font-semibold text-sm hover:bg-teal-700 transition-all flex items-center justify-center gap-2"
            >
              <span>Go to Trip Board</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
