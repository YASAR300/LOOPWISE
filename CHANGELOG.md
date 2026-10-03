# Changelog

All notable changes to the Loopwise platform are documented in this file.

## [0.2.0] - 2026-10-03

### Added

- Complete 60+ model Prisma domain schema in `prisma/schema.prisma` targeting Neon PostgreSQL.
- Idempotent seed script `prisma/seed.js` with 8 specializations, 56+ taxonomy skills, demo admin, 2 client organizations, 12 vetted strategists with profiles and case studies.
- Supabase Auth integration supporting email/password and Google OAuth with Prisma user synchronization.
- Authorization and role protection helpers in `src/server/authz.js` (`requireUser`, `requireRole`, `requireOrgMember`, `assertOwns`).
- Rate limiting mechanism in `src/lib/rate-limit.js` backed by `RateLimitHit` table.
- Edge route protection middleware (`src/middleware.js`) with role routing and `/403` enforcement.
- Auth UI pages: `/login` (with demo account switcher), `/signup` (with role toggle), `/forgot-password`, `/reset-password`, `/verify-email`.
- Dedicated role workspaces: `/client/dashboard`, `/strategist/dashboard`, `/admin/dashboard`.
- Account Settings page (`/settings` and `/app/settings`) with profile avatar upload, password change, notification preferences, and danger zone.
- Unit tests for authorization helpers and rate limiter (23 total unit tests passing).

## [0.1.0] - 2026-10-03

### Added

- Project bootstrap with Next.js App Router, Tailwind CSS, ESLint, Prettier, Husky, lint-staged, and jsconfig paths.
- Docker Compose configuration for PostgreSQL 16 and Mailpit local email server.
- `.env.example` defining environment variables for all 12 platform milestones.
- GitHub Actions CI workflow covering linting, test suites, and production build checks.
- Linear-inspired design token architecture in `src/app/globals.css` with dark-first surface hierarchy, hairline borders, and indigo accent.
- Font integration for Inter (variable) and Geist Mono.
- Cookie-persisted `ThemeProvider` supporting system, dark, and light themes with zero client-side flash.
- 30+ accessible UI primitives built on Radix UI (`src/components/ui`):
  - Button, Input, Textarea, Select, Combobox (single/multi-select), Checkbox, Radio, Switch, Slider, Tabs, Badge, Avatar, AvatarGroup, Tooltip, Popover, DropdownMenu, ContextMenu, Dialog, Sheet, Toast system with undo, Skeleton, EmptyState, Card, Table (with sort, selection, sticky header), Pagination, Breadcrumbs, Kbd, Separator, ProgressBar, Stepper, DatePicker, FileDropzone, CopyButton, ConfirmDialog.
- Responsive App Shell (`src/components/layout`):
  - Collapsible Sidebar (240px to 56px icon rail) with cookie persistence.
  - Mobile drawer Sheet navigation.
  - TopBar with breadcrumbs, command palette trigger, and theme switcher.
  - Command Palette (`cmdk`) with dynamic command registry API.
  - Keyboard chord navigation engine (`G` then `D`, `G` then `C`) and `?` cheat sheet.
  - Route groups: Marketing (`/`), Auth (`/login`), and App Shell (`/app`).
  - Interactive interactive developer showcase at `/dev/components`.
- Vitest configuration with component unit tests.
