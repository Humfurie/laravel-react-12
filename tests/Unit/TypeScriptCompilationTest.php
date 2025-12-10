<?php

use Illuminate\Support\Facades\Process;

uses()->group('typescript');

beforeEach(function () {
    // These tests don't need database
});

describe('TypeScript Compilation', function () {
    it('compiles without errors', function () {
        $result = Process::path(base_path())
            ->timeout(120)
            ->run('npx tsc --noEmit');

        expect($result->exitCode())->toBe(0, 'TypeScript compilation failed: ' . $result->errorOutput());
    });

    it('has valid type definitions in index.d.ts', function () {
        $typesPath = resource_path('js/types/index.d.ts');

        expect(file_exists($typesPath))->toBeTrue('Types file does not exist');

        $content = file_get_contents($typesPath);

        // Check for required type exports
        expect($content)->toContain('export interface BlogLocation');
        expect($content)->toContain('export interface LocationImage');
        expect($content)->toContain('export interface BreadcrumbItem');
        expect($content)->toContain('export interface SharedData');
        expect($content)->toContain('export interface User');
        expect($content)->toContain('export interface Permissions');
    });

    it('has BlogLocation type with required properties', function () {
        $typesPath = resource_path('js/types/index.d.ts');
        $content = file_get_contents($typesPath);

        // Check BlogLocation has required fields
        expect($content)->toContain('interface BlogLocation');
        expect($content)->toMatch('/BlogLocation\s*\{[^}]*id:\s*number/s');
        expect($content)->toMatch('/BlogLocation\s*\{[^}]*title:\s*string/s');
        expect($content)->toMatch('/BlogLocation\s*\{[^}]*latitude:\s*number/s');
        expect($content)->toMatch('/BlogLocation\s*\{[^}]*longitude:\s*number/s');
    });

    it('has LocationImage type with required properties', function () {
        $typesPath = resource_path('js/types/index.d.ts');
        $content = file_get_contents($typesPath);

        // Check LocationImage has required fields
        expect($content)->toContain('interface LocationImage');
        expect($content)->toMatch('/LocationImage\s*\{[^}]*id:\s*number/s');
        expect($content)->toMatch('/LocationImage\s*\{[^}]*url:\s*string/s');
        expect($content)->toMatch('/LocationImage\s*\{[^}]*is_primary:\s*boolean/s');
    });
});

