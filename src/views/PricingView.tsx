import React, { useState } from 'react';
import { PlatformSettings } from '../types';
import { CheckCircle, Shield, Copy, Check, AlertCircle, Phone, ArrowRight } from 'lucide-react';

interface PricingViewProps {
  settings?: PlatformSettings;
  onNavigate: (view: string) => void;
  onOpenAuthModal: (mode: 'login' | 'register') => void;
}

export const PricingView: React.FC<PricingViewProps> = ({
  settings,
  onNavigate,
  onOpenAuthModal
}) => {
  const [copied, setCopied] = useState(false);
  const weeklyPrice = settings?.weeklyPrice || 699;
  const tutorName = settings?.tutorName || 'Daniel Owino';
  const mpesaNumber = settings?.mpesaNumber || '0116654805';
  const allowFourWeek = settings?.allowFourWeek || false;

  const handleCopyMpesa = () => {
    navigator.clipboard.writeText(mpesaNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 inline-block px-3 py-1 rounded-full border border-blue-200">
          Transparent Tuition
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-sans">
          Simple, Affordable Weekly Pricing
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          High-quality online education should be accessible and straightforward. We offer a transparent weekly tuition fee with no hidden costs, contracts, or silent rebilling.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
        {/* Primary Standard Weekly Card */}
        <div className="bg-white rounded-3xl border-2 border-blue-600 p-8 shadow-lg flex flex-col justify-between relative">
          <div className="absolute -top-3.5 left-8 bg-blue-700 text-white text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs">
            Official Standard Rate
          </div>

          <div className="space-y-6 pt-2">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Weekly Tuition
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl font-extrabold text-slate-900">KSh {weeklyPrice}</span>
                <span className="text-sm font-semibold text-slate-500">/ 7 days</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Full 7-day academic access across all your enrolled subjects.
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                What is included:
              </div>
              <ul className="text-xs space-y-2.5 text-slate-700">
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Interactive live lessons with student-selectable booking</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Mathematics, English, Chemistry, Kiswahili & Computer Studies</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>24/7 access to recorded lesson library & whiteboard replays</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Downloadable revision booklets, notes & worksheets (PDF)</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Timed practice tests with automated scoring & feedback</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Parent/Guardian monitoring portal & tutor progress reports</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 mt-6 border-t border-slate-100">
            <button
              onClick={() => onNavigate('enroll')}
              className="w-full py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl text-sm transition-colors shadow-xs"
            >
              Enroll for KSh {weeklyPrice} / Week →
            </button>
            <div className="text-center text-[11px] text-slate-400 mt-2">
              Renew weekly on demand via M-Pesa. No automatic debits.
            </div>
          </div>
        </div>

        {/* 4-Week Package Information Card */}
        <div className="bg-slate-50 rounded-3xl border border-slate-200 p-8 flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Extended Subscription Notice
              </div>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-extrabold text-slate-800">
                  {allowFourWeek ? 'KSh 2,796' : 'Weekly by Default'}
                </span>
                {allowFourWeek && <span className="text-sm font-semibold text-slate-500">/ 4 weeks</span>}
              </div>
              <p className="text-xs text-slate-600 mt-2">
                {allowFourWeek
                  ? 'Four-week subscription package enabled by administrator.'
                  : 'Because the initial holiday program spans 3 weeks (1 Nov to 22 Nov 2026), the standard option is KSh 699 weekly. Multi-week bundles are configured explicitly by the administrator.'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-3">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-blue-700" />
                Our Fair Payment Guarantee
              </div>
              <p className="leading-relaxed">
                We never automatically renew subscriptions or claim future payments have been received. When your 7-day period expires, paid lesson links and recorded materials pause until you choose to submit a renewal payment.
              </p>
              <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-100">
                Your past assessment results, submissions, and attendance records are always preserved permanently.
              </div>
            </div>
          </div>

          <div className="pt-8 mt-6 border-t border-slate-200">
            <button
              onClick={() => onNavigate('contact')}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-sm transition-colors"
            >
              Have a Payment Question? Contact Us
            </button>
            <div className="text-center text-[11px] text-slate-500 mt-2">
              WhatsApp Tutor Daniel Owino: 0708083643
            </div>
          </div>
        </div>
      </div>

      {/* Official M-Pesa Send Money Instructions */}
      <section className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-xs max-w-4xl mx-auto space-y-8">
        <div className="border-b border-slate-100 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 inline-block px-3 py-1 rounded-full border border-emerald-200">
              Official Payment Instructions
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 font-sans mt-2">
              How to Pay with M-Pesa Send Money
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Method: <strong>M-Pesa Send Money</strong> (Do not use Paybill or Till numbers)
            </p>
          </div>

          {/* Copyable M-Pesa Box */}
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center gap-4">
            <div>
              <div className="text-[10px] uppercase font-bold text-emerald-800">M-Pesa Recipient Number</div>
              <div className="text-lg font-mono font-extrabold text-emerald-950">{mpesaNumber}</div>
              <div className="text-[11px] text-emerald-700 font-semibold">{tutorName}</div>
            </div>
            <button
              onClick={handleCopyMpesa}
              className="p-2.5 bg-white hover:bg-emerald-100 text-emerald-800 rounded-xl border border-emerald-200 shadow-xs transition-colors flex items-center gap-1 text-xs font-bold"
              title="Copy M-Pesa Number"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* 8 Step Instructions */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Step-by-Step Payment Instructions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center shrink-0 text-xs">1</span>
              <span>Open the <strong>Safaricom SIM Toolkit</strong> or <strong>M-Pesa App</strong> on your phone.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center shrink-0 text-xs">2</span>
              <span>Select <strong>Send Money</strong>.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center shrink-0 text-xs">3</span>
              <span>Enter Phone Number: <strong className="font-mono text-emerald-800">{mpesaNumber}</strong>.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center shrink-0 text-xs">4</span>
              <span>Enter Amount: <strong>KSh {weeklyPrice}</strong> (or authorized fee).</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center shrink-0 text-xs">5</span>
              <span>Enter your secret <strong>M-Pesa PIN</strong> and press Send.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center shrink-0 text-xs">6</span>
              <span>Confirm the recipient name matches <strong className="text-blue-900">{tutorName}</strong>.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center shrink-0 text-xs">7</span>
              <span>Wait for the official Safaricom confirmation SMS containing your unique 10-character transaction code (e.g. <em>QX8923KJ9L</em>).</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-blue-700 text-white font-bold flex items-center justify-center shrink-0 text-xs">8</span>
              <span>Return to Holiday Tuition Hub and submit your code under <strong>Payments</strong> for Daniel Owino to verify.</span>
            </div>
          </div>
        </div>

        {/* Security / Verification Rules Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-xs text-amber-900 space-y-2">
          <div className="font-bold flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
            Important Payment Verification & Security Policy
          </div>
          <p className="leading-relaxed">
            Holiday Tuition Hub protects students and parents by using verified administrative accounting. Simply entering a transaction code does <em>not</em> automatically activate access. Every submission is checked against actual M-Pesa receipts by Daniel Owino before active access is granted. Submissions are typically reviewed within 15 to 30 minutes.
          </p>
          <div className="font-semibold text-amber-800 pt-1">
            Never share your M-Pesa PIN with anyone. We will never ask for your PIN.
          </div>
        </div>
      </section>
    </div>
  );
};
