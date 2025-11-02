<?php

namespace App\View\Composers;

use Illuminate\View\View;

class MetaComposer
{
    public function compose(View $view): void
    {
        $page = $view->getData()['page'] ?? [];
        
        $metaTitle = $page['props']['giveaway']['title'] ?? config('app.name');
        $metaDescription = isset($page['props']['giveaway']['description']) 
            ? substr($page['props']['giveaway']['description'], 0, 160) 
            : 'Professional portfolio and blog';
        $metaImage = $page['props']['giveaway']['primary_image_url'] ?? asset('images/og-default.jpg');
        
        $view->with(compact('metaTitle', 'metaDescription', 'metaImage'));
    }
}
