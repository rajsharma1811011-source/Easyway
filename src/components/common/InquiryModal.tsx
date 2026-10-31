import React, { useState } from 'react';
import { X, Send, CheckCircle2, AlertCircle, Calendar, Mail, User as UserIcon, MessageSquare } from 'lucide-react';
import { apiRequest } from '../../services/api.ts';
import { useAuth } from '../../context/AuthContext.tsx';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientType: 'HOTEL' | 'GUIDE' | 'GENERAL';
  recipientId?: string;
  recipientName: string;
}

export const InquiryModal: React.FC<InquiryModalProps> = ({
  isOpen,
  onClose,
  recipientType,
  recipientId,
  recipientName,
}) => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [travelDate, setTravelDate] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await apiRequest('/inquiries', {
        method: 'POST',
        body: JSON.stringify({
          recipientType,
          recipientId,
          name,
          email,
          travelDate: travelDate || null,
          message,
        }),
      });

      if (res.success) {
        setSuccess(true);
      } else {
        setError(res.error || 'Failed to submit inquiry. Please check your inputs.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-default overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#DDD0C8]/25 border-b border-default">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#323232]">
              Send Travel Inquiry
            </h3>
            <p className="text-xs text-[#555555]">
              To: <strong className="text-[#323232]">{recipientName}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-[#323232] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="text-lg font-bold text-[#323232]">Inquiry Sent Successfully</h4>
              <p className="text-sm text-[#555555] max-w-sm mx-auto">
                Thank you! Your travel inquiry for <strong>{recipientName}</strong> has been saved.
                Our partner coordinator will get back to you at <strong>{email}</strong>.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2.5 rounded-xl bg-[#323232] text-white font-semibold text-sm hover:bg-black transition-colors"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#323232] mb-1">
                    Your Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-default bg-white focus:outline-none focus:ring-2 focus:ring-[#323232]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#323232] mb-1">
                    Your Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. john@example.com"
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-default bg-white focus:outline-none focus:ring-2 focus:ring-[#323232]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#323232] mb-1">
                  Expected Travel Date (Optional)
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="date"
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-default bg-white focus:outline-none focus:ring-2 focus:ring-[#323232]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#323232] mb-1">
                  Message & Specific Requirements
                </label>
                <div className="relative">
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about your group size, travel interests, dietary preferences, or specific queries..."
                    className="w-full p-3 text-sm rounded-xl border border-default bg-white focus:outline-none focus:ring-2 focus:ring-[#323232]"
                  />
                </div>
              </div>

              <div className="bg-[#DDD0C8]/20 p-3 rounded-xl text-[11px] text-[#555555]">
                Note: EasyWay facilitates discovery and inquiries. We do not charge booking fees or request advance payment details.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-semibold text-[#555555] hover:text-[#323232] rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl bg-[#323232] text-white hover:bg-black transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Sending...' : 'Send Inquiry'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
