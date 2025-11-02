<?php

namespace App\View\Composers;

use Illuminate\Support\Facades\Log;
use Illuminate\View\View;

class MetaComposer
{
    public function compose(View $view): void
    {
        $data = $view->getData();
        $page = $data['page'] ?? [];
        $component = $page['component'] ?? 'unknown';

        // Debug: Log what we're receiving
        Log::info('MetaComposer debug', [
            'component' => $component,
            'has_page' => isset($data['page']),
            'has_props' => isset($page['props']),
            'has_giveaway' => isset($page['props']['giveaway']),
        ]);

        // Check if this is a giveaway page
        if (str_contains($component, 'giveaways/show')) {
            $giveaway = $page['props']['giveaway'] ?? null;

            if ($giveaway) {
                $metaTitle = $giveaway['title'] ?? config('app.name');
                $metaDescription = isset($giveaway['description'])
                    ? substr($giveaway['description'], 0, 160)
                    : 'Professional portfolio and blog';
                $metaImage = $giveaway['primary_image_url'] ?? asset('images/og-default.jpg');
            } else {
                $metaTitle = config('app.name');
                $metaDescription = 'Professional portfolio and blog';
                $metaImage = asset('images/og-default.jpg');
            }
        } else {
            // Default meta tags for non-giveaway pages
            $metaTitle = config('app.name');
            $metaDescription = 'Professional portfolio and blog';
            $metaImage = asset('images/og-default.jpg');
        }

        $view->with(compact('metaTitle', 'metaDescription', 'metaImage'));
    }
}
