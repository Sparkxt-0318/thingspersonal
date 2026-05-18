/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        things: {
          blue: '#2B7FFF',
          inbox: '#5A8DEE',
          today: '#FFC107',
          upcoming: '#FF5C5C',
          anytime: '#1FB6B6',
          someday: '#C9A66B',
          logbook: '#4CB782',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Text',
          'SF Pro Display',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        popover: '0 4px 24px rgba(0,0,0,0.14), 0 1px 3px rgba(0,0,0,0.08)',
        editor: '0 2px 16px rgba(0,0,0,0.10), 0 0 0 0.5px rgba(0,0,0,0.05)',
      },
      transitionTimingFunction: {
        things: 'cubic-bezier(0.32, 0.72, 0, 1)',
      },
    },
  },
  plugins: [],
}
