'use client'

import { useState } from 'react'
import { toast } from 'react-hot-toast'

export default function TestEmailPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }
    
    setLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })
      
      const data = await response.json()
      setResult(data)
      
      if (data.success) {
        toast.success('Email sent successfully! Check your inbox.')
      } else {
        toast.error(`Failed to send email: ${data.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Something went wrong. Check console for details.')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white p-8">
      <div className="max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/20">
        <h1 className="text-3xl font-bold mb-6 text-center">Test Brevo Email</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Your Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-2 rounded-lg bg-white/20 border border-white/30 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-xl font-medium transition-colors ${
              loading
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Sending...' : 'Send Test Email'}
          </button>
        </form>
        
        {result && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-2">Result:</h2>
            <div className="bg-black/30 rounded-xl p-4 overflow-auto max-h-[300px]">
              <pre className="text-xs text-purple-200">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}
        
        <div className="mt-8 pt-4 border-t border-white/20">
          <h3 className="text-lg font-medium mb-2">Check List:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>
              Make sure <code className="bg-black/30 px-1 py-0.5 rounded">BREVO_API_KEY</code> is set in <code className="bg-black/30 px-1 py-0.5 rounded">.env.local</code>
            </li>
            <li>
              The Brevo API key should start with <code className="bg-black/30 px-1 py-0.5 rounded">xkeysib-</code>
            </li>
            <li>
              Check spam folder if you don't receive the test email
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
