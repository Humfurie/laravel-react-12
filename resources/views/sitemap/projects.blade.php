{!! '<?xml version="1.0" encoding="UTF-8"?>' !!}
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
    @foreach($projects as $project)
        <url>
            <loc>{{ $appUrl }}/projects/{{ $project->slug }}</loc>
            <lastmod>{{ $project->updated_at->toIso8601String() }}</lastmod>
            <changefreq>monthly</changefreq>
            <priority>0.7</priority>
            @if($project->primaryImage)
                <image:image>
                    <image:loc>{{ $project->primaryImage->url }}</image:loc>
                    <image:title>{{ $project->title }}</image:title>
                    @if($project->description)
                        <image:caption>{{ Str::limit($project->description, 200) }}</image:caption>
                    @endif
                </image:image>
            @endif
        </url>
    @endforeach
</urlset>
