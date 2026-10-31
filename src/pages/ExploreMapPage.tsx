import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Compass, Building, UserCheck, ArrowRight, Layers } from 'lucide-react';
import { apiRequest } from '../services/api.ts';
import { IndiaMap, MapItem } from '../components/maps/IndiaMap.tsx';

export const ExploreMapPage: React.FC = () => {
  const [destinations, setDestinations] = useState<any[]>([]);
  const [attractions, setAttractions] = useState<any[]>([]);
  const [hotels, setHotels] = useState<any[]>([]);
  const [guides, setGuides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [showDestinations, setShowDestinations] = useState(true);
  const [showAttractions, setShowAttractions] = useState(true);
  const [showHotels, setShowHotels] = useState(true);
  const [showGuides, setShowGuides] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadAllMapData() {
      setLoading(true);
      try {
        const [destRes, attrRes, hotelRes, guideRes] = await Promise.all([
          apiRequest('/destinations?limit=50'),
          apiRequest('/attractions?limit=50'),
          apiRequest('/hotels?limit=50'),
          apiRequest('/guides?limit=50'),
        ]);

        if (destRes.success) setDestinations(destRes.data);
        if (attrRes.success) setAttractions(attrRes.data);
        if (hotelRes.success) setHotels(hotelRes.data);
        if (guideRes.success) setGuides(guideRes.data);
      } catch (err) {
        console.error('Map data load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAllMapData();
  }, []);

  // Filter map items
  const allItems: MapItem[] = [];

  if (showDestinations) {
    destinations.forEach((d) => {
      allItems.push({
        id: d.id,
        name: d.name,
        category: 'destination',
        latitude: d.latitude,
        longitude: d.longitude,
        imageUrl: d.imageUrl,
        subtitle: `${d.state} • ${d.categories}`,
        link: `/destinations/${d.slug}`,
      });
    });
  }

  if (showAttractions) {
    attractions.forEach((a) => {
      allItems.push({
        id: a.id,
        name: a.name,
        category: 'attraction',
        latitude: a.latitude,
        longitude: a.longitude,
        imageUrl: a.imageUrl,
        subtitle: `${a.category} • in ${a.destination?.name || 'India'}`,
        link: `/attractions/${a.slug}`,
      });
    });
  }

  if (showHotels) {
    hotels.forEach((h) => {
      allItems.push({
        id: h.id,
        name: h.name,
        category: 'hotel',
        latitude: h.latitude,
        longitude: h.longitude,
        imageUrl: h.imageUrl,
        subtitle: `${h.accommodationType} • ${h.address}`,
        link: `/hotels/${h.slug}`,
      });
    });
  }

  const filteredItems = search.trim()
    ? allItems.filter(
        (item) =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.subtitle?.toLowerCase().includes(search.toLowerCase())
      )
    : allItems;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#DDD0C8]/25 p-6 rounded-3xl border border-default">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#323232] text-xs font-bold uppercase tracking-wider mb-1 shadow-2xs">
            <Compass className="w-3.5 h-3.5 text-[#323232]" />
            <span>Geographic Discovery</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#323232]">
            Explore India Interactive Map
          </h1>
          <p className="text-xs text-[#555555]">
            Browse monuments, heritage stays, and destinations positioned across India.
          </p>
        </div>

        {/* Search */}
        <div className="w-full sm:w-72 relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search map markers..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-default bg-white focus:outline-none focus:ring-2 focus:ring-[#323232]"
          />
        </div>
      </div>

      {/* Layer Toggles Bar */}
      <div className="flex flex-wrap items-center gap-2 text-xs font-medium bg-white p-3 rounded-2xl border border-default">
        <span className="text-[#555555] flex items-center gap-1 font-bold mr-2">
          <Layers className="w-4 h-4" /> Marker Layers:
        </span>

        <button
          onClick={() => setShowDestinations(!showDestinations)}
          className={`px-3 py-1.5 rounded-xl border transition-colors flex items-center gap-1.5 ${
            showDestinations
              ? 'bg-[#323232] text-white border-[#323232]'
              : 'bg-gray-50 text-gray-500 border-default'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#DDD0C8]" />
          <span>Destinations ({destinations.length})</span>
        </button>

        <button
          onClick={() => setShowAttractions(!showAttractions)}
          className={`px-3 py-1.5 rounded-xl border transition-colors flex items-center gap-1.5 ${
            showAttractions
              ? 'bg-[#735E51] text-white border-[#735E51]'
              : 'bg-gray-50 text-gray-500 border-default'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-white" />
          <span>Attractions ({attractions.length})</span>
        </button>

        <button
          onClick={() => setShowHotels(!showHotels)}
          className={`px-3 py-1.5 rounded-xl border transition-colors flex items-center gap-1.5 ${
            showHotels
              ? 'bg-[#4A5568] text-white border-[#4A5568]'
              : 'bg-gray-50 text-gray-500 border-default'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-white" />
          <span>Hotels & Stays ({hotels.length})</span>
        </button>

        <span className="ml-auto text-xs text-gray-400">
          Showing <strong>{filteredItems.length}</strong> markers
        </span>
      </div>

      {/* Map & List Dual View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <IndiaMap items={filteredItems} height="650px" />
        </div>

        {/* Scrollable list of markers */}
        <div className="bg-white rounded-2xl border border-default p-4 h-[650px] flex flex-col shadow-xs">
          <h3 className="font-serif font-bold text-base text-[#323232] mb-3 px-1">
            Locations on Screen ({filteredItems.length})
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredItems.map((item) => (
              <a
                key={`${item.category}-${item.id}`}
                href={item.link}
                className="p-3 rounded-xl border border-default hover:bg-[#DDD0C8]/20 transition-all flex items-center gap-3 group block"
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-12 h-12 rounded-lg object-cover shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-gray-100 text-[#323232]">
                    {item.category}
                  </span>
                  <h4 className="font-serif font-bold text-sm text-[#323232] group-hover:underline truncate mt-0.5">
                    {item.name}
                  </h4>
                  <p className="text-[11px] text-[#555555] truncate">
                    {item.subtitle}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#323232] shrink-0" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
