import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BuildingLibraryIcon, MapPinIcon, ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline'
import { Card } from '@/components/common'
import { NIGERIAN_STATES_LIST } from '@/data/csi/stateCourtData'

export default function MagistrateListPage() {
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
              {NIGERIAN_STATES_LIST.length} States — Select a state to view its magistrate court divisions
            </p>
          </div>
        </div>
      </motion.div>

      {/* States Grid */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {NIGERIAN_STATES_LIST.map((state, i) => (
          <motion.div
            key={state.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.025 }}
          >
            <Link to={`/csi/state/magistrate/${state.id}`}>
              <Card className="p-4 hover:shadow-card-hover hover:border-teal-200 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                    <BuildingLibraryIcon className="h-5 w-5 text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-charcoal-900 text-sm group-hover:text-teal-700 transition-colors">
                      {state.name}
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <MapPinIcon className="h-3 w-3" />
                      {state.capital}
                    </p>
                  </div>
                  <ChevronRightIcon className="h-4 w-4 text-gray-300 group-hover:text-teal-500 transition-colors flex-shrink-0" />
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <div>
        <Link to="/csi/state" className="flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-700 w-fit">
          <ChevronLeftIcon className="h-4 w-4" />
          Back to State Courts
        </Link>
      </div>
    </div>
  )
}
