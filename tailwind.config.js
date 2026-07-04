/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
 
    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        tertiary: 'var(--tertiary)',
        'neutral-dark': 'var(--neutral)',
        'warm-bg': 'var(--warm-bg)',
        'warm-text': 'var(--warm-text)',
        'warm-muted': 'var(--warm-muted)',
        
        // Auth Palette
        'auth-primary': 'var(--auth-primary)',
        'auth-secondary': 'var(--auth-secondary)',
        'auth-tertiary': 'var(--auth-tertiary)',
        'auth-neutral': 'var(--auth-neutral)',
        'auth-bg': 'var(--auth-bg)',
        'auth-card': 'var(--auth-card)',
        'auth-text': 'var(--auth-text)',
        'auth-muted': 'var(--auth-muted)',
      },
    },
  },
  plugins: [],
}