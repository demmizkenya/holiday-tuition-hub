import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export function hashPassword(password: string, salt = 'hth_admin_salt_demmiz_2026'): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

export function verifyPassword(password: string, storedHash: string, salt = 'hth_admin_salt_demmiz_2026'): boolean {
  try {
    const computed = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(storedHash, 'hex'));
  } catch {
    return false;
  }
}

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
  status: 'Pending Activation' | 'Active' | 'Expired' | 'Cancelled' | 'Suspended';
  verifiedBy: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
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
  status: 'Published' | 'Draft' | 'Completed' | 'Cancelled' | 'Rescheduled';
  bookings: {
    bookingId: string;
    studentId: string;
    studentName: string;
    studentEmail: string;
    bookedAt: string;
    studentNote?: string;
    status: 'Confirmed' | 'Cancelled';
  }[];
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
  resourceType: 'PDF Notes' | 'Revision Material' | 'Worksheet' | 'Assignment' | 'Practice Paper' | 'Study Guide';
  fileUrl: string;
  fileSize: string;
  publicationDate: string;
  isPaidOnly: boolean;
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
  correctAnswer: string;
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
  category: string;
  imageUrl: string;
  dateAdded: string;
}

export interface TeacherProfile {
  id: string;
  name: string;
  role: string;
  subjects: string[];
  qualification: string;
  experience: string;
  bio: string;
  photoUrl: string;
}

