'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-gradient-to-r from-purple-50 to-purple-100 border-b-2 border-purple-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">Run for Alzheimer&apos;s</h1>
            <div className="flex gap-4">
              <Button
                onClick={() => router.push('/login')}
                variant="outline"
                className="border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white font-semibold"
              >
                Sign In
              </Button>
              <Button
                onClick={() => router.push('/register')}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold"
              >
                Register Now
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-purple-50 via-white to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 text-pretty">
                Run for a <span className="bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent">Better Future</span>
              </h2>
              <p className="text-xl text-gray-700 mb-4 text-pretty">
                Join thousands of participants in supporting Alzheimer&apos;s awareness and research. Together, we can make a difference in the lives of those affected by this disease.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Register today, get your event QR code, and purchase passes or merchandise to support the cause.
              </p>
              <div className="flex gap-4">
                <Button
                  onClick={() => router.push('/register')}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white text-lg px-8 py-3 font-semibold"
                >
                  Register for Event
                </Button>
                <Button
                  onClick={() => router.push('/login')}
                  variant="outline"
                  className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 text-lg px-8 py-3 font-semibold"
                >
                  Sign In
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-purple-200">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-12 text-center text-white">
                <div className="text-7xl font-bold mb-4">🏃</div>
                <div className="text-5xl font-bold mb-4">5K</div>
                <p className="text-xl font-semibold mb-4">Community Run for Alzheimer&apos;s</p>
                <p className="text-purple-100 mb-6">
                  A day to celebrate community, raise awareness, and support ongoing research to find a cure.
                </p>
                <div className="text-sm text-purple-100">
                  <p>Mark your calendar and join us!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gradient-to-b from-purple-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-4xl font-bold text-gray-900 text-center mb-12">How It Works</h3>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-8 text-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-purple-600 text-2xl font-bold mb-4">
                1
              </div>
              <h4 className="text-xl font-bold mb-4">Register</h4>
              <p className="text-purple-100">
                Create your account with email verification. Secure two-step verification ensures your data is protected.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-8 text-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-purple-600 text-2xl font-bold mb-4">
                2
              </div>
              <h4 className="text-xl font-bold mb-4">Get Your QR Code</h4>
              <p className="text-purple-100">
                Receive your unique event entry QR code. Show this code at the event for quick check-in.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-8 text-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-purple-600 text-2xl font-bold mb-4">
                3
              </div>
              <h4 className="text-xl font-bold mb-4">Shop & Support</h4>
              <p className="text-purple-100">
                Purchase event passes and exclusive merchandise. All proceeds support Alzheimer&apos;s research.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Preview Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-4xl font-bold text-gray-900 text-center mb-12">Event Offerings</h3>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent mb-6">Event Passes</h4>
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border-2 border-purple-200 hover:shadow-lg transition-shadow">
                  <p className="font-semibold text-purple-900">Standard Pass - $35</p>
                  <p className="text-sm text-purple-700">Entry to the 5K run</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border-2 border-purple-200 hover:shadow-lg transition-shadow">
                  <p className="font-semibold text-purple-900">Premium Pass - $65</p>
                  <p className="text-sm text-purple-700">Entry + t-shirt + breakfast</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border-2 border-purple-200 hover:shadow-lg transition-shadow">
                  <p className="font-semibold text-purple-900">VIP Pass - $125</p>
                  <p className="text-sm text-purple-700">
                    Priority entry + reserved parking + massage
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent mb-6">Merchandise</h4>
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border-2 border-purple-200 hover:shadow-lg transition-shadow">
                  <p className="font-semibold text-purple-900">Event T-Shirt - $18</p>
                  <p className="text-sm text-purple-700">
                    Official Run for Alzheimer&apos;s t-shirt
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border-2 border-purple-200 hover:shadow-lg transition-shadow">
                  <p className="font-semibold text-purple-900">Commemorative Cap - $15</p>
                  <p className="text-sm text-purple-700">Adjustable purple cap with logo</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border-2 border-purple-200 hover:shadow-lg transition-shadow">
                  <p className="font-semibold text-purple-900">Wristband - $5</p>
                  <p className="text-sm text-purple-700">
                    Fundraiser wristband in support of research
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-purple-600 to-purple-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-4xl font-bold text-white mb-6">
            Ready to Make a Difference?
          </h3>
          <p className="text-lg text-purple-100 mb-8">
            Join us in the fight against Alzheimer&apos;s. Register today and be part of our community.
          </p>
          <Button
            onClick={() => router.push('/register')}
            className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-3 font-semibold"
          >
            Start Your Registration
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h5 className="font-bold text-white mb-4">About</h5>
              <p className="text-sm text-gray-400">
                Run for Alzheimer&apos;s is dedicated to raising awareness and funds for Alzheimer&apos;s research.
              </p>
            </div>
            <div>
              <h5 className="font-bold text-white mb-4">Quick Links</h5>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/register" className="text-purple-400 hover:text-purple-300">
                    Register
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-purple-400 hover:text-purple-300">
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="text-purple-400 hover:text-purple-300">
                    Admin
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-white mb-4">Contact</h5>
              <p className="text-sm text-gray-400">
                For questions, email us at: support@runforalzheimers.org
              </p>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
            <p>
              &copy; 2026 Run for Alzheimer&apos;s. All proceeds support Alzheimer&apos;s research and awareness.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
