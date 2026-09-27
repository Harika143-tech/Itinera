require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Destination = require('../models/Destination');
const Hotel = require('../models/Hotel');
const Activity = require('../models/Activity');
const Package = require('../models/Package');
const Itinerary = require('../models/Itinerary');
const BookingRequest = require('../models/BookingRequest');

const connectDB = require('../config/db');
const { computeItineraryPrice } = require('../pricing/priceEngine');

const destinationsSeed = [
  {
    name: 'Maldives',
    country: 'Maldives',
    tags: ['beach', 'luxury', 'honeymoon', 'snorkeling'],
    heroNote: 'Overwater bungalows, vibrant coral atolls, and crystal turquoise lagoons.',
    description: 'An archipelago of nearly 1,200 coral islands in the Indian Ocean, famous for world-class diving, private overwater villas, and bespoke dining on sandbanks.',
    climate: '28°C - 31°C Tropical Year-round',
    bestSeason: 'November to April',
    hotels: [
      {
        name: 'Adaaran Club Rannalhi',
        starRating: 4,
        nightlyRateUSD: 240,
        roomType: 'Water Bungalow with Sun Deck',
        description: 'Set on the tip of South Male Atoll with direct staircase into crystalline turquoise waters.',
        amenities: ['Direct Lagoon Access', 'All-Inclusive Dine', 'Spa', 'Snorkel Equipment'],
      },
      {
        name: 'Anantara Veli Maldives Resort',
        starRating: 5,
        nightlyRateUSD: 580,
        roomType: 'Over Water Villa with Plunge Pool',
        description: 'Adults-only luxury sanctuary surrounded by serene white beaches and coral reefs.',
        amenities: ['Private Infinity Pool', 'Overwater Hammocks', 'Ayurvedic Spa', 'Catamaran Sailing'],
      },
      {
        name: 'Soneva Jani Water Retreat',
        starRating: 5,
        nightlyRateUSD: 1100,
        roomType: 'One Bedroom Water Retreat with Slide',
        description: 'Iconic ultra-luxury overwater villas featuring retractable roofs for stargazing and private water slides.',
        amenities: ['Water Slide into Lagoon', 'Retractable Roof', 'Private Butler', 'Cinema Paradiso'],
      },
      {
        name: 'Kaani Palm Beach Resort',
        starRating: 3,
        nightlyRateUSD: 95,
        roomType: 'Deluxe Sea View Balcony',
        description: 'Modern beachside hotel located right on Bikini Beach in Maafushi with infinity rooftop pool.',
        amenities: ['Rooftop Infinity Pool', 'Beachfront', 'Free Breakfast', 'Island Tours Desk'],
      },
    ],
    activities: [
      {
        name: 'Whale Shark & Manta Ray Snorkel Safari',
        costUSD: 75,
        durationHours: 4,
        tags: ['snorkeling', 'adventure'],
        description: 'Speedboat tour to South Ari Atoll protected marine area to swim alongside gentle ocean giants.',
      },
      {
        name: 'Private Sandbank Sunset Dinner & BBQ',
        costUSD: 140,
        durationHours: 3,
        tags: ['luxury', 'honeymoon', 'dining'],
        description: 'Exclusive boat ride to a deserted sandbank for a candlelit seafood barbecue under the stars.',
      },
      {
        name: 'Coral Garden & Turtle Reef Guided Snorkel',
        costUSD: 40,
        durationHours: 2.5,
        tags: ['snorkeling', 'nature'],
        description: 'Explore thriving shallow reefs with local marine guides spotting hawksbill turtles.',
      },
      {
        name: 'Sunset Dolphin Cruise by Traditional Dhoni',
        costUSD: 45,
        durationHours: 2,
        tags: ['relaxation', 'nature'],
        description: 'Sail into golden hour on a wooden Maldivian vessel while pods of spinner dolphins leap alongside.',
      },
      {
        name: 'Scuba Diving Discovery for Beginners',
        costUSD: 90,
        durationHours: 3,
        tags: ['adventure', 'diving'],
        description: 'PADI instructor guided dive exploring dramatic undersea drop-offs and colorful sea fans.',
      },
      {
        name: 'Traditional Night Fishing & Catch Cook',
        costUSD: 35,
        durationHours: 2.5,
        tags: ['culture', 'dining'],
        description: 'Handline fishing under starlit skies; chefs prepare your fresh catch upon return.',
      },
    ],
  },
  {
    name: 'Bali',
    country: 'Indonesia',
    tags: ['beach', 'culture', 'wellness', 'adventure'],
    heroNote: 'Emerald rice terraces, clifftop temples, and serene wellness retreats.',
    description: 'The Island of the Gods combines mystical Hindu heritage, world-class beach clubs in Seminyak, lush jungle sanctuaries in Ubud, and volcanic trekking.',
    climate: '27°C - 30°C Warm & Balmy',
    bestSeason: 'April to October',
    hotels: [
      {
        name: 'The Haven Suites Canggu',
        starRating: 4,
        nightlyRateUSD: 145,
        roomType: 'Berawa Ocean Suite',
        description: 'Steps away from Berawa Beach with sunset infinity pool, bohemian cafes, and beach clubs.',
        amenities: ['Poolside Cabanas', 'Beach Access', 'Fitness Center', 'Artisan Breakfast'],
      },
      {
        name: 'Maya Ubud Resort & Spa',
        starRating: 5,
        nightlyRateUSD: 290,
        roomType: 'Petanu Valley Pool Villa',
        description: 'Dramatic secluded riverside villas nestled in the rainforest valley of central Bali.',
        amenities: ['Private Plunge Pool', 'Jungle Spa Pavilions', 'Yoga Shala', 'Riverfront Dining'],
      },
      {
        name: 'Alila Seminyak Luxury',
        starRating: 5,
        nightlyRateUSD: 360,
        roomType: 'Ocean View Club Suite',
        description: 'Contemporary beachfront resort in the heart of stylish Seminyak dining and nightlife.',
        amenities: ['Beachfront Infinity Pool', 'Rooftop Lounge', 'Daily Yoga', 'Butler Service'],
      },
      {
        name: 'Green Leaf Sanctuary Villas',
        starRating: 3,
        nightlyRateUSD: 65,
        roomType: 'Traditional Rice Field Cottage',
        description: 'Charming open-air wooden bungalows overlooking tranquil organic rice paddies in north Ubud.',
        amenities: ['Tropical Garden Pool', 'Organic Cafe', 'Bike Rentals', 'Daily Meditation'],
      },
    ],
    activities: [
      {
        name: 'Mount Batur Sunrise Volcano Hike & Hot Springs',
        costUSD: 45,
        durationHours: 6,
        tags: ['hiking', 'adventure'],
        description: 'Dawn climb to summit caldera overlooking lake clouds, followed by natural volcanic thermal soak.',
      },
      {
        name: 'Nusa Penida West Coast Island Explorer',
        costUSD: 55,
        durationHours: 8,
        tags: ['adventure', 'beach'],
        description: 'Speedboat transfer to visit dramatic Kelingking T-Rex cliff, Broken Beach, and Angel’s Billabong.',
      },
      {
        name: 'Ubud Farm-to-Table Cooking Masterclass',
        costUSD: 35,
        durationHours: 4,
        tags: ['culture', 'dining'],
        description: 'Tour morning spice bazaar, harvest organic herbs, and cook 7 traditional Balinese dishes.',
      },
      {
        name: 'Uluwatu Clifftop Sunset & Fire Kecak Dance',
        costUSD: 25,
        durationHours: 3,
        tags: ['culture'],
        description: 'Ancient coral temple perched 70 meters above crashing surf during hypnotic vocal chant.',
      },
      {
        name: 'Ayung River White Water Rafting Thrill',
        costUSD: 30,
        durationHours: 3.5,
        tags: ['adventure'],
        description: 'Paddle through hidden waterfalls, deep jungle gorges, and ancient carved rock cliffs.',
      },
      {
        name: 'Traditional Balinese Herbal Spa & Flower Bath',
        costUSD: 40,
        durationHours: 2,
        tags: ['wellness', 'relaxation'],
        description: 'Deep pressure massage with warm clove oils and aromatic frangipani petal soak.',
      },
    ],
  },
  {
    name: 'Swiss Alps (Interlaken & Lauterbrunnen)',
    country: 'Switzerland',
    tags: ['mountains', 'hiking', 'adventure', 'luxury'],
    heroNote: 'Glacial alpine peaks, cogwheel railways, and 72 roaring valley waterfalls.',
    description: 'A breathtaking high-altitude playground centered between Lake Thun and Lake Brienz, backed by the legendary Eiger, Mönch, and Jungfrau summits.',
    climate: '18°C Summer / -2°C Winter Alpine',
    bestSeason: 'June to September & Dec to March',
    hotels: [
      {
        name: 'Hotel Belvedere Grindelwald',
        starRating: 4,
        nightlyRateUSD: 320,
        roomType: 'Eiger View Superior Balcony',
        description: 'Family-run alpine retreat with panoramic balconies facing the famous Eiger North Face.',
        amenities: ['Eiger Mountain Balcony', 'Outdoor Sole Whirlpool', 'Alpine Spa', 'Gourmet Half-Board'],
      },
      {
        name: 'Victoria-Jungfrau Grand Hotel & Spa',
        starRating: 5,
        nightlyRateUSD: 690,
        roomType: 'Jungfrau View Grand Suite',
        description: 'Historic 150-year-old palace hotel with a 5,500 sq m Spa Nescens in downtown Interlaken.',
        amenities: ['5500m² Luxury Spa', 'Indoor Olympic Pool', 'Fine Dining', 'Private Limousine'],
      },
      {
        name: 'Lauterbrunnen Valley Chalet',
        starRating: 3,
        nightlyRateUSD: 165,
        roomType: 'Chalet Timber Room with Waterfall View',
        description: 'Classic wooden Swiss chalet facing the free-falling Staubbach waterfall.',
        amenities: ['Waterfall Views', 'Swiss Breakfast', 'Hiking Trails at Doorstep', 'Free Train Passes'],
      },
    ],
    activities: [
      {
        name: 'Jungfraujoch - Top of Europe Cogwheel Expedition',
        costUSD: 160,
        durationHours: 5,
        tags: ['mountains', 'adventure'],
        description: 'Ride historic mountain railway through the Eiger rock to Europe’s highest railway station (3,454m).',
      },
      {
        name: 'Lauterbrunnen 72 Waterfalls Scenic Valley Trek',
        costUSD: 20,
        durationHours: 4,
        tags: ['hiking', 'nature'],
        description: 'Walk beneath sheer 300m limestone cliffs visiting Staubbach and underground Trümmelbach glacial chutes.',
      },
      {
        name: 'Tandem Paragliding Over Interlaken & Twin Lakes',
        costUSD: 185,
        durationHours: 1.5,
        tags: ['adventure'],
        description: 'Launch from alpine mountain meadow and soar like an eagle with certified Swiss pilot.',
      },
      {
        name: 'Lake Brienz Turquoise Water Kayak Adventure',
        costUSD: 65,
        durationHours: 2.5,
        tags: ['nature', 'adventure'],
        description: 'Paddle crystalline glacier-fed waters past 12th-century Ringgenberg Castle cliffs.',
      },
      {
        name: 'Harder Kulm Funicular & Alpine Fondue Evening',
        costUSD: 75,
        durationHours: 3,
        tags: ['dining', 'culture'],
        description: 'Two-lake viewpoint bridge 1,322m above sea level accompanied by bubbling Gruyère fondue.',
      },
    ],
  },
  {
    name: 'Paris & The French Riviera',
    country: 'France',
    tags: ['culture', 'luxury', 'food', 'romance'],
    heroNote: 'Haute cuisine, iconic monuments, and sun-drenched Côte d’Azur glamour.',
    description: 'Experience Paris chic boulevards and museum treasures, then unwind along the French Riviera’s turquoise Mediterranean coves and hillside vineyards.',
    climate: '22°C - 26°C Mild Temperate',
    bestSeason: 'May to October',
    hotels: [
      {
        name: 'Le Relais Saint-Germain Paris',
        starRating: 4,
        nightlyRateUSD: 290,
        roomType: 'Left Bank Deluxe Heritage',
        description: '17th-century boutique sanctuary in the heart of bohemian Saint-Germain-des-Prés.',
        amenities: ['Gourmet Comptoir Dining', 'Literary Library', 'Concierge Service', 'Art Deco Styling'],
      },
      {
        name: 'Hôtel Regina Louvre',
        starRating: 5,
        nightlyRateUSD: 590,
        roomType: 'Eiffel Tower Prestige Suite',
        description: 'Haussmannian elegance directly overlooking the Tuileries Garden and Musée du Louvre.',
        amenities: ['Eiffel Tower View', 'Valet', 'English Bar', 'Marble Bathrooms'],
      },
      {
        name: 'CitizenM Paris Opera',
        starRating: 3,
        nightlyRateUSD: 175,
        roomType: 'Smart City King Room',
        description: 'Tech-forward boutique hotel with mood-lighting, XL king beds, and 24/7 barista canteen.',
        amenities: ['Smart Tablet Controls', '24/7 Barista Bar', 'Mood Lighting', 'Co-working Living Room'],
      },
    ],
    activities: [
      {
        name: 'Curated Louvre Masterpieces After-Hours Tour',
        costUSD: 65,
        durationHours: 2.5,
        tags: ['culture'],
        description: 'Skip long queues for guided highlights of Mona Lisa, Winged Victory, and Venus de Milo.',
      },
      {
        name: 'Sunset Seine River Champagne Dinner Cruise',
        costUSD: 95,
        durationHours: 2.5,
        tags: ['romance', 'dining'],
        description: 'Glass-canopy boat glides past illuminated Notre Dame and twinkling Eiffel Tower.',
      },
      {
        name: 'Le Marais Artisan Pastry, Cheese & Wine Walk',
        costUSD: 70,
        durationHours: 3.5,
        tags: ['food', 'culture'],
        description: 'Tasting trail through historic Jewish quarter sampling warm macarons, Comté cheese, and Chablis.',
      },
      {
        name: 'Versailles Grand Trianon & Musical Gardens',
        costUSD: 50,
        durationHours: 4,
        tags: ['culture', 'history'],
        description: 'Walk the Hall of Mirrors and royal gardens designed by André Le Nôtre for the Sun King.',
      },
    ],
  },
];

