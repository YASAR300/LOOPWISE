# Loopwise Build Progress

## Prompt 1 of 12: Foundation, Design System, App Shell

### Status: Complete

### What Shipped:

1. **Repository Foundation**:
   - Next.js (App Router, JavaScript/JSX, no TypeScript, ESLint, Prettier with Tailwind plugin, lint-staged, Husky).
   - Docker Compose for PostgreSQL 16 and Mailpit SMTP/Webmail.
   - Comprehensive `.env.example` covering all variables through Prompt 12.
   - GitHub Actions CI workflow for linting, testing, and building on PRs and pushes.
2. **Design Tokens & Theme System**:
   - Linear-inspired CSS variables (`src/app/globals.css`) for dark and light modes.
   - Dark-first `#08090A` surface with hairline borders `rgba(255,255,255,0.08)` and accent indigo `#5E6AD2`.
   - Next/font configuration with Inter (variable) and Geist Mono.
   - Zero-flash cookie-based `ThemeProvider` with system, dark, and light modes.
3. **UI Primitives Library (`src/components/ui`)**:
   - 30+ accessible Radix-backed primitives: Button, Input, Textarea, Select, Combobox (searchable + multi), Checkbox, Radio, Switch, Slider, Tabs, Badge, Avatar (+ AvatarGroup), Tooltip, Popover, DropdownMenu, ContextMenu, Dialog, Sheet, Toast (queue + undo), Skeleton, EmptyState, Card, Table (sortable, hover, selectable), Pagination, Breadcrumbs, Kbd, Separator, ProgressBar, Stepper, DatePicker, FileDropzone, CopyButton, ConfirmDialog.
4. **App Shell & Layouts (`src/components/layout`)**:
   - Collapsible 240px to 56px Sidebar with workspace switcher, navigation groups, and user footer.
   - Topbar with breadcrumbs, command trigger, theme toggle, and shortcut helper.
   - Command palette (`cmdk`) with dynamic command registry API (`registerCommands`).
   - Keyboard chord manager ("G then D", "G then C", "?").
   - Three route group layouts: Marketing, Auth, App Shell.
   - Interactive `/dev/components` showcase displaying every primitive in all states and themes.
   - Live landing page `/` and auth stub `/login`.

### Manual Testing Instructions:

- Run `npm run dev` and navigate to `http://localhost:3000`.
- Verify the Marketing landing page layout, theme switcher, and navigation links.
- Navigate to `http://localhost:3000/dev/components` to interact with every UI primitive.
- Press `Cmd+K` or `Ctrl+K` to toggle the Command Palette.
- Press `?` to view the Keyboard Shortcut Sheet.
- Test keyboard chord navigation: press `G` then `C` to return to Components, or `G` then `D` for App.
- Toggle dark/light mode and refresh page to verify zero-flash cookie persistence.
- Click the sidebar collapse button to toggle between expanded (240px) and icon rail (56px) modes; refresh to verify persistence.

### Known Limitations & Next Steps:

- Completed in Prompt 2: Data domain, Supabase Auth, roles, settings, route protection.

---

## Prompt 2 of 12: Database, Auth, Roles

### Status: Complete

### What Shipped:

1. **Complete Domain Prisma Schema (`prisma/schema.prisma`)**:
   - 60+ models covering all 12 prompts upfront to avoid mid-stream migrations churn.
   - Enums: `UserRole` (CLIENT, STRATEGIST, ADMIN), `StrategistStatus`, `SkillCategory`, `EngagementStatus`, `InvoiceStatus`, `AgentStatus`, and more.
   - Core tables: `User`, `Account`, `Session`, `Organization`, `OrgMember`, `StrategistProfile`, `Specialization`, `Skill`, `StrategistSkill`, `CaseStudy`, `AvailabilitySlot`, `Brief`, `Proposal`, `Engagement`, `Contract`, `Milestone`, `Deliverable`, `TimeEntry`, `Invoice`, `LedgerEntry`, `EscrowAccount`, `Agent`, `Incident`, `AuditLog`, `RateLimitHit`, `NotificationPreference`.
   - Dual connection URLs configured for Neon PostgreSQL (`DATABASE_URL` pooler + `DIRECT_URL` direct).

2. **Supabase Auth & Prisma Sync (`src/lib/auth.js`, `src/lib/supabase/*`)**:
   - Browser, server, and admin Supabase SSR clients.
   - Email/password and Google OAuth authentication flows.
   - User profile sync between Supabase auth metadata and Prisma `User` table.
   - Server-only authz helpers (`requireUser()`, `requireRole()`, `requireOrgMember()`, `assertOwns()`).

3. **Rate Limiting & Security (`src/lib/rate-limit.js`, `src/middleware.js`, `src/lib/audit.js`)**:
   - Rate limiter backed by `RateLimitHit` database table with sliding window and 429 Retry-After response.
   - Edge route protection via Supabase SSR middleware: `/client/*` requires CLIENT, `/strategist/*` requires STRATEGIST, `/admin/*` requires ADMIN, `/settings/*` requires authenticated user.
   - Custom `403 Forbidden` page with clean Linear aesthetics.
   - Audit logging for sign in, sign out, password changes, and sensitive profile updates.

4. **Authentication & Settings UI (`src/app/(auth)/*`, `src/app/(app)/settings/*`)**:
   - `/login`: Email + password + Google OAuth + quick demo accounts switcher.
   - `/signup`: Role selector ("I want to hire" vs "I'm an AI Strategist") + Google OAuth + email signup.
   - `/forgot-password`: Rate-limited recovery link delivery with anti-enumeration protection.
   - `/reset-password`: In-app password update.
   - `/settings`: 4-tab panel (Profile with avatar upload, Password change, Notification toggles, Danger Zone account deletion).
   - `/client/dashboard`, `/strategist/dashboard`, `/admin/dashboard`: Role-specific telemetry and workspaces.
   - Sidebar and workspace switcher wired to dynamic organization memberships.

5. **Idempotent Seed Script (`prisma/seed.js`)**:
   - 8 Specializations and 56+ taxonomy Skills.
   - Demo Admin (`admin@loopwise.internal`).
   - 2 Client Organizations: Acme Enterprise (`alex.carter@enterprise.ai`) & Apex Health AI (`sarah.lin@apexhealth.io`).
   - 12 Vetted Strategists with APPROVED status, case studies, verified skills, and availability slots.
   - Sample autonomous agents for demo org.
   - Command: `npm run db:seed` and `npm run db:reset`.

6. **Automated Testing**:
   - Unit tests for authz helpers (`src/server/__tests__/authz.test.js` - 12 tests).
   - Unit tests for rate limiter (`src/lib/__tests__/rate-limit.test.js` - 4 tests).
   - All 6 test suites (23 tests total) passing.
