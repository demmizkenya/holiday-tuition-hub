import React from 'react';
import { UserAccount } from '../types';
import { ShieldCheck, User, Users, LogOut } from 'lucide-react';

interface DemoSwitcherProps {
  currentUser: UserAccount | null;
  onSwitchUser: (user: UserAccount | null) => void;
  onOpenAuthModal: (mode: 'login' | 'register') => void;
}

export const DemoSwitcher: React.FC<DemoSwitcherProps> = ({
  currentUser,
  onSwitchUser,
  onOpenAuthModal
}) => {
  const demoAccounts: { label: string; role: string; email: string; user: Partial<UserAccount> }[] = [
    {
      label: 'Daniel Owino',
      role: 'Administrator / Tutor',
      email: 'danielowino233@gmail.com',
      user: {
        id: 'usr-admin-daniel',
        name: 'Daniel Owino',
        email: 'danielowino233@gmail.com',
        phone: '0116654805',
        role: 'admin',
        accountStatus: 'Enrolled',
        createdAt: '2026-10-01T08:00:00Z'
      }
    },
    {
      label: 'Faith Wanjiru',
      role: 'Student (Grade 11)',
      email: 'faith.wanjiru@example.com',
      user: {
        id: 'usr-student-faith',
        name: 'Faith Wanjiru',
        email: 'faith.wanjiru@example.com',
        phone: '0712345678',
        role: 'student',
        grade: 'Grade 11',
        selectedSubjects: ['Mathematics', 'Chemistry', 'Computer Studies'],
        accountStatus: 'Enrolled',
        createdAt: '2026-10-15T09:30:00Z'
      }
    },
    {
      label: 'Mary Wanjiru',
      role: 'Parent (Mother)',
      email: 'mary.wanjiru@example.com',
      user: {
        id: 'usr-parent-mary',
        name: 'Mary Wanjiru',
        email: 'mary.wanjiru@example.com',
        phone: '0722123456',
        role: 'parent',
        relationship: 'Mother',
        accountStatus: 'Enrolled',
        createdAt: '2026-10-16T10:00:00Z'
      }
    }
  ];

  return (
    <div className="bg-slate-900 text-slate-200 text-xs py-1.5 px-4 border-b border-slate-800 print:hidden">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300 uppercase tracking-wider text-[10px]">Portal Switcher:</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {demoAccounts.map(account => {
              const isActive = currentUser?.email.toLowerCase() === account.email.toLowerCase();
              return (
                <button
                  key={account.email}
                  onClick={() => onSwitchUser(account.user as UserAccount)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors flex items-center gap-1 ${
                    isActive
                      ? 'bg-blue-600 text-white font-medium'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                  title={`Switch to ${account.label} (${account.role})`}
                >
                  {account.role.includes('Admin') && <ShieldCheck className="w-3 h-3 text-amber-400" />}
                  {account.role.includes('Student') && <User className="w-3 h-3 text-blue-300" />}
                  {account.role.includes('Parent') && <Users className="w-3 h-3 text-emerald-400" />}
                  <span>{account.label}</span>
                  <span className="text-[10px] opacity-75">({account.role.split(' ')[0]})</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className="text-slate-400">
                Active as <strong className="text-white">{currentUser.name}</strong> ({currentUser.role})
              </span>
              <button
                onClick={() => onSwitchUser(null)}
                className="hover:text-red-400 flex items-center gap-1 text-slate-400 underline underline-offset-2"
                title="Sign out to Public Guest"
              >
                <LogOut className="w-3 h-3" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Viewing as Public Guest</span>
              <button
                onClick={() => onOpenAuthModal('login')}
                className="text-blue-400 hover:text-blue-300 underline font-medium"
              >
                Sign In
              </button>
              <span className="text-slate-600">•</span>
              <button
                onClick={() => onOpenAuthModal('register')}
                className="text-amber-400 hover:text-amber-300 underline font-medium"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
