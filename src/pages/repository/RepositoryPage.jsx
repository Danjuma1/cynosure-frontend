import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  DocumentTextIcon,
  BookOpenIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  CalendarDaysIcon,
  ScaleIcon,
} from '@heroicons/react/24/outline'
import { Card, Badge, SearchInput, Pagination, Button } from '@/components/common'
import { repositoryAPI } from '@/services/api'
import { formatDate } from '@/utils/helpers'

const documentTypes = [
  { value: '', label: 'All Types' },
  { value: 'judgment', label: 'Judgments' },
  { value: 'ruling', label: 'Rulings' },
  { value: 'practice_direction', label: 'Practice Directions' },
  { value: 'law', label: 'Laws & Statutes' },
  { value: 'form', label: 'Court Forms' },
]

const courts = [
  { value: '', label: 'All Courts' },
  { value: 'supreme_court', label: 'Supreme Court' },
  { value: 'court_of_appeal', label: 'Court of Appeal' },
  { value: 'federal_high_court', label: 'Federal High Court' },
  { value: 'state_high_court', label: 'State High Court' },
]

export default function RepositoryPage() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    document_type: '',
    court: '',
    year: '',
  })
  const [showFilters, setShowFilters] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['repository', { search, page, ...filters }],
    queryFn: () => repositoryAPI.list({ search, page, ...filters }),
  })

  const documents = data?.data?.results || []
  const totalPages = Math.ceil((data?.data?.count || 0) / 20)

  const getDocumentTypeIcon = (type) => {
    switch (type) {
      case 'judgment':
        return <ScaleIcon className="h-5 w-5" />
      case 'ruling':
        return <DocumentTextIcon className="h-5 w-5" />
      case 'practice_direction':
        return <BookOpenIcon className="h-5 w-5" />
      default:
        return <DocumentTextIcon className="h-5 w-5" />
    }
  }

  const getDocumentTypeBadge = (type) => {
    const colors = {
      judgment: 'primary',
      ruling: 'warning',
      practice_direction: 'neutral',
      law: 'success',
      form: 'neutral',
    }
    return colors[type] || 'neutral'
  }

  // Generate year options
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 30 }, (_, i) => currentYear - i)

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-charcoal-900">Legal Repository</h1>
          <p className="text-gray-600 mt-1">Browse judgments, rulings, and legal documents</p>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents by title, citation, or keyword..."
            />
          </div>
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            leftIcon={<FunnelIcon className="h-5 w-5" />}
          >
            Filters
          </Button>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="grid md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
              <select
                value={filters.document_type}
                onChange={(e) => setFilters({ ...filters, document_type: e.target.value })}
                className="input"
              >
                {documentTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Court</label>
              <select
                value={filters.court}
                onChange={(e) => setFilters({ ...filters, court: e.target.value })}
                className="input"
              >
                {courts.map((court) => (
                  <option key={court.value} value={court.value}>{court.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select
                value={filters.year}
                onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                className="input"
              >
                <option value="">All Years</option>
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </motion.div>
        )}
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {isLoading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-xl" />
          ))
        ) : documents.length > 0 ? (
          documents.map((doc) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-5 hover:shadow-card-hover transition-all">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    doc.document_type === 'judgment' ? 'bg-emerald-100 text-emerald-700' :
                    doc.document_type === 'ruling' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {getDocumentTypeIcon(doc.document_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-charcoal-900 hover:text-emerald-700 cursor-pointer line-clamp-1">
                          {doc.title}
                        </h3>
                        {doc.citation && (
                          <p className="text-sm text-emerald-700 font-mono mt-0.5">{doc.citation}</p>
                        )}
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{doc.summary}</p>
                      </div>
                      <Badge variant={getDocumentTypeBadge(doc.document_type)}>
                        {documentTypes.find(t => t.value === doc.document_type)?.label || doc.document_type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <ScaleIcon className="h-4 w-4" />
                        {doc.court?.name || 'Court'}
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarDaysIcon className="h-4 w-4" />
                        {formatDate(doc.date)}
                      </span>
                      {doc.file_url && (
                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4" />
                          Download
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        ) : (
          <Card className="p-12 text-center">
            <BookOpenIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-charcoal-900 mb-2">No documents found</h3>
            <p className="text-gray-500">
              {search || Object.values(filters).some(f => f) 
                ? 'Try adjusting your search or filters' 
                : 'Documents will appear here as they are added'
              }
            </p>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  )
}
