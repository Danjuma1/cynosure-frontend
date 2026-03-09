import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  BuildingLibraryIcon,
  MapPinIcon,
  UserGroupIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import { Card, Select, Badge, Pagination, EmptyState, SearchInput } from '@/components/common'
import { courtsAPI } from '@/services/api'
import { COURT_TYPES, NIGERIAN_STATES, debounce, capitalize } from '@/utils/helpers'

const courtTypeOptions = [
  { value: '', label: 'All Court Types' },
  ...Object.entries(COURT_TYPES).map(([key, label]) => ({ value: key, label })),
]

export default function CourtsListPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const page = parseInt(searchParams.get('page') || '1')
  const search = searchParams.get('search') || ''
  const courtType = searchParams.get('court_type') || ''
  const state = searchParams.get('state') || ''

  const { data, isLoading } = useQuery({
    queryKey: ['courts', { page, search, courtType, state }],
    queryFn: () =>
      courtsAPI.list({
        page,
        search: search || undefined,
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

  const courts = data?.data?.results || []
  const totalPages = Math.ceil((data?.data?.count || 0) / 20)

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-display font-bold text-charcoal-900">Courts</h1>
        <p className="text-gray-600 mt-1">Browse Nigerian courts and their schedules</p>
      </motion.div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SearchInput
            placeholder="Search courts..."
            value={search}
            onChange={(value) => updateParams({ search: value })}
          />
          <Select
            value={courtType}
            onChange={(value) => updateParams({ court_type: value })}
            options={courtTypeOptions}
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
            <div key={i} className="skeleton h-48 rounded-xl" />
          ))}
        </div>
      ) : courts.length === 0 ? (
        <Card className="p-12">
          <EmptyState
            icon={<BuildingLibraryIcon className="h-12 w-12 text-gray-400" />}
            title="No courts found"
            description="Try adjusting your filters"
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
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <BuildingLibraryIcon className="h-6 w-6 text-emerald-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-charcoal-900 group-hover:text-emerald-700 transition-colors">
                          {court.name}
                        </h3>
                        <Badge variant="neutral" className="mt-1">
                          {COURT_TYPES[court.court_type] || court.court_type}
                        </Badge>
                      </div>
                      <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:text-emerald-700 transition-colors" />
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPinIcon className="h-4 w-4" />
                        {court.city}, {capitalize(court.state)}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <UserGroupIcon className="h-4 w-4" />
                        {court.total_judges || 0} judges • {court.follower_count || 0} followers
                      </div>
                    </div>
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
