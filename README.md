# JobTracker

A full-stack job application tracking system for personal use.

## Tech Stack

| Layer     | Technology                        |
| --------- | --------------------------------- |
| Frontend  | React 19, Vite 7, TypeScript      |
| Backend   | Express 5, TypeScript, Zod        |
| Database  | MongoDB                           |
| Tooling   | npm workspaces, tsx, ESLint        |

## Project Structure

```
jobtracker/
├── apps/
│   ├── api/          # Express API server
│   │   └── src/
│   │       ├── config/env.ts   # Zod-validated env config
│   │       └── server.ts       # Express app entry point
│   └── web/          # React SPA (Vite)
│       └── src/
├── packages/
│   └── shared/       # Shared types & utilities (planned)
└── package.json      # Workspace root
```

## Prerequisites

- Node.js ≥ 18
- MongoDB instance (local or Atlas)

## Getting Started

1. **Install dependencies** (from the project root):

   ```bash
   npm install
   ```

2. **Configure environment variables** — create `apps/api/.env`:

   ```env
   NODE_ENV=development
   PORT=4000
   CLIENT_ORIGIN=http://localhost:5173
   MONGODB_URI=mongodb://localhost:27017/jobtrackr
   JWT_ACCESS_SECRET=your-access-secret-min-16-chars
   JWT_REFRESH_SECRET=your-refresh-secret-min-16-chars
   ```

3. **Start development servers**:

   ```bash
   # API (http://localhost:4000)
   npm run dev:api

   # Web (http://localhost:5173)
   npm run dev:web
   ```

4. **Verify the API** is running:

   ```
   GET http://localhost:4000/api/v1/health
   ```

## Available Scripts

| Command            | Description                  |
| ------------------ | ---------------------------- |
| `npm run dev:api`  | Start API server (watch mode)|
| `npm run dev:web`  | Start Vite dev server        |

## Current Status

- [x] Monorepo setup (npm workspaces)
- [x] Express API scaffold with health endpoint
- [x] Environment validation (Zod)
- [x] CORS configuration
- [x] React + Vite frontend scaffold
- [ ] MongoDB connection
- [ ] Authentication (JWT)
- [ ] Job CRUD API & UI