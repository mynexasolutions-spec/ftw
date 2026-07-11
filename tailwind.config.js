/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary, #CCFF00)', /* High-contrast neon green accent */
        accent: 'var(--accent, #FF4E20)',  /* High-energy streetwear orange */
        dark: '#0B0B0B',    /* Deep rich black for dark text & heavy buttons */
        dark2: '#1C1C1C',   /* Dark charcoal text */
        dark3: '#2D2D2D',   /* Muted text/borders */
        cream: '#FFFFFF',   /* Clean white background */
        cream2: '#FAF9F6',  /* Warm off-white */
        cream3: '#F3F2EE',  /* Light grey-cream border/background elements */
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Orbitron', 'Rajdhani', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Rajdhani', 'Inter', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 4px 30px rgba(0,0,0,0.04)',
        'card-hover': '0 20px 40px rgba(0,0,0,0.08)',
        glow: '0 0 20px rgba(204,255,0,0.3)',
        'glow-primary': '0 0 20px rgba(204,255,0,0.35)',
        'glow-accent': '0 0 20px rgba(255,78,32,0.35)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
