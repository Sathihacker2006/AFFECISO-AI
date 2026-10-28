import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { MessageAnalyzer } from './components/MessageAnalyzer.tsx';
import { ProfileAnalyzer } from './components/ProfileAnalyzer.tsx';
import { SafetyCompanion } from './components/SafetyCompanion.tsx';
import { PrivacyGuardian } from './components/PrivacyGuardian.tsx';
import { ReportCenter } from './components/ReportCenter.tsx';
import { AdminPanel } from './components/AdminPanel.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { authStorage, api } from './services/api.ts';
import { User } from './types/index.ts';
import { Shield, Lock, Heart, ExternalLink } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    // Check local token & load user
    const user = authStorage.getUser();
    if (user) {
      setCurrentUser(user);
      api.getMe().then((res) => {
        if (res.user) {
          setCurrentUser(res.user);
          authStorage.setUser(res.user);
        }
      }).catch(() => {
        // Token expired
        authStorage.clearToken();
        setCurrentUser(null);
      });
    }
  }, []);

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    setCurrentTab('landing');
  };

  const handleQuickJudgeLogin = async () => {
    try {
      const res = await api.login('demo@affecio.safety', 'TrustAi2026!');
      setCurrentUser(res.user);
      setCurrentTab('dashboard');
    } catch (e) {
      setAuthModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Navbar Header */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        currentUser={currentUser}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        onQuickJudgeLogin={handleQuickJudgeLogin}
      />

      {/* Main Content Body */}
      <main className="flex-1">
        {currentTab === 'landing' && (
          <LandingPage
            onNavigate={(tab) => setCurrentTab(tab)}
            onQuickJudgeLogin={handleQuickJudgeLogin}
          />
        )}

        {currentTab === 'dashboard' && (
          <Dashboard
            currentUser={currentUser}
            onNavigate={(tab) => setCurrentTab(tab)}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {currentTab === 'analyzer' && (
          <MessageAnalyzer
            currentUser={currentUser}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileAnalyzer
            currentUser={currentUser}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {currentTab === 'companion' && <SafetyCompanion />}

        {currentTab === 'privacy' && (
          <PrivacyGuardian
            currentUser={currentUser}
            onOpenAuth={() => setAuthModalOpen(true)}
            onLogout={handleLogout}
          />
        )}

        {currentTab === 'reports' && (
          <ReportCenter
            currentUser={currentUser}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {currentTab === 'admin' && (
          <AdminPanel
            currentUser={currentUser}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}
      </main>

      {/* Cyber Footer */}
      <footer className="border-t border-cyan-500/20 bg-[#040810] py-8 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-gray-300">AFFECIO TRUSTAI</span>
            <span>•</span>
            <span>Problem Statement PS04: Safety & Authenticity</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px]">
            <button
              onClick={() => setCurrentTab('privacy')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Privacy Commitment
            </button>
            <button
              onClick={() => setCurrentTab('reports')}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              Offline Safety Protocol
            </button>
            <span className="font-mono text-cyan-400/80 bg-cyan-950/30 px-2 py-0.5 rounded border border-cyan-500/20">
              v1.0.0-PROTOTYPE
            </span>
          </div>
        </div>
      </footer>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(user) => {
          setCurrentUser(user);
          setCurrentTab('dashboard');
        }}
      />
    </div>
  );
}
