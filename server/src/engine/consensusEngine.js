/**
 * Overlap - Consensus Engine
 * Core algorithmic module for finding group trip consensus.
 * 
 * Includes:
 * 1. findDateOverlap - Interval intersection with near-miss fallback
 * 2. findBudgetOverlap - Feasibility check with minimal exclusion analysis
 * 3. rankDestinations - Scoring by votes and interest tag overlap with budget filter
 * 4. detectConflicts - Detects vibe splits, budget gaps, and thin date windows
 * 5. generateItinerary - Rule-based day-by-day scheduler respecting tag variety & daily cost
 */

const TAG_CLOSENESS_THRESHOLD = 1;
const MIN_TRIP_DAYS = 3;
const DEFAULT_TRIP_DAYS = 4;

/**
 * Calculates number of days between two dates inclusive
 */
function getDaysBetween(start, end) {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)) + 1);
}

/**
 * Computes intersection of two intervals [s1, e1] and [s2, e2]
 * Returns { start, end, days } or null
 */
function intersectTwoRanges(r1, r2) {
  const start = new Date(Math.max(new Date(r1.start).getTime(), new Date(r2.start).getTime()));
  const end = new Date(Math.min(new Date(r1.end).getTime(), new Date(r2.end).getTime()));
  if (start.getTime() <= end.getTime()) {
    return {
      start,
      end,
      days: getDaysBetween(start, end),
    };
  }
  return null;
}

/**
 * 1. findDateOverlap
 * Finds the overlapping date window across all members.
 * If no complete overlap, returns near-miss windows (largest overlaps covering the most members).
 */
function findDateOverlap(preferences = []) {
  if (!preferences.length) {
    const today = new Date();
    const future = new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000);
    return {
      overlap: { start: today, end: future, days: 5 },
      allWindows: [{ start: today, end: future, days: 5 }],
      isCompleteOverlap: true,
      nearMisses: [],
      membersCoveredCount: 0,
      totalMembers: 0,
    };
  }

  const memberRanges = preferences.map((p, idx) => ({
    memberId: p.user?._id || p.user || `member_${idx}`,
    memberName: p.user?.name || `Member ${idx + 1}`,
    ranges: (p.availableDateRanges || []).map((r) => ({
      start: new Date(r.start),
      end: new Date(r.end),
    })),
  }));

  // Step 1: Attempt full intersection across all members
  let currentOverlaps = memberRanges[0]?.ranges || [];

  for (let i = 1; i < memberRanges.length; i++) {
    const nextOverlaps = [];
    const memberR = memberRanges[i].ranges;
    for (const cur of currentOverlaps) {
      for (const next of memberR) {
        const intersection = intersectTwoRanges(cur, next);
        if (intersection) {
          nextOverlaps.push(intersection);
        }
      }
    }
    currentOverlaps = nextOverlaps;
    if (currentOverlaps.length === 0) break;
  }

  if (currentOverlaps.length > 0) {
    // Sort by duration descending
    currentOverlaps.sort((a, b) => b.days - a.days);
    const bestOverlap = currentOverlaps[0];
    return {
      overlap: bestOverlap,
      allWindows: currentOverlaps,
      isCompleteOverlap: true,
      nearMisses: [],
      membersCoveredCount: preferences.length,
      totalMembers: preferences.length,
    };
  }

  // Step 2: Full intersection is empty -> compute near-misses
  // Find intervals covering the maximum number of members (k = N-1 down to 2)
  const nearMisses = [];
  const n = memberRanges.length;

  for (let k = n - 1; k >= Math.min(2, n); k--) {
    const combinations = getCombinations(memberRanges, k);
    for (const combo of combinations) {
      let comboOverlaps = combo[0].ranges;
      for (let j = 1; j < combo.length; j++) {
        const nextOverlaps = [];
        for (const cur of comboOverlaps) {
          for (const next of combo[j].ranges) {
            const intersection = intersectTwoRanges(cur, next);
            if (intersection) {
              nextOverlaps.push(intersection);
            }
          }
        }
        comboOverlaps = nextOverlaps;
        if (comboOverlaps.length === 0) break;
      }

      if (comboOverlaps.length > 0) {
        const coveredIds = new Set(combo.map((m) => m.memberId.toString()));
        const excludedMembers = memberRanges
          .filter((m) => !coveredIds.has(m.memberId.toString()))
          .map((m) => m.memberName);

        for (const ov of comboOverlaps) {
          nearMisses.push({
            start: ov.start,
            end: ov.end,
            days: ov.days,
            membersCoveredCount: k,
            totalMembers: n,
            coveredMemberNames: combo.map((m) => m.memberName),
            excludedMemberNames: excludedMembers,
          });
        }
      }
    }
    if (nearMisses.length > 0) break; // found highest tier of near-misses
  }

  // Sort near misses by days descending
  nearMisses.sort((a, b) => b.days - a.days);
  const bestNearMiss = nearMisses[0] || null;

  return {
    overlap: bestNearMiss,
    allWindows: nearMisses,
    isCompleteOverlap: false,
    nearMisses: nearMisses.slice(0, 5),
    membersCoveredCount: bestNearMiss ? bestNearMiss.membersCoveredCount : 0,
    totalMembers: preferences.length,
  };
}

