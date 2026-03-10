import { Fragment, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, Transition } from '@headlessui/react'
import {
  Bars3Icon,
  BellIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'
import { Avatar, Button } from '@/components/common'
import { cn } from '@/utils/helpers'
import SearchModal from '@/components/search/SearchModal'

export default function Navbar({ onMenuClick }) {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { unreadCount } = useNotificationStore()
  const [searchOpen, setSearchOpen] = useState(false)

  // Global Cmd/Ctrl+K shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu button (opens sidebar) */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>

          {/* Spacer on desktop so right-side items sit flush right */}
          <div className="hidden lg:block" />

          {/* Right Side — search, notifications, user */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              title="Search (⌘K)"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
            </button>

            {/* Notifications */}
            <Link
              to="/notifications"
              className="relative p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <BellIcon className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-red-500 text-white text-xs font-medium flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {user ? (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  <Avatar
                    src={user.profile_photo}
                    name={`${user.first_name} ${user.last_name}`}
                    size="sm"
                  />
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-700 leading-tight">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-xs text-gray-400 leading-tight truncate max-w-[140px]">
                      {user.email}
                    </p>
                  </div>
                </Menu.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-xl shadow-lg border border-gray-100 py-1 focus:outline-none">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-charcoal-900">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>

                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/profile"
                          className={cn(
                            'flex items-center gap-3 px-4 py-2 text-sm',
                            active ? 'bg-gray-50 text-charcoal-900' : 'text-gray-700'
                          )}
                        >
                          <UserCircleIcon className="h-5 w-5" />
                          Profile
                        </Link>
                      )}
                    </Menu.Item>

                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/settings"
                          className={cn(
                            'flex items-center gap-3 px-4 py-2 text-sm',
                            active ? 'bg-gray-50 text-charcoal-900' : 'text-gray-700'
                          )}
                        >
                          <Cog6ToothIcon className="h-5 w-5" />
                          Settings
                        </Link>
                      )}
                    </Menu.Item>

                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={cn(
                              'flex items-center gap-3 w-full px-4 py-2 text-sm',
                              active ? 'bg-gray-50 text-red-600' : 'text-gray-700'
                            )}
                          >
                            <ArrowRightOnRectangleIcon className="h-5 w-5" />
                            Sign out
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={() => navigate('/login')}>
                  Sign in
                </Button>
                <Button onClick={() => navigate('/signup')}>
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>

    <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
