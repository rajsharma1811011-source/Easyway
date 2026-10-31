import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, MapPin, Compass, Building, UserCheck, ArrowRight, Loader2 } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    destinations: any[];
    attractions: any[];
    hotels: any[];
    guides: any[];
  }>({ destinations: [], attractions: [], hotels: [], guides: [] });

  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ destinations: [], attractions: [], hotels: [], guides: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ destinations: [], attractions: [], hotels: [], guides: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const res = await apiRequest(`/search?q=${encodeURIComponent(query.trim())}`);
        if (res.success && res.data) {
          setResults(res.data);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSelect = (url: string) => {
    onClose();
    navigate(url);
  };

  if (!isOpen) return null;

  const totalResults =
    results.destinations.length +
    results.attractions.length +
    results.hotels.length +
    results.guides.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-default overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-default bg-[#DDD0C8]/20">
          <Search className="w-5 h-5 text-[#323232] mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search destinations, forts, palaces, hotels, or guides..."
            className="w-full bg-transparent text-base text-[#323232] placeholder-gray-500 focus:outline-none"
            aria-label="Search"
          />
          {loading && <Loader2 className="w-5 h-5 text-[#555555] animate-spin shrink-0 mr-2" />}
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-gray-400 hover:text-[#323232] mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs font-semibold px-2 py-1 rounded bg-white text-[#323232] border border-default shadow-2xs hover:bg-gray-50"
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 divide-y divide-gray-100">
          {/* Quick suggestions when query is empty */}
          {!query && (
            <div className="py-6 px-2 text-center">
              <Compass className="w-10 h-10 text-[#DDD0C8] mx-auto mb-2" />
              <p className="text-sm font-semibold text-[#323232]">Quick India Exploration</p>
              <p className="text-xs text-[#555555] mb-4">Try searching popular states, monuments, or experiences</p>
              <div className="flex flex-wrap justify-center gap-2">
                {['Taj Mahal', 'Jaipur', 'Kerala Backwaters', 'Goa Beaches', 'Varanasi', 'Hampi', 'Udaipur'].map(
                  (tag) => (
                    <button
                      key={tag}
                      onClick={() => setQuery(tag)}
                      className="px-3 py-1.5 text-xs font-medium rounded-full bg-[#DDD0C8]/30 hover:bg-[#DDD0C8]/60 text-[#323232] transition-colors"
                    >
                      {tag}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* If searched and no results */}
          {query && !loading && totalResults === 0 && (
            <div className="py-10 text-center">
              <p className="text-sm font-semibold text-[#323232]">No matching results found for "{query}"</p>
              <p className="text-xs text-[#555555] mt-1">Try another destination name, attraction or state</p>
            </div>
          )}

          {/* Destinations Group */}
          {results.destinations.length > 0 && (
            <div className="py-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#555555] mb-2 px-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#323232]" /> Destinations
              </h3>
              <div className="space-y-1">
                {results.destinations.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => handleSelect(`/destinations/${d.slug}`)}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#DDD0C8]/25 text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={d.imageUrl}
                        alt={d.name}
                        className="w-10 h-10 rounded-lg object-cover border border-default"
                      />
                      <div>
                        <div className="text-sm font-semibold text-[#323232] group-hover:text-black">
                          {d.name}
                        </div>
                        <div className="text-xs text-[#555555]">
                          {d.state} • {d.region} India
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#323232] group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Attractions Group */}
          {results.attractions.length > 0 && (
            <div className="py-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#555555] mb-2 px-2 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#323232]" /> Attractions
              </h3>
              <div className="space-y-1">
                {results.attractions.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => handleSelect(`/attractions/${a.slug}`)}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#DDD0C8]/25 text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={a.imageUrl}
                        alt={a.name}
                        className="w-10 h-10 rounded-lg object-cover border border-default"
                      />
                      <div>
                        <div className="text-sm font-semibold text-[#323232] group-hover:text-black">
                          {a.name}
                        </div>
                        <div className="text-xs text-[#555555]">
                          {a.category} • in {a.destination?.name || 'India'}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#323232] group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Hotels Group */}
          {results.hotels.length > 0 && (
            <div className="py-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#555555] mb-2 px-2 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#323232]" /> Hotels & Stays
              </h3>
              <div className="space-y-1">
                {results.hotels.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => handleSelect(`/hotels/${h.slug}`)}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#DDD0C8]/25 text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={h.imageUrl}
                        alt={h.name}
                        className="w-10 h-10 rounded-lg object-cover border border-default"
                      />
                      <div>
                        <div className="text-sm font-semibold text-[#323232] group-hover:text-black">
                          {h.name}
                        </div>
                        <div className="text-xs text-[#555555]">
                          {h.accommodationType} • {h.destination?.name}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#323232] group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Guides Group */}
          {results.guides.length > 0 && (
            <div className="py-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#555555] mb-2 px-2 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#323232]" /> Travel Guides
              </h3>
              <div className="space-y-1">
                {results.guides.map((g) => (
                  <button
                    key={g.id}
                    onClick={() => handleSelect(`/guides/${g.id}`)}
                    className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#DDD0C8]/25 text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={g.profileImageUrl}
                        alt={g.name}
                        className="w-10 h-10 rounded-full object-cover border border-default"
                      />
                      <div>
                        <div className="text-sm font-semibold text-[#323232] group-hover:text-black">
                          {g.name}
                        </div>
                        <div className="text-xs text-[#555555]">
                          {g.serviceRegions} • {g.languages}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#323232] group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
