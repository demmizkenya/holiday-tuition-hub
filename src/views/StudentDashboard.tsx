import React, { useState, useEffect } from 'react';
import { UserAccount, LessonSlot, LearningResource, AssignmentItem, QuizItem, Subscription, PaymentSubmission, AttendanceRecord, ProgressReport } from '../types';
import { api } from '../services/api';
import {
  BookOpen,
  Calendar,
  Clock,
  Video,
  FileText,
  Award,
  Shield,
  CheckCircle,
  AlertCircle,
  Download,
  Copy,
  Check,
  Send,
  ExternalLink,
  MessageCircle,
  Play
} from 'lucide-react';

interface StudentDashboardProps {
  student: UserAccount;
  onNavigate: (view: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ student, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'recordings' | 'materials' | 'assignments' | 'quizzes' | 'attendance' | 'payments' | 'support'>('overview');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  // Payment form states
  const [mpesaCode, setMpesaCode] = useState('');
  const [payingPhone, setPayingPhone] = useState(student.phone);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentNote, setPaymentNote] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [copiedMpesa, setCopiedMpesa] = useState(false);

  // Lesson Booking states
  const [bookingNote, setBookingNote] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  // Quiz taking states
  const [activeQuiz, setActiveQuiz] = useState<QuizItem | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<any>(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  // Assignment submission states
  const [activeAssignment, setActiveAssignment] = useState<AssignmentItem | null>(null);
  const [assignmentText, setAssignmentText] = useState('');
  const [submittingAssignment, setSubmittingAssignment] = useState(false);

  // Support inquiry
  const [inquiryCategory, setInquiryCategory] = useState('Lesson Scheduling');
  const [inquirySubject, setInquirySubject] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [submittingInquiry, setSubmittingInquiry] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getStudentDashboard(student.id);
      setDashboardData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load student dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [student.id]);

  const handleCopyMpesa = () => {
    navigator.clipboard.writeText('0116654805');
    setCopiedMpesa(true);
    setTimeout(() => setCopiedMpesa(false), 2000);
  };

