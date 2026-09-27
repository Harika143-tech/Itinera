/**
 * Itinera - Pricing & Customization Engine
 * 
 * Never trusts client-sent prices; strictly recalculates server-side.
 * 
 * 1. computeItineraryPrice(itinerary)
 *    Computes hotelTotal, activitiesTotal, and total.
 * 2. validateItinerary(itinerary, validHotelIds, validActivityIds)
 *    Ensures hotels and activities match the package's destination.
 * 3. swapHotel(itinerary, dayNumber, newHotel)
 *    Swaps a day's hotel, recomputes price, returns updated itinerary.
 * 4. toggleActivity(itinerary, dayNumber, activity)
 *    Adds or removes an activity for that day, recomputes price, returns updated itinerary.
 */

function getId(obj) {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  if (obj._id) return obj._id.toString();
  if (obj.id) return obj.id.toString();
  return obj.toString();
}

/**
 * 1. computeItineraryPrice
 * hotelTotal: sum of hotel nightly rates across all days
 * activitiesTotal: sum of all selected activities' costs
 */
function computeItineraryPrice(itinerary) {
  if (!itinerary || !Array.isArray(itinerary.days)) {
    return { hotelTotal: 0, activitiesTotal: 0, total: 0 };
  }

  let hotelTotal = 0;
  let activitiesTotal = 0;

  for (const day of itinerary.days) {
    // Hotel nightly rate
    const hotelRate = Number(day.hotel?.nightlyRateUSD ?? 0);
    hotelTotal += hotelRate;

    // Activities for the day
    if (Array.isArray(day.activities)) {
      for (const act of day.activities) {
        const actCost = Number(act?.costUSD ?? 0);
        activitiesTotal += actCost;
      }
    }
  }

  const total = hotelTotal + activitiesTotal;

  return {
    hotelTotal,
    activitiesTotal,
    total,
  };
}

/**
 * 2. validateItinerary
 * Validates that every day references a hotel and activities belonging to the valid destination catalog.
 */
function validateItinerary(itinerary, validHotelIds = [], validActivityIds = []) {
  if (!itinerary || !Array.isArray(itinerary.days)) {
    return { isValid: false, error: 'Itinerary days array is required' };
  }

  const hotelIdSet = new Set(validHotelIds.map(getId));
  const activityIdSet = new Set(validActivityIds.map(getId));

  for (const day of itinerary.days) {
    const hotelId = getId(day.hotel);
    if (!hotelId || (hotelIdSet.size > 0 && !hotelIdSet.has(hotelId))) {
      return {
        isValid: false,
        error: `Invalid hotel reference on Day ${day.dayNumber}: Hotel does not belong to destination`,
      };
    }

    if (Array.isArray(day.activities)) {
      for (const act of day.activities) {
        const actId = getId(act);
        if (!actId || (activityIdSet.size > 0 && !activityIdSet.has(actId))) {
          return {
            isValid: false,
            error: `Invalid activity reference on Day ${day.dayNumber}: Activity does not belong to destination`,
          };
        }
      }
    }
  }

  return { isValid: true };
}

/**
 * 3. swapHotel
 * Replaces the hotel for that day, recomputes price, and returns updated itinerary.
 */
function swapHotel(itinerary, dayNumber, newHotel) {
  if (!itinerary || !Array.isArray(itinerary.days)) {
    throw new Error('Invalid itinerary provided');
  }

  const day = itinerary.days.find((d) => d.dayNumber === Number(dayNumber));
  if (!day) {
    throw new Error(`Day ${dayNumber} not found in itinerary`);
  }

  day.hotel = newHotel;

  const breakdown = computeItineraryPrice(itinerary);
  itinerary.priceBreakdown = breakdown;
  itinerary.totalPriceUSD = breakdown.total;

  return itinerary;
}

/**
 * 4. toggleActivity
 * Adds if absent, removes if present for that day, recomputes price.
 */
function toggleActivity(itinerary, dayNumber, activity) {
  if (!itinerary || !Array.isArray(itinerary.days)) {
    throw new Error('Invalid itinerary provided');
  }

  const day = itinerary.days.find((d) => d.dayNumber === Number(dayNumber));
  if (!day) {
    throw new Error(`Day ${dayNumber} not found in itinerary`);
  }

  if (!Array.isArray(day.activities)) {
    day.activities = [];
  }

  const targetId = getId(activity);
  const existingIdx = day.activities.findIndex((a) => getId(a) === targetId);

  if (existingIdx !== -1) {
    // Remove if present
    day.activities.splice(existingIdx, 1);
  } else {
    // Add if absent
    day.activities.push(activity);
  }

  const breakdown = computeItineraryPrice(itinerary);
  itinerary.priceBreakdown = breakdown;
  itinerary.totalPriceUSD = breakdown.total;

  return itinerary;
}

module.exports = {
  getId,
  computeItineraryPrice,
  validateItinerary,
  swapHotel,
  toggleActivity,
};
