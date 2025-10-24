# Humfurie.org - Personal Portfolio & Blog

A modern, full-stack portfolio and blog platform built with Laravel 12, React 19, and Inertia.js v2. Featuring advanced
SEO optimization, GDPR-compliant consent management, and production-ready Docker deployment.

**Live Site:** [https://humfurie.org](https://humfurie.org)
test user:
[https://humfurie.org/login](https://humfurie.org/login)
note: this won't do a thing, it can only view
user: test@gmail.com
pass:password123

---

## ✨ Features

### 🎯 Core Modules

#### 📝 Blog System

- Rich text editor (Tiptap) with image uploads
- SEO-optimized with dynamic meta tags, Schema.org JSON-LD, and sitemaps
- Server-side rendering (SSR) for instant content delivery
- Slug-based URLs for better SEO
- View count tracking and analytics
- Featured/primary post system
- Draft/published/private status workflow
- Auto-generated excerpts and meta descriptions
- Image management with featured images
- Tag system for content organization

#### 💼 Experience Portfolio

- Dynamic experience timeline
- Image uploads for projects/experiences
- Drag-and-drop ordering
- Soft delete with restore functionality
- Public API for portfolio display
- Responsive grid layouts

#### 🔐 Admin Panel

- Role-based access control with policies
- Blog post management (CRUD)
- Experience management (CRUD)
- Image upload and management
- Real-time preview
- Permission-based features

### 🚀 SEO & Marketing

#### Search Engine Optimization

- **Dynamic sitemap.xml** - Auto-updates with published content
- **Schema.org structured data** - BlogPosting, Article, CollectionPage
- **Canonical tags** - Prevents duplicate content penalties
- **Open Graph tags** - Social media sharing optimization
- **Twitter Cards** - Enhanced Twitter sharing
- **robots.txt** - Search engine crawl management
- **ads.txt** - AdSense publisher verification
- **Breadcrumb markup** - Improved navigation for search engines

#### Google Consent Mode v2 (GDPR/CCPA Compliant)

- 3-choice consent banner:
    - ✅ Accept All
    - ❌ Reject All
    - ⚙️ Manage Options (granular control)
- Automatic compliance with privacy regulations
- Non-personalized ads support (maintains revenue even with rejections)
- LocalStorage-based consent persistence

#### Ad Monetization

- Google AdSense ready
- Reusable `AdSlot` component
- Multiple placement types (banner, sidebar, in-content, sticky)
- Consent-aware ad serving
- Support for Mediavine, AdThrive, and custom networks

### 🎨 Design & UX

#### UI Components

- Radix UI primitives (accessible, unstyled components)
- Tailwind CSS v4 for styling
- Framer Motion for animations
- Lucide React icons
- shadcn/ui inspired component library
- Dark mode support
- Responsive design (mobile-first)

#### User Experience

- Floating navigation with auto-hide on scroll
- Smooth page transitions (Inertia.js)
- Progressive enhancement
- Optimistic UI updates
- Loading states and skeletons
- Toast notifications

---

## 🛠️ Tech Stack

### Backend

- **Laravel 12** - PHP framework
- **PHP 8.4** - Latest PHP version
- **PostgreSQL 17** - Primary database
- **Redis** - Cache, sessions, queues
- **Laravel Sanctum** - API authentication
- **Spatie Permissions** - Role management
- **Laravel Pint** - Code formatting (PSR-12)
- **Pest PHP v3** - Testing framework

### Frontend

- **React 19** - UI library
- **Inertia.js v2** - SPA without API
- **TypeScript 5.7** - Type safety
- **Tailwind CSS v4** - Utility-first CSS
- **Vite 6** - Build tool
- **Tiptap 3** - Rich text editor
- **Radix UI** - Accessible components
- **Framer Motion** - Animations
- **date-fns** - Date utilities
- **Recharts** - Data visualization

### DevOps & Infrastructure

- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Web server
- **Supervisor** - Process management
- **Traefik** - Reverse proxy with SSL
- **Let's Encrypt** - Free SSL certificates
- **Laravel Sail** - Development environment

### Development Tools

- **ESLint 9** - JavaScript linting
- **Prettier 3** - Code formatting
- **Playwright** - E2E testing
- **TypeScript** - Static typing
- **Vite HMR** - Hot module replacement
- **Laravel Telescope** - Debugging (optional)

### IDEs & AI Assistants

- **PhpStorm** - Primary PHP IDE with Laravel plugin
- **Claude Code** - AI-powered terminal assistant for development
- **AI Assistant (JetBrains)** - Integrated AI coding assistant
- **Windsurf** - AI-first code editor

---

## 📁 Project Structure

```
humfurie.org/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/          # Admin panel controllers
│   │   │   │   ├── BlogController.php
│   │   │   │   └── ExperienceController.php
│   │   │   ├── User/           # Public controllers
│   │   │   │   └── BlogController.php
│   │   │   ├── ExperienceController.php
│   │   │   └── SitemapController.php
│   │   ├── Requests/           # Form validation
│   │   └── Middleware/
│   ├── Models/
│   │   ├── Blog.php
│   │   ├── Experience.php
│   │   └── User.php
│   └── Policies/               # Authorization
│
├── resources/
│   ├── js/
│   │   ├── components/
│   │   │   ├── ads/            # Ad integration components
│   │   │   │   └── AdSlot.tsx
│   │   │   ├── consent/        # GDPR consent management
│   │   │   │   ├── ConsentBanner.tsx
│   │   │   │   └── ConsentModal.tsx
│   │   │   ├── global/         # Shared components
│   │   │   └── ui/             # shadcn/ui components
│   │   ├── pages/
│   │   │   ├── admin/          # Admin pages
│   │   │   │   ├── blog.tsx
│   │   │   │   └── dashboard.tsx
│   │   │   └── user/           # Public pages
│   │   │       ├── home.tsx
│   │   │       ├── blog.tsx
│   │   │       └── blog-post.tsx
│   │   └── app.tsx             # Inertia.js entry point
│   │
│   └── views/
│       ├── app.blade.php       # Main layout
│       └── sitemap/            # XML sitemaps
│
├── routes/
│   ├── web.php                 # Public routes
│   ├── admin.php               # Admin routes
│   └── api.php
│
├── database/
│   ├── migrations/             # Database schema
│   ├── factories/              # Test data factories
│   └── seeders/                # Database seeders
│
├── tests/
│   ├── Feature/                # Feature tests
│   └── Unit/                   # Unit tests
│
├── docker/
│   └── production/
│       └── Dockerfile          # Production container
│
├── .docker/
│   ├── nginx.prod.conf         # Nginx configuration
│   ├── supervisord.prod.conf   # Process manager config
│   └── startup.prod.sh         # Container startup script
│
├── public/
│   ├── robots.txt              # Search engine directives
│   ├── ads.txt                 # AdSense verification
│   └── storage/                # Symlink to storage/app/public
│
├── storage/
│   └── app/
│       └── public/             # Public file uploads
│           ├── blog-images/
│           └── experiences/
│
├── docker-compose.prod.yml     # Production Docker setup
├── .env.production             # Production environment
└── README.md                   # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **PHP 8.4+**
- **Composer 2+**
- **Node.js 20 LTS**
- **PostgreSQL 17** (or Docker)
- **Redis** (or Docker)

### Development Setup (Laravel Sail)

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Humfurie/laravel-react-12.git
   cd laravel-react-12
   ```

2. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

3. **Start Laravel Sail (Docker development environment):**
   ```bash
   ./vendor/bin/sail up -d
   ```

   Or use the alias:
   ```bash
   sail up -d
   ```

4. **Install dependencies (inside Sail container):**
   ```bash
   sail composer install
   sail npm install
   ```

5. **Generate application key:**
   ```bash
   sail artisan key:generate
   ```

6. **Run migrations and seeders:**
   ```bash
   sail artisan migrate --seed
   ```

7. **Create storage symlink:**
   ```bash
   sail artisan storage:link
   ```

8. **Start Vite dev server:**
   ```bash
   sail npm run dev
   ```

9. **Access the application:**
    - Frontend: http://localhost
    - Admin: http://localhost/admin
    - Mailpit (email testing): http://localhost:8025
    - Database: localhost:5432 (PostgreSQL)

### Alternative: Local Development (without Sail)

If you prefer running PHP/Node locally instead of Docker:

1. **Install dependencies:**
   ```bash
   composer install
   npm install
   ```

2. **Configure database in `.env`:**
   ```env
   DB_CONNECTION=pgsql
   DB_HOST=127.0.0.1
   DB_PORT=5432
   DB_DATABASE=humfurie
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   ```

3. **Run migrations:**
   ```bash
   php artisan migrate --seed
   php artisan storage:link
   ```

4. **Start development servers:**
   ```bash
   # Terminal 1: Laravel dev server
   php artisan serve

   # Terminal 2: Vite dev server (HMR)
   npm run dev
   ```

---

## 🐳 Production Deployment (Docker)

### Build and Deploy

```bash
# Build and start production containers
docker-compose -f docker-compose.prod.yml --env-file .env.production up --build -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f app

# Stop containers
docker-compose -f docker-compose.prod.yml down
```

### What Happens on Container Start

The startup script (`.docker/startup.prod.sh`) automatically:

1. ✅ Waits for database to be ready
2. ✅ Runs database migrations
3. ✅ Creates storage symlink (`php artisan storage:link`)
4. ✅ Caches config, routes, views for performance
5. ✅ Starts Nginx, PHP-FPM, and queue workers

### Production Services

| Service        | Container                 | Port | Description             |
|----------------|---------------------------|------|-------------------------|
| **App**        | Laravel + Nginx + PHP-FPM | 80   | Main application        |
| **PostgreSQL** | postgres:17               | 5432 | Database                |
| **Redis**      | redis:alpine              | 6379 | Cache, sessions, queues |
| **Traefik**    | External                  | 443  | Reverse proxy with SSL  |

### SSL & Domain

- **Domain:** humfurie.org
- **SSL:** Let's Encrypt (automatic renewal via Traefik)
- **WWW redirect:** www.humfurie.org → humfurie.org

---

## 💻 Development Workflow

### Recommended IDE Setup

**Primary Development:**

- **PhpStorm** with Laravel plugin for backend development
    - Laravel Idea plugin
    - PHP Inspections (EA Extended)
    - Database tools integration
    - Git integration

**AI-Assisted Coding:**

- **Claude Code** for terminal-based development tasks
    - Code generation and refactoring
    - Testing and debugging
    - Documentation writing
    - Git operations

- **AI Assistant (JetBrains)** for in-IDE assistance
    - Code completion and suggestions
    - Bug fixing and optimization
    - Code explanations

- **Windsurf** for AI-first editing experience
    - Multi-file refactoring
    - Codebase understanding
    - Intelligent code search

### Quick Commands

```bash
# Development (Sail)
sail up -d              # Start containers
sail artisan tinker     # Laravel REPL
sail npm run dev        # Start Vite dev server
sail composer test      # Run tests
sail artisan pint       # Format PHP code

# Production
docker-compose -f docker-compose.prod.yml --env-file .env.production up --build -d
```

---

## 🧪 Testing

### Run All Tests

```bash
php artisan test
```

### Run Specific Test File

```bash
php artisan test tests/Feature/BlogTest.php
```

### Run with Filter

```bash
php artisan test --filter=testBlogCreation
```

### Test Coverage

```bash
php artisan test --coverage
```

### Code Quality

```bash
# Format PHP code
vendor/bin/pint

# Lint TypeScript/React
npm run lint

# Format frontend code
npm run format
```

---

## 📊 Key Features Breakdown

### Blog Module

**Models:** `Blog`, `User`
**Controllers:** `Admin\BlogController`, `User\BlogController`
**Routes:** `/blog`, `/blog/{slug}`, `/admin/blogs`

**Features:**

- Rich text editing with Tiptap
- Image uploads (featured + inline)
- SEO metadata (title, description, keywords)
- Auto-generated slugs and excerpts
- View count tracking
- Primary/featured posts
- Soft deletes with restore
- Publication scheduling
- Status workflow (draft → published)

**Database Schema:**

```sql
blogs
:
  - id, title, slug (unique)
  - content (longText)
  - excerpt, featured_image
  - meta_data (JSON)
  - status, isPrimary
  - view_count
  - published_at
  - soft deletes, timestamps
```

### Experience Module

**Models:** `Experience`, `Image`
**Controllers:** `ExperienceController`
**Routes:** `/api/experiences`, `/admin/experiences`

**Features:**

- Timeline/portfolio display
- Image uploads for projects
- Drag-and-drop ordering
- Rich text descriptions
- Public API for frontend
- Admin CRUD interface

**Database Schema:**

```sql
experiences
:
  - id, title
  - description (JSON - Tiptap format)
  - sort_order
  - image_id (nullable)
  - soft deletes, timestamps

images:
  - id, name, path
  - imageable (polymorphic)
```

### SEO System

**Sitemaps:**

- `/sitemap.xml` - Main sitemap (home, blog index, all posts)
- `/sitemap-blogs.xml` - Blog-specific sitemap with images

**Schema.org Types:**

- `BlogPosting` - Individual blog posts
- `CollectionPage` - Blog listing
- `ItemList` - Blog post collection
- `BreadcrumbList` - Navigation breadcrumbs

**Meta Tags:**

- Dynamic `<title>` and `<meta description>`
- Open Graph for social sharing
- Twitter Cards
- Canonical URLs
- Article metadata (published/modified dates)

### Consent Management

**Component:** `ConsentBanner` + `ConsentModal`
**Storage:** LocalStorage (`gdpr_consent`, `gdpr_consent_timestamp`)

**Cookie Categories:**

1. **Essential** (always granted)
    - Functionality storage
    - Security storage
    - Personalization storage

2. **Optional** (user choice)
    - Ad storage
    - Ad user data
    - Ad personalization
    - Analytics storage

**Compliance:**

- GDPR (Europe) ✅
- CCPA (California) ✅
- ePrivacy Directive ✅

---

## 🔧 Configuration

### Environment Variables

**Production (`.env.production`):**

```env
APP_NAME=Humphrey
APP_ENV=production
APP_URL=https://humfurie.org
APP_DEBUG=false

DB_CONNECTION=pgsql
DB_HOST=postgres
DB_DATABASE=laravel

SESSION_DOMAIN=.humfurie.org
TRUSTED_PROXIES=*
FORCE_HTTPS=true

QUEUE_CONNECTION=redis
CACHE_DRIVER=redis
SESSION_DRIVER=redis
```

### Google Services

**AdSense:**

1. Add Publisher ID to `public/ads.txt`
2. Add AdSense script to `resources/views/app.blade.php`
3. Configure ad slots in components

**Analytics (Optional):**

```env
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

### Email (Optional)

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM_ADDRESS=hello@humfurie.org
MAIL_FROM_NAME="${APP_NAME}"
```

---

## 📚 Documentation

- **[AD_INTEGRATION_GUIDE.md](./AD_INTEGRATION_GUIDE.md)** - Google AdSense setup and ad placement
- **[CONSENT_MANAGEMENT.md](./CONSENT_MANAGEMENT.md)** - GDPR/CCPA compliance guide
- **[DOCKER_PRODUCTION_FIX.md](./DOCKER_PRODUCTION_FIX.md)** - Storage persistence in Docker
- **[Laravel Docs](https://laravel.com/docs/12.x)**
- **[Inertia.js Docs](https://inertiajs.com/)**
- **[React Docs](https://react.dev/)**

---

## 🤝 Contributing

This is a personal portfolio project. However, if you find bugs or have suggestions:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is proprietary and confidential. All rights reserved.

---

## 👨‍💻 Author

**Humphrey Singculan**

- Website: [humfurie.org](https://humfurie.org)
- Email: humfurie@gmail.com
- GitHub: [@Humfurie](https://github.com/Humfurie)

---

## 🙏 Acknowledgments

### Frameworks & Libraries

- **Laravel** - Taylor Otwell and the Laravel team
- **React** - Meta and the React team
- **Inertia.js** - Jonathan Reinink
- **Tailwind CSS** - Adam Wathan and Tailwind Labs
- **shadcn/ui** - Component design inspiration
- **Radix UI** - Accessible component primitives
- **Tiptap** - Rich text editing
- **Lucide** - Icon library

### Development Tools

- **PhpStorm** - JetBrains for the best PHP IDE
- **Claude Code** - Anthropic for AI-powered development assistance
- **AI Assistant** - JetBrains for intelligent code completion
- **Windsurf** - Codeium for AI-first editing experience

---

Made by Humphrey Singculan
