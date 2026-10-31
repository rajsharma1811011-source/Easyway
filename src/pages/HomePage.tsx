import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Compass,
  Star,
  Heart,
  Calendar,
  Building,
  UserCheck,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Mountain,
  Sun,
  Flame,
  Camera,
  ChevronRight,
  Sliders,
} from 'lucide-react';
import { apiRequest } from '../services/api.ts';
import { Destination, Attraction, Hotel, Guide } from '../types/index.ts';
import { IndiaMap, MapItem } from '../components/maps/IndiaMap.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { InquiryModal } from '../components/common/InquiryModal.tsx';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [heroSearch, setHeroSearch] = useState('');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [recommendations, setRecommendations] = useState<Destination[]>([]);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [favoritesMap, setFavoritesMap] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  // Inquiry modal state
  const [inquiryTarget, setInquiryTarget] = useState<{
    isOpen: boolean;
    type: 'HOTEL' | 'GUIDE';
    id?: string;
    name: string;
  }>({ isOpen: false, type: 'HOTEL', name: '' });

  useEffect(() => {
    async function loadHomeData() {
      setLoading(true);
      try {
        const [destRes, attrRes, hotelRes, guideRes, recRes] = await Promise.all([
          apiRequest('/destinations?limit=6'),
          apiRequest('/attractions?limit=6'),
          apiRequest('/hotels?limit=4'),
          apiRequest('/guides?limit=4'),
          apiRequest('/recommendations'),
        ]);

        if (destRes.success) setDestinations(destRes.data);
        if (attrRes.success) setAttractions(attrRes.data);
        if (hotelRes.success) setHotels(hotelRes.data);
        if (guideRes.success) setGuides(guideRes.data);
        if (recRes.success) {
          setRecommendations(recRes.data);
          setIsPersonalized(recRes.isPersonalized);
        }

        // If authenticated, load favorites map
        if (user) {
          const favRes = await apiRequest('/favorites');
          if (favRes.success && favRes.data) {
            const favMap: Record<string, boolean> = {};
            favRes.data.forEach((f: any) => {
              if (f.destinationId) favMap[`dest-${f.destinationId}`] = true;
              if (f.attractionId) favMap[`attr-${f.attractionId}`] = true;
              if (f.hotelId) favMap[`hotel-${f.hotelId}`] = true;
              if (f.guideId) favMap[`guide-${f.guideId}`] = true;
            });
            setFavoritesMap(favMap);
          }
        }
      } catch (err) {
        console.error('Home data load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadHomeData();
  }, [user]);

  const toggleFavorite = async (type: 'dest' | 'attr' | 'hotel' | 'guide', id: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    const key = `${type}-${id}`;
    const willBeFav = !favoritesMap[key];
    setFavoritesMap((prev) => ({ ...prev, [key]: willBeFav }));

    const body: any = {};
    if (type === 'dest') body.destinationId = id;
    if (type === 'attr') body.attractionId = id;
    if (type === 'hotel') body.hotelId = id;
    if (type === 'guide') body.guideId = id;

    await apiRequest('/favorites', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  };

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/destinations?search=${encodeURIComponent(heroSearch.trim())}`);
    }
  };

  // Convert top items for map preview
  const mapItems: MapItem[] = destinations.slice(0, 8).map((d) => ({
    id: d.id,
    name: d.name,
    category: 'destination',
    latitude: d.latitude,
    longitude: d.longitude,
    imageUrl: d.imageUrl,
    subtitle: `${d.state} • ${d.categories}`,
    link: `/destinations/${d.slug}`,
  }));

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[580px] lg:min-h-[640px] flex items-center justify-center bg-[#323232] text-white overflow-hidden">
        {/* Background Image with Dark Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1920&q=80"
            alt="Royal Palace of Rajasthan India"
            className="w-full h-full object-cover object-center opacity-35 scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#323232] via-[#323232]/60 to-transparent" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-12 pb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold uppercase tracking-wider text-[#DDD0C8] mb-6">
            <Sparkles className="w-4 h-4 text-[#DDD0C8]" />
            <span>Discover India Your Way</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
            Experience Incredible India, <br className="hidden sm:inline" />
            <span className="italic font-light text-[#DDD0C8]">Tailored To You.</span>
          </h1>

          <p className="text-base sm:text-lg text-gray-200 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Explore world heritage landmarks, serene backwaters, royal palaces, and tranquil retreats.
            Connect with verified local guides and craft memorable itineraries.
          </p>

          {/* Search Form Card */}
          <form
            onSubmit={handleHeroSearch}
            className="max-w-2xl mx-auto p-2 sm:p-2.5 rounded-2xl bg-white shadow-2xl flex flex-col sm:flex-row items-center gap-2 border border-default"
          >
            <div className="flex items-center w-full px-3 text-[#323232]">
              <MapPin className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
              <input
                type="text"
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                placeholder="Where in India would you like to explore? (e.g. Jaipur, Kerala...)"
                className="w-full py-2.5 text-sm text-[#323232] placeholder-gray-500 focus:outline-none bg-transparent"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#323232] hover:bg-black text-white text-sm font-bold tracking-wide transition-all shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
          </form>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-8">
            <Link
              to="/destinations"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs sm:text-sm font-semibold border border-white/20 transition-all flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-[#DDD0C8]" />
              <span>Explore Destinations</span>
            </Link>
            <Link
              to="/hotels"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs sm:text-sm font-semibold border border-white/20 transition-all flex items-center gap-2"
            >
              <Building className="w-4 h-4 text-[#DDD0C8]" />
              <span>Find Hotels</span>
            </Link>
            <Link
              to="/guides"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs sm:text-sm font-semibold border border-white/20 transition-all flex items-center gap-2"
            >
              <UserCheck className="w-4 h-4 text-[#DDD0C8]" />
              <span>Find Travel Guides</span>
            </Link>
            <Link
              to="/trips"
              className="px-4 py-2 rounded-xl bg-[#DDD0C8] hover:bg-[#c9baa0] text-[#323232] text-xs sm:text-sm font-bold transition-all flex items-center gap-2 shadow-xs"
            >
              <Calendar className="w-4 h-4 text-[#323232]" />
              <span>Plan a Trip</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. PERSONALIZED RECOMMENDATIONS SECTION */}
      {recommendations.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DDD0C8]/40 text-[#323232] text-xs font-bold uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#323232]" />
                <span>{isPersonalized ? 'Personalized For You' : 'Top Curated Recommendations'}</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#323232]">
                {isPersonalized ? 'Recommended Based on Your Travel Style' : 'Top Travel Highlights'}
              </h2>
              <p className="text-sm text-[#555555] mt-1">
                {isPersonalized
                  ? 'Matched with your saved preferences for travel regions, heritage categories, and interests.'
                  : 'Popular destinations loved by domestic and international travelers exploring India.'}
              </p>
            </div>
            {!isPersonalized && (
              <Link
                to="/preferences"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#323232] bg-[#DDD0C8]/30 hover:bg-[#DDD0C8]/60 px-4 py-2.5 rounded-xl transition-colors shrink-0"
              >
                <Sliders className="w-4 h-4" />
                <span>Set Your Travel Preferences</span>
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.slice(0, 3).map((dest) => (
              <div
                key={dest.id}
                className="group bg-white rounded-2xl border border-default overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={dest.imageUrl}
                      alt={dest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg text-xs font-bold text-[#323232] shadow-xs">
                      {dest.state}
                    </div>
                    <button
                      onClick={() => toggleFavorite('dest', dest.id)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-xs text-[#323232] hover:text-red-600 transition-colors shadow-xs"
                      aria-label="Save to favorites"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          favoritesMap[`dest-${dest.id}`] ? 'fill-red-600 text-red-600' : ''
                        }`}
                      />
                    </button>
                    {dest.matchScore && (
                      <div className="absolute bottom-3 right-3 bg-[#323232] text-white text-[11px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                        {dest.matchScore}% Match
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-serif text-xl font-bold text-[#323232] group-hover:text-black mb-1">
                      {dest.name}
                    </h3>
                    <p className="text-xs text-[#555555] line-clamp-2 mb-3 leading-relaxed">
                      {dest.description}
                    </p>

                    {dest.recommendationReason && (
                      <div className="p-2.5 rounded-xl bg-[#DDD0C8]/25 border border-[#DDD0C8] text-xs font-medium text-[#323232] leading-snug mb-2">
                        {dest.recommendationReason}
                      </div>
                    )}
                  </div>
                </div>

                <div className="px-5 pb-5 pt-0">
                  <Link
                    to={`/destinations/${dest.slug}`}
                    className="w-full py-2.5 rounded-xl bg-[#323232] hover:bg-black text-white text-xs font-bold text-center block transition-colors"
                  >
                    View Destination
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. POPULAR DESTINATIONS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-serif text-3xl font-bold text-[#323232]">
              Popular Indian Destinations
            </h2>
            <p className="text-sm text-[#555555] mt-1">
              Explore timeless monuments, ancient sacred rivers, emerald hills, and coastal wonders.
            </p>
          </div>
          <Link
            to="/destinations"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-[#323232] hover:underline"
          >
            <span>View All Destinations</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.slice(0, 6).map((dest) => (
            <div
              key={dest.id}
              className="group bg-white rounded-2xl border border-default overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative h-60 overflow-hidden">
                  <img
                    src={dest.imageUrl}
                    alt={dest.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-lg text-xs font-bold text-[#323232]">
                    {dest.state} • {dest.region}
                  </div>
                  <button
                    onClick={() => toggleFavorite('dest', dest.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-xs text-[#323232] hover:text-red-600 transition-colors shadow-xs"
                    aria-label="Save to favorites"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        favoritesMap[`dest-${dest.id}`] ? 'fill-red-600 text-red-600' : ''
                      }`}
                    />
                  </button>
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-[#323232]/85 text-white px-2.5 py-1 rounded-lg text-xs font-semibold backdrop-blur-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{dest.popularityScore?.toFixed(1) || '4.8'}</span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-serif text-xl font-bold text-[#323232] mb-1">
                    {dest.name}
                  </h3>
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {dest.categories.split(',').slice(0, 3).map((cat) => (
                      <span
                        key={cat}
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#DDD0C8]/40 text-[#323232]"
                      >
                        {cat.trim()}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-[#555555] line-clamp-2 leading-relaxed">
                    {dest.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <Link
                  to={`/destinations/${dest.slug}`}
                  className="w-full py-2.5 rounded-xl border border-default hover:bg-[#DDD0C8]/30 text-[#323232] text-xs font-bold text-center block transition-colors"
                >
                  Explore {dest.name}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            to="/destinations"
            className="inline-flex items-center gap-1 text-sm font-bold text-[#323232] underline"
          >
            <span>View All Destinations</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 4. POPULAR ATTRACTIONS SECTION */}
      <section className="bg-[#DDD0C8]/25 py-16 border-y border-default">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#555555] mb-1">
                Monuments, Forts & Nature
              </div>
              <h2 className="font-serif text-3xl font-bold text-[#323232]">
                Must-Visit Tourist Attractions
              </h2>
            </div>
            <Link
              to="/attractions"
              className="text-sm font-bold text-[#323232] hover:underline hidden sm:inline-flex items-center gap-1"
            >
              <span>Explore All Attractions</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {attractions.slice(0, 6).map((attr) => (
              <div
                key={attr.id}
                className="bg-white rounded-2xl border border-default overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={attr.imageUrl}
                      alt={attr.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className="absolute top-3 left-3 bg-[#323232] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md">
                      {attr.category}
                    </span>
                    <button
                      onClick={() => toggleFavorite('attr', attr.id)}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 text-[#323232] hover:text-red-600"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          favoritesMap[`attr-${attr.id}`] ? 'fill-red-600 text-red-600' : ''
                        }`}
                      />
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="text-xs text-[#555555] mb-1 font-medium">
                      In {attr.destination?.name || 'India'}
                    </div>
                    <h3 className="font-serif text-lg font-bold text-[#323232] mb-1 line-clamp-1">
                      {attr.name}
                    </h3>
                    <p className="text-xs text-[#555555] line-clamp-2 leading-relaxed">
                      {attr.description}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <Link
                    to={`/attractions/${attr.slug}`}
                    className="w-full py-2 rounded-xl bg-[#323232] hover:bg-black text-white text-xs font-semibold text-center block transition-colors"
                  >
                    View Attraction
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. RECOMMENDED HOTELS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#555555] mb-1">
              Accommodations & Heritage Haveli Stays
            </div>
            <h2 className="font-serif text-3xl font-bold text-[#323232]">
              Recommended Hotels & Heritage Stays
            </h2>
            <p className="text-xs text-[#555555] mt-1">
              Discover authentic stays and send direct accommodation inquiries.
            </p>
          </div>
          <Link
            to="/hotels"
            className="text-sm font-bold text-[#323232] hover:underline hidden sm:inline-flex items-center gap-1"
          >
            <span>View All Hotels</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {hotels.slice(0, 4).map((hotel) => (
            <div
              key={hotel.id}
              className="bg-white rounded-2xl border border-default overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={hotel.imageUrl}
                    alt={hotel.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 bg-white/95 text-[#323232] text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs">
                    {hotel.accommodationType}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-serif text-base font-bold text-[#323232] mb-1 line-clamp-1">
                    {hotel.name}
                  </h3>
                  <p className="text-xs text-[#555555] flex items-center gap-1 mb-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{hotel.address}</span>
                  </p>
                  <p className="text-xs text-[#555555] line-clamp-2 leading-relaxed mb-3">
                    {hotel.description}
                  </p>
                  <div className="text-[10px] text-[#555555] bg-gray-50 p-2 rounded-lg truncate">
                    ✨ {hotel.amenities}
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0 space-y-2">
                <Link
                  to={`/hotels/${hotel.slug}`}
                  className="w-full py-2 rounded-xl border border-default hover:bg-[#DDD0C8]/25 text-[#323232] text-xs font-bold text-center block transition-colors"
                >
                  View Details
                </Link>
                <button
                  onClick={() =>
                    setInquiryTarget({
                      isOpen: true,
                      type: 'HOTEL',
                      id: hotel.slug,
                      name: hotel.name,
                    })
                  }
                  className="w-full py-2 rounded-xl bg-[#323232] hover:bg-black text-white text-xs font-bold text-center block transition-colors"
                >
                  Send Inquiry
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. FEATURED TRAVEL GUIDES */}
      <section className="bg-[#DDD0C8]/15 py-16 border-y border-default">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#555555] mb-1">
                Local Storytellers & Cultural Historians
              </div>
              <h2 className="font-serif text-3xl font-bold text-[#323232]">
                Certified Indian Travel Guides
              </h2>
              <p className="text-xs text-[#555555] mt-1">
                Explore heritage architecture, culinary lanes, and nature trails with seasoned guides.
              </p>
            </div>
            <Link
              to="/guides"
              className="text-sm font-bold text-[#323232] hover:underline hidden sm:inline-flex items-center gap-1"
            >
              <span>View All Guides</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {guides.slice(0, 4).map((guide) => (
              <div
                key={guide.id}
                className="bg-white rounded-2xl border border-default p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between text-center"
              >
                <div>
                  <img
                    src={guide.profileImageUrl}
                    alt={guide.name}
                    className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-2 border-[#DDD0C8]"
                  />
                  <h3 className="font-serif text-lg font-bold text-[#323232]">
                    {guide.name}
                  </h3>
                  <div className="text-xs font-semibold text-[#555555] mb-2">
                    {guide.experienceYears} Years Experience • {guide.serviceRegions}
                  </div>
                  <p className="text-xs text-[#555555] line-clamp-2 leading-relaxed mb-3">
                    {guide.biography}
                  </p>
                  <div className="text-[11px] text-[#323232] bg-[#DDD0C8]/25 py-1 px-2 rounded-lg font-medium mb-4">
                    🗣️ {guide.languages}
                  </div>
                </div>

                <div className="space-y-2">
                  <Link
                    to={`/guides/${guide.id}`}
                    className="w-full py-2 rounded-xl border border-default hover:bg-[#DDD0C8]/25 text-[#323232] text-xs font-bold text-center block transition-colors"
                  >
                    View Profile
                  </Link>
                  <button
                    onClick={() =>
                      setInquiryTarget({
                        isOpen: true,
                        type: 'GUIDE',
                        id: guide.id,
                        name: guide.name,
                      })
                    }
                    className="w-full py-2 rounded-xl bg-[#323232] hover:bg-black text-white text-xs font-bold text-center block transition-colors"
                  >
                    Send Inquiry
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. INTERACTIVE MAP PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#555555] mb-1">
              Geographical Navigation
            </div>
            <h2 className="font-serif text-3xl font-bold text-[#323232]">
              Explore India by Interactive Map
            </h2>
            <p className="text-xs text-[#555555] mt-1">
              Click on any destination marker to preview tourist attractions, coordinates, and details.
            </p>
          </div>
          <Link
            to="/map"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#323232] text-white text-xs font-bold hover:bg-black transition-colors shrink-0"
          >
            <span>Open Full Explore Map</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <IndiaMap items={mapItems} height="420px" />
      </section>

      {/* 8. TRAVEL INSPIRATION SECTION */}
      <section id="inspiration" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-bold uppercase tracking-wider text-[#555555] mb-2">
            Inspiration & Categories
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#323232]">
            Travel India by Theme
          </h2>
          <p className="text-sm text-[#555555] mt-2">
            Whether you seek spiritual quietude along sacred rivers or adrenaline in the high Himalayas.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { name: 'Heritage', desc: 'Forts & Palaces', icon: Building, cat: 'Heritage' },
            { name: 'Nature', desc: 'Backwaters & Tea', icon: Mountain, cat: 'Nature' },
            { name: 'Spiritual', desc: 'Ghats & Ashrams', icon: Flame, cat: 'Spiritual' },
            { name: 'Beaches', desc: 'Goa & Andamans', icon: Sun, cat: 'Beaches' },
            { name: 'Culture', desc: 'Crafts & Music', icon: Compass, cat: 'Culture' },
            { name: 'Adventure', desc: 'Trekking & Rafting', icon: Camera, cat: 'Adventure' },
          ].map((theme) => {
            const Icon = theme.icon;
            return (
              <button
                key={theme.name}
                onClick={() => navigate(`/destinations?category=${theme.cat}`)}
                className="p-5 rounded-2xl bg-white border border-default hover:border-[#323232] hover:bg-[#DDD0C8]/20 transition-all text-center group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-[#DDD0C8]/40 text-[#323232] flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-[#323232] mb-0.5">{theme.name}</h4>
                <p className="text-[11px] text-[#555555]">{theme.desc}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Inquiry Modal */}
      <InquiryModal
        isOpen={inquiryTarget.isOpen}
        onClose={() => setInquiryTarget((prev) => ({ ...prev, isOpen: false }))}
        recipientType={inquiryTarget.type}
        recipientId={inquiryTarget.id}
        recipientName={inquiryTarget.name}
      />
    </div>
  );
};
