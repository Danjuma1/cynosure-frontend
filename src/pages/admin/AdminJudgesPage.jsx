import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import { Button, Card, Badge, Modal, SearchInput, Pagination, Avatar } from '@/components/common'
import { adminAPI } from '@/services/api'
import { formatDate } from '@/utils/helpers'

const JUDGE_TITLES = [
  { value: 'justice',     label: 'Justice' },
  { value: 'hon_justice', label: 'Hon. Justice' },
  { value: 'chief_judge', label: 'Chief Judge' },
  { value: 'grand_kadi',  label: 'Grand Kadi' },
  { value: 'president',   label: 'President' },
  { value: 'magistrate',  label: 'Magistrate' },
]

const JUDGE_STATUSES = [
  { value: 'active',      label: 'Active',      color: 'bg-emerald-100 text-emerald-700' },
  { value: 'on_leave',    label: 'On Leave',    color: 'bg-amber-100 text-amber-700' },
  { value: 'not_sitting', label: 'Not Sitting', color: 'bg-orange-100 text-orange-700' },
  { value: 'transferred', label: 'Transferred', color: 'bg-blue-100 text-blue-700' },
  { value: 'suspended',   label: 'Suspended',   color: 'bg-red-100 text-red-700' },
  { value: 'retired',     label: 'Retired',     color: 'bg-gray-100 text-gray-600' },
]

const EMPTY_FORM = {
  title: '', first_name: '', last_name: '', other_names: '',
  email: '', phone_number: '', biography: '',
  court_id: '', division_id: '', court_number: '',
  status: 'active', is_chief_judge: false, appointment_date: '',
}

