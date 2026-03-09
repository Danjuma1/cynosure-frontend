import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline'
import {
  Card,
  Button,
  Select,
  Badge,
  Pagination,
  EmptyState,
  SkeletonTable,
} from '@/components/common'
import { casesAPI } from '@/services/api'
import { formatDate, CASE_STATUSES, NIGERIAN_STATES, debounce } from '@/utils/helpers'

const statusOptions = [
  { value: '', label: 'All Statuses' },
  ...Object.entries(CASE_STATUSES).map(([key, val]) => ({
    value: key,
    label: val.label,
  })),
]

const caseTypeOptions = [
  { value: '', label: 'All Types' },
  { value: 'civil', label: 'Civil' },
  { value: 'criminal', label: 'Criminal' },
  { value: 'appeal', label: 'Appeal' },
  { value: 'constitutional', label: 'Constitutional' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'family', label: 'Family' },
]

export default function CasesListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)

  const page = parseInt(searchParams.get('page') || '1')
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  const caseType = searchParams.get('case_type') || ''
  const state = searchParams.get('state') || ''

  const { data, isLoading, error } = useQuery({
    queryKey: ['cases', { page, search, status, caseType, state }],
    queryFn: () =>
      casesAPI.list({
        page,
        search,
        status: status || undefined,
        case_type: caseType || undefined,
        state: state || undefined,
      }),
  })

  const updateParams = (updates) => {
    const newParams = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value)
      } else {
        newParams.delete(key)
      }
    })
    if (updates.search !== undefined || updates.status !== undefined) {
      newParams.set('page', '1')
    }
    setSearchParams(newParams)
  }

  const handleSearch = debounce((value) => {
    updateParams({ search: value })
  }, 300)

  const cases = data?.data?.results || []
  const totalPages = Math.ceil((data?.data?.count || 0) / 20)

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-charcoal-900">Cases</h1>
          <p className="text-gray-600 mt-1">Search and track court cases across Nigeria</p>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by case number, parties, or keywords..."
              defaultValue={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <Button
            variant="secondary"
            leftIcon={<FunnelIcon className="h-5 w-5" />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100"
          >
            <Select
              label="Status"
              value={status}
              onChange={(value) => updateParams({ status: value })}
              options={statusOptions}
            />
            <Select
              label="Case Type"
              value={caseType}
              onChange={(value) => updateParams({ case_type: value })}
              options={caseTypeOptions}
            />
            <Select
              label="State"
              value={state}
              onChange={(value) => updateParams({ state: value })}
              options={[
                { value: '', label: 'All States' },
                ...NIGERIAN_STATES.map((s) => ({ value: s.toLowerCase(), label: s })),
              ]}
            />
          </motion.div>
        )}
      </Card>

      {/* Results */}
      {isLoading ? (
        <SkeletonTable rows={10} cols={5} />
      ) : error ? (
        <Card className="p-12">
          <EmptyState
            title="Error loading cases"
            description="Something went wrong. Please try again."
            action={<Button onClick={() => window.location.reload()}>Retry</Button>}
          />
        </Card>
      ) : cases.length === 0 ? (
        <Card className="p-12">
          <EmptyState
            icon={<MagnifyingGlassIcon className="h-12 w-12 text-gray-400" />}
            title="No cases found"
            description={search ? `No results for "${search}"` : 'Try adjusting your filters'}
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Case Number</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Parties</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Court</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Next Hearing</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {cases.map((caseItem) => (
                  <tr key={caseItem.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <Link to={`/cases/${caseItem.id}`} className="font-medium text-emerald-700 hover:text-emerald-800">
                        {caseItem.case_number}
                      </Link>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-charcoal-900 max-w-xs truncate">{caseItem.parties}</p>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{caseItem.court?.name}</td>
                    <td className="py-4 px-6 text-gray-600">
                      {caseItem.next_hearing_date ? formatDate(caseItem.next_hearing_date) : '-'}
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={CASE_STATUSES[caseItem.status]?.color || 'neutral'}>
                        {CASE_STATUSES[caseItem.status]?.label || caseItem.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => updateParams({ page: p.toString() })} />
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
