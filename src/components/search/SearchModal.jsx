import { Fragment, useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dialog, Transition } from '@headlessui/react'
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  LockClosedIcon,
  ScaleIcon,
  BuildingLibraryIcon,
  UserIcon,
  BuildingOffice2Icon,
  ChevronRightIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline'
import { search, QUICK_LINKS } from '@/data/searchIndex'

// ─── Type config ──────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  Judge: {
    icon: UserIcon,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    badge: 'bg-purple-100 text-purple-700',
  },
  Panel: {
    icon: BuildingOffice2Icon,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    badge: 'bg-blue-100 text-blue-700',
  },
  Division: {
    icon: BuildingOffice2Icon,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  Court: {
    icon: ScaleIcon,
    color: 'text-charcoal-700',
    bg: 'bg-gray-100',
    badge: 'bg-gray-100 text-gray-700',
  },
  'State Court': {
    icon: BuildingLibraryIcon,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
    badge: 'bg-indigo-100 text-indigo-700',
  },
}

// ─── Highlight matched text ────────────────────────────────────────────────────

function Highlight({ text, query }) {
  if (!query || !text) return <span>{text}</span>
  const q = query.trim()
  const idx = text.toLowerCase().indexOf(q.toLowerCase())
  if (idx === -1) return <span>{text}</span>
  return (
    <span>
      {text.slice(0, idx)}
      <mark className="bg-emerald-100 text-emerald-800 rounded px-0.5 not-italic font-semibold">
        {text.slice(idx, idx + q.length)}
      </mark>
      {text.slice(idx + q.length)}
    </span>
  )
}

// ─── Result item ──────────────────────────────────────────────────────────────

function ResultItem({ entry, query, isSelected, onSelect }) {
  const cfg = TYPE_CONFIG[entry.type] || TYPE_CONFIG.Court
  const Icon = cfg.icon
  const locked = entry.locked || !entry.href

  return (
    <button
      onClick={() => !locked && onSelect(entry)}
      className={[
        'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors rounded-lg',
        isSelected ? 'bg-emerald-50' : 'hover:bg-gray-50',
        locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      ].join(' ')}
      disabled={locked}
    >
      {/* Icon */}
      <div className={`w-9 h-9 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`h-5 w-5 ${cfg.color}`} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-charcoal-900 truncate">
          <Highlight text={entry.title} query={query} />
        </p>
        <p className="text-xs text-gray-500 truncate mt-0.5">{entry.subtitle}</p>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${cfg.badge}`}>
          {entry.type}
        </span>
        {locked ? (
          <LockClosedIcon className="h-3.5 w-3.5 text-gray-300" />
        ) : (
          <ChevronRightIcon className={`h-4 w-4 ${isSelected ? 'text-emerald-500' : 'text-gray-300'}`} />
        )}
      </div>
    </button>
  )
}

// ─── Quick link item ──────────────────────────────────────────────────────────

