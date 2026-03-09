import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  BookOpenIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import { Button, Input } from '@/components/common'

const contactMethods = [
  {
    icon: EnvelopeIcon,
    title: 'Email Support',
    description: 'Get help via email within 24 hours',
    contact: 'support@cynosure.ng',
    action: 'mailto:support@cynosure.ng',
  },
  {
    icon: PhoneIcon,
    title: 'Phone Support',
    description: 'Available Mon-Fri, 9am-5pm WAT',
    contact: '+234 800 123 4567',
    action: 'tel:+2348001234567',
  },
  {
    icon: ChatBubbleLeftRightIcon,
    title: 'Live Chat',
    description: 'Chat with our team in real-time',
    contact: 'Start a conversation',
    action: '#live-chat',
  },
]

const faqItems = [
  {
    question: 'How do I track a case?',
    answer: 'Navigate to the Cases section from your dashboard, click "Add Case" and enter the suit number. Cynosure will automatically track updates and notify you of any changes.',
  },
  {
    question: 'Which courts are covered?',
    answer: 'Cynosure covers all Federal High Courts, State High Courts, Court of Appeal divisions, and the Supreme Court across all 37 states and FCT in Nigeria.',
  },
  {
    question: 'How do notifications work?',
    answer: 'You can receive notifications via email, SMS, or in-app alerts. Configure your preferences in Settings > Notifications to choose which events trigger alerts.',
  },
  {
    question: 'Can I export cause lists?',
    answer: 'Yes, Pro and Enterprise users can export cause lists in PDF, Excel, or CSV formats. Go to Cause Lists, select the lists you need, and click the Export button.',
  },
  {
    question: 'How do I upgrade my plan?',
    answer: 'Go to Settings > Subscription and click "Upgrade Plan". You can upgrade at any time and will only be charged the prorated difference.',
  },
]

const offices = [
  {
    city: 'Lagos',
    address: '15 Broad Street, Lagos Island',
    state: 'Lagos State, Nigeria',
  },
  {
    city: 'Abuja',
    address: '24 Constitution Avenue, Central Area',
    state: 'FCT, Nigeria',
  },
]

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState(null)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsSubmitting(false)
    setIsSubmitted(true)
    setFormData({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
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

            <div className="flex items-center gap-3">
              <Button variant="ghost" as={Link} to="/">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold text-charcoal-900 mb-4">
              How can we help?
            </h1>
            <p className="text-xl text-gray-600">
              Our team is here to support you. Reach out through any of the channels below.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {contactMethods.map((method, i) => (
              <motion.a
                key={i}
                href={method.action}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card p-6 hover:shadow-card-hover transition-all group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4 group-hover:bg-emerald-200 transition-colors">
                  <method.icon className="h-6 w-6 text-emerald-700" />
                </div>
                <h3 className="text-lg font-semibold text-charcoal-900 mb-1">
                  {method.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3">{method.description}</p>
                <p className="text-emerald-700 font-medium">{method.contact}</p>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & FAQ */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="card p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <EnvelopeIcon className="h-5 w-5 text-emerald-700" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-charcoal-900">Send us a message</h2>
                    <p className="text-sm text-gray-600">We'll respond within 24 hours</p>
                  </div>
                </div>

                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                      <CheckCircleIcon className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-charcoal-900 mb-2">
                      Message sent successfully!
                    </h3>
                    <p className="text-gray-600 mb-6">
                      We'll get back to you as soon as possible.
                    </p>
                    <Button variant="secondary" onClick={() => setIsSubmitted(false)}>
                      Send another message
                    </Button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Your name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="input-field"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Email address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="input-field"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Subject
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="input-field"
                        placeholder="How can we help?"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Message
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="input-field resize-none"
                        placeholder="Tell us more about your inquiry..."
                      />
                    </div>
                    <Button type="submit" className="w-full" isLoading={isSubmitting}>
                      Send Message
                    </Button>
                  </form>
                )}
              </div>
            </motion.div>

            {/* FAQ */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <QuestionMarkCircleIcon className="h-5 w-5 text-emerald-700" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-charcoal-900">Frequently Asked Questions</h2>
                  <p className="text-sm text-gray-600">Quick answers to common questions</p>
                </div>
              </div>

              <div className="space-y-3">
                {faqItems.map((item, i) => (
                  <div
                    key={i}
                    className="card overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                      className="w-full p-4 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-charcoal-900">{item.question}</span>
                      <motion.span
                        animate={{ rotate: expandedFaq === i ? 180 : 0 }}
                        className="text-gray-400 flex-shrink-0"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </motion.span>
                    </button>
                    <motion.div
                      initial={false}
                      animate={{
                        height: expandedFaq === i ? 'auto' : 0,
                        opacity: expandedFaq === i ? 1 : 0,
                      }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 pb-4 text-gray-600">{item.answer}</p>
                    </motion.div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <div className="flex items-start gap-3">
                  <BookOpenIcon className="h-5 w-5 text-emerald-700 mt-0.5" />
                  <div>
                    <p className="font-medium text-charcoal-900">Need more help?</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Check out our comprehensive{' '}
                      <Link to="/docs" className="text-emerald-700 hover:underline">
                        documentation
                      </Link>{' '}
                      for detailed guides and tutorials.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Office Locations */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-display font-bold text-charcoal-900 mb-4">
              Our Offices
            </h2>
            <p className="text-gray-600">
              Visit us at any of our locations across Nigeria
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {offices.map((office, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <MapPinIcon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-charcoal-900 text-lg">{office.city}</h3>
                    <p className="text-gray-600 mt-1">{office.address}</p>
                    <p className="text-gray-500 text-sm">{office.state}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-charcoal-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="font-display font-bold">Cynosure</span>
            </div>
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Cynosure. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
