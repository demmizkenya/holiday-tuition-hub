import React, { useState } from 'react';
import { LearningResource, UserAccount } from '../types';
import { FileText, Download, Lock, Search, Filter, Shield } from 'lucide-react';

interface ResourcesViewProps {
  resources?: LearningResource[];
  currentUser: UserAccount | null;
  onNavigate: (view: string) => void;
  onOpenAuthModal: (mode: 'login' | 'register') => void;
}

export const ResourcesView: React.FC<ResourcesViewProps> = ({
  resources = [],
  currentUser,
  onNavigate,
  onOpenAuthModal
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedGrade, setSelectedGrade] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Default sample resources if none loaded
  const sampleResources: LearningResource[] = resources.length > 0 ? resources : [
    {
      id: 'res-pub-1',
      title: 'Holiday Tuition Hub Official Program & Syllabus Guide (Public Overview)',
      description: 'Official overview of learning expectations, weekly timetables, and subject milestones for the November 2026 holiday cohort.',
      grade: 'All Grades',
      subject: 'General',
      topic: 'Program Syllabus',
      resourceType: 'Study Guide',
      fileUrl: '#',
      fileSize: '950 KB',
      publicationDate: '2026-10-01',
      isPaidOnly: false
    },
    {
      id: 'res-pub-2',
      title: 'Grade 11 Calculus Revision Master Booklet & Step-by-Step Solutions',
      description: 'Complete 24-page PDF covering rate of change, tangents, normals, turning points, and optimization with annotated solutions.',
      grade: 'Grade 11',
      subject: 'Mathematics',
      topic: 'Calculus',
      resourceType: 'PDF Notes',
      fileUrl: '#',
      fileSize: '3.2 MB',
      publicationDate: '2026-10-15',
      isPaidOnly: true
    },
    {
      id: 'res-pub-3',
      title: 'Stoichiometry & The Mole Concept Comprehensive Worksheet',
      description: '35 structured questions with full working steps for empirical formulae, molarity, percentage composition, and titrations.',
      grade: 'Grade 11',
      subject: 'Chemistry',
      topic: 'The Mole Concept',
      resourceType: 'Worksheet',
      fileUrl: '#',
      fileSize: '2.4 MB',
      publicationDate: '2026-10-16',
      isPaidOnly: true
    },
    {
      id: 'res-pub-4',
      title: 'Computer Studies Paper 1: Flowchart & Algorithm Drill Pack',
      description: 'Comprehensive collection of exam-tested algorithm problems requiring flowchart construction and pseudocode drafting.',
      grade: 'Grade 11',
      subject: 'Computer Studies',
      topic: 'Algorithms and Data',
      resourceType: 'Practice Paper',
      fileUrl: '#',
      fileSize: '1.8 MB',
      publicationDate: '2026-10-17',
      isPaidOnly: true
    }
  ];

  const filtered = sampleResources.filter(r => {
    const matchSubject = selectedSubject === 'All' || r.subject === selectedSubject;
    const matchGrade = selectedGrade === 'All' || r.grade === selectedGrade || r.grade === 'All Grades';
    const matchSearch = !searchTerm || r.title.toLowerCase().includes(searchTerm.toLowerCase()) || r.topic.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSubject && matchGrade && matchSearch;
  });

  const handleDownload = (resItem: LearningResource) => {
    if (resItem.isPaidOnly && !currentUser) {
      onOpenAuthModal('login');
      return;
    }
    // Simulation of file download
    const blob = new Blob([`Holiday Tuition Hub Learning Resource\n\nTitle: ${resItem.title}\nSubject: ${resItem.subject} (${resItem.grade})\nTopic: ${resItem.topic}\nLead Tutor: Daniel Owino\nDate: ${resItem.publicationDate}\n\nContents verified for enrolled students.`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resItem.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 inline-block px-3 py-1 rounded-full border border-blue-200">
          Learning Library
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-sans">
          Study Materials & Revision Resources
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          Access curated PDF revision booklets, structured worksheets, and past-paper drill packs authored and verified by Daniel Owino.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search resources by title, topic, or keyword..."
            className="w-full text-xs pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="text-xs px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="All">All Subjects</option>
            <option value="Mathematics">Mathematics</option>
            <option value="English">English</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Kiswahili">Kiswahili</option>
            <option value="Computer Studies">Computer Studies</option>
          </select>

          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="text-xs px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="All">All Grades</option>
            <option value="Grade 9">Grade 9</option>
            <option value="Grade 10">Grade 10</option>
            <option value="Grade 11">Grade 11</option>
            <option value="Grade 12">Grade 12</option>
            <option value="Grade 13">Grade 13</option>
            <option value="Grade 14">Grade 14</option>
          </select>
        </div>
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(resItem => (
          <div
            key={resItem.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:border-blue-300 transition-all"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                  {resItem.subject} • {resItem.grade}
                </span>
                {resItem.isPaidOnly ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <Lock className="w-3 h-3" />
                    Enrolled
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Public
                  </span>
                )}
              </div>

              <h3 className="font-bold text-slate-900 text-base font-sans line-clamp-2">
                {resItem.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                {resItem.description}
              </p>

              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100">
                <span>Format: {resItem.resourceType}</span>
                <span>Size: {resItem.fileSize}</span>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-100">
              <button
                onClick={() => handleDownload(resItem)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{resItem.isPaidOnly && !currentUser ? 'Sign In to Download' : 'Download Document'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
