import React, { useState, useEffect } from 'react';
import {
  UserAccount,
  PaymentSubmission,
  LessonSlot,
  Subscription,
  LearningResource,
  PlatformSettings,
  AuditLog,
  SupportInquiry,
  GalleryPhoto,
  SubjectItem,
  Announcement,
  TeacherProfile
} from '../types';
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
  BookOpen,
  MessageSquare,
  Image as ImageIcon,
  Trash2,
  Send,
  UserX,
  UserCheck,
  Link as LinkIcon,
  LogOut,
  Upload,
  Edit,
  Megaphone,
  GraduationCap
} from 'lucide-react';

interface AdminDashboardProps {
  admin: UserAccount;
  onNavigate: (view: string) => void;
  onSettingsUpdate?: (newSettings: PlatformSettings) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ admin, onNavigate, onSettingsUpdate }) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'payments' | 'lessons' | 'subscriptions' | 'subjects' | 'announcements' | 'teachers' | 'resources' | 'inquiries' | 'gallery' | 'attendance' | 'reports' | 'settings' | 'audit'
  >('overview');
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [payments, setPayments] = useState<PaymentSubmission[]>([]);
  const [lessons, setLessons] = useState<LessonSlot[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [inquiries, setInquiries] = useState<SupportInquiry[]>([]);
  const [gallery, setGallery] = useState<GalleryPhoto[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);

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

  // Resource Upload State
  const [showAddResource, setShowAddResource] = useState(false);
  const [resTitle, setResTitle] = useState('');
  const [resSubject, setResSubject] = useState('Mathematics');
  const [resGrade, setResGrade] = useState('Grade 11');
  const [resType, setResType] = useState<'PDF Notes' | 'Revision Material' | 'Worksheet' | 'Assignment' | 'Practice Paper' | 'Study Guide'>('PDF Notes');
  const [resUrl, setResUrl] = useState('');
  const [resDescription, setResDescription] = useState('');

  // Gallery Upload State
  const [showAddPhoto, setShowAddPhoto] = useState(false);
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoCategory, setPhotoCategory] = useState<string>('Live Classes');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');

  // Inquiry Reply State
  const [selectedInquiry, setSelectedInquiry] = useState<SupportInquiry | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyStatus, setReplyStatus] = useState<'Resolved' | 'Under Review'>('Resolved');

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
  const [editHeroBgImage, setEditHeroBgImage] = useState('/assets/aistudio/Gemini_Generated_Image_eiuqjeeiuqjeeiuq_b3db601d.jpeg');
  const [uploadingHero, setUploadingHero] = useState(false);

  // Subject Management Modal & State
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [subjectDescription, setSubjectDescription] = useState('');
  const [subjectTopics, setSubjectTopics] = useState('');
  const [subjectObjectives, setSubjectObjectives] = useState('');

  // Announcement Management Modal & State
  const [showAddAnnouncement, setShowAddAnnouncement] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annAudience, setAnnAudience] = useState<'All' | 'Grade 9' | 'Grade 10' | 'Grade 11' | 'Grade 12' | 'Grade 13' | 'Grade 14' | 'Parents'>('All');

  // Teacher Management Modal & State
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [teacherName, setTeacherName] = useState('');
  const [teacherRole, setTeacherRole] = useState('');
  const [teacherSubjects, setTeacherSubjects] = useState('Mathematics, Chemistry');
  const [teacherQual, setTeacherQual] = useState('');
  const [teacherExp, setTeacherExp] = useState('');
  const [teacherBio, setTeacherBio] = useState('');
  const [teacherPhoto, setTeacherPhoto] = useState('');

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [ov, pays, less, subs, inqs, gal, logs, pub, subjs, anns, tchs] = await Promise.all([
        api.getAdminOverview(),
        api.getAdminPayments(),
        api.getAdminLessons(),
        api.getAdminSubscriptions(),
        api.getAdminInquiries(),
        api.getGallery(),
        api.getAuditLogs(),
        api.getPublicData(),
        api.getAdminSubjects().catch(() => []),
        api.getAdminAnnouncements().catch(() => []),
        api.getAdminTeachers().catch(() => [])
      ]);
      setOverview(ov);
      setPayments(pays);
      setLessons(less);
      setSubscriptions(subs);
      setInquiries(inqs);
      setGallery(gal);
      setAuditLogs(logs);
      setSubjects(subjs);
      setAnnouncements(anns);
      setTeachers(tchs);

      if (pub?.settings) {
        setEditBrandName(pub.settings.brandName);
        setEditTutorBio(pub.settings.tutorBio);
        setEditWeeklyPrice(pub.settings.weeklyPrice);
        setEditCommencement(pub.settings.commencementDate);
        setEditEnd(pub.settings.endDate);
        setEditWhatsapp(pub.settings.whatsappNumber);
        setEditMpesa(pub.settings.mpesaNumber);
        setEditEnrollmentState(pub.settings.enrollmentState);
        if (pub.settings.heroBackgroundImage) {
          setEditHeroBgImage(pub.settings.heroBackgroundImage);
        }
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

  const handleAddResource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createResource({
        title: resTitle.trim(),
        subject: resSubject,
        grade: resGrade,
        topic: 'Holiday Syllabus Revision',
        resourceType: resType,
        fileUrl: resUrl.trim() || 'https://holidaytuitionhub.example/docs/lesson-guide.pdf',
        description: resDescription.trim() || 'Comprehensive tuition material prepared by Daniel Owino',
        isPaidOnly: true
      });
      if (res.success) {
        setMsg(res.message);
        setShowAddResource(false);
        setResTitle('');
        setResUrl('');
        setResDescription('');
        await loadAllData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add learning material.');
    }
  };

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.addGalleryPhoto({
        title: photoTitle.trim(),
        category: photoCategory,
        imageUrl: photoUrl.trim() || 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=80',
        description: photoCaption.trim()
      });
      if (res.success) {
        setMsg('Photo added to gallery successfully!');
        setShowAddPhoto(false);
        setPhotoTitle('');
        setPhotoUrl('');
        setPhotoCaption('');
        await loadAllData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add photo.');
    }
  };

  const handleDeletePhoto = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this photo from the gallery?')) return;
    try {
      const res = await api.deleteGalleryPhoto(id);
      if (res.success) {
        setMsg('Photo removed from gallery.');
        await loadAllData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete photo.');
    }
  };

  const handleToggleSubscription = async (subId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Expired' : 'Active';
    try {
      const res = await api.updateSubscriptionStatus(subId, newStatus as any, 'Admin manual override');
      if (res.success) {
        setMsg(`Subscription marked as ${newStatus}.`);
        await loadAllData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update subscription status.');
    }
  };

  const handleReplyInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiry || !replyMessage.trim()) return;
    try {
      const res = await api.respondAdminInquiry(selectedInquiry.id, replyMessage.trim(), replyStatus);
      if (res.success) {
        setMsg(res.message);
        setSelectedInquiry(null);
        setReplyMessage('');
        await loadAllData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send inquiry response.');
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
        enrollmentState: editEnrollmentState,
        heroBackgroundImage: editHeroBgImage.trim()
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

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingHero(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const res = await api.adminUploadFile(file.name, base64);
          if (res.success && res.url) {
            setEditHeroBgImage(res.url);
            setMsg('Hero background image uploaded successfully! Click Save Platform Configuration to commit.');
          } else {
            setError(res.message || 'Failed to upload hero image.');
          }
        } catch (uploadErr: any) {
          setError(uploadErr.message || 'Upload failed.');
        } finally {
          setUploadingHero(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message || 'File read error');
      setUploadingHero(false);
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) return;
    try {
      const res = await api.createAdminSubject({
        name: subjectName.trim(),
        description: subjectDescription.trim(),
        topics: subjectTopics.split(',').map(s => s.trim()).filter(Boolean),
        learningObjectives: subjectObjectives.split(',').map(s => s.trim()).filter(Boolean),
        supportedGrades: ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Grade 13', 'Grade 14'],
        isPublished: true
      });
      if (res.success) {
        setMsg('Subject created and published successfully!');
        setShowAddSubject(false);
        setSubjectName('');
        setSubjectDescription('');
        setSubjectTopics('');
        setSubjectObjectives('');
        await loadAllData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create subject.');
    }
  };

  const handleDeleteSubject = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const res = await api.deleteAdminSubject(id);
      if (res.success) {
        setMsg(`Subject "${name}" deleted.`);
        await loadAllData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete subject.');
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) return;
    try {
      const res = await api.createAdminAnnouncement({
        title: annTitle.trim(),
        message: annMessage.trim(),
        targetAudience: annAudience
      });
      if (res.success) {
        setMsg('Announcement published to student and parent hubs!');
        setShowAddAnnouncement(false);
        setAnnTitle('');
        setAnnMessage('');
        await loadAllData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to publish announcement.');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      const res = await api.deleteAdminAnnouncement(id);
      if (res.success) {
        setMsg('Announcement deleted.');
        await loadAllData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete announcement.');
    }
  };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName.trim() || !teacherRole.trim()) return;
    try {
      const res = await api.createAdminTeacher({
        name: teacherName.trim(),
        role: teacherRole.trim(),
        subjects: teacherSubjects.split(',').map(s => s.trim()).filter(Boolean),
        qualification: teacherQual.trim() || 'B.Ed. Academic Specialist',
        experience: teacherExp.trim() || 'Experienced secondary educator',
        bio: teacherBio.trim(),
        photoUrl: teacherPhoto.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
      });
      if (res.success) {
        setMsg('Teacher added to faculty directory!');
        setShowAddTeacher(false);
        setTeacherName('');
        setTeacherRole('');
        setTeacherBio('');
        setTeacherPhoto('');
        await loadAllData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to add teacher.');
    }
  };

  const handleDeleteTeacher = async (id: string, name: string) => {
    if (!window.confirm(`Remove ${name} from faculty?`)) return;
    try {
      const res = await api.deleteAdminTeacher(id);
      if (res.success) {
        setMsg(`Teacher ${name} removed from faculty.`);
        await loadAllData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete teacher.');
    }
  };

  const handleAdminSignOut = async () => {
    try {
      await api.adminLogout();
    } catch {
      // ignore
    }
    onNavigate('home');
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
  const pendingInquiries = inquiries.filter(i => i.status === 'Open' || i.status === 'Under Review');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Admin Profile & Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrator Control Panel • Single Source of Truth</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-sans">
            {admin.name || 'Platform Administrator'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Authenticated as <span className="text-blue-300 font-mono font-medium">{admin.email}</span> • Full control over hero layout, faculty, subjects, announcements, M-Pesa receipts, and learning content.
          </p>
        </div>

        {/* CSV Export & Session Controls */}
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
          <button
            onClick={handleAdminSignOut}
            className="px-3.5 py-2 bg-red-950/80 hover:bg-red-900 text-red-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-red-800 shadow-xs"
            title="Securely sign out from administrator portal"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            Sign Out
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
          className={`px-3.5 py-2 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
        >
          Overview Stats
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-3.5 py-2 rounded-xl transition-all relative ${activeTab === 'payments' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
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
          className={`px-3.5 py-2 rounded-xl transition-all ${activeTab === 'lessons' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
        >
          Live Lessons & Links
        </button>
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`px-3.5 py-2 rounded-xl transition-all ${activeTab === 'subscriptions' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
        >
          Students & Subscriptions
        </button>
        <button
          onClick={() => setActiveTab('subjects')}
          className={`px-3.5 py-2 rounded-xl transition-all ${activeTab === 'subjects' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
        >
          Subjects & Curriculum
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={`px-3.5 py-2 rounded-xl transition-all ${activeTab === 'announcements' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
        >
          Announcements
        </button>
        <button
          onClick={() => setActiveTab('teachers')}
          className={`px-3.5 py-2 rounded-xl transition-all ${activeTab === 'teachers' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
        >
          Faculty & Teachers
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`px-3.5 py-2 rounded-xl transition-all ${activeTab === 'resources' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
        >
          Upload Notes & Videos
        </button>
        <button
          onClick={() => setActiveTab('inquiries')}
          className={`px-3.5 py-2 rounded-xl transition-all relative ${activeTab === 'inquiries' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
        >
          <span>Learner Inquiries</span>
          {pendingInquiries.length > 0 && (
            <span className="ml-1.5 px-1.5 py-0.2 bg-blue-600 text-white rounded-full text-[10px] font-extrabold">
              {pendingInquiries.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`px-3.5 py-2 rounded-xl transition-all ${activeTab === 'gallery' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
        >
          Gallery Photos
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-3.5 py-2 rounded-xl transition-all ${activeTab === 'attendance' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
        >
          Attendance
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-3.5 py-2 rounded-xl transition-all ${activeTab === 'reports' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
        >
          Progress Reports
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-3.5 py-2 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
        >
          Platform Settings
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-3.5 py-2 rounded-xl transition-all ${activeTab === 'audit' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'}`}
        >
          Audit Log
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
              <div className="text-[11px] text-slate-400">Strictly verified M-Pesa payments</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="text-xs text-slate-500">Payment Verification Queue</div>
              <div className="text-2xl font-extrabold text-amber-600">
                {overview?.pendingVerificationCount || 0}
              </div>
              <div className="text-[11px] text-slate-400">Requires Daniel Owino verification</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="text-xs text-slate-500">Active Paid Subscriptions</div>
              <div className="text-2xl font-extrabold text-blue-700">
                {overview?.activeSubscriptionsCount || 0}
              </div>
              <div className="text-[11px] text-slate-400">7-day active lesson passes</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="text-xs text-slate-500">Published Live Lessons</div>
              <div className="text-2xl font-extrabold text-slate-900">
                {lessons.length}
              </div>
              <div className="text-[11px] text-slate-400">Student-selectable slots</div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-xs text-blue-900 space-y-1.5">
            <div className="font-bold text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>Daniel Owino — M-Pesa Accounting Workflow Reminder</span>
            </div>
            <p className="leading-relaxed">
              When students send KSh 699 to your Safaricom number <strong>0116654805</strong>, they submit their M-Pesa transaction code. Always verify the code against your official Safaricom M-Pesa statement before clicking "Verify & Unlock". Once verified, their 7-day subscription is automatically activated, giving them access to live Google Meet sessions and learning materials.
            </p>
          </div>
        </div>
      )}

      {/* ---------------- Tab 2: PAYMENTS QUEUE ---------------- */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-sans">
                M-Pesa Verification Queue
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Cross-check incoming transaction codes against your Safaricom M-Pesa records (0116654805).
              </p>
            </div>
            <div className="text-xs text-slate-500">
              Total Submissions: <strong>{payments.length}</strong>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3">M-Pesa Code</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Submission Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map(payment => (
                  <tr key={payment.id} className="hover:bg-slate-50/60">
                    <td className="p-3 font-mono font-bold text-slate-900">
                      {payment.mpesaCode}
                    </td>
                    <td className="p-3 font-semibold text-slate-800">
                      {payment.studentName}
                    </td>
                    <td className="p-3 font-extrabold text-blue-900">
                      KSh {payment.amountPaid}
                    </td>
                    <td className="p-3 text-slate-500">
                      {payment.submittedAt.split('T')[0]}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        payment.status === 'Verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : payment.status === 'Rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      {payment.status !== 'Verified' && (
                        <button
                          onClick={() => handleVerifyPayment(payment.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                        >
                          Verify & Activate
                        </button>
                      )}
                      {payment.status !== 'Rejected' && payment.status !== 'Verified' && (
                        <button
                          onClick={() => setRejectingPayment(payment)}
                          className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Reject
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------- Tab 3: LESSON SCHEDULING & MEETING LINKS ---------------- */}
      {activeTab === 'lessons' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-sans">
                Live Lesson Schedules & Meeting Links
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Post Google Meet / Zoom links for live lessons. Protected: only students with verified KSh 699 payments can view and access links.
              </p>
            </div>
            <button
              onClick={() => setShowCreateLesson(true)}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Publish New Lesson Slot
            </button>
          </div>

          <div className="space-y-4">
            {lessons.map(lesson => (
              <div
                key={lesson.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {lesson.title}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                      {lesson.subject}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                      {lesson.grade}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-4">
                    <span>Date: <strong>{lesson.date}</strong></span>
                    <span>Time: <strong>{lesson.startTime} – {lesson.endTime} EAT</strong></span>
                    <span>Booked: <strong>{lesson.bookedCount} / {lesson.capacity}</strong></span>
                  </div>
                  <div className="text-xs text-emerald-700 font-mono flex items-center gap-1 pt-1">
                    <LinkIcon className="w-3.5 h-3.5" />
                    <span>Meeting Room: <strong>{lesson.meetingLink}</strong></span>
                    <span className="text-[10px] text-slate-400 ml-2">(Locked to unpaid students)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      const newLink = prompt('Update Google Meet or Zoom link for this lesson:', lesson.meetingLink);
                      if (newLink && newLink.trim()) {
                        api.updateLessonStatus(lesson.id, lesson.status, newLink.trim()).then(() => {
                          setMsg('Meeting link updated successfully');
                          loadAllData();
                        });
                      }
                    }}
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg shadow-2xs"
                  >
                    Edit Link
                  </button>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    lesson.status === 'Published' || lesson.status === 'Scheduled' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {lesson.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------- Tab 4: STUDENTS & SUBSCRIPTIONS (EXPIRE/DISABLE) ---------------- */}
      {activeTab === 'subscriptions' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-sans">
                Enrolled Students & Subscription Access
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Manage registered students, review active pass expirations, and disable or re-activate access with one click.
              </p>
            </div>
            <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
              Active Subscriptions: {subscriptions.filter(s => s.status === 'Active').length}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Pass Dates</th>
                  <th className="p-3">Tuition Paid</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subscriptions.map(sub => (
                  <tr key={sub.id} className="hover:bg-slate-50/60">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{sub.studentName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">ID: {sub.studentId}</div>
                    </td>
                    <td className="p-3 text-slate-700">
                      <div>Start: <strong>{sub.startDate}</strong></div>
                      <div>Expiry: <strong className={sub.status === 'Active' ? 'text-emerald-700' : 'text-slate-400'}>{sub.expiryDate || sub.endDate}</strong></div>
                    </td>
                    <td className="p-3 font-extrabold text-blue-900">
                      KSh {sub.amountPaid}
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        sub.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => handleToggleSubscription(sub.id, sub.status)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          sub.status === 'Active'
                            ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        {sub.status === 'Active' ? 'Disable / Expire Access' : 'Re-activate Subscription'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---------------- Tab: SUBJECTS & CURRICULUM MANAGEMENT ---------------- */}
      {activeTab === 'subjects' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-sans">
                Subjects & Curriculum Offerings
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Official single source of truth for all subjects displayed on the public landing page, curriculum overview, and enrollment dropdowns.
              </p>
            </div>
            <button
              onClick={() => setShowAddSubject(true)}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Add New Subject
            </button>
          </div>

          {subjects.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
              No subjects registered in database. Click "Add New Subject" to publish one.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subjects.map(subj => (
                <div key={subj.id} className="p-5 border border-slate-200 rounded-2xl bg-white shadow-xs flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-slate-900">{subj.name}</span>
                      <span className="text-[10px] bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded-full border border-blue-200">
                        {subj.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{subj.description}</p>
                    {subj.topics && subj.topics.length > 0 && (
                      <div className="mt-3">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Topics:</div>
                        <div className="flex flex-wrap gap-1">
                          {subj.topics.map((t, idx) => (
                            <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">ID: {subj.id}</span>
                    <button
                      onClick={() => handleDeleteSubject(subj.id, subj.name)}
                      className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete Subject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------------- Tab: ANNOUNCEMENTS MANAGEMENT ---------------- */}
      {activeTab === 'announcements' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-sans">
                Hub Announcements & Broadcasts
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Broadcast urgent schedule revisions, holiday reminders, or exam alerts to all students and parents.
              </p>
            </div>
            <button
              onClick={() => setShowAddAnnouncement(true)}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Megaphone className="w-4 h-4" />
              Post New Announcement
            </button>
          </div>

          {announcements.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
              No active announcements posted.
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map(ann => (
                <div key={ann.id} className="p-4 border border-slate-200 rounded-2xl bg-white shadow-xs flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{ann.title}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                        Audience: {ann.targetAudience}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{ann.message}</p>
                    <div className="text-[10px] text-slate-400">
                      Posted: {ann.publishedAt ? ann.publishedAt.split('T')[0] : 'Recent'}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteAnnouncement(ann.id)}
                    className="text-xs text-red-600 hover:text-red-700 font-semibold p-1 shrink-0"
                    title="Delete announcement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------------- Tab: FACULTY & TEACHERS MANAGEMENT ---------------- */}
      {activeTab === 'teachers' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-sans">
                Faculty & Teacher Directory
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Add, update, or remove educators displayed in the public "Meet Our Teachers" directory.
              </p>
            </div>
            <button
              onClick={() => setShowAddTeacher(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <GraduationCap className="w-4 h-4" />
              Add Teacher to Faculty
            </button>
          </div>

          {teachers.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
              No faculty profiles currently registered. Click "Add Teacher to Faculty" to add one.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {teachers.map(tch => (
                <div key={tch.id} className="p-4 border border-slate-200 rounded-2xl bg-white shadow-xs flex flex-col justify-between space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={tch.photoUrl || tch.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                      alt={tch.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-slate-200 shrink-0"
                    />
                    <div>
                      <div className="font-bold text-sm text-slate-900">{tch.name}</div>
                      <div className="text-xs text-emerald-700 font-medium">{tch.role}</div>
                      <div className="text-[11px] text-slate-500">{tch.qualification}</div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{tch.bio}</p>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {tch.subjects?.map((s, idx) => (
                        <span key={idx} className="text-[10px] bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => handleDeleteTeacher(tch.id, tch.name)}
                      className="text-xs text-red-600 hover:text-red-700 font-semibold p-1"
                      title="Remove teacher"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------------- Tab 5: UPLOAD NOTES & RECORDED LESSONS ---------------- */}
      {activeTab === 'resources' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-sans">
                Learning Materials & Recorded Lessons
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Upload lecture notes PDFs, practice assessment worksheets, and recorded video links.
              </p>
            </div>
            <button
              onClick={() => setShowAddResource(true)}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Upload New Material
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200">
              <div className="font-bold text-sm text-blue-900 flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-blue-700" />
                <span>Downloadable Lesson Notes (PDF)</span>
              </div>
              <p className="text-xs text-blue-800 mb-3 leading-relaxed">
                Publish high-yield summary notes, formula sheets, and past-paper walk-throughs for Grades 9–14.
              </p>
              <button
                onClick={() => {
                  setResType('PDF Notes');
                  setShowAddResource(true);
                }}
                className="px-3 py-1.5 bg-blue-700 text-white rounded-lg text-xs font-semibold"
              >
                + Add PDF Notes
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200">
              <div className="font-bold text-sm text-emerald-900 flex items-center gap-2 mb-2">
                <Video className="w-4 h-4 text-emerald-700" />
                <span>Recorded Live Lesson Videos</span>
              </div>
              <p className="text-xs text-emerald-800 mb-3 leading-relaxed">
                Add streamable links to past virtual classes for students who missed a session or require revision.
              </p>
              <button
                onClick={() => {
                  setResType('Revision Material');
                  setShowAddResource(true);
                }}
                className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
              >
                + Add Recorded Video Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- Tab 6: LEARNER ACADEMIC INQUIRIES ---------------- */}
      {activeTab === 'inquiries' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-sans">
                Academic & Support Inquiries Inbox
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Direct messages from students, parents, and prospective learners. Saved permanently for Daniel Owino to act on.
              </p>
            </div>
            <div className="text-xs text-slate-500">
              Total Inquiries: <strong>{inquiries.length}</strong>
            </div>
          </div>

          {inquiries.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No inquiries received yet.
            </div>
          ) : (
            <div className="space-y-4">
              {inquiries.map(inq => (
                <div
                  key={inq.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{inq.subject}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                        {inq.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        inq.status === 'Resolved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : inq.status === 'Under Review'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {inq.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {inq.createdAt.split('T')[0]}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                    {inq.message}
                  </p>

                  {inq.tutorResponse && (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                      <div className="font-bold">Daniel Owino's Response:</div>
                      <p>{inq.tutorResponse}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-slate-400 font-mono">
                      Inquiry ID: {inq.id}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedInquiry(inq);
                        setReplyMessage(inq.tutorResponse || '');
                      }}
                      className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{inq.tutorResponse ? 'Edit Feedback' : 'Send Feedback to Learner'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------------- Tab 7: MEDIA GALLERY MANAGER ---------------- */}
      {activeTab === 'gallery' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-sans">
                Photo Gallery Management
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Post important photos of live sessions, science experiments, student honors, and tuition activities.
              </p>
            </div>
            <button
              onClick={() => setShowAddPhoto(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              Upload New Photo
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {gallery.map(photo => (
              <div
                key={photo.id}
                className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-video w-full bg-slate-900 relative">
                    <img
                      src={photo.imageUrl}
                      alt={photo.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 text-white">
                      {photo.category}
                    </span>
                  </div>
                  <div className="p-4 space-y-1">
                    <h3 className="font-bold text-slate-900 text-sm line-clamp-1">{photo.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{photo.description || photo.caption}</p>
                  </div>
                </div>

                <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-100 mt-2">
                  <span className="text-[10px] text-slate-400">{photo.dateAdded || photo.uploadedAt}</span>
                  <button
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ---------------- Tab 8: ATTENDANCE RECORDING ---------------- */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900 font-sans">
              Record Student Lesson Attendance
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Mark live virtual classroom attendance and add tutor whiteboard observations.
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
                <option value="">-- Choose scheduled lesson slot --</option>
                {lessons.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.title} ({l.date} • {l.startTime} EAT)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Enrolled Student *
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

      {/* ---------------- Tab 9: PROGRESS REPORTS ---------------- */}
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

      {/* ---------------- Tab 10: PLATFORM SETTINGS ---------------- */}
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

          <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
            {/* Hero Background Image Management (Single Source of Truth) */}
            <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-blue-700" />
                    Landing Page Hero Background Picture (16:9 Landscape)
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Controls the hero section background across all desktop, tablet, and mobile screens.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditHeroBgImage('/assets/aistudio/Gemini_Generated_Image_eiuqjeeiuqjeeiuq_b3db601d.jpeg')}
                  className="text-[11px] text-blue-700 hover:text-blue-900 font-bold underline"
                >
                  Reset to Uploaded Hero
                </button>
              </div>

              {/* 16:9 Live Preview */}
              <div className="relative aspect-[16/9] w-full max-w-md mx-auto rounded-xl overflow-hidden border-2 border-slate-300 shadow-inner bg-slate-950">
                <img
                  src={editHeroBgImage}
                  alt="Landing Page Hero Preview"
                  className="w-full h-full object-cover object-center filter blur-[1.5px] scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-slate-900/60 to-slate-950/80 flex items-center justify-center p-4">
                  <div className="text-center text-white space-y-1">
                    <span className="text-[10px] bg-blue-500/80 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      Live 16:9 Preview
                    </span>
                    <div className="text-sm font-extrabold font-sans">Make Your Holiday Count.</div>
                    <div className="text-[10px] text-blue-200 font-medium">Text remains razor sharp over blurred background</div>
                  </div>
                </div>
              </div>

              {/* URL or Upload controls */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Image Path / Public URL *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={editHeroBgImage}
                    onChange={(e) => setEditHeroBgImage(e.target.value)}
                    placeholder="/assets/aistudio/Gemini_Generated_Image_eiuqjeeiuqjeeiuq_b3db601d.jpeg"
                    className="flex-1 text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  />
                  <label className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingHero ? 'Uploading...' : 'Upload File'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleHeroImageUpload}
                      disabled={uploadingHero}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

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

      {/* ---------------- Tab 11: SECURITY AUDIT LOG ---------------- */}
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
                <span className="text-[10px] text-slate-400">Strictly visible only to students who paid KSh 699</span>
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

      {/* Upload Resource Modal */}
      {showAddResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-slate-900 font-sans">
              Upload Learning Material or Recorded Video
            </h3>

            <form onSubmit={handleAddResource} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={resTitle}
                  onChange={(e) => setResTitle(e.target.value)}
                  placeholder="e.g. Form 3 Chemistry: Complete Volumetric Analysis Notes"
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subject *
                  </label>
                  <select
                    value={resSubject}
                    onChange={(e) => setResSubject(e.target.value)}
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
                    Type *
                  </label>
                  <select
                    value={resType}
                    onChange={(e) => setResType(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="PDF Notes">PDF Notes</option>
                    <option value="Revision Material">Revision Material</option>
                    <option value="Worksheet">Worksheet</option>
                    <option value="Assignment">Assignment</option>
                    <option value="Practice Paper">Practice Paper</option>
                    <option value="Study Guide">Study Guide</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Resource File URL / Video Stream Link *
                </label>
                <input
                  type="url"
                  required
                  value={resUrl}
                  onChange={(e) => setResUrl(e.target.value)}
                  placeholder="https://drive.google.com/... or https://youtube.com/..."
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description / Topic Coverage
                </label>
                <textarea
                  rows={3}
                  value={resDescription}
                  onChange={(e) => setResDescription(e.target.value)}
                  placeholder="Summary of topics covered, practice questions included..."
                  className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddResource(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Save Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Gallery Photo Modal */}
      {showAddPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-slate-900 font-sans">
              Add Photo to Hub Gallery
            </h3>

            <form onSubmit={handleAddPhoto} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Photo Title *
                </label>
                <input
                  type="text"
                  required
                  value={photoTitle}
                  onChange={(e) => setPhotoTitle(e.target.value)}
                  placeholder="e.g. Grade 12 Calculus Problem Walkthrough"
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category *
                </label>
                <select
                  value={photoCategory}
                  onChange={(e) => setPhotoCategory(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Live Classes">Live Classes</option>
                  <option value="Labs">Labs & Practicals</option>
                  <option value="Study Sessions">Study Sessions</option>
                  <option value="Achievements">Achievements & Awards</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Image URL *
                </label>
                <input
                  type="url"
                  required
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Caption / Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={photoCaption}
                  onChange={(e) => setPhotoCaption(e.target.value)}
                  placeholder="Describe the moment, subject, or student participation..."
                  className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPhoto(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Publish to Gallery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inquiry Reply Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-slate-900 font-sans">
              Respond to Inquiry: {selectedInquiry.subject}
            </h3>
            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              "{selectedInquiry.message}"
            </p>

            <form onSubmit={handleReplyInquiry} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Update Status *
                </label>
                <select
                  value={replyStatus}
                  onChange={(e) => setReplyStatus(e.target.value as any)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="Resolved">Resolved</option>
                  <option value="Under Review">Under Review</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Official Response (as Daniel Owino) *
                </label>
                <textarea
                  required
                  rows={4}
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Write clear instructions, schedule details, or answers to the learner..."
                  className="w-full text-xs p-3.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 leading-relaxed"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedInquiry(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Send Response
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

      {/* Add Subject Modal */}
      {showAddSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-slate-900 font-sans">
              Add New Academic Subject
            </h3>
            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  placeholder="e.g. Physics or Geography"
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description *</label>
                <textarea
                  required
                  rows={2}
                  value={subjectDescription}
                  onChange={(e) => setSubjectDescription(e.target.value)}
                  placeholder="Overview of subject goals, methodology, and holiday syllabus..."
                  className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                ></textarea>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Key Topics (comma-separated)</label>
                <input
                  type="text"
                  value={subjectTopics}
                  onChange={(e) => setSubjectTopics(e.target.value)}
                  placeholder="e.g. Kinematics, Wave Optics, Circuit Analysis"
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Learning Objectives (comma-separated)</label>
                <input
                  type="text"
                  value={subjectObjectives}
                  onChange={(e) => setSubjectObjectives(e.target.value)}
                  placeholder="e.g. Master problem-solving, Eliminate formula errors"
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSubject(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Announcement Modal */}
      {showAddAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-slate-900 font-sans">
              Post Hub Announcement
            </h3>
            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="e.g. Mathematics Saturday Past-Paper Masterclass"
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Audience *</label>
                <select
                  value={annAudience}
                  onChange={(e) => setAnnAudience(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  <option value="All">All Learners & Parents</option>
                  <option value="Parents">Parents Only</option>
                  <option value="Grade 9">Grade 9</option>
                  <option value="Grade 10">Grade 10</option>
                  <option value="Grade 11">Grade 11</option>
                  <option value="Grade 12">Grade 12</option>
                  <option value="Grade 13">Grade 13</option>
                  <option value="Grade 14">Grade 14</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Announcement Message *</label>
                <textarea
                  required
                  rows={4}
                  value={annMessage}
                  onChange={(e) => setAnnMessage(e.target.value)}
                  placeholder="Write clear announcement text for learners and parents..."
                  className="w-full text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                ></textarea>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAnnouncement(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Broadcast Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Teacher Modal */}
      {showAddTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="font-bold text-lg text-slate-900 font-sans">
              Add Teacher to Faculty Directory
            </h3>
            <form onSubmit={handleCreateTeacher} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    placeholder="e.g. Mwalimu David Mwangi"
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Role / Specialization *</label>
                  <input
                    type="text"
                    required
                    value={teacherRole}
                    onChange={(e) => setTeacherRole(e.target.value)}
                    placeholder="e.g. Senior Chemistry Educator"
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Subjects (comma-separated)</label>
                  <input
                    type="text"
                    value={teacherSubjects}
                    onChange={(e) => setTeacherSubjects(e.target.value)}
                    placeholder="Chemistry, Biology"
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Qualification</label>
                  <input
                    type="text"
                    value={teacherQual}
                    onChange={(e) => setTeacherQual(e.target.value)}
                    placeholder="B.Ed. Science (Chemistry)"
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Experience</label>
                <input
                  type="text"
                  value={teacherExp}
                  onChange={(e) => setTeacherExp(e.target.value)}
                  placeholder="8 years guiding top national candidates"
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Biography / Teaching Philosophy</label>
                <textarea
                  rows={2}
                  value={teacherBio}
                  onChange={(e) => setTeacherBio(e.target.value)}
                  placeholder="Brief description of teaching style and passion..."
                  className="w-full text-xs p-3 border border-slate-300 rounded-lg"
                ></textarea>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Photo URL</label>
                <input
                  type="url"
                  value={teacherPhoto}
                  onChange={(e) => setTeacherPhoto(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTeacher(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs"
                >
                  Publish Teacher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
