/**
 * OfferThread — fee negotiation ladder for a single Brief Connect
 * application. Either party can counter the latest offer (but not their
 * own open one); the other party can accept it. The thread starts empty —
 * the application's original ask is shown as a static opening line.
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowPathIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { Button } from '@/components/common'
import AnonymousName from './AnonymousName'
import FeeCalculator from './FeeCalculator'
import { briefConnectAPI } from '@/services/api'
import { formatNumber, timeAgo, getErrorMessage } from '@/utils/helpers'

const BUBBLE_STYLES = {
  accepted: 'bg-emerald-50 border border-emerald-200',
  superseded: 'bg-gray-50 text-gray-400',
  withdrawn: 'bg-gray-50 text-gray-400',
  declined: 'bg-red-50 text-red-400',
  pending: 'bg-blue-50 border border-blue-200',
}

export default function OfferThread({ applicationId, openingAmount, openingProposedByName, isRequesterView, disabled }) {
  const queryClient = useQueryClient()
  const [showCounter, setShowCounter] = useState(false)
  const [amount, setAmount] = useState('')
  const [message, setMessage] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['brief-offers', applicationId],
    queryFn: () => briefConnectAPI.listOffers(applicationId),
  })

  const offers = data?.data?.data || []
  const latest = offers[offers.length - 1]
  const priceLocked = latest?.status === 'accepted'

  function invalidate() {
    queryClient.invalidateQueries(['brief-offers', applicationId])
  }

  const counterMutation = useMutation({
    mutationFn: () => briefConnectAPI.counterOffer(applicationId, { amount, message }),
    onSuccess: () => {
      toast.success('Counter-offer sent.')
      setShowCounter(false)
      setAmount('')
      setMessage('')
      invalidate()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const acceptMutation = useMutation({
    mutationFn: (offerId) => briefConnectAPI.acceptOffer(applicationId, offerId),
    onSuccess: () => {
      toast.success('Offer accepted — price locked in.')
      invalidate()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const declineMutation = useMutation({
    mutationFn: (offerId) => briefConnectAPI.declineOffer(applicationId, offerId),
    onSuccess: (res) => {
      const declined = res.data?.data?.status === 'withdrawn'
      toast.success(declined ? 'Offer withdrawn.' : 'Offer declined.')
      invalidate()
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const isPending = latest?.status === 'pending'
  const canCounter = !disabled && !priceLocked && !(isPending && latest.is_mine)
  const canAccept = !disabled && isPending && !latest.is_mine
  const canDecline = !disabled && isPending && !latest.is_mine
  const canWithdraw = !disabled && isPending && latest.is_mine

  return (
    <div className="space-y-2">
      {openingAmount != null && (
        <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
          Opening ask: <span className="font-semibold text-charcoal-900">₦{formatNumber(openingAmount)}</span>
          {openingProposedByName && <> from <AnonymousName name={openingProposedByName} /></>}
        </div>
      )}

      {!isLoading && offers.length > 0 && (
        <div className="space-y-1.5">
          {offers.map((o) => (
            <div key={o.id} className={`text-xs rounded-lg px-3 py-2 ${BUBBLE_STYLES[o.status] || BUBBLE_STYLES.pending}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-charcoal-900">₦{formatNumber(o.amount)}</span>
                <span className="text-[10px] uppercase tracking-wide">{o.status_display}</span>
              </div>
              <p className="mt-0.5"><AnonymousName name={o.proposed_by_name} /> · {timeAgo(o.created_at)}</p>
              {o.message && <p className="mt-1 text-gray-600">{o.message}</p>}
            </div>
          ))}
        </div>
      )}

      {priceLocked && (
        <p className="text-xs text-emerald-700 flex items-center gap-1">
          <CheckCircleIcon className="h-3.5 w-3.5" />
          Price agreed at ₦{formatNumber(latest.amount)}
        </p>
      )}

      {!priceLocked && (canAccept || canCounter || canWithdraw) && !showCounter && (
        <div className="flex flex-wrap gap-2">
          {canAccept && (
            <Button size="sm" onClick={() => acceptMutation.mutate(latest.id)} disabled={acceptMutation.isLoading}>
              Accept ₦{formatNumber(latest.amount)}
            </Button>
          )}
          {canCounter && (
            <Button size="sm" variant="secondary" onClick={() => setShowCounter(true)} className="flex items-center gap-1">
              <ArrowPathIcon className="h-3.5 w-3.5" />
              Counter
            </Button>
          )}
          {canDecline && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => declineMutation.mutate(latest.id)}
              disabled={declineMutation.isLoading}
              className="flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50"
            >
              <XMarkIcon className="h-3.5 w-3.5" />
              Decline
            </Button>
          )}
          {canWithdraw && (
            <>
              <span className="text-xs text-gray-400 self-center">Waiting for a response…</span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => declineMutation.mutate(latest.id)}
                disabled={declineMutation.isLoading}
                className="flex items-center gap-1 text-gray-500"
              >
                <XMarkIcon className="h-3.5 w-3.5" />
                Withdraw Offer
              </Button>
            </>
          )}
        </div>
      )}

      {showCounter && (
        <div className="space-y-2 bg-white border border-gray-200 rounded-lg p-3">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="500"
            placeholder="Your counter amount (₦)"
            className="input-field w-full text-sm"
          />
          <FeeCalculator amount={amount} perspective={isRequesterView ? 'payer' : 'earner'} />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            placeholder="Optional message…"
            className="input-field w-full text-sm resize-none"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => counterMutation.mutate()} disabled={!amount || counterMutation.isLoading}>
              {counterMutation.isLoading ? 'Sending…' : 'Send Counter'}
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setShowCounter(false)}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  )
}
