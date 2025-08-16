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
            maxWidth: '65ch',
            color: theme('colors.gray.800'),
            a: {
              color: theme('colors.brand.700'),
              textDecoration: 'underline',
              fontWeight: '600',
              '&:hover': { color: theme('colors.brand.800') }
            },
            h1: { fontWeight: '800', letterSpacing: '-0.02em' },
            h2: { fontWeight: '700', marginTop: '1.6em', marginBottom: '0.6em' },
            h3: { fontWeight: '700', marginTop: '1.4em', marginBottom: '0.5em' },
            p: { lineHeight: '1.75' },
            blockquote: { borderLeftColor: theme('colors.brand.600') },
            'blockquote p::before': { content: 'none' },
            'blockquote p::after': { content: 'none' },
            hr: { borderColor: theme('colors.gray.200') },
            code: { backgroundColor: theme('colors.gray.100'), padding: '0.15rem 0.35rem', borderRadius: '0.25rem' },
            'pre code': { backgroundColor: 'transparent', padding: 0 },
            img: { borderRadius: '0.75rem', marginTop: '1rem', marginBottom: '1rem' },
            ul: { paddingLeft: '1.25rem' },
            ol: { paddingLeft: '1.25rem' },
            strong: { color: theme('colors.gray.900') },
            figcaption: { color: theme('colors.gray.500'), textAlign: 'center' }
          }
        }
      })
    }
  },
  plugins: [require("@tailwindcss/typography")]
};
