module.exports = {
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    screens: {
      xs: "370px",
      ph: "410px",
      sm: "640px",
      md: "740px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        twitter: {
          blue: "#4E98EC",
          gray: "#17202A",
          pink: "#E73F82",
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
