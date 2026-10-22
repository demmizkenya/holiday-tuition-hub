import React, { useState, useEffect } from 'react';
import { UserAccount, ProgressReport, AttendanceRecord, PaymentSubmission, LessonSlot, QuizSubmission } from '../types';
import { api } from '../services/api';
import {
  Users,
  CheckCircle,
  AlertCircle,
  Calendar,
  Clock,
  BookOpen,
  Award,
  Shield,
  Phone,
  MessageCircle,
  FileText,
  UserPlus
} from 'lucide-react';

interface ParentDashboardProps {
  parent: UserAccount;
  onNavigate: (view: string) => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ parent, onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Link child form
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [childEmail, setChildEmail] = useState('');
  const [childPhone, setChildPhone] = useState('');
  const [linking, setLinking] = useState(false);

  // Selected student tab if parent has multiple children
  const [selectedStudentIndex, setSelectedStudentIndex] = useState(0);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getParentDashboard(parent.id);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load parent portal data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [parent.id]);

  const handleLinkStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!childEmail && !childPhone) {
      setError('Please provide your child’s email address or phone number.');
      return;
    }
    setLinking(true);
    setError('');

    try {
      const res = await api.requestParentLink(parent.id, childEmail, childPhone);
      if (res.success) {
        setSuccessMsg(res.message);
        setShowLinkModal(false);
        setChildEmail('');
        setChildPhone('');
        await loadData();
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to link student account.');
    } finally {
      setLinking(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-xs text-slate-500">Loading parent portal...</p>
      </div>
    );
  }

  const studentsData = data?.studentsData || [];
  const currentStudentData = studentsData[selectedStudentIndex];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Profile */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Parent / Guardian Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-sans">
            {parent.name}
          </h1>
          <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
            <span>Relationship: <strong>{parent.relationship || 'Guardian'}</strong></span>
            <span>Email: <strong>{parent.email}</strong></span>
            <span>Phone: <strong>{parent.phone}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowLinkModal(true)}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Link Another Student</span>
          </button>
          <a
            href="https://wa.me/254708083643?text=Hello%20Mr.%20Daniel%20Owino%2C%20I%20am%20a%20parent%20inquiring%20about%20my%20child's%20progress%20at%20Holiday%20Tuition%20Hub."
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>WhatsApp Daniel Owino</span>
          </a>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="font-bold underline">Dismiss</button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="font-bold underline">Dismiss</button>
        </div>
      )}

      {/* Children Selector Tabs if multiple */}
      {studentsData.length > 1 && (
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <span className="text-xs font-bold text-slate-500 uppercase">Monitored Students:</span>
          {studentsData.map((item: any, idx: number) => (
            <button
              key={item.student.id}
              onClick={() => setSelectedStudentIndex(idx)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedStudentIndex === idx
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {item.student.name} ({item.student.grade})
            </button>
          ))}
        </div>
      )}

      {/* If No linked children */}
      {studentsData.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <Users className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-sans">
            No Student Accounts Linked Yet
          </h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            Link your child’s student account to view their live lesson attendance, quiz scores, homework feedback, and verified weekly tuition payments.
          </p>
          <button
            onClick={() => setShowLinkModal(true)}
            className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs"
          >
            Link Your Child's Account Now
          </button>
        </div>
      ) : (
        /* Detailed Student Monitoring Section */
        <div className="space-y-6">
          {/* Child Summary Stats Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                  Student Academic Profile
                </span>
                <h2 className="text-2xl font-bold text-slate-900 font-sans mt-0.5">
                  {currentStudentData.student.name}
                </h2>
                <div className="text-xs text-slate-500 mt-1">
                  Grade Level: <strong>{currentStudentData.student.grade}</strong> • Enrolled in: <strong>{(currentStudentData.student.selectedSubjects || []).join(', ')}</strong>
                </div>
              </div>

              {/* Subscription Status Badge */}
              <div className="text-right">
                <div className="text-[11px] text-slate-500">Subscription Status:</div>
                {currentStudentData.subscriptions.some((s: any) => s.status === 'Active') ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs mt-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Active (Verified by Daniel Owino)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-xs mt-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    Payment Verification Pending
                  </span>
                )}
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-xs text-slate-500">Live Lesson Attendance</div>
                <div className="text-2xl font-extrabold text-slate-900">
                  {currentStudentData.attendance.length > 0
                    ? `${Math.round((currentStudentData.attendance.filter((a: any) => a.status === 'Present').length / currentStudentData.attendance.length) * 100)}%`
                    : '100%'}
                </div>
                <div className="text-[11px] text-emerald-700 font-semibold">
                  {currentStudentData.attendance.filter((a: any) => a.status === 'Present').length} / {currentStudentData.attendance.length || 1} Sessions Attended
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-xs text-slate-500">Timed Practice Quizzes</div>
                <div className="text-2xl font-extrabold text-slate-900">
                  {currentStudentData.quizSubmissions.length > 0
                    ? `${Math.round(currentStudentData.quizSubmissions.reduce((sum: number, q: any) => sum + q.percentage, 0) / currentStudentData.quizSubmissions.length)}%`
                    : '100%'}
                </div>
                <div className="text-[11px] text-blue-700 font-semibold">
                  {currentStudentData.quizSubmissions.length} Assessments Completed
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-xs text-slate-500">Weekly Tuition Payments</div>
                <div className="text-2xl font-extrabold text-slate-900">
                  KSh {currentStudentData.payments.filter((p: any) => p.status === 'Verified').reduce((sum: number, p: any) => sum + p.amountPaid, 0)}
                </div>
                <div className="text-[11px] text-purple-700 font-semibold">
                  {currentStudentData.payments.filter((p: any) => p.status === 'Verified').length} Verified Payments
                </div>
              </div>
            </div>
          </div>

          {/* Academic Progress Reports by Daniel Owino */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-lg font-bold text-slate-900 font-sans flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-700" />
              Tutor Academic Progress Reports
            </h3>
            <p className="text-xs text-slate-500">
              Evaluations and study recommendations authored directly by Daniel Owino.
            </p>

            {currentStudentData.progressReports.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl">
                No formal progress reports compiled yet. Reports are published weekly following completion of quizzes and coursework.
              </div>
            ) : (
              <div className="space-y-4">
                {currentStudentData.progressReports.map((rep: ProgressReport) => (
                  <div key={rep.id} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div>
                        <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Report Issued</span>
                        <div className="text-xs text-slate-500">{rep.reportDate} • Evaluator: {rep.createdBy}</div>
                      </div>
                      <div className="text-xs font-bold bg-white px-3 py-1 rounded-lg border border-slate-200">
                        Attendance: {rep.attendanceSummary?.attendanceRate || 100}%
                      </div>
                    </div>

                    <div className="text-xs space-y-3 text-slate-700">
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

          {/* Lesson Attendance Log */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-lg font-bold text-slate-900 font-sans flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-700" />
              Live Lesson Attendance History
            </h3>

            {currentStudentData.attendance.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl">
                No attendance entries on record yet. Attendance is logged by Daniel Owino after each live class session.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {currentStudentData.attendance.map((att: AttendanceRecord) => (
                  <div key={att.id} className="py-3.5 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900">{att.lessonTitle}</div>
                      <div className="text-[11px] text-slate-500">{att.date} • Subject: {att.subject}</div>
                      {att.notes && <div className="text-[11px] text-slate-600 mt-0.5">Tutor note: {att.notes}</div>}
                    </div>
                    <span className={`px-3 py-1 rounded-full font-bold ${att.status === 'Present' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {att.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Verified M-Pesa Payment Records */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-lg font-bold text-slate-900 font-sans flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-700" />
              Verified Tuition Payments
            </h3>

            {currentStudentData.payments.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl">
                No payment submissions on record for this student.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3">M-Pesa Code</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Verified By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentStudentData.payments.map((p: PaymentSubmission) => (
                      <tr key={p.id}>
                        <td className="p-3 font-mono font-bold">{p.mpesaCode}</td>
                        <td className="p-3 font-semibold">KSh {p.amountPaid}</td>
                        <td className="p-3 text-slate-600">{p.transactionDate}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${p.status === 'Verified' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {p.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500">{p.verifiedBy || 'Pending'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Link Student Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-slate-900 font-sans">
              Link Your Child's Student Account
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Enter your child’s registered student email or mobile phone number to connect and monitor their academic progress.
            </p>

            <form onSubmit={handleLinkStudent} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Student Email Address
                </label>
                <input
                  type="email"
                  value={childEmail}
                  onChange={(e) => setChildEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Or Student Mobile Phone Number
                </label>
                <input
                  type="tel"
                  value={childPhone}
                  onChange={(e) => setChildPhone(e.target.value)}
                  placeholder="e.g. 0712345678"
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={linking}
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  {linking ? 'Verifying...' : 'Link Student Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
