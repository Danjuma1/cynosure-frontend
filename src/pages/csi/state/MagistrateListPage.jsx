import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BuildingLibraryIcon,
  MapPinIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  LockClosedIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline'
import { Card } from '@/components/common'
import { NIGERIAN_STATES_LIST } from '@/data/csi/stateCourtData'

export default function MagistrateListPage() {
  const active   = NIGERIAN_STATES_LIST.filter((s) => s.magStatus === 'active')
  const partial  = NIGERIAN_STATES_LIST.filter((s) => s.magStatus === 'partial')
  const inactive = NIGERIAN_STATES_LIST.filter((s) => !s.magStatus)

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
        <Link to="/csi/state" className="hover:text-emerald-700">State Courts</Link>
        <span>/</span>
        <span className="text-charcoal-900 font-medium">Magistrate Courts</span>
      </motion.nav>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
            <BuildingLibraryIcon className="h-6 w-6 text-teal-700" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-charcoal-900">Magistrate Courts</h1>
            <p className="text-gray-500 text-sm">
              {active.length + partial.length} of {NIGERIAN_STATES_LIST.length} states available
            </p>
          </div>
        </div>
      </motion.div>

      {/* Active States */}
      {active.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Available States
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {active.map((state, i) => (
              <motion.div
                key={state.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Link to={`/csi/state/magistrate/${state.id}`}>
                  <Card className="p-5 h-full hover:shadow-card-hover hover:border-teal-200 transition-all group border-teal-100">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg bg-teal-100 flex items-center justify-center">
                          <BuildingLibraryIcon className="h-5 w-5 text-teal-600" />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                          <CheckBadgeIcon className="h-3 w-3" />
                          Live
                        </span>
                      </div>
                      <ChevronRightIcon className="h-5 w-5 text-gray-300 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <h3 className="font-semibold text-charcoal-900 group-hover:text-teal-700 transition-colors">
                      {state.name} Magistrate Court
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <MapPinIcon className="h-3.5 w-3.5" />
                      {state.capital}
                    </p>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <span className="text-xs text-teal-600 font-medium">View Divisions →</span>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Partial States */}
      {partial.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Partially Available
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {partial.map((state, i) => (
              <motion.div
                key={state.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Link to={`/csi/state/magistrate/${state.id}`}>
                  <Card className="p-5 h-full hover:shadow-card-hover hover:border-amber-200 transition-all group border-amber-100">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                          <BuildingLibraryIcon className="h-5 w-5 text-amber-600" />
                        </div>
                        <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          Partial
                        </span>
                      </div>
                      <ChevronRightIcon className="h-5 w-5 text-gray-300 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <h3 className="font-semibold text-charcoal-900 group-hover:text-amber-700 transition-colors">
                      {state.name} Magistrate Court
                    </h3>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <MapPinIcon className="h-3.5 w-3.5" />
                      {state.capital}
                    </p>
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <span className="text-xs text-amber-600 font-medium">View Available Divisions →</span>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      <div className="border-t border-dashed border-gray-200" />

      {/* Inactive States */}
      <section>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Coming Soon — {inactive.length} more states
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {inactive.map((state, i) => (
            <motion.div
              key={state.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.02 }}
            >
              <div className="flex items-center justify-between p-3 rounded-lg border border-dashed border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center">
                    <BuildingLibraryIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium leading-tight">{state.name}</p>
                    <p className="text-xs text-gray-400">{state.capital}</p>
                  </div>
                </div>
                <LockClosedIcon className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <div>
        <Link to="/csi/state" className="flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-700 w-fit">
          <ChevronLeftIcon className="h-4 w-4" />
          Back to State Courts
        </Link>
      </div>
    </div>
  )
}
