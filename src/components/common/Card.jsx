import { cn } from '@/utils/helpers'
import { motion } from 'framer-motion'

export function Card({
  className,
  children,
  hover = false,
  glass = false,
  padding = 'default',
  animate = false,
  ...props
}) {
  const Component = animate ? motion.div : 'div'
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
  }

  const motionProps = animate ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  } : {}

  return (
    <Component
      className={cn(
        glass ? 'glass-card' : 'card',
        hover && 'card-hover cursor-pointer',
        paddingClasses[padding],
        className
      )}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  )
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div
      className={cn('flex items-center justify-between mb-4', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3
      className={cn('text-lg font-semibold text-charcoal-900', className)}
      {...props}
    >
      {children}
    </h3>
  )
}

export function CardDescription({ className, children, ...props }) {
  return (
    <p className={cn('text-sm text-gray-500', className)} {...props}>
      {children}
    </p>
  )
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card
