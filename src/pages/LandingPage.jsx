import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BoltIcon,
  BellAlertIcon,
  MagnifyingGlassIcon,
  BuildingLibraryIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@/components/common'
import { useAuthStore } from '@/store/authStore'

const features = [
  {
    icon: DocumentTextIcon,
    title: 'Real-time Cause Lists',
    description: 'Access daily court schedules across all Nigerian courts the moment they are published.',
  },
  {
    icon: BellAlertIcon,
    title: 'Instant Notifications',
    description: 'Get alerts for case adjournments, schedule changes, and judge availability in real-time.',
  },
  {
    icon: MagnifyingGlassIcon,
    title: 'Advanced Search',
    description: 'Find cases, track proceedings, and search legal documents with powerful filters.',
  },
  {
    icon: BuildingLibraryIcon,
    title: 'Court Directory',
    description: 'Comprehensive database of courts, judges, and jurisdictions across Nigeria.',
  },
  {
    icon: ChartBarIcon,
    title: 'Analytics & Insights',
    description: 'Track case patterns, judge schedules, and court performance metrics.',
  },
  {
    icon: BoltIcon,
    title: 'E-Filing Ready',
    description: 'Seamless integration with electronic filing systems for supported courts.',
  },
]

const stats = [
  { value: '500+', label: 'Courts Covered' },
  { value: '50K+', label: 'Cases Tracked' },
  { value: '2K+', label: 'Active Lawyers' },
  { value: '99.9%', label: 'Uptime' },
]

