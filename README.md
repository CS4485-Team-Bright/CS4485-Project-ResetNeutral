# ResetNeutral

**An accessible fighting game wiki and in-browser combo trainer.**

ResetNeutral lowers the barrier of entry to fighting games. The genre has long been gatekept by paywalled training modes, dense move-list tables, and steep mechanical hurdles — players often have to buy the game before they can find out whether they even like it. ResetNeutral brings the wiki and the lab together in one free site: structured per-game and per-character pages sit next to a browser-based Practice Arena where you can drill move inputs and combo notation against the real frame data, no install required.

- 🌐 **Live site:** https://cs4485-project-resetneutral.pages.dev/
- 📋 **Project board:** https://github.com/orgs/CS4485-Team-Bright/projects/1

---

## Table of Contents

- [Supported Games](#supported-games)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [How the Practice Arena Works](#how-the-practice-arena-works)
- [Routes](#routes)
- [Team](#team)
- [Build Phases](#build-phases)
- [Attributions](#attributions)

---

## Supported Games

| Game | Short | Characters |
|---|---|---|
| Street Fighter 6 | SF6 | 29 |
| Guilty Gear Strive | GGST | 30 |
| 2XKO | 2XKO | 13 |

Each game ships with per-character move lists, combo recipes graded **Beginner / Intermediate / Advanced**, and game-specific input bindings tuned to its own notation system.

---

## Features

- **Game and character browser** — Game-agnostic UI that re-themes per title, character cards with archetype/difficulty metadata, and full move/combo tables loaded live from Supabase.
- **Practice Arena** — A keyboard-driven training mode that reads inputs frame-by-frame, recognizes directional motions in numpad notation (236, 623, 41236, …), validates multi-step combo chains, and gives audio + visual feedback on success or failure.
- **Per-game input bindings** — Each game has its own keyboard map (e.g. SF6's six-button layout, 2XKO's L/M/H/S scheme), with crouching detection, facing-direction flips, and macro support.
- **Mastery tracking** — Logged-in users get per-move and per-combo mastery progression that persists across sessions via a Supabase-backed `user_move_mastery` table, surfaced on the profile page.
- **Standalone Phaser training ground** — A separate Phaser 3 prototype lives in `Training_Ground/` for gamepad-input experiments outside the React app.

---

## Tech Stack

| Layer | Tools |
|---|---|
| Framework | React 18 · TypeScript · Vite 6 |
| Routing | react-router v7 |
| Styling | Tailwind CSS v4 · shadcn/ui · Radix UI primitives · Material UI |
| State / Data | Supabase JS client · React hooks (`useGameData`, `useAuth`, `useMastery`) |
| Backend | Supabase (Postgres + Auth) |
| Testing | Vitest · @testing-library/jest-dom · jsdom |
| Hosting | Cloudflare Pages (also AWS Amplify-compatible via `amplify.yml`) |
| Training Ground | Phaser 3 (standalone) |

> Note: the original project proposal called for a Python/Flask backend with Firebase. The team migrated to a React + Supabase stack during Phase 2 for faster iteration and to keep the entire app static-deployable to Cloudflare Pages.

---

## Project Structure

```
CS4485-Project-ResetNeutral/
├── src/
│   ├── main.tsx                       # Vite entry point
│   ├── app/
│   │   ├── App.tsx                    # AuthProvider + RouterProvider
│   │   ├── routes.tsx                 # Route definitions
│   │   ├── api/client.ts              # Supabase client (reads VITE_SUPABASE_*)
│   │   ├── components/
│   │   │   ├── HomePage.tsx
│   │   │   ├── GamesListPage.tsx
│   │   │   ├── GamePage.tsx
│   │   │   ├── CharacterPage.tsx
│   │   │   ├── PracticeArena.tsx      # The training mode (heart of the app)
│   │   │   ├── InputDisplay.tsx
│   │   │   ├── AuthPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── ui/                    # shadcn/ui primitives
│   │   ├── hooks/
│   │   │   ├── useAuth.tsx
│   │   │   ├── useGameData.ts
│   │   │   └── useMastery.tsx
│   │   ├── types/game.ts              # Game / Character / Move / Combo types
│   │   └── utils/inputConfig.tsx      # Per-game key bindings + notation parser
│   └── styles/                        # Tailwind, theme, fonts
├── public/Images/                     # Character portraits (2XKO, GGST, SF6)
├── Training_Ground/Reset_Neutral/     # Standalone Phaser prototype
├── Documents/                         # Spec, weekly reports, meeting minutes
├── index.html
├── package.json
├── vite.config.ts                     # Vite config with React + Tailwind plugins
└── amplify.yml                        # AWS Amplify build manifest
```

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase project provisioned with the `games`, `characters`, `moves`, `combos`, and `user_move_mastery` tables

### Install and run

```bash
git clone https://github.com/CS4485-Team-Bright/CS4485-Project-ResetNeutral.git
cd CS4485-Project-ResetNeutral
npm install
npm run dev
```

The Vite dev server starts at `http://localhost:5173` by default.

### Environment variables

Create a `.env.local` file at the project root:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

The Supabase client throws at startup if either variable is missing, so the app fails fast on misconfiguration.

### Build

```bash
npm run build      # outputs to dist/
npm run preview    # serve the production build locally
```

### Tests

```bash
npm run test       # watch mode (Vitest)
npm run test:ci    # one-shot CI run (passes with no tests)
```

### Standalone Phaser Training Ground

```bash
cd Training_Ground/Reset_Neutral
# open index.html via any static server, e.g.
npx serve .
```

---

## How the Practice Arena Works

`src/app/utils/inputConfig.tsx` holds the per-game keyboard maps and notation parser. When a user is on a character page:

1. Each `keydown`/`keyup` updates an `activeKeys` set.
2. Direction keys (WASD or arrow keys) are folded into **numpad notation** (1–9), with facing-direction flips for left-side play.
3. Held buttons are mapped to game-specific button IDs (e.g. SF6 → LP/MP/HP/LK/MK/HK; 2XKO → L/M/H/S).
4. Combo recipes are pre-parsed into `ParsedStep[]`, and each tick checks whether the current input plus recent history satisfies the next step's macro.
5. On a complete chain the WebAudio engine plays an ascending tone per step; failed inputs trigger a low sawtooth buzz.

Authenticated users have move and combo attempts written to Supabase via `recordMoveAttempt`, feeding the streak and mastery state shown on the profile page.

---

## Routes

| Path | Page |
|---|---|
| `/` | Home — hero, game cards, featured characters |
| `/games` | All supported games |
| `/game/:gameId` | Game detail + character roster |
| `/game/:gameId/character/:characterId` | Character moves, combos, and Practice Arena |
| `/auth` | Sign in / sign up (Supabase) |
| `/profile` | User profile + mastery progress |
| `*` | 404 |

---

## Team

| Member | Role |
|---|---|
| Adam M. Jackson | Backend Infrastructure — Database & Auth Lead |
| Luis C. Gutierrez | Backend Infrastructure — Data Architect / API Lead |
| Zachary Karanja | Frontend UI — Combo Logic & Visualization |
| Alexis Vazquez | Frontend UI — Global UI/UX |
| Josh A. McKone | Frontend Input — Game-Loop Integration |
| Eric M. Wilhoit | Frontend Input — State Machine Lead |

See [`ROLES_DESC.md`](./ROLES_DESC.md) for full role descriptions.

---

## Build Phases

| Phase | Goal | Window |
|---|---|---|
| 1 — Foundations | Scope, architecture, data model | 2/13 – 2/20 |
| 2 — UI/UX & Data | Figma mockups, seed data, read-only API | 2/20 – 2/27 |
| 3 — MVP | Navigable wiki + Practice Arena with combo detection | 2/27 – 4/17 |
| 4 — Beta & QA | Integration tests, content fill-out, bug bash | 4/17 – 4/24 |
| 5 — Deploy & Handover | Production Cloudflare deploy, final demo, tagged release | 4/24 – 5/1 |

---

## Attributions

UI primitives from [shadcn/ui](https://ui.shadcn.com/) (MIT). Some imagery from [Unsplash](https://unsplash.com). See [`ATTRIBUTIONS.md`](./ATTRIBUTIONS.md). Character portraits and game names belong to their respective publishers (Capcom, Arc System Works, Riot Games) and are used here for educational reference within this academic project.

---

*CS 4485 — Team Bright (Team #5) — UT Dallas Computer Science Senior Capstone*
