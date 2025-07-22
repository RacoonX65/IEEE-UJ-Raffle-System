'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface EmailLog {
  messageId: string
  to: string
  subject: string
  status: string
  sentAt: string
  openedAt?: string
  clickedAt?: string
}

export default function EmailLogsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [logs, setLogs] = useState<EmailLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    // Redirect if not authenticated
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }
    
    if (status === 'authenticated') {
      fetchEmailLogs()
    }
  }, [status, router])
  
  const fetchEmailLogs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/email-logs')
      
      if (!response.ok) {
        throw new Error('Failed to fetch email logs')
      }
      
      const data = await response.json()
      setLogs(data.logs || [])
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching email logs')
      console.error('Error fetching email logs:', err)
    } finally {
      setLoading(false)
    }
  }
  
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white p-8 flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Email Delivery Logs</h1>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-white p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/20">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Recent Emails</h2>
            <button 
              onClick={fetchEmailLogs}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Refresh
            </button>
          </div>
          
          {loading ? (
            <div className="text-center py-8">Loading email logs...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-gray-300">
              No email logs found. Try sending a test email first.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="py-3 px-4 text-left">Recipient</th>
                    <th className="py-3 px-4 text-left">Subject</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-left">Sent At</th>
                    <th className="py-3 px-4 text-left">Opened</th>
                    <th className="py-3 px-4 text-left">Clicked</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.messageId} className="border-b border-white/10 hover:bg-white/5">
                      <td className="py-3 px-4">{log.to}</td>
                      <td className="py-3 px-4">{log.subject}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                          log.status === 'delivered' ? 'bg-green-500/20 text-green-300' :
                          log.status === 'opened' ? 'bg-blue-500/20 text-blue-300' :
                          log.status === 'clicked' ? 'bg-purple-500/20 text-purple-300' :
                          'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">{new Date(log.sentAt).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        {log.openedAt ? new Date(log.openedAt).toLocaleString() : '-'}
                      </td>
                      <td className="py-3 px-4">
                        {log.clickedAt ? new Date(log.clickedAt).toLocaleString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="mt-8 bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/20">
          <h2 className="text-xl font-semibold mb-4">About Email Tracking</h2>
          <p className="mb-3">
            Email tracking provides information about the delivery status of emails sent through the Brevo API.
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Delivered</strong>: The email was successfully delivered to the recipient's mail server</li>
            <li><strong>Opened</strong>: The recipient opened the email (requires images to be loaded)</li>
            <li><strong>Clicked</strong>: The recipient clicked on a link in the email</li>
            <li><strong>Bounced/Failed</strong>: The email could not be delivered</li>
          </ul>
          <p className="mt-4 text-sm text-gray-300">
            Note: Email tracking is not 100% accurate. Some email clients block tracking pixels, and users may disable image loading.
          </p>
        </div>
      </div>
    </div>
  )
}
