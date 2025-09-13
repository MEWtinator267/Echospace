// tailwind.config.js
import daisyui from "daisyui";
import animate from "tailwindcss-animate";
import tailwindScrollbar from "tailwind-scrollbar";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
plugins: [
  daisyui,
  animate,
  tailwindScrollbar
],
  daisyui: {
    themes: ["light", "dark", "synthwave", "cupcake"],
  },
}
