import React, { useState, useEffect } from 'react';
import {
  Shield,
  Sparkles,
  MessageSquare,
  AlertTriangle,
  UserCheck,
  Lock,
  Trash2,
  ChevronRight,
  ExternalLink,
  Plus,
  RefreshCw,
  Clock,
  CheckCircle2,
  Bot
} from 'lucide-react';
import { api } from '../services/api.ts';
import { AnalysisResult, User, PrivacySettings } from '../types/index.ts';

interface DashboardProps {
  currentUser: User | null;
  onNavigate: (tab: string) => void;
  onOpenAuth: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ currentUser, onNavigate, onOpenAuth }) => {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [privacy, setPrivacy] = useState<PrivacySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisResult | null>(null);

  const fetchDashboardData = async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [anlRes, privRes] = await Promise.all([
        api.getAnalyses().catch(() => ({ analyses: [] })),
        api.getPrivacySettings().catch(() => null),
      ]);
      setAnalyses(anlRes.analyses);
      setPrivacy(privRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentUser]);

  const handleDeleteAnalysis = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.deleteAnalysis(id);
      setAnalyses(prev => prev.filter(a => a.id !== id));
      if (selectedAnalysis?.id === id) {
        setSelectedAnalysis(null);
      }
    } catch (err) {
      console.error('Failed to delete analysis:', err);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto shadow-[0_0_30px_rgba(0,242,254,0.15)]">
          <Shield className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Trust Command Center</h2>
        <p className="text-sm text-gray-400 max-w-md mx-auto">
          Sign in to access your personal message analysis history, custom privacy settings, and incident reports.
        </p>
        <button
          onClick={onOpenAuth}
          className="bg-cyan-500 hover:bg-cyan-400 text-[#070b14] font-semibold text-xs px-6 py-2.5 rounded-xl transition-all cursor-pointer shadow-[0_0_20px_rgba(0,242,254,0.3)] inline-flex items-center space-x-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Sign In / Launch Demo Mode</span>
        </button>
      </div>
    );
  }

  // Filter analyses
  const filteredAnalyses = analyses.filter((a) => {
    if (filterRisk === 'all') return true;
    return a.riskCategory.toLowerCase() === filterRisk.toLowerCase();
  });

  // Calculate stats
  const totalScans = analyses.length;
  const criticalCount = analyses.filter(a => a.riskCategory === 'Critical' || a.riskCategory === 'High').length;
  const avgScore = totalScans > 0 ? Math.round(analyses.reduce((sum, a) => sum + a.riskScore, 0) / totalScans) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#0b132b] via-[#070b14] to-[#0b132b] border border-cyan-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(0,242,254,0.08)]">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
              Welcome back, {currentUser.displayName}
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              SHIELD ACTIVE
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Personal Trust Radar & Safety Incident Workspace
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate('analyzer')}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-[#070b14] font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-[0_0_15px_rgba(0,242,254,0.25)] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Scan New Message</span>
          </button>
          <button
            onClick={fetchDashboardData}
            title="Refresh feed"
            className="p-2 rounded-xl text-gray-400 hover:text-white bg-white/5 border border-white/10 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#070b14] border border-cyan-500/20 rounded-2xl p-4 space-y-1">
          <span className="text-xs text-gray-400 flex items-center space-x-1">
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
            <span>Total Analyses</span>
          </span>
          <div className="text-2xl font-bold text-white font-mono">{totalScans}</div>
          <span className="text-[10px] text-gray-500">Stored in your isolated tenant</span>
        </div>

        <div className="bg-[#070b14] border border-rose-500/20 rounded-2xl p-4 space-y-1">
          <span className="text-xs text-gray-400 flex items-center space-x-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>High / Critical Threats</span>
          </span>
          <div className="text-2xl font-bold text-rose-400 font-mono">{criticalCount}</div>
          <span className="text-[10px] text-gray-500">Romance scams & 2FA harvest attempts</span>
        </div>

        <div className="bg-[#070b14] border border-yellow-500/20 rounded-2xl p-4 space-y-1">
          <span className="text-xs text-gray-400 flex items-center space-x-1">
            <Shield className="w-3.5 h-3.5 text-yellow-400" />
            <span>Average Risk Index</span>
          </span>
          <div className="text-2xl font-bold text-yellow-400 font-mono">{avgScore}/100</div>
          <span className="text-[10px] text-gray-500">Heuristic threat index</span>
        </div>

        <div className="bg-[#070b14] border border-indigo-500/20 rounded-2xl p-4 space-y-1">
          <span className="text-xs text-gray-400 flex items-center space-x-1">
            <Lock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Retention Policy</span>
          </span>
          <div className="text-2xl font-bold text-indigo-300 font-mono">
            {privacy?.retentionDays ? `${privacy.retentionDays} Days` : '30 Days'}
          </div>
          <span className="text-[10px] text-gray-500">Auto-purge enabled</span>
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Analyses (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Personal Analysis History</span>
            </h2>

            {/* Filter Pills */}
            <div className="flex items-center space-x-1 bg-[#0b132b] p-1 rounded-xl border border-white/5 text-[11px]">
              {['all', 'critical', 'high', 'moderate', 'low'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterRisk(cat)}
                  className={`px-2.5 py-0.5 rounded-lg capitalize transition-all cursor-pointer ${
                    filterRisk === cat
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-medium'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-gray-500 font-mono bg-[#070b14] rounded-2xl border border-white/5">
              Loading security records...
            </div>
          ) : filteredAnalyses.length === 0 ? (
            <div className="p-8 text-center bg-[#070b14] border border-cyan-500/20 rounded-2xl space-y-3">
              <Shield className="w-8 h-8 text-gray-600 mx-auto" />
              <div className="text-xs text-gray-400">
                No analyses matching the selected filter.
              </div>
              <button
                onClick={() => onNavigate('analyzer')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-mono inline-flex items-center space-x-1"
              >
                <span>Analyze your first message</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAnalyses.map((anl) => {
                const isSelected = selectedAnalysis?.id === anl.id;
                return (
                  <div
                    key={anl.id}
                    onClick={() => setSelectedAnalysis(anl)}
                    className={`p-4 rounded-2xl transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#0f1d45] border-cyan-400 shadow-[0_0_20px_rgba(0,242,254,0.15)]'
                        : 'bg-[#070b14] border-cyan-500/20 hover:border-cyan-500/40 hover:bg-[#0b132b]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                              anl.riskCategory === 'Critical'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : anl.riskCategory === 'High'
                                ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                                : anl.riskCategory === 'Moderate'
                                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {anl.riskCategory.toUpperCase()} RISK • {anl.riskScore}/100
                          </span>

                          {anl.isDemo && (
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-400/30">
                              JUDGE DEMO SAMPLE
                            </span>
                          )}

                          <span className="text-[10px] text-gray-500 font-mono">
                            {new Date(anl.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <p className="text-xs text-gray-200 line-clamp-2 font-mono">
                          "{anl.inputContent}"
                        </p>

                        <div className="flex items-center space-x-3 text-[11px] text-gray-400">
                          <span>
                            {anl.findings.length} signal{anl.findings.length !== 1 ? 's' : ''} detected
                          </span>
                          <span>•</span>
                          <span className="text-cyan-400/80">{anl.contextCategory}</span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleDeleteAnalysis(anl.id, e)}
                        title="Delete from history"
                        className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Selected Analysis Detail Drawer / Quick Tools (1 col) */}
        <div className="space-y-6">
          {selectedAnalysis ? (
            <div className="bg-[#070b14] border border-cyan-500/30 rounded-2xl p-5 space-y-4 shadow-[0_0_30px_rgba(0,242,254,0.08)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white font-mono">
                  EVIDENCE BREAKDOWN
                </span>
                <span className="text-[10px] font-mono text-cyan-300">
                  {selectedAnalysis.id}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-black/50 border border-white/5 space-y-1">
                <div className="text-[10px] text-gray-500 font-mono">MESSAGE EXCERPT:</div>
                <p className="text-xs text-gray-200 font-mono leading-relaxed">
                  "{selectedAnalysis.inputContent}"
                </p>
              </div>

              {selectedAnalysis.findings.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-gray-300">
                    Specific Warning Signs:
                  </div>
                  {selectedAnalysis.findings.map((f, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-[#0b132b] border border-white/5 text-xs space-y-1">
                      <div className="flex items-center justify-between text-rose-300 font-semibold">
                        <span>{f.signalName}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{f.severity}</span>
                      </div>
                      <div className="text-[11px] text-cyan-200 font-mono bg-cyan-950/20 p-1 rounded">
                        "{f.evidenceQuote}"
                      </div>
                      <p className="text-[11px] text-gray-400">{f.explanation}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                  ✓ Benign interaction. No coercive or scam indicators detected.
                </div>
              )}

              {selectedAnalysis.recommendations.length > 0 && (
                <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-2">
                  <div className="text-xs font-semibold text-indigo-300">
                    Recommended Protection:
                  </div>
                  <p className="text-xs text-gray-300">
                    {selectedAnalysis.recommendations[0].description}
                  </p>
                  {selectedAnalysis.recommendations[0].suggestedReply && (
                    <div className="p-2 rounded bg-black/60 border border-cyan-500/20 text-xs">
                      <span className="text-[10px] text-cyan-400 font-mono block mb-0.5">
                        DIPLOMATIC REFUSAL:
                      </span>
                      <p className="text-cyan-200 italic">
                        "{selectedAnalysis.recommendations[0].suggestedReply}"
                      </p>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => setSelectedAnalysis(null)}
                className="w-full py-1.5 text-xs text-gray-400 hover:text-white rounded-lg bg-white/5 transition-all"
              >
                Close Drawer
              </button>
            </div>
          ) : (
            /* Quick Safety Shortcuts */
            <div className="bg-[#070b14] border border-cyan-500/20 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-white tracking-wide uppercase font-mono">
                Safety Workflows
              </h3>

              <div className="space-y-2.5">
                <button
                  onClick={() => onNavigate('profile')}
                  className="w-full text-left p-3 rounded-xl bg-[#0b132b] hover:bg-[#101b3b] border border-cyan-500/20 flex items-center justify-between group transition-all cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <UserCheck className="w-4 h-4 text-purple-400" />
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-cyan-300">
                        Profile Risk Insights
                      </div>
                      <div className="text-[11px] text-gray-400">
                        Evaluate bio inconsistencies & overseas claims
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-cyan-400" />
                </button>

                <button
                  onClick={() => onNavigate('companion')}
                  className="w-full text-left p-3 rounded-xl bg-[#0b132b] hover:bg-[#101b3b] border border-cyan-500/20 flex items-center justify-between group transition-all cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <Bot className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-cyan-300">
                        AI Safety Companion
                      </div>
                      <div className="text-[11px] text-gray-400">
                        Ask safety questions & get refusal scripts
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-cyan-400" />
                </button>

                <button
                  onClick={() => onNavigate('reports')}
                  className="w-full text-left p-3 rounded-xl bg-[#0b132b] hover:bg-[#101b3b] border border-cyan-500/20 flex items-center justify-between group transition-all cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-cyan-300">
                        Offline Meeting Protocol
                      </div>
                      <div className="text-[11px] text-gray-400">
                        5-point checklist before meeting in person
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-cyan-400" />
                </button>

                <button
                  onClick={() => onNavigate('privacy')}
                  className="w-full text-left p-3 rounded-xl bg-[#0b132b] hover:bg-[#101b3b] border border-cyan-500/20 flex items-center justify-between group transition-all cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <Lock className="w-4 h-4 text-indigo-400" />
                    <div>
                      <div className="text-xs font-semibold text-white group-hover:text-cyan-300">
                        Privacy Guardian
                      </div>
                      <div className="text-[11px] text-gray-400">
                        Manage retention, redact PII & export data
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-cyan-400" />
                </button>
              </div>
            </div>
          )}

          {/* Educational Quick Safety Tip */}
          <div className="bg-[#0b132b]/80 border border-cyan-500/20 rounded-2xl p-4 space-y-2">
            <div className="flex items-center space-x-2 text-cyan-300 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Digital Dating Rule #1</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              Never wire money or purchase gift cards for someone you have not spent significant time with in person.
              Real romance never requires you to bail someone out of an overseas customs lock.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
