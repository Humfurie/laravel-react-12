import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            ssr: 'resources/js/ssr.tsx',
            refresh: true,
        }),
        react(),
        tailwindcss(),
    ],
    esbuild: {
        jsx: 'automatic',
        // Drop console.log in production
        drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    },
    build: {
        // Optimize chunks
        rollupOptions: {
            output: {
                manualChunks(id, { getModuleInfo }) {
                    // Skip manual chunking for SSR builds
                    const moduleInfo = getModuleInfo(id);
                    if (moduleInfo && moduleInfo.isEntry && id.includes('ssr.')) {
                        return undefined;
                    }

                    // Core vendor code
                    if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/@inertiajs/react')) {
                        return 'vendor-react';
                    }

                    // Radix UI components
                    if (id.includes('node_modules/@radix-ui/')) {
                        return 'vendor-radix';
                    }

                    // TipTap editor
                    if (id.includes('node_modules/@tiptap/')) {
                        return 'vendor-tiptap';
                    }

                    // Charts
                    if (id.includes('node_modules/recharts')) {
                        return 'vendor-charts';
                    }

                    // Date utilities
                    if (id.includes('node_modules/date-fns') || id.includes('node_modules/react-day-picker')) {
                        return 'vendor-date';
                    }

                    // DnD kit
                    if (id.includes('node_modules/@dnd-kit/')) {
                        return 'vendor-dnd';
                    }

                    // UI utilities
                    if (
                        id.includes('node_modules/lucide-react') ||
                        id.includes('node_modules/class-variance-authority') ||
                        id.includes('node_modules/clsx') ||
                        id.includes('node_modules/tailwind-merge')
                    ) {
                        return 'vendor-ui';
                    }
                },
            },
        },
        // Increase chunk size warning limit
        chunkSizeWarningLimit: 1000,
        // Enable minification
        minify: 'esbuild',
        // Target modern browsers for smaller bundle
        target: 'es2020',
        // Disable source maps in production
        sourcemap: false,
    },
    resolve: {
        alias: {
            'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
            '@': path.resolve(__dirname, 'resources/js'),
        },
    },
});
