export interface PlatformSettings {
  brandName: string;
  tutorName: string;
  tutorEmail: string;
  mpesaNumber: string;
  whatsappNumber: string;
  whatsappGroupUrl: string;
  weeklyPrice: number;
  allowFourWeek: boolean;
  programName: string;
  commencementDate: string;
  endDate: string;
  enrollmentState: 'Enrollment open' | 'Enrollment opening soon' | 'Enrollment closed' | 'Program in progress' | 'Program completed';
  timezone: string;
  tutorBio: string;
  aboutText: string;
  heroBackgroundImage?: string;
}

export interface GradeItem {
  id: string;
  name: string;
  level: string;
  description: string;
  curriculum: string;
  active: boolean;
  learningObjectives: string[];
}

export interface SubjectItem {
  id: string;
  name: string;
  description: string;
  supportedGrades: string[];
  topics: string[];
  learningObjectives: string[];
  isPublished: boolean;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  passwordHash?: string;
  phone: string;
  role: 'student' | 'parent' | 'admin' | 'tutor';
  grade?: string;
  selectedSubjects?: string[];
  relationship?: string;
  accountStatus: 'Registered' | 'Enrolled' | 'Suspended';
  createdAt: string;
}

export interface ParentStudentLink {
  id: string;
  parentId: string;
  parentName: string;
  parentEmail: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedAt: string;
  approvedAt?: string;
}

export interface PaymentSubmission {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  mpesaCode: string;
  amountPaid: number;
  transactionDate: string;
  payingPhoneNumber: string;
  packageType: string;
  note?: string;
  status: 'Awaiting payment' | 'Submitted for verification' | 'Under review' | 'Verified' | 'Rejected' | 'Refunded';
  submittedAt: string;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

export interface Subscription {
  id: string;
  studentId: string;
  studentName: string;
  subscriptionType: string;
  amountPaid: number;
  verifiedMpesaRef: string;
  startDate: string;
  expiryDate: string;
  endDate?: string;
  status: 'Pending Activation' | 'Active' | 'Expired' | 'Cancelled' | 'Suspended';
  verifiedBy: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface LessonBooking {
  bookingId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  bookedAt: string;
  studentNote?: string;
  status: 'Confirmed' | 'Cancelled';
}

export interface LessonSlot {
  id: string;
  title: string;
  subject: string;
  grade: string;
  tutorName: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  capacity: number;
  bookedCount: number;
  meetingLink: string;
  status: 'Published' | 'Draft' | 'Completed' | 'Cancelled' | 'Rescheduled' | 'Scheduled';
  bookings: LessonBooking[];
}

export interface RecordedLesson {
  id: string;
  title: string;
  subject: string;
  grade: string;
  topic: string;
  description: string;
  videoUrl: string;
  durationMinutes: number;
  publicationDate: string;
  isPublished: boolean;
  isPaidOnly: boolean;
}

export interface LearningResource {
  id: string;
  title: string;
  description: string;
  grade: string;
  subject: string;
  topic: string;
  type?: string;
  resourceType: 'PDF Notes' | 'Revision Material' | 'Worksheet' | 'Assignment' | 'Practice Paper' | 'Study Guide';
  fileUrl: string;
  url?: string;
  fileSize: string;
  publicationDate: string;
  isPaidOnly: boolean;
  isDownloadable?: boolean;
  assignmentDeadline?: string;
}

export interface AssignmentItem {
  id: string;
  title: string;
  grade: string;
  subject: string;
  instructions: string;
  deadline: string;
  maxMarks: number;
  publicationDate: string;
  isPublished: boolean;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  textResponse: string;
  fileAttachment?: string;
  status: 'Submitted' | 'Marked' | 'Late';
  score?: number;
  maxMarks: number;
  tutorFeedback?: string;
  markedBy?: string;
  markedAt?: string;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  type: 'mcq' | 'short_answer';
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  marks: number;
}

export interface QuizItem {
  id: string;
  title: string;
  grade: string;
  subject: string;
  topic: string;
  durationMinutes: number;
  passMark: number;
  maxMarks: number;
  questions: QuizQuestion[];
  isPublished: boolean;
}

export interface QuizSubmission {
  id: string;
  quizId: string;
  quizTitle: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  answers: Record<string, string>;
  score: number;
  maxMarks: number;
  percentage: number;
  passed: boolean;
  feedback?: string;
}

export interface AttendanceRecord {
  id: string;
  lessonId: string;
  lessonTitle: string;
  studentId: string;
  studentName: string;
  grade: string;
  subject: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  recordedBy: string;
  recordedAt: string;
  notes?: string;
}

export interface ProgressReport {
  id: string;
  studentId: string;
  studentName: string;
  grade: string;
  enrolledSubjects: string[];
  reportDate: string;
  attendanceSummary: {
    totalLessons: number;
    attended: number;
    attendanceRate: number;
  };
  quizAverage: number;
  completedAssignments: number;
  tutorObservations: string;
  areasForImprovement: string;
  revisionRecommendations: string;
  createdBy: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  targetAudience: 'All' | 'Grade 9' | 'Grade 10' | 'Grade 11' | 'Grade 12' | 'Grade 13' | 'Grade 14' | 'Parents';
  subjectCategory?: string;
  publishedAt: string;
  isArchived: boolean;
}

export interface SupportInquiry {
  id: string;
  userId?: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  userRole?: string;
  category: 'Payment Verification' | 'Lesson Scheduling' | 'Learning Resources' | 'Account' | 'General';
  subject: string;
  message: string;
  status: 'Open' | 'Under Review' | 'Awaiting User Response' | 'Resolved' | 'Closed';
  adminNotes?: string;
  tutorResponse?: string;
  responses: {
    author: string;
    message: string;
    timestamp: string;
  }[];
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  adminName: string;
  timestamp: string;
}

export interface DiscussionReply {
  id: string;
  authorId: string;
  authorName: string;
  authorGrade?: string;
  content: string;
  createdAt: string;
}

export interface DiscussionTopic {
  id: string;
  title: string;
  subject: string;
  grade: string;
  authorId: string;
  authorName: string;
  authorGrade?: string;
  content: string;
  createdAt: string;
  likes: number;
  replies: DiscussionReply[];
}

export interface GalleryPhoto {
  id: string;
  title: string;
  description: string;
  caption?: string;
  category: string;
  imageUrl: string;
  dateAdded: string;
  uploadedAt?: string;
}

export interface TeacherProfile {
  id: string;
  name: string;
  role: string;
  subjects: string[];
  qualification: string;
  qualifications?: string[];
  experience: string;
  bio: string;
  photoUrl: string;
  imageUrl?: string;
  email?: string;
}
