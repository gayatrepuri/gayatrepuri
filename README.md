# Remodule Ai (prototype)

A web app for design engineers at manufacturers of configurable machinery. It suggests design changes that keep function the same while making an assembly more modular, easier to take apart and more remanufacturable. The engineer approves or rejects every suggestion. Nothing is changed automatically.

> This repository also contains an unrelated notebook (`brain-tumor-detection.ipynb`), which the app does not use.

## Where things live

| What | File |
|---|---|
| Product name | `src/config/site.ts` |
| Colours, fonts, corner style (design tokens) | `src/styles/tokens.css` |
| Database setup script | `supabase/migrations/0001_initial_schema.sql` |
| Settings template (keys) | `.env.example` |

## Settings ("environment variables")

Copy `.env.example` to `.env.local` and fill it in. Never share `.env.local`.

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: from your Supabase project.
- `ANTHROPIC_API_KEY`: server-side only, used from Phase 3.
- `ANTHROPIC_MODEL`: defaults to `claude-opus-5-5`.

## Commands

- `npm install`: download the building blocks (first time only)
- `npm run dev`: run the app on your computer at http://localhost:3000
- `npm test`: run the automatic tests
- `npm run build`: check the app builds for publishing
