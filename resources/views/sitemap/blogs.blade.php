{!! '<?xml version="1.0" encoding="UTF-8"?>' !!}
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
>
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
                    @if($blog->excerpt)
                        <image:caption>{{ Str::limit($blog->excerpt, 200) }}</image:caption>
                    @endif
                </image:image>
            @endif
        </url>
    @endforeach
</urlset>
