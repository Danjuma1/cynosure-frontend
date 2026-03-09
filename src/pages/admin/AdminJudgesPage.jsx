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
  { value: 'justice', label: 'Justice' },
  { value: 'hon_justice', label: 'Hon. Justice' },
  { value: 'chief_judge', label: 'Chief Judge' },
  { value: 'grand_kadi', label: 'Grand Kadi' },
  { value: 'president', label: 'President' },
  { value: 'magistrate', label: 'Magistrate' },
]

export default function AdminJudgesPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingJudge, setEditingJudge] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    bio: '',
    court_id: '',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'judges', { search, page }],
    queryFn: () => adminAPI.getJudges({ search, page }),
  })

  const { data: courtsData } = useQuery({
    queryKey: ['admin', 'courts', 'all'],
    queryFn: () => adminAPI.getCourts({ limit: 100 }),
  })

  const createMutation = useMutation({
    mutationFn: (data) => adminAPI.createJudge(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'judges'])
      closeModal()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminAPI.updateJudge(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'judges'])
      closeModal()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => adminAPI.deleteJudge(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'judges'])
    },
  })

  const openModal = (judge = null) => {
    if (judge) {
      setEditingJudge(judge)
      setFormData({
        title: judge.title || '',
        first_name: judge.first_name || '',
        last_name: judge.last_name || '',
        email: judge.email || '',
        phone: judge.phone || '',
        bio: judge.bio || '',
        court_id: judge.court?.id || '',
      })
    } else {
      setEditingJudge(null)
      setFormData({ title: '', first_name: '', last_name: '', email: '', phone: '', bio: '', court_id: '' })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingJudge(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingJudge) {
      updateMutation.mutate({ id: editingJudge.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleDelete = (judge) => {
    if (window.confirm(`Are you sure you want to delete "${judge.formal_name}"?`)) {
      deleteMutation.mutate(judge.id)
    }
  }

  const judges = data?.data?.results || []
  const courts = courtsData?.data?.results || []
  const totalPages = Math.ceil((data?.data?.count || 0) / 20)

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-charcoal-900">Judges Management</h1>
          <p className="text-gray-600 mt-1">Add, edit, and manage judge records</p>
        </div>
        <Button onClick={() => openModal()} leftIcon={<PlusIcon className="h-5 w-5" />}>
          Add Judge
        </Button>
      </motion.div>

      <Card className="p-4">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search judges..."
        />
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Judge</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Court</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Contact</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Followers</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Added</th>
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
              ) : judges.length > 0 ? (
                judges.map((judge) => (
                  <tr key={judge.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <Avatar name={judge.formal_name} size="md" />
                        <div>
                          <p className="font-medium text-charcoal-900">{judge.formal_name}</p>
                          <p className="text-sm text-gray-500">{judge.title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{judge.court?.name || '-'}</td>
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        <p className="text-gray-600">{judge.email || '-'}</p>
                        <p className="text-gray-500">{judge.phone || '-'}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant="primary">{judge.follower_count || 0}</Badge>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{formatDate(judge.created_at)}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal(judge)}
                          className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(judge)}
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

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingJudge ? 'Edit Judge' : 'Add New Judge'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <select
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              required
            >
              <option value="">Select title</option>
              {JUDGE_TITLES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="input"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Court</label>
            <select
              value={formData.court_id}
              onChange={(e) => setFormData({ ...formData, court_id: e.target.value })}
              className="input"
            >
              <option value="">Select court</option>
              {courts.map((court) => (
                <option key={court.id} value={court.id}>{court.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="input"
              rows={3}
              placeholder="Brief biography..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createMutation.isLoading || updateMutation.isLoading}>
              {editingJudge ? 'Update Judge' : 'Add Judge'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
