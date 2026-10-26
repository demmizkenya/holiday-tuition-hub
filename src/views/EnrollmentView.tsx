import React, { useState } from 'react';
import { PlatformSettings, GradeItem, SubjectItem, UserAccount } from '../types';
import { api } from '../services/api';
import { CheckCircle, AlertCircle, Calendar, Shield, Copy, Check, ArrowRight } from 'lucide-react';

interface EnrollmentViewProps {
  settings?: PlatformSettings;
  grades: GradeItem[];
  subjects: SubjectItem[];
  currentUser: UserAccount | null;
  onLoginSuccess: (user: UserAccount) => void;
  onNavigate: (view: string) => void;
}

export const EnrollmentView: React.FC<EnrollmentViewProps> = ({
  settings,
  grades,
  subjects,
  currentUser,
  onLoginSuccess,
  onNavigate
}) => {
  const [step, setStep] = useState<number>(currentUser ? 3 : 1);
  const [selectedGrade, setSelectedGrade] = useState<string>(currentUser?.grade || 'Grade 11');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    currentUser?.selectedSubjects || ['Mathematics', 'Chemistry', 'Computer Studies']
  );

  // New registration fields (if not logged in)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [registerError, setRegisterError] = useState('');

  // Payment form fields
  const [mpesaCode, setMpesaCode] = useState('');
  const [payingPhone, setPayingPhone] = useState(currentUser?.phone || '');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentNote, setPaymentNote] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const [copied, setCopied] = useState(false);

  const weeklyPrice = settings?.weeklyPrice || 699;
  const tutorName = settings?.tutorName || 'Daniel Owino';
  const mpesaNumber = settings?.mpesaNumber || '0116654805';

  const handleCopyMpesa = () => {
    navigator.clipboard.writeText(mpesaNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSubject = (name: string) => {
    if (selectedSubjects.includes(name)) {
      if (selectedSubjects.length === 1) return;
      setSelectedSubjects(selectedSubjects.filter(s => s !== name));
    } else {
      setSelectedSubjects([...selectedSubjects, name]);
    }
  };

  const handleRegisterStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');

    if (!fullName.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setRegisterError('Please fill in all required registration details including password.');
      return;
    }

    if (password.trim().length < 4) {
      setRegisterError('Password must be at least 4 characters long.');
      return;
    }

    try {
      const res = await api.register({
        name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password: password.trim(),
        role: 'student',
        grade: selectedGrade,
        selectedSubjects
      });

      if (res.success && res.user) {
        localStorage.setItem('hth_saved_email', email.trim());
        onLoginSuccess(res.user);
        setPayingPhone(res.user.phone);
        setStep(3); // proceed to payment review
      } else {
        setRegisterError(res.message || 'Registration failed.');
      }
    } catch (err: any) {
      setRegisterError(err.message || 'An error occurred during registration.');
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setPaymentError('');
    setPaymentLoading(true);

    try {
      const res = await api.submitPayment({
        studentId: currentUser.id,
        mpesaCode: mpesaCode.trim().toUpperCase(),
        amountPaid: weeklyPrice,
        transactionDate,
        payingPhoneNumber: payingPhone.trim(),
        packageType: `Standard Weekly Tuition (${selectedGrade})`,
        note: paymentNote.trim() || `Subjects: ${selectedSubjects.join(', ')}`
      });

      if (res.success) {
        setPaymentSuccess(true);
      } else {
        setPaymentError(res.message || 'Failed to submit payment verification request.');
      }
    } catch (err: any) {
      setPaymentError(err.message || 'Error communicating with server.');
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 inline-block px-3 py-1 rounded-full border border-blue-200">
          Enrollment Portal
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 font-sans">
          Enroll in Holiday Tuition Hub
        </h1>
        <p className="text-slate-600 text-sm max-w-2xl mx-auto leading-relaxed">
          Follow the steps below to select your grade, choose your subjects, and submit your M-Pesa tuition fee for verification by Daniel Owino.
        </p>
      </div>

      {/* Progress Stepper */}
      <div className="grid grid-cols-3 gap-2 border-b border-slate-200 pb-4 text-xs font-bold text-center">
        <div className={`py-2 border-b-2 transition-colors ${step >= 1 ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-400'}`}>
          1. Grade & Subjects
        </div>
        <div className={`py-2 border-b-2 transition-colors ${step >= 2 ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-400'}`}>
          2. Student Account
        </div>
        <div className={`py-2 border-b-2 transition-colors ${step >= 3 ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-400'}`}>
          3. M-Pesa Verification
        </div>
      </div>

      {/* Step 1: Grade & Subject Selection */}
      {step === 1 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-sans">
              Select Your High School Grade
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Choose your current level between Grades 9 and 14.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
              {grades.map(g => (
                <button
                  type="button"
                  key={g.id}
                  onClick={() => setSelectedGrade(g.name)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    selectedGrade === g.name
                      ? 'border-blue-700 bg-blue-50 text-blue-900 font-bold shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                  }`}
                >
                  <div className="text-sm font-bold">{g.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{g.level}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 font-sans">
              Select Your Tutoring Subjects
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              All selected subjects are included under the flat standard KSh {weeklyPrice}/week tuition fee.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {subjects.map(s => {
                const isSelected = selectedSubjects.includes(s.name);
                return (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => handleToggleSubject(s.name)}
                    className={`p-4 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'border-blue-700 bg-blue-50/70 text-blue-900 font-semibold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-slate-900">{s.name}</div>
                      <div className="text-[11px] text-slate-500">{s.topics.length} topics • Live & Recorded</div>
                    </div>
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold ${
                      isSelected ? 'bg-blue-700 text-white' : 'border border-slate-300 text-transparent'
                    }`}>
                      ✓
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={() => setStep(currentUser ? 3 : 2)}
              className="px-8 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-sm transition-colors shadow-xs flex items-center gap-2"
            >
              <span>Continue to Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Student Account Registration */}
      {step === 2 && !currentUser && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900 font-sans">
              Create Student Account
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Your account allows you to book lesson times, join live video classes, and download learning materials.
            </p>
          </div>

          {registerError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{registerError}</span>
            </div>
          )}

          <form onSubmit={handleRegisterStudent} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student Full Legal Name *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Kelvin Otieno"
                className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student Mobile Phone Number *
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Account Password *
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password (min 4 characters)"
                className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Saved permanently so you can sign in anytime with this email and password.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
              Selected Enrollment: <strong>{selectedGrade}</strong> • Subjects: <strong>{selectedSubjects.join(', ')}</strong>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                ← Back
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-sm transition-colors shadow-xs"
              >
                Register & Proceed to Payment →
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 3: M-Pesa Send Money & Verification Submission */}
      {step === 3 && currentUser && (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-8">
          {paymentSuccess ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 font-sans">
                Payment Verification Queued!
              </h2>
              <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                Thank you, <strong>{currentUser.name}</strong>. Your M-Pesa transaction code <strong>{mpesaCode.toUpperCase()}</strong> for <strong>KSh {weeklyPrice}</strong> has been saved in the verification queue. Daniel Owino will verify your payment against official M-Pesa records and activate your 7-day subscription.
              </p>
              <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={() => onNavigate('student-dashboard')}
                  className="px-8 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-sm transition-colors shadow-xs"
                >
                  Go to Student Dashboard →
                </button>
                <button
                  onClick={() => onNavigate('home')}
                  className="px-6 py-3 border border-slate-300 text-slate-700 font-semibold rounded-xl text-sm hover:bg-slate-50 transition-colors"
                >
                  Return to Homepage
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Payment Instructions Header */}
              <div className="border-b border-slate-100 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Step 3 of 3: M-Pesa Send Money
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 font-sans mt-1">
                    Send KSh {weeklyPrice} via M-Pesa
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Student: <strong>{currentUser.name}</strong> ({selectedGrade})
                  </p>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl flex items-center gap-3">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-emerald-800">M-Pesa Number</div>
                    <div className="text-base font-mono font-extrabold text-emerald-950">{mpesaNumber}</div>
                    <div className="text-[11px] text-emerald-700">{tutorName}</div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyMpesa}
                    className="p-2 bg-white text-emerald-800 rounded-lg border border-emerald-200 text-xs font-bold shadow-xs hover:bg-emerald-100 transition-colors"
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* 4 Quick Steps Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1.5">
                <div className="font-bold text-slate-800">Quick Payment Guide:</div>
                <div>1. Go to M-Pesa &gt; <strong>Send Money</strong>.</div>
                <div>2. Enter Phone Number: <strong className="font-mono text-emerald-800">{mpesaNumber}</strong> (Daniel Owino).</div>
                <div>3. Enter Amount: <strong>KSh {weeklyPrice}</strong> and confirm with your PIN.</div>
                <div>4. Copy the confirmation code from Safaricom SMS and enter it below.</div>
              </div>

              {/* Submission Form */}
              {paymentError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{paymentError}</span>
                </div>
              )}

              <form onSubmit={handleSubmitPayment} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      M-Pesa Transaction Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={mpesaCode}
                      onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
                      placeholder="e.g. QX8923KJ9L"
                      maxLength={12}
                      className="w-full text-sm font-mono tracking-wider px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number Used to Pay *
                    </label>
                    <input
                      type="tel"
                      required
                      value={payingPhone}
                      onChange={(e) => setPayingPhone(e.target.value)}
                      placeholder="e.g. 0712345678"
                      className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Transaction Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={transactionDate}
                      onChange={(e) => setTransactionDate(e.target.value)}
                      className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Amount Paid (KSh) *
                    </label>
                    <input
                      type="number"
                      disabled
                      value={weeklyPrice}
                      className="w-full text-sm font-bold px-3.5 py-2.5 border border-slate-200 bg-slate-100 rounded-lg text-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Optional Note to Daniel Owino:
                  </label>
                  <input
                    type="text"
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    placeholder="e.g. Week 1 tuition for Math & Chemistry"
                    className="w-full text-sm px-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-[11px] rounded-lg">
                  Notice: Submitting a code saves your transaction for verification by Daniel Owino. Access unlocks immediately upon verification.
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900"
                  >
                    ← Change Grade or Subjects
                  </button>
                  <button
                    type="submit"
                    disabled={paymentLoading}
                    className="px-8 py-3.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors shadow-xs"
                  >
                    {paymentLoading ? 'Submitting...' : 'Submit Payment for Verification'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
};
