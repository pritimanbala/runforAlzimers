'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [devOtp, setDevOtp] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRegister = async () => {
    if (formData.confirmPassword !== formData.password) {
      setError('Passwords do not match')
      return
    }

    setError('')
    setDevOtp('')
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.message || 'Registration failed')
        return
      }

      localStorage.setItem('pendingVerificationEmail', formData.email)
      if (data.devOtp) {
        setDevOtp(data.devOtp)
      }
      setSuccess(true)
      setTimeout(() => router.push('/verify-otp'), data.devOtp ? 3500 : 1500)
    } catch {
      setError('Unable to connect to the server')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <nav className="bg-white border-b border-purple-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <h1 className="text-2xl font-bold text-purple-600 cursor-pointer">
                Run for Alzheimer&apos;s
              </h1>
            </Link>
          </div>
        </div>
      </nav>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-purple-100">
            <div className="mb-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">R</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-center text-purple-900 mb-2">Join the Run</h1>
              <p className="text-center text-gray-600 text-sm">
                Register for the Alzheimer&apos;s fundraising event
              </p>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">First Name</label>
                  <Input
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(event) =>
                      setFormData({ ...formData, firstName: event.target.value })
                    }
                    className="w-full border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Last Name</label>
                  <Input
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(event) => setFormData({ ...formData, lastName: event.target.value })}
                    className="w-full border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                  className="w-full border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                <Input
                  type="tel"
                  placeholder="(555) 000-0000"
                  value={formData.phone}
                  onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                  className="w-full border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                <Input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                  className="w-full border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(event) =>
                    setFormData({ ...formData, confirmPassword: event.target.value })
                  }
                  className="w-full border-gray-300 focus:border-purple-500 focus:ring-purple-500 text-sm"
                />
              </div>

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800 text-sm font-medium">
                    Registration complete. Redirecting...
                  </p>
                  {devOtp && (
                    <p className="text-green-800 text-sm mt-1">Development OTP: {devOtp}</p>
                  )}
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm font-medium">{error}</p>
                </div>
              )}

              <Button
                onClick={handleRegister}
                disabled={success || isSubmitting}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-2.5 rounded-lg transition-all"
              >
                {success
                  ? 'Redirecting...'
                  : isSubmitting
                    ? 'Creating Account...'
                    : 'Create Account'}
              </Button>
            </div>

            <p className="text-center text-sm text-gray-600 mt-6">
              Already registered?{' '}
              <Link href="/login" className="text-purple-600 hover:text-purple-700 font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
