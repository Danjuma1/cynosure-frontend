import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  DocumentTextIcon,
  CalendarDaysIcon,
  FunnelIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import { Card, Button, Select, Badge, Pagination, EmptyState, Tabs } from '@/components/common'
import { causeListsAPI } from '@/services/api'
import { formatDate, formatTime, CAUSE_LIST_STATUSES, NIGERIAN_STATES } from '@/utils/helpers'

export default function CauseListsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState('daily')

  const dateParam = searchParams.get('date') || new Date().toISOString().split('T')[0]
  const state = searchParams.get('state') || ''
  const page = parseInt(searchParams.get('page') || '1')

  const { data: dailyData, isLoading: dailyLoading } = useQuery({
    queryKey: ['causeLists', 'daily', dateParam, state],
    queryFn: () => causeListsAPI.getDaily({ date: dateParam, state: state || undefined }),
    enabled: activeTab === 'daily',
  })

  const { data: futureData, isLoading: futureLoading } = useQuery({
    queryKey: ['causeLists', 'future', page],
    queryFn: () => causeListsAPI.getFuture({ page }),
    enabled: activeTab === 'upcoming',
  })

  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value) newParams.set(key, value)
      else newParams.delete(key)
    })
    setSearchParams(newParams)
  }

  const tabs = [
    { id: 'daily', label: 'Daily View' },
    { id: 'upcoming', label: 'Upcoming' },
  ]

  const causeLists = activeTab === 'daily' 
    ? dailyData?.data?.cause_lists || []
    : futureData?.data?.results || []

  const isLoading = activeTab === 'daily' ? dailyLoading : futureLoading

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-charcoal-900">Cause Lists</h1>
          <p className="text-gray-600 mt-1">View daily court schedules and upcoming hearings</p>
        </div>
      </motion.div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Filters */}
      {activeTab === 'daily' && (
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="date"
                value={dateParam}
                onChange={(e) => updateParams({ date: e.target.value })}
                className="input-field"
              />
            </div>
            <Select
              value={state}
              onChange={(value) => updateParams({ state: value })}
              options={[
                { value: '', label: 'All States' },
                ...NIGERIAN_STATES.map((s) => ({ value: s.toLowerCase(), label: s })),
              ]}
              className="w-48"
            />
          </div>
        </Card>
      )}

      {/* Summary Stats */}
      {activeTab === 'daily' && dailyData?.data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-charcoal-900">{dailyData.data.total || 0}</p>
            <p className="text-sm text-gray-500">Total Cause Lists</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-emerald-700">{dailyData.data.by_status?.sitting || 0}</p>
            <p className="text-sm text-gray-500">In Session</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{dailyData.data.by_status?.published || 0}</p>
            <p className="text-sm text-gray-500">Published</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{dailyData.data.by_status?.adjourned || 0}</p>
            <p className="text-sm text-gray-500">Adjourned</p>
          </Card>
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton h-24 rounded-xl" />
          ))}
        </div>
      ) : causeLists.length === 0 ? (
        <Card className="p-12">
          <EmptyState
            icon={<DocumentTextIcon className="h-12 w-12 text-gray-400" />}
            title="No cause lists found"
            description={activeTab === 'daily' ? `No cause lists for ${formatDate(dateParam)}` : 'No upcoming cause lists'}
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
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <DocumentTextIcon className="h-6 w-6 text-emerald-700" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-charcoal-900">
                          {causeList.court?.name || 'Court'}
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

          {activeTab === 'upcoming' && futureData?.data?.count > 20 && (
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(futureData.data.count / 20)}
              onPageChange={(p) => updateParams({ page: p.toString() })}
            />
          )}
        </div>
      )}
    </div>
  )
}
