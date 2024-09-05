const { transform } = require("typescript");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Tailwind CSS가 스타일을 적용할 파일 경로
  ],
  theme: {
    extend: {
      transitionProperty: {
        width: "width",
      },
      keyframes: {
        slideInFromRightToLeft: {
          "0%": {
            transform: "translateX(100%)",
            opacity: "0",
          },
          "100%": {
            transform: "translateX(0)",
            opacity: "1",
          },
        },
      },
      animation: {
        slideInFromRightToLeft:
          "slideInFromRightToLeft 1s ease-in-out forwards",
      },
    },
  },
  plugins: [],
  // 모바일에선 hover 스타일 막기
  future: {
    hoverOnlyWhenSupported: true,
  },
};
