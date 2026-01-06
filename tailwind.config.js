/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: ['./resources/**/*.blade.php', './resources/js/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            colors: {
                brand: {
                    orange: '#FC6141', // Your original vibrant orange
                    green: '#2ECC71', // Fresh green for featured/accents
                    offwhite: '#F7F3F1', // Off-white for backgrounds
                    white: '#FFFFFF', // Pure white for cards
                    black: '#1F1F1F', // Dark text
                    gray: '#4C4C4C', // Secondary text
                },
                muted: {
                    orange: '#FF8C6B', // Lighter orange for hover states
                    green: '#5DD890', // Lighter green for hover states
                    offwhite: '#FAF8F5', // Very light off-white
                    gray: '#8E8E8E', // Light gray for subtle text
                },
            },
        },
    },
    plugins: [],
};
