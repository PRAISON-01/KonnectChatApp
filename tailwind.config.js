/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
      colors: {
        paper: '#f6f7f9',
        ink: '#0b0b0c',
        line: '#e3e6ea',
        muted: '#6b7280',
      },
    },
  },
  plugins: [],
};
