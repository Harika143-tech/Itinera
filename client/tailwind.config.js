/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#F0F3F8',
          100: '#D9E1ED',
          200: '#B3C3DB',
          300: '#8DA5C9',
          400: '#5277AB',
          DEFAULT: '#1B2A4A', // Primary brand color
          600: '#16223D',
          700: '#121C31',
          800: '#0E1626',
          900: '#090E18',
        },
        marigold: {
          50: '#FDF8F0',
          100: '#FAF0DE',
          200: '#F4DDBC',
          300: '#EECB9A',
          400: '#E4A956',
          DEFAULT: '#D98A1F', // Single accent color
          600: '#C27615',
          700: '#A4610F',
          800: '#834C0A',
          900: '#643706',
        },
        bone: {
          light: '#FAF7F0',
          DEFAULT: '#F2ECDF', // Bone/ivory background
          dark: '#E7DFCFA',
          border: 'rgba(22, 35, 58, 0.12)',
        },
        ink: {
          DEFAULT: '#16233A', // Deep navy-ink text
          muted: '#4B5B75',
          subtle: '#7889A3',
          light: '#A5B3C7',
        },
        teal: {
          50: '#F0F6F6',
          100: '#D7E7E8',
          200: '#B0CFD1',
          DEFAULT: '#2F5D62', // Muted teal for rating chips and secondary tags
          600: '#264B4F',
          700: '#1E3B3E',
        },
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['Sora', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        pricing: '0 12px 36px -4px rgba(27, 42, 74, 0.16), 0 4px 12px -2px rgba(27, 42, 74, 0.08)',
        card: '0 6px 24px -2px rgba(22, 35, 58, 0.06), 0 2px 6px -1px rgba(22, 35, 58, 0.04)',
      },
    },
  },
  plugins: [],
};
