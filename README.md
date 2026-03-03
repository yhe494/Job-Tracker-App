# JobTracker --- System Design

## Table of Contents

-   [Project Summary](#project-summary)
-   [Architecture Overview](#architecture-overview)
-   [Authentication Design](#authentication-design)
-   [Backend Architecture](#backend-architecture)
-   [Database Design](#database-design)
-   [Authorization Model](#authorization-model)
-   [RESTful API Design](#restful-api-design)
-   [Frontend Architecture](#frontend-architecture)
-   [Scalability Considerations](#scalability-considerations)
-   [Why This Design Matters](#why-this-design-matters)

------------------------------------------------------------------------

# Project Summary

JobTracker is a full-stack web application that enables job applicants
to securely manage and track their job applications in a centralized
dashboard.

Users can:

-   Register and securely authenticate\
-   Create, edit, and delete job applications\
-   Track application status (Applied, Interviewing, Offer, Rejected)\
-   Search, filter, sort, and paginate results\
-   View application statistics on a dashboard\
-   Manage profile settings and delete their account

The system is designed with production-oriented architecture principles,
focusing on security, scalability, and clean separation of concerns.

------------------------------------------------------------------------

# Architecture Overview

JobTracker follows a modern client--server architecture:

    React SPA (Frontend)
            ↓ HTTPS
    Express REST API (Backend)
            ↓
    MongoDB (Database)

## Frontend

-   React + TypeScript\
-   React Router\
-   Context API for authentication state\
-   Tailwind CSS\
-   Centralized API abstraction layer

## Backend

-   Node.js + Express\
-   TypeScript\
-   MongoDB + Mongoose\
-   Zod for request validation\
-   JWT (access + refresh tokens)\
-   bcrypt for password hashing

------------------------------------------------------------------------

# Authentication Design

The system uses a JWT-based authentication strategy with short-lived
access tokens and HTTP-only refresh tokens.

## Token Strategy

Access Token: - Short-lived\
- Sent via `Authorization: Bearer` header\
- Stored in memory

Refresh Token: - Long-lived\
- Stored in HTTP-only cookie\
- Used to obtain new access tokens

## Authentication Flow

1.  User logs in.\
2.  Backend returns:
    -   Access token (JSON response)
    -   Refresh token (HTTP-only cookie)
3.  Protected routes require a valid access token.\
4.  When expired, frontend calls `/auth/refresh`.\
5.  Backend verifies refresh token and issues a new access token.

This approach minimizes XSS exposure, keeps the API stateless, and
supports horizontal scaling.

------------------------------------------------------------------------

# Backend Architecture

The backend follows a layered structure:

    Route → Controller → Service → Model → Database

## Responsibilities

Routes\
- Define endpoints\
- Attach middleware (authentication, validation)

Controllers\
- Handle HTTP layer\
- Parse inputs\
- Format responses

Services\
- Contain business logic\
- Enforce ownership rules\
- Interact with database models

Models\
- Define schema\
- Define indexes\
- Apply database-level validation

This design ensures maintainability, scalability, and clear separation
of concerns.

------------------------------------------------------------------------

# Database Design

## User Model

-   Unique email (indexed)\
-   Hashed password (not selectable by default)\
-   Optional name\
-   Automatic timestamps

## Application Model

-   userId (indexed)\
-   company\
-   roleTitle\
-   status (enum)\
-   Optional dates (applied, interview, offer, rejection)\
-   Automatic timestamps

## Index Strategy

Compound indexes optimize:

-   Per-user queries\
-   Status filtering\
-   Sorted pagination

Example:

    { userId: 1, updatedAt: -1 }
    { userId: 1, status: 1, updatedAt: -1 }

------------------------------------------------------------------------

# Authorization Model

All application queries enforce user ownership:

    { _id: applicationId, userId: authenticatedUserId }

This prevents cross-user data access and horizontal privilege
escalation.

------------------------------------------------------------------------

# RESTful API Design

## Auth Endpoints

    POST   /api/v1/auth/register
    POST   /api/v1/auth/login
    POST   /api/v1/auth/refresh
    POST   /api/v1/auth/logout
    GET    /api/v1/auth/me
    PATCH  /api/v1/auth/profile
    DELETE /api/v1/auth/account

## Application Endpoints

    GET    /api/v1/applications
    POST   /api/v1/applications
    GET    /api/v1/applications/:id
    PATCH  /api/v1/applications/:id
    DELETE /api/v1/applications/:id
    GET    /api/v1/applications/stats

Features supported:

-   Filtering\
-   Searching\
-   Pagination\
-   Sorting\
-   Ownership validation

------------------------------------------------------------------------

# Frontend Architecture

The frontend is a single-page application built with React.

Core patterns:

-   AuthContext manages authentication state\
-   RequireAuth protects private routes\
-   Centralized API abstraction layer\
-   Optimistic UI updates for CRUD operations\
-   Derived state via memoization

The UI is styled with Tailwind CSS for responsiveness and consistent
design.

------------------------------------------------------------------------

# Scalability Considerations

The API is stateless, allowing:

-   Horizontal scaling\
-   Load balancing\
-   Containerization\
-   Cloud deployment

Future improvements could include:

-   Rate limiting\
-   Redis-based refresh token invalidation\
-   Role-based access control\
-   Audit logging\
-   Email verification

------------------------------------------------------------------------

# Why This Design Matters

This project demonstrates:

-   Secure authentication implementation\
-   Clean RESTful API design\
-   Full CRUD with pagination and filtering\
-   Proper database indexing strategy\
-   Layered backend architecture\
-   Frontend-backend contract consistency\
-   Production-oriented security considerations

It reflects a realistic SaaS-style architecture rather than a basic CRUD
demo.
