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
                manualChunks: {
                    // Split vendor code into separate chunk
                    vendor: ['react', 'react-dom', '@inertiajs/react'],
                    // Split framer-motion into separate chunk (it's large)
                    framer: ['framer-motion'],
                    // Split date utilities
                    'date-utils': ['date-fns'],
                },
            },
        },
        // Increase chunk size warning limit
        chunkSizeWarningLimit: 1000,
        // Enable minification
        minify: 'esbuild',
        // Target modern browsers for smaller bundle
        target: 'es2020',
    },
    resolve: {
        alias: {
            'ziggy-js': resolve(__dirname, 'vendor/tightenco/ziggy'),
            '@': path.resolve(__dirname, 'resources/js'),
        },
    },
});
