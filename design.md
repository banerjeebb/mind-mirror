# MindMirror — design.md
> Feed this file to Claude Code when building any page or component.
> Every color, font, animation, and layout decision lives here.

---

## Design Philosophy

Calm. Empathetic. Rewarding. Every interaction should feel like a gentle exhale — not clinical, not cold. This is a private space for students under enormous pressure. The design earns trust through softness, warmth, and micro-moments of delight. Every action the user takes should feel acknowledged and celebrated.

---

## Color Tokens

```css
/* /src/styles/theme.css */

:root {
  /* Backgrounds */
  --bg-base:        #FAFAF8;   /* warm off-white, the canvas */
  --bg-surface:     #FFFFFF;   /* cards, modals */
  --bg-muted:       #F4F2EE;   /* subtle section bg, input fills */
  --bg-glass:       rgba(255, 255, 255, 0.60); /* glassmorphic surfaces */

  /* Brand */
  --brand-primary:  #7C9E8F;   /* sage green — calm, nature, growth */
  --brand-soft:     #A8C4B8;   /* lighter sage for hovers, borders */
  --brand-accent:   #E8A598;   /* dusty rose — warmth, empathy */
  --brand-glow:     #F0C9A0;   /* warm amber glow — reward moments */

  /* Text */
  --text-primary:   #2D2D2A;   /* near-black, warm undertone */
  --text-secondary: #6B6B63;   /* muted warm grey */
  --text-tertiary:  #9E9E94;   /* placeholder, captions */
  --text-on-brand:  #FFFFFF;

  /* Emotion Node Colors (constellation) */
  --emotion-anxious:    #FF8FAB;   /* soft rose-red */
  --emotion-burnout:    #B0ADA8;   /* warm grey */
  --emotion-hopeful:    #7EC8A4;   /* mint green */
  --emotion-calm:       #82B4D4;   /* sky blue */
  --emotion-overwhelmed:#F5C27A;   /* warm amber */
  --emotion-sad:        #A89BC8;   /* lavender */

  /* Semantic */
  --success:        #7EC8A4;
  --warning:        #F5C27A;
  --error:          #FF8FAB;

  /* Borders & Shadows */
  --border-soft:    rgba(124, 158, 143, 0.20);
  --shadow-card:    0 2px 16px rgba(45, 45, 42, 0.06);
  --shadow-float:   0 8px 32px rgba(45, 45, 42, 0.12);
  --shadow-glow:    0 0 24px rgba(240, 201, 160, 0.40);  /* reward glow */

  /* Blur */
  --blur-glass:     blur(16px);
}
```

---

## Typography

```css
/* Import in layout.tsx or globals.css */
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800&family=Figtree:wght@300;400;500;600;700&display=swap');

:root {
  --font-display: 'Nunito', sans-serif;   /* headings, brand moments */
  --font-body:    'Figtree', sans-serif;  /* body, UI labels, inputs */
}

/* Scale */
--text-xs:    0.75rem;    /* 12px — captions, badges */
--text-sm:    0.875rem;   /* 14px — labels, secondary */
--text-base:  1rem;       /* 16px — body copy */
--text-lg:    1.125rem;   /* 18px — card titles */
--text-xl:    1.25rem;    /* 20px — section headers */
--text-2xl:   1.5rem;     /* 24px — page titles */
--text-3xl:   1.875rem;   /* 30px — hero sub */
--text-4xl:   2.25rem;    /* 36px — hero headline */
--text-5xl:   3rem;       /* 48px — landing hero */
--text-6xl:   3.75rem;    /* 60px — landing hero large */
```

### Usage Rules
- `Nunito` — all headings (`h1`–`h3`), logo, landing hero text, insight reveal headline
- `Figtree` — body, nav items, buttons, inputs, badges, captions
- **Never mix weights randomly** — 800 for hero display only, 600 for section titles, 500 for card titles, 400 for body
- Letter-spacing: `-0.02em` on all headings above `text-2xl`

---

## Animations

