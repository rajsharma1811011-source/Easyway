import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  UserCheck,
  MapPin,
  Languages,
  Award,
  Send,
  Star,
  CheckCircle2,
  AlertCircle,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { apiRequest } from '../services/api.ts';
import { Guide } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { InquiryModal } from '../components/common/InquiryModal.tsx';

export const GuideDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [guide, setGuide] = useState<Guide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

  // Reviews
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const fetchGuide = async () => {
    setLoading(true);
    try {
      const res = await apiRequest(`/guides/${id}`);
      if (res.success && res.data) {
        setGuide(res.data);
      } else {
        setError(res.error || 'Guide profile not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load guide');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuide();
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !guide || !comment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await apiRequest('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          guideId: guide.id,
          rating,
          comment,
        }),
      });

      if (res.success) {
        setReviewSuccess(true);
        setComment('');
        fetchGuide();
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
        <div className="h-64 bg-gray-200 rounded-3xl" />
        <div className="h-40 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  if (error || !guide) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-[#323232]">Guide Profile Not Found</h2>
        <p className="text-sm text-[#555555]">{error || 'The requested guide could not be found.'}</p>
        <Link
          to="/guides"
          className="inline-block px-5 py-2.5 rounded-xl bg-[#323232] text-white text-xs font-semibold"
        >
          Back to All Guides
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Profile Header Card */}
      <div className="bg-[#DDD0C8]/25 p-8 rounded-3xl border border-default flex flex-col md:flex-row items-center md:items-start gap-8">
        <img
          src={guide.profileImageUrl}
          alt={guide.name}
          className="w-36 h-36 rounded-2xl object-cover border-4 border-white shadow-md shrink-0"
        />

        <div className="flex-1 space-y-3 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#323232] text-xs font-bold uppercase tracking-wider shadow-2xs">
            <Award className="w-3.5 h-3.5 text-emerald-700" />
            <span>{guide.experienceYears} Years Guiding Experience</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#323232]">
            {guide.name}
          </h1>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-[#555555]">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span>Service Regions: {guide.serviceRegions}</span>
            </span>
            <span className="flex items-center gap-1">
              <Languages className="w-4 h-4 text-gray-500" />
              <span>Languages: {guide.languages}</span>
            </span>
          </div>

          <p className="text-sm text-[#555555] max-w-2xl leading-relaxed">
            {guide.biography}
          </p>
        </div>

        <div className="shrink-0 flex flex-col gap-3">
          <button
            onClick={() => setIsInquiryModalOpen(true)}
            className="px-6 py-3 rounded-xl bg-[#323232] hover:bg-black text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <Send className="w-4 h-4" />
            <span>Send Guide Inquiry</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Specializations & Tour Focus */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-default shadow-xs space-y-4">
            <h2 className="font-serif text-2xl font-bold text-[#323232]">
              Guiding Specialties & Expertise
            </h2>
            <div className="flex flex-wrap gap-2">
              {guide.specializations.split(',').map((spec) => (
                <span
                  key={spec}
                  className="px-3 py-1.5 rounded-xl bg-[#DDD0C8]/30 border border-default/40 text-xs font-semibold text-[#323232]"
                >
                  🎯 {spec.trim()}
                </span>
              ))}
            </div>
          </section>

          {/* Reviews & Traveler Feedback */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl border border-default space-y-6">
            <h3 className="font-serif text-2xl font-bold text-[#323232]">
              Traveler Reviews & Endorsements
            </h3>

            <div className="space-y-3">
              {guide.reviews && guide.reviews.length > 0 ? (
                guide.reviews.map((rev) => (
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
                <p className="text-xs text-gray-500 italic">No reviews yet for this guide.</p>
              )}
            </div>

            {/* Leave Review Form */}
            <div className="pt-4 border-t border-gray-100">
              {user ? (
                reviewSuccess ? (
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Your guide review has been submitted!</span>
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-3">
                    <h4 className="text-sm font-bold text-[#323232]">Review Guide Experience</h4>
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
                      placeholder="Comment on guide punctuality, knowledge depth, communication..."
                      className="w-full p-3 text-xs rounded-xl border border-default bg-white focus:outline-none focus:ring-2 focus:ring-[#323232]"
                    />
                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="px-5 py-2 rounded-xl bg-[#323232] hover:bg-black text-white text-xs font-bold"
                    >
                      {submittingReview ? 'Submitting...' : 'Post Guide Review'}
                    </button>
                  </form>
                )
              ) : (
                <p className="text-xs text-[#555555]">
                  <Link to="/login" className="font-bold underline text-[#323232]">
                    Sign in
                  </Link>{' '}
                  to leave a review for {guide.name}.
                </p>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Suggested Destinations */}
        <div className="space-y-6">
          <div className="bg-[#DDD0C8]/25 p-6 rounded-3xl border border-default space-y-4 text-xs">
            <h3 className="font-serif text-lg font-bold text-[#323232]">
              Direct Guide Inquiry
            </h3>
            <p className="text-[#555555] leading-relaxed">
              Reach out directly to {guide.name} to plan custom heritage tours, private vehicle logistics, and personalized itineraries.
            </p>
            <button
              onClick={() => setIsInquiryModalOpen(true)}
              className="w-full py-3 rounded-xl bg-[#323232] hover:bg-black text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Contact {guide.name.split(' ')[0]}</span>
            </button>
          </div>

          {guide.relatedDestinations && guide.relatedDestinations.length > 0 && (
            <div className="bg-white p-6 rounded-3xl border border-default space-y-3">
              <h3 className="font-serif text-lg font-bold text-[#323232]">
                Destinations Serviced
              </h3>
              <div className="space-y-3">
                {guide.relatedDestinations.map((d) => (
                  <Link
                    key={d.id}
                    to={`/destinations/${d.slug}`}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <img
                      src={d.imageUrl}
                      alt={d.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="text-xs font-bold text-[#323232] group-hover:underline">
                        {d.name}
                      </div>
                      <div className="text-[11px] text-gray-500">{d.state}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#323232]" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <InquiryModal
        isOpen={isInquiryModalOpen}
        onClose={() => setIsInquiryModalOpen(false)}
        recipientType="GUIDE"
        recipientId={guide.id}
        recipientName={guide.name}
      />
    </div>
  );
};
