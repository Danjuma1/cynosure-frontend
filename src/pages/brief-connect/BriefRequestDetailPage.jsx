/**
 * BriefRequestDetailPage — full detail view of a brief request.
 *
 * Shows to all lawyers:
 *  - Full request details
 *  - Apply form (if not own request and not already applied)
 *
 * Shows additionally to the requester:
 *  - All applications with accept / reject actions
 *  - Engagement details once accepted
 */
import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  BriefcaseIcon,
  ChevronLeftIcon,
  BuildingLibraryIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  UserIcon,
  ClockIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolid } from '@heroicons/react/24/solid'
import { Card, Button, EmptyState } from '@/components/common'
import AnonymousName from '@/components/brief-connect/AnonymousName'
import PolicyAcceptModal from '@/components/brief-connect/PolicyAcceptModal'
import FeeCalculator from '@/components/brief-connect/FeeCalculator'
import OfferThread from '@/components/brief-connect/OfferThread'
import EngagementCompletionPanel from '@/components/brief-connect/EngagementCompletionPanel'
import { usePolicyGate } from '@/hooks/usePolicyGate'
import { briefConnectAPI } from '@/services/api'
import { formatDate, formatNumber, timeAgo, getErrorMessage } from '@/utils/helpers'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

const BRIEF_TYPE_COLORS = {
  mention: 'bg-blue-100 text-blue-700',
  argue_motion: 'bg-orange-100 text-orange-700',
  full_appearance: 'bg-emerald-100 text-emerald-700',
  file_process: 'bg-violet-100 text-violet-700',
  collect_certified_copy: 'bg-teal-100 text-teal-700',
  other: 'bg-gray-100 text-gray-600',
}

const STATUS_COLORS = {
  open: 'bg-emerald-100 text-emerald-700',
  accepted: 'bg-blue-100 text-blue-700',
  completed: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-700',
  expired: 'bg-amber-100 text-amber-700',
}

function StarRating({ value }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) =>
        n <= value
          ? <StarSolid key={n} className="h-4 w-4 text-amber-400" />
          : <StarIcon key={n} className="h-4 w-4 text-gray-200" />
      )}
    </div>
  )
}

function ApplicationCard({ application, isRequester, onAccept, onReject, accepting, rejecting, fallbackFee }) {
  return (
    <Card className="p-4">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <p className="font-medium text-charcoal-900 text-sm">
              <AnonymousName name={application.applicant_name} />
            </p>
            {application.applicant_title && (
              <span className="text-xs text-gray-500">{application.applicant_title}</span>
            )}
            {application.average_rating && (
              <div className="flex items-center gap-1">
                <StarRating value={Math.round(application.average_rating)} />
                <span className="text-xs text-gray-500">
                  {application.average_rating} ({application.review_count})
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-2">
            {application.applicant_bar_number && (
              <span>Bar No: {application.applicant_bar_number}</span>
            )}
            {application.applicant_year_of_call && (
              <span>Called: {application.applicant_year_of_call}</span>
            )}
            <span>{timeAgo(application.created_at)}</span>
          </div>
          {application.applicant_specializations?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {application.applicant_specializations.slice(0, 4).map((s) => (
                <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s}</span>
              ))}
            </div>
          )}
          {application.message && (
            <p className="text-sm text-gray-600 mt-1">{application.message}</p>
          )}
          <div className="mt-2">
            <OfferThread
              applicationId={application.id}
              openingAmount={application.proposed_fee ?? fallbackFee}
              openingProposedByName={application.applicant_name}
              isRequesterView
              disabled={application.status !== 'pending'}
            />
          </div>
        </div>

        {isRequester && application.status === 'pending' && (
          <div className="flex gap-2 flex-shrink-0">
            <Button
              size="sm"
              onClick={() => onAccept(application.id)}
              disabled={accepting}
              className="flex items-center gap-1"
            >
              <CheckCircleIcon className="h-4 w-4" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onReject(application.id)}
              disabled={rejecting}
              className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
            >
              <XCircleIcon className="h-4 w-4" />
              Reject
            </Button>
          </div>
        )}
        {application.status !== 'pending' && (
          <span className={`flex-shrink-0 text-xs font-medium px-2 py-1 rounded-full ${
            application.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
            application.status === 'rejected' ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-600'
          }`}>
            {application.status_display}
          </span>
        )}
      </div>
    </Card>
  )
}

