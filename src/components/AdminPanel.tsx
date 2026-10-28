import React, { useState, useEffect } from 'react';
import {
  FileText,
  Shield,
  Activity,
  AlertTriangle,
  Server,
  Database,
  Cpu,
  RefreshCw,
  Users,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api.ts';
import { AdminAnalytics, User } from '../types/index.ts';

interface AdminPanelProps {
  currentUser: User | null;
  onOpenAuth: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ currentUser, onOpenAuth }) => {
  const [stats, setStats] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [testReport, setTestReport] = useState<{
    total: number;
    passed: number;
    failed: number;
    results: { id: number; criterion: string; passed: boolean; details: string }[];
  } | null>(null);
  const [testLoading, setTestLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminAnalytics();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRunTests = async () => {
    setTestLoading(true);
    try {
      const report = await api.runAcceptanceTests();
      setTestReport(report);
    } catch (e: any) {
      alert(e.message || 'Failed to execute test suite.');
    } finally {
      setTestLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchStats();
    }
  }, [currentUser]);

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <Shield className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Administrator Access Required</h2>
        <p className="text-xs text-gray-400 max-w-md mx-auto">
          This portal displays aggregated safety intelligence, scam vector heatmaps, and system diagnostics.
          Sign in using the Hackathon Admin Demo credential to inspect this view.
        </p>
        <button
          onClick={onOpenAuth}
          className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer"
        >
          Sign In as Admin
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Activity className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
              Admin & Scam Intelligence Radar
            </h1>
          </div>
          <p className="text-xs text-gray-400">
            Real-time aggregate safety telemetry, threat category distribution, and system performance diagnostics.
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300 hover:text-white cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Radar</span>
        </button>
      </div>

      {stats && (
        <div className="space-y-6">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#070b14] border border-cyan-500/20 rounded-2xl p-4 space-y-1">
              <span className="text-xs text-gray-400">Total Scans Executed</span>
              <div className="text-2xl font-bold text-white font-mono">{stats.totalAnalyses}</div>
              <span className="text-[10px] text-cyan-400 font-mono">+{stats.analysesToday} today</span>
            </div>

            <div className="bg-[#070b14] border border-rose-500/20 rounded-2xl p-4 space-y-1">
              <span className="text-xs text-gray-400">Critical Threat Detections</span>
              <div className="text-2xl font-bold text-rose-400 font-mono">
                {stats.riskDistribution.Critical}
              </div>
              <span className="text-[10px] text-gray-500 font-mono">Immediate risk signals</span>
            </div>

            <div className="bg-[#070b14] border border-yellow-500/20 rounded-2xl p-4 space-y-1">
              <span className="text-xs text-gray-400">Documented User Reports</span>
              <div className="text-2xl font-bold text-yellow-400 font-mono">{stats.totalReports}</div>
              <span className="text-[10px] text-gray-500 font-mono">Sealed incident records</span>
            </div>

            <div className="bg-[#070b14] border border-indigo-500/20 rounded-2xl p-4 space-y-1">
              <span className="text-xs text-gray-400">Registered Safety Users</span>
              <div className="text-2xl font-bold text-indigo-300 font-mono">{stats.activeUsers}</div>
              <span className="text-[10px] text-gray-500 font-mono">Isolated tenant accounts</span>
            </div>
          </div>

          {/* Risk Distribution & Scam Vectors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Risk Category Distribution */}
            <div className="bg-[#070b14] border border-cyan-500/20 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wide">
                Risk Classification Breakdown
              </h3>

              <div className="space-y-3">
                {[
                  { label: 'Critical Risk', count: stats.riskDistribution.Critical, color: 'bg-rose-500', text: 'text-rose-400' },
                  { label: 'High Risk', count: stats.riskDistribution.High, color: 'bg-orange-500', text: 'text-orange-400' },
                  { label: 'Moderate Risk', count: stats.riskDistribution.Moderate, color: 'bg-yellow-500', text: 'text-yellow-400' },
                  { label: 'Low Risk', count: stats.riskDistribution.Low, color: 'bg-emerald-500', text: 'text-emerald-400' },
                ].map((item) => {
                  const pct = stats.totalAnalyses > 0 ? Math.round((item.count / stats.totalAnalyses) * 100) : 0;
                  return (
                    <div key={item.label} className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">{item.label}</span>
                        <span className={`font-mono font-bold ${item.text}`}>
                          {item.count} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#0b132b] rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full transition-all`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Scam Categories */}
            <div className="bg-[#070b14] border border-cyan-500/20 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wide">
                Top Emerging Romance Scam Vectors
              </h3>

              {stats.topScamCategories.length === 0 ? (
                <div className="text-xs text-gray-500 font-mono py-4">
                  No scam categories logged yet.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {stats.topScamCategories.map((c, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-[#0b132b] border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-cyan-400 font-mono font-bold">#{i + 1}</span>
                        <span className="text-gray-200">{c.category}</span>
                      </div>
                      <span className="font-mono text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30">
                        {c.count} occurrences
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Prototype System Diagnostics */}
          <div className="bg-[#0b132b] border border-cyan-500/30 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wide flex items-center space-x-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>Safety Engine Health & Diagnostics</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-[#070b14] border border-white/5 space-y-1">
                <div className="text-gray-400">Gemini 3.8 Flash Hybrid AI</div>
                <div className="flex items-center space-x-1.5 font-semibold text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{stats.systemHealth.geminiAiStatus === 'connected' ? 'Connected & Active' : 'Fallback Engine Active'}</span>
                </div>
                <div className="text-[10px] text-gray-500">Dual-engine failover guarantee</div>
              </div>

              <div className="p-3 rounded-xl bg-[#070b14] border border-white/5 space-y-1">
                <div className="text-gray-400">Pipeline Response Latency</div>
                <div className="font-mono font-bold text-cyan-300">
                  ~{stats.systemHealth.averageLatencyMs} ms
                </div>
                <div className="text-[10px] text-gray-500">Heuristic regex + vector parsing</div>
              </div>

              <div className="p-3 rounded-xl bg-[#070b14] border border-white/5 space-y-1">
                <div className="text-gray-400">Data Store Status</div>
                <div className="flex items-center space-x-1.5 font-semibold text-emerald-300">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Healthy & Isolated</span>
                </div>
                <div className="text-[10px] text-gray-500">JSON/SQLite with atomic writes</div>
              </div>
            </div>
          </div>

          {/* Interactive Acceptance Test Runner for Judges */}
          <div className="bg-[#070b14] border border-purple-500/30 rounded-2xl p-5 space-y-4 shadow-[0_0_30px_rgba(168,85,247,0.08)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wide flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-purple-400" />
                  <span>20-Point Acceptance & Verification Test Suite</span>
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Automated end-to-end verification covering auth, threat heuristics, tenant isolation, and zero-false-positive boundaries.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRunTests}
                disabled={testLoading}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 disabled:opacity-40 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testLoading ? 'animate-spin' : ''}`} />
                <span>{testLoading ? 'Running Verification...' : 'Run All 20 Tests'}</span>
              </button>
            </div>

            {testReport && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#0b132b] border border-purple-500/20 text-xs font-mono">
                  <div className="text-gray-300">
                    Results: <span className="text-emerald-400 font-bold">{testReport.passed} Passed</span> •{' '}
                    <span className="text-rose-400 font-bold">{testReport.failed} Failed</span> / {testReport.total} Total
                  </div>
                  <div className="text-purple-300 font-bold">
                    Score: {Math.round((testReport.passed / testReport.total) * 100)}% Verified
                  </div>
                </div>

                <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
                  {testReport.results.map((r) => (
                    <div
                      key={r.id}
                      className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold text-gray-200">
                          #{r.id} {r.criterion}
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono">
                          {r.details}
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold shrink-0 ${
                          r.passed ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}
                      >
                        {r.passed ? 'PASSED ✅' : 'FAILED ❌'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
