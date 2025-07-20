'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast, { Toaster } from 'react-hot-toast'
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
  Ticket,
  UserCheck
} from 'lucide-react'

interface TicketEntry {
  ticketNumber: string
  name: string
  email: string
  phone?: string
  affiliation?: string
  paymentMethod: 'cash' | 'eft' | 'free' | 'complimentary' | 'other'
  paymentVerified: boolean
  price?: number
  verified?: boolean
  verifiedAt?: string
  verifiedBy?: string
  timestamp?: string
  // Added fields for attendance tracking
  attended?: boolean
  attendedAt?: string
}

interface VerificationStats {
  totalTickets: number
  verifiedTickets: number
  pendingVerification: number
  duplicateAttempts: number
  attendedCount: number
  absentCount: number
}

export default function EventVerificationDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tickets, setTickets] = useState<TicketEntry[]>([])
  const [stats, setStats] = useState<VerificationStats>({
    totalTickets: 0,
    verifiedTickets: 0,
    pendingVerification: 0,
    duplicateAttempts: 0,
    attendedCount: 0,
    absentCount: 0
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
      const response = await fetch('/api/dashboard', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (response.ok) {
        const data = await response.json()
        console.log('Event Verification Debug:')
        console.log('API Response:', data)
        console.log('Entries (recentEntries):', data.recentEntries)
        console.log('Entries length:', data.recentEntries?.length || 0)
        setTickets(data.recentEntries || [])
        
        // Calculate stats including attendance
        const total = data.recentEntries?.length || 0
        const verified = data.recentEntries?.filter((t: TicketEntry) => t.verified)?.length || 0
        const attended = data.recentEntries?.filter((t: TicketEntry) => t.attended)?.length || 0
        const pending = total - verified
        const absent = total - attended
        
        setStats({
          totalTickets: total,
          verifiedTickets: verified,
          pendingVerification: pending,
          duplicateAttempts: 0,
          attendedCount: attended,
          absentCount: absent
        })
      } else {
        console.error('Failed to fetch tickets:', response.status, response.statusText)
        const errorText = await response.text()
        console.error('Error response:', errorText)
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
            
            // After verification is successful, automatically mark attendance
            markAttendance(ticketNumber, method)
          }
          
          toast.success('Ticket verified successfully!')
          return { success: true, message: 'Ticket verified successfully!' }
        } else {
          toast.error(result.message || 'Verification failed')
          return { success: false, message: result.message || 'Verification failed' }
        }
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Verification failed')
        return { success: false, message: errorData.message || 'Verification failed' }
      }
    } catch (error) {
      console.error('Error verifying ticket:', error)
      toast.error('Error connecting to verification service')
      return { success: false, message: 'Error connecting to verification service' }
    }
  }

  const markAttendance = async (ticketNumber: string, method: 'qr' | 'manual') => {
    try {
      const response = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ticketNumber,
          method,
          markedBy: session?.user?.email
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Update local state to show attendance
          setTickets(prev => prev.map(ticket => 
            ticket.ticketNumber === ticketNumber 
              ? { 
                  ...ticket, 
                  attended: true, 
                  attendedAt: new Date().toISOString() 
                }
              : ticket
          ))
          
          // Update attendance stats
          setStats(prev => ({
            ...prev,
            attendedCount: prev.attendedCount + 1,
            absentCount: Math.max(prev.absentCount - 1, 0)
          }))

          toast.success(`${result.ticketDetails?.name || 'Attendee'} marked as ATTENDED!`, {
            position: 'bottom-center'
          })
        }
      } else {
        const errorData = await response.json()
        // If already attended, just show warning toast
        if (errorData.message?.includes('already checked in')) {
          toast.success(`${errorData.ticketDetails?.name || 'Attendee'} already checked in`, {
            position: 'bottom-center'
          })
        } else {
          toast.error(`Error marking attendance: ${errorData.message || 'Unknown error'}`, {
            position: 'bottom-center'
          })
        }
      }
    } catch (error) {
      console.error('Error marking attendance:', error)
      toast.error('Failed to mark attendance')
    }
  }

  const handleManualVerification = async (ticketNumber: string) => {
    const result = await verifyTicket(ticketNumber, 'manual')
    if (result.success) {
      setSearchQuery('')
    }
  }

  const startQRScanner = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(function(stream) {
          if (videoRef.current) {
            videoRef.current.srcObject = stream
            videoRef.current.play()
          }
          setShowScanner(true)
        })
        .catch(function(err) {
          console.error("Error accessing camera: ", err)
          toast.error('Cannot access camera. Please check permissions.')
        })
    }
  }

  const stopQRScanner = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setShowScanner(false)
  }

  const filteredTickets = searchQuery ? tickets.filter(ticket => 
    ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.email.toLowerCase().includes(searchQuery.toLowerCase())
  ) : []

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Toast notification container */}
      <Toaster />

      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-purple-400 mr-2" />
              <h1 className="text-2xl font-bold text-white">Event Verification</h1>
            </div>
            <div className="flex items-center">
              <div className="ml-4 flex items-center">
                <div className="relative">
                  <div className="flex items-center space-x-2 p-2 bg-white/10 rounded-lg border border-white/20">
                    <User className="h-5 w-5" />
                    <span className="hidden sm:inline text-sm">
                      {session.user?.email}
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
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
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
                <p className="text-white/70 text-sm font-medium">Verification %</p>
                <p className="text-3xl font-bold text-white">
                  {stats.totalTickets > 0 ? Math.round((stats.verifiedTickets / stats.totalTickets) * 100) : 0}%
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-400" />
            </div>
          </div>
          
          {/* Attendance Stats */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-medium">Attended</p>
                <p className="text-3xl font-bold text-blue-400">{stats.attendedCount}</p>
              </div>
              <UserCheck className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-medium">Attendance %</p>
                <p className="text-3xl font-bold text-white">
                  {stats.totalTickets > 0 ? Math.round((stats.attendedCount / stats.totalTickets) * 100) : 0}%
                </p>
              </div>
              <Users className="h-8 w-8 text-cyan-400" />
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
            
            <div className="mb-4">
              {!showScanner ? (
                <button
                  onClick={startQRScanner}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Start Scanner
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-lg overflow-hidden aspect-video max-h-60 bg-black">
                    <video ref={videoRef} className="h-full w-full object-cover"></video>
                  </div>
                  <button
                    onClick={stopQRScanner}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200 flex items-center"
                  >
                    <XCircle className="h-5 w-5 mr-2" />
                    Stop Scanner
                  </button>
                  <p className="text-white/70 text-sm mt-2">
                    Position the QR code in front of your camera
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Manual Verification */}
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center">
              <Smartphone className="h-6 w-6 mr-2" />
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
                          <div className="flex items-center mt-1 space-x-3 text-xs">
                            <span className={`${ticket.verified ? 'text-green-400' : 'text-yellow-400'}`}>
                              {ticket.verified ? 'Verified' : 'Not Verified'}
                            </span>
                            <span className={`${ticket.attended ? 'text-blue-400' : 'text-gray-400'}`}>
                              {ticket.attended ? 'Attended' : 'Not Attended'}
                            </span>
                          </div>
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
              <div>
                <p className="text-green-300 text-sm font-medium">Attendance Status</p>
                <p className="text-lg font-bold">
                  {lastVerification.attended ? 'Attended ✓' : 'Not Attended'}
                </p>
              </div>
              {lastVerification.attended && lastVerification.attendedAt && (
                <div>
                  <p className="text-green-300 text-sm font-medium">Check-in Time</p>
                  <p className="text-lg font-bold">{new Date(lastVerification.attendedAt).toLocaleTimeString()}</p>
                </div>
              )}
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
