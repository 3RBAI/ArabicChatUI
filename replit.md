# Overview

This is a bilingual (Arabic/English) AI chat application with RTL/LTR support, built as a full-stack web application. The system provides a ChatGPT-like interface where users can interact with multiple AI models (primarily OpenAI's GPT-5), manage chat sessions, and upload file attachments. The application features a professional, modern design with full dark mode support and seamless language switching capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type-safe UI development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TailwindCSS for utility-first styling with custom design tokens

**UI Component System:**
- Radix UI primitives for accessible, unstyled components
- shadcn/ui component library following the "New York" style
- Custom theme system supporting light/dark modes and RTL/LTR layouts
- Responsive design with mobile-first approach

**State Management:**
- TanStack Query (React Query) for server state management and caching
- React Context API for theme and direction state
- Local component state with React hooks

**Key Design Patterns:**
- Context providers for global state (ThemeContext)
- Custom hooks for reusable logic (useToast, useIsMobile)
- Component composition with slot patterns from Radix UI
- Controlled vs uncontrolled component patterns for forms

**Internationalization:**
- Bidirectional text support (RTL/LTR) via CSS direction attribute
- Arabic (Tajawal, IBM Plex Sans Arabic) and English (Inter) font families
- Mirror-perfect layout transformations for RTL mode
- Language-aware component rendering in chat interface

## Backend Architecture

**Runtime & Server:**
- Node.js runtime with Express.js framework
- TypeScript for type safety across the entire stack
- ESM (ECMAScript Modules) for modern module system
- Custom Vite middleware integration for development HMR

**API Design:**
- RESTful API structure with `/api` prefix
- Resource-based endpoints for sessions, messages, and attachments
- Request/response validation using Zod schemas
- Error handling middleware with consistent error responses

**Data Layer:**
- Drizzle ORM for type-safe database operations
- PostgreSQL as the primary database (via Neon serverless driver)
- Schema-first approach with Drizzle Kit for migrations
- In-memory storage fallback (MemStorage class) for development/testing

**Database Schema:**
- `chat_sessions`: Stores conversation metadata (title, model, mode, pinned status)
- `messages`: Stores individual messages with role, content, and metadata
- `attachments`: Temporary storage for uploaded files
- Cascade deletion for session-message relationships

## AI Integration

**OpenAI Integration:**
- Official OpenAI SDK for chat completions
- GPT-5 as the default model (latest as of August 2025)
- Streaming support preparation (infrastructure in place)
- Token usage tracking and metadata storage

**Message Flow:**
- Client sends message via REST API
- Server constructs conversation history
- OpenAI API processes the request
- Response stored in database with metadata
- Client polls or receives updates via query invalidation

## External Dependencies

**Third-Party Services:**
- OpenAI API (GPT-5) - Primary AI provider
- Neon PostgreSQL - Serverless database hosting
- Replit infrastructure - Development environment and deployment

**Key NPM Packages:**
- `openai` - Official OpenAI client library
- `drizzle-orm` & `drizzle-kit` - Database ORM and migration tools
- `@neondatabase/serverless` - Neon PostgreSQL driver
- `@tanstack/react-query` - Server state management
- `axios` - HTTP client for API requests
- `react-markdown` - Markdown rendering in chat
- `react-syntax-highlighter` - Code syntax highlighting
- `multer` - File upload handling middleware
- `zod` - Runtime type validation
- `wouter` - Lightweight routing
- `class-variance-authority` & `clsx` - CSS class utilities
- `date-fns` - Date manipulation and formatting
- `cmdk` - Command palette component

**Development Tools:**
- `tsx` - TypeScript execution for development
- `esbuild` - Fast bundler for production builds
- `@replit/vite-plugin-*` - Replit-specific development tooling
- PostCSS & Autoprefixer - CSS processing

**File Storage:**
- Local filesystem storage via Multer
- Uploads directory for temporary file storage
- 10MB file size limit for attachments
- File metadata stored in database with references

**Session Management:**
- Stateless API design (no server-side sessions currently)
- Database-persisted chat sessions
- Client-side session selection and management
- Potential for future authentication via session tokens