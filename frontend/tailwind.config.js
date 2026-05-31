/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          900: "#0B1E3F",
          800: "#13294B",
          700: "#1F3A66",
        },
        accent: "#4FC3F7",
        gold: "#F5C518",
      },
    },
  },
  plugins: [],
};
