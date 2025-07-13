import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'wechat-green': '#07c160',
        'wechat-green-dark': '#06ad56',
        'wechat-bg': '#ededed',
        'wechat-card': '#ffffff',
        'wechat-text': '#191919',
        'wechat-text-secondary': '#888888',
        'wechat-border': '#e5e5e5',
      },
      fontFamily: {
        'wechat': ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config