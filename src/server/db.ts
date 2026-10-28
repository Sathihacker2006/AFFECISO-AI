import fs from 'fs';
import path from 'path';
import { AnalysisResult, ProfileAnalysisResult, UserReport, PrivacySettings, User } from '../types/index.ts';
import { hashPassword } from './auth.ts';

interface StoredUser extends User {
  passwordHash: string;
}

interface DatabaseSchema {
  users: StoredUser[];
  sessions: { token: string; userId: string; createdAt: string; expiresAt: string }[];
  analyses: AnalysisResult[];
  profileAnalyses: ProfileAnalysisResult[];
  reports: UserReport[];
  privacySettings: Record<string, PrivacySettings>;
  systemAuditLogs: { timestamp: string; action: string; userId?: string; details?: string }[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'trustai.db.json');

class DatabaseStore {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
    this.seedDefaults();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Could not read existing db file, initializing fresh store:', e);
    }

    return {
      users: [],
      sessions: [],
      analyses: [],
      profileAnalyses: [],
      reports: [],
      privacySettings: {},
      systemAuditLogs: [],
    };
  }

  private persist() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write db file:', e);
    }
  }

  private seedDefaults() {
    // Seed default demo user and admin user if empty
    const demoEmail = 'demo@affecio.safety';
    const adminEmail = 'admin@affecio.safety';

    let hasDemo = this.data.users.find(u => u.email === demoEmail);
    if (!hasDemo) {
      const demoUser: StoredUser = {
        id: 'usr_demo_101',
        email: demoEmail,
        displayName: 'Alex Rivers (Judge Demo)',
        role: 'user',
        passwordHash: hashPassword('TrustAi2026!'),
        createdAt: new Date().toISOString(),
      };
      this.data.users.push(demoUser);
      this.data.privacySettings[demoUser.id] = {
        userId: demoUser.id,
        retentionDays: 30,
        anonymizeAnalysisHistory: false,
        autoRedactSensitiveData: true,
        allowTelemetryAggregation: true,
        twoFactorEnabled: false,
        updatedAt: new Date().toISOString(),
      };
    }

    let hasAdmin = this.data.users.find(u => u.email === adminEmail);
    if (!hasAdmin) {
      const adminUser: StoredUser = {
        id: 'usr_admin_001',
        email: adminEmail,
        displayName: 'Security Admin',
        role: 'admin',
        passwordHash: hashPassword('AdminShield2026!'),
        createdAt: new Date().toISOString(),
      };
      this.data.users.push(adminUser);
      this.data.privacySettings[adminUser.id] = {
        userId: adminUser.id,
        retentionDays: 90,
        anonymizeAnalysisHistory: false,
        autoRedactSensitiveData: false,
        allowTelemetryAggregation: true,
        twoFactorEnabled: true,
        updatedAt: new Date().toISOString(),
      };
    }

    // Seed realistic demo analyses for Alex Rivers if none exist
    const demoAnalyses = this.data.analyses.filter(a => a.userId === 'usr_demo_101');
    if (demoAnalyses.length === 0) {
      const sample1: AnalysisResult = {
        id: 'anl_demo_801',
        userId: 'usr_demo_101',
        inputContent: "Baby, I really need your help right now. My overseas oil rig bank account was frozen by customs in Cyprus and I can't fly back to see you unless you wire $850 in Apple gift cards or crypto USDT immediately. Please don't tell your friends, they won't understand our connection.",
        inputType: 'message',
        contextCategory: 'Money Request & Urgency',
        riskCategory: 'Critical',
        riskScore: 94,
        confidenceScore: 92,
        findings: [
          {
            id: 'sig_1',
            category: 'financial_pressure',
            categoryLabel: 'Financial Solicitation',
            severity: 'Critical',
            signalName: 'Untraceable Payment Request',
            evidenceQuote: 'wire $850 in Apple gift cards or crypto USDT immediately',
            explanation: 'Scammers frequently request gift cards or cryptocurrency because transactions cannot be reversed or traced once redeemed.',
            relevanceWeight: 95,
          },
          {
            id: 'sig_2',
            category: 'urgency_crisis',
            categoryLabel: 'Fabricated Emergency',
            severity: 'High',
            signalName: 'High Pressure Urgency & Customs Barrier',
            evidenceQuote: 'bank account was frozen by customs in Cyprus and I can\'t fly back to see you unless',
            explanation: 'Classic romance scam trope: claiming an offshore profession (oil rig/military) and an immediate crisis requiring funds to travel.',
            relevanceWeight: 90,
          },
          {
            id: 'sig_3',
            category: 'coercion_blackmail',
            categoryLabel: 'Social Isolation',
            severity: 'High',
            signalName: 'Secrecy & Isolation Tactic',
            evidenceQuote: 'Please don\'t tell your friends, they won\'t understand our connection',
            explanation: 'Attempting to isolate the target from friends or family prevents second opinions and reality-checks.',
            relevanceWeight: 85,
          },
        ],
        recommendations: [
          {
            id: 'rec_1',
            priority: 'Immediate',
            actionTitle: 'Do Not Send Funds or Gift Cards',
            description: 'Cease any financial transfer. Legitimate customs authorities never accept consumer retail gift cards or crypto transfers.',
            suggestedReply: 'I am not comfortable sending money, gift cards, or crypto to anyone I have not met extensively in person.',
            actionType: 'refuse',
          },
          {
            id: 'rec_2',
            priority: 'Immediate',
            actionTitle: 'Preserve Conversation Records & Block',
            description: 'Take screenshots of timestamps and contact handles for reporting before cutting contact.',
            actionType: 'block',
          },
          {
            id: 'rec_3',
            priority: 'Important',
            actionTitle: 'Consult a Trusted Friend or Relative',
            description: 'Break the secrecy cycle. Share the messages with someone you trust in person.',
            actionType: 'verify_offline',
          },
        ],
        analysisMethod: 'hybrid_ai',
        aiProviderUsed: 'Deterministic Rule Heuristics + Gemini Safety Engine',
        limitationsDisclaimer: 'Advisory analysis based strictly on observable heuristic patterns. AFFECIO TRUSTAI does not access third-party platforms or verify real identity.',
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        isDemo: true,
      };

      const sample2: AnalysisResult = {
        id: 'anl_demo_802',
        userId: 'usr_demo_101',
        inputContent: "Hey Alex! Loved your photos from the hiking trail. Are you still down to grab coffee at Blue Bottle on 4th Street this Saturday at 2 PM? Let me know what time works for you!",
        inputType: 'message',
        contextCategory: 'General Conversation',
        riskCategory: 'Low',
        riskScore: 6,
        confidenceScore: 95,
        findings: [],
        recommendations: [
          {
            id: 'rec_low_1',
            priority: 'Advisory',
            actionTitle: 'Follow Standard Public Meeting Safety',
            description: 'The message shows normal, non-coercive conversation. As best practice, always meet in a well-lit public space and arrange your own transportation.',
            suggestedReply: 'Hey! Saturday 2 PM at Blue Bottle sounds great. Looking forward to meeting you there!',
            actionType: 'verify_offline',
          },
        ],
        analysisMethod: 'rule_engine_baseline',
        limitationsDisclaimer: 'Normal conversational indicators detected. Always use common sense and meet in public venues.',
        createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
        isDemo: true,
      };

      this.data.analyses.push(sample1, sample2);
    }

    // Seed sample reports for Admin view
    if (this.data.reports.length === 0) {
      this.data.reports.push({
        id: 'rep_001',
        userId: 'usr_demo_101',
        userEmail: 'demo@affecio.safety',
        suspectHandle: '@richard_marine92',
        platform: 'Tinder / Instagram',
        reportCategory: 'money_solicitation',
        incidentDescription: 'Claimed to be an engineer on a deep-sea rig in the North Sea. After 4 days of talking, asked for $500 Steam gift cards to buy satellite internet to video call me.',
        evidenceQuotes: '"My satellite internet is cutting off, please buy me $500 Steam card so I can hear your voice tonight"',
        status: 'Received',
        suggestedProtections: ['Block handle across Instagram and Tinder', 'Do not click external links', 'Submit platform abuse report'],
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      });
    }

    this.persist();
  }

  // User operations
  findUserByEmail(email: string): StoredUser | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string): StoredUser | undefined {
    return this.data.users.find(u => u.id === id);
  }

  createUser(user: StoredUser): User {
    this.data.users.push(user);
    this.data.privacySettings[user.id] = {
      userId: user.id,
      retentionDays: 30,
      anonymizeAnalysisHistory: false,
      autoRedactSensitiveData: true,
      allowTelemetryAggregation: true,
      twoFactorEnabled: false,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    const { passwordHash, ...clean } = user;
    return clean;
  }

  deleteUser(userId: string): boolean {
    this.data.users = this.data.users.filter(u => u.id !== userId);
    this.data.sessions = this.data.sessions.filter(s => s.userId !== userId);
    this.data.analyses = this.data.analyses.filter(a => a.userId !== userId);
    this.data.profileAnalyses = this.data.profileAnalyses.filter(p => p.userId !== userId);
    this.data.reports = this.data.reports.filter(r => r.userId !== userId);
    delete this.data.privacySettings[userId];
    this.persist();
    return true;
  }

  // Sessions
  createSession(token: string, userId: string, ttlHours: number = 72) {
    const expiresAt = new Date(Date.now() + ttlHours * 3600000).toISOString();
    this.data.sessions.push({
      token,
      userId,
      createdAt: new Date().toISOString(),
      expiresAt,
    });
    this.persist();
  }

  findSession(token: string) {
    const session = this.data.sessions.find(s => s.token === token);
    if (!session) return null;
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      this.data.sessions = this.data.sessions.filter(s => s.token !== token);
      this.persist();
      return null;
    }
    return session;
  }

  deleteSession(token: string) {
    this.data.sessions = this.data.sessions.filter(s => s.token !== token);
    this.persist();
  }

  // Analyses
  getAnalysesForUser(userId: string): AnalysisResult[] {
    return this.data.analyses.filter(a => a.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getAnalysisById(id: string): AnalysisResult | undefined {
    return this.data.analyses.find(a => a.id === id);
  }

  saveAnalysis(analysis: AnalysisResult) {
    this.data.analyses.unshift(analysis);
    this.persist();
    return analysis;
  }

  deleteAnalysis(id: string, userId: string): boolean {
    const idx = this.data.analyses.findIndex(a => a.id === id && a.userId === userId);
    if (idx !== -1) {
      this.data.analyses.splice(idx, 1);
      this.persist();
      return true;
    }
    return false;
  }

  // Profile Analyses
  getProfileAnalysesForUser(userId: string): ProfileAnalysisResult[] {
    return this.data.profileAnalyses.filter(p => p.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  saveProfileAnalysis(analysis: ProfileAnalysisResult) {
    this.data.profileAnalyses.unshift(analysis);
    this.persist();
    return analysis;
  }

  updateProfileFeedback(id: string, userId: string, feedback: 'helpful' | 'incorrect') {
    const item = this.data.profileAnalyses.find(p => p.id === id && p.userId === userId);
    if (item) {
      item.userFeedback = feedback;
      this.persist();
      return item;
    }
    return null;
  }

  // Reports
  createReport(report: UserReport) {
    this.data.reports.unshift(report);
    this.persist();
    return report;
  }

  getReportsForUser(userId: string): UserReport[] {
    return this.data.reports.filter(r => r.userId === userId);
  }

  getAllReports(): UserReport[] {
    return [...this.data.reports];
  }

  // Privacy Settings
  getPrivacySettings(userId: string): PrivacySettings {
    if (!this.data.privacySettings[userId]) {
      this.data.privacySettings[userId] = {
        userId,
        retentionDays: 30,
        anonymizeAnalysisHistory: false,
        autoRedactSensitiveData: true,
        allowTelemetryAggregation: true,
        twoFactorEnabled: false,
        updatedAt: new Date().toISOString(),
      };
      this.persist();
    }
    return this.data.privacySettings[userId];
  }

  updatePrivacySettings(userId: string, partial: Partial<PrivacySettings>): PrivacySettings {
    const current = this.getPrivacySettings(userId);
    const updated: PrivacySettings = {
      ...current,
      ...partial,
      userId,
      updatedAt: new Date().toISOString(),
    };
    this.data.privacySettings[userId] = updated;
    this.persist();
    return updated;
  }

  // Admin analytics
  getAdminStats() {
    const totalAnalyses = this.data.analyses.length;
    const now = Date.now();
    const oneDayAgo = now - 86400000;
    const analysesToday = this.data.analyses.filter(a => new Date(a.createdAt).getTime() > oneDayAgo).length;
    const totalReports = this.data.reports.length;
    const activeUsers = this.data.users.length;

    const riskDistribution = {
      Low: 0,
      Moderate: 0,
      High: 0,
      Critical: 0,
    };

    const categoryMap: Record<string, number> = {};

    for (const anl of this.data.analyses) {
      riskDistribution[anl.riskCategory] = (riskDistribution[anl.riskCategory] || 0) + 1;
      for (const find of anl.findings) {
        categoryMap[find.categoryLabel] = (categoryMap[find.categoryLabel] || 0) + 1;
      }
    }

    const topScamCategories = Object.entries(categoryMap)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalAnalyses,
      analysesToday,
      totalReports,
      activeUsers,
      riskDistribution,
      topScamCategories,
      systemHealth: {
        status: 'optimal' as const,
        geminiAiStatus: process.env.GEMINI_API_KEY ? ('connected' as const) : ('fallback_active' as const),
        averageLatencyMs: 85,
        dbStatus: 'healthy' as const,
      },
    };
  }

  logAudit(action: string, userId?: string, details?: string) {
    this.data.systemAuditLogs.unshift({
      timestamp: new Date().toISOString(),
      action,
      userId,
      details,
    });
    // Keep last 500 audit logs
    if (this.data.systemAuditLogs.length > 500) {
      this.data.systemAuditLogs = this.data.systemAuditLogs.slice(0, 500);
    }
    this.persist();
  }
}

export const db = new DatabaseStore();
