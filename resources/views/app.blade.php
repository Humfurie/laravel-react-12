<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    {{-- Google AdSense Account Verification --}}
    @if(config('services.adsense.client_id'))
        <meta name="google-adsense-account" content="{{ config('services.adsense.client_id') }}">
    @endif

    {{-- Inline script to detect system dark mode preference and apply it immediately --}}
    <script>
        (function() {
            const appearance = '{{ $appearance ?? "system" }}';

            if (appearance === 'system') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                if (prefersDark) {
                    document.documentElement.classList.add('dark');
                }
            }
        })();
    </script>

    {{-- Inline style to set the HTML background color based on our theme in app.css --}}
    <style>
        html {
            background-color: oklch(1 0 0);
        }

        html.dark {
            background-color: oklch(0.145 0 0);
        }
    </style>

    <title inertia>{{ config('app.name', 'Laravel') }}</title>

        {{-- Robots Meta Tag --}}
        <meta name="robots" content="index, follow">

        {{-- Base OG tags (page-specific OG/Twitter tags are set via Inertia <Head> with SSR) --}}
        <meta property="og:site_name" content="{{ config('app.name', 'Laravel') }}">
        <meta property="og:locale" content="{{ str_replace('_', '-', app()->getLocale()) }}">
        @if(config('services.facebook.app_id'))
            <meta property="fb:app_id" content="{{ config('services.facebook.app_id') }}">
        @endif

    {{-- Favicon --}}
    <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}?v={{ config('app.version', '1.0') }}">
    <link rel="icon" type="image/png" href="{{ asset('logo.png') }}?v={{ config('app.version', '1.0') }}">

    {{-- RSS Feed Auto-discovery --}}
    <link rel="alternate" type="application/rss+xml" title="Humphrey Singculan's Blog" href="{{ url('/feed.xml') }}">

    {{-- Preload LCP hero image for faster first paint --}}
    @if(request()->is('/') || request()->is(''))
        <link rel="preload" as="image" href="{{ asset('images/humphrey-banner.webp') }}" media="(min-width: 768px)" fetchpriority="high">
        <link rel="preload" as="image" href="{{ asset('images/humphrey-banner-mb.webp') }}" media="(max-width: 767px)" fetchpriority="high">
    @endif

    {{-- Fonts are self-hosted in /public/fonts via @font-face in app.css --}}

    {{-- Preconnect to Google services for faster analytics loading --}}
    @if(config('services.google_analytics.measurement_id'))
        <link rel="preconnect" href="https://www.googletagmanager.com" crossorigin>
        <link rel="dns-prefetch" href="https://www.googletagmanager.com">
        <link rel="preconnect" href="https://www.google-analytics.com" crossorigin>
        <link rel="dns-prefetch" href="https://www.google-analytics.com">
    @endif

    {{-- Google Consent Mode v2 - Must load BEFORE any Google services --}}
    <script>
        // Default consent state (denied until user chooses)
        window.dataLayer = window.dataLayer || [];

        function gtag() {
            dataLayer.push(arguments);
        }

        gtag('consent', 'default', {
            'ad_storage': 'denied',
            'ad_user_data': 'denied',
            'ad_personalization': 'denied',
            'analytics_storage': 'denied',
            'functionality_storage': 'granted',
            'personalization_storage': 'granted',
            'security_storage': 'granted',
            'wait_for_update': 500
        });

        gtag('set', 'ads_data_redaction', true);
        gtag('set', 'url_passthrough', true);
    </script>

    {{-- Google Analytics 4 --}}
    @if(config('services.google_analytics.measurement_id'))
        <script async
                src="https://www.googletagmanager.com/gtag/js?id={{ config('services.google_analytics.measurement_id') }}"></script>
        <script>
            window.dataLayer = window.dataLayer || [];

            function gtag() {
                dataLayer.push(arguments);
            }

            gtag('js', new Date());
            gtag('config', '{{ config('services.google_analytics.measurement_id') }}', {
                'send_page_view': false  // We'll handle page views manually for Inertia
            });
        </script>
    @endif

    {{-- Google AdSense Script --}}
    @if(config('services.adsense.client_id'))
        <script async
                src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={{ config('services.adsense.client_id') }}"
                crossorigin="anonymous"></script>
    @endif

    @routes
    @viteReactRefresh
    @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
    @inertiaHead
</head>
<body class="font-sans antialiased">
@inertia
</body>
</html>
