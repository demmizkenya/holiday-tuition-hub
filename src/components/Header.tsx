import React, { useState } from 'react';
import { UserAccount } from '../types';
import { Menu, X, Shield, BookOpen, User, PhoneCall, ChevronDown } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
  currentUser: UserAccount | null;
  onOpenAuthModal: (mode: 'login' | 'register') => void;
  brandName?: string;
  enrollmentState?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  currentUser,
  onOpenAuthModal,
  brandName = 'HOLIDAY TUITION HUB',
  enrollmentState = 'Enrollment open'
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'grades', label: 'Grades' },
    { id: 'subjects', label: 'Subjects' },
    { id: 'program', label: 'Program' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'resources', label: 'Resources' },
    { id: 'faq', label: 'FAQ' },
    { id: 'contact', label: 'Contact' }
  ];

  const handleNavClick = (viewId: string) => {
    onNavigate(viewId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Typographic Wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavClick('home')}
              className="text-left group focus:outline-none"
            >
              <span className="block font-extrabold text-xl sm:text-2xl tracking-tight text-blue-900 uppercase font-sans">
                {brandName}
              </span>
              <span className="block text-xs font-semibold tracking-wider text-slate-500 uppercase">
                Online Tutoring & Mentorship • Grades 9–14
              </span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-medium text-slate-700">
            {navLinks.map(link => {
              const isActive = currentView === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-3 py-2 rounded-md transition-colors ${
                    isActive
                      ? 'text-blue-700 font-bold bg-blue-50'
                      : 'hover:text-blue-700 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Action CTAs & Auth */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2">
                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => handleNavClick('admin-dashboard')}
                    className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg border transition-colors ${
                      currentView === 'admin-dashboard'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5 text-amber-600" />
                    Admin Panel
                  </button>
                )}

                {currentUser.role === 'student' && (
                  <button
                    onClick={() => handleNavClick('student-dashboard')}
                    className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg border transition-colors ${
                      currentView === 'student-dashboard'
                        ? 'bg-blue-700 text-white border-blue-700'
                        : 'bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    Student Dashboard
                  </button>
                )}

                {currentUser.role === 'parent' && (
                  <button
                    onClick={() => handleNavClick('parent-dashboard')}
                    className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg border transition-colors ${
                      currentView === 'parent-dashboard'
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                    }`}
                  >
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    Parent Portal
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuthModal('login')}
                  className="px-3 py-2 text-sm font-semibold text-slate-700 hover:text-blue-700 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavClick('enroll')}
                  className="px-4 py-2 text-sm font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-lg shadow-xs transition-colors"
                >
                  Enroll Now
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => handleNavClick('enroll')}
              className="px-3 py-1.5 text-xs font-bold bg-blue-700 text-white rounded-md"
            >
              Enroll
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2 shadow-xl">
          <div className="grid grid-cols-2 gap-2 pt-2 pb-3 border-b border-slate-100">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`text-left px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === link.id
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="pt-2 space-y-2">
            {currentUser ? (
              <>
                <div className="px-3 py-2 bg-slate-50 rounded-md text-xs text-slate-600">
                  Signed in as <strong>{currentUser.name}</strong> ({currentUser.role})
                </div>
                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => handleNavClick('admin-dashboard')}
                    className="w-full text-left px-3 py-2 bg-slate-900 text-white rounded-md font-bold text-sm"
                  >
                    Open Admin Panel (Daniel Owino)
                  </button>
                )}
                {currentUser.role === 'student' && (
                  <button
                    onClick={() => handleNavClick('student-dashboard')}
                    className="w-full text-left px-3 py-2 bg-blue-700 text-white rounded-md font-bold text-sm"
                  >
                    Open Student Dashboard
                  </button>
                )}
                {currentUser.role === 'parent' && (
                  <button
                    onClick={() => handleNavClick('parent-dashboard')}
                    className="w-full text-left px-3 py-2 bg-emerald-700 text-white rounded-md font-bold text-sm"
                  >
                    Open Parent / Guardian Portal
                  </button>
                )}
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuthModal('login');
                  }}
                  className="w-full py-2.5 text-center text-sm font-semibold border border-slate-300 rounded-md text-slate-800"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavClick('enroll')}
                  className="w-full py-2.5 text-center text-sm font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-md"
                >
                  Enroll Now — KSh 699/wk
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
