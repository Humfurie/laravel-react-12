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
