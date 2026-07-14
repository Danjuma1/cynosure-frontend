import { useState, useEffect } from 'react'
import { ShieldCheckIcon } from '@heroicons/react/24/outline'
import Modal, { ModalFooter } from '@/components/common/Modal'
import { Button } from '@/components/common'

export default function PolicyAcceptModal({ isOpen, policy, onAccept, onCancel, accepting }) {
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (isOpen) setChecked(false)
  }, [isOpen, policy?.id])

  if (!policy) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title={policy.title}
      size="lg"
    >
      <div className="flex items-start gap-2 text-xs text-gray-500 mb-3">
        <ShieldCheckIcon className="h-4 w-4 flex-shrink-0 mt-0.5 text-emerald-600" />
        Please read and accept this policy before continuing.
      </div>
      <div className="max-h-72 overflow-y-auto bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
        {policy.body}
      </div>
      <label className="flex items-start gap-2.5 mt-4 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="w-4 h-4 mt-0.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
        />
        <span className="text-sm text-gray-700">I have read and agree to this policy.</span>
      </label>
      <ModalFooter>
        <Button variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
        <Button size="sm" onClick={onAccept} disabled={!checked || accepting}>
          {accepting ? 'Saving…' : 'Accept & Continue'}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
