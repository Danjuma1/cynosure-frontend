import { Link, useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BuildingLibraryIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  UserGroupIcon,
  ScaleIcon,
} from '@heroicons/react/24/outline'
import { Card, EmptyState } from '@/components/common'
import { getCADivision } from '@/data/csi/caData'

export default function CAPanelsPage() {
  const { divisionId } = useParams()
  const navigate = useNavigate()
  const division = getCADivision(divisionId)

  if (!division) {
    return (
      <div className="space-y-4">
        <Link to="/csi/federal/CA" className="flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-700">
          <ChevronLeftIcon className="h-4 w-4" />
          Back to CA Divisions
        </Link>
        <Card className="p-12">
          <EmptyState
            icon={<BuildingLibraryIcon className="h-12 w-12 text-gray-400" />}
            title="Division not found"
            description="This Court of Appeal division could not be found."
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
        <Link to="/csi/federal" className="hover:text-emerald-700">Federal Courts</Link>
        <span>/</span>
        <Link to="/csi/federal/CA" className="hover:text-emerald-700">Court of Appeal</Link>
        <span>/</span>
        <span className="text-charcoal-900 font-medium">{division.name}</span>
      </motion.nav>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <BuildingLibraryIcon className="h-6 w-6 text-emerald-700" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-charcoal-900">
              {division.name}
            </h1>
            <p className="text-gray-500 text-sm">
              Court of Appeal · {division.state} · {division.panels.length} Panel{division.panels.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        {division.location && (
          <p className="text-sm text-gray-500 mt-2 flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {division.location}
          </p>
        )}
        <p className="text-gray-600 mt-3 text-sm">
          Select a panel below to view its daily cause list and sitting status.
          Each panel consists of three justices of the Court of Appeal.
        </p>
      </motion.div>

      {/* Panels Grid */}
      {division.panels.length === 0 ? (
        <Card className="p-10">
          <EmptyState
            icon={<UserGroupIcon className="h-12 w-12 text-gray-400" />}
            title="No panels available"
            description="Panel information for this division is not yet available."
          />
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {division.panels.map((panel, i) => (
            <motion.div
              key={panel.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <button
                onClick={() => navigate(`/csi/federal/CA/${divisionId}/${panel.id}`)}
                className="w-full text-left"
              >
                <Card className="p-5 hover:shadow-card-hover hover:border-emerald-200 transition-all group border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center flex-shrink-0">
                        <ScaleIcon className="h-6 w-6 text-emerald-700" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-charcoal-900 group-hover:text-emerald-700 transition-colors">
                          {panel.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">Court of Appeal</p>
                        <p className="text-xs text-gray-400 mt-0.5">{division.name}</p>
                      </div>
                    </div>
                    <ChevronRightIcon className="h-5 w-5 text-gray-300 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-500">Tap to view cause list &amp; sitting status</span>
                    <span className="text-xs font-medium text-emerald-700 flex items-center gap-1">
                      View
                      <ChevronRightIcon className="h-3 w-3" />
                    </span>
                  </div>
                </Card>
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Back */}
      <div>
        <Link
          to="/csi/federal/CA"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-700 w-fit"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Back to CA Divisions
        </Link>
      </div>
    </div>
  )
}
