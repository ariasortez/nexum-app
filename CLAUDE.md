# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a monorepo with two directories:
- `backend/` - Hono-based Node.js API server (TypeScript)
- `ui/` - Frontend application (currently empty)

## Development Commands

All commands should be run from the `backend/` directory:

```bash
# Install dependencies (uses pnpm)
pnpm install

# Start development server with hot reload (port 3000)
pnpm dev

# Build TypeScript to dist/
pnpm build

# Run production build
pnpm start
```

## Architecture

**Backend**: Uses Hono web framework with `@hono/node-server` for Node.js runtime. Entry point is `backend/src/index.ts`. TypeScript configured for ESNext with NodeNext module resolution. Hono JSX is available via `hono/jsx` import source.
