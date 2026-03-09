import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  BuildingLibraryIcon,
  ChevronLeftIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline'
import { Card, Badge, Pagination, EmptyState, Tabs, Select } from '@/components/common'
import { courtsAPI, causeListsAPI } from '@/services/api'
import {
  formatDate,
  formatTime,
  CAUSE_LIST_STATUSES,
  NIGERIAN_STATES,
  capitalize,
} from '@/utils/helpers'

const COURT_META = {
  CA: {
    name: 'Court of Appeal',
    shortName: 'CA',
    description:
      'The intermediate appellate court with divisions across Nigeria. Hears appeals from federal and state courts.',
    color: 'emerald',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-700',
    badgeColor: 'bg-emerald-700',
  },
  FHC: {
    name: 'Federal High Court',
    shortName: 'FHC',
    description:
      'Exclusive jurisdiction over federal matters including revenue, admiralty, banking, companies, and constitutional issues.',
    color: 'blue',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    badgeColor: 'bg-blue-600',
  },
  NIC: {
    name: 'National Industrial Court',
    shortName: 'NICN',
    description:
      'Exclusive jurisdiction over labour, employment, trade union disputes, and industrial relations matters.',
    color: 'orange',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    badgeColor: 'bg-orange-600',
  },
}

const tabs = [
  { id: 'cause-lists', label: 'Cause Lists' },
  { id: 'courts', label: 'Court Locations' },
]

