import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Compass,
  ArrowRight,
  Plus,
  Star,
  Send,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { apiRequest } from '../services/api.ts';
import { Attraction } from '../types/index.ts';
import { IndiaMap, MapItem } from '../components/maps/IndiaMap.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { AddToTripModal } from '../components/common/AddToTripModal.tsx';

export const AttractionDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();

  const [attraction, setAttraction] = useState<Attraction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);

  // Review state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const fetchAttraction = async () => {
    setLoading(true);
    try {
      const res = await apiRequest(`/attractions/${slug}`);
      if (res.success && res.data) {
        setAttraction(res.data);
      } else {
        setError(res.error || 'Attraction not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch attraction');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttraction();
  }, [slug]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !attraction || !comment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await apiRequest('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          attractionId: attraction.id,
          rating,
          comment,
        }),
      });

      if (res.success) {
        setReviewSuccess(true);
        setComment('');
        fetchAttraction();
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
        <div className="h-80 bg-gray-200 rounded-3xl" />
        <div className="h-40 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  if (error || !attraction) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-[#323232]">Attraction Not Found</h2>
        <p className="text-sm text-[#555555]">{error || 'The requested attraction does not exist.'}</p>
        <Link
          to="/attractions"
          className="inline-block px-5 py-2.5 rounded-xl bg-[#323232] text-white text-xs font-semibold"
        >
          Back to All Attractions
        </Link>
      </div>
    );
  }

  const mapItems: MapItem[] = [
    {
      id: attraction.id,
      name: attraction.name,
      category: 'attraction',
      latitude: attraction.latitude,
      longitude: attraction.longitude,
      imageUrl: attraction.imageUrl,
      subtitle: `${attraction.category} • ${attraction.address || ''}`,
      link: `/attractions/${attraction.slug}`,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Visual Header */}
      <div className="relative h-[380px] sm:h-[460px] rounded-3xl overflow-hidden border border-default shadow-lg">
        <img
          src={attraction.imageUrl}
          alt={attraction.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

        <div className="absolute top-6 left-6">
          <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold text-[#323232]">
            {attraction.category}
          </span>
        </div>

        <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="text-white max-w-2xl">
            {attraction.destination && (
              <Link
                to={`/destinations/${attraction.destination.slug}`}
                className="text-xs font-semibold text-[#DDD0C8] hover:underline flex items-center gap-1 mb-1"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>In {attraction.destination.name}, {attraction.destination.state}</span>
              </Link>
            )}
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight mb-2">
              {attraction.name}
            </h1>
            {attraction.address && (
              <p className="text-xs text-gray-300">{attraction.address}</p>
            )}
          </div>

          <div className="shrink-0">
            <button
              onClick={() => setIsTripModalOpen(true)}
              className="px-5 py-3 rounded-xl bg-white text-[#323232] font-bold text-xs sm:text-sm shadow-md hover:bg-[#DDD0C8] transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Itinerary</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-default shadow-xs space-y-4">
            <h2 className="font-serif text-2xl font-bold text-[#323232]">
              Historical & Cultural Overview
            </h2>
            <p className="text-sm text-[#555555] leading-relaxed whitespace-pre-line">
              {attraction.description}
            </p>
          </section>

          {/* Related Attractions */}
          {attraction.relatedAttractions && attraction.relatedAttractions.length > 0 && (
            <section className="space-y-4">
              <h2 className="font-serif text-2xl font-bold text-[#323232]">
                Other Attractions Nearby
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {attraction.relatedAttractions.map((rel) => (
                  <Link
                    key={rel.id}
                    to={`/attractions/${rel.slug}`}
                    className="p-4 rounded-2xl bg-white border border-default hover:shadow-md transition-all flex gap-4"
                  >
                    <img
                      src={rel.imageUrl}
                      alt={rel.name}
                      className="w-20 h-20 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#555555]">
                        {rel.category}
                      </span>
                      <h4 className="font-serif font-bold text-sm text-[#323232] line-clamp-1">
                        {rel.name}
                      </h4>
                      <p className="text-xs text-[#555555] line-clamp-2 mt-0.5">
                        {rel.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Reviews */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-default space-y-6">
            <h3 className="font-serif text-2xl font-bold text-[#323232]">
              Traveler Impressions & Reviews
            </h3>

            <div className="space-y-3">
              {attraction.reviews && attraction.reviews.length > 0 ? (
                attraction.reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#323232]">{rev.user.name}</span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-[#555555]">{rev.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500 italic">No reviews yet for this attraction.</p>
              )}
            </div>

            {/* Submit Review */}
            <div className="pt-4 border-t border-gray-100">
              {user ? (
                reviewSuccess ? (
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Your review has been shared!</span>
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-3">
                    <h4 className="text-sm font-bold text-[#323232]">Leave a Review</h4>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          type="button"
                          key={n}
                          onClick={() => setRating(n)}
                          className="p-1 text-amber-400"
                        >
                          <Star className={`w-5 h-5 ${n <= rating ? 'fill-amber-400' : 'text-gray-300'}`} />
                        </button>
                      ))}
                    </div>
                    <textarea
                      required
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your experience, tips on opening hours, photo spots..."
                      className="w-full p-3 text-xs rounded-xl border border-default bg-white focus:outline-none focus:ring-2 focus:ring-[#323232]"
                    />
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-5 py-2 rounded-xl bg-[#323232] hover:bg-black text-white text-xs font-bold"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                )
              ) : (
                <p className="text-xs text-[#555555]">
                  <Link to="/login" className="font-bold underline text-[#323232]">
                    Sign in
                  </Link>{' '}
                  to leave a review and tip for fellow travelers.
                </p>
              )}
            </div>
          </section>
        </div>

        {/* Right Info Column */}
        <div className="space-y-6">
          <div className="bg-[#DDD0C8]/25 p-6 rounded-3xl border border-default space-y-4 text-xs">
            <h3 className="font-serif text-lg font-bold text-[#323232]">
              Visit Information
            </h3>

            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-[#323232] shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-[#323232]">Estimated Duration</div>
                <div className="text-[#555555]">{attraction.estimatedVisitDuration || '1 - 2 hours'}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-[#323232] shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-[#323232]">Coordinates</div>
                <div className="text-[#555555]">
                  {attraction.latitude.toFixed(4)}° N, {attraction.longitude.toFixed(4)}° E
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsTripModalOpen(true)}
              className="w-full py-2.5 rounded-xl bg-[#323232] hover:bg-black text-white text-xs font-bold transition-colors"
            >
              Add to Itinerary
            </button>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#555555] mb-2">
              Exact Location
            </h4>
            <IndiaMap
              items={mapItems}
              center={[attraction.latitude, attraction.longitude]}
              zoom={14}
              height="280px"
            />
          </div>
        </div>
      </div>

      <AddToTripModal
        isOpen={isTripModalOpen}
        onClose={() => setIsTripModalOpen(false)}
        attractionId={attraction.id}
        itemName={attraction.name}
      />
    </div>
  );
};
