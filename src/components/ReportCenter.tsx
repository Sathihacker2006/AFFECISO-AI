import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Shield,
  Send,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  PhoneCall,
  ExternalLink,
  MapPin,
  Clock,
  Compass
} from 'lucide-react';
import { api } from '../services/api.ts';
import { UserReport, User } from '../types/index.ts';

interface ReportCenterProps {
  currentUser: User | null;
  onOpenAuth: () => void;
}

export const ReportCenter: React.FC<ReportCenterProps> = ({ currentUser, onOpenAuth }) => {
  const [activeTab, setActiveTab] = useState<'report' | 'checklist' | 'history'>('report');

  // Report Form state
  const [suspectHandle, setSuspectHandle] = useState('');
  const [platform, setPlatform] = useState('Tinder');
  const [reportCategory, setReportCategory] = useState<UserReport['reportCategory']>('money_solicitation');
  const [incidentDescription, setIncidentDescription] = useState('');
  const [evidenceQuotes, setEvidenceQuotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<UserReport | null>(null);

  // User Reports History
  const [reports, setReports] = useState<UserReport[]>([]);

  // Checklist state
  const [checkedSteps, setCheckedSteps] = useState<number[]>([1]);
  const [buddyName, setBuddyName] = useState('Sarah');
  const [dateVenue, setDateVenue] = useState('Blue Bottle Cafe (4th St)');
  const [matchName, setMatchName] = useState('Alex');
  const [copiedSos, setCopiedSos] = useState(false);

  useEffect(() => {
    if (currentUser) {
      loadReports();
    }
  }, [currentUser]);

  const loadReports = async () => {
    try {
      const res = await api.getReports();
      setReports(res.reports);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    setSubmitting(true);
    try {
      const rep = await api.submitReport({
        suspectHandle,
        platform,
        reportCategory,
        incidentDescription,
        evidenceQuotes,
      });
      setSubmittedReport(rep);
      setReports([rep, ...reports]);
      setSuspectHandle('');
      setIncidentDescription('');
      setEvidenceQuotes('');
    } catch (err: any) {
      alert(err.message || 'Report submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleCheck = (idx: number) => {
    if (checkedSteps.includes(idx)) {
      setCheckedSteps(checkedSteps.filter(x => x !== idx));
    } else {
      setCheckedSteps([...checkedSteps, idx]);
    }
  };

  const sosMessage = `Hey ${buddyName}! I'm meeting ${matchName} for a date at ${dateVenue}. If I don't text you by 8:30 PM, please give me a call to check in! My live location is shared with you.`;

  const handleCopySos = () => {
    navigator.clipboard.writeText(sosMessage);
    setCopiedSos(true);
    setTimeout(() => setCopiedSos(false), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
            Incident Reporting & Offline Safety Center
          </h1>
        </div>
        <p className="text-xs text-gray-400">
          Document suspicious interactions, access real offline meeting safety protocols, and connect to official anti-fraud helplines.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-white/5 pb-2">
        <button
          onClick={() => setActiveTab('report')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'report'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Document Suspicious Match
        </button>

        <button
          onClick={() => setActiveTab('checklist')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'checklist'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Offline Meeting Safety Protocol
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          My Documented Reports ({reports.length})
        </button>
      </div>

      {/* TAB 1: Document Suspicious Match */}
      {activeTab === 'report' && (
        <div className="space-y-6">
          <form
            onSubmit={handleSubmitReport}
            className="bg-[#070b14] border border-cyan-500/30 rounded-2xl p-6 space-y-4 shadow-[0_0_35px_rgba(0,242,254,0.06)]"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Suspect Handle / Profile Name *
                </label>
                <input
                  type="text"
                  required
                  value={suspectHandle}
                  onChange={(e) => setSuspectHandle(e.target.value)}
                  placeholder="e.g. @richard_vance_92"
                  className="w-full bg-[#0b132b] border border-cyan-500/20 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Origin Platform *
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full bg-[#0b132b] border border-cyan-500/20 rounded-xl px-3 py-2 text-xs text-cyan-300 focus:outline-none focus:border-cyan-400"
                >
                  <option value="Tinder">Tinder</option>
                  <option value="Bumble">Bumble</option>
                  <option value="Hinge">Hinge</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Telegram">Telegram</option>
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Other">Other Platform</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Incident Category *
              </label>
              <select
                value={reportCategory}
                onChange={(e) => setReportCategory(e.target.value as any)}
                className="w-full bg-[#0b132b] border border-cyan-500/20 rounded-xl px-3 py-2 text-xs text-cyan-300 focus:outline-none focus:border-cyan-400"
              >
                <option value="money_solicitation">Money Solicitation / Gift Card Demand</option>
                <option value="impersonation">Impersonation / Fake Celebrity or Military Identity</option>
                <option value="extortion_threat">Extortion / Sextortion / Threatening to Expose</option>
                <option value="suspicious_links">Suspicious Links / Phishing Site Lure</option>
                <option value="inappropriate_contact">Aggressive Harassment or Non-Consensual Media</option>
                <option value="fake_profile">Commercial Bot or Crypto Mentorship Syndicate</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Incident Description *
              </label>
              <textarea
                required
                value={incidentDescription}
                onChange={(e) => setIncidentDescription(e.target.value)}
                rows={3}
                placeholder="Describe what occurred, how the conversation progressed, and any unusual requests..."
                className="w-full bg-[#0b132b] border border-cyan-500/20 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 font-mono resize-y"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Supporting Evidence / Direct Quotes (Optional)
              </label>
              <textarea
                value={evidenceQuotes}
                onChange={(e) => setEvidenceQuotes(e.target.value)}
                rows={2}
                placeholder="Paste key quotes, payment handles, or external phone numbers..."
                className="w-full bg-[#0b132b] border border-cyan-500/20 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 font-mono resize-y"
              />
            </div>

            <div className="p-3 rounded-xl bg-[#0b132b] border border-white/5 text-[11px] text-gray-400">
              <span className="font-semibold text-gray-300">Responsible Disclosure Note: </span>
              Submitting this record documents the evidence securely in your personal AFFECIO TRUSTAI vault.
              Reports are not forwarded to local police or third-party dating apps unless you export and provide them directly to authorities.
            </div>

            <div className="flex items-center justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-[#070b14] font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)] cursor-pointer"
              >
                {submitting ? (
                  <span>Recording Report...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>File Incident Document</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {submittedReport && (
            <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 space-y-2 animate-in fade-in">
              <div className="flex items-center space-x-2 text-emerald-300 text-xs font-bold font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>REPORT RECORDED: {submittedReport.id}</span>
              </div>
              <p className="text-xs text-gray-300">
                Your incident record has been securely sealed. Recommended protection measures:
              </p>
              <ul className="text-xs text-gray-400 list-disc list-inside space-y-0.5">
                {submittedReport.suggestedProtections.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Offline First-Date Safety Protocol */}
      {activeTab === 'checklist' && (
        <div className="space-y-6">
          <div className="bg-[#070b14] border border-cyan-500/30 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wide flex items-center space-x-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>5-Point Pre-Date Verification Protocol</span>
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Complete these 5 security checks before meeting an online match in person.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: 1,
                  title: '1. Neutral, High-Footfall Public Venue',
                  desc: 'Always meet at a well-lit coffee shop, restaurant, or museum. Never agree to meet at someone’s home, isolated park, or hotel room on a first date.',
                },
                {
                  id: 2,
                  title: '2. Sovereign Transportation',
                  desc: 'Handle your own transport. Never accept rides from your home address or let someone you haven’t met pick you up.',
                },
                {
                  id: 3,
                  title: '3. Designated Safety Buddy & Live Location',
                  desc: 'Share your match’s profile photo, phone number, and venue address with a trusted friend. Enable live location sharing for the afternoon.',
                },
                {
                  id: 4,
                  title: '4. Scheduled Check-In Timer',
                  desc: 'Program an automated or friendly check-in call with your safety buddy exactly 60 minutes into the date. Gives you a graceful exit excuse if needed.',
                },
                {
                  id: 5,
                  title: '5. Pre-Date 2-Minute Video Verification',
                  desc: 'Have a brief live video chat before departing. Legitimate matches will happily wave hello; imposter syndicates always make excuses.',
                },
              ].map((step) => {
                const isDone = checkedSteps.includes(step.id);
                return (
                  <div
                    key={step.id}
                    onClick={() => toggleCheck(step.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start space-x-3 ${
                      isDone
                        ? 'bg-cyan-500/10 border-cyan-400/40 text-cyan-200'
                        : 'bg-[#0b132b] border-white/5 text-gray-300 hover:border-cyan-500/20'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                        isDone ? 'bg-cyan-400 text-black font-bold' : 'border border-gray-500'
                      }`}
                    >
                      {isDone && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold">{step.title}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">{step.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Buddy Message Generator */}
            <div className="bg-[#0b132b] p-4 rounded-xl border border-cyan-500/20 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-cyan-300">
                <span>Instant Safety Buddy Check-In SMS:</span>
                <button
                  type="button"
                  onClick={handleCopySos}
                  className="flex items-center space-x-1 text-cyan-400 hover:text-white transition-colors cursor-pointer"
                >
                  {copiedSos ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 text-[11px]">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Copy Text</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <input
                  type="text"
                  value={buddyName}
                  onChange={(e) => setBuddyName(e.target.value)}
                  placeholder="Friend's Name"
                  className="bg-[#070b14] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                />
                <input
                  type="text"
                  value={matchName}
                  onChange={(e) => setMatchName(e.target.value)}
                  placeholder="Date's Name"
                  className="bg-[#070b14] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                />
                <input
                  type="text"
                  value={dateVenue}
                  onChange={(e) => setDateVenue(e.target.value)}
                  placeholder="Venue"
                  className="bg-[#070b14] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-black/60 border border-cyan-500/20 text-xs font-mono text-cyan-200 italic">
                "{sosMessage}"
              </div>
            </div>
          </div>

          {/* Official Emergency & Cybercrime Resources */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-[#070b14] border border-white/10 space-y-1">
              <div className="text-xs font-bold text-white">StopNCII.org</div>
              <p className="text-[11px] text-gray-400">
                Non-consensual intimate image removal tool. Creates cryptographic hashes to block image dissemination across platforms.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#070b14] border border-white/10 space-y-1">
              <div className="text-xs font-bold text-white">IC3.gov (FBI)</div>
              <p className="text-[11px] text-gray-400">
                Federal Bureau of Investigation Internet Crime Complaint Center for romance scams exceeding financial thresholds.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#070b14] border border-white/10 space-y-1">
              <div className="text-xs font-bold text-white">Emergency 911 / 999 / 112</div>
              <p className="text-[11px] text-gray-400">
                If you are in immediate physical danger or being actively followed, contact local emergency services immediately.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {!currentUser ? (
            <div className="p-8 text-center text-xs text-gray-400">
              Sign in to view your documented incident reports.
            </div>
          ) : reports.length === 0 ? (
            <div className="p-8 text-center bg-[#070b14] border border-white/5 rounded-2xl text-xs text-gray-400">
              No incident reports filed under this account.
            </div>
          ) : (
            reports.map((rep) => (
              <div
                key={rep.id}
                className="p-4 rounded-2xl bg-[#070b14] border border-cyan-500/20 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white">{rep.suspectHandle}</span>
                    <span className="text-[10px] text-gray-400 font-mono">({rep.platform})</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300">
                    {rep.status}
                  </span>
                </div>
                <div className="text-gray-300">{rep.incidentDescription}</div>
                {rep.evidenceQuotes && (
                  <div className="p-2 rounded bg-black/40 border border-cyan-500/10 font-mono text-[11px] text-cyan-200">
                    "{rep.evidenceQuotes}"
                  </div>
                )}
                <div className="text-[10px] text-gray-500 font-mono">
                  Report ID: {rep.id} • Filed: {new Date(rep.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
