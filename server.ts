import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import {
  db,
  PaymentSubmission,
  Subscription,
  LessonSlot,
  ProgressReport,
  SupportInquiry,
  DiscussionTopic,
  GalleryPhoto,
  TeacherProfile,
  SubjectItem,
  Announcement,
  hashPassword,
  verifyPassword
} from './server/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure public uploads directory exists
const UPLOADS_DIR = path.resolve(__dirname, 'public', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

// In-memory active administrator session store
interface AdminSession {
  adminId: string;
  email: string;
  expiresAt: number;
}
const adminSessions = new Map<string, AdminSession>();

// Helper to log audit actions
function logAudit(action: string, details: string, adminName = 'Daniel Owino') {
  const auditLogs = db.get('auditLogs') || [];
  auditLogs.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    action,
    details,
    adminName,
    timestamp: new Date().toISOString()
  });
  db.set('auditLogs', auditLogs);
}

// -----------------------------------------------------------------------------
// PUBLIC API ENDPOINTS
// -----------------------------------------------------------------------------
app.get('/api/public/data', (_req: Request, res: Response) => {
  const settings = db.get('settings');
  const grades = (db.get('grades') || []).filter(g => g.active);
  const subjects = (db.get('subjects') || []).filter(s => s.isPublished);
  const announcements = (db.get('announcements') || []).filter(a => !a.isArchived && a.targetAudience === 'All');
  const teachers = db.get('teachers') || [];
  const gallery = db.get('gallery') || [];
  const resources = db.get('resources') || [];

  res.json({
    success: true,
    data: {
      settings,
      grades,
      subjects,
      announcements,
      teachers,
      gallery,
      resources
    }
  });
});

// -----------------------------------------------------------------------------
// AUTHENTICATION & SESSION (Permanent storage in data/db.json)
// -----------------------------------------------------------------------------
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, phone, password, role, grade, selectedSubjects, relationship } = req.body;
  
  if (!name || !email || !phone || !role) {
    return res.status(400).json({ success: false, message: 'Please provide name, email, phone number, and account type.' });
  }

  const users = db.get('users') || [];
  const existingUser = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'An account with this email already exists. Please sign in.' });
  }

  const newUser = {
    id: `usr-${role}-${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
    password: password ? password.trim() : 'password123',
    role: role as 'student' | 'parent' | 'admin' | 'tutor',
    grade: role === 'student' ? grade : undefined,
    selectedSubjects: role === 'student' ? (selectedSubjects || []) : undefined,
    relationship: role === 'parent' ? relationship : undefined,
    accountStatus: 'Enrolled' as const,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  db.set('users', users);

  logAudit('USER_REGISTERED', `New ${role} registered: ${newUser.name} (${newUser.email})`, 'System');

  res.json({
    success: true,
    user: newUser,
    message: 'Registration successful! Your account is permanently stored in the platform.'
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email address is required.' });
  }

  const users = db.get('users') || [];
  let user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

  // Special bootstrap for Daniel Owino administrator
  if (!user && (email.toLowerCase().includes('danielowino') || email.toLowerCase().includes('admin'))) {
    user = {
      id: 'usr-admin-daniel',
      name: 'Daniel Owino',
      email: 'danielowino233@gmail.com',
      phone: '0116654805',
      password: password || 'admin123',
      role: 'admin',
      accountStatus: 'Enrolled',
      createdAt: new Date().toISOString()
    };
    users.push(user);
    db.set('users', users);
  }

  if (!user) {
    return res.status(404).json({ success: false, message: 'Account not found. Please register first.' });
  }

  // Password verification
  if (password && user.password && user.password !== password.trim()) {
    return res.status(401).json({ success: false, message: 'Incorrect password. Please verify your password and try again.' });
  }

  // If user didn't have password set yet, save it
  if (password && !user.password) {
    user.password = password.trim();
    db.set('users', users);
  }

  if (user.accountStatus === 'Suspended') {
    return res.status(403).json({ success: false, message: 'Your account has been suspended by the administrator.' });
  }

  // Sanitize user before returning
  const { password: _p, passwordHash: _ph, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

// Dedicated Administrator Authentication (Private Route /admin/login)
app.post('/api/auth/admin-login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const users = db.get('users') || [];

  // Match administrator account
  let admin = users.find(u => u.role === 'admin' && u.email.toLowerCase() === cleanEmail);

  // Auto-provision demmizkenya@gmail.com administrator if not present
  if (!admin && cleanEmail === 'demmizkenya@gmail.com') {
    admin = {
      id: 'usr-admin-demmiz',
      name: 'Administrator',
      email: 'demmizkenya@gmail.com',
      passwordHash: hashPassword('tuition@hub'),
      phone: '0708083643',
      role: 'admin',
      accountStatus: 'Enrolled',
      createdAt: new Date().toISOString()
    };
    users.push(admin);
    db.set('users', users);
  }

  if (!admin) {
    return res.status(401).json({ success: false, message: 'Invalid administrator credentials. Access restricted.' });
  }

  // Securely verify password using PBKDF2 hash verification
  const targetHash = admin.passwordHash || (admin.password ? hashPassword(admin.password) : hashPassword('tuition@hub'));
  const isValid = verifyPassword(password.trim(), targetHash);

  if (!isValid) {
    return res.status(401).json({ success: false, message: 'Invalid administrator credentials. Please check your email and password.' });
  }

  // Issue cryptographically secure session token
  const token = `adm_${crypto.randomBytes(32).toString('hex')}`;
  adminSessions.set(token, {
    adminId: admin.id,
    email: admin.email,
    expiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  });

  logAudit('ADMIN_LOGIN', `Administrator authenticated: ${admin.email}`, admin.name);

  const { password: _p, passwordHash: _ph, ...safeAdmin } = admin;
  return res.json({
    success: true,
    token,
    user: safeAdmin,
    message: 'Administrator authentication successful.'
  });
});

app.post('/api/auth/admin-logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = (authHeader && authHeader.startsWith('Bearer '))
    ? authHeader.substring(7)
    : (req.headers['x-admin-token'] as string);

  if (token) {
    adminSessions.delete(token);
  }
  return res.json({ success: true, message: 'Administrator logged out successfully.' });
});

app.get('/api/auth/admin-session', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = (authHeader && authHeader.startsWith('Bearer '))
    ? authHeader.substring(7)
    : (req.headers['x-admin-token'] as string);

  if (!token) {
    return res.status(401).json({ success: false, message: 'No administrator token provided.' });
  }

  const session = adminSessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (session) adminSessions.delete(token);
    return res.status(401).json({ success: false, message: 'Administrator session expired. Please sign in again.' });
  }

  const users = db.get('users') || [];
  const admin = users.find(u => u.id === session.adminId);
  if (!admin) {
    return res.status(401).json({ success: false, message: 'Administrator record not found.' });
  }

  const { password: _p, passwordHash: _ph, ...safeAdmin } = admin;
  return res.json({ success: true, user: safeAdmin });
});

// -----------------------------------------------------------------------------
// STUDENT PORTAL ENDPOINTS
// -----------------------------------------------------------------------------
app.get('/api/student/dashboard/:studentId', (req: Request, res: Response) => {
  const { studentId } = req.params;
  const users = db.get('users') || [];
  const student = users.find(u => u.id === studentId);

  if (!student) {
    return res.status(404).json({ success: false, message: 'Student account not found.' });
  }

  const subscriptions = (db.get('subscriptions') || []).filter(s => s.studentId === studentId);
  const payments = (db.get('payments') || []).filter(p => p.studentId === studentId);
  
  // Calculate if student has an active subscription
  const now = new Date();
  const activeSubscription = subscriptions.find(s => {
    if (s.status !== 'Active') return false;
    const expiry = new Date(s.expiryDate);
    return expiry >= now;
  });

  const hasPaidAccess = Boolean(activeSubscription);

  // Lessons relevant to student's grade or enrolled subjects
  const allLessons = db.get('lessonSlots') || [];
  const relevantLessons = allLessons
    .filter(l => l.grade === student.grade || (student.selectedSubjects && student.selectedSubjects.includes(l.subject)))
    .map(l => ({
      ...l,
      // Protect meetingLink: only visible if student has paid and verified!
      meetingLink: hasPaidAccess ? l.meetingLink : ''
    }));

  // My booked lessons (protect meeting links if not paid)
  const myBookings = allLessons
    .filter(l => l.bookings.some(b => b.studentId === studentId && b.status === 'Confirmed'))
    .map(l => ({
      ...l,
      meetingLink: hasPaidAccess ? l.meetingLink : ''
    }));

  // Recorded lessons
  const recordedLessons = (db.get('recordedLessons') || []).filter(r => r.isPublished && (r.grade === student.grade || (student.selectedSubjects && student.selectedSubjects.includes(r.subject))));

  // Learning materials
  const resources = (db.get('resources') || []).filter(r => r.grade === student.grade || (student.selectedSubjects && student.selectedSubjects.includes(r.subject)));

  // Assignments
  const assignments = (db.get('assignments') || []).filter(a => a.isPublished && (a.grade === student.grade || (student.selectedSubjects && student.selectedSubjects.includes(a.subject))));
  const assignmentSubmissions = (db.get('assignmentSubmissions') || []).filter(s => s.studentId === studentId);

  // Quizzes (filter out correct answers before sending to student)
  const quizzes = (db.get('quizzes') || [])
    .filter(q => q.isPublished && (q.grade === student.grade || (student.selectedSubjects && student.selectedSubjects.includes(q.subject))))
    .map(q => ({
      ...q,
      questions: q.questions.map(({ correctAnswer: _ca, explanation: _exp, ...rest }) => rest)
    }));

  const quizSubmissions = (db.get('quizSubmissions') || []).filter(qs => qs.studentId === studentId);

  // Attendance
  const attendance = (db.get('attendance') || []).filter(a => a.studentId === studentId);

  // Progress reports
  const progressReports = (db.get('progressReports') || []).filter(pr => pr.studentId === studentId);

  // Announcements
  const announcements = (db.get('announcements') || []).filter(a => !a.isArchived && (a.targetAudience === 'All' || a.targetAudience === student.grade));

  res.json({
    success: true,
    data: {
      student,
      subscriptions,
      activeSubscription: activeSubscription || null,
      hasPaidAccess,
      payments,
      availableLessons: relevantLessons,
      myBookings,
      recordedLessons,
      resources,
      assignments,
      assignmentSubmissions,
      quizzes,
      quizSubmissions,
      attendance,
      progressReports,
      announcements
    }
  });
});

// Book lesson slot
app.post('/api/student/book-lesson', (req: Request, res: Response) => {
  const { studentId, lessonId, studentNote } = req.body;
  if (!studentId || !lessonId) {
    return res.status(400).json({ success: false, message: 'Student ID and Lesson ID are required.' });
  }

  const users = db.get('users') || [];
  const student = users.find(u => u.id === studentId);
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student account not found.' });
  }

  const lessonSlots = db.get('lessonSlots') || [];
  const lesson = lessonSlots.find(l => l.id === lessonId);
  if (!lesson) {
    return res.status(404).json({ success: false, message: 'Lesson slot not found.' });
  }

  if (lesson.status !== 'Published') {
    return res.status(400).json({ success: false, message: `This lesson is currently ${lesson.status.toLowerCase()} and cannot be booked.` });
  }

  const existingBooking = lesson.bookings.find(b => b.studentId === studentId && b.status === 'Confirmed');
  if (existingBooking) {
    return res.status(400).json({ success: false, message: 'You have already confirmed a reservation for this lesson slot.' });
  }

  const confirmedCount = lesson.bookings.filter(b => b.status === 'Confirmed').length;
  if (confirmedCount >= lesson.capacity) {
    return res.status(400).json({ success: false, message: 'This lesson has reached full capacity. Please select an alternative time slot.' });
  }

  lesson.bookings.push({
    bookingId: `bk-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    studentId: student.id,
    studentName: student.name,
    studentEmail: student.email,
    bookedAt: new Date().toISOString(),
    studentNote: studentNote ? studentNote.trim() : undefined,
    status: 'Confirmed'
  });
  lesson.bookedCount = lesson.bookings.filter(b => b.status === 'Confirmed').length;

  db.set('lessonSlots', lessonSlots);
  res.json({ success: true, message: `Successfully booked "${lesson.title}" on ${lesson.date} at ${lesson.startTime} EAT.`, lesson });
});

