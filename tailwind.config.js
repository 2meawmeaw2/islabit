/** @type {import('tailwindcss').Config} */
const tokens = require("./tokens");

module.exports = {
  content: [
    "./App.tsx",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: "hsl(200, 100%, 2%)",
        fore: "hsl(195, 11%, 11%)",
        text: {
          brand: "hsl(195, 100%, 47%)",
          primary: "hsl(195, 100%, 95%)",
          white: "hsl(195, 100%, 76%)",
          secondary: "hsl(0, 0%, 96%)",
          disabled: "hsl(212, 10%, 47%)",
          muted: "hsl(215, 14%, 65%)",
        },
        feedback: {
          success: "hsl(142, 71%, 58%)",
          warning: "hsl(45, 93%, 53%)",
          info: "hsl(199, 92%, 60%)",
          error: "hsl(0, 72%, 51%)",
          lightError: "hsl(352, 88%, 85%)",
        },
        border: {
          primary: "hsl(195, 100%, 47%)",
          secondary: "hsl(195, 42%, 50%)",
          active: "hsl(195, 100%, 69%)",
          highlight: "hsl(42, 100%, 67%)",
        },
      },

      // Use the tokenized fontFamily
      fontFamily: require("./tokens").tailwindFonts,
    },
  },
  plugins: [],
};
