/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  // daisyui: {
  //   themes: [
  //     {
  //       valentine: {
  //         ...require("daisyui/src/colors/themes")["[data-theme=valentine]"],
  //         "base-100": "#ffffff",
  //         "base-200": "#C98BB9",
  //       },
  //     },
  //   ],
  // },
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
};
