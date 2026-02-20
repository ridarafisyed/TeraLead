import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f8ff',
          100: '#e8f0ff',
          500: '#2f6fed',
          600: '#2354b3',
          900: '#172f63'
        }
      }
    }
  },
  plugins: []
} satisfies Config;
