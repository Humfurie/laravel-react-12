/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: ['./resources/**/*.blade.php', './resources/js/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            colors: {
                brand: {
                    orange: '#E8945A',
                    green: '#1B3D2F',
                    'green-mid': '#2A5E44',
                    'green-light': '#E4EDE8',
                    'orange-light': '#F5C89E',
                    'orange-bg': '#FDF5EE',
                    offwhite: '#FAFAF8',
                    white: '#FFFFFF',
                    black: '#1A1A1A',
                    gray: '#6B6B63',
                },
                muted: {
                    orange: '#F5C89E',
                    green: '#3D7A5A',
                    offwhite: '#F3F1EC',
                    gray: '#9E9E95',
                },
            },
            fontFamily: {
                display: ['Cormorant Garamond', 'Georgia', 'serif'],
            },
        },
    },
    plugins: [],
};
