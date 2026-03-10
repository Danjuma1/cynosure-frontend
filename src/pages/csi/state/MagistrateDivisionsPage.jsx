import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { BuildingLibraryIcon, MapPinIcon, ChevronRightIcon, ChevronLeftIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { Card, EmptyState } from '@/components/common'
import { courtsAPI } from '@/services/api'

export default function MagistrateDivisionsPage() {
  const { courtId } = useParams()

  const { data: courtData, isLoading: courtLoading } = useQuery({
    queryKey: ['court', courtId],
    queryFn: () => courtsAPI.get(courtId),
    enabled: !!courtId,
  })

  const { data: divisionsData, isLoading: divisionsLoading, isError, refetch } = useQuery({
    queryKey: ['court', courtId, 'divisions'],
    queryFn: () => courtsAPI.getDivisions(courtId),
    enabled: !!courtId,
  })

  const court = courtData?.data
  const divisions = divisionsData?.data?.data || divisionsData?.data?.results || []
  const isLoading = courtLoading || divisionsLoading

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
        <Link to="/csi/state/magistrate" className="hover:text-emerald-700">Magistrate Courts</Link>
        <span>/</span>
        <span className="text-charcoal-900 font-medium">
          {courtLoading ? '…' : (court?.name || 'Court')}
        </span>
      </motion.nav>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
            <BuildingLibraryIcon className="h-6 w-6 text-teal-700" />
          </div>
          <div>
            {courtLoading
              ? <div className="skeleton h-7 w-48 rounded mb-1" />
              : <h1 className="text-2xl font-display font-bold text-charcoal-900">{court?.name}</h1>
            }
            <p className="text-gray-500 text-sm">
              {divisionsLoading ? 'Loading…' : `${divisions.length} division${divisions.length !== 1 ? 's' : ''} — Select a division`}
            </p>
          </div>
        </div>
      </motion.div>

      {isError && (
        <Card className="p-6">
          <div className="flex items-center gap-3 text-red-600">
            <ExclamationCircleIcon className="h-6 w-6 flex-shrink-0" />
            <div>
              <p className="font-medium">Failed to load divisions</p>
              <button onClick={refetch} className="text-sm underline mt-1">Try again</button>
            </div>
          </div>
        </Card>
      )}

      {/* Divisions */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
        </div>
      ) : divisions.length === 0 && !isError ? (
        <Card className="p-12">
          <EmptyState
            icon={<BuildingLibraryIcon className="h-12 w-12 text-gray-400" />}
            title="Divisions not yet available"
            description="Division data for this court is not yet available."
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
              <Link to={`/csi/state/magistrate/${courtId}/${division.id}`}>
                <Card className="p-5 hover:shadow-card-hover hover:border-teal-200 transition-all group">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                      <BuildingLibraryIcon className="h-5 w-5 text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-charcoal-900 group-hover:text-teal-700 transition-colors">
                        {division.name}
                      </h3>
                      {division.city && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <MapPinIcon className="h-3.5 w-3.5" />
                          {division.city}
                        </p>
                      )}
                    </div>
                    <ChevronRightIcon className="h-5 w-5 text-gray-300 group-hover:text-teal-500 flex-shrink-0" />
                  </div>
                  <div className="mt-3 pt-2 border-t border-gray-100">
                    <span className="text-xs text-teal-600 font-medium">View Judges & Cause Lists →</span>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      <div>
        <Link to="/csi/state/magistrate" className="flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-700 w-fit">
          <ChevronLeftIcon className="h-4 w-4" />
          Back to States
        </Link>
      </div>
    </div>
  )
}
