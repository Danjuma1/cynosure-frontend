/**
 * usePolicyGate — guards an action behind acceptance of the current policy
 * document for a given checkpoint (posting, applying, escrow, completion).
 *
 * Usage:
 *   const gate = usePolicyGate('posting')
 *   <Button onClick={() => gate.runProtected(() => mutation.mutate(payload))}>
 *   <PolicyAcceptModal {...gate.modalProps} />
 */
import { useCallback, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { policiesAPI } from '@/services/api'
import toast from 'react-hot-toast'

export function usePolicyGate(checkpoint) {
  const [policy, setPolicy] = useState(null)
  const [pendingAction, setPendingAction] = useState(null)
  const [checking, setChecking] = useState(false)

  const acceptMutation = useMutation({
    mutationFn: (policyId) => policiesAPI.accept(policyId),
  })

  const runProtected = useCallback(async (action) => {
    setChecking(true)
    try {
      const res = await policiesAPI.getPending(checkpoint)
      if (res.status === 204 || !res.data?.data) {
        action()
        return
      }
      setPolicy(res.data.data)
      setPendingAction(() => action)
    } catch {
      toast.error('Could not check policy status. Please try again.')
    } finally {
      setChecking(false)
    }
  }, [checkpoint])

  const confirmAccept = useCallback(() => {
    if (!policy) return
    acceptMutation.mutate(policy.id, {
      onSuccess: () => {
        const action = pendingAction
        setPolicy(null)
        setPendingAction(null)
        action?.()
      },
      onError: () => toast.error('Could not record your acceptance. Please try again.'),
    })
  }, [policy, pendingAction, acceptMutation])

  const cancel = useCallback(() => {
    setPolicy(null)
    setPendingAction(null)
  }, [])

  return {
    runProtected,
    checking,
    modalProps: {
      isOpen: !!policy,
      policy,
      onAccept: confirmAccept,
      onCancel: cancel,
      accepting: acceptMutation.isLoading,
    },
  }
}
