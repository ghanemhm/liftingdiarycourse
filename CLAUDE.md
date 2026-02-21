# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Next.js lifting diary app with Clerk authentication, Neon PostgreSQL via Drizzle ORM, and shadcn/ui components.

## Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production with Turbopack
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx drizzle-kit push` - Push schema changes to database
- `npx drizzle-kit studio` - Open Drizzle Studio for DB inspection

## Code Generation Guidelines

**IMPORTANT**: Before generating ANY code, you MUST ALWAYS read the relevant documentation file(s) within the `/docs` directory first. This is non-negotiable — do not write a single line of code without first consulting the applicable doc(s) to understand existing patterns, conventions, and best practices.

- /docs/ui.md
- /docs/auth.md — authentication patterns (Clerk, protected routes, middleware)
- /docs/data-fetching.md — server-side data access via `src/data/` helpers
- /docs/data-mutations.md — server actions and form handling
- /docs/routing.md — Next.js App Router conventions and page structure
- /docs/server-components.md — server vs client component decisions
- /docs/ui.md — UI components (shadcn/ui only), styling, and date formatting

## Architecture

### Stack
- **Framework**: Next.js App Router (`src/app/`) with Turbopack
- **Auth**: Clerk (`@clerk/nextjs`) — middleware in `src/middleware.ts` protects `/dashboard` routes
- **Database**: Neon serverless PostgreSQL via Drizzle ORM (`src/db/`)
- **UI**: shadcn/ui components only (`src/components/ui/`) — do not create custom components
- **Styling**: Tailwind CSS v4 with PostCSS; use `cn()` from `src/lib/utils.ts` for class merging
- **Path Alias**: `@/*` maps to `./src/*`

### Data Flow
Server Components → `src/data/` helpers → `src/db/index.ts` (Drizzle) → Neon PostgreSQL

All data fetching goes through `src/data/` helpers. All mutations use Server Actions colocated in `actions.ts` files next to their route. Data helpers enforce `userId` isolation via Clerk's `auth()`.

### Database Schema (`src/db/schema.ts`)
- `workouts` — userId, name, startedAt, completedAt
- `exercises` — global exercise catalog (name)
- `workoutExercises` — junction: workoutId, exerciseId, order
- `sets` — workoutExerciseId, setNumber, weight (decimal), reps

### Key Conventions
- Next.js 15 async params: page props use `Promise<{ param: string }>` — always `await params`
- Date formatting: use `date-fns` with ordinal format (e.g., "1st Sep 2025")
- Forms: `react-hook-form` + Zod validation; server actions return `{ error?: string }`
