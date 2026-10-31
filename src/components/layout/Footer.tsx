import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Heart, MapPin, Mail, Shield, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#323232] text-white pt-16 pb-12 border-t border-[#444444]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-gray-700/60">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#323232]">
                <Compass className="w-5 h-5 text-[#323232]" />
              </div>
              <div>
                <span className="font-serif text-2xl font-bold tracking-tight text-white block">
                  EasyWay
                </span>
                <span className="text-[11px] tracking-wider uppercase font-semibold text-[#DDD0C8] block">
                  Discover India Your Way
                </span>
              </div>
            </Link>
            <p className="text-sm text-gray-300 leading-relaxed max-w-sm">
              Your premier India tourism discovery platform. Explore royal heritage, serene backwaters,
              Himalayan vistas, golden coastlines, and connect with trusted local travel guides.
            </p>
            <div className="flex items-center gap-4 text-xs text-[#DDD0C8]">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Authentic Information
              </span>
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> 16+ Curated Destinations
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold tracking-wider uppercase text-[#DDD0C8] mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li>
                <Link to="/destinations" className="hover:text-white transition-colors">
                  All Destinations
                </Link>
              </li>
              <li>
                <Link to="/attractions" className="hover:text-white transition-colors">
                  Top Attractions
                </Link>
              </li>
              <li>
                <Link to="/hotels" className="hover:text-white transition-colors">
                  Recommended Hotels
                </Link>
              </li>
              <li>
                <Link to="/guides" className="hover:text-white transition-colors">
                  Certified Local Guides
                </Link>
              </li>
              <li>
                <Link to="/map" className="hover:text-white transition-colors">
                  Interactive Explore Map
                </Link>
              </li>
            </ul>
          </div>

          {/* Travel Tools */}
          <div>
            <h4 className="text-xs font-bold tracking-wider uppercase text-[#DDD0C8] mb-4">
              Plan Your Trip
            </h4>
            <ul className="space-y-2.5 text-sm text-gray-300">
              <li>
                <Link to="/trips" className="hover:text-white transition-colors">
                  Trip Planner & Itinerary
                </Link>
              </li>
              <li>
                <Link to="/preferences" className="hover:text-white transition-colors">
                  Personalized Preferences
                </Link>
              </li>
              <li>
                <Link to="/favorites" className="hover:text-white transition-colors">
                  Saved Favorites
                </Link>
              </li>
              <li>
                <a href="#inspiration" className="hover:text-white transition-colors">
                  Travel Inspirations
                </a>
              </li>
              <li>
                <Link to="/api/docs" className="hover:text-white transition-colors">
                  REST API Docs
                </Link>
              </li>
            </ul>
          </div>

          {/* Travel Advisories */}
          <div>
            <h4 className="text-xs font-bold tracking-wider uppercase text-[#DDD0C8] mb-4">
              Tourist Support
            </h4>
            <p className="text-xs text-gray-400 mb-3 leading-relaxed">
              Incredible India Helpline:
              <br />
              <strong className="text-white font-mono">1800-11-1363</strong> (Toll Free, 24x7)
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              Emergency Services:
              <br />
              <strong className="text-white font-mono">112</strong> (National All-in-One)
            </p>
            <div className="pt-3">
              <span className="inline-block text-[11px] text-[#DDD0C8] bg-white/10 px-2.5 py-1 rounded-md">
                Government Tourism Guidelines Compliant
              </span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <p>© {new Date().getFullYear()} EasyWay. All rights reserved. Made for discovering India.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-white cursor-pointer transition-colors">Security Safeguards</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
