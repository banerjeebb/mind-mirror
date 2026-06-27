# MindMirror

> An **empathetic digital companion** for students preparing for India's **high-stakes board exams** — JEE, NEET, GATE, UPSC, CUET, and CAT.

MindMirror is a GenAI-powered mental wellness tracker that surfaces **hidden stress triggers** and **emotional patterns** through daily journaling, delivering **hyper-personalized**, **contextual wellness support** via Gemini 2.0 Flash. It provides **adaptive mindfulness exercises** tailored to each student's exam context, mood, and energy — not generic advice.

---

## Problem Alignment

Indian exam students face extreme pressure with little emotional support. Existing mental health tools are generic and don't understand the unique stressors of competitive exam preparation — syllabus anxiety, mock test burnout, comparison pressure, and pre-exam panic.

MindMirror addresses this by:

- **Detecting hidden stress triggers** through AI analysis of daily journal entries
- **Mapping emotional patterns** as a visual constellation that reveals trends the student can't see themselves
- **Delivering hyper-personalized coping rituals** — breathing exercises, movement breaks, focus resets — matched to the student's current emotional state and exam timeline
- **Providing contextual wellness support** that adapts to whether a student is 90 days from JEE or 7 days from NEET

---

## Features

- **AI Journal Analysis** — Write freely; Gemini 2.0 Flash extracts emotion tags, trigger words, sentiment scores, and hidden patterns
- **Emotional Constellation** — Canvas-rendered visualization where each journal entry becomes a node, color-coded by emotion, connected chronologically
- **Adaptive Mindfulness Exercises** — AI-generated coping rituals (breathing, journaling, movement, rest, focus reset, motivation) tailored to the student's state
- **Ritual Tracking** — Mark rituals complete; completed rituals earn a golden ring on the constellation node
- **7-Day Pattern Insights** — Aggregated emotion trends, top emotions, average mood, and AI-detected behavioral patterns
- **Wellness Streak** — Daily journaling streak counter to encourage consistency
- **Exam Countdown** — Days-to-exam display personalized to the student's registered exam

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion |
| Backend | Node.js, Express 5, TypeScript |
| Database | MongoDB Atlas via Prisma ORM |
| AI | Google Gemini 2.0 Flash (via REST API) |
| Auth | JWT (httpOnly cookies), bcrypt |
| Validation | Zod (frontend + backend) |
| Sanitization | DOMPurify (XSS prevention on journal text) |

---

## Security

- **API keys server-side only** — Gemini API key never touches the frontend; all AI calls proxied through Express
- **httpOnly JWT cookies** — No localStorage/sessionStorage token storage; cookies are secure in production with SameSite=Lax
- **Zod validation on all inputs** — Both frontend (pre-submit) and backend (middleware) validate every request body
- **DOMPurify sanitization** — All user-generated journal text sanitized before rendering
- **Rate limiting** — Auth routes (20/15min) and journal routes (10/min) rate-limited via express-rate-limit
- **CORS restricted** — Only the configured frontend origin can make credentialed requests
- **CSP headers** — Content Security Policy restricting connect-src, frame-ancestors, and content-type sniffing
- **Password hashing** — bcrypt with 12 salt rounds
- **No raw error exposure** — All API errors pass through `handleApiError()` before reaching the UI

---

## Architecture

```
┌─────────────┐     HTTP (cookies)     ┌──────────────┐     Gemini REST API     ┌─────────────┐
│  Next.js    │ ◄──────────────────►   │  Express API │ ◄──────────────────►    │  Gemini 2.0 │
│  Frontend   │    withCredentials     │  Backend     │    X-goog-api-key       │  Flash      │
│  (port 3000)│                        │  (port 5000) │                         └─────────────┘
└─────────────┘                        └──────┬───────┘
                                              │ Prisma ORM
                                       ┌──────▼───────┐
                                       │  MongoDB     │
                                       │  Atlas       │
                                       └──────────────┘
```

### Request Flow

1. User writes a journal entry → frontend validates with Zod → POST `/api/journal`
2. Backend validates again (Zod middleware) → authenticates JWT from cookie
3. Journal controller calls `gemini.service.ts` → sends entry + mood + energy + exam type to Gemini
4. Gemini returns structured JSON: emotion tags, trigger words, sentiment, emotion vector, hidden pattern, coping ritual
5. Backend creates Journal + Insight records in MongoDB via Prisma
6. Frontend renders the new constellation node and InsightCard with coping ritual

---

## How to Run

### Prerequisites

- Node.js 18+
- MongoDB Atlas cluster (or local MongoDB)
- Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

### Setup

```bash
# Clone
git clone <repo-url>
cd mind-mirror

# Backend
cd backend
npm install
npx prisma generate
cp .env.example .env  # Fill in DATABASE_URL, GEMINI_API_KEY, JWT_SECRET
npm run dev            # Starts on port 5000

# Frontend (new terminal)
cd frontend
npm install
npm run dev            # Starts on port 3000
```

### Environment Variables

```bash
# backend/.env
DATABASE_URL=mongodb+srv://...
GEMINI_API_KEY=your_key_here
JWT_SECRET=your_secret_here
JWT_EXPIRES_IN=7d
PORT=5000
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development

# frontend/.env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

---

## Project Structure

```
mind-mirror/
├── frontend/                  # Next.js App Router
│   ├── src/
│   │   ├── app/               # Pages (dashboard, journal, insights, auth)
│   │   ├── components/        # UI components (constellation, journal, insights)
│   │   ├── contexts/          # AuthContext (JWT session management)
│   │   ├── lib/               # Axios instance, error handler, motion variants
│   │   ├── schemas/           # Zod validation schemas
│   │   ├── services/          # API service functions
│   │   └── types/             # TypeScript interfaces
│   └── public/
├── backend/                   # Express API
│   ├── src/
│   │   ├── controllers/       # Auth, Journal, Insight controllers
│   │   ├── middleware/        # JWT auth, Zod validation, rate limiting
│   │   ├── routes/            # Route definitions
│   │   ├── schemas/           # Backend Zod schemas
│   │   ├── services/          # Gemini AI service (sole AI integration point)
│   │   └── lib/               # Prisma client
│   └── prisma/                # Database schema
└── README.md
```

---

## License

MIT
