{{-- Updated: 2025-11-02 01:20:00 UTC --}}
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

        {{-- Open Graph Meta Tags for Social Media --}}
        <meta property="og:site_name" content="{{ config('app.name', 'Laravel') }}">
        <meta property="og:type" content="website">
        <meta property="og:url" content="{{ url()->current() }}">
        <meta property="og:locale" content="{{ str_replace('_', '-', app()->getLocale()) }}">
        @if(config('services.facebook.app_id'))
            <meta property="fb:app_id" content="{{ config('services.facebook.app_id') }}">
        @endif

        {{-- Open Graph & Twitter Card Meta Tags --}}
        @php
            // Direct approach: check if this is a giveaway page and fetch data
            $currentPath = request()->path();
            $metaTitle = config('app.name');
            $metaDescription = 'Professional portfolio and blog';
            $metaImage = asset('images/og-default.jpg');

            if (preg_match('#^giveaways/([^/]+)$#', $currentPath, $matches)) {
                $slug = $matches[1];
                $giveaway = \App\Models\Giveaway::where('slug', $slug)->first();

                if ($giveaway) {
                    $metaTitle = $giveaway->title;
                    $metaDescription = substr($giveaway->description, 0, 160);
                    $metaImage = $giveaway->primary_image_url ?: asset('images/og-default.jpg');
                }
            }
        @endphp
        <!-- META-DEBUG: title={{ $metaTitle }}, image={{ $metaImage }} -->
        <meta property="og:title" content="{{ $metaTitle }}">
        <meta property="og:description" content="{{ $metaDescription }}">
        <meta property="og:image" content="{{ $metaImage }}">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        <meta property="og:image:alt" content="{{ $metaTitle }}">

        {{-- Twitter Card Meta Tags --}}
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ $metaTitle }}">
        <meta name="twitter:description" content="{{ $metaDescription }}">
        <meta name="twitter:image" content="{{ $metaImage }}">

        {{-- Favicon --}}
        <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}?v={{ config('app.version', '1.0') }}">
        <link rel="icon" type="image/png" href="{{ asset('logo.png') }}?v={{ config('app.version', '1.0') }}">

        <link rel="preconnect" href="https://fonts.bunny.net" crossorigin>
        <link rel="dns-prefetch" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600&display=swap" rel="stylesheet" />

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
