'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { setAuthToken } from '@/lib/auth'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter your email and password')
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        setError(data.message || 'Login failed')
        return
      }

      setAuthToken(data.token)
      console.log(data.user.id)
      localStorage.setItem('user', JSON.stringify(data.user))
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 500)
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
              <h1 className="text-3xl font-bold text-center text-purple-900 mb-2">Welcome Back</h1>
              <p className="text-center text-gray-600 text-sm">
                Sign in to access your event dashboard
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-green-800 text-sm font-medium">
                    Login successful. Redirecting...
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm font-medium">{error}</p>
                </div>
              )}

              <Button
                onClick={handleLogin}
                disabled={success || isSubmitting}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-2.5 rounded-lg transition-all"
              >
                {success ? 'Redirecting...' : isSubmitting ? 'Signing In...' : 'Sign In'}
              </Button>
            </div>

            <p className="text-center text-sm text-gray-600 mt-6">
              New to Run for Alzheimer&apos;s?{' '}
              <Link
                href="/register"
                className="text-purple-600 hover:text-purple-700 font-semibold"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
