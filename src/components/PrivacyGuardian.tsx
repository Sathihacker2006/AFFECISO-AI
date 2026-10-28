import React, { useState, useEffect } from 'react';
import {
  Lock,
  Shield,
  Download,
  Trash2,
  Check,
  AlertTriangle,
  FileText,
  UserX,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api.ts';
import { PrivacySettings, User } from '../types/index.ts';

interface PrivacyGuardianProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const PrivacyGuardian: React.FC<PrivacyGuardianProps> = ({
  currentUser,
  onOpenAuth,
  onLogout,
}) => {
  const [settings, setSettings] = useState<PrivacySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    loadSettings();
  }, [currentUser]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await api.getPrivacySettings();
      setSettings(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (patch: Partial<PrivacySettings>) => {
    if (!settings) return;
    try {
      const updated = await api.updatePrivacySettings(patch);
      setSettings(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportData = async () => {
    if (!currentUser) return;
    try {
      const [anlRes, repRes, privRes] = await Promise.all([
        api.getAnalyses(),
        api.getReports(),
        api.getPrivacySettings(),
      ]);

      const archiveData = {
        exportTimestamp: new Date().toISOString(),
        user: currentUser,
        privacySettings: privRes,
        messageAnalyses: anlRes.analyses,
        reportsFiled: repRes.reports,
        complianceStandard: 'AFFECIO Privacy-by-Design Zero-Harvest Specification',
      };

      const blob = new Blob([JSON.stringify(archiveData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `affecio_trustai_export_${currentUser.id}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Data export failed. Please try again.');
    }
  };

  const handlePurgeAccount = async () => {
    if (deleteConfirmation !== 'PURGE') return;
    try {
      await api.deleteAccount();
      onLogout();
    } catch (e) {
      alert('Purge failed');
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <Lock className="w-12 h-12 text-cyan-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Privacy Guardian</h2>
        <p className="text-xs text-gray-400">
          Sign in to manage your personal data retention rules, scrubbed telemetry toggles, and data export.
        </p>
        <button
          onClick={onOpenAuth}
          className="bg-cyan-500 hover:bg-cyan-400 text-[#070b14] font-semibold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Lock className="w-4 h-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
            Privacy Guardian & Sovereign Data Controls
          </h1>
        </div>
        <p className="text-xs text-gray-400">
          Zero unconsented training data harvesting. Manage your retention period, redact sensitive PII, or export your full safety archive.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
          <Check className="w-4 h-4" />
          <span>Privacy preferences updated and enforced across system storage.</span>
        </div>
      )}

      {/* Main Settings Card */}
      <div className="bg-[#070b14] border border-cyan-500/30 rounded-2xl p-6 space-y-6 shadow-[0_0_35px_rgba(0,242,254,0.06)]">
        {/* Retention Period Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-white font-mono uppercase tracking-wide">
              Data Retention Schedule
            </label>
            <span className="text-xs text-cyan-400 font-mono">
              Current: {settings?.retentionDays === 0 ? 'Incognito (0 Days)' : `${settings?.retentionDays} Days`}
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Analyses older than this period are permanently purged from database records automatically.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            {[
              { days: 7, label: '7 Days' },
              { days: 30, label: '30 Days' },
              { days: 90, label: '90 Days' },
              { days: 0, label: '0 Days (Incognito)' },
            ].map((option) => (
              <button
                key={option.days}
                type="button"
                onClick={() => handleUpdate({ retentionDays: option.days })}
                className={`py-2 px-3 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                  settings?.retentionDays === option.days
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold shadow-[0_0_15px_rgba(0,242,254,0.15)]'
                    : 'bg-[#0b132b] text-gray-400 border-white/5 hover:text-white'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-white/5 pt-4 space-y-4">
          <div className="text-xs font-bold text-white font-mono uppercase tracking-wide">
            Automated Redaction & Anonymization
          </div>

          {/* Toggle 1: Auto Redact */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0b132b] border border-cyan-500/20">
            <div className="space-y-0.5 max-w-[80%]">
              <div className="text-xs font-semibold text-white">
                Auto-Redact Personal Identifiers (PII)
              </div>
              <div className="text-[11px] text-gray-400">
                Automatically masks telephone numbers, bank accounts, and email handles in submitted text before generating analysis records.
              </div>
            </div>
            <button
              onClick={() => handleUpdate({ autoRedactSensitiveData: !settings?.autoRedactSensitiveData })}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings?.autoRedactSensitiveData ? 'bg-cyan-500' : 'bg-gray-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  settings?.autoRedactSensitiveData ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Toggle 2: Telemetry */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#0b132b] border border-cyan-500/20">
            <div className="space-y-0.5 max-w-[80%]">
              <div className="text-xs font-semibold text-white">
                Anonymous Threat Pattern Sharing
              </div>
              <div className="text-[11px] text-gray-400">
                Share anonymized scam heuristic frequencies to protect other dating users from emergent syndicate tactics.
              </div>
            </div>
            <button
              onClick={() => handleUpdate({ allowTelemetryAggregation: !settings?.allowTelemetryAggregation })}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                settings?.allowTelemetryAggregation ? 'bg-cyan-500' : 'bg-gray-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  settings?.allowTelemetryAggregation ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Data Sovereignty: Export & Delete */}
        <div className="border-t border-white/5 pt-4 space-y-3">
          <div className="text-xs font-bold text-white font-mono uppercase tracking-wide">
            Data Sovereignty & Portability
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleExportData}
              className="flex items-center justify-center space-x-2 p-3 rounded-xl bg-[#0b132b] hover:bg-[#101b3b] border border-cyan-500/20 text-cyan-300 text-xs font-semibold cursor-pointer transition-all hover:border-cyan-400"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Export Full Safety Archive (JSON)</span>
            </button>

            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center justify-center space-x-2 p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold cursor-pointer transition-all"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Permanently Purge All Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#070b14] border border-rose-500/40 rounded-2xl p-6 space-y-4 shadow-[0_0_50px_rgba(244,63,94,0.2)]">
            <div className="flex items-center space-x-2 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-sm font-bold uppercase font-mono">
                Confirm Irreversible Account Purge
              </h3>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">
              This will permanently delete your account, credentials, all historical message analyses, profile evaluations, and privacy settings from database storage.
            </p>
            <div>
              <label className="block text-[11px] font-mono text-gray-400 mb-1">
                Type <span className="text-rose-400 font-bold">PURGE</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="PURGE"
                className="w-full bg-[#0b132b] border border-rose-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-400 font-mono"
              />
            </div>
            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation('');
                }}
                className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white bg-white/5"
              >
                Cancel
              </button>
              <button
                disabled={deleteConfirmation !== 'PURGE'}
                onClick={handlePurgeAccount}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white cursor-pointer"
              >
                Confirm Purge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
