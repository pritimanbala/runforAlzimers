'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ParticipantQRCode } from '@/components/qr-code'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface UserProfile {
  id: string
  firstName?: string
  lastName?: string
  email: string
  phone?: string
  name?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem('user')
    if (!user) {
      router.push('/login')
      return
    }

    const userData = JSON.parse(user)
    setUserProfile(userData)
    setIsLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!userProfile) {
    return null
  }

  const fullName =
    userProfile.firstName && userProfile.lastName
      ? `${userProfile.firstName} ${userProfile.lastName}`
      : userProfile.name || userProfile.email

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-purple-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-purple-600">Run for Alzheimer&apos;s</h1>
            <div className="flex gap-3">
              <Link href="/profile/edit">
                <Button
                  variant="outline"
                  className="border-purple-200 text-purple-600 hover:bg-purple-50"
                >
                  Edit Profile
                </Button>
              </Link>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="border-purple-200 text-purple-600 hover:bg-purple-50"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-purple-900 mb-2">Welcome, {fullName}!</h2>
          <p className="text-gray-600">
            Your event registration is complete. You're all set to participate in the run.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* QR Code Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-purple-100">
            <h3 className="text-2xl font-bold text-purple-900 mb-4">Your Event QR Code</h3>
            <p className="text-gray-600 mb-6">Show this code at event check-in</p>

            <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl p-8 flex justify-center mb-6 border border-purple-100">
              <ParticipantQRCode
                value={`participant-${userProfile.id}`}
                size={200}
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="bg-purple-100 border border-purple-300 rounded-lg p-4 mb-6">
              <p className="text-xs text-purple-700 font-semibold uppercase mb-2">Participant ID</p>
              <p className="text-sm text-purple-900 font-mono text-center break-all font-bold">
                {userProfile.id}
              </p>
            </div>

            {/* <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-2.5">
              📥 Download QR Code
            </Button> */}
          </div>

          {/* Profile Summary */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-purple-100">
            <h3 className="text-2xl font-bold text-purple-900 mb-6">Registration Details</h3>

            <div className="space-y-4">
              <div className="border-l-4 border-purple-500 pl-4">
                <p className="text-sm text-gray-500 uppercase tracking-wide">Full Name</p>
                <p className="text-lg font-semibold text-gray-900">{fullName}</p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4">
                <p className="text-sm text-gray-500 uppercase tracking-wide">Email</p>
                <p className="text-lg font-semibold text-gray-900">{userProfile.email}</p>
              </div>

              {userProfile.phone && (
                <div className="border-l-4 border-purple-500 pl-4">
                  <p className="text-sm text-gray-500 uppercase tracking-wide">Phone</p>
                  <p className="text-lg font-semibold text-gray-900">{userProfile.phone}</p>
                </div>
              )}

              <div className="border-l-4 border-green-500 pl-4 mt-6">
                <p className="text-sm text-gray-500 uppercase tracking-wide">Status</p>
                <p className="text-lg font-semibold text-green-600">✓ Verified & Active</p>
              </div>
            </div>

            <Link href="/profile/edit" className="block mt-8">
              <Button
                variant="outline"
                className="w-full border-purple-200 text-purple-600 hover:bg-purple-50"
              >
                Update Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/shop">
            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl shadow-lg p-8 text-white hover:shadow-xl transition-shadow cursor-pointer">
              <h3 className="text-2xl font-bold mb-2">🛍️ Event Shop</h3>
              <p className="text-purple-100">Purchase passes and merchandise</p>
            </div>
          </Link>

          <Link href="/purchases">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-8 text-white hover:shadow-xl transition-shadow cursor-pointer">
              <h3 className="text-2xl font-bold mb-2">📋 My Purchases</h3>
              <p className="text-purple-100">View your orders and receipts</p>
            </div>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-purple-100 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 text-sm">
            <p>Questions? Contact support@runforalzheimers.org</p>
            <p className="mt-2">All proceeds support Alzheimer&apos;s research</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
