'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { signOut } from 'next-auth/react'
import {
  DownloadIcon,
  RefreshCw,
  Users,
  DollarSign,
  Ticket,
  TrendingUp,
  Calendar,
  User,
  Mail,
  Phone,
  CreditCard,
  QrCode,
  MessageCircle,
  Send,
  CheckCircle,
  X,
  Copy,
  ExternalLink
} from 'lucide-react'

interface TicketEntry {
  timestamp: string
  name: string
  email: string
  whatsapp: string
  paymentMethod: string
  seller: string
  ticketNumber: string
}

interface DashboardData {
  totalTickets: number
  totalAmount: number
  sellerStats: Array<{ seller: string; count: number; amount: number }>
  recentEntries: TicketEntry[]
}

export default function EnhancedDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [whatsappStatus, setWhatsappStatus] = useState<{ configured: boolean; message: string } | null>(null)
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set())
  const [showQRModal, setShowQRModal] = useState(false)
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
  const [qrCodeData, setQRCodeData] = useState<string | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<TicketEntry | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchData()
      checkWhatsAppStatus()
    }
  }, [status, router])

  const fetchData = async () => {
    try {
      const response = await fetch('/api/dashboard')
      if (response.ok) {
        const dashboardData = await response.json()
        setData(dashboardData)
      } else {
        console.error('Failed to fetch dashboard data')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const checkWhatsAppStatus = async () => {
    try {
      const response = await fetch('/api/whatsapp')
      if (response.ok) {
        const status = await response.json()
        setWhatsappStatus(status)
      }
    } catch (error) {
      console.error('Error checking WhatsApp status:', error)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchData()
  }

  const handleExport = async () => {
    try {
      const response = await fetch('/api/export')
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `ieee-uj-raffle-tickets-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error exporting data:', error)
    }
  }

  const generateQRCode = async (ticket: TicketEntry) => {
    try {
      const response = await fetch('/api/qrcode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketNumber: ticket.ticketNumber,
          buyerName: ticket.name,
          buyerEmail: ticket.email,
          sellerName: ticket.seller,
          timestamp: ticket.timestamp,
          eventId: 'IEEE UJ Raffle'
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setQRCodeData(result.qrCode)
        setSelectedTicket(ticket)
        setShowQRModal(true)
      } else {
        console.error('Failed to generate QR code')
      }
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }

  const sendWhatsAppConfirmation = async (ticket: TicketEntry) => {
    try {
      const response = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'send_ticket_confirmation',
          ticketNumber: ticket.ticketNumber,
          buyerName: ticket.name,
          buyerEmail: ticket.email,
          whatsappNumber: ticket.whatsapp,
          sellerName: ticket.seller,
          eventName: 'IEEE UJ Raffle',
          includeQR: true
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          alert('WhatsApp confirmation sent successfully!')
        } else {
          alert('Failed to send WhatsApp confirmation')
        }
      }
    } catch (error) {
      console.error('Error sending WhatsApp confirmation:', error)
      alert('Error sending WhatsApp confirmation')
    }
  }

  const copyVerificationUrl = (ticket: TicketEntry) => {
    const url = `${window.location.origin}/verify/${btoa(JSON.stringify({
      ticketNumber: ticket.ticketNumber,
      buyerName: ticket.name,
      buyerEmail: ticket.email,
      sellerName: ticket.seller,
      timestamp: ticket.timestamp
    }))}`
    
    navigator.clipboard.writeText(url)
    alert('Verification URL copied to clipboard!')
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                <span className="hidden sm:inline">IEEE UJ Raffle System</span>
                <span className="sm:hidden">IEEE UJ Raffle</span>
              </h1>
              <p className="text-purple-200 text-sm">Admin Dashboard</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* WhatsApp Status */}
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                whatsappStatus?.configured 
                  ? 'bg-green-500/20 text-green-300 border border-green-400/30' 
                  : 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30'
              }`}>
                <MessageCircle className="inline h-3 w-3 mr-1" />
                {whatsappStatus?.configured ? 'WhatsApp Ready' : 'WhatsApp Not Configured'}
              </div>

              <div className="flex items-center space-x-2 text-white">
                <User className="h-5 w-5" />
                <span className="hidden sm:inline text-sm truncate max-w-32">
                  {session.user?.email}
                </span>
              </div>
              
              <button
                onClick={() => signOut()}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white text-sm font-medium transition-all duration-200 border border-white/20"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-2xl text-white font-medium transition-all duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <RefreshCw className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>
          
          <button
            onClick={handleExport}
            className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-2xl text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <DownloadIcon className="h-5 w-5 mr-2" />
            Export CSV
          </button>
        </div>

        {/* Stats Cards */}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-200 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm font-medium">Total Tickets</p>
                  <p className="text-3xl font-bold text-white group-hover:scale-105 transition-transform duration-200">
                    {data.totalTickets}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl group-hover:scale-110 transition-transform duration-200">
                  <Ticket className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-200 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm font-medium">Total Amount</p>
                  <p className="text-3xl font-bold text-white group-hover:scale-105 transition-transform duration-200">
                    R{data.totalAmount.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl group-hover:scale-110 transition-transform duration-200">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-200 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm font-medium">Active Sellers</p>
                  <p className="text-3xl font-bold text-white group-hover:scale-105 transition-transform duration-200">
                    {data.sellerStats.length}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl group-hover:scale-110 transition-transform duration-200">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-200 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm font-medium">Avg per Ticket</p>
                  <p className="text-3xl font-bold text-white group-hover:scale-105 transition-transform duration-200">
                    R{data.totalTickets > 0 ? Math.round(data.totalAmount / data.totalTickets) : 0}
                  </p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl group-hover:scale-110 transition-transform duration-200">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Tickets Table */}
        {data && data.recentEntries && (
          <div className="bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/20">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Ticket className="h-5 w-5 mr-2" />
                Recent Ticket Sales
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                      Ticket #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                      Buyer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                      Seller
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-purple-200 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {data.recentEntries.slice(0, 10).map((entry: TicketEntry, index: number) => (
                    <tr key={index} className="hover:bg-white/5 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Ticket className="h-4 w-4 text-purple-400 mr-2" />
                          <span className="text-white font-mono text-sm">
                            {entry.ticketNumber}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-white font-medium">{entry.name}</div>
                          <div className="text-purple-300 text-sm">{entry.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-purple-300 text-sm">
                          <Phone className="h-4 w-4 mr-1" />
                          {entry.whatsapp}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-white">{entry.seller}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => generateQRCode(entry)}
                            className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors duration-200"
                            title="Generate QR Code"
                          >
                            <QrCode className="h-4 w-4" />
                          </button>
                          
                          {whatsappStatus?.configured && (
                            <button
                              onClick={() => sendWhatsAppConfirmation(entry)}
                              className="p-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors duration-200"
                              title="Send WhatsApp Confirmation"
                            >
                              <MessageCircle className="h-4 w-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => copyVerificationUrl(entry)}
                            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors duration-200"
                            title="Copy Verification URL"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQRModal && qrCodeData && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 max-w-md w-full border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">QR Code</h3>
              <button
                onClick={() => setShowQRModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
            
            <div className="text-center space-y-4">
              <div className="bg-white p-4 rounded-2xl inline-block">
                <img src={qrCodeData} alt="QR Code" className="w-48 h-48" />
              </div>
              
              <div className="text-purple-200">
                <p className="font-medium">Ticket: {selectedTicket.ticketNumber}</p>
                <p>Buyer: {selectedTicket.name}</p>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    const link = document.createElement('a')
                    link.download = `ticket-${selectedTicket.ticketNumber}-qr.png`
                    link.href = qrCodeData
                    link.click()
                  }}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-medium transition-colors duration-200"
                >
                  Download QR
                </button>
                <button
                  onClick={() => copyVerificationUrl(selectedTicket)}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium transition-colors duration-200"
                >
                  Copy URL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
