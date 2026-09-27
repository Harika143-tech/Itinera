import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Calendar,
  DollarSign,
  GripVertical,
  Lock,
  Save,
  Clock,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Printer,
  Share2,
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

// Sortable Activity Item Component
function SortableActivityItem({ activity, dayIndex, activityIndex, onRemove }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity._id || `act-${dayIndex}-${activityIndex}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-3.5 sm:p-4 rounded-2xl bg-white border border-parchment-border/80 hover:border-teal/40 transition-all flex items-start gap-3 shadow-xs group"
    >
      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="p-1 text-ink-subtle hover:text-ink cursor-grab active:cursor-grabbing shrink-0 mt-0.5"
        title="Drag to reorder activity"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-semibold text-sm text-ink truncate">{activity.name}</h4>
          <span className="font-mono text-xs font-bold text-teal shrink-0">
            ${activity.estimatedCostUSD}
          </span>
        </div>

        {activity.description && (
          <p className="text-xs text-ink-muted mt-0.5 line-clamp-2 leading-relaxed">
            {activity.description}
          </p>
        )}

        <div className="flex items-center gap-2 mt-2">
          {activity.durationHours && (
            <span className="inline-flex items-center gap-1 text-[11px] text-ink-subtle">
              <Clock className="w-3 h-3" />
              {activity.durationHours} hrs
            </span>
          )}

          {(activity.tags || []).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase bg-parchment text-teal-800 border border-parchment-border"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ItineraryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [daysState, setDaysState] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [lockModalOpen, setLockModalOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch Group and Itinerary
  const { data, isLoading } = useQuery({
    queryKey: ['itinerary', id],
    queryFn: () => api.get(`/groups/${id}/itinerary`),
  });

  const { data: groupData } = useQuery({
    queryKey: ['group', id],
    queryFn: () => api.get(`/groups/${id}`),
  });

  const itinerary = data?.itinerary;
  const group = groupData?.group;
  const isHost = group?.createdBy?._id === user?._id;
  const isLocked = itinerary?.isFinal || group?.status === 'locked';

  // Sync state with fetched itinerary
  useEffect(() => {
    if (itinerary?.days) {
      setDaysState(itinerary.days);
    }
  }, [itinerary]);

  // Update Itinerary Mutation
  const updateMutation = useMutation({
    mutationFn: (updatedDays) =>
      api.patch(`/groups/${id}/itinerary`, {
        days: updatedDays,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(['itinerary', id]);
      setHasChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    },
  });

  // Lock Itinerary Mutation
  const lockMutation = useMutation({
    mutationFn: () => api.post(`/groups/${id}/itinerary/lock`),
    onSuccess: () => {
      queryClient.invalidateQueries(['itinerary', id]);
      queryClient.invalidateQueries(['group', id]);
      navigate(`/groups/${id}/locked`);
    },
  });

  const handleDragEnd = (event, dayIdx) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setDaysState((prev) => {
      const newDays = [...prev];
      const currentDay = { ...newDays[dayIdx] };
      const oldIndex = currentDay.activities.findIndex(
        (a) => (a._id || a.id) === active.id
      );
      const newIndex = currentDay.activities.findIndex(
        (a) => (a._id || a.id) === over.id
      );

      if (oldIndex !== -1 && newIndex !== -1) {
        currentDay.activities = arrayMove(currentDay.activities, oldIndex, newIndex);
        newDays[dayIdx] = currentDay;
        setHasChanges(true);
      }
      return newDays;
    });
  };

  const handleSave = () => {
    updateMutation.mutate(daysState);
  };

  const handleLock = () => {
    lockMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center animate-pulse">
        <div className="h-10 w-72 bg-parchment-border/40 rounded-xl mx-auto mb-4" />
        <div className="h-64 bg-white rounded-3xl border border-parchment-border" />
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="font-serif text-2xl font-bold text-ink mb-2">No Itinerary Generated Yet</h2>
        <p className="text-sm text-ink-muted mb-6">
          Run the consensus engine from the Trip Hub to generate an itinerary.
        </p>
        <Link
          to={`/groups/${id}`}
          className="px-5 py-2.5 rounded-xl bg-teal text-parchment text-sm font-semibold hover:bg-teal-700"
        >
          Return to Trip Hub
        </Link>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-900 inline-block mb-6">
          <div className="flex items-center gap-2 font-serif text-xl font-bold mb-1">
            <Lock className="w-5 h-5 text-emerald-700" />
            <span>This Trip Plan Has Been Finalized & Locked</span>
          </div>
          <p className="text-sm text-emerald-800">
            View the final, shareable trip plan ready for departure.
          </p>
        </div>
        <div>
          <Link
            to={`/groups/${id}/locked`}
            className="px-6 py-3 rounded-2xl bg-teal text-parchment font-semibold text-sm hover:bg-teal-700 shadow-sm"
          >
            View Locked Final Itinerary
          </Link>
        </div>
      </div>
    );
  }

  const destination = itinerary.destination;
  const tripDays = daysState.length;
  const totalActivityCost = daysState.reduce(
    (acc, day) => acc + (day.activities || []).reduce((sum, a) => sum + (a.estimatedCostUSD || 0), 0),
    0
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Top Banner */}
      <div className="pb-6 mb-8 border-b border-parchment-border">
        <div className="flex items-center gap-2 mb-2">
          <Link to={`/groups/${id}`} className="text-xs font-semibold text-ink-muted hover:text-ink">
            ← Trip Hub
          </Link>
          <span className="text-ink-subtle">/</span>
          <Link to={`/groups/${id}/results`} className="text-xs font-semibold text-ink-muted hover:text-ink">
            Consensus Results
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sienna">
                Interactive Schedule
              </span>
              <span className="text-xs text-ink-muted">· {tripDays} Days in {destination?.name}</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink mt-0.5">
              {destination?.name} Consensus Itinerary
            </h1>
            <p className="text-sm text-ink-muted mt-1">
              Drag activities within days to customize schedule. Tag variety is maintained to avoid burnout.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {hasChanges && (
              <button
                type="button"
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="px-4 py-2.5 rounded-xl bg-teal text-parchment text-xs sm:text-sm font-semibold hover:bg-teal-700 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>{updateMutation.isPending ? 'Saving...' : 'Save Reordering'}</span>
              </button>
            )}

            {saveSuccess && (
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Saved!</span>
              </span>
            )}

            {isHost && (
              <button
                type="button"
                onClick={() => setLockModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-sienna text-parchment font-semibold text-xs sm:text-sm hover:bg-sienna-600 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock Final Plan</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Overview Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="p-4 rounded-2xl bg-white border border-parchment-border">
          <span className="text-[10px] uppercase font-bold text-ink-subtle">Dates</span>
          <div className="font-serif font-bold text-base text-ink mt-0.5">
            {new Date(itinerary.dateRange.start).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}{' '}
            –{' '}
            {new Date(itinerary.dateRange.end).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-parchment-border">
          <span className="text-[10px] uppercase font-bold text-ink-subtle">Destination</span>
          <div className="font-serif font-bold text-base text-ink mt-0.5">
            {destination?.name}, {destination?.country}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-parchment-border">
          <span className="text-[10px] uppercase font-bold text-ink-subtle">Total Activities Budget</span>
          <div className="font-serif font-bold text-base text-teal mt-0.5">
            ${totalActivityCost} total / person
          </div>
        </div>
      </div>

      {/* Day by Day Cards List */}
      <div className="space-y-6">
        {daysState.map((day, dayIdx) => {
          const dayActivities = day.activities || [];
          const dayCost = dayActivities.reduce((s, a) => s + (a.estimatedCostUSD || 0), 0);

          return (
            <div
              key={day.dayNumber || dayIdx}
              className="bg-parchment-light rounded-3xl p-6 sm:p-7 border border-parchment-border shadow-sm"
            >
              {/* Day Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-parchment-border/80">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-xl bg-teal text-parchment font-serif font-bold text-sm flex items-center justify-center">
                    {day.dayNumber}
                  </span>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-ink">
                      Day {day.dayNumber} Schedule
                    </h3>
                    <span className="text-xs text-ink-muted">
                      {dayActivities.length} {dayActivities.length === 1 ? 'activity' : 'activities'} scheduled
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-ink">
                    ${dayCost}
                  </span>
                  <span className="text-[10px] text-ink-subtle block">Day Total</span>
                </div>
              </div>

              {/* Activities Dnd Sortable Container */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={(e) => handleDragEnd(e, dayIdx)}
              >
                <SortableContext
                  items={dayActivities.map((a, idx) => a._id || `act-${dayIdx}-${idx}`)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2.5">
                    {dayActivities.map((act, actIdx) => (
                      <SortableActivityItem
                        key={act._id || `act-${dayIdx}-${actIdx}`}
                        activity={act}
                        dayIndex={dayIdx}
                        activityIndex={actIdx}
                      />
                    ))}

                    {dayActivities.length === 0 && (
                      <div className="py-6 text-center text-xs text-ink-muted border-2 border-dashed border-parchment-border rounded-2xl">
                        Free leisure day — relax on the beach or explore local cafes.
                      </div>
                    )}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          );
        })}
      </div>

      {/* Lock Confirmation Modal */}
      {lockModalOpen && (
        <div className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border border-parchment-border shadow-card text-center">
            <div className="w-12 h-12 rounded-2xl bg-sienna-100 text-sienna flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6" />
            </div>

            <h3 className="font-serif text-2xl font-bold text-ink mb-2">
              Lock & Finalize Trip?
            </h3>
            <p className="text-sm text-ink-muted mb-6 leading-relaxed">
              Once locked, this itinerary is frozen into a read-only final overview and cannot be edited further. All members will be able to export and view the departure plan.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLockModalOpen(false)}
                className="py-2.5 px-4 rounded-xl bg-parchment hover:bg-parchment-border text-ink text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLock}
                disabled={lockMutation.isPending}
                className="py-2.5 px-4 rounded-xl bg-sienna text-parchment text-xs font-semibold hover:bg-sienna-600 transition-colors shadow-sm"
              >
                {lockMutation.isPending ? 'Finalizing...' : 'Yes, Lock Plan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
