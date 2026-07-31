/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        blue: {
          DEFAULT: '#3B82F6',
          light: '#60A5FA',
          dark: '#2563EB',
        },
        surface: {
          DEFAULT: '#111111',
          container: '#1A1A1A',
          'container-low': '#161616',
          'container-high': '#1E1E1E',
          'container-highest': '#242424',
        },
        outline: {
          DEFAULT: '#2A2A2A',
          variant: '#333333',
        },
        'on-surface': {
          DEFAULT: '#FFFFFF',
          variant: '#A1A1AA',
        },
        primary: {
          DEFAULT: '#3B82F6',
        },
        'on-primary': '#FFFFFF',
        'secondary-container': '#1E293B',
        'on-secondary-container': '#93C5FD',
        error: '#EF4444',
      },
      borderRadius: {
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
