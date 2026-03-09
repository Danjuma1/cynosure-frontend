import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  CheckCircleIcon,
  CreditCardIcon,
  CalendarDaysIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { Card, CardHeader, CardTitle, Button, Badge, Modal } from '@/components/common'
import { authAPI } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { formatDate, getErrorMessage } from '@/utils/helpers'

const plans = [
  {
    id: 'free',
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
    highlighted: false,
  },
  {
    id: 'professional',
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
    highlighted: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '₦50,000',
    period: '/month',
    description: 'For law firms requiring team collaboration',
    features: [
      'Everything in Professional',
      'Up to 10 team members',
      'Firm-wide case management',
      'API access',
      'Dedicated account manager',
      '24/7 phone support',
      'Custom training',
    ],
    highlighted: false,
  },
]

export default function SubscriptionPage() {
  const queryClient = useQueryClient()
  const { user, updateUser } = useAuthStore()
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription'],
    queryFn: () => authAPI.getSubscription(),
  })

  const upgradeMutation = useMutation({
    mutationFn: (planId) => authAPI.updateSubscription({ plan: planId }),
    onSuccess: (response) => {
      queryClient.invalidateQueries(['subscription'])
      updateUser({ ...user, subscription_type: selectedPlan })
      toast.success('Subscription updated successfully!')
      setIsUpgradeModalOpen(false)
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const cancelMutation = useMutation({
    mutationFn: () => authAPI.cancelSubscription(),
    onSuccess: () => {
      queryClient.invalidateQueries(['subscription'])
      toast.success('Subscription cancelled')
      setIsCancelModalOpen(false)
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const subscriptionData = subscription?.data || {}
  const currentPlan = user?.subscription_type || 'free'
  const currentPlanDetails = plans.find(p => p.id === currentPlan)

  const handleUpgrade = (planId) => {
    setSelectedPlan(planId)
    setIsUpgradeModalOpen(true)
  }

  const confirmUpgrade = () => {
    upgradeMutation.mutate(selectedPlan)
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-display font-bold text-charcoal-900">Subscription</h1>
        <p className="text-gray-600 mt-1">Manage your subscription and billing</p>
      </motion.div>

      {/* Current Subscription */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
              currentPlan === 'free' ? 'bg-gray-100' : 
              currentPlan === 'professional' ? 'bg-emerald-100' : 'bg-amber-100'
            }`}>
              <SparklesIcon className={`h-7 w-7 ${
                currentPlan === 'free' ? 'text-gray-600' : 
                currentPlan === 'professional' ? 'text-emerald-600' : 'text-amber-600'
              }`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold text-charcoal-900">
                  {currentPlanDetails?.name || 'Starter'} Plan
                </h2>
                <Badge variant={currentPlan === 'free' ? 'neutral' : 'success'}>
                  {currentPlan === 'free' ? 'Free' : 'Active'}
                </Badge>
              </div>
              <p className="text-gray-600 mt-1">
                {currentPlanDetails?.description}
              </p>
            </div>
          </div>
          
          {currentPlan !== 'free' && (
            <div className="flex items-center gap-3">
              <Button variant="secondary" onClick={() => setIsCancelModalOpen(true)}>
                Cancel Plan
              </Button>
            </div>
          )}
        </div>

        {currentPlan !== 'free' && subscriptionData.next_billing_date && (
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <CalendarDaysIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Next billing date</p>
                  <p className="font-medium text-charcoal-900">{formatDate(subscriptionData.next_billing_date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CreditCardIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Payment method</p>
                  <p className="font-medium text-charcoal-900">
                    {subscriptionData.payment_method || 'Card ending in ****'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ArrowPathIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Billing cycle</p>
                  <p className="font-medium text-charcoal-900">Monthly</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Available Plans */}
      <div>
        <h3 className="text-lg font-semibold text-charcoal-900 mb-4">
          {currentPlan === 'free' ? 'Upgrade your plan' : 'Change your plan'}
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className={`p-6 h-full flex flex-col ${
                plan.highlighted ? 'ring-2 ring-emerald-600' : ''
              } ${currentPlan === plan.id ? 'bg-emerald-50/50' : ''}`}>
                {plan.highlighted && (
                  <div className="text-center mb-4">
                    <span className="bg-emerald-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-4">
                  <h4 className="text-lg font-semibold text-charcoal-900">{plan.name}</h4>
                  <div className="flex items-baseline justify-center gap-1 mt-2">
                    <span className="text-3xl font-bold text-charcoal-900">{plan.price}</span>
                    {plan.period && <span className="text-gray-500">{plan.period}</span>}
                  </div>
                </div>

                <ul className="space-y-3 mb-6 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircleIcon className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {currentPlan === plan.id ? (
                  <Button variant="secondary" disabled className="w-full">
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    variant={plan.highlighted ? 'primary' : 'secondary'}
                    className="w-full"
                    onClick={() => handleUpgrade(plan.id)}
                  >
                    {plans.findIndex(p => p.id === currentPlan) < plans.findIndex(p => p.id === plan.id)
                      ? 'Upgrade'
                      : 'Switch'}
                  </Button>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Billing History */}
      <Card>
        <CardHeader className="p-6 pb-0">
          <CardTitle>Billing History</CardTitle>
        </CardHeader>
        <div className="p-6">
          {subscriptionData.billing_history?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Description</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {subscriptionData.billing_history.map((item, i) => (
                    <tr key={i}>
                      <td className="py-3 px-4 text-gray-600">{formatDate(item.date)}</td>
                      <td className="py-3 px-4 text-charcoal-900">{item.description}</td>
                      <td className="py-3 px-4 text-charcoal-900">{item.amount}</td>
                      <td className="py-3 px-4">
                        <Badge variant={item.status === 'paid' ? 'success' : 'warning'}>
                          {item.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CreditCardIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p>No billing history yet</p>
            </div>
          )}
        </div>
      </Card>

      {/* Upgrade Modal */}
      <Modal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        title="Confirm Plan Change"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            You are about to switch to the{' '}
            <span className="font-semibold text-charcoal-900">
              {plans.find(p => p.id === selectedPlan)?.name}
            </span>{' '}
            plan.
          </p>
          {selectedPlan && selectedPlan !== 'free' && (
            <div className="p-4 bg-emerald-50 rounded-lg">
              <p className="text-sm text-emerald-800">
                You will be charged{' '}
                <span className="font-semibold">
                  {plans.find(p => p.id === selectedPlan)?.price}
                </span>{' '}
                {plans.find(p => p.id === selectedPlan)?.period}.
              </p>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsUpgradeModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmUpgrade} isLoading={upgradeMutation.isPending}>
              Confirm Change
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Subscription"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg">
            <ExclamationTriangleIcon className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-amber-800">
                Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={() => setIsCancelModalOpen(false)}>
              Keep Subscription
            </Button>
            <Button variant="danger" onClick={() => cancelMutation.mutate()} isLoading={cancelMutation.isPending}>
              Yes, Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
