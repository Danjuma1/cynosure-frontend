import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  UserCircleIcon,
  BellIcon,
  LockClosedIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline'
import { Card, CardHeader, CardTitle, Button, Input } from '@/components/common'
import { authAPI, notificationsAPI } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { getErrorMessage } from '@/utils/helpers'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const { user, updateUser } = useAuthStore()

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <UserCircleIcon className="h-5 w-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <BellIcon className="h-5 w-5" /> },
    { id: 'security', label: 'Security', icon: <LockClosedIcon className="h-5 w-5" /> },
    { id: 'subscription', label: 'Subscription', icon: <CreditCardIcon className="h-5 w-5" /> },
  ]

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold text-charcoal-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account preferences</p>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        <Card className="p-4 h-fit lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === tab.id ? 'bg-emerald-100 text-emerald-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </Card>

        <div className="lg:col-span-3">
          {activeTab === 'profile' && <ProfileSettings user={user} updateUser={updateUser} />}
          {activeTab === 'notifications' && <NotificationSettings />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'subscription' && <SubscriptionSettings user={user} />}
        </div>
      </div>
    </div>
  )
}

function ProfileSettings({ user, updateUser }) {
  const { register, handleSubmit, formState: { errors, isDirty } } = useForm({
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone_number: user?.phone_number || '',
      bio: user?.bio || '',
      bar_number: user?.bar_number || '',
    },
  })

  const mutation = useMutation({
    mutationFn: (data) => authAPI.updateProfile(data),
    onSuccess: (response) => {
      updateUser(response.data.data)
      toast.success('Profile updated')
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  return (
    <Card className="p-6">
      <CardHeader className="px-0 pt-0"><CardTitle>Profile Information</CardTitle></CardHeader>
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <Input label="First name" error={errors.first_name?.message} {...register('first_name', { required: 'Required' })} />
          <Input label="Last name" error={errors.last_name?.message} {...register('last_name', { required: 'Required' })} />
        </div>
        <Input label="Email" type="email" value={user?.email} disabled hint="Email cannot be changed" />
        <Input label="Phone number" type="tel" {...register('phone_number')} />
        <Input label="Bar Number" placeholder="NBA/12345/2020" {...register('bar_number')} />
        <div>
          <label className="block text-sm font-medium text-charcoal-700 mb-1.5">Bio</label>
          <textarea rows={4} className="input-field" placeholder="Tell us about yourself..." {...register('bio')} />
        </div>
        <div className="flex justify-end">
          <Button type="submit" isLoading={mutation.isPending} disabled={!isDirty}>Save Changes</Button>
        </div>
      </form>
    </Card>
  )
}

function NotificationSettings() {
  const { data } = useQuery({ queryKey: ['notification-preferences'], queryFn: () => notificationsAPI.getPreferences() })
  const mutation = useMutation({
    mutationFn: (data) => notificationsAPI.updatePreferences(data),
    onSuccess: () => toast.success('Preferences updated'),
    onError: (err) => toast.error(getErrorMessage(err)),
  })

  const preferences = data?.data || {}
  const options = [
    { key: 'email_enabled', label: 'Email Notifications', desc: 'Receive notifications via email' },
    { key: 'push_enabled', label: 'Push Notifications', desc: 'Receive push notifications' },
    { key: 'cause_list_new', label: 'New Cause Lists', desc: 'When new cause lists are published' },
    { key: 'case_updates', label: 'Case Updates', desc: 'Updates on cases you follow' },
    { key: 'daily_digest', label: 'Daily Digest', desc: 'Receive a daily summary email' },
  ]

  return (
    <Card className="p-6">
      <CardHeader className="px-0 pt-0"><CardTitle>Notification Preferences</CardTitle></CardHeader>
      <div className="space-y-6">
        {options.map((opt) => (
          <div key={opt.key} className="flex items-center justify-between">
            <div><p className="font-medium text-charcoal-900">{opt.label}</p><p className="text-sm text-gray-500">{opt.desc}</p></div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={preferences[opt.key] ?? true} onChange={(e) => mutation.mutate({ [opt.key]: e.target.checked })} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        ))}
      </div>
    </Card>
  )
}

function SecuritySettings() {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm()
  const mutation = useMutation({
    mutationFn: (data) => authAPI.changePassword(data),
    onSuccess: () => { toast.success('Password changed'); reset() },
    onError: (err) => toast.error(getErrorMessage(err)),
  })
  const newPassword = watch('new_password')

  return (
    <Card className="p-6">
      <CardHeader className="px-0 pt-0"><CardTitle>Change Password</CardTitle></CardHeader>
      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
        <Input label="Current Password" type="password" error={errors.current_password?.message} {...register('current_password', { required: 'Required' })} />
        <Input label="New Password" type="password" hint="At least 8 characters" error={errors.new_password?.message} {...register('new_password', { required: 'Required', minLength: { value: 8, message: 'Min 8 characters' } })} />
        <Input label="Confirm Password" type="password" error={errors.confirm_password?.message} {...register('confirm_password', { required: 'Required', validate: (v) => v === newPassword || 'Passwords must match' })} />
        <div className="flex justify-end"><Button type="submit" isLoading={mutation.isPending}>Update Password</Button></div>
      </form>
    </Card>
  )
}

function SubscriptionSettings({ user }) {
  const currentPlan = user?.subscription_type || 'free'
  
  const plans = {
    free: { name: 'Starter', price: 'Free', color: 'bg-gray-100 text-gray-700' },
    professional: { name: 'Professional', price: '₦15,000/mo', color: 'bg-emerald-100 text-emerald-700' },
    enterprise: { name: 'Enterprise', price: '₦50,000/mo', color: 'bg-amber-100 text-amber-700' },
  }
  
  const planDetails = plans[currentPlan] || plans.free

  return (
    <Card className="p-6">
      <CardHeader className="px-0 pt-0"><CardTitle>Subscription</CardTitle></CardHeader>
      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${planDetails.color} flex items-center justify-center`}>
              <CreditCardIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-charcoal-900">{planDetails.name} Plan</p>
              <p className="text-sm text-gray-500">{planDetails.price}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            currentPlan === 'free' ? 'bg-gray-100 text-gray-700' : 'bg-emerald-100 text-emerald-700'
          }`}>
            {currentPlan === 'free' ? 'Free Tier' : 'Active'}
          </span>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-charcoal-900">Plan Features</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            {currentPlan === 'free' ? (
              <>
                <li className="flex items-center gap-2">✓ Track up to 5 cases</li>
                <li className="flex items-center gap-2">✓ Daily cause list access</li>
                <li className="flex items-center gap-2">✓ Email notifications</li>
                <li className="flex items-center gap-2">✓ Basic court directory</li>
              </>
            ) : currentPlan === 'professional' ? (
              <>
                <li className="flex items-center gap-2">✓ Unlimited case tracking</li>
                <li className="flex items-center gap-2">✓ Real-time cause list updates</li>
                <li className="flex items-center gap-2">✓ Email, SMS & push notifications</li>
                <li className="flex items-center gap-2">✓ Advanced search & filters</li>
                <li className="flex items-center gap-2">✓ Judge analytics & insights</li>
                <li className="flex items-center gap-2">✓ Export reports (PDF, Excel)</li>
              </>
            ) : (
              <>
                <li className="flex items-center gap-2">✓ Everything in Professional</li>
                <li className="flex items-center gap-2">✓ Up to 10 team members</li>
                <li className="flex items-center gap-2">✓ Firm-wide case management</li>
                <li className="flex items-center gap-2">✓ API access</li>
                <li className="flex items-center gap-2">✓ Dedicated account manager</li>
              </>
            )}
          </ul>
        </div>

        {currentPlan === 'free' && (
          <div className="p-4 bg-emerald-50 rounded-lg">
            <p className="text-sm text-emerald-800 mb-3">
              Upgrade to Professional to unlock unlimited case tracking and advanced features.
            </p>
            <Button as="a" href="/subscription">
              Upgrade Plan
            </Button>
          </div>
        )}

        <div className="pt-4 border-t border-gray-100">
          <Button variant="secondary" as="a" href="/subscription" className="w-full">
            Manage Subscription
          </Button>
        </div>
      </div>
    </Card>
  )
}