// Helper to generate k-combinations
function getCombinations(array, k) {
  if (k === 0) return [[]];
  if (array.length === 0) return [];
  const head = array[0];
  const tail = array.slice(1);
  const withHead = getCombinations(tail, k - 1).map((c) => [head, ...c]);
  const withoutHead = getCombinations(tail, k);
  return [...withHead, ...withoutHead];
}

/**
 * 2. findBudgetOverlap
 * range = [max(all mins), min(all maxes)].
 * If max(mins) > min(maxes), flags infeasible and finds members to drop with fewest drops.
 */
function findBudgetOverlap(preferences = []) {
  if (!preferences.length) {
    return {
      isFeasible: true,
      min: 200,
      max: 1200,
      commonRange: { min: 200, max: 1200 },
      excludedMembers: [],
      feasibleAlternatives: [],
    };
  }

  const members = preferences.map((p, idx) => ({
    memberId: (p.user?._id || p.user || `m_${idx}`).toString(),
    memberName: p.user?.name || `Member ${idx + 1}`,
    min: Number(p.budgetRange?.min ?? 0),
    max: Number(p.budgetRange?.max ?? 1000),
  }));

  const allMins = members.map((m) => m.min);
  const allMaxes = members.map((m) => m.max);

  const maxMin = Math.max(...allMins);
  const minMax = Math.min(...allMaxes);

  if (maxMin <= minMax) {
    return {
      isFeasible: true,
      min: maxMin,
      max: minMax,
      commonRange: { min: maxMin, max: minMax },
      excludedMembers: [],
      feasibleAlternatives: [],
    };
  }

  // Budget is infeasible - find minimal members to drop
  const feasibleAlternatives = [];
  const n = members.length;

  for (let dropCount = 1; dropCount < n; dropCount++) {
    const keepCount = n - dropCount;
    const subsets = getCombinations(members, keepCount);

    for (const subset of subsets) {
      const subMins = subset.map((m) => m.min);
      const subMaxes = subset.map((m) => m.max);
      const subMaxMin = Math.max(...subMins);
      const subMinMax = Math.min(...subMaxes);

      if (subMaxMin <= subMinMax) {
        const keptIds = new Set(subset.map((m) => m.memberId));
        const dropped = members.filter((m) => !keptIds.has(m.memberId));

        feasibleAlternatives.push({
          dropsNeeded: dropCount,
          resultingRange: { min: subMaxMin, max: subMinMax },
          droppedMembers: dropped.map((d) => ({
            id: d.memberId,
            name: d.memberName,
            min: d.min,
            max: d.max,
          })),
          keptMembers: subset.map((s) => ({
            id: s.memberId,
            name: s.memberName,
          })),
        });
      }
    }

    if (feasibleAlternatives.length > 0) break; // Found fewest drops solution
  }

  // Fallback compromise range: average median
  const compromiseMin = Math.round(allMins.reduce((a, b) => a + b, 0) / n);
  const compromiseMax = Math.round(allMaxes.reduce((a, b) => a + b, 0) / n);

  return {
    isFeasible: false,
    min: maxMin,
    max: minMax,
    commonRange: {
      min: Math.min(compromiseMin, compromiseMax),
      max: Math.max(compromiseMin, compromiseMax),
    },
    feasibleAlternatives,
    suggestedDrop: feasibleAlternatives[0] || null,
  };
}

/**
 * 3. rankDestinations
 * score = average member vote for that destination + bonus for tag overlap with group's interestTags;
 * filter out destinations where avgCostPerDayUSD * tripDays exceeds budget max;
 * return sorted descending with scores shown.
 */
