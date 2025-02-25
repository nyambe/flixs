/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          primary: {
            DEFAULT: 'hsl(var(--p) var(--ps) var(--pl))',
            focus: 'hsl(var(--p) var(--ps) calc(var(--pl) - 10%))',
            content: 'hsl(var(--p) var(--ps) 10%)' // Darker for contrast
          },
          secondary: {
            DEFAULT: 'hsl(var(--s) var(--ss) var(--sl))',
            focus: 'hsl(var(--s) var(--ss) calc(var(--sl) - 10%))',
            content: 'hsl(var(--s) var(--ss) 10%)' // Darker for contrast
          },
          accent: {
            DEFAULT: 'hsl(var(--a) var(--as) var(--al))',
            focus: 'hsl(var(--a) var(--as) calc(var(--al) - 10%))',
            content: 'hsl(var(--a) var(--as) 10%)' // Darker for contrast
          },
          neutral: {
            DEFAULT: 'hsl(var(--n) var(--ns) var(--nl))',
            focus: 'hsl(var(--n) var(--ns) calc(var(--nl) - 10%))',
            content: 'hsl(var(--n) var(--ns) 95%)' // Lighter for contrast
          },
          complementary: {
            DEFAULT: 'hsl(var(--c) var(--cs) var(--cl))',
            focus: 'hsl(var(--c) var(--cs) calc(var(--cl) - 10%))',
            content: 'hsl(var(--c) var(--cs) 95%)' // Lighter for contrast
          }
        }
      }
    },
    plugins: [],
  }