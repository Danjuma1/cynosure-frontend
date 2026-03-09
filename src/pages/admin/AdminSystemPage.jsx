import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  Cog6ToothIcon,
  ServerIcon,
  ClockIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { Button, Card, CardHeader, CardTitle, Badge } from '@/components/common'
import { adminAPI } from '@/services/api'
import { formatDate, getErrorMessage } from '@/utils/helpers'

export default function AdminSystemPage() {
  const queryClient = useQueryClient()

  const { data: systemStatus, isLoading } = useQuery({
    queryKey: ['admin', 'system', 'status'],
    queryFn: () => adminAPI.getSystemStatus(),
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  const { data: scraperStatus } = useQuery({
    queryKey: ['admin', 'scrapers', 'status'],
    queryFn: () => adminAPI.getScraperStatus(),
  })

  const runScraperMutation = useMutation({
    mutationFn: (scraperType) => adminAPI.runScraper(scraperType),
    onSuccess: () => {
      toast.success('Scraper started successfully')
      queryClient.invalidateQueries(['admin', 'scrapers'])
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const clearCacheMutation = useMutation({
    mutationFn: () => adminAPI.clearCache(),
    onSuccess: () => {
      toast.success('Cache cleared successfully')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const status = systemStatus?.data || {}
  const scrapers = scraperStatus?.data?.scrapers || []

  const systemStats = [
    { label: 'Database', value: status.database_status || 'Connected', status: 'healthy' },
    { label: 'Cache', value: status.cache_status || 'Active', status: 'healthy' },
    { label: 'Queue', value: `${status.queue_jobs || 0} jobs`, status: status.queue_jobs > 100 ? 'warning' : 'healthy' },
    { label: 'Storage', value: `${status.storage_used || '0'}% used`, status: status.storage_used > 80 ? 'warning' : 'healthy' },
  ]

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-display font-bold text-charcoal-900">System Settings</h1>
        <p className="text-gray-600 mt-1">Monitor and manage system configuration</p>
      </motion.div>

      {/* System Status */}
      <div className="grid md:grid-cols-4 gap-4">
        {systemStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">{stat.label}</span>
                <span className={`w-2 h-2 rounded-full ${
                  stat.status === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
              </div>
              <p className="text-lg font-semibold text-charcoal-900">{stat.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Scraper Control */}
        <Card>
          <CardHeader className="p-6 pb-0">
            <CardTitle className="flex items-center gap-2">
              <DocumentTextIcon className="h-5 w-5 text-emerald-700" />
              Scraper Control
            </CardTitle>
          </CardHeader>
          <div className="p-6 space-y-4">
            {[
              { type: 'cause_lists', label: 'Cause Lists Scraper', description: 'Scrape daily cause lists from courts' },
              { type: 'judgments', label: 'Judgments Scraper', description: 'Scrape published judgments' },
              { type: 'court_info', label: 'Court Info Scraper', description: 'Update court information' },
            ].map((scraper) => {
              const scraperData = scrapers.find(s => s.type === scraper.type)
              return (
                <div key={scraper.type} className="flex items-center justify-between p-4 rounded-lg border border-gray-100">
                  <div>
                    <p className="font-medium text-charcoal-900">{scraper.label}</p>
                    <p className="text-sm text-gray-500">{scraper.description}</p>
                    {scraperData?.last_run && (
                      <p className="text-xs text-gray-400 mt-1">
                        Last run: {formatDate(scraperData.last_run)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {scraperData?.status === 'running' ? (
                      <Badge variant="primary" dot>Running</Badge>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => runScraperMutation.mutate(scraper.type)}
                        isLoading={runScraperMutation.isPending}
                        leftIcon={<ArrowPathIcon className="h-4 w-4" />}
                      >
                        Run Now
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="p-6 pb-0">
            <CardTitle className="flex items-center gap-2">
              <Cog6ToothIcon className="h-5 w-5 text-emerald-700" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <div className="p-6 space-y-4">
            <div className="p-4 rounded-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-charcoal-900">Clear Cache</p>
                  <p className="text-sm text-gray-500">Clear all cached data</p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => clearCacheMutation.mutate()}
                  isLoading={clearCacheMutation.isPending}
                >
                  Clear
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-charcoal-900">Refresh Statistics</p>
                  <p className="text-sm text-gray-500">Recalculate all dashboard statistics</p>
                </div>
                <Button size="sm" variant="secondary">
                  Refresh
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-charcoal-900">Send Test Notification</p>
                  <p className="text-sm text-gray-500">Test notification delivery system</p>
                </div>
                <Button size="sm" variant="secondary">
                  Send Test
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Logs */}
        <Card className="lg:col-span-2">
          <CardHeader className="p-6 pb-0">
            <CardTitle className="flex items-center gap-2">
              <ServerIcon className="h-5 w-5 text-emerald-700" />
              Recent System Logs
            </CardTitle>
          </CardHeader>
          <div className="p-6">
            <div className="space-y-3">
              {status.recent_logs?.length > 0 ? (
                status.recent_logs.map((log, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                    <span className={`mt-0.5 ${
                      log.level === 'error' ? 'text-red-500' :
                      log.level === 'warning' ? 'text-yellow-500' : 'text-gray-400'
                    }`}>
                      {log.level === 'error' ? (
                        <ExclamationTriangleIcon className="h-5 w-5" />
                      ) : (
                        <ClockIcon className="h-5 w-5" />
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-charcoal-900">{log.message}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{log.timestamp}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ServerIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                  <p>No recent logs</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
