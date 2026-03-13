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
  DocumentTextIcon,
} from '@heroicons/react/24/outline'
import { search, QUICK_LINKS } from '@/data/searchIndex'
import { searchAPI } from '@/services/api'

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
  Case: {
    icon: ScaleIcon,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    badge: 'bg-amber-100 text-amber-700',
  },
  Document: {
    icon: DocumentTextIcon,
    color: 'text-gray-600',
    bg: 'bg-gray-50',
    badge: 'bg-gray-100 text-gray-600',
  },
}

// ─── Map API response to display entries ──────────────────────────────────────

const FEDERAL_CODES = new Set(['CA', 'FHC', 'NIC', 'NICN'])

function mapApiResults(data) {
  const mapped = []

  // Courts
  data.courts?.forEach(c => {
    let href = null
    const code = (c.code || '').toUpperCase()
    if (FEDERAL_CODES.has(code)) {
      // Normalise NICN → NIC to match the route
      href = `/csi/federal/${code === 'NICN' ? 'NIC' : code}`
    }
    mapped.push({
      id: `api-court-${c.id}`,
      type: 'Court',
      title: c.name,
      subtitle: [c.court_type_display, c.state_display].filter(Boolean).join(' · '),
      href,
    })
  })

  // Judges
  data.judges?.forEach(j => {
    mapped.push({
      id: `api-judge-${j.id}`,
      type: 'Judge',
      title: j.formal_name || j.full_name || `${j.first_name} ${j.last_name}`,
      subtitle: [j.court_name, j.division_name].filter(Boolean).join(' · '),
      href: '/cause-lists',
    })
  })

  // Cases
  data.cases?.forEach(c => {
    const title = c.case_number || c.parties || 'Case'
    const subtitle = [c.court_name, c.status_display].filter(Boolean).join(' · ')
    mapped.push({
      id: `api-case-${c.id}`,
      type: 'Case',
      title,
      subtitle,
      href: '/cause-lists',
    })
  })

  // Cause list entries
  data.cause_lists?.forEach(cl => {
    const title = cl.case_number || cl.parties || 'Cause List Entry'
    mapped.push({
      id: `api-cl-${cl.id}`,
      type: 'Panel',
      title,
      subtitle: 'Cause List',
      href: '/cause-lists',
    })
  })

  // Legal documents (no detail route — shown as locked)
  data.documents?.forEach(d => {
    mapped.push({
      id: `api-doc-${d.id}`,
      type: 'Document',
      title: d.title,
      subtitle: [d.document_type_display, d.category_name].filter(Boolean).join(' · '),
      href: null,
    })
  })

  return mapped
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
  const [localResults, setLocalResults] = useState([])
  const [apiResults, setApiResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState(-1)
  const inputRef = useRef(null)

  // Local (instant) search
  useEffect(() => {
    if (query.trim().length < 2) {
      setLocalResults([])
    } else {
      setLocalResults(search(query, 10))
    }
    setSelectedIdx(-1)
  }, [query])

  // API search with 300ms debounce
  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setApiResults([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const timer = setTimeout(async () => {
      try {
        const res = await searchAPI.global({ q })
        const data = res.data?.results || {}
        setApiResults(mapApiResults(data))
      } catch {
        setApiResults([])
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  // Reset on open/close
  useEffect(() => {
    if (open) {
      setQuery('')
      setLocalResults([])
      setApiResults([])
      setSelectedIdx(-1)
      setIsLoading(false)
    }
  }, [open])

  const isSearching = query.trim().length >= 2

  // Merge local + API results, deduplicating by id
  const results = (() => {
    if (!isSearching) return []
    const seen = new Set()
    return [...localResults, ...apiResults].filter(r => {
      if (seen.has(r.id)) return false
      seen.add(r.id)
      return true
    })
  })()

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
                  {isLoading ? (
                    <svg className="h-5 w-5 text-emerald-500 animate-spin flex-shrink-0" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                  ) : (
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search courts, judges, cases, divisions…"
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
                        {isLoading && <span className="ml-2 normal-case font-normal text-gray-300">— searching…</span>}
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

                  {/* Loading with no results yet */}
                  {isSearching && results.length === 0 && isLoading && (
                    <div className="py-12 text-center">
                      <svg className="h-8 w-8 text-emerald-400 animate-spin mx-auto mb-3" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      <p className="text-sm text-gray-400">Searching…</p>
                    </div>
                  )}

                  {/* No results */}
                  {isSearching && results.length === 0 && !isLoading && (
                    <div className="py-12 text-center">
                      <MagnifyingGlassIcon className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-500">No results for "{query}"</p>
                      <p className="text-xs text-gray-400 mt-1">Try searching for a court name, judge, or case number</p>
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
