import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sliders, CheckCircle2, Sparkles, Save, ArrowRight, Heart, Star, Compass } from 'lucide-react';
import { apiRequest } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { Destination } from '../types/index.ts';

const CATEGORY_OPTIONS = [
  'Heritage & Forts',
  'Culture & Royal Palaces',
  'Nature & Backwaters',
  'Himalayan Mountains',
  'Beaches & Coastal',
  'Spiritual Tourism',
  'Wildlife & Safari',
  'Food & Local Culinary',
];

const REGION_OPTIONS = ['North', 'South', 'West', 'East', 'North-East', 'Central'];
const BUDGET_OPTIONS = ['Budget Backpacker', 'Moderate & Comfort', 'Luxury Palace Stays'];
const GROUP_OPTIONS = ['Solo Explorer', 'Couple', 'Family with Kids', 'Group of Friends'];
const ACCOMMODATION_OPTIONS = ['Heritage Haveli', 'Luxury Palace Resort', 'Eco Sanctuary Lodge', 'Boutique City Hotel'];
const DURATION_OPTIONS = ['Weekend Escape (2-3 Days)', 'Standard Holiday (4-7 Days)', 'Grand Expedition (1-2 Weeks)'];

export const TravelPreferencesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'Heritage & Forts',
    'Culture & Royal Palaces',
  ]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>(['North', 'West']);
  const [budgetRange, setBudgetRange] = useState('Moderate & Comfort');
  const [travelGroupType, setTravelGroupType] = useState('Family with Kids');
  const [preferredActivities, setPreferredActivities] = useState('Sightseeing, Heritage walks, Street food');
  const [accommodationPreference, setAccommodationPreference] = useState('Heritage Haveli');
  const [preferredDuration, setPreferredDuration] = useState('Standard Holiday (4-7 Days)');

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [recommendations, setRecommendations] = useState<Destination[]>([]);

  useEffect(() => {
    if (user) {
      apiRequest('/preferences').then((res) => {
        if (res.success && res.data) {
          const pref = res.data;
          if (pref.preferredCategories) {
            setSelectedCategories(pref.preferredCategories.split(',').map((s: string) => s.trim()));
          }
          if (pref.preferredRegions) {
            setSelectedRegions(pref.preferredRegions.split(',').map((s: string) => s.trim()));
          }
          if (pref.budgetRange) setBudgetRange(pref.budgetRange);
          if (pref.travelGroupType) setTravelGroupType(pref.travelGroupType);
          if (pref.preferredActivities) setPreferredActivities(pref.preferredActivities);
          if (pref.accommodationPreferences) setAccommodationPreference(pref.accommodationPreferences);
          if (pref.preferredDuration) setPreferredDuration(pref.preferredDuration);
        }
      });

      // Load initial recommendations
      apiRequest('/recommendations').then((res) => {
        if (res.success && res.data) {
          setRecommendations(res.data);
        }
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <Sliders className="w-12 h-12 text-[#DDD0C8] mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-[#323232]">Personalize Your India Journey</h2>
        <p className="text-sm text-[#555555]">
          Sign in to save your preferred travel regions, accommodation styles, and receive transparent rule-based recommendations.
        </p>
        <Link
          to="/login"
          className="inline-block px-6 py-2.5 rounded-xl bg-[#323232] text-white text-xs font-bold hover:bg-black"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const toggleRegion = (reg: string) => {
    if (selectedRegions.includes(reg)) {
      setSelectedRegions(selectedRegions.filter((r) => r !== reg));
    } else {
      setSelectedRegions([...selectedRegions, reg]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await apiRequest('/preferences', {
        method: 'PUT',
        body: JSON.stringify({
          preferredCategories: selectedCategories.join(', '),
          preferredRegions: selectedRegions.join(', '),
          budgetRange,
          travelGroupType,
          preferredActivities,
          accommodationPreferences: accommodationPreference,
          preferredDuration,
        }),
      });

      if (res.success) {
        setSavedSuccess(true);
        // Refresh personalized recommendations
        const recRes = await apiRequest('/recommendations');
        if (recRes.success && recRes.data) {
          setRecommendations(recRes.data);
        }
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error saving preferences:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="bg-[#DDD0C8]/25 p-8 rounded-3xl border border-default">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#323232] text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
            <Sliders className="w-3.5 h-3.5 text-[#323232]" />
            <span>Travel Personalization</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#323232] mb-2">
            Your Travel Preferences
          </h1>
          <p className="text-sm text-[#555555] leading-relaxed">
            Customize your discovery preferences. We use transparent, rule-based matching to surface
            the destinations and heritage attractions best suited to your itinerary style.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-8 bg-white p-6 sm:p-8 rounded-3xl border border-default shadow-xs">
          {savedSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-semibold animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Travel preferences updated! Personalized recommendations refreshed below.</span>
            </div>
          )}

          {/* Preferred Categories */}
          <div>
            <label className="block text-sm font-bold text-[#323232] mb-2">
              Preferred Travel Interests & Categories
            </label>
            <p className="text-xs text-[#555555] mb-3">Select the themes you enjoy most when touring India:</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((cat) => {
                const active = selectedCategories.includes(cat);
                return (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      active
                        ? 'bg-[#323232] text-white border-[#323232]'
                        : 'bg-white text-[#555555] border-default hover:bg-gray-50'
                    }`}
                  >
                    {active ? '✓ ' : '+ '} {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preferred Regions */}
          <div>
            <label className="block text-sm font-bold text-[#323232] mb-2">
              Preferred Regions of India
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {REGION_OPTIONS.map((reg) => {
                const active = selectedRegions.includes(reg);
                return (
                  <button
                    type="button"
                    key={reg}
                    onClick={() => toggleRegion(reg)}
                    className={`p-3 rounded-xl text-xs font-semibold border text-center transition-all ${
                      active
                        ? 'bg-[#323232] text-white border-[#323232]'
                        : 'bg-white text-[#555555] border-default hover:bg-gray-50'
                    }`}
                  >
                    {reg} India
                  </button>
                );
              })}
            </div>
          </div>

          {/* Budget & Group Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#323232] mb-1">
                Travel Budget Style
              </label>
              <select
                value={budgetRange}
                onChange={(e) => setBudgetRange(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-default bg-white focus:outline-none focus:ring-2 focus:ring-[#323232]"
              >
                {BUDGET_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#323232] mb-1">
                Travel Group Type
              </label>
              <select
                value={travelGroupType}
                onChange={(e) => setTravelGroupType(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-default bg-white focus:outline-none focus:ring-2 focus:ring-[#323232]"
              >
                {GROUP_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Accommodation & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-[#323232] mb-1">
                Preferred Accommodation
              </label>
              <select
                value={accommodationPreference}
                onChange={(e) => setAccommodationPreference(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-default bg-white focus:outline-none focus:ring-2 focus:ring-[#323232]"
              >
                {ACCOMMODATION_OPTIONS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#323232] mb-1">
                Typical Trip Duration
              </label>
              <select
                value={preferredDuration}
                onChange={(e) => setPreferredDuration(e.target.value)}
                className="w-full px-3 py-2.5 text-xs rounded-xl border border-default bg-white focus:outline-none focus:ring-2 focus:ring-[#323232]"
              >
                {DURATION_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-[#323232] mb-1">
              Favorite Activities & Notes
            </label>
            <input
              type="text"
              value={preferredActivities}
              onChange={(e) => setPreferredActivities(e.target.value)}
              placeholder="e.g. Photography walks, temple architecture, yoga, boat rides..."
              className="w-full px-3 py-2.5 text-xs rounded-xl border border-default bg-white focus:outline-none focus:ring-2 focus:ring-[#323232]"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#323232] hover:bg-black text-white text-xs font-bold transition-all shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
            </button>
          </div>
        </form>

        {/* Live Recommendation Preview */}
        <div className="space-y-4">
          <div className="bg-[#DDD0C8]/25 p-6 rounded-3xl border border-default space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#323232]">
              <Sparkles className="w-4 h-4" />
              <span>Matching Preview</span>
            </div>
            <h3 className="font-serif text-lg font-bold text-[#323232]">
              Personalized Matches
            </h3>
            <p className="text-xs text-[#555555]">
              Here are current destinations that match your active interest criteria:
            </p>

            <div className="space-y-3 pt-2">
              {recommendations.slice(0, 4).map((dest) => (
                <div
                  key={dest.id}
                  className="bg-white p-3 rounded-2xl border border-default shadow-xs flex items-center gap-3"
                >
                  <img
                    src={dest.imageUrl}
                    alt={dest.name}
                    className="w-14 h-14 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif font-bold text-sm text-[#323232] truncate">
                        {dest.name}
                      </h4>
                      {dest.matchScore && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          {dest.matchScore}%
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#555555] line-clamp-1 mt-0.5">
                      {dest.recommendationReason}
                    </p>
                    <Link
                      to={`/destinations/${dest.slug}`}
                      className="text-[11px] font-bold text-[#323232] hover:underline inline-flex items-center gap-1 mt-1"
                    >
                      <span>Explore</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
