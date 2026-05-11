# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

情侣互动 (Couple Interaction) — a full-stack web app for couples with task/points system, product exchange, shared todos, recipes, anniversaries, and notifications.

**Stack:** Vue 3 + Vite + Pinia + Vue Router 4 (frontend) / Express + Knex.js + PostgreSQL 16 (backend)

## Commands

```powershell
# Backend (port 3000)
cd love-app/server
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/love_app"
$env:JWT_SECRET="dev-secret-123"
$env:UPLOAD_PATH="e:\SourceCode\ClaudeCode\chunfen\love-app\server\uploads"
npm run dev          # nodemon auto-restart

# Frontend (port 5173, proxies /api → localhost:3000)
cd love-app/client
npm run dev          # Vite HMR

# Build check
cd love-app/client && npm run build
```

**After ANY backend code change, restart BOTH servers:**
```powershell
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
# Then start backend + frontend as above
```

**Test accounts:** alice / bob (password `123456`), bound together (binding id=1, currently inactive). Alice currently bound to test2 (binding id=4, active).

**Database:** PostgreSQL 16 on localhost:5432, database `love_app`, user `postgres`, password `postgres`. 12 tables (see `database/schema.sql`).

## Architecture

### Backend (Express REST API)
- `server/src/routes/` — Express route definitions, all use `auth` middleware
- `server/src/controllers/` — request validation, delegates to services
- `server/src/services/` — business logic, calls models + notificationService
- `server/src/models/` — Knex.js query builder, raw SQL
- `server/src/middleware/requireBinding.js` — resolves active binding pair → `req.binding = { id, partnerId, boundAt }`

**Critical pattern:** All shared data (tasks, products, todos, recipes, anniversaries) uses `bound_pair_id` referencing `bindings(id)` for data isolation. When users unbind/rebind with a different partner, a new binding record is created → old data hidden. Re-binding the same person reactivates their old binding record → data restored.

**Integral system:** Points are "frozen" on purchase (purchase_record created), actually deducted on confirm (integral_record with negative amount). Expired products: purchase_record set to expired, NO integral refund (since points were never deducted).

**Scheduled jobs** (`utils/cleanExpired.js`):
- Daily 3am: scan expired products, notify publishers
- Daily 8am: check upcoming anniversaries (next 5 days), send reminder notifications

### Frontend (Vue 3 SFC)
- `client/src/views/` — page components (lazy-loaded via router)
- `client/src/components/` — reusable: BaseButton, BaseCard, BaseModal, StatusBadge, AppNavbar, etc.
- `client/src/api/` — Axios wrappers, ALL return `.then(r => r.data)` (unwrapped response)
- `client/src/composables/useCache.js` — localStorage caching layer, versioned keys (`v2_cache_<user>_<key>`), read cache instantly then refresh from API
- `client/src/stores/` — Pinia: auth, binding, theme
- `client/src/themes/` — 3 themes (warm/minimal/handdrawn) as CSS variable objects, applied via themeStore

**Keep-alive:** App.vue wraps router-view with `<keep-alive :include="['TaskList','ProductList','Todos','RecipeList']">`. Each list page must have `name` export and `onActivated` hook to refresh data on return.

**Responsive:** 640px breakpoint. Desktop top navbar, mobile bottom tab bar.

### Key State Machines
- **Task:** pending(待完成) → submitted(待审核) → approved(已完成). Publisher can edit/delete in pending state.
- **Product:** available → purchased → verified → used. Publisher can edit/delete in available state. No more extend/expire UI.

### Notification Pattern
When adding new notifications, update both:
1. Backend service: `notificationService.create({ userId, type, title, content, referenceType, referenceId })`
2. Frontend `NotificationPage.vue` LINK_MAP for click-to-navigate

## Data Isolation Rules

| Entity | Isolation | Notes |
|--------|-----------|-------|
| Tasks | `bound_pair_id` | Publisher/assignee scoped to binding |
| Products | `bound_pair_id` | Global within binding pair |
| Todos | `bound_pair_id` | Private + shared, both scoped |
| Recipes | `bound_pair_id` | Oldest correct implementation |
| Anniversaries | `bound_pair_id` | One per binding pair |
| Integrals | `user_id` | Personal, no binding scope |
| Purchases | `buyer_id` | Personal records |