export default function BriefRequestDetailPage() {
  const { id } = useParams()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const [applyForm, setApplyForm] = useState({ proposed_fee: '', message: '' })
  const [showApplyForm, setShowApplyForm] = useState(false)
  const [applyError, setApplyError] = useState('')
  const applyPolicyGate = usePolicyGate('applying')

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['brief-request', id],
    queryFn: () => briefConnectAPI.getRequest(id),
  })

  const req = data?.data
  const isRequester = user?.id === req?.requester
  const isAccepted = req?.status === 'accepted'
  const isOpen = req?.status === 'open'

  const applyMutation = useMutation({
    mutationFn: (payload) => briefConnectAPI.apply(id, payload),
    onSuccess: () => {
      toast.success('Application submitted!')
      setShowApplyForm(false)
      refetch()
    },
    onError: (err) => setApplyError(getErrorMessage(err)),
  })

  const withdrawMutation = useMutation({
    mutationFn: () => briefConnectAPI.withdrawApplication(id),
    onSuccess: () => {
      toast.success('Application withdrawn.')
      refetch()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const acceptMutation = useMutation({
    mutationFn: (applicationId) => briefConnectAPI.acceptApplication(id, applicationId),
    onSuccess: () => {
      toast.success('Application accepted! Engagement created.')
      refetch()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const rejectMutation = useMutation({
    mutationFn: (applicationId) => briefConnectAPI.rejectApplication(id, applicationId),
    onSuccess: () => {
      toast.success('Application rejected.')
      refetch()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const cancelMutation = useMutation({
    mutationFn: () => briefConnectAPI.cancelRequest(id),
    onSuccess: () => {
      toast.success('Request cancelled.')
      navigate('/brief-connect/my-briefs')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-6 w-32 rounded" />
        <div className="skeleton h-48 rounded-xl" />
        <div className="skeleton h-32 rounded-xl" />
      </div>
    )
  }

  if (!req) {
    return (
      <Card className="p-12">
        <EmptyState icon={<BriefcaseIcon className="h-10 w-10 text-gray-300" />} title="Request not found" />
      </Card>
    )
  }

  const myApp = req.my_application
  const engagement = req.engagement
  const applications = req.applications || []

  return (
    <div className="max-w-2xl space-y-6">
      {/* Back */}
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
        <Link
          to="/brief-connect"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-700 w-fit"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Brief Connect
        </Link>
      </motion.div>

      {/* Detail Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-6">
          {/* Status + Type badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[req.status] || 'bg-gray-100 text-gray-600'}`}>
              {req.status_display}
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${BRIEF_TYPE_COLORS[req.brief_type] || 'bg-gray-100 text-gray-600'}`}>
              {req.brief_type_display}
            </span>
          </div>

          {/* Judge (primary) + date */}
          <div className="flex flex-wrap gap-4 mb-1">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <UserIcon className="h-4 w-4 text-gray-400" />
              <span className="font-semibold">{req.judge_name || 'Judge TBC'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
              {formatDate(req.hearing_date)}
            </div>
          </div>
          {/* Court (secondary) */}
          <p className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
            <BuildingLibraryIcon className="h-3.5 w-3.5 text-gray-400" />
            {req.court_name}
          </p>

          {/* Case info */}
          {(req.case_number || req.parties) && (
            <div className="bg-gray-50 rounded-xl px-4 py-3 mb-4">
              {req.case_number && <p className="text-xs font-medium text-gray-500 mb-0.5">Case Number</p>}
              {req.case_number && <p className="text-sm font-semibold text-charcoal-900">{req.case_number}</p>}
              {req.parties && <p className="text-sm text-gray-600 mt-1">{req.parties}</p>}
            </div>
          )}

          {/* Instructions */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Instructions</p>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{req.instructions}</p>
          </div>

          {/* Fee + deadline */}
          <div className="flex flex-wrap gap-4 text-sm pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5">
              <BanknotesIcon className="h-4 w-4 text-emerald-500" />
              {req.offered_fee
                ? <span>₦{formatNumber(req.offered_fee)}{req.fee_negotiable ? ' (negotiable)' : ''}</span>
                : <span className="text-gray-500">Fee negotiable</span>}
            </div>
            {req.deadline && (
              <div className="flex items-center gap-1.5 text-gray-500">
                <ClockIcon className="h-4 w-4" />
                Deadline: {formatDate(req.deadline)}
              </div>
            )}
            <div className="flex items-center gap-1.5 text-gray-500">
              <UserIcon className="h-4 w-4" />
              <AnonymousName name={req.requester_name} />
              {req.requester_year_of_call && ` · Called ${req.requester_year_of_call}`}
            </div>
          </div>

          {/* Requester controls */}
          {isRequester && isOpen && (
            <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
              <Button
                as={Link}
                to={`/brief-connect/requests/${id}/edit`}
                variant="secondary"
                size="sm"
              >
                Edit
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isLoading}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                Cancel Request
              </Button>
            </div>
          )}
        </Card>
      </motion.div>

      {/* ── Engagement section (after acceptance) ── */}
      {engagement && (isRequester || user?.id === engagement.holding_lawyer) && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-charcoal-900">Engagement</h2>
            <Button as={Link} to={`/brief-connect/engagements/${engagement.id}/chat`} size="sm" variant="secondary" className="flex items-center gap-1.5">
              <ChatBubbleLeftRightIcon className="h-4 w-4" />
              Open Chat
            </Button>
          </div>
          <Card className="p-5 border-emerald-200 bg-emerald-50/30">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                engagement.status === 'completed' ? 'bg-gray-100 text-gray-600' :
                engagement.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                engagement.status === 'in_progress' ? 'bg-emerald-100 text-emerald-700' :
                engagement.status === 'disputed' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {engagement.status_display}
              </span>
              {engagement.agreed_fee && (
                <span className="text-sm font-medium text-emerald-700 flex items-center gap-1">
                  <BanknotesIcon className="h-4 w-4" />
                  ₦{formatNumber(engagement.agreed_fee)} agreed
                </span>
              )}
            </div>
            <p className="text-sm text-gray-700">
              <span className="font-medium">{engagement.holding_lawyer_name}</span>
              {engagement.holding_lawyer_bar_number && ` · Bar No: ${engagement.holding_lawyer_bar_number}`}
              {engagement.holding_lawyer_year_of_call && ` · Called ${engagement.holding_lawyer_year_of_call}`}
            </p>
            {engagement.outcome_notes && (
              <div className="mt-3 bg-white rounded-lg p-3 text-sm text-gray-600">
                <p className="text-xs font-semibold text-gray-500 mb-1">Outcome</p>
                <p className="whitespace-pre-wrap">{engagement.outcome_notes}</p>
              </div>
            )}

            <EngagementCompletionPanel engagement={engagement} isRequester={isRequester} />
          </Card>
        </motion.div>
      )}

      {/* ── Apply section (for non-requester, open request) ── */}
      {!isRequester && isOpen && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {myApp ? (
            <Card className="p-5 border-blue-200 bg-blue-50/30">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-charcoal-900 flex items-center gap-1.5">
                    <CheckCircleIcon className="h-4 w-4 text-blue-600" />
                    Your Application
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Status: <span className="font-medium">{myApp.status_display}</span>
                  </p>
                  {myApp.message && <p className="text-sm text-gray-600 mt-2">{myApp.message}</p>}
                </div>
                {myApp.status === 'pending' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => withdrawMutation.mutate()}
                    disabled={withdrawMutation.isLoading}
                    className="text-red-600 border-red-200 hover:bg-red-50 flex-shrink-0"
                  >
                    Withdraw
                  </Button>
                )}
              </div>
              <div className="mt-3">
                <OfferThread
                  applicationId={myApp.id}
                  openingAmount={myApp.proposed_fee ?? req.offered_fee}
                  openingProposedByName={req.requester_name}
                  isRequesterView={false}
                  disabled={myApp.status !== 'pending'}
                />
              </div>
            </Card>
          ) : (
            <Card className="p-5">
              {!showApplyForm ? (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Interested? Apply to hold this brief.</p>
                  <Button size="sm" onClick={() => setShowApplyForm(true)}>
                    Apply Now
                  </Button>
                </div>
              ) : (
                <ApplyForm
                  value={applyForm}
                  onChange={setApplyForm}
                  onSubmit={() => applyPolicyGate.runProtected(() => applyMutation.mutate(applyForm))}
                  loading={applyMutation.isLoading || applyPolicyGate.checking}
                  error={applyError}
                  onCancel={() => setShowApplyForm(false)}
                />
              )}
            </Card>
          )}
        </motion.div>
      )}

      {/* ── Applications list (requester only) ── */}
      {isRequester && applications.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <h2 className="text-sm font-semibold text-charcoal-900 mb-3">
            Applications ({applications.length})
          </h2>
          <div className="space-y-3">
            {applications.map((app) => (
              <ApplicationCard
                key={app.id}
                application={app}
                isRequester={isRequester}
                onAccept={(appId) => acceptMutation.mutate(appId)}
                onReject={(appId) => rejectMutation.mutate(appId)}
                accepting={acceptMutation.isLoading}
                rejecting={rejectMutation.isLoading}
                fallbackFee={req.offered_fee}
              />
            ))}
          </div>
        </motion.div>
      )}

      {isRequester && isOpen && applications.length === 0 && (
        <Card className="p-8">
          <EmptyState
            icon={<UserIcon className="h-8 w-8 text-gray-300" />}
            title="No applications yet"
            description="Other lawyers will see your request and apply. You will be notified when someone applies."
          />
        </Card>
      )}

      <PolicyAcceptModal {...applyPolicyGate.modalProps} />
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ApplyForm({ value, onChange, onSubmit, loading, error, onCancel }) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-charcoal-900">Apply to Hold Brief</h3>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Proposed Fee (₦)</label>
        <input
          type="number"
          value={value.proposed_fee}
          onChange={(e) => onChange((f) => ({ ...f, proposed_fee: e.target.value }))}
          min="0"
          step="500"
          placeholder="Leave blank to accept offered fee"
          className="input-field w-full text-sm"
        />
        <FeeCalculator amount={value.proposed_fee} perspective="earner" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Message to Requester</label>
        <textarea
          value={value.message}
          onChange={(e) => onChange((f) => ({ ...f, message: e.target.value }))}
          rows={3}
          placeholder="Briefly describe your experience with this court and why you're a good fit…"
          className="input-field w-full text-sm resize-none"
        />
      </div>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}
      <div className="flex gap-2">
        <Button size="sm" onClick={onSubmit} disabled={loading}>
          {loading ? 'Submitting…' : 'Submit Application'}
        </Button>
        <Button size="sm" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  )
}

