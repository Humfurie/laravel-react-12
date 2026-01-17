# Architecture Documentation

> **Auto-generated**: 2026-01-12
> **Stack**: Laravel 12 + React 19 + Inertia.js v2 + TypeScript + Tailwind CSS v4

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [System Context Diagram](#system-context-diagram)
4. [Container Architecture](#container-architecture)
5. [Entity Relationship Diagram](#entity-relationship-diagram)
6. [Application Structure](#application-structure)
7. [Key Features](#key-features)
8. [Data Flow Examples](#data-flow-examples)
9. [Deployment Architecture](#deployment-architecture)
10. [Security & Performance](#security--performance)

---

## System Overview

This is a **multi-purpose portfolio and content management system** built with Laravel 12 and React 19. The application combines:

- **Portfolio Website**: Personal profile, projects showcase, experiences, expertises
- **Blog Platform**: Rich-text blog posts with comments, views tracking, featured system
- **Giveaway Management**: Complete giveaway system with entry tracking, winner selection
- **Real Estate Platform**: Property listings with inquiry management
- **Financial Tracking**: Crypto and stock market data integration
- **User Management**: Authentication, roles, permissions, social login (GitHub, Google, Facebook)

---

## Technology Stack

### Backend
- **Framework**: Laravel 12 (PHP 8.4.16)
- **Authentication**: JWT (tymon/jwt-auth) + Laravel Socialite v5
- **Database**: MySQL/PostgreSQL with Eloquent ORM
- **Cache**: Redis
- **Image Processing**: Intervention Image
- **Testing**: Pest v3, PHPUnit v11
- **Code Quality**: Laravel Pint v1

### Frontend
- **Framework**: React 19 with TypeScript
- **Routing**: Inertia.js v2 (SSR-ready)
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI, shadcn/ui
- **Rich Text Editor**: TipTap (for blog content)
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Build Tool**: Vite 6

### DevOps
- **Containerization**: Docker + Docker Compose
- **Development**: Laravel Sail v1
- **CI/CD**: GitHub Actions
- **Deployment**: Production & Development configurations

---

## System Context Diagram

```mermaid
C4Context
    title System Context - Laravel React Portfolio Platform

    Person(user, "Visitor", "Public user browsing content")
    Person(admin, "Admin", "Content manager and system administrator")

    System(app, "Portfolio Platform", "Multi-purpose content management and portfolio system")

    System_Ext(github, "GitHub API", "Social login and contribution data")
    System_Ext(google, "Google OAuth", "Social authentication")
    System_Ext(facebook, "Facebook OAuth", "Social authentication")
    System_Ext(crypto, "Crypto API", "Cryptocurrency market data")
    System_Ext(stock, "Stock API", "Stock market data")
    System_Ext(minio, "MinIO", "Object storage for images")

    Rel(user, app, "Browses content, enters giveaways, views properties")
    Rel(admin, app, "Manages content, users, permissions")

    Rel(app, github, "Fetches contribution data, OAuth login")
    Rel(app, google, "OAuth authentication")
    Rel(app, facebook, "OAuth authentication")
    Rel(app, crypto, "Fetches market data")
    Rel(app, stock, "Fetches stock data")
    Rel(app, minio, "Stores/retrieves images")
```

---

## Container Architecture

```mermaid
C4Container
    title Container Diagram - Application Architecture

    Person(user, "User", "Platform visitor")
    Person(admin, "Admin", "Content administrator")

    Container_Boundary(c1, "Laravel React Platform") {
        Container(spa, "React SPA", "React 19, TypeScript, Inertia.js", "Provides interactive UI")
        Container(api, "Laravel API", "Laravel 12, PHP 8.4", "REST API and SSR for Inertia")
        Container(web, "Web Routes", "Inertia SSR", "Server-side rendered pages")
        ContainerDb(db, "Database", "MySQL/PostgreSQL", "Stores all application data")
        ContainerDb(cache, "Redis Cache", "Redis", "Session storage, query caching")
    }

    System_Ext(social, "Social Providers", "OAuth authentication")
    System_Ext(storage, "MinIO", "Image storage")

    Rel(user, spa, "Uses", "HTTPS")
    Rel(admin, spa, "Manages", "HTTPS")

    Rel(spa, web, "Requests pages", "Inertia.js")
    Rel(spa, api, "API calls", "JSON/HTTPS")
    Rel(web, api, "Internal calls")

    Rel(api, db, "Reads/Writes", "Eloquent ORM")
    Rel(api, cache, "Cache queries", "Redis")
    Rel(api, social, "OAuth flow", "HTTPS")
    Rel(api, storage, "Upload/retrieve", "S3 API")
```

---

## Entity Relationship Diagram

```mermaid
erDiagram
    users ||--o{ blogs : "creates"
    users ||--o{ projects : "owns"
    users ||--o{ experiences : "has"
    users ||--o{ giveaway_entries : "submits"
    users ||--o{ comments : "writes"
    users }o--o{ roles : "has"
    roles }o--o{ permissions : "grants"

    blogs ||--o{ comments : "receives"
    blogs ||--o{ blog_views : "tracked_by"
    blogs ||--o| images : "has"

    giveaways ||--o{ giveaway_entries : "contains"
    giveaways ||--o{ comments : "receives"
    giveaways ||--o{ images : "displays"
    giveaways ||--o| giveaway_entries : "winner"

    real_estate_projects ||--o{ properties : "contains"
    properties ||--o{ property_pricings : "has"
    properties ||--o{ inquiries : "receives"
    properties ||--o{ contacts : "has"
    properties ||--o{ images : "displays"

    projects ||--o{ images : "displays"

    users ||--o{ images : "uploads"

    users {
        bigint id PK
        string name
        string username UK
        string email UK
        string password
        string mobile
        string bio
        string avatar_url
        string github_username
        string google_id
        string facebook_id
        string github_id
        json github_contributions
        json social_links
        json profile_stats
        timestamp github_synced_at
        timestamp created_at
    }

    blogs {
        bigint id PK
        string title
        string slug UK
        text content
        string excerpt
        enum status "draft|published|private"
        string featured_image
        json meta_data
        json tags
        boolean isPrimary
        timestamp featured_until
        int sort_order
        int view_count
        timestamp published_at
        timestamp created_at
    }

    giveaways {
        bigint id PK
        string title
        string slug UK
        text description
        timestamp start_date
        timestamp end_date
        int number_of_winners
        string background_image
        enum status "draft|active|ended"
        bigint winner_id FK
        boolean prize_claimed
        timestamp prize_claimed_at
        string rejection_reason
        timestamp created_at
    }

    giveaway_entries {
        bigint id PK
        bigint giveaway_id FK
        bigint user_id FK
        string full_name
        string email
        string phone
        enum status "pending|winner|rejected"
        timestamp submitted_at
        timestamp created_at
    }

    properties {
        bigint id PK
        bigint project_id FK
        string title
        string slug UK
        text description
        string unit_number
        int floor_level
        string building_phase
        enum property_type "studio|1br|2br|3br|penthouse"
        decimal floor_area
        string floor_area_unit
        decimal balcony_area
        int bedrooms
        decimal bathrooms
        int parking_spaces
        string orientation
        string view_type
        enum listing_status "available|reserved|sold|not_available"
        json features
        boolean featured
        int view_count
        timestamp created_at
    }

    projects {
        bigint id PK
        string title
        string slug UK
        text description
        string short_description
        enum category "web_app|mobile_app|api|library|cli|design"
        json tech_stack
        json links
        string github_repo
        enum status "live|archived|maintenance|development"
        boolean is_featured
        boolean is_public
        json metrics
        timestamp metrics_synced_at
        json testimonials
        date started_at
        date completed_at
        timestamp featured_at
        int sort_order
        int view_count
        timestamp created_at
    }

    roles {
        bigint id PK
        string name
        string slug UK
        text description
        timestamp created_at
    }

    permissions {
        bigint id PK
        string resource
        string name
        text description
        timestamp created_at
    }

    images {
        bigint id PK
        string imageable_type
        bigint imageable_id
        string url
        string path
        string filename
        string mime_type
        bigint size
        int width
        int height
        boolean is_primary
        int sort_order
        json metadata
        timestamp created_at
    }
```

---

## Application Structure

### Directory Layout

```
laravel-react-12/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Admin/              # Admin panel controllers
│   │   │   ├── Api/                # REST API controllers
│   │   │   ├── Auth/               # Authentication controllers
│   │   │   └── Settings/           # User settings controllers
│   │   └── Middleware/             # Custom middleware
│   ├── Models/                     # Eloquent models (26 models)
│   ├── Policies/                   # Authorization policies
│   └── Services/                   # Business logic services
├── database/
│   ├── factories/                  # Model factories for testing
│   ├── migrations/                 # Database migrations
│   └── seeders/                    # Database seeders
├── resources/
│   ├── js/
│   │   ├── Pages/                  # Inertia.js page components (65+ pages)
│   │   │   ├── admin/              # Admin pages
│   │   │   ├── auth/               # Authentication pages
│   │   │   ├── blog/               # Blog pages
│   │   │   ├── giveaway/           # Giveaway pages
│   │   │   ├── profile/            # User profile pages
│   │   │   ├── project/            # Projects showcase
│   │   │   └── user/               # Public user pages
│   │   ├── Components/             # Reusable React components
│   │   ├── Layouts/                # Page layouts
│   │   └── app.tsx                 # App entry point
│   └── css/
│       └── app.css                 # Tailwind CSS
├── routes/
│   ├── web.php                     # Main web routes
│   ├── api.php                     # API routes (v1)
│   ├── admin.php                   # Admin panel routes
│   ├── auth.php                    # Authentication routes
│   ├── settings.php                # User settings routes
│   └── user.php                    # User-specific routes
├── tests/
│   ├── Feature/                    # Feature tests (Pest)
│   └── Unit/                       # Unit tests (Pest)
└── docker-compose.yml              # Docker configuration
```

### Route Structure

**6 Route Files**:
1. **web.php** - Main application routes (home, blog, properties, giveaways, projects)
2. **api.php** - REST API v1 (properties, giveaways, expertises, inquiries)
3. **admin.php** - Admin panel routes (content management)
4. **auth.php** - Authentication routes (login, register, social auth)
5. **settings.php** - User settings routes (profile, password)
6. **user.php** - User-specific routes

---

## Key Features

### 1. **Portfolio Management**
- Personal profile with bio, headline, about sections
- Projects showcase with live/archived/development status
- GitHub integration for contribution tracking
- Technology stack and skills display
- Experiences timeline

### 2. **Blog Platform**
- Rich-text editor (TipTap) for content creation
- Multi-tier featured system (manual + auto-trending)
- View tracking with daily analytics
- Comment system with moderation
- Tags and metadata
- Sitemap generation for SEO

### 3. **Giveaway System**
- Draft → Active → Ended workflow
- Multiple winners support
- Phone verification
- Winner selection algorithm (random with rejection handling)
- Entry tracking and validation
- Prize claim tracking

### 4. **Real Estate Platform**
- Property listings with comprehensive details
- Real estate project grouping
- Property pricing models
- Inquiry management system
- Advanced filtering (type, bedrooms, floor, area, price)
- Featured properties

### 5. **User Management**
- Role-based access control (RBAC)
- Custom permissions system with resource-action mapping
- Social login (GitHub, Google, Facebook)
- JWT API authentication
- Profile management with avatar uploads

### 6. **Financial Tracking**
- Cryptocurrency market data integration
- Stock market data tracking
- Portfolio monitoring

### 7. **Comment System**
- Polymorphic comments (works on blogs and giveaways)
- Comment moderation (pending, approved, rejected)
- Comment reporting
- Nested comments support

### 8. **Image Management**
- Polymorphic image relationships
- MinIO integration for object storage
- Primary image designation
- Image ordering
- Multiple images per entity
- Automatic thumbnail generation

---

## Data Flow Examples

### Example 1: Giveaway Entry Flow

```mermaid
sequenceDiagram
    actor User
    participant Frontend as React SPA
    participant API as Laravel API
    participant DB as Database
    participant Cache as Redis

    User->>Frontend: Visit /giveaways/{slug}
    Frontend->>API: GET /giveaways/{slug}
    API->>DB: Fetch giveaway details
    API->>Cache: Check giveaway cache
    Cache-->>API: Return cached data
    API-->>Frontend: Return giveaway data (JSON)
    Frontend-->>User: Display giveaway page

    User->>Frontend: Submit entry form
    Frontend->>API: POST /api/v1/giveaways/{slug}/enter
    API->>API: Validate entry (rate limit: 10/min)
    API->>DB: Check duplicate phone
    DB-->>API: No duplicate found
    API->>DB: Create GiveawayEntry
    DB-->>API: Entry created
    API->>Cache: Clear giveaway cache
    API-->>Frontend: Return success
    Frontend-->>User: Show confirmation
```

### Example 2: Blog View Tracking Flow

```mermaid
sequenceDiagram
    actor User
    participant Frontend as React SPA
    participant Web as Inertia SSR
    participant DB as Database
    participant Cache as Redis

    User->>Frontend: Visit /blog/{slug}
    Frontend->>Web: Request page via Inertia
    Web->>Cache: Check blog cache
    Cache-->>Web: Cache miss
    Web->>DB: Fetch blog with comments
    DB-->>Web: Return blog data
    Web->>DB: Increment view_count
    Web->>DB: Track daily view (BlogView)
    Web->>Cache: Store blog in cache
    Web-->>Frontend: Return Inertia props
    Frontend-->>User: Render blog post
```

### Example 3: Property Inquiry Flow

```mermaid
sequenceDiagram
    actor User
    participant Frontend as React SPA
    participant API as Laravel API
    participant DB as Database
    participant Policy as Authorization

    User->>Frontend: View property details
    Frontend->>API: GET /api/v1/properties/{id}
    API->>DB: Fetch property with images
    DB-->>API: Return property
    API-->>Frontend: Property data (JSON)

    User->>Frontend: Submit inquiry form
    Frontend->>API: POST /api/v1/properties/{id}/inquiries
    API->>API: Throttle (10 req/min)
    API->>DB: Create Inquiry
    DB-->>API: Inquiry created
    API-->>Frontend: Success response
    Frontend-->>User: Show success message

    Note over User,Policy: Admin receives inquiry

    actor Admin
    Admin->>Frontend: View inquiries
    Frontend->>API: GET /api/v1/inquiries (auth required)
    API->>Policy: Check permission
    Policy-->>API: Authorized
    API->>DB: Fetch inquiries
    DB-->>API: Return inquiries
    API-->>Frontend: Inquiry list
    Frontend-->>Admin: Display inquiries
```

### Example 4: Winner Selection Algorithm

```mermaid
flowchart TD
    Start([Giveaway End Date Reached]) --> CheckStatus{Status = Active?}
    CheckStatus -->|No| End([Exit])
    CheckStatus -->|Yes| CheckWinners{All winners<br/>selected?}

    CheckWinners -->|Yes| MarkEnded[Mark giveaway as ENDED]
    MarkEnded --> End

    CheckWinners -->|No| CalcNeeded[Calculate winners needed]
    CalcNeeded --> FetchEntries[Fetch eligible entries<br/>with FOR UPDATE lock]

    FetchEntries --> HasEntries{Has eligible<br/>entries?}
    HasEntries -->|No| End

    HasEntries -->|Yes| Shuffle[Shuffle entries in PHP]
    Shuffle --> TakeWinners[Take required number of winners]
    TakeWinners --> MarkWinners[Mark each entry as 'winner']
    MarkWinners --> UpdateGiveaway[Update giveaway:<br/>winner_id = last winner<br/>status = ENDED]
    UpdateGiveaway --> End

    style Start fill:#e1f5e1
    style End fill:#ffe1e1
    style CheckWinners fill:#fff4e1
    style HasEntries fill:#fff4e1
    style MarkWinners fill:#e1e5ff
    style UpdateGiveaway fill:#e1e5ff
```

---

## Deployment Architecture

### Development Environment

```yaml
# docker-compose.yml
services:
  - laravel.test (PHP 8.4, Laravel 12)
  - mysql (Database)
  - redis (Cache & Sessions)
  - minio (Object Storage)
  - mailpit (Email Testing)
  - selenium (Browser Testing)
```

**Access**:
- App: `http://localhost`
- MinIO Console: `http://localhost:8900`
- Mailpit: `http://localhost:8025`

### Production Environment

```yaml
# docker-compose.prod.yml
services:
  - app (Optimized Laravel)
  - mysql (Production DB)
  - redis (Cache & Queue)
  - minio (Production Storage)
  - nginx (Reverse Proxy)
```

**Environment Variables**:
- `.env` - Development config
- `.env.production` - Production config

---

## Security & Performance

### Security Features

1. **Authentication & Authorization**
   - JWT tokens for API authentication
   - Session-based auth for web
   - RBAC with granular permissions
   - Policy-based authorization
   - Social OAuth integration

2. **Input Validation**
   - Form Request classes for all inputs
   - CSRF protection
   - Rate limiting on sensitive endpoints
   - SQL injection prevention (Eloquent ORM)
   - XSS protection (React auto-escaping)

3. **Data Protection**
   - Password hashing (bcrypt)
   - Soft deletes for data recovery
   - Image upload validation
   - Environment variable protection

### Performance Optimizations

1. **Caching Strategy**
   - Homepage caching (30 min for experiences/expertises)
   - Projects caching (10 min)
   - User permissions caching (5 min)
   - Blog view caching
   - Redis for query results

2. **Database Optimization**
   - Eager loading to prevent N+1 queries
   - Database indexes on foreign keys and slugs
   - Soft deletes for data integrity
   - Query scopes for reusability

3. **Frontend Optimization**
   - Code splitting with Vite
   - Lazy loading for images
   - Inertia.js for SPA-like experience without full SPA overhead
   - Tailwind CSS purging for minimal CSS bundle

4. **Rate Limiting**
   - Comment creation: 10 requests/minute
   - Comment reporting: 5 requests/minute
   - Giveaway entries: 10 requests/minute
   - Property inquiries: 10 requests/minute
   - API reads: 60 requests/minute
   - API writes: 30 requests/minute

---

## Component Architecture

### Laravel MVC Flow

```mermaid
flowchart LR
    Route[Routes] --> Controller[Controllers]
    Controller --> Policy[Policies]
    Policy --> Service[Services]
    Service --> Model[Models]
    Model --> DB[(Database)]
    Controller --> View[Inertia Views]
    View --> React[React Components]
```

### Key Models (26 total)

**Core Models**:
- User, Role, Permission
- Blog, BlogView
- Project, Experience, Expertise
- Giveaway, GiveawayEntry

**Real Estate**:
- RealEstateProject, Property, PropertyPricing, Contact, Inquiry

**Supporting Models**:
- Image (polymorphic)
- Comment (polymorphic)
- Technology, Skills, About

### React Component Structure

```
Components/
├── ui/                    # shadcn/ui primitives (Button, Input, etc.)
├── layouts/               # Page layouts
├── blog/                  # Blog-specific components
├── giveaway/              # Giveaway-specific components
├── property/              # Property listing components
├── project/               # Project showcase components
└── shared/                # Shared utility components
```

---

## API Versioning

### REST API v1

**Base URL**: `/api/v1`

**Endpoints**:
- **Auth**: `/auth/login`, `/auth/register`, `/auth/me`
- **Properties**: `/properties`, `/properties/{id}`, `/properties/search`
- **Giveaways**: `/giveaways`, `/giveaways/{slug}/enter`
- **Expertises**: `/expertises`, `/expertises/categories`
- **Inquiries**: `/inquiries`, `/inquiries/statistics`

**Authentication**: JWT Bearer tokens

**Rate Limits**:
- Public reads: 60 req/min
- Authenticated writes: 30 req/min
- Submissions: 10 req/min

---

## Testing Strategy

### Test Coverage

- **Feature Tests**: User flows, API endpoints, authentication
- **Unit Tests**: Model methods, business logic, helpers
- **Testing Framework**: Pest v3 with Pest Laravel plugin

**Running Tests**:
```bash
php artisan test                           # All tests
php artisan test --filter=BlogTest         # Specific test file
php artisan test --filter=testCanCreate   # Specific test name
```

---

## Development Guidelines

### Code Standards
- Laravel Pint for code formatting
- PHPDoc blocks for complex methods
- Type hints for all method parameters and returns
- Follow Laravel conventions

### Git Workflow
- `master` - Production branch
- `develop` - Development branch
- Feature branches off `develop`

### Environment Setup

**Development**:
```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
npm run dev
```

**Production Build**:
```bash
npm run build
php artisan optimize
php artisan config:cache
php artisan route:cache
```

---

## Future Enhancements

Based on the codebase structure, potential areas for expansion:

1. **Newsletter System** - Email subscriptions for blog updates
2. **Advanced Analytics** - Detailed user behavior tracking
3. **Notification System** - Real-time notifications for comments, giveaway winners
4. **Multi-language Support** - i18n for blog content
5. **Advanced Search** - Full-text search with Meilisearch/Algolia
6. **GraphQL API** - Alternative API layer for mobile apps
7. **WebSockets** - Real-time updates for giveaway entries
8. **File Exports** - PDF generation for property listings

---

## Conclusion

This Laravel 12 + React 19 application represents a **modern, full-stack monolithic architecture** with:

- ✅ **Clean separation of concerns** (MVC + React components)
- ✅ **Comprehensive authorization** (Roles, Permissions, Policies)
- ✅ **Performance optimizations** (Redis caching, eager loading)
- ✅ **API-first design** (REST API v1 with versioning)
- ✅ **Modern frontend** (React 19, TypeScript, Tailwind v4)
- ✅ **Docker-ready deployment** (Development + Production configs)
- ✅ **Test coverage** (Pest v3 feature and unit tests)

The architecture supports **multiple business domains** (portfolio, blog, giveaways, real estate) within a single codebase while maintaining code quality and scalability.