function QuickLinkItem({ link, isSelected, onSelect }) {
  const cfg = TYPE_CONFIG[link.type] || TYPE_CONFIG.Court
  const Icon = cfg.icon

  return (
    <button
      onClick={() => onSelect(link)}
      className={[
        'flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
        isSelected
          ? 'border-emerald-300 bg-emerald-50'
          : 'border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/40',
      ].join(' ')}
    >
      <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
        <Icon className={`h-4 w-4 ${cfg.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-charcoal-900 truncate">{link.title}</p>
        <p className="text-xs text-gray-500 truncate">{link.subtitle}</p>
      </div>
      <ArrowRightIcon className={`h-4 w-4 flex-shrink-0 ${isSelected ? 'text-emerald-500' : 'text-gray-300'}`} />
    </button>
  )
}

// ─── Main SearchModal ─────────────────────────────────────────────────────────

export default function SearchModal({ open, onClose }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [selectedIdx, setSelectedIdx] = useState(-1)
  const inputRef = useRef(null)

  // Run search on query change
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
    } else {
      setResults(search(query, 10))
    }
    setSelectedIdx(-1)
  }, [query])

  // Reset on open/close
  useEffect(() => {
    if (open) {
      setQuery('')
      setResults([])
      setSelectedIdx(-1)
    }
  }, [open])

  // Global Cmd/Ctrl+K shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        open ? onClose() : (typeof window !== 'undefined' && window.dispatchEvent(new CustomEvent('open-search')))
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  const isSearching = query.trim().length >= 2
  const listItems = isSearching ? results : QUICK_LINKS
  const totalItems = listItems.length

  const handleNavigate = useCallback((item) => {
    if (item.href) {
      navigate(item.href)
      onClose()
    }
  }, [navigate, onClose])

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIdx(i => Math.min(i + 1, totalItems - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIdx(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter' && selectedIdx >= 0) {
      e.preventDefault()
      const item = listItems[selectedIdx]
      if (item) handleNavigate(item)
    }
  }, [selectedIdx, totalItems, listItems, handleNavigate, onClose])

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose} initialFocus={inputRef}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        {/* Panel */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-start justify-center pt-16 px-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95 -translate-y-2"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 -translate-y-2"
            >
              <Dialog.Panel className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden">

                {/* Search Input */}
                <div className="flex items-center gap-3 px-4 border-b border-gray-100">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search courts, judges, divisions…"
                    className="flex-1 py-4 text-sm text-charcoal-900 placeholder-gray-400 bg-transparent outline-none"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  {query && (
                    <button
                      onClick={() => setQuery('')}
                      className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  )}
                  <kbd className="hidden sm:flex items-center gap-1 text-[10px] text-gray-400 bg-gray-100 border border-gray-200 rounded px-1.5 py-1 font-mono">
                    Esc
                  </kbd>
                </div>

                {/* Body */}
                <div className="max-h-[60vh] overflow-y-auto">
                  {/* Quick links (empty query) */}
                  {!isSearching && (
                    <div className="p-4">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Quick Links
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {QUICK_LINKS.map((link, i) => (
                          <QuickLinkItem
                            key={link.href}
                            link={link}
                            isSelected={selectedIdx === i}
                            onSelect={handleNavigate}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Search results */}
                  {isSearching && results.length > 0 && (
                    <div className="p-2">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 pt-2 pb-3">
                        {results.length} result{results.length !== 1 ? 's' : ''}
                      </p>
                      <div className="space-y-0.5">
                        {results.map((entry, i) => (
                          <ResultItem
                            key={entry.id}
                            entry={entry}
                            query={query}
                            isSelected={selectedIdx === i}
                            onSelect={handleNavigate}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No results */}
                  {isSearching && results.length === 0 && (
                    <div className="py-12 text-center">
                      <MagnifyingGlassIcon className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-500">No results for "{query}"</p>
                      <p className="text-xs text-gray-400 mt-1">Try searching for a court name, judge, or division</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center gap-4 px-4 py-2.5 border-t border-gray-100 bg-gray-50/60">
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                    <kbd className="flex items-center justify-center w-5 h-5 bg-white border border-gray-200 rounded text-[10px] font-mono shadow-sm">↑</kbd>
                    <kbd className="flex items-center justify-center w-5 h-5 bg-white border border-gray-200 rounded text-[10px] font-mono shadow-sm">↓</kbd>
                    <span>navigate</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                    <kbd className="flex items-center justify-center h-5 px-1.5 bg-white border border-gray-200 rounded text-[10px] font-mono shadow-sm">↵</kbd>
                    <span>open</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                    <kbd className="flex items-center justify-center h-5 px-1.5 bg-white border border-gray-200 rounded text-[10px] font-mono shadow-sm">Esc</kbd>
                    <span>close</span>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 text-[11px] text-gray-400">
                    <kbd className="flex items-center justify-center h-5 px-1.5 bg-white border border-gray-200 rounded text-[10px] font-mono shadow-sm">⌘K</kbd>
                    <span>shortcut</span>
                  </div>
                </div>

              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
