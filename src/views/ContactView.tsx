import React, { useState } from 'react';
import { PlatformSettings, UserAccount } from '../types';
import { api } from '../services/api';
import { Phone, Mail, MessageCircle, MapPin, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface ContactViewProps {
  settings?: PlatformSettings;
  currentUser: UserAccount | null;
}

export const ContactView: React.FC<ContactViewProps> = ({ settings, currentUser }) => {
  const tutorName = settings?.tutorName || 'Daniel Owino';
  const mpesaNumber = settings?.mpesaNumber || '0116654805';
  const whatsappNumber = settings?.whatsappNumber || '0708083643';
  const tutorEmail = settings?.tutorEmail || 'danielowino233@gmail.com';

  const [category, setCategory] = useState('General');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.submitInquiry({
        userId: currentUser ? currentUser.id : 'usr-guest',
        category,
        subject: subject.trim(),
        message: message.trim()
      });

      if (res.success) {
        setSubmitted(true);
        setSubject('');
        setMessage('');
      } else {
        setError(res.message || 'Failed to submit inquiry.');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to support service.');
    } finally {
      setLoading(false);
    }
  };

  const whatsappLink = `https://wa.me/254${whatsappNumber.replace(/^0/, '')}?text=${encodeURIComponent('Hello, I would like to inquire about Holiday Tuition Hub.')}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 inline-block px-3 py-1 rounded-full border border-blue-200">
          Support & Communications
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-sans">
          Contact Holiday Tuition Hub
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          Reach out directly to lead tutor Daniel Owino for questions regarding subject curriculums, lesson schedules, M-Pesa payment verification, or student enrollment.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Information Cards */}
        <div className="lg:col-span-5 space-y-4">
          {/* WhatsApp Direct Card */}
          <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-6 space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <MessageCircle className="w-5 h-5 text-emerald-700" />
              <span>Official WhatsApp Assistance</span>
            </div>
            <p className="text-xs text-emerald-900 leading-relaxed">
              Connect directly on WhatsApp with Daniel Owino for quick answers and academic guidance:
            </p>
            <div className="pt-1">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <span>Open WhatsApp ({whatsappNumber})</span>
              </a>
            </div>
            <div className="text-[11px] text-emerald-800 italic pt-1">
              Note: This is our dedicated WhatsApp inquiry line.
            </div>
          </div>

          {/* M-Pesa Payment Details Notice */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              M-Pesa Tuition Recipient
            </div>
            <div className="text-base font-bold text-slate-900">{tutorName}</div>
            <div className="text-sm font-mono font-extrabold text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
              M-Pesa Number: {mpesaNumber}
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
              Payment method: <strong>M-Pesa Send Money</strong>. Send KSh 699 weekly fee strictly to this number.
            </p>
          </div>

          {/* Email & Location Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 text-xs text-slate-600">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-blue-700 shrink-0" />
              <div>
                <div className="font-semibold text-slate-900">Direct Email</div>
                <div>{tutorEmail}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
              <Clock className="w-4 h-4 text-blue-700 shrink-0" />
              <div>
                <div className="font-semibold text-slate-900">Time Zone</div>
                <div>Africa/Nairobi (EAT, UTC+3)</div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
              <MapPin className="w-4 h-4 text-blue-700 shrink-0" />
              <div>
                <div className="font-semibold text-slate-900">Coverage</div>
                <div>All high schools across Kenya (Grades 9–14)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Message / Inquiry Form */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900 font-sans">
              Send an Academic Inquiry
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Have a question about scheduling or lesson access? Submit your message below.
            </p>
          </div>

          {submitted && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-start gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-emerald-900">Inquiry Received!</strong>
                Your inquiry has been sent to Daniel Owino. You can track responses inside your portal.
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Inquiry Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              >
                <option value="General">General Inquiries</option>
                <option value="Lesson Scheduling">Lesson Scheduling & Timetable</option>
                <option value="Payment Verification">M-Pesa Payment Verification</option>
                <option value="Learning Resources">Learning Materials & Notes</option>
                <option value="Account">Account Access & Portals</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subject Line *
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Question regarding Grade 11 Chemistry titration slot"
                className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Detailed Message *
              </label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please describe your question or issue in detail..."
                className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed"
              ></textarea>
            </div>

            <div className="text-[11px] text-slate-500">
              Inquiries are answered in Africa/Nairobi time by Daniel Owino.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
            >
              {loading ? 'Submitting Inquiry...' : 'Submit Inquiry to Daniel Owino'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
