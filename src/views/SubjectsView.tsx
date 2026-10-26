import React, { useState } from 'react';
import { SubjectItem, PlatformSettings } from '../types';
import { CheckCircle, BookOpen, Clock, FileText, Video, Award, ChevronRight } from 'lucide-react';

interface SubjectsViewProps {
  subjects: SubjectItem[];
  settings?: PlatformSettings;
  onNavigate: (view: string) => void;
}

export const SubjectsView: React.FC<SubjectsViewProps> = ({ subjects, settings, onNavigate }) => {
  const [activeSubjectId, setActiveSubjectId] = useState<string>(subjects[0]?.id || 'math');
  const currentSubject = subjects.find(s => s.id === activeSubjectId) || subjects[0];
  const weeklyPrice = settings?.weeklyPrice || 699;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 inline-block px-3 py-1 rounded-full border border-blue-200">
          Academic Offerings
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-sans">
          Holiday Tuition Hub Subjects
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          Comprehensive curriculum coverage in Mathematics, English, Chemistry, Kiswahili, and Computer Studies. All subjects include live instruction, recorded masterclasses, worksheets, and auto-graded assessments.
        </p>
      </div>

      {/* Subject Navigation Tabs */}
      {subjects.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200 max-w-4xl mx-auto">
          <p className="text-slate-500 text-sm font-medium">No subjects published yet.</p>
          <p className="text-slate-400 text-xs mt-1">Please check back soon or contact administration on WhatsApp.</p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-slate-100 rounded-2xl max-w-4xl mx-auto border border-slate-200">
            {subjects.map(subj => {
              const isActive = subj.id === activeSubjectId;
              return (
                <button
                  key={subj.id}
                  onClick={() => setActiveSubjectId(subj.id)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-700 text-white shadow-sm'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  {subj.name}
                </button>
              );
            })}
          </div>

          {/* Selected Subject Detailed View */}
          {currentSubject && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-xs max-w-5xl mx-auto space-y-8">
          {/* Title & Badge */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-700">
                Subject Syllabus & Overview
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 font-sans mt-0.5">
                {currentSubject.name}
              </h2>
              <div className="text-xs text-slate-500 mt-1">
                Tutor: Daniel Owino • Africa/Nairobi Time Zone
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-lg text-xs font-bold">
                Open for Enrollment
              </span>
              <span className="bg-blue-50 text-blue-900 border border-blue-200 px-3 py-1 rounded-lg text-xs font-bold">
                KSh {weeklyPrice} / Week
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Curriculum Focus
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              {currentSubject.description}
            </p>
          </div>

          {/* Supported Grades */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Supported Grades
            </h3>
            <div className="flex flex-wrap gap-2">
              {currentSubject.supportedGrades.map((grade, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700"
                >
                  {grade}
                </span>
              ))}
            </div>
          </div>

          {/* Topics Covered & Learning Objectives in 2 columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-100">
            {/* Topics */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-700" />
                Topics Covered in November 2026
              </h3>
              <ul className="space-y-2 text-xs text-slate-700">
                {currentSubject.topics.map((topic, i) => (
                  <li key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0"></span>
                    <span>{topic}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Learning Objectives */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-700" />
                Key Learning Objectives
              </h3>
              <ul className="space-y-2 text-xs text-slate-700">
                {currentSubject.learningObjectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200 text-emerald-950">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Assessment & Resources Information */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Video className="w-4 h-4 text-blue-700" />
                Interactive Lessons
              </div>
              <p>Weekly live classes with student-selectable slots and full recorded archives.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-700" />
                Revision Booklets
              </div>
              <p>Topic-by-topic summary notes and past-paper drill worksheets available for download.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-blue-700" />
                Practice Assessments
              </div>
              <p>Weekly timed quizzes with automatic grading, instant solutions, and tutor feedback.</p>
            </div>
          </div>

          {/* CTA Footer */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-600">
              One flat fee of <strong>KSh 699/week</strong> unlocks all enrolled subjects.
            </div>
            <button
              onClick={() => onNavigate('enroll')}
              className="w-full sm:w-auto px-8 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm rounded-xl shadow-xs transition-colors"
            >
              Enroll in {currentSubject.name} Now →
            </button>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
};
