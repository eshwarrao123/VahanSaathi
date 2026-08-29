# VahanSaathi

> **"Tell us what happened. We'll tell you what to do next."**

VahanSaathi is an independent citizen guidance and process-understanding layer built around Parivahan/VAHAN vehicle ownership transfer workflows in India. It converts confusing statutory requirements into a clear, step-by-step personalized roadmap for citizens buying or selling used vehicles.

---

##  Product Overview

### Problem
Used-vehicle ownership transfer in India—especially interstate sales (e.g. Telangana to Karnataka)—is notoriously complex. Citizens struggle to understand required NOCs (Form 28), ownership transfer forms (Form 29/30), bank hypothecation cancellations (Form 35), state tax re-assessments, and who bears responsibility at each stage.

### Solution
1. **Natural Language Input**: The citizen describes their situation in plain words (e.g., *"I sold my Telangana car to someone in Karnataka"*).
2. **Deterministic Statutory Rules Engine**: Authoritative statutory rules evaluate the facts, apply Motor Vehicles Act (1988) & CMVR rules, and construct a personalized roadmap.
3. **AI Guidance Layer**: Server-side OpenAI models explain complex legal rules in plain language, summarize roadmaps, and answer contextual *"Why do I need this step?"* questions.

---

##  AI Role & Safety Guardrails

- **AI Moments**:
  1. **Situation Interpretation** (`/api/ai/interpret`): Extracts key facts (role, origin state, destination state, vehicle model) into structured data with zero hallucination.
  2. **Roadmap Explanation** (`/api/ai/explain-roadmap`): Generates plain-language executive summaries of the generated statutory roadmap.
  3. **Contextual Step Explanation** (`/api/ai/explain-step`): Answers *"Why do I need this step?"* using only verified statutory context, backed by server-side and client-side caching.

- **Authoritative Rules Engine**: The deterministic Motor Vehicles Act rules engine remains 100% authoritative for step sequencing, mandatory forms, and legal bases. AI never invents statutory requirements or vehicle data.
- **Zod Schema Validation**: All AI responses undergo runtime Zod schema validation; invalid or malformed responses immediately trigger a graceful deterministic fallback.

---

##  Safety & Hackathon Disclaimers

- **Independent Prototype**: VahanSaathi is an independent hackathon prototype. It is NOT an official government service and is not affiliated with Parivahan, VAHAN, or the Ministry of Road Transport and Highways (MoRTH).
- **Simulated Integration**: All government interactions (submission, status tracking) are simulated locally.
- **Synthetic Data**: All demo cases, chassis numbers, registration details, and names are synthetic.
- **No Real Transactions**: Does NOT request or collect real OTPs, real payments, real identity documents, or real government credentials.

---

  ##  Architecture & Tech Stack

- **Framework**: Next.js 16 (App Router, Server Actions, API Routes)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Vanilla CSS Design Tokens
- **Animations**: Framer Motion
- **Database & ORM**: Prisma ORM
  - **Local Development**: SQLite (`dev.db`)
  - **Production Deployment**: PostgreSQL (`DATABASE_URL`)
- **Validation**: Zod
- **AI Integration**: OpenAI Node SDK (`gpt-4o-mini`)

---

##  Local Setup & Installation

### Prerequisites
- Node.js 18+ or 20+
- npm or yarn

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Edit `.env.local` to provide your configuration:
```env
# Required: Server-side OpenAI API key (NEVER expose to client)
OPENAI_API_KEY="sk-your-openai-api-key-here"

# Local Database URL (SQLite)
DATABASE_URL="file:./dev.db"

# Optional: AI Model Configuration (default: gpt-4o-mini)
OPENAI_MODEL="gpt-4o-mini"
```

### 3. Initialize Local Database
```bash
npx prisma db push
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

##  Production Deployment Plan

- **Database**: Configure `DATABASE_URL` pointing to a PostgreSQL instance (e.g. Supabase, Neon, Render PostgreSQL). Prisma seamlessly switches engine configuration based on connection string scheme (`postgres://` vs `file:`).
- **Environment Secrets**: Set `OPENAI_API_KEY` and `DATABASE_URL` in your hosting platform's environment variables settings (e.g., Vercel, Railway, Render). `OPENAI_API_KEY` is server-only and never exposed to the client bundle.
- **Build & Check**:
```bash
npx tsc --noEmit
npm run lint
npm run build
```

---

##  License

Created for hackathon demonstration. All synthetic scenario data and rules configurations are provided for process guidance prototyping.
