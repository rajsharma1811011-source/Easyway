import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Building,
  Send,
  Star,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { apiRequest } from '../services/api.ts';
import { Hotel } from '../types/index.ts';
import { IndiaMap, MapItem } from '../components/maps/IndiaMap.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { InquiryModal } from '../components/common/InquiryModal.tsx';

export const HotelDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

  // Reviews
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const fetchHotel = async () => {
    setLoading(true);
    try {
      const res = await apiRequest(`/hotels/${slug}`);
      if (res.success && res.data) {
        setHotel(res.data);
      } else {
        setError(res.error || 'Hotel not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load hotel');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotel();
  }, [slug]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !hotel || !comment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await apiRequest('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          hotelId: hotel.id,
          rating,
          comment,
        }),
      });

      if (res.success) {
        setReviewSuccess(true);
        setComment('');
        fetchHotel();
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

  if (error || !hotel) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-[#323232]">Hotel Not Found</h2>
        <p className="text-sm text-[#555555]">{error || 'The requested accommodation could not be found.'}</p>
        <Link
          to="/hotels"
          className="inline-block px-5 py-2.5 rounded-xl bg-[#323232] text-white text-xs font-semibold"
        >
          Back to Hotels
        </Link>
      </div>
    );
  }

  const mapItems: MapItem[] = [
    {
      id: hotel.id,
      name: hotel.name,
      category: 'hotel',
      latitude: hotel.latitude,
      longitude: hotel.longitude,
      imageUrl: hotel.imageUrl,
      subtitle: `${hotel.accommodationType} • ${hotel.address}`,
      link: `/hotels/${hotel.slug}`,
    },
  ];

  const amenitiesList = hotel.amenities.split(',').map((a) => a.trim());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Hero Header */}
      <div className="relative h-[380px] sm:h-[460px] rounded-3xl overflow-hidden border border-default shadow-lg">
        <img
          src={hotel.imageUrl}
          alt={hotel.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

        <div className="absolute top-6 left-6">
          <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold text-[#323232]">
            {hotel.accommodationType}
          </span>
        </div>

        <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="text-white max-w-2xl">
            {hotel.destination && (
              <Link
                to={`/destinations/${hotel.destination.slug}`}
                className="text-xs font-semibold text-[#DDD0C8] hover:underline flex items-center gap-1 mb-1"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>In {hotel.destination.name}, {hotel.destination.state}</span>
              </Link>
            )}
            <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight mb-2">
              {hotel.name}
            </h1>
            <p className="text-xs text-gray-300">{hotel.address}</p>
          </div>

          <div className="shrink-0">
            <button
              onClick={() => setIsInquiryModalOpen(true)}
              className="px-6 py-3 rounded-xl bg-white text-[#323232] font-bold text-xs sm:text-sm shadow-md hover:bg-[#DDD0C8] transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Send Booking Inquiry</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* About Hotel */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-default shadow-xs space-y-4">
            <h2 className="font-serif text-2xl font-bold text-[#323232]">
              About {hotel.name}
            </h2>
            <p className="text-sm text-[#555555] leading-relaxed whitespace-pre-line">
              {hotel.description}
            </p>
          </section>

          {/* Amenities & Highlights */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-default shadow-xs space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#323232]">
              Featured Amenities & Facilities
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {amenitiesList.map((amenity) => (
                <div
                  key={amenity}
                  className="flex items-center gap-2 p-3 rounded-xl bg-[#DDD0C8]/20 border border-default/50 text-xs font-medium text-[#323232]"
                >
                  <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Reviews */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-default space-y-6">
            <h3 className="font-serif text-2xl font-bold text-[#323232]">
              Guest Reviews & Testimonials
            </h3>

            <div className="space-y-3">
              {hotel.reviews && hotel.reviews.length > 0 ? (
                hotel.reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#323232]">{rev.user.name}</span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-[#555555]">{rev.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-500 italic">No reviews yet for this accommodation.</p>
              )}
            </div>

            {/* Leave Review Form */}
            <div className="pt-4 border-t border-gray-100">
              {user ? (
                reviewSuccess ? (
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Your hotel review has been shared!</span>
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-3">
                    <h4 className="text-sm font-bold text-[#323232]">Share Guest Experience</h4>
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
                      placeholder="Share your stay experience, room quality, breakfast, hospitality..."
                      className="w-full p-3 text-xs rounded-xl border border-default bg-white focus:outline-none focus:ring-2 focus:ring-[#323232]"
                    />
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-5 py-2 rounded-xl bg-[#323232] hover:bg-black text-white text-xs font-bold"
                    >
                      {submittingReview ? 'Submitting...' : 'Post Guest Review'}
                    </button>
                  </form>
                )
              ) : (
                <p className="text-xs text-[#555555]">
                  <Link to="/login" className="font-bold underline text-[#323232]">
                    Sign in
                  </Link>{' '}
                  to leave a review for this hotel.
                </p>
              )}
            </div>
          </section>
        </div>

        {/* Right Info Column */}
        <div className="space-y-6">
          <div className="bg-[#DDD0C8]/25 p-6 rounded-3xl border border-default space-y-4 text-xs">
            <h3 className="font-serif text-lg font-bold text-[#323232]">
              Inquiry & Direct Booking
            </h3>
            <p className="text-[#555555] leading-relaxed">
              Connect directly with hotel reservations to ask about seasonal heritage packages, room upgrades, and local airport transfers.
            </p>

            <button
              onClick={() => setIsInquiryModalOpen(true)}
              className="w-full py-3 rounded-xl bg-[#323232] hover:bg-black text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Send Property Inquiry</span>
            </button>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#555555] mb-2">
              Property Location
            </h4>
            <IndiaMap
              items={mapItems}
              center={[hotel.latitude, hotel.longitude]}
              zoom={13}
              height="280px"
            />
          </div>
        </div>
      </div>

      <InquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        recipientType="HOTEL"
        recipientId={hotel.slug}
        recipientName={hotel.name}
      />
    </div>
  );
};
