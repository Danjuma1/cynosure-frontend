import { useState, useCallback } from 'react'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { cn, debounce } from '@/utils/helpers'

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  debounceMs = 300,
  className,
  onClear,
  ...props
}) {
  const [localValue, setLocalValue] = useState(value || '')

  const debouncedOnChange = useCallback(
    debounce((val) => {
      onChange?.(val)
    }, debounceMs),
    [onChange, debounceMs]
  )

  const handleChange = (e) => {
    const newValue = e.target.value
    setLocalValue(newValue)
    debouncedOnChange(newValue)
  }

  const handleClear = () => {
    setLocalValue('')
    onChange?.('')
    onClear?.()
  }

  return (
    <div className={cn('relative', className)}>
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="input-field pl-10 pr-10"
        {...props}
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100"
        >
          <XMarkIcon className="h-4 w-4 text-gray-400" />
        </button>
      )}
    </div>
  )
}
