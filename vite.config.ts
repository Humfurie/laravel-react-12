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

                    // Conservative chunk splitting - only split truly optional libraries
                    // Keep React, Inertia, and core libs in vendor to avoid auth issues
                    if (id.includes('node_modules/')) {
                        // TipTap editor (admin-only) - safe to split
                        if (id.includes('@tiptap/') || id.includes('prosemirror')) {
                            return 'tiptap';
                        }
                        // Recharts (specific pages only) - safe to split
                        if (id.includes('recharts') || id.includes('d3-')) {
                            return 'recharts';
                        }
                        // Everything else stays in vendor (including React, Inertia, Radix, etc.)
                        return 'vendor';
                    }
                },
            },
        },
        // Increase chunk size warning limit
        chunkSizeWarningLimit: 1500,
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
