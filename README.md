# Itinera — DIY Holiday Packages & Custom Travel Planner

> A full-stack MERN DIY holiday-package platform inspired by **Pickyourtrail**. Browse curated destination packages, customize every day's hotel and activities, watch the price recalculate live, and submit booking requests with instant quotes.

---

## 🎨 Design Philosophy
- **Primary Brand Color:** Deep Indigo-Navy (`#1B2A4A`)
- **Single Accent Color:** Warm Marigold (`#D98A1F`)
- **Background:** Bone / Ivory (`#F2ECDF`)
- **Navy-Ink Text:** (`#16233A`)
- **Rating Chips & Tags:** Muted Teal (`#2F5D62`)
- **Typography:** `Newsreader` (Headlines, Serif) & `Sora` (Body, Sans)
- **Signature Feature:** The **Live Price Breakdown Panel** in the Itinerary Editor updates immediately upon any hotel upgrade or activity toggle via TanStack Query mutations — with strict server-side recalculation and zero page reloads.

---

## ⚡ Tech Stack
- **Client:** React (Vite), Tailwind CSS, `@tanstack/react-query`, `react-hook-form`, `lucide-react`, `react-router-dom`.
- **Server:** Node.js + Express, Mongoose, JWT authentication with bcrypt password hashing and role guards (`traveler` / `admin`), `express-validator`, `cors`, `dotenv`.
- **Database:** MongoDB (Local or MongoDB Atlas).
- **Pricing Engine Testing:** Isolated Jest unit tests with 100% pass rate.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+)
- MongoDB (running locally on port 27017, or a MongoDB Atlas URI in `server/.env`)

### 2. Backend Setup
```bash
cd server
npm install
npm run seed      # Seeds 4 destinations, 15 hotels, 21 activities, 4 packages, demo accounts
npm start         # Starts server on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd ../client
npm install
npm run dev       # Starts Vite dev server on http://localhost:5173
```

### 4. Running Unit & Integration Tests
```bash
cd ../server
npm test                         # Runs Jest unit test suites (100% pass)
node src/scripts/testIntegration.js  # Runs 9-step end-to-end API integration flow
```

---

## 🔑 Demo Accounts (Pre-seeded)
- **Traveler:** `traveler@itinera.com` / `traveler123`
- **Admin:** `admin@itinera.com` / `admin123`
*(A 1-click switcher is also provided directly in the navigation bar dropdown for effortless testing).*

---

## 🌟 Core Features & User Flows
1. **Search-First Landing Page:** Search packages by destination, duration, and budget.
2. **Catalog & Filters (`/packages`):** Filter by destination, hotel star rating (3★, 4★, 5★), budget slider, and nights.
3. **Package Detail (`/packages/:id`):** Highlights, included stays, day-by-day preview, and "Customize This Trip" action.
4. **DIY Itinerary Editor (`/itineraries/:id/edit`):**
   - Swap any night's hotel for alternative stays at that destination.
   - Toggle excursions & tours on/off per day.
   - **Persistent Live Price Panel:** Displays accommodation subtotal, excursions subtotal, and real-time grand total.
   - Save custom draft or submit a quote request.
5. **My Itineraries (`/itineraries`):** Track all saved and draft custom packages.
6. **My Bookings (`/bookings`):** Real-time status tracker for submitted holiday quotes (`pending`, `contacted`, `closed`).
7. **Admin Portal (`/admin`):** Manage destinations, hotels (rates & star ratings), activities, packages, and incoming booking requests.
