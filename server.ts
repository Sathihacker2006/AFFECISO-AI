import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { db } from './src/server/db.ts';
import { hashPassword, verifyPassword, generateToken } from './src/server/auth.ts';
import {
  sanitizeInput,
  evaluateDeterministicRules,
  analyzeMessageWithGemini,
  synthesizeAnalysis,
  evaluateProfile,
  generateSafetyCompanionResponse,
} from './src/server/engine.ts';
import { User } from './src/types/index.ts';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json({ limit: '5mb' }));

// Auth Middleware
interface AuthenticatedRequest extends Request {
  user?: User;
}

const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Authentication token required.' });
  }

  const token = authHeader.split(' ')[1];
  const session = db.findSession(token);
  if (!session) {
    return res.status(401).json({ error: 'Session expired or invalid.' });
  }

  const user = db.findUserById(session.userId);
  if (!user) {
    return res.status(401).json({ error: 'User account not found.' });
  }

  const { passwordHash, ...cleanUser } = user as any;
  req.user = cleanUser;
  next();
};

const optionalAuth = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const session = db.findSession(token);
    if (session) {
      const user = db.findUserById(session.userId);
      if (user) {
        const { passwordHash, ...cleanUser } = user as any;
        req.user = cleanUser;
      }
    }
  }
  next();
};

const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access forbidden. Administrator privileges required.' });
  }
  next();
};

// ----------------- AUTH ENDPOINTS -----------------
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const { email, password, displayName } = req.body;
    if (!email || !password || !displayName) {
      return res.status(400).json({ error: 'Email, password, and display name are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
    }

    const existing = db.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      email: email.trim().toLowerCase(),
      displayName: displayName.trim(),
      role: 'user' as const,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    const cleanUser = db.createUser(newUser);
    const token = generateToken();
    db.createSession(token, cleanUser.id);
    db.logAudit('USER_REGISTERED', cleanUser.id, `User ${cleanUser.email} registered.`);

    res.status(201).json({
      user: cleanUser,
      token,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to register user.' });
  }
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken();
    db.createSession(token, user.id);
    db.logAudit('USER_LOGIN', user.id, `User ${user.email} signed in.`);

    const { passwordHash, ...cleanUser } = user;
    res.json({
      user: cleanUser,
      token,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Login failed.' });
  }
});

app.post('/api/auth/logout', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    db.deleteSession(token);
  }
  res.json({ message: 'Successfully signed out.' });
});

app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.user });
});

// ----------------- ANALYSIS ENDPOINTS -----------------
app.post('/api/analyze/message', optionalAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { messageText, contextCategory } = req.body;
    if (!messageText || typeof messageText !== 'string' || messageText.trim().length === 0) {
      return res.status(400).json({ error: 'Message text is required for safety analysis.' });
    }

    const sanitized = sanitizeInput(messageText);

    // Stage 2: Deterministic detection rules
    const deterministicFindings = evaluateDeterministicRules(sanitized);

    // Stage 3: Gemini hybrid interpretation (if key available)
    const geminiResult = await analyzeMessageWithGemini(sanitized, contextCategory);

    // Stage 4-6: Synthesize composite risk score and actionable advice
    const analysis = synthesizeAnalysis(sanitized, deterministicFindings, geminiResult, contextCategory);

    if (req.user) {
      analysis.userId = req.user.id;
      db.saveAnalysis(analysis);
      db.logAudit('MESSAGE_ANALYZED', req.user.id, `Analysis ${analysis.id} produced score ${analysis.riskScore}`);
    }

    res.json(analysis);
  } catch (err: any) {
    console.error('Error in message analysis endpoint:', err);
    res.status(500).json({ error: 'Analysis failed. Please try again.' });
  }
});

app.post('/api/analyze/profile', optionalAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { claimedName, claimedAge, claimedProfession, claimedLocation, bioText, suspiciousBehaviors } = req.body;
    if (!bioText && !claimedProfession && !claimedName) {
      return res.status(400).json({ error: 'At least bio text or profession must be provided for profile evaluation.' });
    }

    const profileData = {
      claimedName: sanitizeInput(claimedName || ''),
      claimedAge: sanitizeInput(claimedAge || ''),
      claimedProfession: sanitizeInput(claimedProfession || ''),
      claimedLocation: sanitizeInput(claimedLocation || ''),
      bioText: sanitizeInput(bioText || ''),
      suspiciousBehaviors: Array.isArray(suspiciousBehaviors) ? suspiciousBehaviors : [],
    };

    const result = evaluateProfile(profileData);

    if (req.user) {
      result.userId = req.user.id;
      db.saveProfileAnalysis(result);
      db.logAudit('PROFILE_ANALYZED', req.user.id, `Profile analysis ${result.id} created.`);
    }

    res.json(result);
  } catch (err: any) {
    console.error('Profile evaluation error:', err);
    res.status(500).json({ error: 'Profile evaluation failed.' });
  }
});

