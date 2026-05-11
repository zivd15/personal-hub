# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 — configured entirely via `src/app/globals.css` (`@theme` block), no `tailwind.config.js`
- **PWA**: `@ducanh2912/next-pwa` — disabled in dev, generates service worker on build
- **Database** (Phase 2): Supabase (not yet wired up — mock state used throughout)
- **Deployment**: Cloudflare Pages behind Cloudflare Zero Trust

## Commands

```bash
npm run dev      # http://localhost:3000
npm run build    # production build (also generates SW + PWA assets)
npm run start    # serve production build locally
npm run lint     # ESLint
```

## Architecture

All source lives in `src/`.

### Styling — Tailwind v4

There is **no `tailwind.config.js`**. All custom tokens (accent color, note palette, surface colors) are defined as CSS variables in the `@theme` block inside `src/app/globals.css`. Reference them in components as `bg-[--color-accent]`, `text-[--color-muted]`, etc.

### Layout shell (`src/app/`)

- `layout.tsx` — sets metadata, manifest link, viewport, and Geist font. PWA `appleWebApp` config lives here.
- `page.tsx` — the entire app is a single `"use client"` Dashboard page. It owns all state (notes + tasks) and passes handlers down to components. Swap `useState` for Supabase queries in Phase 2.

### Component tree

```
page.tsx (Dashboard — all state)
├── Sidebar          — desktop left nav + mobile bottom nav, switches ActiveView
├── Header           — title, subtitle, contextual "Add" button
├── StickyNoteBoard  — masonry columns layout (CSS `columns-*`)
│   └── StickyNote   — individual note card, inline edit via textarea, color picker
└── TaskList         — splits tasks into "To do" / "Completed" sections
    └── TaskItem     — checkbox, inline text + due date edit, overdue/today badge
```

### Types (`src/types/index.ts`)

Three core types: `StickyNote`, `Task`, `ActiveView`. `NoteColor` is a union of the five palette keys.

### PWA assets

`public/manifest.json` references icons at `/icons/icon-192.png` and `/icons/icon-512.png`. You must supply real PNG icon files before deploying — the manifest will silently fail without them.

### Environment variables

Copy `.env.example` → `.env.local`. Only `NEXT_PUBLIC_*` vars are available client-side. Never commit `.env.local`.

### Cloudflare Pages deployment

Build command: `npm run build` — Output directory: `.next` — For Cloudflare Pages, set environment variables in the Pages dashboard under **Settings → Environment variables**.
