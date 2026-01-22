import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import typescript from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
    js.configs.recommended,
    ...typescript.configs.recommended,
    {
        ...react.configs.flat.recommended,
        ...react.configs.flat['jsx-runtime'], // Required for React 17+
        languageOptions: {
            globals: {
                ...globals.browser,
            },
        },
        rules: {
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            'react/no-unescaped-entities': 'off',
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
    {
        plugins: {
            'react-hooks': reactHooks,
        },
        rules: {
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
        },
    },
    {
        ignores: [
            // Test storage directories
            'storage/framework/testing/',
            // Other storage directories
            'storage/',
            // Build directories
            'public/build/',
            'public/hot',
            // Dependencies
            'node_modules/',
            'vendor/',
            // Environment files
            '.env',
            '.env.*',
            // Bootstrap SSR
            'bootstrap/ssr',
            // Config files
            'tailwind.config.js',
            // Separate Node.js services
            'og-image-service/',
        ],
    },
    prettier, // Turn off all rules that might conflict with Prettier
];
