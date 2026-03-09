import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BuildingLibraryIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  MapPinIcon,
  LockClosedIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline'
import { Card } from '@/components/common'
import { FHC_DIVISIONS } from '@/data/csi/fhcData'

export default function FHCDivisionsPage() {
  const active = FHC_DIVISIONS.filter((d) => d.active)
  const inactive = FHC_DIVISIONS.filter((d) => !d.active)

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <motion.nav
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2 text-sm text-gray-500"
      >
        <Link to="/csi" className="hover:text-emerald-700">CSI</Link>
        <span>/</span>
        <Link to="/csi/federal" className="hover:text-emerald-700">Federal Courts</Link>
        <span>/</span>
        <span className="text-charcoal-900 font-medium">Federal High Court</span>
      </motion.nav>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <BuildingLibraryIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-display font-bold text-charcoal-900">
                Federal High Court
              </h1>
              <span className="text-xs font-bold text-white bg-blue-600 px-2 py-0.5 rounded">FHC</span>
            </div>
            <p className="text-gray-500 text-sm">
              {active.length} of {FHC_DIVISIONS.length} judicial divisions available
            </p>
          </div>
        </div>
        <p className="text-gray-600 mt-2 text-sm">
          The Federal High Court has judicial divisions across all states. Select a division
          to view its judges and their daily cause lists.
        </p>
      </motion.div>

      {/* Active Divisions */}
      <section>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Available Divisions
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {active.map((division, i) => (
            <motion.div
              key={division.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link to={`/csi/federal/FHC/${division.id}`}>
                <Card className="p-5 h-full hover:shadow-card-hover hover:border-blue-200 transition-all group border-blue-100">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                        <BuildingLibraryIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                        <CheckBadgeIcon className="h-3 w-3" />
                        Live
                      </span>
                    </div>
                    <ChevronRightIcon className="h-5 w-5 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h3 className="font-semibold text-charcoal-900 group-hover:text-blue-700 transition-colors">
                    {division.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">{division.state}</p>
                  {division.location && (
                    <div className="flex items-start gap-1.5 mt-2">
                      <MapPinIcon className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-gray-500 leading-snug">{division.location}</p>
                    </div>
                  )}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs text-blue-600 font-medium">View Judges & Cause Lists →</span>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="border-t border-dashed border-gray-200" />

      {/* Inactive */}
      <section>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Coming Soon — {inactive.length} more divisions
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {inactive.map((division, i) => (
            <motion.div
              key={division.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.03 }}
            >
              <div className="flex items-center justify-between p-3 rounded-lg border border-dashed border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center">
                    <BuildingLibraryIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium leading-tight">{division.name}</p>
                    <p className="text-xs text-gray-400">{division.state}</p>
                  </div>
                </div>
                <LockClosedIcon className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <div>
        <Link to="/csi/federal" className="flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-700 w-fit">
          <ChevronLeftIcon className="h-4 w-4" />
          Back to Federal Courts
        </Link>
      </div>
    </div>
  )
}
