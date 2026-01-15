# Project Guidelines

## Environment
- **Production**: `docker-compose.prod.yml`, `.env.production`
- **Development**: `docker-compose.yml`, `.env`
- **Commands**: Use `./vendor/bin/sail artisan` (not `php artisan`)

## Stack
PHP 8.4, Laravel 12, Inertia v2, React 19, Tailwind v4, Pest v3

## Core Rules
- Follow existing code conventions; check sibling files
- Use `search-docs` tool before making changes
- Run `vendor/bin/pint --dirty` before finalizing
- Write Pest tests for all changes
- Be concise; no documentation files unless requested

## Laravel
- Use `artisan make:` commands with `--no-interaction`
- Prefer Eloquent over raw queries; avoid `DB::`
- Use Form Request classes for validation
- Use queued jobs (`ShouldQueue`) for slow operations
- Use `config()` not `env()` outside config files
- Laravel 12: streamlined structure, no Kernel files, commands auto-register

## Frontend
- Inertia pages in `resources/js/Pages`
- Use `<Link>` or `router.visit()` for navigation
- Support dark mode with `dark:` classes
- Tailwind v4: use `@import "tailwindcss"`, avoid deprecated utilities

## Testing
- All tests use Pest: `php artisan make:test --pest`
- Use factories and datasets
- Run minimal tests with `--filter`

## Session Memory

### 2026-01-16
**Summary**: Implemented cache invalidation system with model observers, extracted homepage data fetching to HomepageCacheService, fixed CI failures.

**Changes**:
- `app/Observers/` - Added Experience, Expertise, User observers; updated Blog, Project to clear admin:dashboard
- `app/Services/HomepageCacheService.php` - New service for homepage data fetching
- `app/Console/Commands/WarmHomepageCache.php` - Refactored to use service
- `database/factories/ProjectFactory.php` - New factory with public/private states
- `config/cache-ttl.php` - Added projects_limit config
- `docker-compose.prod.yml` - Fixed SSR healthcheck (exit 1)
- 27 new tests added (all passing)

**Decisions**:
- Cache invalidation via model observers (existing pattern)
- Type-safe `(int) config()` for ID comparisons
- Projects use `is_public` not `is_published`

**Open**:
- [ ] Consider cache tags for granular invalidation
- [ ] Add logging to WarmHomepageCache for production
