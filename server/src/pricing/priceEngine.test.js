const {
  computeItineraryPrice,
  validateItinerary,
  swapHotel,
  toggleActivity,
} = require('./priceEngine');

describe('Itinera Price & Customization Engine Tests', () => {
  const hotelStandard = {
    _id: 'hotel_1',
    name: 'Beachside Villa',
    nightlyRateUSD: 150,
  };

  const hotelLuxury = {
    _id: 'hotel_2',
    name: 'Royal Palace Resort',
    nightlyRateUSD: 350,
  };

  const actSnorkel = {
    _id: 'act_1',
    name: 'Coral Reef Snorkeling',
    costUSD: 45,
  };

  const actCooking = {
    _id: 'act_2',
    name: 'Thai Culinary Masterclass',
    costUSD: 60,
  };

  const createSampleItinerary = () => ({
    days: [
      {
        dayNumber: 1,
        hotel: { ...hotelStandard },
        activities: [{ ...actSnorkel }],
      },
      {
        dayNumber: 2,
        hotel: { ...hotelStandard },
        activities: [{ ...actCooking }],
      },
      {
        dayNumber: 3,
        hotel: { ...hotelStandard },
        activities: [],
      },
    ],
  });

  // 1. Base price matches manual calculation
  test('1. Base price calculation accurately totals hotels and activities', () => {
    const itinerary = createSampleItinerary();
    // 3 nights @ $150 = $450
    // activities: $45 + $60 = $105
    // total: $450 + $105 = $555
    const breakdown = computeItineraryPrice(itinerary);

    expect(breakdown.hotelTotal).toBe(450);
    expect(breakdown.activitiesTotal).toBe(105);
    expect(breakdown.total).toBe(555);
  });

  // 2. Hotel swap changes total correctly
  test('2. Swapping hotel on a day updates hotelTotal and total correctly', () => {
    const itinerary = createSampleItinerary();
    // Swap Day 2 hotel from $150 to $350 (+$200)
    const updated = swapHotel(itinerary, 2, hotelLuxury);

    expect(updated.priceBreakdown.hotelTotal).toBe(150 + 350 + 150); // 650
    expect(updated.priceBreakdown.activitiesTotal).toBe(105);
    expect(updated.priceBreakdown.total).toBe(755);
    expect(updated.totalPriceUSD).toBe(755);
  });

  // 3. Activity toggle changes total correctly
  test('3. Toggling activity adds when absent and removes when present with live price recompute', () => {
    const itinerary = createSampleItinerary();
    const actSunsetCruise = { _id: 'act_3', name: 'Sunset Catamaran', costUSD: 80 };

    // Add activity to Day 1
    const withCruise = toggleActivity(itinerary, 1, actSunsetCruise);
    expect(withCruise.days[0].activities.length).toBe(2);
    expect(withCruise.priceBreakdown.activitiesTotal).toBe(105 + 80); // 185
    expect(withCruise.priceBreakdown.total).toBe(450 + 185); // 635

    // Toggle again -> should remove it
    const withoutCruise = toggleActivity(withCruise, 1, actSunsetCruise);
    expect(withoutCruise.days[0].activities.length).toBe(1);
    expect(withoutCruise.priceBreakdown.activitiesTotal).toBe(105);
    expect(withoutCruise.priceBreakdown.total).toBe(555);
  });

  // 4. Invalid cross-destination reference is rejected
  test('4. Validating itinerary rejects cross-destination hotel or activity references', () => {
    const validHotels = ['hotel_1', 'hotel_2'];
    const validActivities = ['act_1', 'act_2'];

    const validItinerary = createSampleItinerary();
    const validResult = validateItinerary(validItinerary, validHotels, validActivities);
    expect(validResult.isValid).toBe(true);

    // Cross-destination hotel injected into Day 3
    const badHotelItinerary = createSampleItinerary();
    badHotelItinerary.days[2].hotel = { _id: 'hotel_foreign_paris' };
    const badHotelResult = validateItinerary(badHotelItinerary, validHotels, validActivities);
    expect(badHotelResult.isValid).toBe(false);
    expect(badHotelResult.error).toContain('Invalid hotel reference');

    // Cross-destination activity injected into Day 1
    const badActItinerary = createSampleItinerary();
    badActItinerary.days[0].activities.push({ _id: 'act_foreign_alps' });
    const badActResult = validateItinerary(badActItinerary, validHotels, validActivities);
    expect(badActResult.isValid).toBe(false);
    expect(badActResult.error).toContain('Invalid activity reference');
  });
});
