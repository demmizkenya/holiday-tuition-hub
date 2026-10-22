import React, { useState } from 'react';
import { GradeItem, SubjectItem } from '../types';
import { BookOpen, CheckCircle, ChevronRight } from 'lucide-react';

interface GradesViewProps {
  grades: GradeItem[];
  subjects: SubjectItem[];
  onNavigate: (view: string) => void;
}

export const GradesView: React.FC<GradesViewProps> = ({ grades, subjects, onNavigate }) => {
  const [selectedGradeId, setSelectedGradeId] = useState<string>(grades[2]?.id || 'grade-11');
  const currentGrade = grades.find(g => g.id === selectedGradeId) || grades[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 inline-block px-3 py-1 rounded-full border border-blue-200">
          Curriculum & Levels
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-sans">
          Grades 9 Through 14 Supported
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          Select your grade below to explore the academic pathway, specific learning objectives, and available holiday tutoring subjects.
        </p>
      </div>

      {/* Grade Selector Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-slate-100 rounded-2xl max-w-4xl mx-auto border border-slate-200">
        {grades.map(grade => {
          const isSelected = grade.id === selectedGradeId;
          return (
            <button
              key={grade.id}
              onClick={() => setSelectedGradeId(grade.id)}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              {grade.name}
            </button>
          );
        })}
      </div>

      {/* Detailed Grade Card */}
      {currentGrade && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs max-w-4xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-700">
                Grade Profile
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 font-sans mt-0.5">
                {currentGrade.name}
              </h2>
              <div className="text-sm font-semibold text-slate-600 mt-1">
                {currentGrade.level}
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 text-blue-900 px-4 py-2 rounded-xl text-xs font-semibold">
              Curriculum Track: {currentGrade.curriculum}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Overview & Focus
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {currentGrade.description}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Key Academic Learning Objectives
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentGrade.learningObjectives.map((obj, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{obj}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Available Subjects for this Grade */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Holiday Subjects Available for {currentGrade.name}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {subjects.map(subj => (
                <div key={subj.id} className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-900">{subj.name}</div>
                    <div className="text-[11px] text-slate-500">Live Lessons & Notes</div>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                    Open
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              Fee: <strong>KSh 699 per week</strong> covers all selected subjects for {currentGrade.name}.
            </div>
            <button
              onClick={() => onNavigate('enroll')}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              Enroll in {currentGrade.name} →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
