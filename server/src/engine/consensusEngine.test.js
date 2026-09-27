const {
  findDateOverlap,
  findBudgetOverlap,
  rankDestinations,
  detectConflicts,
  generateItinerary,
  TAG_CLOSENESS_THRESHOLD,
  MIN_TRIP_DAYS,
} = require('./consensusEngine');

describe('Overlap Consensus Engine Unit Tests', () => {
  // Test Case 1: Clean overlap case
  test('1. Clean overlap case: calculates common date and budget window across members', () => {
    const preferences = [
      {
        user: { _id: 'u1', name: 'Alice' },
        availableDateRanges: [
          { start: new Date('2026-10-01'), end: new Date('2026-10-10') },
        ],
        budgetRange: { min: 400, max: 1200 },
        interestTags: ['beach', 'food'],
      },
      {
        user: { _id: 'u2', name: 'Bob' },
        availableDateRanges: [
          { start: new Date('2026-10-03'), end: new Date('2026-10-08') },
        ],
        budgetRange: { min: 500, max: 1500 },
        interestTags: ['beach', 'nightlife'],
      },
      {
        user: { _id: 'u3', name: 'Charlie' },
        availableDateRanges: [
          { start: new Date('2026-10-02'), end: new Date('2026-10-12') },
        ],
        budgetRange: { min: 300, max: 1000 },
        interestTags: ['beach', 'relaxation'],
      },
    ];

    // Date Overlap
    const dateResult = findDateOverlap(preferences);
    expect(dateResult.isCompleteOverlap).toBe(true);
    expect(dateResult.overlap).toBeDefined();
    // Intersect [Oct 1 - Oct 10], [Oct 3 - Oct 8], [Oct 2 - Oct 12] => [Oct 3 - Oct 8]
    expect(new Date(dateResult.overlap.start).toISOString().slice(0, 10)).toBe('2026-10-03');
    expect(new Date(dateResult.overlap.end).toISOString().slice(0, 10)).toBe('2026-10-08');
    expect(dateResult.overlap.days).toBe(6);

    // Budget Overlap: max(mins) = 500, min(maxes) = 1000
    const budgetResult = findBudgetOverlap(preferences);
    expect(budgetResult.isFeasible).toBe(true);
    expect(budgetResult.min).toBe(500);
    expect(budgetResult.max).toBe(1000);
  });

  // Test Case 2: Zero-overlap case (near-miss fallback)
  test('2. Zero-overlap case: falls back to largest near-miss window covering most members', () => {
    const preferences = [
      {
        user: { _id: 'u1', name: 'Alice' },
        availableDateRanges: [
          { start: new Date('2026-11-01'), end: new Date('2026-11-05') },
        ],
        budgetRange: { min: 300, max: 800 },
      },
      {
        user: { _id: 'u2', name: 'Bob' },
        availableDateRanges: [
          { start: new Date('2026-11-03'), end: new Date('2026-11-07') },
        ],
        budgetRange: { min: 300, max: 800 },
      },
      {
        user: { _id: 'u3', name: 'Charlie' },
        // Disjoint from Alice and Bob
        availableDateRanges: [
          { start: new Date('2026-11-20'), end: new Date('2026-11-25') },
        ],
        budgetRange: { min: 300, max: 800 },
      },
    ];

    const dateResult = findDateOverlap(preferences);
    expect(dateResult.isCompleteOverlap).toBe(false);
    expect(dateResult.nearMisses.length).toBeGreaterThan(0);
    // Near miss should cover Alice & Bob: Nov 3 - Nov 5 (3 days)
    const bestNearMiss = dateResult.nearMisses[0];
    expect(bestNearMiss.membersCoveredCount).toBe(2);
    expect(bestNearMiss.excludedMemberNames).toContain('Charlie');
    expect(new Date(bestNearMiss.start).toISOString().slice(0, 10)).toBe('2026-11-03');
    expect(new Date(bestNearMiss.end).toISOString().slice(0, 10)).toBe('2026-11-05');
  });

  // Test Case 3: Infeasible budget case
  test('3. Infeasible budget case: flags infeasibility and returns minimal drop recommendations', () => {
    const preferences = [
      {
        user: { _id: 'u1', name: 'Budget Traveler' },
        budgetRange: { min: 100, max: 400 },
      },
      {
        user: { _id: 'u2', name: 'Luxury Traveler' },
        budgetRange: { min: 800, max: 2000 },
      },
      {
        user: { _id: 'u3', name: 'Mid Traveler' },
        budgetRange: { min: 350, max: 900 },
      },
    ];

    const budgetResult = findBudgetOverlap(preferences);
    expect(budgetResult.isFeasible).toBe(false);
    expect(budgetResult.min).toBe(800); // max of mins
    expect(budgetResult.max).toBe(400); // min of maxes (800 > 400 => infeasible)

    expect(budgetResult.feasibleAlternatives.length).toBeGreaterThan(0);
    // Dropping either Luxury or Budget should resolve to a feasible sub-range
    const firstAlternative = budgetResult.feasibleAlternatives[0];
    expect(firstAlternative.dropsNeeded).toBe(1);
    expect(firstAlternative.resultingRange.min).toBeLessThanOrEqual(firstAlternative.resultingRange.max);
  });

  // Test Case 4: Tag-conflict case
  test('4. Tag conflict case: detects split when top clusters are within closeness threshold', () => {
    const preferences = [
      { interestTags: ['beach', 'relaxation'], availableDateRanges: [], budgetRange: { min: 200, max: 800 } },
      { interestTags: ['beach', 'food'], availableDateRanges: [], budgetRange: { min: 200, max: 800 } },
      { interestTags: ['mountains', 'hiking'], availableDateRanges: [], budgetRange: { min: 200, max: 800 } },
      { interestTags: ['mountains', 'adventure'], availableDateRanges: [], budgetRange: { min: 200, max: 800 } },
    ];

    // Beach has 2 votes, Mountains has 2 votes -> tie (diff = 0 <= TAG_CLOSENESS_THRESHOLD = 1)
    const conflicts = detectConflicts(preferences);
    expect(conflicts.length).toBeGreaterThan(0);
    const hasVibeSplit = conflicts.some((c) => c.toLowerCase().includes('vibe') || c.toLowerCase().includes('split'));
    expect(hasVibeSplit).toBe(true);
  });

  // Test Case 5: Normal itinerary generation case
  test('5. Normal itinerary generation: respects tag variety across consecutive days and stays within daily budget', () => {
    const destination = {
      _id: 'dest_1',
      name: 'Goa',
      country: 'India',
      avgCostPerDayUSD: 70,
    };

    const activities = [
      { _id: 'a1', destination: 'dest_1', name: 'Beach Kayaking', tags: ['beach'], estimatedCostUSD: 25 },
      { _id: 'a2', destination: 'dest_1', name: 'Sunset Cruise', tags: ['beach'], estimatedCostUSD: 30 },
      { _id: 'a3', destination: 'dest_1', name: 'Spice Plantation Tour', tags: ['culture'], estimatedCostUSD: 20 },
      { _id: 'a4', destination: 'dest_1', name: 'Old Goa Heritage Walk', tags: ['culture'], estimatedCostUSD: 15 },
      { _id: 'a5', destination: 'dest_1', name: 'Seafood Tasting Trail', tags: ['food'], estimatedCostUSD: 35 },
      { _id: 'a6', destination: 'dest_1', name: 'Club Night', tags: ['nightlife'], estimatedCostUSD: 40 },
    ];

    const dateRange = {
      start: new Date('2026-10-01'),
      end: new Date('2026-10-04'), // 4 days
    };

    const budgetRange = { min: 300, max: 800 }; // 800 / 4 = 200 daily max
    const groupTags = ['beach', 'culture', 'food', 'nightlife'];

    const itinerary = generateItinerary(destination, activities, dateRange, budgetRange, groupTags);

    expect(itinerary.tripDays).toBe(4);
    expect(itinerary.days.length).toBe(4);

    // Check each day's cost does not exceed daily budget limit
    itinerary.days.forEach((day) => {
      const dayCost = day.activities.reduce((sum, a) => sum + a.estimatedCostUSD, 0);
      expect(dayCost).toBeLessThanOrEqual(itinerary.dailyActivityBudget + 50); // within tolerance
    });

    // Verify consecutive day primary tag variety when multiple tags exist
    for (let i = 0; i < itinerary.days.length - 1; i++) {
      const curPrimaryTag = itinerary.days[i].activities[0]?.tags?.[0];
      const nextPrimaryTag = itinerary.days[i + 1].activities[0]?.tags?.[0];
      if (curPrimaryTag && nextPrimaryTag) {
        expect(curPrimaryTag).not.toBe(nextPrimaryTag);
      }
    }
  });

  // Destination ranking test
  test('rankDestinations correctly filters destinations over budget and awards bonuses for tag matches', () => {
    const preferences = [
      {
        interestTags: ['beach', 'nightlife'],
        destinationVotes: [{ destination: 'dest_cheap', score: 4 }],
      },
    ];

    const destinations = [
      {
        _id: 'dest_cheap',
        name: 'Goa',
        country: 'India',
        avgCostPerDayUSD: 50,
        tags: ['beach', 'nightlife'],
      },
      {
        _id: 'dest_expensive',
        name: 'Monaco',
        country: 'Monaco',
        avgCostPerDayUSD: 800,
        tags: ['luxury', 'nightlife'],
      },
    ];

    const ranked = rankDestinations(preferences, destinations, { min: 100, max: 500 }, 4);
    // Monaco costs 800*4 = 3200 > 500 => filtered out
    expect(ranked.some((r) => r.name === 'Goa')).toBe(true);
    expect(ranked[0].name).toBe('Goa');
    expect(ranked[0].tagOverlapScore).toBeGreaterThan(0);
  });
});
