// Integration verification test for Itinera
const API_URL = 'http://localhost:5000/api';

async function runTest() {
  console.log('--- Starting Itinera End-to-End API Integration Test ---');

  // 1. Login
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'traveler@itinera.com', password: 'traveler123' }),
  });
  const loginData = await loginRes.json();
  if (!loginRes.ok) throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
  const token = loginData.token;
  console.log(`✅ 1. Logged in as: ${loginData.user.name} (${loginData.user.role})`);

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // 2. Fetch Packages
  const pkgsRes = await fetch(`${API_URL}/packages`);
  const pkgsData = await pkgsRes.json();
  const pkg = pkgsData.packages[0];
  console.log(`✅ 2. Picked Package: "${pkg.title}" (Base Price: $${pkg.basePriceUSD})`);

  // 3. Create Draft Itinerary from Package
  const itinRes = await fetch(`${API_URL}/itineraries`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ packageId: pkg._id }),
  });
  const itinData = await itinRes.json();
  if (!itinRes.ok) throw new Error(`Create itinerary failed: ${JSON.stringify(itinData)}`);
  const itinerary = itinData.itinerary;
  console.log(`✅ 3. Cloned Itinerary ID: ${itinerary._id} (Initial Price: $${itinerary.totalPriceUSD})`);

  // 4. Fetch available destination hotels
  const destId = pkg.destination._id;
  const hotelsRes = await fetch(`${API_URL}/hotels?destination=${destId}`);
  const hotelsData = await hotelsRes.json();
  const altHotel = hotelsData.hotels.find((h) => h._id !== pkg.defaultHotel._id) || hotelsData.hotels[0];
  console.log(`✅ 4. Swapping Day 1 Hotel to: ${altHotel.name} ($${altHotel.nightlyRateUSD}/night)`);

  // 5. Execute Hotel Swap
  const swapRes = await fetch(`${API_URL}/itineraries/${itinerary._id}/hotel`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({ dayNumber: 1, hotelId: altHotel._id }),
  });
  const swapData = await swapRes.json();
  if (!swapRes.ok) throw new Error(`Hotel swap failed: ${JSON.stringify(swapData)}`);
  console.log(`✅ 5. Hotel Swapped! Updated Total: $${swapData.totalPriceUSD} (Hotel Subtotal: $${swapData.priceBreakdown.hotelTotal})`);

  // 6. Fetch activities & toggle on Day 2
  const actsRes = await fetch(`${API_URL}/activities?destination=${destId}`);
  const actsData = await actsRes.json();
  const newAct = actsData.activities[0];
  console.log(`✅ 6. Toggling Activity: "${newAct.name}" (Cost: $${newAct.costUSD})`);

  const toggleRes = await fetch(`${API_URL}/itineraries/${itinerary._id}/activity`, {
    method: 'PATCH',
    headers: authHeaders,
    body: JSON.stringify({ dayNumber: 2, activityId: newAct._id }),
  });
  const toggleData = await toggleRes.json();
  if (!toggleRes.ok) throw new Error(`Activity toggle failed: ${JSON.stringify(toggleData)}`);
  console.log(`✅ 6. Activity Toggled! Updated Total: $${toggleData.totalPriceUSD} (Activities Subtotal: $${toggleData.priceBreakdown.activitiesTotal})`);

  // 7. Save Itinerary
  const saveRes = await fetch(`${API_URL}/itineraries/${itinerary._id}/save`, {
    method: 'POST',
    headers: authHeaders,
  });
  const saveData = await saveRes.json();
  console.log(`✅ 7. Itinerary Status: ${saveData.itinerary.status}`);

  // 8. Submit Booking Request
  const bookingRes = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      itineraryId: itinerary._id,
      travelDates: { start: '2026-11-20', end: '2026-11-26' },
      travelerCount: 2,
      contactPhone: '+1 (555) 456-7890',
      notes: 'Honeymoon couple, sunset orientation preferred.',
    }),
  });
  const bookingData = await bookingRes.json();
  if (!bookingRes.ok) throw new Error(`Booking failed: ${JSON.stringify(bookingData)}`);
  console.log(`✅ 8. Booking Request Confirmed! ID: ${bookingData.booking._id}, Status: ${bookingData.booking.status}`);

  // 9. Fetch user's bookings
  const myBookingsRes = await fetch(`${API_URL}/bookings/mine`, { headers: authHeaders });
  const myBookingsData = await myBookingsRes.json();
  console.log(`✅ 9. Verified Traveler Bookings Count: ${myBookingsData.bookings.length}`);

  console.log('\n🎉 ALL 9 END-TO-END INTEGRATION FLOWS PASSED FLAWLESSLY!');
}

runTest().catch((err) => {
  console.error('❌ Test Error:', err);
  process.exit(1);
});
