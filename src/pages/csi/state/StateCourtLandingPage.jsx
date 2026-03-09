import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  MapPinIcon,
  BuildingLibraryIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ScaleIcon,
} from '@heroicons/react/24/outline'

const categories = [
  {
    id: 'high-court',
    title: 'State High Courts',
    description:
      'Unlimited civil and criminal jurisdiction over matters arising within each state. Includes 36 State High Courts plus the FCT High Court.',
    href: '/csi/state/high-court',
    icon: ScaleIcon,
    color: 'from-purple-50 to-violet-50',
    border: 'border-purple-200 hover:border-purple-400',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-700',
    count: '36 States + FCT',
  },
  {
    id: 'magistrate',
    title: 'Magistrate Courts',
    description:
      'Courts of limited jurisdiction handling civil and criminal matters below the threshold of the High Court, across all 36 states and FCT.',
    href: '/csi/state/magistrate',
    icon: BuildingLibraryIcon,
    color: 'from-teal-50 to-cyan-50',
    border: 'border-teal-200 hover:border-teal-400',
    iconBg: 'bg-teal-100',
    iconColor: 'text-teal-700',
    count: '36 States + FCT',
  },
]

export default function StateCourtLandingPage() {
  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <motion.nav
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2 text-sm text-gray-500"
      >
        <Link to="/csi" className="hover:text-emerald-700">CSI</Link>
        <span>/</span>
        <span className="text-charcoal-900 font-medium">State Courts</span>
      </motion.nav>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <MapPinIcon className="h-6 w-6 text-purple-700" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-charcoal-900">State Courts</h1>
            <p className="text-gray-500 text-sm">Select a court type to browse sitting information</p>
          </div>
        </div>
      </motion.div>

      {/* Category Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {categories.map((cat, i) => {
          const Icon = cat.icon
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link to={cat.href}>
                <div
                  className={`rounded-2xl border-2 bg-gradient-to-br ${cat.color} ${cat.border} p-6 transition-all duration-200 group cursor-pointer`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${cat.iconBg}`}>
                      <Icon className={`h-7 w-7 ${cat.iconColor}`} />
                    </div>
                    <div>
                      <h2 className="text-xl font-display font-bold text-charcoal-900">{cat.title}</h2>
                      <p className="text-xs text-gray-400 mt-0.5">{cat.count}</p>
                      <p className="text-sm text-gray-600 mt-2">{cat.description}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 text-sm font-semibold ${cat.iconColor}`}>
                    Browse Courts
                    <ChevronRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </div>

      <div>
        <Link to="/csi" className="flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-700 w-fit">
          <ChevronLeftIcon className="h-4 w-4" />
          Back to CSI
        </Link>
      </div>
    </div>
  )
}
