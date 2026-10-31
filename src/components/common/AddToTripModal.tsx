import React, { useState, useEffect } from 'react';
import { X, Calendar, Plus, Check, AlertCircle } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { Trip } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { useNavigate } from 'react-router-dom';

interface AddToTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  destinationId?: string;
  attractionId?: string;
  itemName: string;
}

export const AddToTripModal: React.FC<AddToTripModalProps> = ({
  isOpen,
  onClose,
  destinationId,
  attractionId,
  itemName,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [dayNumber, setDayNumber] = useState<number>(1);
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      setLoading(true);
      setError(null);
      setSuccess(false);
      apiRequest<Trip[]>('/trips')
        .then((res) => {
          if (res.success && res.data) {
            setTrips(res.data);
            if (res.data.length > 0) {
              setSelectedTripId(res.data[0].id);
            }
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
        <div className="w-full max-w-md bg-white rounded-2xl p-6 text-center space-y-4 border border-default">
          <Calendar className="w-12 h-12 text-[#DDD0C8] mx-auto" />
          <h3 className="font-serif text-xl font-bold text-[#323232]">Sign In to Plan Trips</h3>
          <p className="text-sm text-[#555555]">
            Create itineraries, organize day-by-day destinations, and save travel plans with an EasyWay account.
          </p>
          <div className="flex gap-2 justify-center pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-[#555555] rounded-xl hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onClose();
                navigate('/login');
              }}
              className="px-5 py-2 text-sm font-semibold text-white bg-[#323232] rounded-xl hover:bg-black"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTripId) {
      setError('Please select or create a trip first.');
      return;
    }

    setAdding(true);
    setError(null);

    try {
      const res = await apiRequest(`/trips/${selectedTripId}/items`, {
        method: 'POST',
        body: JSON.stringify({
          destinationId: destinationId || null,
          attractionId: attractionId || null,
          dayNumber: Number(dayNumber) || 1,
          notes: notes || null,
        }),
      });

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setError(res.error || 'Failed to add item to trip');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-default overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 bg-[#DDD0C8]/25 border-b border-default">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#323232]">Add to Itinerary</h3>
            <p className="text-xs text-[#555555] truncate max-w-xs">{itemName}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-[#323232]">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-6 space-y-2">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-[#323232]">Added to Itinerary!</h4>
              <p className="text-xs text-[#555555]">
                {itemName} is now part of your selected trip.
              </p>
            </div>
          ) : trips.length === 0 && !loading ? (
            <div className="text-center py-6 space-y-3">
              <Calendar className="w-10 h-10 text-[#DDD0C8] mx-auto" />
              <p className="text-sm font-semibold text-[#323232]">You don't have any trips yet</p>
              <p className="text-xs text-[#555555]">Create your first trip in the Trip Planner to start adding destinations.</p>
              <button
                onClick={() => {
                  onClose();
                  navigate('/trips');
                }}
                className="px-4 py-2 text-sm font-semibold bg-[#323232] text-white rounded-xl hover:bg-black transition-colors"
              >
                Go to Trip Planner
              </button>
            </div>
          ) : (
            <form onSubmit={handleAdd} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#323232] mb-1">Select Trip</label>
                <select
                  value={selectedTripId}
                  onChange={(e) => setSelectedTripId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-default bg-white focus:outline-none focus:ring-2 focus:ring-[#323232]"
                >
                  {trips.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.startDate || 'Unscheduled'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#323232] mb-1">Day of Itinerary</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={dayNumber}
                  onChange={(e) => setDayNumber(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-default bg-white focus:outline-none focus:ring-2 focus:ring-[#323232]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#323232] mb-1">Itinerary Notes (Optional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Visit at sunset, buy entry tickets online, take camera..."
                  className="w-full p-2.5 text-sm rounded-xl border border-default bg-white focus:outline-none focus:ring-2 focus:ring-[#323232]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-semibold text-[#555555] rounded-xl hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold rounded-xl bg-[#323232] text-white hover:bg-black transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>{adding ? 'Adding...' : 'Add to Trip'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
