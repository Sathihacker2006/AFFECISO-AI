import React from 'react';
import { Shield, Sparkles, UserCheck, LogOut, Lock, MessageSquare, AlertTriangle, FileText, Bot, User as UserIcon } from 'lucide-react';
import { User } from '../types/index.ts';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onQuickJudgeLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  onOpenAuth,
  onLogout,
  onQuickJudgeLogin,
}) => {
  const navItems = [
    { id: 'landing', label: 'Overview', icon: Shield },
    { id: 'dashboard', label: 'Command Center', icon: Sparkles },
    { id: 'analyzer', label: 'TrustScan AI', icon: MessageSquare },
    { id: 'profile', label: 'Profile Insights', icon: UserCheck },
    { id: 'companion', label: 'Safety Companion', icon: Bot },
    { id: 'privacy', label: 'Privacy Guardian', icon: Lock },
    { id: 'reports', label: 'Report & Safety', icon: AlertTriangle },
  ];

  if (currentUser?.role === 'admin') {
    navItems.push({ id: 'admin', label: 'Admin Radar', icon: FileText });
  }

  return (
    <header className="sticky top-0 z-50 bg-[#070b14]/90 backdrop-blur-xl border-b border-cyan-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <div
          onClick={() => setCurrentTab('landing')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-[1.5px] shadow-[0_0_20px_rgba(0,242,254,0.3)]">
            <div className="w-full h-full bg-[#070b14] rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold tracking-wider text-base bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
                AFFECIO
              </span>
              <span className="text-xs px-1.5 py-0.5 rounded font-mono font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                TRUSTAI
              </span>
            </div>
            <p className="text-[10px] text-gray-400 hidden sm:block tracking-wide">
              Trust Before Connection
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-400/40 shadow-[0_0_12px_rgba(0,242,254,0.15)]'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-gray-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User / Demo Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {currentUser ? (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 bg-[#0b132b] border border-cyan-500/30 px-3 py-1.5 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-400 to-purple-500 flex items-center justify-center text-[10px] font-bold text-black">
                  {currentUser.displayName.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-medium text-white truncate max-w-[110px]">
                    {currentUser.displayName}
                  </div>
                  <div className="text-[10px] text-cyan-400 font-mono">
                    {currentUser.role === 'admin' ? '🛡️ Admin' : '✓ Verified'}
                  </div>
                </div>
              </div>

              <button
                onClick={onLogout}
                title="Sign out"
                className="p-2 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 border border-white/5 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              {/* Quick Judge 1-Click Login */}
              <button
                onClick={onQuickJudgeLogin}
                className="hidden sm:flex items-center space-x-1.5 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 text-cyan-300 border border-cyan-400/40 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer shadow-[0_0_15px_rgba(0,242,254,0.15)] transition-all"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Judge Demo Mode</span>
              </button>

              <button
                onClick={onOpenAuth}
                className="flex items-center space-x-1.5 bg-cyan-500 hover:bg-cyan-400 text-[#070b14] font-semibold px-3.5 py-1.5 rounded-xl text-xs transition-all cursor-pointer shadow-[0_0_20px_rgba(0,242,254,0.3)]"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden flex items-center space-x-1 overflow-x-auto px-4 py-2 border-t border-white/5 bg-[#070b14]/95 no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
