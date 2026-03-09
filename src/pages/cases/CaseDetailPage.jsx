import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  ArrowLeftIcon,
  HeartIcon,
  BuildingLibraryIcon,
  UserIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  ClockIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'
import { Card, CardHeader, CardTitle, Button, Badge, Tabs, SkeletonCard, Avatar } from '@/components/common'
import { casesAPI } from '@/services/api'
import { formatDate, formatDateTime, CASE_STATUSES, getErrorMessage } from '@/utils/helpers'

export default function CaseDetailPage() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('overview')

  const { data, isLoading, error } = useQuery({
    queryKey: ['case', id],
    queryFn: () => casesAPI.get(id),
  })

  const { data: timeline } = useQuery({
    queryKey: ['case', id, 'timeline'],
    queryFn: () => casesAPI.getTimeline(id),
    enabled: activeTab === 'timeline',
  })

  const { data: hearings } = useQuery({
    queryKey: ['case', id, 'hearings'],
    queryFn: () => casesAPI.getHearings(id),
    enabled: activeTab === 'hearings',
  })

  const followMutation = useMutation({
    mutationFn: () => casesAPI.follow(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['case', id])
      toast.success('Now following this case')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const unfollowMutation = useMutation({
    mutationFn: () => casesAPI.unfollow(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['case', id])
      toast.success('Unfollowed this case')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const caseData = data?.data?.data || data?.data

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    )
  }

  if (error || !caseData) {
    return (
      <Card className="p-12 text-center">
        <h2 className="text-xl font-semibold text-charcoal-900 mb-2">Case not found</h2>
        <p className="text-gray-600 mb-4">The case you're looking for doesn't exist.</p>
        <Button as={Link} to="/cases">Back to Cases</Button>
      </Card>
    )
  }

  const isFollowing = caseData.is_following

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'hearings', label: 'Hearings', count: caseData.total_hearings },
    { id: 'timeline', label: 'Timeline' },
    { id: 'documents', label: 'Documents' },
  ]

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        to="/cases"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-charcoal-900"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to Cases
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-display font-bold text-charcoal-900">
                  {caseData.case_number}
                </h1>
                <Badge
                  variant={CASE_STATUSES[caseData.status]?.color || 'neutral'}
                  size="lg"
                >
                  {CASE_STATUSES[caseData.status]?.label || caseData.status}
                </Badge>
              </div>
              <p className="text-lg text-gray-700">{caseData.parties}</p>
              
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <BuildingLibraryIcon className="h-4 w-4" />
                  <Link to={`/courts/${caseData.court?.id}`} className="hover:text-emerald-700">
                    {caseData.court?.name}
                  </Link>
                </div>
                {caseData.judge && (
                  <div className="flex items-center gap-1.5">
                    <UserIcon className="h-4 w-4" />
                    <Link to={`/judges/${caseData.judge?.id}`} className="hover:text-emerald-700">
                      {caseData.judge?.formal_name}
                    </Link>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <CalendarDaysIcon className="h-4 w-4" />
                  Filed: {formatDate(caseData.filing_date)}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant={isFollowing ? 'secondary' : 'primary'}
                leftIcon={isFollowing ? <HeartSolidIcon className="h-5 w-5 text-red-500" /> : <HeartIcon className="h-5 w-5" />}
                onClick={() => isFollowing ? unfollowMutation.mutate() : followMutation.mutate()}
                isLoading={followMutation.isPending || unfollowMutation.isPending}
              >
                {isFollowing ? 'Following' : 'Follow Case'}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'overview' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Case Details */}
              <Card className="p-6">
                <h3 className="font-semibold text-charcoal-900 mb-4">Case Details</h3>
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-gray-500">Case Type</dt>
                    <dd className="font-medium text-charcoal-900 capitalize">{caseData.case_type}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Division</dt>
                    <dd className="font-medium text-charcoal-900">{caseData.division?.name || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Applicant</dt>
                    <dd className="font-medium text-charcoal-900">{caseData.applicant || '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Respondent</dt>
                    <dd className="font-medium text-charcoal-900">{caseData.respondent || '-'}</dd>
                  </div>
                  {caseData.applicant_counsel && (
                    <div>
                      <dt className="text-sm text-gray-500">Applicant Counsel</dt>
                      <dd className="font-medium text-charcoal-900">{caseData.applicant_counsel}</dd>
                    </div>
                  )}
                  {caseData.respondent_counsel && (
                    <div>
                      <dt className="text-sm text-gray-500">Respondent Counsel</dt>
                      <dd className="font-medium text-charcoal-900">{caseData.respondent_counsel}</dd>
                    </div>
                  )}
                </dl>
              </Card>

              {/* Next Hearing */}
              {caseData.next_hearing_date && (
                <Card className="p-6 border-l-4 border-emerald-500">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-emerald-700">Next Hearing</p>
                      <p className="text-2xl font-bold text-charcoal-900 mt-1">
                        {formatDate(caseData.next_hearing_date)}
                      </p>
                      {caseData.next_hearing_time && (
                        <p className="text-gray-600 mt-1">at {caseData.next_hearing_time}</p>
                      )}
                    </div>
                    <CalendarDaysIcon className="h-10 w-10 text-emerald-200" />
                  </div>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Statistics */}
              <Card className="p-6">
                <h3 className="font-semibold text-charcoal-900 mb-4">Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Hearings</span>
                    <span className="font-medium">{caseData.total_hearings || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Adjournments</span>
                    <span className="font-medium">{caseData.total_adjournments || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Followers</span>
                    <span className="font-medium">{caseData.follower_count || 0}</span>
                  </div>
                </div>
              </Card>

              {/* Recent Activity */}
              <Card className="p-6">
                <h3 className="font-semibold text-charcoal-900 mb-4">Recent Activity</h3>
                {caseData.recent_hearings?.length > 0 ? (
                  <div className="space-y-3">
                    {caseData.recent_hearings.slice(0, 3).map((hearing, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2" />
                        <div>
                          <p className="text-sm font-medium text-charcoal-900">{hearing.outcome}</p>
                          <p className="text-xs text-gray-500">{formatDate(hearing.date)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No recent activity</p>
                )}
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'hearings' && (
          <Card className="overflow-hidden">
            {hearings?.data?.results?.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {hearings.data.results.map((hearing) => (
                  <div key={hearing.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-charcoal-900">
                          {formatDate(hearing.date)}
                        </p>
                        <Badge variant={hearing.outcome === 'adjourned' ? 'warning' : 'success'} className="mt-1">
                          {hearing.outcome}
                        </Badge>
                      </div>
                      {hearing.next_date && (
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Next Date</p>
                          <p className="font-medium">{formatDate(hearing.next_date)}</p>
                        </div>
                      )}
                    </div>
                    {hearing.notes && (
                      <p className="text-gray-600 mt-3">{hearing.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500">
                No hearing records found
              </div>
            )}
          </Card>
        )}

        {activeTab === 'timeline' && (
          <Card className="p-6">
            {timeline?.data?.results?.length > 0 ? (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                <div className="space-y-6">
                  {timeline.data.results.map((event, i) => (
                    <div key={i} className="relative pl-10">
                      <div className="absolute left-2.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                      <div>
                        <p className="font-medium text-charcoal-900">{event.title}</p>
                        <p className="text-sm text-gray-500">{formatDateTime(event.event_date)}</p>
                        {event.description && (
                          <p className="text-gray-600 mt-1">{event.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No timeline events
              </div>
            )}
          </Card>
        )}

        {activeTab === 'documents' && (
          <Card className="p-12 text-center">
            <DocumentTextIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Document management coming soon</p>
          </Card>
        )}
      </motion.div>
    </div>
  )
}
