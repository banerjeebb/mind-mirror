# MindMirror — Claude Code Project Memory

> GenAI mental wellness tracker for JEE/NEET/GATE/UPSC students.
> Google Prompt Wars Hackathon. Stack: Next.js + Express + MongoDB + Gemini 2.0 Flash.

---

## Project Layout

```
mindmirror/
├── frontend/          # Next.js 14 App Router
├── backend/           # Node.js + Express API
└── CLAUDE.md          # this file
```

```
frontend/
├── app/
│   ├── (auth)/login/page.tsx
│   ├── (auth)/register/page.tsx
│   ├── dashboard/page.tsx        ← constellation canvas lives here
│   ├── journal/page.tsx          ← daily entry form
│   └── insights/page.tsx         ← AI pattern + coping ritual
├── components/
│   ├── constellation/            ← Canvas viz components
│   ├── journal/                  ← JournalForm, MoodSelector
│   └── insights/                 ← InsightCard, CopingRitualCard
├── lib/
│   ├── axios.ts                  ← ONLY axios instance lives here
│   └── handleApiError.ts
├── services/
│   ├── auth.service.ts
│   ├── journal.service.ts
│   └── insight.service.ts
├── schemas/
│   ├── auth.schema.ts            ← Zod schemas
│   └── journal.schema.ts
└── contexts/AuthContext.tsx
```

```
backend/
├── src/
│   ├── routes/           ← auth, journal, insight, gemini
│   ├── controllers/      ← auth, journal, gemini
│   ├── middleware/        ← auth (JWT), validate (Zod), rateLimit
│   └── services/
│       └── gemini.service.ts   ← ALL Gemini calls here, nowhere else
└── prisma/schema.prisma
```

---

## Build & Run Commands

```bash
# Frontend
cd frontend && npm install
npm run dev          # port 3000

# Backend
cd backend && npm install
npx prisma generate
npm run dev          # port 5000

# Prisma
npx prisma db push   # sync schema to MongoDB
npx prisma studio    # GUI at port 5555
```

---

## Environment Variables

```bash
# backend/.env  — NEVER expose these to frontend
GEMINI_API_KEY=AIza...
DATABASE_URL=mongodb+srv://...
JWT_SECRET=...
JWT_EXPIRES_IN=7d
PORT=5000
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development

# frontend/.env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
# GEMINI_API_KEY is NEVER here — always proxied through Express
```

---

## Hard Rules — Always Follow

### API & Security
- **ALL Gemini calls go through `backend/src/services/gemini.service.ts` only** — never call Gemini from the frontend
- **JWT stored in httpOnly cookies only** — never localStorage, never sessionStorage
- **Axios: use the centralized instance at `frontend/lib/axios.ts`** — never call `axios.get()` directly in components
- Always set `withCredentials: true` on the Axios instance
- **Zod validate ALL inputs** before any API call — schemas live in `frontend/schemas/`
- **DOMPurify on journal `entryText`** before rendering anywhere
- `handleApiError()` must wrap every catch block — never surface raw Axios errors

### Code Conventions
- TypeScript strict mode everywhere — no `any`
- Tailwind + shadcn/ui for all UI — no custom CSS files
- Framer Motion for all animations — no CSS transitions
- Canvas API for constellation rendering — no third-party chart libs
- All API services return typed response objects — define types in `types/` if needed

### Git
- Commit after each working feature — don't batch unrelated changes
- Prefix commits: `feat:`, `fix:`, `chore:`

---

## Database Schema Summary (Prisma + MongoDB)

**User** — id, name, email, password (bcrypt), examType, examDate
**Journal** — id, userId, entryText, mood (1-5), energyLevel (1-5), emotionTags[], triggerWords[], sentimentScore, emotionVector {x,y}
**Insight** — id, userId, journalId (1-to-1), hiddenPattern, copingRitual, ritualType, ritualCompleted

ExamType enum: `JEE | NEET | CUET | GATE | UPSC | CAT`
RitualType enum: `BREATHING | JOURNALING | MOVEMENT | REST | FOCUS_RESET | MOTIVATION`

---

## Gemini Prompt Contract

The Gemini service always returns this JSON shape — parse strictly:

```json
{
  "emotionTags": ["string"],
  "triggerWords": ["string"],
  "sentimentScore": -1.0,
  "emotionVector": { "x": 0.0, "y": 0.0 },
  "hiddenPattern": "string",
  "copingRitual": "string",
  "ritualType": "BREATHING"
}
```

Strip markdown fences before `JSON.parse()`. If parse fails → return 500, do not crash.

Model: `gemini-2.0-flash`. Strip any preamble. Prompt must demand JSON-only output.

---

## Constellation Canvas Rules

- Each journal entry = one node on the canvas
- Node position = `emotionVector { x, y }` scaled to canvas dimensions
- Node color by dominant emotion:
  - Anxious/Stressed → `#FF6B6B`
  - Burned Out → `#8B8B8B`
  - Hopeful/Motivated → `#4ADE80`
  - Calm/Focused → `#60A5FA`
  - Overwhelmed → `#F59E0B`
  - Sad/Defeated → `#8B5CF6`
- Draw connecting lines between consecutive day nodes
- Completed ritual → node gets a golden ring `#F59E0B`
- Hover → tooltip showing date + emotion tags
- Background: `#0A0A0F`, node glow via `shadowBlur`

---

## API Endpoints Reference

```
POST   /api/auth/register         body: { name, email, password, examType, examDate }
POST   /api/auth/login            body: { email, password } → sets httpOnly JWT cookie
POST   /api/auth/logout           clears cookie
GET    /api/auth/me               returns current user

POST   /api/journal               body: { entryText, mood, energyLevel } → triggers Gemini
GET    /api/journal               returns all entries + insights for constellation
GET    /api/journal/:id           single entry with insight
PATCH  /api/journal/:id/ritual-complete   marks ritual done

GET    /api/insights/patterns     7-day emotion pattern summary
GET    /api/insights/streak       current wellness streak
```

---

## CSP Headers (next.config.js)

```js
connect-src 'self' ${NEXT_PUBLIC_API_BASE_URL}
frame-ancestors 'none'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
```

---

## Hackathon Build Order

```
[ ] 1. Prisma schema + DB connection
[ ] 2. Auth routes (register/login/logout with httpOnly JWT)
[ ] 3. Journal POST route + Gemini service
[ ] 4. Journal GET route (all entries with emotion vectors)
[ ] 5. Constellation canvas component (dashboard)
[ ] 6. Journal entry form (modal with Zod validation)
[ ] 7. Insight card + Coping ritual card (Framer Motion reveal)
[ ] 8. Ritual complete PATCH + golden ring on node
[ ] 9. Login/Register pages
[ ] 10. Polish: animations, loading states, empty state
```

Use `[ ]` checkboxes above — tick them off as each step completes.

---

## Additional Context

- @docs/architecture.md for full system design
- @docs/gemini-prompt.md for full Gemini prompt text
- @docs/security-checklist.md for api-security skill checklist
