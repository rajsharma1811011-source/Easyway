import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  MapPin,
  Compass,
  Building,
  UserCheck,
  Star,
  Mail,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit2,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { apiRequest } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { Destination, Attraction, Hotel, Guide, Inquiry, Review } from '../types/index.ts';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'destinations' | 'attractions' | 'hotels' | 'guides' | 'users' | 'reviews' | 'inquiries'
  >('overview');

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tab Data
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [inquiriesList, setInquiriesList] = useState<Inquiry[]>([]);

  // Create Destination Modal State
  const [isNewDestOpen, setIsNewDestOpen] = useState(false);
  const [newDestName, setNewDestName] = useState('');
  const [newDestSlug, setNewDestSlug] = useState('');
  const [newDestState, setNewDestState] = useState('');
  const [newDestRegion, setNewDestRegion] = useState('North');
  const [newDestDesc, setNewDestDesc] = useState('');
  const [newDestImg, setNewDestImg] = useState('');
  const [newDestCat, setNewDestCat] = useState('Heritage, Culture');
  const [newDestLat, setNewDestLat] = useState('26.9124');
  const [newDestLng, setNewDestLng] = useState('75.7873');

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest('/admin/dashboard');
      if (res.success) {
        setStats(res.stats);
      } else {
        setError(res.error || 'Access forbidden');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'ADMIN') {
      loadDashboard();
    } else if (user) {
      setError('You must have the ADMIN role to access this control panel.');
      setLoading(false);
    } else {
      navigate('/login');
    }
  }, [user]);

  // Load sub-tab data when tab changes
  useEffect(() => {
    if (!user || user.role !== 'ADMIN') return;

    if (activeTab === 'destinations') {
      apiRequest('/destinations?limit=100').then((res) => res.success && setDestinations(res.data));
    } else if (activeTab === 'attractions') {
      apiRequest('/attractions?limit=100').then((res) => res.success && setAttractions(res.data));
    } else if (activeTab === 'hotels') {
      apiRequest('/hotels?limit=100').then((res) => res.success && setHotels(res.data));
    } else if (activeTab === 'guides') {
      apiRequest('/guides?limit=100').then((res) => res.success && setGuides(res.data));
    } else if (activeTab === 'users') {
      apiRequest('/admin/users').then((res) => res.success && setUsersList(res.data));
    } else if (activeTab === 'reviews') {
      apiRequest('/reviews?status=ALL').then((res) => res.success && setReviewsList(res.data));
    } else if (activeTab === 'inquiries') {
      apiRequest('/inquiries').then((res) => res.success && setInquiriesList(res.data));
    }
  }, [activeTab, user]);

  const handleCreateDestination = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest('/destinations', {
        method: 'POST',
        body: JSON.stringify({
          name: newDestName,
          slug: newDestSlug.toLowerCase().trim(),
          state: newDestState,
          region: newDestRegion,
          description: newDestDesc,
          imageUrl: newDestImg,
          categories: newDestCat,
          latitude: parseFloat(newDestLat),
          longitude: parseFloat(newDestLng),
        }),
      });

      if (res.success) {
        setIsNewDestOpen(false);
        setNewDestName('');
        setNewDestSlug('');
        setNewDestState('');
        setNewDestDesc('');
        setNewDestImg('');
        apiRequest('/destinations?limit=100').then((r) => r.success && setDestinations(r.data));
        loadDashboard();
      } else {
        alert(res.error || 'Failed to create destination');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDestination = async (id: string, name: string) => {
    if (!window.confirm(`Delete destination "${name}" and all associated records?`)) return;
    await apiRequest(`/destinations/${id}`, { method: 'DELETE' });
    setDestinations(destinations.filter((d) => d.id !== id));
    loadDashboard();
  };

  const handleDeleteAttraction = async (id: string, name: string) => {
    if (!window.confirm(`Delete attraction "${name}"?`)) return;
    await apiRequest(`/attractions/${id}`, { method: 'DELETE' });
    setAttractions(attractions.filter((a) => a.id !== id));
    loadDashboard();
  };

  const handleDeleteHotel = async (id: string, name: string) => {
    if (!window.confirm(`Delete hotel "${name}"?`)) return;
    await apiRequest(`/hotels/${id}`, { method: 'DELETE' });
    setHotels(hotels.filter((h) => h.id !== id));
    loadDashboard();
  };

  const handleModerateReview = async (id: string, moderationStatus: string) => {
    await apiRequest(`/reviews/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ moderationStatus }),
    });
    setReviewsList(
      reviewsList.map((r) => (r.id === id ? { ...r, moderationStatus: moderationStatus as any } : r))
    );
  };

  const handleInquiryStatus = async (id: string, status: string) => {
    await apiRequest(`/inquiries/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    setInquiriesList(
      inquiriesList.map((inq) => (inq.id === id ? { ...inq, status: status as any } : inq))
    );
  };

  const handleUpdateRole = async (userId: string, role: string) => {
    const res = await apiRequest(`/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
    if (res.success) {
      setUsersList(usersList.map((u) => (u.id === userId ? { ...u, role } : u)));
    } else {
      alert(res.error || 'Failed to update user role');
    }
  };

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-[#323232]">Access Restricted</h2>
        <p className="text-sm text-[#555555]">{error}</p>
        <Link
          to="/"
          className="inline-block px-5 py-2.5 rounded-xl bg-[#323232] text-white text-xs font-semibold"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-[#DDD0C8]/25 p-8 rounded-3xl border border-default flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#323232] text-xs font-bold uppercase tracking-wider mb-2 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Admin Authorization Verified</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#323232]">
            EasyWay Administration Control Panel
          </h1>
          <p className="text-xs text-[#555555] mt-1">
            Manage destinations, verify reviews, oversee tourist inquiries, and configure users.
          </p>
        </div>

        <button
          onClick={loadDashboard}
          className="px-4 py-2.5 rounded-xl border border-default bg-white hover:bg-gray-50 text-[#323232] text-xs font-semibold flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-default text-xs font-semibold text-[#555555]">
        {[
          { id: 'overview', label: 'Overview Metrics', icon: ShieldCheck },
          { id: 'destinations', label: 'Destinations', icon: MapPin },
          { id: 'attractions', label: 'Attractions', icon: Compass },
          { id: 'hotels', label: 'Hotels', icon: Building },
          { id: 'guides', label: 'Guides', icon: UserCheck },
          { id: 'users', label: 'User Accounts', icon: Users },
          { id: 'reviews', label: 'Moderate Reviews', icon: Star },
          { id: 'inquiries', label: 'Inquiries', icon: Mail },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                active
                  ? 'bg-[#323232] text-white'
                  : 'bg-white hover:bg-[#DDD0C8]/30 text-[#323232] border border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}

      {/* 1. Overview */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
            {[
              { label: 'Destinations', val: stats.totalDestinations, icon: MapPin },
              { label: 'Attractions', val: stats.totalAttractions, icon: Compass },
              { label: 'Hotels', val: stats.totalHotels, icon: Building },
              { label: 'Guides', val: stats.totalGuides, icon: UserCheck },
              { label: 'Users', val: stats.totalUsers, icon: Users },
              { label: 'Reviews', val: stats.totalReviews, icon: Star },
              { label: 'Inquiries', val: stats.totalInquiries, icon: Mail },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="bg-white p-4 rounded-2xl border border-default shadow-xs text-center">
                  <div className="w-8 h-8 rounded-lg bg-[#DDD0C8]/40 text-[#323232] flex items-center justify-center mx-auto mb-2">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="font-serif text-2xl font-bold text-[#323232]">{s.val}</div>
                  <div className="text-[11px] text-[#555555] font-semibold">{s.label}</div>
                </div>
              );
            })}
          </div>

          <div className="bg-white p-6 rounded-3xl border border-default space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#323232]">
              System Health & Operational Status
            </h3>
            <p className="text-xs text-[#555555] leading-relaxed">
              Prisma ORM connected to SQLite database <code>dev.db</code>. Schema migrations synchronized with 16 Indian destinations, 23 attractions, 14 hotels, 8 guides, and realistic seed data.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/api/docs"
                target="_blank"
                className="px-4 py-2 rounded-xl bg-[#323232] text-white text-xs font-semibold hover:bg-black"
              >
                Open Swagger REST API Docs
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 2. Manage Destinations */}
      {activeTab === 'destinations' && (
        <div className="bg-white p-6 rounded-3xl border border-default shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-bold text-[#323232]">
              Manage Destinations ({destinations.length})
            </h3>
            <button
              onClick={() => setIsNewDestOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#323232] text-white text-xs font-bold hover:bg-black flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Destination</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#DDD0C8]/25 text-[#323232] uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3 rounded-l-lg">Destination</th>
                  <th className="p-3">State / Region</th>
                  <th className="p-3">Categories</th>
                  <th className="p-3">Rating</th>
                  <th className="p-3 rounded-r-lg text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {destinations.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50/50">
                    <td className="p-3 flex items-center gap-3">
                      <img src={d.imageUrl} alt={d.name} className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <div className="font-bold text-[#323232]">{d.name}</div>
                        <div className="text-[10px] text-gray-500 font-mono">{d.slug}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      {d.state} ({d.region})
                    </td>
                    <td className="p-3 max-w-xs truncate">{d.categories}</td>
                    <td className="p-3 font-semibold">{d.popularityScore?.toFixed(1) || '4.8'}</td>
                    <td className="p-3 text-right space-x-2">
                      <Link
                        to={`/destinations/${d.slug}`}
                        className="p-1.5 rounded-lg border border-default hover:bg-gray-100 inline-block text-gray-700"
                        title="View Public Page"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDeleteDestination(d.id, d.name)}
                        className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 inline-block"
                        title="Delete Destination"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Manage Attractions */}
      {activeTab === 'attractions' && (
        <div className="bg-white p-6 rounded-3xl border border-default shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-bold text-[#323232]">
              Manage Attractions ({attractions.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#DDD0C8]/25 text-[#323232] uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3 rounded-l-lg">Attraction</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Destination</th>
                  <th className="p-3">Coordinates</th>
                  <th className="p-3 rounded-r-lg text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {attractions.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50/50">
                    <td className="p-3 flex items-center gap-3">
                      <img src={a.imageUrl} alt={a.name} className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <div className="font-bold text-[#323232]">{a.name}</div>
                        <div className="text-[10px] text-gray-500 font-mono">{a.slug}</div>
                      </div>
                    </td>
                    <td className="p-3 font-semibold">{a.category}</td>
                    <td className="p-3">{a.destination?.name || 'India'}</td>
                    <td className="p-3 font-mono text-[11px]">
                      {a.latitude.toFixed(2)}, {a.longitude.toFixed(2)}
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <Link
                        to={`/attractions/${a.slug}`}
                        className="p-1.5 rounded-lg border border-default hover:bg-gray-100 inline-block text-gray-700"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDeleteAttraction(a.id, a.name)}
                        className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 inline-block"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Manage Hotels */}
      {activeTab === 'hotels' && (
        <div className="bg-white p-6 rounded-3xl border border-default shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-bold text-[#323232]">
              Manage Hotels ({hotels.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#DDD0C8]/25 text-[#323232] uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3 rounded-l-lg">Hotel Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Destination</th>
                  <th className="p-3">Contact Email</th>
                  <th className="p-3 rounded-r-lg text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {hotels.map((h) => (
                  <tr key={h.id} className="hover:bg-gray-50/50">
                    <td className="p-3 flex items-center gap-3">
                      <img src={h.imageUrl} alt={h.name} className="w-10 h-10 rounded-lg object-cover" />
                      <div className="font-bold text-[#323232]">{h.name}</div>
                    </td>
                    <td className="p-3">{h.accommodationType}</td>
                    <td className="p-3">{h.destination?.name}</td>
                    <td className="p-3 text-gray-500 font-mono text-[11px]">{h.contactInformation || 'N/A'}</td>
                    <td className="p-3 text-right space-x-2">
                      <Link
                        to={`/hotels/${h.slug}`}
                        className="p-1.5 rounded-lg border border-default hover:bg-gray-100 inline-block text-gray-700"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDeleteHotel(h.id, h.name)}
                        className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 inline-block"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Manage Users */}
      {activeTab === 'users' && (
        <div className="bg-white p-6 rounded-3xl border border-default shadow-xs space-y-6">
          <h3 className="font-serif text-xl font-bold text-[#323232]">
            User Accounts & Roles ({usersList.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#DDD0C8]/25 text-[#323232] uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3 rounded-l-lg">User Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Registered Date</th>
                  <th className="p-3">Trips / Favs</th>
                  <th className="p-3 rounded-r-lg">Role Assignment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50">
                    <td className="p-3 font-bold text-[#323232]">{u.name}</td>
                    <td className="p-3 text-gray-600">{u.email}</td>
                    <td className="p-3 text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="p-3">
                      {u._count?.trips || 0} trips • {u._count?.favorites || 0} favs
                    </td>
                    <td className="p-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                        className="px-2.5 py-1 text-xs rounded-lg border border-default bg-white font-semibold"
                      >
                        <option value="USER">USER</option>
                        <option value="GUIDE">GUIDE</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Moderate Reviews */}
      {activeTab === 'reviews' && (
        <div className="bg-white p-6 rounded-3xl border border-default shadow-xs space-y-6">
          <h3 className="font-serif text-xl font-bold text-[#323232]">
            Review Moderation Queue ({reviewsList.length})
          </h3>

          <div className="space-y-3">
            {reviewsList.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-2xl border border-default flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#323232] text-xs">{rev.user.name}</span>
                    <span className="text-[10px] text-gray-500">
                      on {rev.destination?.name || rev.attraction?.name || rev.hotel?.name || rev.guide?.name}
                    </span>
                    <span className="text-[10px] font-bold text-amber-500">
                      ★ {rev.rating} / 5
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                        rev.moderationStatus === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {rev.moderationStatus}
                    </span>
                  </div>
                  <p className="text-xs text-[#555555] leading-relaxed">{rev.comment}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {rev.moderationStatus !== 'APPROVED' ? (
                    <button
                      onClick={() => handleModerateReview(rev.id, 'APPROVED')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
                    >
                      Approve
                    </button>
                  ) : (
                    <button
                      onClick={() => handleModerateReview(rev.id, 'REJECTED')}
                      className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50"
                    >
                      Reject
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Inquiries */}
      {activeTab === 'inquiries' && (
        <div className="bg-white p-6 rounded-3xl border border-default shadow-xs space-y-6">
          <h3 className="font-serif text-xl font-bold text-[#323232]">
            Tourist Inquiries & Partner Requests ({inquiriesList.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#DDD0C8]/25 text-[#323232] uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3 rounded-l-lg">Sender</th>
                  <th className="p-3">Target</th>
                  <th className="p-3">Travel Date</th>
                  <th className="p-3">Message</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 rounded-r-lg text-right">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inquiriesList.map((inq) => (
                  <tr key={inq.id} className="hover:bg-gray-50/50">
                    <td className="p-3">
                      <div className="font-bold text-[#323232]">{inq.name}</div>
                      <div className="text-[11px] text-gray-500 font-mono">{inq.email}</div>
                    </td>
                    <td className="p-3">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-gray-100 text-[#323232]">
                        {inq.recipientType}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600">{inq.travelDate || 'Flexible'}</td>
                    <td className="p-3 max-w-xs line-clamp-2 text-gray-600">{inq.message}</td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          inq.status === 'RESOLVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inq.status === 'CONTACTED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {inq.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <select
                        value={inq.status}
                        onChange={(e) => handleInquiryStatus(inq.id, e.target.value)}
                        className="px-2 py-1 text-xs rounded border border-default bg-white font-medium"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONTACTED">CONTACTED</option>
                        <option value="RESOLVED">RESOLVED</option>
                        <option value="ARCHIVED">ARCHIVED</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Destination Modal */}
      {isNewDestOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-default space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-xl font-bold text-[#323232]">
              Add New Indian Destination
            </h3>

            <form onSubmit={handleCreateDestination} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Destination Name *</label>
                <input
                  type="text"
                  required
                  value={newDestName}
                  onChange={(e) => {
                    setNewDestName(e.target.value);
                    setNewDestSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                  }}
                  placeholder="e.g. Amritsar"
                  className="w-full p-2.5 rounded-xl border border-default"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">URL Slug *</label>
                <input
                  type="text"
                  required
                  value={newDestSlug}
                  onChange={(e) => setNewDestSlug(e.target.value)}
                  placeholder="e.g. amritsar"
                  className="w-full p-2.5 rounded-xl border border-default font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={newDestState}
                    onChange={(e) => setNewDestState(e.target.value)}
                    placeholder="e.g. Punjab"
                    className="w-full p-2.5 rounded-xl border border-default"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Region *</label>
                  <select
                    value={newDestRegion}
                    onChange={(e) => setNewDestRegion(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-default"
                  >
                    <option value="North">North</option>
                    <option value="South">South</option>
                    <option value="West">West</option>
                    <option value="East">East</option>
                    <option value="North-East">North-East</option>
                    <option value="Central">Central</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Photo Image URL *</label>
                <input
                  type="url"
                  required
                  value={newDestImg}
                  onChange={(e) => setNewDestImg(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2.5 rounded-xl border border-default"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Categories (comma-separated)</label>
                <input
                  type="text"
                  required
                  value={newDestCat}
                  onChange={(e) => setNewDestCat(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-default"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={newDestLat}
                    onChange={(e) => setNewDestLat(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-default"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={newDestLng}
                    onChange={(e) => setNewDestLng(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-default"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={newDestDesc}
                  onChange={(e) => setNewDestDesc(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-default"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewDestOpen(false)}
                  className="px-4 py-2 font-semibold text-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#323232] text-white font-bold"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