app.post('/api/profile/feedback', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const { id, feedback } = req.body;
  if (!id || (feedback !== 'helpful' && feedback !== 'incorrect')) {
    return res.status(400).json({ error: 'Valid analysis ID and feedback value required.' });
  }

  const updated = db.updateProfileFeedback(id, req.user!.id, feedback);
  if (!updated) {
    return res.status(404).json({ error: 'Profile analysis record not found or not owned by user.' });
  }

  res.json({ message: 'Feedback recorded', result: updated });
});

app.get('/api/analyses', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const list = db.getAnalysesForUser(req.user!.id);
  res.json({ analyses: list });
});

app.get('/api/analyses/:analysis_id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const analysis = db.getAnalysisById(req.params.analysis_id);
  if (!analysis) {
    return res.status(404).json({ error: 'Analysis not found.' });
  }
  if (analysis.userId !== req.user!.id && req.user!.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied to this analysis record.' });
  }
  res.json(analysis);
});

app.delete('/api/analyses/:analysis_id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const deleted = db.deleteAnalysis(req.params.analysis_id, req.user!.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Analysis not found or permission denied.' });
  }
  db.logAudit('ANALYSIS_DELETED', req.user!.id, `Analysis ${req.params.analysis_id} deleted.`);
  res.json({ message: 'Analysis successfully deleted.' });
});

// ----------------- REPORTS ENDPOINTS -----------------
app.post('/api/reports', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { suspectHandle, platform, reportCategory, incidentDescription, evidenceQuotes } = req.body;
    if (!suspectHandle || !platform || !reportCategory || !incidentDescription) {
      return res.status(400).json({ error: 'Suspect handle, platform, category, and description are required.' });
    }

    const report = {
      id: `rep_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      userId: req.user!.id,
      userEmail: req.user!.email,
      suspectHandle: sanitizeInput(suspectHandle),
      platform: sanitizeInput(platform),
      reportCategory,
      incidentDescription: sanitizeInput(incidentDescription),
      evidenceQuotes: sanitizeInput(evidenceQuotes || ''),
      status: 'Received' as const,
      suggestedProtections: [
        'Block and report the account on the host dating app',
        'Cease further communication immediately',
        'Preserve conversation screenshots in a secure folder',
      ],
      createdAt: new Date().toISOString(),
    };

    db.createReport(report);
    db.logAudit('REPORT_FILED', req.user!.id, `Incident report ${report.id} created.`);
    res.status(201).json(report);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to record report.' });
  }
});

app.get('/api/reports', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  if (req.user!.role === 'admin') {
    return res.json({ reports: db.getAllReports() });
  }
  res.json({ reports: db.getReportsForUser(req.user!.id) });
});

// ----------------- PRIVACY SETTINGS -----------------
app.get('/api/privacy/settings', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const settings = db.getPrivacySettings(req.user!.id);
  res.json(settings);
});

app.patch('/api/privacy/settings', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const updated = db.updatePrivacySettings(req.user!.id, req.body);
  db.logAudit('PRIVACY_UPDATED', req.user!.id, 'Privacy settings modified.');
  res.json(updated);
});

app.delete('/api/account', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  db.deleteUser(userId);
  db.logAudit('ACCOUNT_DELETED', userId, 'Account and related records wiped.');
  res.json({ message: 'User account and all associated analyses have been permanently purged.' });
});

// ----------------- AI SAFETY COMPANION -----------------
app.post('/api/companion/chat', async (req: Request, res: Response) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const replyText = await generateSafetyCompanionResponse(message, Array.isArray(history) ? history : []);
    res.json({ reply: replyText });
  } catch (e: any) {
    res.status(500).json({ error: 'Safety companion response generation failed.' });
  }
});

// ----------------- ADMIN & ANALYTICS -----------------
app.get('/api/admin/analytics', requireAuth, requireAdmin, (_req: AuthenticatedRequest, res: Response) => {
  const stats = db.getAdminStats();
  res.json(stats);
});

app.post('/api/admin/run-tests', requireAuth, requireAdmin, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const { runAcceptanceTests } = await import('./src/server/acceptance_tests.ts');
    const testReport = await runAcceptanceTests(`http://localhost:${PORT}`);
    res.json(testReport);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to execute test suite' });
  }
});

// Vite Middleware for Fullstack App
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🛡️  AFFECIO TRUSTAI Server listening on port ${PORT}`);
  });
}

startServer();
