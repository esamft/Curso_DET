/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF9600',
          dark: '#FF8000',
        },
        secondary: {
          DEFAULT: '#2196F3',
          dark: '#1976D2',
        },
        success: {
          DEFAULT: '#58CC02',
          dark: '#48A802',
        },
        purple: {
          DEFAULT: '#667eea',
          dark: '#764ba2',
        },
        danger: {
          DEFAULT: '#F44336',
          dark: '#D32F2F',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.5s ease forwards',
        'fade-in-down': 'fadeInDown 0.6s ease forwards',
        'scale-in': 'scaleIn 0.8s ease 0.2s both',
        'slide-in': 'slideIn 1s ease 0.5s both',
        'bounce-slow': 'bounce 1s ease infinite',
        'pulse-slow': 'pulse 2s ease infinite',
      },
      keyframes: {
        fadeInUp: {
          'from': { opacity: '0', transform: 'translateY(30px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          'from': { opacity: '0', transform: 'translateY(-30px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          'from': { opacity: '0', transform: 'scale(0.9)' },
          'to': { opacity: '1', transform: 'scale(1)' },
        },
        slideIn: {
          'from': { opacity: '0', left: '0' },
          'to': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
