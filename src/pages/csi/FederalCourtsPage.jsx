import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BuildingLibraryIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ScaleIcon,
  LockClosedIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline'

const FEDERAL_COURTS = [
  {
    code: 'SC',
    name: 'Supreme Court',
    shortName: 'SC',
    description:
      'The apex court of Nigeria. Hears final appeals from the Court of Appeal on matters of constitutional importance and other specified matters.',
    jurisdiction: 'National',
    active: false,
    comingSoon: true,
    color: 'from-purple-50 to-violet-50',
    borderActive: 'border-purple-300 hover:border-purple-500',
    borderInactive: 'border-gray-200',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    code: 'CA',
    name: 'Court of Appeal',
    shortName: 'CA',
    description:
      'The intermediate appellate court. Hears appeals from the Federal High Court, National Industrial Court, State High Courts, and other lower courts. Has divisions in major cities across Nigeria.',
    jurisdiction: 'National (Multiple Divisions)',
    active: true,
    color: 'from-emerald-50 to-teal-50',
    borderActive: 'border-emerald-300 hover:border-emerald-500',
    borderInactive: 'border-gray-200',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-700',
  },
  {
    code: 'FHC',
    name: 'Federal High Court',
    shortName: 'FHC',
    description:
      'Has exclusive jurisdiction over federal matters including revenue cases, admiralty, banking and finance, companies, copyright, immigration, and constitutional matters.',
    jurisdiction: 'National (Judicial Divisions in all States)',
    active: true,
    color: 'from-blue-50 to-sky-50',
    borderActive: 'border-blue-300 hover:border-blue-500',
    borderInactive: 'border-gray-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    code: 'NIC',
    name: 'National Industrial Court',
    shortName: 'NICN',
    description:
      'Specialised court with exclusive jurisdiction over labour, employment, trade union disputes, and matters relating to industrial relations across Nigeria.',
    jurisdiction: 'National (Divisions in major cities)',
    active: true,
    color: 'from-orange-50 to-amber-50',
    borderActive: 'border-orange-300 hover:border-orange-500',
    borderInactive: 'border-gray-200',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
  },
  {
    code: 'FCT',
    name: 'High Court of the Federal Capital Territory',
    shortName: 'FCT HC',
    description:
      'The High Court of Abuja FCT. Exercises unlimited civil and criminal jurisdiction over matters within the Federal Capital Territory.',
    jurisdiction: 'FCT Abuja',
    active: false,
    comingSoon: true,
    color: 'from-gray-50 to-slate-50',
    borderActive: 'border-gray-300 hover:border-gray-400',
    borderInactive: 'border-gray-200',
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-500',
  },
  {
    code: 'SAC',
    name: 'Sharia Court of Appeal FCT',
    shortName: 'SCOA FCT',
    description:
      'Appellate court for Sharia matters within the Federal Capital Territory. Hears appeals from area courts and customary courts on personal law matters.',
    jurisdiction: 'FCT Abuja',
    active: false,
    comingSoon: true,
    color: 'from-gray-50 to-slate-50',
    borderActive: 'border-gray-300 hover:border-gray-400',
    borderInactive: 'border-gray-200',
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-500',
  },
  {
    code: 'CCA',
    name: 'Customary Court of Appeal FCT',
    shortName: 'CCOA FCT',
    description:
      'Appellate court for customary law matters within the Federal Capital Territory. Handles appeals involving customary law disputes.',
    jurisdiction: 'FCT Abuja',
    active: false,
    comingSoon: true,
    color: 'from-gray-50 to-slate-50',
    borderActive: 'border-gray-300 hover:border-gray-400',
    borderInactive: 'border-gray-200',
    iconBg: 'bg-gray-100',
    iconColor: 'text-gray-500',
  },
]

function CourtCard({ court, index }) {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false)

  const handleClick = () => {
    if (court.active) {
      navigate(`/csi/federal/${court.code}`)
    } else {
      setExpanded((prev) => !prev)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      onClick={handleClick}
      className={`relative rounded-xl border-2 bg-gradient-to-br ${court.color} ${
        court.active
          ? court.borderActive + ' cursor-pointer shadow-sm hover:shadow-md'
          : 'border-gray-200 cursor-pointer opacity-70'
      } p-5 transition-all duration-200 group`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
            court.active ? court.iconBg : 'bg-gray-100'
          }`}
        >
          <BuildingLibraryIcon
            className={`h-6 w-6 ${court.active ? court.iconColor : 'text-gray-400'}`}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className={`font-semibold text-base ${
                court.active ? 'text-charcoal-900' : 'text-gray-500'
              }`}
            >
              {court.name}
            </h3>
            <span className="text-xs font-bold text-gray-400">({court.shortName})</span>
            {court.active ? (
              <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                <CheckBadgeIcon className="h-3.5 w-3.5" />
                Live
              </span>
            ) : (
              <span className="ml-auto flex items-center gap-1 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                <LockClosedIcon className="h-3 w-3" />
                Coming Soon
              </span>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-0.5">{court.jurisdiction}</p>

          <AnimatePresence>
            {(court.active || expanded) && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-gray-600 mt-2"
              >
                {court.description}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Chevron */}
        <ChevronRightIcon
          className={`h-5 w-5 flex-shrink-0 transition-transform ${
            court.active
              ? court.iconColor + ' group-hover:translate-x-1'
              : 'text-gray-300'
          }`}
        />
      </div>

      {/* Action row for active courts */}
      {court.active && (
        <div className="mt-4 pt-3 border-t border-white/60 flex items-center justify-between">
          <p className="text-xs text-gray-500 line-clamp-2 max-w-sm">
            {court.description}
          </p>
          <span
            className={`text-xs font-semibold flex items-center gap-1 ${court.iconColor}`}
          >
            View CSI
            <ChevronRightIcon className="h-3.5 w-3.5" />
          </span>
        </div>
      )}
    </motion.div>
  )
}

export default function FederalCourtsPage() {
  const activeCourts = FEDERAL_COURTS.filter((c) => c.active)
  const inactiveCourts = FEDERAL_COURTS.filter((c) => !c.active)

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2 text-sm text-gray-500"
      >
        <Link to="/csi" className="hover:text-emerald-700 flex items-center gap-1">
          <ChevronLeftIcon className="h-4 w-4" />
          CSI
        </Link>
        <span>/</span>
        <span className="text-charcoal-900 font-medium">Federal Courts</span>
      </motion.div>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <ScaleIcon className="h-6 w-6 text-emerald-700" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-charcoal-900">
              Federal Courts
            </h1>
            <p className="text-gray-500 text-sm">
              {activeCourts.length} of {FEDERAL_COURTS.length} courts available
            </p>
          </div>
        </div>
        <p className="text-gray-600 mt-2">
          Select a federal court to view its sitting information, cause lists, and schedules.
        </p>
      </motion.div>

      {/* Active Courts Section */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Available Courts
        </h2>
        <div className="space-y-3">
          {activeCourts.map((court, i) => (
            <CourtCard key={court.code} court={court} index={i} />
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-dashed border-gray-200" />

      {/* Coming Soon Courts */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Coming Soon
        </h2>
        <div className="space-y-3">
          {inactiveCourts.map((court, i) => (
            <CourtCard key={court.code} court={court} index={activeCourts.length + i} />
          ))}
        </div>
      </div>
    </div>
  )
}
