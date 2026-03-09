import { Fragment } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Dialog, Transition } from '@headlessui/react'
import {
  XMarkIcon,
  HomeIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  BuildingLibraryIcon,
  BellIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  ScaleIcon,
  UsersIcon,
  BookOpenIcon,
  ArchiveBoxIcon,
  NewspaperIcon,
  ClipboardDocumentListIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/utils/helpers'

const mainNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
]

const featureNavigation = [
  { name: 'Court Sitting Information', abbr: 'CSI', href: '/csi', icon: ScaleIcon, active: true },
  { name: 'Law Reports',               abbr: 'LR',  href: null,   icon: BookOpenIcon,             active: false },
  { name: 'Law Repository',            abbr: 'LRP', href: null,   icon: ArchiveBoxIcon,           active: false },
  { name: 'News & Legal Updates',      abbr: 'NLU', href: null,   icon: NewspaperIcon,            active: false },
  { name: 'E-Filing & Time',           abbr: 'ECT', href: null,   icon: ClipboardDocumentListIcon, active: false },
  { name: 'AI Drafting',               abbr: 'AI',  href: null,   icon: SparklesIcon,             active: false },
]

const secondaryNavigation = [
  { name: 'Notifications', href: '/notifications', icon: BellIcon },
  { name: 'Subscription', href: '/subscription', icon: CreditCardIcon },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
]

const adminNavigation = [
  { name: 'Admin Dashboard', href: '/admin', icon: ChartBarIcon },
  { name: 'Manage Cases', href: '/admin/cases', icon: BriefcaseIcon },
  { name: 'Manage Courts', href: '/admin/courts', icon: BuildingLibraryIcon },
  { name: 'Manage Judges', href: '/admin/judges', icon: ScaleIcon },
  { name: 'Manage Cause Lists', href: '/admin/cause-lists', icon: DocumentTextIcon },
  { name: 'User Management', href: '/admin/users', icon: UsersIcon },
  { name: 'System Settings', href: '/admin/system', icon: ShieldCheckIcon },
]

function NavItem({ item, isActive }) {
  return (
    <Link
      to={item.href}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
        isActive
          ? 'bg-emerald-700 text-white'
          : 'text-gray-600 hover:bg-gray-100 hover:text-charcoal-900'
      )}
    >
      <item.icon className="h-5 w-5 flex-shrink-0" />
      {item.name}
    </Link>
  )
}

function FeatureNavItem({ item, isActive }) {
  const inner = (
    <div
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
        item.active
          ? isActive
            ? 'bg-emerald-700 text-white'
            : 'text-gray-600 hover:bg-gray-100 hover:text-charcoal-900'
          : 'text-gray-400 cursor-not-allowed'
      )}
    >
      <item.icon className="h-5 w-5 flex-shrink-0" />
      <span className="flex-1 min-w-0 truncate">{item.name}</span>
      {item.active ? (
        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded flex-shrink-0">
          {item.abbr}
        </span>
      ) : (
        <span className="text-[10px] font-medium bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded flex-shrink-0">
          Soon
        </span>
      )}
    </div>
  )

  return item.active ? <Link to={item.href}>{inner}</Link> : <div>{inner}</div>
}

function SidebarContent() {
  const location = useLocation()
  const { isAdmin } = useAuthStore()

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-100">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="font-display font-bold text-xl text-charcoal-900">
            Cynosure
          </span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="space-y-1">
          {mainNavigation.map((item) => (
            <NavItem
              key={item.name}
              item={item}
              isActive={location.pathname === item.href || location.pathname.startsWith(item.href + '/')}
            />
          ))}
        </div>

        <div className="pt-4 mt-4 border-t border-gray-100">
          <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Features
          </p>
          <div className="space-y-1">
            {featureNavigation.map((item) => (
              <FeatureNavItem
                key={item.name}
                item={item}
                isActive={location.pathname === item.href || (item.href && location.pathname.startsWith(item.href + '/'))}
              />
            ))}
          </div>
        </div>

        <div className="pt-4 mt-4 border-t border-gray-100">
          <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Account
          </p>
          {secondaryNavigation.map((item) => (
            <NavItem
              key={item.name}
              item={item}
              isActive={location.pathname === item.href}
            />
          ))}
        </div>

        {isAdmin() && (
          <div className="pt-4 mt-4 border-t border-gray-100">
            <p className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Administration
            </p>
            {adminNavigation.map((item) => (
              <NavItem
                key={item.name}
                item={item}
                isActive={location.pathname === item.href}
              />
            ))}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-100">
        <div className="glass-card rounded-lg p-3">
          <p className="text-xs font-medium text-emerald-700">Need help?</p>
          <p className="text-xs text-gray-500 mt-1">
            Check our documentation or contact support.
          </p>
          <Link
            to="/contact"
            className="mt-2 text-xs font-medium text-emerald-700 hover:text-emerald-800"
          >
            Learn more →
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile Sidebar */}
      <Transition show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="ease-in duration-200"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative w-72 max-w-xs bg-white shadow-xl">
                <div className="absolute top-4 right-4">
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
                <SidebarContent />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-100 lg:bg-white">
        <SidebarContent />
      </div>
    </>
  )
}
