# Loopwise

> Marketplace for Fractional Heads of AI & Automation — vetted enterprise automation strategists who map internal workflows and deploy autonomous agents.

---

## ⚡ Quickstart (Under 5 Minutes)

### 1. Prerequisites

- **Node.js** >= 18.18 (recommended: Node 20 LTS or later)
- **Docker & Docker Compose** (for PostgreSQL & Mailpit)
- **npm** (comes with Node)

### 2. Clone & Install

```bash
git clone https://github.com/YASAR300/LOOPWISE.git
cd LOOPWISE
npm install
```

### 3. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env.local
```

### 4. Start Infrastructure (PostgreSQL & Mailpit)

```bash
npm run db:up
```

- PostgreSQL will be listening on `localhost:5432`
- Mailpit UI (Email catcher for local dev) will be running at [http://localhost:8025](http://localhost:8025)

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view Loopwise.

Explore the Linear-inspired component design system at [http://localhost:3000/dev/components](http://localhost:3000/dev/components).

---

## 🛠 Available Scripts

| Script                 | Purpose                                                    |
| ---------------------- | ---------------------------------------------------------- |
| `npm run dev`          | Starts Next.js development server with Turbopack / Webpack |
| `npm run build`        | Builds production bundle                                   |
| `npm run start`        | Runs production server                                     |
| `npm run lint`         | Runs Next.js ESLint verification                           |
| `npm run format`       | Runs Prettier with Tailwind CSS class sorting              |
| `npm run format:check` | Checks code formatting                                     |
| `npm run test`         | Runs Vitest unit and component tests                       |
| `npm run db:up`        | Starts PostgreSQL 16 & Mailpit containers in background    |
| `npm run db:down`      | Shuts down local database and Mailpit containers           |
| `npm run db:migrate`   | Runs Prisma schema migrations                              |
| `npm run db:seed`      | Seeds database with realistic enterprise data              |
| `npm run db:reset`     | Resets database schema and re-runs seeds                   |

---

## 🎨 Design System & Keyboard Shortcuts

Loopwise is built with a **Linear-style design language**:

- Dark-first aesthetic (`#08090A` base, `#0F1011` raised surfaces, hairline borders)
- Subtle accent indigo (`#5E6AD2`)
- Fluid micro-interactions (120–180ms ease-out)
- **Command Palette**: Press `Cmd + K` (or `Ctrl + K`) anywhere
- **Keyboard Chords**: Press `G` then `D` (Dashboard), `G` then `C` (Component Gallery)
- **Keyboard Help**: Press `?` to open the shortcuts cheat sheet
- **Component Showcase**: Visit `/dev/components`

---

## 📂 Architecture & Conventions

See [docs/architecture.md](docs/architecture.md) for full folder structures, coding guidelines, security policies, and architectural standards.
