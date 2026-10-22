import React, { useState } from 'react';
import { UserAccount, SubjectItem } from '../types';
import { api } from '../services/api';
import { X, Lock, CheckCircle, AlertCircle, User, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
  onLoginSuccess: (user: UserAccount) => void;
  availableSubjects?: SubjectItem[];
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login',
  onLoginSuccess,
  availableSubjects = []
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);
  const [role, setRole] = useState<'student' | 'parent'>('student');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [grade, setGrade] = useState('Grade 11');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['Mathematics', 'Chemistry', 'Computer Studies']);
  const [relationship, setRelationship] = useState('Parent');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleSubjectToggle = (subjName: string) => {
    if (selectedSubjects.includes(subjName)) {
      if (selectedSubjects.length === 1) return; // Keep at least one
      setSelectedSubjects(selectedSubjects.filter(s => s !== subjName));
    } else {
      setSelectedSubjects([...selectedSubjects, subjName]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.login(email);
        if (res.success && res.user) {
          onLoginSuccess(res.user);
          onClose();
        } else {
          setErrorMessage(res.message || 'Account not found. Please verify your email or register.');
        }
      } else {
        // Register
        if (!name.trim() || !email.trim() || !phone.trim()) {
          setErrorMessage('Please fill in all required fields.');
          setLoading(false);
          return;
        }

        const res = await api.register({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          role,
          grade: role === 'student' ? grade : undefined,
          selectedSubjects: role === 'student' ? selectedSubjects : undefined,
          relationship: role === 'parent' ? relationship : undefined
        });

        if (res.success && res.user) {
          setSuccessMessage(res.message);
          setTimeout(() => {
            onLoginSuccess(res.user!);
            onClose();
          }, 800);
        } else {
          setErrorMessage(res.message || 'Failed to complete registration.');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'A network error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const defaultSubjectOptions = availableSubjects.length > 0
    ? availableSubjects.map(s => s.name)
    : ['Mathematics', 'English', 'Chemistry', 'Kiswahili', 'Computer Studies'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg font-sans">
              {mode === 'login' ? 'Sign In to Holiday Tuition Hub' : 'Create an Account'}
            </h3>
            <p className="text-xs text-slate-400">
              {mode === 'login'
                ? 'Access your lessons, learning library, and progress reports.'
                : 'Join Holiday Tuition Hub for structured holiday learning.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg flex items-start gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Mode Switcher Tab */}
          <div className="flex border border-slate-200 rounded-lg p-1 bg-slate-50 mb-5">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMessage(''); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                mode === 'login' ? 'bg-white shadow-xs text-blue-700 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMessage(''); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                mode === 'register' ? 'bg-white shadow-xs text-blue-700 font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              New Registration
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                {/* Role Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Registering as:
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('student')}
                      className={`p-3 rounded-xl border text-left text-xs transition-colors ${
                        role === 'student'
                          ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <div className="font-bold">Student</div>
                      <div className="text-[11px] text-slate-500">Grades 9 to 14</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('parent')}
                      className={`p-3 rounded-xl border text-left text-xs transition-colors ${
                        role === 'parent'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-semibold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      <div className="font-bold">Parent / Guardian</div>
                      <div className="text-[11px] text-slate-500">Monitor child progress</div>
                    </button>
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={role === 'student' ? 'e.g. Kelvin Otieno' : 'e.g. Grace Otieno'}
                    className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0712345678"
                    className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                {/* Student specific fields */}
                {role === 'student' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        High School Grade Level *
                      </label>
                      <select
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                      >
                        <option value="Grade 9">Grade 9 (Junior Secondary / Form 1 Transition)</option>
                        <option value="Grade 10">Grade 10 (Secondary Level / Form 2)</option>
                        <option value="Grade 11">Grade 11 (Senior Secondary / Form 3)</option>
                        <option value="Grade 12">Grade 12 (Candidate Year / Form 4)</option>
                        <option value="Grade 13">Grade 13 (AS Level / Advanced Level Year 1)</option>
                        <option value="Grade 14">Grade 14 (A2 Level / University Entrance)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Select Subjects to Enroll:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {defaultSubjectOptions.map(subj => {
                          const isSelected = selectedSubjects.includes(subj);
                          return (
                            <button
                              type="button"
                              key={subj}
                              onClick={() => handleSubjectToggle(subj)}
                              className={`p-2 rounded-lg border text-left flex items-center justify-between transition-colors ${
                                isSelected
                                  ? 'border-blue-600 bg-blue-50 text-blue-900 font-semibold'
                                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <span>{subj}</span>
                              <span className={`w-4 h-4 rounded text-[10px] flex items-center justify-center font-bold ${
                                isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300'
                              }`}>
                                {isSelected ? '✓' : ''}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Tuition includes all selected subjects under the flat standard KSh 699/week fee.
                      </p>
                    </div>
                  </>
                )}

                {/* Parent specific fields */}
                {role === 'parent' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Relationship to Student *
                    </label>
                    <select
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value)}
                      className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                    >
                      <option value="Mother">Mother</option>
                      <option value="Father">Father</option>
                      <option value="Legal Guardian">Legal Guardian</option>
                      <option value="Sponsor">Academic Sponsor</option>
                    </select>
                  </div>
                )}
              </>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              {mode === 'login' && (
                <p className="text-[11px] text-slate-500 mt-1">
                  Tip: Use <strong className="text-slate-700">faith.wanjiru@example.com</strong> (Student), <strong className="text-slate-700">mary.wanjiru@example.com</strong> (Parent), or <strong className="text-slate-700">danielowino233@gmail.com</strong> (Admin).
                </p>
              )}
            </div>

            {mode === 'register' && (
              <div className="text-[11px] text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                By registering, you agree to Holiday Tuition Hub's academic conduct policy and privacy guidelines. M-Pesa tuition fee payments (KSh 699/week) are verified manually by Daniel Owino before active lesson access is unlocked.
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold rounded-lg text-sm transition-colors shadow-xs"
            >
              {loading ? 'Processing...' : mode === 'login' ? 'Sign In to Portal' : 'Complete Registration'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
