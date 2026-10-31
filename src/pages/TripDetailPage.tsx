import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Clock,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Edit2,
  AlertCircle,
  Compass,
  ArrowRight,
  Check,
} from 'lucide-react';
import { apiRequest } from '../services/api.ts';
import { Trip, TripItem, Destination, Attraction } from '../types/index.ts';
import { IndiaMap, MapItem } from '../components/maps/IndiaMap.tsx';
import { useAuth } from '../context/AuthContext.tsx';

export const TripDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add Item state
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [selectedDestinationId, setSelectedDestinationId] = useState('');
  const [selectedAttractionId, setSelectedAttractionId] = useState('');
  const [itemDay, setItemDay] = useState(1);
  const [itemNotes, setItemNotes] = useState('');
  const [adding, setAdding] = useState(false);

  // Edit Trip state
  const [isEditTripOpen, setIsEditTripOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');

  const fetchTrip = async () => {
    setLoading(true);
    try {
      const res = await apiRequest(`/trips/${id}`);
      if (res.success && res.data) {
        setTrip(res.data);
        setEditName(res.data.name);
        setEditDesc(res.data.description || '');
        setEditStart(res.data.startDate || '');
        setEditEnd(res.data.endDate || '');
      } else {
        setError(res.error || 'Trip not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load trip');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrip();
    apiRequest('/destinations?limit=50').then((res) => {
      if (res.success && res.data) setDestinations(res.data);
    });
    apiRequest('/attractions?limit=50').then((res) => {
      if (res.success && res.data) setAttractions(res.data);
    });
  }, [id]);

  const handleUpdateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trip) return;
    try {
      const res = await apiRequest(`/trips/${trip.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: editName,
          description: editDesc,
          startDate: editStart,
          endDate: editEnd,
        }),
      });
      if (res.success) {
        setTrip(res.data);
        setIsEditTripOpen(false);
      }
    } catch (err) {
      console.error('Update trip error:', err);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trip) return;
    setAdding(true);

    try {
      const res = await apiRequest(`/trips/${trip.id}/items`, {
        method: 'POST',
        body: JSON.stringify({
          destinationId: selectedDestinationId || null,
          attractionId: selectedAttractionId || null,
          dayNumber: Number(itemDay) || 1,
          notes: itemNotes || null,
        }),
      });

      if (res.success) {
        setIsAddItemOpen(false);
        setSelectedDestinationId('');
        setSelectedAttractionId('');
        setItemNotes('');
        fetchTrip();
      }
    } catch (err) {
      console.error('Add item error:', err);
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!trip) return;
    try {
      await apiRequest(`/trips/${trip.id}/items/${itemId}`, { method: 'DELETE' });
      fetchTrip();
    } catch (err) {
      console.error('Delete item error:', err);
    }
  };

  const handleReorder = async (itemId: string, newSortOrder: number) => {
    if (!trip) return;
    try {
      await apiRequest(`/trips/${trip.id}/items/${itemId}`, {
        method: 'PATCH',
        body: JSON.stringify({ sortOrder: newSortOrder }),
      });
      fetchTrip();
    } catch (err) {
      console.error('Reorder error:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 animate-pulse space-y-8">
        <div className="h-48 bg-gray-200 rounded-3xl" />
        <div className="h-96 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-[#323232]">Trip Not Found</h2>
        <p className="text-sm text-[#555555]">{error || 'This itinerary does not exist.'}</p>
        <Link
          to="/trips"
          className="inline-block px-5 py-2.5 rounded-xl bg-[#323232] text-white text-xs font-semibold"
        >
          Back to My Trips
        </Link>
      </div>
    );
  }

  // Group items by dayNumber
  const daysMap: Record<number, TripItem[]> = {};
  trip.items?.forEach((item) => {
    if (!daysMap[item.dayNumber]) {
      daysMap[item.dayNumber] = [];
    }
    daysMap[item.dayNumber].push(item);
  });

  const sortedDayNumbers = Object.keys(daysMap)
    .map(Number)
    .sort((a, b) => a - b);

  // Map markers for items on this trip
  const mapItems: MapItem[] = [];
  trip.items?.forEach((item) => {
    if (item.attraction) {
      mapItems.push({
        id: item.attraction.id,
        name: item.attraction.name,
        category: 'attraction',
        latitude: item.attraction.latitude,
        longitude: item.attraction.longitude,
        imageUrl: item.attraction.imageUrl,
        subtitle: `Day ${item.dayNumber} • ${item.attraction.category}`,
        link: `/attractions/${item.attraction.slug}`,
      });
    } else if (item.destination) {
      mapItems.push({
        id: item.destination.id,
        name: item.destination.name,
        category: 'destination',
        latitude: item.destination.latitude,
        longitude: item.destination.longitude,
        imageUrl: item.destination.imageUrl,
        subtitle: `Day ${item.dayNumber} • ${item.destination.state}`,
        link: `/destinations/${item.destination.slug}`,
      });
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Trip Header Banner */}
      <div className="bg-[#DDD0C8]/25 p-8 rounded-3xl border border-default flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-white px-3 py-1 rounded-full text-[#323232] shadow-2xs">
              Trip Itinerary
            </span>
            <span className="text-xs text-[#555555]">
              {trip.startDate ? `${trip.startDate} to ${trip.endDate || ''}` : 'Dates Unspecified'}
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#323232]">
            {trip.name}
          </h1>

          {trip.description && (
            <p className="text-xs sm:text-sm text-[#555555] max-w-2xl leading-relaxed">
              {trip.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsEditTripOpen(true)}
            className="px-4 py-2.5 rounded-xl border border-default bg-white hover:bg-gray-50 text-[#323232] text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Trip Info</span>
          </button>

          <button
            onClick={() => setIsAddItemOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-[#323232] hover:bg-black text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Stop to Itinerary</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Day-by-Day Itinerary & Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Day-by-Day Timeline */}
        <div className="lg:col-span-2 space-y-8">
          {sortedDayNumbers.length === 0 ? (
            <div className="p-12 rounded-3xl bg-white border border-default text-center space-y-3">
              <Calendar className="w-10 h-10 text-[#DDD0C8] mx-auto" />
              <h3 className="font-serif text-xl font-bold text-[#323232]">No Itinerary Stops Yet</h3>
              <p className="text-xs text-[#555555] max-w-sm mx-auto">
                Add destinations, monuments, and attractions to plan your daily sightseeing schedule.
              </p>
              <button
                onClick={() => setIsAddItemOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#323232] text-white text-xs font-bold"
              >
                Add First Stop
              </button>
            </div>
          ) : (
            sortedDayNumbers.map((dayNum) => {
              const dayItems = daysMap[dayNum];
              return (
                <div key={dayNum} className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-default/70">
                    <h3 className="font-serif text-xl font-bold text-[#323232] flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-[#323232] text-white text-xs font-sans flex items-center justify-center font-bold">
                        {dayNum}
                      </span>
                      <span>Day {dayNum} Itinerary</span>
                    </h3>
                    <span className="text-xs text-[#555555] font-semibold">
                      {dayItems.length} {dayItems.length === 1 ? 'Stop' : 'Stops'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {dayItems.map((item, idx) => {
                      const entity = item.attraction || item.destination;
                      if (!entity) return null;
                      const isAttr = !!item.attraction;
                      const link = isAttr
                        ? `/attractions/${(entity as any).slug}`
                        : `/destinations/${(entity as any).slug}`;

                      return (
                        <div
                          key={item.id}
                          className="bg-white rounded-2xl border border-default p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-4">
                            <img
                              src={(entity as any).imageUrl}
                              alt={entity.name}
                              className="w-16 h-16 rounded-xl object-cover shrink-0"
                            />
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#555555]">
                                {isAttr ? (entity as any).category : 'Destination'}
                              </span>
                              <h4 className="font-serif font-bold text-base text-[#323232]">
                                <Link to={link} className="hover:underline">
                                  {entity.name}
                                </Link>
                              </h4>
                              {item.notes && (
                                <p className="text-xs text-[#555555] italic mt-0.5">
                                  📝 {item.notes}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            {/* Reorder controls */}
                            <button
                              onClick={() => handleReorder(item.id, item.sortOrder - 1)}
                              className="p-1.5 rounded-lg border border-default hover:bg-gray-50 text-gray-500"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleReorder(item.id, item.sortOrder + 1)}
                              className="p-1.5 rounded-lg border border-default hover:bg-gray-50 text-gray-500"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                              title="Remove Stop"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Route Map */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-default space-y-3 shadow-xs">
            <h3 className="font-serif text-lg font-bold text-[#323232]">
              Trip Route & Geographic Stops
            </h3>
            <p className="text-xs text-[#555555]">
              Markers display every monument and destination scheduled on this trip.
            </p>

            <IndiaMap items={mapItems} height="360px" />
          </div>
        </div>
      </div>

      {/* Add Stop Modal */}
      {isAddItemOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-default space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#323232]">
              Add Stop to Itinerary
            </h3>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#323232] mb-1">
                  Day of Itinerary
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={itemDay}
                  onChange={(e) => setItemDay(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-default bg-white focus:outline-none focus:ring-2 focus:ring-[#323232]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#323232] mb-1">
                  Choose Attraction (or Destination below)
                </label>
                <select
                  value={selectedAttractionId}
                  onChange={(e) => {
                    setSelectedAttractionId(e.target.value);
                    if (e.target.value) setSelectedDestinationId('');
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-default bg-white focus:outline-none focus:ring-2 focus:ring-[#323232]"
                >
                  <option value="">-- Select an Attraction --</option>
                  {attractions.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.category})
                    </option>
                  ))}
                </select>
              </div>

              {!selectedAttractionId && (
                <div>
                  <label className="block text-xs font-semibold text-[#323232] mb-1">
                    Or Choose Destination City/Hub
                  </label>
                  <select
                    value={selectedDestinationId}
                    onChange={(e) => setSelectedDestinationId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-default bg-white focus:outline-none focus:ring-2 focus:ring-[#323232]"
                  >
                    <option value="">-- Select a Destination --</option>
                    {destinations.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.state})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#323232] mb-1">
                  Personal Notes / Timing
                </label>
                <textarea
                  rows={2}
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                  placeholder="e.g. Arrive at sunrise, book tour guide, entry pass..."
                  className="w-full p-2.5 text-xs rounded-xl border border-default bg-white focus:outline-none focus:ring-2 focus:ring-[#323232]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddItemOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#555555] rounded-xl hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding || (!selectedAttractionId && !selectedDestinationId)}
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-[#323232] text-white hover:bg-black transition-colors disabled:opacity-50"
                >
                  {adding ? 'Adding...' : 'Add Stop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Trip Modal */}
      {isEditTripOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-default space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#323232]">
              Edit Trip Details
            </h3>

            <form onSubmit={handleUpdateTrip} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#323232] mb-1">
                  Trip Name *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-default bg-white focus:outline-none focus:ring-2 focus:ring-[#323232]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#323232] mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={editStart}
                    onChange={(e) => setEditStart(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-default bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#323232] mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={editEnd}
                    onChange={(e) => setEditEnd(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-default bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#323232] mb-1">
                  Description / Purpose
                </label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-default bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditTripOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#555555] rounded-xl hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-[#323232] text-white hover:bg-black"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
