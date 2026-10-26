import React, { useState, useEffect } from 'react';
import { Award, BookOpen, GraduationCap, Mail, Phone, CheckCircle2, Sparkles, MessageCircle } from 'lucide-react';
import { TeacherProfile } from '../types.ts';
import { api } from '../services/api.ts';

interface TeachersViewProps {
  onSelectTeacher?: (teacher: TeacherProfile) => void;
  onOpenEnroll?: () => void;
}

export const TeachersView: React.FC<TeachersViewProps> = ({ onOpenEnroll }) => {
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<string>('All');

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const publicData = await api.getPublicData();
        setTeachers(publicData?.teachers || []);
      } catch (err) {
        console.error('Failed to load teachers:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  const subjectsList = ['All', 'Mathematics', 'Chemistry', 'English', 'Kiswahili', 'Computer Studies'];

  const filteredTeachers = selectedSubject === 'All'
    ? teachers
    : teachers.filter(t => t.subjects.includes(selectedSubject));

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="max-w-7xl mx-auto text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <GraduationCap className="w-4 h-4" />
          Elite Academic Mentors
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
          Meet Our Expert Teachers & Mentors
        </h1>
        <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-300 leading-relaxed">
          Led by founder <span className="text-emerald-400 font-semibold">Daniel Owino</span>, our dedicated faculty brings decades of combined teaching experience, proven top KNEC results, and a passion for unlocking every learner's potential in Grades 9–14.
        </p>

        {/* Subject Filter Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
          {subjectsList.map((subject) => (
            <button
              key={subject}
              onClick={() => setSelectedSubject(subject)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                selectedSubject === subject
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 scale-105'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              {subject}
            </button>
          ))}
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center py-20 text-slate-400">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="text-center py-16 bg-slate-800/40 rounded-2xl border border-slate-850">
            <p className="text-slate-400">No teachers found for this subject filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTeachers.map((teacher) => (
              <div
                key={teacher.id}
                className="group relative bg-slate-800/90 rounded-2xl border border-slate-700/80 overflow-hidden shadow-xl hover:shadow-2xl hover:border-emerald-500/50 transition-all duration-300 flex flex-col"
              >
                {/* Top colored accent bar */}
                <div className="h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-sky-500" />

                {/* Profile Image & Avatar */}
                <div className="p-6 pb-0 flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <img
                      src={teacher.imageUrl || teacher.photoUrl}
                      alt={teacher.name}
                      className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-slate-700 group-hover:border-emerald-500/60 shadow-lg transition-all duration-300"
                    />
                    <div className="absolute -bottom-2 -right-1 bg-emerald-500 text-slate-950 p-1.5 rounded-full shadow-md" title="Verified Faculty">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {teacher.name}
                  </h3>
                  <p className="text-sm font-medium text-emerald-400 mb-2">
                    {teacher.role}
                  </p>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mb-4">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>{teacher.experience}</span>
                  </p>
                </div>

                {/* Body Details */}
                <div className="p-6 pt-2 flex-1 flex flex-col justify-between space-y-4">
                  {/* Bio */}
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic bg-slate-900/50 p-3.5 rounded-xl border border-slate-755">
                    "{teacher.bio}"
                  </p>

                  {/* Qualifications */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-emerald-400" />
                      Qualifications & Credentials
                    </h4>
                    <ul className="space-y-1.5">
                      {(teacher.qualifications || [teacher.qualification]).map((qual: string, idx: number) => (
                        <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                          <span>{qual}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Subjects Taught */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-sky-400" />
                      Subjects Handled
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {teacher.subjects.map((subj, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                        >
                          {subj}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Contact / Action footer */}
                  <div className="pt-4 border-t border-slate-755 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-3">
                      <a
                        href={`mailto:${teacher.email || 'danielowino233@gmail.com'}`}
                        className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title={teacher.email || 'Email faculty member'}
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                      <a
                        href={`https://wa.me/254708083643?text=Hello%20Holiday%20Tuition%20Hub,%20I%20would%20like%20to%20consult%20with%20${encodeURIComponent(teacher.name)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5"
                        title="Chat via WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-[11px] font-semibold">Consult</span>
                      </a>
                    </div>

                    {onOpenEnroll && (
                      <button
                        onClick={onOpenEnroll}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs transition-colors shadow-sm"
                      >
                        Enroll with Mentor
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Philosophy banner */}
      <div className="max-w-5xl mx-auto mt-16 bg-gradient-to-br from-slate-800 to-slate-850 rounded-2xl border border-slate-700 p-8 text-center relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-white mb-2">Our Mentorship Guarantee</h2>
        <p className="text-sm text-slate-300 max-w-2xl mx-auto mb-6 leading-relaxed">
          At Holiday Tuition Hub, every student is matched with teacher mentors who provide step-by-step topic demystification, revision strategy, and weekly homework feedback to secure grades A and B in their national examinations.
        </p>
        <div className="inline-flex items-center gap-3">
          <a
            href="https://wa.me/254708083643"
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
          >
            <Phone className="w-4 h-4" />
            Direct Consultation: +254 708 083 643
          </a>
        </div>
      </div>
    </div>
  );
};
