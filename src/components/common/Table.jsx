import { cn } from '@/utils/helpers'

export function Table({ className, children, ...props }) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="min-w-full divide-y divide-gray-200" {...props}>
        {children}
      </table>
    </div>
  )
}

export function TableHeader({ className, children, ...props }) {
  return (
    <thead className={cn('bg-gray-50', className)} {...props}>
      {children}
    </thead>
  )
}

export function TableBody({ className, children, ...props }) {
  return (
    <tbody
      className={cn('bg-white divide-y divide-gray-100', className)}
      {...props}
    >
      {children}
    </tbody>
  )
}

export function TableRow({ className, clickable = false, children, ...props }) {
  return (
    <tr
      className={cn(
        'transition-colors',
        clickable && 'cursor-pointer hover:bg-gray-50',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  )
}

export function TableHead({ className, children, sortable, sorted, ...props }) {
  return (
    <th
      className={cn(
        'px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider',
        sortable && 'cursor-pointer hover:text-gray-900',
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortable && (
          <span className="text-gray-400">
            {sorted === 'asc' && '↑'}
            {sorted === 'desc' && '↓'}
            {!sorted && '↕'}
          </span>
        )}
      </div>
    </th>
  )
}

export function TableCell({ className, children, ...props }) {
  return (
    <td
      className={cn('px-6 py-4 whitespace-nowrap text-sm', className)}
      {...props}
    >
      {children}
    </td>
  )
}

export function TableEmpty({ colSpan, message = 'No data found' }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-6 py-12 text-center text-gray-500"
      >
        <div className="flex flex-col items-center">
          <svg
            className="w-12 h-12 text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p>{message}</p>
        </div>
      </td>
    </tr>
  )
}

export default Table
