/**
 * CauseListStatusPage
 *
 * Shared terminal page for all CSI court hierarchies.
 * Shows:
 *  1. Sitting status: Sitting | Not Sitting | Status Pending | Risen
 *  2. Cause list: PDF/Image viewer + tabular list of cases
 *
 * Reached via:
 *  - CA:   /csi/federal/CA/:divisionId/:panelId
 *  - FHC:  /csi/federal/FHC/:divisionId/:judgeId
 *  - NIC:  /csi/federal/NIC/:divisionId/:judgeId
 *  - HC:   /csi/state/high-court/:stateId/:divisionId/:judgeId
 *  - Mag:  /csi/state/magistrate/:stateId/:divisionId/:judgeId
 */
import { useState } from 'react'
import { Link, useParams, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ChevronLeftIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  ClockIcon,
  ArrowPathIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  XCircleIcon,
  QuestionMarkCircleIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline'
import { Card, Badge, EmptyState } from '@/components/common'
import { causeListsAPI, judgesAPI } from '@/services/api'
import { formatDate, formatTime } from '@/utils/helpers'
import { getCADivision } from '@/data/csi/caData'
import { getFHCDivision } from '@/data/csi/fhcData'
import { getNICDivision } from '@/data/csi/nicData'

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

// ── Derive breadcrumb parent based on URL ───────────────────────────────────
function useCourtContext() {
  const { courtType, divisionId, panelId, judgeId, stateId } = useParams()
  const location = useLocation()
  const path = location.pathname

  if (path.startsWith('/csi/federal/CA')) {
    const division = getCADivision(divisionId)
    return {
      courtType: 'CA',
      courtName: 'Court of Appeal',
      divisionName: division?.name || divisionId,
      entityLabel: panelId?.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      entityType: 'panel',
      entityId: panelId,
      backHref: `/csi/federal/CA/${divisionId}`,
      breadcrumbs: [
        { label: 'CSI', href: '/csi' },
        { label: 'Federal Courts', href: '/csi/federal' },
        { label: 'Court of Appeal', href: '/csi/federal/CA' },
        { label: division?.name || divisionId, href: `/csi/federal/CA/${divisionId}` },
        { label: panelId?.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) },
      ],
      color: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    }
  }

  if (path.startsWith('/csi/federal/FHC')) {
    const division = getFHCDivision(divisionId)
    return {
      courtType: 'FHC',
      courtName: 'Federal High Court',
      divisionName: division?.name || divisionId,
      entityType: 'judge',
      entityId: judgeId,
      backHref: `/csi/federal/FHC/${divisionId}`,
      breadcrumbs: [
        { label: 'CSI', href: '/csi' },
        { label: 'Federal Courts', href: '/csi/federal' },
        { label: 'Federal High Court', href: '/csi/federal/FHC' },
        { label: division?.name || divisionId, href: `/csi/federal/FHC/${divisionId}` },
        { label: 'Judge Cause List' },
      ],
      color: { bg: 'bg-blue-100', text: 'text-blue-700' },
    }
  }

  if (path.startsWith('/csi/federal/NIC')) {
    const division = getNICDivision(divisionId)
    return {
      courtType: 'NIC',
      courtName: 'National Industrial Court',
      divisionName: division?.name || divisionId,
      entityType: 'judge',
      entityId: judgeId,
      backHref: `/csi/federal/NIC/${divisionId}`,
      breadcrumbs: [
        { label: 'CSI', href: '/csi' },
        { label: 'Federal Courts', href: '/csi/federal' },
        { label: 'National Industrial Court', href: '/csi/federal/NIC' },
        { label: division?.name || divisionId, href: `/csi/federal/NIC/${divisionId}` },
        { label: 'Judge Cause List' },
      ],
      color: { bg: 'bg-orange-100', text: 'text-orange-700' },
    }
  }

  if (path.startsWith('/csi/state/high-court')) {
    return {
      courtType: 'SHC',
      courtName: 'State High Court',
      divisionName: divisionId,
      entityType: 'judge',
      entityId: judgeId,
      backHref: `/csi/state/high-court/${stateId}/${divisionId}`,
      breadcrumbs: [
        { label: 'CSI', href: '/csi' },
        { label: 'State Courts', href: '/csi/state' },
        { label: 'State High Courts', href: '/csi/state/high-court' },
        { label: stateId, href: `/csi/state/high-court/${stateId}` },
        { label: divisionId, href: `/csi/state/high-court/${stateId}/${divisionId}` },
        { label: 'Judge Cause List' },
      ],
      color: { bg: 'bg-purple-100', text: 'text-purple-700' },
    }
  }

  // Magistrate
  return {
    courtType: 'MAG',
    courtName: 'Magistrate Court',
    divisionName: divisionId,
    entityType: 'judge',
    entityId: judgeId,
    backHref: `/csi/state/magistrate/${stateId}/${divisionId}`,
    breadcrumbs: [
      { label: 'CSI', href: '/csi' },
      { label: 'State Courts', href: '/csi/state' },
      { label: 'Magistrate Courts', href: '/csi/state/magistrate' },
      { label: stateId, href: `/csi/state/magistrate/${stateId}` },
      { label: divisionId, href: `/csi/state/magistrate/${stateId}/${divisionId}` },
      { label: 'Judge Cause List' },
    ],
    color: { bg: 'bg-teal-100', text: 'text-teal-700' },
  }
}

