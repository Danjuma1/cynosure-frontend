import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  PencilSquareIcon,
  TrashIcon,
  UsersIcon,
  ShieldCheckIcon,
  NoSymbolIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import { Button, Card, Badge, Modal, SearchInput, Pagination, Avatar } from '@/components/common'
import { adminAPI } from '@/services/api'
import { formatDate } from '@/utils/helpers'

const USER_ROLES = [
  { value: 'user', label: 'User', color: 'neutral' },
  { value: 'premium', label: 'Premium', color: 'primary' },
  { value: 'admin', label: 'Admin', color: 'warning' },
  { value: 'superadmin', label: 'Super Admin', color: 'danger' },
]

const SUBSCRIPTION_STATUS = [
  { value: 'free', label: 'Free', color: 'neutral' },
  { value: 'active', label: 'Active', color: 'success' },
  { value: 'expired', label: 'Expired', color: 'danger' },
  { value: 'cancelled', label: 'Cancelled', color: 'warning' },
]

export default function AdminUsersPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [roleFilter, setRoleFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: 'user',
    is_active: true,
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', { search, page, role: roleFilter }],
    queryFn: () => adminAPI.getUsers({ search, page, role: roleFilter }),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminAPI.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'users'])
      closeModal()
    },
  })

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, is_active }) => adminAPI.updateUser(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'users'])
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => adminAPI.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'users'])
    },
  })

  const openModal = (user) => {
    setEditingUser(user)
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      role: user.role || 'user',
      is_active: user.is_active !== false,
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingUser(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    updateMutation.mutate({ id: editingUser.id, data: formData })
  }

  const handleToggleStatus = (user) => {
    const newStatus = !user.is_active
    const message = newStatus 
      ? `Are you sure you want to activate ${user.email}?`
      : `Are you sure you want to deactivate ${user.email}?`
    if (window.confirm(message)) {
      toggleStatusMutation.mutate({ id: user.id, is_active: newStatus })
    }
  }

  const handleDelete = (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.email}? This action cannot be undone.`)) {
      deleteMutation.mutate(user.id)
    }
  }

  const users = data?.data?.results || []
  const totalPages = Math.ceil((data?.data?.count || 0) / 20)

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-charcoal-900">Users Management</h1>
          <p className="text-gray-600 mt-1">Manage user accounts and permissions</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <UsersIcon className="h-5 w-5" />
          <span>{data?.data?.count || 0} total users</span>
        </div>
      </motion.div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input w-auto"
          >
            <option value="">All Roles</option>
            {USER_ROLES.map((role) => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </select>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">User</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Role</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Subscription</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Joined</th>
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
              ) : users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <Avatar name={`${user.first_name} ${user.last_name}`} size="md" />
                        <div>
                          <p className="font-medium text-charcoal-900">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={USER_ROLES.find(r => r.value === user.role)?.color || 'neutral'}>
                        {user.role === 'admin' && <ShieldCheckIcon className="h-3 w-3 mr-1" />}
                        {USER_ROLES.find(r => r.value === user.role)?.label || user.role}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={SUBSCRIPTION_STATUS.find(s => s.value === user.subscription_status)?.color || 'neutral'}>
                        {SUBSCRIPTION_STATUS.find(s => s.value === user.subscription_status)?.label || 'Free'}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      {user.is_active ? (
                        <Badge variant="success" dot>Active</Badge>
                      ) : (
                        <Badge variant="danger" dot>Inactive</Badge>
                      )}
                    </td>
                    <td className="py-4 px-6 text-gray-600">{formatDate(user.date_joined)}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className={`p-2 rounded-lg transition-colors ${
                            user.is_active 
                              ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                              : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                          }`}
                          title={user.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {user.is_active ? (
                            <NoSymbolIcon className="h-5 w-5" />
                          ) : (
                            <CheckCircleIcon className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => openModal(user)}
                          className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
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
                    <UsersIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p>No users found</p>
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

      {/* Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Edit User">
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="input"
            >
              {USER_ROLES.map((role) => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Account is active
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" isLoading={updateMutation.isLoading}>
              Update User
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
