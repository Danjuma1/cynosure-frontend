/**
 * EngagementCompletionPanel — the full completion/dispute lifecycle for a
 * confirmed Brief Connect engagement:
 *   1. Holding lawyer submits proof of completion.
 *   2. Requester confirms (releases escrow) or rejects (opens a dispute).
 *   3. If disputed, both parties can submit evidence for Cynosure to review.
 *   4. Once completed, the requester can leave a review.
 */
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CheckCircleIcon, XCircleIcon, PaperClipIcon, StarIcon, ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolid } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'
import { Button } from '@/components/common'
import PolicyAcceptModal from './PolicyAcceptModal'
import { usePolicyGate } from '@/hooks/usePolicyGate'
import { briefConnectAPI, disputesAPI } from '@/services/api'
import { getErrorMessage, timeAgo } from '@/utils/helpers'
import { useAuthStore } from '@/store/authStore'

function SubmitCompletionForm({ engagementId, onDone }) {
  const [notes, setNotes] = useState('')
  const [file, setFile] = useState(null)

  const mutation = useMutation({
    mutationFn: () => {
      const formData = new FormData()
      formData.append('notes', notes)
      if (file) formData.append('attachment', file)
      return briefConnectAPI.submitCompletion(engagementId, formData)
    },
    onSuccess: () => {
      toast.success('Proof of completion submitted.')
      onDone()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  return (
    <div className="mt-4 pt-3 border-t border-emerald-200 space-y-3">
      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Submit Proof of Completion</p>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        placeholder="Briefly describe what happened in court today…"
        className="input-field w-full text-sm resize-none"
      />
      <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer w-fit">
        <PaperClipIcon className="h-4 w-4" />
        {file ? file.name : 'Attach a photo or document (optional)'}
        <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      </label>
      <Button size="sm" onClick={() => mutation.mutate()} disabled={mutation.isLoading}>
        {mutation.isLoading ? 'Submitting…' : 'Submit for Confirmation'}
      </Button>
    </div>
  )
}

function ReviewCompletionPanel({ engagement, onDone }) {
  const [reason, setReason] = useState('')
  const [showReject, setShowReject] = useState(false)
  const confirmGate = usePolicyGate('completion')
  const rejectGate = usePolicyGate('completion')

  const confirmMutation = useMutation({
    mutationFn: () => briefConnectAPI.confirmCompletion(engagement.id),
    onSuccess: () => {
      toast.success('Completion confirmed. Escrow released.')
      onDone()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const rejectMutation = useMutation({
    mutationFn: () => briefConnectAPI.rejectCompletion(engagement.id, reason),
    onSuccess: () => {
      toast.success('Completion rejected. A dispute has been opened.')
      onDone()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const proof = engagement.proof_of_completion

  return (
    <div className="mt-4 pt-3 border-t border-emerald-200 space-y-3">
      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Review Completion</p>
      {proof?.notes && <p className="text-sm text-gray-700 whitespace-pre-wrap">{proof.notes}</p>}
      {proof?.attachment && (
        <a href={proof.attachment} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-emerald-700 underline w-fit">
          <PaperClipIcon className="h-3.5 w-3.5" />
          View attachment
        </a>
      )}
      {proof?.created_at && <p className="text-xs text-gray-400">Submitted {timeAgo(proof.created_at)}</p>}

      {!showReject ? (
        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => confirmGate.runProtected(() => confirmMutation.mutate())}
            disabled={confirmMutation.isLoading || confirmGate.checking}
            className="flex items-center gap-1"
          >
            <CheckCircleIcon className="h-4 w-4" />
            Confirm Completion
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setShowReject(true)}
            className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
          >
            <XCircleIcon className="h-4 w-4" />
            Reject
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Why are you rejecting this completion? This opens a dispute for Cynosure to review."
            className="input-field w-full text-sm resize-none"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => rejectGate.runProtected(() => rejectMutation.mutate())}
              disabled={!reason.trim() || rejectMutation.isLoading || rejectGate.checking}
              className="bg-red-600 hover:bg-red-700"
            >
              {rejectMutation.isLoading ? 'Submitting…' : 'Reject & Open Dispute'}
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setShowReject(false)}>Cancel</Button>
          </div>
        </div>
      )}
      <PolicyAcceptModal {...confirmGate.modalProps} />
      <PolicyAcceptModal {...rejectGate.modalProps} />
    </div>
  )
}

function DisputeEvidenceSection({ dispute, onDone }) {
  const [note, setNote] = useState('')
  const [file, setFile] = useState(null)

  const mutation = useMutation({
    mutationFn: () => {
      const formData = new FormData()
      formData.append('note', note)
      if (file) formData.append('attachment', file)
      return disputesAPI.addEvidence(dispute.id, formData)
    },
    onSuccess: () => {
      toast.success('Evidence submitted.')
      setNote(''); setFile(null)
      onDone()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const resolved = dispute.status.startsWith('resolved')

  return (
    <div className="mt-4 pt-3 border-t border-red-200 space-y-3">
      <p className="text-xs font-semibold text-red-700 uppercase tracking-wider flex items-center gap-1.5">
        <ExclamationTriangleIcon className="h-4 w-4" />
        Dispute — {dispute.status_display}
      </p>
      <p className="text-sm text-gray-700"><span className="font-medium">Reason:</span> {dispute.reason}</p>
      {dispute.resolution_notes && (
        <p className="text-sm text-gray-600 bg-white rounded-lg p-3">
          <span className="font-medium">Resolution:</span> {dispute.resolution_notes}
        </p>
      )}
      {dispute.evidence?.length > 0 && (
        <div className="space-y-2">
          {dispute.evidence.map((e) => (
            <div key={e.id} className="bg-white rounded-lg p-2.5 text-xs text-gray-600">
              <p className="font-medium text-gray-700">{e.submitted_by_name} · {timeAgo(e.created_at)}</p>
              {e.note && <p className="mt-0.5">{e.note}</p>}
              {e.attachment && (
                <a href={e.attachment} target="_blank" rel="noreferrer" className="text-emerald-700 underline">View attachment</a>
              )}
            </div>
          ))}
        </div>
      )}
      {!resolved && (
        <div className="space-y-2">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Add evidence or context for Cynosure to review…"
            className="input-field w-full text-sm resize-none"
          />
          <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer w-fit">
            <PaperClipIcon className="h-4 w-4" />
            {file ? file.name : 'Attach a file (optional)'}
            <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
          <Button size="sm" onClick={() => mutation.mutate()} disabled={!note.trim() || mutation.isLoading}>
            {mutation.isLoading ? 'Submitting…' : 'Submit Evidence'}
          </Button>
        </div>
      )}
    </div>
  )
}

function ReviewForm({ value, onChange, onSubmit, loading, onCancel }) {
  return (
    <div className="mt-4 pt-3 border-t border-emerald-200 space-y-3">
      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Leave a Review</p>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => onChange((f) => ({ ...f, rating: n }))} className="p-1">
              {n <= value.rating
                ? <StarSolid className="h-6 w-6 text-amber-400" />
                : <StarIcon className="h-6 w-6 text-gray-200 hover:text-amber-300" />}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
        <textarea
          value={value.comment}
          onChange={(e) => onChange((f) => ({ ...f, comment: e.target.value }))}
          rows={3}
          placeholder="How was the brief handled? Would you recommend this lawyer?"
          className="input-field w-full text-sm resize-none"
        />
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={onSubmit} disabled={loading}>{loading ? 'Submitting…' : 'Submit Review'}</Button>
        <Button size="sm" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  )
}

export default function EngagementCompletionPanel({ engagement, isRequester }) {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })

  const isHoldingLawyer = user?.id === engagement.holding_lawyer

  const reviewMutation = useMutation({
    mutationFn: (payload) => briefConnectAPI.submitReview({ engagement: engagement.id, ...payload }),
    onSuccess: () => {
      toast.success('Review submitted!')
      setShowReviewForm(false)
      onDone()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  function onDone() {
    queryClient.invalidateQueries(['brief-request'])
    queryClient.invalidateQueries(['brief-escrow', engagement.id])
  }

  if (engagement.status === 'disputed' && engagement.dispute) {
    return <DisputeEvidenceSection dispute={engagement.dispute} onDone={onDone} />
  }

  if (['confirmed', 'in_progress'].includes(engagement.status)) {
    if (!engagement.proof_of_completion) {
      if (isHoldingLawyer) {
        return <SubmitCompletionForm engagementId={engagement.id} onDone={onDone} />
      }
      return <p className="mt-4 pt-3 border-t border-emerald-200 text-xs text-gray-500">Waiting for the holding lawyer to submit proof of completion.</p>
    }
    if (isRequester) {
      return <ReviewCompletionPanel engagement={engagement} onDone={onDone} />
    }
    return <p className="mt-4 pt-3 border-t border-emerald-200 text-xs text-gray-500">Proof submitted — awaiting the requester&apos;s confirmation.</p>
  }

  if (engagement.status === 'completed') {
    return (
      <>
        {isRequester && !engagement.has_review && !showReviewForm && (
          <Button size="sm" className="mt-4" onClick={() => setShowReviewForm(true)}>Leave a Review</Button>
        )}
        {showReviewForm && (
          <ReviewForm
            value={reviewForm}
            onChange={setReviewForm}
            onSubmit={() => reviewMutation.mutate(reviewForm)}
            loading={reviewMutation.isLoading}
            onCancel={() => setShowReviewForm(false)}
          />
        )}
        {engagement.has_review && (
          <p className="mt-3 text-xs text-gray-400 flex items-center gap-1">
            <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
            Review submitted
          </p>
        )}
      </>
    )
  }

  return null
}