// ── Main component ──────────────────────────────────────────────────────────
export default function CauseListStatusPage() {
  const ctx = useCourtContext()
  const { judgeId } = useParams()
  const today = new Date().toISOString().split('T')[0]
  const [selectedDate, setSelectedDate] = useState(today)

  // Fetch judge info (for FHC/NIC/State courts)
  const { data: judgeData } = useQuery({
    queryKey: ['judge', judgeId],
    queryFn: () => judgesAPI.get(judgeId),
    enabled: !!judgeId && ctx.entityType === 'judge',
  })

  const judge = judgeData?.data

  // Fetch cause list(s)
  // For CA panels: fetch by court (division-level) since panel filtering may not be supported yet
  // For judges: fetch by judge ID
  const { data: causeListData, isLoading } = useQuery({
    queryKey: ['causeList', 'status', ctx.entityId, selectedDate],
    queryFn: () => {
      if (ctx.entityType === 'judge' && judgeId) {
        return causeListsAPI.getByJudge({ judge_id: judgeId, date: selectedDate })
      }
      // For panels: list with date and panel filter (backend must support panel query param)
      return causeListsAPI.list({ date: selectedDate, panel: ctx.entityId })
    },
    enabled: !!ctx.entityId,
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
        {ctx.breadcrumbs.map((crumb, i) => (
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
              <p className="text-sm text-gray-500">{ctx.courtName} · {ctx.divisionName}</p>
            </div>
            <h1 className="text-2xl font-display font-bold text-charcoal-900">
              {ctx.entityType === 'panel'
                ? ctx.entityLabel
                : judge
                  ? (judge.formal_name || `${judge.title || 'Hon. Justice'} ${judge.first_name} ${judge.last_name}`)
                  : 'Loading...'}
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

        {/* PDF/Image Viewer */}
        {primaryCauseList?.pdf_file ? (
          <Card className="mb-4 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DocumentTextIcon className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-charcoal-900">Official Cause List Document</span>
              </div>
              <a
                href={primaryCauseList.pdf_file}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-800"
              >
                <ArrowUpTrayIcon className="h-4 w-4" />
                Open / Download
              </a>
            </div>
            {primaryCauseList.pdf_file.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
              <img
                src={primaryCauseList.pdf_file}
                alt="Cause List"
                className="w-full"
              />
            ) : (
              <iframe
                src={primaryCauseList.pdf_file}
                title="Cause List PDF"
                className="w-full h-[600px] border-0"
              />
            )}
          </Card>
        ) : null}

        {/* Tabular Case List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-16 rounded-lg" />
            ))}
          </div>
        ) : caseEntries.length > 0 ? (
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
        ) : !primaryCauseList?.pdf_file ? (
          <Card className="p-10">
            <EmptyState
              icon={<BriefcaseIcon className="h-10 w-10 text-gray-300" />}
              title="No cause list available"
              description={`No cause list has been published for ${formatDate(selectedDate)}. Check back later or select a different date.`}
            />
          </Card>
        ) : null}
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
          to={ctx.backHref}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-700 w-fit"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Back
        </Link>
      </div>
    </div>
  )
}
