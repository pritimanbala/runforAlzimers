'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { setAuthToken } from '@/lib/auth'
import Link from 'next/link'

export default function VerifyOtpPage() {
  const router = useRouter()
  const [otp, setOtp] = useState('')
  const [email, setEmail] = useState('')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300)

  useEffect(() => {
    const pendingEmail = localStorage.getItem('pendingVerificationEmail')

    if (!pendingEmail) {
      router.push('/register')
      return
    }

    setEmail(pendingEmail)
  }, [router])

  useEffect(() => {
    if (timeLeft <= 0) return
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
    return () => clearTimeout(timer)
  }, [timeLeft])

  const handleVerifyOtp = async () => {
    if (!email || otp.length !== 6) {
      setError('Enter the 6 digit OTP')
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.message || 'OTP verification failed')
        return
      }

      setAuthToken(data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      localStorage.removeItem('pendingVerificationEmail')
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 1500)
    } catch {
      setError('Unable to connect to the server')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-purple-100">
          <div className="mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl font-bold">@</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center text-purple-900 mb-2">
              Verify Email
            </h1>
            <p className="text-center text-gray-600 text-sm">
              Enter the OTP code we sent to your email
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                One-Time Password
              </label>
              <Input
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                disabled={success}
                className="text-center text-3xl tracking-widest font-mono border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              />
              {email && <p className="text-xs text-gray-500 mt-2 text-center">Verifying {email}</p>}
            </div>

            <div className="text-center bg-purple-50 rounded-lg p-3">
              <p className="text-sm text-gray-700">
                Time remaining:{' '}
                <span className="font-bold text-purple-600">{formatTime(timeLeft)}</span>
              </p>
            </div>

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-green-800 text-sm font-medium">Email verified. Redirecting...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm font-medium">{error}</p>
              </div>
            )}

            <Button
              onClick={handleVerifyOtp}
              disabled={success || isSubmitting || otp.length !== 6}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-2.5 rounded-lg transition-all"
            >
              {success ? 'Verified' : isSubmitting ? 'Verifying...' : 'Verify Email'}
            </Button>

            <Button
              onClick={() => setOtp('')}
              variant="outline"
              disabled={success}
              className="w-full border-purple-200 text-purple-600 hover:bg-purple-50"
            >
              Clear
            </Button>
          </div>

          <p className="text-center text-sm text-gray-600 mt-6">
            <Link href="/register" className="text-purple-600 hover:text-purple-700 font-semibold">
              Back to registration
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

