'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Mail, Send, AlertTriangle, CheckCircle, Users } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { getTicketData } from './actions'
import type { TicketDetails } from '@/lib/email'

interface SendEmailRequest {
  type: 'TICKET_CONFIRMATION' | 'PAYMENT_CONFIRMATION' | 'TEST_EMAIL'
  to: string
  requiresAuth: boolean
  ticketDetails?: TicketDetails
}

// Default test email address (can be changed by user)
const DEFAULT_TEST_EMAIL = 'your-email@example.com'

export default function EmailDashboard() {
  const { data: session, status } = useSession({ required: true })
  const [loading, setLoading] = useState<boolean>(false)
  const [sending, setSending] = useState<boolean>(false)
  const [testEmail, setTestEmail] = useState<string>(DEFAULT_TEST_EMAIL)
  const [tickets, setTickets] = useState<any[]>([])
  const [filter, setFilter] = useState<'ALL' | 'PAID' | 'PENDING'>('ALL')
  const [selectedTickets, setSelectedTickets] = useState<string[]>([])
  const [emailType, setEmailType] = useState<'TICKET_CONFIRMATION' | 'PAYMENT_CONFIRMATION'>('TICKET_CONFIRMATION')

  // Load tickets when component mounts
  useEffect(() => {
    async function fetchTickets() {
      setLoading(true)
      try {
        const result = await getTicketData()
        if (result.success) {
          setTickets(result.data)
        } else {
          toast.error(result.error || 'Failed to load tickets')
        }
      } catch (error) {
        console.error('Failed to fetch tickets:', error)
        toast.error('Failed to load tickets')
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchTickets()
    }
  }, [status])

  // Send a test email
  const handleSendTestEmail = async () => {
    // With Brevo, we can send to any email address for testing
    const emailToUse = testEmail
    
    setSending(true)
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'TEST_EMAIL',
          to: emailToUse,
          requiresAuth: true
        }),
      })

      const result = await response.json()
      if (result.success) {
        toast.success(`Test email sent to ${emailToUse}`)
      } else {
        console.error('Email error:', result)
        toast.error(`Failed to send test email: ${result.message || result.name || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error sending test email:', error)
      toast.error('Error sending test email')
    } finally {
      setSending(false)
    }
  }

  // Send emails to selected tickets
  const handleSendBulkEmails = async () => {
    if (selectedTickets.length === 0) {
      toast.error('Please select at least one ticket recipient')
      return
    }

    setSending(true)
    let successCount = 0
    let errorCount = 0

    try {
      // Create a promise for each email to be sent
      const emailPromises = selectedTickets.map(async (ticketNumber) => {
        const ticket = tickets.find(t => t.ticketNumber === ticketNumber)
        if (!ticket || !ticket.email) {
          errorCount++
          return { success: false, ticketNumber }
        }

        // Convert ticket to the format expected by the email service
        const ticketDetails: TicketDetails = {
          name: ticket.name || 'Ticket Holder',
          email: ticket.email,
          ticketNumber: ticket.ticketNumber,
          paymentMethod: ticket.paymentMethod || 'Not specified',
          paymentStatus: ticket.paymentStatus || 'PENDING'
        }

        // Send the email
        const emailRequest: SendEmailRequest = {
          type: emailType,
          to: ticket.email,
          requiresAuth: true,
          ticketDetails
        }

        const response = await fetch('/api/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(emailRequest),
        })

        const result = await response.json()
        if (result.success) {
          successCount++
          return { success: true, ticketNumber }
        } else {
          errorCount++
          console.error(`Email error for ticket ${ticketNumber}:`, result)
          return { success: false, ticketNumber }
        }
      })

      // Wait for all emails to be sent
      await Promise.all(emailPromises)

      // Show success or error message
      if (successCount > 0 && errorCount === 0) {
        toast.success(`Successfully sent ${successCount} ${emailType === 'TICKET_CONFIRMATION' ? 'ticket confirmation' : 'payment confirmation'} emails`)
      } else if (successCount > 0 && errorCount > 0) {
        toast.error(`Sent ${successCount} emails, but failed to send ${errorCount} emails`)
      } else {
        toast.error(`Failed to send any emails`)
      }
    } catch (error) {
      console.error('Error sending bulk emails:', error)
      toast.error('Error sending bulk emails')
    } finally {
      setSending(false)
    }
  }

  // Toggle selection of all tickets matching the current filter
  const toggleSelectAll = () => {
    if (selectedTickets.length > 0) {
      setSelectedTickets([])
    } else {
      const filteredTickets = tickets
        .filter(ticket => {
          if (filter === 'PAID') return ticket.paymentStatus === 'VERIFIED'
          if (filter === 'PENDING') return ticket.paymentStatus === 'PENDING'
          return true
        })
        .map(ticket => ticket.ticketNumber)
      setSelectedTickets(filteredTickets)
    }
  }

  // Toggle selection of a single ticket
  const toggleTicketSelection = (ticketNumber: string) => {
    if (selectedTickets.includes(ticketNumber)) {
      setSelectedTickets(selectedTickets.filter(t => t !== ticketNumber))
    } else {
      setSelectedTickets([...selectedTickets, ticketNumber])
    }
  }

  // Show loading state when session is loading
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Toaster />
      
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Mail className="h-8 w-8 text-purple-400 mr-2" />
              <h1 className="text-2xl font-bold text-white">Email Management</h1>
            </div>
            <div className="flex items-center">
              <div className="ml-4 flex items-center">
                <div className="relative">
                  <div className="flex items-center space-x-2 p-2 bg-white/10 rounded-lg border border-white/20">
                    <span className="hidden sm:inline text-sm text-white">
                      {session?.user?.email}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Total Tickets</p>
                <p className="text-3xl font-bold text-white">{tickets.length || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Verified Payments</p>
                <p className="text-3xl font-bold text-white">
                  {tickets.filter(t => t.paymentStatus === 'VERIFIED').length || 0}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/60">Pending Payments</p>
                <p className="text-3xl font-bold text-white">
                  {tickets.filter(t => t.paymentStatus === 'PENDING').length || 0}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Test Email Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Send Test Email</h2>
          
          <div className="mb-4">
            <label htmlFor="testEmail" className="block text-white mb-2">Email Address</label>
            <div className="relative">
              <input
                id="testEmail"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter email address"
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/50 w-full"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <div className="group relative">
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  <span className="hidden group-hover:block absolute z-10 p-2 text-xs bg-black/80 text-white rounded w-48 -left-20 top-6">
                    You can send test emails to any address with Brevo
                  </span>
                </div>
              </div>
            </div>
            <p className="text-xs text-blue-300">With Brevo, you can send test emails to any email address.</p>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={handleSendTestEmail}
              disabled={sending}
              className={`py-2 px-6 rounded-lg flex items-center ${sending ? 'bg-white/10 text-white/50 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
            >
              {sending ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" /> Send Test Email
                </>
              )}
            </button>
          </div>
        </div>
        <p className="text-sm text-white/60 mt-2">
          Use this to verify your email configuration works correctly.
        </p>

        {/* Bulk Email Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-4">Bulk Send Emails</h2>
          
          <div className="mb-6">
            <label className="block text-white mb-2">Email Type</label>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setEmailType('TICKET_CONFIRMATION')}
                className={`py-2 px-4 rounded-lg ${
                  emailType === 'TICKET_CONFIRMATION'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                Ticket Confirmation
              </button>
              <button
                onClick={() => setEmailType('PAYMENT_CONFIRMATION')}
                className={`py-2 px-4 rounded-lg ${
                  emailType === 'PAYMENT_CONFIRMATION'
                    ? 'bg-green-600 text-white'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                Payment Confirmation
              </button>
            </div>
            <p className="text-sm text-white/60 mt-2">
              {emailType === 'TICKET_CONFIRMATION' ? 
                'Send emails with ticket details and payment instructions to customers.' :
                'Send emails confirming that payment has been received and verified.'
              }
            </p>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-white">Filter Tickets</label>
              <button 
                onClick={toggleSelectAll}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                {selectedTickets.length > 0 ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            
            <div className="flex flex-wrap gap-3 mb-4">
              <button
                onClick={() => setFilter('ALL')}
                className={`py-2 px-4 rounded-lg ${
                  filter === 'ALL'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                All Tickets
              </button>
              <button
                onClick={() => setFilter('PAID')}
                className={`py-2 px-4 rounded-lg ${
                  filter === 'PAID'
                    ? 'bg-green-600 text-white'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                Verified Payments
              </button>
              <button
                onClick={() => setFilter('PENDING')}
                className={`py-2 px-4 rounded-lg ${
                  filter === 'PENDING'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                Pending Payments
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-white/10 mb-6">
            <table className="w-full text-white/90 text-sm">
              <thead className="bg-black/30 text-xs uppercase">
                <tr>
                  <th className="py-3 px-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedTickets.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded bg-white/10 border-white/30 text-purple-500 focus:ring-0"
                    />
                  </th>
                  <th className="py-3 px-4 text-left">Ticket #</th>
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Email</th>
                  <th className="py-3 px-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-white/50">
                      <div className="flex flex-col items-center">
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mb-2"></div>
                        Loading tickets...
                      </div>
                    </td>
                  </tr>
                ) : tickets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-white/50">
                      No tickets found
                    </td>
                  </tr>
                ) : (
                  tickets
                    .filter(ticket => {
                      if (filter === 'PAID') return ticket.paymentStatus === 'VERIFIED'
                      if (filter === 'PENDING') return ticket.paymentStatus === 'PENDING'
                      return true
                    })
                    .map(ticket => (
                    <tr key={ticket.ticketNumber} className="hover:bg-white/5">
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedTickets.includes(ticket.ticketNumber)}
                          onChange={() => toggleTicketSelection(ticket.ticketNumber)}
                          className="rounded bg-white/10 border-white/30 text-purple-500 focus:ring-0"
                        />
                      </td>
                      <td className="py-3 px-4">{ticket.ticketNumber}</td>
                      <td className="py-3 px-4">{ticket.name}</td>
                      <td className="py-3 px-4">{ticket.email}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          ticket.paymentStatus === 'VERIFIED'
                            ? 'bg-green-500/20 text-green-300'
                            : 'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {ticket.paymentStatus === 'VERIFIED' ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSendBulkEmails}
              disabled={sending || selectedTickets.length === 0}
              className={`py-3 px-8 rounded-lg flex items-center ${
                sending || selectedTickets.length === 0
                  ? 'bg-white/10 text-white/50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
              }`}
            >
              {sending ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" /> 
                  Send {selectedTickets.length > 0 ? `to ${selectedTickets.length} Recipients` : 'Emails'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4">Email Setup Guide</h3>
          <div className="space-y-3 text-white/70 text-sm">
            <div className="bg-blue-500/20 border border-blue-500/50 rounded p-3 mb-4">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                <p>
                  <strong className="text-blue-300">Brevo Advantage:</strong> With Brevo (formerly SendinBlue), you can send emails to any recipient without requiring domain verification. The free tier includes 300 emails per day.
                </p>
              </div>
            </div>
            
            <p>
              This email system uses Brevo as the email service provider. To make it work:
            </p>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>Sign up for a free account at <a href="https://brevo.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">brevo.com</a></li>
              <li>Create an API key in your Brevo dashboard</li>
              <li>Add the API key to your <code className="bg-black/30 px-1 py-0.5 rounded text-pink-300">.env</code> file as <code className="bg-black/30 px-1 py-0.5 rounded text-pink-300">BREVO_API_KEY=your_api_key_here</code></li>
              <li>Set your sender name and email as <code className="bg-black/30 px-1 py-0.5 rounded text-pink-300">EMAIL_FROM_NAME="IEEE UJ Raffle System"</code> and <code className="bg-black/30 px-1 py-0.5 rounded text-pink-300">EMAIL_FROM_ADDRESS="noreply@ieee-uj.org"</code></li>
              <li>Restart your server after adding these environment variables</li>
            </ol>
            <p>
              The free tier includes 300 emails per day, which should be sufficient for your needs. 
              The email system is designed to work with cash payments and EFT transfers,
              providing payment instructions specific to your FNB bank account.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
