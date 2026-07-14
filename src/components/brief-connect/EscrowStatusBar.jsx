/**
 * EscrowStatusBar — pinned banner at the top of a Brief Connect chat showing
 * the escrow wallet status for the engagement, with a "Fund Escrow" action
 * for the requester while it's pending.
 */
import { useQuery, useMutation } from '@tanstack/react-query'
import { LockClosedIcon, LockOpenIcon, CheckCircleIcon, ExclamationTriangleIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { paymentsAPI, briefConnectAPI } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { usePolicyGate } from '@/hooks/usePolicyGate'
import PolicyAcceptModal from './PolicyAcceptModal'
import { formatNumber, getErrorMessage } from '@/utils/helpers'

const STYLES = {
  pending: { wrap: 'bg-amber-50 border-amber-200 text-amber-800', icon: LockClosedIcon },
  funded: { wrap: 'bg-emerald-50 border-emerald-200 text-emerald-800', icon: LockOpenIcon },
  released: { wrap: 'bg-gray-50 border-gray-200 text-gray-600', icon: CheckCircleIcon },
  refunded: { wrap: 'bg-gray-50 border-gray-200 text-gray-600', icon: ArrowUturnLeftIcon },
  disputed: { wrap: 'bg-red-50 border-red-200 text-red-700', icon: ExclamationTriangleIcon },
}

const LABELS = {
  pending: 'Escrow not yet funded',
  funded: 'Escrow funded — held securely',
  released: 'Escrow released to the holding lawyer',
  refunded: 'Escrow refunded to you',
  disputed: 'Escrow held — dispute under review',
}

export default function EscrowStatusBar({ engagement }) {
  const { user } = useAuthStore()
  const isRequester = user?.id === engagement.requester
  const escrowGate = usePolicyGate('escrow')

  const { data, isLoading } = useQuery({
    queryKey: ['brief-escrow', engagement.id],
    queryFn: () => briefConnectAPI.getEscrow(engagement.id),
    retry: false,
  })
  const escrow = data?.data?.data

  const fundMutation = useMutation({
    mutationFn: () => paymentsAPI.initializeEscrow(engagement.id, {
      callback_url: `${window.location.origin}/brief-connect/engagements/${engagement.id}/chat`,
    }),
    onSuccess: (res) => {
      const url = res.data?.data?.authorization_url
      if (url) window.location.href = url
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  if (isLoading || !escrow) return null

  const style = STYLES[escrow.status] || STYLES.pending
  const Icon = style.icon

  return (
    <div className={`flex items-center justify-between gap-3 px-4 py-2.5 border-b text-sm ${style.wrap}`}>
      <span className="flex items-center gap-2">
        <Icon className="h-4 w-4 flex-shrink-0" />
        {LABELS[escrow.status] || escrow.status}
      </span>
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium">
          ₦{formatNumber(escrow.amount_due)}{isRequester && escrow.status === 'pending' && ` (+₦${formatNumber(escrow.platform_fee_amount)} fee)`}
        </span>
        {isRequester && escrow.status === 'pending' && (
          <button
            type="button"
            onClick={() => escrowGate.runProtected(() => fundMutation.mutate())}
            disabled={fundMutation.isLoading || escrowGate.checking}
            className="text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white transition-colors disabled:opacity-50"
          >
            {fundMutation.isLoading ? 'Redirecting…' : 'Fund Escrow'}
          </button>
        )}
      </div>
      <PolicyAcceptModal {...escrowGate.modalProps} />
    </div>
  )
}
