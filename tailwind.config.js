/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./resources/**/*.blade.php",
        "./resources/**/*.js",
        "./resources/**/*.vue",
    ],

    theme: {
        extend: {

            keyframes: {
                roadMove: {
                    to: { transform: "translateX(120px)" },
                },

                cabDrive: {
                    "0%": { left: "-300px" },
                    "100%": { left: "calc(100% + 50px)" },
                },

                fadeUp: {
                    "0%": {
                        opacity: "0",
                        transform: "translateY(24px)",
                    },
                    "100%": {
                        opacity: "1",
                        transform: "translateY(0)",
                    },
                },
            },

            animation: {
                roadMove: "roadMove 2s linear infinite",
                cabDrive: "cabDrive 12s linear infinite",
                fadeUp: "fadeUp 0.6s ease both",
            },
        },
    },

    plugins: [],
};