export default function CourtTypePage() {
  const { courtType } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState('cause-lists')

  const meta = COURT_META[courtType?.toUpperCase()]

  const dateParam = searchParams.get('date') || new Date().toISOString().split('T')[0]
  const stateParam = searchParams.get('state') || ''
  const courtPage = parseInt(searchParams.get('cpage') || '1')
  const clPage = parseInt(searchParams.get('clpage') || '1')

  // Fetch cause lists for this court type
  const { data: dailyData, isLoading: dailyLoading } = useQuery({
    queryKey: ['causeLists', 'daily', dateParam, stateParam, courtType],
    queryFn: () =>
      causeListsAPI.getDaily({
        date: dateParam,
        state: stateParam || undefined,
        court_type: courtType?.toUpperCase(),
      }),
    enabled: activeTab === 'cause-lists',
  })

  // Fetch courts of this type
  const { data: courtsData, isLoading: courtsLoading } = useQuery({
    queryKey: ['courts', courtType, stateParam, courtPage],
    queryFn: () =>
      courtsAPI.list({
        court_type: courtType?.toUpperCase(),
        state: stateParam || undefined,
        page: courtPage,
      }),
    enabled: activeTab === 'courts',
  })

  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value) newParams.set(key, value)
      else newParams.delete(key)
    })
    setSearchParams(newParams)
  }

  if (!meta) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link to="/csi/federal" className="hover:text-emerald-700 flex items-center gap-1">
            <ChevronLeftIcon className="h-4 w-4" />
            Federal Courts
          </Link>
        </div>
        <Card className="p-12">
          <EmptyState
            icon={<BuildingLibraryIcon className="h-12 w-12 text-gray-400" />}
            title="Court not found"
            description="This court type is not available or not yet supported."
          />
        </Card>
      </div>
    )
  }

  const causeLists = dailyData?.data?.cause_lists || []
  const courts = courtsData?.data?.results || []
  const totalCourtPages = Math.ceil((courtsData?.data?.count || 0) / 20)

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2 text-sm text-gray-500"
      >
        <Link to="/csi" className="hover:text-emerald-700">
          CSI
        </Link>
        <span>/</span>
        <Link to="/csi/federal" className="hover:text-emerald-700 flex items-center gap-1">
          Federal Courts
        </Link>
        <span>/</span>
        <span className="text-charcoal-900 font-medium">{meta.name}</span>
      </motion.div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-start md:justify-between gap-4"
      >
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl ${meta.iconBg} flex items-center justify-center flex-shrink-0`}>
            <BuildingLibraryIcon className={`h-7 w-7 ${meta.iconColor}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-display font-bold text-charcoal-900">
                {meta.name}
              </h1>
              <span className={`text-xs font-bold text-white px-2 py-0.5 rounded ${meta.badgeColor}`}>
                {meta.shortName}
              </span>
            </div>
            <p className="text-gray-600 mt-1 max-w-2xl text-sm">{meta.description}</p>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {activeTab === 'cause-lists' && (
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
              <input
                type="date"
                value={dateParam}
                onChange={(e) => updateParams({ date: e.target.value })}
                className="input-field"
              />
            </div>
          )}
          <div className={activeTab === 'cause-lists' ? 'w-48' : 'w-64'}>
            <label className="block text-xs font-medium text-gray-500 mb-1">State / Division</label>
            <Select
              value={stateParam}
              onChange={(value) => updateParams({ state: value, cpage: '1', clpage: '1' })}
              options={[
                { value: '', label: 'All States' },
                ...NIGERIAN_STATES.map((s) => ({ value: s.toLowerCase(), label: s })),
              ]}
            />
          </div>
        </div>
      </Card>

      {/* CAUSE LISTS TAB */}
      {activeTab === 'cause-lists' && (
        <>
          {/* Summary Stats */}
          {dailyData?.data && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-charcoal-900">
                  {dailyData.data.total || 0}
                </p>
                <p className="text-sm text-gray-500">Total Cause Lists</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-emerald-700">
                  {dailyData.data.by_status?.sitting || 0}
                </p>
                <p className="text-sm text-gray-500">In Session</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {dailyData.data.by_status?.published || 0}
                </p>
                <p className="text-sm text-gray-500">Published</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-amber-600">
                  {dailyData.data.by_status?.adjourned || 0}
                </p>
                <p className="text-sm text-gray-500">Adjourned</p>
              </Card>
            </div>
          )}

          {/* Cause List Results */}
          {dailyLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-24 rounded-xl" />
              ))}
            </div>
          ) : causeLists.length === 0 ? (
            <Card className="p-12">
              <EmptyState
                icon={<DocumentTextIcon className="h-12 w-12 text-gray-400" />}
                title="No cause lists found"
                description={`No ${meta.name} cause lists for ${formatDate(dateParam)}${
                  stateParam ? ` in ${capitalize(stateParam)}` : ''
                }`}
              />
            </Card>
          ) : (
            <div className="space-y-4">
              {causeLists.map((causeList, i) => (
                <motion.div
                  key={causeList.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link to={`/cause-lists/${causeList.id}`}>
                    <Card className="p-5 hover:shadow-card-hover hover:border-emerald-100 transition-all">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-xl ${meta.iconBg} flex items-center justify-center flex-shrink-0`}>
                            <DocumentTextIcon className={`h-6 w-6 ${meta.iconColor}`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-charcoal-900">
                              {causeList.court?.name || meta.name}
                            </h3>
                            <p className="text-gray-600 text-sm mt-0.5">
                              {causeList.judge?.formal_name || 'Judge'}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <CalendarDaysIcon className="h-4 w-4" />
                                {formatDate(causeList.date)}
                              </span>
                              {causeList.start_time && (
                                <span className="flex items-center gap-1">
                                  <ClockIcon className="h-4 w-4" />
                                  {formatTime(causeList.start_time)}
                                </span>
                              )}
                              <span>{causeList.total_cases || 0} cases</span>
                            </div>
                          </div>
                        </div>
                        <Badge
                          variant={CAUSE_LIST_STATUSES[causeList.status]?.color || 'neutral'}
                          dot
                          size="lg"
                        >
                          {CAUSE_LIST_STATUSES[causeList.status]?.label || causeList.status}
                        </Badge>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {/* COURTS TAB */}
      {activeTab === 'courts' && (
        <>
          {courtsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="skeleton h-40 rounded-xl" />
              ))}
            </div>
          ) : courts.length === 0 ? (
            <Card className="p-12">
              <EmptyState
                icon={<BuildingLibraryIcon className="h-12 w-12 text-gray-400" />}
                title="No courts found"
                description={`No ${meta.name} locations found${
                  stateParam ? ` in ${capitalize(stateParam)}` : ''
                }`}
              />
            </Card>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courts.map((court, i) => (
                  <motion.div
                    key={court.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link to={`/courts/${court.id}`}>
                      <Card className="p-5 h-full hover:shadow-card-hover hover:border-emerald-100 transition-all group">
                        <div className="flex items-start gap-3 mb-4">
                          <div className={`w-10 h-10 rounded-xl ${meta.iconBg} flex items-center justify-center flex-shrink-0`}>
                            <BuildingLibraryIcon className={`h-5 w-5 ${meta.iconColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-charcoal-900 group-hover:text-emerald-700 transition-colors text-sm leading-snug">
                              {court.name}
                            </h3>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {(court.city || court.state) && (
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <MapPinIcon className="h-3.5 w-3.5" />
                              {[court.city, capitalize(court.state)].filter(Boolean).join(', ')}
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <UserGroupIcon className="h-3.5 w-3.5" />
                            {court.total_judges || 0} judges
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {totalCourtPages > 1 && (
                <Pagination
                  currentPage={courtPage}
                  totalPages={totalCourtPages}
                  onPageChange={(p) => updateParams({ cpage: p.toString() })}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
