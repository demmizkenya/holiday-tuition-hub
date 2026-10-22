import React from 'react';
import { PlatformSettings } from '../types';
import { ShieldCheck, Phone, Mail, Clock, Calendar } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
  settings?: PlatformSettings;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, settings }) => {
  const brandName = settings?.brandName || 'HOLIDAY TUITION HUB';
  const tutorName = settings?.tutorName || 'Daniel Owino';
  const mpesaNumber = settings?.mpesaNumber || '0116654805';
  const whatsappNumber = settings?.whatsappNumber || '0708083643';
  const commencement = settings?.commencementDate || '2026-11-01';
  const endDate = settings?.endDate || '2026-11-22';

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Column 1: Brand & Tutor */}
          <div className="space-y-4">
            <h3 className="text-xl font-extrabold text-white tracking-tight uppercase font-sans">
              {brandName}
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Structured holiday online tutoring and academic mentorship for high school students in Grades 9 through 14 across Kenya.
            </p>
            <div className="pt-2 text-xs text-slate-400 space-y-1">
              <div><strong className="text-slate-200">Founder & Lead Tutor:</strong> {tutorName}</div>
              <div><strong className="text-slate-200">Time Zone:</strong> Africa/Nairobi (EAT, UTC+3)</div>
            </div>
          </div>

          {/* Column 2: Subjects & Grades */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Curriculum & Subjects
            </h4>
            <ul className="text-sm space-y-2 text-slate-400">
              <li><button onClick={() => onNavigate('subjects')} className="hover:text-blue-400 transition-colors">Mathematics</button></li>
              <li><button onClick={() => onNavigate('subjects')} className="hover:text-blue-400 transition-colors">English Language & Literature</button></li>
              <li><button onClick={() => onNavigate('subjects')} className="hover:text-blue-400 transition-colors">Chemistry & Lab Concepts</button></li>
              <li><button onClick={() => onNavigate('subjects')} className="hover:text-blue-400 transition-colors">Kiswahili: Sarufi na Fasihi</button></li>
              <li><button onClick={() => onNavigate('subjects')} className="hover:text-blue-400 transition-colors">Computer Studies & Algorithms</button></li>
            </ul>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('grades')}
                className="text-xs text-blue-400 hover:text-blue-300 font-semibold underline"
              >
                View Grades 9, 10, 11, 12, 13 & 14 →
              </button>
            </div>
          </div>

          {/* Column 3: Program & Payments */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Program & Tuition Fee
            </h4>
            <div className="text-xs bg-slate-800/80 p-3.5 rounded-lg border border-slate-700/60 space-y-2">
              <div className="flex items-center gap-2 text-blue-300 font-semibold">
                <Calendar className="w-3.5 h-3.5" />
                <span>Nov 1 – Nov 22, 2026 (3 Weeks)</span>
              </div>
              <div className="text-slate-300">
                Weekly Tuition Fee: <strong className="text-white font-bold text-sm">KSh 699</strong>
              </div>
              <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-700">
                Payment Method: <strong className="text-slate-200">M-Pesa Send Money</strong>
                <br />
                Recipient: <strong className="text-slate-200">{tutorName}</strong>
                <br />
                M-Pesa Number: <span className="font-mono text-emerald-400 font-bold">{mpesaNumber}</span>
              </div>
            </div>
          </div>

          {/* Column 4: Communication & WhatsApp */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Communication & Inquiries
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              For direct student support and consultation with Daniel Owino:
            </p>
            <div className="space-y-2 text-xs">
              <a
                href={`https://wa.me/254${whatsappNumber.replace(/^0/, '')}?text=Hello%2C%20I%20would%20like%20to%20inquire%20about%20Holiday%20Tuition%20Hub.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-semibold"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Official WhatsApp: {whatsappNumber}
              </a>
              <div className="text-slate-400">
                Email: <span className="text-slate-300">danielowino233@gmail.com</span>
              </div>
              <div className="text-[11px] text-amber-300/80 italic">
                * Note: M-Pesa tuition fee payments are sent strictly to 0116654805.
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            © {new Date().getFullYear()} {brandName}. Owned and tutored by Daniel Owino. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => onNavigate('about')} className="hover:text-slate-300">About Platform</button>
            <button onClick={() => onNavigate('pricing')} className="hover:text-slate-300">Pricing & Verification</button>
            <button onClick={() => onNavigate('faq')} className="hover:text-slate-300">Frequently Asked Questions</button>
            <button onClick={() => onNavigate('contact')} className="hover:text-slate-300">Contact & Support</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
