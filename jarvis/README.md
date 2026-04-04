# JARVIS

Joint Adaptive Real-time Virtual Intelligence System

JARVIS is a personal assistant web application focused on helping users stay organized, focused, and productive. The codebase is built with scalability in mind so features can be added safely, one module at a time.

This repository is currently set up for personal use. Anyone who wants to run their own copy should provide their own MongoDB Atlas database URI and their own access PIN in their local environment file.

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
- Planned backend storage will use MongoDB Atlas via `MONGODB_URI`.
- Protect the assistant route with `JARVIS_ACCESS_PIN`; set a unique value in your local environment before deploying or sharing the app.
- AI Assist prioritization uses Groq via `GROQ_API_KEY` (required) and `GROQ_MODEL` (optional, defaults to `llama-3.3-70b-versatile`).
- Each deployment should use its own `MONGODB_URI` and `JARVIS_ACCESS_PIN`.

## Task Schema

The workspace stores each task with a MongoDB-friendly structure so it can later be shared with an LLM.

```text
Task
	- id
	- task
	- deadline? (optional)
	- expectedTimeHours (0.5, 0.75 [45 mins], 1, 1.5, 2-7)
	- tags: string[]
	- notes: [{ id, note, createdAt }]
	- createdAt
	- updatedAt
```

Notes can be added both when creating a task and after a task already exists.

## Assistant Data Schema

MongoDB now stores data from all three assistant sections.

```text
assistant_header
	- _id: "primary"
	- about
	- createdAt
	- updatedAt

assistant_workspace
	- _id: "primary"
	- tasks: Task[]
	- createdAt
	- updatedAt

assistant_notice_board
	- _id: "primary"
	- notes: [{ id, text, createdAt }]
	- createdAt
	- updatedAt
```

Each section (`Assistant Header`, `Workspace`, and `Notice Board`) provides an explicit `Sync` action in the UI to persist current local state.

Workspace tasks are now auto-saved to MongoDB when they are created, updated with notes, or marked done. The Sync button still exists as a manual fallback.

## AI Assist (Groq)

The AI Assist panel can prioritize workspace tasks based on:

- Header profile (`about`)
- Header energy level (`0-10`)
- All workspace tasks (deadline, expected time, tags, notes)
- Optional user remarks entered in AI Assist

When you click "Prioritize Workspace", JARVIS calls Groq, parses the ranked output, then reorders tasks automatically (top task = do now).

### Groq API Key Setup

1. Sign in to Groq console.
2. Create a new API key in the API keys section.
3. Add the key to `.env.local`:

```bash
GROQ_API_KEY=your_real_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```

4. Restart the dev server after updating env vars.

Security notes:

- Keep `GROQ_API_KEY` server-side only.
- Do not expose keys in client components or browser logs.

## Access Control

The `/assistant` route is PIN-protected. The app checks the `JARVIS_ACCESS_PIN` value from the server environment and only unlocks the assistant after the correct PIN is entered.

That means:

- The landing page stays public.
- The assistant workspace is private by default.
- Anyone deploying the app should configure their own access PIN and database.

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
