/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./App.tsx",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        // Thin (100)
        "ibm-plex-arabic-thin": ["IBMPlexSansArabic_100Thin"],

        // ExtraLight (200)
        "ibm-plex-arabic-extralight": ["IBMPlexSansArabic_200ExtraLight"],

        // Light (300)
        "ibm-plex-arabic-light": ["IBMPlexSansArabic_300Light"],

        // Regular (400)
        "ibm-plex-arabic": ["IBMPlexSansArabic_400Regular"],

        // Medium (500)
        "ibm-plex-arabic-medium": ["IBMPlexSansArabic_500Medium"],

        // SemiBold (600)
        "ibm-plex-arabic-semibold": ["IBMPlexSansArabic_600SemiBold"],

        // Bold (700)
        "ibm-plex-arabic-bold": ["IBMPlexSansArabic_700Bold"],
      },
      colors: {
        bg: "#00070A",
        fore: "#1A1E1F",
        text: {
          brand: "#00AEEF",
          primary: "#E5F8FF",
          secondary: "#F5F5F5",
          disabled: "#E2E8F0",
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
          highlight: "#FFC857", // Matches warning hue
        },
      },
    },
  },
  plugins: [],
};
