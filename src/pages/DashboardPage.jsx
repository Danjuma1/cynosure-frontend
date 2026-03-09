import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ScaleIcon,
  BookOpenIcon,
  ArchiveBoxIcon,
  NewspaperIcon,
  ClipboardDocumentListIcon,
  SparklesIcon,
  BellIcon,
  ArrowRightIcon,
  CheckBadgeIcon,
  LockClosedIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline'
import { Card, Button } from '@/components/common'
import { notificationsAPI } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'
import { timeAgo } from '@/utils/helpers'

const features = [
  {
    name: 'Court Sitting Information',
    abbr: 'CSI',
    description: 'Track daily cause lists, sitting status, and judge schedules across federal and state courts.',
    href: '/csi',
    icon: ScaleIcon,
    color: 'emerald',
    active: true,
    stats: ['Federal Courts', 'State High Courts', 'Magistrate Courts'],
  },
  {
    name: 'Law Reports',
    abbr: 'LR',
    description: 'Access curated Nigerian law reports and case citations from superior courts.',
    icon: BookOpenIcon,
    color: 'blue',
    active: false,
  },
  {
    name: 'Law Repository',
    abbr: 'LRP',
    description: 'Searchable database of statutes, rules, practice directions, and legal instruments.',
    icon: ArchiveBoxIcon,
    color: 'violet',
    active: false,
  },
  {
    name: 'News & Legal Updates',
    abbr: 'NLU',
    description: 'Curated legal news, court circulars, and practice updates across Nigerian jurisdictions.',
    icon: NewspaperIcon,
    color: 'amber',
    active: false,
  },
  {
    name: 'E-Filing & Computation of Time',
    abbr: 'ECT',
    description: 'Automated time computation under court rules and e-filing support for legal processes.',
    icon: ClipboardDocumentListIcon,
    color: 'teal',
    active: false,
  },
  {
    name: 'AI Powered Drafting',
    abbr: 'AI',
    description: 'Intelligent drafting assistant for court processes, legal opinions, and correspondence.',
    icon: SparklesIcon,
    color: 'rose',
    active: false,
  },
]

const colorMap = {
  emerald: { bg: 'bg-emerald-100', icon: 'text-emerald-700', badge: 'bg-emerald-700 text-white', border: 'border-emerald-200', hover: 'hover:border-emerald-300', tag: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  blue:    { bg: 'bg-blue-100',    icon: 'text-blue-700',    badge: 'bg-blue-100 text-blue-600',   border: 'border-gray-200',    hover: 'hover:border-gray-300',    tag: 'bg-gray-100 text-gray-400 border-gray-200' },
  violet:  { bg: 'bg-violet-100',  icon: 'text-violet-700',  badge: 'bg-blue-100 text-blue-600',   border: 'border-gray-200',    hover: 'hover:border-gray-300',    tag: 'bg-gray-100 text-gray-400 border-gray-200' },
  amber:   { bg: 'bg-amber-100',   icon: 'text-amber-700',   badge: 'bg-blue-100 text-blue-600',   border: 'border-gray-200',    hover: 'hover:border-gray-300',    tag: 'bg-gray-100 text-gray-400 border-gray-200' },
  teal:    { bg: 'bg-teal-100',    icon: 'text-teal-700',    badge: 'bg-blue-100 text-blue-600',   border: 'border-gray-200',    hover: 'hover:border-gray-300',    tag: 'bg-gray-100 text-gray-400 border-gray-200' },
  rose:    { bg: 'bg-rose-100',    icon: 'text-rose-700',    badge: 'bg-blue-100 text-blue-600',   border: 'border-gray-200',    hover: 'hover:border-gray-300',    tag: 'bg-gray-100 text-gray-400 border-gray-200' },
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const { setCounts } = useNotificationStore()

  const { data: notifData } = useQuery({
    queryKey: ['notifications', 'counts'],
    queryFn: () => notificationsAPI.getCounts(),
    onSuccess: (data) => {
      setCounts(data.data?.unread || 0, data.data?.by_type || {})
    },
  })

  const recentNotifs = notifData?.data?.recent || []
  const today = new Date().toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  const [csi, ...comingSoon] = features

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-charcoal-900">
            Welcome back, {user?.first_name}!
          </h1>
          <p className="text-gray-500 mt-1 flex items-center gap-1.5 text-sm">
            <CalendarDaysIcon className="h-4 w-4" />
            {today}
          </p>
        </div>
      </motion.div>

      {/* Active Feature — CSI Hero Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <Link to={csi.href}>
          <Card className="p-6 border-emerald-200 hover:shadow-card-hover hover:border-emerald-300 transition-all group bg-gradient-to-br from-emerald-50/60 to-white">
            <div className="flex flex-col sm:flex-row sm:items-start gap-5">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <ScaleIcon className="h-8 w-8 text-emerald-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-display font-bold text-charcoal-900 group-hover:text-emerald-700 transition-colors">
                    {csi.name}
                  </h2>
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <CheckBadgeIcon className="h-3 w-3" />
                    Live
                  </span>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{csi.description}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {csi.stats.map((s) => (
                    <span key={s} className="text-xs bg-white border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-full font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="hidden sm:flex items-center self-center">
                <ArrowRightIcon className="h-6 w-6 text-gray-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </Card>
        </Link>
      </motion.div>

      {/* Coming Soon Features Grid */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Coming Soon</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {comingSoon.map((feature, i) => {
            const c = colorMap[feature.color]
            return (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.06 }}
              >
                <Card className={`p-5 border ${c.border} opacity-75`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center`}>
                      <feature.icon className={`h-5 w-5 ${c.icon}`} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded">
                        {feature.abbr}
                      </span>
                      <LockClosedIcon className="h-3.5 w-3.5 text-gray-300" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-charcoal-900 text-sm mb-1">{feature.name}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{feature.description}</p>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400 font-medium">Coming soon</span>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Bottom Row: Notifications + Plan */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.36 }}
        className="grid sm:grid-cols-2 gap-6"
      >
        {/* Recent Notifications */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-charcoal-900">Recent Notifications</h3>
            <Link to="/notifications" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
              View all
            </Link>
          </div>
          {recentNotifs.length > 0 ? (
            <div className="space-y-3">
              {recentNotifs.slice(0, 4).map((notif) => (
                <div key={notif.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <BellIcon className="h-4 w-4 text-emerald-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-charcoal-900 line-clamp-2">{notif.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{timeAgo(notif.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6">No new notifications</p>
          )}
        </Card>

        {/* Plan */}
        <Card className="p-6 bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-charcoal-900">Your Plan</h3>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
              user?.subscription_type === 'free'
                ? 'bg-gray-100 text-gray-600'
                : 'bg-emerald-100 text-emerald-700'
            }`}>
              {user?.subscription_type === 'free' ? 'Free'
                : user?.subscription_type === 'professional' ? 'Pro'
                : 'Enterprise'}
            </span>
          </div>
          {user?.subscription_type === 'free' ? (
            <>
              <p className="text-sm text-gray-600 mb-4">
                Upgrade to unlock priority access to new features as they launch, including Law Reports, AI Drafting, and more.
              </p>
              <Button as={Link} to="/subscription" size="sm" className="w-full">
                Upgrade Plan
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-4">
                You have early access to all new features as they become available on the platform.
              </p>
              <Button as={Link} to="/subscription" variant="secondary" size="sm" className="w-full">
                Manage Subscription
              </Button>
            </>
          )}
        </Card>
      </motion.div>
    </div>
  )
}
