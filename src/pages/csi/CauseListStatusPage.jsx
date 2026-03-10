/**
 * CauseListStatusPage
 *
 * Shared terminal page for all CSI court hierarchies.
 * Shows:
 *  1. Sitting status: Sitting | Not Sitting | Status Pending | Risen
 *  2. Cause list: PDF/Image viewer + tabular list of cases
 *
 * Reached via:
 *  - CA:   /csi/federal/CA/:courtId/:panelId
 *  - FHC:  /csi/federal/FHC/:courtId/:judgeId
 *  - NIC:  /csi/federal/NIC/:courtId/:judgeId
 *  - HC:   /csi/state/high-court/:courtId/:divisionId/:judgeId
 *  - Mag:  /csi/state/magistrate/:courtId/:divisionId/:judgeId
 */
import { useState } from 'react'
import { Link, useParams, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ChevronLeftIcon,
  DocumentTextIcon,
  ClockIcon,
  ArrowPathIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  XCircleIcon,
  QuestionMarkCircleIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline'
import { Card, EmptyState } from '@/components/common'
import { causeListsAPI, judgesAPI, courtsAPI } from '@/services/api'
import { formatDate, formatTime } from '@/utils/helpers'
import CauseListImageViewer from '@/components/cause-lists/CauseListImageViewer'

// ── Sitting status config ────────────────────────────────────────────────────
const SITTING_STATUS = {
  sitting: {
    label: 'Sitting',
    sublabel: '(Verified)',
    icon: CheckCircleIcon,
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    iconColor: 'text-emerald-600',
    textColor: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  not_sitting: {
    label: 'Not Sitting',
    sublabel: '(Verified)',
    icon: XCircleIcon,
    bg: 'bg-red-50',
    border: 'border-red-200',
    iconColor: 'text-red-500',
    textColor: 'text-red-700',
    dot: 'bg-red-500',
  },
  risen: {
    label: 'Risen',
    sublabel: '(Verified)',
    icon: ArrowPathIcon,
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    iconColor: 'text-gray-500',
    textColor: 'text-gray-600',
    dot: 'bg-gray-400',
  },
  draft: {
    label: 'Status Pending',
    sublabel: '(Not Yet Confirmed)',
    icon: QuestionMarkCircleIcon,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconColor: 'text-amber-500',
    textColor: 'text-amber-700',
    dot: 'bg-amber-400',
  },
  published: {
    label: 'Cause List Published',
    sublabel: '(Status Pending)',
    icon: QuestionMarkCircleIcon,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconColor: 'text-amber-500',
    textColor: 'text-amber-700',
    dot: 'bg-amber-400',
  },
  adjourned: {
    label: 'Adjourned',
    sublabel: '(Verified)',
    icon: ArrowPathIcon,
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    iconColor: 'text-orange-500',
    textColor: 'text-orange-700',
    dot: 'bg-orange-400',
  },
  cancelled: {
    label: 'Not Sitting',
    sublabel: '(Cancelled)',
    icon: XCircleIcon,
    bg: 'bg-red-50',
    border: 'border-red-200',
    iconColor: 'text-red-500',
    textColor: 'text-red-700',
    dot: 'bg-red-500',
  },
}

// ── Case status badge colours ───────────────────────────────────────────────
const ENTRY_STATUS_COLOR = {
  scheduled: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-emerald-100 text-emerald-700',
  adjourned: 'bg-amber-100 text-amber-700',
  judgment: 'bg-purple-100 text-purple-700',
  ruling: 'bg-indigo-100 text-indigo-700',
  settled: 'bg-teal-100 text-teal-700',
  struck_out: 'bg-red-100 text-red-700',
  completed: 'bg-gray-100 text-gray-600',
}

// ── Derive court context from URL path ──────────────────────────────────────
function useCourtContext() {
  const location = useLocation()
  const path = location.pathname

  if (path.startsWith('/csi/federal/CA')) {
    return {
      courtType: 'CA',
      courtName: 'Court of Appeal',
      entityType: 'panel',
      basePath: '/csi/federal/CA',
      color: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    }
  }
  if (path.startsWith('/csi/federal/FHC')) {
    return {
      courtType: 'FHC',
      courtName: 'Federal High Court',
      entityType: 'judge',
      basePath: '/csi/federal/FHC',
      color: { bg: 'bg-blue-100', text: 'text-blue-700' },
    }
  }
  if (path.startsWith('/csi/federal/NIC')) {
    return {
      courtType: 'NIC',
      courtName: 'National Industrial Court',
      entityType: 'judge',
      basePath: '/csi/federal/NIC',
      color: { bg: 'bg-orange-100', text: 'text-orange-700' },
    }
  }
  if (path.startsWith('/csi/state/high-court')) {
    return {
      courtType: 'SHC',
      courtName: 'State High Court',
      entityType: 'judge',
      basePath: '/csi/state/high-court',
      color: { bg: 'bg-purple-100', text: 'text-purple-700' },
    }
  }
  return {
    courtType: 'MAG',
    courtName: 'Magistrate Court',
    entityType: 'judge',
    basePath: '/csi/state/magistrate',
    color: { bg: 'bg-teal-100', text: 'text-teal-700' },
  }
}

// ── Main component ──────────────────────────────────────────────────────────
export default function CauseListStatusPage() {
  const ctx = useCourtContext()
  const { courtId, panelId, judgeId, divisionId } = useParams()
  const today = new Date().toISOString().split('T')[0]
  const [selectedDate, setSelectedDate] = useState(today)

  const entityId = ctx.entityType === 'panel' ? panelId : judgeId

  // Fetch court info for breadcrumb/header
  const { data: courtData } = useQuery({
    queryKey: ['court', courtId],
    queryFn: () => courtsAPI.get(courtId),
    enabled: !!courtId,
  })

  // Fetch panel info (CA only)
  const { data: panelData } = useQuery({
    queryKey: ['panel', panelId],
    queryFn: () => courtsAPI.getPanel(panelId),
    enabled: !!panelId && ctx.entityType === 'panel',
  })

  // Fetch division info (state courts only — divisionId is a separate UUID)
  const { data: divisionData } = useQuery({
    queryKey: ['division', divisionId],
    queryFn: () => courtsAPI.getDivision(divisionId),
    enabled: !!divisionId,
  })

  // Fetch judge info (for FHC/NIC/State courts)
  const { data: judgeData } = useQuery({
    queryKey: ['judge', judgeId],
    queryFn: () => judgesAPI.get(judgeId),
    enabled: !!judgeId && ctx.entityType === 'judge',
  })

  const court = courtData?.data
  const panel = panelData?.data
  const division = divisionData?.data
  const judge = judgeData?.data

  // Build dynamic breadcrumbs
  const breadcrumbs = (() => {
    const crumbs = [{ label: 'CSI', href: '/csi' }]
    if (ctx.courtType === 'CA' || ctx.courtType === 'FHC' || ctx.courtType === 'NIC') {
      crumbs.push({ label: 'Federal Courts', href: '/csi/federal' })
      crumbs.push({ label: ctx.courtName, href: ctx.basePath })
      crumbs.push({ label: court?.name || '…', href: `${ctx.basePath}/${courtId}` })
      crumbs.push({ label: panel?.name || (judge?.formal_name ? judge.formal_name : '…') })
    } else {
      const stateBase = ctx.courtType === 'SHC' ? '/csi/state/high-court' : '/csi/state/magistrate'
      const stateListLabel = ctx.courtType === 'SHC' ? 'State High Courts' : 'Magistrate Courts'
      crumbs.push({ label: 'State Courts', href: '/csi/state' })
      crumbs.push({ label: stateListLabel, href: stateBase })
      crumbs.push({ label: court?.name || '…', href: `${stateBase}/${courtId}` })
      crumbs.push({ label: division?.name || '…', href: `${stateBase}/${courtId}/${divisionId}` })
      crumbs.push({ label: judge?.formal_name || '…' })
    }
    return crumbs
  })()

  const backHref = (() => {
    if (ctx.entityType === 'panel') return `${ctx.basePath}/${courtId}`
    if (divisionId) return `${ctx.basePath}/${courtId}/${divisionId}`
    return `${ctx.basePath}/${courtId}`
  })()

  // Fetch cause list(s)
  const { data: causeListData, isLoading } = useQuery({
    queryKey: ['causeList', 'status', entityId, selectedDate],
    queryFn: () => {
      if (ctx.entityType === 'judge' && judgeId) {
        return causeListsAPI.getByJudge({ judge_id: judgeId, date: selectedDate })
      }
      return causeListsAPI.list({ date: selectedDate, panel: panelId })
    },
    enabled: !!entityId,
  })

  const causeLists = causeListData?.data?.results || causeListData?.data?.cause_lists || []
  const primaryCauseList = causeLists[0] || null

  const statusKey = primaryCauseList?.status || (isLoading ? null : 'draft')
  const statusInfo = statusKey ? (SITTING_STATUS[statusKey] || SITTING_STATUS.draft) : null

  const caseEntries = primaryCauseList?.entries || []

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <motion.nav
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap"
      >
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-gray-300">/</span>}
            {crumb.href ? (
              <Link to={crumb.href} className="hover:text-emerald-700 transition-colors">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-charcoal-900 font-medium">{crumb.label}</span>
            )}
          </span>
        ))}
      </motion.nav>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-8 h-8 rounded-lg ${ctx.color.bg} flex items-center justify-center`}>
                <DocumentTextIcon className={`h-4 w-4 ${ctx.color.text}`} />
              </div>
              <p className="text-sm text-gray-500">
                {ctx.courtName} · {court?.name || division?.name || '…'}
              </p>
            </div>
            <h1 className="text-2xl font-display font-bold text-charcoal-900">
              {ctx.entityType === 'panel'
                ? (panel?.name || '…')
                : judge
                  ? (judge.formal_name || `${judge.title || 'Hon. Justice'} ${judge.first_name} ${judge.last_name}`)
                  : '…'}
            </h1>
            {judge?.court_number && (
              <p className="text-sm text-gray-500 mt-0.5">Court {judge.court_number}</p>
            )}
          </div>

          {/* Date Picker */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500 font-medium">Viewing date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-field w-44 text-sm"
            />
          </div>
        </div>
      </motion.div>

      {/* Sitting Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {isLoading ? (
          <div className="skeleton h-28 rounded-xl" />
        ) : statusInfo ? (
          <div className={`rounded-2xl border-2 ${statusInfo.border} ${statusInfo.bg} p-6`}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Sitting Status · {formatDate(selectedDate)}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <span className={`w-4 h-4 rounded-full ${statusInfo.dot} inline-block animate-pulse`} />
                <statusInfo.icon className={`h-8 w-8 ${statusInfo.iconColor}`} />
              </div>
              <div>
                <p className={`text-2xl font-bold ${statusInfo.textColor}`}>
                  {statusInfo.label}
                </p>
                <p className={`text-sm ${statusInfo.textColor} opacity-75`}>
                  {statusInfo.sublabel}
                </p>
              </div>
            </div>
            {primaryCauseList?.not_sitting_reason && (
              <p className="mt-3 text-sm text-gray-600 italic">
                Reason: {primaryCauseList.not_sitting_reason}
              </p>
            )}
            {primaryCauseList?.start_time && (
              <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <ClockIcon className="h-4 w-4" />
                  {formatTime(primaryCauseList.start_time)}
                  {primaryCauseList.end_time && ` – ${formatTime(primaryCauseList.end_time)}`}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className={`rounded-2xl border-2 ${SITTING_STATUS.draft.border} ${SITTING_STATUS.draft.bg} p-6`}>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Sitting Status · {formatDate(selectedDate)}
            </p>
            <div className="flex items-center gap-4">
              <QuestionMarkCircleIcon className="h-8 w-8 text-amber-400" />
              <div>
                <p className="text-2xl font-bold text-amber-700">Status Pending</p>
                <p className="text-sm text-amber-600 opacity-75">(Not Yet Confirmed)</p>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Cause List Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-lg font-display font-semibold text-charcoal-900 mb-4 flex items-center gap-2">
          <DocumentTextIcon className="h-5 w-5 text-gray-500" />
          Cause List — {formatDate(selectedDate)}
        </h2>

        {/* Image Viewer */}
        {isLoading ? (
          <div className="skeleton h-80 rounded-2xl mb-4" />
        ) : (primaryCauseList?.images?.length > 0) ? (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <PhotoIcon className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">
                {primaryCauseList.images.length} page{primaryCauseList.images.length !== 1 ? 's' : ''} · photographed at court
              </span>
            </div>
            <CauseListImageViewer
              images={primaryCauseList.images}
              date={formatDate(selectedDate)}
            />
          </div>
        ) : !isLoading && !primaryCauseList ? (
          <Card className="p-10 mb-4">
            <EmptyState
              icon={<BriefcaseIcon className="h-10 w-10 text-gray-300" />}
              title="No cause list available"
              description={`No cause list has been published for ${formatDate(selectedDate)}. Check back later or select a different date.`}
            />
          </Card>
        ) : !isLoading && primaryCauseList && (primaryCauseList.images?.length === 0) ? (
          <Card className="p-8 mb-4 border-dashed">
            <div className="flex items-center gap-3 text-gray-400">
              <PhotoIcon className="h-8 w-8 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-500">Images not yet uploaded</p>
                <p className="text-xs">The cause list exists but photos have not been uploaded yet. Check back soon.</p>
              </div>
            </div>
          </Card>
        ) : null}

        {/* Tabular Case List (supplementary — shown if API entries exist) */}
        {caseEntries.length > 0 && (
          <>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 mt-4">
              Cases ({caseEntries.length})
            </h3>
            <div className="space-y-2">
              {caseEntries.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-sm font-bold text-gray-600">
                        {entry.order_number || i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-charcoal-900 text-sm">
                              {entry.case_number || entry.suit_number || 'Case Number N/A'}
                            </p>
                            <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">
                              {entry.applicant && entry.respondent
                                ? `${entry.applicant} v. ${entry.respondent}`
                                : entry.parties || 'Parties not listed'}
                            </p>
                            {entry.matter_type && (
                              <p className="text-xs text-gray-400 mt-0.5">{entry.matter_type}</p>
                            )}
                          </div>
                          {entry.status && (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${ENTRY_STATUS_COLOR[entry.status] || 'bg-gray-100 text-gray-600'}`}>
                              {entry.status.replace(/_/g, ' ')}
                            </span>
                          )}
                        </div>
                        {entry.scheduled_time && (
                          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                            <ClockIcon className="h-3 w-3" />
                            {formatTime(entry.scheduled_time)}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </motion.div>

      {/* Last Updated */}
      {primaryCauseList?.updated_at && (
        <p className="text-xs text-gray-400 text-right">
          Last updated: {formatDate(primaryCauseList.updated_at)}
        </p>
      )}

      {/* Back link */}
      <div>
        <Link
          to={backHref}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-700 w-fit"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Back
        </Link>
      </div>
    </div>
  )
}