export interface DatabaseSchema {
  settings: PlatformSettings;
  grades: GradeItem[];
  subjects: SubjectItem[];
  users: UserAccount[];
  parentLinks: ParentStudentLink[];
  payments: PaymentSubmission[];
  subscriptions: Subscription[];
  lessonSlots: LessonSlot[];
  recordedLessons: RecordedLesson[];
  resources: LearningResource[];
  assignments: AssignmentItem[];
  assignmentSubmissions: AssignmentSubmission[];
  quizzes: QuizItem[];
  quizSubmissions: QuizSubmission[];
  attendance: AttendanceRecord[];
  progressReports: ProgressReport[];
  announcements: Announcement[];
  supportInquiries: SupportInquiry[];
  auditLogs: AuditLog[];
  discussions: DiscussionTopic[];
  gallery: GalleryPhoto[];
  teachers: TeacherProfile[];
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

function getInitialDatabase(): DatabaseSchema {
  return {
    settings: {
      brandName: 'HOLIDAY TUITION HUB',
      tutorName: 'Daniel Owino',
      tutorEmail: 'danielowino233@gmail.com',
      mpesaNumber: '0116654805',
      whatsappNumber: '0708083643',
      whatsappGroupUrl: 'https://chat.whatsapp.com/invite/HolidayTuitionHubKenya',
      weeklyPrice: 699,
      allowFourWeek: false,
      programName: 'November 2026 Holiday Intensive',
      commencementDate: '2026-11-01',
      endDate: '2026-11-22',
      enrollmentState: 'Enrollment open',
      timezone: 'Africa/Nairobi',
      tutorBio: 'Daniel Owino is the founder and lead educator at Holiday Tuition Hub. Dedicated to academic excellence, he delivers structured holiday tuition and mentorship across high school levels (Grades 9 to 14) with a strong emphasis on core concept mastery, exam techniques, and personal academic confidence.',
      aboutText: 'Holiday Tuition Hub provides premier online tutoring and academic mentorship for high school students in Grades 9 through 14 across Kenya and East Africa. Our structured holiday program combines interactive live lessons, on-demand recorded learning archives, downloadable revision materials, and targeted practice assessments to ensure students make their holiday count.',
      heroBackgroundImage: '/assets/aistudio/Gemini_Generated_Image_eiuqjeeiuqjeeiuq_b3db601d.jpeg'
    },
    grades: [
      {
        id: 'grade-9',
        name: 'Grade 9',
        level: 'Junior Secondary / Form 1 Transition',
        description: 'Foundation building in core competencies, transition to high school level thinking, and study discipline.',
        curriculum: 'CBC / National Curriculum Pathway',
        active: true,
        learningObjectives: ['Establish rigorous mathematical reasoning', 'Master scientific inquiry and fundamentals', 'Develop fluent written and oral language expressions', 'Gain digital literacy and algorithmic thinking']
      },
      {
        id: 'grade-10',
        name: 'Grade 10',
        level: 'Secondary Level / Form 2 Equivalent',
        description: 'Consolidation of foundational knowledge and introduction of intermediate topics in sciences and languages.',
        curriculum: 'National & Comprehensive High School Track',
        active: true,
        learningObjectives: ['Strengthen analytical algebraic formulations', 'Explore reaction kinetics and chemical bonding', 'Enhance critical literary analysis', 'Implement structured computing algorithms']
      },
      {
        id: 'grade-11',
        name: 'Grade 11',
        level: 'Senior Secondary / Form 3 Equivalent',
        description: 'Advanced subject immersion, focused coursework mastery, and preliminary national exam preparation.',
        curriculum: 'Senior Secondary / Pre-Candidate High School',
        active: true,
        learningObjectives: ['Deepen knowledge in calculus and coordinate geometry', 'Master organic chemistry and stoichiometry', 'Polish essay argumentation and stylistic language nuances', 'Develop database and web programming logic']
      },
      {
        id: 'grade-12',
        name: 'Grade 12',
        level: 'Candidate Level / Form 4 Equivalent',
        description: 'Intensive candidate exam preparation, topic-by-topic revisions, past-paper drills, and timed assessments.',
        curriculum: 'KCSE / Senior School Certification Exam Focus',
        active: true,
        learningObjectives: ['Complete comprehensive syllabus revisions', 'Refine exam timing and error elimination', 'Achieve top-tier performance in science practicals and papers', 'Master complex problem solving under timed conditions']
      },
      {
        id: 'grade-13',
        name: 'Grade 13',
        level: 'Advanced Level Year 1 / AS-Level / Post-Secondary Pre-University',
        description: 'Advanced secondary studies, specialized STEM pathways, and academic research methodologies.',
        curriculum: 'Advanced Secondary / Pre-University Track',
        active: true,
        learningObjectives: ['Master pure and applied mathematics at an advanced level', 'Explore thermodynamics and advanced molecular chemistry', 'Conduct in-depth literary and linguistic deconstructions', 'Build full-fledged computational problem models']
      },
      {
        id: 'grade-14',
        name: 'Grade 14',
        level: 'Advanced Level Year 2 / A2-Level / University Entrance Preparation',
        description: 'University readiness, advanced university entrance mastery, and scholarly mentorship.',
        curriculum: 'Advanced Level / High School Completion',
        active: true,
        learningObjectives: ['Demonstrate academic mastery ready for competitive university STEM/Humanities degrees', 'Achieve peak distinction in final comprehensive papers', 'Master independent academic inquiry and analytical writing']
      }
    ],
    subjects: [
      {
        id: 'math',
        name: 'Mathematics',
        description: 'Comprehensive mathematical mastery covering algebra, calculus, geometry, trigonometry, vectors, and statistics with step-by-step problem-solving methods.',
        supportedGrades: ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Grade 13', 'Grade 14'],
        topics: [
          'Linear & Quadratic Equations',
          'Matrices and Transformations',
          'Coordinate Geometry & Vectors',
          'Calculus: Differentiation & Integration',
          'Probability & Commercial Arithmetic',
          'Trigonometry & Three-Dimensional Geometry'
        ],
        learningObjectives: [
          'Build rapid problem-identification techniques',
          'Eliminate arithmetic and formulaic errors',
          'Master multi-step examination questions with verified proofs'
        ],
        isPublished: true
      },
      {
        id: 'english',
        name: 'English',
        description: 'Mastery of functional writing, comprehension, cloze test strategies, oral skills, and critical literary set-book analysis.',
        supportedGrades: ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Grade 13', 'Grade 14'],
        topics: [
          'Set-Book & Literary Prose Analysis',
          'Functional Writing & Formal Essays',
          'Advanced Grammar & Sentence Mechanics',
          'Unseen Poetry Appreciation',
          'Oral Skills & Phonetics Mastery'
        ],
        learningObjectives: [
          'Write persuasive, structured, and grammatically flawless essays',
          'Analyze themes, characterization, and stylistic devices in set texts',
          'Maximize score in paper 1 functional writing and paper 2 comprehension'
        ],
        isPublished: true
      },
      {
        id: 'chemistry',
        name: 'Chemistry',
        description: 'Deep conceptual and practical training in inorganic, organic, and physical chemistry with emphasis on the mole concept and reaction equations.',
        supportedGrades: ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Grade 13', 'Grade 14'],
        topics: [
          'The Mole: Formulae and Balanced Chemical Equations',
          'Structure and Bonding: Giant Ionic & Metallic Lattices',
          'Periodic Table Trends and Reaction Profiles',
          'Organic Chemistry: Hydrocarbons, Alkanols & Polymers',
          'Acids, Bases, Salts and Quantitative Titration'
        ],
        learningObjectives: [
          'Master mole calculations and stoichiometry with precision',
          'Understand qualitative analysis and reagent testing',
          'Excel in both theoretical exams and practical lab procedures'
        ],
        isPublished: true
      },
      {
        id: 'kiswahili',
        name: 'Kiswahili',
        description: 'Mafunzo ya kina ya Sarufi, Insha, Ufahamu, Fasihi Simulizi na Andishi, na Isimu Jamii kwa wanafunzi wa madarasa yote.',
        supportedGrades: ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Grade 13', 'Grade 14'],
        topics: [
          'Uchambuzi wa Riwaya, Tamthilia na Ushairi',
          'Uandishi wa Insha za Kubuni na za Kiada',
          'Sarufi ya Kiswahili: Ngeli, Mnyambuliko, na Uakifishaji',
          'Ufahamu na Ufupisho wa Kina',
          'Isimu Jamii na Mawasiliano katika Muktadha Mbalimbali'
        ],
        learningObjectives: [
          'Kuimarisha ufasaha wa uandishi wa Insha bila dosari za kisarufi',
          'Kutawala mbinu za lugha na wahusika katika Fasihi',
          'Kujibu maswali ya mtihani kwa ustadi unaotakikana'
        ],
        isPublished: true
      },
      {
        id: 'computer-studies',
        name: 'Computer Studies',
        description: 'Theoretical and practical fundamentals of computing: computer systems, data representation, algorithms, pseudo-code, database design, and web programming.',
        supportedGrades: ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Grade 13', 'Grade 14'],
        topics: [
          'Computer Hardware, Memory & Operating Systems',
          'Data Representation, Binary Arithmetic & Logic Gates',
          'Algorithms, Flowcharts and Pseudocode Design',
          'Database Design, SQL & Information Systems',
          'Networking Fundamentals and Internet Security',
          'Programming Logic and Web Development Foundations'
        ],
        learningObjectives: [
          'Develop algorithmic problem-solving and clean pseudocode',
          'Understand database normalization and entity relationship modeling',
          'Gain hands-on proficiency in computing concepts for exams and real-world tech'
        ],
        isPublished: true
      }
    ],
    teachers: [
      {
        id: 'tch-daniel',
        name: 'Daniel Owino',
        role: 'Founder & Lead Tutor',
        subjects: ['Mathematics', 'Sciences Mentorship'],
        qualification: 'B.Ed. Science (Mathematics & Chemistry), Academic Consultant',
        experience: 'Over 8 years guiding secondary students to distinction in national examinations.',
        bio: 'Specializing in breaking down complex algebraic formulations, differential calculus, and chemical stoichiometry into intuitive, memorable first principles.',
        photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'tch-sarah',
        name: 'Sarah Muthoni',
        role: 'Senior English & Literature Mentor',
        subjects: ['English Language', 'Literary Analysis'],
        qualification: 'B.Ed. Arts (English & Literature)',
        experience: '6+ years coaching candidate students in essay structuring and set-book criticism.',
        bio: 'Passionate about elevating students writing style, grammatical precision, and literary deconstruction of core set texts.',
        photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'tch-dennis',
        name: 'Dr. Dennis Kiprop',
        role: 'Senior Chemistry Specialist',
        subjects: ['Chemistry', 'Laboratory Principles'],
        qualification: 'M.Sc. Chemistry, Ph.D. Candidate',
        experience: '7 years tutoring secondary and pre-university chemistry students.',
        bio: 'Brings experimental clarity to quantitative titration, the mole concept, thermodynamics, and organic reaction pathways.',
        photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'tch-amina',
        name: 'Mwalimu Amina Juma',
        role: 'Kiswahili Scholar & Linguist',
        subjects: ['Kiswahili (Sarufi, Fasihi & Insha)'],
        qualification: 'B.Ed. (Kiswahili & History)',
        experience: '9 years teaching Kiswahili with outstanding KCSE student performances.',
        bio: 'Mwelekezi mwenye tajriba katika uchambuzi wa riwaya, tamthilia, mbinu za lugha, sarufi ya ngeli na uandishi bora wa insha.',
        photoUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=600&q=80'
      },
      {
        id: 'tch-brian',
        name: 'Eng. Brian Ochieng',
        role: 'Computer Studies & Software Mentor',
        subjects: ['Computer Studies', 'Algorithms & Logic'],
        qualification: 'B.Sc. Computer Science',
        experience: '5 years developing systems and teaching high school computing syllabuses.',
        bio: 'Guides learners through binary arithmetic, database entity relationships, flowcharts, and clear pseudocode implementation.',
        photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80'
      }
    ],
    gallery: [
      {
        id: 'gal-1',
        title: 'Interactive Live Whiteboard Calculus Derivation',
        description: 'Tutor Daniel Owino guiding students through differential gradient tangent lines.',
        category: 'Live Classes',
        imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
        dateAdded: '2026-10-18'
      },
      {
        id: 'gal-2',
        title: 'Stoichiometry & Chemical Practical Preparation',
        description: 'Laboratory demonstrations illustrating reacting masses, titration, and molarity calculations.',
        category: 'Science Drills',
        imageUrl: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
        dateAdded: '2026-10-19'
      },
      {
        id: 'gal-3',
        title: 'Collaborative Holiday Revision Group',
        description: 'Students working through timed past-paper questions in our peer discussion hub.',
        category: 'Student Study',
        imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
        dateAdded: '2026-10-20'
      },
      {
        id: 'gal-4',
        title: 'Computer Studies Algorithm & Database Design',
        description: 'Trace tables, flowcharts, and pseudocode walkthroughs for Grade 11-12 candidates.',
        category: 'Computing',
        imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
        dateAdded: '2026-10-21'
      }
    ],
    discussions: [
      {
        id: 'disc-1',
        title: 'How do you easily find the equation of a normal to a curve in Calculus?',
        subject: 'Mathematics',
        grade: 'Grade 11',
        authorId: 'usr-student-faith',
        authorName: 'Faith Wanjiru',
        authorGrade: 'Grade 11',
        content: 'Hi everyone! While doing calculus differentiation, I know dy/dx gives the tangent slope m1. To get the normal slope, is it always m2 = -1 / m1? How do you handle cases where m1 = 0?',
        createdAt: '2026-10-21T14:30:00Z',
        likes: 4,
        replies: [
          {
            id: 'rep-1',
            authorId: 'usr-admin-daniel',
            authorName: 'Daniel Owino (Tutor)',
            content: 'Great question Faith! Yes, because perpendicular lines satisfy m1 * m2 = -1, the normal gradient is the negative reciprocal. When m1 = 0 (a horizontal tangent at a stationary turning point), the normal line is vertical with equation x = x1.',
            createdAt: '2026-10-21T15:10:00Z'
          }
        ]
      },
      {
        id: 'disc-2',
        title: 'Memorizing Organic Chemistry IUPAC Naming for Alkanols and Alkanoic Acids',
        subject: 'Chemistry',
        grade: 'Grade 11',
        authorId: 'usr-student-kelvin',
        authorName: 'Kelvin Mwangi',
        authorGrade: 'Grade 11',
        content: 'Does anyone have a good mnemonic for remembering the functional group priority and prefixes from meth- to dec-?',
        createdAt: '2026-10-22T09:15:00Z',
        likes: 3,
        replies: [
          {
            id: 'rep-2',
            authorId: 'usr-student-faith',
            authorName: 'Faith Wanjiru',
            authorGrade: 'Grade 11',
            content: 'I use: "Monkeys Eat Peanut Butter" for Methane, Ethane, Propane, Butane! For alkanols, remember the suffix is -ol (-OH group), and for acids it is -oic acid (-COOH).',
            createdAt: '2026-10-22T10:00:00Z'
          }
        ]
      }
    ],
    users: [
      {
        id: 'usr-admin-demmiz',
        name: 'Administrator',
        email: 'demmizkenya@gmail.com',
        passwordHash: hashPassword('tuition@hub'),
        phone: '0708083643',
        role: 'admin',
        accountStatus: 'Enrolled',
        createdAt: '2026-10-22T00:00:00Z'
      },
      {
        id: 'usr-admin-daniel',
        name: 'Daniel Owino',
        email: 'danielowino233@gmail.com',
        passwordHash: hashPassword('tuition@hub'),
        phone: '0116654805',
        role: 'admin',
        accountStatus: 'Enrolled',
        createdAt: '2026-10-01T08:00:00Z'
      },
      {
        id: 'usr-student-faith',
        name: 'Faith Wanjiru',
        email: 'faith.wanjiru@example.com',
        password: 'password123',
        phone: '0712345678',
        role: 'student',
        grade: 'Grade 11',
        selectedSubjects: ['Mathematics', 'Chemistry', 'Computer Studies'],
        accountStatus: 'Enrolled',
        createdAt: '2026-10-15T09:30:00Z'
      },
      {
        id: 'usr-parent-mary',
        name: 'Mary Wanjiru',
        email: 'mary.wanjiru@example.com',
        password: 'password123',
        phone: '0722123456',
        role: 'parent',
        relationship: 'Mother',
        accountStatus: 'Enrolled',
        createdAt: '2026-10-16T10:00:00Z'
      }
    ],
    parentLinks: [
      {
        id: 'link-1',
        parentId: 'usr-parent-mary',
        parentName: 'Mary Wanjiru',
        parentEmail: 'mary.wanjiru@example.com',
        studentId: 'usr-student-faith',
        studentName: 'Faith Wanjiru',
        studentPhone: '0712345678',
        status: 'Approved',
        requestedAt: '2026-10-16T10:05:00Z',
        approvedAt: '2026-10-16T11:00:00Z'
      }
    ],
    payments: [
      {
        id: 'pay-001',
        studentId: 'usr-student-faith',
        studentName: 'Faith Wanjiru',
        studentEmail: 'faith.wanjiru@example.com',
        studentPhone: '0712345678',
        mpesaCode: 'QX8923KJ9L',
        amountPaid: 699,
        transactionDate: '2026-10-20',
        payingPhoneNumber: '0712345678',
        packageType: 'Standard Weekly Tuition (KSh 699)',
        note: 'Week 1 November enrollment for Math, Chem & Computer Studies',
        status: 'Verified',
        submittedAt: '2026-10-20T14:20:00Z',
        verifiedBy: 'Daniel Owino',
        verifiedAt: '2026-10-20T15:00:00Z'
      }
    ],
    subscriptions: [
      {
        id: 'sub-001',
        studentId: 'usr-student-faith',
        studentName: 'Faith Wanjiru',
        subscriptionType: 'Weekly Tuition (1 Week)',
        amountPaid: 699,
        verifiedMpesaRef: 'QX8923KJ9L',
        startDate: '2026-11-01',
        expiryDate: '2026-11-08',
        status: 'Active',
        verifiedBy: 'Daniel Owino',
        createdAt: '2026-10-20T15:00:00Z',
        updatedAt: '2026-10-20T15:00:00Z',
        notes: 'Verified against M-Pesa reference QX8923KJ9L'
      }
    ],
    lessonSlots: [
      {
        id: 'les-001',
        title: 'Grade 11 Mathematics: Calculus & Tangent Lines',
        subject: 'Mathematics',
        grade: 'Grade 11',
        tutorName: 'Daniel Owino',
        date: '2026-11-02',
        startTime: '09:00',
        endTime: '10:30',
        durationMinutes: 90,
        capacity: 25,
        bookedCount: 1,
        meetingLink: 'https://meet.google.com/hth-math-g11',
        status: 'Published',
        bookings: [
          {
            bookingId: 'bk-001',
            studentId: 'usr-student-faith',
            studentName: 'Faith Wanjiru',
            studentEmail: 'faith.wanjiru@example.com',
            bookedAt: '2026-10-21T08:00:00Z',
            studentNote: 'Want to focus on differentiation from first principles',
            status: 'Confirmed'
          }
        ]
      },
      {
        id: 'les-002',
        title: 'Grade 11 Chemistry: The Mole Concept & Empirical Formulae',
        subject: 'Chemistry',
        grade: 'Grade 11',
        tutorName: 'Dr. Dennis Kiprop',
        date: '2026-11-03',
        startTime: '11:00',
        endTime: '12:30',
        durationMinutes: 90,
        capacity: 25,
        bookedCount: 1,
        meetingLink: 'https://meet.google.com/hth-chem-g11',
        status: 'Published',
        bookings: [
          {
            bookingId: 'bk-002',
            studentId: 'usr-student-faith',
            studentName: 'Faith Wanjiru',
            studentEmail: 'faith.wanjiru@example.com',
            bookedAt: '2026-10-21T08:10:00Z',
            studentNote: 'Revising stoichiometry calculations',
            status: 'Confirmed'
          }
        ]
      },
      {
        id: 'les-003',
        title: 'Grade 11 Computer Studies: Flowcharts & Pseudocode Problem Solving',
        subject: 'Computer Studies',
        grade: 'Grade 11',
        tutorName: 'Eng. Brian Ochieng',
        date: '2026-11-04',
        startTime: '14:00',
        endTime: '15:30',
        durationMinutes: 90,
        capacity: 25,
        bookedCount: 1,
        meetingLink: 'https://meet.google.com/hth-comp-g11',
        status: 'Published',
        bookings: [
          {
            bookingId: 'bk-003',
            studentId: 'usr-student-faith',
            studentName: 'Faith Wanjiru',
            studentEmail: 'faith.wanjiru@example.com',
            bookedAt: '2026-10-21T08:15:00Z',
            studentNote: 'Writing loops and conditional branches in pseudocode',
            status: 'Confirmed'
          }
        ]
      },
      {
        id: 'les-004',
        title: 'Grade 12 English: Set-Book Analytical Essay Structuring',
        subject: 'English',
        grade: 'Grade 12',
        tutorName: 'Sarah Muthoni',
        date: '2026-11-02',
        startTime: '16:00',
        endTime: '17:30',
        durationMinutes: 90,
        capacity: 25,
        bookedCount: 0,
        meetingLink: 'https://meet.google.com/hth-eng-g12',
        status: 'Published',
        bookings: []
      },
      {
        id: 'les-005',
        title: 'Grade 10 Kiswahili: Ngeli za Nomino na Upatano wa Kisarufi',
        subject: 'Kiswahili',
        grade: 'Grade 10',
        tutorName: 'Mwalimu Amina Juma',
        date: '2026-11-03',
        startTime: '14:00',
        endTime: '15:30',
        durationMinutes: 90,
        capacity: 25,
        bookedCount: 0,
        meetingLink: 'https://meet.google.com/hth-kisw-g10',
        status: 'Published',
        bookings: []
      }
    ],
    recordedLessons: [
      {
        id: 'rec-001',
        title: 'Calculus Foundations: Limits & Gradient Functions Explained',
        subject: 'Mathematics',
        grade: 'Grade 11',
        topic: 'Differentiation',
        description: 'Comprehensive 45-minute masterclass walking through slope approximation, first principles, and quick differentiation power rules with Kenya examination style examples.',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        durationMinutes: 45,
        publicationDate: '2026-10-18',
        isPublished: true,
        isPaidOnly: true
      },
      {
        id: 'rec-002',
        title: 'Mastering the Mole: Percentage Yield & Molar Gas Volume',
        subject: 'Chemistry',
        grade: 'Grade 11',
        topic: 'Stoichiometry & Mole Concept',
        description: 'Step-by-step numerical demonstrations on calculating reacting masses, empirical formulae from laboratory data, and gas volumes at STP/RTP.',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        durationMinutes: 50,
        publicationDate: '2026-10-19',
        isPublished: true,
        isPaidOnly: true
      },
      {
        id: 'rec-003',
        title: 'Algorithms in Action: Designing Trace Tables and Flowcharts',
        subject: 'Computer Studies',
        grade: 'Grade 11',
        topic: 'Programming Logic',
        description: 'Practical walkthrough showing students how to convert English problem specifications into unambiguous algorithmic diagrams and dry-run trace tables.',
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        durationMinutes: 40,
        publicationDate: '2026-10-20',
        isPublished: true,
        isPaidOnly: true
      }
    ],
    resources: [
      {
        id: 'res-001',
        title: 'Grade 11 Calculus Revision Master Booklet & Step-by-Step Solutions',
        description: 'Complete 24-page PDF covering rate of change, tangents, normals, turning points, and maximum/minimum optimization problems with annotated answers.',
        grade: 'Grade 11',
        subject: 'Mathematics',
        topic: 'Calculus',
        resourceType: 'PDF Notes',
        fileUrl: '/materials/Grade11_Math_Calculus_Mastery.pdf',
        fileSize: '3.2 MB',
        publicationDate: '2026-10-15',
        isPaidOnly: true
      },
      {
        id: 'res-002',
        title: 'Stoichiometry & The Mole Concept Comprehensive Worksheet',
        description: '35 structured questions with full working steps for empirical formulae, molarity, percentage composition, and titrations.',
        grade: 'Grade 11',
        subject: 'Chemistry',
        topic: 'The Mole Concept',
        resourceType: 'Worksheet',
        fileUrl: '/materials/Grade11_Chem_Mole_Concept_Worksheet.pdf',
        fileSize: '2.4 MB',
        publicationDate: '2026-10-16',
        isPaidOnly: true
      },
      {
        id: 'res-003',
        title: 'Computer Studies Paper 1: Flowchart & Algorithm Drill Pack',
        description: 'Comprehensive collection of exam-tested algorithm problems requiring flowchart construction and pseudocode drafting.',
        grade: 'Grade 11',
        subject: 'Computer Studies',
        topic: 'Algorithms and Data Structures',
        resourceType: 'Practice Paper',
        fileUrl: '/materials/Grade11_Computer_Algorithms_Drill.pdf',
        fileSize: '1.8 MB',
        publicationDate: '2026-10-17',
        isPaidOnly: true
      },
      {
        id: 'res-004',
        title: 'Holiday Tuition Hub Official Student Syllabus Guide (Public Overview)',
        description: 'Official overview of learning expectations, weekly timetables, and subject milestones for the November 2026 holiday cohort.',
        grade: 'Grade 11',
        subject: 'Mathematics',
        topic: 'General Syllabus',
        resourceType: 'Study Guide',
        fileUrl: '/materials/HTH_Program_Guide_2026.pdf',
        fileSize: '950 KB',
        publicationDate: '2026-10-01',
        isPaidOnly: false
      }
    ],
    assignments: [
      {
        id: 'asg-001',
        title: 'Grade 11 Calculus Assignment 1: Rates of Change & Curves',
        grade: 'Grade 11',
        subject: 'Mathematics',
        instructions: 'Solve the five structured calculus problems on differentiating polynomials and finding the equations of tangents and normals at given coordinates. Show all mathematical working clearly.',
        deadline: '2026-11-06T23:59:00',
        maxMarks: 25,
        publicationDate: '2026-10-21',
        isPublished: true
      },
      {
        id: 'asg-002',
        title: 'Grade 11 Chemistry Assignment: Stoichiometric Reaction Balances',
        grade: 'Grade 11',
        subject: 'Chemistry',
        instructions: 'Determine the empirical and molecular formulae for three unknown mineral compounds from given combustion percentages. Calculate limiting reactants and percentage yields.',
        deadline: '2026-11-07T23:59:00',
        maxMarks: 20,
        publicationDate: '2026-10-21',
        isPublished: true
      }
    ],
    assignmentSubmissions: [
      {
        id: 'subm-001',
        assignmentId: 'asg-001',
        assignmentTitle: 'Grade 11 Calculus Assignment 1: Rates of Change & Curves',
        studentId: 'usr-student-faith',
        studentName: 'Faith Wanjiru',
        submittedAt: '2026-10-22T10:00:00Z',
        textResponse: '1) y = 3x^2 - 4x + 1 -> dy/dx = 6x - 4. At x=2, gradient m = 8. Tangent line equation is y - 5 = 8(x - 2) => y = 8x - 11. Normal line gradient = -1/8. All other 4 problems worked out thoroughly with correct chain rule differentiation.',
        status: 'Marked',
        score: 24,
        maxMarks: 25,
        tutorFeedback: 'Superb mathematical precision and clean notation Faith! Minor sign slip on question 4 step b, but your understanding of tangent and normal perpendicular gradients is exemplary.',
        markedBy: 'Daniel Owino',
        markedAt: '2026-10-22T12:00:00Z'
      }
    ],
    quizzes: [
      {
        id: 'quiz-math-01',
        title: 'Mathematics Speed Assessment: Polynomial Differentiation',
        grade: 'Grade 11',
        subject: 'Mathematics',
        topic: 'Differential Calculus',
        durationMinutes: 15,
        passMark: 70,
        maxMarks: 20,
        isPublished: true,
        questions: [
          {
            id: 'q1',
            questionText: 'What is the derivative of f(x) = 4x^3 - 5x^2 + 7x - 9 with respect to x?',
            type: 'mcq',
            options: [
              '12x^2 - 10x + 7',
              '12x^3 - 10x^2 + 7x',
              '4x^2 - 5x + 7',
              '12x^2 - 5x'
            ],
            correctAnswer: '12x^2 - 10x + 7',
            explanation: 'Apply the power rule d/dx[x^n] = n*x^(n-1): 4*(3x^2) - 5*(2x) + 7*(1) - 0 = 12x^2 - 10x + 7.',
            marks: 5
          },
          {
            id: 'q2',
            questionText: 'Find the gradient of the curve y = 2x^2 - 3x at the point where x = 3.',
            type: 'mcq',
            options: [
              '9',
              '12',
              '6',
              '15'
            ],
            correctAnswer: '9',
            explanation: 'dy/dx = 4x - 3. Substituting x = 3 gives dy/dx = 4(3) - 3 = 12 - 3 = 9.',
            marks: 5
          },
          {
            id: 'q3',
            questionText: 'At a turning point on the graph of y = f(x), what is the value of the derivative dy/dx?',
            type: 'mcq',
            options: [
              '0',
              '1',
              '-1',
              'Infinity'
            ],
            correctAnswer: '0',
            explanation: 'At local maxima, minima, or stationary points of inflection, the tangent is horizontal, hence dy/dx = 0.',
            marks: 5
          },
          {
            id: 'q4',
            questionText: 'If two lines are perpendicular and the gradient of line A is 4, what is the gradient of line B?',
            type: 'mcq',
            options: [
              '-1/4',
              '1/4',
              '-4',
              '0'
            ],
            correctAnswer: '-1/4',
            explanation: 'For perpendicular lines, m1 * m2 = -1, hence m2 = -1 / 4.',
            marks: 5
          }
        ]
      },
      {
        id: 'quiz-cs-01',
        title: 'Computer Studies Fundamentals: Logic, Flowcharts & Binary',
        grade: 'Grade 11',
        subject: 'Computer Studies',
        topic: 'Algorithms and Data',
        durationMinutes: 15,
        passMark: 70,
        maxMarks: 20,
        isPublished: true,
        questions: [
          {
            id: 'qc1',
            questionText: 'In standard flowchart notation, which geometrical shape represents a decision or conditional branch?',
            type: 'mcq',
            options: [
              'Diamond (Rhombus)',
              'Rectangle',
              'Parallelogram',
              'Oval'
            ],
            correctAnswer: 'Diamond (Rhombus)',
            explanation: 'A diamond represents decision points (e.g., If/Else, Yes/No), a rectangle represents process/calculation, and a parallelogram represents Input/Output.',
            marks: 5
          },
          {
            id: 'qc2',
            questionText: 'What is the decimal equivalent of the 8-bit binary number 00010110?',
            type: 'mcq',
            options: [
              '22',
              '24',
              '18',
              '26'
            ],
            correctAnswer: '22',
            explanation: '16 + 4 + 2 = 22.',
            marks: 5
          },
          {
            id: 'qc3',
            questionText: 'Which logic gate produces an output of 1 ONLY when both of its inputs are 1?',
            type: 'mcq',
            options: [
              'AND Gate',
              'OR Gate',
              'XOR Gate',
              'NOT Gate'
            ],
            correctAnswer: 'AND Gate',
            explanation: 'The AND gate outputs true (1) strictly if and only if both input A and input B are true.',
            marks: 5
          },
          {
            id: 'qc4',
            questionText: 'In relational database design, what is a Primary Key?',
            type: 'mcq',
            options: [
              'A field that uniquely identifies each record in a table',
              'A password used to encrypt the database',
              'The largest numerical field in a dataset',
              'A foreign key reference in another table'
            ],
            correctAnswer: 'A field that uniquely identifies each record in a table',
            explanation: 'A primary key enforces entity integrity by uniquely identifying every distinct tuple/row in a table.',
            marks: 5
          }
        ]
      }
    ],
    quizSubmissions: [
      {
        id: 'qsub-001',
        quizId: 'quiz-math-01',
        quizTitle: 'Mathematics Speed Assessment: Polynomial Differentiation',
        studentId: 'usr-student-faith',
        studentName: 'Faith Wanjiru',
        submittedAt: '2026-10-21T16:45:00Z',
        answers: {
          q1: '12x^2 - 10x + 7',
          q2: '9',
          q3: '0',
          q4: '-1/4'
        },
        score: 20,
        maxMarks: 20,
        percentage: 100,
        passed: true,
        feedback: 'Outstanding score! 100% correct answers with fast execution.'
      }
    ],
    attendance: [
      {
        id: 'att-001',
        lessonId: 'les-001',
        lessonTitle: 'Grade 11 Mathematics: Calculus & Tangent Lines',
        studentId: 'usr-student-faith',
        studentName: 'Faith Wanjiru',
        grade: 'Grade 11',
        subject: 'Mathematics',
        date: '2026-10-18',
        status: 'Present',
        recordedBy: 'Daniel Owino',
        recordedAt: '2026-10-18T10:35:00Z',
        notes: 'Active participation in live whiteboard exercises'
      }
    ],
    progressReports: [
      {
        id: 'rep-001',
        studentId: 'usr-student-faith',
        studentName: 'Faith Wanjiru',
        grade: 'Grade 11',
        enrolledSubjects: ['Mathematics', 'Chemistry', 'Computer Studies'],
        reportDate: '2026-10-22',
        attendanceSummary: {
          totalLessons: 1,
          attended: 1,
          attendanceRate: 100
        },
        quizAverage: 100,
        completedAssignments: 1,
        tutorObservations: 'Faith demonstrates outstanding focus, proactive problem-solving, and solid analytical foundations in both Mathematics and Chemistry. She actively asks clarifying questions and applies mathematical principles quickly.',
        areasForImprovement: 'Continue practicing speed when sketching three-dimensional geometrical models in coordinate geometry and refine organic chemical equation nomenclature.',
        revisionRecommendations: 'Complete the Stoichiometry drill booklet problems 15 through 30 before the upcoming live lesson. Continue building trace tables for sorting algorithms in Computer Studies.',
        createdBy: 'Daniel Owino',
        createdAt: '2026-10-22T13:00:00Z'
      }
    ],
    announcements: [
      {
        id: 'ann-001',
        title: 'Welcome to Holiday Tuition Hub - November 2026 Intensive Program',
        message: 'Welcome all students and parents! The upcoming holiday tuition program commences on 1 November 2026 and concludes on 22 November 2026. Live interactive lessons will be held in Africa/Nairobi time. Please review your subject schedules, verify your weekly M-Pesa tuition fee (KSh 699), and prepare your study areas for focused academic excellence.',
        targetAudience: 'All',
        publishedAt: '2026-10-15T08:00:00Z',
        isArchived: false
      },
      {
        id: 'ann-002',
        title: 'New Subject Added: Computer Studies for Grades 9 through 14',
        message: 'We are pleased to introduce Computer Studies across all grades. Students can now enroll in Computer Studies to master algorithms, pseudocode, database systems, and binary logic alongside Mathematics, English, Chemistry, and Kiswahili.',
        targetAudience: 'All',
        subjectCategory: 'Computer Studies',
        publishedAt: '2026-10-20T09:00:00Z',
        isArchived: false
      },
      {
        id: 'ann-003',
        title: 'Join Our Official WhatsApp Coordination Group',
        message: 'All registered and enrolled learners are invited to join the official WhatsApp discussion group for daily lesson schedule alerts, whiteboard snapshots, and real-time announcements.',
        targetAudience: 'All',
        publishedAt: '2026-10-21T10:00:00Z',
        isArchived: false
      }
    ],
    supportInquiries: [
      {
        id: 'inq-001',
        userId: 'usr-student-faith',
        userName: 'Faith Wanjiru',
        userEmail: 'faith.wanjiru@example.com',
        userPhone: '0712345678',
        userRole: 'student',
        category: 'Lesson Scheduling',
        subject: 'Request for weekend extra practice session in Chemistry',
        message: 'Hello Mr. Daniel Owino, could we have an extra 30-minute revision slot on Saturday morning to go over the titration calculations before the upcoming quiz?',
        status: 'Resolved',
        adminNotes: 'Scheduled an additional revision workshop and published to Grade 11 Chemistry calendar.',
        responses: [
          {
            author: 'Daniel Owino',
            message: 'Hello Faith! Certainly. I have scheduled an open chemistry Q&A slot for this Saturday at 11:00 AM Nairobi time. You will see it in your lesson booking options.',
            timestamp: '2026-10-21T11:30:00Z'
          }
        ],
        createdAt: '2026-10-21T10:15:00Z'
      }
    ],
    auditLogs: [
      {
        id: 'log-001',
        action: 'PAYMENT_VERIFIED',
        details: 'Verified M-Pesa payment QX8923KJ9L (KSh 699) for Faith Wanjiru. Activated 7-day subscription.',
        adminName: 'Daniel Owino',
        timestamp: '2026-10-20T15:00:00Z'
      },
      {
        id: 'log-002',
        action: 'PARENT_LINK_APPROVED',
        details: 'Approved parent link between Mary Wanjiru (Mother) and student Faith Wanjiru.',
        adminName: 'Daniel Owino',
        timestamp: '2026-10-16T11:00:00Z'
      },
      {
        id: 'log-003',
        action: 'SUBJECT_ADDED',
        details: 'Published new subject: Computer Studies for Grades 9-14.',
        adminName: 'Daniel Owino',
        timestamp: '2026-10-20T09:00:00Z'
      }
    ]
  };
}

export class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(fileContent);
        const defaults = getInitialDatabase();
        const mergedUsers: UserAccount[] = parsed.users || defaults.users;
        const demmizAdmin = mergedUsers.find(u => u.email.toLowerCase() === 'demmizkenya@gmail.com');
        if (!demmizAdmin) {
          mergedUsers.unshift({
            id: 'usr-admin-demmiz',
            name: 'Administrator',
            email: 'demmizkenya@gmail.com',
            passwordHash: hashPassword('tuition@hub'),
            phone: '0708083643',
            role: 'admin',
            accountStatus: 'Enrolled',
            createdAt: '2026-10-22T00:00:00Z'
          });
        } else if (!demmizAdmin.passwordHash) {
          demmizAdmin.passwordHash = hashPassword('tuition@hub');
        }

        const mergedSettings = {
          ...defaults.settings,
          ...(parsed.settings || {}),
          heroBackgroundImage: parsed.settings?.heroBackgroundImage || defaults.settings.heroBackgroundImage
        };

        return {
          ...defaults,
          ...parsed,
          settings: mergedSettings,
          users: mergedUsers,
          discussions: parsed.discussions || defaults.discussions,
          gallery: parsed.gallery || defaults.gallery,
          teachers: parsed.teachers || defaults.teachers
        };
      }
    } catch (err) {
      console.error('Error reading database file, initializing defaults:', err);
    }
    const initial = getInitialDatabase();
    this.saveDirect(initial);
    return initial;
  }

  private saveDirect(dataToSave: DatabaseSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error writing database file:', err);
    }
  }

  public save() {
    this.saveDirect(this.data);
  }

  public get<K extends keyof DatabaseSchema>(key: K): DatabaseSchema[K] {
    return this.data[key];
  }

  public set<K extends keyof DatabaseSchema>(key: K, value: DatabaseSchema[K]) {
    this.data[key] = value;
    this.save();
  }

  public getAll(): DatabaseSchema {
    return this.data;
  }
}

export const db = new Database();
