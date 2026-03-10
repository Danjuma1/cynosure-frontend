import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  BuildingLibraryIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { Button, Card, Badge, Modal, SearchInput, Pagination } from '@/components/common'
import { adminAPI } from '@/services/api'
import { formatDate } from '@/utils/helpers'

const COURT_TYPES = [
  { value: 'supreme',      label: 'Supreme Court' },
  { value: 'appeal',       label: 'Court of Appeal' },
  { value: 'federal_high', label: 'Federal High Court' },
  { value: 'nic',          label: 'National Industrial Court' },
  { value: 'state_high',   label: 'State High Court' },
  { value: 'magistrate',   label: 'Magistrate Court' },
  { value: 'customary',    label: 'Customary Court' },
  { value: 'sharia',       label: 'Sharia Court' },
]

const STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
  'Yobe', 'Zamfara',
]

const EMPTY_COURT = { name: '', court_type: '', state: '', address: '', email: '', phone: '', is_active: true }
const EMPTY_DIV   = { name: '', code: '', description: '', is_active: true }

// ── Inline divisions panel ────────────────────────────────────────────────────

function DivisionsPanel({ court, onClose }) {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editingDiv, setEditingDiv] = useState(null)
  const [divForm, setDivForm] = useState(EMPTY_DIV)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'divisions', court.id],
    queryFn: () => adminAPI.getDivisions
      ? adminAPI.getDivisions({ court: court.id, limit: 100 })
      : Promise.resolve({ data: { results: [] } }),
    enabled: !!court.id,
  })

  const invalidate = () => {
    queryClient.invalidateQueries(['admin', 'divisions', court.id])
    queryClient.invalidateQueries(['courts'])  // public CSI
  }

  const createDiv = useMutation({
    mutationFn: (data) => adminAPI.createDivision
      ? adminAPI.createDivision({ ...data, court: court.id })
      : Promise.reject(new Error('createDivision not in adminAPI')),
    onSuccess: () => { invalidate(); setShowForm(false); setDivForm(EMPTY_DIV) },
  })

  const updateDiv = useMutation({
    mutationFn: ({ id, data }) => adminAPI.updateDivision
      ? adminAPI.updateDivision(id, data)
      : Promise.reject(new Error('updateDivision not in adminAPI')),
    onSuccess: () => { invalidate(); setEditingDiv(null); setDivForm(EMPTY_DIV) },
  })

  const deleteDiv = useMutation({
    mutationFn: (id) => adminAPI.deleteDivision
      ? adminAPI.deleteDivision(id)
      : Promise.reject(new Error('deleteDivision not in adminAPI')),
    onSuccess: () => invalidate(),
  })

  const openEdit = (div) => {
    setEditingDiv(div)
    setDivForm({ name: div.name, code: div.code || '', description: div.description || '', is_active: div.is_active ?? true })
    setShowForm(true)
  }

  const submitDiv = (e) => {
    e.preventDefault()
    if (editingDiv) {
      updateDiv.mutate({ id: editingDiv.id, data: divForm })
    } else {
      createDiv.mutate(divForm)
    }
  }

  const divisions = data?.data?.results || []

  return (
    <div className="border border-emerald-200 bg-emerald-50/40 rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-charcoal-900">{court.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">Divisions / Specialised Courts</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => { setShowForm(!showForm); setEditingDiv(null); setDivForm(EMPTY_DIV) }}
            leftIcon={<PlusIcon className="h-4 w-4" />}
          >
            Add Division
          </Button>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-white hover:text-gray-600 transition-colors">
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Add / Edit form */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            onSubmit={submitDiv}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-xl border border-gray-200 p-4 space-y-3 overflow-hidden"
          >
            <p className="text-sm font-semibold text-charcoal-900">{editingDiv ? 'Edit Division' : 'New Division'}</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Division Name</label>
                <input type="text" value={divForm.name} onChange={(e) => setDivForm({ ...divForm, name: e.target.value })} className="input" required placeholder="e.g., Commercial Division" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Code (optional)</label>
                <input type="text" value={divForm.code} onChange={(e) => setDivForm({ ...divForm, code: e.target.value })} className="input" placeholder="e.g., COMM" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <input type="text" value={divForm.description} onChange={(e) => setDivForm({ ...divForm, description: e.target.value })} className="input" placeholder="Brief description..." />
            </div>
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                <input type="checkbox" checked={divForm.is_active} onChange={(e) => setDivForm({ ...divForm, is_active: e.target.checked })} className="rounded" />
                Active
              </label>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" type="button" onClick={() => { setShowForm(false); setEditingDiv(null) }}>Cancel</Button>
                <Button size="sm" type="submit" isLoading={createDiv.isPending || updateDiv.isPending}>
                  {editingDiv ? 'Update' : 'Add'}
                </Button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Divisions list */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => <div key={i} className="skeleton h-10 rounded-lg" />)}
        </div>
      ) : divisions.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No divisions yet. Add one above.</p>
      ) : (
        <div className="space-y-2">
          {divisions.map((div) => (
            <div key={div.id} className="flex items-center justify-between bg-white rounded-xl border border-gray-100 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-charcoal-900">
                  {div.name}
                  {div.code && <span className="ml-2 text-[10px] text-gray-400 font-mono bg-gray-100 px-1 rounded">{div.code}</span>}
                  {!div.is_active && <span className="ml-2 text-[10px] text-gray-400">(inactive)</span>}
                </p>
                {div.description && <p className="text-xs text-gray-500 mt-0.5">{div.description}</p>}
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => openEdit(div)} className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                  <PencilSquareIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => window.confirm(`Delete division "${div.name}"?`) && deleteDiv.mutate(div.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminCourtsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCourt, setEditingCourt] = useState(null)
  const [expandedCourtId, setExpandedCourtId] = useState(null)
  const [formData, setFormData] = useState(EMPTY_COURT)

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'courts', { search, page }],
    queryFn: () => adminAPI.getCourts({ search, page }),
  })

  const invalidate = () => {
    queryClient.invalidateQueries(['admin', 'courts'])
    queryClient.invalidateQueries(['courts'])  // public CSI
  }

  const createMutation = useMutation({
    mutationFn: (data) => adminAPI.createCourt(data),
    onSuccess: () => { invalidate(); closeModal() },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminAPI.updateCourt(id, data),
    onSuccess: () => { invalidate(); closeModal() },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => adminAPI.deleteCourt(id),
    onSuccess: () => invalidate(),
  })

  const openModal = (court = null) => {
    if (court) {
      setEditingCourt(court)
      setFormData({
        name: court.name || '', court_type: court.court_type || '',
        state: court.state || '', address: court.address || '',
        email: court.email || '', phone: court.phone || '',
        is_active: court.is_active ?? true,
      })
    } else {
      setEditingCourt(null)
      setFormData(EMPTY_COURT)
    }
    setIsModalOpen(true)
  }

  const closeModal = () => { setIsModalOpen(false); setEditingCourt(null) }
  const set = (f, v) => setFormData((p) => ({ ...p, [f]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingCourt) {
      updateMutation.mutate({ id: editingCourt.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleDelete = (court) => {
    if (window.confirm(`Delete "${court.name}"? This cannot be undone.`)) {
      deleteMutation.mutate(court.id)
    }
  }

  const courts = data?.data?.results || []
  const totalPages = Math.ceil((data?.data?.count || 0) / 20)

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-charcoal-900">Courts</h1>
          <p className="text-gray-600 mt-1">Add, edit, and manage court records — including their divisions</p>
        </div>
        <Button onClick={() => openModal()} leftIcon={<PlusIcon className="h-5 w-5" />}>
          Add Court
        </Button>
      </motion.div>

      {/* Search */}
      <Card className="p-4">
        <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search courts..." />
      </Card>

      {/* List */}
      <div className="space-y-3">
        {isLoading ? (
          [...Array(4)].map((_, i) => <div key={i} className="skeleton h-20 rounded-2xl" />)
        ) : courts.length > 0 ? (
          courts.map((court) => (
            <Card key={court.id} className="overflow-hidden">
              {/* Court row */}
              <div className="flex items-center gap-4 p-4">
                <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <BuildingLibraryIcon className="h-6 w-6 text-blue-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-charcoal-900">{court.name}</p>
                    {!court.is_active && (
                      <span className="text-[10px] bg-red-100 text-red-600 font-medium px-1.5 py-0.5 rounded">Inactive</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <Badge variant="neutral" size="sm">
                      {COURT_TYPES.find((t) => t.value === court.court_type)?.label || court.court_type}
                    </Badge>
                    <span className="text-xs text-gray-500">{court.state}</span>
                    {court.total_divisions > 0 && (
                      <span className="text-xs text-gray-400">{court.total_divisions} division{court.total_divisions !== 1 ? 's' : ''}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {/* Toggle divisions */}
                  <button
                    onClick={() => setExpandedCourtId(expandedCourtId === court.id ? null : court.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Divisions
                    {expandedCourtId === court.id
                      ? <ChevronDownIcon className="h-3.5 w-3.5" />
                      : <ChevronRightIcon className="h-3.5 w-3.5" />}
                  </button>
                  <button onClick={() => openModal(court)} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                    <PencilSquareIcon className="h-5 w-5" />
                  </button>
                  <button onClick={() => handleDelete(court)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Inline divisions panel */}
              <AnimatePresence>
                {expandedCourtId === court.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4">
                      <DivisionsPanel
                        court={court}
                        onClose={() => setExpandedCourtId(null)}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          ))
        ) : (
          <Card className="py-12 text-center text-gray-500">
            <BuildingLibraryIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p>No courts found</p>
          </Card>
        )}
      </div>

      {totalPages > 1 && (
        <Card className="p-4">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </Card>
      )}

      {/* Add / Edit Court Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingCourt ? 'Edit Court' : 'Add New Court'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Court Name</label>
            <input type="text" value={formData.name} onChange={(e) => set('name', e.target.value)} className="input" placeholder="e.g., Federal High Court Lagos" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Court Type</label>
              <select value={formData.court_type} onChange={(e) => set('court_type', e.target.value)} className="input" required>
                <option value="">Select type</option>
                {COURT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <select value={formData.state} onChange={(e) => set('state', e.target.value)} className="input" required>
                <option value="">Select state</option>
                {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea value={formData.address} onChange={(e) => set('address', e.target.value)} className="input" rows={2} placeholder="Full address" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={formData.email} onChange={(e) => set('email', e.target.value)} className="input" placeholder="court@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="tel" value={formData.phone} onChange={(e) => set('phone', e.target.value)} className="input" placeholder="+234..." />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="checkbox" checked={formData.is_active} onChange={(e) => set('is_active', e.target.checked)} className="rounded" />
            Court is active
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={closeModal}>Cancel</Button>
            <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
              {editingCourt ? 'Update Court' : 'Add Court'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
