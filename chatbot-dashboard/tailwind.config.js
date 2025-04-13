/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
      },
      colors: {
        'glass-dark': 'rgba(255, 255, 255, 0.05)',
        'glass-light': 'rgba(255, 255, 255, 0.15)',
        'deep-purple': '#1e003e',
        'astro-glass': 'rgba(255, 255, 255, 0.06)',
        'violet-glow': '#8e2de2',
      },
      boxShadow: {
        'glow': '0 0 40px rgba(138,43,226,0.3)',
        'glow-md': '0 0 25px rgba(138,43,226,0.4)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'radial-gradient(ellipse at center, rgba(138,43,226,0.2), transparent 70%)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 30px rgba(138,43,226,0.3)' },
          '50%': { boxShadow: '0 0 60px rgba(138,43,226,0.6)' },
        },
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        pulseGlow: 'pulseGlow 3s ease-in-out infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/line-clamp')],
}

