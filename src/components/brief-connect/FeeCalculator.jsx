/**
 * FeeCalculator — live preview of the platform commission next to a fee
 * input. `perspective="payer"` is for the person whose total cost includes
 * the fee (the brief requester); `perspective="earner"` is for the person
 * who receives the fee in full (the applicant).
 */
import { useQuery } from '@tanstack/react-query'
import { InformationCircleIcon } from '@heroicons/react/24/outline'
import { paymentsAPI } from '@/services/api'
import { calculatePlatformFee, formatNumber } from '@/utils/helpers'

export default function FeeCalculator({ amount, perspective = 'payer' }) {
  const { data } = useQuery({
    queryKey: ['payments', 'fee-config'],
    queryFn: () => paymentsAPI.getFeeConfig(),
    staleTime: Infinity,
  })

  const percentage = data?.data?.data?.percentage
  const value = Number(amount)
  if (!percentage || !value || value <= 0) return null

  const { feeAmount, total } = calculatePlatformFee(value, percentage)

  return (
    <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mt-1.5">
      <InformationCircleIcon className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-gray-400" />
      {perspective === 'payer' ? (
        <p>
          {"You'll pay "}<span className="font-semibold text-charcoal-900">₦{formatNumber(total)}</span> total —
          ₦{formatNumber(value)} to the lawyer + ₦{formatNumber(feeAmount)} platform fee ({percentage}%).
        </p>
      ) : (
        <p>
          {"You'll receive the full "}<span className="font-semibold text-charcoal-900">₦{formatNumber(value)}</span>{" if "}
          accepted. The brief owner pays ₦{formatNumber(total)} total, including a {percentage}% platform fee.
        </p>
      )}
    </div>
  )
}
