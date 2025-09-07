/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./App.tsx",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // Clean color palette - no blur/transparent colors
      colors: {
        // Pure colors
        pure: {
          black: "#000000",
          white: "#FFFFFF",
        },

        // Background colors
        bg: "#00070A", // or 020617
        fore: "#1A1E1F", // Card backgrounds 1a2236

        // Text colors
        text: {
          brand: "#00AEEF", // Primary brand blue
          primary: "#E5F8FF", // Main text
          white: "#85DEFF", // Secondary text
          secondary: "#F5F5F5", // Muted text
          disabled: "#6C7684", // Disabled text
          muted: "#9CA3AF", // Replaces rgba blur
        },

        // Feedback colors
        feedback: {
          success: "#4ADE80",
          warning: "#FACC15",
          info: "#38BDF8",
          error: "#DC2626",
          lightError: "#fab5be",
        },

        // Border colors
        border: {
          primary: "#00AEEF",
          secondary: "#4B9AB5",
          active: "#62D4FF",
          highlight: "#FFC857", // Gold for completion
        },
      },
    },
  },
  plugins: [],
};
