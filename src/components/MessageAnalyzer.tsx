import React, { useState } from 'react';
import {
  Shield,
  Sparkles,
  MessageSquare,
  AlertTriangle,
  Copy,
  Check,
  Send,
  Trash2,
  BookmarkCheck,
  FileText,
  Upload,
  Info,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { api } from '../services/api.ts';
import { AnalysisResult, User } from '../types/index.ts';

interface MessageAnalyzerProps {
  currentUser: User | null;
  onOpenAuth: () => void;
}

export const MessageAnalyzer: React.FC<MessageAnalyzerProps> = ({ currentUser, onOpenAuth }) => {
  const [messageText, setMessageText] = useState('');
  const [contextCategory, setContextCategory] = useState('General Conversation');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [copiedActionId, setCopiedActionId] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const testScenarios = [
    {
      title: '🚨 Offshore Rig Gift Card Wire',
      desc: 'Romance scam emergency trope requesting retail cards',
      context: 'Money / Emergency Request',
      text: "Dearest, I am writing to you from the offshore oil rig near Cyprus. Our satellite line is failing and my bank account was frozen by customs. I need you to buy me $850 in Apple gift cards or crypto USDT right now so I can pay the customs agent and fly back to be with you. Please do not tell your family, they will not understand our deep spiritual connection.",
    },
    {
      title: '🔑 Google Voice 2FA Account Takeover',
      desc: 'Harvesting authentication codes under the guise of verification',
      context: 'Identity Verification Claim',
      text: "Hey! Before we chat more, my dating app says I need to verify you're real. I just sent a 6-digit Google verification code to your phone. Can you send me the code you just got right away so we can keep talking?",
    },
    {
      title: '📈 Pig Butchering (Sha Zhu Pan) Crypto Lure',
      desc: 'Fabricated insider investment mentorship',
      context: 'Financial / Investment Scheme',
      text: "I was just checking my node trading portfolio—my uncle is a VP at a Hong Kong financial firm and gave me insider tips. I made 25% returns on this decentralized crypto platform today. You should deposit $500 on trade-secure.xyz, I will teach you step by step!",
    },
    {
      title: '✈️ Premature Off-Platform Migration',
      desc: 'Rushing off-app before safety filters detect fraudulent account',
      context: 'Moving Off-Platform',
      text: "Hey gorgeous, I barely check this dating app and I'm deleting my profile tonight because people here are weird. Text me on Telegram @sara_gold99 right now so we don't lose touch!",
    },
    {
      title: '☕ Healthy Casual Public Date',
      desc: 'Benign, respectful, low-pressure invitation',
      context: 'General Conversation',
      text: "Hey! I really enjoyed our conversation about dog rescues. Would you be open to grabbing coffee at the cafe next to Washington Square Park this Saturday afternoon? Absolutely no pressure, let me know what works for you!",
    },
  ];

  const handleRunAnalysis = async (customText?: string, customContext?: string) => {
    const text = customText || messageText;
    const ctx = customContext || contextCategory;
    if (!text.trim()) return;

    setLoading(true);
    setSavedSuccess(false);

    try {
      const result = await api.analyzeMessage(text, ctx);
      setAnalysisResult(result);
    } catch (err: any) {
      console.error('Analysis failed:', err);
      alert(err.message || 'Analysis failed. Please check input.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyReply = (actionId: string, replyText?: string) => {
    if (!replyText) return;
    navigator.clipboard.writeText(replyText);
    setCopiedActionId(actionId);
    setTimeout(() => setCopiedActionId(null), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setMessageText(content.slice(0, 5000));
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Workspace Header */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
            TrustScan AI — Message Safety Analyzer
          </h1>
        </div>
        <p className="text-xs text-gray-400 max-w-2xl">
          Evaluate suspicious messages from dating applications for coercion, financial demands, phishing links,
          and identity harvesting. Grounded in exact quotes with explainable heuristic evidence.
        </p>
      </div>

      {/* Preset Test Case Bar */}
      <div className="bg-[#070b14] border border-cyan-500/20 rounded-2xl p-4 space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-gray-200 flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Hackathon Evaluation Test Scenarios:</span>
          </span>
          <span className="text-[10px] text-gray-500 font-mono">1-Click Fast Load</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {testScenarios.map((sc, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setMessageText(sc.text);
                setContextCategory(sc.context);
                handleRunAnalysis(sc.text, sc.context);
              }}
              className="text-left p-2.5 rounded-xl bg-[#0b132b]/80 border border-cyan-500/20 hover:border-cyan-400/50 hover:bg-[#0f1d45] transition-all cursor-pointer group"
            >
              <div className="text-xs font-semibold text-cyan-300 group-hover:text-cyan-200">
                {sc.title}
              </div>
              <div className="text-[10px] text-gray-400 line-clamp-1">
                {sc.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Analysis Input Box */}
      <div className="bg-[#070b14] border border-cyan-500/30 rounded-2xl p-5 sm:p-6 space-y-4 shadow-[0_0_35px_rgba(0,242,254,0.08)]">
        {/* Context Selector & File Upload */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <label className="text-xs font-semibold text-gray-300">
              Interaction Context:
            </label>
            <select
              value={contextCategory}
              onChange={(e) => setContextCategory(e.target.value)}
              className="bg-[#0b132b] border border-cyan-500/30 text-cyan-300 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-400"
            >
              <option value="General Conversation">General Conversation</option>
              <option value="Money / Emergency Request">Money / Emergency Request</option>
              <option value="Identity Verification Claim">Identity Verification Claim</option>
              <option value="Moving Off-Platform">Moving Off-Platform (Telegram/WhatsApp)</option>
              <option value="Financial / Investment Scheme">Financial / Investment Scheme</option>
              <option value="Suspicious Link or Download">Suspicious Link or Download</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-1.5 text-xs text-gray-400 hover:text-cyan-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl cursor-pointer transition-all">
              <Upload className="w-3.5 h-3.5" />
              <span>Import .txt File</span>
              <input
                type="file"
                accept=".txt,.log"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            {messageText && (
              <button
                type="button"
                onClick={() => {
                  setMessageText('');
                  setAnalysisResult(null);
                }}
                className="text-xs text-gray-500 hover:text-rose-400 p-1.5 rounded-lg transition-colors"
                title="Clear input"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Text Area */}
        <div className="relative">
          <textarea
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            rows={5}
            placeholder="Paste text messages, direct messages, or suspicious chat transcripts here..."
            className="w-full bg-[#0b132b] border border-cyan-500/20 rounded-xl p-3.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 font-mono resize-y"
          />
        </div>

        {/* Footer controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-center space-x-2 text-[11px] text-gray-500 font-mono">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>{messageText.length} characters • Privacy-safe parsing</span>
          </div>

          <button
            type="button"
            onClick={() => handleRunAnalysis()}
            disabled={loading || !messageText.trim()}
            className="flex items-center justify-center space-x-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-40 text-[#070b14] font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-[0_0_20px_rgba(0,242,254,0.3)] cursor-pointer"
          >
            {loading ? (
              <span>Analyzing Security Signals...</span>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                <span>Run TrustScan Analysis</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Results View */}
      {analysisResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Risk Summary Header Banner */}
          <div
            className={`p-6 rounded-2xl border ${
              analysisResult.riskCategory === 'Critical'
                ? 'bg-rose-950/20 border-rose-500/40 shadow-[0_0_40px_rgba(244,63,94,0.15)]'
                : analysisResult.riskCategory === 'High'
                ? 'bg-orange-950/20 border-orange-500/40 shadow-[0_0_40px_rgba(249,115,22,0.15)]'
                : analysisResult.riskCategory === 'Moderate'
                ? 'bg-yellow-950/20 border-yellow-500/40 shadow-[0_0_40px_rgba(234,179,8,0.15)]'
                : 'bg-emerald-950/20 border-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.15)]'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center space-x-3">
                  <span
                    className={`text-xs font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      analysisResult.riskCategory === 'Critical'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : analysisResult.riskCategory === 'High'
                        ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                        : analysisResult.riskCategory === 'Moderate'
                        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {analysisResult.riskCategory} Risk Detected
                  </span>
                  <span className="text-sm font-bold text-white font-mono">
                    Score: {analysisResult.riskScore}/100
                  </span>
                </div>
                <p className="text-xs text-gray-300">
                  {analysisResult.riskCategory === 'Critical'
                    ? 'Extreme deception pattern: immediate threats of financial loss, account takeover, or extortion detected.'
                    : analysisResult.riskCategory === 'High'
                    ? 'High-confidence manipulation patterns or premature off-platform migration identified.'
                    : analysisResult.riskCategory === 'Moderate'
                    ? 'Unusual behavioral signals detected. Proceed with measured caution.'
                    : 'Low risk. Message shows normal, non-coercive conversation.'}
                </p>
              </div>

              {/* Engine Badge & Confidence */}
              <div className="flex items-center space-x-3 text-right">
                <div className="text-left md:text-right">
                  <div className="text-[11px] text-cyan-300 font-mono font-semibold">
                    {analysisResult.aiProviderUsed}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    Engine Confidence: {analysisResult.confidenceScore}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detected Warning Signs Cards */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-cyan-400" />
              <span>
                Evidence-Grounded Findings ({analysisResult.findings.length})
              </span>
            </h3>

            {analysisResult.findings.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#070b14] border border-emerald-500/20 text-xs text-emerald-300 flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  ✓
                </div>
                <div>
                  <div className="font-semibold text-emerald-200">No Malicious Signals Detected</div>
                  <div className="text-emerald-400/80 mt-0.5">
                    This message contains no observable financial solicitations, urgency pressures, or credential phishing keywords.
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysisResult.findings.map((finding) => (
                  <div
                    key={finding.id}
                    className="p-4 rounded-2xl bg-[#070b14] border border-cyan-500/20 hover:border-cyan-400/40 transition-all space-y-2.5 shadow-[0_0_20px_rgba(0,242,254,0.04)]"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white tracking-wide">
                        {finding.signalName}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                          finding.severity === 'Critical'
                            ? 'bg-rose-500/20 text-rose-300'
                            : finding.severity === 'High'
                            ? 'bg-orange-500/20 text-orange-300'
                            : 'bg-yellow-500/20 text-yellow-300'
                        }`}
                      >
                        {finding.severity}
                      </span>
                    </div>

                    <div className="bg-[#0b132b] p-2.5 rounded-xl border border-cyan-500/20 space-y-1">
                      <div className="text-[10px] font-mono text-cyan-400">
                        EXACT QUOTED EVIDENCE:
                      </div>
                      <p className="text-xs text-cyan-200 font-mono break-words leading-relaxed">
                        "{finding.evidenceQuote}"
                      </p>
                    </div>

                    <p className="text-xs text-gray-300 leading-relaxed">
                      {finding.explanation}
                    </p>

                    <div className="text-[10px] text-gray-500 font-mono">
                      Category: {finding.categoryLabel} • Relevance Weight: {finding.relevanceWeight}/100
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Practical Recommended Safety Actions */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white tracking-wide uppercase font-mono flex items-center space-x-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Recommended Next Steps & Refusal Scripts</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysisResult.recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-2xl bg-[#0b132b] border border-indigo-500/30 space-y-3 shadow-[0_0_20px_rgba(99,102,241,0.08)]"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-200">
                      {rec.actionTitle}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                      {rec.priority}
                    </span>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed">
                    {rec.description}
                  </p>

                  {rec.suggestedReply && (
                    <div className="bg-[#070b14] p-3 rounded-xl border border-cyan-500/20 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400">
                        <span>COPYABLE DIPLOMATIC SCRIPT</span>
                        <button
                          type="button"
                          onClick={() => handleCopyReply(rec.id, rec.suggestedReply)}
                          className="flex items-center space-x-1 text-cyan-300 hover:text-white transition-colors cursor-pointer"
                        >
                          {copiedActionId === rec.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Script</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-cyan-200 italic font-mono">
                        "{rec.suggestedReply}"
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Legal / Heuristic Limitations Disclaimer */}
          <div className="p-4 rounded-2xl bg-[#070b14] border border-white/10 text-[11px] text-gray-400 space-y-1">
            <div className="font-semibold text-gray-300 font-mono">
              ⚠️ Heuristic Boundary & Disclaimer:
            </div>
            <p className="leading-relaxed">
              {analysisResult.limitationsDisclaimer} Automated analyses assist user evaluation and are not legal
              declarations of fraud or criminality. Always trust your intuition and seek trusted advice.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
