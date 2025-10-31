# Taxonomy System Usage Guide

## Overview

The taxonomy system provides a flexible way to categorize content (like blogs) using taxonomies and terms, similar to
WordPress's taxonomy structure.

## Database Structure

- **taxonomies**: Main taxonomy types (e.g., "Blog Categories", "Blog Tags")
- **taxonomy_terms**: Individual terms within each taxonomy (e.g., "Political", "Technology")
- **taxonomables**: Polymorphic pivot table connecting terms to any model

## Example: Blog Categories

Your example with "Political" category for blogs:

- **Taxonomy**: "Blog Categories" (slug: `blog-categories`)
- **Term**: "Political" (slug: `political`)

## Usage Examples

### 1. Attaching Terms to a Blog

```php
use App\Models\Blog;
use App\Models\TaxonomyTerm;

$blog = Blog::find(1);

// Attach a single term by ID
$politicalTerm = TaxonomyTerm::where('slug', 'political')->first();
$blog->attachTerms([$politicalTerm->id]);

// Attach multiple terms
$terms = TaxonomyTerm::whereIn('slug', ['political', 'technology'])->pluck('id');
$blog->attachTerms($terms->toArray());
```

### 2. Syncing Terms for a Blog (Replace all terms)

```php
// Sync terms (removes old terms, adds new ones)
$blog->syncTerms([1, 2, 3]); // Term IDs

// Sync terms for a specific taxonomy only
$blog->syncTermsByTaxonomy('blog-categories', [1, 2]);
```

### 3. Getting Terms for a Blog

```php
// Get all terms for a blog
$terms = $blog->taxonomyTerms;

// Get terms by taxonomy
$categories = $blog->getTermsByTaxonomy('blog-categories');
$tags = $blog->getTermsByTaxonomy('blog-tags');
```

### 4. Checking if a Blog has Terms

```php
// Check if blog has specific term
if ($blog->hasTerm($politicalTerm->id)) {
    // Blog is in Political category
}

// Check if blog has any of these terms
if ($blog->hasTerms([1, 2, 3])) {
    // Blog has at least one of these terms
}
```

### 5. Querying Blogs by Terms

```php
// Get all blogs with a specific term
$politicalBlogs = Blog::whereHas('taxonomyTerms', function ($query) {
    $query->where('slug', 'political');
})->get();

// Get blogs with multiple terms
$blogs = Blog::whereHas('taxonomyTerms', function ($query) {
    $query->whereIn('slug', ['political', 'technology']);
})->get();
```

### 6. Creating New Taxonomies and Terms

```php
use App\Models\Taxonomy;

// Create a new taxonomy
$taxonomy = Taxonomy::create([
    'name' => 'Product Categories',
    'description' => 'Categories for products',
]);

// Create terms for the taxonomy
$taxonomy->terms()->create([
    'name' => 'Electronics',
    'description' => 'Electronic products',
    'order' => 1,
]);
```

### 7. In Your Blog Controller

```php
use App\Models\Blog;
use App\Models\Taxonomy;

public function create()
{
    $categories = Taxonomy::where('slug', 'blog-categories')
        ->first()
        ->terms()
        ->orderBy('order')
        ->get();

    return view('blog.create', compact('categories'));
}

public function store(Request $request)
{
    $blog = Blog::create($request->validated());

    // Attach selected categories
    if ($request->has('category_ids')) {
        $blog->attachTerms($request->category_ids);
    }

    return redirect()->route('blogs.show', $blog);
}
```

### 8. Updating the Admin Blog Controller

Add taxonomy term selection to your blog forms:

```php
// In BlogController@create and BlogController@edit
public function create()
{
    $taxonomies = Taxonomy::with('terms')->get();

    return Inertia::render('Admin/Blog/Create', [
        'taxonomies' => $taxonomies,
    ]);
}

public function edit(Blog $blog)
{
    $blog->load('taxonomyTerms.taxonomy');
    $taxonomies = Taxonomy::with('terms')->get();

    return Inertia::render('Admin/Blog/Edit', [
        'blog' => $blog,
        'taxonomies' => $taxonomies,
    ]);
}

public function store(Request $request)
{
    $validated = $request->validate([
        // ... other fields
        'term_ids' => 'nullable|array',
        'term_ids.*' => 'exists:taxonomy_terms,id',
    ]);

    $blog = Blog::create($validated);

    if (!empty($validated['term_ids'])) {
        $blog->attachTerms($validated['term_ids']);
    }

    return redirect()->route('admin.blogs.index');
}

public function update(Request $request, Blog $blog)
{
    $validated = $request->validate([
        // ... other fields
        'term_ids' => 'nullable|array',
        'term_ids.*' => 'exists:taxonomy_terms,id',
    ]);

    $blog->update($validated);

    if (isset($validated['term_ids'])) {
        $blog->syncTerms($validated['term_ids']);
    }

    return redirect()->route('admin.blogs.index');
}
```

## Admin Routes

### Taxonomies

- `GET /admin/taxonomies` - List all taxonomies
- `GET /admin/taxonomies/create` - Create new taxonomy
- `POST /admin/taxonomies` - Store taxonomy
- `GET /admin/taxonomies/{id}/edit` - Edit taxonomy
- `PUT /admin/taxonomies/{id}` - Update taxonomy
- `DELETE /admin/taxonomies/{id}` - Delete taxonomy

### Taxonomy Terms

- `GET /admin/taxonomy-terms` - List all terms
- `GET /admin/taxonomy-terms?taxonomy_id=1` - Filter by taxonomy
- `GET /admin/taxonomy-terms/create` - Create new term
- `POST /admin/taxonomy-terms` - Store term
- `GET /admin/taxonomy-terms/{id}/edit` - Edit term
- `PUT /admin/taxonomy-terms/{id}` - Update term
- `DELETE /admin/taxonomy-terms/{id}` - Delete term

## Making Other Models Use Taxonomies

To add taxonomy support to other models (e.g., Product, Post):

```php
use App\Traits\HasTaxonomies;

class Product extends Model
{
    use HasTaxonomies;

    // ... rest of model
}
```

Then update the TaxonomyTerm model to add the relationship:

```php
public function products(): MorphToMany
{
    return $this->morphedByMany(Product::class, 'taxonomable');
}
```

## Database Queries

The system is optimized with proper indexes and foreign key constraints for performance.

## Example Seeded Data

The system comes with example data:

- **Blog Categories**: Political, Technology, Business, Lifestyle, Travel
- **Blog Tags**: Laravel, React, PHP, JavaScript, Web Development, Tutorial
