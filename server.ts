import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { db, PaymentSubmission, Subscription, LessonSlot, ProgressReport } from './server/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Helper to log audit actions
function logAudit(action: string, details: string, adminName = 'Daniel Owino') {
  const auditLogs = db.get('auditLogs');
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
  const grades = db.get('grades').filter(g => g.active);
  const subjects = db.get('subjects').filter(s => s.isPublished);
  const announcements = db.get('announcements').filter(a => !a.isArchived && a.targetAudience === 'All');

  res.json({
    success: true,
    data: {
      settings,
      grades,
      subjects,
      announcements
    }
  });
});

// -----------------------------------------------------------------------------
// AUTHENTICATION & SESSION SIMULATION (Secure, role-based)
// -----------------------------------------------------------------------------
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, phone, role, grade, selectedSubjects, relationship } = req.body;
  
  if (!name || !email || !phone || !role) {
    return res.status(400).json({ success: false, message: 'Please provide all required registration fields.' });
  }

  const users = db.get('users');
  const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'An account with this email address already exists. Please sign in.' });
  }

  const newUser = {
    id: `usr-${role}-${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone.trim(),
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

  res.json({ success: true, user: newUser, message: 'Registration successful! Welcome to Holiday Tuition Hub.' });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, role } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email address is required.' });
  }

  const users = db.get('users');
  let user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());

  // Special auto-seed for Daniel Owino administrator
  if (!user && (email.toLowerCase().includes('danielowino') || email.toLowerCase().includes('admin'))) {
    user = {
      id: 'usr-admin-daniel',
      name: 'Daniel Owino',
      email: 'danielowino233@gmail.com',
      phone: '0116654805',
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

  if (user.accountStatus === 'Suspended') {
    return res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact the administrator.' });
  }

  res.json({ success: true, user });
});

// Quick switcher for demo/review accounts
app.get('/api/auth/demo-users', (_req: Request, res: Response) => {
  const users = db.get('users');
  res.json({ success: true, users });
});

// -----------------------------------------------------------------------------
// STUDENT PORTAL ENDPOINTS
// -----------------------------------------------------------------------------
app.get('/api/student/dashboard/:studentId', (req: Request, res: Response) => {
  const { studentId } = req.params;
  const users = db.get('users');
  const student = users.find(u => u.id === studentId);

  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found.' });
  }

  const subscriptions = db.get('subscriptions').filter(s => s.studentId === studentId);
  const payments = db.get('payments').filter(p => p.studentId === studentId);
  
  // Calculate if student has an active subscription
  const now = new Date();
  const activeSubscription = subscriptions.find(s => {
    if (s.status !== 'Active') return false;
    const expiry = new Date(s.expiryDate);
    return expiry >= now;
  });

  const hasPaidAccess = Boolean(activeSubscription);

  // Lessons relevant to student's grade or enrolled subjects
  const allLessons = db.get('lessonSlots');
  const relevantLessons = allLessons.filter(l => l.grade === student.grade || (student.selectedSubjects && student.selectedSubjects.includes(l.subject)));

  // My booked lessons
  const myBookings = allLessons.filter(l => l.bookings.some(b => b.studentId === studentId && b.status === 'Confirmed'));

  // Recorded lessons
  const recordedLessons = db.get('recordedLessons').filter(r => r.isPublished && (r.grade === student.grade || (student.selectedSubjects && student.selectedSubjects.includes(r.subject))));

  // Learning materials
  const resources = db.get('resources').filter(r => r.grade === student.grade || (student.selectedSubjects && student.selectedSubjects.includes(r.subject)));

  // Assignments
  const assignments = db.get('assignments').filter(a => a.isPublished && (a.grade === student.grade || (student.selectedSubjects && student.selectedSubjects.includes(a.subject))));
  const assignmentSubmissions = db.get('assignmentSubmissions').filter(s => s.studentId === studentId);

  // Quizzes (filter out correct answers before sending to student)
  const quizzes = db.get('quizzes')
    .filter(q => q.isPublished && (q.grade === student.grade || (student.selectedSubjects && student.selectedSubjects.includes(q.subject))))
    .map(q => ({
      ...q,
      questions: q.questions.map(({ correctAnswer: _ca, explanation: _exp, ...rest }) => rest)
    }));

  const quizSubmissions = db.get('quizSubmissions').filter(qs => qs.studentId === studentId);

  // Attendance
  const attendance = db.get('attendance').filter(a => a.studentId === studentId);

  // Progress reports
  const progressReports = db.get('progressReports').filter(pr => pr.studentId === studentId);

  // Announcements
  const announcements = db.get('announcements').filter(a => !a.isArchived && (a.targetAudience === 'All' || a.targetAudience === student.grade));

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

// Book lesson slot (Atomic reservation with double booking prevention)
app.post('/api/student/book-lesson', (req: Request, res: Response) => {
  const { studentId, lessonId, studentNote } = req.body;
  if (!studentId || !lessonId) {
    return res.status(400).json({ success: false, message: 'Student ID and Lesson ID are required.' });
  }

  const users = db.get('users');
  const student = users.find(u => u.id === studentId);
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student account not found.' });
  }

  const lessonSlots = db.get('lessonSlots');
  const lesson = lessonSlots.find(l => l.id === lessonId);
  if (!lesson) {
    return res.status(404).json({ success: false, message: 'Lesson slot not found.' });
  }

  if (lesson.status !== 'Published') {
    return res.status(400).json({ success: false, message: `This lesson is currently ${lesson.status.toLowerCase()} and cannot be booked.` });
  }

  // Check if student already booked
  const existingBooking = lesson.bookings.find(b => b.studentId === studentId && b.status === 'Confirmed');
  if (existingBooking) {
    return res.status(400).json({ success: false, message: 'You have already confirmed a reservation for this lesson slot.' });
  }

  // Check capacity
  const confirmedCount = lesson.bookings.filter(b => b.status === 'Confirmed').length;
  if (confirmedCount >= lesson.capacity) {
    return res.status(400).json({ success: false, message: 'This lesson has reached full capacity. Please select an alternative time slot.' });
  }

  // Reserve slot
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
  const lessonSlots = db.get('lessonSlots');
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

  const payments = db.get('payments');
  const duplicate = payments.find(p => p.mpesaCode.toUpperCase() === cleanCode);
  if (duplicate) {
    return res.status(400).json({ success: false, message: `Transaction code "${cleanCode}" has already been submitted for verification.` });
  }

  const users = db.get('users');
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

  const assignments = db.get('assignments');
  const assignment = assignments.find(a => a.id === assignmentId);
  if (!assignment) {
    return res.status(404).json({ success: false, message: 'Assignment not found.' });
  }

  const users = db.get('users');
  const student = users.find(u => u.id === studentId);
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found.' });
  }

  const submissions = db.get('assignmentSubmissions');
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

// Submit Quiz (Secure server-side auto-marking)
app.post('/api/student/submit-quiz', (req: Request, res: Response) => {
  const { quizId, studentId, answers } = req.body;
  if (!quizId || !studentId || !answers) {
    return res.status(400).json({ success: false, message: 'Quiz ID, student ID, and answers are required.' });
  }

  const quizzes = db.get('quizzes');
  const quiz = quizzes.find(q => q.id === quizId);
  if (!quiz) {
    return res.status(404).json({ success: false, message: 'Quiz not found.' });
  }

  const users = db.get('users');
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

  const quizSubmissions = db.get('quizSubmissions');
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
    questionsWithExplanations: quiz.questions // now reveal explanations post-submission
  });
});

// Submit Support Inquiry
app.post('/api/student/inquiry', (req: Request, res: Response) => {
  const { userId, category, subject, message } = req.body;
  if (!userId || !category || !subject || !message) {
    return res.status(400).json({ success: false, message: 'All inquiry fields are required.' });
  }

  const users = db.get('users');
  const user = users.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  const inquiries = db.get('supportInquiries');
  const newInquiry = {
    id: `inq-${Date.now()}`,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    userRole: user.role,
    category,
    subject: subject.trim(),
    message: message.trim(),
    status: 'Open' as const,
    responses: [],
    createdAt: new Date().toISOString()
  };

  inquiries.unshift(newInquiry);
  db.set('supportInquiries', inquiries);

  res.json({ success: true, message: 'Support inquiry submitted to Daniel Owino.', inquiry: newInquiry });
});

// -----------------------------------------------------------------------------
// PARENT / GUARDIAN PORTAL ENDPOINTS
// -----------------------------------------------------------------------------
app.get('/api/parent/dashboard/:parentId', (req: Request, res: Response) => {
  const { parentId } = req.params;
  const users = db.get('users');
  const parent = users.find(u => u.id === parentId);

  if (!parent) {
    return res.status(404).json({ success: false, message: 'Parent account not found.' });
  }

  const allLinks = db.get('parentLinks');
  const myLinks = allLinks.filter(l => l.parentId === parentId);
  const approvedStudentIds = myLinks.filter(l => l.status === 'Approved').map(l => l.studentId);

  const linkedStudents = users.filter(u => approvedStudentIds.includes(u.id));

  // Collect data for linked students only
  const allSubscriptions = db.get('subscriptions');
  const allPayments = db.get('payments');
  const allLessons = db.get('lessonSlots');
  const allAttendance = db.get('attendance');
  const allProgressReports = db.get('progressReports');
  const allQuizSubmissions = db.get('quizSubmissions');
  const allAssignmentSubmissions = db.get('assignmentSubmissions');

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

  const announcements = db.get('announcements').filter(a => !a.isArchived && (a.targetAudience === 'All' || a.targetAudience === 'Parents'));

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

  const users = db.get('users');
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

  const parentLinks = db.get('parentLinks');
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
    status: 'Approved' as const, // auto-verified for linked student by verified phone/email
    requestedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString()
  };

  parentLinks.push(newLink);
  db.set('parentLinks', parentLinks);

  logAudit('PARENT_LINKED', `Linked parent ${parent.name} to student ${student.name}.`, 'System');

  res.json({ success: true, message: `Successfully linked to student ${student.name}. You can now monitor their progress.`, link: newLink });
});

// -----------------------------------------------------------------------------
// ADMIN PANEL ENDPOINTS (Daniel Owino & Admin Staff)
// -----------------------------------------------------------------------------
app.get('/api/admin/overview', (_req: Request, res: Response) => {
  const users = db.get('users');
  const students = users.filter(u => u.role === 'student');
  const parents = users.filter(u => u.role === 'parent');

  const payments = db.get('payments');
  const pendingPayments = payments.filter(p => p.status === 'Submitted for verification' || p.status === 'Under review');
  const verifiedPayments = payments.filter(p => p.status === 'Verified');
  const totalVerifiedRevenue = verifiedPayments.reduce((sum, p) => sum + p.amountPaid, 0);

  const subscriptions = db.get('subscriptions');
  const activeSubs = subscriptions.filter(s => s.status === 'Active');

  const lessons = db.get('lessonSlots');
  const attendance = db.get('attendance');
  const totalAttendanceRecords = attendance.length;
  const presentRecords = attendance.filter(a => a.status === 'Present').length;
  const overallAttendanceRate = totalAttendanceRecords > 0 ? Math.round((presentRecords / totalAttendanceRecords) * 100) : 100;

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
      recentPayments: payments.slice(0, 5),
      recentAuditLogs: db.get('auditLogs').slice(0, 5)
    }
  });
});

// Admin Payments Management
app.get('/api/admin/payments', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.get('payments') });
});

app.post('/api/admin/payments/verify', (req: Request, res: Response) => {
  const { paymentId, adminName = 'Daniel Owino', notes } = req.body;
  const payments = db.get('payments');
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

  // Activate or extend student subscription
  const subscriptions = db.get('subscriptions');
  const existingSub = subscriptions.find(s => s.studentId === payment.studentId && s.status === 'Active');

  const now = new Date();
  let startDate = now.toISOString().split('T')[0];
  let expiryDate: string;

  if (existingSub) {
    // Extend from current expiry
    const currentExpiry = new Date(existingSub.expiryDate);
    const baseDate = currentExpiry > now ? currentExpiry : now;
    const newExpiry = new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    existingSub.expiryDate = newExpiry.toISOString().split('T')[0];
    existingSub.amountPaid += payment.amountPaid;
    existingSub.verifiedMpesaRef += `, ${payment.mpesaCode}`;
    existingSub.updatedAt = new Date().toISOString();
    expiryDate = existingSub.expiryDate;
  } else {
    // New 7-day subscription
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

  const payments = db.get('payments');
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

// Admin Subscriptions Management
app.get('/api/admin/subscriptions', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.get('subscriptions') });
});

app.post('/api/admin/subscriptions/grant-complimentary', (req: Request, res: Response) => {
  const { studentId, days = 7, reason, adminName = 'Daniel Owino' } = req.body;
  const users = db.get('users');
  const student = users.find(u => u.id === studentId);
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found.' });
  }

  const subscriptions = db.get('subscriptions');
  const now = new Date();
  const expiryDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const newSub: Subscription = {
    id: `sub-${Date.now()}`,
    studentId: student.id,
    studentName: student.name,
    subscriptionType: 'Complimentary Access',
    amountPaid: 0,
    verifiedMpesaRef: 'COMPLIMENTARY_GRANT',
    startDate: now.toISOString().split('T')[0],
    expiryDate,
    status: 'Active',
    verifiedBy: adminName,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: reason || 'Granted complimentary academic access by tutor'
  };

  subscriptions.push(newSub);
  db.set('subscriptions', subscriptions);

  logAudit('COMPLIMENTARY_ACCESS_GRANTED', `Granted ${days} days access to ${student.name}. Reason: ${reason}`, adminName);

  res.json({ success: true, message: `Complimentary access granted to ${student.name} until ${expiryDate}.`, subscription: newSub });
});

// Admin Lesson Scheduling
app.get('/api/admin/lessons', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.get('lessonSlots') });
});

app.post('/api/admin/lessons', (req: Request, res: Response) => {
  const { title, subject, grade, tutorName, date, startTime, endTime, capacity, meetingLink } = req.body;
  if (!title || !subject || !grade || !date || !startTime || !endTime) {
    return res.status(400).json({ success: false, message: 'Title, subject, grade, date, start time, and end time are required.' });
  }

  const lessonSlots = db.get('lessonSlots');
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
  const lessonSlots = db.get('lessonSlots');
  const lesson = lessonSlots.find(l => l.id === lessonId);
  if (!lesson) {
    return res.status(404).json({ success: false, message: 'Lesson slot not found.' });
  }

  if (status) lesson.status = status;
  if (meetingLink) lesson.meetingLink = meetingLink;
  db.set('lessonSlots', lessonSlots);

  logAudit('LESSON_UPDATED', `Updated lesson "${lesson.title}" status to ${status}.`, 'Daniel Owino');

  res.json({ success: true, message: 'Lesson details updated.', lesson });
});

// Admin Attendance Recording
app.post('/api/admin/attendance/record', (req: Request, res: Response) => {
  const { lessonId, studentId, status, notes, adminName = 'Daniel Owino' } = req.body;
  if (!lessonId || !studentId || !status) {
    return res.status(400).json({ success: false, message: 'Lesson ID, student ID, and status are required.' });
  }

  const lesson = db.get('lessonSlots').find(l => l.id === lessonId);
  const student = db.get('users').find(u => u.id === studentId);
  if (!lesson || !student) {
    return res.status(404).json({ success: false, message: 'Lesson or student not found.' });
  }

  const attendance = db.get('attendance');
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

// Admin Progress Reports
app.post('/api/admin/progress-reports', (req: Request, res: Response) => {
  const { studentId, tutorObservations, areasForImprovement, revisionRecommendations, adminName = 'Daniel Owino' } = req.body;
  if (!studentId || !tutorObservations) {
    return res.status(400).json({ success: false, message: 'Student ID and tutor observations are required.' });
  }

  const student = db.get('users').find(u => u.id === studentId);
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found.' });
  }

  // Calculate actual attendance & quiz stats from database
  const studentAttendance = db.get('attendance').filter(a => a.studentId === studentId);
  const totalLessons = studentAttendance.length;
  const attended = studentAttendance.filter(a => a.status === 'Present').length;
  const attendanceRate = totalLessons > 0 ? Math.round((attended / totalLessons) * 100) : 100;

  const quizSubs = db.get('quizSubmissions').filter(qs => qs.studentId === studentId);
  const quizAverage = quizSubs.length > 0 ? Math.round(quizSubs.reduce((sum, q) => sum + q.percentage, 0) / quizSubs.length) : 0;
  const completedAssignments = db.get('assignmentSubmissions').filter(as => as.studentId === studentId).length;

  const progressReports = db.get('progressReports');
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

// Admin Learning Resources
app.get('/api/admin/resources', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.get('resources') });
});

app.post('/api/admin/resources', (req: Request, res: Response) => {
  const { title, description, grade, subject, topic, resourceType, fileUrl, fileSize, isPaidOnly } = req.body;
  if (!title || !grade || !subject || !resourceType) {
    return res.status(400).json({ success: false, message: 'Title, grade, subject, and resource type are required.' });
  }

  const resources = db.get('resources');
  const newResource = {
    id: `res-${Date.now()}`,
    title: title.trim(),
    description: (description || '').trim(),
    grade,
    subject,
    topic: (topic || 'General').trim(),
    resourceType,
    fileUrl: fileUrl || '/materials/HolidayTuitionHub_Document.pdf',
    fileSize: fileSize || '1.5 MB',
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

  const recordedLessons = db.get('recordedLessons');
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

// Admin Quizzes / Assessments
app.post('/api/admin/quizzes', (req: Request, res: Response) => {
  const { title, grade, subject, topic, durationMinutes, passMark, maxMarks, questions } = req.body;
  if (!title || !grade || !subject || !questions || !Array.isArray(questions)) {
    return res.status(400).json({ success: false, message: 'Title, grade, subject, and questions are required.' });
  }

  const quizzes = db.get('quizzes');
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

// Admin Grade Assignment Submission
app.post('/api/admin/assignments/grade', (req: Request, res: Response) => {
  const { submissionId, score, tutorFeedback, adminName = 'Daniel Owino' } = req.body;
  if (!submissionId || score === undefined) {
    return res.status(400).json({ success: false, message: 'Submission ID and score are required.' });
  }

  const submissions = db.get('assignmentSubmissions');
  const submission = submissions.find(s => s.id === submissionId);
  if (!submission) {
    return res.status(404).json({ success: false, message: 'Submission not found.' });
  }

  submission.score = Number(score);
  submission.tutorFeedback = (tutorFeedback || '').trim();
  submission.status = 'Marked';
  submission.markedBy = adminName;
  submission.markedAt = new Date().toISOString();

  db.set('assignmentSubmissions', submissions);
  res.json({ success: true, message: 'Assignment graded successfully!', submission });
});

// Admin Announcements
app.post('/api/admin/announcements', (req: Request, res: Response) => {
  const { title, message, targetAudience, subjectCategory } = req.body;
  if (!title || !message) {
    return res.status(400).json({ success: false, message: 'Title and message are required.' });
  }

  const announcements = db.get('announcements');
  const newAnn = {
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

  logAudit('ANNOUNCEMENT_POSTED', `Posted announcement "${newAnn.title}" to ${newAnn.targetAudience}.`, 'Daniel Owino');

  res.json({ success: true, message: 'Announcement published successfully!', announcement: newAnn });
});

// Admin Support Inquiry Reply
app.post('/api/admin/inquiries/respond', (req: Request, res: Response) => {
  const { inquiryId, message, status, adminName = 'Daniel Owino' } = req.body;
  if (!inquiryId || !message) {
    return res.status(400).json({ success: false, message: 'Inquiry ID and message are required.' });
  }

  const inquiries = db.get('supportInquiries');
  const inquiry = inquiries.find(i => i.id === inquiryId);
  if (!inquiry) {
    return res.status(404).json({ success: false, message: 'Inquiry not found.' });
  }

  inquiry.responses.push({
    author: adminName,
    message: message.trim(),
    timestamp: new Date().toISOString()
  });

  if (status) inquiry.status = status;
  db.set('supportInquiries', inquiries);

  res.json({ success: true, message: 'Response sent to user.', inquiry });
});

// Admin Platform Settings
app.post('/api/admin/settings', (req: Request, res: Response) => {
  const current = db.get('settings');
  const updated = {
    ...current,
    ...req.body
  };
  db.set('settings', updated);
  logAudit('SETTINGS_UPDATED', 'Updated platform settings (dates, prices, or tutor bio).', 'Daniel Owino');
  res.json({ success: true, message: 'Platform settings saved successfully!', settings: updated });
});

// Admin Subject Management (manage, publish, edit subjects)
app.post('/api/admin/subjects', (req: Request, res: Response) => {
  const { id, name, description, supportedGrades, topics, learningObjectives, isPublished } = req.body;
  const subjects = db.get('subjects');
  const existingIdx = subjects.findIndex(s => s.id === id);

  const subjectData = {
    id: id || `subj-${name.toLowerCase().replace(/\s+/g, '-')}`,
    name,
    description,
    supportedGrades: supportedGrades || ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Grade 13', 'Grade 14'],
    topics: topics || [],
    learningObjectives: learningObjectives || [],
    isPublished: isPublished !== false
  };

  if (existingIdx >= 0) {
    subjects[existingIdx] = subjectData;
  } else {
    subjects.push(subjectData);
  }

  db.set('subjects', subjects);
  logAudit('SUBJECT_UPDATED', `Saved subject "${name}".`, 'Daniel Owino');
  res.json({ success: true, message: `Subject ${name} updated successfully!`, subject: subjectData });
});

// Admin CSV Data Export
app.get('/api/admin/export/csv', (req: Request, res: Response) => {
  const { type } = req.query; // 'payments' | 'attendance' | 'students'
  
  if (type === 'payments') {
    const payments = db.get('payments');
    let csv = 'Payment ID,Student Name,Student Email,Phone,M-Pesa Code,Amount (KSh),Transaction Date,Status,Verified By,Verified At\n';
    payments.forEach(p => {
      csv += `"${p.id}","${p.studentName}","${p.studentEmail}","${p.payingPhoneNumber}","${p.mpesaCode}",${p.amountPaid},"${p.transactionDate}","${p.status}","${p.verifiedBy || ''}","${p.verifiedAt || ''}"\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="holiday_tuition_hub_payments.csv"');
    return res.send(csv);
  }

  if (type === 'attendance') {
    const attendance = db.get('attendance');
    let csv = 'Record ID,Lesson Title,Subject,Grade,Student Name,Date,Status,Recorded By,Notes\n';
    attendance.forEach(a => {
      csv += `"${a.id}","${a.lessonTitle}","${a.subject}","${a.grade}","${a.studentName}","${a.date}","${a.status}","${a.recordedBy}","${a.notes || ''}"\n`;
    });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="holiday_tuition_hub_attendance.csv"');
    return res.send(csv);
  }

  // default: students roster
  const users = db.get('users').filter(u => u.role === 'student');
  let csv = 'Student ID,Full Name,Email,Phone,Grade,Enrolled Subjects,Account Status,Created At\n';
  users.forEach(s => {
    csv += `"${s.id}","${s.name}","${s.email}","${s.phone}","${s.grade || ''}","${(s.selectedSubjects || []).join('; ')}","${s.accountStatus}","${s.createdAt}"\n`;
  });
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="holiday_tuition_hub_students.csv"');
  return res.send(csv);
});

// Admin Audit Logs
app.get('/api/admin/audit-logs', (_req: Request, res: Response) => {
  res.json({ success: true, data: db.get('auditLogs') });
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
