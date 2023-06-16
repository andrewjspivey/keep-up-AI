/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#444554",
        secondary: "#40414F",
      },
      boxShadow: {
        custom: "25px 50px 25px -24px rgb(0 0 0 / 0.25)",
      },
    },
    plugins: [],
  },
};
