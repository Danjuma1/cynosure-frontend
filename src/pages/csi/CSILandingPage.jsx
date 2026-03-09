import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BuildingLibraryIcon,
  MapPinIcon,
  ChevronRightIcon,
  ScaleIcon,
} from '@heroicons/react/24/outline'

const categories = [
  {
    id: 'federal',
    title: 'Federal Courts',
    description:
      'Supreme Court, Court of Appeal, Federal High Court, National Industrial Court, and other federal judicial institutions.',
    href: '/csi/federal',
    icon: ScaleIcon,
    badge: 'Active',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    courts: [
      'Court of Appeal (CA)',
      'Federal High Court (FHC)',
      'National Industrial Court (NICN)',
      'Supreme Court',
      'High Court of FCT',
    ],
    color: 'from-emerald-50 to-teal-50',
    borderColor: 'border-emerald-200 hover:border-emerald-400',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-700',
    chevronColor: 'text-emerald-600',
  },
  {
    id: 'state',
    title: 'State Courts',
    description:
      'State High Courts, Sharia Courts of Appeal, Customary Courts of Appeal, Magistrate Courts, and Area Courts across all 36 states.',
    href: '/csi/state',
    icon: MapPinIcon,
    badge: 'Active',
    badgeColor: 'bg-purple-100 text-purple-700',
    courts: [
      'State High Courts',
      'Sharia Court of Appeal',
      'Customary Court of Appeal',
      'Magistrate Courts',
      'Area Courts',
    ],
    color: 'from-purple-50 to-violet-50',
    borderColor: 'border-purple-200 hover:border-purple-400',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-700',
    chevronColor: 'text-purple-600',
  },
]

export default function CSILandingPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <BuildingLibraryIcon className="h-6 w-6 text-emerald-700" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-charcoal-900">
              Court Sitting Information
            </h1>
            <p className="text-gray-500 text-sm">CSI</p>
          </div>
        </div>
        <p className="text-gray-600 mt-2 max-w-2xl">
          Access real-time court sitting schedules, cause lists, and hearing information
          for courts across Nigeria. Select a court category to get started.
        </p>
      </motion.div>

      {/* Category Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {categories.map((category, i) => {
          const Icon = category.icon

          const card = (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl border-2 bg-gradient-to-br ${category.color} ${
                category.disabled
                  ? 'opacity-60 cursor-not-allowed ' + category.borderColor
                  : 'cursor-pointer ' + category.borderColor
              } p-6 transition-all duration-200 group`}
            >
              {/* Badge */}
              <span
                className={`absolute top-4 right-4 text-xs font-semibold px-2.5 py-1 rounded-full ${category.badgeColor}`}
              >
                {category.badge}
              </span>

              {/* Icon & Title */}
              <div className="flex items-start gap-4 mb-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${category.iconBg}`}
                >
                  <Icon className={`h-7 w-7 ${category.iconColor}`} />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-charcoal-900">
                    {category.title}
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">{category.description}</p>
                </div>
              </div>

              {/* Court List Preview */}
              <ul className="space-y-1.5 mb-6">
                {category.courts.map((court) => (
                  <li key={court} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                    {court}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div
                className={`flex items-center gap-2 text-sm font-semibold ${
                  category.disabled ? 'text-gray-400' : category.iconColor
                }`}
              >
                {category.disabled ? (
                  'Available soon'
                ) : (
                  <>
                    View Courts
                    <ChevronRightIcon
                      className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${category.chevronColor}`}
                    />
                  </>
                )}
              </div>
            </motion.div>
          )

          return category.disabled ? (
            <div key={category.id}>{card}</div>
          ) : (
            <Link to={category.href} key={category.id}>
              {card}
            </Link>
          )
        })}
      </div>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3"
      >
        <div className="w-5 h-5 rounded-full bg-amber-400 flex-shrink-0 mt-0.5 flex items-center justify-center">
          <span className="text-white text-xs font-bold">i</span>
        </div>
        <div>
          <p className="text-sm font-medium text-amber-800">Currently Available</p>
          <p className="text-sm text-amber-700 mt-0.5">
            Court Sitting Information is currently available for federal courts — specifically the{' '}
            <strong>Court of Appeal (CA)</strong>,{' '}
            <strong>Federal High Court (FHC)</strong>, and{' '}
            <strong>National Industrial Court (NICN)</strong>. More courts will be added progressively.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
