import * as React from 'react'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input({ className = '', label, error, ...props }, ref) {
    const base =
      'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors'
    const errorClass = error ? ' border-red-500' : ''
    const classes = base + errorClass + ' ' + className

    return (
      <div>
        {label ? (
          <label className="block text-sm font-medium mb-1">{label}</label>
        ) : null}
        <input ref={ref} className={classes} {...props} />
        {error ? <p className="text-red-500 text-sm mt-1">{error}</p> : null}
      </div>
    )
  }
)

Input.displayName = 'Input'
