import { Link, useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  BuildingLibraryIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ScaleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'
import { Card, EmptyState } from '@/components/common'
import { judgesAPI } from '@/services/api'
import { getState, getMagistrateDivisions } from '@/data/csi/stateCourtData'

export default function MagistrateJudgesPage() {
  const { stateId, divisionId } = useParams()
  const navigate = useNavigate()
  const state = getState(stateId)
  const divisions = getMagistrateDivisions(stateId)
  const division = divisions.find((d) => d.id === divisionId)

  const { data, isLoading } = useQuery({
    queryKey: ['judges', 'magistrate', stateId, divisionId],
    queryFn: () =>
      judgesAPI.list({
        court_type: 'MC',
        state: state?.stateCode,
        division: divisionId,
        page_size: 50,
      }),
    enabled: !!state,
  })

  const judges = data?.data?.results || []

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
        <Link to={`/csi/state/magistrate/${stateId}`} className="hover:text-emerald-700">
          {state?.name || stateId}
        </Link>
        <span>/</span>
        <span className="text-charcoal-900 font-medium">{division?.name || divisionId}</span>
      </motion.nav>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
            <BuildingLibraryIcon className="h-6 w-6 text-teal-700" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-charcoal-900">
              {division?.name || divisionId}
            </h1>
            <p className="text-gray-500 text-sm">{state?.name} Magistrate Court</p>
          </div>
        </div>
        <p className="text-gray-600 mt-2 text-sm">
          Select a magistrate to view their daily cause list and sitting status.
        </p>
      </motion.div>

      {/* Judges */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
        </div>
      ) : judges.length === 0 ? (
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
                onClick={() => navigate(`/csi/state/magistrate/${stateId}/${divisionId}/${judge.id}`)}
                className="w-full text-left"
              >
                <Card className="p-4 hover:shadow-card-hover hover:border-teal-200 transition-all group border border-gray-100">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                      <UserCircleIcon className="h-6 w-6 text-teal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-charcoal-900 group-hover:text-teal-700 transition-colors">
                        {judge.name || judge.formal_name || `${judge.title || 'Chief Magistrate'} ${judge.first_name} ${judge.last_name}`}
                      </h3>
                      {judge.court_number && (
                        <p className="text-xs text-gray-500 mt-0.5">Court {judge.court_number}</p>
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
          to={`/csi/state/magistrate/${stateId}`}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-700 w-fit"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Back to Divisions
        </Link>
      </div>
    </div>
  )
}
