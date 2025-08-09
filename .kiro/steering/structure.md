# Project Structure & Organization

## Root Directory Layout
```
ai-interviewer/
├── src/                 # Source code
├── public/              # Static assets
├── uploads/             # File upload storage
├── .env.example         # Environment template
├── .env.local           # Local environment variables
└── package.json         # Dependencies and scripts
```

## Source Code Organization (`src/`)

### App Router Structure (`src/app/`)
- **Next.js App Router** - File-based routing system
- **API Routes** (`api/`) - Backend endpoints for auth, interviews, etc.
- **Page Routes** - Authentication, dashboard, profile pages
- **Layout Components** - Global layout and metadata

### Component Architecture (`src/components/`)
```
components/
├── auth/                # Authentication forms and flows
├── dashboard/           # Dashboard-specific components
├── interview/           # Interview session components
├── jobs/                # Job posting components
├── layout/              # Layout and navigation components
├── profile/             # User profile components
├── recruiter/           # Recruiter-specific components
├── resume/              # Resume upload and parsing
└── ui/                  # Reusable UI components (Radix-based)
```

### Core Libraries (`src/lib/`)
- **Database** (`mongodb.ts`) - MongoDB connection and configuration
- **Authentication** (`auth.ts`) - JWT handling and user verification
- **Services** (`user-service.ts`) - Business logic for user operations
- **Models** (`models/`) - Mongoose schemas and data models
- **Middleware** (`middleware.ts`) - Request/response processing

### Utilities & Types
- **Types** (`src/types/`) - TypeScript interfaces and type definitions
- **Hooks** (`src/hooks/`) - Custom React hooks for auth and profile
- **Utils** (`src/utils/`) - Validation helpers and utility functions

## Key Conventions

### File Naming
- **Components**: PascalCase (e.g., `InterviewSession.tsx`)
- **Pages**: lowercase with hyphens (e.g., `interview-setup`)
- **API Routes**: RESTful naming (`route.ts` files)
- **Types**: Descriptive interfaces in `index.ts`

### Import Patterns
- Use `@/` alias for src imports
- Group imports: external libraries, internal components, types
- Barrel exports from component directories

### Data Flow
- **Client State**: React hooks and context
- **Server State**: API routes with MongoDB
- **Authentication**: JWT tokens with middleware protection
- **File Uploads**: Stored in `/uploads` directory