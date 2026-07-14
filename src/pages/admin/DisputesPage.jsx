/**
 * DisputesPage — admin dashboard for resolving Brief Connect disputes.
 * Lists disputes, shows evidence from both parties, and lets an admin
 * release escrow to the lawyer, refund the requester, or split it.
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ExclamationTriangleIcon, BanknotesIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { Card, Button, EmptyState } from '@/components/common'
import { disputesAPI } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { formatNumber, timeAgo, getErrorMessage } from '@/utils/helpers'

const STATUS_COLORS = {
  open: 'bg-red-100 text-red-700',
  under_review: 'bg-amber-100 text-amber-700',
  resolved_release: 'bg-emerald-100 text-emerald-700',
  resolved_refund: 'bg-gray-100 text-gray-600',
  resolved_split: 'bg-blue-100 text-blue-700',
}

function ResolveForm({ dispute, onDone }) {
  const [resolution, setResolution] = useState('')
  const [notes, setNotes] = useState('')
  const [splitLawyer, setSplitLawyer] = useState('')
  const [splitRefund, setSplitRefund] = useState('')

  const mutation = useMutation({
    mutationFn: () => disputesAPI.resolve(dispute.id, {
      resolution,
      notes,
      ...(resolution === 'split' ? {
        split_lawyer_amount: splitLawyer,
        split_requester_refund_amount: splitRefund,
      } : {}),
    }),
    onSuccess: () => {
      toast.success('Dispute resolved.')
      onDone()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  return (
    <div className="space-y-3 pt-3 border-t border-gray-100">
      <div className="grid grid-cols-3 gap-2">
        {[
          { value: 'release', label: 'Release to Lawyer' },
          { value: 'refund', label: 'Refund Requester' },
          { value: 'split', label: 'Split' },
        ].map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setResolution(opt.value)}
            className={`text-xs font-medium py-2 rounded-lg border transition-colors ${
              resolution === opt.value
                ? 'bg-charcoal-900 text-white border-charcoal-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {resolution === 'split' && (
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            value={splitLawyer}
            onChange={(e) => setSplitLawyer(e.target.value)}
            placeholder="Amount to lawyer (₦)"
            className="input-field text-sm"
          />
          <input
            type="number"
            value={splitRefund}
            onChange={(e) => setSplitRefund(e.target.value)}
            placeholder="Refund to requester (₦)"
            className="input-field text-sm"
          />
        </div>
      )}
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        placeholder="Resolution notes (visible to both parties)…"
        className="input-field w-full text-sm resize-none"
      />
      <Button
        size="sm"
        onClick={() => mutation.mutate()}
        disabled={!resolution || mutation.isLoading || (resolution === 'split' && (!splitLawyer || !splitRefund))}
      >
        {mutation.isLoading ? 'Resolving…' : 'Confirm Resolution'}
      </Button>
    </div>
  )
}

function DisputeCard({ dispute, onResolved }) {
  const [expanded, setExpanded] = useState(false)
  const resolved = dispute.status.startsWith('resolved')

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[dispute.status] || 'bg-gray-100 text-gray-600'}`}>
            {dispute.status_display}
          </span>
          <span className="text-xs text-gray-400">{timeAgo(dispute.created_at)}</span>
        </div>
        {dispute.agreed_fee && (
          <span className="text-sm font-medium text-emerald-700 flex items-center gap-1">
            <BanknotesIcon className="h-4 w-4" />
            ₦{formatNumber(dispute.agreed_fee)}
          </span>
        )}
      </div>
      <p className="text-sm text-gray-700">
        <span className="font-medium">{dispute.requester_name}</span> vs{' '}
        <span className="font-medium">{dispute.holding_lawyer_name}</span>
      </p>
      <p className="text-sm text-gray-600 mt-2">{dispute.reason}</p>

      <button onClick={() => setExpanded((e) => !e)} className="text-xs text-emerald-700 mt-3 font-medium">
        {expanded ? 'Hide details' : `View evidence (${dispute.evidence?.length || 0})`}
      </button>

      {expanded && (
        <div className="mt-3 space-y-2">
          {dispute.evidence?.length > 0 ? dispute.evidence.map((e) => (
            <div key={e.id} className="bg-gray-50 rounded-lg p-2.5 text-xs text-gray-600">
              <p className="font-medium text-gray-700">{e.submitted_by_name} · {timeAgo(e.created_at)}</p>
              {e.note && <p className="mt-0.5">{e.note}</p>}
              {e.attachment && (
                <a href={e.attachment} target="_blank" rel="noreferrer" className="text-emerald-700 underline">View attachment</a>
              )}
            </div>
          )) : (
            <p className="text-xs text-gray-400">No evidence submitted yet.</p>
          )}
          {dispute.resolution_notes && (
            <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-2.5">
              <span className="font-medium">Resolution notes:</span> {dispute.resolution_notes}
            </p>
          )}
          {!resolved && <ResolveForm dispute={dispute} onDone={onResolved} />}
        </div>
      )}
    </Card>
  )
}

export default function DisputesPage() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  const isAdmin = user?.user_type === 'super_admin' || user?.user_type === 'registry_staff'

  const { data, isLoading } = useQuery({
    queryKey: ['disputes'],
    queryFn: () => disputesAPI.list(),
    enabled: isAdmin,
  })

  const disputes = data?.data?.results || data?.data || []

  function onResolved() {
    queryClient.invalidateQueries(['disputes'])
  }

  if (!isAdmin) {
    return (
      <Card className="p-12">
        <EmptyState
          icon={<ExclamationTriangleIcon className="h-10 w-10 text-gray-300" />}
          title="Not authorized"
          description="Only Cynosure admins and registry staff can view this page."
        />
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-display font-bold text-charcoal-900">Brief Connect Disputes</h1>
        <p className="text-sm text-gray-500 mt-0.5">Review evidence and resolve escrow disputes.</p>
      </motion.div>

      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-32 rounded-xl" />)
        ) : disputes.length > 0 ? (
          disputes.map((d) => <DisputeCard key={d.id} dispute={d} onResolved={onResolved} />)
        ) : (
          <Card className="p-12">
            <EmptyState
              icon={<ExclamationTriangleIcon className="h-10 w-10 text-gray-300" />}
              title="No disputes"
              description="Brief Connect disputes will appear here for review."
            />
          </Card>
        )}
      </div>
    </div>
  )
}
