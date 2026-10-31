import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Building, MapPin, ChevronLeft, ChevronRight, Send, Star, ShieldCheck } from 'lucide-react';
import { apiRequest } from '../services/api.ts';
import { Hotel, Destination, Pagination } from '../types/index.ts';
import { InquiryModal } from '../components/common/InquiryModal.tsx';

export const HotelsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 12, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Inquiry modal state
  const [inquiryTarget, setInquiryTarget] = useState<{
    isOpen: boolean;
    type: 'HOTEL';
    id?: string;
    name: string;
  }>({ isOpen: false, type: 'HOTEL', name: '' });

  const search = searchParams.get('search') || '';
  const type = searchParams.get('type') || 'all';
  const destinationId = searchParams.get('destinationId') || 'all';
  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    apiRequest('/destinations?limit=50').then((res) => {
      if (res.success && res.data) setDestinations(res.data);
    });
  }, []);

  useEffect(() => {
    async function loadHotels() {
      setLoading(true);
      const query = new URLSearchParams();
      if (search) query.set('search', search);
      if (type !== 'all') query.set('type', type);
      if (destinationId !== 'all') query.set('destinationId', destinationId);
      query.set('page', page.toString());
      query.set('limit', '12');

      try {
        const res = await apiRequest(`/hotels?${query.toString()}`);
        if (res.success && res.data) {
          setHotels(res.data);
          if (res.pagination) setPagination(res.pagination);
        }
      } catch (err) {
        console.error('Hotels load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadHotels();
  }, [search, type, destinationId, page]);

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
            <Building className="w-3.5 h-3.5 text-[#323232]" />
            <span>Accommodations Discovery</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#323232] mb-3">
            Heritage Haveli & Luxury Stays
          </h1>
          <p className="text-sm text-[#555555] leading-relaxed">
            Discover royal palaces, tranquil backwater eco-resorts, and Himalayan lodges.
            Send direct booking and availability inquiries directly to property hosts.
          </p>
        </div>
      </div>

      {/* Scope Limitation Notice */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-800 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0" />
        <span>
          EasyWay is a travel discovery and inquiry platform. We facilitate direct property connections and itineraries without marking up room rates or charging booking commissions.
        </span>
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
              placeholder="Search hotel name, location..."
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
              value={type}
              onChange={(e) => updateParam('type', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-default bg-white focus:outline-none focus:ring-2 focus:ring-[#323232]"
            >
              <option value="all">All Accommodation Types</option>
              <option value="Luxury Palace">Luxury Palace</option>
              <option value="Heritage Haveli">Heritage Haveli / Palace</option>
              <option value="Boutique Resort">Boutique Resort</option>
              <option value="Eco Stay">Eco Resort & Sanctuary</option>
              <option value="Luxury Hotel">Heritage Grand Hotel</option>
            </select>
          </div>
        </div>
      </div>

      {/* Hotels Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-12">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-2xl border border-default/50" />
          ))}
        </div>
      ) : hotels.length === 0 ? (
        <div className="p-16 rounded-3xl bg-white border border-default text-center space-y-4">
          <Building className="w-12 h-12 text-[#DDD0C8] mx-auto" />
          <h3 className="font-serif text-2xl font-bold text-[#323232]">No Hotels Found</h3>
          <p className="text-sm text-[#555555]">Try clearing search parameters or choosing another destination.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((hotel) => (
            <div
              key={hotel.id}
              className="bg-white rounded-2xl border border-default overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={hotel.imageUrl}
                    alt={hotel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute top-3 left-3 bg-white/95 text-[#323232] text-[10px] font-bold px-2.5 py-1 rounded shadow-2xs">
                    {hotel.accommodationType}
                  </span>
                </div>
                <div className="p-5">
                  <div className="text-xs text-[#555555] mb-1 font-semibold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span>In {hotel.destination?.name || 'India'}</span>
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#323232] mb-1">
                    {hotel.name}
                  </h3>
                  <p className="text-xs text-[#555555] line-clamp-3 leading-relaxed mb-3">
                    {hotel.description}
                  </p>
                  <div className="text-[11px] text-[#555555] bg-gray-50 p-2.5 rounded-xl truncate font-medium">
                    ✨ {hotel.amenities}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                <Link
                  to={`/hotels/${hotel.slug}`}
                  className="py-2.5 rounded-xl border border-default hover:bg-[#DDD0C8]/25 text-[#323232] text-xs font-bold text-center transition-colors"
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
                  className="py-2.5 rounded-xl bg-[#323232] hover:bg-black text-white text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Inquiry</span>
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
