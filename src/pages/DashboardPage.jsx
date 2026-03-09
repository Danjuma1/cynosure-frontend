import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  DocumentTextIcon,
  BriefcaseIcon,
  BuildingLibraryIcon,
  UserGroupIcon,
  BellIcon,
  ArrowTrendingUpIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import { Card, CardHeader, CardTitle, Badge, Button, SkeletonCard, Avatar } from '@/components/common'
import { causeListsAPI, casesAPI, notificationsAPI, authAPI } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'
import { formatDate, formatTime, timeAgo, CAUSE_LIST_STATUSES, CASE_STATUSES } from '@/utils/helpers'

const statsConfig = [
  { key: 'cases', label: 'Active Cases', icon: BriefcaseIcon, color: 'bg-blue-100 text-blue-700' },
  { key: 'cause_lists', label: "Today's Cause Lists", icon: DocumentTextIcon, color: 'bg-emerald-100 text-emerald-700' },
  { key: 'courts', label: 'Courts Following', icon: BuildingLibraryIcon, color: 'bg-purple-100 text-purple-700' },
  { key: 'judges', label: 'Judges Following', icon: UserGroupIcon, color: 'bg-amber-100 text-amber-700' },
]

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { setCounts } = useNotificationStore()

  // Fetch today's cause lists
  const { data: causeLists, isLoading: causeListsLoading } = useQuery({
    queryKey: ['causeLists', 'today'],
    queryFn: () => causeListsAPI.getDaily({ date: new Date().toISOString().split('T')[0] }),
  })

  // Fetch user's followed cases with upcoming hearings
  const { data: upcomingCases, isLoading: casesLoading } = useQuery({
    queryKey: ['cases', 'upcoming'],
    queryFn: () => casesAPI.list({ next_hearing_from: new Date().toISOString().split('T')[0], limit: 5 }),
  })

  // Fetch notifications count
  const { data: notificationCounts } = useQuery({
    queryKey: ['notifications', 'counts'],
    queryFn: () => notificationsAPI.getCounts(),
    onSuccess: (data) => {
      setCounts(data.data?.unread || 0, data.data?.by_type || {})
    },
  })

  // Fetch user followings for stats
  const { data: followings } = useQuery({
    queryKey: ['followings'],
    queryFn: () => authAPI.getFollowings(),
  })

  const stats = {
    cases: upcomingCases?.data?.count || 0,
    cause_lists: causeLists?.data?.total || 0,
    courts: followings?.data?.courts?.length || 0,
    judges: followings?.data?.judges?.length || 0,
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-charcoal-900">
            Welcome back, {user?.first_name}!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your cases today.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" as={Link} to="/csi">
            Court Sitting Info
          </Button>
          <Button as={Link} to="/cases">
            Search Cases
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsConfig.map((stat, i) => (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="p-5">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-charcoal-900">{stats[stat.key]}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Cause Lists */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="p-6 pb-0">
              <CardTitle className="flex items-center gap-2">
                <CalendarDaysIcon className="h-5 w-5 text-emerald-700" />
                Today's Cause Lists
              </CardTitle>
              <Link to="/csi" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
                View all →
              </Link>
            </CardHeader>

            <div className="p-6">
              {causeListsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="skeleton h-20 rounded-lg" />
                  ))}
                </div>
              ) : causeLists?.data?.cause_lists?.length > 0 ? (
                <div className="space-y-3">
                  {causeLists.data.cause_lists.slice(0, 5).map((list) => (
                    <Link
                      key={list.id}
                      to={`/cause-lists/${list.id}`}
                      className="block p-4 rounded-lg border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-charcoal-900 truncate">
                            {list.court?.name || 'Court'}
                          </p>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {list.judge?.formal_name || 'Judge'} • {list.total_cases} cases
                          </p>
                        </div>
                        <Badge
                          variant={CAUSE_LIST_STATUSES[list.status]?.color || 'neutral'}
                          dot
                        >
                          {CAUSE_LIST_STATUSES[list.status]?.label || list.status}
                        </Badge>
                      </div>
                      {list.start_time && (
                        <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                          <ClockIcon className="h-4 w-4" />
                          {formatTime(list.start_time)}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p>No cause lists for today</p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions & Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="font-semibold text-charcoal-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                to="/cases"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <BriefcaseIcon className="h-5 w-5 text-blue-700" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-charcoal-900">Search Cases</p>
                  <p className="text-sm text-gray-500">Find any case by number or party</p>
                </div>
                <ArrowRightIcon className="h-5 w-5 text-gray-400" />
              </Link>

              <Link
                to="/cause-lists"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <CalendarDaysIcon className="h-5 w-5 text-emerald-700" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-charcoal-900">Daily Schedules</p>
                  <p className="text-sm text-gray-500">View court schedules by date</p>
                </div>
                <ArrowRightIcon className="h-5 w-5 text-gray-400" />
              </Link>

              <Link
                to="/courts"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <BuildingLibraryIcon className="h-5 w-5 text-purple-700" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-charcoal-900">Browse Courts</p>
                  <p className="text-sm text-gray-500">Explore court directory</p>
                </div>
                <ArrowRightIcon className="h-5 w-5 text-gray-400" />
              </Link>
            </div>
          </Card>

          {/* Subscription Status */}
          <Card className="p-6 bg-gradient-to-br from-emerald-50 to-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-charcoal-900">Your Plan</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                user?.subscription_type === 'free' 
                  ? 'bg-gray-100 text-gray-700' 
                  : 'bg-emerald-100 text-emerald-700'
              }`}>
                {user?.subscription_type === 'free' ? 'Free' : 
                 user?.subscription_type === 'professional' ? 'Pro' : 'Enterprise'}
              </span>
            </div>
            {user?.subscription_type === 'free' ? (
              <>
                <p className="text-sm text-gray-600 mb-3">
                  Upgrade to unlock unlimited case tracking and advanced features.
                </p>
                <Button as={Link} to="/subscription" size="sm" className="w-full">
                  Upgrade Plan
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-3">
                  You have access to all {user?.subscription_type === 'professional' ? 'Professional' : 'Enterprise'} features.
                </p>
                <Button as={Link} to="/subscription" variant="secondary" size="sm" className="w-full">
                  Manage Subscription
                </Button>
              </>
            )}
          </Card>

          {/* Recent Notifications */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-charcoal-900">Recent Notifications</h3>
              <Link to="/notifications" className="text-sm font-medium text-emerald-700">
                View all
              </Link>
            </div>

            {notificationCounts?.data?.recent?.length > 0 ? (
              <div className="space-y-3">
                {notificationCounts.data.recent.slice(0, 4).map((notif) => (
                  <div key={notif.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <BellIcon className="h-4 w-4 text-emerald-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-charcoal-900 line-clamp-2">{notif.message}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{timeAgo(notif.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No new notifications</p>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Upcoming Hearings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader className="p-6 pb-0">
            <CardTitle className="flex items-center gap-2">
              <BriefcaseIcon className="h-5 w-5 text-emerald-700" />
              Upcoming Hearings
            </CardTitle>
            <Link to="/cases" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
              View all cases →
            </Link>
          </CardHeader>

          <div className="p-6">
            {casesLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-16 rounded-lg" />
                ))}
              </div>
            ) : upcomingCases?.data?.results?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                        Case
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                        Court
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                        Next Hearing
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {upcomingCases.data.results.map((caseItem) => (
                      <tr key={caseItem.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <Link to={`/cases/${caseItem.id}`} className="group">
                            <p className="font-medium text-charcoal-900 group-hover:text-emerald-700">
                              {caseItem.case_number}
                            </p>
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {caseItem.parties}
                            </p>
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {caseItem.court?.name}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatDate(caseItem.next_hearing_date)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={CASE_STATUSES[caseItem.status]?.color || 'neutral'}>
                            {CASE_STATUSES[caseItem.status]?.label || caseItem.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BriefcaseIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p>No upcoming hearings</p>
                <Button variant="secondary" size="sm" className="mt-4" as={Link} to="/cases">
                  Search for cases to follow
                </Button>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
