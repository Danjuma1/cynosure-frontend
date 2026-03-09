import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  UserCircleIcon,
  BuildingLibraryIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import { Card, Select, Badge, Pagination, EmptyState, SearchInput, Avatar } from '@/components/common'
import { judgesAPI } from '@/services/api'
import { JUDGE_STATUSES, COURT_TYPES, NIGERIAN_STATES, capitalize } from '@/utils/helpers'

export default function JudgesListPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const page = parseInt(searchParams.get('page') || '1')
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  const courtType = searchParams.get('court_type') || ''
  const state = searchParams.get('state') || ''

  const { data, isLoading } = useQuery({
    queryKey: ['judges', { page, search, status, courtType, state }],
    queryFn: () =>
      judgesAPI.list({
        page,
        search: search || undefined,
        status: status || undefined,
        court_type: courtType || undefined,
        state: state || undefined,
      }),
  })

  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value) newParams.set(key, value)
      else newParams.delete(key)
    })
    newParams.set('page', '1')
    setSearchParams(newParams)
  }

  const judges = data?.data?.results || []
  const totalPages = Math.ceil((data?.data?.count || 0) / 20)

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-display font-bold text-charcoal-900">Judges</h1>
        <p className="text-gray-600 mt-1">Browse judges and their court schedules</p>
      </motion.div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SearchInput
            placeholder="Search judges..."
            value={search}
            onChange={(value) => updateParams({ search: value })}
          />
          <Select
            value={status}
            onChange={(value) => updateParams({ status: value })}
            options={[
              { value: '', label: 'All Statuses' },
              ...Object.entries(JUDGE_STATUSES).map(([key, val]) => ({
                value: key,
                label: val.label,
              })),
            ]}
          />
          <Select
            value={courtType}
            onChange={(value) => updateParams({ court_type: value })}
            options={[
              { value: '', label: 'All Court Types' },
              ...Object.entries(COURT_TYPES).map(([key, label]) => ({ value: key, label })),
            ]}
          />
          <Select
            value={state}
            onChange={(value) => updateParams({ state: value })}
            options={[
              { value: '', label: 'All States' },
              ...NIGERIAN_STATES.map((s) => ({ value: s.toLowerCase(), label: s })),
            ]}
          />
        </div>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton h-40 rounded-xl" />
          ))}
        </div>
      ) : judges.length === 0 ? (
        <Card className="p-12">
          <EmptyState
            icon={<UserCircleIcon className="h-12 w-12 text-gray-400" />}
            title="No judges found"
            description="Try adjusting your filters"
          />
        </Card>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {judges.map((judge, i) => (
              <motion.div
                key={judge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/judges/${judge.id}`}>
                  <Card className="p-5 h-full hover:shadow-card-hover hover:border-emerald-100 transition-all group">
                    <div className="flex items-start gap-4">
                      <Avatar
                        src={judge.photo}
                        name={`${judge.first_name} ${judge.last_name}`}
                        size="lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-charcoal-900 group-hover:text-emerald-700 transition-colors">
                          {judge.formal_name || `${judge.title} ${judge.first_name} ${judge.last_name}`}
                        </h3>
                        <Badge
                          variant={JUDGE_STATUSES[judge.status]?.color || 'neutral'}
                          className="mt-1"
                          dot
                        >
                          {JUDGE_STATUSES[judge.status]?.label || judge.status}
                        </Badge>
                      </div>
                      <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-emerald-700 transition-colors" />
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                      <BuildingLibraryIcon className="h-4 w-4" />
                      {judge.court?.name || 'Court not assigned'}
                    </div>

                    {judge.division && (
                      <p className="text-sm text-gray-500 mt-1 ml-6">
                        {judge.division.name} Division
                      </p>
                    )}
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(p) => updateParams({ page: p.toString() })}
            />
          )}
        </>
      )}
    </div>
  )
}