// Cancel booking
app.post('/api/student/cancel-booking', (req: Request, res: Response) => {
  const { studentId, lessonId } = req.body;
  const lessonSlots = db.get('lessonSlots') || [];
  const lesson = lessonSlots.find(l => l.id === lessonId);
  if (!lesson) {
    return res.status(404).json({ success: false, message: 'Lesson not found.' });
  }

  const booking = lesson.bookings.find(b => b.studentId === studentId && b.status === 'Confirmed');
  if (!booking) {
    return res.status(404).json({ success: false, message: 'Active booking not found.' });
  }

  booking.status = 'Cancelled';
  lesson.bookedCount = lesson.bookings.filter(b => b.status === 'Confirmed').length;
  db.set('lessonSlots', lessonSlots);

  res.json({ success: true, message: 'Your booking has been cancelled.', lesson });
});

// Submit M-Pesa Send Money payment
app.post('/api/student/submit-payment', (req: Request, res: Response) => {
  const { studentId, mpesaCode, amountPaid, transactionDate, payingPhoneNumber, packageType, note } = req.body;

  if (!studentId || !mpesaCode || !amountPaid || !transactionDate || !payingPhoneNumber) {
    return res.status(400).json({ success: false, message: 'All M-Pesa payment verification fields are required.' });
  }

  const cleanCode = mpesaCode.trim().toUpperCase();
  if (cleanCode.length < 8) {
    return res.status(400).json({ success: false, message: 'Please enter a valid M-Pesa transaction code (minimum 8 alphanumeric characters).' });
  }

  const payments = db.get('payments') || [];
  const duplicate = payments.find(p => p.mpesaCode.toUpperCase() === cleanCode);
  if (duplicate) {
    return res.status(400).json({ success: false, message: `Transaction code "${cleanCode}" has already been submitted for verification.` });
  }

  const users = db.get('users') || [];
  const student = users.find(u => u.id === studentId);
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student record not found.' });
  }

  const newSubmission: PaymentSubmission = {
    id: `pay-${Date.now()}`,
    studentId: student.id,
    studentName: student.name,
    studentEmail: student.email,
    studentPhone: student.phone,
    mpesaCode: cleanCode,
    amountPaid: Number(amountPaid),
    transactionDate,
    payingPhoneNumber: payingPhoneNumber.trim(),
    packageType: packageType || 'Standard Weekly Tuition (KSh 699)',
    note: note ? note.trim() : undefined,
    status: 'Submitted for verification',
    submittedAt: new Date().toISOString()
  };

  payments.unshift(newSubmission);
  db.set('payments', payments);

  logAudit('PAYMENT_SUBMITTED', `Student ${student.name} submitted M-Pesa code ${cleanCode} for KSh ${amountPaid}.`, 'Student');

  res.json({
    success: true,
    message: 'Payment submitted successfully! Your submission is now queued for verification by Daniel Owino. Access will activate once verified.',
    payment: newSubmission
  });
});

