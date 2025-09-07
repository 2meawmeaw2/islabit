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
          error: "#DC2626 ",
          lightError: "#fab5be",
        },

        // Border colors
        border: {
          primary: "#00AEEF",
          secondary: "#4B9AB5",
          active: "#62D4FF",
          highlight: "#FFC857", // Gold for completion
        },

        // Gray scale variants (replaces blur/transparent)
        gray: {
          50: "#F9FAFB", // Very light gray
          100: "#F3F4F6", // Light gray
          200: "#E5E7EB", // Medium light gray
          300: "#D1D5DB", // Medium gray
          400: "#9CA3AF", // Medium dark gray
          500: "#6B7280", // Dark gray
          600: "#4B5563", // Darker gray
          700: "#374151", // Very dark gray
          800: "#1F2937", // Almost black
          900: "#111827", // Near black
        },

        // Blue variants (replaces rgba blue)
        blue: {
          50: "#E0F2FE", // Light blue
          100: "#DBEAFE", // Very light blue
          200: "#BFDBFE", // Lighter blue
          300: "#93C5FD", // Medium light blue
          400: "#60A5FA", // Medium blue
          500: "#3B82F6", // Standard blue
          600: "#2563EB", // Dark blue
          700: "#1D4ED8", // Darker blue
          800: "#1E40AF", // Very dark blue
          900: "#1E3A8A", // Deep blue
        },

        // Gold variants (for completion states)
        amber: {
          50: "#FEF3C7", // Very light gold
          100: "#FDE68A", // Light gold
          200: "#FCD34D", // Medium light gold
          300: "#FBBF24", // Medium gold
          400: "#F59E0B", // Standard gold
          500: "#D97706", // Dark gold
          600: "#B45309", // Darker gold
          700: "#92400E", // Very dark gold
          800: "#78350F", // Deep gold
          900: "#451A03", // Deepest gold
        },

        // Green variants
        green: {
          50: "#F0FDF4", // Very light green
          100: "#DCFCE7", // Light green
          200: "#BBF7D0", // Medium light green
          300: "#86EFAC", // Medium green
          400: "#4ADE80", // Standard green
          500: "#22C55E", // Dark green
          600: "#16A34A", // Darker green
          700: "#15803D", // Very dark green
          800: "#166534", // Deep green
          900: "#14532D", // Deepest green
        },

        // Red variants
        red: {
          50: "#FEF2F2", // Very light red
          100: "#FEE2E2", // Light red
          200: "#FECACA", // Medium light red
          300: "#FCA5A5", // Medium red
          400: "#F87171", // Standard red
          500: "#EF4444", // Dark red
          600: "#DC2626", // Darker red
          700: "#B91C1C", // Very dark red
          800: "#991B1B", // Deep red
          900: "#7F1D1D", // Deepest red
        },

        // Orange variants
        orange: {
          50: "#FFF7ED", // Very light orange
          100: "#FFEDD5", // Light orange
          200: "#FED7AA", // Medium light orange
          300: "#FDBA74", // Medium orange
          400: "#FB923C", // Standard orange
          500: "#F97316", // Dark orange
          600: "#EA580C", // Darker orange
          700: "#C2410C", // Very dark orange
          800: "#9A3412", // Deep orange
          900: "#7C2D12", // Deepest orange
        },

        // Slate variants (for subtle elements)
        slate: {
          50: "#F8FAFC", // Very light slate
          100: "#F1F5F9", // Light slate
          200: "#E2E8F0", // Medium light slate
          300: "#CBD5E1", // Medium slate
          400: "#94A3B8", // Medium dark slate
          500: "#64748B", // Standard slate
          600: "#475569", // Dark slate
          700: "#334155", // Darker slate
          800: "#1E293B", // Very dark slate
          900: "#0F172A", // Deepest slate
        },
      },

      // Use the tokenized fontFamily
      fontFamily: require("./tokens").tailwindFonts,
    },
  },
  plugins: [],
};
