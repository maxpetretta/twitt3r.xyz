module.exports = {
  content: ["./pages/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        twitter: {
          blue: "#4E98EC",
          gray: "#17202A",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "system-ui",
          "sans-serif",
        ],
        serif: ["-apple-system-ui-serif", "ui-serif", "serif"],
        mono: ["ui-monospace", "mono"],
      },
      spacing: {
        128: "32rem",
        160: "40rem",
      },
    },
  },
  plugins: [],
}
