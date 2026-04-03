# JARVIS

Joint Adaptive Real-time Virtual Intelligence System

JARVIS is a personal assistant web application focused on helping users stay organized, focused, and productive. The codebase is built with scalability in mind so features can be added safely, one module at a time.

## Current Status

- Landing page implemented with JARVIS branding and a "Get Started" action.
- "Get Started" routes users into the app at `/assistant`.
- Project structure initialized for modular development.

## Tech Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS v4
- ESLint

## Folder Structure

```text
jarvis/
	app/                       # App Router entry points and routes
		assistant/               # First in-app route
	src/
		components/
			landing/               # Landing-specific UI blocks
			ui/                    # Reusable, generic UI components
		constants/               # App-wide static constants
		lib/                     # Framework-agnostic helpers/utilities
		services/                # API/service layer (future-ready)
		types/                   # Shared TypeScript types/interfaces
		utils/                   # Environment and utility helpers
	public/                    # Static assets
```

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.example .env.local
```

3. Run development server:

```bash
npm run dev
```

4. Open http://localhost:3000

## Environment Variables

- Keep all secrets in `.env.local`.
- Never hardcode API keys, tokens, or private credentials in source files.
- Add new keys to `.env.example` with safe placeholder values.

## Engineering Conventions

- Prefer small, focused modules over large files.
- Keep reusable UI in `src/components/ui`.
- Keep route-specific UI under feature folders (for example `src/components/landing`).
- Use shared constants/types/helpers from `src/constants`, `src/types`, `src/lib`.
- Write concise comments only where logic is non-obvious.
- Build mobile-first layouts by default.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production app
- `npm run start` - Run production server
- `npm run lint` - Run lint checks

## Roadmap Notes

This README will be updated as each feature is implemented step by step, including:

- Feature overview
- New routes/modules
- Required environment variables
- Setup or migration notes
