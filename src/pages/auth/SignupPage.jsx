import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline'
import { Button, Input, Select } from '@/components/common'
import { authAPI } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { getErrorMessage, NIGERIAN_STATES } from '@/utils/helpers'

const userTypes = [
  { value: 'lawyer', label: 'Legal Practitioner' },
  { value: 'firm_admin', label: 'Law Firm Administrator' },
]

export default function SignupPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      confirm_password: '',
      first_name: '',
      last_name: '',
      phone_number: '',
      user_type: 'lawyer',
    },
  })

  const password = watch('password')
  const userType = watch('user_type')

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const response = await authAPI.signup(data)
      const { user, access, refresh } = response.data.data
      login(user, access, refresh)
      toast.success('Account created successfully!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center bg-gradient-brand relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-pattern opacity-10" />
        
        <div className="relative z-10 max-w-lg text-center text-white px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-3xl font-display font-bold mb-4">
              Join Nigeria's Leading Legal Platform
            </h2>
            <p className="text-white/80 text-lg mb-8">
              Get instant access to court schedules, case tracking, and real-time notifications.
            </p>

            <div className="space-y-4 text-left">
              {[
                'Real-time cause list updates',
                'Track cases across all Nigerian courts',
                'Follow judges and get hearing notifications',
                'Access legal repository & documents',
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span>{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-display font-bold text-2xl text-charcoal-900">
              Cynosure
            </span>
          </Link>

          <h1 className="text-3xl font-display font-bold text-charcoal-900 mb-2">
            Create your account
          </h1>
          <p className="text-gray-600 mb-8">
            Start tracking cases and court schedules
          </p>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-emerald-700' : 'bg-gray-200'}`} />
            <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-emerald-700' : 'bg-gray-200'}`} />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-5"
              >
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First name"
                    placeholder="John"
                    leftIcon={<UserIcon className="h-5 w-5" />}
                    error={errors.first_name?.message}
                    {...register('first_name', {
                      required: 'First name is required',
                    })}
                  />
                  <Input
                    label="Last name"
                    placeholder="Doe"
                    error={errors.last_name?.message}
                    {...register('last_name', {
                      required: 'Last name is required',
                    })}
                  />
                </div>

                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  leftIcon={<EnvelopeIcon className="h-5 w-5" />}
                  error={errors.email?.message}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                />

                <Input
                  label="Phone number"
                  type="tel"
                  placeholder="+234 801 234 5678"
                  leftIcon={<PhoneIcon className="h-5 w-5" />}
                  error={errors.phone_number?.message}
                  {...register('phone_number')}
                />

                <Select
                  label="I am a"
                  value={userType}
                  onChange={(value) => setValue('user_type', value)}
                  options={userTypes}
                />

                <Button
                  type="button"
                  className="w-full"
                  onClick={() => setStep(2)}
                >
                  Continue
                </Button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-5"
              >
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  leftIcon={<LockClosedIcon className="h-5 w-5" />}
                  hint="Must be at least 8 characters"
                  error={errors.password?.message}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  })}
                />

                <Input
                  label="Confirm password"
                  type="password"
                  placeholder="••••••••"
                  leftIcon={<LockClosedIcon className="h-5 w-5" />}
                  error={errors.confirm_password?.message}
                  {...register('confirm_password', {
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === password || 'Passwords do not match',
                  })}
                />

                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-emerald-700 focus:ring-emerald-700"
                    {...register('terms', {
                      required: 'You must accept the terms',
                    })}
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    I agree to the{' '}
                    <Link to="/terms" className="text-emerald-700 hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-emerald-700 hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                {errors.terms && (
                  <p className="text-sm text-red-600">{errors.terms.message}</p>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    isLoading={isLoading}
                  >
                    Create account
                  </Button>
                </div>
              </motion.div>
            )}
          </form>

          <p className="mt-6 text-center text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