async function seedItinera() {
  try {
    await connectDB();
    console.log('[Itinera Seed] Clearing previous catalog collections...');

    await Destination.deleteMany({});
    await Hotel.deleteMany({});
    await Activity.deleteMany({});
    await Package.deleteMany({});
    await Itinerary.deleteMany({});
    await BookingRequest.deleteMany({});

    console.log('[Itinera Seed] Seeding Admin & Traveler users...');
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('admin123', salt);
    const travelerPasswordHash = await bcrypt.hash('traveler123', salt);

    let admin = await User.findOne({ email: 'admin@itinera.com' });
    if (!admin) {
      admin = await User.create({
        name: 'Itinera Curator (Admin)',
        email: 'admin@itinera.com',
        passwordHash: adminPasswordHash,
        role: 'admin',
        avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Admin&backgroundColor=D98A1F&textColor=16233A',
      });
    }

    let traveler = await User.findOne({ email: 'traveler@itinera.com' });
    if (!traveler) {
      traveler = await User.create({
        name: 'Samantha Reed',
        email: 'traveler@itinera.com',
        passwordHash: travelerPasswordHash,
        role: 'traveler',
        avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=Samantha&backgroundColor=1B2A4A&textColor=F2ECDF',
      });
    }

    console.log('[Itinera Seed] Seeding Destinations, Hotels, Activities, and Packages...');
    const seededPackages = [];

    for (const d of destinationsSeed) {
      const destination = await Destination.create({
        name: d.name,
        country: d.country,
        tags: d.tags,
        heroNote: d.heroNote,
        description: d.description,
        climate: d.climate,
        bestSeason: d.bestSeason,
      });

      // Seed Hotels
      const hotelDocs = d.hotels.map((h) => ({
        ...h,
        destination: destination._id,
      }));
      const createdHotels = await Hotel.insertMany(hotelDocs);

      // Seed Activities
      const actDocs = d.activities.map((a) => ({
        ...a,
        destination: destination._id,
      }));
      const createdActivities = await Activity.insertMany(actDocs);

      // Build 1-2 curated packages per destination
      // Default hotel: first 4-star hotel or first hotel
      const defaultHotel = createdHotels.find((h) => h.starRating === 4) || createdHotels[0];
      const defaultNights = d.name.includes('Maldives') ? 6 : 5;
      const defaultActivities = createdActivities.slice(0, 3);

      // Compute basePriceUSD using priceEngine formula
      const daysForPricing = [];
      for (let n = 1; n <= defaultNights; n++) {
        daysForPricing.push({
          dayNumber: n,
          hotel: defaultHotel,
          activities: n <= defaultActivities.length ? [defaultActivities[n - 1]] : [],
        });
      }
      const pricingBreakdown = computeItineraryPrice({ days: daysForPricing });

      const pkgTitle =
        d.name.includes('Maldives')
          ? '7D/6N Overwater Paradise & Coral Sanctuary'
          : d.name.includes('Bali')
          ? '6D/5N Tropical Wellness, Waterfalls & Reefs'
          : d.name.includes('Swiss')
          ? '6D/5N High Alpine Peaks & Valley Waterfalls'
          : '5D/4N Parisian Romance & Gastronomy Escape';

      const pkg = await Package.create({
        destination: destination._id,
        title: pkgTitle,
        defaultNights,
        defaultHotel: defaultHotel._id,
        defaultActivities: defaultActivities.map((a) => a._id),
        basePriceUSD: pricingBreakdown.total,
        ratingAvg: 4.9,
        ratingCount: 38,
        highlights: [
          'Handpicked 4-star luxury stays included',
          'Curated private island & cultural excursions',
          'Instant DIY hotel upgrades & activity toggles',
          '24/7 on-trip concierge assistance',
        ],
        createdBy: admin._id,
      });

      seededPackages.push(pkg);
    }

    // Seed a sample customized Itinerary & Booking for Samantha traveler
    console.log('[Itinera Seed] Seeding sample itinerary & booking for traveler...');
    const firstPkg = await Package.findById(seededPackages[0]._id)
      .populate('destination defaultHotel defaultActivities');

    const sampleDays = [];
    for (let dayNum = 1; dayNum <= firstPkg.defaultNights; dayNum++) {
      sampleDays.push({
        dayNumber: dayNum,
        city: firstPkg.destination.name,
        hotel: firstPkg.defaultHotel._id,
        activities: dayNum <= firstPkg.defaultActivities.length ? [firstPkg.defaultActivities[dayNum - 1]._id] : [],
      });
    }

    const samplePricing = computeItineraryPrice({
      days: sampleDays.map((d) => ({
        ...d,
        hotel: firstPkg.defaultHotel,
        activities: d.activities.map((actId) =>
          firstPkg.defaultActivities.find((a) => a._id.toString() === actId.toString())
        ),
      })),
    });

    const sampleItinerary = await Itinerary.create({
      user: traveler._id,
      package: firstPkg._id,
      destination: firstPkg.destination._id,
      days: sampleDays,
      totalPriceUSD: samplePricing.total,
      priceBreakdown: samplePricing,
      status: 'saved',
    });

    await BookingRequest.create({
      itinerary: sampleItinerary._id,
      user: traveler._id,
      travelDates: {
        start: new Date(Date.now() + 30 * 24 * 3600 * 1000),
        end: new Date(Date.now() + 36 * 24 * 3600 * 1000),
      },
      travelerCount: 2,
      contactPhone: '+1 (555) 234-8900',
      notes: 'Honeymoon trip — requested upper floor villa with sunset orientation if possible.',
      status: 'pending',
    });

    console.log('\n======================================================');
    console.log('✅ ITINERA SEED COMPLETED SUCCESSFULLY!');
    console.log('------------------------------------------------------');
    console.log('Demo Credentials:');
    console.log('  Traveler: traveler@itinera.com / traveler123');
    console.log('  Admin:    admin@itinera.com / admin123');
    console.log('Seeded:');
    console.log(`  - 4 Destinations with rich editorial notes`);
    console.log(`  - 15 Hotels with star ratings & nightly rates`);
    console.log(`  - 21 Activities with durations and pricing`);
    console.log(`  - 4 Packages with starting base prices`);
    console.log(`  - 1 Sample Saved Itinerary & Booking Request`);
    console.log('======================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('[Itinera Seed Error]:', err);
    process.exit(1);
  }
}

seedItinera();
