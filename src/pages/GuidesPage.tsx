import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, UserCheck, MapPin, Languages, Award, Send, Star } from 'lucide-react';
import { apiRequest } from '../services/api.ts';
import { Guide } from '../types/index.ts';
import { InquiryModal } from '../components/common/InquiryModal.tsx';

export const GuidesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);

  // Inquiry modal state
  const [inquiryTarget, setInquiryTarget] = useState<{
    isOpen: boolean;
    type: 'GUIDE';
    id?: string;
    name: string;
  }>({ isOpen: false, type: 'GUIDE', name: '' });

  const search = searchParams.get('search') || '';
  const region = searchParams.get('region') || 'all';
  const language = searchParams.get('language') || 'all';
  const specialization = searchParams.get('specialization') || 'all';

  useEffect(() => {
    async function loadGuides() {
      setLoading(true);
      const query = new URLSearchParams();
      if (search) query.set('search', search);
      if (region !== 'all') query.set('region', region);
      if (language !== 'all') query.set('language', language);
      if (specialization !== 'all') query.set('specialization', specialization);

      try {
        const res = await apiRequest(`/guides?${query.toString()}`);
        if (res.success && res.data) {
          setGuides(res.data);
        }
      } catch (err) {
        console.error('Guides load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadGuides();
  }, [search, region, language, specialization]);

  const updateParam = (key: string, val: string) => {
    const next = new URLSearchParams(searchParams);
    if (val && val !== 'all') next.set(key, val);
    else next.delete(key);
    setSearchParams(next);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-[#DDD0C8]/25 p-8 rounded-3xl border border-default">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#323232] text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
            <UserCheck className="w-3.5 h-3.5 text-[#323232]" />
            <span>Storytellers & Cultural Experts</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#323232] mb-3">
            Certified Indian Travel Guides
          </h1>
          <p className="text-sm text-[#555555] leading-relaxed">
            Connect with certified regional historians, naturalists, and multilingual tour guides
            who bring India's monuments, traditions, and hidden trails to vibrant life.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-5 rounded-2xl border border-default shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => updateParam('search', e.target.value)}
              placeholder="Search by guide name or specialty..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-default bg-white focus:outline-none focus:ring-2 focus:ring-[#323232]"
            />
          </div>

          <div>
            <select
              value={region}
              onChange={(e) => updateParam('region', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-default bg-white focus:outline-none focus:ring-2 focus:ring-[#323232]"
            >
              <option value="all">All Service Regions</option>
              <option value="Rajasthan">Rajasthan & Golden Triangle</option>
              <option value="Kerala">Kerala & South India</option>
              <option value="Varanasi">Varanasi & Uttar Pradesh</option>
              <option value="Darjeeling">Darjeeling & Eastern Himalayas</option>
              <option value="Delhi">Delhi & Agra</option>
              <option value="Goa">Goa & Western Coast</option>
              <option value="Hampi">Hampi & Karnataka</option>
              <option value="Himachal">Himachal & Uttarakhand</option>
            </select>
          </div>

          <div>
            <select
              value={language}
              onChange={(e) => updateParam('language', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-default bg-white focus:outline-none focus:ring-2 focus:ring-[#323232]"
            >
              <option value="all">All Languages</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Spanish">Spanish</option>
              <option value="Japanese">Japanese</option>
            </select>
          </div>

          <div>
            <select
              value={specialization}
              onChange={(e) => updateParam('specialization', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-default bg-white focus:outline-none focus:ring-2 focus:ring-[#323232]"
            >
              <option value="all">All Specializations</option>
              <option value="Heritage">Heritage & Architecture</option>
              <option value="Spiritual">Spiritual & Vedic Philosophy</option>
              <option value="Culinary">Culinary & Street Food Trails</option>
              <option value="Eco">Eco Wildlife & Nature</option>
              <option value="Trekking">Trekking & Mountaineering</option>
              <option value="Yoga">Yoga & Meditation Walks</option>
            </select>
          </div>
        </div>
      </div>

      {/* Guides Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-12">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-80 bg-gray-100 animate-pulse rounded-2xl border border-default/50" />
          ))}
        </div>
      ) : guides.length === 0 ? (
        <div className="p-16 rounded-3xl bg-white border border-default text-center space-y-4">
          <UserCheck className="w-12 h-12 text-[#DDD0C8] mx-auto" />
          <h3 className="font-serif text-2xl font-bold text-[#323232]">No Travel Guides Found</h3>
          <p className="text-sm text-[#555555]">Try broadening your language or region filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {guides.map((guide) => (
            <div
              key={guide.id}
              className="bg-white rounded-2xl border border-default p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="text-center">
                <img
                  src={guide.profileImageUrl}
                  alt={guide.name}
                  className="w-24 h-24 rounded-full object-cover mx-auto mb-3 border-2 border-[#DDD0C8]"
                />
                <h3 className="font-serif text-lg font-bold text-[#323232]">{guide.name}</h3>
                <div className="text-xs font-semibold text-emerald-800 flex items-center justify-center gap-1 my-1">
                  <Award className="w-3.5 h-3.5" />
                  <span>{guide.experienceYears} Years Experience</span>
                </div>
                <div className="text-xs text-gray-500 flex items-center justify-center gap-1 mb-2">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span>{guide.serviceRegions}</span>
                </div>
                <p className="text-xs text-[#555555] line-clamp-3 leading-relaxed mb-3">
                  {guide.biography}
                </p>
                <div className="text-[11px] text-[#323232] bg-[#DDD0C8]/25 p-2 rounded-xl mb-4 font-medium">
                  🗣️ {guide.languages}
                </div>
              </div>

              <div className="space-y-2">
                <Link
                  to={`/guides/${guide.id}`}
                  className="w-full py-2 rounded-xl border border-default hover:bg-[#DDD0C8]/25 text-[#323232] text-xs font-bold text-center block transition-colors"
                >
                  View Profile
                </Link>
                <button
                  onClick={() =>
                    setInquiryTarget({
                      isOpen: true,
                      type: 'GUIDE',
                      id: guide.id,
                      name: guide.name,
                    })
                  }
                  className="w-full py-2 rounded-xl bg-[#323232] hover:bg-black text-white text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Inquiry</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <InquiryModal
        isOpen={inquiryTarget.isOpen}
        onClose={() => setInquiryTarget((prev) => ({ ...prev, isOpen: false }))}
        recipientType="GUIDE"
        recipientId={inquiryTarget.id}
        recipientName={inquiryTarget.name}
      />
    </div>
  );
};
