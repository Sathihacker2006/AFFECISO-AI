import React, { useState } from 'react';
import {
  Shield,
  Sparkles,
  ArrowRight,
  Lock,
  MessageSquare,
  AlertTriangle,
  UserCheck,
  Bot,
  Heart,
  ChevronRight,
  Compass,
} from 'lucide-react';
import { TrustShield3D } from './TrustShield3D.tsx';
import { api } from '../services/api.ts';
import { AnalysisResult } from '../types/index.ts';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
  onQuickJudgeLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onQuickJudgeLogin }) => {
  const [quickInput, setQuickInput] = useState('');
  const [quickLoading, setQuickLoading] = useState(false);
  const [quickResult, setQuickResult] = useState<AnalysisResult | null>(null);

  // Sample scenarios for instant judge testing
  const sampleScenarios = [
    {
      label: '🚨 Romance Wire Scam',
      badge: 'Critical Risk',
      text: "Baby, I'm deployed on an oil rig in Cyprus and customs seized my equipment. I need $850 in Apple gift cards or crypto USDT right now to fly back to you. Don't tell your family, they won't understand our soulmate bond.",
    },
    {
      label: '🔑 2FA Code Theft',
      badge: 'Critical Risk',
      text: "Hey! Just to make sure you're real on this app, I just sent a 6-digit Google verification code to your phone. Can you send me the code you just got right away?",
    },
    {
      label: '✈️ Telegram Lure',
      badge: 'Moderate Risk',
      text: "Hey cutie, I hate this dating app and I'm deleting it tonight. Add me on Telegram @jessica_crypto99 right now so we can chat privately!",
    },
    {
      label: '☕ Normal Coffee Invite',
      badge: 'Low Risk',
      text: "Hey! Loved chatting about indie films. Would you like to grab coffee at Blue Bottle this Sunday afternoon around 2 PM? Let me know if that works!",
    },
  ];

  const handleRunQuickScan = async (textToScan?: string) => {
    const text = textToScan || quickInput;
    if (!text.trim()) return;
    setQuickLoading(true);
    try {
      const res = await api.analyzeMessage(text, 'Landing Page Demo');
      setQuickResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setQuickLoading(false);
    }
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-12 overflow-hidden">
        {/* Ambient neon radial glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[250px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-6 relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-[#0b132b]/80 border border-cyan-500/30 px-3.5 py-1.5 rounded-full text-xs font-mono text-cyan-300 shadow-[0_0_20px_rgba(0,242,254,0.15)]">
            <Heart className="w-3.5 h-3.5 text-rose-400" />
            <span>AFFECIO SOCIAL DISCOVERY HACKATHON // PS04</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 ml-1" />
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight sm:leading-none">
            Trust Before{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              Connection
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-300 font-normal leading-relaxed">
            AI-powered digital safety and authenticity intelligence for modern dating. Detect manipulation,
            uncover romance scam patterns, and verify suspicious interactions without sacrificing your privacy.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('analyzer')}
              className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-[#070b14] font-bold px-6 py-3 rounded-xl text-sm shadow-[0_0_25px_rgba(0,242,254,0.35)] transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Launch TrustScan AI</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('reports')}
              className="flex items-center space-x-2 bg-[#0b132b] hover:bg-[#101b3b] text-cyan-300 border border-cyan-500/30 px-5 py-3 rounded-xl text-sm transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Offline Meeting Safety Guide</span>
            </button>

            <button
              onClick={onQuickJudgeLogin}
              className="flex items-center space-x-1.5 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-400/30 text-purple-300 px-4 py-3 rounded-xl text-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Judge Evaluation Mode</span>
            </button>
          </div>
        </div>

        {/* 3D Interactive Centerpiece */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-10">
          <TrustShield3D threatLevel={quickResult ? quickResult.riskCategory : 'Low'} />
        </div>
      </section>

      {/* Instant Interactive Test Box */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-[#070b14]/90 border border-cyan-500/30 rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(0,242,254,0.1)] relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white tracking-wide">
                Instant Safety Radar Test
              </h2>
            </div>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
              Live Heuristic Engine
            </span>
          </div>

          <p className="text-xs text-gray-400 mb-4">
            Click one of the realistic test scenarios below to see how AFFECIO TRUSTAI detects red flags,
            isolates exact evidence quotes, and provides diplomatic refusal scripts.
          </p>

          {/* Preset Scenario Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            {sampleScenarios.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuickInput(s.text);
                  handleRunQuickScan(s.text);
                }}
                className="text-left p-2.5 rounded-xl bg-[#0b132b]/80 border border-cyan-500/20 hover:border-cyan-400/50 hover:bg-[#0f1d45] transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-gray-200 mb-1">
                  <span>{s.label}</span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      s.badge.includes('Critical')
                        ? 'bg-rose-500/20 text-rose-300'
                        : s.badge.includes('Moderate')
                        ? 'bg-yellow-500/20 text-yellow-300'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {s.badge}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 line-clamp-1 group-hover:text-gray-300">
                  {s.text}
                </p>
              </button>
            ))}
          </div>

          {/* Custom Input */}
          <div className="space-y-3">
            <div className="relative">
              <textarea
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                placeholder="Or paste any suspicious message from a dating app to analyze..."
                rows={3}
                className="w-full bg-[#0b132b] border border-cyan-500/20 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 font-mono resize-none"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-500 font-mono">
                {quickInput.length} characters • 100% Client-Redacted Telemetry
              </span>
              <button
                type="button"
                onClick={() => handleRunQuickScan()}
                disabled={quickLoading || !quickInput.trim()}
                className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-[#070b14] font-semibold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5"
              >
                {quickLoading ? (
                  <span>Scanning Evidence...</span>
                ) : (
                  <>
                    <span>Run Analysis</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Result Drawer */}
          {quickResult && (
            <div className="mt-5 pt-5 border-t border-cyan-500/20 space-y-4 animate-in fade-in duration-300">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-[#0b132b] p-3 rounded-xl border border-cyan-500/20">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      quickResult.riskCategory === 'Critical'
                        ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e]'
                        : quickResult.riskCategory === 'High'
                        ? 'bg-orange-500'
                        : quickResult.riskCategory === 'Moderate'
                        ? 'bg-yellow-500'
                        : 'bg-emerald-500'
                    }`}
                  />
                  <span className="text-xs font-bold text-white">
                    Risk Category: {quickResult.riskCategory}
                  </span>
                  <span className="text-xs font-mono text-gray-400">
                    (Score: {quickResult.riskScore}/100)
                  </span>
                </div>
                <div className="text-[11px] text-cyan-300 font-mono">
                  Engine: {quickResult.analysisMethod}
                </div>
              </div>

              {quickResult.findings.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-gray-300">
                    Detected Safety Signals ({quickResult.findings.length}):
                  </div>
                  {quickResult.findings.map((f, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-rose-300">{f.signalName}</span>
                        <span className="font-mono text-[10px] text-gray-400">{f.categoryLabel}</span>
                      </div>
                      <p className="text-[11px] text-cyan-200/90 font-mono bg-cyan-950/30 p-1.5 rounded border border-cyan-500/20">
                        "{f.evidenceQuote}"
                      </p>
                      <p className="text-[11px] text-gray-400">{f.explanation}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                  ✓ No coercive, financial, or credential-harvesting patterns detected in this message.
                </div>
              )}

              {quickResult.recommendations.length > 0 && (
                <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-2">
                  <div className="text-xs font-semibold text-indigo-200">
                    Recommended Diplomatic Next Step:
                  </div>
                  <p className="text-xs text-gray-300">
                    {quickResult.recommendations[0].description}
                  </p>
                  {quickResult.recommendations[0].suggestedReply && (
                    <div className="bg-black/60 p-2 rounded-lg border border-cyan-500/20">
                      <span className="text-[10px] text-cyan-400 font-mono block mb-1">
                        SUGGESTED COPY-PASTE REPLY:
                      </span>
                      <p className="text-xs text-cyan-200 italic">
                        "{quickResult.recommendations[0].suggestedReply}"
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="text-center">
                <button
                  onClick={() => onNavigate('analyzer')}
                  className="text-xs text-cyan-400 hover:text-cyan-300 inline-flex items-center space-x-1 font-mono"
                >
                  <span>Open Full Workspace in TrustScan AI</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Five Core Pillars */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Architecture of Digital Trust
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto">
            Comprehensive defense mechanisms built specifically for modern dating platforms and social discovery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#070b14] border border-cyan-500/20 rounded-2xl p-6 hover:border-cyan-400/40 transition-all shadow-[0_0_20px_rgba(0,242,254,0.05)]">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">1. TrustScan AI</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Real-time linguistic and behavioral analysis for financial pressure, urgency tactics, off-platform lures, and credential theft.
            </p>
          </div>

          <div className="bg-[#070b14] border border-purple-500/20 rounded-2xl p-6 hover:border-purple-400/40 transition-all shadow-[0_0_20px_rgba(168,85,247,0.05)]">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">2. Profile Risk Insights</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Detects contradictions in voluntarily provided profile bios (such as offshore military tropes and crypto investment mentions) without demographic bias.
            </p>
          </div>

          <div className="bg-[#070b14] border border-cyan-500/20 rounded-2xl p-6 hover:border-cyan-400/40 transition-all shadow-[0_0_20px_rgba(0,242,254,0.05)]">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">3. Explainable Safety Engine</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Every flagged signal is directly linked to an exact excerpt from the conversation, explaining why the behavior is dangerous.
            </p>
          </div>

          <div className="bg-[#070b14] border border-indigo-500/20 rounded-2xl p-6 hover:border-indigo-400/40 transition-all shadow-[0_0_20px_rgba(99,102,241,0.05)]">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">4. Privacy Guardian</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Full control over your data retention schedule, automatic PII scrubbing, instant analysis history purge, and complete JSON export.
            </p>
          </div>

          <div className="bg-[#070b14] border border-rose-500/20 rounded-2xl p-6 hover:border-rose-400/40 transition-all shadow-[0_0_20px_rgba(244,63,94,0.05)]">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">5. AI Safety Companion</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Empathetic situational mentor offering boundary-setting refusal scripts, offline meeting checklists, and extortion guidance.
            </p>
          </div>

          <div className="bg-[#070b14] border border-cyan-500/20 rounded-2xl p-6 hover:border-cyan-400/40 transition-all shadow-[0_0_20px_rgba(0,242,254,0.05)]">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Responsible AI Guardrails</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Scores are heuristic advisory indicators, not legal proof of fraud. Designed to support human decision-making with evidence.
            </p>
          </div>
        </div>
      </section>

      {/* Responsible AI & Ethics Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-[#0b132b]/60 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center space-x-2 text-cyan-400">
            <Shield className="w-5 h-5" />
            <h3 className="text-sm font-bold tracking-wide uppercase font-mono">
              Responsible AI & Ethical Boundaries
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-300">
            <div className="space-y-1.5">
              <div className="font-semibold text-white">✓ Heuristic Risk, Not Proof of Guilt</div>
              <p className="text-gray-400 leading-relaxed">
                Risk scores represent observable behavioral anomalies. We never claim AI can legally prove someone's identity or criminal intent.
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="font-semibold text-white">✓ Zero Demographic Profiling</div>
              <p className="text-gray-400 leading-relaxed">
                Evaluations ignore physical appearance, ethnicity, age, or gender. Findings evaluate observable manipulation tactics only.
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="font-semibold text-white">✓ Deterministic Fallback Guaranteed</div>
              <p className="text-gray-400 leading-relaxed">
                Core safety rules operate reliably even without external cloud model connectivity, ensuring zero downtime safety.
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="font-semibold text-white">✓ User Data Sovereignty</div>
              <p className="text-gray-400 leading-relaxed">
                You can delete any analysis or permanently purge your account with a single click. No unconsented training data harvesting.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
