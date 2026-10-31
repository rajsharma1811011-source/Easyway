import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, Plus, ArrowRight, MapPin, Compass, Building, UserCheck } from 'lucide-react';
import { apiRequest } from '../services/api.ts';
import { Favorite } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { AddToTripModal } from '../components/common/AddToTripModal.tsx';

export const FavoritesPage: React.FC = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  // Add to trip modal state
  const [tripModal, setTripModal] = useState<{
    isOpen: boolean;
    destinationId?: string;
    attractionId?: string;
    itemName: string;
  }>({ isOpen: false, itemName: '' });

  const loadFavorites = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/favorites');
      if (res.success && res.data) {
        setFavorites(res.data);
      }
    } catch (err) {
      console.error('Favorites load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadFavorites();
    } else {
      setLoading(false);
    }
  }, [user]);

  const removeFavorite = async (id: string) => {
    setFavorites(favorites.filter((f) => f.id !== id));
    await apiRequest(`/favorites/${id}`, { method: 'DELETE' });
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <Heart className="w-12 h-12 text-[#DDD0C8] mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-[#323232]">Sign in to View Favorites</h2>
        <p className="text-sm text-[#555555]">
          Keep track of your dream Indian destinations, historic monuments, and heritage hotels across all your devices.
        </p>
        <Link
          to="/login"
          className="inline-block px-6 py-2.5 rounded-xl bg-[#323232] text-white text-xs font-bold hover:bg-black"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-[#DDD0C8]/25 p-8 rounded-3xl border border-default">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#323232] text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
            <Heart className="w-3.5 h-3.5 fill-red-600 text-red-600" />
            <span>Saved Highlights</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#323232] mb-2">
            Your Saved Favorites
          </h1>
          <p className="text-sm text-[#555555] leading-relaxed">
            Quickly access and organize places you love. Add them to your trips or open their detailed guides.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-2xl border border-default" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <div className="p-16 rounded-3xl bg-white border border-default text-center space-y-4">
          <Heart className="w-12 h-12 text-[#DDD0C8] mx-auto" />
          <h3 className="font-serif text-2xl font-bold text-[#323232]">No Favorites Saved Yet</h3>
          <p className="text-sm text-[#555555] max-w-md mx-auto">
            Browse our destinations, forts, and luxury stays, then click the heart icon on any card to save it here.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              to="/destinations"
              className="px-5 py-2.5 rounded-xl bg-[#323232] text-white text-xs font-bold hover:bg-black transition-colors"
            >
              Explore Destinations
            </Link>
            <Link
              to="/attractions"
              className="px-5 py-2.5 rounded-xl border border-default text-[#323232] text-xs font-bold hover:bg-gray-50 transition-colors"
            >
              Top Attractions
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((fav) => {
            const item = fav.destination || fav.attraction || fav.hotel || fav.guide;
            if (!item) return null;

            const isDest = !!fav.destination;
            const isAttr = !!fav.attraction;
            const isHotel = !!fav.hotel;
            const isGuide = !!fav.guide;

            let link = '#';
            let categoryLabel = 'Destination';
            if (isDest) {
              link = `/destinations/${(item as any).slug}`;
              categoryLabel = 'Destination';
            } else if (isAttr) {
              link = `/attractions/${(item as any).slug}`;
              categoryLabel = (item as any).category || 'Attraction';
            } else if (isHotel) {
              link = `/hotels/${(item as any).slug}`;
              categoryLabel = (item as any).accommodationType || 'Hotel';
            } else if (isGuide) {
              link = `/guides/${item.id}`;
              categoryLabel = 'Travel Guide';
            }

            const img = (item as any).imageUrl || (item as any).profileImageUrl;

            return (
              <div
                key={fav.id}
                className="bg-white rounded-2xl border border-default overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={img}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-white/95 text-[#323232] text-[10px] font-bold px-2 py-0.5 rounded shadow-2xs">
                      {categoryLabel}
                    </span>
                    <button
                      onClick={() => removeFavorite(fav.id)}
                      className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-red-600 hover:bg-red-50 transition-colors shadow-xs"
                      title="Remove from favorites"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-5">
                    <h3 className="font-serif text-lg font-bold text-[#323232] mb-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-[#555555] line-clamp-2 leading-relaxed">
                      {(item as any).description || (item as any).biography}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center gap-2">
                  <Link
                    to={link}
                    className="flex-1 py-2 rounded-xl border border-default hover:bg-[#DDD0C8]/25 text-[#323232] text-xs font-bold text-center transition-colors"
                  >
                    View Details
                  </Link>

                  {(isDest || isAttr) && (
                    <button
                      onClick={() =>
                        setTripModal({
                          isOpen: true,
                          destinationId: isDest ? item.id : undefined,
                          attractionId: isAttr ? item.id : undefined,
                          itemName: item.name,
                        })
                      }
                      className="p-2 rounded-xl bg-[#323232] hover:bg-black text-white transition-colors"
                      title="Add to Itinerary"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddToTripModal
        isOpen={tripModal.isOpen}
        onClose={() => setTripModal((prev) => ({ ...prev, isOpen: false }))}
        destinationId={tripModal.destinationId}
        attractionId={tripModal.attractionId}
        itemName={tripModal.itemName}
      />
    </div>
  );
};
