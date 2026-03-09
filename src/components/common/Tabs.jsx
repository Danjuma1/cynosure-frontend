import { cn } from '@/utils/helpers'

export default function Tabs({
  tabs,
  activeTab,
  onChange,
  className,
  variant = 'default',
}) {
  const variants = {
    default: {
      container: 'border-b border-gray-200',
      tab: 'px-4 py-2.5 -mb-px border-b-2 font-medium text-sm transition-colors',
      active: 'border-emerald-700 text-emerald-700',
      inactive: 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
    },
    pills: {
      container: 'bg-gray-100 p-1 rounded-lg inline-flex',
      tab: 'px-4 py-2 rounded-md font-medium text-sm transition-all',
      active: 'bg-white text-emerald-700 shadow-sm',
      inactive: 'text-gray-600 hover:text-gray-900',
    },
    buttons: {
      container: 'flex gap-2',
      tab: 'px-4 py-2 rounded-lg font-medium text-sm transition-all border',
      active: 'bg-emerald-700 text-white border-emerald-700',
      inactive: 'bg-white text-gray-600 border-gray-200 hover:border-gray-300',
    },
  }

  const styles = variants[variant]

  return (
    <div className={cn(styles.container, className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            styles.tab,
            activeTab === tab.id ? styles.active : styles.inactive
          )}
        >
          {tab.icon && <span className="mr-2">{tab.icon}</span>}
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={cn(
                'ml-2 px-2 py-0.5 rounded-full text-xs',
                activeTab === tab.id
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-200 text-gray-600'
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
