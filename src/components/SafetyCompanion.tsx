import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User as UserIcon, Sparkles, Shield, HeartHandshake, AlertCircle, Copy, Check } from 'lucide-react';
import { api } from '../services/api.ts';
import { SafetyCompanionMessage } from '../types/index.ts';

export const SafetyCompanion: React.FC = () => {
  const [messages, setMessages] = useState<SafetyCompanionMessage[]>([
    {
      id: 'init_1',
      sender: 'assistant',
      text: "Hello! I am your AFFECIO Safety Companion. Whether you're navigating an awkward financial request, unsure about moving a chat off-platform, or planning a first in-person date, I'm here to provide nonjudgmental advice and practical refusal scripts. How can I help you stay safe today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    'How do I politely decline sending money to a match?',
    'What are the essential safety rules for a first offline date?',
    'Someone wants to switch to Telegram right away. Should I?',
    'What should I do if someone threatens to leak my private photos?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg: SafetyCompanionMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map((m) => ({ sender: m.sender, text: m.text }));
      const reply = await api.askSafetyCompanion(text, history);

      const assistantMsg: SafetyCompanionMessage = {
        id: `msg_a_${Date.now()}`,
        sender: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e: any) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          sender: 'assistant',
          text: "I'm having trouble connecting right now, but remember: never send money or private codes to anyone you haven't verified in person. Your safety is paramount.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Bot className="w-4 h-4" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
            AI Safety Companion
          </h1>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            EMPATHIC SAFETY ADVISOR
          </span>
        </div>
        <p className="text-xs text-gray-400">
          Get real-time, nonjudgmental guidance on romantic boundaries, de-escalation, and online dating safety.
        </p>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
        {quickQuestions.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(q)}
            className="text-xs bg-[#0b132b] hover:bg-[#101b3b] text-cyan-300 border border-cyan-500/20 px-3 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer hover:border-cyan-400/50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Frame */}
      <div className="bg-[#070b14] border border-cyan-500/30 rounded-2xl p-4 sm:p-6 h-[500px] flex flex-col justify-between shadow-[0_0_35px_rgba(0,242,254,0.06)]">
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isUser
                      ? 'bg-gradient-to-tr from-cyan-400 to-indigo-500 text-black font-bold text-xs'
                      : 'bg-cyan-500/20 border border-cyan-400/40 text-cyan-300'
                  }`}
                >
                  {isUser ? 'U' : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-cyan-500/15 border border-cyan-400/30 text-white'
                      : 'bg-[#0b132b] border border-cyan-500/20 text-gray-200'
                  }`}
                >
                  {/* Message formatted with basic line breaks / blockquotes */}
                  <div className="space-y-2 whitespace-pre-wrap">
                    {m.text}
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5 text-[10px] text-gray-500 font-mono">
                    <span>{m.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => handleCopy(m.id, m.text)}
                        className="text-gray-400 hover:text-cyan-300 flex items-center space-x-1"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Advice</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center space-x-2 text-xs text-cyan-400 font-mono bg-[#0b132b] p-3 rounded-xl border border-cyan-500/20 max-w-[240px]">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing scenario...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        <div className="pt-3 border-t border-cyan-500/20">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for advice, e.g. 'He says he needs gas money for our date, what do I say?'"
              className="flex-1 bg-[#0b132b] border border-cyan-500/20 rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 font-mono"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-[#070b14] font-semibold p-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(0,242,254,0.3)] cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
