import { forwardRef } from 'react'
import { cn } from '@/utils/helpers'
import { motion } from 'framer-motion'

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
  outline: `inline-flex items-center justify-center px-5 py-2.5
            border-2 border-emerald-700 text-emerald-700 font-medium rounded-lg
            hover:bg-emerald-700 hover:text-white
            active:scale-[0.98] transition-all duration-200`,
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-6 py-3 text-lg',
}

const Button = forwardRef(({
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  children,
  leftIcon,
  rightIcon,
  as: asProp = 'button',
  animate = true,
  ...props
}, ref) => {
  // Use motion wrapper for the specified component when animate is true
  const Component = animate 
    ? (asProp === 'button' ? motion.button : motion(asProp))
    : asProp
  
  const motionProps = animate ? {
    whileHover: { scale: disabled ? 1 : 1.02 },
    whileTap: { scale: disabled ? 1 : 0.98 },
    transition: { duration: 0.1 },
  } : {}

  // Filter out disabled prop for non-button elements (like Link)
  const elementProps = asProp === 'button' 
    ? { disabled: disabled || isLoading, ...props }
    : props

  return (
    <Component
      ref={ref}
      className={cn(
        variants[variant],
        sizes[size],
        isLoading && 'opacity-70 cursor-wait',
        (disabled || isLoading) && 'pointer-events-none opacity-70',
        className
      )}
      {...motionProps}
      {...elementProps}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </>
      ) : (
        <>
          {leftIcon && <span className="mr-2 -ml-1">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2 -mr-1">{rightIcon}</span>}
        </>
      )}
    </Component>
  )
})

Button.displayName = 'Button'

export default Button
