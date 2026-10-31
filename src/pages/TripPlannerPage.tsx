import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Plus, MapPin, ArrowRight, Trash2, Clock, Check, AlertCircle } from 'lucide-react';
import { apiRequest } from '../services/api.ts';
import { Trip } from '../types/index.ts';
import { useAuth } from '../context/AuthContext.tsx';

export const TripPlannerPage: React.FC = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  // New Trip Modal
  const [isNewTripModalOpen, setIsNewTripModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTrips = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/trips');
      if (res.success && res.data) {
        setTrips(res.data);
      }
    } catch (err) {
      console.error('Trips load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadTrips();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    setError(null);

    try {
      const res = await apiRequest('/trips', {
        method: 'POST',
        body: JSON.stringify({
          name,
          description: description || null,
          startDate: startDate || null,
          endDate: endDate || null,
        }),
      });

      if (res.success && res.data) {
        setTrips([res.data, ...trips]);
        setIsNewTripModalOpen(false);
        setName('');
        setDescription('');
        setStartDate('');
        setEndDate('');
      } else {
        setError(res.error || 'Failed to create trip');
      }
    } catch (err: any) {
      setError(err.message || 'Error creating trip');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTrip = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the trip "${name}"?`)) return;

    setTrips(trips.filter((t) => t.id !== id));
    await apiRequest(`/trips/${id}`, { method: 'DELETE' });
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <Calendar className="w-12 h-12 text-[#DDD0C8] mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-[#323232]">EasyWay Trip Planner</h2>
        <p className="text-sm text-[#555555]">
          Sign in to organize multi-day travel itineraries, schedule attractions, and view route maps.
        </p>
        <Link
          to="/login"
          className="inline-block px-6 py-2.5 rounded-xl bg-[#323232] text-white text-xs font-bold hover:bg-black"
        >
          Sign In to Plan Trips
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="bg-[#DDD0C8]/25 p-8 rounded-3xl border border-default flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#323232] text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-[#323232]" />
            <span>Itinerary Builder</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#323232] mb-2">
            My Planned Trips
          </h1>
          <p className="text-sm text-[#555555] leading-relaxed">
            Create customized Indian travel itineraries, organize days, add your favorite monuments and heritage stays.
          </p>
        </div>

        <button
          onClick={() => setIsNewTripModalOpen(true)}
          className="px-5 py-3 rounded-2xl bg-[#323232] hover:bg-black text-white text-xs sm:text-sm font-bold transition-all shadow-md flex items-center gap-2 shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Trip</span>
        </button>
      </div>

      {/* Trips Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-2xl border border-default" />
          ))}
        </div>
      ) : trips.length === 0 ? (
        <div className="p-16 rounded-3xl bg-white border border-default text-center space-y-4">
          <Calendar className="w-12 h-12 text-[#DDD0C8] mx-auto" />
          <h3 className="font-serif text-2xl font-bold text-[#323232]">No Trips Created Yet</h3>
          <p className="text-sm text-[#555555] max-w-md mx-auto">
            Ready to discover India? Start by creating your first trip and add destinations to your itinerary.
          </p>
          <button
            onClick={() => setIsNewTripModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-[#323232] text-white text-xs font-bold hover:bg-black transition-colors"
          >
            Create Your First Trip
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="bg-white rounded-2xl border border-default p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-[#555555] mb-2">
                  <span className="flex items-center gap-1 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>{trip.startDate ? `${trip.startDate} - ${trip.endDate || ''}` : 'Dates Unspecified'}</span>
                  </span>
                  <span className="bg-[#DDD0C8]/40 px-2 py-0.5 rounded font-bold text-[#323232]">
                    {trip._count?.items || trip.items?.length || 0} Itinerary Stops
                  </span>
                </div>

                <h3 className="font-serif text-xl font-bold text-[#323232] mb-2">
                  {trip.name}
                </h3>

                <p className="text-xs text-[#555555] line-clamp-3 leading-relaxed mb-4">
                  {trip.description || 'No description provided. Click below to organize daily itinerary.'}
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                <Link
                  to={`/trips/${trip.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#323232] hover:underline"
                >
                  <span>Open Itinerary</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <button
                  onClick={() => handleDeleteTrip(trip.id, trip.name)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Delete Trip"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Trip Modal */}
      {isNewTripModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-default space-y-4">
            <h3 className="font-serif text-2xl font-bold text-[#323232]">
              Create New Travel Plan
            </h3>
            <p className="text-xs text-[#555555]">
              Give your upcoming Indian vacation or expedition a name and timeframe.
            </p>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCreateTrip} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#323232] mb-1">
                  Trip Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Golden Triangle Holiday or Kerala Backwaters"
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-default bg-white focus:outline-none focus:ring-2 focus:ring-[#323232]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#323232] mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-default bg-white focus:outline-none focus:ring-2 focus:ring-[#323232]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#323232] mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-default bg-white focus:outline-none focus:ring-2 focus:ring-[#323232]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#323232] mb-1">
                  Trip Purpose / Notes
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add goals, family members travelling, packing checklist reminders..."
                  className="w-full p-3 text-sm rounded-xl border border-default bg-white focus:outline-none focus:ring-2 focus:ring-[#323232]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewTripModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-[#555555] rounded-xl hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 text-sm font-semibold rounded-xl bg-[#323232] text-white hover:bg-black transition-colors"
                >
                  {creating ? 'Creating...' : 'Create Itinerary'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
