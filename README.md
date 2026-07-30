# Secrétaire Médicale IA — Backend Core API

## Overview

Medical clinics and health centers receive a high volume of daily calls for appointment scheduling, information requests, confirmations, cancellations, and administrative follow-ups. This project develops an AI-powered Medical Secretary capable of automating these tasks while remaining available 24/7.

The system serves four user roles:
- **Patients** — book, modify, cancel appointments; ask questions; request documents; receive automatic callbacks
- **Doctors** — consult schedules; validate appointments; review AI conversations; update availability
- **Secretaries** — supervise conversations; take over calls live; correct AI responses; manage urgent cases
- **Administrators** — user management, AI configuration, reports, general system settings

## Module 01 — Backend Core & API

This module is the **technical foundation** of the project. It exposes the REST API consumed by all other modules and hosts the central data model (users, roles, permissions). It is a **blocking module**: all other modules depend on it directly or via mocks until stabilization.

### Scope

- Versioned REST API (`/api/v1`)
- User model: Patients, Doctors, Secretaries, Administrators
- Role-Based Access Control (RBAC) with granular permissions
- JWT authentication with refresh tokens
- PostgreSQL database schema with Prisma ORM
- Redis caching and session management
- Auto-generated OpenAPI / Swagger documentation
- Health check and system configuration endpoints
- Docker Compose development environment
- Seed data for development and testing

## Technical Stack

| Layer          | Technology                      |
|----------------|---------------------------------|
| Framework      | NestJS (TypeScript)             |
| Database       | PostgreSQL 16                   |
| ORM            | Prisma                          |
| Cache/Sessions | Redis 7                         |
| Auth           | JWT + Passport                  |
| Validation     | class-validator + class-transformer |
| Documentation  | Swagger / OpenAPI               |
| Container      | Docker & Docker Compose         |
| Testing        | Jest                            |

## Project Structure

```
secretaire-medicale-ia/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── common/
│   │   ├── decorators/        # Custom decorators (@HasPermission, etc.)
│   │   ├── dto/               # Shared DTOs
│   │   ├── filters/           # Exception filters
│   │   ├── guards/            # Auth & permission guards
│   │   ├── interceptors/      # Request/response interceptors
│   │   └── pipes/             # Validation pipes
│   ├── config/                # Application configuration
│   ├── database/
│   │   ├── prisma/            # Prisma service module
│   │   └── seed/              # Seed data scripts
│   ├── modules/
│   │   ├── auth/              # Authentication (JWT, login, register)
│   │   ├── health/            # Health check endpoints
│   │   └── users/             # User CRUD management
│   └── app.module.ts
├── docker-compose.yml
├── Dockerfile
└── .env
```

## Development Tasks

| #  | Task                             | Status      |
|----|----------------------------------|-------------|
| 01 | Project initialization           | ✅ Complete |
| 02 | Database & Docker setup          | 🔄 Pending  |
| 03 | Redis integration                | 📋 Pending  |
| 04 | Health endpoints                 | 📋 Pending  |
| 05 | User management (CRUD)           | 📋 Pending  |
| 06 | JWT authentication               | 📋 Pending  |
| 07 | Roles & permissions (RBAC)       | 📋 Pending  |
| 08 | Swagger documentation            | 📋 Pending  |
| 09 | Seed data                        | 📋 Pending  |

## Getting Started

### Prerequisites

- Node.js >= 18
- Docker & Docker Compose (for database and Redis)
- npm

### Setup

```bash
# Install dependencies
npm install

# Start PostgreSQL and Redis
docker compose up -d

# Run database migrations
npx prisma migrate dev --name init

# Start development server
npm run start:dev
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

- `PORT` — API port (default: 3000)
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — JWT signing secret
- `REDIS_URL` — Redis connection string

## API

Base URL: `http://localhost:3000/api/v1`

Swagger documentation: `http://localhost:3000/api/docs`
