import React from 'react';
import { PlatformSettings } from '../types';
import { Award, BookOpen, CheckCircle, Shield, Target } from 'lucide-react';

interface AboutViewProps {
  settings?: PlatformSettings;
  onNavigate: (view: string) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ settings, onNavigate }) => {
  const brandName = settings?.brandName || 'HOLIDAY TUITION HUB';
  const tutorName = settings?.tutorName || 'Daniel Owino';
  const tutorBio = settings?.tutorBio || 'Daniel Owino is the founder and lead educator at Holiday Tuition Hub. Dedicated to academic excellence, he delivers structured holiday tuition and mentorship across high school levels (Grades 9 to 14) with a strong emphasis on core concept mastery, exam techniques, and personal academic confidence.';
  const aboutText = settings?.aboutText || 'Holiday Tuition Hub provides premier online tutoring and academic mentorship for high school students in Grades 9 through 14 across Kenya and East Africa. Our structured holiday program combines interactive live lessons, on-demand recorded learning archives, downloadable revision materials, and targeted practice assessments to ensure students make their holiday count.';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Overview Header */}
      <div className="text-center space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 inline-block px-3 py-1 rounded-full border border-blue-200">
          About Our Platform
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-sans">
          Dedicated to Academic Excellence & Mentorship
        </h1>
        <p className="text-slate-600 text-base max-w-3xl mx-auto leading-relaxed">
          {aboutText}
        </p>
      </div>

      {/* Tutor Biography Section */}
      <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-700">
              Platform Founder & Tutor
            </div>
            <h2 className="text-2xl font-bold text-slate-900 font-sans mt-0.5">
              {tutorName}
            </h2>
            <div className="text-xs text-slate-500 mt-1">
              High School Academic Mentorship • Grades 9–14
            </div>
          </div>
          <div className="bg-blue-50 text-blue-900 border border-blue-200 px-4 py-2 rounded-xl text-xs font-semibold">
            Africa/Nairobi Time Zone (EAT)
          </div>
        </div>

        <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
          <p>{tutorBio}</p>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <strong className="text-slate-800">Verified Teaching & Contact Information:</strong>
            <div>• Official Payment Recipient (M-Pesa): <strong>Daniel Owino (0116654805)</strong></div>
            <div>• Official WhatsApp Consultation: <strong>0708083643</strong></div>
            <div>• Direct Email: <strong>danielowino233@gmail.com</strong></div>
          </div>
        </div>
      </section>

      {/* Core Educational Philosophy */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900 font-sans text-center">
          Our Educational Approach
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-base">First-Principles Concept Clarity</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We focus on building strong conceptual foundations from first principles rather than rote memorization, enabling students to tackle unexpected exam questions with composure.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-base">Student-Centric Lesson Scheduling</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Holiday learning must be flexible. Students choose convenient times from published availability in Africa/Nairobi time, ensuring lessons fit each student’s daily routine.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-base">Accountability & Parent Visibility</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every lesson attended, quiz completed, and assignment submitted is recorded and made available to parents through their secure dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8 text-center space-y-4">
        <h3 className="text-xl font-bold text-blue-900 font-sans">
          Join the November 2026 Holiday Cohort
        </h3>
        <p className="text-xs text-blue-800 max-w-xl mx-auto">
          Enrollment is currently open for Grades 9 through 14 across Mathematics, English, Chemistry, Kiswahili, and Computer Studies at KSh 699 per week.
        </p>
        <button
          onClick={() => onNavigate('enroll')}
          className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm rounded-xl transition-colors shadow-xs"
        >
          Enroll Now →
        </button>
      </div>
    </div>
  );
};