function rankDestinations(preferences = [], destinations = [], budgetRange = { min: 0, max: 2000 }, tripDays = DEFAULT_TRIP_DAYS) {
  if (!destinations.length) return [];

  // Aggregate group interest tags frequency
  const groupTagCounts = {};
  preferences.forEach((p) => {
    (p.interestTags || []).forEach((tag) => {
      const normalized = tag.toLowerCase().trim();
      groupTagCounts[normalized] = (groupTagCounts[normalized] || 0) + 1;
    });
  });

  const maxBudget = budgetRange?.max ?? 2000;

  const ranked = destinations.map((dest) => {
    const destIdStr = (dest._id || dest.id || '').toString();

    // 1. Calculate average member vote
    const votes = [];
    preferences.forEach((p) => {
      const vote = (p.destinationVotes || []).find((v) => {
        const voteDestId = (v.destination?._id || v.destination || '').toString();
        return voteDestId === destIdStr || v.destination === dest.name;
      });
      if (vote && typeof vote.score === 'number') {
        votes.push(vote.score);
      }
    });

    const avgVoteScore = votes.length
      ? Number((votes.reduce((a, b) => a + b, 0) / votes.length).toFixed(2))
      : 3.0; // Default neutral if no direct votes yet

    // 2. Bonus for tag overlap
    const destTags = (dest.tags || []).map((t) => t.toLowerCase().trim());
    let tagOverlapScore = 0;
    const matchingTags = [];

    destTags.forEach((t) => {
      if (groupTagCounts[t]) {
        // Tag weight based on how many members requested it
        tagOverlapScore += 0.5 * groupTagCounts[t];
        matchingTags.push(t);
      }
    });

    const totalScore = Number((avgVoteScore + tagOverlapScore).toFixed(2));
    const totalEstimatedCost = (dest.avgCostPerDayUSD || 100) * tripDays;
    const fitsBudget = totalEstimatedCost <= maxBudget;

    return {
      destination: dest,
      destinationId: destIdStr,
      name: dest.name,
      country: dest.country,
      imageUrl: dest.imageUrl,
      avgCostPerDayUSD: dest.avgCostPerDayUSD,
      totalEstimatedCost,
      tripDays,
      voteCount: votes.length,
      avgVoteScore,
      tagOverlapScore,
      matchingTags,
      totalScore,
      fitsBudget,
    };
  });

  // Filter out destinations exceeding budget max as specified in prompt
  const eligible = ranked.filter((r) => r.fitsBudget);
  const result = eligible.length > 0 ? eligible : ranked; // fallback to all if none fit

  result.sort((a, b) => b.totalScore - a.totalScore);
  return result;
}

/**
 * 4. detectConflicts
 * Clusters interestTags by frequency across members.
 * If top two clusters' counts are within TAG_CLOSENESS_THRESHOLD, returns conflict string.
 * Also flags budget infeasibility and thin date overlaps (< MIN_TRIP_DAYS).
 */
function detectConflicts(preferences = [], dateOverlapResult = null, budgetOverlapResult = null) {
  const conflicts = [];

  // Tag split conflict detection
  const tagCounts = {};
  preferences.forEach((p) => {
    (p.interestTags || []).forEach((t) => {
      const norm = t.toLowerCase().trim();
      tagCounts[norm] = (tagCounts[norm] || 0) + 1;
    });
  });

  const sortedTags = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);

  if (sortedTags.length >= 2) {
    const top1 = sortedTags[0];
    const top2 = sortedTags[1];

    if (Math.abs(top1.count - top2.count) <= TAG_CLOSENESS_THRESHOLD && top1.count >= 1) {
      conflicts.push(
        `Split on activity vibe: ${top1.count} member(s) prioritized "${top1.tag}" while ${top2.count} prioritized "${top2.tag}". Suggesting an itinerary balancing both.`
      );
    }
  }

  // Budget conflict detection
  const budget = budgetOverlapResult || findBudgetOverlap(preferences);
  if (!budget.isFeasible) {
    if (budget.suggestedDrop) {
      const droppedNames = budget.suggestedDrop.droppedMembers.map((d) => d.name).join(', ');
      conflicts.push(
        `Budget gap: The group's lowest maximum ($${budget.min}) conflicts with higher minimum thresholds. Excluding ${droppedNames} achieves feasibility [$${budget.suggestedDrop.resultingRange.min}-$${budget.suggestedDrop.resultingRange.max}].`
      );
    } else {
      conflicts.push(
        `Budget gap: Minimum required budget ($${budget.min}) exceeds the group's lowest cap ($${budget.max}).`
      );
    }
  }

  // Date overlap conflict detection
  const dates = dateOverlapResult || findDateOverlap(preferences);
  if (!dates.isCompleteOverlap) {
    if (dates.overlap) {
      const excluded = (dates.overlap.excludedMemberNames || []).join(', ');
      conflicts.push(
        `Date conflict: No single window where all members are free. Near-miss window found (${dates.overlap.days} days), excluding ${excluded || 'some members'}.`
      );
    } else {
      conflicts.push(
        'Date conflict: Completely zero overlapping availability found across members.'
      );
    }
  } else if (dates.overlap && dates.overlap.days < MIN_TRIP_DAYS) {
    conflicts.push(
      `Thin date overlap: The available common window is only ${dates.overlap.days} day(s), which is less than the recommended minimum of ${MIN_TRIP_DAYS} days.`
    );
  }

  return conflicts;
}

