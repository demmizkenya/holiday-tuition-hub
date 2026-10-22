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
  Subscription
} from '../types';

export const api = {
  // Public data
  async getPublicData(): Promise<{
    settings: PlatformSettings;
    grades: GradeItem[];
    subjects: SubjectItem[];
    announcements: Announcement[];
  }> {
    const res = await fetch('/api/public/data');
    const json = await res.json();
    return json.data;
  },

  // Auth
  async register(data: {
    name: string;
    email: string;
    phone: string;
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

  async login(email: string): Promise<{ success: boolean; user?: UserAccount; message?: string }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return res.json();
  },

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

  async submitInquiry(data: {
    userId: string;
    category: string;
    subject: string;
    message: string;
  }): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/student/inquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
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

  // Admin Portal
  async getAdminOverview(): Promise<{
    studentCount: number;
    parentCount: number;
    pendingPaymentCount: number;
    totalVerifiedRevenue: number;
    activeSubscriptionCount: number;
    totalLessonsCount: number;
    overallAttendanceRate: number;
    recentPayments: PaymentSubmission[];
    recentAuditLogs: AuditLog[];
  }> {
    const res = await fetch('/api/admin/overview');
    const json = await res.json();
    return json.data;
  },

  async getAdminPayments(): Promise<PaymentSubmission[]> {
    const res = await fetch('/api/admin/payments');
    const json = await res.json();
    return json.data || [];
  },

  async verifyPayment(paymentId: string, notes?: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/admin/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId, notes })
    });
    return res.json();
  },

  async rejectPayment(paymentId: string, reason: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/admin/payments/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId, reason })
    });
    return res.json();
  },

  async getAdminSubscriptions(): Promise<Subscription[]> {
    const res = await fetch('/api/admin/subscriptions');
    const json = await res.json();
    return json.data || [];
  },

  async grantComplimentaryAccess(studentId: string, days: number, reason: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/admin/subscriptions/grant-complimentary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, days, reason })
    });
    return res.json();
  },

  async getAdminLessons(): Promise<LessonSlot[]> {
    const res = await fetch('/api/admin/lessons');
    const json = await res.json();
    return json.data || [];
  },

  async createLesson(data: Partial<LessonSlot>): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/admin/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateLessonStatus(lessonId: string, status: string, meetingLink?: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/admin/lessons/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId, status, meetingLink })
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
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async createResource(data: Partial<LearningResource>): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/admin/resources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async createRecordedLesson(data: Partial<RecordedLesson>): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/admin/recorded-lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async createQuiz(data: Partial<QuizItem>): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/admin/quizzes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async gradeAssignment(submissionId: string, score: number, tutorFeedback: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/admin/assignments/grade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissionId, score, tutorFeedback })
    });
    return res.json();
  },

  async postAnnouncement(data: Partial<Announcement>): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/admin/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async updateSettings(data: Partial<PlatformSettings>): Promise<{ success: boolean; message: string; settings?: PlatformSettings }> {
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async saveSubject(data: Partial<SubjectItem>): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/admin/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch('/api/admin/audit-logs');
    const json = await res.json();
    return json.data || [];
  }
};
