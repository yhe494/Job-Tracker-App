# JobTracker

JobTracker is a full-stack app for managing job applications in one place.

## Stack

- Frontend: React + Vite + TypeScript
- Backend: Express + TypeScript
- Database: MongoDB
- Tooling: npm workspaces

## Project Layout

- `apps/web` — frontend app
- `apps/api` — backend API
- `packages/shared` — shared code (for common types/utilities)

## Authentication

The API includes a JWT-based authentication flow. After register/login, the server returns an access token and stores the refresh token in an HTTP-only cookie. Protected routes use the access token, and clients can request a new access token through the refresh endpoint without forcing users to sign in again.

Current auth coverage includes register, login, refresh, logout, profile update, password change, and a `me` endpoint for retrieving the authenticated user or deleting the account.

| Method | Endpoint |
| ------ | -------- |
| POST | `/api/v1/auth/register` |
| POST | `/api/v1/auth/login` |
| POST | `/api/v1/auth/refresh` |
| POST | `/api/v1/auth/logout` |
| GET | `/api/v1/auth/me` |
| PATCH | `/api/v1/auth/me` |
| PATCH | `/api/v1/auth/password` |
| DELETE | `/api/v1/auth/me` |

Note: `GET /api/v1/auth/me` requires `Authorization: Bearer <accessToken>`.

## Applications API

Authenticated users can manage their job applications via a protected CRUD API under `/api/v1/applications`.

- `POST /api/v1/applications` – create an application
- `GET /api/v1/applications` – list applications with optional filters (`status`, `q`, `page`, `limit`, `sort`)
- `GET /api/v1/applications/:id` – get a single application
- `PATCH /api/v1/applications/:id` – update selected fields
- `DELETE /api/v1/applications/:id` – delete an application

## Quick Start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `apps/api/.env`:

   ```env
   NODE_ENV=development
   PORT=4000
   CLIENT_ORIGIN=http://localhost:5173
   MONGODB_URI=mongodb://localhost:27017
   MONGODB_DB_NAME=jobtracker
   JWT_ACCESS_SECRET=replace-with-secure-value
   JWT_REFRESH_SECRET=replace-with-secure-value
   ```

3. Run the apps (from project root):

   ```bash
   npm run dev:api
   npm run dev:web
   ```

## Scripts

- `npm run dev:api` — run API in watch mode
- `npm run dev:web` — run frontend dev server

## Current Scope

- Authentication flow (register, login, refresh, logout, profile, password, delete account)
- Protected API foundation with MongoDB connection and health endpoint
- Authenticated job applications CRUD with filtering and pagination
- Frontend still using the default Vite + React starter (UI for auth/applications is planned)