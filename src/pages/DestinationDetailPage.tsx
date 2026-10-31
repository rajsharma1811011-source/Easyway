import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Clock,
  Heart,
  Star,
  Plus,
  Share2,
  Building,
  UserCheck,
  Compass,
  ArrowRight,
  Send,
  CheckCircle2,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { apiRequest } from '../services/api.ts';
import { Destination, Review } from '../types/index.ts';
import { IndiaMap, MapItem } from '../components/maps/IndiaMap.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { AddToTripModal } from '../components/common/AddToTripModal.tsx';
import { InquiryModal } from '../components/common/InquiryModal.tsx';

export const DestinationDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  // Review Form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Modals state
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [inquiryTarget, setInquiryTarget] = useState<{
    isOpen: boolean;
    type: 'HOTEL' | 'GUIDE';
    id?: string;
    name: string;
  }>({ isOpen: false, type: 'HOTEL', name: '' });

  const fetchDestination = async () => {
    setLoading(true);
    try {
      const res = await apiRequest(`/destinations/${slug}`);
      if (res.success && res.data) {
        setDestination(res.data);
      } else {
        setError(res.error || 'Destination not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch destination details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestination();
  }, [slug]);

  useEffect(() => {
    if (user && destination) {
      apiRequest('/favorites').then((res) => {
        if (res.success && res.data) {
          const found = res.data.some((f: any) => f.destinationId === destination.id);
          setIsFavorite(found);
        }
      });
    }
  }, [user, destination]);

  const toggleFavorite = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!destination) return;
    setIsFavorite(!isFavorite);
    await apiRequest('/favorites', {
      method: 'POST',
      body: JSON.stringify({ destinationId: destination.id }),
    });
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!destination || !comment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await apiRequest('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          destinationId: destination.id,
          rating,
          comment,
        }),
      });

      if (res.success) {
        setReviewSuccess(true);
        setComment('');
        fetchDestination();
      }
    } catch (err) {
      console.error('Review submit error:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 animate-pulse space-y-8">
        <div className="h-96 bg-gray-200 rounded-3xl" />
        <div className="h-40 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-[#323232]">Destination Not Found</h2>
        <p className="text-sm text-[#555555]">{error || 'The requested destination does not exist.'}</p>
        <Link
          to="/destinations"
          className="inline-block px-5 py-2.5 rounded-xl bg-[#323232] text-white text-xs font-semibold"
        >
          Back to All Destinations
        </Link>
      </div>
    );
  }

  // Construct map markers for destination + its attractions
  const mapItems: MapItem[] = [
    {
      id: destination.id,
      name: destination.name,
      category: 'destination',
      latitude: destination.latitude,
      longitude: destination.longitude,
      imageUrl: destination.imageUrl,
      subtitle: `${destination.state} • Destination Center`,
      link: `/destinations/${destination.slug}`,
    },
    ...(destination.attractions || []).map((a) => ({
      id: a.id,
      name: a.name,
      category: 'attraction' as const,
      latitude: a.latitude,
      longitude: a.longitude,
      imageUrl: a.imageUrl,
      subtitle: a.category,
      link: `/attractions/${a.slug}`,
    })),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Hero Visual Card */}
      <div className="relative h-[420px] sm:h-[500px] rounded-3xl overflow-hidden border border-default shadow-lg">
        <img
          src={destination.imageUrl}
          alt={destination.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold text-[#323232]">
              {destination.state}
            </span>
            <span className="bg-[#DDD0C8]/90 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold text-[#323232]">
              {destination.region} India
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleFavorite}
              className="p-3 rounded-full bg-white/90 backdrop-blur-md text-[#323232] hover:text-red-600 transition-colors shadow-sm"
              aria-label="Save to favorites"
            >
              <Heart
                className={`w-5 h-5 ${isFavorite ? 'fill-red-600 text-red-600' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* Hero Bottom Info & Action Buttons */}
        <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="text-white max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#DDD0C8] mb-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{destination.popularityScore?.toFixed(1) || '4.8'} Tourist Rating</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight mb-2">
              {destination.name}
            </h1>
            <div className="flex flex-wrap gap-2 text-xs">
              {destination.categories.split(',').map((cat) => (
                <span
                  key={cat}
                  className="px-2.5 py-1 rounded-md bg-white/20 backdrop-blur-md font-medium"
                >
                  {cat.trim()}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsTripModalOpen(true)}
              className="px-5 py-3 rounded-xl bg-white text-[#323232] font-bold text-xs sm:text-sm shadow-md hover:bg-[#DDD0C8] transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Trip</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Description & Quick Facts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Description */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-default shadow-xs space-y-4">
            <h2 className="font-serif text-2xl font-bold text-[#323232]">
              About {destination.name}
            </h2>
            <p className="text-sm text-[#555555] leading-relaxed whitespace-pre-line">
              {destination.description}
            </p>
          </section>

          {/* Attractions in this destination */}
          {destination.attractions && destination.attractions.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl font-bold text-[#323232]">
                  Must-See Attractions in {destination.name}
                </h2>
                <span className="text-xs text-[#555555]">
                  {destination.attractions.length} Attractions
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {destination.attractions.map((attr) => (
                  <div
                    key={attr.id}
                    className="bg-white rounded-2xl border border-default overflow-hidden p-4 flex gap-4 hover:shadow-md transition-shadow"
                  >
                    <img
                      src={attr.imageUrl}
                      alt={attr.name}
                      className="w-24 h-24 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#555555]">
                          {attr.category}
                        </span>
                        <h4 className="font-serif font-bold text-sm text-[#323232] line-clamp-1">
                          {attr.name}
                        </h4>
                        <p className="text-xs text-[#555555] line-clamp-2 mt-0.5">
                          {attr.description}
                        </p>
                      </div>
                      <Link
                        to={`/attractions/${attr.slug}`}
                        className="text-xs font-bold text-[#323232] hover:underline inline-flex items-center gap-1 mt-1"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Hotels in this destination */}
          {destination.hotels && destination.hotels.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl font-bold text-[#323232]">
                  Recommended Hotels & Stays
                </h2>
                <span className="text-xs text-[#555555]">
                  {destination.hotels.length} Stays Available
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {destination.hotels.map((h) => (
                  <div
                    key={h.id}
                    className="bg-white rounded-2xl border border-default p-4 flex flex-col justify-between hover:shadow-md transition-shadow"
                  >
                    <div>
                      <img
                        src={h.imageUrl}
                        alt={h.name}
                        className="w-full h-36 object-cover rounded-xl mb-3"
                      />
                      <span className="text-[10px] font-bold uppercase text-[#555555] bg-gray-100 px-2 py-0.5 rounded">
                        {h.accommodationType}
                      </span>
                      <h4 className="font-serif font-bold text-base text-[#323232] mt-1 line-clamp-1">
                        {h.name}
                      </h4>
                      <p className="text-xs text-[#555555] line-clamp-2 mt-1">
                        {h.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                      <Link
                        to={`/hotels/${h.slug}`}
                        className="flex-1 py-1.5 rounded-lg border border-default text-center text-xs font-semibold hover:bg-gray-50"
                      >
                        Details
                      </Link>
                      <button
                        onClick={() =>
                          setInquiryTarget({
                            isOpen: true,
                            type: 'HOTEL',
                            id: h.slug,
                            name: h.name,
                          })
                        }
                        className="flex-1 py-1.5 rounded-lg bg-[#323232] text-white text-center text-xs font-semibold hover:bg-black"
                      >
                        Inquire
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Travel Facts & Map */}
        <div className="space-y-6">
          {/* Quick Travel Facts */}
          <div className="bg-[#DDD0C8]/25 p-6 rounded-3xl border border-default space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#323232]">
              Destination Insights
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-[#323232] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[#323232]">Best Time to Visit</div>
                  <div className="text-[#555555]">
                    {destination.bestTimeToVisit || 'October through March'}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#323232] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[#323232]">Suggested Duration</div>
                  <div className="text-[#555555]">2 to 4 Days recommended</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#323232] shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-[#323232]">Coordinates</div>
                  <div className="text-[#555555]">
                    {destination.latitude.toFixed(4)}° N, {destination.longitude.toFixed(4)}° E
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsTripModalOpen(true)}
              className="w-full py-2.5 rounded-xl bg-[#323232] hover:bg-black text-white text-xs font-bold transition-colors"
            >
              Add {destination.name} to Itinerary
            </button>
          </div>

          {/* Interactive Mini Map */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#555555] mb-2">
              Location & Attractions Map
            </h4>
            <IndiaMap
              items={mapItems}
              center={[destination.latitude, destination.longitude]}
              zoom={11}
              height="300px"
            />
          </div>

          {/* Related Guides for this destination */}
          {destination.relatedGuides && destination.relatedGuides.length > 0 && (
            <div className="bg-white p-5 rounded-3xl border border-default space-y-3">
              <h3 className="font-serif text-lg font-bold text-[#323232]">
                Certified Guides in Region
              </h3>
              <div className="space-y-3">
                {destination.relatedGuides.slice(0, 2).map((g) => (
                  <div key={g.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={g.profileImageUrl}
                        alt={g.name}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-bold text-[#323232]">{g.name}</div>
                        <div className="text-gray-500 text-[11px]">{g.languages}</div>
                      </div>
                    </div>
                    <Link
                      to={`/guides/${g.id}`}
                      className="px-2.5 py-1 rounded bg-[#DDD0C8]/40 hover:bg-[#DDD0C8] font-semibold text-[#323232]"
                    >
                      Profile
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews & Traveler Experiences Section */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-default space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h3 className="font-serif text-2xl font-bold text-[#323232]">
              Traveler Reviews & Tips
            </h3>
            <p className="text-xs text-[#555555] mt-0.5">
              Authentic community experiences and suggestions for visiting {destination.name}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-[#DDD0C8]/25 px-4 py-2 rounded-xl text-sm font-bold text-[#323232]">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{destination.popularityScore?.toFixed(1) || '4.8'} / 5.0</span>
          </div>
        </div>

        {/* Existing Reviews List */}
        <div className="space-y-4">
          {destination.reviews && destination.reviews.length > 0 ? (
            destination.reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-2xl bg-gray-50/80 border border-gray-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#323232]">{rev.user.name}</span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= rev.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-[#555555] leading-relaxed">{rev.comment}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-500 italic py-2">
              No reviews yet. Be the first to share tips for {destination.name}!
            </p>
          )}
        </div>

        {/* Write a review form */}
        <div className="pt-4 border-t border-gray-100">
          <h4 className="font-serif font-bold text-base text-[#323232] mb-3">
            Share Your Experience
          </h4>
          {reviewSuccess ? (
            <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Thank you! Your review for {destination.name} has been published.</span>
            </div>
          ) : (
            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#323232] mb-1">
                  Your Rating
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      type="button"
                      key={num}
                      onClick={() => setRating(num)}
                      className="p-1 text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          num <= rating ? 'fill-amber-400' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs text-[#555555] ml-2">({rating} Stars)</span>
                </div>
              </div>

              <div>
                <textarea
                  required
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder={`Write your tips, best photo spots, or advice for travelers visiting ${destination.name}...`}
                  className="w-full p-3 text-xs rounded-xl border border-default bg-white focus:outline-none focus:ring-2 focus:ring-[#323232]"
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="px-5 py-2.5 rounded-xl bg-[#323232] hover:bg-black text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submittingReview ? 'Submitting...' : 'Post Review'}</span>
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Add To Trip Modal */}
      <AddToTripModal
        isOpen={isTripModalOpen}
        onClose={() => setIsTripModalOpen(false)}
        destinationId={destination.id}
        itemName={destination.name}
      />

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
