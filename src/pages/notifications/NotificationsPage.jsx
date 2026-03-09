import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  BellIcon,
  CheckIcon,
  ArchiveBoxIcon,
  TrashIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline'
import { Card, Button, Badge, Tabs, EmptyState, SkeletonList } from '@/components/common'
import { notificationsAPI } from '@/services/api'
import { useNotificationStore } from '@/store/notificationStore'
import { wsService } from '@/services/websocket'
import { timeAgo, getErrorMessage } from '@/utils/helpers'

const notificationTypes = {
  cause_list_new: { label: 'New Cause List', color: 'success' },
  cause_list_update: { label: 'Cause List Update', color: 'info' },
  cause_list_status: { label: 'Status Change', color: 'warning' },
  case_adjournment: { label: 'Adjournment', color: 'warning' },
  not_sitting: { label: 'Not Sitting', color: 'error' },
  time_change: { label: 'Time Change', color: 'info' },
  case_update: { label: 'Case Update', color: 'info' },
  case_on_docket: { label: 'Case on Docket', color: 'success' },
  judge_status: { label: 'Judge Status', color: 'warning' },
  system: { label: 'System', color: 'neutral' },
}

export default function NotificationsPage() {
  const queryClient = useQueryClient()
  const { addNotification, markAsRead, markAllAsRead } = useNotificationStore()
  const [activeTab, setActiveTab] = useState('all')
  const [selectedIds, setSelectedIds] = useState([])

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', activeTab],
    queryFn: () =>
      activeTab === 'unread'
        ? notificationsAPI.getUnread()
        : activeTab === 'archived'
        ? notificationsAPI.getArchived()
        : notificationsAPI.list(),
  })

  const { data: counts } = useQuery({
    queryKey: ['notifications', 'counts'],
    queryFn: () => notificationsAPI.getCounts(),
  })

  const markReadMutation = useMutation({
    mutationFn: (ids) => notificationsAPI.markRead({ notification_ids: ids }),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications'])
      markAsRead(selectedIds)
      setSelectedIds([])
      toast.success('Marked as read')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const archiveMutation = useMutation({
    mutationFn: (ids) => notificationsAPI.archive({ notification_ids: ids }),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications'])
      setSelectedIds([])
      toast.success('Archived')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  // WebSocket connection for real-time notifications
  useEffect(() => {
    wsService.connect('notifications', (data) => {
      if (data.type === 'new_notification') {
        addNotification(data.notification)
        queryClient.invalidateQueries(['notifications'])
      }
    })

    return () => wsService.disconnect('notifications')
  }, [addNotification, queryClient])

  const notifications = data?.data?.results || data?.data || []
  const unreadCount = counts?.data?.unread || 0

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread', count: unreadCount },
    { id: 'archived', label: 'Archived' },
  ]

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    )
  }

  const handleMarkAllRead = () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id)
    if (unreadIds.length > 0) {
      markReadMutation.mutate(unreadIds)
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-charcoal-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            Stay updated on your cases and court schedules
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" onClick={handleMarkAllRead}>
            Mark all as read
          </Button>
        )}
      </motion.div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <Card className="p-3 flex items-center justify-between bg-emerald-50 border-emerald-200">
          <span className="text-sm font-medium text-emerald-700">
            {selectedIds.length} selected
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => markReadMutation.mutate(selectedIds)}
              leftIcon={<CheckIcon className="h-4 w-4" />}
            >
              Mark Read
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => archiveMutation.mutate(selectedIds)}
              leftIcon={<ArchiveBoxIcon className="h-4 w-4" />}
            >
              Archive
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedIds([])}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Notifications List */}
      {isLoading ? (
        <Card className="divide-y divide-gray-100">
          <SkeletonList items={8} />
        </Card>
      ) : notifications.length === 0 ? (
        <Card className="p-12">
          <EmptyState
            icon={<BellIcon className="h-12 w-12 text-gray-400" />}
            title="No notifications"
            description={
              activeTab === 'unread'
                ? "You're all caught up!"
                : activeTab === 'archived'
                ? 'No archived notifications'
                : 'Notifications will appear here'
            }
          />
        </Card>
      ) : (
        <Card className="overflow-hidden divide-y divide-gray-100">
          <AnimatePresence>
            {notifications.map((notification, i) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.03 }}
                className={`p-4 flex items-start gap-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                  !notification.is_read ? 'bg-emerald-50/50' : ''
                }`}
                onClick={() => toggleSelect(notification.id)}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(notification.id)}
                  onChange={() => toggleSelect(notification.id)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-700 focus:ring-emerald-700"
                  onClick={(e) => e.stopPropagation()}
                />

                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    notification.priority === 'urgent'
                      ? 'bg-red-100'
                      : notification.priority === 'high'
                      ? 'bg-amber-100'
                      : 'bg-emerald-100'
                  }`}
                >
                  <BellIcon
                    className={`h-5 w-5 ${
                      notification.priority === 'urgent'
                        ? 'text-red-600'
                        : notification.priority === 'high'
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }`}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p
                        className={`text-sm ${
                          !notification.is_read
                            ? 'font-semibold text-charcoal-900'
                            : 'text-gray-700'
                        }`}
                      >
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant={notificationTypes[notification.notification_type]?.color || 'neutral'}
                          size="sm"
                        >
                          {notificationTypes[notification.notification_type]?.label || notification.notification_type}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {timeAgo(notification.created_at)}
                        </span>
                      </div>
                    </div>
                    {!notification.is_read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </Card>
      )}
    </div>
  )
}
