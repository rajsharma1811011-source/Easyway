import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  MapPin,
  Heart,
  Star,
  Grid,
  List,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { apiRequest } from '../services/api.ts';
import { Destination, Pagination } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';

export const DestinationsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 9, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favoritesMap, setFavoritesMap] = useState<Record<string, boolean>>({});

  // Query state derived from searchParams
  const search = searchParams.get('search') || '';
  const region = searchParams.get('region') || 'all';
  const category = searchParams.get('category') || 'all';
  const sort = searchParams.get('sort') || 'popularity';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const fetchDestinations = async () => {
    setLoading(true);
    const query = new URLSearchParams();
    if (search) query.set('search', search);
    if (region && region !== 'all') query.set('region', region);
    if (category && category !== 'all') query.set('category', category);
    if (sort) query.set('sort', sort);
    query.set('page', page.toString());
    query.set('limit', '9');

    try {
      const res = await apiRequest(`/destinations?${query.toString()}`);
      if (res.success && res.data) {
        setDestinations(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error('Destinations fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, [search, region, category, sort, page]);

  useEffect(() => {
    if (user) {
      apiRequest('/favorites').then((res) => {
        if (res.success && res.data) {
          const map: Record<string, boolean> = {};
          res.data.forEach((f: any) => {
            if (f.destinationId) map[f.destinationId] = true;
          });
          setFavoritesMap(map);
        }
      });
    }
  }, [user]);

  const updateParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    next.set('page', '1');
    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const toggleFavorite = async (id: string) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setFavoritesMap((prev) => ({ ...prev, [id]: !prev[id] }));
    await apiRequest('/favorites', {
      method: 'POST',
      body: JSON.stringify({ destinationId: id }),
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="bg-[#DDD0C8]/25 p-8 rounded-3xl border border-default">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#323232] text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
            <MapPin className="w-3.5 h-3.5 text-[#323232]" />
            <span>Discover India</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#323232] mb-3">
            Indian Destinations
          </h1>
          <p className="text-sm text-[#555555] leading-relaxed">
            From the Himalayan valleys of Himachal and Kashmir to the royal palaces of Rajasthan,
            sacred ghats along the Ganga, and tranquil tropical backwaters of Kerala.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-default shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => updateParam('search', e.target.value)}
              placeholder="Search destination, city, state..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-default bg-white focus:outline-none focus:ring-2 focus:ring-[#323232]"
            />
          </div>

          {/* Region Filter */}
          <div>
            <select
              value={region}
              onChange={(e) => updateParam('region', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-default bg-white focus:outline-none focus:ring-2 focus:ring-[#323232]"
            >
              <option value="all">All Regions of India</option>
              <option value="North">North India</option>
              <option value="South">South India</option>
              <option value="West">West India</option>
              <option value="East">East India</option>
              <option value="North-East">North-East India</option>
              <option value="Central">Central India</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={category}
              onChange={(e) => updateParam('category', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-default bg-white focus:outline-none focus:ring-2 focus:ring-[#323232]"
            >
              <option value="all">All Travel Categories</option>
              <option value="Heritage">Heritage & Forts</option>
              <option value="Culture">Culture & Arts</option>
              <option value="Nature">Nature & Mountains</option>
              <option value="Beaches">Beaches & Coastal</option>
              <option value="Spiritual">Spiritual & Ashrams</option>
              <option value="Adventure">Adventure & Treks</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-default bg-white focus:outline-none focus:ring-2 focus:ring-[#323232]"
            >
              <option value="popularity">Most Popular First</option>
              <option value="name">Alphabetical (A - Z)</option>
              <option value="recent">Recently Added</option>
            </select>
          </div>
        </div>

        {/* Filter bar footer with results count and reset */}
        <div className="flex flex-wrap items-center justify-between pt-2 border-t border-gray-100 gap-3 text-xs">
          <div className="text-[#555555]">
            Showing <strong className="text-[#323232]">{destinations.length}</strong> of{' '}
            <strong className="text-[#323232]">{pagination.total}</strong> destinations
          </div>

          <div className="flex items-center gap-3">
            {(search || region !== 'all' || category !== 'all' || sort !== 'popularity') && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs font-semibold text-[#555555] hover:text-[#323232]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Filters</span>
              </button>
            )}

            {/* Layout switch */}
            <div className="hidden sm:flex items-center border border-default rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 ${viewMode === 'grid' ? 'bg-[#323232] text-white' : 'text-[#555555] hover:bg-gray-100'}`}
                aria-label="Grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 ${viewMode === 'list' ? 'bg-[#323232] text-white' : 'text-[#555555] hover:bg-gray-100'}`}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results State */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-12">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-2xl border border-default/50" />
          ))}
        </div>
      ) : destinations.length === 0 ? (
        <div className="p-16 rounded-3xl bg-white border border-default text-center space-y-4">
          <MapPin className="w-12 h-12 text-[#DDD0C8] mx-auto" />
          <h3 className="font-serif text-2xl font-bold text-[#323232]">No Destinations Found</h3>
          <p className="text-sm text-[#555555] max-w-md mx-auto">
            We couldn't find destinations matching your filter criteria. Try adjusting or clearing your filters.
          </p>
          <button
            onClick={clearFilters}
            className="px-5 py-2.5 rounded-xl bg-[#323232] text-white text-xs font-semibold hover:bg-black transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((dest) => (
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
                    onClick={() => toggleFavorite(dest.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-xs text-[#323232] hover:text-red-600 transition-colors shadow-xs"
                    aria-label="Save to favorites"
                  >
                    <Heart
                      className={`w-4 h-4 ${favoritesMap[dest.id] ? 'fill-red-600 text-red-600' : ''}`}
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
                  <p className="text-xs text-[#555555] line-clamp-3 leading-relaxed">
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
      ) : (
        /* List View */
        <div className="space-y-4">
          {destinations.map((dest) => (
            <div
              key={dest.id}
              className="bg-white rounded-2xl border border-default p-4 sm:p-5 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row items-center gap-6"
            >
              <img
                src={dest.imageUrl}
                alt={dest.name}
                className="w-full sm:w-48 h-40 object-cover rounded-xl shrink-0"
              />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#555555]">
                    {dest.state} • {dest.region} India
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-[#323232]">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{dest.popularityScore?.toFixed(1) || '4.8'}</span>
                  </div>
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#323232]">{dest.name}</h3>
                <div className="flex flex-wrap gap-1.5">
                  {dest.categories.split(',').map((cat) => (
                    <span
                      key={cat}
                      className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#DDD0C8]/40 text-[#323232]"
                    >
                      {cat.trim()}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-[#555555] leading-relaxed line-clamp-2">
                  {dest.description}
                </p>
              </div>
              <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto shrink-0">
                <Link
                  to={`/destinations/${dest.slug}`}
                  className="flex-1 sm:w-36 py-2.5 rounded-xl bg-[#323232] hover:bg-black text-white text-xs font-bold text-center transition-colors"
                >
                  View Details
                </Link>
                <button
                  onClick={() => toggleFavorite(dest.id)}
                  className="p-2.5 rounded-xl border border-default hover:bg-gray-50 text-[#323232]"
                >
                  <Heart
                    className={`w-4 h-4 ${favoritesMap[dest.id] ? 'fill-red-600 text-red-600' : ''}`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            disabled={pagination.page <= 1}
            onClick={() => updateParam('page', (pagination.page - 1).toString())}
            className="p-2 rounded-xl border border-default bg-white text-[#323232] disabled:opacity-40 hover:bg-gray-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-semibold px-4 text-[#323232]">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => updateParam('page', (pagination.page + 1).toString())}
            className="p-2 rounded-xl border border-default bg-white text-[#323232] disabled:opacity-40 hover:bg-gray-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
