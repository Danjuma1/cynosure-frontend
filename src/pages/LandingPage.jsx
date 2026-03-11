import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ScaleIcon,
  BookOpenIcon,
  ArchiveBoxIcon,
  NewspaperIcon,
  ClipboardDocumentListIcon,
  SparklesIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  GlobeAltIcon,
  LockClosedIcon,
  BuildingLibraryIcon,
  BellAlertIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  ChevronRightIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/common'
import { useAuthStore } from '@/store/authStore'

// ── Data ─────────────────────────────────────────────────────────────────────

const allFeatures = [
  {
    icon: ScaleIcon,
    title: 'Court Sitting Information',
    abbr: 'CSI',
    description:
      'Real-time cause lists from 500+ Nigerian courts the moment they are published. Track hearings, adjournments, and judge availability instantly.',
    active: true,
  },
  {
    icon: BookOpenIcon,
    title: 'Law Reports',
    abbr: 'LR',
    description:
      'Comprehensive database of Nigerian case law, judgments, and legal precedents at your fingertips.',
    active: false,
  },
  {
    icon: ArchiveBoxIcon,
    title: 'Law Repository',
    abbr: 'LRP',
    description:
      'Centralized access to statutes, regulations, and legal documents across all 36 states and the FCT.',
    active: false,
  },
  {
    icon: NewspaperIcon,
    title: 'News & Legal Updates',
    abbr: 'NLU',
    description:
      'Curated legal news, court circulars, NBA updates, and regulatory changes — all in one feed.',
    active: false,
  },
  {
    icon: ClipboardDocumentListIcon,
    title: 'E-Filing & Time',
    abbr: 'ECT',
    description:
      'Seamlessly file court documents electronically and track critical case deadlines and timelines.',
    active: false,
  },
  {
    icon: SparklesIcon,
    title: 'AI Drafting',
    abbr: 'AI',
    description:
      'AI-powered drafting assistant for motions, briefs, pleadings, and court documents.',
    active: false,
  },
]

const stats = [
  { value: '500+',   label: 'Courts Covered' },
  { value: '50K+',   label: 'Cases Tracked' },
  { value: '2,000+', label: 'Active Lawyers' },
  { value: '99.9%',  label: 'Uptime' },
]

const testimonials = [
  {
    quote:
      "Cynosure has completely transformed how I manage my cases. I get instant alerts the moment cause lists drop — I haven't missed a hearing date since.",
    author: 'Barr. Adaeze Okonkwo',
    role: 'Senior Associate, Lagos',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=120&h=120&fit=crop&crop=face',
  },
  {
    quote:
      "Real-time cause list updates have saved me countless trips to court. This is absolutely essential for any serious Nigerian practitioner.",
    author: 'Barr. Ibrahim Mohammed',
    role: 'Principal Partner, Abuja',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=120&h=120&fit=crop&crop=face',
  },
  {
    quote:
      "Finally, a platform built for the Nigerian legal system. The notifications are a game-changer — my clients are always impressed by how on top of things I am.",
    author: 'Barr. Chidinma Eze',
    role: 'Legal Consultant, Port Harcourt',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&h=120&fit=crop&crop=face',
  },
]

