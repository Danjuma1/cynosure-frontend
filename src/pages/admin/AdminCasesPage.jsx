import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  BriefcaseIcon,
  EyeIcon,
} from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'
import { Button, Card, Badge, Modal, SearchInput, Pagination } from '@/components/common'
import { adminAPI } from '@/services/api'
import { formatDate, CASE_STATUSES } from '@/utils/helpers'

const CASE_TYPES = [
  { value: 'civil', label: 'Civil' },
  { value: 'criminal', label: 'Criminal' },
  { value: 'family', label: 'Family' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'constitutional', label: 'Constitutional' },
  { value: 'administrative', label: 'Administrative' },
  { value: 'election', label: 'Election Petition' },
]

export default function AdminCasesPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCase, setEditingCase] = useState(null)
  const [formData, setFormData] = useState({
    case_number: '',
    case_type: '',
    parties: '',
    court_id: '',
    judge_id: '',
    status: 'pending',
    filing_date: '',
    next_hearing_date: '',
    description: '',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'cases', { search, page }],
    queryFn: () => adminAPI.getCases({ search, page }),
  })

  const { data: courtsData } = useQuery({
    queryKey: ['admin', 'courts', 'all'],
    queryFn: () => adminAPI.getCourts({ limit: 100 }),
  })

  const { data: judgesData } = useQuery({
    queryKey: ['admin', 'judges', 'all'],
    queryFn: () => adminAPI.getJudges({ limit: 100 }),
  })

  const createMutation = useMutation({
    mutationFn: (data) => adminAPI.createCase(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'cases'])
      closeModal()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminAPI.updateCase(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'cases'])
      closeModal()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => adminAPI.deleteCase(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'cases'])
    },
  })

  const openModal = (caseItem = null) => {
    if (caseItem) {
      setEditingCase(caseItem)
      setFormData({
        case_number: caseItem.case_number || '',
        case_type: caseItem.case_type || '',
        parties: caseItem.parties || '',
        court_id: caseItem.court?.id || '',
        judge_id: caseItem.judge?.id || '',
        status: caseItem.status || 'pending',
        filing_date: caseItem.filing_date || '',
        next_hearing_date: caseItem.next_hearing_date || '',
        description: caseItem.description || '',
      })
    } else {
      setEditingCase(null)
      setFormData({
        case_number: '', case_type: '', parties: '', court_id: '', judge_id: '',
        status: 'pending', filing_date: '', next_hearing_date: '', description: ''
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingCase(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingCase) {
      updateMutation.mutate({ id: editingCase.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleDelete = (caseItem) => {
    if (window.confirm(`Are you sure you want to delete case "${caseItem.case_number}"?`)) {
      deleteMutation.mutate(caseItem.id)
    }
  }

  const cases = data?.data?.results || []
  const courts = courtsData?.data?.results || []
  const judges = judgesData?.data?.results || []
  const totalPages = Math.ceil((data?.data?.count || 0) / 20)

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-charcoal-900">Cases Management</h1>
          <p className="text-gray-600 mt-1">Add, edit, and manage case records</p>
        </div>
        <Button onClick={() => openModal()} leftIcon={<PlusIcon className="h-5 w-5" />}>
          Add Case
        </Button>
      </motion.div>

      <Card className="p-4">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search cases by number or parties..."
        />
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Case</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Court</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Next Hearing</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="py-4 px-6">
                      <div className="skeleton h-12 rounded" />
                    </td>
                  </tr>
                ))
              ) : cases.length > 0 ? (
                cases.map((caseItem) => (
                  <tr key={caseItem.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-charcoal-900">{caseItem.case_number}</p>
                        <p className="text-sm text-gray-500 truncate max-w-xs">{caseItem.parties}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant="neutral">
                        {CASE_TYPES.find(t => t.value === caseItem.case_type)?.label || caseItem.case_type}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{caseItem.court?.name || '-'}</td>
                    <td className="py-4 px-6 text-gray-600">
                      {caseItem.next_hearing_date ? formatDate(caseItem.next_hearing_date) : '-'}
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={CASE_STATUSES[caseItem.status]?.color || 'neutral'} dot>
                        {CASE_STATUSES[caseItem.status]?.label || caseItem.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/cases/${caseItem.id}`}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => openModal(caseItem)}
                          className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(caseItem)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    <BriefcaseIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p>No cases found</p>
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

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingCase ? 'Edit Case' : 'Add New Case'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Case Number</label>
              <input
                type="text"
                value={formData.case_number}
                onChange={(e) => setFormData({ ...formData, case_number: e.target.value })}
                className="input"
                placeholder="e.g., FHC/L/CS/123/2024"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Case Type</label>
              <select
                value={formData.case_type}
                onChange={(e) => setFormData({ ...formData, case_type: e.target.value })}
                className="input"
                required
              >
                <option value="">Select type</option>
                {CASE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parties</label>
            <input
              type="text"
              value={formData.parties}
              onChange={(e) => setFormData({ ...formData, parties: e.target.value })}
              className="input"
              placeholder="e.g., John Doe v. ABC Company Ltd"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Court</label>
              <select
                value={formData.court_id}
                onChange={(e) => setFormData({ ...formData, court_id: e.target.value })}
                className="input"
                required
              >
                <option value="">Select court</option>
                {courts.map((court) => (
                  <option key={court.id} value={court.id}>{court.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Judge</label>
              <select
                value={formData.judge_id}
                onChange={(e) => setFormData({ ...formData, judge_id: e.target.value })}
                className="input"
              >
                <option value="">Select judge</option>
                {judges.map((judge) => (
                  <option key={judge.id} value={judge.id}>{judge.formal_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input"
              >
                {Object.entries(CASE_STATUSES).map(([value, { label }]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filing Date</label>
              <input
                type="date"
                value={formData.filing_date}
                onChange={(e) => setFormData({ ...formData, filing_date: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Next Hearing</label>
              <input
                type="date"
                value={formData.next_hearing_date}
                onChange={(e) => setFormData({ ...formData, next_hearing_date: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              rows={3}
              placeholder="Brief description of the case..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createMutation.isLoading || updateMutation.isLoading}>
              {editingCase ? 'Update Case' : 'Add Case'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
