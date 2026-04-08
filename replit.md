# Mentora AI

## Overview

AI-powered personalized learning and mentoring chatbot prototype for students. Built as a full-stack React + Express web app in a pnpm workspace monorepo.

## Product

**Mentora AI** is an EdTech prototype featuring:
- AI chat tutor with real-time streaming (GPT-5.2)
- Student profile & onboarding (name, subjects, difficulty, learning style)
- AI-generated MCQ quizzes with instant feedback
- Progress dashboard (streaks, scores, topics)
- Conversation library with history
- Settings for updating profile

## Stack

- **Frontend**: React + Vite (`artifacts/mentora/`) at preview path `/`
- **Backend**: Express 5 (`artifacts/api-server/`) at `/api`
- **Database**: PostgreSQL + Drizzle ORM
- **AI**: OpenAI GPT-5.2 via Replit AI Integrations proxy
- **Monorepo tool**: pnpm workspaces
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API codegen**: Orval (from OpenAPI spec in `lib/api-spec/openapi.yaml`)

## Key Files

- `lib/api-spec/openapi.yaml` — API contract (single source of truth)
- `lib/db/src/schema/` — Database tables (conversations, messages, student_profiles, quiz_results)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/mentora/src/pages/` — Frontend pages (landing, chat, quiz, dashboard, library, settings, onboarding)
- `artifacts/mentora/src/components/layout.tsx` — Sidebar navigation with profile guard

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## API Routes

- `GET/POST/PUT /api/profile` — Student profile management
- `GET /api/progress` — Progress summary
- `POST /api/progress/quiz-result` — Save quiz result
- `GET /api/progress/quiz-results` — List quiz results
- `GET/POST /api/openai/conversations` — List/create conversations
- `GET/DELETE /api/openai/conversations/:id` — Get/delete conversation
- `GET/POST /api/openai/conversations/:id/messages` — Messages (POST streams SSE)
- `POST /api/openai/generate-quiz` — Generate AI quiz questions
