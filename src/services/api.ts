import {
  PlatformSettings,
  GradeItem,
  SubjectItem,
  UserAccount,
  PaymentSubmission,
  LessonSlot,
  RecordedLesson,
  LearningResource,
  AssignmentItem,
  AssignmentSubmission,
  QuizItem,
  QuizSubmission,
  AttendanceRecord,
  ProgressReport,
  Announcement,
  SupportInquiry,
  AuditLog,
  Subscription,
  DiscussionTopic,
  DiscussionReply,
  GalleryPhoto,
  TeacherProfile
} from '../types';

// Administrator Session Token Management
const ADMIN_TOKEN_KEY = 'hth_admin_auth_token';

function getAdminToken(): string | null {
  try {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY) || localStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
}

function setAdminToken(token: string) {
  try {
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  } catch (err) {
    console.error('Failed to store admin token:', err);
  }
}

function clearAdminToken() {
  try {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  } catch (err) {
    console.error('Failed to clear admin token:', err);
  }
}

function getAdminHeaders(): HeadersInit {
  const token = getAdminToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    headers['x-admin-token'] = token;
  }
  return headers;
}

export const api = {
  // Public data
  async getPublicData(): Promise<{
    settings: PlatformSettings;
    grades: GradeItem[];
    subjects: SubjectItem[];
    announcements: Announcement[];
    teachers: TeacherProfile[];
    gallery: GalleryPhoto[];
    resources?: LearningResource[];
  }> {
    const res = await fetch('/api/public/data');
    const json = await res.json();
    return json.data;
  },

  // Auth - Student & Parent
  async register(data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
    role: 'student' | 'parent';
    grade?: string;
    selectedSubjects?: string[];
    relationship?: string;
  }): Promise<{ success: boolean; user?: UserAccount; message: string }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async login(email: string, password?: string): Promise<{ success: boolean; user?: UserAccount; message?: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },

  // Dedicated Admin Auth (Private Route)
  async adminLogin(email: string, password: string): Promise<{ success: boolean; token?: string; user?: UserAccount; message?: string }> {
    const res = await fetch('/api/auth/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const json = await res.json();
    if (json.success && json.token) {
      setAdminToken(json.token);
    }
    return json;
  },

  async adminLogout(): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/api/auth/admin-logout', {
        method: 'POST',
        headers: getAdminHeaders()
      });
      clearAdminToken();
      return res.json();
    } catch {
      clearAdminToken();
      return { success: true, message: 'Logged out.' };
    }
  },

  async verifyAdminSession(): Promise<{ success: boolean; user?: UserAccount; message?: string }> {
    const token = getAdminToken();
    if (!token) {
      return { success: false, message: 'No administrator token.' };
    }
    try {
      const res = await fetch('/api/auth/admin-session', {
        headers: getAdminHeaders()
      });
      const json = await res.json();
      if (!json.success) {
        clearAdminToken();
      }
      return json;
    } catch {
      clearAdminToken();
      return { success: false, message: 'Verification network failure.' };
    }
  },

  getAdminToken,
  clearAdminToken,

  async getDemoUsers(): Promise<UserAccount[]> {
    const res = await fetch('/api/auth/demo-users');
    const json = await res.json();
    return json.users || [];
  },

  // Student Portal
  async getStudentDashboard(studentId: string): Promise<{
    student: UserAccount;
    subscriptions: Subscription[];
    activeSubscription: Subscription | null;
    hasPaidAccess: boolean;
    payments: PaymentSubmission[];
    availableLessons: LessonSlot[];
    myBookings: LessonSlot[];
    recordedLessons: RecordedLesson[];
    resources: LearningResource[];
    assignments: AssignmentItem[];
    assignmentSubmissions: AssignmentSubmission[];
    quizzes: QuizItem[];
    quizSubmissions: QuizSubmission[];
    attendance: AttendanceRecord[];
    progressReports: ProgressReport[];
    announcements: Announcement[];
  }> {
    const res = await fetch(`/api/student/dashboard/${studentId}`);
    const json = await res.json();
    return json.data;
  },

  async bookLesson(studentId: string, lessonId: string, studentNote?: string): Promise<{ success: boolean; message: string; lesson?: LessonSlot }> {
    const res = await fetch('/api/student/book-lesson', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, lessonId, studentNote })
    });
    return res.json();
  },

  async cancelBooking(studentId: string, lessonId: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/student/cancel-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, lessonId })
    });
    return res.json();
  },

  async submitPayment(data: {
    studentId: string;
    mpesaCode: string;
    amountPaid: number;
    transactionDate: string;
    payingPhoneNumber: string;
    packageType?: string;
    note?: string;
  }): Promise<{ success: boolean; message: string; payment?: PaymentSubmission }> {
    const res = await fetch('/api/student/submit-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async submitAssignment(data: {
    assignmentId: string;
    studentId: string;
    textResponse: string;
    fileAttachment?: string;
  }): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/student/submit-assignment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async submitQuiz(data: {
    quizId: string;
    studentId: string;
    answers: Record<string, string>;
  }): Promise<{ success: boolean; message: string; result?: QuizSubmission; questionsWithExplanations?: any[] }> {
    const res = await fetch('/api/student/submit-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Inquiries with robust JSON parsing
  async submitInquiry(data: {
    userId?: string;
    userName?: string;
    userEmail?: string;
    userPhone?: string;
    userRole?: string;
    category: string;
    subject: string;
    message: string;
  }): Promise<{ success: boolean; message: string; inquiry?: SupportInquiry }> {
    try {
      const res = await fetch('/api/student/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      });
      const text = await res.text();
      try {
        return JSON.parse(text);
      } catch (e) {
        console.error('Non-JSON response from inquiry endpoint:', text);
        return { success: false, message: 'Server returned an invalid format. Please try again.' };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Network error sending inquiry.' };
    }
  },

  // Group Discussion
  async getDiscussions(): Promise<DiscussionTopic[]> {
    const res = await fetch('/api/discussions');
    const json = await res.json();
    return json.data || [];
  },

  async createDiscussionTopic(data: {
    title: string;
    subject: string;
    grade?: string;
    authorId?: string;
    authorName: string;
    authorGrade?: string;
    content: string;
  }): Promise<{ success: boolean; message: string; topic?: DiscussionTopic }> {
    const res = await fetch('/api/discussions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async replyDiscussionTopic(data: {
    topicId: string;
    authorId?: string;
    authorName: string;
    authorGrade?: string;
    content: string;
  }): Promise<{ success: boolean; message: string; reply?: DiscussionReply }> {
    const res = await fetch('/api/discussions/reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async likeDiscussionTopic(topicId: string): Promise<{ success: boolean; likes?: number }> {
    const res = await fetch('/api/discussions/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topicId })
    });
    return res.json();
  },

  // Gallery
  async getGallery(): Promise<GalleryPhoto[]> {
    const res = await fetch('/api/gallery');
    const json = await res.json();
    return json.data || [];
  },

  async addGalleryPhoto(data: {
    title: string;
    description: string;
    category: string;
    imageUrl: string;
  }): Promise<{ success: boolean; message: string; photo?: GalleryPhoto }> {
    const res = await fetch('/api/admin/gallery', {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteGalleryPhoto(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/admin/gallery/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders()
    });
    return res.json();
  },

  // Media / File Upload
  async adminUploadFile(filename: string, fileBase64: string): Promise<{ success: boolean; url?: string; message?: string }> {
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify({ filename, fileBase64 })
    });
    return res.json();
  },

  // Parent Portal
  async getParentDashboard(parentId: string): Promise<{
    parent: UserAccount;
    links: any[];
    studentsData: {
      student: UserAccount;
      subscriptions: Subscription[];
      payments: PaymentSubmission[];
      bookedLessons: LessonSlot[];
      attendance: AttendanceRecord[];
      progressReports: ProgressReport[];
      quizSubmissions: QuizSubmission[];
      assignmentSubmissions: AssignmentSubmission[];
    }[];
    announcements: Announcement[];
  }> {
    const res = await fetch(`/api/parent/dashboard/${parentId}`);
    const json = await res.json();
    return json.data;
  },

  async requestParentLink(parentId: string, studentEmail?: string, studentPhone?: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/parent/request-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parentId, studentEmail, studentPhone })
    });
    return res.json();
  },

  // Admin Portal & Protected Single Source of Truth
  async getAdminOverview(): Promise<{
    studentCount: number;
    parentCount: number;
    pendingPaymentCount: number;
    totalVerifiedRevenue: number;
    activeSubscriptionCount: number;
    totalLessonsCount: number;
    overallAttendanceRate: number;
    openInquiriesCount: number;
    recentPayments: PaymentSubmission[];
    recentAuditLogs: AuditLog[];
  }> {
    const res = await fetch('/api/admin/overview', {
      headers: getAdminHeaders()
    });
    const json = await res.json();
    return json.data;
  },

  async getAdminUsers(): Promise<UserAccount[]> {
    const res = await fetch('/api/admin/users', {
      headers: getAdminHeaders()
    });
    const json = await res.json();
    return json.data || [];
  },

  async updateUserStatus(userId: string, status: 'Registered' | 'Enrolled' | 'Suspended'): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/admin/users/update-status', {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify({ userId, status })
    });
    return res.json();
  },

  async updateSubscriptionStatus(subscriptionId: string, status: 'Active' | 'Expired' | 'Suspended' | 'Cancelled', reason?: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/admin/subscriptions/update-status', {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify({ subscriptionId, status, reason })
    });
    return res.json();
  },

  async getAdminInquiries(): Promise<SupportInquiry[]> {
    const res = await fetch('/api/admin/inquiries', {
      headers: getAdminHeaders()
    });
    const json = await res.json();
    return json.data || [];
  },

  async respondAdminInquiry(inquiryId: string, message: string, status?: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/admin/inquiries/respond', {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify({ inquiryId, message, status })
    });
    return res.json();
  },

  async getAdminPayments(): Promise<PaymentSubmission[]> {
    const res = await fetch('/api/admin/payments', {
      headers: getAdminHeaders()
    });
    const json = await res.json();
    return json.data || [];
  },

  async verifyPayment(paymentId: string, notes?: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/admin/payments/verify', {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify({ paymentId, notes })
    });
    return res.json();
  },

  async rejectPayment(paymentId: string, reason: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/admin/payments/reject', {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify({ paymentId, reason })
    });
    return res.json();
  },

  async getAdminSubscriptions(): Promise<Subscription[]> {
    const res = await fetch('/api/admin/subscriptions', {
      headers: getAdminHeaders()
    });
    const json = await res.json();
    return json.data || [];
  },

  // Admin Subjects CRUD
  async getAdminSubjects(): Promise<SubjectItem[]> {
    const res = await fetch('/api/admin/subjects', {
      headers: getAdminHeaders()
    });
    const json = await res.json();
    return json.data || [];
  },

  async createAdminSubject(data: Partial<SubjectItem>): Promise<{ success: boolean; message: string; subject?: SubjectItem }> {
    const res = await fetch('/api/admin/subjects', {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateAdminSubject(id: string, data: Partial<SubjectItem>): Promise<{ success: boolean; message: string; subject?: SubjectItem }> {
    const res = await fetch(`/api/admin/subjects/${id}`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteAdminSubject(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/admin/subjects/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders()
    });
    return res.json();
  },

  // Admin Announcements CRUD
  async getAdminAnnouncements(): Promise<Announcement[]> {
    const res = await fetch('/api/admin/announcements', {
      headers: getAdminHeaders()
    });
    const json = await res.json();
    return json.data || [];
  },

  async createAdminAnnouncement(data: Partial<Announcement>): Promise<{ success: boolean; message: string; announcement?: Announcement }> {
    const res = await fetch('/api/admin/announcements', {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateAdminAnnouncement(id: string, data: Partial<Announcement>): Promise<{ success: boolean; message: string; announcement?: Announcement }> {
    const res = await fetch(`/api/admin/announcements/${id}`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteAdminAnnouncement(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/admin/announcements/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders()
    });
    return res.json();
  },

  // Admin Faculty Teachers CRUD
  async getAdminTeachers(): Promise<TeacherProfile[]> {
    const res = await fetch('/api/admin/teachers', {
      headers: getAdminHeaders()
    });
    const json = await res.json();
    return json.data || [];
  },

  async createAdminTeacher(data: Partial<TeacherProfile>): Promise<{ success: boolean; message: string; teacher?: TeacherProfile }> {
    const res = await fetch('/api/admin/teachers', {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateAdminTeacher(id: string, data: Partial<TeacherProfile>): Promise<{ success: boolean; message: string; teacher?: TeacherProfile }> {
    const res = await fetch(`/api/admin/teachers/${id}`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteAdminTeacher(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/admin/teachers/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders()
    });
    return res.json();
  },

  async getAdminLessons(): Promise<LessonSlot[]> {
    const res = await fetch('/api/admin/lessons', {
      headers: getAdminHeaders()
    });
    const json = await res.json();
    return json.data || [];
  },

  async createLesson(data: Partial<LessonSlot>): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/admin/lessons', {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateLessonStatus(lessonId: string, status: string, meetingLink?: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/admin/lessons/update-status', {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify({ lessonId, status, meetingLink })
    });
    return res.json();
  },

  async deleteLesson(lessonId: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/admin/lessons/${lessonId}`, {
      method: 'DELETE',
      headers: getAdminHeaders()
    });
    return res.json();
  },

  async recordAttendance(data: {
    lessonId: string;
    studentId: string;
    status: 'Present' | 'Absent' | 'Late' | 'Excused';
    notes?: string;
  }): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/admin/attendance/record', {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async publishProgressReport(data: {
    studentId: string;
    tutorObservations: string;
    areasForImprovement?: string;
    revisionRecommendations?: string;
  }): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/admin/progress-reports', {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getAdminResources(): Promise<LearningResource[]> {
    const res = await fetch('/api/admin/resources', {
      headers: getAdminHeaders()
    });
    const json = await res.json();
    return json.data || [];
  },

  async createResource(data: Partial<LearningResource>): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/admin/resources', {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteResource(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/admin/resources/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders()
    });
    return res.json();
  },

  async createRecordedLesson(data: Partial<RecordedLesson>): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/admin/recorded-lessons', {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async deleteRecordedLesson(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`/api/admin/recorded-lessons/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders()
    });
    return res.json();
  },

  async createQuiz(data: Partial<QuizItem>): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/admin/quizzes', {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateSettings(data: Partial<PlatformSettings>): Promise<{ success: boolean; message: string; settings?: PlatformSettings }> {
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: getAdminHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch('/api/admin/audit-logs', {
      headers: getAdminHeaders()
    });
    const json = await res.json();
    return json.data || [];
  }
};
