/**
 * ChatPage — hosts the real-time chat for a confirmed Brief Connect engagement.
 */
import { useEffect } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ChevronLeftIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { Card, EmptyState } from '@/components/common'
import ChatWindow from '@/components/brief-connect/ChatWindow'
import { briefConnectAPI, paymentsAPI } from '@/services/api'

export default function ChatPage() {
  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['brief-engagement', id],
    queryFn: () => briefConnectAPI.getEngagement(id),
  })

  const engagement = data?.data

  // Paystack redirects back here with ?reference=... after checkout
  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref')
    if (!reference) return
    paymentsAPI.verifyEscrow(id, reference)
      .then(() => {
        toast.success('Payment verified.')
        queryClient.invalidateQueries(['brief-escrow', id])
      })
      .catch(() => toast.error('Could not verify payment. It will sync automatically shortly.'))
      .finally(() => {
        searchParams.delete('reference')
        searchParams.delete('trxref')
        setSearchParams(searchParams, { replace: true })
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  return (
    <div className="max-w-2xl space-y-4">
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
        <Link
          to="/brief-connect/my-briefs"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-700 w-fit"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          My Briefs
        </Link>
      </motion.div>

      {isLoading ? (
        <div className="skeleton h-[70vh] rounded-2xl" />
      ) : engagement ? (
        <ChatWindow engagement={engagement} />
      ) : (
        <Card className="p-12">
          <EmptyState
            icon={<ChatBubbleLeftRightIcon className="h-10 w-10 text-gray-300" />}
            title="Chat not available"
            description="This engagement could not be found, or you are not a party to it."
          />
        </Card>
      )}
    </div>
  )
}
