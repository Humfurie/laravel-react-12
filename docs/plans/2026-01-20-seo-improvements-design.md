# SEO Improvements Design

**Date:** 2026-01-20
**Status:** Approved
**Goal:** Fix all SEO issues identified in humfurie.org comparison

## Context

SEO audit comparing humfurie.org (Laravel 12 + Inertia) vs healthstin.com.au (WordPress) revealed:
- Clean code foundation (5 scripts vs 152) but poor SEO optimization
- Generic title tag, missing schemas, slow load time despite lean codebase
- Sitemap returning 500 error in production

## Changes

### 1. Title & Meta Optimization

**Homepage:**
- Title: "Humphrey Singculan - Software Engineer | Blog & Portfolio"
- Description: "Humphrey Singculan is a Software Engineer specializing in Laravel, React, and full-stack development. Explore projects, blog posts, and professional portfolio."

**App title suffix:**
- Change from generic app name to "| Humphrey Singculan" for sub-pages
- Homepage gets full title without suffix

### 2. Schema.org Structured Data

**New component:** `resources/js/components/seo/StructuredData.tsx`

**Homepage schemas:**
```json
{
  "@type": "Person",
  "name": "Humphrey Singculan",
  "jobTitle": "Software Engineer",
  "url": "https://humfurie.org",
  "sameAs": [
    "https://github.com/Humfurie",
    "https://www.linkedin.com/in/humphrey-singculan-09a459153",
    "https://www.facebook.com/humphrey123",
    "https://www.instagram.com/humfuree/",
    "https://x.com/Humphfries"
  ]
}
```

```json
{
  "@type": "WebSite",
  "name": "Humphrey Singculan",
  "url": "https://humfurie.org",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://humfurie.org/blogs?search={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

### 3. Canonical URLs

**New component:** `resources/js/components/seo/CanonicalUrl.tsx`

Add canonical URLs to all public pages:
- Homepage: `https://humfurie.org`
- Blog listing: `https://humfurie.org/blogs`
- Blog posts: `https://humfurie.org/blogs/{slug}`
- Projects: `https://humfurie.org/projects`

### 4. Performance & Caching

**New middleware:** `app/Http/Middleware/CacheHeaders.php`

Cache headers for public pages:
- Homepage: `public, max-age=300, s-maxage=3600`
- Blog listing: `public, max-age=300, s-maxage=1800`
- Blog posts: `public, max-age=300, s-maxage=3600`
- Sitemap: `public, max-age=3600`

**Manual step:** Configure Cloudflare page rules for edge caching.

### 5. Sitemap

- Debug/fix 500 error
- Remove giveaways and properties from sitemap
- Add cache headers to sitemap response

### 6. Page Cleanup

**Remove from frontend (keep admin):**
- Giveaways public pages
- Properties public pages
- Markets/Stocks/Crypto orphan pages
- PublicLayout (giveaway-specific)

**Routes to comment out in `web.php`:**
- Lines 89-90: Properties routes
- Lines 93-98: Giveaways routes
- Line 130: Giveaway comments route

## Files Modified

| File | Change |
|------|--------|
| `resources/js/pages/user/home.tsx` | Title, meta, schemas |
| `resources/js/app.tsx` | Title suffix logic |
| `resources/js/components/seo/StructuredData.tsx` | New |
| `resources/js/components/seo/CanonicalUrl.tsx` | New |
| `routes/web.php` | Comment out routes |
| `app/Http/Middleware/CacheHeaders.php` | New |
| `app/Http/Controllers/SitemapController.php` | Debug/fix |

## Files Deleted

- `resources/js/pages/giveaways/*.tsx` (public)
- `resources/js/pages/properties/*.tsx` (public)
- `resources/js/pages/markets.tsx`
- `resources/js/pages/stocks.tsx`
- `resources/js/pages/crypto.tsx`
- `resources/js/layouts/PublicLayout.tsx`

## Testing

- Verify sitemap returns 200 with valid XML
- Verify structured data with Google Rich Results Test
- Verify canonical URLs present on all pages
- Verify cache headers on public routes
- Verify removed routes return 404

## Success Criteria

- [ ] Homepage title: "Humphrey Singculan - Software Engineer | Blog & Portfolio"
- [ ] Person + WebSite schemas on homepage
- [ ] Canonical URLs on all public pages
- [ ] Sitemap working (no 500 error)
- [ ] Cache headers on public pages
- [ ] Giveaways/Properties/Markets routes removed