// Submit Assignment
app.post('/api/student/submit-assignment', (req: Request, res: Response) => {
  const { assignmentId, studentId, textResponse, fileAttachment } = req.body;
  if (!assignmentId || !studentId || !textResponse) {
    return res.status(400).json({ success: false, message: 'Assignment ID, student ID, and response text are required.' });
  }

  const assignments = db.get('assignments') || [];
  const assignment = assignments.find(a => a.id === assignmentId);
  if (!assignment) {
    return res.status(404).json({ success: false, message: 'Assignment not found.' });
  }

  const users = db.get('users') || [];
  const student = users.find(u => u.id === studentId);
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found.' });
  }

  const submissions = db.get('assignmentSubmissions') || [];
  const existingIndex = submissions.findIndex(s => s.assignmentId === assignmentId && s.studentId === studentId);

  const submissionData = {
    id: existingIndex >= 0 ? submissions[existingIndex].id : `subm-${Date.now()}`,
    assignmentId: assignment.id,
    assignmentTitle: assignment.title,
    studentId: student.id,
    studentName: student.name,
    submittedAt: new Date().toISOString(),
    textResponse: textResponse.trim(),
    fileAttachment: fileAttachment || undefined,
    status: 'Submitted' as const,
    maxMarks: assignment.maxMarks
  };

  if (existingIndex >= 0) {
    submissions[existingIndex] = { ...submissions[existingIndex], ...submissionData };
  } else {
    submissions.push(submissionData);
  }

  db.set('assignmentSubmissions', submissions);
  res.json({ success: true, message: 'Assignment response saved and submitted for marking!', submission: submissionData });
});

// Submit Quiz
app.post('/api/student/submit-quiz', (req: Request, res: Response) => {
  const { quizId, studentId, answers } = req.body;
  if (!quizId || !studentId || !answers) {
    return res.status(400).json({ success: false, message: 'Quiz ID, student ID, and answers are required.' });
  }

  const quizzes = db.get('quizzes') || [];
  const quiz = quizzes.find(q => q.id === quizId);
  if (!quiz) {
    return res.status(404).json({ success: false, message: 'Quiz not found.' });
  }

  const users = db.get('users') || [];
  const student = users.find(u => u.id === studentId);
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found.' });
  }

  let totalScore = 0;
  quiz.questions.forEach(q => {
    const studentAns = answers[q.id];
    if (studentAns && studentAns.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
      totalScore += q.marks;
    }
  });

  const percentage = Math.round((totalScore / quiz.maxMarks) * 100);
  const passed = percentage >= quiz.passMark;

  const quizSubmissions = db.get('quizSubmissions') || [];
  const newSubmission = {
    id: `qsub-${Date.now()}`,
    quizId: quiz.id,
    quizTitle: quiz.title,
    studentId: student.id,
    studentName: student.name,
    submittedAt: new Date().toISOString(),
    answers,
    score: totalScore,
    maxMarks: quiz.maxMarks,
    percentage,
    passed,
    feedback: passed
      ? `Great job! You achieved ${percentage}% (Pass mark: ${quiz.passMark}%).`
      : `You scored ${percentage}%. Review the answer explanations and prepare for the next practice session.`
  };

  quizSubmissions.push(newSubmission);
  db.set('quizSubmissions', quizSubmissions);

  res.json({
    success: true,
    message: 'Quiz evaluated successfully!',
    result: newSubmission,
    questionsWithExplanations: quiz.questions
  });
});

