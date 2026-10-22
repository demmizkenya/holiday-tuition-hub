import React from 'react';
import { PlatformSettings, GradeItem, SubjectItem } from '../types';
import {
  Calendar,
  Clock,
  BookOpen,
  CheckCircle,
  HelpCircle,
  Phone,
  Shield,
  Layers,
  Video,
  FileText,
  Award,
  Users
} from 'lucide-react';

interface HomeViewProps {
  settings?: PlatformSettings;
  grades: GradeItem[];
  subjects: SubjectItem[];
  onNavigate: (view: string) => void;
  onOpenAuthModal: (mode: 'login' | 'register') => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  settings,
  grades,
  subjects,
  onNavigate,
  onOpenAuthModal
}) => {
  const brandName = settings?.brandName || 'HOLIDAY TUITION HUB';
  const tutorName = settings?.tutorName || 'Daniel Owino';
  const weeklyPrice = settings?.weeklyPrice || 699;
  const commencement = settings?.commencementDate || '2026-11-01';
  const endDate = settings?.endDate || '2026-11-22';
  const enrollmentState = settings?.enrollmentState || 'Enrollment open';

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-50/70 via-white to-white pt-12 pb-16 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              {/* Program Status Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-900 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                <span>{enrollmentState} • Holiday Cohort: 1 Nov – 22 Nov 2026</span>
              </div>

              {/* Required Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight font-sans leading-[1.1]">
                Make Your Holiday Count.
              </h1>

              {/* Required Supporting Headline */}
              <h2 className="text-xl sm:text-2xl font-bold text-blue-800 tracking-tight">
                Quality Online Tutoring for Grades 9–14.
              </h2>

              {/* Required Supporting Description */}
              <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-2xl">
                Holiday Tuition Hub provides online tutoring in Mathematics, English, Chemistry, Kiswahili, and Computer Studies, with live lessons, recorded learning resources, practice assessments, and flexible lesson scheduling.
              </p>

              {/* Key Highlights Badge Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-700 font-medium">
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                  <Clock className="w-4 h-4 text-blue-700 shrink-0" />
                  <span>Africa/Nairobi Time</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                  <Shield className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>KSh {weeklyPrice} / Week Flat</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
                  <Users className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Parent Monitoring</span>
                </div>
              </div>

              {/* Required Primary and Secondary Calls to Action */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <button
                  onClick={() => onNavigate('enroll')}
                  className="px-8 py-3.5 bg-blue-700 hover:bg-blue-800 active:scale-95 text-white font-extrabold text-base rounded-xl shadow-md transition-all"
                >
                  Enroll Now
                </button>
                <button
                  onClick={() => onNavigate('subjects')}
                  className="px-7 py-3.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-base rounded-xl shadow-xs transition-all"
                >
                  Explore Subjects
                </button>
              </div>

              <div className="text-xs text-slate-500 pt-1">
                Tutor & Payment Recipient: <strong className="text-slate-800 font-semibold">{tutorName}</strong> • Verified manual M-Pesa Send Money
              </div>
            </div>

            {/* Hero Quick Card - Program At A Glance */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-700">
                    November 2026 Intensive
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                    Structured Holiday Tuition
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Africa/Nairobi Time (UTC+3) • Grades 9 through 14
                  </p>
                </div>

                <div className="space-y-3.5 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-600">Commencement Date</span>
                    <strong className="text-slate-900 font-semibold">1 November 2026</strong>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-600">Program End Date</span>
                    <strong className="text-slate-900 font-semibold">22 November 2026</strong>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-600">Duration</span>
                    <strong className="text-slate-900 font-semibold">3 Weeks</strong>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-600">Standard Weekly Tuition Fee</span>
                    <strong className="text-blue-800 font-extrabold text-lg">KSh {weeklyPrice}</strong>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-600">Payment Channel</span>
                    <span className="text-xs font-mono bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-md font-semibold border border-emerald-200">
                      M-Pesa 0116654805
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
                  <div className="font-semibold text-slate-800">What is included each week:</div>
                  <ul className="space-y-1 list-disc list-inside text-slate-600">
                    <li>Interactive live lessons with student-selected slots</li>
                    <li>Full on-demand library of recorded lessons</li>
                    <li>Comprehensive downloadable PDF notes & worksheets</li>
                    <li>Timed practice tests with auto-marking & solutions</li>
                    <li>Individual academic progress report for parents</li>
                  </ul>
                </div>

                <button
                  onClick={() => onNavigate('enroll')}
                  className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-sm transition-colors shadow-xs"
                >
                  Start Student Registration →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subjects Offered Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-700">
            Comprehensive Curriculum
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 font-sans">
            Core Subjects Offered
          </h2>
          <p className="text-slate-600 text-sm">
            Holiday Tuition Hub offers focused, high-impact instruction in five foundational high school disciplines. Students may enroll in one or multiple subjects under the standard weekly fee.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map(subj => (
            <div
              key={subj.id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                    Grades 9–14
                  </span>
                  <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Open
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 font-sans">
                  {subj.name}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {subj.description}
                </p>

                <div className="pt-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Key Topics Covered:
                  </div>
                  <ul className="text-xs space-y-1.5 text-slate-700">
                    {subj.topics.slice(0, 3).map((topic, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 mt-6 flex items-center justify-between">
                <button
                  onClick={() => onNavigate('subjects')}
                  className="text-xs font-bold text-blue-700 hover:text-blue-900 underline"
                >
                  View Subject Syllabus →
                </button>
                <button
                  onClick={() => onNavigate('enroll')}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors"
                >
                  Enroll
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Grades Supported Section */}
      <section className="bg-slate-50 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Academic Levels
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 font-sans">
              Grades 9 Through 14 Supported
            </h2>
            <p className="text-slate-600 text-sm">
              Each grade level follows tailored learning objectives, recognizing that junior secondary, senior candidate classes, and advanced pre-university tracks require distinct pedagogical approaches.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {grades.map(grade => (
              <div
                key={grade.id}
                className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 font-sans">
                    {grade.name}
                  </h3>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {grade.curriculum.split('/')[0]}
                  </span>
                </div>
                <div className="text-xs font-semibold text-blue-800">
                  {grade.level}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {grade.description}
                </p>
                <div className="pt-2 border-t border-slate-100">
                  <div className="text-[11px] font-bold text-slate-500 mb-1">Target Objectives:</div>
                  <ul className="text-xs text-slate-600 space-y-1">
                    {grade.learningObjectives.slice(0, 2).map((obj, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-blue-600 font-bold">•</span>
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => onNavigate('grades')}
              className="text-sm font-bold text-blue-700 hover:text-blue-900 underline underline-offset-4"
            >
              Explore Full Grade Breakdown & Curriculum Details →
            </button>
          </div>
        </div>
      </section>

      {/* How It Works & Enrollment Workflow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-700">
            Simple 4-Step Process
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 font-sans">
            How Holiday Tuition Hub Works
          </h2>
          <p className="text-slate-600 text-sm">
            From registration to verified lesson attendance, our process is transparent, structured, and easy for students and parents.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 font-extrabold flex items-center justify-center text-lg">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-base">Register Account</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Sign up as a student or parent. Select your grade (Grades 9–14) and the subjects you wish to excel in.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 font-extrabold flex items-center justify-center text-lg">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-base">M-Pesa Tuition Fee</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Use M-Pesa Send Money to send KSh 699/week to Daniel Owino (0116654805). Submit your transaction code.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 font-extrabold flex items-center justify-center text-lg">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-base">Book Lesson Slots</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Choose convenient lesson times from the published timetable in Africa/Nairobi time. Double bookings are prevented.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 relative">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 font-extrabold flex items-center justify-center text-lg">
              4
            </div>
            <h3 className="font-bold text-slate-900 text-base">Learn & Track Progress</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Attend live lessons, download revision booklets, submit quizzes, and review comprehensive progress reports.
            </p>
          </div>
        </div>
      </section>

      {/* Parent & Guardian Portal Highlight */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
                <Shield className="w-3.5 h-3.5" />
                Dedicated Parent & Guardian Portal
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans">
                Real Visibility Into Your Child’s Learning
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Parents and guardians have a secure portal to verify lesson attendance, review tutor comments from Daniel Owino, inspect practice test scores, and monitor weekly payment status. No guesswork—only verified academic progress.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Real live lesson attendance logging</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Formal academic progress reports</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Verified M-Pesa payment tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Direct inquiry channel to the tutor</span>
                </div>
              </div>
              <div className="pt-4 flex flex-wrap gap-4">
                <button
                  onClick={() => onOpenAuthModal('register')}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-colors shadow-xs"
                >
                  Create Parent Account
                </button>
                <button
                  onClick={() => onNavigate('faq')}
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-sm border border-slate-700 transition-colors"
                >
                  Read Parent FAQ
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 bg-slate-800/90 rounded-2xl p-6 border border-slate-700 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Parent Dashboard Preview
              </div>
              <div className="space-y-3 text-xs">
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-700">
                  <div className="text-slate-400">Linked Student</div>
                  <div className="text-sm font-bold text-white">Faith Wanjiru (Grade 11)</div>
                  <div className="text-[11px] text-emerald-400 mt-0.5">Enrolled: Mathematics, Chemistry, Computer Studies</div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-700">
                    <div className="text-slate-400">Attendance Rate</div>
                    <div className="text-lg font-extrabold text-white">100%</div>
                    <div className="text-[10px] text-slate-400">Confirmed by tutor</div>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-700">
                    <div className="text-slate-400">Quiz Average</div>
                    <div className="text-lg font-extrabold text-white">100%</div>
                    <div className="text-[10px] text-slate-400">Calculus & CS drills</div>
                  </div>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-700 text-[11px] text-slate-300">
                  <strong className="text-white">Tutor Observation:</strong> "Faith demonstrates outstanding focus and solid analytical foundations. Actively asks clarifying questions in whiteboard sessions."
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions Snippet */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <div className="text-xs font-bold uppercase tracking-wider text-blue-700">
            Clear Answers
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 font-sans">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 text-sm">
            Everything you need to know about enrollment, KSh 699 weekly fees, M-Pesa verification, and lesson schedules.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-2">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-700 shrink-0" />
              How do I pay the tuition fee via M-Pesa?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed pl-6">
              Open M-Pesa on your phone, choose <strong>Send Money</strong>, enter <strong>0116654805</strong>, verify that the recipient name is <strong>Daniel Owino</strong>, and enter <strong>KSh 699</strong>. After receiving your M-Pesa confirmation SMS, submit the transaction code in your student portal. Daniel Owino verifies it against actual records to activate your 7-day subscription.
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-2">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-700 shrink-0" />
              Can I choose my own lesson times?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed pl-6">
              Yes. Holiday Tuition Hub features student-selectable scheduling. Once registered and enrolled, you view all available published slots in the Africa/Nairobi time zone and reserve convenient slots for your grade and subjects. Double bookings and capacity clashes are automatically prevented.
            </p>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-2">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-700 shrink-0" />
              What subjects are included in the weekly tuition?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed pl-6">
              The standard tuition fee of KSh 699 covers all five offered subjects: Mathematics, English, Chemistry, Kiswahili, and Computer Studies. Students can attend lessons and download materials across any of their enrolled subjects for that week.
            </p>
          </div>
        </div>

        <div className="text-center pt-8">
          <button
            onClick={() => onNavigate('faq')}
            className="text-sm font-bold text-blue-700 hover:text-blue-900 underline"
          >
            Read All Frequently Asked Questions →
          </button>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-slate-900 rounded-3xl p-8 sm:p-12 text-white text-center space-y-6 shadow-xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-sans">
            Ready to Excel in the November 2026 Holiday?
          </h2>
          <p className="text-slate-200 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Reserve your place today for the 1 Nov – 22 Nov 2026 holiday program. Structured live tutoring, recorded archives, practice tests, and dedicated mentorship by Daniel Owino.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('enroll')}
              className="px-8 py-3.5 bg-white text-blue-900 hover:bg-slate-100 font-extrabold text-base rounded-xl shadow-md transition-colors"
            >
              Enroll Now — KSh 699 / Week
            </button>
            <a
              href="https://wa.me/254708083643?text=Hello%2C%20I%20would%20like%20to%20inquire%20about%20Holiday%20Tuition%20Hub."
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base rounded-xl shadow-md transition-colors flex items-center gap-2"
            >
              <span>WhatsApp Daniel Owino (0708083643)</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
