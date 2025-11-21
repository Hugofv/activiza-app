/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontSize: {
        'h1': '36px',
        'h2': '30px',
        'h3': '24px',
        'h4': '20px',
        'h5': '18px',
        'h6': '16px',
        'subtitle': '20px',
        'body1': '16px',
        'body2': '14px',
        'caption': '12px',
        'lead': '20px',
        'large': '18px',
      },
      lineHeight: {
        'h1': '40px',
        'h2': '36px',
        'h3': '32px',
        'h4': '28px',
        'h5': '26px',
        'h6': '24px',
        'subtitle': '28px',
        'body1': '24px',
        'body2': '20px',
        'caption': '16px',
        'lead': '28px',
        'large': '26px',
      },
      fontFamily: {
        sans: ['Inter_400Regular', 'system-ui', 'sans-serif'],
        medium: ['Inter_500Medium', 'system-ui', 'sans-serif'],
        semibold: ['Inter_600SemiBold', 'system-ui', 'sans-serif'],
        bold: ['Inter_700Bold', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
};
