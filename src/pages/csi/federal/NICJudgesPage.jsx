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

export default function NICJudgesPage() {
  const { courtId } = useParams()
  const navigate = useNavigate()

  const { data: courtData, isLoading: courtLoading } = useQuery({
    queryKey: ['court', courtId],
    queryFn: () => courtsAPI.get(courtId),
    enabled: !!courtId,
  })

  const { data: judgesData, isLoading: judgesLoading, isError, refetch } = useQuery({
    queryKey: ['judges', 'NIC', courtId],
    queryFn: () => judgesAPI.list({ court: courtId, is_active: true, page_size: 50 }),
    enabled: !!courtId,
  })

  const court = courtData?.data
  const judges = judgesData?.data?.results || []
  const isLoading = courtLoading || judgesLoading

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
        <Link to="/csi/federal/NIC" className="hover:text-emerald-700">National Industrial Court</Link>
        <span>/</span>
        <span className="text-charcoal-900 font-medium">
          {courtLoading ? '…' : (court?.name || 'Division')}
        </span>
      </motion.nav>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
            <BuildingLibraryIcon className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            {courtLoading
              ? <div className="skeleton h-7 w-56 rounded mb-1" />
              : <h1 className="text-2xl font-display font-bold text-charcoal-900">{court?.name}</h1>
            }
            <p className="text-gray-500 text-sm">National Industrial Court · {court?.city}</p>
          </div>
        </div>
        {court?.address && <p className="text-sm text-gray-500 mt-2">{court.address}</p>}
        <p className="text-gray-600 mt-2 text-sm">Select a judge to view their daily cause list and sitting status.</p>
      </motion.div>

      {isError && (
        <Card className="p-6">
          <div className="flex items-center gap-3 text-red-600">
            <ExclamationCircleIcon className="h-6 w-6 flex-shrink-0" />
            <div>
              <p className="font-medium">Failed to load judges</p>
              <button onClick={refetch} className="text-sm underline mt-1">Try again</button>
            </div>
          </div>
        </Card>
      )}

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
        </div>
      ) : judges.length === 0 && !isError ? (
        <Card className="p-12">
          <EmptyState
            icon={<ScaleIcon className="h-12 w-12 text-gray-400" />}
            title="No judges found"
            description="No National Industrial Court judges found for this division."
          />
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {judges.map((judge, i) => (
            <motion.div key={judge.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <button onClick={() => navigate(`/csi/federal/NIC/${courtId}/${judge.id}`)} className="w-full text-left">
                <Card className="p-4 hover:shadow-card-hover hover:border-orange-200 transition-all group border border-gray-100">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                      {judge.photo
                        ? <img src={judge.photo} alt="" className="w-10 h-10 rounded-full object-cover" />
                        : <UserCircleIcon className="h-6 w-6 text-orange-600" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-charcoal-900 group-hover:text-orange-700 transition-colors">
                        {judge.formal_name || `${judge.title || 'Hon. Justice'} ${judge.first_name} ${judge.last_name}`}
                      </h3>
                      {judge.is_chief_judge && (
                        <p className="text-xs text-orange-600 font-medium mt-0.5">President</p>
                      )}
                    </div>
                    <ChevronRightIcon className="h-5 w-5 text-gray-300 group-hover:text-orange-600 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
                  </div>
                  <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-400">Tap to view cause list</span>
                    <span className="text-xs font-medium text-orange-600">View →</span>
                  </div>
                </Card>
              </button>
            </motion.div>
          ))}
        </div>
      )}

      <div>
        <Link to="/csi/federal/NIC" className="flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-700 w-fit">
          <ChevronLeftIcon className="h-4 w-4" />
          Back to NIC Divisions
        </Link>
      </div>
    </div>
  )
}