const testimonials = [
  {
    quote: "Cynosure has transformed how I manage my cases. I never miss a hearing date anymore.",
    author: "Barr. Adaeze Okonkwo",
    role: "Senior Associate, Lagos",
  },
  {
    quote: "The real-time cause list updates have saved me countless trips to court. Essential for any lawyer.",
    author: "Barr. Ibrahim Mohammed",
    role: "Principal Partner, Abuja",
  },
  {
    quote: "Finally, a platform that understands the Nigerian legal system. The notifications are a game-changer.",
    author: "Barr. Chidinma Eze",
    role: "Legal Consultant, Port Harcourt",
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
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '₦15,000',
    period: '/month',
    description: 'For busy lawyers who need comprehensive tracking',
    features: [
      'Track unlimited cases',
      'Real-time cause list updates',
      'Email, SMS & push notifications',
      'Advanced search & filters',
      'Judge analytics & insights',
      'Export reports (PDF, Excel)',
      'Priority email support',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For law firms requiring team collaboration',
    features: [
      'Everything in Professional',
      'Unlimited team members',
      'Firm-wide case management',
      'Custom integrations & API',
      'Dedicated account manager',
      'On-premise deployment option',
      '24/7 phone support',
      'Training & onboarding',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
]

const teamMembers = [
  {
    name: 'Saheed Apampa, Esq',
    role: 'CEO & Co-founder',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    bio: 'Lawyer with 5 years experience in the bar. Passionate about legal tech innovation.',
  },
  {
    name: 'Habeebullah Akorede',
    role: 'CTO & Co-founder',
    image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=200&h=200&fit=crop&crop=face',
    bio: 'Software engineer and legal tech enthusiast. Previously at leading tech companies.',
  },
  {
    name: 'Babatunde Olatunji',
    role: 'Head of Product',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    bio: 'Product leader focused on building tools that make legal work more efficient.',
  },
]

const companyValues = [
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
]

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="font-display font-bold text-xl text-charcoal-900">
                Cynosure
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-emerald-700 text-sm font-medium">
                Features
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-emerald-700 text-sm font-medium">
                Pricing
              </a>
              <a href="#about" className="text-gray-600 hover:text-emerald-700 text-sm font-medium">
                About
              </a>
              <Link to="/contact" className="text-gray-600 hover:text-emerald-700 text-sm font-medium">
                Contact
              </Link>
            </div>

            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Button as={Link} to="/dashboard">
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button variant="ghost" as={Link} to="/login">
                    Sign in
                  </Button>
                  <Button as={Link} to="/signup">
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-pattern opacity-30" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Now serving 37 states across Nigeria
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-charcoal-900 mb-6 leading-tight">
              Real-time Legal
              <span className="text-gradient block">Intelligence Platform</span>
            </h1>

            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Track cases, access cause lists, and stay informed with instant court notifications. 
              Built for Nigerian legal practitioners.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" as={Link} to="/signup" rightIcon={<ArrowRightIcon className="h-5 w-5" />}>
                Start Free Trial
              </Button>
              <Button variant="secondary" size="lg" as={Link} to="/demo">
                Watch Demo
              </Button>
            </div>

            <p className="text-sm text-gray-500 mt-4">
              No credit card required • 14-day free trial
            </p>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-gray-50 to-transparent z-10 pointer-events-none h-32 bottom-0 top-auto" />
            <div className="rounded-2xl border border-gray-200 shadow-2xl overflow-hidden bg-white">
              <div className="bg-gray-100 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-white rounded-lg px-4 py-1 text-sm text-gray-500 w-64 text-center">
                    app.cynosure.ng
                  </div>
                </div>
              </div>
              <img
                src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&h=600&fit=crop"
                alt="Dashboard Preview"
                className="w-full h-auto"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-charcoal-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <p className="text-4xl md:text-5xl font-display font-bold text-white mb-2">
                  {stat.value}
                </p>
                <p className="text-gray-400">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

            {/* About Section */}
      <section id="about" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Company Story */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center mb-20"
          >
            <h2 className="text-4xl font-display font-bold text-charcoal-900 mb-6">
              About Cynosure
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              Cynosure was born from a simple frustration: Nigerian lawyers were spending too much time 
              tracking court schedules and chasing cause lists instead of practicing law.
            </p>
            <p className="text-lg text-gray-600">
              Founded in 2023, we've made it our mission to digitize and democratize access to court 
              information across Nigeria. Today, we serve thousands of legal professionals, helping them 
              stay informed, prepared, and ahead of their cases.
            </p>
          </motion.div>

          {/* Company Values */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {companyValues.map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <value.icon className="h-7 w-7 text-emerald-700" />
                </div>
                <h3 className="text-lg font-semibold text-charcoal-900 mb-2">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Team Section */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h3 className="text-3xl font-display font-bold text-charcoal-900 mb-4">
              Meet our leadership
            </h3>
            <p className="text-gray-600">
              A team passionate about transforming legal practice in Nigeria
            </p>
          </motion.div> */}

          {/* <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {teamMembers.map((member, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card p-6 text-center"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                />
                <h4 className="font-semibold text-charcoal-900">{member.name}</h4>
                <p className="text-emerald-700 text-sm mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </motion.div>
            ))}
          </div> */}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-4xl font-display font-bold text-charcoal-900 mb-4">
              Everything you need to stay ahead
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features designed for the modern legal practitioner.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card p-6 hover:shadow-card-hover transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-emerald-700" />
                </div>
                <h3 className="text-lg font-semibold text-charcoal-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-4xl font-display font-bold text-charcoal-900 mb-4">
              Trusted by legal professionals
            </h2>
            <p className="text-xl text-gray-600">
              See what lawyers across Nigeria are saying about Cynosure.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card p-6"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 mb-4">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-charcoal-900">{testimonial.author}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-4xl font-display font-bold text-charcoal-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that fits your practice. All plans include a 14-day free trial.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`card p-8 relative ${
                  plan.highlighted 
                    ? 'ring-2 ring-emerald-600 shadow-xl' 
                    : ''
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-emerald-600 text-white text-sm font-medium px-4 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-charcoal-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-charcoal-900">{plan.price}</span>
                    {plan.period && (
                      <span className="text-gray-500">{plan.period}</span>
                    )}
                  </div>
                  <p className="text-gray-600 mt-2 text-sm">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <CheckCircleIcon className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  as={Link}
                  to={plan.name === 'Enterprise' ? '/contact' : '/signup'}
                  variant={plan.highlighted ? 'primary' : 'secondary'}
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-gray-500 mt-8"
          >
            All prices in Nigerian Naira. VAT may apply. Cancel anytime.
          </motion.p>
        </div>
      </section>


      {/* CTA Section */}
      <section className="py-24 bg-gradient-brand relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-pattern opacity-10" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              Ready to transform your legal practice?
            </h2>
            <p className="text-xl text-white/80 mb-10">
              Join thousands of lawyers using Cynosure to stay ahead. Start your free trial today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                variant="secondary"
                as={Link}
                to="/signup"
                className="bg-white text-emerald-700 hover:bg-gray-100"
              >
                Get Started Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                as={Link}
                to="/contact"
                className="border-white text-white hover:bg-white/10"
              >
                Contact Sales
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-charcoal-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <span className="font-display font-bold text-xl">Cynosure</span>
              </div>
              <p className="text-gray-400 text-sm">
                Nigeria's leading legal intelligence platform for real-time court information.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/features" className="hover:text-white">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link to="/api" className="hover:text-white">API</Link></li>
                <li><Link to="/integrations" className="hover:text-white">Integrations</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/about" className="hover:text-white">About</Link></li>
                <li><Link to="/blog" className="hover:text-white">Blog</Link></li>
                <li><Link to="/careers" className="hover:text-white">Careers</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link to="/cookies" className="hover:text-white">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Cynosure. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
