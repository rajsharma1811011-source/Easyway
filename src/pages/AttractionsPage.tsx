import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Compass, MapPin, ChevronLeft, ChevronRight, Heart, ArrowRight } from 'lucide-react';
import { apiRequest } from '../services/api.ts';
import { Attraction, Destination, Pagination } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';

export const AttractionsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 12, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'all';
  const destinationId = searchParams.get('destinationId') || 'all';
  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    // Fetch destinations for filter dropdown
    apiRequest('/destinations?limit=50').then((res) => {
      if (res.success && res.data) setDestinations(res.data);
    });
  }, []);

  useEffect(() => {
    async function loadAttractions() {
      setLoading(true);
      const query = new URLSearchParams();
      if (search) query.set('search', search);
      if (category !== 'all') query.set('category', category);
      if (destinationId !== 'all') query.set('destinationId', destinationId);
      query.set('page', page.toString());
      query.set('limit', '12');

      try {
        const res = await apiRequest(`/attractions?${query.toString()}`);
        if (res.success && res.data) {
          setAttractions(res.data);
          if (res.pagination) setPagination(res.pagination);
        }
      } catch (err) {
        console.error('Attractions load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAttractions();
  }, [search, category, destinationId, page]);

  const updateParam = (key: string, val: string) => {
    const next = new URLSearchParams(searchParams);
    if (val && val !== 'all') next.set(key, val);
    else next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-[#DDD0C8]/25 p-8 rounded-3xl border border-default">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#323232] text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
            <Compass className="w-3.5 h-3.5 text-[#323232]" />
            <span>Monuments & Marvels</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#323232] mb-3">
            Tourist Attractions of India
          </h1>
          <p className="text-sm text-[#555555] leading-relaxed">
            Discover historic UNESCO World Heritage fortresses, intricate marble temples,
            lush tea plantations, coastal lighthouses, and sacred river ghats.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-5 rounded-2xl border border-default shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => updateParam('search', e.target.value)}
              placeholder="Search attractions..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-default bg-white focus:outline-none focus:ring-2 focus:ring-[#323232]"
            />
          </div>

          <div>
            <select
              value={destinationId}
              onChange={(e) => updateParam('destinationId', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-default bg-white focus:outline-none focus:ring-2 focus:ring-[#323232]"
            >
              <option value="all">All Destinations</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.state})
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={category}
              onChange={(e) => updateParam('category', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-default bg-white focus:outline-none focus:ring-2 focus:ring-[#323232]"
            >
              <option value="all">All Attraction Categories</option>
              <option value="Monument">Monuments & Mausoleums</option>
              <option value="Fort">Historic Forts</option>
              <option value="Palace">Royal Palaces</option>
              <option value="Temple">Sacred Temples</option>
              <option value="Spiritual">Spiritual Ghats</option>
              <option value="Nature">Nature & Lakes</option>
              <option value="Beach">Beaches & Coastal</option>
              <option value="Adventure">Adventure Spots</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-12">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-72 bg-gray-100 animate-pulse rounded-2xl border border-default/50" />
          ))}
        </div>
      ) : attractions.length === 0 ? (
        <div className="p-16 rounded-3xl bg-white border border-default text-center space-y-4">
          <Compass className="w-12 h-12 text-[#DDD0C8] mx-auto" />
          <h3 className="font-serif text-2xl font-bold text-[#323232]">No Attractions Found</h3>
          <p className="text-sm text-[#555555]">Try clearing search keywords or selecting all categories.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {attractions.map((attr) => (
            <div
              key={attr.id}
              className="bg-white rounded-2xl border border-default overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={attr.imageUrl}
                    alt={attr.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute top-3 left-3 bg-[#323232] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-md">
                    {attr.category}
                  </span>
                </div>
                <div className="p-5">
                  <div className="text-xs text-[#555555] mb-1 font-semibold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span>In {attr.destination?.name || 'India'}</span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#323232] mb-1">
                    {attr.name}
                  </h3>
                  <p className="text-xs text-[#555555] line-clamp-3 leading-relaxed">
                    {attr.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0">
                <Link
                  to={`/attractions/${attr.slug}`}
                  className="w-full py-2.5 rounded-xl bg-[#323232] hover:bg-black text-white text-xs font-bold text-center block transition-colors"
                >
                  View Attraction Details
                </Link>
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
            className="p-2 rounded-xl border border-default bg-white text-[#323232] disabled:opacity-40"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-xs font-semibold px-4 text-[#323232]">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => updateParam('page', (pagination.page + 1).toString())}
            className="p-2 rounded-xl border border-default bg-white text-[#323232] disabled:opacity-40"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
