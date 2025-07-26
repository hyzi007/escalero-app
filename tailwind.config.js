/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'fadeInSlide': 'fadeInSlide 0.6s ease-out',
        'slideInScale': 'slideInScale 0.8s ease-out',
        'slideInLeft': 'slideInLeft 0.6s ease-out',
        'dialogBounceIn': 'dialogBounceIn 0.5s ease-out',
        'slideInUp': 'slideInUp 0.4s ease-out',
      },
      keyframes: {
        fadeInSlide: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInScale: {
          '0%': { opacity: '0', transform: 'translateY(-50px) scale(0.8)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-50px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        dialogBounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3) rotate(-10deg)' },
          '50%': { opacity: '1', transform: 'scale(1.1) rotate(5deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(0deg)' },
        },
        slideInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px) scale(0.8)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}