import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Compass, BookOpen, Calendar, ShieldCheck, ChevronDown, LogOut, User, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout, demoLogin } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleOpenAuth = (mode = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleSwitchUser = async (role) => {
    setUserDropdownOpen(false);
    await demoLogin(role);
    if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/packages');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-bone/95 backdrop-blur-md border-b border-bone-border transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand Logo & Main Nav */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-navy flex items-center justify-center text-marigold shadow-sm group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-2xl font-bold tracking-tight text-navy leading-none">
                  Itinera
                </span>
                <span className="text-[10px] tracking-widest uppercase font-semibold text-marigold-700">
                  DIY Holiday Packages
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/packages"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/packages'
                    ? 'text-marigold-700 font-semibold'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                Browse Packages
              </Link>
              <Link
                to="/destinations"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/destinations'
                    ? 'text-marigold-700 font-semibold'
                    : 'text-ink-muted hover:text-ink'
                }`}
              >
                Destinations
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/itineraries"
                    className={`text-sm font-medium transition-colors ${
                      location.pathname.startsWith('/itineraries')
                        ? 'text-marigold-700 font-semibold'
                        : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    My Itineraries
                  </Link>
                  <Link
                    to="/bookings"
                    className={`text-sm font-medium transition-colors ${
                      location.pathname === '/bookings'
                        ? 'text-marigold-700 font-semibold'
                        : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    My Bookings
                  </Link>
                </>
              )}
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-all ${
                    location.pathname === '/admin'
                      ? 'bg-marigold text-navy border-marigold'
                      : 'bg-navy/5 text-navy border-navy/20 hover:bg-navy/10'
                  }`}
                >
                  Admin Portal
                </Link>
              )}
            </nav>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-bone-light border border-bone-border hover:border-navy/40 transition-all text-left shadow-xs"
                >
                  {user?.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover border border-bone-border"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-navy text-bone flex items-center justify-center text-xs font-bold">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span className="hidden sm:inline text-xs font-semibold text-ink max-w-[120px] truncate">
                    {user?.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-ink-muted" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-60 bg-white rounded-2xl p-2 border border-bone-border shadow-card z-50 text-xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="px-3 py-2 border-b border-bone-border/60 mb-1">
                      <div className="font-semibold text-ink truncate">{user?.name}</div>
                      <div className="text-ink-muted text-[11px] truncate">{user?.email}</div>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-navy-50 text-navy border border-navy-100">
                        Role: {user?.role || 'traveler'}
                      </span>
                    </div>

                    <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-ink-subtle">
                      Quick Demo Switch:
                    </div>
                    <button
                      onClick={() => handleSwitchUser('traveler')}
                      className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between hover:bg-bone transition-colors ${
                        user?.email === 'traveler@itinera.com' ? 'font-semibold text-marigold-700' : 'text-ink'
                      }`}
                    >
                      <span>Samantha (Traveler)</span>
                      {user?.email === 'traveler@itinera.com' && <span className="w-1.5 h-1.5 rounded-full bg-marigold" />}
                    </button>
                    <button
                      onClick={() => handleSwitchUser('admin')}
                      className={`w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between hover:bg-bone transition-colors ${
                        user?.email === 'admin@itinera.com' ? 'font-semibold text-marigold-700' : 'text-ink'
                      }`}
                    >
                      <span>Curator (Admin Portal)</span>
                      {user?.email === 'admin@itinera.com' && <span className="w-1.5 h-1.5 rounded-full bg-marigold" />}
                    </button>

                    <div className="border-t border-bone-border/60 my-1 pt-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                          navigate('/');
                        }}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-sienna-700 hover:bg-sienna-50 flex items-center gap-2 transition-colors font-medium"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => handleOpenAuth('login')}
                  className="px-3.5 py-2 text-xs font-semibold text-navy hover:text-navy-700 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleOpenAuth('register')}
                  className="px-4 py-2 rounded-full bg-navy text-bone text-xs font-semibold hover:bg-navy-700 transition-colors shadow-sm"
                >
                  Create Account
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => navigate('/packages')}
      />
    </>
  );
}
