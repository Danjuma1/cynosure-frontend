import { Link, useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  BuildingLibraryIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ScaleIcon,
  UserCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline'
import { Card, EmptyState } from '@/components/common'
import { judgesAPI, courtsAPI } from '@/services/api'

export default function MagistrateJudgesPage() {
  const { courtId, divisionId } = useParams()
  const navigate = useNavigate()

  const { data: courtData, isLoading: courtLoading } = useQuery({
    queryKey: ['court', courtId],
    queryFn: () => courtsAPI.get(courtId),
    enabled: !!courtId,
  })

  const { data: divisionData, isLoading: divisionLoading } = useQuery({
    queryKey: ['division', divisionId],
    queryFn: () => courtsAPI.getDivision(divisionId),
    enabled: !!divisionId,
  })

  const { data: judgesData, isLoading: judgesLoading, isError, refetch } = useQuery({
    queryKey: ['judges', 'MC', courtId, divisionId],
    queryFn: () => judgesAPI.list({ court: courtId, division: divisionId, is_active: true, page_size: 50 }),
    enabled: !!courtId && !!divisionId,
  })

  const court = courtData?.data
  const division = divisionData?.data
  const judges = judgesData?.data?.results || []
  const isLoading = courtLoading || divisionLoading || judgesLoading

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
        <Link to={`/csi/state/magistrate/${courtId}`} className="hover:text-emerald-700">
          {courtLoading ? '…' : (court?.name || 'Court')}
        </Link>
        <span>/</span>
        <span className="text-charcoal-900 font-medium">
          {divisionLoading ? '…' : (division?.name || 'Division')}
        </span>
      </motion.nav>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
            <BuildingLibraryIcon className="h-6 w-6 text-teal-700" />
          </div>
          <div>
            {divisionLoading
              ? <div className="skeleton h-7 w-48 rounded mb-1" />
              : <h1 className="text-2xl font-display font-bold text-charcoal-900">{division?.name}</h1>
            }
            <p className="text-gray-500 text-sm">{court?.name}</p>
          </div>
        </div>
        <p className="text-gray-600 mt-2 text-sm">
          Select a magistrate to view their daily cause list and sitting status.
        </p>
      </motion.div>

      {isError && (
        <Card className="p-6">
          <div className="flex items-center gap-3 text-red-600">
            <ExclamationCircleIcon className="h-6 w-6 flex-shrink-0" />
            <div>
              <p className="font-medium">Failed to load magistrates</p>
              <button onClick={refetch} className="text-sm underline mt-1">Try again</button>
            </div>
          </div>
        </Card>
      )}

      {/* Judges */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
        </div>
      ) : judges.length === 0 && !isError ? (
        <Card className="p-12">
          <EmptyState
            icon={<ScaleIcon className="h-12 w-12 text-gray-400" />}
            title="No magistrates found"
            description="No magistrate judges found for this division. Data may not yet be available."
          />
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {judges.map((judge, i) => (
            <motion.div
              key={judge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <button
                onClick={() => navigate(`/csi/state/magistrate/${courtId}/${divisionId}/${judge.id}`)}
                className="w-full text-left"
              >
                <Card className="p-4 hover:shadow-card-hover hover:border-teal-200 transition-all group border border-gray-100">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                      {judge.photo
                        ? <img src={judge.photo} alt="" className="w-10 h-10 rounded-full object-cover" />
                        : <UserCircleIcon className="h-6 w-6 text-teal-600" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-charcoal-900 group-hover:text-teal-700 transition-colors">
                        {judge.formal_name || `${judge.title || 'Chief Magistrate'} ${judge.first_name} ${judge.last_name}`}
                      </h3>
                      {judge.is_chief_judge && (
                        <p className="text-xs text-teal-600 font-medium mt-0.5">Chief Magistrate</p>
                      )}
                    </div>
                    <ChevronRightIcon className="h-5 w-5 text-gray-300 group-hover:text-teal-500 flex-shrink-0 mt-1" />
                  </div>
                  <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between">
                    <span className="text-xs text-gray-400">Tap to view cause list</span>
                    <span className="text-xs font-medium text-teal-600">View →</span>
                  </div>
                </Card>
              </button>
            </motion.div>
          ))}
        </div>
      )}

      <div>
        <Link
          to={`/csi/state/magistrate/${courtId}`}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-700 w-fit"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Back to Divisions
        </Link>
      </div>
    </div>
  )
}
