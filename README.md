# Humfurie.org - Personal Portfolio & Blog

A modern, full-stack portfolio and blog platform built with Laravel 12, React 19, and Inertia.js v2. Featuring advanced
SEO optimization, GDPR-compliant consent management, and production-ready Docker deployment.

**Live Site:** [https://humfurie.org](https://humfurie.org)

---

## Features

### Core Modules

#### Blog System

- Rich text editor (TipTap v3) with image uploads
- SEO-optimized with dynamic meta tags, Schema.org JSON-LD, and sitemaps
- Server-side rendering (SSR) for instant content delivery
- Slug-based URLs, view count tracking, tag/category filtering
- Featured/primary post system with draft/published/private workflow
- Auto-generated excerpts and meta descriptions

#### Projects Showcase

- GitHub-integrated projects with metrics sync
- Tech stack tagging and project categories
- Ownership types (owner/contributor) with tabbed UI
- Featured projects on homepage
- Multi-image galleries with primary image selection
- Status tracking (live, development, maintenance, archived)

#### Deployments

- Client portfolio showcase with status tracking
- Client type classification (family, friend, business, personal)
- Tech stack and challenges solved documentation
- Industry classification and featured deployments
- Multi-image galleries with reordering

#### Experience & Expertise Portfolio

- Dynamic experience timeline with image uploads
- Drag-and-drop ordering for expertise entries
- Soft delete with restore functionality
- Public API for portfolio display

#### Comments System

- Nested comments on blog posts (max 3 levels deep)
- Comment reports with moderation workflow
- Admin bulk actions (approve, hide, delete)
- Rate limiting and XSS prevention
- Backend complete, frontend in progress

#### Real Estate Module

- Property listings with pricing and financing options
- Developer and project management
- Property inquiries with status tracking
- Search and filtering API

#### Admin Panel

- Role-based access control (Spatie Permissions)
- Full CRUD for all content types
- Permission hierarchies with dynamic checking
- User and role management
- Comment moderation with bulk actions
- Inquiry management

### SEO & Performance

- Dynamic XML sitemaps (`/sitemap.xml`, `/sitemap-blogs.xml`, `/sitemap-projects.xml`, `/sitemap-pages.xml`)
- RSS feed (`/feed.xml`)
- Dynamic OG image generation for blogs, projects, and pages
- Schema.org structured data (BlogPosting, Article, CollectionPage, BreadcrumbList)
- Homepage cache warming with model observer invalidation
- Redis caching with configurable TTLs

### Privacy & Compliance

- Google Consent Mode v2 (GDPR/CCPA compliant)
- 3-choice consent banner (Accept All, Reject All, Manage Options)
- Non-personalized ads support
- LocalStorage-based consent persistence

### Design & UX

- Radix UI primitives with shadcn/ui components
- Tailwind CSS v4 with dark mode support
- Framer Motion animations
- Smooth scroll animations and page transitions (Inertia.js)
- GitHub contribution graph with tooltips
- Responsive mobile-first design

---

## Tech Stack

### Backend

- **Laravel 12** (PHP 8.4)
- **PostgreSQL 17** - Primary database
- **Redis** - Cache, sessions, queues
- **Spatie Permissions** - Role-based access control
- **Laravel Socialite** - Social auth (GitHub, Google, Facebook)
- **Intervention Image** - Image processing
- **JWT Auth** - API authentication
- **Pest v3** - Testing framework
- **Laravel Pint** - Code formatting (PSR-12)

### Frontend

- **React 19** with TypeScript 5.7
- **Inertia.js v2** - SPA without API
- **Tailwind CSS v4** - Utility-first CSS
- **Vite 6** - Build tool with HMR
- **TipTap v3** - Rich text editor
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **dnd-kit** - Drag and drop
- **Leaflet** - Maps

### Infrastructure

- **Docker** + **Docker Compose** - Containerization
- **Nginx** - Web server
- **Supervisor** - Process management (queue workers)
- **Traefik** - Reverse proxy with Let's Encrypt SSL
- **MinIO** - S3-compatible file storage
- **Laravel Sail** - Development environment

---

## Project Structure

```
app/
├── Console/Commands/    # Artisan commands (cache warming, GitHub sync)
├── Http/Controllers/
│   ├── Admin/           # Admin panel controllers
│   └── Api/             # REST API controllers
├── Models/              # Eloquent models (~28)
├── Observers/           # Cache invalidation observers
├── Policies/            # Authorization policies
├── Services/            # Business logic (cache, GitHub, images)
└── Traits/              # Reusable model traits

resources/js/
├── pages/
│   ├── admin/           # Admin panel pages
│   │   ├── blog/        # Blog management
│   │   ├── projects/    # Project management
│   │   ├── deployments/ # Deployment management
│   │   ├── comments/    # Comment moderation
│   │   └── ...
│   └── user/            # Public-facing pages
│       ├── home.tsx     # Portfolio homepage
│       ├── blog.tsx     # Blog listing
│       ├── blog-post.tsx # Blog detail
│       └── projects.tsx # Projects showcase
├── components/
│   ├── tiptap-ui/       # Rich text editor UI
│   ├── consent/         # GDPR consent management
│   └── ui/              # shadcn/ui components
└── app.tsx              # Inertia entry point

routes/
├── web.php              # Public routes
├── admin.php            # Admin routes (permission-protected)
├── api.php              # REST API (v1)
├── auth.php             # Authentication
├── settings.php         # User settings
└── user.php             # User profile
```

---

## Getting Started

### Prerequisites

- Docker & Docker Compose (recommended)
- Or: PHP 8.4+, Node.js 20+, PostgreSQL 17, Redis

### Development Setup (Laravel Sail)

```bash
git clone https://github.com/Humfurie/laravel-react-12.git
cd laravel-react-12
cp .env.example .env
./vendor/bin/sail up -d
./vendor/bin/sail artisan key:generate
./vendor/bin/sail artisan migrate --seed
./vendor/bin/sail artisan storage:link
npm install && npm run dev
```

Access at: http://localhost

### Quick Commands

```bash
# All-in-one dev server (app, queue, logs, vite)
composer dev

# Run tests
./vendor/bin/sail artisan test

# Run specific tests
./vendor/bin/sail artisan test --filter=BlogTest

# Code formatting
./vendor/bin/pint --dirty

# Lint & type check
npm run lint
npm run types
```

---

## Production Deployment

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up --build -d
```

The startup script automatically handles migrations, caching, storage links, and starts Nginx + PHP-FPM + queue workers.

| Service        | Port | Description             |
|----------------|------|-------------------------|
| **App**        | 80   | Laravel + Nginx + PHP-FPM |
| **PostgreSQL** | 5432 | Database                |
| **Redis**      | 6379 | Cache, sessions, queues |
| **Traefik**    | 443  | Reverse proxy with SSL  |

---

## Testing

All tests use Pest v3 with 50+ test files covering admin CRUD, API endpoints, authentication, authorization, cache invalidation, model relationships, and more.

```bash
# All tests
./vendor/bin/sail artisan test

# With coverage
./vendor/bin/sail artisan test --coverage

# Code quality
./vendor/bin/pint          # PHP formatting
npm run lint               # TypeScript/React linting
npm run format             # Prettier formatting
```

---

## Author

**Humphrey Singculan**

- Website: [humfurie.org](https://humfurie.org)
- GitHub: [@Humfurie](https://github.com/Humfurie)

---

## License

This project is proprietary and confidential. All rights reserved.
