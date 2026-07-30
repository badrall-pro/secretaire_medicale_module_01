# Secrétaire Médicale IA

Backend API for the AI-powered Medical Secretary application.

Built with [NestJS](https://nestjs.com/).

## Getting Started

```bash
npm install
npm run start:dev
```

## Project Structure

```
src/
  common/         # Shared utilities (guards, filters, pipes, decorators)
  config/         # Application configuration
  database/       # Database schema, migrations, seeds
  modules/        # Feature modules
    health/       # Health check endpoints
    users/        # User management
    auth/         # Authentication & authorization
```

## API

Base URL: `http://localhost:3000/api/v1`
