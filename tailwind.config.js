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
                    gold: "#FC6141",
                    black: "#1F1F1F",
                    white: "#FFFFFF",
                },
                muted: {
                    white: "#F7F3F1",
                    yellow: "#EEE7CB",
                    black: "#4C4C4C"
                }
            }
        },
    },
    plugins: [],
}
