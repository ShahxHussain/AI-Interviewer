# Technology Stack & Build System

## Framework & Runtime
- **Next.js 15.4.6** - React framework with App Router
- **React 19.1.0** - UI library
- **TypeScript 5** - Type-safe JavaScript
- **Node.js** - Runtime environment

## Database & Authentication
- **MongoDB** - Primary database with Mongoose ODM
- **JWT** - Token-based authentication
- **bcryptjs** - Password hashing

## UI & Styling
- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Headless component library (Dialog, Select, Tabs, etc.)
- **Lucide React** - Icon library
- **class-variance-authority** - Component variant management

## External APIs
- **Together AI** - Language processing and AI interviews
- **Murf AI** - Voice synthesis for interview responses

## Development Tools
- **ESLint** - Code linting with Next.js and Prettier integration
- **Prettier** - Code formatting (single quotes, 2-space tabs, 80 char width)
- **PostCSS** - CSS processing

## Common Commands

### Development
```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Production build
npm run start        # Start production server
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix ESLint issues
npm run format       # Format code with Prettier
npm run format:check # Check formatting without changes
npm run type-check   # TypeScript type checking
```

## Configuration Notes
- Path aliases: `@/*` maps to `./src/*`
- Environment variables required (see .env.example)
- File uploads limited to PDF/DOCX, max 10MB
- JWT tokens expire in 7 days by default