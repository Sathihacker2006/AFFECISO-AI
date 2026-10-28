export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical';

export interface FindingSignal {
  id: string;
  category: 'financial_pressure' | 'credential_theft' | 'urgency_crisis' | 'coercion_blackmail' | 'suspicious_link' | 'off_platform_lure' | 'inconsistent_claims';
  categoryLabel: string;
  severity: RiskLevel;
  signalName: string;
  evidenceQuote: string;
  explanation: string;
  relevanceWeight: number; // 0 to 100
}

export interface RecommendedAction {
  id: string;
  priority: 'Immediate' | 'Important' | 'Advisory';
  actionTitle: string;
  description: string;
  suggestedReply?: string;
  actionType: 'block' | 'refuse' | 'verify_offline' | 'report' | 'preserve_evidence';
}

export interface AnalysisResult {
  id: string;
  userId?: string;
  inputContent: string;
  inputType: 'message' | 'profile';
  contextCategory?: string;
  riskCategory: RiskLevel;
  riskScore: number; // 0 - 100
  confidenceScore: number; // 0 - 100
  findings: FindingSignal[];
  recommendations: RecommendedAction[];
  analysisMethod: 'hybrid_ai' | 'rule_engine_baseline';
  aiProviderUsed?: string;
  limitationsDisclaimer: string;
  createdAt: string;
  isDemo?: boolean;
}

export interface ProfileInput {
  claimedName?: string;
  claimedAge?: string;
  claimedProfession?: string;
  claimedLocation?: string;
  bioText: string;
  suspiciousBehaviors?: string[];
}

export interface ProfileAnalysisResult {
  id: string;
  userId?: string;
  profileInput: ProfileInput;
  riskCategory: RiskLevel;
  riskScore: number;
  confidenceScore: number;
  inconsistencies: FindingSignal[];
  authenticityIndicators: string[];
  recommendations: RecommendedAction[];
  userFeedback?: 'helpful' | 'incorrect' | null;
  createdAt: string;
}

export interface UserReport {
  id: string;
  userId: string;
  userEmail: string;
  suspectHandle: string;
  platform: string;
  reportCategory: 'money_solicitation' | 'impersonation' | 'extortion_threat' | 'suspicious_links' | 'inappropriate_contact' | 'fake_profile';
  incidentDescription: string;
  evidenceQuotes?: string;
  status: 'Received' | 'Triaged' | 'Archived';
  suggestedProtections: string[];
  createdAt: string;
}

export interface PrivacySettings {
  userId: string;
  retentionDays: number; // 7, 30, 90, 0 (never store raw)
  anonymizeAnalysisHistory: boolean;
  autoRedactSensitiveData: boolean; // phone, emails, financial accounts
  allowTelemetryAggregation: boolean;
  twoFactorEnabled: boolean;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface SafetyCompanionMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isQuickAction?: boolean;
  suggestedAction?: string;
}

export interface AdminAnalytics {
  totalAnalyses: number;
  analysesToday: number;
  totalReports: number;
  activeUsers: number;
  riskDistribution: {
    Low: number;
    Moderate: number;
    High: number;
    Critical: number;
  };
  topScamCategories: { category: string; count: number }[];
  systemHealth: {
    status: 'optimal' | 'degraded' | 'offline';
    geminiAiStatus: 'connected' | 'fallback_active';
    averageLatencyMs: number;
    dbStatus: 'healthy';
  };
}
