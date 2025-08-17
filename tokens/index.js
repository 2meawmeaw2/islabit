// tokens/index.js
module.exports = {
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

  /**
   * fontFamily values for use in React Native styles (single string per font).
   * Use tokens.fontFamily['ibm-plex-arabic'] etc. in StyleSheet.
   */
  fontFamily: {
    "ibm-plex-arabic-thin": "IBMPlexSansArabic_100Thin",
    "ibm-plex-arabic-extralight": "IBMPlexSansArabic_200ExtraLight",
    "ibm-plex-arabic-light": "IBMPlexSansArabic_300Light",
    "ibm-plex-arabic": "IBMPlexSansArabic_400Regular",
    "ibm-plex-arabic-medium": "IBMPlexSansArabic_500Medium",
    "ibm-plex-arabic-semibold": "IBMPlexSansArabic_600SemiBold",
    "ibm-plex-arabic-bold": "IBMPlexSansArabic_700Bold",
  },

  /**
   * Separate mapping for Tailwind (arrays are common there).
   * tailwind.config.js will require tokens and use this for theme.fontFamily.
   */
  tailwindFonts: {
    "ibm-plex-arabic-thin": ["IBMPlexSansArabic_100Thin"],
    "ibm-plex-arabic-extralight": ["IBMPlexSansArabic_200ExtraLight"],
    "ibm-plex-arabic-light": ["IBMPlexSansArabic_300Light"],
    "ibm-plex-arabic": ["IBMPlexSansArabic_400Regular"],
    "ibm-plex-arabic-medium": ["IBMPlexSansArabic_500Medium"],
    "ibm-plex-arabic-semibold": ["IBMPlexSansArabic_600SemiBold"],
    "ibm-plex-arabic-bold": ["IBMPlexSansArabic_700Bold"],
  },
};