```css
/* /src/styles/theme.css — add alongside :root */

@keyframes fade-rise {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes fade-rise-down {
  from { opacity: 0; transform: translateY(-12px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes soft-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.7; transform: scale(0.97); }
}

@keyframes glow-ring {
  0%, 100% { box-shadow: 0 0 0 0 rgba(240, 201, 160, 0); }
  50%       { box-shadow: 0 0 0 6px rgba(240, 201, 160, 0.35); }
}

@keyframes node-pop {
  0%   { transform: scale(0) translateY(10px); opacity: 0; }
  70%  { transform: scale(1.15) translateY(-2px); opacity: 1; }
  100% { transform: scale(1) translateY(0); opacity: 1; }
}

@keyframes streak-bounce {
  0%, 100% { transform: translateY(0); }
  40%       { transform: translateY(-6px); }
  60%       { transform: translateY(-3px); }
}

/* Utility classes */
.animate-fade-rise          { animation: fade-rise 0.8s ease-out both; }
.animate-fade-rise-delay    { animation: fade-rise 0.8s ease-out 0.2s both; }
.animate-fade-rise-delay-2  { animation: fade-rise 0.8s ease-out 0.4s both; }
.animate-fade-rise-down     { animation: fade-rise-down 0.5s ease-out both; }
.animate-soft-pulse         { animation: soft-pulse 3s ease-in-out infinite; }
.animate-glow-ring          { animation: glow-ring 2s ease-in-out infinite; }
.animate-node-pop           { animation: node-pop 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
.animate-streak-bounce      { animation: streak-bounce 0.6s ease-in-out; }
```

### Framer Motion Variants (copy-paste)

```ts
// /src/lib/motion.ts

export const fadeRise = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export const staggerContainer = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12 } },
}

export const cardPop = {
  hidden:  { opacity: 0, scale: 0.95, y: 16 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] } },
}

export const insightReveal = {
  hidden:  { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export const ritualComplete = {
  // Play on ritual marked done
  scale: [1, 1.08, 0.96, 1.02, 1],
  transition: { duration: 0.5, ease: 'easeInOut' },
}
```

---

## Global UI Patterns

### Glass Card
```tsx
// Used for: InsightCard, DashboardWidgets, NavBar on scroll
className="bg-[var(--bg-glass)] backdrop-blur-[16px] border border-[var(--border-soft)] rounded-2xl shadow-[var(--shadow-card)]"
```

### Soft Card (no glass)
```tsx
className="bg-[var(--bg-surface)] border border-[var(--border-soft)] rounded-2xl shadow-[var(--shadow-card)]"
```

### Primary Button
```tsx
className="bg-[var(--brand-primary)] text-white font-[var(--font-body)] font-semibold rounded-xl px-6 py-3
           hover:bg-[var(--brand-soft)] hover:shadow-[var(--shadow-float)]
           active:scale-[0.97] transition-all duration-200"
```

### Ghost Button
```tsx
className="border border-[var(--brand-primary)] text-[var(--brand-primary)] font-semibold rounded-xl px-6 py-3
           hover:bg-[var(--brand-primary)] hover:text-white active:scale-[0.97] transition-all duration-200"
```

### Input Field
```tsx
className="w-full bg-[var(--bg-muted)] border border-[var(--border-soft)] rounded-xl px-4 py-3
           font-[var(--font-body)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]
           focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/40 transition-all duration-200"
```

### Reward Toast (ritual complete, streak milestone)
```tsx
// Slide in from bottom-right, warm amber glow, auto-dismiss 3s
className="fixed bottom-6 right-6 bg-[var(--brand-glow)] text-[var(--text-primary)]
           rounded-2xl px-5 py-4 shadow-[var(--shadow-glow)] animate-fade-rise-down z-50"
```

---

## Page Specs

---

### 1. Landing Page (`/`)

**Layout:** Full-viewport hero → Features scroll section → Simple CTA footer

#### Hero Section

```
┌─────────────────────────────────────────────────────────────────┐
│  [video bg — looping, faded edges]                              │
│                                                                  │
│   ┌──────────────────────────────────────┐                      │
│   │  ✦ MindMirror                        │  ← glass pill nav    │
│   └──────────────────────────────────────┘                      │
│                                                                  │
│                                                                  │
│        You're not just tired.              ← h1, Nunito 800     │
│        Your mind is trying to tell         ← h1 line 2          │
│        you something.                                            │
│                                                                  │
│        A daily journal that listens —      ← p, Figtree 400     │
│        and shows you what's really         ← muted text         │
│        going on beneath the stress.                              │
│                                                                  │
│        [ Start journaling free ]  [ See how it works ]          │
│                                           ↑ ghost button        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Video Background Implementation:**
```tsx
// Cinematic looping video hero
// Video URL: https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4

