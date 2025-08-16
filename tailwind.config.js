/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: { 50:"#ecfdf5",100:"#d1fae5",600:"#059669",700:"#047857",800:"#065f46" }
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            color: theme("colors.gray.800"),
            a: {
              color: theme("colors.brand.700"),
              fontWeight: "600",
              textDecoration: "underline",
              textDecorationThickness: "0.08em",
              textUnderlineOffset: "3px",
              "&:hover": { color: theme("colors.brand.800") }
            },
            img: { borderRadius: "0.75rem", marginTop: "1rem", marginBottom: "1rem" },
            hr: { borderColor: theme("colors.gray.200") },
            code: { backgroundColor: theme("colors.gray.100"), padding: "0.15rem 0.35rem", borderRadius: "0.25rem" },
            "pre code": { backgroundColor: "transparent", padding: 0 },
            strong: { color: theme("colors.gray.900") },
          }
        },
        article: {
          css: {
            maxWidth: "72ch",
            p: { fontSize: "1rem", lineHeight: "1.85" },
            li: { lineHeight: "1.75" },
            h1: { fontWeight: "800", fontSize: "2rem", letterSpacing: "-0.015em", marginBottom: "0.5em" },
            h2: { fontWeight: "700", fontSize: "1.25rem", marginTop: "1.6em", marginBottom: "0.7em" },
            h3: { fontWeight: "700", fontSize: "1.05rem", marginTop: "1.2em", marginBottom: "0.5em" },
            "ul > li::marker": { color: theme("colors.gray.400") },
            "ol > li::marker": { color: theme("colors.gray.400") },
            blockquote: {
              borderLeftColor: theme("colors.brand.600"),
              color: theme("colors.gray.700"),
              fontStyle: "italic"
            },
          }
        }
      })
    }
  },
  plugins: [require("@tailwindcss/typography")]
};
