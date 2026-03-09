import { cn } from '@/utils/helpers'

const sizes = {
  xs: 'h-6 w-6 text-xs',
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-12 w-12 text-lg',
  xl: 'h-16 w-16 text-xl',
}

export default function Avatar({
  src,
  alt,
  name,
  size = 'md',
  className,
  ...props
}) {
  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?'

  if (src) {
    return (
      <img
        src={src}
        alt={alt || name}
        className={cn(
          'rounded-full object-cover bg-gray-100',
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }

  return (
    <div
      className={cn(
        'rounded-full bg-gradient-brand text-white font-medium flex items-center justify-center',
        sizes[size],
        className
      )}
      {...props}
    >
      {initials}
    </div>
  )
}

export function AvatarGroup({ avatars, max = 4, size = 'md' }) {
  const visible = avatars.slice(0, max)
  const remaining = avatars.length - max

  return (
    <div className="flex -space-x-2">
      {visible.map((avatar, i) => (
        <Avatar
          key={i}
          {...avatar}
          size={size}
          className="ring-2 ring-white"
        />
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            'rounded-full bg-gray-200 text-gray-600 font-medium flex items-center justify-center ring-2 ring-white',
            sizes[size]
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  )
}
