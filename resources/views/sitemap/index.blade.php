{!! '<?xml version="1.0" encoding="UTF-8"?>' !!}
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
    {{-- Home Page --}}
    <url>
        <loc>{{ $appUrl }}</loc>
        <lastmod>{{ now()->toIso8601String() }}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>

    {{-- Blog Index --}}
    <url>
        <loc>{{ $appUrl }}/blog</loc>
        <lastmod>{{ $blogs->first()?->updated_at?->toIso8601String() ?? now()->toIso8601String() }}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>

    {{-- Individual Blog Posts --}}
    @foreach($blogs as $blog)
        <url>
            <loc>{{ $appUrl }}/blog/{{ $blog->slug }}</loc>
            <lastmod>{{ $blog->updated_at->toIso8601String() }}</lastmod>
            <changefreq>weekly</changefreq>
            <priority>0.8</priority>
            @if($blog->display_image)
                <image:image>
                    <image:loc>{{ $blog->display_image }}</image:loc>
                    <image:title>{{ $blog->title }}</image:title>
                </image:image>
            @endif
        </url>
    @endforeach
</urlset>
