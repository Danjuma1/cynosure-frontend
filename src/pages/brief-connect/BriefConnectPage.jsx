/**
 * BriefConnectPage — the public feed of open brief requests.
 * All verified lawyers can browse and apply.
 */
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  BriefcaseIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarDaysIcon,
  BuildingLibraryIcon,
  BanknotesIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import { Card, Button, EmptyState, Badge } from '@/components/common'
import AnonymousName from '@/components/brief-connect/AnonymousName'
import { briefConnectAPI } from '@/services/api'
import { formatDate, formatNumber, timeAgo } from '@/utils/helpers'
import { useAuthStore } from '@/store/authStore'

const BRIEF_TYPE_LABELS = {
  mention: 'Mention',
  argue_motion: 'Argue Motion',
  full_appearance: 'Full Appearance',
  file_process: 'File Process',
  collect_certified_copy: 'Collect Copy',
  other: 'Other',
}

const BRIEF_TYPE_COLORS = {
  mention: 'bg-blue-100 text-blue-700',
  argue_motion: 'bg-orange-100 text-orange-700',
  full_appearance: 'bg-emerald-100 text-emerald-700',
  file_process: 'bg-violet-100 text-violet-700',
  collect_certified_copy: 'bg-teal-100 text-teal-700',
  other: 'bg-gray-100 text-gray-600',
}

function BriefRequestCard({ request }) {
  const { user } = useAuthStore()
  const isOwn = request.requester === user?.id

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Link to={`/brief-connect/requests/${request.id}`}>
        <Card className="p-5 hover:shadow-card-hover hover:border-emerald-200 transition-all group">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
              <BriefcaseIcon className="h-5 w-5 text-emerald-600" />
            </div>

            <div className="flex-1 min-w-0">
              {/* Top row */}
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${BRIEF_TYPE_COLORS[request.brief_type] || 'bg-gray-100 text-gray-600'}`}>
                  {BRIEF_TYPE_LABELS[request.brief_type] || request.brief_type_display}
                </span>
                {request.has_applied && (
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <CheckCircleIcon className="h-3 w-3" />
                    Applied
                  </span>
                )}
                {isOwn && (
                  <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    Your Request
                  </span>
                )}
              </div>

              {/* Judge (primary) + date */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700 mb-1">
                <span className="flex items-center gap-1.5 font-semibold">
                  <UserIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  {request.judge_name || 'Judge TBC'}
                </span>
                <span className="flex items-center gap-1.5">
                  <CalendarDaysIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  {formatDate(request.hearing_date)}
                </span>
              </div>
              {/* Court (secondary) */}
              <p className="text-xs text-gray-500 flex items-center gap-1 mb-2">
                <BuildingLibraryIcon className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                {request.court_name}
              </p>

              {/* Parties */}
              {request.parties && (
                <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                  {request.case_number && <span className="font-medium text-gray-700">{request.case_number} · </span>}
                  {request.parties}
                </p>
              )}

              {/* Footer */}
              <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-gray-50">
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <UserIcon className="h-3.5 w-3.5" />
                    <AnonymousName name={request.requester_name} />
                    {request.requester_year_of_call && ` (${request.requester_year_of_call})`}
                  </span>
                  <span className="flex items-center gap-1">
                    <ClockIcon className="h-3.5 w-3.5" />
                    {timeAgo(request.created_at)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  {request.offered_fee ? (
                    <span className="flex items-center gap-1 font-medium text-gray-700">
                      <BanknotesIcon className="h-3.5 w-3.5 text-emerald-500" />
                      ₦{formatNumber(request.offered_fee)}
                      {request.fee_negotiable && <span className="text-gray-400 font-normal">(neg.)</span>}
                    </span>
                  ) : (
                    <span className="text-gray-400">Fee negotiable</span>
                  )}
                  <span className="text-gray-400">
                    {request.application_count} applicant{request.application_count !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  )
}

export default function BriefConnectPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [briefType, setBriefType] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['brief-connect', 'feed', search, briefType, page],
    queryFn: () => briefConnectAPI.listRequests({
      status: 'open',
      search: search || undefined,
      brief_type: briefType || undefined,
      page,
    }),
    keepPreviousData: true,
  })

  const requests = data?.data?.results || []
  const totalCount = data?.data?.count || 0
  const hasNext = !!data?.data?.next
  const hasPrev = !!data?.data?.previous

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <BriefcaseIcon className="h-4 w-4 text-emerald-700" />
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">BC</span>
            </div>
            <h1 className="text-2xl font-display font-bold text-charcoal-900">Brief Connect</h1>
            <p className="text-sm text-gray-500 mt-0.5">Lawyers helping lawyers — find or offer to hold brief in court</p>
          </div>
          <div className="flex gap-2">
            <Button as={Link} to="/brief-connect/my-briefs" variant="secondary" size="sm">
              My Briefs
            </Button>
            <Button as={Link} to="/brief-connect/post" size="sm" className="flex items-center gap-1.5">
              <PlusIcon className="h-4 w-4" />
              Post Request
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by court, case number, parties…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="input-field pl-9 w-full text-sm"
            />
          </div>
          {/* Brief type filter */}
          <div className="relative sm:w-48">
            <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <select
              value={briefType}
              onChange={(e) => { setBriefType(e.target.value); setPage(1) }}
              className="input-field pl-9 w-full text-sm appearance-none"
            >
              <option value="">All types</option>
              {Object.entries(BRIEF_TYPE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Results */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-xl" />
          ))
        ) : requests.length > 0 ? (
          <>
            <p className="text-xs text-gray-500 font-medium">
              {totalCount} open request{totalCount !== 1 ? 's' : ''}
            </p>
            {requests.map((req) => (
              <BriefRequestCard key={req.id} request={req} />
            ))}

            {/* Pagination */}
            {(hasPrev || hasNext) && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={!hasPrev}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg disabled:opacity-40 hover:border-emerald-300 transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-500">Page {page}</span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!hasNext}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg disabled:opacity-40 hover:border-emerald-300 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <Card className="p-12">
            <EmptyState
              icon={<BriefcaseIcon className="h-10 w-10 text-gray-300" />}
              title="No open brief requests"
              description={search || briefType
                ? "No requests match your filters. Try broadening your search."
                : "Be the first to post a brief request. Other lawyers will see it and apply."
              }
              action={
                <Button as={Link} to="/brief-connect/post" size="sm" className="mt-4">
                  Post a Request
                </Button>
              }
            />
          </Card>
        )}
      </div>
    </div>
  )
}
