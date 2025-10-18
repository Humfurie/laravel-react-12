---
trigger: manual
---

# Laravel + React (Inertia.js) Development Guidelines

## 1. Core Principles

- Follow **SOLID principles** and **Laravel’s MVC architecture**.
- Maintain **strict separation of concerns** between backend logic and frontend presentation.
- Keep **controllers thin**; delegate logic to services or repositories.
- Use **Inertia.js** as the bridge between Laravel and React (no traditional REST API).
- Design for **scalability**, **maintainability**, and **testability**.
- Prefer **composition and modularity** over duplication.
- Use **clear and consistent naming** for all files, classes, and variables.

---

## 2. Dependencies

- **Composer** for PHP dependencies.
- **NPM / Yarn / pnpm** for frontend dependencies.
- **PHP 8.3+**, **Laravel 11+**, **React 18+**, **Inertia.js 1.x**.

---

## 3. PHP and Laravel Standards

- Use `declare(strict_types=1);` at the top of every PHP file.
- Follow **PSR-12** coding standards and **Laravel naming conventions**.
- Use **PHP 8.3+ features** (readonly properties, enums, match expressions, etc.).
- Always use **dependency injection** for services.
- Implement **validation** using Form Requests.
- Use **Middleware** for request filtering and access control.
- Define **custom exceptions** for domain-specific errors.
- Utilize **Laravel’s logging, error handling, and event system**.
- Follow **Laravel’s default directory structure**.

---

## 4. Laravel Best Practices

- Use **Eloquent ORM** and **Query Builder** (avoid raw SQL).
- Implement **Repository** and **Service** patterns for abstraction.
- Use **Laravel Sanctum** for authentication and token management.
- Apply **Policies** and **Gates** for authorization.
- Leverage **Redis** or **Memcached** for caching.
- Use **Queues and Horizon** for long-running tasks.
- Write tests using **PHPUnit**, **Pest**, or **Dusk**.
- Implement **API Resources** when exposing JSON APIs.
- Optimize **database performance** with indexing and eager loading.
- Use **Laravel Telescope** for debugging and profiling.
- Ensure **security** via CSRF protection, XSS prevention, and input sanitization.

---

## 5. Laravel + Inertia + React Integration

### Architectural Overview

- **Laravel** handles routing, validation, and backend logic.
- **React** handles frontend rendering and interactivity.
- **Inertia.js** connects controllers directly to React pages (no JSON APIs).
- Use **shared props** for global data (auth user, flash messages, etc.).

### Integration Principles

- Controllers return **Inertia responses** (not Blade or JSON).
- Maintain **frontend state** with React Context or lightweight stores (e.g., Zustand).
- Use **Laravel validation**; errors are shared with React automatically.
- Use **Sanctum** for authentication with Inertia.
- Ensure consistent **route naming** between backend and frontend.
- Handle **flash messages** and errors through shared props.
- Use **React Layout components** for consistent page structure.

---

## 6. Code Architecture

### Naming Conventions

- **Models:** Singular (e.g., `User.php`).
- **Controllers:** Plural (e.g., `UsersController.php`).
- **Services:** PascalCase (e.g., `UserService.php`).
- **React Components & Pages:** PascalCase.
- **Database Columns:** snake_case.
- **Routes:** Dot notation (e.g., `posts.index`, `users.store`).

### Controllers

- Declare as **final**.
- Keep thin; delegate logic to **services**.
- Use **method injection**.
- Return only **Inertia responses** or **redirects**.

### Models

- Declare as **final**.
- Encapsulate business behavior within methods.
- Define relationships (`hasMany`, `belongsTo`, etc.).
- Avoid query logic inside controllers.

### Services

- Located in `app/Services`.
- Encapsulate **business logic** only.
- Declared as **final readonly** classes.
- Follow **single responsibility** per class.

### Repositories

- Handle all **database interactions**.
- Keep separate from business logic.
- Return **models** or **data collections**.

### Routing

- Group routes logically (e.g., `routes/users.php`).
- Use **web routes** for Inertia pages.
- Maintain consistent **route naming**.
- Protect routes with **middleware**.

---

## 7. React + Inertia Guidelines

- Use **React 18+ functional components** and **hooks**.
- Keep components **modular and stateless** when possible.
- Use **shared layouts** for consistent UI.
- Handle navigation with **Inertia `<Link>`** and **router.visit()**.
- Store reusable UI in `/resources/js/Components`.
- Store pages in `/resources/js/Pages`.
- Prefer **composition over nesting**.
- Use **Tailwind CSS** for styling consistency.
- Pass only **essential props** from Laravel to React.
- Use **shared props** for authentication and session data.
- Display **flash messages** using a unified component.

---

## 8. Validation and Error Handling

- Perform all validation on the **backend** using Form Requests.
- Return validation errors via **Inertia shared props**.
- Ensure consistent **error messages** across backend and frontend.
- Handle **expected exceptions** with try-catch blocks.
- Use **Laravel’s logging** for errors and warnings.
- Display validation and error messages clearly on the frontend.

---

## 9. Authentication and Authorization

- Use **Laravel Sanctum** for session-based authentication.
- Restrict protected routes with **middleware** and **React guards**.
- Store authenticated user data in **shared props**.
- Use **Policies** for model-level permissions.
- Never expose sensitive data in frontend state.

---

## 10. Performance Optimization

- Use **Laravel Vite** for asset compilation.
- Optimize Eloquent with **eager loading** and **pagination**.
- Cache heavy queries and computed data.
- Enable **HTTP/2** and **compression** in production.
- Minify frontend assets and optimize static files.
- Use **Lazy Loading** and **Suspense** in React.
- Implement **SSR** if SEO is required.

---

## 11. Testing

- Use **PHPUnit** or **Pest** for backend tests.
- Test **Inertia responses** for integration validation.
- Mock dependencies using **Laravel testing helpers**.
- Use **React Testing Library** for frontend tests.
- Maintain coverage for both backend and frontend layers.

---

## 12. Deployment and Maintenance

- Use `.env` for configuration; **never commit secrets**.
- Run `php artisan config:cache` and `route:cache` in production.
- Execute **migrations and seeders** in CI/CD pipelines.
- Monitor logs using **Telescope** or external tools.
- Keep **daily backups** and update dependencies regularly.
- Maintain **semantic versioning** for dependencies.

---

## 13. Summary of Key Rules

1. Keep controllers thin; move logic to services.
2. Use repositories for data access and encapsulation.
3. Validate with Form Requests on the backend.
4. Share only necessary data between backend and frontend.
5. Follow consistent naming and structure.
6. Use Inertia.js for seamless Laravel–React integration.
7. Protect routes and handle errors gracefully.
8. Utilize caching and queues for performance.
9. Write tests for all critical features.
10. Maintain compliance with PSR-12 and Laravel conventions.

---
