/**
 * PostBriefPage — form to create a new brief request.
 *
 * Judge is the primary selector because cause lists are per judge.
 * Selecting a judge automatically populates the court (read-only display).
 *
 * Pre-fills when navigated from a CSI cause list entry via location.state:
 *   { judge_id, court_id, hearing_date, case_number, parties, cause_list_entry_id }
 */
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  BriefcaseIcon,
  ChevronLeftIcon,
  UserIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  BanknotesIcon,
  InformationCircleIcon,
  BuildingLibraryIcon,
} from '@heroicons/react/24/outline'
import { Card, Button } from '@/components/common'
import { briefConnectAPI, judgesAPI } from '@/services/api'
import { getErrorMessage } from '@/utils/helpers'
import toast from 'react-hot-toast'

const BRIEF_TYPES = [
  { value: 'mention',                label: 'Mention / Call Over' },
  { value: 'argue_motion',           label: 'Argue Motion' },
  { value: 'full_appearance',        label: 'Full Court Appearance' },
  { value: 'file_process',           label: 'File Court Process' },
  { value: 'collect_certified_copy', label: 'Collect Certified Copy' },
  { value: 'other',                  label: 'Other' },
]

export default function PostBriefPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const prefill = location.state || {}

  const today = new Date().toISOString().split('T')[0]

  const [judgeSearch, setJudgeSearch] = useState('')
  const [selectedJudge, setSelectedJudge] = useState(
    prefill.judge_id ? { id: prefill.judge_id, formal_name: prefill.judge_name || '', court_name: prefill.court_name || '', court: prefill.court_id } : null
  )

  const [form, setForm] = useState({
    hearing_date: prefill.hearing_date || today,
    case_number: prefill.case_number || '',
    parties: prefill.parties || '',
    brief_type: prefill.brief_type || 'mention',
    instructions: '',
    offered_fee: '',
    fee_negotiable: true,
    deadline: '',
    cause_list_entry: prefill.cause_list_entry_id || '',
    case: prefill.case_id || '',
  })
  const [error, setError] = useState('')
  const [judgeDropdownOpen, setJudgeDropdownOpen] = useState(false)

  // Fetch judges matching search term
  const { data: judgesData, isFetching: judgesFetching } = useQuery({
    queryKey: ['judges', 'search', judgeSearch],
    queryFn: () => judgesAPI.list({ search: judgeSearch, is_active: true, page_size: 30 }),
    enabled: judgeSearch.length >= 2 || judgeDropdownOpen,
    keepPreviousData: true,
  })
  const judges = judgesData?.data?.results || []

  const mutation = useMutation({
    mutationFn: (data) => briefConnectAPI.postRequest(data),
    onSuccess: (res) => {
      toast.success('Brief request posted!')
      if (prefill.returnTo) {
        navigate(prefill.returnTo)
      } else {
        navigate(`/brief-connect/requests/${res.data?.id}`)
      }
    },
    onError: (err) => setError(getErrorMessage(err)),
  })

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  function selectJudge(judge) {
    setSelectedJudge(judge)
    setJudgeSearch('')
    setJudgeDropdownOpen(false)
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!selectedJudge) {
      setError('Please select a judge.')
      return
    }

    mutation.mutate({
      judge: selectedJudge.id,
      // court auto-derived on the backend from judge.court
      hearing_date: form.hearing_date,
      case_number: form.case_number || undefined,
      parties: form.parties || undefined,
      brief_type: form.brief_type,
      instructions: form.instructions,
      offered_fee: form.offered_fee || undefined,
      fee_negotiable: form.fee_negotiable,
      deadline: form.deadline || undefined,
      cause_list_entry: form.cause_list_entry || undefined,
      case: form.case || undefined,
    })
  }

  const isPrefilled = !!prefill.judge_id || !!prefill.court_id

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Link
          to="/brief-connect"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-700 mb-4 w-fit"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          Back to Brief Connect
        </Link>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <BriefcaseIcon className="h-5 w-5 text-emerald-700" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-charcoal-900">Post a Brief Request</h1>
            <p className="text-sm text-gray-500">Other lawyers will see your request and apply to help</p>
          </div>
        </div>
      </motion.div>

      {/* Pre-fill notice */}
      {isPrefilled && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>
          <div className="flex items-start gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            <InformationCircleIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
            Some details have been pre-filled from your cause list.
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Judge + Date */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-charcoal-900 flex items-center gap-2 mb-4">
              <UserIcon className="h-4 w-4 text-gray-400" />
              Judge &amp; Sitting Date
            </h2>
            <div className="space-y-4">
              {/* Judge selector */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Judge *</label>

                {selectedJudge ? (
                  <div className="flex items-center gap-3 px-3 py-2.5 border border-emerald-300 bg-emerald-50 rounded-xl">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-charcoal-900">{selectedJudge.formal_name}</p>
                      {selectedJudge.court_name && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <BuildingLibraryIcon className="h-3.5 w-3.5" />
                          {selectedJudge.court_name}
                          {selectedJudge.division_name && ` — ${selectedJudge.division_name}`}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedJudge(null)}
                      className="text-xs text-gray-400 hover:text-red-500 flex-shrink-0 transition-colors"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      value={judgeSearch}
                      onChange={(e) => { setJudgeSearch(e.target.value); setJudgeDropdownOpen(true) }}
                      onFocus={() => setJudgeDropdownOpen(true)}
                      placeholder="Type judge name to search…"
                      className="input-field w-full text-sm"
                      autoComplete="off"
                    />
                    {judgeDropdownOpen && (judgeSearch.length >= 2 || judges.length > 0) && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                        {judgesFetching && judges.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-gray-500">Searching…</div>
                        ) : judges.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-gray-500">No judges found.</div>
                        ) : (
                          judges.map((j) => (
                            <button
                              key={j.id}
                              type="button"
                              onClick={() => selectJudge(j)}
                              className="w-full text-left px-4 py-3 hover:bg-emerald-50 transition-colors border-b border-gray-50 last:border-0"
                            >
                              <p className="text-sm font-medium text-charcoal-900">{j.formal_name}</p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {j.court_name}
                                {j.division_name && ` — ${j.division_name}`}
                              </p>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Select the judge before whom your matter is listed.
                </p>
              </div>

              {/* Hearing date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1.5">
                  <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                  Hearing Date *
                </label>
                <input
                  type="date"
                  name="hearing_date"
                  value={form.hearing_date}
                  min={today}
                  onChange={handleChange}
                  required
                  className="input-field w-full text-sm"
                />
              </div>
            </div>
          </Card>

          {/* Matter details */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-charcoal-900 flex items-center gap-2 mb-4">
              <DocumentTextIcon className="h-4 w-4 text-gray-400" />
              Matter Details
            </h2>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Case Number</label>
                  <input
                    type="text"
                    name="case_number"
                    value={form.case_number}
                    onChange={handleChange}
                    placeholder="e.g. FHC/L/CS/123/2024"
                    className="input-field w-full text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brief Type *</label>
                  <select
                    name="brief_type"
                    value={form.brief_type}
                    onChange={handleChange}
                    required
                    className="input-field w-full text-sm"
                  >
                    {BRIEF_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parties</label>
                <input
                  type="text"
                  name="parties"
                  value={form.parties}
                  onChange={handleChange}
                  placeholder="e.g. Chukwu v. Access Bank Plc"
                  className="input-field w-full text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instructions *</label>
                <textarea
                  name="instructions"
                  value={form.instructions}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Describe exactly what you need the holding lawyer to do — e.g. take adjournment, argue pending motion for extension, collect ruling…"
                  className="input-field w-full text-sm resize-none"
                />
              </div>
            </div>
          </Card>

          {/* Compensation */}
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-charcoal-900 flex items-center gap-2 mb-4">
              <BanknotesIcon className="h-4 w-4 text-gray-400" />
              Compensation
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Offered Fee (₦)</label>
                <input
                  type="number"
                  name="offered_fee"
                  value={form.offered_fee}
                  onChange={handleChange}
                  min="0"
                  step="500"
                  placeholder="Leave blank if negotiable"
                  className="input-field w-full text-sm"
                />
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  name="fee_negotiable"
                  checked={form.fee_negotiable}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-700">Fee is negotiable</span>
              </label>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline to Confirm Lawyer
                </label>
                <input
                  type="datetime-local"
                  name="deadline"
                  value={form.deadline}
                  onChange={handleChange}
                  className="input-field w-full text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">
                  When do you need a confirmed lawyer by? Leave blank for open-ended.
                </p>
              </div>
            </div>
          </Card>

          {/* Error */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" disabled={mutation.isLoading || !selectedJudge} className="flex-1">
              {mutation.isLoading ? 'Posting…' : 'Post Brief Request'}
            </Button>
            <Button as={Link} to="/brief-connect" variant="secondary">
              Cancel
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
