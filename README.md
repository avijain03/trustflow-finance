<div align="center">

<img src="https://img.shields.io/badge/TrustFlow-Finance-10b981?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iI2ZmZiI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTEgMTVoLTJ2LTJoMnYyem0wLTRoLTJWN2gydjZ6Ii8+PC9zdmc+" alt="TrustFlow Finance" />

# 🏦 TrustFlow Finance

### AI-Powered NBFC Neo-Bank Lending Assistant · v2.0

[![Node.js](https://img.shields.io/badge/Node.js-v20+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![JWT](https://img.shields.io/badge/JWT-Auth-FB015B?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

**TrustFlow Finance** is a production-ready, full-stack AI chatbot for Non-Banking Financial Companies (NBFCs). It guides customers through loan eligibility checks, EMI calculations, document uploads, and credit bureau queries — all through a secure, conversational glassmorphism UI built on a Service-Oriented Agent Architecture.

[✨ Features](#-features) · [🗂 Structure](#️-project-structure) · [🧱 Tech Stack](#-tech-stack) · [🏛 Architecture](#️-architecture) · [⚡ Setup](#-local-setup) · [🐳 Docker](#-docker-setup) · [🧪 Testing](#-testing) · [📡 API](#-api-reference) · [🚀 Deploy](#-deployment)

</div>

---

## ✨ Features

| Feature | Details |
|---------|---------|
| 🔐 **Secure Auth** | JWT-based register/login with `argon2id` password hashing (memoryCost 64 MB) |
| 💬 **AI Chat** | Conversational intent parsing with Hinglish support |
| 📊 **Loan Eligibility** | 6-rule underwriting engine (credit score, DTI, income, EMI cap) |
| 💰 **EMI Calculator** | Precise EMI with ₹ Indian lakh notation formatting |
| 📄 **Document Uploads** | Magic-byte verified PDF/JPEG/PNG (max 5 MB), filename sanitised |
| 🏦 **Credit Bureau** | 24-hour cached credit score lookup with deterministic mock |
| ✅ **Compliance** | KYC, watchlist scan, full audit trail — RBI/NBFC ready |
| 🛡️ **Security** | NoSQL injection, XSS, SQL injection hardening; PII hashing |
| 🎨 **Glassmorphism UI** | Dark-mode Neo-Bank design (`#020617` / emerald / indigo palette) |
| 🚀 **DevOps Ready** | Docker, docker-compose, GitHub Actions CI, Vercel + Render configs |

---

## 🗂️ Project Structure

```
trustflow-finance/                   ← Monorepo root
├── .github/
│   └── workflows/
│       └── ci.yml                   ← GitHub Actions CI pipeline
├── backend/
│   ├── src/
│   │   ├── agents/
│   │   │   ├── MasterAgent.js       ← Orchestrator — routes intent to workers
│   │   │   └── workers/
│   │   │       ├── BrandResponseAgent.js      ← Formats final reply + ₹ notation
│   │   │       ├── ComplianceAgent.js         ← KYC, watchlist, audit trail
│   │   │       ├── CRMAgent.js                ← Customer context lookup
│   │   │       ├── CreditBureauAgent.js       ← Cached credit score fetch
│   │   │       ├── DocumentVerificationAgent.js ← Magic-byte file inspection
│   │   │       └── UnderwritingAgent.js       ← 6-rule eligibility engine
│   │   ├── config/
│   │   │   ├── db.js                ← MongoDB Atlas + in-memory dev fallback
│   │   │   └── env.js               ← Centralised env validation (Zod)
│   │   ├── controllers/             ← Route handlers
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   ├── internalAuth.middleware.js  ← 60-sec worker token guard
│   │   │   ├── rateLimiter.js
│   │   │   └── validate.middleware.js
│   │   ├── models/                  ← Mongoose schemas
│   │   ├── modules/
│   │   │   └── underwriting/        ← SOA module (zero external deps)
│   │   │       ├── underwriting.schema.js
│   │   │       ├── underwriting.service.js
│   │   │       └── underwriting.module.test.js  ← 20 unit tests
│   │   ├── repositories/            ← Data access layer
│   │   ├── routes/
│   │   │   ├── agent.routes.js
│   │   │   └── auth.routes.js
│   │   ├── scripts/
│   │   │   └── seedCustomers.js     ← Seeds 10 test customers
│   │   ├── services/
│   │   │   ├── brandResponse.service.js
│   │   │   ├── compliance.service.js
│   │   │   ├── creditBureau.service.js
│   │   │   ├── crm.service.js
│   │   │   ├── documentVerify.service.js
│   │   │   └── intentParser.service.js
│   │   └── utils/
│   │       ├── hashPII.js           ← argon2id PAN/Aadhaar hashing
│   │       ├── jwt.js               ← Dual-secret token utilities
│   │       └── sanitize.js          ← NoSQL/XSS/SQL strip, ₹ preserved
│   ├── tests/                       ← Integration tests (47 tests)
│   ├── Dockerfile
│   ├── jest.config.js
│   └── render.yaml
├── frontend/
│   ├── src/
│   │   ├── api/                     ← axios instance + auth/agent API calls
│   │   ├── components/              ← AgentStatusBar, ChatInput, EMIBreakdownTable…
│   │   ├── hooks/                   ← useCursorGlow, useAutoScroll
│   │   ├── pages/                   ← LoginPage, RegisterPage, ChatPage
│   │   ├── store/                   ← Zustand global chat store
│   │   └── styles/
│   │       ├── design-tokens.css    ← Single source of truth for CSS variables
│   │       └── glassmorphism.css    ← Reusable glass utility classes
│   ├── public/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── vite.config.js
│   └── vercel.json
├── docs/                            ← Extended documentation (WIP)
├── docker-compose.yml               ← Full-stack local orchestration
├── .env.example                     ← Template — copy to backend/.env
└── package.json                     ← Root workspace + concurrently
```

---

## 🧱 Tech Stack

### Backend

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js | v20+ |
| Framework | Express | v4 |
| Database | MongoDB (Atlas / in-memory) | v7 |
| ODM | Mongoose | v8 |
| Auth | `jsonwebtoken` (dual-secret) | v9 |
| Password Hashing | `argon2` (argon2id, memoryCost 64 MB) | v0.31 |
| Validation | `zod` | v3 |
| File Uploads | `multer` | v2 |
| Security | `helmet`, `cors`, `express-rate-limit` | latest |
| Dev Database | `mongodb-memory-server` (zero-config) | v9 |
| Testing | `jest` + `supertest` | v29 |
| Dev Server | `nodemon` | v3 |

### Frontend

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | v18 |
| Build Tool | Vite | v5 |
| State Management | Zustand | v4 |
| Routing | React Router | v6 |
| HTTP Client | axios | v1 |
| Styling | Vanilla CSS (design tokens) + Tailwind CSS | v3 |
| Unique IDs | `uuid` | v13 |

### DevOps & Infrastructure

| Tool | Purpose |
|------|---------|
| Docker | Containerised builds for backend + frontend |
| docker-compose | Single-command full-stack local orchestration |
| GitHub Actions | CI — tests, audit, lint, coverage |
| Vercel | Frontend CDN hosting + SPA routing |
| Render | Backend API hosting (Singapore region) |
| nginx | Static file serving + SPA fallback in production |

---

## 🏛️ Architecture

```
Browser (React + Zustand)
        │
        │  POST /api/v1/agent/master  (Bearer JWT)
        ▼
┌──────────────────────────────────────────────┐
│           Express API (helmet + CORS)        │
│  auth.middleware → rateLimiter → validate    │
├──────────────────────────────────────────────┤
│          MasterAgent (Orchestrator)          │
│   sanitize → intentParser → internalJWT      │
│                    │                         │
│      ┌─────────────┼─────────────────┐       │
│      ▼             ▼                 ▼       │
│   CRMAgent  UnderwritingAgent   DocAgent     │
│                    │                         │
│            CreditBureauAgent                 │
│                    │                         │
│            ComplianceAgent                   │
│                    │                         │
│            BrandResponseAgent  ◄─── last     │
└──────────────────────────────────────────────┘
        │
        ▼
   MongoDB Atlas  (or in-memory dev)
   └── agent_logs  (PII-free audit trail)
```

### Agent Communication Rules

- **MasterAgent** is the **only** agent exposed to the frontend via `POST /api/v1/agent/master`
- All **Worker Agents** communicate internally, protected by a 60-second `INTERNAL_JWT_SECRET` token
- **BrandResponseAgent** always runs **last** — normalises all money to `₹X,XX,XXX` (Indian lakh notation)
- Every agent decision is logged to the `agent_logs` collection — no PII in plaintext

### Underwriting Decision Rules

| Rule | Condition | Decision |
|------|-----------|----------|
| R001 | Credit Score < 700 | `REJECT` |
| R002 | Monthly Income < ₹15,000 | `REJECT` |
| R003 | Existing EMI > 50% of salary | `REJECT` |
| R004 | Loan Amount > 10× Monthly Income | `MANUAL_REVIEW` |
| R005 | Credit Score 700–749 + EMI/income > 40% | `MANUAL_REVIEW` |
| R006 | Credit Score ≥ 750 + all checks clear | `APPROVE` |

---

## ⚡ Local Setup

### Prerequisites

| Requirement | Version | Link |
|-------------|---------|------|
| Node.js | v20+ | [nodejs.org](https://nodejs.org) |
| npm | v10+ | Bundled with Node |
| Git | Any | [git-scm.com](https://git-scm.com) |
| MongoDB | Optional (uses in-memory by default) | [cloud.mongodb.com](https://cloud.mongodb.com) |

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/<your-username>/trustflow-finance.git
cd trustflow-finance
```

---

### Step 2 — Configure Environment Variables

```bash
# Windows (PowerShell)
Copy-Item .env.example backend\.env

# macOS / Linux
cp .env.example backend/.env
```

Open `backend/.env` and set these values:

```env
# ── Server ────────────────────────────────────
PORT=5050
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# ── Database ──────────────────────────────────
# Leave as "placeholder" → uses zero-config in-memory MongoDB
MONGODB_URI=placeholder

# ── Auth Secrets (generate with the command below) ────────────
JWT_SECRET=<32-char-minimum-secret>
INTERNAL_JWT_SECRET=<different-32-char-secret>
JWT_EXPIRY=7d
INTERNAL_JWT_EXPIRY=60

# ── Third-Party APIs (mock values work in dev) ────────────────
CREDIT_BUREAU_API_URL=https://mock-credit-bureau.example.com/v1
CREDIT_BUREAU_API_KEY=dev_mock_key
CRM_API_URL=https://mock-crm.example.com/v1
CRM_API_KEY=dev_mock_key
```

> **Generate cryptographically strong secrets:**
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```
> Run twice — use one value for `JWT_SECRET` and the other for `INTERNAL_JWT_SECRET`.

> **Tip:** Keeping `MONGODB_URI=placeholder` tells the backend to auto-spin an in-memory MongoDB instance (binary downloaded once, ~510 MB). No Atlas account required for local dev.

---

### Step 3 — Install Dependencies

```bash
# Install everything in one command
npm install && npm install --prefix backend && npm install --prefix frontend

# Or step by step
npm install                      # Root workspace tools (concurrently)
npm install --prefix backend     # Backend dependencies
npm install --prefix frontend    # Frontend dependencies
```

---

### Step 4 — Start Development Servers

```bash
npm run dev
```

Both servers start concurrently:

| Service | URL | Notes |
|---------|-----|-------|
| **Frontend** (Vite HMR) | http://localhost:3000 | React + Zustand |
| **Backend** (nodemon) | http://localhost:5050 | Express + Mongoose |
| **Health Check** | http://localhost:5050/api/v1/health | Should return `{ status: "ok" }` |

---

### Step 5 — (Optional) Seed Test Data

```bash
npm run seed --prefix backend
```

Creates 10 pre-configured customers that exercise every underwriting branch (`APPROVE` / `REJECT` / `MANUAL_REVIEW`). Useful for end-to-end testing without creating accounts manually.

---

## 🐳 Docker Setup

Run the complete stack (backend + frontend + MongoDB) with a single command:

```bash
# 1. Set up environment (required)
cp .env.example backend/.env
# Edit backend/.env — set a real MONGODB_URI for persistent data
# or leave as "placeholder" for ephemeral dev data

# 2. Build and start all containers
docker-compose up --build

# 3. Run in background (detached)
docker-compose up --build -d

# 4. Tear down
docker-compose down
```

| Container | Port | Description |
|-----------|------|-------------|
| `trustflow-frontend` | http://localhost:3000 | nginx-served React SPA |
| `trustflow-backend` | http://localhost:5050 | Node.js API |
| `mongo` | localhost:27017 | MongoDB (data persists in Docker volume) |

---

## 🧪 Testing

```bash
# Run full test suite (67 tests)
npm test --prefix backend

# Unit tests only — SOA underwriting module (20 tests)
npm run test:unit --prefix backend

# Integration tests only — security, docs, brand (47 tests)
npm run test:integration --prefix backend

# Coverage report (HTML output in backend/coverage/)
npm run test:coverage --prefix backend
```

### Test Suite Overview

| Suite | File | Tests | What It Covers |
|-------|------|-------|----------------|
| **Unit** | `underwriting.module.test.js` | 20 | All 6 underwriting rules (R001–R006), edge cases |
| **Integration** | `security.test.js` | 15 | NoSQL injection, XSS, SQL keywords, ₹ preservation |
| **Integration** | `documentVerify.test.js` | 22 | Magic bytes, MIME types, 5 MB limit, filename sanitisation |
| **Integration** | `brandResponse.test.js` | 10 | INR lakh formatting, UI component mapping |
| **Total** | | **67** | |

---

## 📡 API Reference

> All endpoints require `Authorization: Bearer <token>` except `/api/v1/auth/*`.

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/register` | Register a new user |
| `POST` | `/api/v1/auth/login` | Login, returns signed JWT |
| `GET`  | `/api/v1/health` | Server health check (no auth) |

**Register / Login body:**
```json
{
  "name": "Aarav Sharma",
  "phone": "9876543210",
  "password": "SecurePass@123"
}
```

---

### Chat Agent

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/agent/master` | Send a message to MasterAgent |
| `POST` | `/api/v1/agent/document` | Upload a document (`multipart/form-data`) |

**Master Agent Request:**
```json
{
  "sessionId": "7f3e9a2b-1c4d-4e5f-8b6a-0d2e3f4a5b6c",
  "message": "EMI for 3 lakh at 12% for 36 months",
  "intent": "EMI_CALCULATOR"
}
```

**Master Agent Response:**
```json
{
  "reply": "Your EMI for ₹3,00,000 at 12% for 36 months is ₹9,964/month. Total payable: ₹3,58,704.",
  "agentUsed": ["MasterAgent", "UnderwritingAgent", "BrandResponseAgent"],
  "uiComponent": "EMIBreakdownTable",
  "uiProps": {
    "principal": 300000,
    "rate": 12,
    "tenure": 36,
    "emi": 9964,
    "totalInterest": 58704,
    "totalPayable": 358704
  },
  "sessionId": "7f3e9a2b-1c4d-4e5f-8b6a-0d2e3f4a5b6c"
}
```

---

### Supported Intents

| Intent | Example Triggers |
|--------|-----------------|
| `GREETING` | "hello", "hi", "namaste", "trustflow kya hai" |
| `LOAN_ENQUIRY` | "loan chahiye", "apply for loan", "eligibility check" |
| `EMI_CALCULATOR` | "calculate EMI", "EMI for 2 lakh at 10% 24 months" |
| `DOCUMENT_UPLOAD` | "upload salary slip", "attach Aadhaar" |
| `APPLICATION_STATUS` | "loan status", "kya hua mera application" |
| `COMPLIANCE_CHECK` | "KYC status", "documents verified?" |

---

## 🚀 Deployment

### Frontend → Vercel

1. Push to GitHub
2. Connect repo at [vercel.com/new](https://vercel.com/new)
3. Set **Root Directory** → `frontend/`
4. Add env variable: `VITE_API_URL=https://your-backend.onrender.com`
5. Deploy — `vercel.json` handles SPA routing and API proxying automatically

### Backend → Render

1. Create a **Web Service** at [render.com](https://render.com)
2. Connect your GitHub repo
3. Set **Root Directory** → `backend/`
4. **Build Command**: `npm ci`
5. **Start Command**: `node src/server.js`
6. Add all env vars from `.env.example` in the Render dashboard
7. `render.yaml` is included for Infrastructure-as-Code deployments

### CI/CD — GitHub Actions

The `.github/workflows/ci.yml` pipeline runs on every push/PR to `main`:

```
✅  Unit Tests          (underwriting module — 20 tests)
✅  Integration Tests   (security, docs, brand — 47 tests)
✅  npm Security Audit  (fails on HIGH+ severity)
✅  ESLint              (frontend)
✅  Coverage Artifact   (uploaded to GitHub Actions)
```

---

## 🔐 Security Design

| Concern | Implementation |
|---------|---------------|
| Password Storage | `argon2id` — timeCost:3, memoryCost:64 MB |
| PAN / Aadhaar | `argon2id` hashed before MongoDB storage (`select: false`) |
| API Auth | JWT (HS256), user secret ≠ internal worker secret |
| Worker Routes | 60-second `INTERNAL_JWT_SECRET` tokens — never exposed externally |
| Rate Limiting | 100 req/15 min (global), 20 msg/min (chat), 5 req/hr (loan) |
| Input Sanitisation | Strips `$operators`, `<tags>`, `javascript:`, SQL keywords — preserves `₹` |
| File Uploads | Magic byte sniffing (PDF/JPEG/PNG), max 5 MB, filename sanitised |
| CORS | Restricted to `FRONTEND_URL` only |
| HTTP Headers | `helmet` — CSP, HSTS, X-Frame-Options, referrer policy |
| Audit Trail | All agent decisions logged to `agent_logs` (no PII in plaintext) |

---

## 🎨 Design System

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg-primary` | `#020617` | Page background |
| `--color-accent-emerald` | `#10b981` | CTA buttons, success |
| `--color-accent-indigo` | `#6366f1` | Cursor glow, intent pills |
| `--font-display` | Syne | Headings, brand name |
| `--font-body` | DM Sans | Body text, inputs |
| `--font-mono` | JetBrains Mono | Monetary values (EMI, amounts) |
| `--glass-blur` | `blur(20px) saturate(180%)` | All glass cards |

---

## 📜 Available Scripts

### Root Workspace

```bash
npm run dev            # Start backend + frontend concurrently
npm install            # Install root deps (concurrently)
npm run build          # Build frontend for production
npm run seed           # Seed 10 test customers
npm run test           # Run backend test suite
npm run docker:up      # Build and start all Docker containers
npm run docker:down    # Stop and remove containers
npm run install:all    # Install deps for backend + frontend
```

### Backend (`cd backend`)

```bash
npm run dev              # nodemon hot-reload server
npm start                # Production server
npm test                 # All 67 tests
npm run test:unit        # SOA unit tests (20)
npm run test:integration # Integration tests (47)
npm run test:coverage    # Tests + HTML coverage report
npm run seed             # Seed test customers
```

### Frontend (`cd frontend`)

```bash
npm run dev       # Vite dev server with HMR (port 3000)
npm run build     # Production build → /dist
npm run preview   # Preview production build locally
npm run lint      # ESLint check
```

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feat/your-feature-name`
3. **Commit** following conventional commits:
   ```bash
   git commit -m "feat: add loan status push notification"
   ```
4. **Push** your branch: `git push origin feat/your-feature-name`
5. **Open a Pull Request** — CI will run automatically

### Commit Convention

| Prefix | Usage |
|--------|-------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `docs:` | Documentation only |
| `style:` | Formatting, no logic change |
| `refactor:` | Code restructure, no feature change |
| `test:` | Adding or updating tests |
| `chore:` | Build scripts, config, tooling |

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for the Indian fintech ecosystem**

*TrustFlow Finance — Where Trust Meets Capital*

[![Made with Node.js](https://img.shields.io/badge/Made%20with-Node.js-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![Powered by MongoDB](https://img.shields.io/badge/Powered%20by-MongoDB-47A248?style=flat-square&logo=mongodb)](https://mongodb.com)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000?style=flat-square&logo=vercel)](https://vercel.com)
[![API on Render](https://img.shields.io/badge/API%20on-Render-46E3B7?style=flat-square&logo=render)](https://render.com)

</div>
