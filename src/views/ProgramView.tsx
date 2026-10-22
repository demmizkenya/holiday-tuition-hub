import React from 'react';
import { PlatformSettings, GradeItem, SubjectItem } from '../types';
import { Calendar, Clock, CheckCircle, Shield, Award } from 'lucide-react';

interface ProgramViewProps {
  settings?: PlatformSettings;
  grades: GradeItem[];
  subjects: SubjectItem[];
  onNavigate: (view: string) => void;
}

export const ProgramView: React.FC<ProgramViewProps> = ({
  settings,
  grades,
  subjects,
  onNavigate
}) => {
  const brandName = settings?.brandName || 'HOLIDAY TUITION HUB';
  const tutorName = settings?.tutorName || 'Daniel Owino';
  const programName = settings?.programName || 'November 2026 Holiday Intensive';
  const commencement = settings?.commencementDate || '2026-11-01';
  const endDate = settings?.endDate || '2026-11-22';
  const weeklyPrice = settings?.weeklyPrice || 699;
  const enrollmentState = settings?.enrollmentState || 'Enrollment open';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-900 border border-blue-200 text-xs font-semibold">
          <Calendar className="w-3.5 h-3.5 text-blue-700" />
          <span>Cohort Schedule: {commencement} to {endDate}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-sans">
          {programName}
        </h1>
        <p className="text-slate-600 text-sm max-w-2xl mx-auto leading-relaxed">
          The upcoming holiday tuition cohort spans three weeks of intensive academic instruction and revision, specifically scheduled during the school holiday to maximize student mastery.
        </p>
      </div>

      {/* Program Details Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-slate-100 pb-8">
          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Commencement Date
            </div>
            <div className="text-xl font-extrabold text-slate-900">
              1 November 2026
            </div>
            <div className="text-xs text-slate-500">
              First day of live lessons
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Program End Date
            </div>
            <div className="text-xl font-extrabold text-slate-900">
              22 November 2026
            </div>
            <div className="text-xs text-slate-500">
              3 weeks comprehensive coverage
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Current Status
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <span>{enrollmentState}</span>
            </div>
            <div className="text-xs text-slate-500">
              Admin-managed cohort dates
            </div>
          </div>
        </div>

        {/* Weekly Breakdown */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 font-sans">
            Three-Week Cohort Structure
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-700">
                Week 1 (1 Nov – 7 Nov)
              </div>
              <h3 className="font-bold text-slate-900 text-sm">
                Diagnostic & Foundational Concepts
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Initial topic diagnostics, establishing algebra/calculus techniques, core chemical stoichiometry, and grammar/essay structure foundations.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-700">
                Week 2 (8 Nov – 14 Nov)
              </div>
              <h3 className="font-bold text-slate-900 text-sm">
                Advanced Problem-Solving & Drills
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Multi-step mathematical derivations, organic chemistry mechanisms, algorithm pseudocode, and literary character analysis.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-700">
                Week 3 (15 Nov – 22 Nov)
              </div>
              <h3 className="font-bold text-slate-900 text-sm">
                Candidate Revisions & Timed Tests
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Full-length practice test simulations, past-paper marking walk-throughs, personalized tutor feedback, and progress report generation.
              </p>
            </div>
          </div>
        </div>

        {/* What You Need */}
        <div className="bg-blue-50/60 p-6 rounded-2xl border border-blue-200 space-y-3">
          <h2 className="text-sm font-bold text-blue-900">
            Requirements to Participate
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-blue-900">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-700 shrink-0" />
              <span>Smartphone, tablet, or computer with internet connection</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-700 shrink-0" />
              <span>Google Meet or Zoom app installed for live classes</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-700 shrink-0" />
              <span>Notebook and writing materials for working out problems</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-700 shrink-0" />
              <span>Standard weekly tuition fee of KSh 699 via M-Pesa</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
          <div className="text-xs text-slate-500">
            Cohort capacity is limited to ensure personalized whiteboard interaction.
          </div>
          <button
            onClick={() => onNavigate('enroll')}
            className="w-full sm:w-auto px-8 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-xs transition-colors"
          >
            Enroll in November 2026 Cohort →
          </button>
        </div>
      </div>
    </div>
  );
};