describe('React Components Type Safety', function () {
    it('has valid AdBanner component', function () {
        $componentPath = resource_path('js/components/ads/AdBanner.tsx');

        expect(file_exists($componentPath))->toBeTrue();

        $content = file_get_contents($componentPath);

        // Should not have the old incorrect interface extension
        expect($content)->not->toContain('interface WindowWithAdsbygoogle extends Window');

        // Should have proper type assertion
        expect($content)->toContain('window as Window &');
    });

    it('has valid Calendar component with Chevron', function () {
        $componentPath = resource_path('js/components/ui/calendar.tsx');

        expect(file_exists($componentPath))->toBeTrue();

        $content = file_get_contents($componentPath);

        // Should use Chevron instead of deprecated IconLeft/IconRight
        expect($content)->not->toContain('IconLeft:');
        expect($content)->not->toContain('IconRight:');
        expect($content)->toContain('Chevron:');
    });

    it('has valid blog-post PageProps with index signature', function () {
        $componentPath = resource_path('js/pages/user/blog-post.tsx');

        expect(file_exists($componentPath))->toBeTrue();

        $content = file_get_contents($componentPath);

        // Should have index signature for PageProps
        expect($content)->toContain('[key: string]: unknown;');

        // Should have enabled property in adsense
        expect($content)->toContain('enabled?:');
    });

    it('has valid TravelMapButton with editor prop', function () {
        $componentPath = resource_path('js/components/tiptap-ui/travel-map-button/travel-map-button.tsx');

        expect(file_exists($componentPath))->toBeTrue();

        $content = file_get_contents($componentPath);

        // Should import Editor type
        expect($content)->toContain("import type { Editor } from '@tiptap/react'");

        // Should have editor prop in interface
        expect($content)->toMatch('/interface TravelMapButtonProps[^}]*editor\?:/s');
    });

    it('has valid permission-form-modal with proper payload', function () {
        $componentPath = resource_path('js/components/permission-form-modal.tsx');

        expect(file_exists($componentPath))->toBeTrue();

        $content = file_get_contents($componentPath);

        // Should have index signature on Permission interface
        expect($content)->toMatch('/interface Permission\s*\{[^}]*\[key:\s*string\]:\s*unknown/s');

        // Should create a separate payload object
        expect($content)->toContain('const payload = {');
    });

    it('has valid IndexPage using Inertia Head', function () {
        $componentPath = resource_path('js/components/home/IndexPage.tsx');

        expect(file_exists($componentPath))->toBeTrue();

        $content = file_get_contents($componentPath);

        // Should use Inertia Head, not Next.js Head
        expect($content)->not->toContain("from 'next/head'");
        expect($content)->toContain("from '@inertiajs/react'");
    });

    it('has valid usePermissions hook with proper type assertion', function () {
        $hookPath = resource_path('js/hooks/usePermissions.ts');

        expect(file_exists($hookPath))->toBeTrue();

        $content = file_get_contents($hookPath);

        // Should have unknown in the type assertion chain
        expect($content)->toContain('as unknown as');
    });

    it('has valid LocationPopup with typed map callback', function () {
        $componentPath = resource_path('js/components/map/LocationPopup.tsx');

        expect(file_exists($componentPath))->toBeTrue();

        $content = file_get_contents($componentPath);

        // Should import LocationImage type
        expect($content)->toContain('LocationImage');

        // Should have typed parameters in map callback
        expect($content)->toMatch('/images\.map\(\(_:\s*LocationImage,\s*idx:\s*number\)/');
    });

    it('has valid settings page without boolean comparison', function () {
        $pagePath = resource_path('js/pages/admin/settings/index.tsx');

        expect(file_exists($pagePath))->toBeTrue();

        $content = file_get_contents($pagePath);

        // Should not compare to boolean true
        expect($content)->not->toContain("value === true");

        // Should only compare to string 'true'
        expect($content)->toContain("value === 'true'");
    });

    it('has valid real-estate breadcrumbs using global type', function () {
        $files = [
            resource_path('js/pages/admin/real-estate/developers/create.tsx'),
            resource_path('js/pages/admin/real-estate/developers/edit.tsx'),
            resource_path('js/pages/admin/real-estate/projects/create.tsx'),
            resource_path('js/pages/admin/real-estate/projects/edit.tsx'),
        ];

        foreach ($files as $file) {
            expect(file_exists($file))->toBeTrue("File not found: {$file}");

            $content = file_get_contents($file);

            // Should import BreadcrumbItem from @/types
            expect($content)->toContain("import type { BreadcrumbItem } from '@/types'");

            // Should NOT have local BreadcrumbItem interface definition
            expect($content)->not->toMatch('/^interface BreadcrumbItem\s*\{/m');

            // Should use 'title' not 'label' in breadcrumb items
            expect($content)->toContain("title:");
            expect($content)->not->toContain("label: 'Real Estate'");
            expect($content)->not->toContain("label: 'Developers'");
            expect($content)->not->toContain("label: 'Projects'");
            expect($content)->not->toContain("label: 'Create'");
            expect($content)->not->toContain("label: 'Edit'");
        }
    });

    it('has BreadcrumbItem type with required title and href properties', function () {
        $typesPath = resource_path('js/types/index.d.ts');
        $content = file_get_contents($typesPath);

        // Check BreadcrumbItem has required fields
        expect($content)->toContain('interface BreadcrumbItem');
        expect($content)->toMatch('/BreadcrumbItem\s*\{[^}]*title:\s*string/s');
        expect($content)->toMatch('/BreadcrumbItem\s*\{[^}]*href:\s*string/s');
    });

    it('has valid map components with ts-expect-error for leaflet', function () {
        $files = [
            resource_path('js/components/map/MapPicker.tsx'),
            resource_path('js/components/map/TravelMapInner.tsx'),
        ];

        foreach ($files as $file) {
            expect(file_exists($file))->toBeTrue("File not found: {$file}");

            $content = file_get_contents($file);

            // Should have ts-expect-error comments for untyped leaflet modules
            expect($content)->toContain('@ts-expect-error');
        }
    });

    it('has valid real-estate-modals with nullish coalescing', function () {
        $componentPath = resource_path('js/components/real-estate-modals.tsx');

        expect(file_exists($componentPath))->toBeTrue();

        $content = file_get_contents($componentPath);

        // Should use ?? instead of || for is_active default
        expect($content)->toContain('is_active: financingOption?.is_active ?? true');
    });

    it('has valid dashboard with proper PieLabelRenderProps', function () {
        $pagePath = resource_path('js/pages/admin/dashboard.tsx');

        expect(file_exists($pagePath))->toBeTrue();

        $content = file_get_contents($pagePath);

        // Should import PieLabelRenderProps
        expect($content)->toContain('PieLabelRenderProps');

        // Should use PieLabelRenderProps in label function
        expect($content)->toContain('(props: PieLabelRenderProps)');
    });
});
