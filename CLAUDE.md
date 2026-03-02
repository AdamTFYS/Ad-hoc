# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Revision_progress - a project hosted at github.com/AdamTFYS/Revision_progress.

## Development Commands

All commands must be run from the `revisionprogression/` subdirectory:

```bash
cd revisionprogression
npm run dev      # Start dev server (Next.js with Turbopack)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint (flat config, eslint.config.mjs)
```

## Architecture

- **Framework**: Next.js 16 with App Router (`revisionprogression/app/`)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 via PostCSS
- **Fonts**: Geist Sans and Geist Mono (loaded via `next/font/google`)
- **Path alias**: `@/*` maps to `revisionprogression/*`

The Next.js app lives inside the `revisionprogression/` subdirectory (not the repo root). The repo root contains only this CLAUDE.md, README.md, and the lock file.