useEffect(() => {
  const video = videoRef.current;
  if (!video) return;
  let rafId: number;

  const loop = () => {
    const fadeDuration = 0.5;
    if (video.currentTime < fadeDuration) {
      video.style.opacity = String(video.currentTime / fadeDuration);
    } else if (video.duration - video.currentTime < fadeDuration) {
      video.style.opacity = String((video.duration - video.currentTime) / fadeDuration);
    } else {
      video.style.opacity = '1';
    }
    rafId = requestAnimationFrame(loop);
  };

  video.addEventListener('ended', () => {
    video.style.opacity = '0';
    setTimeout(() => { video.currentTime = 0; video.play(); }, 100);
  });

  video.play().then(() => { rafId = requestAnimationFrame(loop); });
  return () => cancelAnimationFrame(rafId);
}, []);

// JSX
<div className="relative h-screen overflow-hidden">
  <video
    ref={videoRef}
    src="[URL]"
    muted playsInline
    className="absolute w-full object-cover"
    style={{ top: '300px', inset: 'auto 0 0 0', opacity: 0 }}
  />
  {/* Top + bottom gradient fade */}
  <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-base)] via-transparent to-[var(--bg-base)]" />
  {/* Hero content */}
  <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
    <h1 className="font-[var(--font-display)] font-extrabold text-5xl md:text-6xl text-[var(--text-primary)] leading-tight tracking-[-0.02em] animate-fade-rise">
      You're not just tired.
    </h1>
    <h1 className="font-[var(--font-display)] font-extrabold text-5xl md:text-6xl text-[var(--brand-primary)] leading-tight tracking-[-0.02em] animate-fade-rise-delay">
      Your mind is telling you something.
    </h1>
    <p className="mt-6 font-[var(--font-body)] text-lg text-[var(--text-secondary)] max-w-xl animate-fade-rise-delay-2">
      A daily journal that listens — and reveals what's really going on beneath the stress.
    </p>
    <div className="mt-10 flex gap-4 animate-fade-rise-delay-2">
      <PrimaryButton>Start journaling free</PrimaryButton>
      <GhostButton>See how it works</GhostButton>
    </div>
  </div>
</div>
```

#### Features Section (below hero)
3 soft cards in a row. Each card: icon (Lucide, sage green) + title (Nunito 600) + 2-line description (Figtree 400).

```
[ 🌿 Journal freely ]   [ ✦ See your patterns ]   [ 🌸 Get your ritual ]
  Write anything.         Your emotions mapped        One small action.
  No structure needed.    as a constellation.         Tailored for today.
