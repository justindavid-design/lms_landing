module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        lmsgreen: '#6e8f73',
        primary: '#688668',
        accent: '#0ea5a4',
        neutral: {
          DEFAULT: '#111827',
          muted: '#6b7280'
        },
        surface: '#ffffff'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial']
      }
    }
  },
  plugins: [],
}
