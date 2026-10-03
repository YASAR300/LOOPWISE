# Loopwise Architecture & Engineering Conventions

## 1. Tech Stack Overview

- **Framework**: Next.js (App Router), React 19, JavaScript (JSX, `.jsx` and `.js` only, NO TypeScript)
- **Styling**: Tailwind CSS with custom Linear-style CSS variable design tokens
- **Icons**: Lucide React
- **Primitive Components**: Radix UI primitives (`@radix-ui/react-*`) styled to Linear design specs
- **State & Animations**: Framer Motion for micro-interactions; URL & cookie state for view/shell preferences
- **Command Palette & Shortcuts**: `cmdk` + custom extensible keyboard chords manager
- **Database & ORM**: PostgreSQL 16 via Prisma ORM
- **Authentication**: Auth.js (NextAuth v5)
- **Validation**: Zod + React Hook Form
- **Testing**: Vitest + React Testing Library + JSDOM

## 2. Directory Structure

```
src/
├── app/
│   ├── (marketing)/           # Public-facing marketing pages (Header + Hero + Value Props + Footer)
│   ├── (auth)/                # Authentication views (centered card, subtle grid glow)
│   ├── (app)/                 # Core authenticated application shell
│   │   ├── client/            # Client organization portal
│   │   └── strategist/        # Fractional Strategist workspace
│   ├── (admin)/               # Super-admin portal
│   ├── dev/                   # Development-only tools and galleries (e.g., /dev/components)
│   ├── globals.css            # Linear tokens, CSS variables, typography, animations
│   └── layout.jsx             # Root layout with ThemeProvider and Command Palette
├── components/
│   ├── ui/                    # 30+ accessible Linear-styled atomic primitives
│   ├── layout/                # Shell, Sidebar, Topbar, PageHeader, CommandPalette, Shortcuts
│   ├── marketing/             # Marketing page sections and components
│   ├── client/                # Client-specific UI widgets
│   ├── strategist/            # Strategist-specific widgets
│   └── shared/                # Cross-cutting widgets (ROI widgets, Agent cards)
├── lib/
│   ├── db.js                  # Prisma client singleton
│   ├── auth.js                # Auth.js configuration and helpers
│   ├── ai.js                  # Groq API via OpenAI-compatible client wrapper
│   ├── stripe.js              # Stripe client & webhook utilities
│   ├── email.js               # Resend / local Mailpit mail sender
│   ├── storage.js             # Local / S3 file storage abstraction
│   ├── rate-limit.js          # In-memory / Upstash rate limiting
│   ├── utils.js               # `cn` helper, formatting, classnames
│   └── validators/            # Shared Zod validation schemas
└── server/
    ├── services/              # Pure business logic services
    └── actions/               # Next.js Server Actions with role & ownership checks
```

## 3. Design Tokens & Visual Hierarchy

- **Themes**: Dark-first (`#08090A` base background) with seamless light theme toggle
- **Surfaces**:
  - `bg-surface-base`: `#08090A` (dark) / `#FFFFFF` (light)
  - `bg-surface-raised`: `#0F1011` (dark) / `#F7F8F9` (light)
  - `bg-surface-overlay`: `#141516` (dark) / `#ECEEF0` (light)
  - `bg-surface-card`: `#101213` (dark) / `#FFFFFF` (light)
- **Hairline Borders**: `1px solid rgba(255, 255, 255, 0.08)` (dark) / `rgba(0, 0, 0, 0.08)` (light)
- **Accent Indigo**: Primary `#5E6AD2`, Hover `#6E79E0`, Glow `rgba(94, 106, 210, 0.25)`
- **Typography**: Inter (Variable) for UI, Geist Mono for code/metrics/IDs. Tight letter spacing on headings.
- **Micro-interactions**: 120ms to 180ms ease-out transitions.

## 4. Engineering Principles

1. **Zero Dead UI**: Every interactive element must be fully functioning with real state or server actions.
2. **Four States Rule**: Every list, form, and data widget handles `loading`, `empty`, `error`, and `success`.
3. **Security First**: All mutations verify session, user role, and resource ownership before execution.
4. **Accessible & Keyboard Driven**: Full ARIA compliance, tab indexing, visible focus rings, and shortcut chord navigation.
