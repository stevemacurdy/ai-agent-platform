import * as React from 'react'

type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className = '', variant = 'default', size = 'md', children, ...props },
    ref
  ) {
    const base =
      'inline-flex items-center justify-center rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'

    const variants: Record<ButtonVariant, string> = {
      default: 'bg-white text-black hover:bg-gray-100 focus:ring-white',
      secondary: 'bg-white/10 text-white hover:bg-white/20 focus:ring-white/50',
      outline:
        'border border-white/20 text-white hover:bg-white/10 focus:ring-white/50',
      ghost: 'text-white hover:bg-white/10 focus:ring-white/50',
    }

    const sizes: Record<ButtonSize, string> = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg',
    }

    return (
      <button
        ref={ref}
        className={
          base + ' ' + variants[variant] + ' ' + sizes[size] + ' ' + className
        }
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
