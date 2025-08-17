/** @type {import('tailwindcss').Config} */
const tokens = require("./tokens");

module.exports = {
  // NOTE: Update this to include the paths to all files that contain NativeWind classes.
  content: [
    "./App.tsx",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // Use the tokenized color object directly
      colors: {
        bg: "#00070A",
        fore: "#1A1E1F",
        text: {
          brand: "#00AEEF",
          primary: "#E5F8FF",
          white: "#85DEFF",
          secondary: "#F5F5F5",
          disabled: "#6C7684",
        },
        feedback: {
          success: "#4ADE80",
          warning: "#FACC15",
          info: "#38BDF8",
          error: "#F87171",
        },
        border: {
          primary: "#00AEEF",
          secondary: "#4B9AB5",
          active: "#62D4FF",
          highlight: "#FFC857",
        },
      },

      // Tailwind expects arrays for fontFamily, so use the tailwindFonts mapping

      fontFamily: {
        "ibm-plex-arabic-thin": "IBMPlexSansArabic_100Thin",
        "ibm-plex-arabic-extralight": "IBMPlexSansArabic_200ExtraLight",
        "ibm-plex-arabic-light": "IBMPlexSansArabic_300Light",
        "ibm-plex-arabic": "IBMPlexSansArabic_400Regular",
        "ibm-plex-arabic-medium": "IBMPlexSansArabic_500Medium",
        "ibm-plex-arabic-semibold": "IBMPlexSansArabic_600SemiBold",
        "ibm-plex-arabic-bold": "IBMPlexSansArabic_700Bold",
      },
    },
  },
  plugins: [],
};

/**
 * fontFamily values for use in React Native styles (single string per font).
 * Use tokens.fontFamily['ibm-plex-arabic'] etc. in StyleSheet.
 */
