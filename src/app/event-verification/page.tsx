'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  QrCode, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Users, 
  Clock, 
  Search,
  Camera,
  Smartphone,
  Shield,
  RefreshCw,
  Download,
  User,
  Mail,
  Ticket
} from 'lucide-react'

interface TicketEntry {
  ticketNumber: string
  name: string
  email: string
  whatsapp: string
  paymentMethod: string
  paymentStatus: string
  seller: string
  timestamp: string
  verified?: boolean
  verifiedAt?: string
  verifiedBy?: string
}

interface VerificationStats {
  totalTickets: number
  verifiedTickets: number
  pendingVerification: number
  duplicateAttempts: number
}

export default function EventVerificationDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tickets, setTickets] = useState<TicketEntry[]>([])
  const [stats, setStats] = useState<VerificationStats>({
    totalTickets: 0,
    verifiedTickets: 0,
    pendingVerification: 0,
    duplicateAttempts: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [verificationMode, setVerificationMode] = useState<'qr' | 'manual'>('qr')
  const [lastVerification, setLastVerification] = useState<TicketEntry | null>(null)
  const [showScanner, setShowScanner] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchTickets()
      // Auto-refresh every 30 seconds for real-time updates
      const interval = setInterval(fetchTickets, 30000)
      return () => clearInterval(interval)
    }
  }, [status, router])

  const fetchTickets = async () => {
    try {
      const response = await fetch('/api/sheets')
      if (response.ok) {
        const data = await response.json()
        setTickets(data.entries || [])
        
        // Calculate stats
        const total = data.entries?.length || 0
        const verified = data.entries?.filter((t: TicketEntry) => t.verified)?.length || 0
        const pending = total - verified
        
        setStats({
          totalTickets: total,
          verifiedTickets: verified,
          pendingVerification: pending,
          duplicateAttempts: 0 // TODO: Track this
        })
      }
    } catch (error) {
      console.error('Error fetching tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const verifyTicket = async (ticketNumber: string, method: 'qr' | 'manual') => {
    try {
      const response = await fetch('/api/verify-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketNumber,
          method,
          verifiedBy: session?.user?.email,
          verifiedAt: new Date().toISOString()
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Update local state
          setTickets(prev => prev.map(ticket => 
            ticket.ticketNumber === ticketNumber 
              ? { ...ticket, verified: true, verifiedAt: new Date().toISOString(), verifiedBy: session?.user?.email || undefined }
              : ticket
          ))
          
          // Update stats
          setStats(prev => ({
            ...prev,
            verifiedTickets: prev.verifiedTickets + 1,
            pendingVerification: prev.pendingVerification - 1
          }))

          // Set last verification for display
          const verifiedTicket = tickets.find(t => t.ticketNumber === ticketNumber)
          if (verifiedTicket) {
            setLastVerification({
              ...verifiedTicket,
              verified: true,
              verifiedAt: new Date().toISOString(),
              verifiedBy: session?.user?.email || undefined
            })
          }

          return { success: true, message: 'Ticket verified successfully!' }
        } else {
          return { success: false, message: result.message || 'Verification failed' }
        }
      }
    } catch (error) {
      console.error('Error verifying ticket:', error)
      return { success: false, message: 'Network error during verification' }
    }
  }

  const handleManualVerification = async (ticketNumber: string) => {
    const result = await verifyTicket(ticketNumber, 'manual')
    if (result?.success) {
      alert('✅ Ticket verified successfully!')
      setSearchQuery('')
    } else {
      alert(`❌ ${result?.message}`)
    }
  }

  const startQRScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setShowScanner(true)
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      alert('Camera access denied. Please use manual verification.')
    }
  }

  const stopQRScanner = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
    }
    setShowScanner(false)
  }

  const filteredTickets = tickets.filter(ticket =>
    ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Shield className="h-8 w-8 text-white" />
              <h1 className="text-xl font-bold text-white">Event Day Verification</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-400/30">
                <Clock className="inline h-3 w-3 mr-1" />
                Live Mode
              </div>
              
              <div className="flex items-center space-x-2 text-white">
                <User className="h-5 w-5" />
                <span className="hidden sm:inline text-sm">
                  {session.user?.email}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-medium">Total Tickets</p>
                <p className="text-3xl font-bold text-white">{stats.totalTickets}</p>
              </div>
              <Ticket className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-medium">Verified</p>
                <p className="text-3xl font-bold text-green-400">{stats.verifiedTickets}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-yellow-400">{stats.pendingVerification}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-medium">Progress</p>
                <p className="text-3xl font-bold text-white">
                  {stats.totalTickets > 0 ? Math.round((stats.verifiedTickets / stats.totalTickets) * 100) : 0}%
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-400" />
            </div>
          </div>
        </div>

        {/* Verification Methods */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* QR Scanner */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <QrCode className="h-6 w-6 mr-2" />
              QR Code Scanner
            </h3>
            
            {!showScanner ? (
              <div className="text-center">
                <button
                  onClick={startQRScanner}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center mx-auto"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Start QR Scanner
                </button>
                <p className="text-white/70 text-sm mt-2">
                  Use camera to scan QR codes on tickets
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 bg-black rounded-xl"
                />
                <button
                  onClick={stopQRScanner}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 w-full"
                >
                  Stop Scanner
                </button>
              </div>
            )}
          </div>

          {/* Manual Verification */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Search className="h-6 w-6 mr-2" />
              Manual Verification
            </h3>
            
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter ticket number or search name/email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <Search className="absolute right-3 top-3 h-5 w-5 text-white/50" />
              </div>
              
              {searchQuery && (
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {filteredTickets.slice(0, 5).map((ticket) => (
                    <div
                      key={ticket.ticketNumber}
                      className={`p-3 rounded-lg border ${
                        ticket.verified
                          ? 'bg-green-500/20 border-green-400/30'
                          : 'bg-white/10 border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white font-medium">#{ticket.ticketNumber}</p>
                          <p className="text-white/70 text-sm">{ticket.name}</p>
                        </div>
                        {!ticket.verified ? (
                          <button
                            onClick={() => handleManualVerification(ticket.ticketNumber)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200"
                          >
                            Verify
                          </button>
                        ) : (
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Last Verification */}
        {lastVerification && (
          <div className="bg-green-500/20 backdrop-blur-md rounded-3xl p-6 border border-green-400/30 mb-8">
            <h3 className="text-xl font-bold text-green-300 mb-4 flex items-center">
              <CheckCircle className="h-6 w-6 mr-2" />
              Last Verification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
              <div>
                <p className="text-green-300 text-sm font-medium">Ticket</p>
                <p className="text-lg font-bold">#{lastVerification.ticketNumber}</p>
              </div>
              <div>
                <p className="text-green-300 text-sm font-medium">Attendee</p>
                <p className="text-lg font-bold">{lastVerification.name}</p>
              </div>
              <div>
                <p className="text-green-300 text-sm font-medium">Verified At</p>
                <p className="text-lg font-bold">
                  {lastVerification.verifiedAt ? new Date(lastVerification.verifiedAt).toLocaleTimeString() : 'Now'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={fetchTickets}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Refresh Data
          </button>
          
          <button
            onClick={() => window.open('/dashboard', '_blank')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center"
          >
            <Smartphone className="h-5 w-5 mr-2" />
            Open Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
