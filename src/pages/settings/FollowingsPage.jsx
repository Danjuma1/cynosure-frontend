import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  BuildingLibraryIcon,
  UserGroupIcon,
  BriefcaseIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import { Card, Button, Badge, SearchInput } from '@/components/common'
import { authAPI, courtsAPI, judgesAPI, casesAPI } from '@/services/api'
import { getErrorMessage } from '@/utils/helpers'

const tabs = [
  { id: 'courts', label: 'Courts', icon: BuildingLibraryIcon },
  { id: 'judges', label: 'Judges', icon: UserGroupIcon },
  { id: 'cases', label: 'Cases', icon: BriefcaseIcon },
]

export default function FollowingsPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('courts')
  const [search, setSearch] = useState('')

  const { data: followings, isLoading } = useQuery({
    queryKey: ['followings'],
    queryFn: () => authAPI.getFollowings(),
  })

  const unfollowMutation = useMutation({
    mutationFn: ({ type, id }) => {
      if (type === 'courts') return courtsAPI.unfollow(id)
      if (type === 'judges') return judgesAPI.unfollow(id)
      if (type === 'cases') return casesAPI.unfollow(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['followings'])
      toast.success('Unfollowed successfully')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const followingsData = followings?.data || {}
  
  const getFilteredItems = () => {
    const items = followingsData[activeTab] || []
    if (!search) return items
    
    return items.filter(item => {
      const searchLower = search.toLowerCase()
      if (activeTab === 'courts') {
        return item.name?.toLowerCase().includes(searchLower)
      } else if (activeTab === 'judges') {
        return item.formal_name?.toLowerCase().includes(searchLower)
      } else {
        return item.case_number?.toLowerCase().includes(searchLower) ||
               item.parties?.toLowerCase().includes(searchLower)
      }
    })
  }

  const filteredItems = getFilteredItems()

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-display font-bold text-charcoal-900">My Followings</h1>
        <p className="text-gray-600 mt-1">Manage courts, judges, and cases you're following</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-100 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-emerald-100 text-emerald-700'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <tab.icon className="h-5 w-5" />
            {tab.label}
            <Badge variant={activeTab === tab.id ? 'primary' : 'neutral'} size="sm">
              {followingsData[tab.id]?.length || 0}
            </Badge>
          </button>
        ))}
      </div>

      {/* Search */}
      <Card className="p-4">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${activeTab}...`}
        />
      </Card>

      {/* Content */}
      <div className="space-y-4">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-xl" />
          ))
        ) : filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      activeTab === 'courts' ? 'bg-blue-100 text-blue-700' :
                      activeTab === 'judges' ? 'bg-purple-100 text-purple-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {activeTab === 'courts' && <BuildingLibraryIcon className="h-6 w-6" />}
                      {activeTab === 'judges' && <UserGroupIcon className="h-6 w-6" />}
                      {activeTab === 'cases' && <BriefcaseIcon className="h-6 w-6" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      {activeTab === 'courts' && (
                        <>
                          <Link to={`/courts/${item.id}`} className="font-medium text-charcoal-900 hover:text-emerald-700">
                            {item.name}
                          </Link>
                          <p className="text-sm text-gray-500 truncate">{item.address || item.state}</p>
                        </>
                      )}
                      {activeTab === 'judges' && (
                        <>
                          <Link to={`/judges/${item.id}`} className="font-medium text-charcoal-900 hover:text-emerald-700">
                            {item.formal_name}
                          </Link>
                          <p className="text-sm text-gray-500 truncate">{item.court?.name}</p>
                        </>
                      )}
                      {activeTab === 'cases' && (
                        <>
                          <Link to={`/cases/${item.id}`} className="font-medium text-charcoal-900 hover:text-emerald-700">
                            {item.case_number}
                          </Link>
                          <p className="text-sm text-gray-500 truncate">{item.parties}</p>
                        </>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => unfollowMutation.mutate({ type: activeTab, id: item.id })}
                    className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))
        ) : (
          <Card className="p-12 text-center">
            <MagnifyingGlassIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-charcoal-900 mb-2">
              {search ? 'No results found' : `No ${activeTab} followed yet`}
            </h3>
            <p className="text-gray-500 mb-4">
              {search 
                ? `Try a different search term` 
                : `Start following ${activeTab} to track their updates`
              }
            </p>
            <Button as={Link} to={`/${activeTab}`}>
              Browse {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </Button>
          </Card>
        )}
      </div>
    </div>
  )
}
