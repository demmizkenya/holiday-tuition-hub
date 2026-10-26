/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserAccount, PlatformSettings, GradeItem, SubjectItem, Announcement, LearningResource } from './types';
import { api } from './services/api';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { AuthModal } from './components/AuthModal';

import { HomeView } from './views/HomeView';
import { AboutView } from './views/AboutView';
import { GradesView } from './views/GradesView';
import { SubjectsView } from './views/SubjectsView';
import { ProgramView } from './views/ProgramView';
import { PricingView } from './views/PricingView';
import { EnrollmentView } from './views/EnrollmentView';
import { ResourcesView } from './views/ResourcesView';
import { ContactView } from './views/ContactView';
import { FaqView } from './views/FaqView';

import { DiscussionView } from './views/DiscussionView';
import { TeachersView } from './views/TeachersView';
import { GalleryView } from './views/GalleryView';

import { StudentDashboard } from './views/StudentDashboard';
import { ParentDashboard } from './views/ParentDashboard';
import { AdminDashboard } from './views/AdminDashboard';
import { AdminLoginView } from './views/AdminLoginView';

export default function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const [settings, setSettings] = useState<PlatformSettings | undefined>(undefined);
  const [grades, setGrades] = useState<GradeItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync route from URL path or hash (supporting /admin/login, /admin, #admin/login, #admin)
  useEffect(() => {
    const handleUrlRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === '/admin/login' || path === '/admin' || hash === '#admin/login' || hash === '#admin') {
        setCurrentView('admin-login');
      }
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    window.addEventListener('hashchange', handleUrlRoute);
    return () => {
      window.removeEventListener('popstate', handleUrlRoute);
      window.removeEventListener('hashchange', handleUrlRoute);
    };
  }, []);

  // Load public data on mount & verify admin session
  useEffect(() => {
    async function init() {
      try {
        const [data, session] = await Promise.all([
          api.getPublicData(),
          api.verifyAdminSession().catch(() => null)
        ]);

        if (data) {
          setSettings(data.settings);
          setGrades(data.grades);
          setSubjects(data.subjects);
          setAnnouncements(data.announcements);
          if (data.resources) {
            setResources(data.resources);
          }
        }

        if (session && session.success && session.user) {
          setCurrentUser(session.user);
        }
      } catch (err) {
        console.error('Failed to load initial platform data:', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setCurrentView('admin-dashboard');
      if (window.location.pathname.startsWith('/admin')) {
        window.history.replaceState({}, '', '/admin');
      }
    } else if (user.role === 'parent') {
      setCurrentView('parent-dashboard');
    } else {
      setCurrentView('student-dashboard');
    }
  };

  const handleLogout = async () => {
    if (currentUser?.role === 'admin') {
      try {
        await api.adminLogout();
      } catch (e) {
        // ignore
      }
    }
    setCurrentUser(null);
    if (['student-dashboard', 'parent-dashboard', 'admin-dashboard', 'admin-login'].includes(currentView)) {
      if (window.location.pathname.startsWith('/admin')) {
        window.history.pushState({}, '', '/');
      }
      setCurrentView('home');
    }
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    if (view === 'admin-login') {
      window.history.pushState({}, '', '/admin/login');
    } else if (view === 'home' && window.location.pathname.startsWith('/admin')) {
      window.history.pushState({}, '', '/');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800 font-sans selection:bg-blue-600 selection:text-white">
      {/* Official Header (Portal Switcher removed per user specification) */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onOpenAuthModal={handleOpenAuth}
        onLogout={handleLogout}
        brandName={settings?.brandName || 'HOLIDAY TUITION HUB'}
        enrollmentState={settings?.enrollmentState || 'Enrollment open'}
      />

      {/* Main Body Views */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomeView
            settings={settings}
            grades={grades}
            subjects={subjects}
            onNavigate={handleNavigate}
            onOpenAuthModal={handleOpenAuth}
          />
        )}

        {currentView === 'about' && (
          <AboutView
            settings={settings}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'grades' && (
          <GradesView
            grades={grades}
            subjects={subjects}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'subjects' && (
          <SubjectsView
            subjects={subjects}
            settings={settings}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'program' && (
          <ProgramView
            settings={settings}
            grades={grades}
            subjects={subjects}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'pricing' && (
          <PricingView
            settings={settings}
            onNavigate={handleNavigate}
            onOpenAuthModal={handleOpenAuth}
          />
        )}

        {currentView === 'enroll' && (
          <EnrollmentView
            settings={settings}
            grades={grades}
            subjects={subjects}
            currentUser={currentUser}
            onLoginSuccess={handleLoginSuccess}
            onNavigate={handleNavigate}
          />
        )}

        {/* Group Discussion View */}
        {(currentView === 'discussions' || currentView === 'discussion') && (
          <DiscussionView
            currentUser={currentUser}
            onOpenAuthModal={handleOpenAuth}
          />
        )}

        {/* Faculty and Teachers View */}
        {currentView === 'teachers' && (
          <TeachersView
            onOpenEnroll={() => handleNavigate('enroll')}
          />
        )}

        {/* Photo Gallery View */}
        {currentView === 'gallery' && (
          <GalleryView
            onOpenEnroll={() => handleNavigate('enroll')}
          />
        )}

        {currentView === 'resources' && (
          <ResourcesView
            resources={resources}
            currentUser={currentUser}
            onNavigate={handleNavigate}
            onOpenAuthModal={handleOpenAuth}
          />
        )}

        {currentView === 'contact' && (
          <ContactView
            settings={settings}
            currentUser={currentUser}
          />
        )}

        {currentView === 'faq' && (
          <FaqView />
        )}

        {/* Authenticated Portals */}
        {currentView === 'student-dashboard' && (
          currentUser && currentUser.role === 'student' ? (
            <StudentDashboard
              student={currentUser}
              onNavigate={handleNavigate}
            />
          ) : (
            <div className="max-w-md mx-auto my-20 p-8 bg-white border border-slate-200 rounded-3xl text-center space-y-4">
              <h2 className="text-xl font-bold">Student Sign In Required</h2>
              <p className="text-xs text-slate-500">Please sign in with your registered email and password to access your dashboard.</p>
              <button
                onClick={() => handleOpenAuth('login')}
                className="px-6 py-2.5 bg-blue-700 text-white font-bold text-xs rounded-xl"
              >
                Sign In
              </button>
            </div>
          )
        )}

        {currentView === 'parent-dashboard' && (
          currentUser && currentUser.role === 'parent' ? (
            <ParentDashboard
              parent={currentUser}
              onNavigate={handleNavigate}
            />
          ) : (
            <div className="max-w-md mx-auto my-20 p-8 bg-white border border-slate-200 rounded-3xl text-center space-y-4">
              <h2 className="text-xl font-bold">Parent Sign In Required</h2>
              <p className="text-xs text-slate-500">Please sign in as a parent/guardian to monitor your student's progress.</p>
              <button
                onClick={() => handleOpenAuth('login')}
                className="px-6 py-2.5 bg-emerald-700 text-white font-bold text-xs rounded-xl"
              >
                Sign In as Parent
              </button>
            </div>
          )
        )}

        {currentView === 'admin-login' && (
          currentUser && currentUser.role === 'admin' ? (
            <AdminDashboard
              admin={currentUser}
              onNavigate={handleNavigate}
              onSettingsUpdate={(newSettings) => setSettings(newSettings)}
            />
          ) : (
            <AdminLoginView
              onLoginSuccess={handleLoginSuccess}
              onNavigateHome={() => handleNavigate('home')}
            />
          )
        )}

        {currentView === 'admin-dashboard' && (
          currentUser && currentUser.role === 'admin' ? (
            <AdminDashboard
              admin={currentUser}
              onNavigate={handleNavigate}
              onSettingsUpdate={(newSettings) => setSettings(newSettings)}
            />
          ) : (
            <AdminLoginView
              onLoginSuccess={handleLoginSuccess}
              onNavigateHome={() => handleNavigate('home')}
            />
          )
        )}
      </main>

      {/* Official Footer */}
      <Footer
        onNavigate={handleNavigate}
        settings={settings}
      />

      {/* Official Floating WhatsApp Button (Directed to 0708083643) */}
      <FloatingWhatsApp
        whatsappNumber={settings?.whatsappNumber || '0708083643'}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authModalMode}
        onLoginSuccess={handleLoginSuccess}
        availableSubjects={subjects}
      />
    </div>
  );
}
