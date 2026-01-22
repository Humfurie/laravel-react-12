{!! '<?xml version="1.0" encoding="UTF-8"?>' !!}
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    {{-- Static pages sitemap --}}
    <sitemap>
        <loc>{{ $appUrl }}/sitemap-pages.xml</loc>
        <lastmod>{{ now()->toIso8601String() }}</lastmod>
    </sitemap>

    {{-- Blog posts sitemap --}}
    <sitemap>
        <loc>{{ $appUrl }}/sitemap-blogs.xml</loc>
        @if($latestBlog)
            <lastmod>{{ $latestBlog->updated_at->toIso8601String() }}</lastmod>
        @else
            <lastmod>{{ now()->toIso8601String() }}</lastmod>
        @endif
    </sitemap>

    {{-- Projects sitemap --}}
    <sitemap>
        <loc>{{ $appUrl }}/sitemap-projects.xml</loc>
        @if($latestProject)
            <lastmod>{{ $latestProject->updated_at->toIso8601String() }}</lastmod>
        @else
            <lastmod>{{ now()->toIso8601String() }}</lastmod>
        @endif
    </sitemap>
</sitemapindex>