## Admin System
- `users.role` column: `'admin'` or `'user'` (default)
- Admin middleware: `middleware/adminAuth.js` checks `role === 'admin'`
- Admin routes: `routes/admin.routes.js` → `/api/admin/*` with CRUD for all 10 tables
- Admin frontend: `views/AdminPage.vue` → `/admin`, tab-based table browser with stats
- Admin created via env vars `ADMIN_USERNAME`/`ADMIN_PASSWORD` on server start (`utils/initAdmin.js`)
- Role included in login response (`auth.service.js`), stored in authStore

## Site Title
- Server env `SITE_TITLE` (default: 情侣互动) → `GET /api/config` → `App.vue` sets `document.title`
- No per-user customization anymore (removed SiteSettingsPage)
- Navbar reads from same API on mount

## Docker
- `docker-compose.yml` — production: client (nginx:80) + server (node:3000) + db (postgres:5432)
- DB auto-initializes from `database/schema.sql` (MUST keep this in sync with all table/column changes)
- DB_PASSWORD and JWT_SECRET: **only A-Za-z0-9**, no special characters
- Changing DB credentials requires `docker compose down -v` to reset the volume
- Container names: love-client, love-server, love-db
- See `Docker部署说明.md` for full guide

## Key Gotchas

1. **Knex `.update()` returns row count, not the record** — must add `.returning('*')` to get updated row
2. **API wrappers must unwrap axios responses** — all `api/*.js` functions end with `.then(r => r.data)`
3. **Keep-alive caches page state** — list pages need `onActivated(() => refreshList())` to reload data
4. **StatusBadge uses hardcoded class names** — adding new status requires updating `STYLE_MAP` in the component
5. **Tab indentation in some Vue files** — Edit tool may fail on files using tabs (use Bash `sed` as fallback)
6. **PowerShell inline SQL escaping** — use script files (`.js`) for DB migrations instead of `-e` inline code
7. **Frontend localStorage cache version** — bump `CACHE_VERSION` in `useCache.js` to invalidate stale caches
8. **Product image uploads via edit** — only update `image_urls` if explicitly provided, to avoid clearing images

## File Reference

```
love-app/
├── database/schema.sql              # DB schema (keep synced!)
├── docker-compose.yml               # Production Docker
├── .env.example                     # Env vars template
├── CLAUDE.md                        # This file
├── 使用说明.md                       # User manual
├── Docker部署说明.md                 # Deployment guide
├── server/src/
│   ├── app.js                       # Express setup, middleware, routes, cron jobs
│   ├── server.js                    # Entry point (PORT)
│   ├── config/db.js                 # Knex + DATABASE_URL
│   ├── config/jwt.js                # JWT secret
│   ├── middleware/auth.js           # JWT auth
│   ├── middleware/requireBinding.js # Active binding resolver
│   ├── middleware/adminAuth.js      # Admin-only guard
│   ├── routes/*.js                  # Route definitions
│   ├── controllers/*.js             # Request handling
│   ├── services/*.js                # Business logic + notifications
│   ├── models/*.js                  # Knex queries
│   └── utils/
│       ├── cleanExpired.js          # Cron jobs (expired products + anniversary reminders)
│       └── initAdmin.js             # Admin account auto-creation
└── client/src/
    ├── App.vue                      # Root: keep-alive, page transitions, title init
    ├── router/index.js              # 20+ routes, auth guards
    ├── api/*.js                     # Axios wrappers (must .then(r=>r.data))
    ├── components/*.vue             # Reusable (BaseButton/Card/Modal/Badge/Empty, StatusBadge, AppNavbar, etc.)
    ├── composables/
    │   ├── useCache.js              # localStorage cache (v2, per-user keys)
    │   ├── useNotification.js       # Shared unread count singleton
    │   └── useTheme.js              # Theme switching
    ├── stores/                      # Pinia: auth, binding, theme
    └── views/                       # 20+ page components
```

## Behavioral Guidelines

1. **Think before coding** — state assumptions, surface tradeoffs, ask if unclear
2. **Simplicity first** — minimum code, no speculative features/abstractions
3. **Surgical changes** — touch only what's needed, match existing style, clean up your own orphans
4. **Goal-driven** — define success criteria, verify before declaring done
5. **Always restart both servers** after backend changes — never restart only one
