/** @type {import('tailwindcss').Config} */
module.exports = {
  corePlugins: { preflight: false },
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {}
  },
  plugins: [require('prettier-plugin-tailwindcss')],
  variants: {
    extend: {
      cursor: ['hover']
    }
  }
}
