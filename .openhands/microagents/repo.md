# ArabicChatUI

## Project Description

ArabicChatUI is a bilingual (Arabic/English) AI chat application with full RTL/LTR support, built as a modern full-stack web application. The system provides a ChatGPT-like interface where users can interact with multiple AI models (primarily OpenAI's GPT-5), manage chat sessions, and upload file attachments. The application features a professional, modern design with full dark mode support and seamless language switching capabilities.

## File Structure Overview

```
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components (shadcn/ui + custom)
│   │   ├── contexts/       # React context providers (theme, direction)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions and configurations
│   │   ├── pages/          # Page components for routing
│   │   └── App.tsx         # Main application component
│   └── index.html          # HTML entry point
├── server/                 # Express.js backend
│   ├── index.ts            # Main server entry point
│   ├── routes.ts           # API route definitions
│   ├── ai.ts               # OpenAI integration logic
│   ├── storage.ts          # Database and storage layer
│   └── vite.ts             # Vite middleware for development
├── shared/                 # Shared types and utilities
├── dist/                   # Production build output
├── attached_assets/        # File upload storage
├── design_guidelines.md    # UI/UX design specifications
├── replit.md              # Comprehensive system architecture documentation
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite build configuration
├── tailwind.config.ts     # TailwindCSS configuration
├── drizzle.config.ts      # Database ORM configuration
└── components.json        # shadcn/ui component configuration
```

## Development Commands

- **Start development server**: `npm run dev` - Runs both frontend and backend with hot reload
- **Build for production**: `npm run build` - Creates optimized production build
- **Start production server**: `npm start` - Runs the production build
- **Type checking**: `npm run check` - Runs TypeScript compiler checks
- **Database operations**: `npm run db:push` - Push database schema changes

## Technology Stack

**Frontend**: React 18 + TypeScript, Vite, TailwindCSS, Radix UI, shadcn/ui, TanStack Query, Wouter routing

**Backend**: Node.js + Express, TypeScript, Drizzle ORM, PostgreSQL (Neon), OpenAI SDK

**Key Features**: Bilingual RTL/LTR support, dark/light themes, file uploads, chat session management, AI model integration

## Getting Started for New Developers

1. Install dependencies: `npm install` (or `pnpm install` if using pnpm)
2. Set up environment variables for OpenAI API key and database connection
3. Run database migrations: `npm run db:push`
4. Start development server: `npm run dev`
5. Access the application at the provided local URL

The application uses a modern React architecture with TypeScript throughout. The codebase follows clean architecture principles with clear separation between frontend components, backend API routes, and data persistence layers. The design system is built on TailwindCSS with custom design tokens for consistent theming across light/dark modes and RTL/LTR layouts.