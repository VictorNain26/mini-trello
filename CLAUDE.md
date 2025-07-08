# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mini-Trello is a Trello-like kanban board application built with a modern full-stack architecture using TypeScript, React, and Node.js. The project uses a monorepo structure with Turbo for build orchestration and pnpm for package management.

## Architecture

### Monorepo Structure
- **apps/api/**: Express.js backend with tRPC API, WebSocket support, and Prisma ORM
- **apps/web/**: React frontend with Vite, tRPC client, and drag-and-drop functionality
- **docker/**: Docker Compose configuration for development environment

### Tech Stack
- **Backend**: Express.js, tRPC, Prisma (PostgreSQL), Socket.io, Auth.js, Redis
- **Frontend**: React 19, TypeScript, Vite, TailwindCSS v4, @dnd-kit, Zustand, React Query
- **Database**: PostgreSQL with Redis for caching/sessions
- **Authentication**: Auth.js with Express adapter
- **Real-time**: Socket.io for live collaboration and presence

## Common Development Commands

### Root Level Commands
```bash
# Start development servers for both apps
pnpm dev

# Build all applications
pnpm build

# Run linting across all apps
pnpm lint

# Format code with Prettier
pnpm format

# Type checking across all packages
pnpm check

# Start Docker environment (includes DB)
pnpm docker:up
pnpm docker:down
```

### Database Commands
```bash
# Run any Prisma command on the API
pnpm db [prisma-command]

# Examples:
pnpm db migrate dev
pnpm db generate
pnpm db studio
pnpm db seed
```

### App-Specific Commands
```bash
# API development (from apps/api/)
pnpm dev    # Start with hot reload
pnpm build  # Build TypeScript
pnpm lint   # ESLint
pnpm seed   # Seed database

# Web development (from apps/web/)
pnpm dev      # Start Vite dev server
pnpm build    # Build for production
pnpm preview  # Preview production build
pnpm lint     # ESLint with zero warnings
```

## Key Architecture Patterns

### Database Schema
The application uses a hierarchical board structure:
- **Board** → **Column** → **Card** hierarchy
- User authentication with sessions and accounts
- Order-based positioning with indexed columns for performance

### API Architecture
- **tRPC**: Type-safe API with React Query integration
- **Express**: Traditional REST endpoints for auth (Auth.js requirement)
- **WebSocket**: Real-time collaboration via Socket.io
- **Middleware**: Custom auth and error handling middleware

### Frontend Architecture
- **Component Structure**: Feature-based organization with shared components
- **State Management**: Zustand for global state, React Query for server state
- **Drag & Drop**: @dnd-kit for kanban board interactions
- **Styling**: TailwindCSS v4 with utility-first approach

### Real-time Features
- **Presence System**: Live user indicators on boards
- **Socket.io**: WebSocket connection for real-time updates
- **Redis Adapter**: Scales WebSocket connections across instances

## Development Environment

### Docker Setup
The project includes a complete Docker environment:
- PostgreSQL database on port 5432
- Redis cache on port 6379
- API server on port 4000
- Web server on port 5173

### Environment Variables
Check `.env.example` for required environment variables. The Docker setup uses this file automatically.

### Database Development
- Prisma migrations are in `apps/api/prisma/migrations/`
- Database seed script available at `apps/api/prisma/seed.ts`
- Always run `pnpm db generate` after schema changes

## Testing and Quality

### Linting
- ESLint configured with TypeScript rules
- Web app enforces zero warnings policy
- Run `pnpm lint` to check all packages

### Type Safety
- Strict TypeScript configuration
- tRPC provides end-to-end type safety
- Run `pnpm check` for type checking
- **CRITICAL: ALWAYS run `pnpm check` after making code changes**

## Important Notes

- The project uses PNPM workspaces - always run commands from the root unless working on a specific app
- Database operations should use the `pnpm db` alias from the root
- The API uses both tRPC and Express routes (Auth.js requires Express)
- Real-time features require both the API server and proper WebSocket setup
- TailwindCSS v4 syntax may differ from older versions

## Claude Code Instructions

**CRITICAL: Token Usage Optimization**
- Be extremely concise in all responses
- Use 1-3 sentences maximum unless explicitly asked for detail
- No unnecessary explanations, preambles, or summaries
- Answer directly without "Here is..." or "The answer is..."
- Use single words when possible (Yes/No/Done/Fixed)
- Avoid repetitive or redundant information
- Only provide essential information for the task at hand