  const handleBookSlot = async (lessonId: string) => {
    setBookingLoading(true);
    setActionMessage('');
    try {
      const res = await api.bookLesson(student.id, lessonId, bookingNote);
      if (res.success) {
        setActionMessage(res.message);
        setBookingNote('');
        await loadData();
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.message || 'Booking failed.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelBooking = async (lessonId: string) => {
    if (!confirm('Are you sure you want to cancel this lesson reservation?')) return;
    try {
      const res = await api.cancelBooking(student.id, lessonId);
      if (res.success) {
        setActionMessage(res.message);
        await loadData();
      }
    } catch (err: any) {
      setError(err.message || 'Cancellation failed.');
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingPayment(true);
    setError('');
    setActionMessage('');

    try {
      const res = await api.submitPayment({
        studentId: student.id,
        mpesaCode: mpesaCode.trim().toUpperCase(),
        amountPaid: 699,
        transactionDate: paymentDate,
        payingPhoneNumber: payingPhone,
        packageType: `Standard Weekly Tuition (${student.grade || 'Grade 11'})`,
        note: paymentNote.trim()
      });

      if (res.success) {
        setActionMessage(res.message);
        setMpesaCode('');
        setPaymentNote('');
        await loadData();
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.message || 'Payment submission failed.');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuiz) return;
    setSubmittingQuiz(true);

    try {
      const res = await api.submitQuiz({
        quizId: activeQuiz.id,
        studentId: student.id,
        answers: quizAnswers
      });

      if (res.success) {
        setQuizResult(res);
        await loadData();
      }
    } catch (err: any) {
      setError(err.message || 'Quiz evaluation failed.');
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssignment || !assignmentText.trim()) return;
    setSubmittingAssignment(true);

    try {
      const res = await api.submitAssignment({
        assignmentId: activeAssignment.id,
        studentId: student.id,
        textResponse: assignmentText.trim()
      });

      if (res.success) {
        setActionMessage(res.message);
        setActiveAssignment(null);
        setAssignmentText('');
        await loadData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit assignment.');
    } finally {
      setSubmittingAssignment(false);
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingInquiry(true);

    try {
      const res = await api.submitInquiry({
        userId: student.id,
        category: inquiryCategory,
        subject: inquirySubject.trim(),
        message: inquiryMessage.trim()
      });

      if (res.success) {
        setActionMessage('Inquiry submitted to Daniel Owino!');
        setInquirySubject('');
        setInquiryMessage('');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit inquiry.');
    } finally {
      setSubmittingInquiry(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-700 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-xs text-slate-500">Loading student dashboard...</p>
      </div>
    );
  }

  const hasPaid = dashboardData?.hasPaidAccess;
  const activeSub = dashboardData?.activeSubscription;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Student Profile Header Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans">
              {student.name}
            </h1>
            <span className="bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold">
              {student.grade || 'Grade 11'}
            </span>
          </div>
          <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
            <span>Email: <strong>{student.email}</strong></span>
            <span>Phone: <strong>{student.phone}</strong></span>
            <span>Enrolled Subjects: <strong className="text-slate-800">{(student.selectedSubjects || []).join(', ')}</strong></span>
          </div>
        </div>

        {/* Subscription Status Box */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs space-y-1.5 min-w-[240px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Subscription:</span>
            {hasPaid ? (
              <span className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 text-[11px]">
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                Active
              </span>
            ) : (
              <span className="bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 text-[11px]">
                <AlertCircle className="w-3 h-3 text-amber-600" />
                Pending Verification
              </span>
            )}
          </div>
          {hasPaid && activeSub ? (
            <div className="text-[11px] text-slate-600">
              Valid until: <strong className="text-slate-900">{activeSub.expiryDate}</strong>
            </div>
          ) : (
            <div className="text-[11px] text-amber-800">
              Submit KSh 699 via M-Pesa to activate full access.
            </div>
          )}
        </div>
      </div>

      {/* Action Messages */}
      {actionMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage('')} className="font-bold text-xs underline">Dismiss</button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="font-bold text-xs underline">Dismiss</button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2.5 rounded-xl transition-all ${activeTab === 'schedule' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
        >
          Timetable & Booking
        </button>
        <button
          onClick={() => setActiveTab('recordings')}
          className={`px-4 py-2.5 rounded-xl transition-all ${activeTab === 'recordings' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
        >
          Recorded Lessons
        </button>
        <button
          onClick={() => setActiveTab('materials')}
          className={`px-4 py-2.5 rounded-xl transition-all ${activeTab === 'materials' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
        >
          Notes & Worksheets
        </button>
        <button
          onClick={() => setActiveTab('assignments')}
          className={`px-4 py-2.5 rounded-xl transition-all ${activeTab === 'assignments' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
        >
          Assignments
        </button>
        <button
          onClick={() => setActiveTab('quizzes')}
          className={`px-4 py-2.5 rounded-xl transition-all ${activeTab === 'quizzes' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
        >
          Practice Tests
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2.5 rounded-xl transition-all ${activeTab === 'attendance' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
        >
          Attendance & Reports
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2.5 rounded-xl transition-all ${activeTab === 'payments' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
        >
          M-Pesa Payments
        </button>
        <button
          onClick={() => setActiveTab('support')}
          className={`px-4 py-2.5 rounded-xl transition-all ${activeTab === 'support' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
        >
          Support Inquiries
        </button>
      </div>

      {/* ---------------- Tab 1: OVERVIEW ---------------- */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Announcements Banner */}
          {dashboardData?.announcements?.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-blue-700" />
                Latest Announcement from Daniel Owino:
              </div>
              <h3 className="font-bold text-sm text-blue-950">
                {dashboardData.announcements[0].title}
              </h3>
              <p className="text-xs text-blue-900 leading-relaxed">
                {dashboardData.announcements[0].message}
              </p>
            </div>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="text-xs text-slate-500">My Confirmed Lessons</div>
              <div className="text-2xl font-extrabold text-slate-900">{dashboardData?.myBookings?.length || 0}</div>
              <div className="text-[11px] text-blue-700 font-semibold">Africa/Nairobi Time</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="text-xs text-slate-500">Practice Quizzes Taken</div>
              <div className="text-2xl font-extrabold text-slate-900">{dashboardData?.quizSubmissions?.length || 0}</div>
              <div className="text-[11px] text-emerald-700 font-semibold">Auto-Graded</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="text-xs text-slate-500">Attendance Records</div>
              <div className="text-2xl font-extrabold text-slate-900">{dashboardData?.attendance?.length || 0}</div>
              <div className="text-[11px] text-purple-700 font-semibold">Verified by Tutor</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="text-xs text-slate-500">Progress Reports</div>
              <div className="text-2xl font-extrabold text-slate-900">{dashboardData?.progressReports?.length || 0}</div>
              <div className="text-[11px] text-amber-700 font-semibold">Available for Parents</div>
            </div>
          </div>

          {/* Upcoming Booked Lessons */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-sans">
                  My Booked Lessons
                </h2>
                <p className="text-xs text-slate-500">Upcoming live interactive video classes</p>
              </div>
              <button
                onClick={() => setActiveTab('schedule')}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 underline"
              >
                Book More Lessons →
              </button>
            </div>

            {dashboardData?.myBookings?.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                You have not booked any lessons yet.{' '}
                <button onClick={() => setActiveTab('schedule')} className="text-blue-700 font-bold underline">
                  View published schedule and book your first slot
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {dashboardData?.myBookings?.map((lesson: LessonSlot) => (
                  <div
                    key={lesson.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-md">
                          {lesson.subject}
                        </span>
                        <span className="text-xs text-slate-500">
                          {lesson.date} • {lesson.startTime} – {lesson.endTime} EAT
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-slate-900">{lesson.title}</h3>
                      <div className="text-[11px] text-slate-500">Tutor: {lesson.tutorName}</div>
                    </div>

                    <div className="flex items-center gap-3">
                      {hasPaid ? (
                        <a
                          href={lesson.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                          <Video className="w-3.5 h-3.5" />
                          <span>Join Live Lesson</span>
                        </a>
                      ) : (
                        <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                          Payment Verification Pending
                        </span>
                      )}
                      <button
                        onClick={() => handleCancelBooking(lesson.id)}
                        className="text-xs text-slate-500 hover:text-red-600 underline"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------- Tab 2: TIMETABLE & BOOKING ---------------- */}
      {activeTab === 'schedule' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900 font-sans">
              Student-Selectable Lesson Timetable
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select convenient times from published slots. All times are displayed in <strong>Africa/Nairobi (EAT)</strong>. Double bookings and capacity overflows are strictly prevented.
            </p>
          </div>

          <div className="space-y-4">
            {dashboardData?.availableLessons?.map((lesson: LessonSlot) => {
              const isBooked = lesson.bookings.some(b => b.studentId === student.id && b.status === 'Confirmed');
              const confirmedCount = lesson.bookings.filter(b => b.status === 'Confirmed').length;
              const isFull = confirmedCount >= lesson.capacity;

              return (
                <div
                  key={lesson.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isBooked
                      ? 'border-blue-300 bg-blue-50/40'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-md">
                          {lesson.subject}
                        </span>
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                          {lesson.grade}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {lesson.date} • {lesson.startTime} – {lesson.endTime} (EAT)
                        </span>
                      </div>
                      <h3 className="font-bold text-base text-slate-900">{lesson.title}</h3>
                      <div className="text-xs text-slate-500">
                        Tutor: {lesson.tutorName} • Capacity: {confirmedCount} / {lesson.capacity} students
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {isBooked ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Slot Reserved
                          </span>
                          {hasPaid && (
                            <a
                              href={lesson.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3.5 py-1.5 bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-blue-800 transition-colors"
                            >
                              Join Meeting
                            </a>
                          )}
                          <button
                            onClick={() => handleCancelBooking(lesson.id)}
                            className="text-xs text-slate-400 hover:text-red-600 underline"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : isFull ? (
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl">
                          Full Capacity
                        </span>
                      ) : (
                        <button
                          onClick={() => handleBookSlot(lesson.id)}
                          disabled={bookingLoading}
                          className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-colors shadow-xs"
                        >
                          Book This Slot
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------------- Tab 3: RECORDED LESSONS ---------------- */}
      {activeTab === 'recordings' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900 font-sans">
              Recorded Masterclasses & Video Replays
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Review full lecture recordings, whiteboard derivations, and step-by-step problem walkthroughs.
            </p>
          </div>

          {!hasPaid ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <Shield className="w-8 h-8 text-amber-600 mx-auto" />
              <h3 className="font-bold text-slate-900 text-sm">Protected Paid Learning Materials</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Recorded masterclasses are available to students with an active verified subscription.
              </p>
              <button
                onClick={() => setActiveTab('payments')}
                className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Submit M-Pesa Payment (KSh 699/wk) →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dashboardData?.recordedLessons?.map((rec: any) => (
                <div key={rec.id} className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between">
                  <div className="aspect-video bg-slate-900 flex items-center justify-center relative group">
                    <iframe
                      src={rec.videoUrl}
                      title={rec.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                  <div className="p-5 space-y-2">
                    <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                      {rec.subject} • {rec.durationMinutes} mins
                    </div>
                    <h3 className="font-bold text-sm text-slate-900 line-clamp-2">{rec.title}</h3>
                    <p className="text-xs text-slate-600 line-clamp-3">{rec.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------------- Tab 4: NOTES & WORKSHEETS ---------------- */}
      {activeTab === 'materials' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900 font-sans">
              Downloadable Notes & Worksheets
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Curated revision documents, study guides, and past-paper drill packs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dashboardData?.resources?.map((resItem: LearningResource) => (
              <div
                key={resItem.id}
                className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md">
                      {resItem.subject}
                    </span>
                    <span className="text-[11px] text-slate-400">{resItem.fileSize}</span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">{resItem.title}</h3>
                  <p className="text-xs text-slate-600">{resItem.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">{resItem.resourceType}</span>
                  {resItem.isPaidOnly && !hasPaid ? (
                    <button
                      onClick={() => setActiveTab('payments')}
                      className="px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold rounded-lg"
                    >
                      Unlock with Subscription
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        const blob = new Blob([`Holiday Tuition Hub Resource\n${resItem.title}\nSubject: ${resItem.subject}\nLead Tutor: Daniel Owino\nDate: ${resItem.publicationDate}`], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${resItem.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
                        a.click();
                      }}
                      className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------- Tab 5: ASSIGNMENTS ---------------- */}
      {activeTab === 'assignments' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900 font-sans">
              Assignments & Tutor Feedback
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Submit your written coursework solutions. Daniel Owino reviews each submission, provides marks, and gives personalized feedback.
            </p>
          </div>

          {activeAssignment ? (
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-700">{activeAssignment.subject}</span>
                <button onClick={() => setActiveAssignment(null)} className="text-xs font-bold text-slate-500 hover:text-slate-800">
                  Cancel
                </button>
              </div>
              <h3 className="font-bold text-base text-slate-900">{activeAssignment.title}</h3>
              <p className="text-xs text-slate-700 leading-relaxed bg-white p-4 rounded-xl border border-slate-200">
                {activeAssignment.instructions}
              </p>

              <form onSubmit={handleAssignmentSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Solution / Detailed Working Steps *
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={assignmentText}
                    onChange={(e) => setAssignmentText(e.target.value)}
                    placeholder="Type or paste your step-by-step mathematical/chemical working, formulas, and derivations here..."
                    className="w-full text-xs font-mono p-3.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submittingAssignment}
                  className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  {submittingAssignment ? 'Submitting...' : 'Submit Assignment for Marking'}
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-4">
              {dashboardData?.assignments?.map((asg: AssignmentItem) => {
                const mySubm = dashboardData?.assignmentSubmissions?.find((s: any) => s.assignmentId === asg.id);
                return (
                  <div key={asg.id} className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md">
                          {asg.subject} • Max Marks: {asg.maxMarks}
                        </span>
                        <h3 className="font-bold text-base text-slate-900">{asg.title}</h3>
                        <p className="text-xs text-slate-600">{asg.instructions}</p>
                      </div>

                      {mySubm ? (
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${mySubm.status === 'Marked' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {mySubm.status === 'Marked' ? `Score: ${mySubm.score} / ${asg.maxMarks}` : 'Submitted — Awaiting Marking'}
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => setActiveAssignment(asg)}
                          className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs"
                        >
                          Submit Work
                        </button>
                      )}
                    </div>

                    {mySubm?.tutorFeedback && (
                      <div className="mt-3 p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 text-xs text-blue-950 space-y-1">
                        <strong className="block text-blue-900">Tutor Feedback from {mySubm.markedBy || 'Daniel Owino'}:</strong>
                        <p className="leading-relaxed">{mySubm.tutorFeedback}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ---------------- Tab 6: PRACTICE TESTS & QUIZZES ---------------- */}
      {activeTab === 'quizzes' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900 font-sans">
              Timed Practice Tests & Quizzes
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Objective questions are marked automatically upon submission. Review full solutions and explanations.
            </p>
          </div>

          {activeQuiz ? (
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <span className="text-xs font-bold text-blue-700">{activeQuiz.subject}</span>
                  <h3 className="font-bold text-lg text-slate-900">{activeQuiz.title}</h3>
                </div>
                <button onClick={() => { setActiveQuiz(null); setQuizResult(null); }} className="text-xs font-bold text-slate-500 hover:text-slate-800">
                  Exit Quiz
                </button>
              </div>

              {quizResult ? (
                <div className="space-y-6">
                  <div className={`p-6 rounded-2xl text-center space-y-2 border ${quizResult.result.passed ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-amber-50 border-amber-200 text-amber-950'}`}>
                    <h4 className="text-2xl font-extrabold">{quizResult.result.percentage}%</h4>
                    <p className="text-sm font-semibold">{quizResult.result.feedback}</p>
                    <div className="text-xs">
                      Marks: <strong>{quizResult.result.score}</strong> / {quizResult.result.maxMarks}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-bold text-sm text-slate-900">Step-by-Step Question Review & Explanations:</h4>
                    {quizResult.questionsWithExplanations?.map((q: any, i: number) => {
                      const studentAns = quizAnswers[q.id];
                      const isCorrect = studentAns === q.correctAnswer;
                      return (
                        <div key={q.id} className="p-4 bg-white rounded-xl border border-slate-200 space-y-2 text-xs">
                          <div className="font-semibold text-slate-900">Question {i + 1}: {q.questionText}</div>
                          <div className="text-slate-600">Your answer: <strong className={isCorrect ? 'text-emerald-700' : 'text-red-600'}>{studentAns || 'Unanswered'}</strong></div>
                          <div className="text-emerald-800">Correct answer: <strong>{q.correctAnswer}</strong></div>
                          {q.explanation && (
                            <div className="p-2.5 bg-slate-50 rounded-lg text-slate-700 border border-slate-200 mt-1">
                              <strong>Explanation:</strong> {q.explanation}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => { setActiveQuiz(null); setQuizResult(null); setQuizAnswers({}); }}
                    className="w-full py-3 bg-blue-700 text-white font-bold text-xs rounded-xl"
                  >
                    Done Reviewing
                  </button>
                </div>
              ) : (
                <form onSubmit={handleQuizSubmit} className="space-y-6">
                  {activeQuiz.questions.map((q, idx) => (
                    <div key={q.id} className="p-5 bg-white rounded-2xl border border-slate-200 space-y-3">
                      <div className="font-bold text-sm text-slate-900">
                        {idx + 1}. {q.questionText} ({q.marks} marks)
                      </div>
                      <div className="space-y-2">
                        {q.options?.map((opt, optIdx) => (
                          <label
                            key={optIdx}
                            className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer text-xs transition-colors ${
                              quizAnswers[q.id] === opt
                                ? 'border-blue-700 bg-blue-50 text-blue-900 font-semibold'
                                : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <input
                              type="radio"
                              name={q.id}
                              value={opt}
                              checked={quizAnswers[q.id] === opt}
                              onChange={() => setQuizAnswers({ ...quizAnswers, [q.id]: opt })}
                              className="text-blue-700"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  <button
                    type="submit"
                    disabled={submittingQuiz}
                    className="w-full py-3.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-colors shadow-xs"
                  >
                    {submittingQuiz ? 'Evaluating Answers...' : 'Submit Quiz for Automatic Grading'}
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dashboardData?.quizzes?.map((quiz: QuizItem) => {
                const prev = dashboardData?.quizSubmissions?.find((s: any) => s.quizId === quiz.id);
                return (
                  <div key={quiz.id} className="p-5 rounded-2xl border border-slate-200 bg-white flex flex-col justify-between space-y-3 shadow-xs">
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md">
                        {quiz.subject} • {quiz.durationMinutes} Mins
                      </span>
                      <h3 className="font-bold text-sm text-slate-900">{quiz.title}</h3>
                      <p className="text-xs text-slate-500">Topic: {quiz.topic} • Pass mark: {quiz.passMark}%</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      {prev ? (
                        <span className="text-xs font-bold text-emerald-700">
                          Score: {prev.percentage}% ({prev.score}/{prev.maxMarks})
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Not attempted yet</span>
                      )}
                      <button
                        onClick={() => { setActiveQuiz(quiz); setQuizAnswers({}); setQuizResult(null); }}
                        className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs"
                      >
                        {prev ? 'Retake Quiz' : 'Start Assessment'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ---------------- Tab 7: ATTENDANCE & REPORTS ---------------- */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Attendance History Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-slate-900 font-sans">
              Verified Lesson Attendance
            </h2>
            <p className="text-xs text-slate-500">
              Recorded only when verified by Daniel Owino during or after the live session.
            </p>

            {dashboardData?.attendance?.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl">
                No attendance records have been published yet. Attendance is recorded by the tutor following completed live sessions.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {dashboardData?.attendance?.map((att: AttendanceRecord) => (
                  <div key={att.id} className="py-3.5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{att.lessonTitle}</div>
                      <div className="text-[11px] text-slate-500">{att.date} • Subject: {att.subject}</div>
                      {att.notes && <div className="text-[11px] text-slate-600 mt-0.5">Note: {att.notes}</div>}
                    </div>
                    <span className={`px-3 py-1 rounded-full font-bold ${att.status === 'Present' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {att.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Academic Progress Reports */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <h2 className="text-xl font-bold text-slate-900 font-sans">
              Tutor Academic Progress Reports
            </h2>
            <p className="text-xs text-slate-500">
              Formal assessments, observations, and recommendations written by Daniel Owino (also visible to linked parents).
            </p>

            {dashboardData?.progressReports?.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl">
                No formal progress reports generated yet. Reports are compiled following weekly quizzes and assignment reviews.
              </div>
            ) : (
              <div className="space-y-4">
                {dashboardData?.progressReports?.map((rep: ProgressReport) => (
                  <div key={rep.id} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div>
                        <div className="text-xs font-bold text-blue-700 uppercase tracking-wider">Formal Academic Progress Report</div>
                        <div className="text-xs text-slate-500">Date: {rep.reportDate} • Evaluator: {rep.createdBy}</div>
                      </div>
                      <div className="text-xs font-bold bg-white px-3 py-1 rounded-lg border border-slate-200">
                        Attendance: {rep.attendanceSummary?.attendanceRate || 100}%
                      </div>
                    </div>

                    <div className="text-xs space-y-2 text-slate-700">
                      <div>
                        <strong className="block text-slate-900">Tutor Observations:</strong>
                        <p className="leading-relaxed mt-0.5">{rep.tutorObservations}</p>
                      </div>
                      {rep.areasForImprovement && (
                        <div>
                          <strong className="block text-slate-900">Areas Requiring Improvement:</strong>
                          <p className="leading-relaxed mt-0.5">{rep.areasForImprovement}</p>
                        </div>
                      )}
                      {rep.revisionRecommendations && (
                        <div>
                          <strong className="block text-slate-900">Recommended Revision Focus:</strong>
                          <p className="leading-relaxed mt-0.5">{rep.revisionRecommendations}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------- Tab 8: M-PESA PAYMENTS ---------------- */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 font-sans">
                  Submit M-Pesa Send Money Payment
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Tuition Fee: <strong>KSh 699 per week</strong>. Submissions are verified against Safaricom receipts by Daniel Owino.
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center gap-3">
                <div>
                  <div className="text-[10px] uppercase font-bold text-emerald-800">M-Pesa Number</div>
                  <div className="text-base font-mono font-extrabold text-emerald-950">0116654805</div>
                  <div className="text-[11px] text-emerald-700 font-semibold">Daniel Owino</div>
                </div>
                <button
                  onClick={handleCopyMpesa}
                  className="p-2 bg-white text-emerald-800 rounded-lg border border-emerald-200 text-xs font-bold shadow-xs hover:bg-emerald-100"
                >
                  {copiedMpesa ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    M-Pesa Transaction Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={mpesaCode}
                    onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
                    placeholder="e.g. QX8923KJ9L"
                    maxLength={12}
                    className="w-full text-xs font-mono px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Paying Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={payingPhone}
                    onChange={(e) => setPayingPhone(e.target.value)}
                    placeholder="0712345678"
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Transaction Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Amount Paid (KSh)
                  </label>
                  <input
                    type="text"
                    disabled
                    value="KSh 699"
                    className="w-full text-xs font-bold px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Optional Note:
                </label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder="e.g. November Week 1 tuition renewal"
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <button
                type="submit"
                disabled={submittingPayment}
                className="px-8 py-3 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs"
              >
                {submittingPayment ? 'Submitting...' : 'Submit Payment for Verification'}
              </button>
            </form>
          </div>

          {/* Payment History Table */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-lg font-bold text-slate-900 font-sans">
              My Payment Submissions History
            </h3>

            {dashboardData?.payments?.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                No payment submissions on record.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3">M-Pesa Code</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Paying Phone</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Verified By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dashboardData?.payments?.map((pay: PaymentSubmission) => (
                      <tr key={pay.id} className="hover:bg-slate-50/50">
                        <td className="p-3 font-mono font-bold text-slate-900">{pay.mpesaCode}</td>
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
                        <td className="p-3 text-slate-500">{pay.verifiedBy || 'Pending'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------- Tab 9: SUPPORT INQUIRIES ---------------- */}
      {activeTab === 'support' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900 font-sans">
              Academic Support & Inquiries
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Need assistance with lesson materials, schedules, or payments? Message Daniel Owino directly.
            </p>
          </div>

          <form onSubmit={handleInquirySubmit} className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={inquiryCategory}
                onChange={(e) => setInquiryCategory(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              >
                <option value="Lesson Scheduling">Lesson Scheduling & Timetable</option>
                <option value="Payment Verification">M-Pesa Payment Verification</option>
                <option value="Learning Resources">Learning Resources / Notes</option>
                <option value="General">General Inquiries</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subject Line *
              </label>
              <input
                type="text"
                required
                value={inquirySubject}
                onChange={(e) => setInquirySubject(e.target.value)}
                placeholder="e.g. Question on Friday Chemistry practical slot"
                className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Your Message *
              </label>
              <textarea
                required
                rows={4}
                value={inquiryMessage}
                onChange={(e) => setInquiryMessage(e.target.value)}
                placeholder="Describe your question or difficulty..."
                className="w-full text-xs p-3.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submittingInquiry}
              className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              {submittingInquiry ? 'Sending...' : 'Send Message to Daniel Owino'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
