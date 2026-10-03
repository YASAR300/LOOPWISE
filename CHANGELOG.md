# Changelog

All notable changes to the Loopwise platform are documented in this file.

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