// -----------------------------------------------------------------------------
// SUPPORT INQUIRY ENDPOINT (Robust - Handles guest, student, and parent inquiries without errors!)
// -----------------------------------------------------------------------------
const handleInquiry = (req: Request, res: Response) => {
  try {
    const { userId, userName, userEmail, userPhone, userRole, category, subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ success: false, message: 'Subject and message are required.' });
    }

    const users = db.get('users') || [];
    const matchedUser = userId ? users.find(u => u.id === userId) : null;

    const finalUserId = matchedUser ? matchedUser.id : (userId || `guest-${Date.now()}`);
    const finalName = matchedUser ? matchedUser.name : (userName || 'Learner / Visitor');
    const finalEmail = matchedUser ? matchedUser.email : (userEmail || 'inquiry@holidaytuitionhub.com');
    const finalRole = matchedUser ? matchedUser.role : (userRole || 'visitor');

    const inquiries = db.get('supportInquiries') || [];
    const newInquiry: SupportInquiry = {
      id: `inq-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      userId: finalUserId,
      userName: finalName,
      userEmail: finalEmail,
      userPhone: userPhone || matchedUser?.phone || '',
      userRole: finalRole,
      category: category || 'General',
      subject: subject.trim(),
      message: message.trim(),
      status: 'Open',
      responses: [],
      createdAt: new Date().toISOString()
    };

    inquiries.unshift(newInquiry);
    db.set('supportInquiries', inquiries);

    logAudit('INQUIRY_RECEIVED', `Inquiry received from ${finalName} (${finalEmail}): ${subject}`, 'System');

    return res.status(200).json({
      success: true,
      message: 'Your inquiry has been submitted and stored permanently. Daniel Owino will review and respond promptly.',
      inquiry: newInquiry
    });
  } catch (err: any) {
    console.error('Error handling inquiry:', err);
    return res.status(500).json({ success: false, message: 'Server error processing inquiry.' });
  }
};

app.post('/api/student/inquiry', handleInquiry);
app.post('/api/inquiry', handleInquiry);
app.post('/api/public/inquiry', handleInquiry);

// -----------------------------------------------------------------------------
// GROUP DISCUSSION (Peer Study Forum)
// -----------------------------------------------------------------------------
app.get('/api/discussions', (_req: Request, res: Response) => {
  const discussions = db.get('discussions') || [];
  res.json({ success: true, data: discussions });
});

app.post('/api/discussions', (req: Request, res: Response) => {
  const { title, subject, grade, authorId, authorName, authorGrade, content } = req.body;
  if (!title || !subject || !content || !authorName) {
    return res.status(400).json({ success: false, message: 'Title, subject, author name, and content are required.' });
  }

  const discussions = db.get('discussions') || [];
  const newTopic: DiscussionTopic = {
    id: `disc-${Date.now()}`,
    title: title.trim(),
    subject,
    grade: grade || 'All Grades',
    authorId: authorId || 'usr-student',
    authorName: authorName.trim(),
    authorGrade: authorGrade || 'Student',
    content: content.trim(),
    createdAt: new Date().toISOString(),
    likes: 0,
    replies: []
  };

  discussions.unshift(newTopic);
  db.set('discussions', discussions);

  res.json({ success: true, message: 'Discussion topic posted successfully!', topic: newTopic });
});

app.post('/api/discussions/reply', (req: Request, res: Response) => {
  const { topicId, authorId, authorName, authorGrade, content } = req.body;
  if (!topicId || !content || !authorName) {
    return res.status(400).json({ success: false, message: 'Topic ID, author, and content are required.' });
  }

  const discussions = db.get('discussions') || [];
  const topic = discussions.find(d => d.id === topicId);
  if (!topic) {
    return res.status(404).json({ success: false, message: 'Discussion topic not found.' });
  }

  const newReply = {
    id: `rep-${Date.now()}`,
    authorId: authorId || 'usr-anon',
    authorName: authorName.trim(),
    authorGrade: authorGrade || '',
    content: content.trim(),
    createdAt: new Date().toISOString()
  };

  topic.replies.push(newReply);
  db.set('discussions', discussions);

  res.json({ success: true, message: 'Reply added!', reply: newReply, topic });
});

app.post('/api/discussions/like', (req: Request, res: Response) => {
  const { topicId } = req.body;
  const discussions = db.get('discussions') || [];
  const topic = discussions.find(d => d.id === topicId);
  if (!topic) {
    return res.status(404).json({ success: false, message: 'Topic not found.' });
  }

  topic.likes = (topic.likes || 0) + 1;
  db.set('discussions', discussions);
  res.json({ success: true, likes: topic.likes });
});

// -----------------------------------------------------------------------------
// GALLERY ENDPOINTS
// -----------------------------------------------------------------------------
app.get('/api/gallery', (_req: Request, res: Response) => {
  const gallery = db.get('gallery') || [];
  res.json({ success: true, data: gallery });
});

app.post('/api/admin/gallery', (req: Request, res: Response) => {
  const { title, description, category, imageUrl } = req.body;
  if (!title || !imageUrl) {
    return res.status(400).json({ success: false, message: 'Title and image URL are required.' });
  }

  const gallery = db.get('gallery') || [];
  const newPhoto: GalleryPhoto = {
    id: `gal-${Date.now()}`,
    title: title.trim(),
    description: (description || '').trim(),
    category: category || 'General',
    imageUrl: imageUrl.trim(),
    dateAdded: new Date().toISOString().split('T')[0]
  };

  gallery.unshift(newPhoto);
  db.set('gallery', gallery);

  logAudit('PHOTO_ADDED', `Added gallery photo: "${newPhoto.title}"`, 'Daniel Owino');
  res.json({ success: true, message: 'Photo added to gallery!', photo: newPhoto });
});

app.delete('/api/admin/gallery/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  let gallery = db.get('gallery') || [];
  gallery = gallery.filter(g => g.id !== id);
  db.set('gallery', gallery);
  res.json({ success: true, message: 'Photo removed from gallery.' });
});

// -----------------------------------------------------------------------------
// PARENT / GUARDIAN PORTAL ENDPOINTS
// -----------------------------------------------------------------------------
app.get('/api/parent/dashboard/:parentId', (req: Request, res: Response) => {
  const { parentId } = req.params;
  const users = db.get('users') || [];
  const parent = users.find(u => u.id === parentId);

  if (!parent) {
    return res.status(404).json({ success: false, message: 'Parent account not found.' });
  }

  const allLinks = db.get('parentLinks') || [];
  const myLinks = allLinks.filter(l => l.parentId === parentId);
  const approvedStudentIds = myLinks.filter(l => l.status === 'Approved').map(l => l.studentId);

  const linkedStudents = users.filter(u => approvedStudentIds.includes(u.id));

  const allSubscriptions = db.get('subscriptions') || [];
  const allPayments = db.get('payments') || [];
  const allLessons = db.get('lessonSlots') || [];
  const allAttendance = db.get('attendance') || [];
  const allProgressReports = db.get('progressReports') || [];
  const allQuizSubmissions = db.get('quizSubmissions') || [];
  const allAssignmentSubmissions = db.get('assignmentSubmissions') || [];

  const studentsData = linkedStudents.map(student => {
    return {
      student,
      subscriptions: allSubscriptions.filter(s => s.studentId === student.id),
      payments: allPayments.filter(p => p.studentId === student.id),
      bookedLessons: allLessons.filter(l => l.bookings.some(b => b.studentId === student.id && b.status === 'Confirmed')),
      attendance: allAttendance.filter(a => a.studentId === student.id),
      progressReports: allProgressReports.filter(pr => pr.studentId === student.id),
      quizSubmissions: allQuizSubmissions.filter(qs => qs.studentId === student.id),
      assignmentSubmissions: allAssignmentSubmissions.filter(as => as.studentId === student.id)
    };
  });

  const announcements = (db.get('announcements') || []).filter(a => !a.isArchived && (a.targetAudience === 'All' || a.targetAudience === 'Parents'));

  res.json({
    success: true,
    data: {
      parent,
      links: myLinks,
      studentsData,
      announcements
    }
  });
});

app.post('/api/parent/request-link', (req: Request, res: Response) => {
  const { parentId, studentEmail, studentPhone } = req.body;
  if (!parentId || (!studentEmail && !studentPhone)) {
    return res.status(400).json({ success: false, message: 'Parent ID and Student Email or Phone are required.' });
  }

  const users = db.get('users') || [];
  const parent = users.find(u => u.id === parentId);
  if (!parent) {
    return res.status(404).json({ success: false, message: 'Parent account not found.' });
  }

  const student = users.find(u =>
    u.role === 'student' &&
    ((studentEmail && u.email.toLowerCase() === studentEmail.trim().toLowerCase()) ||
     (studentPhone && u.phone.trim() === studentPhone.trim()))
  );

  if (!student) {
    return res.status(404).json({ success: false, message: 'No registered student found with the provided contact information. Please verify with your child.' });
  }

  const parentLinks = db.get('parentLinks') || [];
  const existing = parentLinks.find(l => l.parentId === parentId && l.studentId === student.id);
  if (existing) {
    return res.status(400).json({ success: false, message: `A link request for ${student.name} is already ${existing.status.toLowerCase()}.` });
  }

  const newLink = {
    id: `link-${Date.now()}`,
    parentId: parent.id,
    parentName: parent.name,
    parentEmail: parent.email,
    studentId: student.id,
    studentName: student.name,
    studentPhone: student.phone,
    status: 'Approved' as const,
    requestedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString()
  };

  parentLinks.push(newLink);
  db.set('parentLinks', parentLinks);

  logAudit('PARENT_LINKED', `Linked parent ${parent.name} to student ${student.name}.`, 'System');

  res.json({ success: true, message: `Successfully linked to student ${student.name}. You can now monitor their progress.`, link: newLink });
});

// -----------------------------------------------------------------------------
// ADMIN AUTHORIZATION MIDDLEWARE & CONTENT SOURCE OF TRUTH ENDPOINTS
// -----------------------------------------------------------------------------
function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = (authHeader && authHeader.startsWith('Bearer '))
    ? authHeader.substring(7)
    : (req.headers['x-admin-token'] as string);

  if (!token) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Administrator authentication required.' });
  }

  const session = adminSessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (session) adminSessions.delete(token);
    return res.status(401).json({ success: false, message: 'Unauthorized: Session expired or invalid. Please sign in again.' });
  }

  // Refresh expiration
  session.expiresAt = Date.now() + 24 * 60 * 60 * 1000;
  next();
}

app.use('/api/admin', requireAdminAuth);

// File / Image Upload for Admin Managed Content
app.post('/api/admin/upload', (req: Request, res: Response) => {
  try {
    const { filename, fileBase64 } = req.body;
    if (!filename || !fileBase64) {
      return res.status(400).json({ success: false, message: 'Filename and file content are required.' });
    }

    const ext = path.extname(filename) || '.jpg';
    const baseName = path.basename(filename, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const cleanName = `${Date.now()}_${baseName}${ext}`;
    const filePath = path.join(UPLOADS_DIR, cleanName);

    const base64Data = fileBase64.replace(/^data:[^;]+;base64,/, '');
    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));

    const fileUrl = `/uploads/${cleanName}`;
    logAudit('FILE_UPLOADED', `Admin uploaded media: ${cleanName}`, 'Administrator');
    return res.json({ success: true, url: fileUrl, filename: cleanName });
  } catch (err: any) {
    console.error('File upload error:', err);
    return res.status(500).json({ success: false, message: 'Server error processing file upload.' });
  }
});

// Admin Subjects CRUD
app.get('/api/admin/subjects', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.get('subjects') || [] });
});

app.post('/api/admin/subjects', (req: Request, res: Response) => {
  const { name, description, supportedGrades, topics, learningObjectives, isPublished } = req.body;
  if (!name || !description) {
    return res.status(400).json({ success: false, message: 'Subject name and description are required.' });
  }
  const subjects = db.get('subjects') || [];
  const newSubject: SubjectItem = {
    id: `subj-${Date.now()}`,
    name: name.trim(),
    description: description.trim(),
    supportedGrades: supportedGrades || ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Grade 13', 'Grade 14'],
    topics: topics || [],
    learningObjectives: learningObjectives || [],
    isPublished: isPublished !== false
  };
  subjects.push(newSubject);
  db.set('subjects', subjects);
  logAudit('SUBJECT_CREATED', `Created subject: ${newSubject.name}`, 'Administrator');
  res.json({ success: true, message: 'Subject created successfully!', subject: newSubject });
});

app.put('/api/admin/subjects/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const subjects = db.get('subjects') || [];
  const idx = subjects.findIndex(s => s.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Subject not found.' });
  }
  subjects[idx] = { ...subjects[idx], ...req.body, id };
  db.set('subjects', subjects);
  logAudit('SUBJECT_UPDATED', `Updated subject: ${subjects[idx].name}`, 'Administrator');
  res.json({ success: true, message: 'Subject updated successfully.', subject: subjects[idx] });
});

app.delete('/api/admin/subjects/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  let subjects = db.get('subjects') || [];
  const removed = subjects.find(s => s.id === id);
  subjects = subjects.filter(s => s.id !== id);
  db.set('subjects', subjects);
  logAudit('SUBJECT_DELETED', `Deleted subject: ${removed?.name || id}`, 'Administrator');
  res.json({ success: true, message: 'Subject deleted successfully.' });
});

// Admin Announcements CRUD
app.get('/api/admin/announcements', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.get('announcements') || [] });
});

app.post('/api/admin/announcements', (req: Request, res: Response) => {
  const { title, message, targetAudience, subjectCategory } = req.body;
  if (!title || !message) {
    return res.status(400).json({ success: false, message: 'Title and message are required.' });
  }
  const announcements = db.get('announcements') || [];
  const newAnn: Announcement = {
    id: `ann-${Date.now()}`,
    title: title.trim(),
    message: message.trim(),
    targetAudience: targetAudience || 'All',
    subjectCategory: subjectCategory || undefined,
    publishedAt: new Date().toISOString(),
    isArchived: false
  };
  announcements.unshift(newAnn);
  db.set('announcements', announcements);
  logAudit('ANNOUNCEMENT_CREATED', `Published announcement: ${newAnn.title}`, 'Administrator');
  res.json({ success: true, message: 'Announcement published successfully!', announcement: newAnn });
});

app.put('/api/admin/announcements/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const announcements = db.get('announcements') || [];
  const idx = announcements.findIndex(a => a.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Announcement not found.' });
  }
  announcements[idx] = { ...announcements[idx], ...req.body, id };
  db.set('announcements', announcements);
  logAudit('ANNOUNCEMENT_UPDATED', `Updated announcement: ${announcements[idx].title}`, 'Administrator');
  res.json({ success: true, message: 'Announcement updated.', announcement: announcements[idx] });
});

app.delete('/api/admin/announcements/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  let announcements = db.get('announcements') || [];
  announcements = announcements.filter(a => a.id !== id);
  db.set('announcements', announcements);
  logAudit('ANNOUNCEMENT_DELETED', `Deleted announcement ${id}`, 'Administrator');
  res.json({ success: true, message: 'Announcement deleted.' });
});

// Admin Teachers CRUD
app.get('/api/admin/teachers', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.get('teachers') || [] });
});

app.post('/api/admin/teachers', (req: Request, res: Response) => {
  const { name, role, subjects, qualification, experience, bio, photoUrl } = req.body;
  if (!name || !role) {
    return res.status(400).json({ success: false, message: 'Teacher name and role are required.' });
  }
  const teachers = db.get('teachers') || [];
  const newTeacher: TeacherProfile = {
    id: `tch-${Date.now()}`,
    name: name.trim(),
    role: role.trim(),
    subjects: subjects || ['Mathematics'],
    qualification: qualification || 'B.Ed. Academic Specialist',
    experience: experience || 'Experienced secondary educator',
    bio: bio || '',
    photoUrl: photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
  };
  teachers.push(newTeacher);
  db.set('teachers', teachers);
  logAudit('TEACHER_ADDED', `Added teacher: ${newTeacher.name}`, 'Administrator');
  res.json({ success: true, message: 'Teacher added to faculty!', teacher: newTeacher });
});

app.put('/api/admin/teachers/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const teachers = db.get('teachers') || [];
  const idx = teachers.findIndex(t => t.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Teacher not found.' });
  }
  teachers[idx] = { ...teachers[idx], ...req.body, id };
  db.set('teachers', teachers);
  logAudit('TEACHER_UPDATED', `Updated teacher: ${teachers[idx].name}`, 'Administrator');
  res.json({ success: true, message: 'Teacher details updated.', teacher: teachers[idx] });
});

app.delete('/api/admin/teachers/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  let teachers = db.get('teachers') || [];
  teachers = teachers.filter(t => t.id !== id);
  db.set('teachers', teachers);
  logAudit('TEACHER_DELETED', `Deleted teacher ${id}`, 'Administrator');
  res.json({ success: true, message: 'Teacher removed from faculty.' });
});

// Admin Deletions for Resources, Recorded Lessons, and Lesson Slots
app.delete('/api/admin/resources/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  let resources = db.get('resources') || [];
  resources = resources.filter(r => r.id !== id);
  db.set('resources', resources);
  logAudit('RESOURCE_DELETED', `Deleted resource ${id}`, 'Administrator');
  res.json({ success: true, message: 'Resource deleted.' });
});

app.delete('/api/admin/recorded-lessons/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  let recs = db.get('recordedLessons') || [];
  recs = recs.filter(r => r.id !== id);
  db.set('recordedLessons', recs);
  logAudit('RECORDING_DELETED', `Deleted recorded lesson ${id}`, 'Administrator');
  res.json({ success: true, message: 'Recorded lesson removed.' });
});

app.delete('/api/admin/lessons/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  let slots = db.get('lessonSlots') || [];
  slots = slots.filter(s => s.id !== id);
  db.set('lessonSlots', slots);
  logAudit('LESSON_DELETED', `Deleted lesson slot ${id}`, 'Administrator');
  res.json({ success: true, message: 'Lesson slot deleted.' });
});

// Admin Overview
app.get('/api/admin/overview', (_req: Request, res: Response) => {
  const users = db.get('users') || [];
  const students = users.filter(u => u.role === 'student');
  const parents = users.filter(u => u.role === 'parent');

  const payments = db.get('payments') || [];
  const pendingPayments = payments.filter(p => p.status === 'Submitted for verification' || p.status === 'Under review');
  const verifiedPayments = payments.filter(p => p.status === 'Verified');
  const totalVerifiedRevenue = verifiedPayments.reduce((sum, p) => sum + p.amountPaid, 0);

  const subscriptions = db.get('subscriptions') || [];
  const activeSubs = subscriptions.filter(s => s.status === 'Active');

  const lessons = db.get('lessonSlots') || [];
  const attendance = db.get('attendance') || [];
  const totalAttendanceRecords = attendance.length;
  const presentRecords = attendance.filter(a => a.status === 'Present').length;
  const overallAttendanceRate = totalAttendanceRecords > 0 ? Math.round((presentRecords / totalAttendanceRecords) * 100) : 100;

  const inquiries = db.get('supportInquiries') || [];
  const openInquiries = inquiries.filter(i => i.status === 'Open' || i.status === 'Under Review');

  res.json({
    success: true,
    data: {
      studentCount: students.length,
      parentCount: parents.length,
      pendingPaymentCount: pendingPayments.length,
      totalVerifiedRevenue,
      activeSubscriptionCount: activeSubs.length,
      totalLessonsCount: lessons.length,
      overallAttendanceRate,
      openInquiriesCount: openInquiries.length,
      recentPayments: payments.slice(0, 5),
      recentAuditLogs: (db.get('auditLogs') || []).slice(0, 5)
    }
  });
});

// Users management for Admin
app.get('/api/admin/users', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.get('users') || [] });
});

app.post('/api/admin/users/update-status', (req: Request, res: Response) => {
  const { userId, status } = req.body;
  const users = db.get('users') || [];
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  user.accountStatus = status;
  db.set('users', users);

  logAudit('USER_STATUS_UPDATED', `Changed status of ${user.name} to ${status}`, 'Daniel Owino');
  res.json({ success: true, message: `User status changed to ${status}.`, user });
});

// Subscription Management (Disable / Expire / Extend / Suspend)
app.post('/api/admin/subscriptions/update-status', (req: Request, res: Response) => {
  const { subscriptionId, status, reason } = req.body;
  const subscriptions = db.get('subscriptions') || [];
  const sub = subscriptions.find(s => s.id === subscriptionId);
  if (!sub) {
    return res.status(404).json({ success: false, message: 'Subscription not found.' });
  }

  sub.status = status;
  sub.updatedAt = new Date().toISOString();
  if (reason) sub.notes = `${sub.notes || ''} [${reason}]`;
  db.set('subscriptions', subscriptions);

  logAudit('SUBSCRIPTION_STATUS_UPDATED', `Changed subscription for ${sub.studentName} to ${status}: ${reason || ''}`, 'Daniel Owino');
  res.json({ success: true, message: `Subscription marked as ${status}.`, subscription: sub });
});

// Admin Inquiries
app.get('/api/admin/inquiries', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.get('supportInquiries') || [] });
});

app.post('/api/admin/inquiries/respond', (req: Request, res: Response) => {
  const { inquiryId, message, status, adminName = 'Daniel Owino' } = req.body;
  if (!inquiryId || !message) {
    return res.status(400).json({ success: false, message: 'Inquiry ID and response message are required.' });
  }

  const inquiries = db.get('supportInquiries') || [];
  const inquiry = inquiries.find(i => i.id === inquiryId);
  if (!inquiry) {
    return res.status(404).json({ success: false, message: 'Inquiry not found.' });
  }

  inquiry.responses.push({
    author: adminName,
    message: message.trim(),
    timestamp: new Date().toISOString()
  });

  inquiry.status = status || 'Resolved';
  db.set('supportInquiries', inquiries);

  logAudit('INQUIRY_ANSWERED', `Answered inquiry "${inquiry.subject}" from ${inquiry.userName}`, adminName);

  res.json({ success: true, message: 'Response saved and sent to learner.', inquiry });
});

// Payments
app.get('/api/admin/payments', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.get('payments') || [] });
});

app.post('/api/admin/payments/verify', (req: Request, res: Response) => {
  const { paymentId, adminName = 'Daniel Owino', notes } = req.body;
  const payments = db.get('payments') || [];
  const payment = payments.find(p => p.id === paymentId);

  if (!payment) {
    return res.status(404).json({ success: false, message: 'Payment record not found.' });
  }

  if (payment.status === 'Verified') {
    return res.status(400).json({ success: false, message: 'This payment has already been verified.' });
  }

  payment.status = 'Verified';
  payment.verifiedBy = adminName;
  payment.verifiedAt = new Date().toISOString();
  if (notes) payment.note = `${payment.note ? payment.note + ' | ' : ''}${notes}`;
  db.set('payments', payments);

  const subscriptions = db.get('subscriptions') || [];
  const existingSub = subscriptions.find(s => s.studentId === payment.studentId && s.status === 'Active');

  const now = new Date();
  let startDate = now.toISOString().split('T')[0];
  let expiryDate: string;

  if (existingSub) {
    const currentExpiry = new Date(existingSub.expiryDate);
    const baseDate = currentExpiry > now ? currentExpiry : now;
    const newExpiry = new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    existingSub.expiryDate = newExpiry.toISOString().split('T')[0];
    existingSub.amountPaid += payment.amountPaid;
    existingSub.verifiedMpesaRef += `, ${payment.mpesaCode}`;
    existingSub.updatedAt = new Date().toISOString();
    expiryDate = existingSub.expiryDate;
  } else {
    const newExpiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    expiryDate = newExpiry.toISOString().split('T')[0];
    const newSub: Subscription = {
      id: `sub-${Date.now()}`,
      studentId: payment.studentId,
      studentName: payment.studentName,
      subscriptionType: 'Weekly Tuition (1 Week)',
      amountPaid: payment.amountPaid,
      verifiedMpesaRef: payment.mpesaCode,
      startDate,
      expiryDate,
      status: 'Active',
      verifiedBy: adminName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: `Activated via verified M-Pesa payment ${payment.mpesaCode}`
    };
    subscriptions.push(newSub);
  }

  db.set('subscriptions', subscriptions);

  logAudit(
    'PAYMENT_VERIFIED',
    `Verified payment of KSh ${payment.amountPaid} (M-Pesa: ${payment.mpesaCode}) for student ${payment.studentName}. Active until ${expiryDate}.`,
    adminName
  );

  res.json({
    success: true,
    message: `Payment verified successfully! Student ${payment.studentName} active until ${expiryDate}.`,
    payment
  });
});

app.post('/api/admin/payments/reject', (req: Request, res: Response) => {
  const { paymentId, reason, adminName = 'Daniel Owino' } = req.body;
  if (!reason) {
    return res.status(400).json({ success: false, message: 'Rejection reason is required.' });
  }

  const payments = db.get('payments') || [];
  const payment = payments.find(p => p.id === paymentId);
  if (!payment) {
    return res.status(404).json({ success: false, message: 'Payment record not found.' });
  }

  payment.status = 'Rejected';
  payment.rejectionReason = reason.trim();
  payment.verifiedBy = adminName;
  payment.verifiedAt = new Date().toISOString();
  db.set('payments', payments);

  logAudit('PAYMENT_REJECTED', `Rejected payment ${payment.mpesaCode} for ${payment.studentName}: ${reason}`, adminName);

  res.json({ success: true, message: 'Payment submission marked as rejected.', payment });
});

// Subscriptions list
app.get('/api/admin/subscriptions', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.get('subscriptions') || [] });
});

// Lessons
app.get('/api/admin/lessons', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.get('lessonSlots') || [] });
});

app.post('/api/admin/lessons', (req: Request, res: Response) => {
  const { title, subject, grade, tutorName, date, startTime, endTime, capacity, meetingLink } = req.body;
  if (!title || !subject || !grade || !date || !startTime || !endTime) {
    return res.status(400).json({ success: false, message: 'Title, subject, grade, date, start time, and end time are required.' });
  }

  const lessonSlots = db.get('lessonSlots') || [];
  const newLesson: LessonSlot = {
    id: `les-${Date.now()}`,
    title: title.trim(),
    subject,
    grade,
    tutorName: tutorName || 'Daniel Owino',
    date,
    startTime,
    endTime,
    durationMinutes: 90,
    capacity: Number(capacity) || 25,
    bookedCount: 0,
    meetingLink: meetingLink || 'https://meet.google.com/hth-room-general',
    status: 'Published',
    bookings: []
  };

  lessonSlots.push(newLesson);
  db.set('lessonSlots', lessonSlots);

  logAudit('LESSON_CREATED', `Created lesson "${newLesson.title}" for ${newLesson.grade} on ${newLesson.date} at ${newLesson.startTime} EAT.`, 'Daniel Owino');

  res.json({ success: true, message: 'New lesson slot published successfully!', lesson: newLesson });
});

app.post('/api/admin/lessons/update-status', (req: Request, res: Response) => {
  const { lessonId, status, meetingLink } = req.body;
  const lessonSlots = db.get('lessonSlots') || [];
  const lesson = lessonSlots.find(l => l.id === lessonId);
  if (!lesson) {
    return res.status(404).json({ success: false, message: 'Lesson slot not found.' });
  }

  if (status) lesson.status = status;
  if (meetingLink) lesson.meetingLink = meetingLink.trim();
  db.set('lessonSlots', lessonSlots);

  logAudit('LESSON_UPDATED', `Updated lesson "${lesson.title}" details.`, 'Daniel Owino');
  res.json({ success: true, message: 'Lesson details updated.', lesson });
});

// Attendance Recording
app.post('/api/admin/attendance/record', (req: Request, res: Response) => {
  const { lessonId, studentId, status, notes, adminName = 'Daniel Owino' } = req.body;
  if (!lessonId || !studentId || !status) {
    return res.status(400).json({ success: false, message: 'Lesson ID, student ID, and status are required.' });
  }

  const lesson = (db.get('lessonSlots') || []).find(l => l.id === lessonId);
  const student = (db.get('users') || []).find(u => u.id === studentId);
  if (!lesson || !student) {
    return res.status(404).json({ success: false, message: 'Lesson or student not found.' });
  }

  const attendance = db.get('attendance') || [];
  const existingIndex = attendance.findIndex(a => a.lessonId === lessonId && a.studentId === studentId);

  const recordData = {
    id: existingIndex >= 0 ? attendance[existingIndex].id : `att-${Date.now()}`,
    lessonId,
    lessonTitle: lesson.title,
    studentId: student.id,
    studentName: student.name,
    grade: lesson.grade,
    subject: lesson.subject,
    date: lesson.date,
    status: status as 'Present' | 'Absent' | 'Late' | 'Excused',
    recordedBy: adminName,
    recordedAt: new Date().toISOString(),
    notes: notes ? notes.trim() : undefined
  };

  if (existingIndex >= 0) {
    attendance[existingIndex] = recordData;
  } else {
    attendance.push(recordData);
  }

  db.set('attendance', attendance);
  res.json({ success: true, message: `Recorded attendance for ${student.name} as ${status}.`, record: recordData });
});

// Progress Reports
app.post('/api/admin/progress-reports', (req: Request, res: Response) => {
  const { studentId, tutorObservations, areasForImprovement, revisionRecommendations, adminName = 'Daniel Owino' } = req.body;
  if (!studentId || !tutorObservations) {
    return res.status(400).json({ success: false, message: 'Student ID and tutor observations are required.' });
  }

  const student = (db.get('users') || []).find(u => u.id === studentId);
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found.' });
  }

  const studentAttendance = (db.get('attendance') || []).filter(a => a.studentId === studentId);
  const totalLessons = studentAttendance.length;
  const attended = studentAttendance.filter(a => a.status === 'Present').length;
  const attendanceRate = totalLessons > 0 ? Math.round((attended / totalLessons) * 100) : 100;

  const quizSubs = (db.get('quizSubmissions') || []).filter(qs => qs.studentId === studentId);
  const quizAverage = quizSubs.length > 0 ? Math.round(quizSubs.reduce((sum, q) => sum + q.percentage, 0) / quizSubs.length) : 0;
  const completedAssignments = (db.get('assignmentSubmissions') || []).filter(as => as.studentId === studentId).length;

  const progressReports = db.get('progressReports') || [];
  const newReport: ProgressReport = {
    id: `rep-${Date.now()}`,
    studentId: student.id,
    studentName: student.name,
    grade: student.grade || 'Grade 11',
    enrolledSubjects: student.selectedSubjects || [],
    reportDate: new Date().toISOString().split('T')[0],
    attendanceSummary: {
      totalLessons,
      attended,
      attendanceRate
    },
    quizAverage,
    completedAssignments,
    tutorObservations: tutorObservations.trim(),
    areasForImprovement: (areasForImprovement || '').trim(),
    revisionRecommendations: (revisionRecommendations || '').trim(),
    createdBy: adminName,
    createdAt: new Date().toISOString()
  };

  progressReports.unshift(newReport);
  db.set('progressReports', progressReports);

  logAudit('PROGRESS_REPORT_PUBLISHED', `Published comprehensive academic report for ${student.name}.`, adminName);

  res.json({ success: true, message: `Academic progress report published for ${student.name}.`, report: newReport });
});

// Admin Learning Resources (PDF Notes, Worksheets)
app.get('/api/admin/resources', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.get('resources') || [] });
});

app.post('/api/admin/resources', (req: Request, res: Response) => {
  const { title, description, grade, subject, topic, resourceType, fileUrl, fileSize, isPaidOnly } = req.body;
  if (!title || !grade || !subject || !resourceType) {
    return res.status(400).json({ success: false, message: 'Title, grade, subject, and resource type are required.' });
  }

  const resources = db.get('resources') || [];
  const newResource = {
    id: `res-${Date.now()}`,
    title: title.trim(),
    description: (description || '').trim(),
    grade,
    subject,
    topic: (topic || 'General').trim(),
    resourceType,
    fileUrl: fileUrl || '/materials/HolidayTuitionHub_Document.pdf',
    fileSize: fileSize || '2.5 MB',
    publicationDate: new Date().toISOString().split('T')[0],
    isPaidOnly: isPaidOnly !== false
  };

  resources.push(newResource);
  db.set('resources', resources);

  logAudit('RESOURCE_PUBLISHED', `Published new ${resourceType}: "${newResource.title}" for ${grade} ${subject}.`, 'Daniel Owino');

  res.json({ success: true, message: 'Resource added to library successfully!', resource: newResource });
});

// Admin Recorded Lessons
app.post('/api/admin/recorded-lessons', (req: Request, res: Response) => {
  const { title, subject, grade, topic, description, videoUrl, durationMinutes } = req.body;
  if (!title || !subject || !grade || !videoUrl) {
    return res.status(400).json({ success: false, message: 'Title, subject, grade, and video URL are required.' });
  }

  const recordedLessons = db.get('recordedLessons') || [];
  const newRec = {
    id: `rec-${Date.now()}`,
    title: title.trim(),
    subject,
    grade,
    topic: (topic || 'Revision').trim(),
    description: (description || '').trim(),
    videoUrl: videoUrl.trim(),
    durationMinutes: Number(durationMinutes) || 45,
    publicationDate: new Date().toISOString().split('T')[0],
    isPublished: true,
    isPaidOnly: true
  };

  recordedLessons.push(newRec);
  db.set('recordedLessons', recordedLessons);

  logAudit('RECORDING_PUBLISHED', `Published recorded lesson: "${newRec.title}" (${subject} - ${grade}).`, 'Daniel Owino');

  res.json({ success: true, message: 'Recorded lesson published successfully!', recordedLesson: newRec });
});

// Admin Assessments / Quizzes
app.post('/api/admin/quizzes', (req: Request, res: Response) => {
  const { title, grade, subject, topic, durationMinutes, passMark, maxMarks, questions } = req.body;
  if (!title || !grade || !subject || !questions || !Array.isArray(questions)) {
    return res.status(400).json({ success: false, message: 'Title, grade, subject, and questions are required.' });
  }

  const quizzes = db.get('quizzes') || [];
  const newQuiz = {
    id: `quiz-${Date.now()}`,
    title: title.trim(),
    grade,
    subject,
    topic: (topic || 'General Practice').trim(),
    durationMinutes: Number(durationMinutes) || 15,
    passMark: Number(passMark) || 70,
    maxMarks: Number(maxMarks) || 20,
    questions,
    isPublished: true
  };

  quizzes.push(newQuiz);
  db.set('quizzes', quizzes);

  logAudit('QUIZ_CREATED', `Created practice test: "${newQuiz.title}" with ${questions.length} questions.`, 'Daniel Owino');

  res.json({ success: true, message: 'Practice test created and published!', quiz: newQuiz });
});

// Platform Settings
app.post('/api/admin/settings', (req: Request, res: Response) => {
  const current = db.get('settings');
  const updated = {
    ...current,
    ...req.body
  };
  db.set('settings', updated);
  logAudit('SETTINGS_UPDATED', 'Updated platform configuration.', 'Daniel Owino');
  res.json({ success: true, message: 'Platform settings saved successfully!', settings: updated });
});

// CSV Exports
app.get('/api/admin/export/csv', (req: Request, res: Response) => {
  const { type } = req.query;
  
  if (type === 'payments') {
    const payments = db.get('payments') || [];
    let csv = 'Payment ID,Student Name,Student Email,Phone,M-Pesa Code,Amount (KSh),Transaction Date,Status,Verified By,Verified At\n';
    payments.forEach(p => {
      csv += `"${p.id}","${p.studentName}","${p.studentEmail}","${p.payingPhoneNumber}","${p.mpesaCode}",${p.amountPaid},"${p.transactionDate}","${p.status}","${p.verifiedBy || ''}","${p.verifiedAt || ''}"\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="holiday_tuition_hub_payments.csv"');
    return res.send(csv);
  }

  if (type === 'attendance') {
    const attendance = db.get('attendance') || [];
    let csv = 'Record ID,Lesson Title,Subject,Grade,Student Name,Date,Status,Recorded By,Notes\n';
    attendance.forEach(a => {
      csv += `"${a.id}","${a.lessonTitle}","${a.subject}","${a.grade}","${a.studentName}","${a.date}","${a.status}","${a.recordedBy}","${a.notes || ''}"\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="holiday_tuition_hub_attendance.csv"');
    return res.send(csv);
  }

  const users = (db.get('users') || []).filter(u => u.role === 'student');
  let csv = 'Student ID,Full Name,Email,Phone,Grade,Enrolled Subjects,Account Status,Created At\n';
  users.forEach(s => {
    csv += `"${s.id}","${s.name}","${s.email}","${s.phone}","${s.grade || ''}","${(s.selectedSubjects || []).join('; ')}","${s.accountStatus}","${s.createdAt}"\n`;
  });
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="holiday_tuition_hub_students.csv"');
  return res.send(csv);
});

// Audit Logs
app.get('/api/admin/audit-logs', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.get('auditLogs') || [] });
});

// -----------------------------------------------------------------------------
// VITE DEV SERVER OR STATIC PROD SERVING
// -----------------------------------------------------------------------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Holiday Tuition Hub server listening on port ${PORT} (NODE_ENV=${process.env.NODE_ENV || 'development'})`);
  });
}

startServer();
