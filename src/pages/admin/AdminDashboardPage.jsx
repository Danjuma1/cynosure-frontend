import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  BuildingLibraryIcon,
  UserGroupIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  UsersIcon,
  BellIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  PlusIcon,
  Cog6ToothIcon,
  BookOpenIcon,
  ScaleIcon,
} from '@heroicons/react/24/outline'
import { Card, CardHeader, CardTitle, Badge, SkeletonCard, Button } from '@/components/common'
import { adminAPI } from '@/services/api'
import { formatNumber } from '@/utils/helpers'

const statCards = [
  { key: 'courts', label: 'Total Courts', icon: BuildingLibraryIcon, color: 'bg-blue-100 text-blue-700', link: '/admin/courts' },
  { key: 'judges', label: 'Total Judges', icon: ScaleIcon, color: 'bg-purple-100 text-purple-700', link: '/admin/judges' },
  { key: 'cases', label: 'Total Cases', icon: BriefcaseIcon, color: 'bg-emerald-100 text-emerald-700', link: '/admin/cases' },
  { key: 'cause_lists', label: 'Cause Lists Today', icon: DocumentTextIcon, color: 'bg-amber-100 text-amber-700', link: '/admin/cause-lists' },
  { key: 'users', label: 'Registered Users', icon: UsersIcon, color: 'bg-pink-100 text-pink-700', link: '/admin/users' },
  { key: 'notifications', label: 'Notifications Sent', icon: BellIcon, color: 'bg-cyan-100 text-cyan-700', link: '/notifications' },
]

const managementActions = [
  { label: 'Manage Courts', href: '/admin/courts', icon: BuildingLibraryIcon, color: 'bg-blue-100 text-blue-700', description: 'Add, edit, and manage court records' },
  { label: 'Manage Judges', href: '/admin/judges', icon: ScaleIcon, color: 'bg-purple-100 text-purple-700', description: 'Add, edit, and manage judge profiles' },
  { label: 'Manage Cases', href: '/admin/cases', icon: BriefcaseIcon, color: 'bg-emerald-100 text-emerald-700', description: 'Add, edit, and manage case records' },
  { label: 'Manage Cause Lists', href: '/admin/cause-lists', icon: DocumentTextIcon, color: 'bg-amber-100 text-amber-700', description: 'Add, edit, and manage cause lists' },
  { label: 'Manage Users', href: '/admin/users', icon: UsersIcon, color: 'bg-pink-100 text-pink-700', description: 'Manage user accounts and roles' },
  { label: 'System Settings', href: '/admin/system', icon: Cog6ToothIcon, color: 'bg-gray-100 text-gray-700', description: 'Configure system settings and scrapers' },
]

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminAPI.getDashboard(),
  })

  const { data: analytics } = useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: () => adminAPI.getAnalytics(),
  })

  const stats = data?.data || {}
  const analyticsData = analytics?.data || {}

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="skeleton h-28 rounded-xl" />
          ))}
        </div>
        <SkeletonCard />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-display font-bold text-charcoal-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">System overview and management</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link to={stat.link}>
              <Card className="p-5 hover:shadow-card-hover transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-charcoal-900">
                      {formatNumber(stats[stat.key] || 0)}
                    </p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                </div>
                {stats[`${stat.key}_change`] !== undefined && (
                  <div className="mt-3 flex items-center gap-1 text-sm">
                    {stats[`${stat.key}_change`] >= 0 ? (
                      <>
                        <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                        <span className="text-green-600">+{stats[`${stat.key}_change`]}%</span>
                      </>
                    ) : (
                      <>
                        <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                        <span className="text-red-600">{stats[`${stat.key}_change`]}%</span>
                      </>
                    )}
                    <span className="text-gray-500">vs last week</span>
                  </div>
                )}
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Courts by Followers */}
        <Card>
          <CardHeader className="p-6 pb-0">
            <CardTitle>Top Courts by Followers</CardTitle>
            <Link to="/admin/courts" className="text-sm font-medium text-emerald-700">
              View all
            </Link>
          </CardHeader>
          <div className="p-6">
            {analyticsData.top_courts?.length > 0 ? (
              <div className="space-y-4">
                {analyticsData.top_courts.slice(0, 5).map((court, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-sm font-medium flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="font-medium text-charcoal-900">{court.name}</span>
                    </div>
                    <Badge variant="primary">{court.follower_count} followers</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No data available</p>
            )}
          </div>
        </Card>

        {/* Top Judges by Followers */}
        <Card>
          <CardHeader className="p-6 pb-0">
            <CardTitle>Top Judges by Followers</CardTitle>
            <Link to="/admin/judges" className="text-sm font-medium text-emerald-700">
              View all
            </Link>
          </CardHeader>
          <div className="p-6">
            {analyticsData.top_judges?.length > 0 ? (
              <div className="space-y-4">
                {analyticsData.top_judges.slice(0, 5).map((judge, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 text-sm font-medium flex items-center justify-center">
                        {i + 1}
                      </span>
                      <span className="font-medium text-charcoal-900">{judge.formal_name}</span>
                    </div>
                    <Badge variant="primary">{judge.follower_count} followers</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No data available</p>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-6">
          <h3 className="font-semibold text-charcoal-900 mb-4">Management</h3>
          <div className="grid grid-cols-2 gap-3">
            {managementActions.slice(0, 4).map((action) => (
              <Link
                key={action.href}
                to={action.href}
                className="p-4 rounded-lg border border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all text-center"
              >
                <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mx-auto mb-2`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-charcoal-900">{action.label}</p>
              </Link>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h3 className="font-semibold text-charcoal-900 mb-4">Recent System Activity</h3>
          {stats.recent_activity?.length > 0 ? (
            <div className="space-y-3">
              {stats.recent_activity.slice(0, 5).map((activity, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2" />
                  <div>
                    <p className="text-sm text-charcoal-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">{activity.time_ago}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          )}
        </Card>
      </div>

      {/* Full Management Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-charcoal-900 text-lg">Content Management</h3>
          <p className="text-sm text-gray-500">Quick access to all management pages</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {managementActions.map((action) => (
            <Link
              key={action.href}
              to={action.href}
              className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all group"
            >
              <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform`}>
                <action.icon className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-charcoal-900 group-hover:text-emerald-700 transition-colors">{action.label}</p>
                <p className="text-sm text-gray-500 truncate">{action.description}</p>
              </div>
              <PlusIcon className="h-5 w-5 text-gray-400 group-hover:text-emerald-600 flex-shrink-0" />
            </Link>
          ))}
        </div>
      </Card>
    </div>
  )
}
