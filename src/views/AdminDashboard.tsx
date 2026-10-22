import React, { useState, useEffect } from 'react';
import { UserAccount, PaymentSubmission, LessonSlot, Subscription, LearningResource, PlatformSettings, AuditLog } from '../types';
import { api } from '../services/api';
import {
  ShieldCheck,
  DollarSign,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Video,
  Download,
  Award,
  Settings,
  Plus,
  RefreshCw,
  Search,
  BookOpen
} from 'lucide-react';

interface AdminDashboardProps {
  admin: UserAccount;
  onNavigate: (view: string) => void;
  onSettingsUpdate?: (newSettings: PlatformSettings) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ admin, onNavigate, onSettingsUpdate }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'lessons' | 'attendance' | 'reports' | 'resources' | 'quizzes' | 'announcements' | 'settings' | 'audit'>('overview');
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [payments, setPayments] = useState<PaymentSubmission[]>([]);
  const [lessons, setLessons] = useState<LessonSlot[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);

  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  // Payment Verification Modals
  const [rejectingPayment, setRejectingPayment] = useState<PaymentSubmission | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Lesson Creation Modal
  const [showCreateLesson, setShowCreateLesson] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonSubject, setNewLessonSubject] = useState('Mathematics');
  const [newLessonGrade, setNewLessonGrade] = useState('Grade 11');
  const [newLessonDate, setNewLessonDate] = useState('2026-11-04');
  const [newLessonStartTime, setNewLessonStartTime] = useState('10:00');
  const [newLessonEndTime, setNewLessonEndTime] = useState('11:30');
  const [newLessonCapacity, setNewLessonCapacity] = useState(25);
  const [newLessonMeetingLink, setNewLessonMeetingLink] = useState('https://meet.google.com/hth-class-room');

  // Attendance Recording State
  const [attLessonId, setAttLessonId] = useState('');
  const [attStudentId, setAttStudentId] = useState('usr-student-faith');
  const [attStatus, setAttStatus] = useState<'Present' | 'Absent' | 'Late' | 'Excused'>('Present');
  const [attNotes, setAttNotes] = useState('');

  // Progress Report State
  const [repStudentId, setRepStudentId] = useState('usr-student-faith');
  const [repObs, setRepObs] = useState('');
  const [repImprove, setRepImprove] = useState('');
  const [repRecom, setRepRecom] = useState('');

  // Platform Settings State
  const [editBrandName, setEditBrandName] = useState('HOLIDAY TUITION HUB');
  const [editTutorBio, setEditTutorBio] = useState('');
  const [editWeeklyPrice, setEditWeeklyPrice] = useState(699);
  const [editCommencement, setEditCommencement] = useState('2026-11-01');
  const [editEnd, setEditEnd] = useState('2026-11-22');
  const [editWhatsapp, setEditWhatsapp] = useState('0708083643');
  const [editMpesa, setEditMpesa] = useState('0116654805');
  const [editEnrollmentState, setEditEnrollmentState] = useState<'Enrollment open' | 'Enrollment opening soon' | 'Enrollment closed' | 'Program in progress' | 'Program completed'>('Enrollment open');

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [ov, pays, less, subs, logs, pub] = await Promise.all([
        api.getAdminOverview(),
        api.getAdminPayments(),
        api.getAdminLessons(),
        api.getAdminSubscriptions(),
        api.getAuditLogs(),
        api.getPublicData()
      ]);
      setOverview(ov);
      setPayments(pays);
      setLessons(less);
      setSubscriptions(subs);
      setAuditLogs(logs);
      if (pub?.settings) {
        setSettings(pub.settings);
        setEditBrandName(pub.settings.brandName);
        setEditTutorBio(pub.settings.tutorBio);
        setEditWeeklyPrice(pub.settings.weeklyPrice);
        setEditCommencement(pub.settings.commencementDate);
        setEditEnd(pub.settings.endDate);
        setEditWhatsapp(pub.settings.whatsappNumber);
        setEditMpesa(pub.settings.mpesaNumber);
        setEditEnrollmentState(pub.settings.enrollmentState);
      }
    } catch (err: any) {
      setError(err.message || 'Error loading administrator dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleVerifyPayment = async (paymentId: string) => {
    try {
      const res = await api.verifyPayment(paymentId);
      if (res.success) {
        setMsg(res.message);
        await loadAllData();
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed.');
    }
  };

  const handleRejectPayment = async () => {
    if (!rejectingPayment || !rejectionReason.trim()) return;
    try {
      const res = await api.rejectPayment(rejectingPayment.id, rejectionReason);
      if (res.success) {
        setMsg(res.message);
        setRejectingPayment(null);
        setRejectionReason('');
        await loadAllData();
      }
    } catch (err: any) {
      setError(err.message || 'Rejection failed.');
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createLesson({
        title: newLessonTitle.trim(),
        subject: newLessonSubject,
        grade: newLessonGrade,
        date: newLessonDate,
        startTime: newLessonStartTime,
        endTime: newLessonEndTime,
        capacity: newLessonCapacity,
        meetingLink: newLessonMeetingLink.trim(),
        tutorName: 'Daniel Owino'
      });
      if (res.success) {
        setMsg(res.message);
        setShowCreateLesson(false);
        setNewLessonTitle('');
        await loadAllData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create lesson.');
    }
  };

  const handleRecordAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attLessonId) {
      setError('Please select a lesson to record attendance for.');
      return;
    }
    try {
      const res = await api.recordAttendance({
        lessonId: attLessonId,
        studentId: attStudentId,
        status: attStatus,
        notes: attNotes.trim()
      });
      if (res.success) {
        setMsg(res.message);
        setAttNotes('');
        await loadAllData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save attendance record.');
    }
  };

  const handlePublishReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repObs.trim()) {
      setError('Please provide tutor observations.');
      return;
    }
    try {
      const res = await api.publishProgressReport({
        studentId: repStudentId,
        tutorObservations: repObs.trim(),
        areasForImprovement: repImprove.trim(),
        revisionRecommendations: repRecom.trim()
      });
      if (res.success) {
        setMsg(res.message);
        setRepObs('');
        setRepImprove('');
        setRepRecom('');
        await loadAllData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to publish progress report.');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.updateSettings({
        brandName: editBrandName.trim(),
        tutorBio: editTutorBio.trim(),
        weeklyPrice: Number(editWeeklyPrice),
        commencementDate: editCommencement,
        endDate: editEnd,
        whatsappNumber: editWhatsapp.trim(),
        mpesaNumber: editMpesa.trim(),
        enrollmentState: editEnrollmentState
      });
      if (res.success) {
        setMsg('Platform settings updated successfully!');
        if (onSettingsUpdate && res.settings) onSettingsUpdate(res.settings);
        await loadAllData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save platform settings.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-xs text-slate-500">Loading administrator control panel...</p>
      </div>
    );
  }

  const pendingPayments = payments.filter(p => p.status === 'Submitted for verification' || p.status === 'Under review');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Admin Profile & Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrator & Lead Tutor Control Panel</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-sans">
            Daniel Owino — Platform Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Official Tutor & Owner • Full access to student records, verified M-Pesa accounting, lesson scheduling, and reporting.
          </p>
        </div>

        {/* CSV Export Quick Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="/api/admin/export/csv?type=payments"
            download
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            Export Payments CSV
          </a>
          <a
            href="/api/admin/export/csv?type=attendance"
            download
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            Export Attendance CSV
          </a>
          <button
            onClick={loadAllData}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
            title="Refresh database"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      {msg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center justify-between">
          <span>{msg}</span>
          <button onClick={() => setMsg('')} className="font-bold underline">Dismiss</button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="font-bold underline">Dismiss</button>
        </div>
      )}

      {/* Admin Navigation Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
        >
          Overview Stats
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2.5 rounded-xl transition-all relative ${activeTab === 'payments' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
        >
          <span>Payment Queue</span>
          {pendingPayments.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-extrabold">
              {pendingPayments.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('lessons')}
          className={`px-4 py-2.5 rounded-xl transition-all ${activeTab === 'lessons' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
        >
          Lesson Scheduling
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2.5 rounded-xl transition-all ${activeTab === 'attendance' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
        >
          Record Attendance
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2.5 rounded-xl transition-all ${activeTab === 'reports' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
        >
          Progress Reports
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
        >
          Platform Settings
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 rounded-xl transition-all ${activeTab === 'audit' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
        >
          Security Audit Log
        </button>
      </div>

      {/* ---------------- Tab 1: OVERVIEW ---------------- */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="text-xs text-slate-500">Verified Revenue</div>
              <div className="text-2xl font-extrabold text-emerald-700">
                KSh {overview?.totalVerifiedRevenue || 0}
              </div>
              <div className="text-[11px] text-slate-500">Only confirmed payments counted</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="text-xs text-slate-500">Pending Payment Reviews</div>
              <div className="text-2xl font-extrabold text-amber-600">
                {overview?.pendingPaymentCount || 0}
              </div>
              <div className="text-[11px] text-slate-500">Awaiting your manual verification</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="text-xs text-slate-500">Registered Students</div>
              <div className="text-2xl font-extrabold text-slate-900">
                {overview?.studentCount || 0}
              </div>
              <div className="text-[11px] text-blue-700 font-semibold">Grades 9 to 14</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="text-xs text-slate-500">Overall Attendance Rate</div>
              <div className="text-2xl font-extrabold text-slate-900">
                {overview?.overallAttendanceRate || 100}%
              </div>
              <div className="text-[11px] text-slate-500">Across all completed lessons</div>
            </div>
          </div>

          {/* Quick Queue Notification */}
          {pendingPayments.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-amber-950 text-base">
                  {pendingPayments.length} Payment Submission{pendingPayments.length > 1 ? 's' : ''} Awaiting Review
                </h3>
                <p className="text-xs text-amber-900 mt-0.5">
                  Verify M-Pesa transaction codes to immediately unlock 7-day subscriptions for these students.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('payments')}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                Review Payments Queue →
              </button>
            </div>
          )}
        </div>
      )}

      {/* ---------------- Tab 2: PAYMENTS VERIFICATION QUEUE ---------------- */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900 font-sans">
              M-Pesa Payment Verification Queue
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Official recipient: <strong>Daniel Owino (0116654805)</strong>. Submissions remain unactivated until verified here.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">M-Pesa Code</th>
                  <th className="p-3">Claimed Amount</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Paying Phone</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map(pay => (
                  <tr key={pay.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-900">
                      {pay.studentName}
                      <div className="text-[10px] text-slate-400 font-normal">{pay.studentEmail}</div>
                    </td>
                    <td className="p-3 font-mono font-bold text-blue-900">{pay.mpesaCode}</td>
                    <td className="p-3 font-semibold">KSh {pay.amountPaid}</td>
                    <td className="p-3 text-slate-600">{pay.transactionDate}</td>
                    <td className="p-3 text-slate-600 font-mono">{pay.payingPhoneNumber}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                        pay.status === 'Verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : pay.status === 'Rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {pay.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      {pay.status !== 'Verified' ? (
                        <>
                          <button
                            onClick={() => handleVerifyPayment(pay.id)}
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg transition-colors"
                          >
                            Verify & Activate (7 Days)
                          </button>
                          <button
                            onClick={() => { setRejectingPayment(pay); setRejectionReason(''); }}
                            className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 font-bold text-xs rounded-lg transition-colors"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-semibold">
                          Verified by {pay.verifiedBy || 'Daniel Owino'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------- Tab 3: LESSON SCHEDULING ---------------- */}
      {activeTab === 'lessons' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-sans">
                Live Lesson Timetable Management
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Configure published slots in <strong>Africa/Nairobi (EAT)</strong>. Double bookings and capacity clashes are prevented.
              </p>
            </div>
            <button
              onClick={() => setShowCreateLesson(true)}
              className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Publish New Lesson Slot</span>
            </button>
          </div>

          <div className="space-y-3">
            {lessons.map(lesson => {
              const confirmedCount = lesson.bookings.filter(b => b.status === 'Confirmed').length;
              return (
                <div key={lesson.id} className="p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {lesson.subject}
                      </span>
                      <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {lesson.grade}
                      </span>
                      <span className="text-xs text-slate-500">
                        {lesson.date} • {lesson.startTime} – {lesson.endTime} (EAT)
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-900">{lesson.title}</h3>
                    <div className="text-xs text-slate-500">
                      Bookings: <strong>{confirmedCount} / {lesson.capacity}</strong> • Status: {lesson.status}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200 max-w-[200px] truncate">
                      {lesson.meetingLink}
                    </span>
                    <button
                      onClick={async () => {
                        const newStatus = lesson.status === 'Published' ? 'Cancelled' : 'Published';
                        await api.updateLessonStatus(lesson.id, newStatus);
                        await loadAllData();
                      }}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 hover:bg-slate-100"
                    >
                      {lesson.status === 'Published' ? 'Cancel Slot' : 'Publish'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------- Tab 4: ATTENDANCE RECORDING ---------------- */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900 font-sans">
              Record Student Lesson Attendance
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Attendance records are visible on both student and linked parent dashboards.
            </p>
          </div>

          <form onSubmit={handleRecordAttendance} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Lesson Slot *
              </label>
              <select
                required
                value={attLessonId}
                onChange={(e) => setAttLessonId(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              >
                <option value="">-- Choose a published lesson --</option>
                {lessons.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.date} ({l.startTime}) - {l.title} ({l.subject})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Student Account *
                </label>
                <select
                  value={attStudentId}
                  onChange={(e) => setAttStudentId(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                >
                  <option value="usr-student-faith">Faith Wanjiru (Grade 11)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Attendance Status *
                </label>
                <select
                  value={attStatus}
                  onChange={(e) => setAttStatus(e.target.value as any)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                >
                  <option value="Present">Present (Attended Full Class)</option>
                  <option value="Absent">Absent (Did not attend)</option>
                  <option value="Late">Late Arrival</option>
                  <option value="Excused">Excused Absence</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tutor Notes / Whiteboard Participation:
              </label>
              <input
                type="text"
                value={attNotes}
                onChange={(e) => setAttNotes(e.target.value)}
                placeholder="e.g. Active participation in calculus curve sketching"
                className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Save Attendance Record
            </button>
          </form>
        </div>
      )}

      {/* ---------------- Tab 5: PROGRESS REPORTS ---------------- */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900 font-sans">
              Publish Student Academic Progress Report
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Compiles actual attendance and quiz statistics alongside your personalized tutor evaluation.
            </p>
          </div>

          <form onSubmit={handlePublishReport} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student *
              </label>
              <select
                value={repStudentId}
                onChange={(e) => setRepStudentId(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              >
                <option value="usr-student-faith">Faith Wanjiru (Grade 11)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tutor Academic Observations *
              </label>
              <textarea
                required
                rows={3}
                value={repObs}
                onChange={(e) => setRepObs(e.target.value)}
                placeholder="Describe the student's mastery of core topics, engagement, and conceptual understanding..."
                className="w-full text-xs p-3.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Areas Requiring Improvement
              </label>
              <textarea
                rows={2}
                value={repImprove}
                onChange={(e) => setRepImprove(e.target.value)}
                placeholder="Specific weak points or formulaic errors noted during practice..."
                className="w-full text-xs p-3.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Revision Recommendations
              </label>
              <textarea
                rows={2}
                value={repRecom}
                onChange={(e) => setRepRecom(e.target.value)}
                placeholder="Recommended drills, worksheets, and preparation tasks..."
                className="w-full text-xs p-3.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              ></textarea>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Publish Report to Student & Parent Portals
            </button>
          </form>
        </div>
      )}

      {/* ---------------- Tab 6: PLATFORM SETTINGS ---------------- */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900 font-sans">
              Holiday Tuition Hub Platform Settings
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Edit brand information, tutor biography, M-Pesa recipient numbers, and cohort dates without code modifications.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-5 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Brand Name *
                </label>
                <input
                  type="text"
                  required
                  value={editBrandName}
                  onChange={(e) => setEditBrandName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Weekly Tuition Fee (KSh) *
                </label>
                <input
                  type="number"
                  required
                  value={editWeeklyPrice}
                  onChange={(e) => setEditWeeklyPrice(Number(e.target.value))}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  M-Pesa Payment Recipient Number *
                </label>
                <input
                  type="text"
                  required
                  value={editMpesa}
                  onChange={(e) => setEditMpesa(e.target.value)}
                  placeholder="0116654805"
                  className="w-full text-xs font-mono px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <span className="text-[10px] text-slate-400">Strictly for M-Pesa Send Money payments</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official WhatsApp Contact Number *
                </label>
                <input
                  type="text"
                  required
                  value={editWhatsapp}
                  onChange={(e) => setEditWhatsapp(e.target.value)}
                  placeholder="0708083643"
                  className="w-full text-xs font-mono px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <span className="text-[10px] text-slate-400">Floating WhatsApp widget (0708083643)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Commencement Date *
                </label>
                <input
                  type="date"
                  required
                  value={editCommencement}
                  onChange={(e) => setEditCommencement(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  required
                  value={editEnd}
                  onChange={(e) => setEditEnd(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Enrollment State *
                </label>
                <select
                  value={editEnrollmentState}
                  onChange={(e) => setEditEnrollmentState(e.target.value as any)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                >
                  <option value="Enrollment open">Enrollment open</option>
                  <option value="Enrollment opening soon">Enrollment opening soon</option>
                  <option value="Enrollment closed">Enrollment closed</option>
                  <option value="Program in progress">Program in progress</option>
                  <option value="Program completed">Program completed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tutor Biography (Daniel Owino) *
              </label>
              <textarea
                required
                rows={4}
                value={editTutorBio}
                onChange={(e) => setEditTutorBio(e.target.value)}
                className="w-full text-xs p-3.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
              ></textarea>
            </div>

            <button
              type="submit"
              className="px-8 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              Save Platform Configuration
            </button>
          </form>
        </div>
      )}

      {/* ---------------- Tab 7: SECURITY AUDIT LOG ---------------- */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-xl font-bold text-slate-900 font-sans">
            Administrative & Financial Audit Trail
          </h2>
          <p className="text-xs text-slate-500">
            Immutable log of sensitive actions (payment verifications, link approvals, resource publications).
          </p>

          <div className="divide-y divide-slate-100 text-xs">
            {auditLogs.map(log => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded text-[10px]">
                    {log.action}
                  </span>
                  <p className="text-slate-800">{log.details}</p>
                  <div className="text-[10px] text-slate-400">Actor: {log.adminName}</div>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">{log.timestamp.split('T')[0]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Lesson Modal */}
      {showCreateLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-slate-900 font-sans">
              Create & Publish Live Lesson Slot
            </h3>

            <form onSubmit={handleCreateLesson} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lesson Title *
                </label>
                <input
                  type="text"
                  required
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  placeholder="e.g. Grade 11 Mathematics: Coordinate Geometry"
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subject *
                  </label>
                  <select
                    value={newLessonSubject}
                    onChange={(e) => setNewLessonSubject(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="English">English</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Kiswahili">Kiswahili</option>
                    <option value="Computer Studies">Computer Studies</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Grade *
                  </label>
                  <select
                    value={newLessonGrade}
                    onChange={(e) => setNewLessonGrade(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                    <option value="Grade 13">Grade 13</option>
                    <option value="Grade 14">Grade 14</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newLessonDate}
                    onChange={(e) => setNewLessonDate(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Start (EAT) *
                  </label>
                  <input
                    type="time"
                    required
                    value={newLessonStartTime}
                    onChange={(e) => setNewLessonStartTime(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    End (EAT) *
                  </label>
                  <input
                    type="time"
                    required
                    value={newLessonEndTime}
                    onChange={(e) => setNewLessonEndTime(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Google Meet / Zoom Classroom Link *
                </label>
                <input
                  type="url"
                  required
                  value={newLessonMeetingLink}
                  onChange={(e) => setNewLessonMeetingLink(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateLesson(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Publish Lesson Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Payment Modal */}
      {rejectingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900 font-sans">
              Reject Payment Submission: {rejectingPayment.mpesaCode}
            </h3>
            <p className="text-xs text-slate-600">
              Student: <strong>{rejectingPayment.studentName}</strong> (KSh {rejectingPayment.amountPaid})
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Rejection *
              </label>
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Transaction code not found in Safaricom M-Pesa statement, or name mismatch..."
                className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectingPayment(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectPayment}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg shadow-xs"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
