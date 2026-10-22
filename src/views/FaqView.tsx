import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

export const FaqView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [openIndices, setOpenIndices] = useState<number[]>([0, 1, 3]);

  const faqs: FaqItem[] = [
    {
      category: 'Registration & Enrollment',
      question: 'Which grade levels does Holiday Tuition Hub support?',
      answer: 'We support high school students in Grades 9, 10, 11, 12, 13, and 14. Each grade features dedicated curriculum pathways, specific learning objectives, and structured examination preparation.'
    },
    {
      category: 'Registration & Enrollment',
      question: 'Which subjects can I study during the holiday?',
      answer: 'Holiday Tuition Hub offers five core subjects: Mathematics, English, Chemistry, Kiswahili, and Computer Studies. Students can choose to study one or multiple subjects under the same weekly tuition.'
    },
    {
      category: 'Pricing & M-Pesa Payments',
      question: 'How much does tuition cost, and how is payment made?',
      answer: 'The standard tuition fee is KSh 699 per week. Payment is made using M-Pesa Send Money directly to tutor Daniel Owino on 0116654805. We do not use Till numbers or Paybills.'
    },
    {
      category: 'Pricing & M-Pesa Payments',
      question: 'Does typing an M-Pesa transaction code instantly activate my subscription?',
      answer: 'No. To prevent fraudulent submissions and protect student records, typing a transaction code puts your payment into "Submitted for verification". Tutor Daniel Owino verifies the code against official M-Pesa statements before active access is granted.'
    },
    {
      category: 'Pricing & M-Pesa Payments',
      question: 'Will my subscription automatically renew or debit my M-Pesa account?',
      answer: 'Never. We never store financial credentials or automatically rebill students. When your 7-day subscription ends, access to paid materials and live links gently pauses until you choose to renew.'
    },
    {
      category: 'Lesson Scheduling',
      question: 'How does lesson scheduling work?',
      answer: 'We provide student-selectable scheduling. Daniel Owino publishes available lesson slots in the Africa/Nairobi time zone. From your student dashboard, you select convenient days and times that fit your holiday study schedule. Double bookings and room over-capacity are strictly prevented.'
    },
    {
      category: 'Learning & Classroom',
      question: 'What if I miss a live tutoring lesson?',
      answer: 'All live lessons are recorded and catalogued in your student portal. You can review full whiteboard recordings, lecture explanations, and download the accompanying notes at any time during your active subscription.'
    },
    {
      category: 'Assessments',
      question: 'How do practice tests and quizzes work?',
      answer: 'Weekly timed practice tests test your understanding of covered topics. Objective questions (such as multiple-choice) are marked automatically by the backend system. Correct answers and step-by-step explanations become visible after you submit.'
    },
    {
      category: 'Parent / Guardian Portal',
      question: 'How do parents and guardians monitor academic progress?',
      answer: 'Parents can create an account and link securely to their children using the child’s registered phone or email. Parents can view live lesson attendance, test scores, verified payment history, and formal academic reports written by Daniel Owino.'
    },
    {
      category: 'Support & Contact',
      question: 'Is the WhatsApp number different from the M-Pesa payment number?',
      answer: 'Yes. The official WhatsApp contact for inquiries and consultation is 0708083643. The M-Pesa Send Money payment recipient number is 0116654805 (Daniel Owino). Please do not send payments to the WhatsApp number.'
    }
  ];

  const categories = ['All', 'Registration & Enrollment', 'Pricing & M-Pesa Payments', 'Lesson Scheduling', 'Learning & Classroom', 'Assessments', 'Parent / Guardian Portal'];

  const filtered = activeCategory === 'All' ? faqs : faqs.filter(f => f.category === activeCategory);

  const toggleIndex = (index: number) => {
    if (openIndices.includes(index)) {
      setOpenIndices(openIndices.filter(i => i !== index));
    } else {
      setOpenIndices([...openIndices, index]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 inline-block px-3 py-1 rounded-full border border-blue-200">
          Knowledge Base
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-sans">
          Frequently Asked Questions
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed max-w-2xl mx-auto">
          Clear, transparent guidance on enrollment, KSh 699 weekly fees, M-Pesa verification, scheduling, and portal access.
        </p>
      </div>

      {/* Category filter chips */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeCategory === cat
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-3">
        {filtered.map((faq, idx) => {
          const isOpen = openIndices.includes(idx);
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs transition-colors"
            >
              <button
                onClick={() => toggleIndex(idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 focus:outline-none"
              >
                <span className="font-bold text-slate-900 text-sm flex items-center gap-2.5">
                  <HelpCircle className="w-4 h-4 text-blue-700 shrink-0" />
                  {faq.question}
                </span>
                {isOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>
              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pl-11">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
