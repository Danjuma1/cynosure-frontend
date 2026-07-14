/**
 * MyBriefsPage — personal dashboard for Brief Connect.
 * Three tabs:
 *  1. My Requests — briefs I posted
 *  2. My Applications — requests I applied to
 *  3. Engagements — confirmed + completed arrangements
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  BriefcaseIcon,
  PlusIcon,
  ChevronLeftIcon,
  CalendarDaysIcon,
  BuildingLibraryIcon,
  BanknotesIcon,
  UserIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowRightIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline'
import { Card, Button, EmptyState, Tabs } from '@/components/common'
import AnonymousName from '@/components/brief-connect/AnonymousName'
import { briefConnectAPI } from '@/services/api'
import { formatDate, formatNumber, timeAgo } from '@/utils/helpers'

const STATUS_COLORS = {
  open: 'bg-emerald-100 text-emerald-700',
  accepted: 'bg-blue-100 text-blue-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-700',
  expired: 'bg-amber-100 text-amber-700',
}

const ENG_STATUS_COLORS = {
  confirmed: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-gray-100 text-gray-600',
  disputed: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-600',
}

function RequestRow({ req }) {
  return (
    <Link to={`/brief-connect/requests/${req.id}`}>
      <Card className="p-4 hover:border-emerald-200 hover:shadow-sm transition-all group">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[req.status] || 'bg-gray-100 text-gray-600'}`}>
                {req.status_display}
              </span>
              <span className="text-xs text-gray-500">{req.brief_type_display}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
              <span className="flex items-center gap-1">
                <BuildingLibraryIcon className="h-4 w-4 text-gray-400" />
                {req.court_name}
              </span>
              <span className="flex items-center gap-1">
                <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                {formatDate(req.hearing_date)}
              </span>
            </div>
            {req.parties && <p className="text-xs text-gray-500 mt-1 line-clamp-1">{req.parties}</p>}
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
              <span>{req.application_count} applicant{req.application_count !== 1 ? 's' : ''}</span>
              <span>{timeAgo(req.created_at)}</span>
            </div>
          </div>
          <ArrowRightIcon className="h-4 w-4 text-gray-300 group-hover:text-emerald-500 flex-shrink-0 mt-1 transition-colors" />
        </div>
      </Card>
    </Link>
  )
}

function ApplicationRow({ req }) {
  const myApp = req.my_application
  return (
    <Link to={`/brief-connect/requests/${req.id}`}>
      <Card className="p-4 hover:border-blue-200 hover:shadow-sm transition-all group">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {myApp && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  myApp.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                  myApp.status === 'rejected' ? 'bg-red-100 text-red-700' :
                  myApp.status === 'withdrawn' ? 'bg-gray-100 text-gray-500' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {myApp.status_display}
                </span>
              )}
              <span className="text-xs text-gray-500">{req.brief_type_display}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
              <span className="flex items-center gap-1">
                <BuildingLibraryIcon className="h-4 w-4 text-gray-400" />
                {req.court_name}
              </span>
              <span className="flex items-center gap-1">
                <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                {formatDate(req.hearing_date)}
              </span>
            </div>
            {myApp?.proposed_fee && (
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <BanknotesIcon className="h-3.5 w-3.5 text-emerald-500" />
                ₦{formatNumber(myApp.proposed_fee)} proposed
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              Posted by <AnonymousName name={req.requester_name} /> · {timeAgo(req.created_at)}
            </p>
          </div>
          <ArrowRightIcon className="h-4 w-4 text-gray-300 group-hover:text-blue-400 flex-shrink-0 mt-1 transition-colors" />
        </div>
      </Card>
    </Link>
  )
}

function EngagementRow({ eng }) {
  return (
    <Card className="p-4 hover:border-emerald-200 hover:shadow-sm transition-all group">
      <Link to={`/brief-connect/requests/${eng.brief_request}`} className="block">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ENG_STATUS_COLORS[eng.status] || 'bg-gray-100 text-gray-600'}`}>
                {eng.status_display}
              </span>
              <span className="text-xs text-gray-500">{eng.brief_type_display}</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
              <span className="flex items-center gap-1">
                <BuildingLibraryIcon className="h-4 w-4 text-gray-400" />
                {eng.court_name}
              </span>
              <span className="flex items-center gap-1">
                <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                {formatDate(eng.hearing_date)}
              </span>
            </div>
            {eng.parties && <p className="text-xs text-gray-500 mt-1 line-clamp-1">{eng.parties}</p>}
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
              {eng.agreed_fee && (
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                  <BanknotesIcon className="h-3.5 w-3.5" />
                  ₦{formatNumber(eng.agreed_fee)} agreed
                </span>
              )}
              <span className="flex items-center gap-1">
                <UserIcon className="h-3.5 w-3.5" />
                <AnonymousName name={eng.holding_lawyer_name} />
              </span>
            </div>
          </div>
          <ArrowRightIcon className="h-4 w-4 text-gray-300 group-hover:text-emerald-500 flex-shrink-0 mt-1 transition-colors" />
        </div>
      </Link>
      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
        <Link
          to={`/brief-connect/engagements/${eng.id}/chat`}
          className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-800"
        >
          <ChatBubbleLeftRightIcon className="h-3.5 w-3.5" />
          Open Chat
        </Link>
      </div>
    </Card>
  )
}

export default function MyBriefsPage() {
  const [tab, setTab] = useState('requests')

  const { data: reqData, isLoading: reqLoading } = useQuery({
    queryKey: ['brief-connect', 'my-requests'],
    queryFn: () => briefConnectAPI.myRequests(),
    enabled: tab === 'requests',
  })

  const { data: appData, isLoading: appLoading } = useQuery({
    queryKey: ['brief-connect', 'my-applications'],
    queryFn: () => briefConnectAPI.myApplications(),
    enabled: tab === 'applications',
  })

  const { data: engData, isLoading: engLoading } = useQuery({
    queryKey: ['brief-connect', 'engagements'],
    queryFn: () => briefConnectAPI.listEngagements(),
    enabled: tab === 'engagements',
  })

  const myRequests = reqData?.data?.results || reqData?.data || []
  const myApplications = appData?.data?.results || appData?.data || []
  const engagements = engData?.data?.results || engData?.data || []

  const tabs = [
    { key: 'requests', label: `My Requests (${myRequests.length || '…'})` },
    { key: 'applications', label: `My Applications (${myApplications.length || '…'})` },
    { key: 'engagements', label: `Engagements (${engagements.length || '…'})` },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Link
          to="/brief-connect"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-700 mb-4 w-fit"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Brief Connect
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold text-charcoal-900">My Briefs</h1>
          <Button as={Link} to="/brief-connect/post" size="sm" className="flex items-center gap-1.5">
            <PlusIcon className="h-4 w-4" />
            Post Request
          </Button>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-0">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="space-y-3">
        {tab === 'requests' && (
          reqLoading ? (
            Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)
          ) : myRequests.length > 0 ? (
            myRequests.map((req) => <RequestRow key={req.id} req={req} />)
          ) : (
            <Card className="p-10">
              <EmptyState
                icon={<BriefcaseIcon className="h-9 w-9 text-gray-300" />}
                title="No brief requests posted"
                description="When you need another lawyer to hold your brief, post a request here."
                action={
                  <Button as={Link} to="/brief-connect/post" size="sm" className="mt-3">
                    Post First Request
                  </Button>
                }
              />
            </Card>
          )
        )}

        {tab === 'applications' && (
          appLoading ? (
            Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)
          ) : myApplications.length > 0 ? (
            myApplications.map((req) => <ApplicationRow key={req.id} req={req} />)
          ) : (
            <Card className="p-10">
              <EmptyState
                icon={<CheckCircleIcon className="h-9 w-9 text-gray-300" />}
                title="No applications yet"
                description="Browse open brief requests and apply to hold brief for other lawyers."
                action={
                  <Button as={Link} to="/brief-connect" size="sm" className="mt-3">
                    Browse Requests
                  </Button>
                }
              />
            </Card>
          )
        )}

        {tab === 'engagements' && (
          engLoading ? (
            Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)
          ) : engagements.length > 0 ? (
            engagements.map((eng) => <EngagementRow key={eng.id} eng={eng} />)
          ) : (
            <Card className="p-10">
              <EmptyState
                icon={<ClockIcon className="h-9 w-9 text-gray-300" />}
                title="No engagements yet"
                description="Confirmed brief arrangements will appear here."
              />
            </Card>
          )
        )}
      </div>
    </div>
  )
}
