# Running Events Tracker

## Overview

This is a running events tracker application that allows users to manage marathon/running events and track participant selections. Users can create running events (races), add participants, and mark which events each participant plans to attend. The app features avatar uploads for both users and events, with a matrix-style interface showing user-event relationships.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter (lightweight router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite with React plugin

The frontend follows a component-based architecture with:
- Pages in `client/src/pages/`
- Reusable UI components in `client/src/components/ui/`
- Domain-specific components in `client/src/components/matrix/`
- Shared utilities and hooks in `client/src/lib/` and `client/src/hooks/`

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **API Pattern**: RESTful API endpoints under `/api/`
- **File Uploads**: Multer for handling avatar image uploads
- **Storage**: In-memory storage with JSON file persistence (`data.json`)

Key API endpoints:
- `/api/categories` - CRUD for running events
- `/api/users` - CRUD for participants
- `/api/user-categories` - User-event selection matrix
- `/api/avatars/*` - Serving uploaded avatar images

### Data Layer
- **Schema Definition**: Drizzle ORM with PostgreSQL schema (in `shared/schema.ts`)
- **Current Storage**: MemStorage class using in-memory Maps with JSON file backup
- **Database Ready**: Drizzle config prepared for PostgreSQL migration via Neon serverless

The schema defines three main entities:
- `categories` - Running events with name, date, location, logo
- `users` - Participants with name, avatar, gender
- `userCategories` - Junction table for user-event selections

### Telegram Integration
The app includes optional Telegram WebApp/GameProxy integration for embedding within Telegram, with safe fallbacks when running outside Telegram context.

## External Dependencies

### Database
- **Drizzle ORM**: Schema definition and query building
- **@neondatabase/serverless**: PostgreSQL driver for Neon (prepared but not actively used)
- **connect-pg-simple**: Session storage for PostgreSQL

### UI Framework
- **Radix UI**: Complete set of accessible UI primitives
- **shadcn/ui**: Pre-styled component layer over Radix
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

### API & State
- **TanStack React Query**: Server state management and caching
- **Zod**: Schema validation (via drizzle-zod)

### File Handling
- **Multer**: Multipart form data handling for file uploads

### Build & Development
- **Vite**: Frontend build tool with HMR
- **esbuild**: Server bundling for production
- **TypeScript**: Type safety across the stack