```

Cards use `--bg-surface` with `--shadow-card`. Hover: lift `translateY(-4px)` + stronger shadow. Stagger entrance with `staggerContainer` variant.

#### Nav
Glass pill, centered. Logo left (Nunito 700 `✦ MindMirror`). Links right (`How it works`, `Login`, `Get started` primary button). Sticky on scroll, backdrop-blur activates after 60px scroll.

---

### 2. Dashboard / Home (`/dashboard`)

**Mood:** Warmest page in the app. The student's personal space. Feels like coming home.

**Layout:**
```
┌─ Sidebar (240px, sticky) ──────┬─ Main Canvas Area ───────────────────────────┐
│                                 │                                              │
│  ✦ MindMirror                   │  ┌── Welcome card (top) ──────────────────┐  │
│                                 │  │  Good morning, Arjun ☀️               │  │
│  [Avatar] Arjun                 │  │  87 days to JEE · 12-day streak 🔥    │  │
│  87 days to JEE                 │  └───────────────────────────────────────┘  │
│  ───────────────                │                                              │
│  🏠 Home                        │  ┌── Constellation Canvas ─────────────────┐ │
│  📓 Journal                     │  │                                         │ │
│  ✦  Insights                    │  │   [full canvas, emotion nodes, lines]   │ │
│  ⚙️  Settings                   │  │                                         │ │
│                                 │  └─────────────────────────────────────────┘ │
│  ─────────────────              │                                              │
│  ┌ Today's ritual ──┐           │  ┌── Insight Strip ────────────────────────┐ │
│  │ 🌬 4-7-8 Breathe │           │  │  "Your stress peaks on Sundays."        │ │
│  │ [Mark complete]  │           │  │  Tap to see full pattern →              │ │
│  └──────────────────┘           │  └─────────────────────────────────────────┘ │
│                                 │                                              │
│  ┌ Streak ──────────┐           │  ┌── Quick Journal ────────────────────────┐ │
│  │  🔥 12 days       │          │  │  How are you feeling today?             │ │
│  └──────────────────┘           │  │  [Mood pills row]  [Write →]            │ │
└─────────────────────────────────┴──┴────────────────────────────────────────────┘
```

**Welcome Card:**
- Background: soft sage-to-rose gradient `linear-gradient(135deg, #EAF2EE 0%, #FBF0EE 100%)`
- Time-aware greeting: "Good morning / afternoon / evening, [name]"
- Exam countdown chip: `--brand-primary` bg, white text, Figtree 600
- Streak badge: animated fire emoji, `animate-streak-bounce` triggers on mount

**Constellation Canvas:**
- `bg-[#F7F5F0]` — warm cream, not stark white
- Nodes pop in with `node-pop` animation on first load, staggered 80ms between each
- Faint grid lines: `rgba(124,158,143,0.08)` — barely visible, gives depth
- Connecting lines: `rgba(124,158,143,0.30)`, `strokeDasharray` animated on draw
- Today's node: slightly larger, soft pulse `animate-soft-pulse`
- Hover tooltip: glass card, `fadeRise` entrance, shows date + emotion tags as soft pills

**Today's Ritual (sidebar card):**
- Glass card
- Ritual type icon (Lucide) in brand accent circle
- "Mark complete" button: on click → `ritualComplete` scale animation → card turns sage green → `glow-ring` plays → Reward Toast appears

**Quick Journal (bottom right):**
- Mood pills: 5 emoji options in a row, each a soft rounded pill. Selected state: `--brand-primary` bg, white text, scale(1.05)
- "Write more →" links to full journal page

---

### 3. Journal Entry Page (`/journal`)

**Mood:** Intimate. Like opening a notebook.

**Layout:** Centered single-column, max-width 640px, generous vertical padding

```
┌─────────────────────────────────────────────────┐
│           📓 Today's entry                       │
│           Friday, 27 June                        │
│                                                  │
│  How are you feeling right now?                  │
│  ┌────────────────────────────────────────────┐  │
│  │                                            │  │
│  │  (open textarea, min 120px, grows)         │  │
│  │                                            │  │
│  └────────────────────────────────────────────┘  │
│  "Write anything. No right answer."              │
│   ↑ Figtree 400, text-tertiary, italic           │
│                                                  │
│  Mood today                                      │
│  [😔] [😟] [😐] [🙂] [😊]  ← pill toggles      │
│                                                  │
│  Energy level                                    │
│  [━━━━━━━━━●━━] 3 / 5  ← custom range slider    │
│                                                  │
│  [ Reflect & save →  ]  ← primary button, full  │
└─────────────────────────────────────────────────┘
```

**Textarea:** grows with content (`auto` height). Soft focus ring `--brand-primary/40`. Character count bottom-right `text-tertiary`.

**Submit flow:**
1. Button text changes to "Listening…" with a soft pulse dot animation
2. Skeleton shimmer appears where InsightCard will be
3. InsightCard slides in from right (`insightReveal` variant) after response
4. Canvas node pops in (visible in background if using split view on desktop)

---

### 4. Insight Card (component, appears after journal submit)

```
┌────────────────────────────────────────────────────┐
│  ✦ What we found                                   │
│  ─────────────────────────────────────────────     │
│  "Your stress spikes every Sunday evening —        │
│   likely pre-week anxiety, not the content itself. │
│   This is very common in JEE Month 4."             │
│                              ↑ Nunito 500, 1.1rem  │
│                                                    │
│  ────────────────────────────────────────────────  │
│  🌬 Your ritual for today                          │
│                                                    │
│  4-7-8 Breathing                  [BREATHING]      │
│                                   ↑ badge pill     │
│  Inhale for 4 counts, hold for 7,                  │
│  exhale for 8. Repeat 4 times.                     │
│  Do it right now, before opening your notes.       │
│                                                    │
│  [ ✓ I did it ]  ← on click: glow + toast         │
└────────────────────────────────────────────────────┘
```

Glass card. Left border `4px solid var(--brand-primary)`. Entrance: `insightReveal` framer motion. "I did it" button → `ritualComplete` animation → card bg shifts to soft sage → Reward Toast fires.

---

### 5. Insights Page (`/insights`)

**Mood:** Reflective. A gentle therapy session.

**Layout:** 2-column on desktop, 1-column mobile

```
┌── 7-day Emotion Timeline ──────────────────────────────────────┐
│  M    T    W    T    F    S    S                               │
│  🔵   🟣   🔴   🔴   🟡   🟢   🔵                              │
│  Calm Sad  Anx  Anx  Over Hope Calm                           │
└────────────────────────────────────────────────────────────────┘

┌── Pattern Detected ────────────┐  ┌── This Week's Stats ────────┐
│  ⚡ Sunday anxiety pattern      │  │  Avg mood:  😐 Neutral       │
│  "Stress peaks before the week  │  │  Best day:  Thursday         │
│   starts. Try a Sunday ritual." │  │  Streak:    🔥 12 days       │
└─────────────────────────────────┘  └──────────────────────────────┘

┌── Past Rituals ────────────────────────────────────────────────┐
│  ✓ 4-7-8 Breathing  ·  Wed 25 Jun  ·  [BREATHING]             │
│  ✓ 10-min walk      ·  Tue 24 Jun  ·  [MOVEMENT]              │
│  ○ Brain dump       ·  Mon 23 Jun  ·  [JOURNALING]  ← missed  │
└────────────────────────────────────────────────────────────────┘
```

**Emotion Timeline:** 7 colored circles in a row, each `32px`, spaced evenly. Hover: tooltip with full emotion tags. Completed rituals show `✓` overlay on circle.

**Pattern Detected card:** Left border `--brand-accent`. Icon: `⚡` in amber circle. Entrance: `cardPop` stagger.

**Past Rituals list:** Soft dividers `--border-soft`. Completed `✓` in sage green. Missed `○` in `--text-tertiary`. Each row hover: `translateX(4px)` slide.

---

### 6. Auth Pages (`/login`, `/register`)

**Layout:** Split — left panel (brand, illustration), right panel (form)

**Left panel:** Sage gradient `linear-gradient(160deg, #EAF2EE, #F4EEF0)`. Floating glass card with a quote:
> *"Every day you journal is a day you understand yourself better."*

**Right panel:** White, centered form, max-width 400px.

Register: Name → Email → Password → Exam type (segmented control: JEE / NEET / CUET / GATE / UPSC / CAT) → Exam date (date picker). Each field entrance staggered with `fadeRise`.

---

### 7. Reward Moments (micro-interactions — implement these carefully)

| Trigger | Animation |
|---|---|
| Ritual marked complete | Button → scale bounce → card turns sage → `glow-ring` → Toast slides in |
| New constellation node | `node-pop` spring, 500ms |
| Streak milestone (7, 14, 30) | Full-screen confetti burst (use `canvas-confetti`), warm amber palette |
| First journal submitted | Welcome InsightCard with extra-slow `insightReveal` (0.8s) |
| Mood pill selected | `scale(1.08)` + color fill, 150ms |
| Form submit (loading) | Button shimmer pulse, text → "Listening…" |

---

## Responsive Breakpoints

```css
/* Mobile-first */
sm:  640px   /* sidebar collapses to bottom nav */
md:  768px   /* 2-col insights layout */
lg:  1024px  /* full sidebar + canvas layout */
xl:  1280px  /* constellation canvas max-width */
```

**Mobile nav:** Bottom tab bar (Home / Journal / Insights / Profile), 56px height, glass bg, icons from Lucide.

---

## Component Library Mapping (shadcn/ui)

| Use case | shadcn component |
|---|---|
| Modals / drawers | `Dialog`, `Sheet` |
| Tooltips on canvas | `Tooltip` |
| Ritual type badge | `Badge` |
| Exam type selector | `ToggleGroup` |
| Mood slider | `Slider` |
| Toast | `Sonner` |
| Skeleton loading | `Skeleton` |
| Date picker | `Calendar` + `Popover` |
| Nav items | `NavigationMenu` |

Override shadcn defaults to use `--font-body`, `--border-soft`, and `--brand-primary` via `cn()` + Tailwind.

---

## Icon System

Use **Lucide React** throughout. Stroke width: `1.5`. Size: `20px` default, `16px` in badges/captions.

Key icons:
- Home: `Home`
- Journal: `BookOpen`
- Insights: `Sparkles`
- Breathing ritual: `Wind`
- Movement: `Footprints`
- Rest: `Moon`
- Focus: `Target`
- Motivation: `Flame`
- Streak: `Zap`
- Complete: `CircleCheck`

---

## Do Not
- No dark mode (this is a deliberately light, calm-only experience)
- No harsh drop shadows — only `--shadow-card` and `--shadow-float`
- No full-black text — always `--text-primary` (`#2D2D2A`)
- No abrupt state changes — every transition minimum 150ms
- No skeleton spinners — use shimmer skeletons only (`Skeleton` from shadcn)
- No generic placeholder copy like "Enter your text here" — use warm, human prompts