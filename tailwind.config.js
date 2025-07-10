const { fontFamily } = require("tailwindcss/defaultTheme")

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  // Add the safelist property here
  safelist: [
    // Dynamically generated background colors for LoadingBall
    'bg-shelivery-primary-yellow',
    'bg-shelivery-primary-blue',
    'bg-shelivery-white', // If you use white for bg-
    'bg-shelivery-background-gray',
    'bg-shelivery-error-red',
    'bg-shelivery-success-green',
    'bg-shelivery-warning-orange',
    'bg-shelivery-text-primary', // If you use these as bg-
    'bg-shelivery-text-secondary',
    'bg-shelivery-text-tertiary',
    'bg-shelivery-text-disabled',
    'bg-shelivery-badge-red-bg',
    'bg-shelivery-badge-blue-bg',
    'bg-shelivery-badge-green-bg',
    'bg-shelivery-button-secondary-bg',
    'bg-shelivery-card-background',
    'bg-shelivery-card-border',
    // Add any other dynamic color classes you might use, e.g., text- or border-
    'text-shelivery-primary-yellow',
    'text-shelivery-primary-blue',
    'text-shelivery-white',
    'text-shelivery-background-gray',
    'text-shelivery-error-red',
    'text-shelivery-success-green',
    'text-shelivery-warning-orange',
    'text-shelivery-text-primary',
    'text-shelivery-text-secondary',
    'text-shelivery-text-tertiary',
    'text-shelivery-text-disabled',
    'text-shelivery-badge-red-text',
    'text-shelivery-badge-blue-text',
    'text-shelivery-badge-green-text',
    // You might also want to safelist sizes if they are dynamic, e.g., h-2, h-3, h-4, w-2, w-3, w-4
    'h-2', 'w-2', 'h-3', 'w-3', 'h-4', 'w-4',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        shelivery: {
          'primary-yellow': '#FFDB0D',
          'primary-blue': '#245B7B',
          white: '#FFFFFF',
          'background-gray': '#EAE4E4',
          'error-red': '#F04438',
          'success-green': '#12B76A',
          'warning-orange': '#FF9807',
          'text-primary': '#111827',
          'text-secondary': '#374151',
          'text-tertiary': '#6B7280',
          'text-disabled': '#D5D7DA',
          'badge-red-bg': '#FEF3F2',
          'badge-red-border': '#FFECEE',
          'badge-red-text': '#B42318',
          'badge-blue-bg': '#EFF8FF',
          'badge-blue-border': '#D8F0FE',
          'badge-blue-text': '#175CD3',
          'badge-green-bg': '#ECFDF3',
          'badge-green-border': '#D1FADF',
          'badge-green-text': '#027A48',
          'button-secondary-bg': '#FFF5C0',
          'button-secondary-border': '#FFEF95',
          'card-background': '#FFFADF',
          'card-border': '#E5E8EB'
        },
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        'shelivery-sm': '8px',
        'shelivery-md': '16px',
        'shelivery-lg': '20px',
        'shelivery-xl': '30px',
        'shelivery-full': '100px'
      },
      spacing: {
        'shelivery-1': '4px',
        'shelivery-2': '8px',
        'shelivery-3': '12px',
        'shelivery-4': '16px',
        'shelivery-5': '20px',
        'shelivery-6': '24px',
        'shelivery-8': '32px',
        'shelivery-10': '40px'
      },
      fontFamily: {
        sans: [
          'var(--font-sans)',
          ...fontFamily.sans
        ],
        inter: [
          'Inter',
          'sans-serif'
        ],
        poppins: [
          'Poppins',
          'sans-serif'
        ]
      },
      boxShadow: {
        'shelivery-sm': '0px 1px 2px 0px rgba(10, 13, 18, 0.05)',
        'shelivery-md': '0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
        'shelivery-lg': '0px 2px 4px -2px rgba(10, 13, 18, 0.06), 0px 4px 8px -2px rgba(10, 13, 18, 0.1)'
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: 0
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: 0
          }
        },
        'fade-in': {
          '0%': {
            opacity: 0
          },
          '100%': {
            opacity: 1
          }
        },
        'slide-in': {
          '0%': {
            transform: 'translateY(100%)'
          },
          '100%': {
            transform: 'translateY(0)'
          }
        },
        'pulse-ring': {
          '0%': {
            transform: 'scale(0.33)'
          },
          '40%, 50%': {
            opacity: 1
          },
          '100%': {
            opacity: 0,
            transform: 'scale(1)'
          }
        },
        'progress-fill': {
          '0%': {
            transform: 'scaleX(0)'
          },
          '100%': {
            transform: 'scaleX(1)'
          }
        },
        'bounce-gentle': {
          '0%, 100%': {
            transform: 'translateY(-2px)'
          },
          '50%': {
            transform: 'translateY(0px)'
          }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'pulse-ring': 'pulse-ring 1.25s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
        'progress-fill': 'progress-fill 0.5s ease-out',
        'bounce-gentle': 'bounce-gentle 1s ease-in-out infinite'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
}
