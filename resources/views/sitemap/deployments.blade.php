{!! '<?xml version="1.0" encoding="UTF-8"?>' !!}
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
    @foreach($deployments as $deployment)
        <url>
            <loc>{{ $appUrl }}/api/deployments/{{ $deployment->slug }}</loc>
            <lastmod>{{ $deployment->updated_at->toIso8601String() }}</lastmod>
            <changefreq>monthly</changefreq>
            <priority>0.7</priority>
            @if($deployment->primaryImage)
                <image:image>
                    <image:loc>{{ $deployment->primaryImage->url }}</image:loc>
                    <image:title>{{ $deployment->title }}</image:title>
                    @if($deployment->description)
                        <image:caption>{{ Str::limit($deployment->description, 200) }}</image:caption>
                    @endif
                </image:image>
            @endif
        </url>
    @endforeach
</urlset>
