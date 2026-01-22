<?php echo '<?xml version="1.0" encoding="UTF-8"?>'; ?>

<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
    <channel>
        <title>Humphrey Singculan's Blog</title>
        <link>{{ config('app.url') }}/blog</link>
        <description>Software engineering articles, tutorials, and insights from Humphrey Singculan</description>
        <language>en-us</language>
        <lastBuildDate>{{ $blogs->first()?->published_at?->toRfc2822String() ?? now()->toRfc2822String() }}</lastBuildDate>
        <atom:link href="{{ url('/feed.xml') }}" rel="self" type="application/rss+xml"/>
        <image>
            <url>{{ asset('logo.png') }}</url>
            <title>Humphrey Singculan's Blog</title>
            <link>{{ config('app.url') }}/blog</link>
        </image>
        @foreach($blogs as $blog)
        <item>
            <title>{{ htmlspecialchars($blog->title, ENT_XML1, 'UTF-8') }}</title>
            <link>{{ url("/blog/{$blog->slug}") }}</link>
            <guid isPermaLink="true">{{ url("/blog/{$blog->slug}") }}</guid>
            <pubDate>{{ $blog->published_at->toRfc2822String() }}</pubDate>
            <description>{{ htmlspecialchars($blog->excerpt ?? '', ENT_XML1, 'UTF-8') }}</description>
            @if($blog->display_image)
            <enclosure url="{{ $blog->display_image }}" type="image/jpeg"/>
            @endif
        </item>
        @endforeach
    </channel>
</rss>
