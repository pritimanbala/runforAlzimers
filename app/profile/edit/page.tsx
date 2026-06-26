'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function EditProfilePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (!user) {
      router.push('/login')
      return
    }

    const userData = JSON.parse(user)
    setFormData({
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      email: userData.email || '',
      phone: userData.phone || '',
    })
  }, [router])

  const handleSave = async () => {
    if (formData.firstName && formData.lastName && formData.email) {
      setIsSaving(true)

      const updatedUser = {
        ...JSON.parse(localStorage.getItem('user') || '{}'),
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
      }

      try {
        const user = localStorage.getItem('user')
        if (!user) {
          router.push('/login')
          return
        }
        const userData = JSON.parse(user)
        console.log('userdata', userData)
        const response = await fetch('/api/auth/edit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: userData.id,
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            // password: formData.password,
          }),
        })
        const data = await response.json()
        console.log(response, data)

        if (!response.ok || !data.success) {
          setSuccessMessage(data.message || 'Registration failed')
          return
        }

        // localStorage.setItem('pendingVerificationEmail', formData.email)
        // if (data.devOtp) {
        //   setDevOtp(data.devOtp)
        // }
        // setSuccess(true)
        setTimeout(() => router.push('/dashboard'), 3500)
      } catch {
        setSuccessMessage('Unable to connect to the server')
      }

      localStorage.setItem('user', JSON.stringify(updatedUser))

      setSuccessMessage('Profile updated successfully!')
      setTimeout(() => {
        setIsSaving(false)
        router.push('/dashboard')
      }, 1500)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-purple-100 shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-purple-600">Run for Alzheimer&apos;s</h1>
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="border-purple-200 text-purple-600 hover:bg-purple-50"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-purple-100">
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-purple-900 mb-2">Edit Your Profile</h2>
            <p className="text-gray-600">Update your personal information</p>
          </div>

          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                <Input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  disabled={isSaving}
                  className="w-full border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                <Input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  disabled={isSaving}
                  className="w-full border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={isSaving}
                className="w-full border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={isSaving}
                className="w-full border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                placeholder="(555) 000-0000"
              />
            </div>

            {successMessage && (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">✓ {successMessage}</p>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-2.5"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                onClick={() => router.push('/dashboard')}
                variant="outline"
                className="flex-1 border-purple-200 text-purple-600 hover:bg-purple-50"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
