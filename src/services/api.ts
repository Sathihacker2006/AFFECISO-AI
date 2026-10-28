import {
  AnalysisResult,
  ProfileAnalysisResult,
  ProfileInput,
  UserReport,
  PrivacySettings,
  User,
  AdminAnalytics,
} from '../types/index.ts';

const TOKEN_KEY = 'affecio_trustai_token';
const USER_KEY = 'affecio_trustai_user';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  getUser: (): User | null => {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  setUser: (user: User) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
};

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || `HTTP ${response.status}: Request failed`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Auth
  async register(email: string, password: string, displayName: string): Promise<{ user: User; token: string }> {
    const data = await apiFetch<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    });
    authStorage.setToken(data.token);
    authStorage.setUser(data.user);
    return data;
  },

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const data = await apiFetch<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    authStorage.setToken(data.token);
    authStorage.setUser(data.user);
    return data;
  },

  async logout(): Promise<void> {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } finally {
      authStorage.clearToken();
    }
  },

  async getMe(): Promise<{ user: User }> {
    return apiFetch<{ user: User }>('/api/auth/me');
  },

  // Message Analyzer
  async analyzeMessage(messageText: string, contextCategory?: string): Promise<AnalysisResult> {
    return apiFetch<AnalysisResult>('/api/analyze/message', {
      method: 'POST',
      body: JSON.stringify({ messageText, contextCategory }),
    });
  },

  async getAnalyses(): Promise<{ analyses: AnalysisResult[] }> {
    return apiFetch<{ analyses: AnalysisResult[] }>('/api/analyses');
  },

  async getAnalysisById(id: string): Promise<AnalysisResult> {
    return apiFetch<AnalysisResult>(`/api/analyses/${id}`);
  },

  async deleteAnalysis(id: string): Promise<{ message: string }> {
    return apiFetch<{ message: string }>(`/api/analyses/${id}`, {
      method: 'DELETE',
    });
  },

  // Profile Insights
  async analyzeProfile(profile: ProfileInput): Promise<ProfileAnalysisResult> {
    return apiFetch<ProfileAnalysisResult>('/api/analyze/profile', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  },

  async submitProfileFeedback(id: string, feedback: 'helpful' | 'incorrect'): Promise<void> {
    return apiFetch('/api/profile/feedback', {
      method: 'POST',
      body: JSON.stringify({ id, feedback }),
    });
  },

  // Incident Reports
  async submitReport(report: {
    suspectHandle: string;
    platform: string;
    reportCategory: string;
    incidentDescription: string;
    evidenceQuotes?: string;
  }): Promise<UserReport> {
    return apiFetch<UserReport>('/api/reports', {
      method: 'POST',
      body: JSON.stringify(report),
    });
  },

  async getReports(): Promise<{ reports: UserReport[] }> {
    return apiFetch<{ reports: UserReport[] }>('/api/reports');
  },

  // Privacy Settings
  async getPrivacySettings(): Promise<PrivacySettings> {
    return apiFetch<PrivacySettings>('/api/privacy/settings');
  },

  async updatePrivacySettings(settings: Partial<PrivacySettings>): Promise<PrivacySettings> {
    return apiFetch<PrivacySettings>('/api/privacy/settings', {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  },

  async deleteAccount(): Promise<{ message: string }> {
    const res = await apiFetch<{ message: string }>('/api/account', {
      method: 'DELETE',
    });
    authStorage.clearToken();
    return res;
  },

  // Safety Companion
  async askSafetyCompanion(message: string, history: { sender: string; text: string }[]): Promise<string> {
    const data = await apiFetch<{ reply: string }>('/api/companion/chat', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    });
    return data.reply;
  },

  // Admin
  async getAdminAnalytics(): Promise<AdminAnalytics> {
    return apiFetch<AdminAnalytics>('/api/admin/analytics');
  },

  async runAcceptanceTests(): Promise<{
    total: number;
    passed: number;
    failed: number;
    results: { id: number; criterion: string; passed: boolean; details: string }[];
  }> {
    return apiFetch('/api/admin/run-tests', {
      method: 'POST',
    });
  },
};
