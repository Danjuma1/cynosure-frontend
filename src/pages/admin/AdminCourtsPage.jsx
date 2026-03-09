import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  BuildingLibraryIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { Button, Card, Badge, Modal, SearchInput, Pagination } from '@/components/common'
import { adminAPI } from '@/services/api'
import { formatDate } from '@/utils/helpers'

const COURT_TYPES = [
  { value: 'supreme', label: 'Supreme Court' },
  { value: 'appeal', label: 'Court of Appeal' },
  { value: 'federal_high', label: 'Federal High Court' },
  { value: 'state_high', label: 'State High Court' },
  { value: 'magistrate', label: 'Magistrate Court' },
  { value: 'customary', label: 'Customary Court' },
  { value: 'sharia', label: 'Sharia Court' },
]

const STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
  'Yobe', 'Zamfara'
]

export default function AdminCourtsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCourt, setEditingCourt] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    court_type: '',
    state: '',
    address: '',
    email: '',
    phone: '',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'courts', { search, page }],
    queryFn: () => adminAPI.getCourts({ search, page }),
  })

  const createMutation = useMutation({
    mutationFn: (data) => adminAPI.createCourt(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'courts'])
      closeModal()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminAPI.updateCourt(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'courts'])
      closeModal()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => adminAPI.deleteCourt(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'courts'])
    },
  })

  const openModal = (court = null) => {
    if (court) {
      setEditingCourt(court)
      setFormData({
        name: court.name || '',
        court_type: court.court_type || '',
        state: court.state || '',
        address: court.address || '',
        email: court.email || '',
        phone: court.phone || '',
      })
    } else {
      setEditingCourt(null)
      setFormData({ name: '', court_type: '', state: '', address: '', email: '', phone: '' })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingCourt(null)
    setFormData({ name: '', court_type: '', state: '', address: '', email: '', phone: '' })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingCourt) {
      updateMutation.mutate({ id: editingCourt.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleDelete = (court) => {
    if (window.confirm(`Are you sure you want to delete "${court.name}"?`)) {
      deleteMutation.mutate(court.id)
    }
  }

  const courts = data?.data?.results || []
  const totalPages = Math.ceil((data?.data?.count || 0) / 20)

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-charcoal-900">Courts Management</h1>
          <p className="text-gray-600 mt-1">Add, edit, and manage court records</p>
        </div>
        <Button onClick={() => openModal()} leftIcon={<PlusIcon className="h-5 w-5" />}>
          Add Court
        </Button>
      </motion.div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courts..."
            />
          </div>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Court</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Type</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">State</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Followers</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Created</th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="py-4 px-6">
                      <div className="skeleton h-8 rounded" />
                    </td>
                  </tr>
                ))
              ) : courts.length > 0 ? (
                courts.map((court) => (
                  <tr key={court.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <BuildingLibraryIcon className="h-5 w-5 text-blue-700" />
                        </div>
                        <div>
                          <p className="font-medium text-charcoal-900">{court.name}</p>
                          <p className="text-sm text-gray-500">{court.address}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant="neutral">
                        {COURT_TYPES.find(t => t.value === court.court_type)?.label || court.court_type}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{court.state}</td>
                    <td className="py-4 px-6 text-gray-600">{court.follower_count || 0}</td>
                    <td className="py-4 px-6 text-gray-600">{formatDate(court.created_at)}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal(court)}
                          className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(court)}
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
                    <BuildingLibraryIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p>No courts found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingCourt ? 'Edit Court' : 'Add New Court'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Court Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              placeholder="e.g., Federal High Court Lagos"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Court Type</label>
              <select
                value={formData.court_type}
                onChange={(e) => setFormData({ ...formData, court_type: e.target.value })}
                className="input"
                required
              >
                <option value="">Select type</option>
                {COURT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <select
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="input"
                required
              >
                <option value="">Select state</option>
                {STATES.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="input"
              rows={2}
              placeholder="Full address"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input"
                placeholder="court@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input"
                placeholder="+234..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createMutation.isLoading || updateMutation.isLoading}>
              {editingCourt ? 'Update Court' : 'Add Court'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
