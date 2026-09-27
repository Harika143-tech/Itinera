import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

import LandingPage from './pages/LandingPage';
import BrowsePackagesPage from './pages/BrowsePackagesPage';
import PackageDetailPage from './pages/PackageDetailPage';
import ItineraryEditorPage from './pages/ItineraryEditorPage';
import MyItinerariesPage from './pages/MyItinerariesPage';
import MyBookingsPage from './pages/MyBookingsPage';
import DestinationsPage from './pages/DestinationsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-2 text-ink-muted text-sm font-medium">
          <div className="w-2.5 h-2.5 rounded-full bg-navy animate-ping" />
          <span>Verifying traveler session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-bone text-ink">
      <Navbar />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/packages" element={<BrowsePackagesPage />} />
          <Route path="/packages/:id" element={<PackageDetailPage />} />
          <Route
            path="/itineraries/:id/edit"
            element={
              <ProtectedRoute>
                <ItineraryEditorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/itineraries"
            element={
              <ProtectedRoute>
                <MyItinerariesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/destinations" element={<DestinationsPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Global Footer */}
      <footer className="no-print bg-white/60 border-t border-bone-border py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-ink-muted">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-navy text-sm">Itinera</span>
            <span>— The DIY Holiday-Package Platform in the spirit of Pickyourtrail</span>
          </div>
          <p>© 2026 Itinera Inc. Tailor-made holidays with real-time DIY customization.</p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <MainLayout />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
