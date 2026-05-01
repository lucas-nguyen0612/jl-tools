import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'jl-bg': 'var(--jl-bg)',
        'jl-bg-raised': 'var(--jl-bg-raised)',
        'jl-bg-sunken': 'var(--jl-bg-sunken)',
        'jl-line': 'var(--jl-line)',
        'jl-text': 'var(--jl-text)',
        'jl-text-soft': 'var(--jl-text-soft)',
        'jl-text-faint': 'var(--jl-text-faint)',
        'jl-accent': 'var(--jl-accent)',
        'jl-accent-strong': 'var(--jl-accent-strong)',
        'jl-accent-soft': 'var(--jl-accent-soft)',
        'jl-accent-ink': 'var(--jl-accent-ink)',
        'jl-success': 'var(--jl-success)',
        'jl-warn': 'var(--jl-warn)',
        'jl-danger': 'var(--jl-danger)',
        'jl-info': 'var(--jl-info)',
        'jl-epic': 'var(--jl-epic)',
        'jl-common': 'var(--jl-common)',
        'jl-uncommon': 'var(--jl-uncommon)',
        'jl-rare': 'var(--jl-rare)',
        'jl-legendary': 'var(--jl-legendary)',
        'jl-mythic': 'var(--jl-mythic)',
        // shadcn/ui semantic colors
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
      },
      borderRadius: {
        'jl-sm': 'var(--jl-r-sm)',
        'jl': 'var(--jl-r)',
        'jl-lg': 'var(--jl-r-lg)',
        'jl-xl': 'var(--jl-r-xl)',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--jl-font-sans)'],
        display: ['var(--jl-font-display)'],
        mono: ['var(--jl-font-mono)'],
      },
      spacing: {
        jl: 'var(--jl-p)',
      },
      boxShadow: {
        'jl-sm': 'var(--jl-shadow-sm)',
        'jl': 'var(--jl-shadow)',
        'jl-lg': 'var(--jl-shadow-lg)',
      },
      keyframes: {
        'xp-slide-up': {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-60px)', opacity: '0' },
        },
        'level-up-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
      animation: {
        'xp-slide-up': 'xp-slide-up 1.5s ease-out forwards',
        'level-up-pulse': 'level-up-pulse 0.6s ease-in-out',
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require('tailwindcss-animate')],
}

export default config
