const colors = require("tailwindcss/colors");
const { fontFamily, boxShadow } = require("tailwindcss/defaultTheme");

const outlineShadows = Object.fromEntries(
  Object.entries(boxShadow).map(([key, value]) => {
    const newKey = key === "DEFAULT" ? "outline" : key + "-outline";
    const newShadow = value + `, 0px 0px 0px 1px rgb(0 0 0 / 0.05)`;
    return [newKey, newShadow];
  })
);

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        ...boxShadow,
        ...outlineShadows,
      },
      fontFamily: {
        primary: ["var(--inter-font)", ...fontFamily.sans],
        mono: ["var(--jetbrains-mono-font)", ...fontFamily.mono],
      },
      colors: {
        primary: colors.neutral,
        gray: colors.neutral,
      },
      keyframes: {
        fadeIn: {
          "0%": {
            opacity: 0,
          },
          "100%": {
            // empty on purpose; use the opacity of the component
          },
        },
        slideDownAndFadeIn: {
          "0%": {
            opacity: 0,
            transform: "translateY(-2px) scale(0.9)",
          },
          "100%": {
            opacity: 1,
          },
        },
        slideRightAndFadeIn: {
          "0%": {
            opacity: 0,
            transform: "translateX(-200px)",
          },
          "100%": {
            opacity: 1,
          },
        },
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.2s ease",
        slideDownAndFadeIn: "slideDownAndFadeIn 0.2s ease",
        slideRightAndFadeIn: "slideRightAndFadeIn 0.2s ease",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
};