const pricingPlans = [
  {
    name: 'Starter',
    price: 'Free',
    period: '',
    description: 'Perfect for individual practitioners getting started',
    features: [
      'Track up to 5 cases',
      'Daily cause list access',
      'Email notifications',
      'Basic court directory',
      'Community support',
    ],
    cta: 'Get Started Free',
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '₦15,000',
    period: '/month',
    description: 'For busy lawyers who need comprehensive tracking',
    features: [
      'Unlimited case tracking',
      'Real-time cause list updates',
      'Email, SMS & push notifications',
      'Advanced search & filters',
      'Analytics & insights',
      'Export reports (PDF, Excel)',
      'Priority email support',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Corporate',
    price: '₦45,000',
    period: '/month',
    description: 'For law firms requiring team collaboration',
    features: [
      'Everything in Professional',
      'Unlimited team members',
      'Firm-wide case management',
      'Custom integrations & API',
      'Dedicated account manager',
      'On-premise deployment option',
      '24/7 phone support',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
]

// ── CSI Live Preview ──────────────────────────────────────────────────────────

const causeListItems = [
  { title: 'Adeyemi v. Federal Republic',   time: '9:00 AM',  room: 'Courtroom 4', type: 'Hearing',  status: 'On' },
  { title: 'Okonkwo & Co. v. LASG',          time: '10:30 AM', room: 'Courtroom 1', type: 'Judgment', status: 'On' },
  { title: 'Mohammed v. First Bank PLC',      time: '12:00 PM', room: 'Courtroom 7', type: 'Mention',  status: 'On' },
  { title: 'Eze v. Unity Mortgage Bank',      time: '2:00 PM',  room: 'Courtroom 2', type: 'Hearing',  status: 'Adj.' },
]

function CSIPreview() {
  const typeColors = {
    Judgment: 'bg-blue-500/20 text-blue-300',
    Hearing:  'bg-emerald-500/20 text-emerald-300',
    Mention:  'bg-purple-500/20 text-purple-300',
  }
  return (
    <div className="w-full max-w-sm mx-auto lg:mx-0 lg:ml-auto">
      <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/10 ring-1 ring-white/5">
        {/* Court header */}
        <div className="bg-emerald-700 px-5 py-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-emerald-200 text-[11px] font-semibold uppercase tracking-widest">
                Federal High Court
              </p>
              <p className="text-white font-bold text-base mt-1">Lagos Division</p>
              <p className="text-emerald-300 text-xs mt-0.5">Cause List — Today</p>
            </div>
            <div className="flex items-center gap-1.5 bg-green-500/20 rounded-full px-2.5 py-1 mt-0.5">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-300 text-[11px] font-semibold">Live</span>
            </div>
          </div>
        </div>

        {/* Sub-header */}
        <div className="bg-[#0a3d24] px-5 py-2 flex items-center justify-between border-b border-white/5">
          <span className="text-emerald-400 text-[11px]">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
          <span className="text-gray-500 text-[11px]">{causeListItems.length} matters listed</span>
        </div>

        {/* Cause list */}
        <div className="bg-[#0d0d0d] divide-y divide-white/5">
          {causeListItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="px-5 py-3 flex items-start gap-3 hover:bg-white/3 transition-colors"
            >
              <span className="text-[11px] font-bold text-gray-600 mt-0.5 w-4 flex-shrink-0 tabular-nums">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-medium truncate">{item.title}</p>
                <p className="text-gray-500 text-[10px] mt-0.5">{item.room} · {item.time}</p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${typeColors[item.type] ?? 'bg-gray-800 text-gray-400'}`}>
                  {item.type}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.status === 'On' ? 'bg-green-500/15 text-green-400' : 'bg-amber-500/15 text-amber-400'}`}>
                  {item.status}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Notification toast */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="bg-[#111] px-5 py-3.5 border-t border-white/5 flex items-center gap-3"
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-700 flex items-center justify-center flex-shrink-0">
            <BellAlertIcon className="h-3.5 w-3.5 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-gray-400 truncate">
              <span className="text-emerald-400 font-semibold">Just updated: </span>
              Courtroom 3 list now available
            </p>
          </div>
        </motion.div>
      </div>

      {/* Floating stat cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="flex gap-3 mt-4"
      >
        {[
          { label: 'Courts online', value: '500+', color: 'text-emerald-400' },
          { label: 'Updated today', value: '143', color: 'text-blue-400' },
          { label: 'Active alerts', value: '2,841', color: 'text-purple-400' },
        ].map((s, i) => (
          <div key={i} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-center">
            <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

// ── Pricing Section (with annual/monthly toggle) ─────────────────────────────

function PricingSection() {
  const [annual, setAnnual] = useState(false)

  const getPrice = (plan) => {
    if (plan.price === 'Free') return { display: 'Free', period: '' }
    const raw = parseInt(plan.price.replace(/[^\d]/g, ''), 10)
    if (annual) {
      const discounted = Math.round(raw * 0.9 / 1000) * 1000
      return { display: `₦${discounted.toLocaleString()}`, period: '/month', billed: `₦${(discounted * 12).toLocaleString()} billed annually` }
    }
    return { display: plan.price, period: plan.period, billed: null }
  }

  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-4">
            Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-charcoal-900 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-gray-500 mb-8">
            Choose the plan that fits your practice. All plans include a 14-day free trial.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                !annual ? 'bg-white shadow-sm text-charcoal-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                annual ? 'bg-white shadow-sm text-charcoal-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Annual
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                10% off
              </span>
            </button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto items-start">
          {pricingPlans.map((plan, i) => {
            const priceInfo = getPrice(plan)
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl p-8 transition-all ${
                  plan.highlighted
                    ? 'bg-gradient-brand shadow-glass-lg ring-2 ring-emerald-600/30'
                    : 'bg-white border border-gray-200 hover:border-emerald-200 hover:shadow-card-hover'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <span className="bg-amber-400 text-charcoal-900 text-xs font-bold px-5 py-1.5 rounded-full shadow-sm">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-7 pt-2">
                  <h3 className={`text-lg font-semibold mb-1 ${plan.highlighted ? 'text-white' : 'text-charcoal-900'}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1 my-3">
                    <span className={`text-4xl font-display font-bold ${plan.highlighted ? 'text-white' : 'text-charcoal-900'}`}>
                      {priceInfo.display}
                    </span>
                    {priceInfo.period && (
                      <span className={`text-sm ${plan.highlighted ? 'text-white/65' : 'text-gray-400'}`}>
                        {priceInfo.period}
                      </span>
                    )}
                  </div>
                  {priceInfo.billed && (
                    <p className={`text-xs font-medium mb-2 ${plan.highlighted ? 'text-emerald-300' : 'text-emerald-600'}`}>
                      {priceInfo.billed}
                    </p>
                  )}
                  <p className={`text-sm ${plan.highlighted ? 'text-white/65' : 'text-gray-500'}`}>
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <CheckCircleIcon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${plan.highlighted ? 'text-emerald-300' : 'text-emerald-600'}`} />
                      <span className={`text-sm ${plan.highlighted ? 'text-white/80' : 'text-gray-700'}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  as={Link}
                  to="/signup"
                  variant={plan.highlighted ? 'secondary' : 'primary'}
                  className={`w-full ${plan.highlighted ? 'bg-white text-emerald-700 hover:bg-emerald-50' : ''}`}
                >
                  {plan.cta}
                </Button>
              </motion.div>
            )
          })}
        </div>

        <p className="text-center text-gray-400 text-sm mt-8">
          All prices in Nigerian Naira. VAT may apply. Cancel anytime.
        </p>
      </div>
    </section>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">

      {/* ── Navigation ─────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center shadow-sm group-hover:shadow-glass transition-shadow">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="font-display font-bold text-xl text-charcoal-900">Cynosure</span>
            </Link>

            <div className="hidden md:flex items-center gap-0.5">
              {[
                { label: 'Features', href: '#features', isAnchor: true },
                { label: 'Pricing',  href: '#pricing',  isAnchor: true },
                { label: 'About',    href: '#about',    isAnchor: true },
                { label: 'Contact',  href: '/contact',  isAnchor: false },
              ].map((item) =>
                item.isAnchor ? (
                  <a key={item.label} href={item.href}
                    className="px-3.5 py-2 text-sm font-medium text-gray-600 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition-all">
                    {item.label}
                  </a>
                ) : (
                  <Link key={item.label} to={item.href}
                    className="px-3.5 py-2 text-sm font-medium text-gray-600 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition-all">
                    {item.label}
                  </Link>
                )
              )}
            </div>

            <div className="flex items-center gap-2">
              {isAuthenticated ? (
                <Button size="sm" as={Link} to="/dashboard">
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button variant="ghost" size="sm" as={Link} to="/login" className="hidden sm:inline-flex">
                    Sign in
                  </Button>
                  <Button size="sm" as={Link} to="/signup">
                    Get Started
                  </Button>
                </>
              )}
              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileMenuOpen((v) => !v)}
                className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-lg"
          >
            <div className="max-w-7xl mx-auto px-4 py-3 space-y-1">
              {[
                { label: 'Features', href: '#features', isAnchor: true },
                { label: 'Pricing',  href: '#pricing',  isAnchor: true },
                { label: 'About',    href: '#about',    isAnchor: true },
                { label: 'Contact',  href: '/contact',  isAnchor: false },
              ].map((item) =>
                item.isAnchor ? (
                  <a key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all">
                    {item.label}
                  </a>
                ) : (
                  <Link key={item.label} to={item.href} onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all">
                    {item.label}
                  </Link>
                )
              )}
              {!isAuthenticated && (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-all">
                  Sign in
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center bg-charcoal-900 overflow-hidden pt-16">
        {/* Ambient glow orbs */}
        <div className="absolute inset-0 bg-mesh-pattern opacity-20 pointer-events-none" />
        <div className="absolute -top-48 -left-48 w-[500px] h-[500px] bg-emerald-700/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-900/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 lg:py-24 relative">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">

            {/* Left */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/50 border border-emerald-700/40 text-emerald-300 text-sm font-medium mb-8"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Now live across 36 states and the FCT
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="font-display font-bold text-5xl md:text-6xl lg:text-[4.25rem] text-white leading-[1.06] mb-6"
              >
                Nigeria's Legal
                <span className="block text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 via-emerald-300 to-green-400">
                  Intelligence
                </span>
                Platform.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-lg text-gray-400 mb-10 leading-relaxed max-w-xl"
              >
                Track cause lists, follow cases, and receive instant court notifications.
                Built for Nigerian legal practitioners who can't afford to miss a hearing.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-3 mb-8"
              >
                <Button size="lg" as={Link} to="/signup" rightIcon={<ArrowRightIcon className="h-5 w-5" />}>
                  Start Free Trial
                </Button>
                <a
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/15 text-white hover:bg-white/8 text-sm font-medium transition-all"
                >
                  Explore Features
                  <ChevronRightIcon className="h-4 w-4" />
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.45 }}
                className="flex items-center gap-6"
              >
                <p className="text-gray-500 text-sm">Free plan available · No credit card required</p>
              </motion.div>

              {/* Mini stats */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.55 }}
                className="grid grid-cols-3 gap-4 mt-10 pt-10 border-t border-white/8"
              >
                {[
                  { value: '500+',   label: 'Courts' },
                  { value: '50K+',   label: 'Cases' },
                  { value: '2,000+', label: 'Lawyers' },
                ].map((s, i) => (
                  <div key={i}>
                    <p className="text-2xl font-display font-bold text-white">{s.value}</p>
                    <p className="text-gray-500 text-sm">{s.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right: Live CSI preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.3 }}
              className="lg:block"
            >
              <CSIPreview />
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── Trust bar ──────────────────────────────────────────────── */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-400">
            <span className="font-medium text-gray-500">Trusted by lawyers across</span>
            {['Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan', 'Enugu'].map((city) => (
              <span key={city} className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-emerald-400" />
                {city}
              </span>
            ))}
            <span className="text-emerald-600 font-medium">+ 30 more states & FCT</span>
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-4">
              Platform Features
            </span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-charcoal-900 mb-4">
              Everything a modern Nigerian<br className="hidden sm:block" /> lawyer needs
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              One platform. Six powerful modules. Built for how you actually practise law.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {allFeatures.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className={`relative rounded-2xl p-7 border transition-all ${
                  feature.active
                    ? 'bg-gradient-brand border-emerald-800 shadow-glass-lg hover:shadow-2xl'
                    : 'bg-white border-gray-100 hover:border-emerald-200 hover:shadow-card-hover'
                }`}
              >
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                    feature.active ? 'bg-white/15' : 'bg-emerald-50'
                  }`}>
                    <feature.icon className={`h-5 w-5 ${feature.active ? 'text-white' : 'text-emerald-700'}`} />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                      feature.active ? 'bg-white/15 text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {feature.abbr}
                    </span>
                    {feature.active ? (
                      <span className="flex items-center gap-1 text-[11px] font-semibold bg-green-400/15 text-green-300 px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        Live
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-gray-400 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full">
                        <LockClosedIcon className="h-3 w-3" />
                        Soon
                      </span>
                    )}
                  </div>
                </div>

                <h3 className={`text-[17px] font-semibold mb-2 ${feature.active ? 'text-white' : 'text-charcoal-900'}`}>
                  {feature.title}
                </h3>
                <p className={`text-sm leading-relaxed ${feature.active ? 'text-white/75' : 'text-gray-500'}`}>
                  {feature.description}
                </p>

                {feature.active && (
                  <Link
                    to="/signup"
                    className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:text-emerald-200 transition-colors"
                  >
                    Access now <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CSI Spotlight ──────────────────────────────────────────── */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Image side */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative order-2 lg:order-1 pb-10 sm:pb-8"
            >
              <div className="rounded-3xl overflow-hidden shadow-glass-lg">
                <img
                  src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=900&h=650&fit=crop"
                  alt="Nigerian court building"
                  className="w-full h-auto"
                />
              </div>
              {/* Floating notification card */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="absolute -bottom-4 right-2 sm:-bottom-6 sm:-right-6 bg-white rounded-2xl shadow-glass border border-gray-100 p-4 max-w-[220px] sm:max-w-[260px]"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center flex-shrink-0">
                    <BellAlertIcon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-charcoal-900">Cause list updated</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">Federal High Court, Lagos · 3 new matters added</p>
                    <p className="text-xs text-emerald-600 font-semibold mt-1.5">Just now</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Text side */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Now Live
              </span>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-charcoal-900 mb-5 leading-tight">
                Real-time Cause Lists
                <span className="text-emerald-700 block">Across Every Court</span>
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Stop chasing court staff for cause lists. Cynosure delivers real-time court sitting
                information the moment it's published — covering 500+ courts across all 36 states and the FCT.
              </p>

              <div className="space-y-4 mb-10">
                {[
                  {
                    icon: MagnifyingGlassIcon,
                    label: 'Advanced Search & Filters',
                    text: 'Find cases by name, number, judge, or court instantly.',
                  },
                  {
                    icon: BellAlertIcon,
                    label: 'Instant Notifications',
                    text: 'Push, email, and SMS alerts for your tracked cases.',
                  },
                  {
                    icon: ChartBarIcon,
                    label: 'Analytics & Insights',
                    text: 'Track judge patterns, court performance, and case trends.',
                  },
                  {
                    icon: BuildingLibraryIcon,
                    label: 'Full Court Directory',
                    text: 'Comprehensive database of courts, judges, and jurisdictions.',
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <item.icon className="h-5 w-5 text-emerald-700" />
                    </div>
                    <div>
                      <p className="font-semibold text-charcoal-900 text-sm">{item.label}</p>
                      <p className="text-gray-500 text-sm mt-0.5">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button as={Link} to="/signup" size="lg" rightIcon={<ArrowRightIcon className="h-5 w-5" />}>
                Get started for free
              </Button>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────────── */}
      <section className="py-24 bg-charcoal-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-pattern opacity-10 pointer-events-none" />
        <div className="absolute -top-40 right-0 w-96 h-96 bg-emerald-800/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-20 w-72 h-72 bg-emerald-900/30 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
              Up and running in minutes
            </h2>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto">
              Three simple steps to never miss a hearing again.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                number: '01',
                title: 'Create Your Account',
                description: 'Sign up in under 2 minutes with your email. No credit card required. Your data is secure and private.',
              },
              {
                number: '02',
                title: 'Add Your Cases',
                description: 'Link your active cases and select the courts you appear in across any state in Nigeria.',
              },
              {
                number: '03',
                title: 'Stay Ahead, Always',
                description: 'Receive instant alerts the moment cause lists are published or updated. Never be caught off-guard.',
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="group text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-emerald-700/20 border border-emerald-700/30 flex items-center justify-center mx-auto mb-6 group-hover:bg-emerald-700/35 group-hover:border-emerald-600/40 transition-all">
                  <span className="font-display font-bold text-2xl text-emerald-400">{step.number}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed text-[15px]">{step.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-center mt-14"
          >
            <Button size="lg" as={Link} to="/signup" rightIcon={<ArrowRightIcon className="h-5 w-5" />}>
              Create Your Free Account
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-charcoal-900 mb-4">
              Trusted by legal professionals
            </h2>
            <p className="text-xl text-gray-500">
              Hear from lawyers across Nigeria who use Cynosure every day.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-7 border border-gray-100 shadow-soft hover:shadow-card-hover transition-all group"
              >
                <div className="flex gap-0.5 mb-5">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <p className="text-gray-700 leading-relaxed mb-6 text-[15px]">
                  "{t.quote}"
                </p>

                <div className="flex items-center gap-3">
                  <img
                    src={t.image}
                    alt={t.author}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-100 group-hover:ring-emerald-200 transition-all"
                  />
                  <div>
                    <p className="text-sm font-semibold text-charcoal-900">{t.author}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────── */}
      <PricingSection />

      {/* ── About ──────────────────────────────────────────────────── */}
      <section id="about" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold uppercase tracking-wider mb-6">
                Our Story
              </span>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-charcoal-900 mb-6 leading-tight">
                Built by lawyers,
                <span className="text-emerald-700 block">for lawyers</span>
              </h2>
              <p className="text-lg text-gray-600 mb-5 leading-relaxed">
                Cynosure was born from a simple frustration: Nigerian lawyers were spending too much time
                chasing court schedules and tracking cause lists instead of practising law.
              </p>
              <p className="text-gray-600 mb-10 leading-relaxed">
                Founded in 2026, we've made it our mission to digitize and democratize access to court
                information across Nigeria. Today, we serve thousands of legal professionals — helping them
                stay informed, prepared, and ahead of their cases.
              </p>
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
                {[
                  { value: '2026',   label: 'Founded' },
                  { value: '36+1', label: 'States Covered' },
                  { value: '500+', label: 'Courts' },
                ].map((item, i) => (
                  <div key={i}>
                    <p className="text-2xl font-display font-bold text-charcoal-900">{item.value}</p>
                    <p className="text-gray-500 text-sm mt-0.5">{item.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              {[
                {
                  icon: ShieldCheckIcon,
                  title: 'Trust & Reliability',
                  description: 'We understand the critical nature of legal work. Our platform maintains 99.9% uptime because your cases cannot wait.',
                },
                {
                  icon: UserGroupIcon,
                  title: 'User-Centric Design',
                  description: 'Built by lawyers, for lawyers. Every feature is designed with real legal workflows in mind.',
                },
                {
                  icon: GlobeAltIcon,
                  title: 'Pan-Nigerian Coverage',
                  description: 'From Lagos to Maiduguri, we cover courts across all 36 states and the FCT.',
                },
              ].map((value, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-soft hover:shadow-card-hover transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <value.icon className="h-6 w-6 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-charcoal-900 mb-1">{value.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{value.description}</p>
                  </div>
                </div>
              ))}
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-brand relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-pattern opacity-10 pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-black/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-5 leading-tight">
              Ready to transform
              <span className="block">your legal practice?</span>
            </h2>
            <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto">
              Join thousands of Nigerian lawyers using Cynosure to stay ahead of their cases.
              Start your free trial today — no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                variant="secondary"
                as={Link}
                to="/signup"
                className="bg-white text-emerald-700 hover:bg-emerald-50 shadow-sm"
              >
                Get Started Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                as={Link}
                to="/contact"
                className="border-white/40 text-white hover:bg-white/10"
              >
                Contact Sales
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="bg-charcoal-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-10 mb-12">

            {/* Brand */}
            <div className="col-span-2 md:col-span-3 lg:col-span-2">
              <Link to="/" className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <span className="font-display font-bold text-xl">Cynosure</span>
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
                Nigeria's leading legal intelligence platform for real-time court information and case tracking.
              </p>
              <div className="flex items-center gap-2">
                <a href="#" className="w-9 h-9 rounded-lg bg-white/8 flex items-center justify-center hover:bg-white/15 transition-colors">
                  <svg className="h-4 w-4 fill-current text-gray-400" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="w-9 h-9 rounded-lg bg-white/8 flex items-center justify-center hover:bg-white/15 transition-colors">
                  <svg className="h-4 w-4 fill-current text-gray-400" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white text-sm mb-4">Product</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">API</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Integrations</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white text-sm mb-4">Company</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white text-sm mb-4">Legal</h4>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Cynosure Legal Technologies. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-gray-500 text-sm">All systems operational</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
