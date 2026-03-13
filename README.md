# ResetNeutral

**Accessible Fighting Game Wiki and Browser Training Engine**

ResetNeutral is a free, web-based platform for anyone looking to get into fighting games. It provides a centralized knowledge base of game mechanics, character move-sets, and combo data — plus an in-browser Training Ground where players can practice inputs without purchasing a game first.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Build Phases](#build-phases)
- [Non-Functional Requirements](#non-functional-requirements)

---

## Overview

| Field | Value |
|---|---|
| Version | 1.0 |
| Build Plan | 5 Phases over 11 weeks |
| Auth | Admin-only (content management) |
| Environments | Development · Staging (Vercel) · Production (AWS) |

**Target users:** new fighting game players, intermediate players expanding their game knowledge, and admin content curators.

**Core features:**
- Structured wiki: general mechanics, per-game pages, per-character pages with moves/combos
- Discoverable learning paths: Home → General / Games → Character → Combos
- In-browser Training Ground with keystroke capture, combo recognition, and timing feedback (<200ms input latency target)
- Admin dashboard for content management (games, characters, combos)
- AI-assisted character summaries (Phase 3)

---

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Frontend | HTML, CSS, JavaScript | Vanilla JS; modular component-like structure in `src/` |
| HTTP Client | axios | Centralized in `src/api/` |
| State | Vanilla JS modules | Single `ResetNeutral` namespace; no global mutable state |
| Backend | Python, Flask | REST API under `/api/v1` |
| Database | Firebase / Firestore or Supabase | One instance per environment |
| Auth | Admin-only token/session | Public browsing requires no auth |
| Hosting | AWS | Backend API + static frontend |
| Testing | pytest / Python unittest | API route tests; JS smoke tests optional |

---

## Project Structure

```
easycombo/
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   └── src/
│       ├── css/
│       │   ├── base.css
│       │   ├── layout.css
│       │   └── components.css
│       └── js/
│           ├── main.js          # Bootstrap and routing
│           ├── router.js        # Client-side router
│           ├── api.js           # REST API wrapper
│           ├── state.js         # In-memory state
│           └── ui/
│               ├── layout.js    # Nav, header, footer
│               ├── home.js
│               ├── general.js
│               ├── games.js
│               ├── characters.js
│               ├── training.js
│               └── admin.js
└── backend/
    ├── app/
    │   ├── __init__.py
    │   ├── config.py
    │   ├── models.py
    │   ├── api/
    │   │   ├── games.py
    │   │   ├── characters.py
    │   │   ├── training.py
    │   │   └── admin.py
    │   ├── services/
    │   │   ├── games_service.py
    │   │   ├── characters_service.py
    │   │   ├── training_service.py
    │   │   └── admin_service.py
    │   └── utils/
    │       ├── db.py
    │       ├── logger.py
    │       └── errors.py
    ├── tests/
    │   ├── test_games_api.py
    │   ├── test_characters_api.py
    │   ├── test_training_api.py
    │   └── test_admin_api.py
    ├── scripts/
    │   └── seed_data.py
    ├── .env.example
    ├── requirements.txt
    └── README.md
```

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js (optional, for frontend tooling)
- A Firebase or Supabase project

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in required values
python -m app          # starts Flask on PORT
```

### Frontend

Open `frontend/public/index.html` directly in a browser, or serve with any static file server:

```bash
npx serve frontend/public
```

Set `VITE_API_BASE_URL` (or equivalent) to point at your running Flask backend.

### Seed Data

```bash
python scripts/seed_data.py
```

### Tests

```bash
pytest backend/tests/
```

---

## Environment Variables

Copy `.env.example` and fill in all values. The backend will **fail fast** at startup if any required variable is missing.

**Backend**

| Variable | Description |
|---|---|
| `DB_URL` / `FIREBASE_PROJECT_ID` / `SUPABASE_URL` | Primary data store connection |
| `ADMIN_JWT_SECRET` | Secret for admin auth tokens |
| `PORT` | Flask listen port |
| `FRONTEND_URL` | Allowed CORS origin |
| `NODE_ENV` | `development` \| `staging` \| `production` |
| `AI_PROVIDER_KEY` | Key for AI summary provider (Phase 3) |

**Frontend**

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Base URL for the Flask backend |

> **Security:** Never hardcode secrets. AI provider keys must never appear in frontend code or browser network requests.

---

## API Reference

**Base URL:** `/api/v1`  
All responses are JSON. Public read endpoints require no auth. Admin/write endpoints require a valid admin token.

### Games

| Method | Route | Description |
|---|---|---|
| GET | `/games` | List all game IDs |
| GET | `/games/{gameId}` | Game metadata (name, description, publisher, consoles, DLC) |
| GET | `/games/{gameId}/config` | Render config and frame data hints (cache client-side) |

### Characters

| Method | Route | Description |
|---|---|---|
| GET | `/games/{gameId}/characters` | List character IDs |
| GET | `/games/{gameId}/characters/{characterId}` | Character resources list |

### Resources

| Method | Route | Description |
|---|---|---|
| GET | `/games/{gameId}/characters/{characterId}/{resource}` | Resource subtypes (e.g. combo categories) |
| GET | `/games/{gameId}/characters/{characterId}/{resource}/{type}` | Detailed data for a resource type |

### Training (Phase 2+)

| Method | Route | Description |
|---|---|---|
| POST | `/training/validate` | Validate an input sequence against a target combo |

### Admin

| Method | Routes | Description |
|---|---|---|
| POST/PATCH/DELETE | `/admin/games`, `/admin/games/{gameId}` | Manage games |
| POST/PATCH/DELETE | `/admin/games/{gameId}/characters/...` | Manage characters |
| POST/PATCH/DELETE | `/admin/combos`, `/admin/combos/{comboId}` | Manage combos |

### AI (Phase 3)

| Method | Route | Description |
|---|---|---|
| POST | `/ai/character-summary` | Generate/retrieve a cached AI character summary |
| POST | `/ai/combos/upload` | Submit a community combo (pending review) |

### Error Format

```json
{
  "error": {
    "code": 404,
    "message": "Character not found"
  }
}
```

Standard codes: `400` validation, `401` unauthorized, `403` forbidden, `404` not found, `409` conflict, `429` rate limited, `500` server error.

---

## Build Phases

| Phase | Goal | Dates |
|---|---|---|
| 1 — Foundations | Scope, architecture diagram, data model, API contract | 2/13 – 2/20 |
| 2 — UI/UX & Data | Figma mockups, seed dataset, core read-only API | 2/20 – 2/27 |
| 3 — MVP Dev | Navigable wiki, Training Ground with basic combo detection | 2/27 – 4/17 |
| 4 — Testing & Beta | Integration tests, QA report, expanded content | 4/17 – 4/24 |
| 5 — Deploy & Handover | Production AWS deploy, final demo, tagged GitHub release | 4/24 – 5/1 |

**Phase gates:** do not advance to the next phase until all requirements for the current phase pass manual and automated testing.

---

## Non-Functional Requirements

- **Page load:** < ~2 seconds on typical lab hardware
- **Training Ground input latency:** < 200ms for visible feedback
- **API response time:** < 300ms for core data endpoints
- **Combo recognition accuracy:** ≥ 90% for preset sequences in controlled tests
- **Accessibility:** WCAG AA contrast, keyboard navigable, alt text on all images, ARIA labels on Training Ground controls
- **Code:** Backend logic split into `api/`, `services/`, `utils/` — no duplicated route logic

---

*ResetNeutral v1.0 — spec last updated March 2026*
