import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        black: '#000000',
        white: '#FFFFFF',
        gray: {
          50: '#F9F9F9',
          100: '#F3F3F3',
          200: '#E8E8E8',
          300: '#D1D1D1',
          400: '#A9A9A9',
          500: '#808080',
          600: '#585858',
          700: '#404040',
          800: '#282828',
          900: '#121212',
        },
      },
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
