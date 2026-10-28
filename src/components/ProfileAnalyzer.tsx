import React, { useState } from 'react';
import {
  UserCheck,
  Shield,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  Info,
  ChevronRight,
  Video,
  Search,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api.ts';
import { ProfileAnalysisResult, ProfileInput, User } from '../types/index.ts';

interface ProfileAnalyzerProps {
  currentUser: User | null;
  onOpenAuth: () => void;
}

export const ProfileAnalyzer: React.FC<ProfileAnalyzerProps> = ({ currentUser, onOpenAuth }) => {
  const [claimedName, setClaimedName] = useState('');
  const [claimedProfession, setClaimedProfession] = useState('');
  const [claimedLocation, setClaimedLocation] = useState('');
  const [bioText, setBioText] = useState('');
  const [behaviors, setBehaviors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProfileAnalysisResult | null>(null);
  const [feedbackRecorded, setFeedbackRecorded] = useState<'helpful' | 'incorrect' | null>(null);

  const sampleProfiles = [
    {
      title: '🚨 Classic Overseas Rig Tropes',
      name: 'Richard Vance',
      prof: 'Senior Contract Engineer (North Sea Oil Rig)',
      loc: 'Currently Offshore (Originally London)',
      bio: "Deep-sea drilling engineer. Spend 9 months a year offshore on the oil rig so I can't video call often because of weak satellite signal. Looking for an honest soulmate. Add me on WhatsApp +44 7911 123456 as I am deleting Tinder soon.",
      behaviors: ['Refuses video calls', 'Claims satellite phone only', 'Asks to move to WhatsApp in bio'],
    },
    {
      title: '📈 Pig Butchering Investment Mentor',
      name: 'Chloe Zhang',
      prof: 'Crypto Fund Trader & Wealth Mentor',
      loc: 'San Francisco, CA',
      bio: "Passionate about decentralized finance, blockchain innovation, and luxury travel. Passionate about helping genuine partners attain financial freedom through decentralized node trading. DM me on Telegram @chloe_wealth for life chats.",
      behaviors: ['Brings up crypto investment', 'Telegram handle in bio'],
    },
    {
      title: '🎨 Authentic Local Creative',
      name: 'Elena Rostova',
      prof: 'UX Designer & Ceramicist',
      loc: 'Brooklyn, NY',
      bio: "Making ceramics, hiking in upstate NY, and obsessed with good typography. Love discovering cozy ramen spots in Greenpoint. Let's grab coffee or matcha in the park this weekend!",
      behaviors: [],
    },
  ];

  const handleRunEvaluation = async (override?: ProfileInput) => {
    const input: ProfileInput = override || {
      claimedName,
      claimedProfession,
      claimedLocation,
      bioText,
      suspiciousBehaviors: behaviors,
    };

    if (!input.bioText && !input.claimedProfession) {
      alert('Please provide at least a bio or profession to evaluate.');
      return;
    }

    setLoading(true);
    setFeedbackRecorded(null);

    try {
      const res = await api.analyzeProfile(input);
      setResult(res);
    } catch (e: any) {
      alert(e.message || 'Profile evaluation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (type: 'helpful' | 'incorrect') => {
    if (!result) return;
    if (!currentUser) {
      onOpenAuth();
      return;
    }

    try {
      await api.submitProfileFeedback(result.id, type);
      setFeedbackRecorded(type);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleBehavior = (b: string) => {
    if (behaviors.includes(b)) {
      setBehaviors(behaviors.filter(x => x !== b));
    } else {
      setBehaviors([...behaviors, b]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <UserCheck className="w-4 h-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
            Profile Risk Insights
          </h1>
        </div>
        <p className="text-xs text-gray-400 max-w-2xl">
          Evaluate voluntarily supplied dating profile descriptions, job claims, and interaction patterns for
          known manipulation tropes. Grounded in behavioral consistency, zero demographic bias.
        </p>
      </div>

      {/* Preset Profiles Bar */}
      <div className="bg-[#070b14] border border-cyan-500/20 rounded-2xl p-4 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-gray-200 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Load Evaluation Test Scenarios:</span>
          </span>
          <span className="text-[10px] text-gray-500 font-mono">1-Click Population</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {sampleProfiles.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setClaimedName(p.name);
                setClaimedProfession(p.prof);
                setClaimedLocation(p.loc);
                setBioText(p.bio);
                setBehaviors(p.behaviors);
                handleRunEvaluation({
                  claimedName: p.name,
                  claimedProfession: p.prof,
                  claimedLocation: p.loc,
                  bioText: p.bio,
                  suspiciousBehaviors: p.behaviors,
                });
              }}
              className="text-left p-3 rounded-xl bg-[#0b132b]/80 border border-purple-500/20 hover:border-purple-400/50 hover:bg-[#101b3b] transition-all cursor-pointer group"
            >
              <div className="text-xs font-semibold text-purple-300 group-hover:text-purple-200">
                {p.title}
              </div>
              <div className="text-[11px] text-gray-300 font-mono mt-0.5">
                {p.name} • {p.prof}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Form Input */}
      <div className="bg-[#070b14] border border-cyan-500/30 rounded-2xl p-5 sm:p-6 space-y-4 shadow-[0_0_35px_rgba(0,242,254,0.06)]">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Claimed Name / Handle
            </label>
            <input
              type="text"
              value={claimedName}
              onChange={(e) => setClaimedName(e.target.value)}
              placeholder="e.g. Richard V."
              className="w-full bg-[#0b132b] border border-cyan-500/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Claimed Profession
            </label>
            <input
              type="text"
              value={claimedProfession}
              onChange={(e) => setClaimedProfession(e.target.value)}
              placeholder="e.g. Deep Sea Oil Rig Engineer"
              className="w-full bg-[#0b132b] border border-cyan-500/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              Stated Location
            </label>
            <input
              type="text"
              value={claimedLocation}
              onChange={(e) => setClaimedLocation(e.target.value)}
              placeholder="e.g. Offshore / Overseas"
              className="w-full bg-[#0b132b] border border-cyan-500/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">
            Voluntarily Provided Bio Text
          </label>
          <textarea
            value={bioText}
            onChange={(e) => setBioText(e.target.value)}
            rows={4}
            placeholder="Paste the dating bio text or profile description here..."
            className="w-full bg-[#0b132b] border border-cyan-500/20 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 font-mono resize-y"
          />
        </div>

        {/* Observable Interaction Checkboxes */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-300">
            Observable Behaviors (Optional):
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              'Refuses video calls',
              'Claims camera/satellite broken',
              'Asks to move to WhatsApp in bio',
              'Brings up crypto investment',
              'Claims unable to access bank',
              'Declares deep love before meeting',
            ].map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => toggleBehavior(b)}
                className={`text-xs px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                  behaviors.includes(b)
                    ? 'bg-purple-500/20 text-purple-300 border-purple-400/50 font-semibold'
                    : 'bg-[#0b132b] text-gray-400 border-white/5 hover:text-white'
                }`}
              >
                {behaviors.includes(b) ? '✓ ' : '+ '}
                {b}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-[11px] text-gray-500 flex items-center space-x-1 font-mono">
            <Info className="w-3.5 h-3.5 text-purple-400" />
            <span>Ethical guardrail: No facial or demographic discrimination</span>
          </div>

          <button
            type="button"
            onClick={() => handleRunEvaluation()}
            disabled={loading || (!bioText && !claimedProfession)}
            className="flex items-center space-x-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 disabled:opacity-40 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] cursor-pointer"
          >
            {loading ? (
              <span>Evaluating Claims...</span>
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                <span>Evaluate Profile Risk</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Evaluation Results */}
      {result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div
            className={`p-6 rounded-2xl border ${
              result.riskCategory === 'Critical' || result.riskCategory === 'High'
                ? 'bg-rose-950/20 border-rose-500/40'
                : result.riskCategory === 'Moderate'
                ? 'bg-yellow-950/20 border-yellow-500/40'
                : 'bg-emerald-950/20 border-emerald-500/40'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-xs font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      result.riskCategory === 'Critical' || result.riskCategory === 'High'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : result.riskCategory === 'Moderate'
                        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {result.riskCategory} Profile Risk
                  </span>
                  <span className="text-sm font-bold text-white font-mono">
                    Score: {result.riskScore}/100
                  </span>
                </div>
                <p className="text-xs text-gray-300">
                  {result.inconsistencies.length > 0
                    ? `${result.inconsistencies.length} suspicious persona anomalies or solicitation markers detected.`
                    : 'No anomalous scam tropes detected in provided bio.'}
                </p>
              </div>

              {/* Feedback controls */}
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-gray-400">Mark finding:</span>
                <button
                  onClick={() => handleFeedback('helpful')}
                  className={`p-2 rounded-lg border transition-all cursor-pointer ${
                    feedbackRecorded === 'helpful'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                  }`}
                  title="Mark as helpful"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleFeedback('incorrect')}
                  className={`p-2 rounded-lg border transition-all cursor-pointer ${
                    feedbackRecorded === 'incorrect'
                      ? 'bg-rose-500/20 border-rose-400 text-rose-300'
                      : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                  }`}
                  title="Mark as incorrect"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Inconsistencies List */}
          {result.inconsistencies.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-purple-400" />
                <span>Identified Persona Anomalies</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.inconsistencies.map((inc) => (
                  <div
                    key={inc.id}
                    className="p-4 rounded-2xl bg-[#070b14] border border-purple-500/20 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-rose-300">
                      <span>{inc.signalName}</span>
                      <span className="text-[10px] font-mono text-gray-400">{inc.severity}</span>
                    </div>
                    <p className="text-xs text-gray-300">{inc.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Practical Offline Verification Protocol */}
          <div className="p-5 rounded-2xl bg-[#0b132b] border border-cyan-500/30 space-y-3">
            <h3 className="text-xs font-bold text-cyan-300 tracking-wide uppercase font-mono flex items-center space-x-2">
              <Video className="w-4 h-4 text-cyan-400" />
              <span>Recommended Safe Verification Protocol</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-300">
              <div className="p-3 rounded-xl bg-[#070b14] border border-white/5 space-y-1">
                <div className="font-semibold text-white">1. Casual 2-Minute Video Call</div>
                <p className="text-gray-400">
                  Request a quick in-app video chat before meeting. Real matches will happily say hello; scam rings
                  consistently decline with excuses about broken cameras or military clearance.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#070b14] border border-white/5 space-y-1">
                <div className="font-semibold text-white">2. Reverse Image Verification</div>
                <p className="text-gray-400">
                  Voluntarily shared photos can be tested with Google Lens or Yandex Images to see if they belong
                  to a foreign fashion model or adult content creator.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
