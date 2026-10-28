# AFFECIO TRUSTAI — Dating Safety, Authenticity & Digital Trust Platform
**AFFECIO Dating & Social Discovery Hackathon**  
**Problem Statement:** PS04 — Trust Before Connection: Safety & Authenticity

---

## 1. Project Overview & Mission
Online dating introduces unprecedented opportunities for romance, but also exposes individuals to sophisticated deception—ranging from romance scams and pig-butchering (Sha Zhu Pan) schemes to 2FA credential theft, emotional extortion, and coerced off-platform migrations.

**AFFECIO TRUSTAI** bridges this vulnerability gap with an evidence-grounded digital safety assistant. Rather than making unsubstantiated claims about proving human identity or judging users by their photos, the platform focuses strictly on **observable linguistic patterns, behavioral anomalies, and manipulation tactics**.

---

## 2. Core Platform Capabilities

1. **TrustScan AI (Message Safety Analyzer):**
   - Hybrid analysis combining a deterministic heuristic rule engine with server-side Gemini 3.8 Flash intelligence.
   - Detects financial solicitation (crypto, wire, gift cards), OTP/2FA code theft, artificial crisis urgency, off-platform lures, and extortion.
   - Provides exact excerpt quotes supporting every signal, severity ratings, and copyable diplomatic refusal scripts.
2. **Profile Risk Insights:**
   - Evaluates voluntarily supplied bio claims and stated professions for known romance scam tropes (e.g. offshore drilling rigs, overseas peacekeeping deployments).
   - Zero demographic or facial discrimination guardrails.
   - Recommends structured offline verification protocols (e.g., 2-minute live video call test).
3. **AI Safety Companion:**
   - Real-time situational advisor that provides nonjudgmental boundaries, de-escalation tips, and safe reply templates.
   - Emphasizes victim safety, evidence preservation, and official reporting channels.
4. **Privacy Guardian:**
   - Complete data sovereignty: user-controlled data retention schedules (7, 30, 90, or 0 days/incognito).
   - Automated PII scrubbing and anonymization.
   - 1-click JSON archive export (`affecio_trustai_export.json`) and instant account/history purging.
5. **Incident Reporting & Offline Meeting Safety Center:**
   - Structured incident documentation vault.
   - 5-point interactive pre-date safety checklist.
   - One-click Emergency Buddy SMS generator with venue and check-in timer.
   - Direct shortcuts to StopNCII.org, IC3.gov, and emergency support.
6. **Interactive 3D Trust Shield:**
   - Procedural 3D WebGL cybernetic shield built with Three.js (zero external 404 assets).
   - Collapsible bottom control dock with Zen Mode, rotation multipliers, and wireframe views.
7. **Admin & Scam Intelligence Radar:**
   - Aggregated prototype metrics, threat category distributions, and dual-engine latency diagnostics.

---

## 3. Technology Architecture & Security

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Three.js (Procedural 3D WebGL).
- **Backend:** Node.js Express full-stack server running on port 3000, Vite dev middleware mounting.
- **AI Engine:** Google GenAI SDK (`@google/genai`) using `gemini-3.8-flash` on server-side with user-agent telemetry.
- **Deterministic Engine:** Regex-based heuristic signature analyzer running on the server as an infallible baseline fallback.
- **Database & Persistence:** File-backed persistent repository (`./data/trustai.db.json`) with atomic writes.
- **Authentication:** Scrypt-based password hashing (`crypto.scryptSync`) with unique salts, crypto bearer session tokens, and strict tenant isolation.

---

## 4. Local Installation & Windows PowerShell Instructions

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Step-by-Step Commands (Windows PowerShell)

```powershell
# 1. Clone repository and navigate to app directory
cd /path/to/applet

# 2. Install dependencies
npm install

# 3. Environment configuration
# Ensure .env exists with required keys:
# GEMINI_API_KEY="your-api-key" (Optional, deterministic fallback active if omitted)
# PORT=3000

# 4. Start the application
npm run dev

# 5. Build for production
npm run build

# 6. Run production server
npm start
```

---

## 5. Judge Quick-Access Credentials

For frictionless evaluation during the hackathon judging period, two pre-configured accounts are available with one-click access in the UI:

- **Judge Demo Account:**
  - Email: `demo@affecio.safety`
  - Password: `TrustAi2026!`
  - Pre-seeded with realistic romance wire scam and benign coffee date analyses.
- **Security Administrator Account:**
  - Email: `admin@affecio.safety`
  - Password: `AdminShield2026!`
  - Unlocks the Admin Scam Intelligence Radar.

---

## 6. 5-Minute Hackathon Demonstration Script

1. **Minute 1 — The Problem (Trust Before Connection):**
   - Introduce the dilemma in modern online dating: 1 in 4 online daters have encountered a romance scam or impersonator, losing billions annually and suffering emotional distress.
2. **Minute 2 — TrustScan AI in Action:**
   - Navigate to **TrustScan AI**. Click the 1-click test scenario *"🚨 Offshore Rig Gift Card Wire"*.
   - Run analysis to reveal the **Critical Risk (100/100)** diagnosis, exact evidence quotes, and copy the diplomatic refusal script.
3. **Minute 3 — Proving Fairness (Zero False Alarms):**
   - Click the 1-click test scenario *"☕ Healthy Casual Public Date"*.
   - Run analysis to show **Low Risk (5/100)** with zero flags, proving that normal dates are never falsely penalized.
4. **Minute 4 — Profile Insights & Safety Companion:**
   - Open **Profile Insights** to evaluate the offshore rig bio and review the 2-minute video verification recommendation.
   - Open **Safety Companion** and show instant refusal guidance for financial manipulation.
5. **Minute 5 — Privacy Guardian & Admin Radar:**
   - Demonstrate the **Privacy Guardian**: download the full data export JSON and show the 0-day incognito retention slider.
   - Switch to **Admin Radar** to show aggregated prototype intelligence and explain our responsible AI principles.