/**
 * 5. generateItinerary
 * For the given destination and day count, select activities matching group's top tags,
 * distribute across days, never repeat the same activity tag on two consecutive days,
 * and keep each day's activity cost sum within (budgetMax / tripDays).
 */
function generateItinerary(
  destination,
  activities = [],
  dateRange = { start: new Date(), end: new Date(Date.now() + 3 * 24 * 3600 * 1000) },
  budgetRange = { min: 300, max: 1500 },
  groupTags = []
) {
  const tripDays = getDaysBetween(dateRange.start, dateRange.end);
  const budgetMax = budgetRange?.max || 1500;
  const dailyActivityBudget = Math.max(50, Math.floor(budgetMax / tripDays));

  // Normalize group tags
  const normalizedGroupTags = groupTags.map((t) => t.toLowerCase().trim());

  // Filter activities for this destination if destination is provided
  const destIdStr = (destination?._id || destination?.id || '').toString();
  const pool = activities.filter((act) => {
    if (!destIdStr) return true;
    const actDestId = (act.destination?._id || act.destination || '').toString();
    return actDestId === destIdStr;
  });

  // Score activities by matching tags
  const scoredActivities = (pool.length ? pool : activities).map((act) => {
    const actTags = (act.tags || []).map((t) => t.toLowerCase().trim());
    let matchCount = 0;
    actTags.forEach((t) => {
      if (normalizedGroupTags.includes(t)) matchCount++;
    });
    return {
      activity: act,
      matchCount,
      primaryTag: actTags[0] || 'general',
      cost: act.estimatedCostUSD || 0,
    };
  });

  // Sort by tag relevance, then lower cost
  scoredActivities.sort((a, b) => b.matchCount - a.matchCount || a.cost - b.cost);

  const days = [];
  const usedActivityIds = new Set();
  let previousDayPrimaryTag = null;

  for (let dayNum = 1; dayNum <= tripDays; dayNum++) {
    const dayActivities = [];
    let currentDayCost = 0;
    let dayPrimaryTag = null;

    // Pick 1 to 3 activities for this day
    for (const item of scoredActivities) {
      const actId = (item.activity._id || item.activity.id || item.activity.name).toString();
      if (usedActivityIds.has(actId)) continue;

      // Rule: Never repeat the same activity tag on two consecutive days
      if (previousDayPrimaryTag && item.primaryTag === previousDayPrimaryTag && scoredActivities.length > tripDays) {
        continue;
      }

      // Rule: Keep daily activity cost sum within daily budget target
      if (currentDayCost + item.cost > dailyActivityBudget && dayActivities.length >= 1) {
        continue;
      }

      dayActivities.push(item.activity);
      usedActivityIds.add(actId);
      currentDayCost += item.cost;
      if (!dayPrimaryTag) dayPrimaryTag = item.primaryTag;

      if (dayActivities.length >= 3) break;
    }

    // Fallback if no activity found without tag collision
    if (dayActivities.length === 0) {
      const unused = scoredActivities.find((item) => {
        const id = (item.activity._id || item.activity.id || item.activity.name).toString();
        return !usedActivityIds.has(id);
      });
      if (unused) {
        dayActivities.push(unused.activity);
        usedActivityIds.add((unused.activity._id || unused.activity.id || unused.activity.name).toString());
        dayPrimaryTag = unused.primaryTag;
      }
    }

    previousDayPrimaryTag = dayPrimaryTag;
    days.push({
      dayNumber: dayNum,
      activities: dayActivities,
    });
  }

  const totalActivityCost = days.reduce(
    (total, day) => total + day.activities.reduce((dTotal, a) => dTotal + (a.estimatedCostUSD || 0), 0),
    0
  );

  return {
    destination,
    dateRange,
    tripDays,
    dailyActivityBudget,
    totalActivityCost,
    days,
  };
}

module.exports = {
  TAG_CLOSENESS_THRESHOLD,
  MIN_TRIP_DAYS,
  DEFAULT_TRIP_DAYS,
  getDaysBetween,
  intersectTwoRanges,
  findDateOverlap,
  findBudgetOverlap,
  rankDestinations,
  detectConflicts,
  generateItinerary,
};
