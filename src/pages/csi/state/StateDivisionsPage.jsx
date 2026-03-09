import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ScaleIcon,
  MapPinIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  BuildingLibraryIcon,
} from '@heroicons/react/24/outline'
import { Card, EmptyState } from '@/components/common'
import { getState, getStateHCDivisions } from '@/data/csi/stateCourtData'

export default function StateDivisionsPage() {
  const { stateId } = useParams()
  const state = getState(stateId)
  const divisions = getStateHCDivisions(stateId)

  if (!state) {
    return (
      <div className="space-y-4">
        <Link to="/csi/state/high-court" className="flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-700">
          <ChevronLeftIcon className="h-4 w-4" />
          Back to States
        </Link>
        <Card className="p-12">
          <EmptyState
            icon={<BuildingLibraryIcon className="h-12 w-12 text-gray-400" />}
            title="State not found"
            description="The selected state could not be found."
          />
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <motion.nav
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2 text-sm text-gray-500 flex-wrap"
      >
        <Link to="/csi" className="hover:text-emerald-700">CSI</Link>
        <span>/</span>
        <Link to="/csi/state" className="hover:text-emerald-700">State Courts</Link>
        <span>/</span>
        <Link to="/csi/state/high-court" className="hover:text-emerald-700">State High Courts</Link>
        <span>/</span>
        <span className="text-charcoal-900 font-medium">{state.name}</span>
      </motion.nav>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
            <ScaleIcon className="h-6 w-6 text-purple-700" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-charcoal-900">
              {state.name} State High Court
            </h1>
            <p className="text-gray-500 text-sm">
              {divisions.length > 0
                ? `${divisions.length} division${divisions.length !== 1 ? 's' : ''} — Select a division`
                : 'Divisions coming soon'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Divisions */}
      {divisions.length === 0 ? (
        <Card className="p-12">
          <EmptyState
            icon={<BuildingLibraryIcon className="h-12 w-12 text-gray-400" />}
            title="Divisions not yet available"
            description={`Division data for the ${state.name} State High Court is not yet available. Check back soon.`}
          />
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {divisions.map((division, i) => (
            <motion.div
              key={division.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Link to={`/csi/state/high-court/${stateId}/${division.id}`}>
                <Card className="p-5 hover:shadow-card-hover hover:border-purple-200 transition-all group">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                      <BuildingLibraryIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-charcoal-900 group-hover:text-purple-700 transition-colors">
                        {division.name}
                      </h3>
                      {division.location && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <MapPinIcon className="h-3.5 w-3.5" />
                          {division.location}
                        </p>
                      )}
                    </div>
                    <ChevronRightIcon className="h-5 w-5 text-gray-300 group-hover:text-purple-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </div>
                  <div className="mt-3 pt-2 border-t border-gray-100">
                    <span className="text-xs text-purple-600 font-medium">View Judges & Cause Lists →</span>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      <div>
        <Link to="/csi/state/high-court" className="flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-700 w-fit">
          <ChevronLeftIcon className="h-4 w-4" />
          Back to States
        </Link>
      </div>
    </div>
  )
}
