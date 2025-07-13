/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './resources/**/*.blade.php',
        './resources/js/**/*.{js,jsx,ts,tsx}',
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    orange: "#FC6141",
                    gold: "#FFB347", // New golden color to complement orange
                    teal: "#38B2AC", // Adding a teal as a secondary accent color
                    purple: "#9F7AEA", // Adding a soft purple as another accent
                    black: "#1F1F1F",
                    white: "#FFFFFF",
                },
                muted: {
                    white: "#F7F3F1",
                    yellow: "#EEE7CB",
                    black: "#4C4C4C",
                    teal: "#E6FFFA", // Light teal background
                    purple: "#F3E8FF" // Light purple background
                },
                primary: {
                    orange: "#FC6141",
                    light: "#FED7D7",
                    dark: "#C53030",
                }
            },
            gradients: {
                'orange-to-gold': 'linear-gradient(135deg, #FC6141 0%, #FFB347 100%)',
                'teal-to-blue': 'linear-gradient(135deg, #38B2AC 0%, #4299E1 100%)',
                'purple-to-pink': 'linear-gradient(135deg, #9F7AEA 0%, #ED64A6 100%)'
            }
        },
    },
    plugins: [],
}