export default function AdminJudgesPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [courtFilter, setCourtFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingJudge, setEditingJudge] = useState(null)
  const [formData, setFormData] = useState(EMPTY_FORM)

  // ── Queries ────────────────────────────────────────────────────────────────

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'judges', { search, page, court: courtFilter }],
    queryFn: () => adminAPI.getJudges({ search, page, court: courtFilter || undefined }),
  })

  const { data: courtsData } = useQuery({
    queryKey: ['admin', 'courts', 'all'],
    queryFn: () => adminAPI.getCourts({ limit: 200 }),
  })

  const { data: divisionsData } = useQuery({
    queryKey: ['admin', 'divisions', formData.court_id],
    queryFn: () => adminAPI.getDivisions({ court: formData.court_id, limit: 100 }),
    enabled: !!formData.court_id && typeof adminAPI.getDivisions === 'function',
  })

  // ── Mutations ──────────────────────────────────────────────────────────────

  const invalidate = () => {
    queryClient.invalidateQueries(['admin', 'judges'])
    queryClient.invalidateQueries(['judges'])         // public CSI pages
    queryClient.invalidateQueries(['causeList'])      // cause list status pages
  }

  const createMutation = useMutation({
    mutationFn: (data) => adminAPI.createJudge(data),
    onSuccess: () => { invalidate(); closeModal() },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminAPI.updateJudge(id, data),
    onSuccess: () => { invalidate(); closeModal() },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => adminAPI.deleteJudge(id),
    onSuccess: () => invalidate(),
  })

  // ── Modal helpers ──────────────────────────────────────────────────────────

  const openModal = (judge = null) => {
    if (judge) {
      setEditingJudge(judge)
      setFormData({
        title:            judge.title || '',
        first_name:       judge.first_name || '',
        last_name:        judge.last_name || '',
        other_names:      judge.other_names || '',
        email:            judge.email || '',
        phone_number:     judge.phone_number || judge.phone || '',
        biography:        judge.biography || judge.bio || '',
        court_id:         judge.court?.id || '',
        division_id:      judge.division?.id || '',
        court_number:     judge.court_number || '',
        status:           judge.status || 'active',
        is_chief_judge:   judge.is_chief_judge || false,
        appointment_date: judge.appointment_date || '',
      })
    } else {
      setEditingJudge(null)
      setFormData(EMPTY_FORM)
    }
    setIsModalOpen(true)
  }

  const closeModal = () => { setIsModalOpen(false); setEditingJudge(null) }
  const set = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      ...formData,
      court:    formData.court_id    || undefined,
      division: formData.division_id || undefined,
    }
    delete payload.court_id
    delete payload.division_id
    if (editingJudge) {
      updateMutation.mutate({ id: editingJudge.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const handleDelete = (judge) => {
    if (window.confirm(`Delete "${judge.formal_name}"? This cannot be undone.`)) {
      deleteMutation.mutate(judge.id)
    }
  }

  const judges    = data?.data?.results || []
  const courts    = courtsData?.data?.results || []
  const divisions = divisionsData?.data?.results || []
  const totalPages = Math.ceil((data?.data?.count || 0) / 20)
  const statusCfg  = (s) => JUDGE_STATUSES.find((x) => x.value === s) || JUDGE_STATUSES[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-charcoal-900">Judges</h1>
          <p className="text-gray-600 mt-1">Add, edit, and manage judge records across all CSI courts</p>
        </div>
        <Button onClick={() => openModal()} leftIcon={<PlusIcon className="h-5 w-5" />}>
          Add Judge
        </Button>
      </motion.div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search judges..." />
          </div>
          <select
            value={courtFilter}
            onChange={(e) => { setCourtFilter(e.target.value); setPage(1) }}
            className="input w-full sm:w-56"
          >
            <option value="">All Courts</option>
            {courts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Judge</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Court / Division</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Court No.</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Contact</th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={6} className="py-4 px-6"><div className="skeleton h-12 rounded" /></td></tr>
                ))
              ) : judges.length > 0 ? (
                judges.map((judge) => {
                  const sc = statusCfg(judge.status)
                  return (
                    <tr key={judge.id} className="hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <Avatar name={judge.formal_name} size="md" />
                          <div>
                            <p className="font-medium text-charcoal-900 flex items-center gap-1.5">
                              {judge.formal_name}
                              {judge.is_chief_judge && (
                                <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">CJ</span>
                              )}
                            </p>
                            <p className="text-xs text-gray-400">{judge.title}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-sm text-gray-700">{judge.court?.name || '—'}</p>
                        {judge.division?.name && (
                          <p className="text-xs text-gray-400 mt-0.5">{judge.division.name}</p>
                        )}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {judge.court_number ? `Court ${judge.court_number}` : '—'}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${sc.color}`}>
                          {sc.label}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <p className="text-xs text-gray-600">{judge.email || '—'}</p>
                        <p className="text-xs text-gray-400">{judge.phone_number || judge.phone || ''}</p>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openModal(judge)} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                            <PencilSquareIcon className="h-5 w-5" />
                          </button>
                          <button onClick={() => handleDelete(judge)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <UserGroupIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p>No judges found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </Card>

      {/* Add / Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingJudge ? 'Edit Judge' : 'Add New Judge'}>
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <select value={formData.title} onChange={(e) => set('title', e.target.value)} className="input" required>
                <option value="">Select</option>
                {JUDGE_TITLES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input type="text" value={formData.first_name} onChange={(e) => set('first_name', e.target.value)} className="input" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input type="text" value={formData.last_name} onChange={(e) => set('last_name', e.target.value)} className="input" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Other Names (optional)</label>
            <input type="text" value={formData.other_names} onChange={(e) => set('other_names', e.target.value)} className="input" placeholder="Middle name, etc." />
          </div>

          {/* Court + Division */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Court</label>
              <select
                value={formData.court_id}
                onChange={(e) => { set('court_id', e.target.value); set('division_id', '') }}
                className="input"
              >
                <option value="">Select court</option>
                {courts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Division / Specialisation</label>
              <select
                value={formData.division_id}
                onChange={(e) => set('division_id', e.target.value)}
                className="input"
                disabled={!formData.court_id || divisions.length === 0}
              >
                <option value="">Select division</option>
                {divisions.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>

          {/* Court No. + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Court Number</label>
              <input type="text" value={formData.court_number} onChange={(e) => set('court_number', e.target.value)} className="input" placeholder="e.g., 1, 5A" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={formData.status} onChange={(e) => set('status', e.target.value)} className="input">
                {JUDGE_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {/* Chief Judge toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => set('is_chief_judge', !formData.is_chief_judge)}
              className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none ${formData.is_chief_judge ? 'bg-emerald-600' : 'bg-gray-200'}`}
              role="switch"
              aria-checked={formData.is_chief_judge}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formData.is_chief_judge ? 'translate-x-5' : ''}`} />
            </button>
            <span className="text-sm font-medium text-gray-700">Chief Judge / President of this court</span>
          </div>

          {/* Contact */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={formData.email} onChange={(e) => set('email', e.target.value)} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" value={formData.phone_number} onChange={(e) => set('phone_number', e.target.value)} className="input" placeholder="+234..." />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Date</label>
            <input type="date" value={formData.appointment_date} onChange={(e) => set('appointment_date', e.target.value)} className="input" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Biography</label>
            <textarea value={formData.biography} onChange={(e) => set('biography', e.target.value)} className="input" rows={3} placeholder="Brief biography..." />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={closeModal}>Cancel</Button>
            <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
              {editingJudge ? 'Update Judge' : 'Add Judge'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
