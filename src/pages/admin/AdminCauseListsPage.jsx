import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  PhotoIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { Button, Card, Badge, Modal, SearchInput, Pagination } from '@/components/common'
import { causeListsAPI, courtsAPI, judgesAPI } from '@/services/api'
import { formatDate, CAUSE_LIST_STATUSES } from '@/utils/helpers'
import CauseListImageUploader from '@/components/cause-lists/CauseListImageUploader'

export default function AdminCauseListsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [dateFilter, setDateFilter] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingList, setEditingList] = useState(null)
  const [imageUploadList, setImageUploadList] = useState(null)
  const [formData, setFormData] = useState({
    court_id: '',
    judge_id: '',
    panel_id: '',
    date: '',
    start_time: '',
    status: 'draft',
  })

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin', 'cause-lists', { search, page, date: dateFilter }],
    queryFn: () => causeListsAPI.list({ search, page, date: dateFilter, page_size: 20 }),
  })

  const { data: courtsData } = useQuery({
    queryKey: ['courts', 'all'],
    queryFn: () => courtsAPI.list({ page_size: 100, ordering: 'name' }),
  })

  const { data: judgesData } = useQuery({
    queryKey: ['judges', 'all'],
    queryFn: () => judgesAPI.list({ page_size: 200, ordering: 'last_name' }),
  })

  const courts = courtsData?.data?.results || []
  const allJudges = judgesData?.data?.results || []

  // Detect if selected court is CA (uses panels instead of judges)
  const selectedCourt = courts.find((c) => c.id === formData.court_id)
  const isCA = selectedCourt?.court_type === 'CA'

  // Fetch panels when a CA court is selected
  const { data: panelsData } = useQuery({
    queryKey: ['courts', formData.court_id, 'panels'],
    queryFn: () => courtsAPI.getPanels(formData.court_id),
    enabled: !!formData.court_id && isCA,
  })
  const panels = panelsData?.data?.results || []

  // Filter judges to selected court only
  const filteredJudges = formData.court_id
    ? allJudges.filter((j) => j.court?.id === formData.court_id || j.court === formData.court_id)
    : allJudges

  const createMutation = useMutation({
    mutationFn: (data) => causeListsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'cause-lists'])
      closeModal()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => causeListsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'cause-lists'])
      closeModal()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => causeListsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'cause-lists'])
    },
  })

  const publishMutation = useMutation({
    mutationFn: (id) => causeListsAPI.updateStatus(id, { status: 'published' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'cause-lists'])
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => causeListsAPI.updateStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin', 'cause-lists'])
    },
  })

  const openModal = (list = null) => {
    if (list) {
      setEditingList(list)
      setFormData({
        court_id: list.court?.id || '',
        judge_id: list.judge?.id || '',
        panel_id: list.panel?.id || '',
        date: list.date || '',
        start_time: list.start_time || '',
        status: list.status || 'draft',
      })
    } else {
      setEditingList(null)
      setFormData({ court_id: '', judge_id: '', panel_id: '', date: '', start_time: '', status: 'draft' })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingList(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = { ...formData }
    // Strip unused entity field based on court type
    if (isCA) {
      delete payload.judge_id
    } else {
      delete payload.panel_id
    }
    // Remove empty strings
    Object.keys(payload).forEach((k) => { if (payload[k] === '') delete payload[k] })
    if (editingList) {
      updateMutation.mutate({ id: editingList.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  const handleDelete = (list) => {
    if (window.confirm('Are you sure you want to delete this cause list?')) {
      deleteMutation.mutate(list.id)
    }
  }

  const handlePublish = (list) => {
    if (window.confirm('Are you sure you want to publish this cause list?')) {
      publishMutation.mutate(list.id)
    }
  }

  // Fetch images for the currently-open upload panel
  const { data: imagesData, refetch: refetchImages } = useQuery({
    queryKey: ['causeList', 'images', imageUploadList?.id],
    queryFn: () => causeListsAPI.getImages(imageUploadList.id),
    enabled: !!imageUploadList?.id,
  })
  const existingImages = imagesData?.data?.data || []

  const causeLists = data?.data?.results || []
  const totalPages = Math.ceil((data?.data?.count || 0) / 20)

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-charcoal-900">Cause Lists Management</h1>
          <p className="text-gray-600 mt-1">Create, edit, and publish cause lists</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => refetch()} leftIcon={<ArrowPathIcon className="h-5 w-5" />}>
            Refresh
          </Button>
          <Button onClick={() => openModal()} leftIcon={<PlusIcon className="h-5 w-5" />}>
            Add Cause List
          </Button>
        </div>
      </motion.div>

      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by court or judge..."
            />
          </div>
          <div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="input"
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
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Judge</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Cases</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Images</th>
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
              ) : causeLists.length > 0 ? (
                causeLists.map((list) => (
                  <tr key={list.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                          <DocumentTextIcon className="h-5 w-5 text-emerald-700" />
                        </div>
                        <p className="font-medium text-charcoal-900">{list.court?.name || '-'}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{list.judge?.formal_name || '-'}</td>
                    <td className="py-4 px-6 text-gray-600">{formatDate(list.date)}</td>
                    <td className="py-4 px-6">
                      <Badge variant="neutral">{list.total_cases || 0} cases</Badge>
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => setImageUploadList(list)}
                        className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-emerald-700 transition-colors"
                        title="Manage images"
                      >
                        {list.cover_thumbnail ? (
                          <img src={list.cover_thumbnail} alt="" className="w-8 h-10 object-cover rounded" />
                        ) : (
                          <PhotoIcon className="h-5 w-5 text-gray-300" />
                        )}
                        <span className="text-xs font-medium">
                          {list.image_count > 0 ? `${list.image_count} pg` : 'Upload'}
                        </span>
                      </button>
                    </td>
                    <td className="py-4 px-6">
                      <select
                        value={list.status}
                        onChange={(e) => statusMutation.mutate({ id: list.id, status: e.target.value })}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        {Object.entries(CAUSE_LIST_STATUSES).map(([value, { label }]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setImageUploadList(list)}
                          className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Upload images"
                        >
                          <PhotoIcon className="h-5 w-5" />
                        </button>
                        {list.status === 'draft' && (
                          <button
                            onClick={() => handlePublish(list)}
                            className="px-3 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                          >
                            Publish
                          </button>
                        )}
                        <button
                          onClick={() => openModal(list)}
                          className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(list)}
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
                    <DocumentTextIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p>No cause lists found</p>
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

      {/* Image Upload Panel */}
      {imageUploadList && (
        <div className="fixed inset-0 z-40 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setImageUploadList(null)}
          />
          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-white h-full flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Upload Cause List Photos</p>
                <h2 className="text-base font-semibold text-charcoal-900 mt-0.5">
                  {imageUploadList.court?.name || 'Cause List'} — {formatDate(imageUploadList.date)}
                </h2>
                {imageUploadList.judge?.formal_name && (
                  <p className="text-xs text-gray-500 mt-0.5">{imageUploadList.judge.formal_name}</p>
                )}
                {imageUploadList.panel?.name && (
                  <p className="text-xs text-gray-500 mt-0.5">{imageUploadList.panel.name}</p>
                )}
              </div>
              <button
                onClick={() => setImageUploadList(null)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <CauseListImageUploader
                causeListId={imageUploadList.id}
                existingImages={existingImages}
                onUploaded={() => {
                  refetchImages()
                  queryClient.invalidateQueries(['admin', 'cause-lists'])
                }}
              />
            </div>
          </motion.div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingList ? 'Edit Cause List' : 'Add New Cause List'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Court</label>
            <select
              value={formData.court_id}
              onChange={(e) => setFormData({ ...formData, court_id: e.target.value, judge_id: '', panel_id: '' })}
              className="input"
              required
            >
              <option value="">Select court</option>
              {courts.map((court) => (
                <option key={court.id} value={court.id}>{court.name}</option>
              ))}
            </select>
          </div>

          {isCA ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Panel</label>
              <select
                value={formData.panel_id}
                onChange={(e) => setFormData({ ...formData, panel_id: e.target.value })}
                className="input"
                required
              >
                <option value="">Select panel</option>
                {panels.map((panel) => (
                  <option key={panel.id} value={panel.id}>{panel.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Judge</label>
              <select
                value={formData.judge_id}
                onChange={(e) => setFormData({ ...formData, judge_id: e.target.value })}
                className="input"
                required={!isCA}
              >
                <option value="">Select judge {formData.court_id ? '' : '(select court first)'}</option>
                {filteredJudges.map((judge) => (
                  <option key={judge.id} value={judge.id}>{judge.formal_name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="input"
            >
              {Object.entries(CAUSE_LIST_STATUSES).map(([value, { label }]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" type="button" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createMutation.isLoading || updateMutation.isLoading}>
              {editingList ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
