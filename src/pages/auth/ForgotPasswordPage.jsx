import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { EnvelopeIcon, KeyIcon, LockClosedIcon } from '@heroicons/react/24/outline'
import { Button, Input } from '@/components/common'
import { authAPI } from '@/services/api'
import { getErrorMessage } from '@/utils/helpers'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: email, 2: OTP, 3: new password
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [resetToken, setResetToken] = useState('')

  const emailForm = useForm({ defaultValues: { email: '' } })
  const otpForm = useForm({ defaultValues: { otp: '' } })
  const passwordForm = useForm({
    defaultValues: { password: '', password_confirm: '' },
  })

  const handleRequestReset = async (data) => {
    setIsLoading(true)
    try {
      await authAPI.requestPasswordReset(data)
      setEmail(data.email)
      toast.success('OTP sent to your email')
      setStep(2)
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async (data) => {
    setIsLoading(true)
    try {
      const response = await authAPI.verifyPasswordResetOTP({
        email,
        otp: data.otp,
      })
      setResetToken(response.data.data.reset_token)
      toast.success('OTP verified')
      setStep(3)
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (data) => {
    setIsLoading(true)
    try {
      await authAPI.confirmPasswordReset({
        email,
        reset_token: resetToken,
        password: data.password,
        password_confirm: data.password_confirm,
      })
      toast.success('Password reset successful!')
      navigate('/login')
    } catch (error) {
      toast.error(getErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  const password = passwordForm.watch('password')

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="card p-8">
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-display font-bold text-2xl text-charcoal-900">
              Cynosure
            </span>
          </Link>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  step >= s ? 'bg-emerald-700' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-2xl font-display font-bold text-charcoal-900 mb-2 text-center">
                Forgot your password?
              </h1>
              <p className="text-gray-600 mb-6 text-center">
                Enter your email and we'll send you a reset code.
              </p>

              <form
                onSubmit={emailForm.handleSubmit(handleRequestReset)}
                className="space-y-5"
              >
                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  leftIcon={<EnvelopeIcon className="h-5 w-5" />}
                  error={emailForm.formState.errors.email?.message}
                  {...emailForm.register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                />

                <Button type="submit" className="w-full" isLoading={isLoading}>
                  Send reset code
                </Button>
              </form>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-2xl font-display font-bold text-charcoal-900 mb-2 text-center">
                Check your email
              </h1>
              <p className="text-gray-600 mb-6 text-center">
                We sent a 6-digit code to <strong>{email}</strong>
              </p>

              <form
                onSubmit={otpForm.handleSubmit(handleVerifyOTP)}
                className="space-y-5"
              >
                <Input
                  label="Verification code"
                  placeholder="000000"
                  leftIcon={<KeyIcon className="h-5 w-5" />}
                  error={otpForm.formState.errors.otp?.message}
                  {...otpForm.register('otp', {
                    required: 'OTP is required',
                    minLength: {
                      value: 6,
                      message: 'OTP must be 6 digits',
                    },
                  })}
                />

                <Button type="submit" className="w-full" isLoading={isLoading}>
                  Verify code
                </Button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-sm text-gray-600 hover:text-emerald-700"
                >
                  Didn't receive code? Try again
                </button>
              </form>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-2xl font-display font-bold text-charcoal-900 mb-2 text-center">
                Set new password
              </h1>
              <p className="text-gray-600 mb-6 text-center">
                Create a strong password for your account.
              </p>

              <form
                onSubmit={passwordForm.handleSubmit(handleResetPassword)}
                className="space-y-5"
              >
                <Input
                  label="New password"
                  type="password"
                  placeholder="••••••••"
                  leftIcon={<LockClosedIcon className="h-5 w-5" />}
                  hint="Must be at least 8 characters"
                  error={passwordForm.formState.errors.password?.message}
                  {...passwordForm.register('password', {
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
                  error={passwordForm.formState.errors.password_confirm?.message}
                  {...passwordForm.register('password_confirm', {
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === password || 'Passwords do not match',
                  })}
                />

                <Button type="submit" className="w-full" isLoading={isLoading}>
                  Reset password
                </Button>
              </form>
            </motion.div>
          )}

          <p className="mt-6 text-center text-gray-600">
            Remember your password?{' '}
            <Link
              to="/login"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
