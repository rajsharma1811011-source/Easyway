import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Compass,
  MapPin,
  Search,
  Heart,
  Calendar,
  User as UserIcon,
  Menu,
  X,
  LogOut,
  Sliders,
  ShieldCheck,
  Building,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

interface NavbarProps {
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Destinations', path: '/destinations', icon: MapPin },
    { name: 'Attractions', path: '/attractions', icon: Compass },
    { name: 'Hotels', path: '/hotels', icon: Building },
    { name: 'Guides', path: '/guides', icon: UserCheck },
    { name: 'Explore Map', path: '/map', icon: MapPin },
    { name: 'Trip Planner', path: '/trips', icon: Calendar },
    { name: 'Favorites', path: '/favorites', icon: Heart },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-default shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#323232] rounded-lg"
          >
            <div className="w-10 h-10 rounded-xl bg-[#323232] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5 text-[#DDD0C8]" />
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-[#323232] block leading-none">
                EasyWay
              </span>
              <span className="text-[10px] tracking-wider uppercase font-semibold text-[#555555] block mt-1">
                Discover India
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-[#DDD0C8]/40 text-[#323232] font-semibold'
                      : 'text-[#555555] hover:text-[#323232] hover:bg-gray-100/70'
                  }`
                }
              >
                <span>{link.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search shortcut button */}
            <button
              onClick={onOpenSearch}
              aria-label="Search destinations, attractions and hotels"
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-default bg-[#DDD0C8]/15 hover:bg-[#DDD0C8]/30 text-[#323232] transition-colors cursor-pointer"
            >
              <Search className="w-4 h-4 text-[#555555]" />
              <span className="hidden md:inline text-xs text-[#555555]">Search India...</span>
              <kbd className="hidden sm:inline-flex text-[10px] bg-white border border-default px-1.5 py-0.5 rounded text-gray-500 font-mono shadow-xs">
                ⌘K
              </kbd>
            </button>

            {/* Authenticated user menu vs Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg border border-default hover:border-[#323232]/40 transition-colors bg-white focus:outline-none"
                  aria-expanded={userDropdownOpen}
                >
                  <div className="w-8 h-8 rounded-full bg-[#323232] text-white flex items-center justify-center text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-[#323232] max-w-[90px] truncate hidden sm:inline">
                    {user.name.split(' ')[0]}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-default py-2 z-50 divide-y divide-gray-100"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-3 bg-[#DDD0C8]/15">
                      <p className="text-sm font-semibold text-[#323232]">{user.name}</p>
                      <p className="text-xs text-[#555555] truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-[#323232] text-white">
                        {user.role}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/preferences"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#323232] hover:bg-[#DDD0C8]/25 transition-colors"
                      >
                        <Sliders className="w-4 h-4 text-[#555555]" />
                        <span>Travel Preferences</span>
                      </Link>

                      <Link
                        to="/trips"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#323232] hover:bg-[#DDD0C8]/25 transition-colors"
                      >
                        <Calendar className="w-4 h-4 text-[#555555]" />
                        <span>My Trips & Itineraries</span>
                      </Link>

                      <Link
                        to="/favorites"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-[#323232] hover:bg-[#DDD0C8]/25 transition-colors"
                      >
                        <Heart className="w-4 h-4 text-[#555555]" />
                        <span>Saved Favorites</span>
                      </Link>

                      {user.role === 'ADMIN' && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm font-semibold text-[#323232] bg-[#DDD0C8]/30 hover:bg-[#DDD0C8]/50 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4 text-[#323232]" />
                          <span>Admin Dashboard</span>
                        </Link>
                      )}
                    </div>

                    <div className="py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3 py-2 text-sm font-semibold text-[#323232] hover:bg-[#DDD0C8]/30 rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-[#323232] hover:bg-black rounded-lg transition-colors shadow-xs"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-[#323232] hover:bg-gray-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-default px-4 pt-2 pb-6 space-y-1 shadow-lg animate-in slide-in-from-top duration-200">
          <div className="pb-3 border-b border-default/50 mb-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSearch();
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg bg-[#DDD0C8]/25 text-[#323232] text-left font-medium"
            >
              <Search className="w-4 h-4 text-[#555555]" />
              <span>Search destinations, attractions, hotels...</span>
            </button>
          </div>

          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#DDD0C8]/40 text-[#323232] font-semibold'
                      : 'text-[#555555] hover:text-[#323232] hover:bg-gray-50'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{link.name}</span>
              </NavLink>
            );
          })}

          {user && (
            <div className="pt-3 border-t border-default/50 space-y-1">
              <Link
                to="/preferences"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[#323232]"
              >
                <Sliders className="w-4 h-4" />
                <span>Travel Preferences</span>
              </Link>
              {user.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold text-[#323232] bg-[#DDD0C8]/30"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Dashboard</span>
                </Link>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 text-left font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out ({user.name})</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
